"""
Rider V-Sync Calibration Manager
Handles camera alignment, joint verification, lighting analysis, and starts the gameplay sync loop.
"""

import cv2
import numpy as np
from typing import Dict, List

class CalibrationManager:
    def __init__(self):
        self.calibrated = False
        self.stable_frames_count = 0
        self.required_stable_frames = 60 # requires ~2.0 seconds of continuous green status at 30FPS

    def process_and_render(self, frame, pose_landmarks: dict, hands_data: list) -> bool:
        """
        Evaluates system parameters and renders the calibration HUD.
        Returns: True if system is fully calibrated.
        """
        height, width, _ = frame.shape

        # 1. Conditions evaluations
        camera_active = True # We are processing frame so camera is active
        body_pose_active = len(pose_landmarks) > 0
        left_arm_tracked = False
        left_hand_tracked = False

        # Verify left arm joints are visible with good confidence
        if body_pose_active:
            ls = pose_landmarks.get('LEFT_SHOULDER')
            le = pose_landmarks.get('LEFT_ELBOW')
            lw = pose_landmarks.get('LEFT_WRIST')
            if ls and le and lw:
                if ls['visibility'] > 0.5 and le['visibility'] > 0.5 and lw['visibility'] > 0.5:
                    left_arm_tracked = True

        # Verify hand landmarks are tracked
        if len(hands_data) > 0:
            for hand in hands_data:
                if len(hand['landmarks']) >= 21:
                    left_hand_tracked = True
                    break

        # Analyze frame brightness for acceptable lighting
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        brightness_val = cv2.mean(gray_frame)[0]
        lighting_acceptable = 45.0 <= brightness_val <= 240.0

        # 2. Render HUD overlay
        # semi-transparent backing card for textual metrics
        overlay_mask = frame.copy()
        cv2.rectangle(overlay_mask, (15, 60), (380, 275), (10, 12, 14), -1)
        cv2.addWeighted(overlay_mask, 0.75, frame, 0.25, 0, frame)

        # Render Header text
        cv2.putText(
            frame, 
            "CV CALIBRATION CONSOLE", 
            (25, 90), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            0.6, 
            (0, 251, 251), 
            2, 
            cv2.LINE_AA
        )

        # Draw metrics list with matching green/red checks
        self._render_metric_row(frame, "Webcam Connection Active", camera_active, (25, 125))
        self._render_metric_row(frame, "Body Pose Skeleton In View", body_pose_active, (25, 155))
        self._render_metric_row(frame, "Left Arm Tracking Active", left_arm_tracked, (25, 185))
        self._render_metric_row(frame, "Hand Coordinates Calibrated", left_hand_tracked, (25, 215))
        self._render_metric_row(frame, "Ambient Lighting Normal", lighting_acceptable, (25, 245))

        # Check if all checkpoints are satisfied
        all_metrics_passed = (
            camera_active and 
            body_pose_active and 
            left_arm_tracked and 
            left_hand_tracked and 
            lighting_acceptable
        )

        if all_metrics_passed:
            self.stable_frames_count += 1
            progress_ratio = min(1.0, self.stable_frames_count / self.required_stable_frames)
            
            # Progress bar drawing
            bar_start_x = 25
            bar_end_x = 360
            bar_y = 262
            
            cv2.rectangle(frame, (bar_start_x, bar_y), (bar_end_x, bar_y + 6), (30, 35, 40), -1)
            cv2.rectangle(frame, (bar_start_x, bar_y), (bar_start_x + int((bar_end_x - bar_start_x) * progress_ratio), bar_y + 6), (0, 255, 0), -1)

            if progress_ratio >= 1.0:
                self.calibrated = True
                
                # Big glowing start message
                cv2.putText(
                    frame, 
                    "CALIBRATED! PRESS 'SPACE' TO PLAY", 
                    (int(width * 0.15), height - 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    0.7, 
                    (0, 255, 0), 
                    2, 
                    cv2.LINE_AA
                )
            else:
                cv2.putText(
                    frame, 
                    f"SYNCHRONIZING PROFILE ({int(progress_ratio * 100)}%)", 
                    (int(width * 0.22), height - 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    0.6, 
                    (0, 251, 251), 
                    1, 
                    cv2.LINE_AA
                )
        else:
            # Decay stable frames on failure
            self.stable_frames_count = max(0, self.stable_frames_count - 2)
            cv2.putText(
                frame, 
                "ALIGN YOUR ENTIRE UPPER BODY IN THE WEB-STREAM", 
                (int(width * 0.08), height - 40), 
                cv2.FONT_HERSHEY_SIMPLEX, 
                0.5, 
                (0, 0, 255), 
                1, 
                cv2.LINE_AA
            )

        return self.calibrated

    def _render_metric_row(self, frame, label: str, active: bool, pos: tuple):
        """
        Renders a metric line with corresponding green [OK] or red [PENDING].
        """
        symbol_color = (0, 255, 0) if active else (0, 0, 255)
        symbol = "[OK]" if active else "[PENDING]"
        
        cv2.putText(
            frame, 
            f"{symbol} {label}", 
            pos, 
            cv2.FONT_HERSHEY_SIMPLEX, 
            0.45, 
            symbol_color, 
            1, 
            cv2.LINE_AA
        )
