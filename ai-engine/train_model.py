import numpy as np
from app.models.lstm_model import SignLanguageLSTM
import os

def mock_data():
    X = np.random.rand(100, 30, 1662)
    y = np.random.randint(0, 10, 100)
    
    y_cat = np.zeros((100, 10))
    for i in range(100):
        y_cat[i, y[i]] = 1
    return X, y_cat

def train():
    print("Generating mock data...")
    X, y = mock_data()
    
    print("Building model...")
    model = SignLanguageLSTM(num_classes=10)
    
    print("Training model...")
    model.model.fit(X, y, epochs=10, validation_split=0.2)
    
    os.makedirs("models", exist_ok=True)
    model.model.save_weights("models/sign_language_lstm.h5")
    print("Model saved to models/sign_language_lstm.h5")

if __name__ == "__main__":
    train()
