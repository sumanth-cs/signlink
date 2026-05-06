import numpy as np
import cv2
import os
import math
import tensorflow as tf
from tensorflow.keras.models import load_model

# Global model instance
CNN_MODEL = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'cnn8grps_rad1_model.h5')
WHITE_IMG_PATH = os.path.join(os.path.dirname(__file__), 'white.jpg')

def load_cnn_model():
    global CNN_MODEL
    if CNN_MODEL is None and os.path.exists(MODEL_PATH):
        try:
            # Load model with specific configurations for stability
            CNN_MODEL = load_model(MODEL_PATH)
            print("[+] Legacy CNN Model loaded successfully")
        except Exception as e:
            print(f"[-] Error loading CNN model: {e}")
    return CNN_MODEL

def draw_skeleton(landmarks, img_dims):
    # img_dims is (width, height)
    img_w, img_h = img_dims
    
    # Create white canvas (FORCE 3 CHANNELS BGR)
    white = np.ones((400, 400, 3), dtype=np.uint8) * 255
    
    # Scale landmarks to pixel coordinates
    pixel_pts = [[int(l.x * img_w), int(l.y * img_h)] for l in landmarks]
    
    # Get bounding box
    x_coords = [p[0] for p in pixel_pts]
    y_coords = [p[1] for p in pixel_pts]
    min_x, max_x = min(x_coords), max(x_coords)
    min_y, max_y = min(y_coords), max(y_coords)
    w, h = max_x - min_x, max_y - min_y
    
    # Add some padding to the bounding box (mimicking original offset)
    # The original project cropped with an offset of 15
    padding = 20
    
    # Calculate centering offsets
    # We want the hand (with padding) to be centered in the 400x400 box
    # Target center is 200, 200
    hand_center_x = min_x + w // 2
    hand_center_y = min_y + h // 2
    
    os_x = 200 - hand_center_x
    os_y = 200 - hand_center_y
    
    centered_pts = [[p[0] + os_x, p[1] + os_y] for p in pixel_pts]
    
    def draw_line(p1_idx, p2_idx):
        p1 = (max(0, min(399, centered_pts[p1_idx][0])), max(0, min(399, centered_pts[p1_idx][1])))
        p2 = (max(0, min(399, centered_pts[p2_idx][0])), max(0, min(399, centered_pts[p2_idx][1])))
        # BGR: Green is (0, 255, 0)
        cv2.line(white, p1, p2, (0, 255, 0), 3)

    # Drawing lines according to the legacy project's structure
    for t in range(0, 4): draw_line(t, t+1)
    for t in range(5, 8): draw_line(t, t+1)
    for t in range(9, 12): draw_line(t, t+1)
    for t in range(13, 16): draw_line(t, t+1)
    for t in range(17, 20): draw_line(t, t+1)
    
    draw_line(5, 9)
    draw_line(9, 13)
    draw_line(13, 17)
    draw_line(0, 5)
    draw_line(0, 17)
    
    # Circles: Red is (0, 0, 255)
    for i in range(21):
        p = (max(0, min(399, centered_pts[i][0])), max(0, min(399, centered_pts[i][1])))
        cv2.circle(white, p, 2, (0, 0, 255), 1)
        
    return white

def detect_alphabet_cnn(landmarks, img_dims=(640, 480)):
    model = load_cnn_model()
    if model is None:
        return None, 0.0
    
    # 1. Generate Skeleton & Predict Group
    skeleton = draw_skeleton(landmarks, img_dims)
    skeleton_input = skeleton.reshape(1, 400, 400, 3)
    
    predictions = model.predict(skeleton_input, verbose=0)[0]
    ch1 = np.argmax(predictions)
    conf = float(predictions[ch1] * 100)
    
    # Second best for correction logic
    temp_prob = predictions.copy()
    temp_prob[ch1] = 0
    ch2 = np.argmax(temp_prob)
    pl = [ch1, ch2]

    # Re-calculate pixel pts for heuristics (using 400x400 normalized space as per legacy)
    # The legacy project used the coordinates relative to the 400x400 box
    # So we reuse centered_pts logic but within detect_alphabet_cnn
    
    # Scale landmarks to pixel coordinates based on input image dimensions
    img_w, img_h = img_dims
    pixel_pts = [[int(l.x * img_w), int(l.y * img_h)] for l in landmarks]
    x_coords = [p[0] for p in pixel_pts]
    y_coords = [p[1] for p in pixel_pts]
    min_x, max_x = min(x_coords), max(x_coords)
    min_y, max_y = min(y_coords), max(y_coords)
    w, h = max_x - min_x, max_y - min_y
    os_x = ((400 - w) // 2) - min_x
    os_y = ((400 - h) // 2) - min_y
    pts = [[p[0] + os_x, p[1] + os_y] for p in pixel_pts]

    # 2. Ported Correction Logic & Heuristics from final_pred.py
    
    # Subgroup mapping based on heuristics
    # Group 0: [A, E, M, N, S, T]
    # Group 1: [B, D, F, I, K, U, V, W, R]
    # Group 2: [C, O]
    # Group 3: [G, H]
    # Group 4: [L]
    # Group 5: [P, Q, Z]
    # Group 6: [X]
    # Group 7: [Y, J]

    # --- CROSS-GROUP CORRECTIONS ---
    
    # Correction for [Aemnst]
    l_aemnst = [[5, 2], [5, 3], [3, 5], [3, 6], [3, 0], [3, 2], [6, 4], [6, 1], [6, 2], [6, 6], [6, 7], [6, 0], [6, 5],
             [4, 1], [1, 0], [1, 1], [6, 3], [1, 6], [5, 6], [5, 1], [4, 5], [1, 4], [1, 5], [2, 0], [2, 6], [4, 6],
             [1, 0], [5, 7], [1, 6], [6, 1], [7, 6], [2, 5], [7, 1], [5, 4], [7, 0], [7, 5], [7, 2]]
    if pl in l_aemnst:
        if (pts[6][1] < pts[8][1] and pts[10][1] < pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1]):
            ch1 = 0

    # Correction for [O, S]
    if pl in [[2, 2], [2, 1]]:
        if pts[5][0] < pts[4][0]:
            ch1 = 0

    # Correction for [C0, Aemnst]
    l_c0_aemnst = [[0, 0], [0, 6], [0, 2], [0, 5], [0, 1], [0, 7], [5, 2], [7, 6], [7, 1]]
    if pl in l_c0_aemnst:
        if (pts[0][0] > pts[8][0] and pts[0][0] > pts[4][0] and pts[0][0] > pts[12][0] and pts[0][0] > pts[16][0] and pts[0][0] > pts[20][0]) and pts[5][0] > pts[4][0]:
            ch1 = 2

    # --- SUBGROUP HEURISTICS ---
    result_char = str(ch1)
    
    if ch1 == 0:
        result_char = 'S'
        if pts[4][0] < pts[6][0] and pts[4][0] < pts[10][0] and pts[4][0] < pts[14][0] and pts[4][0] < pts[18][0]:
            result_char = 'A'
        elif pts[4][0] > pts[6][0] and pts[4][0] < pts[10][0] and pts[4][0] < pts[14][0] and pts[4][0] < pts[18][0] and pts[4][1] < pts[14][1] and pts[4][1] < pts[18][1]:
            result_char = 'T'
        elif pts[4][1] > pts[8][1] and pts[4][1] > pts[12][1] and pts[4][1] > pts[16][1] and pts[4][1] > pts[20][1]:
            result_char = 'E'
        elif pts[4][0] > pts[6][0] and pts[4][0] > pts[10][0] and pts[4][0] > pts[14][0] and pts[4][1] < pts[18][1]:
            result_char = 'M'
        elif pts[4][0] > pts[6][0] and pts[4][0] > pts[10][0] and pts[4][1] < pts[18][1] and pts[4][1] < pts[14][1]:
            result_char = 'N'

    elif ch1 == 2:
        if get_dist(12, 4) > 42:
            result_char = 'C'
        else:
            result_char = 'O'

    elif ch1 == 3:
        if get_dist(8, 12) > 72:
            result_char = 'G'
        else:
            result_char = 'H'

    elif ch1 == 7:
        if get_dist(8, 4) > 42:
            result_char = 'Y'
        else:
            result_char = 'J'

    elif ch1 == 4:
        result_char = 'L'

    elif ch1 == 6:
        result_char = 'X'

    elif ch1 == 5:
        if pts[4][0] > pts[12][0] and pts[4][0] > pts[16][0] and pts[4][0] > pts[20][0]:
            if pts[8][1] < pts[5][1]:
                result_char = 'Z'
            else:
                result_char = 'Q'
        else:
            result_char = 'P'

    elif ch1 == 1:
        # Group 1 logic [B, D, F, I, K, U, V, W, R]
        if (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] > pts[16][1] and pts[18][1] > pts[20][1]):
            result_char = 'B'
        elif (pts[6][1] > pts[8][1] and pts[10][1] < pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1]):
            result_char = 'D'
        elif (pts[6][1] < pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] > pts[16][1] and pts[18][1] > pts[20][1]):
            result_char = 'F'
        elif (pts[6][1] < pts[8][1] and pts[10][1] < pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] > pts[20][1]):
            result_char = 'I'
        elif (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] > pts[16][1] and pts[18][1] < pts[20][1]):
            result_char = 'W'
        elif (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1]) and pts[4][1] < pts[9][1]:
            result_char = 'K'
        else:
            # Check for U, V, R
            dist_8_12 = get_dist(8, 12)
            dist_6_10 = get_dist(6, 10)
            if (dist_8_12 - dist_6_10) < 8:
                result_char = 'U'
            elif (dist_8_12 - dist_6_10) >= 8:
                result_char = 'V'
            
            if pts[8][0] > pts[12][0]:
                result_char = 'R'

    # Fallback to group number if not mapped (shouldn't happen)
    if len(result_char) > 1 and result_char.isdigit():
        return None, 0.0
        
    return result_char, conf
