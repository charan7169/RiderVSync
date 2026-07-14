"""
Rider V-Sync Gesture Filter
Applies frame averaging, confidence thresholds, and minimum hold time (300ms) to filter out transient noise.
"""

import time
from typing import Optional

class GestureFilter:
    def __init__(self, min_confidence: float = 0.6, hold_time_ms: float = 300.0):
        self.min_confidence = min_confidence
        self.hold_time_ms = hold_time_ms
        
        # Currently tracked prospective gesture
        self.candidate_gesture: Optional[str] = None
        self.candidate_start_time: float = 0.0
        
        # Currently locked-in active gesture
        self.active_gesture: str = "NONE"
        
        # Last time an active gesture was verified (to allow a small hold grace period)
        self.last_active_time: float = 0.0
        self.grace_period_ms: float = 400.0 # prevent micro-flickers from breaking continuous holds

    def filter_gesture(self, detected_gesture: Optional[str], confidence: float) -> str:
        """
        Processes a raw gesture classification. Enforces confidence criteria and hold durations.
        """
        now = time.time()

        # Reject any signals below our confidence threshold
        if detected_gesture is None or confidence < self.min_confidence:
            detected_gesture = "NONE"

        # Special handling for instant gear commands to bypass 300ms hold
        if detected_gesture in ('GEAR_UP', 'GEAR_DOWN'):
            # Clear candidate state to avoid interference with other continuous gestures
            self.candidate_gesture = "NONE"
            self.candidate_start_time = now
            self.active_gesture = "NONE"
            return detected_gesture

        # State transition handling
        if detected_gesture == self.candidate_gesture:
            if self.candidate_gesture != "NONE":
                # Compute elapsed hold time
                held_duration_ms = (now - self.candidate_start_time) * 1000.0
                
                # If we have reached the target hold time, elevate to ACTIVE
                if held_duration_ms >= self.hold_time_ms:
                    if self.active_gesture != self.candidate_gesture:
                        print(f"[GestureFilter] Command LOCKED: {self.candidate_gesture} (Held {held_duration_ms:.1f}ms)")
                    self.active_gesture = self.candidate_gesture
                    self.last_active_time = now
            else:
                # Candidate is NONE. Check if we should release the active gesture (if grace period expired)
                if self.active_gesture != "NONE":
                    elapsed_since_active = (now - self.last_active_time) * 1000.0
                    if elapsed_since_active >= self.grace_period_ms:
                        print(f"[GestureFilter] Command RELEASED: {self.active_gesture}")
                        self.active_gesture = "NONE"
        else:
            # Candidate changed. Reset prospective candidate timer
            self.candidate_gesture = detected_gesture
            self.candidate_start_time = now

            # If the new candidate is NONE, let the active gesture persist for the grace period
            if detected_gesture == "NONE" and self.active_gesture != "NONE":
                elapsed_since_active = (now - self.last_active_time) * 1000.0
                if elapsed_since_active >= self.grace_period_ms:
                    print(f"[GestureFilter] Command RELEASED: {self.active_gesture}")
                    self.active_gesture = "NONE"

        return self.active_gesture
