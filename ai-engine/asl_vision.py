import cv2
import time
import torch
from transformers import pipeline
from PIL import Image
from collections import deque
import threading
import warnings
warnings.filterwarnings("ignore")

# Initialize the HuggingFace Vision Transformer Pipeline
print("Starting SignLink AI Engine (Alphabet Recognition)...")
print("Loading Pre-Trained ASL Vision Transformer from HuggingFace...")
print("This may take 1-2 minutes the first time to strictly initialize.")

# Load the ViT specifically fine-tuned mathematically for the entire A-Z alphabet!
pipe = pipeline("image-classification", model="akahana/asl-vit", device="cpu")
print("Model securely loaded and cached successfully!")

cap = cv2.VideoCapture(0)

# Threading mechanism to drastically speed up OpenCV video frame-rate visually
latest_frame = None
latest_prediction = "none"
confidence = 0.0

def predict_worker():
    global latest_frame, latest_prediction, confidence
    while True:
        if latest_frame is not None:
            try:
                # The model expects an RGB image cropped around the hand
                h, w, _ = latest_frame.shape
                # Extract the 300x300 strict center region where the hand goes
                x_min, y_min = max(0, w//2 - 150), max(0, h//2 - 150)
                x_max, y_max = min(w, w//2 + 150), min(h, h//2 + 150)
                
                roi = latest_frame[y_min:y_max, x_min:x_max]
                roi_rgb = cv2.cvtColor(roi, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(roi_rgb)
                
                # Zero-training raw sequence pipeline
                results = pipe(pil_img)
                best = results[0]  # The highly confident top tensor 
                
                latest_prediction = best['label']
                confidence = best['score'] * 100
                
            except Exception as e:
                pass
        time.sleep(0.1)

# Spin up the background predictor
predictor = threading.Thread(target=predict_worker, daemon=True)
predictor.start()

# Engine aggregator for spelling contiguous words out
sentence = ""
last_append_time = time.time()
recent_predictions = deque(maxlen=10)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
        
    frame = cv2.flip(frame, 1) # Mirror naturally for convenience
    latest_frame = frame.copy() # Send to background loop
    
    h, w, _ = frame.shape
    x_min, y_min = max(0, w//2 - 150), max(0, h//2 - 150)
    x_max, y_max = min(w, w//2 + 150), min(h, h//2 + 150)
    
    # Draw Green Target Box For Hands
    cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
    cv2.putText(frame, "Place Hand Here", (x_min, y_max + 25), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
    # Logic to build sentences and block spam
    recent_predictions.append(latest_prediction)
    
    # If the model predicts exactly the same letter 8 times continuously, attach it!
    # A 2.0s cooldown forces you to shift letters.
    if recent_predictions.count(latest_prediction) >= 8 and (time.time() - last_append_time) > 2.0:
        if latest_prediction.lower() == "space":
            sentence += " "
        elif latest_prediction.lower() == "del":
            sentence = sentence[:-1]
        elif latest_prediction.lower() not in ["waiting...", "none", "nothing"]:
            sentence += latest_prediction.upper()
            
        last_append_time = time.time()

    # Draw Upper Banner
    cv2.rectangle(frame, (0,0), (640, 110), (0, 0, 0), -1)
    
    # Current Letter
    color = (0, 255, 0) if confidence >= 60 else (0, 165, 255)
    cv2.putText(frame, f"Letter: {latest_prediction} ({confidence:.1f}%)", (10, 40), 
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 2, cv2.LINE_AA)
                
    # Full Constructed Word Prediction
    cv2.putText(frame, f"Word: '{sentence}'", (10, 90), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    cv2.imshow("SignLink ASL Vision Engine", frame)
    
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        break
    elif key == ord('c'):
        sentence = ""

cap.release()
cv2.destroyAllWindows()
