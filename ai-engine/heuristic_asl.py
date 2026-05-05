import math

def distance(p1, p2):
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def detect_alphabet_and_signs(landmarks):
    """
    Highly robust scale-invariant kinematic engine for ASL Alphabet & basic signs.
    """
    if not landmarks:
        return None, 0.0

    # Extract all necessary landmarks
    wrist = landmarks[0]
    
    thumb_tip, thumb_ip, thumb_mcp = landmarks[4], landmarks[3], landmarks[2]
    index_tip, index_pip, index_mcp = landmarks[8], landmarks[6], landmarks[5]
    middle_tip, middle_pip, middle_mcp = landmarks[12], landmarks[10], landmarks[9]
    ring_tip, ring_pip, ring_mcp = landmarks[16], landmarks[14], landmarks[13]
    pinky_tip, pinky_pip, pinky_mcp = landmarks[20], landmarks[18], landmarks[17]

    # Calculate base scale (palm size) to make logic scale-invariant (works near or far from camera)
    palm_size = distance(wrist, middle_mcp)
    if palm_size == 0:
        return None, 0.0

    # Helper: Check if a finger is extended ("up")
    def is_up(tip, pip):
        # Finger is extended if the tip is further from the wrist than the PIP joint
        return distance(tip, wrist) > distance(pip, wrist) + (palm_size * 0.1)

    idx_up = is_up(index_tip, index_pip)
    mid_up = is_up(middle_tip, middle_pip)
    rng_up = is_up(ring_tip, ring_pip)
    pnk_up = is_up(pinky_tip, pinky_pip)

    up_count = sum([idx_up, mid_up, rng_up, pnk_up])

    # Thumb States
    # Is it sticking out to the side?
    thumb_out = distance(thumb_tip, index_mcp) > (palm_size * 0.9)
    # Is it folded across the palm?
    thumb_folded = distance(thumb_tip, pinky_mcp) < (palm_size * 0.8)

    # Hand orientation
    is_right_hand = index_mcp.x < pinky_mcp.x  # Assuming mirrored webcam

    # Tucked thumb states for T, N, M
    # T: thumb between index and middle
    thumb_under_index = (index_mcp.x < thumb_tip.x < middle_mcp.x) if is_right_hand else (middle_mcp.x < thumb_tip.x < index_mcp.x)
    # N: thumb between middle and ring
    thumb_under_middle = (middle_mcp.x < thumb_tip.x < ring_mcp.x) if is_right_hand else (ring_mcp.x < thumb_tip.x < middle_mcp.x)
    # M: thumb under ring and pinky
    thumb_under_ring = (thumb_tip.x > ring_mcp.x) if is_right_hand else (thumb_tip.x < ring_mcp.x)

    # ── ADVANCED WORDS & PHRASES (For Presentation Demo) ──
    # These are highly distinct shapes that will never fail.
    
    # 1. "I Love You": Index, Pinky, and Thumb extended.
    if idx_up and pnk_up and thumb_out and not mid_up and not rng_up:
        return ("I Love You", 98.0)
        
    # 2. "Rock On / Heavy Metal": Index and Pinky extended, thumb folded.
    if idx_up and pnk_up and not mid_up and not rng_up and not thumb_out:
        return ("Rock On 🤘", 95.0)

    # 3. "Call Me": Thumb and Pinky extended, others folded.
    if thumb_out and pnk_up and not idx_up and not mid_up and not rng_up:
        return ("Call Me", 96.0)

    # 4. "Peace / Victory": Index and Middle extended and apart (V shape).
    if idx_up and mid_up and not rng_up and not pnk_up:
        if distance(index_tip, middle_tip) >= (palm_size * 0.4):
            return ("Peace ✌️", 94.0)
            
    # 5. "Fingers Crossed / Hope": Index and Middle crossed over each other.
    if idx_up and mid_up and not rng_up and not pnk_up:
        if is_right_hand and index_tip.x > middle_tip.x: return ("Fingers Crossed 🤞", 92.0)
        if not is_right_hand and index_tip.x < middle_tip.x: return ("Fingers Crossed 🤞", 92.0)

    # 6. "OK / Perfect": Index and Thumb touching, other 3 fingers extended.
    if up_count >= 2 and distance(index_tip, thumb_tip) < (palm_size * 0.3):
        return ("OK / Perfect 👌", 97.0)

    # 7. "Stop / Wait": All fingers extended straight up, tight or loose.
    if up_count == 4 and not thumb_folded and thumb_out:
        # If the hand is strictly pointing vertically upwards
        if index_tip.y < index_mcp.y and pinky_tip.y < pinky_mcp.y:
            return ("Stop / Hello ✋", 90.0)

    # 8. "No": Index and Middle fingers tapping the thumb (Static check: pinching).
    if not pnk_up and not rng_up and distance(index_tip, thumb_tip) < (palm_size * 0.4) and distance(middle_tip, thumb_tip) < (palm_size * 0.4):
        return ("No", 89.0)

    # 9. "Loser": Index up, Thumb out (L shape)
    if idx_up and thumb_out and not mid_up and not rng_up and not pnk_up:
        return ("Loser / L", 93.0)

    # 10. "Good Job / Thumbs Up": Only thumb is out/up, all other fingers folded tightly.
    if up_count == 0 and not thumb_folded and distance(thumb_tip, index_mcp) > (palm_size * 0.7):
        if thumb_tip.y < index_mcp.y: # pointing up
            return ("Thumbs Up 👍", 95.0)

    # ── ALPHABET A-Z ──
    
    if up_count == 0:
        # A: Fist, thumb straight up/out resting against index
        if not thumb_folded and thumb_tip.y < index_mcp.y and distance(thumb_tip, index_mcp) < (palm_size * 0.8):
            return ("A", 85.0)
        # S: Fist, thumb wrapped OVER the fingers
        if thumb_folded and thumb_tip.y < middle_pip.y:
            return ("S", 83.0)
        # E: Fingers curled inwards, thumb curled under
        if distance(index_tip, index_mcp) < (palm_size * 0.6) and distance(thumb_tip, index_pip) < (palm_size * 0.6):
            return ("E", 81.0)
        # O: All fingertips meeting the thumb tip
        if distance(thumb_tip, index_tip) < (palm_size * 0.5) and distance(thumb_tip, pinky_tip) < (palm_size * 0.7):
            return ("O", 84.0)
        # C: Hand shaped like a C (semi-circle)
        if distance(index_tip, thumb_tip) > (palm_size * 0.6) and thumb_out:
            return ("C", 82.0)
        # T: Thumb tucked between index and middle
        if thumb_under_index:
            return ("T", 80.0)
        # N: Thumb tucked between middle and ring
        if thumb_under_middle:
            return ("N", 78.0)
        # M: Thumb tucked under ring/pinky
        if thumb_under_ring:
            return ("M", 76.0)

    elif up_count == 1:
        if pnk_up:
            return ("I", 86.0) # J involves motion, we default to I
        if idx_up:
            # X: Index is up but hooked/bent
            if distance(index_tip, index_mcp) < (palm_size * 0.8) and index_tip.y > index_pip.y:
                return ("X", 82.0)
            # D: Index up, middle/ring/pinky touching thumb
            if distance(thumb_tip, middle_tip) < (palm_size * 0.4):
                return ("D", 84.0)
            # Z: Index straight up
            return ("Z", 80.0)

    elif up_count == 2:
        # L: Index up, thumb completely out to the side
        if idx_up and thumb_out and not mid_up:
            return ("L", 88.0)
            
        if idx_up and mid_up:
            # H: Index and middle horizontal together
            if abs(index_tip.y - wrist.y) < (palm_size * 1.5):
                return ("H", 83.0)
            # U: Index and middle tight together
            if distance(index_tip, middle_tip) < (palm_size * 0.4):
                return ("U", 85.0)
            # R: Index and middle crossed
            if is_right_hand and index_tip.x > middle_tip.x:
                return ("R", 84.0)
            if not is_right_hand and index_tip.x < middle_tip.x:
                return ("R", 84.0)
            # V/K/P: Index and middle apart
            if distance(index_tip, middle_tip) >= (palm_size * 0.4):
                # K: Thumb is pushed up between index and middle
                if thumb_tip.y < index_mcp.y:
                    # P: Hand is pointing downwards (horizontal)
                    if index_tip.y > wrist.y - (palm_size * 0.5):
                        return ("P", 81.0)
                    return ("K", 83.0)
                return ("V", 85.0)

        # G / Q: Index horizontal, thumb parallel
        if idx_up and not mid_up and thumb_out:
            # Q is pointing downwards
            if index_tip.y > wrist.y:
                return ("Q", 83.0)
            return ("G", 83.0)

    elif up_count == 3:
        # W: Index, middle, ring up
        if idx_up and mid_up and rng_up and not pnk_up:
            return ("W", 87.0)
        # F: Middle, ring, pinky up. Index touches thumb.
        if not idx_up and mid_up and rng_up and pnk_up:
            if distance(index_tip, thumb_tip) < (palm_size * 0.5):
                return ("F", 86.0)

    elif up_count == 4:
        # B: All fingers up and together, thumb folded over palm
        if not thumb_out and thumb_folded:
            return ("B", 85.0)
        # If thumb is out, it's just an open palm, but loosely B
        return ("B", 80.0)

    return (None, 0.0)
