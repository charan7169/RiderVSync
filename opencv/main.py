"""
Rider V-Sync OpenCV Gesture Recognition Gateway
The primary entry point that integrates the webcam, pose/hand trackers, gesture classifiers, filters, and socket transmitter.
"""

import cv2
import time
import os
import sys

# Ensure current directory is in search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from camera import CameraHandler
from pose_detector import PoseDetector
from hand_detector import HandDetector
from gesture_detector import GestureDetector
from gesture_filter import GestureFilter
from calibration import CalibrationManager
from network_client import NetworkClient

def main():
    print("=====================================================================")
    print("       RIDER V-SYNC COMPUTER VISION TELEMETRY DOCK GATEWAY           ")
    print("=====================================================================")

    # 1. Initialize modules
    camera = CameraHandler(camera_idx=0)
    pose_detector = PoseDetector(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    hand_detector = HandDetector(max_num_hands=2, min_detection_confidence=0.5, min_tracking_confidence=0.5)
    gesture_detector = GestureDetector()
    gesture_filter = GestureFilter(min_confidence=0.6, hold_time_ms=300.0)
    calibration = CalibrationManager()
    
    # Socket server operates on port 5000 inside the container/local network
    network = NetworkClient(host='127.0.0.1', port=5000)
    
    print("[Main] Initializing connection to TCP telemetry server...")
    network.connect()

    print("[Main] Initializing camera frame grabber...")
    if not camera.start_camera():
        print("[Main] CRITICAL ERROR: Unable to access default camera interface. Exiting.")
        return

    # Set up OpenCV visual display window
    window_name = "Rider V-Sync CV Gateway Console"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 800, 600)

    in_game_sync_mode = True
    print("[Main] Transitioning to ACTIVE GAME SYNCHRONIZATION!")

    try:
        while True:
            ret, frame = camera.read_frame()
            if not ret or frame is None:
                # Safe frame retry to handle camera fluctuations
                time.sleep(0.01)
                continue

            height, width, _ = frame.shape

            # Extract MediaPipe poses and hand skeletons
            pose_results = pose_detector.process_frame(frame, draw=False)
            hand_results = hand_detector.process_frame(frame, draw=False)

            pose_landmarks = pose_detector.get_landmarks_dict(pose_results, width, height)
            hands_data = hand_detector.get_hands_data(hand_results, width, height)

            # Active gameplay tracking phase
            # Evaluate both pose gesture and thumb signals
            pose_gesture, pose_conf = gesture_detector.detect_pose_gesture(pose_landmarks)
            hand_gesture, hand_conf = gesture_detector.detect_hand_gesture(hands_data)

            # Prioritize hand actions (gear shifts) over steering, or fallback based on visibility
            detected_gesture = "NONE"
            confidence = 0.0

            if hand_gesture:
                detected_gesture = hand_gesture
                confidence = hand_conf
            elif pose_gesture:
                detected_gesture = pose_gesture
                confidence = pose_conf

            # Pass the raw gesture through our 300ms hold smoothing engine
            active_gesture = gesture_filter.filter_gesture(detected_gesture, confidence)

            # Broadcast commands via TCP client
            if active_gesture != "NONE":
                if active_gesture.startswith("GEAR_"):
                    try:
                        g = int(active_gesture.split('_')[1])
                        if g != gesture_detector.current_gear:
                            gesture_detector.current_gear = g
                            network.send_gesture(active_gesture)
                        else:
                            network.send_gesture("NEUTRAL")
                    except ValueError:
                        network.send_gesture(active_gesture)
                else:
                    network.send_gesture(active_gesture)
            else:
                # Release steering/accelerator when neutrally aligned
                network.send_gesture("NEUTRAL")

            cv2.imshow(window_name, frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q') or key == 27:
                print("[Main] Shutdown signal received during sync.")
                break

    except KeyboardInterrupt:
        print("[Main] Gateway terminated manually via console interruption.")
    finally:
        # Resource cleanup
        print("[Main] Cleaning resources and releasing hardware locks...")
        camera.release()
        network.close()
        cv2.destroyAllWindows()
        print("[Main] CV telemetry loop terminated.")

if __name__ == '__main__':
    main()
