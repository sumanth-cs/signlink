from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
from app.websocket.manager import manager
from app.utils.landmark_extractor import LandmarkExtractor
from app.models.lstm_model import SignLanguageLSTM
from app.models.sentiment_analyzer import SentimentAnalyzer
import os

app = FastAPI(title="SignLink AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

extractor = LandmarkExtractor()
lstm = SignLanguageLSTM()
lstm.load_weights(os.getenv("MODEL_PATH", "models/sign_language_lstm.h5"))
sentiment_analyzer = SentimentAnalyzer()

@app.get("/")
def read_root():
    return {"status": "AI Engine is running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            
            # Predict and return
            # Decode base64 image
            if "data:image" in data:
                encoded_data = data.split(',')[1]
                nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is not None:
                    # Extract landmarks
                    landmarks = extractor.extract_landmarks(frame)
                    
                    # Sentiment Analysis
                    sentiment = sentiment_analyzer.analyze_emotion(landmarks[33*4:33*4 + 468*3]) # Face landmarks
                    
                    # Predict Sign
                    prediction = lstm.predict(landmarks)
                    
                    if prediction["confidence"] > 0.70:
                        await manager.send_personal_message({
                            "type": "prediction",
                            "text": prediction["text"],
                            "confidence": prediction["confidence"],
                            "sentiment": sentiment
                        }, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
