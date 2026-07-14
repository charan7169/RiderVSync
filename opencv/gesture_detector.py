"""
Rider V-Sync Gesture Detector
Implements geometric rule-based calculations to detect motorcycle hand signals and thumb gestures.
"""

import math
from typing import Dict, List, Optional, Tuple

class GestureDetector:
    def __init__(self, debug=False):
        self.debug = debug
        self.latest_pose_landmarks = None
        
        self.current_gear = 1  
        self.last_gear_input = 0
        self.gear_cooldown = 0

        # Temporal filtering for gesture stability
        self.history_size = 5
        self.left_history = []
        self.hand_history = []
        self.stable_left = False
        self.stop_hold_frames = 0

        self.debug_left_turn = {
            'elbow_angle': 0.0,
            'shoulder_pos': (0, 0),
            'elbow_pos': (0, 0),
            'wrist_pos': (0, 0),
            'confidence': 0.0,
            'reason': "No landmarks detected"
        }

        self.debug_stop = {
            'elbow_score': 0.0,
            'forearm_score': 0.0,
            'upper_arm_score': 0.0,
            'palm_score': 0.0,
            'total_score': 0.0,
            'is_valid': False,
            'reason': "Initializing"
        }
        
        self.debug_right = {
            'elbow_score': 0.0,
            'forearm_score': 0.0,
            'upper_arm_score': 0.0,
            'palm_score': 0.0,
            'total_score': 0.0,
            'is_valid': False,
            'reason': "Initializing"
        }

    def _calculate_elbow_angle(self, sh, el, wr):
        v1_x, v1_y = sh['x_norm'] - el['x_norm'], sh['y_norm'] - el['y_norm']
        v2_x, v2_y = wr['x_norm'] - el['x_norm'], wr['y_norm'] - el['y_norm']
        mag1 = math.hypot(v1_x, v1_y)
        mag2 = math.hypot(v2_x, v2_y)
        if mag1 > 0 and mag2 > 0:
            dot = v1_x * v2_x + v1_y * v2_y
            cos_angle = dot / (mag1 * mag2)
            cos_angle = max(-1.0, min(1.0, cos_angle))
            return math.degrees(math.acos(cos_angle))
        return 0.0

    def detect_pose_gesture(self, landmarks: dict) -> Tuple[Optional[str], float]:
        self.latest_pose_landmarks = landmarks
        
        if not landmarks:
            self._update_left_history('NONE')
            return None, 0.0

        required_joints = ['LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_WRIST']
        if not all(joint in landmarks for joint in required_joints):
            self._update_left_history('NONE')
            return None, 0.0

        low_confidence = any(landmarks[j].get('visibility', 0.0) < 0.5 for j in required_joints)

        ls = landmarks['LEFT_SHOULDER']
        le = landmarks['LEFT_ELBOW']
        lw = landmarks['LEFT_WRIST']

        ls_x, ls_y = ls['x_norm'], ls['y_norm']
        le_x, le_y = le['x_norm'], le['y_norm']
        lw_x, lw_y = lw['x_norm'], lw['y_norm']

        elbow_angle = self._calculate_elbow_angle(ls, le, lw)

        raw_left = 'NONE'
        if not low_confidence:
            # 1. elbow angle > 150
            if elbow_angle > 150.0:
                # 2. arm nearly horizontal
                if abs(lw_y - ls_y) < 0.15:
                    # 3. wrist left of shoulder (on mirrored frame, wrist x is less than shoulder x)
                    if lw_x < ls_x - 0.05:
                        raw_left = 'LEFT'

        # Debug info
        self.debug_left_turn = {
            'elbow_angle': elbow_angle,
            'shoulder_pos': (ls['x'], ls['y']),
            'elbow_pos': (le['x'], le['y']),
            'wrist_pos': (lw['x'], lw['y']),
            'confidence': 1.0 if raw_left == 'LEFT' else 0.0,
            'reason': "Valid" if raw_left == 'LEFT' else "Conditions not met"
        }

        self._update_left_history(raw_left)

        if self.stable_left:
            return 'LEFT', 1.0
        return None, 0.0

    def _update_left_history(self, gesture: str):
        self.left_history.append(gesture)
        if len(self.left_history) > self.history_size:
            self.left_history.pop(0)
        
        if len(self.left_history) == self.history_size and all(g == 'LEFT' for g in self.left_history):
            self.stable_left = True
        else:
            self.stable_left = False

    def detect_hand_gesture(self, hands_data: list) -> Tuple[Optional[str], float]:
        if self.gear_cooldown > 0:
            self.gear_cooldown -= 1

        # Priority 1: Left Turn overrides all hand gestures
        if self.stable_left:
            return None, 0.0

        if not hands_data:
            self._update_hand_history('NONE')
            return None, 0.0

        pose = self.latest_pose_landmarks
        raw_hand = 'NONE'
        score = 0.0

        for hand in hands_data:
            label = hand.get('label', 'Left')
            hand_score = hand.get('score', 1.0)
            landmarks = hand['landmarks']
            if len(landmarks) < 21:
                continue

            sh, el, wr = None, None, None
            if pose:
                if label == 'Left':
                    sh = pose.get('LEFT_SHOULDER')
                    el = pose.get('LEFT_ELBOW')
                    wr = pose.get('LEFT_WRIST')
                else:
                    sh = pose.get('RIGHT_SHOULDER')
                    el = pose.get('RIGHT_ELBOW')
                    wr = pose.get('RIGHT_WRIST')

            has_valid_arm = False
            if sh and el and wr:
                if sh.get('visibility', 0.0) >= 0.5 and el.get('visibility', 0.0) >= 0.5 and wr.get('visibility', 0.0) >= 0.5:
                    has_valid_arm = True

            fingers = self._count_fingers(landmarks, label)

            if has_valid_arm:
                elbow_angle = self._calculate_elbow_angle(sh, el, wr)
                wrist_y = wr['y_norm']
                elbow_y = el['y_norm']
                shoulder_y = sh['y_norm']

                # Right Turn Confidence
                diff_rt = abs(elbow_angle - 90)
                rt_elbow = 30.0 if diff_rt < 40 else max(0.0, 30.0 * (1 - (diff_rt - 40) / 40))
                
                dy_rt = elbow_y - wrist_y
                rt_forearm = 25.0 if dy_rt > 0.05 else (max(0.0, 25.0 * (dy_rt / 0.05)) if dy_rt > 0 else 0.0)

                dy_upper_rt = abs(elbow_y - shoulder_y)
                rt_upper = 20.0 if dy_upper_rt < 0.1 else max(0.0, 20.0 * (1 - (dy_upper_rt - 0.1) / 0.15))

                rt_palm = 25.0 if fingers == 0 else 0.0

                rt_total = rt_elbow + rt_forearm + rt_upper + rt_palm

                # Stop Confidence
                diff_st = abs(elbow_angle - 90)
                st_elbow = 30.0 if diff_st < 50 else max(0.0, 30.0 * (1 - (diff_st - 50) / 40))

                dy_st = wrist_y - elbow_y
                st_forearm = 25.0 if dy_st > 0.05 else (max(0.0, 25.0 * (dy_st / 0.05)) if dy_st > 0 else 0.0)

                dy_upper_st = abs(elbow_y - shoulder_y)
                st_upper = 20.0 if dy_upper_st < 0.15 else max(0.0, 20.0 * (1 - (dy_upper_st - 0.15) / 0.15))

                st_palm = 25.0  # Stop no longer requires open palm

                st_total = st_elbow + st_forearm + st_upper + st_palm

                if rt_total >= 80.0 and rt_total > st_total:
                    raw_hand = 'RIGHT'
                    score = hand_score
                    break
                elif st_total >= 80.0:
                    raw_hand = 'STOP'
                    score = hand_score

                self.debug_right = {
                    'elbow_score': rt_elbow,
                    'forearm_score': rt_forearm,
                    'upper_arm_score': rt_upper,
                    'palm_score': rt_palm,
                    'total_score': rt_total,
                    'is_valid': raw_hand == 'RIGHT',
                    'reason': raw_hand if raw_hand == 'RIGHT' else "Below Threshold"
                }

                self.debug_stop = {
                    'elbow_score': st_elbow,
                    'forearm_score': st_forearm,
                    'upper_arm_score': st_upper,
                    'palm_score': st_palm,
                    'total_score': st_total,
                    'is_valid': raw_hand == 'STOP',
                    'reason': raw_hand if raw_hand == 'STOP' else "Below Threshold"
                }
            else:
                self.debug_right = {
                    'elbow_score': 0.0,
                    'forearm_score': 0.0,
                    'upper_arm_score': 0.0,
                    'palm_score': 0.0,
                    'total_score': 0.0,
                    'is_valid': False,
                    'reason': "No Valid Arm"
                }
                self.debug_stop = {
                    'elbow_score': 0.0,
                    'forearm_score': 0.0,
                    'upper_arm_score': 0.0,
                    'palm_score': 0.0,
                    'total_score': 0.0,
                    'is_valid': False,
                    'reason': "No Valid Arm"
                }

            # Priority 4-7: Gears 1-4
            if raw_hand not in ('RIGHT', 'STOP'):
                if fingers in (1, 2, 3, 4):
                    raw_hand = f"GEAR_{fingers}"
                    score = hand_score

        self._update_hand_history(raw_hand)

        if raw_hand != 'NONE' and len(self.hand_history) == self.history_size and all(g == raw_hand for g in self.hand_history):
            if raw_hand == 'STOP':
                self.stop_hold_frames = 12
            return raw_hand, score

        if self.stop_hold_frames > 0:
            self.stop_hold_frames -= 1
            return 'STOP', 1.0

        return None, 0.0

    def _update_hand_history(self, gesture: str):
        self.hand_history.append(gesture)
        if len(self.hand_history) > self.history_size:
            self.hand_history.pop(0)

    def _count_fingers(self, hand_landmarks: list, label: str) -> int:
        tips = [8, 12, 16, 20]
        count = 0
        for tip in tips:
            if hand_landmarks[tip]['y_norm'] < hand_landmarks[tip - 2]['y_norm']:
                count += 1
                
        if label == 'Left':
            if hand_landmarks[4]['x_norm'] > hand_landmarks[3]['x_norm']:
                count += 1
        else:
            if hand_landmarks[4]['x_norm'] < hand_landmarks[3]['x_norm']:
                count += 1
                
        return count
