"""
SignLink AI — Alphabet Detection Module (Direct 26-class CNN)
Uses the freshly trained signlink_alphabet_model.h5 which directly
predicts A-Z from skeleton images (no heuristic post-processing needed).
"""

import numpy as np
import cv2
import os
import tensorflow as tf
from tensorflow.keras.models import load_model

# ── Configuration ─────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'signlink_alphabet_model.h5')
IMG_SIZE = 128  # Must match training
LABELS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

# Global model instance (loaded once)
_model = None


def _get_model():
    """Lazy-load the model on first call."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            print(f"[!] Model not found at {MODEL_PATH}")
            return None
        try:
            _model = load_model(MODEL_PATH)
            print(f"[+] Alphabet CNN loaded: {MODEL_PATH}")
        except Exception as e:
            print(f"[-] Failed to load model: {e}")
    return _model


def draw_skeleton(landmarks, img_dims):
    """
    Draw a hand skeleton on a white 400×400 canvas.
    Matches the exact format used during training (green lines, red dots).
    """
    img_w, img_h = img_dims

    # White canvas (3-channel BGR)
    canvas = np.ones((400, 400, 3), dtype=np.uint8) * 255

    # Convert normalized landmarks → pixel coordinates
    pts = [(int(lm.x * img_w), int(lm.y * img_h)) for lm in landmarks]

    # Bounding box of the hand
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    w = max_x - min_x
    h = max_y - min_y

    # Center the hand skeleton on the canvas
    cx = min_x + w // 2
    cy = min_y + h // 2
    ox = 200 - cx
    oy = 200 - cy

    centered = [(p[0] + ox, p[1] + oy) for p in pts]

    def clamp(p):
        return (max(0, min(399, p[0])), max(0, min(399, p[1])))

    # Draw bone connections (green)
    connections = [
        (0,1),(1,2),(2,3),(3,4),           # thumb
        (5,6),(6,7),(7,8),                  # index
        (9,10),(10,11),(11,12),             # middle
        (13,14),(14,15),(15,16),            # ring
        (17,18),(18,19),(19,20),            # pinky
        (5,9),(9,13),(13,17),(0,5),(0,17),  # palm
    ]
    for a, b in connections:
        cv2.line(canvas, clamp(centered[a]), clamp(centered[b]), (0, 255, 0), 3)

    # Draw joint dots (red)
    for p in centered:
        cv2.circle(canvas, clamp(p), 2, (0, 0, 255), 1)

    return canvas, centered


def detect_alphabet(landmarks, img_dims=(640, 480)):
    """
    Predict a letter A-Z from MediaPipe hand landmarks.
    Returns: (letter, confidence%) or (None, 0.0)
    """
    model = _get_model()
    if model is None:
        return None, 0.0

    # 1. Draw skeleton (same format as training data)
    skeleton, _ = draw_skeleton(landmarks, img_dims)

    # 2. Resize to model input size and normalize
    resized = cv2.resize(skeleton, (IMG_SIZE, IMG_SIZE))
    normalized = resized.astype('float32') / 255.0
    batch = normalized.reshape(1, IMG_SIZE, IMG_SIZE, 3)

    # 3. Predict
    probs = model.predict(batch, verbose=0)[0]
    top_idx = int(np.argmax(probs))
    confidence = float(probs[top_idx] * 100)

    # 4. Only return if reasonably confident
    if confidence < 25.0:
        return None, 0.0

    return LABELS[top_idx], confidence
