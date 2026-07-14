"""
Rider V-Sync Hand Detector
Uses MediaPipe Hands to capture 21 multi-hand coordinates and classifications (Left/Right) for gesture detection.
"""

import cv2
import mediapipe as mp

class HandDetector:
    def __init__(self, max_num_hands=2, min_detection_confidence=0.5, min_tracking_confidence=0.5):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=max_num_hands,
            model_complexity=1,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.mp_draw = mp.solutions.drawing_utils

    def process_frame(self, frame, draw=True):
        """
        Runs MediaPipe Hands on the video frame, drawing landmarks and bone skeletons on success.
        """
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(img_rgb)
        
        if results.multi_hand_landmarks and draw:
            for hand_lms in results.multi_hand_landmarks:
                self.mp_draw.draw_landmarks(
                    frame,
                    hand_lms,
                    self.mp_hands.HAND_CONNECTIONS,
                    landmark_drawing_spec=self.mp_draw.DrawingSpec(color=(0, 255, 251), thickness=2, circle_radius=2),
                    connection_drawing_spec=self.mp_draw.DrawingSpec(color=(255, 0, 127), thickness=2)
                )
        return results

    def get_hands_data(self, results, width: int, height: int) -> list:
        """
        Extracts 21 landmark coordinate points (x, y, z) paired with the hand classification (Left/Right).
        """
        hands_data = []
        if not results.multi_hand_landmarks or not results.multi_handedness:
            return hands_data

        for idx, hand_lms in enumerate(results.multi_hand_landmarks):
            # Hand label classification ('Left' or 'Right')
            handedness = results.multi_handedness[idx].classification[0].label
            score = results.multi_handedness[idx].classification[0].score
            
            landmarks = []
            for lm in hand_lms.landmark:
                landmarks.append({
                    'x': int(lm.x * width),
                    'y': int(lm.y * height),
                    'z': lm.z,
                    'x_norm': lm.x,
                    'y_norm': lm.y
                })
                
            hands_data.append({
                'label': handedness,
                'score': score,
                'landmarks': landmarks
            })
        return hands_data
