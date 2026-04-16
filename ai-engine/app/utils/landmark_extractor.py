import cv2
import numpy as np
import mediapipe as mp

class LandmarkExtractor:
    def __init__(self):
        self.mp_holistic = mp.solutions.holistic
        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def extract_landmarks(self, frame):
        # Convert BGR to RGB
        image = cv2.cvtColor(frame, cv2.Color(cv2.COLOR_BGR2RGB))
        image.flags.writeable = False

        # Make prediction
        results = self.holistic.process(image)

        # Extract features
        pose = np.zeros(33*4)
        if results.pose_landmarks:
            pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten()

        face = np.zeros(468*3)
        if results.face_landmarks:
            face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten()

        lh = np.zeros(21*3)
        if results.left_hand_landmarks:
            lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten()

        rh = np.zeros(21*3)
        if results.right_hand_landmarks:
            rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten()

        # Concatenate all features (should be 1662)
        return np.concatenate([pose, face, lh, rh])

    def close(self):
        self.holistic.close()
