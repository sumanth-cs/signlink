import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Configuration
DATASET_DIR = 'legacy_signlanguage/AtoZ_3.1'
MODEL_SAVE_PATH = 'cnn8grps_rad1_model_updated.h5'
IMG_SIZE = 400
BATCH_SIZE = 32
EPOCHS = 10

def build_model(num_classes):
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
        MaxPooling2D(2, 2),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        Flatten(),
        Dense(256, activation='relu'),
        Dropout(0.5),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

def train():
    if not os.path.exists(DATASET_DIR):
        print(f"[-] Dataset directory {DATASET_DIR} not found.")
        return

    # Data Augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )

    train_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    validation_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    num_classes = train_generator.num_classes
    print(f"[+] Found {num_classes} classes. Building model...")
    
    model = build_model(num_classes)
    
    print("[+] Starting training...")
    model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=validation_generator
    )
    
    model.save(MODEL_SAVE_PATH)
    print(f"[+] Model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    print("[!] This is a demonstration script for training the legacy model.")
    print("[!] Training may take several hours on a CPU.")
    # Uncomment the line below to actually start training
    # train()
