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

warnings.filterwarnings("ignore")

print("=" * 60)
print("  SignLink AI Engine v3  —  WebSocket Server")
print("  Powered by Google MediaPipe Gesture Recognizer")
print("=" * 60)

# ── Load Google Gesture Recognizer ──────────────────────────────────────
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

TASK_FILE = os.path.join(os.path.dirname(__file__), "gesture_recognizer.task")
assert os.path.exists(TASK_FILE), f"gesture_recognizer.task not found at {TASK_FILE}"

gesture_options = mp_vision.GestureRecognizerOptions(
    base_options=mp_python.BaseOptions(model_asset_path=TASK_FILE),
    num_hands=1,
    min_hand_detection_confidence=0.6,
    min_hand_presence_confidence=0.6,
    min_tracking_confidence=0.5,
)
gesture_recognizer = mp_vision.GestureRecognizer.create_from_options(gesture_options)
print("✅ Google Gesture Recognizer loaded!")

# ── Load ASL ViT for A-Z alphabet ────────────────────────────────────────
print("Loading ASL ViT model for alphabet fallback...")
from transformers import pipeline
vit_pipe = pipeline("image-classification", model="akahana/asl-vit", device="cpu")
print("✅ ASL ViT loaded!")

print("\nServer starting on ws://localhost:8000")
print("=" * 60)

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

# ── MediaPipe draw utilities for hand landmarks (for the fallback crop) ──
mp_hands_sol = mp.solutions.hands
hands_for_crop = mp_hands_sol.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.6,
)

# ── Shared inference state ────────────────────────────────────────────────
latest_label      = "—"
latest_confidence = 0.0
latest_is_word    = False
latest_frame_data = None
processing        = False

# Sentence building config
CONFIRM_COUNT        = 10    # same prediction N times in a row
COOLDOWN             = 2.5   # seconds between appends
CONFIDENCE_THRESHOLD = 60.0  # minimum % to accept (gesture recognizer is high accuracy)

sentence_buffer = ""
recent_preds    = deque(maxlen=15)
last_append_time = time.time()


def get_hand_crop_for_vit(img_rgb: np.ndarray, padding: int = 50):
    """Use MediaPipe Hands to crop tightly around the hand for ViT alphabet input."""
    results = hands_for_crop.process(img_rgb)
    if results.multi_hand_landmarks:
        h, w = img_rgb.shape[:2]
        lm = results.multi_hand_landmarks[0]
        xs = [p.x * w for p in lm.landmark]
        ys = [p.y * h for p in lm.landmark]
        x1 = max(0, int(min(xs)) - padding)
        y1 = max(0, int(min(ys)) - padding)
        x2 = min(w, int(max(xs)) + padding)
        y2 = min(h, int(max(ys)) + padding)
        side = max(x2 - x1, y2 - y1)
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
        x1 = max(0, cx - side // 2)
        y1 = max(0, cy - side // 2)
        x2 = min(w, cx + side // 2)
        y2 = min(h, cy + side // 2)
        return img_rgb[y1:y2, x1:x2], True
    return img_rgb, False


def predict_worker():
    global latest_label, latest_confidence, latest_is_word
    global latest_frame_data, processing

    while True:
        if latest_frame_data and not processing:
            processing = True
            try:
                # Decode frame
                img_bytes = base64.b64decode(latest_frame_data)
                img_pil   = Image.open(BytesIO(img_bytes)).convert("RGB")
                img_rgb   = np.array(img_pil)

                # ── Step 1: Google Gesture Recognizer ─────────────────
                mp_image = mp.Image(
                    image_format=mp.ImageFormat.SRGB,
                    data=img_rgb,
                )
                result = gesture_recognizer.recognize(mp_image)

                gesture_label = None
                gesture_conf  = 0.0
                if result.gestures and len(result.gestures) > 0:
                    top = result.gestures[0][0]
                    raw_name = top.category_name
                    gesture_conf = round(top.score * 100, 1)
                    mapped = GESTURE_MAP.get(raw_name)
                    if mapped:   # not None (i.e. not "None" gesture)
                        gesture_label = mapped[0]

                # ── Step 2: ViT for alphabet (on hand crop) ───────────
                hand_crop, hand_found = get_hand_crop_for_vit(img_rgb)
                letter_label = None
                letter_conf  = 0.0
                if hand_found:
                    crop_pil = Image.fromarray(hand_crop)
                    vit_res  = vit_pipe(crop_pil)
                    letter_label = vit_res[0]["label"]
                    letter_conf  = round(vit_res[0]["score"] * 100, 1)

                # ── Step 3: Decide which prediction wins ──────────────
                # Gesture Recognizer wins if it detects a known gesture
                # AND confidence >= letter confidence (or no letter found)
                if gesture_label and gesture_conf >= letter_conf:
                    latest_label      = gesture_label
                    latest_confidence = gesture_conf
                    latest_is_word    = True
                elif letter_label and hand_found:
                    latest_label      = letter_label
                    latest_confidence = letter_conf
                    latest_is_word    = False
                else:
                    latest_label      = "—"
                    latest_confidence = 0.0
                    latest_is_word    = False

            except Exception as e:
                print(f"[predict_worker] {e}")
            finally:
                processing = False

        time.sleep(0.08)   # ~12 inferences/sec


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
    global latest_frame_data, sentence_buffer, recent_preds, last_append_time

    print(f"[+] Client connected: {websocket.remote_address}")
    sentence_buffer  = ""
    recent_preds     = deque(maxlen=15)
    last_append_time = time.time()

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
                    continue  # don't treat as frame
                except Exception:
                    pass

            # Frame data (base64)
            latest_frame_data = message.split(",", 1)[1] if "," in message else message

            label   = latest_label
            conf    = latest_confidence
            is_word = latest_is_word

            recent_preds.append(label)
            now = time.time()

            word_added = False
            if (recent_preds.count(label) >= CONFIRM_COUNT
                    and (now - last_append_time) > COOLDOWN
                    and label not in ["—", "none", "nothing"]
                    and conf >= CONFIDENCE_THRESHOLD):

                if is_word:
                    sentence_buffer += label + "  "
                else:
                    sentence_buffer += label.upper()

                last_append_time = now
                word_added = True

            payload = {
                "type":       "prediction",
                "text":       label,
                "confidence": conf,
                "sentence":   sentence_buffer,
                "sentiment":  get_emotion(conf),
                "word_added": word_added,
                "is_word":    is_word,
            }
            await websocket.send(json.dumps(payload))

    except websockets.exceptions.ConnectionClosed:
        print(f"[-] Client disconnected: {websocket.remote_address}")
    except Exception as e:
        print(f"[!] Error with {websocket.remote_address}: {e}")


async def main():
    async with websockets.serve(handle_client, "0.0.0.0", 8000):
        print("WebSocket server ready at ws://0.0.0.0:8000")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
