# Rider V-Sync Webcam Gesture System

Welcome to the **Rider V-Sync Gesture Controller Integration**! 

This module replaces keyboard input with official motorcycle hand signals and thumb gesture telemetry detected via your default webcam. It captures pose/skeletal nodes and multi-hand joints in real-time, filters out accidental movements, and relays them to the physics-driven motorcycle simulation.

---

## 🚀 Architectural Design Flow

```
+-----------------------------------------------------------+
|                      LOCAL WEBCAM                         |
|  (Captures live frame, horizontal mirroring, FPS tracker)  |
+-----------------------------+-----------------------------+
                              |
                              v [Webcam Video Stream]
+-----------------------------------------------------------+
|                     MEDIAPIPE ENGINES                     |
|  (Pose tracking: Shoulder/Elbow/Wrist | Hands: 21 nodes)  |
+-----------------------------+-----------------------------+
                              |
                              v [Joint Coordinates & Visibilities]
+-----------------------------------------------------------+
|                    GESTURE CLASSIFIERS                    |
|  (Rule-based geometric angle checks & finger fold ratios) |
+-----------------------------+-----------------------------+
                              |
                              v [Raw Detected Gestures]
+-----------------------------------------------------------+
|                     GESTURE FILTERS                       |
|  (Enforces confidence threshold & minimum 300ms hold time)|
+-----------------------------+-----------------------------+
                              |
                              v [Smoothed command actions]
+-----------------------------------------------------------+
|                    TCP SOCKET TRANSMITTER                 |
|  (Relays raw strings e.g. LEFT, RIGHT, STOP on port 5000)  |
+-----------------------------+-----------------------------+
                              |
                              v [Raw Socket Packet]
+-----------------------------------------------------------+
|                  EXPRESS / NODE TELEMETRY GATEWAY         |
|  (Hosts TCP listener at 5000 & WebSocket server at 3000)   |
+-----------------------------+-----------------------------+
                              |
                              v [Secure WebSockets over /ws]
+-----------------------------------------------------------+
|                      REACT FRONTEND                       |
|  (Applies inputs to physics and updates telemetry UI)     |
+-----------------------------------------------------------+
```

---

## 📦 Python Installation & Setup

Before running the webcam gesture gateway, make sure you have Python 3 installed on your local computer, then install the necessary dependencies:

```bash
pip install opencv-python mediapipe numpy
```

---

## 🏍️ How to Run the System

### Step 1: Start the Game
Run the game using the AI Studio development environment or build and run it locally.
* The server will automatically spin up two interfaces:
  * **HTTP + WebSocket Web Gateway** on Port `3000`
  * **Raw TCP Telemetry Server** on Port `5000`

### Step 2: Start the OpenCV Webcam Gateway
Open a new terminal on your local machine and execute the following:

```bash
python opencv/main.py
```

### Step 3: Calibrate and Race!
1. A **CV Calibration Console** window will open displaying your camera feed.
2. Align yourself so that your upper body, left arm, and left hand are clearly visible.
3. Once all checkmarks turn green (Connection, Body Pose, Left Arm, Hand Coordinates, Ambient Lighting) for 2 seconds, the console status will read **READY!**.
4. Press the **SPACEBAR** inside the OpenCV window to lock in calibration and start gameplay synchronization!
5. Perform hand signals to control your bike. The game HUD will display **CV ACTIVE: [GESTURE]** with a cyan pulsing status ring!

---

## 🎛️ Gesture Command Reference

| Gesture | Motorcycle Signal | Physical Conditions | Game Command |
| :--- | :--- | :--- | :--- |
| **LEFT TURN** | Left arm horizontal | Left arm fully extended horizontally straight (elbow angle > 155°). | `LEFT` |
| **RIGHT TURN** | Left arm angled up | Left upper arm horizontal, left elbow bent upward at 90°, forearm vertical upward. | `RIGHT` |
| **STOP** | Left arm angled down | Left upper arm horizontal, left elbow bent downward at 90°, forearm vertical downward. | `STOP` |
| **GEAR UP** | Thumbs Up | Four non-thumb fingers folded, thumb pointing straight vertically up. | `GEAR_UP` |
| **GEAR DOWN** | Thumbs Down | Four non-thumb fingers folded, thumb pointing straight vertically down. | `GEAR_DOWN` |

*Note: When returning your arm/hand to neutral driving posture, a `NEUTRAL` reset is automatically broadcasted to return steering back to centered alignment.*

---

## 📂 Project Structure Map

### `/network`
* **`socket_client.py`**: A raw TCP client wrapper that establishes connections to `127.0.0.1:5000`, implements safety timeouts, and handles automatic socket reconnections.
* **`socket_server.py`**: A standalone Python TCP server supporting multi-threaded client routing to assist in localized testing.

### `/opencv`
* **`camera.py`**: Wraps the OpenCV `VideoCapture` class. Performs natural mirroring, tracks smoothed processing FPS, and renders overlay diagnostics.
* **`pose_detector.py`**: Processes images with MediaPipe Pose, returning relative positions of the head, shoulders, elbows, and wrists, and implements 2D geometric angle formula.
* **`hand_detector.py`**: Tracks 21 coordinates for each hand via MediaPipe Hands to analyze knuckles-to-wrist fold ratios.
* **`gesture_detector.py`**: Evaluates custom geometric rule conditions for standard motorcycle operations.
* **`gesture_filter.py`**: Restricts instant classifications, enforces a minimum `300ms` continuous hold, and debounces signal noise.
* **`calibration.py`**: Checks alignment metrics, assesses ambient light averages, and guides the user into the active frame.
* **`network_client.py`**: Proxy layer connecting the main video capture loop with the socket client.
* **`main.py`**: Main application thread managing frame ingestion, visual HUD renderings, state transitions, and client shutdowns.
