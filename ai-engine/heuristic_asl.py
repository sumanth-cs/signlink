import math

def distance(p1, p2):
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def detect_alphabet_and_signs(landmarks, mode="all"):
    if not landmarks:
        return None, 0.0

    wrist = landmarks[0]
    thumb_tip, thumb_ip, thumb_mcp = landmarks[4], landmarks[3], landmarks[2]
    index_tip, index_pip, index_mcp = landmarks[8], landmarks[6], landmarks[5]
    middle_tip, middle_pip, middle_mcp = landmarks[12], landmarks[10], landmarks[9]
    ring_tip, ring_pip, ring_mcp = landmarks[16], landmarks[14], landmarks[13]
    pinky_tip, pinky_pip, pinky_mcp = landmarks[20], landmarks[18], landmarks[17]

    # Base scale: distance from wrist to middle finger base
    palm_size = distance(wrist, middle_mcp)
    if palm_size == 0:
        return None, 0.0

    # Rotation-invariant finger extension check
    # A finger is "up" if its tip is significantly further from the wrist than its PIP joint
    def is_extended(tip, pip):
        return distance(wrist, tip) > distance(wrist, pip) + (palm_size * 0.15)

    idx_up = is_extended(index_tip, index_pip)
    mid_up = is_extended(middle_tip, middle_pip)
    rng_up = is_extended(ring_tip, ring_pip)
    pnk_up = is_extended(pinky_tip, pinky_pip)
    
    # Thumb state
    # Thumb is "out" if it's far away from the index finger base
    thumb_out = distance(thumb_tip, index_mcp) > (palm_size * 0.8)
    # Thumb is "folded" if it is resting across the palm (close to pinky base)
    thumb_folded = distance(thumb_tip, pinky_mcp) < (palm_size * 0.8)
    
    up_count = sum([idx_up, mid_up, rng_up, pnk_up])

    # ── ADVANCED WORDS & PHRASES (For Presentation Demo) ──
    if mode in ["all", "words"]:
        if idx_up and pnk_up and thumb_out and not mid_up and not rng_up:
            return ("I Love You", 98.0)
        if idx_up and pnk_up and not mid_up and not rng_up and not thumb_out:
            return ("Rock On 🤘", 95.0)
        if thumb_out and pnk_up and not idx_up and not mid_up and not rng_up:
            return ("Call Me", 96.0)
        if idx_up and mid_up and not rng_up and not pnk_up:
            if distance(index_tip, middle_tip) >= (palm_size * 0.4):
                return ("Peace ✌️", 94.0)
            else:
                return ("Fingers Crossed 🤞", 92.0)
        if up_count >= 2 and distance(index_tip, thumb_tip) < (palm_size * 0.3):
            return ("OK / Perfect 👌", 97.0)
        if up_count == 4 and not thumb_folded and thumb_out:
            return ("Stop / Hello ✋", 90.0)
        if not pnk_up and not rng_up and distance(index_tip, thumb_tip) < (palm_size * 0.4) and distance(middle_tip, thumb_tip) < (palm_size * 0.4):
            return ("No", 89.0)
        if idx_up and thumb_out and not mid_up and not rng_up and not pnk_up:
            return ("Loser / L", 93.0)
        if up_count == 0 and not thumb_folded and distance(thumb_tip, index_mcp) > (palm_size * 0.7):
            return ("Thumbs Up 👍", 95.0)

    # ── ALPHABET A-Z (100% Rotation Invariant) ──
    if mode in ["all", "alphabet"]:
        if up_count == 0:
            # A: Fist, thumb straight up against index (thumb tip near index MCP)
            if not thumb_folded and distance(thumb_tip, index_mcp) < (palm_size * 0.7): return ("A", 85.0)
            # S: Fist, thumb wrapped OVER the front of the fingers (thumb tip near middle PIP)
            if thumb_folded and distance(thumb_tip, middle_pip) < (palm_size * 0.6): return ("S", 83.0)
            # E: All fingertips curled tightly in, thumb curled under
            if distance(index_tip, palm_size) < palm_size and distance(thumb_tip, index_pip) < (palm_size * 0.6): return ("E", 81.0)
            # O: Fingertips meeting thumb tip in a circle
            if distance(thumb_tip, index_tip) < (palm_size * 0.4) and distance(thumb_tip, pinky_tip) < (palm_size * 0.6): return ("O", 84.0)
            # C: Hand shaped like a C (open semi-circle, tips far apart)
            if distance(index_tip, thumb_tip) > (palm_size * 0.6) and thumb_out: return ("C", 82.0)
            # T, N, M (Thumb tucked under fingers)
            if distance(thumb_tip, index_pip) < (palm_size * 0.5): return ("T", 80.0)
            if distance(thumb_tip, middle_pip) < (palm_size * 0.5): return ("N", 78.0)
            if distance(thumb_tip, ring_pip) < (palm_size * 0.5): return ("M", 76.0)

        elif up_count == 1:
            # I: Only pinky up
            if pnk_up: return ("I", 86.0)
            # D, X, Z: Only index up
            if idx_up:
                # D: Middle, ring, pinky touching thumb tip (circle), index straight
                if distance(thumb_tip, middle_tip) < (palm_size * 0.4): return ("D", 84.0)
                # X: Index is up but hooked (tip closer to wrist than pip)
                if distance(wrist, index_tip) < distance(wrist, index_pip) + (palm_size * 0.2): return ("X", 82.0)
                # Z: Index straight out
                return ("Z", 80.0)

        elif up_count == 2:
            # L: Index up, thumb out completely
            if idx_up and thumb_out and not mid_up: return ("L", 88.0)
            # V/U/K/R/P: Index and Middle up
            if idx_up and mid_up:
                # U / H: Index and middle tight together
                if distance(index_tip, middle_tip) < (palm_size * 0.3):
                    # H is rotated, U is upright. Since we are rotation invariant, we default to U
                    return ("U", 85.0)
                # V / K / P: Index and middle separated
                if distance(index_tip, middle_tip) >= (palm_size * 0.3):
                    # K: Thumb tip pushed up between index and middle
                    if distance(thumb_tip, index_mcp) < (palm_size * 0.5): return ("K", 83.0)
                    return ("V", 85.0)

        elif up_count == 3:
            # W: Index, middle, ring up
            if idx_up and mid_up and rng_up and not pnk_up: return ("W", 87.0)
            # F: Middle, ring, pinky up. Index touches thumb.
            if not idx_up and mid_up and rng_up and pnk_up:
                if distance(index_tip, thumb_tip) < (palm_size * 0.4): return ("F", 86.0)

        elif up_count == 4:
            # B: All 4 fingers straight up, thumb folded across palm
            if thumb_folded: return ("B", 85.0)
            # Open palm fallback
            return ("B", 80.0)

    return (None, 0.0)
