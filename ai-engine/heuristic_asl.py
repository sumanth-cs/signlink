import math

def distance(p1, p2):
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def is_finger_up(tip, pip, mcp):
    # A finger is considered "up" if its tip is significantly higher (smaller Y) than its MCP and PIP joints
    return tip.y < pip.y and tip.y < mcp.y

def detect_alphabet_and_signs(landmarks):
    """
    Returns (label, confidence) or (None, 0.0).
    Coordinates: 0.0 to 1.0. Y is inverted (0 is top).
    """
    if not landmarks:
        return None, 0.0

    # Thumb
    thumb_tip = landmarks[4]
    thumb_ip  = landmarks[3]
    thumb_mcp = landmarks[2]
    
    # Index
    index_tip = landmarks[8]
    index_pip = landmarks[6]
    index_mcp = landmarks[5]
    
    # Middle
    middle_tip = landmarks[12]
    middle_pip = landmarks[10]
    middle_mcp = landmarks[9]
    
    # Ring
    ring_tip = landmarks[16]
    ring_pip = landmarks[14]
    ring_mcp = landmarks[13]
    
    # Pinky
    pinky_tip = landmarks[20]
    pinky_pip = landmarks[18]
    pinky_mcp = landmarks[17]
    
    wrist = landmarks[0]

    # Calculate states
    idx_up = is_finger_up(index_tip, index_pip, index_mcp)
    mid_up = is_finger_up(middle_tip, middle_pip, middle_mcp)
    rng_up = is_finger_up(ring_tip, ring_pip, ring_mcp)
    pnk_up = is_finger_up(pinky_tip, pinky_pip, pinky_mcp)
    
    up_count = sum([idx_up, mid_up, rng_up, pnk_up])
    
    # Thumb heuristics
    # "Out" means the thumb x is far from the palm
    palm_width = distance(index_mcp, pinky_mcp)
    thumb_dist_from_palm = distance(thumb_tip, index_mcp)
    thumb_out = thumb_dist_from_palm > palm_width * 0.8
    
    # Thumb over palm
    is_right_hand = index_mcp.x < pinky_mcp.x  # naive assumption for mirrored webcam
    if is_right_hand:
        thumb_over_palm = thumb_tip.x > index_mcp.x
    else:
        thumb_over_palm = thumb_tip.x < index_mcp.x

    # ── ADDITIONAL SIGNS ──
    # OK Sign: Index and thumb touching, middle/ring/pinky up
    if up_count >= 2 and distance(index_tip, thumb_tip) < 0.05:
        return ("OK / Good", 88.0)
    
    # Call Me / Y: Thumb out, Pinky up, others folded
    if thumb_out and pnk_up and not idx_up and not mid_up and not rng_up:
        return ("Call Me / Y", 85.0)

    # No: Index and Middle pointing forward/down, thumb touching them
    if not pnk_up and not rng_up and distance(index_tip, thumb_tip) < 0.1 and distance(middle_tip, thumb_tip) < 0.1:
        return ("No", 80.0)
        
    # ── ALPHABET HEURISTICS ──
    
    if up_count == 0:
        # S: Fist, thumb over fingers
        if thumb_over_palm and thumb_tip.y < middle_pip.y:
            return ("S", 82.0)
        # E: Fingers curled, tips touching palm
        if distance(index_tip, index_mcp) < 0.15:
            return ("E", 80.0)
        # T: Thumb tucked between index and middle
        if thumb_tip.x > index_mcp.x and thumb_tip.x < middle_mcp.x:
            return ("T", 80.0)
        # N: Thumb tucked under index and middle
        if thumb_tip.x > middle_mcp.x and thumb_tip.x < ring_mcp.x:
            return ("N", 78.0)
        # M: Thumb tucked under index, middle, ring
        if thumb_tip.x > ring_mcp.x:
            return ("M", 75.0)
        # A: Thumb straight up/out to the side of the fist
        if not thumb_over_palm and thumb_tip.y < index_mcp.y:
            return ("A", 85.0)
        # O: All tips touching thumb
        if distance(thumb_tip, index_tip) < 0.08 and distance(thumb_tip, middle_tip) < 0.08:
            return ("O", 84.0)
        # C: Curved hand (index and thumb out like a C)
        if thumb_out and distance(index_tip, thumb_tip) > 0.15:
            return ("C", 81.0)
        
    elif up_count == 1:
        # D, I, X, Z
        if pnk_up:
            return ("I / J", 86.0) # J requires motion
        if idx_up:
            # X: index hooked
            if index_tip.y > index_pip.y:
                return ("X", 82.0)
            # D: thumb touching middle tip
            if distance(thumb_tip, middle_tip) < 0.08:
                return ("D", 84.0)
            return ("Z", 80.0) # Assume Z if index is just pointing
            
    elif up_count == 2:
        # H, K, P, Q, R, U, V, L
        if idx_up and pnk_up:
            return ("Rock On 🤘", 88.0)
        
        # G / Q: Index horizontal, thumb out
        if not idx_up and not mid_up and not rng_up and not pnk_up and thumb_out:
            if index_tip.y > wrist.y:
                return ("Q", 83.0)
            return ("G", 83.0)

        # H: Index and Middle horizontal
        if not idx_up and not mid_up and distance(index_tip, middle_tip) < 0.08:
            if index_tip.x > pinky_mcp.x or index_tip.x < wrist.x:
                return ("H", 82.0)

        if idx_up and mid_up:
            # U: touching
            if distance(index_tip, middle_tip) < 0.05:
                return ("U", 85.0)
            # R: crossed
            if is_right_hand:
                if index_tip.x > middle_tip.x: return ("R", 84.0)
            else:
                if index_tip.x < middle_tip.x: return ("R", 84.0)
            
            # V/K/P
            if distance(index_tip, middle_tip) >= 0.05:
                if thumb_tip.y < index_mcp.y: # thumb between them
                    if index_tip.y > wrist.y:
                        return ("P", 81.0)
                    return ("K", 83.0)
                return ("V", 85.0)
                
        # L: Index up, thumb out horizontally
        if idx_up and thumb_out and not mid_up:
            return ("L", 87.0)
            
    elif up_count == 3:
        # F, W
        if idx_up and mid_up and rng_up and not pnk_up:
            return ("W", 86.0)
        if not idx_up and mid_up and rng_up and pnk_up:
            if distance(index_tip, thumb_tip) < 0.06:
                return ("F", 85.0)

    elif up_count == 4:
        # B
        if not thumb_out:
            return ("B", 84.0)

    return (None, 0.0)
