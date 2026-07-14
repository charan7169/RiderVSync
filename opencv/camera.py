"""
Rider V-Sync Camera Handler
Handles real-time video capture from the webcam, frame mirroring, and FPS calculation.
"""

import cv2
import time

class CameraHandler:
    def __init__(self, camera_idx=0):
        self.camera_idx = camera_idx
        self.cap = None
        self.fps = 0.0
        self.prev_time = 0.0
        self.is_running = False

    def start_camera(self) -> bool:
        """
        Attempts to open the default camera capture interface.
        """
        try:
            print(f"[CameraHandler] Querying default webcam at index {self.camera_idx}...")
            self.cap = cv2.VideoCapture(self.camera_idx)
            
            # Check if camera opened correctly
            if not self.cap.isOpened():
                print(f"[CameraHandler] Error: Webcam index {self.camera_idx} could not be opened.")
                return False
                
            self.prev_time = time.time()
            self.is_running = True
            print(f"[CameraHandler] Webcam initialized successfully on index {self.camera_idx}.")
            return True
        except Exception as e:
            print(f"[CameraHandler] Critical error during camera startup: {e}")
            self.is_running = False
            return False

    def read_frame(self):
        """
        Reads a frame from the device, mirrors it, and calculates the smoothed FPS.
        """
        if self.cap is None or not self.cap.isOpened():
            return False, None

        ret, frame = self.cap.read()
        if not ret or frame is None:
            # Handle sudden disconnection
            print("[CameraHandler] Frame drop detected. Attempting to recover...")
            return False, None

        # Mirror the video frame horizontally for natural user visual coordination
        frame = cv2.flip(frame, 1)

        # Calculate FPS via exponential smoothing for stable telemetry visualization
        current_time = time.time()
        time_diff = current_time - self.prev_time
        if time_diff > 0:
            instantaneous_fps = 1.0 / time_diff
            self.fps = 0.9 * self.fps + 0.1 * instantaneous_fps
        self.prev_time = current_time

        return True, frame

    def draw_fps(self, frame):
        """
        Draws the calculated FPS on the top-left corner of the frame.
        """
        cv2.putText(
            frame, 
            f"FPS: {self.fps:.1f}", 
            (20, 40), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            0.7, 
            (0, 255, 0), 
            2, 
            cv2.LINE_AA
        )

    def release(self):
        """
        Releases the webcam hardware resource.
        """
        self.is_running = False
        if self.cap:
            try:
                self.cap.release()
            except Exception as e:
                print(f"[CameraHandler] Error while releasing webcam: {e}")
            self.cap = None
            print("[CameraHandler] Webcam stream terminated.")
