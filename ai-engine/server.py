"""
SignLink AI Engine - WebSocket Server
Receives webcam frames from the frontend, runs ASL detection,
and streams back predictions in real-time.
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

warnings.filterwarnings("ignore")

print("=" * 60)
print("  SignLink AI Engine - WebSocket Server")
print("=" * 60)
print("Loading ASL Vision Transformer model...")

from transformers import pipeline

# Load the pre-trained ASL alphabet ViT model
pipe = pipeline("image-classification", model="akahana/asl-vit", device="cpu")

print("Model loaded successfully! Server starting on ws://localhost:8000")
print("=" * 60)

# ── Shared prediction state (updated by background thread) ──────────────
latest_label = "none"
latest_confidence = 0.0
latest_frame_data = None
processing = False

# Word-building state
sentence_buffer = ""
recent_preds = deque(maxlen=12)
last_append_time = time.time()
COOLDOWN = 2.0   # seconds between letters
CONFIRM_COUNT = 8  # how many consecutive same-letter frames to confirm

# Basic ASL words the model sometimes predicts as full words
WORD_SIGNS = {
    "space": " ",
    "del":   "<DEL>",
    "nothing": None,
}

def predict_worker():
    """Background thread: continuously classify the latest frame."""
    global latest_label, latest_confidence, latest_frame_data, processing

    while True:
        if latest_frame_data is not None and not processing:
            processing = True
            try:
                img_bytes = base64.b64decode(latest_frame_data)
                img = Image.open(BytesIO(img_bytes)).convert("RGB")

                # Crop center 300×300 region (where hand should be)
                w, h = img.size
                cx, cy = w // 2, h // 2
                box = (max(0, cx - 150), max(0, cy - 150),
                       min(w, cx + 150), min(h, cy + 150))
                roi = img.crop(box)

                results = pipe(roi)
                latest_label = results[0]["label"]
                latest_confidence = round(results[0]["score"] * 100, 1)

            except Exception as e:
                print(f"[predict_worker] Error: {e}")
            finally:
                processing = False

        time.sleep(0.08)   # ~12 inferences/sec max


# Start inference thread
threading.Thread(target=predict_worker, daemon=True).start()


def get_emotion(label: str, confidence: float) -> dict:
    """
    Infer a rough 'emotion' from the detected sign + confidence.
    This is a simple heuristic – upgrade later with a proper face model.
    """
    positive = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
                "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
                "W", "X", "Y", "Z"}
    if confidence < 40:
        return {"emotion": "uncertain", "intensity": 0.3}
    elif confidence > 80:
        return {"emotion": "happy", "intensity": 0.9}
    elif confidence > 60:
        return {"emotion": "neutral", "intensity": 0.6}
    else:
        return {"emotion": "focused", "intensity": 0.5}


async def handle_client(websocket):
    """Handle a single connected frontend client."""
    global latest_frame_data, sentence_buffer, recent_preds, last_append_time

    client_addr = websocket.remote_address
    print(f"[+] Client connected: {client_addr}")

    # Reset word buffer for each new session
    sentence_buffer = ""
    recent_preds = deque(maxlen=12)
    last_append_time = time.time()

    try:
        async for message in websocket:
            # ── Receive frame ──────────────────────────────────────────
            if isinstance(message, str):
                # Strip data-URI prefix if present (data:image/jpeg;base64,...)
                if "," in message:
                    latest_frame_data = message.split(",", 1)[1]
                else:
                    latest_frame_data = message

            # ── Build sentence from stable predictions ──────────────────
            label = latest_label
            conf  = latest_confidence

            recent_preds.append(label)
            now = time.time()

            word_added = False
            if (recent_preds.count(label) >= CONFIRM_COUNT
                    and (now - last_append_time) > COOLDOWN
                    and label.lower() not in ["none", "nothing", "waiting..."]):

                if label.lower() == "space":
                    sentence_buffer += " "
                elif label.lower() == "del":
                    sentence_buffer = sentence_buffer[:-1]
                else:
                    sentence_buffer += label.upper()

                last_append_time = now
                word_added = True

            # ── Compose and send prediction payload ─────────────────────
            payload = {
                "type": "prediction",
                "text": label,
                "confidence": conf,
                "sentence": sentence_buffer,
                "sentiment": get_emotion(label, conf),
                "word_added": word_added,
            }

            await websocket.send(json.dumps(payload))

    except websockets.exceptions.ConnectionClosed:
        print(f"[-] Client disconnected: {client_addr}")
    except Exception as e:
        print(f"[!] Error with client {client_addr}: {e}")


async def main():
    async with websockets.serve(handle_client, "0.0.0.0", 8000):
        print("WebSocket server listening on ws://0.0.0.0:8000")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
