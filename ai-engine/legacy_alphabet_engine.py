import cv2
import numpy as np
import os
from tensorflow.keras.models import load_model

class LegacyAlphabetEngine:
    def __init__(self, model_path="legacy_signlanguage/Trained_model.h5"):
        self.model_path = os.path.join(os.path.dirname(__file__), model_path)
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Legacy model not found at {self.model_path}")
        
        print(f"Loading legacy alphabet model from {self.model_path}...")
        self.model = load_model(self.model_path)
        self.labels = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ]

    def preprocess(self, img_rgb):
        """Matches the legacy project's thresholding logic."""
        # Convert RGB (PIL/Webcam) to HSV
        hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
        
        # Legacy range from recognise.py
        lower = np.array([0, 0, 0])
        upper = np.array([179, 204, 204])
        
        mask = cv2.inRange(hsv, lower, upper)
        mask = cv2.resize(mask, (64, 64))
        
        # Reshape for CNN input (batch, h, w, c)
        # Note: Some versions of the model might expect (1, 64, 64, 3) 
        # but thresholding usually produces 1 channel.
        # Check model.summary() if it fails here.
        return np.reshape(mask, (1, 64, 64, 1)).astype('float32') / 255.0

    def predict(self, img_rgb):
        processed = self.preprocess(img_rgb)
        prediction = self.model.predict(processed, verbose=0)
        idx = np.argmax(prediction)
        confidence = np.max(prediction)
        
        return self.labels[idx], round(float(confidence) * 100, 1)
