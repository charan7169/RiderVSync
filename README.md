# 🏍️ Rider V Sync

### AI-Powered Gesture-Based Motorcycle Riding Simulator

> **Rider V Sync** is a computer-vision-powered motorcycle safety training simulator that connects real-time rider gestures to an interactive web simulation.

It uses **Python + OpenCV + MediaPipe** for computer vision and **Node.js + React** for the simulator and telemetry interface.

---

## 🎯 What Rider V Sync Does

- 🖐️ Real-time rider hand-gesture detection
- 🧍 Pose detection with MediaPipe
- 🏍️ Interactive motorcycle simulation
- 🛑 Stop gesture recognition
- ⬅️ Left-turn gesture recognition
- ➡️ Right-turn gesture recognition
- 📊 Gesture confidence filtering
- 💥 Front-vehicle collision scenarios
- ⚙️ Multi-gear speed control
- 🔌 Local TCP telemetry communication
- 🌐 Browser-based simulator interface
- ⚡ One-click Windows startup

---

## 🧩 System Architecture

```text
                         RIDER V SYNC
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ▼                                 ▼
      🐍 COMPUTER VISION                 🌐 WEB APPLICATION
         Python                           React + Node.js
             │                                 │
     OpenCV + MediaPipe                  HTTP / WebSocket
             │                                 │
             └──────────────┬──────────────────┘
                            │
                            ▼
                    🔌 TCP TELEMETRY
                         PORT 5000
                            │
                            ▼
                  🌐 WEB SERVER PORT 3000
                            │
                            ▼
                     Rider V Sync UI
```

| Service | Technology | Port |
|---|---|---:|
| Computer Vision | Python / OpenCV / MediaPipe | — |
| TCP Gateway | Node.js / TypeScript | **5000** |
| Web Application | Node.js / React | **3000** |

---

# 🛠️ Technology Stack

### Computer Vision
- Python 3.12
- OpenCV
- MediaPipe
- NumPy
- Pygame

### Web
- React
- Node.js
- TypeScript
- HTTP / WebSocket communication

### Development
- Git
- GitHub
- npm
- Python virtual environments

---

# 📋 Requirements

### Supported platform
**Windows 10 / Windows 11**

### Required software
- Git
- Node.js LTS
- npm
- **Python 3.12.x**
- Webcam

Verify:

```cmd
git --version
node -v
npm -v
py -3.12 --version
```

> ⚠️ Use Python **3.12** for the current computer-vision stack. The project uses the legacy MediaPipe Solutions API.

---

# 📥 Installation

## 1️⃣ Clone the repository

```cmd
git clone https://github.com/charan7169/RiderVSync.git
cd RiderVSync
```

## 2️⃣ Install Node.js dependencies

```cmd
npm install
```

## 3️⃣ Create the Python 3.12 environment

```cmd
py -3.12 -m venv .venv
```

Activate it:

```cmd
.venv\Scripts\activate
```

You should now see:

```text
(.venv)
```

## 4️⃣ Install Python dependencies

```cmd
python -m pip install --upgrade pip
pip install -r requirements.txt
```

The project uses:

```text
numpy
opencv-python
mediapipe==0.10.21
pygame==2.6.1
```

### Why MediaPipe is pinned

The existing computer-vision code uses:

```python
mp.solutions.pose
```

Therefore the repository pins **MediaPipe 0.10.21** for compatibility.

---

# ⚡ One-Click Run

## ⭐ Recommended

After the first-time installation, you do **not** need to open multiple terminals.

Simply double-click:

```text
start_rider_vsync.bat
```

The launcher starts the required processes and opens the simulator.

### Startup flow

```text
🖱️ Double-click
start_rider_vsync.bat
        │
        ▼
🚀 Start Node.js server
        │
        ├── 🔌 TCP Gateway :5000
        │
        └── 🌐 Web Server :3000
        │
        ▼
🐍 Start Python Computer Vision
        │
        ▼
🌐 Open Rider V Sync
        │
        ▼
🏍️ READY
```

### Website

**http://localhost:3000**

### TCP Gateway

**localhost:5000**

> Keep the terminal windows opened by the launcher running while you use Rider V Sync.

---

# 🖥️ Manual Run

Use manual mode for development or troubleshooting.

### Terminal 1 — Node.js + TCP gateway

From the project root:

```cmd
npm run dev
```

Expected:

```text
[TCP] Server running on port 5000
[HTTP] Server running on http://0.0.0.0:3000
```

### Terminal 2 — Computer Vision

```cmd
.venv\Scripts\activate
python opencv\main.py
```

### Browser

Open:

**http://localhost:3000**

---

# 🎮 How to Use

```text
📷 Webcam
   ↓
🚀 Start Rider V Sync
   ↓
🌐 Open http://localhost:3000
   ↓
🧍 Position yourself in camera view
   ↓
🖐️ Perform supported traffic gestures
   ↓
🏍️ Observe the simulator response
```

For better detection:

- Use good lighting
- Keep your upper body visible
- Keep your hands inside the camera frame
- Avoid strong backlighting
- Keep the webcam stable

---

# 🚦 Supported Rider Signals

| Gesture | Purpose |
|---|---|
| 🛑 STOP | Stop the vehicle |
| ⬅️ LEFT TURN | Indicate a left turn |
| ➡️ RIGHT TURN | Indicate a right turn |

The detection pipeline also uses filtering and confidence logic to reduce false detections.

---

# ⚙️ Gear System

| Gear | Speed Limit |
|---|---:|
| 1️⃣ | 20 km/h |
| 2️⃣ | 40 km/h |
| 3️⃣ | 65 km/h |
| 4️⃣ | 80 km/h |

---

# 📡 Communication Flow

```text
📷 Webcam
   │
   ▼
🟦 OpenCV
   │
   ▼
🟩 MediaPipe
   │
   ▼
🖐️ Gesture / Pose Detection
   │
   ▼
🐍 Python TCP Client
   │
   ▼
🔌 TCP Gateway :5000
   │
   ▼
🟨 Node.js Server
   │
   ▼
⚛️ React UI :3000
   │
   ▼
🏍️ Simulation
```

---

# 📁 Project Structure

```text
RiderVSync/
│
├── opencv/
│   ├── calibration.py
│   ├── camera.py
│   ├── gesture_detector.py
│   ├── gesture_filter.py
│   ├── hand_detector.py
│   ├── main.py
│   ├── network_client.py
│   └── pose_detector.py
│
├── network/
├── src/
├── public/
│
├── server.ts
├── package.json
├── package-lock.json
├── requirements.txt
├── start_rider_vsync.bat
└── README.md
```

---

# 🧪 Verify Installation

Test all Python dependencies:

```cmd
python -c "import pygame, cv2, mediapipe, numpy; print('ALL DEPENDENCIES OK')"
```

Expected:

```text
ALL DEPENDENCIES OK
```

Check MediaPipe:

```cmd
python -c "import mediapipe as mp; print(mp.__version__); print(hasattr(mp, 'solutions'))"
```

Expected:

```text
0.10.21
True
```

---

# 🛠️ Troubleshooting

## ❌ MediaPipe has no `solutions`

Check:

```cmd
pip show mediapipe
```

Install the compatible version:

```cmd
pip uninstall mediapipe -y
pip install mediapipe==0.10.21
```

## ❌ Pygame installation fails

Check Python:

```cmd
python --version
```

It should report **Python 3.12.x**.

Recreate the environment if necessary:

```cmd
rmdir /s /q .venv
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## ❌ TCP gateway timeout

If Python reports:

```text
[SocketClient] Failed to connect to TCP gateway
```

start the Node server:

```cmd
npm run dev
```

Make sure this appears:

```text
[TCP] Server running on port 5000
[HTTP] Server running on http://0.0.0.0:3000
```

Then restart:

```cmd
python opencv\main.py
```

## ❌ Website does not open

Open:

**http://localhost:3000**

and verify that the Node server is running.

---

# 🔄 Quick Start

### First time

```cmd
git clone https://github.com/charan7169/RiderVSync.git
cd RiderVSync
npm install
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Every time after that

**Double-click:**

```text
⭐ start_rider_vsync.bat
```

Then open:

**http://localhost:3000**

---

# 👨‍💻 Project

**Rider V Sync**

**Domain:** Computer Vision • AI • Road Safety • Simulation

**Created by:**  
**S.V. Charan Reddy**

---

# 📜 License

This project is intended for educational and project-development purposes.
