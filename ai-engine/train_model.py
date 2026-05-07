"""
SignLink AI — Train a direct 26-class (A-Z) CNN on skeleton images.
This replaces the old 8-group model with a single model that
directly predicts the letter, eliminating error-prone heuristics.

Dataset: legacy_signlanguage/AtoZ_3.1/  (26 folders, ~180 images each)
Images:  400x400 skeleton drawings (green lines on white background)
Output:  signlink_alphabet_model.h5
"""

import os
import numpy as np
import cv2
from sklearn.model_selection import train_test_split

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TF warnings

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Conv2D, MaxPooling2D, BatchNormalization,
    Flatten, Dense, Dropout
)
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.utils import to_categorical

# ── Configuration ─────────────────────────────────────────────────
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'legacy_signlanguage', 'AtoZ_3.1')
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), 'signlink_alphabet_model.h5')
IMG_SIZE = 128  # Resize from 400x400 → 128x128 for speed & generalization
NUM_CLASSES = 26
BATCH_SIZE = 32
EPOCHS = 30  # EarlyStopping will cut this short if converged
LABELS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")


def load_dataset():
    """Load all skeleton images and labels."""
    images = []
    labels = []
    
    print("[1/4] Loading dataset...")
    for idx, letter in enumerate(LABELS):
        folder = os.path.join(DATASET_DIR, letter)
        if not os.path.isdir(folder):
            print(f"  WARNING: Missing folder for {letter}")
            continue
        
        files = [f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
        print(f"  {letter}: {len(files)} images")
        
        for fname in files:
            fpath = os.path.join(folder, fname)
            img = cv2.imread(fpath)
            if img is None:
                continue
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = img.astype('float32') / 255.0  # Normalize to [0,1]
            images.append(img)
            labels.append(idx)
    
    images = np.array(images)
    labels = np.array(labels)
    print(f"  Total: {len(images)} images loaded\n")
    return images, labels


def build_model():
    """Build a lightweight CNN optimized for skeleton images."""
    print("[2/4] Building CNN model...")
    
    model = Sequential([
        # Block 1
        Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
        BatchNormalization(),
        Conv2D(32, (3, 3), activation='relu', padding='same'),
        MaxPooling2D(2, 2),
        Dropout(0.25),
        
        # Block 2
        Conv2D(64, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        Conv2D(64, (3, 3), activation='relu', padding='same'),
        MaxPooling2D(2, 2),
        Dropout(0.25),
        
        # Block 3
        Conv2D(128, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        Conv2D(128, (3, 3), activation='relu', padding='same'),
        MaxPooling2D(2, 2),
        Dropout(0.25),
        
        # Classifier
        Flatten(),
        Dense(256, activation='relu'),
        BatchNormalization(),
        Dropout(0.5),
        Dense(128, activation='relu'),
        Dropout(0.3),
        Dense(NUM_CLASSES, activation='softmax')
    ])
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    return model


def train():
    # Load
    X, y = load_dataset()
    y_cat = to_categorical(y, NUM_CLASSES)
    
    # Split: 80% train, 20% validation
    X_train, X_val, y_train, y_val = train_test_split(
        X, y_cat, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train: {len(X_train)}, Validation: {len(X_val)}\n")
    
    # Data augmentation (in-memory, rotation/shift/zoom)
    datagen = tf.keras.preprocessing.image.ImageDataGenerator(
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1,
        horizontal_flip=False,  # Don't flip — left/right hand matters
    )
    datagen.fit(X_train)
    
    # Build model
    model = build_model()
    
    # Callbacks
    early_stop = EarlyStopping(
        monitor='val_accuracy', patience=7,
        restore_best_weights=True, verbose=1
    )
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss', factor=0.5,
        patience=3, min_lr=1e-6, verbose=1
    )
    
    # Train
    print("\n[3/4] Training model...")
    history = model.fit(
        datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
        epochs=EPOCHS,
        validation_data=(X_val, y_val),
        callbacks=[early_stop, reduce_lr],
        verbose=1
    )
    
    # Evaluate
    print("\n[4/4] Evaluating model...")
    val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"\n{'='*50}")
    print(f"  FINAL VALIDATION ACCURACY: {val_acc*100:.1f}%")
    print(f"  FINAL VALIDATION LOSS:     {val_loss:.4f}")
    print(f"{'='*50}")
    
    # Save
    model.save(MODEL_SAVE_PATH)
    print(f"\n[✓] Model saved to: {MODEL_SAVE_PATH}")
    print(f"[✓] Model size: {os.path.getsize(MODEL_SAVE_PATH) / (1024*1024):.1f} MB")
    
    # Per-class accuracy
    print("\n── Per-Letter Accuracy ──")
    y_pred = np.argmax(model.predict(X_val, verbose=0), axis=1)
    y_true = np.argmax(y_val, axis=1)
    
    for idx, letter in enumerate(LABELS):
        mask = (y_true == idx)
        if mask.sum() == 0:
            continue
        acc = (y_pred[mask] == idx).mean() * 100
        status = "✓" if acc >= 80 else "⚠"
        print(f"  {status} {letter}: {acc:.0f}% ({mask.sum()} samples)")


if __name__ == "__main__":
    print("=" * 50)
    print("  SignLink AI — Alphabet Model Training")
    print("=" * 50)
    print()
    train()
