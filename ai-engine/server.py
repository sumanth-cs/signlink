"""
SignLink AI Engine v3 — WebSocket Server
Uses Google's official MediaPipe Gesture Recognizer (.task model)
for ~95% accurate detection of 8 hand gestures PLUS the ViT model
for A-Z alphabet recognition as a fallback.

Gesture Recognizer labels:
  None, Closed_Fist, Open_Palm, Pointing_Up,
  Thumb_Down, Thumb_Up, Victory, ILoveYou
"""

import asyncio
import websockets
import json
import base64
import time
import threading
import warnings
import numpy as np
from io import BytesIO
from PIL import Image
from collections import deque
import os
import heuristic_asl
import alphabet_cnn

warnings.filterwarnings("ignore")

import sys

print("=" * 60, flush=True)
print("  SignLink AI Engine v3  —  WebSocket Server", flush=True)
print("  Powered by Google MediaPipe Gesture Recognizer", flush=True)
print("=" * 60, flush=True)

# ── Load Google Gesture Recognizer ──────────────────────────────────────
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

TASK_FILE = os.path.join(os.path.dirname(__file__), "gesture_recognizer.task")
assert os.path.exists(TASK_FILE), f"gesture_recognizer.task not found at {TASK_FILE}"

print("Initializing GestureRecognizerOptions...", flush=True)
gesture_options = mp_vision.GestureRecognizerOptions(
    base_options=mp_python.BaseOptions(model_asset_path=TASK_FILE),
    num_hands=1,
    min_hand_detection_confidence=0.6,
    min_hand_presence_confidence=0.6,
    min_tracking_confidence=0.5,
)
print("Calling create_from_options...", flush=True)
gesture_recognizer = mp_vision.GestureRecognizer.create_from_options(gesture_options)
print("✅ Google Gesture Recognizer loaded!", flush=True)

print("\nServer starting...", flush=True)
print("=" * 60, flush=True)

# ── Gesture label → friendly display name ────────────────────────────────
GESTURE_MAP = {
    "ILoveYou":    ("I Love You 🤟", 0.95),
    "Open_Palm":   ("Hello / Open Palm 👋", 0.92),
    "Thumb_Up":    ("Yes / Good 👍", 0.93),
    "Thumb_Down":  ("No / Bad 👎", 0.91),
    "Victory":     ("Peace ✌️", 0.90),
    "Pointing_Up": ("Pointing Up ☝️", 0.88),
    "Closed_Fist": ("Stop / Fist ✊", 0.89),
    "None":        None,   # no gesture detected
}

# ── Shared inference state ────────────────────────────────────────────────
latest_label      = "—"
latest_confidence = 0.0
latest_is_word    = False
latest_frame_data = None
latest_pred_id    = 0  # To track fresh predictions
processing        = False
global_mode       = "all"

# Sentence building config
# Sentence building config
CONFIRM_COUNT        = 5     # Lowered for faster alphabet spelling
COOLDOWN_LETTER      = 0.5   # Faster for alphabets
COOLDOWN_WORD        = 1.5   # Standard for words
CONFIDENCE_THRESHOLD = 40.0  # Lowered for alphabets

# Simple common phrases for suggestions
SUGGESTIONS_MAP = {
    "h": ["hello", "how are you", "help"],
    "ho": ["how are you", "how much", "hospital"],
    "how": ["how are you", "how much"],
    "w": ["water", "where is", "want"],
    "wh": ["where is", "what time"],
    "t": ["thank you", "thanks", "time"],
    "th": ["thank you", "thanks"],
    "i": ["i am", "i want", "i love you"],
    "p": ["please", "police", "pain"],
}

def get_suggestions(text):
    text = text.lower().strip()
    if not text: return []
    last_word = text.split()[-1] if text else ""
    return SUGGESTIONS_MAP.get(last_word, [])[:3]

sentence_buffer = ""
recent_preds    = deque(maxlen=15)
last_append_time = time.time()

def predict_worker():
    global latest_label, latest_confidence, latest_is_word
    global latest_frame_data, processing, global_mode, latest_pred_id

    while True:
        if latest_frame_data and not processing:
            processing = True
            try:
                # Decode frame
                img_bytes = base64.b64decode(latest_frame_data)
                img_pil   = Image.open(BytesIO(img_bytes)).convert("RGB")
                img_rgb   = np.array(img_pil)

                # ── Google Gesture Recognizer ─────────────────
                mp_image = mp.Image(
                    image_format=mp.ImageFormat.SRGB,
                    data=img_rgb,
                )
                result = gesture_recognizer.recognize(mp_image)

                # ── Recognition Logic ─────────────────
                gesture_label = None
                gesture_conf  = 0.0

                if global_mode == "alphabet":
                    # Direct 26-class CNN — no heuristics needed
                    if result.hand_landmarks and len(result.hand_landmarks) > 0:
                        h, w, _ = img_rgb.shape
                        gesture_label, gesture_conf = alphabet_cnn.detect_alphabet(result.hand_landmarks[0], (w, h))
                elif global_mode == "words":
                    # 1. Check official gesture recognizer for words
                    if result.gestures and len(result.gestures) > 0:
                        top = result.gestures[0][0]
                        raw_name = top.category_name
                        gesture_conf = round(top.score * 100, 1)
                        mapped = GESTURE_MAP.get(raw_name)
                        if mapped:
                            gesture_label = mapped[0]

                    # 2. Fallback to Heuristics (ONLY words)
                    if gesture_label is None and result.hand_landmarks and len(result.hand_landmarks) > 0:
                        h_label, h_conf = heuristic_asl.detect_alphabet_and_signs(result.hand_landmarks[0], mode="words")
                        if h_label and len(h_label) > 1:
                            gesture_label = h_label
                            gesture_conf = h_conf
                else: # "all" mode
                    # Check official gesture recognizer first
                    if result.gestures and len(result.gestures) > 0:
                        top = result.gestures[0][0]
                        raw_name = top.category_name
                        gesture_conf = round(top.score * 100, 1)
                        mapped = GESTURE_MAP.get(raw_name)
                        if mapped:
                            gesture_label = mapped[0]

                    # Fallback to Heuristics (both)
                    if gesture_label is None and result.hand_landmarks and len(result.hand_landmarks) > 0:
                        h_label, h_conf = heuristic_asl.detect_alphabet_and_signs(result.hand_landmarks[0], mode="all")
                        if h_label:
                            gesture_label = h_label
                            gesture_conf = h_conf

                if gesture_label:
                    latest_label      = gesture_label
                    latest_confidence = gesture_conf
                    latest_is_word    = len(gesture_label) > 1
                else:
                    latest_label      = "—"
                    latest_confidence = 0.0
                    latest_is_word    = False
                
                latest_pred_id += 1 # Signal new prediction

            except Exception as e:
                print(f"[predict_worker] {e}")
            finally:
                processing = False

        time.sleep(0.005)   # Ultra-low latency, up to 200 inferences/sec

threading.Thread(target=predict_worker, daemon=True).start()


def get_emotion(confidence: float) -> dict:
    if confidence < 40:
        return {"emotion": "uncertain", "intensity": 0.3}
    elif confidence > 80:
        return {"emotion": "happy",     "intensity": 0.9}
    elif confidence > 60:
        return {"emotion": "neutral",   "intensity": 0.6}
    return {"emotion": "focused",       "intensity": 0.5}


async def handle_client(websocket):
    global latest_frame_data, sentence_buffer, recent_preds, last_append_time, global_mode, latest_label, latest_confidence, latest_is_word

    print(f"[+] Client connected: {websocket.remote_address}")
    sentence_buffer  = ""
    recent_preds     = deque(maxlen=15)
    last_append_time = time.time()

    last_sent_pred_id = -1
    
    try:
        async for message in websocket:
            # Handle control commands from frontend
            if message.startswith("{"):
                try:
                    cmd = json.loads(message)
                    if cmd.get("type") == "command":
                        if cmd.get("action") == "backspace":
                            sentence_buffer = sentence_buffer[:-1]
                        elif cmd.get("action") == "clear":
                            sentence_buffer = ""
                        elif cmd.get("action") == "set_mode":
                            new_mode = cmd.get("mode", "all")
                            if new_mode != global_mode:
                                global_mode = new_mode
                                recent_preds.clear()
                                latest_label = "—"
                                latest_confidence = 0.0
                                last_sent_pred_id = latest_pred_id # Ignore past predictions
                        elif cmd.get("action") == "add_word":
                            word = cmd.get("word", "").upper()
                            # Replace the last unfinished word or just add
                            parts = sentence_buffer.split()
                            if parts:
                                sentence_buffer = " ".join(parts[:-1]) + " " + word + " "
                            else:
                                sentence_buffer += word + " "
                            sentence_buffer = sentence_buffer.lstrip()
                    continue  # don't treat as frame
                except Exception:
                    pass

            # Frame data (base64)
            latest_frame_data = message.split(",", 1)[1] if "," in message else message

            # ONLY process if there is a NEW prediction from the worker
            if latest_pred_id == last_sent_pred_id:
                # No new prediction yet, just update the client with status
                # but don't add to recent_preds or sentence
                pass
            else:
                last_sent_pred_id = latest_pred_id
                
                label   = latest_label
                conf    = latest_confidence
                is_word = latest_is_word
                
                recent_preds.append(label)
                
                now = time.time()
                word_added = False
                
                # Dynamic threshold & cooldown
                req_conf = CONFIDENCE_THRESHOLD if not is_word else 70.0
                req_count = CONFIRM_COUNT if not is_word else 10 # Words need more stability
                cd = COOLDOWN_LETTER if not is_word else COOLDOWN_WORD

                if (recent_preds.count(label) >= req_count
                        and (now - last_append_time) > cd
                        and label not in ["—", "none", "nothing"]
                        and conf >= req_conf):

                    if is_word:
                        sentence_buffer += label + " "
                    else:
                        sentence_buffer += label.upper()
                    
                    last_append_time = now
                    word_added = True
                    recent_preds.clear() # Clear after successful detection

            payload = {
                "type":       "prediction",
                "text":       latest_label,
                "confidence": latest_confidence,
                "sentence":   sentence_buffer,
                "suggestions": get_suggestions(sentence_buffer),
                "sentiment":  get_emotion(latest_confidence),
                "word_added": word_added,
                "is_word":    latest_is_word,
            }
            await websocket.send(json.dumps(payload))

    except websockets.exceptions.ConnectionClosed:
        print(f"[-] Client disconnected: {websocket.remote_address}")
    except Exception as e:
        print(f"[!] Error with {websocket.remote_address}: {e}")


async def main():
    port = int(os.environ.get("PORT", 8000))
    async with websockets.serve(handle_client, "0.0.0.0", port):
        print(f"WebSocket server ready at ws://0.0.0.0:{port}")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
