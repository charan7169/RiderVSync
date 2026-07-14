"""
Rider V-Sync Pose Detector
Uses MediaPipe Pose to extract body landmarks (shoulder, elbow, wrist, hip, head) and calculate angles.
"""

import cv2
import mediapipe as mp
import math

class PoseDetector:
    def __init__(self, min_detection_confidence=0.5, min_tracking_confidence=0.5):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.mp_draw = mp.solutions.drawing_utils

    def process_frame(self, frame, draw=True):
        """
        Runs MediaPipe Pose on the image, optionally rendering key joints and skeletal lines.
        """
        # Convert the BGR image to RGB before processing
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(img_rgb)
        
        if results.pose_landmarks and draw:
            self.mp_draw.draw_landmarks(
                frame,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_draw.DrawingSpec(color=(0, 255, 251), thickness=2, circle_radius=3),
                connection_drawing_spec=self.mp_draw.DrawingSpec(color=(0, 127, 255), thickness=2)
            )
        return results

    def get_landmarks_dict(self, results, width: int, height: int) -> dict:
        """
        Converts the PoseLandmarks object into a key-value dictionary with screen pixel coordinates.
        """
        landmarks = {}
        if not results.pose_landmarks:
            return landmarks

        # Relevant joints needed for official motorcycle signals (Swapped LEFT/RIGHT for horizontal mirroring/flipping correction)
        desired_landmarks = {
            'NOSE': self.mp_pose.PoseLandmark.NOSE,
            'LEFT_SHOULDER': self.mp_pose.PoseLandmark.RIGHT_SHOULDER,
            'RIGHT_SHOULDER': self.mp_pose.PoseLandmark.LEFT_SHOULDER,
            'LEFT_ELBOW': self.mp_pose.PoseLandmark.RIGHT_ELBOW,
            'RIGHT_ELBOW': self.mp_pose.PoseLandmark.LEFT_ELBOW,
            'LEFT_WRIST': self.mp_pose.PoseLandmark.RIGHT_WRIST,
            'RIGHT_WRIST': self.mp_pose.PoseLandmark.LEFT_WRIST,
            'LEFT_HIP': self.mp_pose.PoseLandmark.RIGHT_HIP,
            'RIGHT_HIP': self.mp_pose.PoseLandmark.LEFT_HIP,
        }

        for name, lm_enum in desired_landmarks.items():
            lm = results.pose_landmarks.landmark[lm_enum]
            landmarks[name] = {
                'x': int(lm.x * width),
                'y': int(lm.y * height),
                'z': lm.z,
                'visibility': lm.visibility,
                'x_norm': lm.x,
                'y_norm': lm.y
            }
        return landmarks

    @staticmethod
    def calculate_angle(p1, p2, p3) -> float:
        """
        Calculates the 2D angle (in degrees) formed by three points: p1 -> p2 -> p3.
        p2 is the vertex/hinge point.
        """
        try:
            x1, y1 = p1['x'], p1['y']
            x2, y2 = p2['x'], p2['y']
            x3, y3 = p3['x'], p3['y']

            # Calculate vectors
            v1 = (x1 - x2, y1 - y2)
            v2 = (x3 - x2, y3 - y2)

            # Dot product and magnitudes
            dot_product = v1[0] * v2[0] + v1[1] * v2[1]
            mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
            mag2 = math.sqrt(v2[0]**2 + v2[1]**2)

            if mag1 == 0 or mag2 == 0:
                return 0.0

            cosine_angle = dot_product / (mag1 * mag2)
            # Clip values due to potential float precision issues
            cosine_angle = max(-1.0, min(1.0, cosine_angle))
            
            angle = math.degrees(math.acos(cosine_angle))
            return angle
        except Exception:
            return 0.0
