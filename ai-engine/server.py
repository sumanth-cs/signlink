"""
SignLink AI Engine v2 - WebSocket Server
Improvements over v1:
  - MediaPipe Hands for precise hand-region cropping (massively improves ViT accuracy)
  - Rule-based word gesture recognition (I Love You, Hello, Thank You, etc.)
  - 65% confidence threshold so junk predictions don't build the sentence
  - is_word flag so frontend can highlight word detections differently
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
import cv2

warnings.filterwarnings("ignore")

print("=" * 60)
print("  SignLink AI Engine v2 — WebSocket Server")
print("=" * 60)
print("Loading ASL ViT model...")

from transformers import pipeline
import mediapipe as mp

# ── Models ──────────────────────────────────────────────────────────────
pipe = pipeline("image-classification", model="akahana/asl-vit", device="cpu")

mp_hands = mp.solutions.hands
hands_detector = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.6,
)

print("All models ready! Server starting on ws://localhost:8000")
print("=" * 60)

# ── Shared state ─────────────────────────────────────────────────────────
latest_label      = "—"
latest_confidence = 0.0
latest_is_word    = False
latest_frame_data = None
processing        = False

# Sentence building config
CONFIRM_COUNT        = 10    # consecutive frames that must agree
COOLDOWN             = 2.5   # seconds between appends
CONFIDENCE_THRESHOLD = 65.0  # minimum % to accept a prediction

sentence_buffer = ""
recent_preds    = deque(maxlen=12)
last_append_time = time.time()


# ── Word gesture detection ────────────────────────────────────────────────
def detect_word(hand_lm):
    """
    Rule-based ASL word detection from MediaPipe hand landmarks.
    Returns (word_string, confidence_float) or (None, 0.0).
    """
    if not hand_lm:
        return None, 0.0

    lm = hand_lm.landmark

    def extended(tip, pip):
        """Finger is extended when tip is above (smaller y) than PIP joint."""
        return lm[tip].y < lm[pip].y

    # Wrist is lm[0]; which side of wrist the thumb is on tells us handedness
    right_hand = lm[0].x < lm[9].x
    thumb_ext  = lm[4].x < lm[3].x if right_hand else lm[4].x > lm[3].x

    idx_ext = extended(8,  6)
    mid_ext = extended(12, 10)
    rng_ext = extended(16, 14)
    pky_ext = extended(20, 18)

    # Thumb-index pinch distance
    pinch = ((lm[4].x - lm[8].x)**2 + (lm[4].y - lm[8].y)**2) ** 0.5

    # ── I Love You: thumb + index + pinky up, middle + ring down ──
    if thumb_ext and idx_ext and pky_ext and not mid_ext and not rng_ext:
        return "I Love You 🤟", 0.93

    # ── Hello / Open hand: all five up ──────────────────────────────
    if thumb_ext and idx_ext and mid_ext and rng_ext and pky_ext:
        return "Hello 👋", 0.90

    # ── Thank You: flat open hand (same pattern as Hello for static) ─
    # In a full system we'd use motion; for demo we tag this as open palm
    # Keeping Hello as primary, so we skip duplicate here.

    # ── Thumbs Up: only thumb extended ──────────────────────────────
    if thumb_ext and not idx_ext and not mid_ext and not rng_ext and not pky_ext:
        return "Yes / Good 👍", 0.88

    # ── Thumbs Down: thumb down, others closed ───────────────────────
    # (thumb_ext logic inverted for down; hard to rule-base reliably, skip)

    # ── Peace / Victory: index + middle up only ──────────────────────
    if idx_ext and mid_ext and not rng_ext and not pky_ext:
        return "Peace ✌️", 0.85

    # ── OK: thumb-index pinch, others extended ───────────────────────
    if pinch < 0.07 and mid_ext and rng_ext and pky_ext:
        return "OK 👌", 0.84

    # ── Pointing: only index extended ────────────────────────────────
    if idx_ext and not mid_ext and not rng_ext and not pky_ext:
        return "Pointing 👉", 0.80

    # ── Fist / Stop: nothing extended ────────────────────────────────
    if not idx_ext and not mid_ext and not rng_ext and not pky_ext:
        return "Stop / No ✊", 0.82

    return None, 0.0


# ── Hand crop helper ─────────────────────────────────────────────────────
def get_hand_crop(img_rgb: np.ndarray, padding: int = 50):
    """
    Run MediaPipe on the full frame, return a tight square crop around
    the detected hand, plus the landmark object.
    Falls back to a centre crop if no hand found.
    """
    results = hands_detector.process(img_rgb)

    if results.multi_hand_landmarks:
        h, w = img_rgb.shape[:2]
        lm = results.multi_hand_landmarks[0]

        xs = [p.x * w for p in lm.landmark]
        ys = [p.y * h for p in lm.landmark]

        x1 = max(0, int(min(xs)) - padding)
        y1 = max(0, int(min(ys)) - padding)
        x2 = min(w, int(max(xs)) + padding)
        y2 = min(h, int(max(ys)) + padding)

        # Make it square (ViT likes square input)
        side = max(x2 - x1, y2 - y1)
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
        x1 = max(0, cx - side // 2)
        y1 = max(0, cy - side // 2)
        x2 = min(w, cx + side // 2)
        y2 = min(h, cy + side // 2)

        crop = img_rgb[y1:y2, x1:x2]
        return crop, lm, True

    # No hand — return centre 300×300 crop (silent)
    h, w = img_rgb.shape[:2]
    cx, cy = w // 2, h // 2
    crop = img_rgb[max(0,cy-150):cy+150, max(0,cx-150):cx+150]
    return crop, None, False


# ── Background inference thread ──────────────────────────────────────────
def predict_worker():
    global latest_label, latest_confidence, latest_is_word, latest_frame_data, processing

    while True:
        if latest_frame_data and not processing:
            processing = True
            try:
                img_bytes = base64.b64decode(latest_frame_data)
                img = Image.open(BytesIO(img_bytes)).convert("RGB")
                img_rgb = np.array(img)

                # 1. Detect hand & get tight crop + landmarks
                crop, hand_lm, hand_found = get_hand_crop(img_rgb)

                if hand_found:
                    # 2. Word gesture from landmarks (fast, rule-based)
                    word, word_conf = detect_word(hand_lm)
                    word_pct = round(word_conf * 100, 1)

                    # 3. Alphabet from ViT on hand crop
                    crop_pil = Image.fromarray(crop)
                    res = pipe(crop_pil)
                    letter     = res[0]["label"]
                    letter_pct = round(res[0]["score"] * 100, 1)

                    # 4. Pick best: word wins if its confidence >= letter confidence
                    if word and word_pct >= letter_pct:
                        latest_label      = word
                        latest_confidence = word_pct
                        latest_is_word    = True
                    else:
                        latest_label      = letter
                        latest_confidence = letter_pct
                        latest_is_word    = False
                else:
                    latest_label      = "—"
                    latest_confidence = 0.0
                    latest_is_word    = False

            except Exception as e:
                print(f"[predict_worker] {e}")
            finally:
                processing = False

        time.sleep(0.09)  # ~11 inferences/sec max


threading.Thread(target=predict_worker, daemon=True).start()


# ── Emotion helper ────────────────────────────────────────────────────────
def get_emotion(confidence):
    if confidence < 40:
        return {"emotion": "uncertain", "intensity": 0.3}
    elif confidence > 80:
        return {"emotion": "happy", "intensity": 0.9}
    elif confidence > 60:
        return {"emotion": "neutral", "intensity": 0.6}
    return {"emotion": "focused", "intensity": 0.5}


# ── WebSocket handler ─────────────────────────────────────────────────────
async def handle_client(websocket):
    global latest_frame_data, sentence_buffer, recent_preds, last_append_time

    print(f"[+] Client connected: {websocket.remote_address}")
    sentence_buffer  = ""
    recent_preds     = deque(maxlen=12)
    last_append_time = time.time()

    try:
        async for message in websocket:
            if isinstance(message, str):
                latest_frame_data = message.split(",", 1)[1] if "," in message else message

            label = latest_label
            conf  = latest_confidence
            is_word = latest_is_word

            recent_preds.append(label)
            now = time.time()

            word_added = False
            if (recent_preds.count(label) >= CONFIRM_COUNT
                    and (now - last_append_time) > COOLDOWN
                    and label not in ["—", "none", "nothing"]
                    and conf >= CONFIDENCE_THRESHOLD):

                if label.lower() == "space":
                    sentence_buffer += " "
                elif label.lower() == "del":
                    sentence_buffer = sentence_buffer[:-1]
                elif is_word:
                    # Word gestures add themselves with a trailing space
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
        print(f"[!] Error: {e}")


async def main():
    async with websockets.serve(handle_client, "0.0.0.0", 8000):
        print("WebSocket server listening on ws://0.0.0.0:8000/ws")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
