# 🏍️ RiderVSync

**AI-Powered Gesture-Based Motorcycle Riding Simulator**

RiderVSync is an educational project that teaches motorcycle riders proper traffic hand signals through an interactive simulation. The system uses **OpenCV** and **MediaPipe** to detect hand gestures from a webcam and communicates with a **Node.js** backend and **React** frontend to control the simulation in real time.

---

# Features

- Real-time hand gesture recognition
- AI-powered computer vision
- Interactive bike riding simulator
- React-based user interface
- Node.js backend
- Educational traffic hand signal training

---

# Technologies

- React.js
- Node.js
- Express.js
- Python
- OpenCV
- MediaPipe
- JavaScript
- HTML
- CSS
- Git & GitHub

---

# Project Structure

```
RiderVSync/
│── network/
│── opencv/
│── server/
│── src/
│── public/
│── package.json
│── package-lock.json
│── README.md
```

---

# Prerequisites

Install the following before running the project:

- Git
- Node.js (LTS)
- npm
- Python 3.12+

Verify installation:

```bash
node -v
npm -v
python --version
git --version
```

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/charan7169/RiderVSync.git
cd RiderVSync
```

## 2. Install Node.js dependencies

```bash
npm install
```

If the backend has a separate package:

```bash
cd server
npm install
```

## 3. Install Python libraries

```bash
pip install opencv-python mediapipe pygame numpy
```

---

# Running the Project

## Start Backend

```bash
cd server
npm start
```

## Start Frontend

```bash
npm start
```

or

```bash
npm run dev
```

## Start Gesture Detection

```bash
python opencv/main.py
```

Replace `main.py` with your actual Python file if it has a different name.

---

# Usage

1. Connect a webcam.
2. Start the backend.
3. Start the frontend.
4. Run the Python gesture detection program.
5. Allow camera access.
6. Perform supported hand gestures.
7. Observe the corresponding bike actions.

---

# System Flow

```
User
   │
   ▼
 Webcam
   │
   ▼
 OpenCV
   │
   ▼
 MediaPipe
   │
   ▼
 Gesture Detection
   │
   ▼
 Node.js Server
   │
   ▼
 React Frontend
   │
   ▼
 Bike Simulation
```

---

# Future Improvements

- Voice commands
- Mobile application
- Multiplayer mode
- Traffic sign recognition
- Eye-blink detection
- Rider analytics

---

# Team

- S. V. Charan Reddy
- Rajath M
- Rohith S
- Rama Krishna
- Sarthak

**Guide:** Divya G

---

# License

This project is intended for educational purposes.
