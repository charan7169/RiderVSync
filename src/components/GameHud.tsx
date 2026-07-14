/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { PhysicsState, AppScreen } from '../types';
import { updatePhysics, GEARS } from '../utils/physics';
import { drawTrafficSignalPole } from './TrafficSignalPole';
import { drawSchoolZoneSign } from './SchoolZoneSign';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Compass, 
  Activity, 
  Sliders, 
  Volume2, 
  Pause, 
  Radio, 
  Camera, 
  Zap,
  Gauge,
  Trophy
} from 'lucide-react';

interface GameHudProps {
  isPaused?: boolean;
  onResume?: () => void;
  onPause: () => void;
  onMissionComplete: (stats: { topSpeed: number; distance: number; maxLean: number; safetyRating: string }) => void;
  onMainMenu?: () => void;
  onExit?: () => void;
}

export default function GameHud({ 
  isPaused = false,
  onResume,
  onPause, 
  onMissionComplete, 
  onMainMenu, 
  onExit 
}: GameHudProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation parameters
  const [physics, setPhysics] = useState<PhysicsState>({
    speed: 0,
    speedMs: 0,
    velocity: 0,
    acceleration: 0,
    gear: 1,
    rpm: 1200,
    throttle: 0,
    brake: 0,
    leanAngle: 0,
    targetLeanAngle: 0,
    turningRadius: 9999,
    angularVelocity: 0,
    distanceTraveled: 0,
    mass: 280,
    dragForce: 0,
    frictionForce: 0,
    engineForce: 0,
    laneOffset: 0,
    status: 'Stopped',
  });

  const physicsRef = useRef(physics);
  useEffect(() => {
    physicsRef.current = physics;
  }, [physics]);

  // Traffic & Scoring State
  interface TrafficCar {
    id: number;
    lane: -1 | 1; // -1: Left lane, 1: Right lane
    visualY: number; // Perspective distance (meters)
    speedMs: number;
    defaultSpeedMs?: number;
    color: string;
    overtaken: boolean;
    debugRect?: { x: number; y: number; w: number; h: number };
    isColliding?: boolean;
  }

  interface TrafficSignal {
    id: number;
    distanceMeters: number;
    stopLineDistanceMeters: number;
    state: 'RED' | 'YELLOW_TO_GREEN' | 'GREEN' | 'YELLOW_TO_RED';
    timer: number;
    checkedCompliance: boolean;
    stoppedBonusAwarded: boolean;
    hasStoppedBefore?: boolean;
    distanceAtYellowTransition?: number;
  }

  const TRAFFIC_SIGNAL_CONFIG = {
    SPAWN_INTERVAL: 500,       // Every 500 meters
    STOP_LINE_OFFSET: 15,      // 15 meters before signal
    RED_DURATION: 6.0,
    YELLOW_DURATION: 2.0,
    GREEN_DURATION: 6.0,
    YELLOW_CROSS_THRESHOLD: 15,
    BONUS_STOPPED_CORRECTLY: 100,
    BONUS_PASSED_GREEN: 50,
  };

  const [bonusPoints, setBonusPoints] = useState(0);
  const [activeSignal, setActiveSignal] = useState<TrafficSignal | null>(null);
  
  // School Zone States
  const [showSchoolZoneNotice, setShowSchoolZoneNotice] = useState(false);
  const [schoolZoneBonusAwarded, setSchoolZoneBonusAwarded] = useState(false);
  
  const schoolZoneNoticeTriggeredRef = useRef(false);
  const schoolZoneBonusAwardedRef = useRef(false);
  const schoolZoneNoticeTimerRef = useRef<number | null>(null);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    schoolZoneBonusAwardedRef.current = schoolZoneBonusAwarded;
  }, [schoolZoneBonusAwarded]);

  const [trafficAlert, setTrafficAlert] = useState<{ message: string; color: string } | null>(null);
  const [gameOverTitle, setGameOverTitle] = useState('RIDE CRASHED');
  const [gameOverMessage, setGameOverMessage] = useState('SYSTEM CRITICAL: COLLISION DETECTED');

  const activeSignalRef = useRef<TrafficSignal | null>(null);
  const alertTimeoutRef = useRef<number | null>(null);

  const triggerTrafficAlert = (message: string, color: string) => {
    setTrafficAlert({ message, color });
    if (alertTimeoutRef.current) {
      window.clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = window.setTimeout(() => {
      setTrafficAlert(null);
    }, 2500);
  };

  // Browser-synthesized Audio Feedback (pure Web Audio API, zero file dependencies)
  const playSoundEffect = (type: 'RED' | 'YELLOW' | 'GREEN' | 'VIOLATION' | 'BONUS') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      switch (type) {
        case 'RED': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
          break;
        }
        case 'YELLOW': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
          break;
        }
        case 'GREEN': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046.50, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
          break;
        }
        case 'BONUS': {
          const now = ctx.currentTime;
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.06, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.2);
          });
          break;
        }
        case 'VIOLATION': {
          const now = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(130, now);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(133, now);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.6);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.6);
          osc2.stop(now + 0.6);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to synthesize sound:', err);
    }
  };

  const [overtakesCount, setOvertakesCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Refs for animation thread access (prevents closure stale data & rendering bottleneck)
  const trafficCarsRef = useRef<TrafficCar[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);
  const gameOverRef = useRef(false);
  const debugBikeRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const canvasSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  const [bikeImage, setBikeImage] = useState<HTMLImageElement | null>(null);
  const bikeImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    bikeImageRef.current = bikeImage;
  }, [bikeImage]);

  useEffect(() => {
    const img = new Image();
    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="120" height="150">
  <!-- Rear tire (thick sporty bike tread) -->
  <rect x="46" y="85" width="28" height="60" rx="10" fill="#111111" stroke="#333333" stroke-width="2"/>
  <!-- Tyre treads -->
  <path d="M 46 95 L 60 102 M 74 95 L 60 102 M 46 115 L 60 122 M 74 115 L 60 122 M 46 135 L 60 142 M 74 135 L 60 142" stroke="#22D3EE" stroke-width="2.5" opacity="0.4" fill="none"/>
  
  <!-- Chain & swingarm -->
  <rect x="36" y="80" width="10" height="45" rx="2" fill="#2D3748"/>
  <rect x="74" y="80" width="10" height="45" rx="2" fill="#2D3748"/>
  
  <!-- Exhaust pipe (right side, carbon fiber finish) -->
  <path d="M 80 100 L 92 125" stroke="#1A202C" stroke-width="12" stroke-linecap="round"/>
  <path d="M 81 103 L 90 122" stroke="#4A5568" stroke-width="8" stroke-linecap="round"/>
  <circle cx="92" cy="125" r="5" fill="#1A202C"/>
  <circle cx="92" cy="125" r="3" fill="#E2E8F0"/>

  <!-- Main body chassis (aggressive angles, carbon pattern) -->
  <path d="M 35 45 L 85 45 L 75 90 L 45 90 Z" fill="#1A202C" stroke="#2D3748" stroke-width="2"/>
  
  <!-- Neon accents on chassis -->
  <path d="M 40 52 L 80 52" stroke="#22D3EE" stroke-width="3" opacity="0.8"/>
  <path d="M 43 65 L 77 65" stroke="#007FFF" stroke-width="2.5" opacity="0.6"/>

  <!-- Tail cowl (aerodynamic high-ended tail) -->
  <path d="M 38 28 L 82 28 L 74 50 L 46 50 Z" fill="#2D3748" stroke="#1A202C" stroke-width="1.5"/>
  <path d="M 42 28 Q 60 18 78 28 Z" fill="#1A202C"/>
  
  <!-- Seat cushion -->
  <path d="M 44 42 Q 60 38 76 42 L 72 48 L 48 48 Z" fill="#0D1117"/>

  <!-- Led brake tail light -->
  <rect x="50" y="22" width="20" height="6" rx="2" fill="#aa0000" stroke="#ff3333" stroke-width="1"/>

  <!-- Turn signal stems -->
  <line x1="28" y1="32" x2="38" y2="32" stroke="#4A5568" stroke-width="3"/>
  <line x1="82" y1="32" x2="92" y2="32" stroke="#4A5568" stroke-width="3"/>
  <!-- Signal bulbs -->
  <circle cx="26" cy="32" r="3.5" fill="#D97706"/>
  <circle cx="94" cy="32" r="3.5" fill="#D97706"/>

  <!-- Handlebars structure -->
  <path d="M 15 16 L 45 22 L 75 22 L 105 16" stroke="#4A5568" stroke-width="5" stroke-linecap="round" fill="none"/>
  <!-- Handle grips -->
  <rect x="10" y="11" width="15" height="10" rx="3" fill="#1A202C"/>
  <rect x="95" y="11" width="15" height="10" rx="3" fill="#1A202C"/>
  
  <!-- Side mirrors (angled cyberpunk mirrors) -->
  <path d="M 32 19 L 20 4" stroke="#718096" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M 12 0 L 28 0 L 24 8 L 8 8 Z" fill="#1A202C" stroke="#22D3EE" stroke-width="1.5"/>

  <path d="M 88 19 L 100 4" stroke="#718096" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M 108 0 L 92 0 L 96 8 L 112 8 Z" fill="#1A202C" stroke="#22D3EE" stroke-width="1.5"/>
</svg>
`;
    const svg64 = btoa(unescape(encodeURIComponent(svgString)));
    img.src = `data:image/svg+xml;base64,${svg64}`;
    img.onload = () => {
      setBikeImage(img);
    };
  }, []);

  const [autoShift, setAutoShift] = useState(false);
  const [manualGearInput, setManualGearInput] = useState<number | null>(null);
  const [isGracefulStopping, setIsGracefulStopping] = useState(false);
  const [autoAccelerate, setAutoAccelerate] = useState(true);
  const [activeDuration, setActiveDuration] = useState(0);
  const [maxObservedSpeed, setMaxObservedSpeed] = useState(0);
  const [maxObservedLean, setMaxObservedLean] = useState(0);
  const [wrongBrakeCount, setWrongBrakeCount] = useState(0);

  // Inputs - initialize throttleInput to 1.0 since auto-acceleration is enabled by default
  const [throttleInput, setThrottleInput] = useState(1.0); // 0 to 1
  const [brakeInput, setBrakeInput] = useState(0); // 0 to 1
  const [steerInput, setSteerInput] = useState(0); // -1 to 1

  // Keep refs of input state for the animation loop
  const inputRefs = useRef({
    throttle: 1.0,
    brake: 0,
    steer: 0,
    manualGear: null as number | null,
    autoShift: false,
    isGracefulStopping: false,
    autoAccelerate: true,
  });

  useEffect(() => {
    inputRefs.current = {
      throttle: throttleInput,
      brake: brakeInput,
      steer: steerInput,
      manualGear: manualGearInput,
      autoShift,
      isGracefulStopping,
      autoAccelerate,
    };
  }, [throttleInput, brakeInput, steerInput, manualGearInput, autoShift, isGracefulStopping, autoAccelerate]);

  // Keys state tracker
  useEffect(() => {
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger Pause on Escape
      if (e.key === 'Escape') {
        if (isPausedRef.current) {
          onResume?.();
        } else {
          onPause();
        }
        return;
      }

      if (isPausedRef.current) return;

      keys[e.key.toLowerCase()] = true;

      // Handle direct gear shifts via hotkeys 1-4
      if (['1', '2', '3', '4'].includes(e.key)) {
        setAutoShift(false);
        setManualGearInput(parseInt(e.key));
      }

      // Toggle auto shift
      if (e.key.toLowerCase() === 'g') {
        setAutoShift((prev) => !prev);
        setManualGearInput(null);
      }

      updateInputsFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isPausedRef.current) return;
      keys[e.key.toLowerCase()] = false;
      updateInputsFromKeys();
    };

    const updateInputsFromKeys = () => {
      // If graceful stop is running, keyboard throttle is locked out
      if (inputRefs.current.isGracefulStopping) return;

      let targetThrottle = 0;
      let targetBrake = 0;
      let targetSteer = 0;

      if (keys['w'] || keys['arrowup']) {
        targetThrottle = 1.0;
        setAutoAccelerate(true);
      }
      if (keys['s'] || keys['arrowdown']) {
        targetBrake = 0.8;
        setAutoAccelerate(false);
      }
      if (keys[' '] || keys['spacebar']) {
        targetBrake = 1.0;
        setAutoAccelerate(false);
      }
      if (keys['a'] || keys['arrowleft']) {
        targetSteer = -1.0;
      } else if (keys['d'] || keys['arrowright']) {
        targetSteer = 1.0;
      }

      setThrottleInput(targetThrottle);
      setBrakeInput(targetBrake);
      setSteerInput(targetSteer);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onPause, onResume]);

  // Handle graceful stop trigger (STOP gesture or button)
  const triggerGracefulStop = () => {
    setIsGracefulStopping(true);
    setAutoAccelerate(false);
    setThrottleInput(0);
    // Gradual braking integration
    let brakeLevel = 0.05;
    const interval = setInterval(() => {
      brakeLevel += 0.08;
      if (brakeLevel >= 1.0) {
        brakeLevel = 1.0;
      }
      setBrakeInput(brakeLevel);
      setThrottleInput(0); // keep throttle zeroed

      // Once velocity is essentially 0, clear stop mode and lock in brakes
      if (physicsRef.current.speed < 0.2) {
        clearInterval(interval);
        setIsGracefulStopping(false);
        setBrakeInput(1.0);
      }
    }, 100);
  };

  // Real-time Webcam Gesture WebSocket integration
  const [cvConnectionStatus, setCvConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastCvCommand, setLastCvCommand] = useState<string>('NONE');

  useEffect(() => {
    let ws: globalThis.WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let steeringTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      setCvConnectionStatus('connecting');
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProto}//${window.location.host}/ws`;
      
      console.log(`[WS] Connecting to gesture bridge: ${wsUrl}`);
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] Connected to gesture bridge successfully.');
        setCvConnectionStatus('connected');
      };

      ws.onmessage = (event) => {
        const cmd = event.data.toString().trim();
        if (!cmd) return;

        // Try parsing system json if applicable
        if (cmd.startsWith('{')) {
          try {
            const data = JSON.parse(cmd);
            if (data.type === 'system') {
              console.log('[WS] System msg:', data.message);
              return;
            }
          } catch (e) {}
        }

        if (isPausedRef.current) return;

        console.log(`[WS] Received gesture: ${cmd}`);
        setLastCvCommand(cmd);

        // Handle specific CV gesture inputs
        switch (cmd) {
          case 'LEFT':
            setSteerInput(-1.0);
            setAutoAccelerate(true);
            setBrakeInput(0);
            if (steeringTimeout) clearTimeout(steeringTimeout);
            steeringTimeout = setTimeout(() => {
              setSteerInput(0);
              setLastCvCommand('NONE');
            }, 800);
            break;

          case 'RIGHT':
            setSteerInput(1.0);
            setAutoAccelerate(true);
            setBrakeInput(0);
            if (steeringTimeout) clearTimeout(steeringTimeout);
            steeringTimeout = setTimeout(() => {
              setSteerInput(0);
              setLastCvCommand('NONE');
            }, 800);
            break;

          case 'STOP':
            triggerGracefulStop();
            break;

          case 'GEAR_UP':
            setPhysics((prev) => {
              const targetGear = Math.min(4, prev.gear + 1);
              setAutoShift(false);
              setManualGearInput(targetGear);
              return prev;
            });
            break;

          case 'GEAR_DOWN':
            setPhysics((prev) => {
              const targetGear = Math.max(1, prev.gear - 1);
              setAutoShift(false);
              setManualGearInput(targetGear);
              return prev;
            });
            break;

          case 'GEAR_1':
            setAutoShift(false);
            setManualGearInput(1);
            setPhysics((prev) => ({ ...prev, gear: 1 }));
            break;

          case 'GEAR_2':
            setAutoShift(false);
            setManualGearInput(2);
            setPhysics((prev) => ({ ...prev, gear: 2 }));
            break;

          case 'GEAR_3':
            setAutoShift(false);
            setManualGearInput(3);
            setPhysics((prev) => ({ ...prev, gear: 3 }));
            break;

          case 'GEAR_4':
            setAutoShift(false);
            setManualGearInput(4);
            setPhysics((prev) => ({ ...prev, gear: 4 }));
            break;

          case 'NEUTRAL':
          case 'RELEASE':
            setSteerInput(0);
            break;

          default:
            break;
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected from gesture bridge. Reconnecting in 3s...');
        setCvConnectionStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('[WS] Connection error:', err);
        ws?.close();
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.onclose = null; // disable auto-reconnect on cleanup
        ws.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (steeringTimeout) clearTimeout(steeringTimeout);
    };
  }, []);

  // Duration Active clock
  useEffect(() => {
    if (gameOver || isPaused) return;
    const timer = setInterval(() => {
      setActiveDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, isPaused]);

  // Record Peak Stats Safely (prevents state-update-during-render cycle loops)
  useEffect(() => {
    if (gameOver) return;
    if (physics.speed > maxObservedSpeed) {
      setMaxObservedSpeed(physics.speed);
    }
    const absLean = Math.abs(physics.leanAngle);
    if (absLean > maxObservedLean) {
      setMaxObservedLean(absLean);
    }
  }, [physics.speed, physics.leanAngle, maxObservedSpeed, maxObservedLean, gameOver]);

  // Check and trigger mission success (1500 meters target)
  useEffect(() => {
    if (physics.distanceTraveled >= 1500 && !gameOver) {
      // Grade calculation based on speed and cornering accuracy
      let grade = 'A+';
      if (maxObservedSpeed < 50) grade = 'B';
      else if (maxObservedSpeed >= 50 && maxObservedSpeed < 75) grade = 'A';
      
      onMissionComplete({
        topSpeed: maxObservedSpeed,
        distance: physics.distanceTraveled,
        maxLean: maxObservedLean,
        safetyRating: grade,
      });
    }
  }, [physics.distanceTraveled, maxObservedSpeed, maxObservedLean, onMissionComplete, gameOver]);

  // AI Traffic Spawning & Real-time Update System
  const updateTraffic = (dt: number, now: number) => {
    if (gameOverRef.current) return;
    const currentPhysics = physicsRef.current;
    
    // Only spawn and run traffic once the game has started
    if (currentPhysics.distanceTraveled < 1.0) return;

    // 1. Spawning check: spawn a maximum of two AI cars
    if (trafficCarsRef.current.length < 2) {
      if (now - lastSpawnTimeRef.current > 3000 + Math.random() * 4000) {
        // Cars spawn far ahead on the road (at visualY = 160)
        const lane = Math.random() < 0.5 ? -1 : 1; // Left or right lane
        const speedMs = 12 + Math.random() * 8; // Random stable speed: 43 - 72 km/h
        const colors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        trafficCarsRef.current.push({
          id: Date.now() + Math.random(),
          lane,
          visualY: 160,
          speedMs,
          defaultSpeedMs: speedMs,
          color,
          overtaken: false,
        });
        lastSpawnTimeRef.current = now;
      }
    }

    // Prepare collision constants using actual screen dimensions
    const { width, height } = canvasSizeRef.current;
    const horizonY = height * 0.45;
    const roadW_Bottom = width * 0.85;
    const roadW_Top = width * 0.08;
    const centerBottomX = width / 2 + currentPhysics.leanAngle * 2.5;
    const centerTopX = width / 2;
    const horizonDist = 12;

    const laneShiftX = (currentPhysics.laneOffset || 0) * (roadW_Bottom * 0.4);
    const targetPivotX = (width / 2) + laneShiftX;
    const targetPivotY = height * 0.88;

    const playerNormalizedX = (currentPhysics.laneOffset || 0) * 0.4;
    
    // 2. Positional update and Overtake/Collision detection
    const VISUAL_SPEED_MULTIPLIER = 4.0;
    const playerSpeed = currentPhysics.speedMs;
    const nextTraffic: TrafficCar[] = [];

    trafficCarsRef.current.forEach((car) => {
      const prevVisualY = car.visualY;

      // Update car speed based on traffic signal state
      const sig = activeSignalRef.current;
      let targetSpeed = car.defaultSpeedMs !== undefined ? car.defaultSpeedMs : car.speedMs;

      if (sig) {
        const carWorldDistance = currentPhysics.distanceTraveled + (car.visualY / 4.0);
        const carDistToStopLineMeters = sig.stopLineDistanceMeters - carWorldDistance;

        // If the signal is red/yellow/yellow-green, the car should stop at the stop line
        if (sig.state === 'RED' || sig.state === 'YELLOW_TO_RED' || sig.state === 'YELLOW_TO_GREEN') {
          if (carDistToStopLineMeters > 0 && carDistToStopLineMeters < 45) {
            const stopGap = 4.0; // safe stopping distance before the line
            if (carDistToStopLineMeters <= stopGap) {
              targetSpeed = 0;
            } else {
              const ratio = (carDistToStopLineMeters - stopGap) / (45 - stopGap);
              targetSpeed = (car.defaultSpeedMs || car.speedMs) * ratio;
            }
          }
        }
      }

      // Smoothly update car speed
      const accelRate = 2.5; // realistic acceleration/braking
      car.speedMs += (targetSpeed - car.speedMs) * accelRate * dt;
      if (car.speedMs < 0.1) car.speedMs = 0;

      // Relative velocity dictates whether car gets closer or recedes
      const relSpeedMs = playerSpeed - car.speedMs;
      car.visualY -= relSpeedMs * VISUAL_SPEED_MULTIPLIER * dt;
      const currentVisualY = car.visualY;

      // X-Axis Lateral Collision Check (World Space Normalized)
      const carNormalizedX = car.lane * 0.3;
      const lateralDiff = Math.abs(playerNormalizedX - carNormalizedX);
      const isXCollision = lateralDiff < 0.12;

      // Y-Axis Continuous Collision Check (World Space Distance)
      const minY = Math.min(prevVisualY, currentVisualY);
      const maxY = Math.max(prevVisualY, currentVisualY);
      const isYCollision = minY < 10.0 && maxY > -1.0; 

      if (isXCollision && isYCollision) {
        // Collision detected! Set game state to Game Over.
        setGameOver(true);
        setPhysics((prev) => ({
          ...prev,
          status: 'Crashed',
          speed: 0,
          speedMs: 0,
          velocity: 0,
          acceleration: 0,
          engineForce: 0,
        }));
        // Keep it in array to render the crash frame
        nextTraffic.push(car);
        return;
      }

      // Check successful safe overtake
      if (car.visualY < -3) {
        if (!car.overtaken) {
          car.overtaken = true;
          setOvertakesCount((prev) => prev + 1);
        }
      }

      // Despawn check: remove if too far behind or way too far ahead
      if (car.visualY > -30 && car.visualY < 200) {
        nextTraffic.push(car);
      }
    });

    trafficCarsRef.current = nextTraffic;
  };
  
  const updateTrafficSignal = (dt: number, now: number) => {
    if (gameOverRef.current) return;
    const currentPhysics = physicsRef.current;
    
    // Spawn next signal if we don't have one
    if (!activeSignalRef.current) {
      // Spawn at the next interval of SPAWN_INTERVAL meters ahead of player
      const nextDist = Math.floor((currentPhysics.distanceTraveled + 100) / TRAFFIC_SIGNAL_CONFIG.SPAWN_INTERVAL + 1) * TRAFFIC_SIGNAL_CONFIG.SPAWN_INTERVAL;
      
      activeSignalRef.current = {
        id: Date.now(),
        distanceMeters: nextDist,
        stopLineDistanceMeters: nextDist - TRAFFIC_SIGNAL_CONFIG.STOP_LINE_OFFSET,
        state: 'GREEN',
        timer: TRAFFIC_SIGNAL_CONFIG.GREEN_DURATION,
        checkedCompliance: false,
        stoppedBonusAwarded: false,
      };
      
      setActiveSignal({ ...activeSignalRef.current });
    }

    const sig = activeSignalRef.current;
    if (!sig) return;

    // 1. Tick the signal timer
    sig.timer -= dt;
    if (sig.timer <= 0) {
      if (sig.state === 'RED') {
        sig.state = 'YELLOW_TO_GREEN';
        sig.timer = TRAFFIC_SIGNAL_CONFIG.YELLOW_DURATION;
        playSoundEffect('YELLOW');
      } else if (sig.state === 'YELLOW_TO_GREEN') {
        sig.state = 'GREEN';
        sig.timer = TRAFFIC_SIGNAL_CONFIG.GREEN_DURATION;
        playSoundEffect('GREEN');
      } else if (sig.state === 'GREEN') {
        sig.state = 'YELLOW_TO_RED';
        sig.timer = TRAFFIC_SIGNAL_CONFIG.YELLOW_DURATION;
        sig.distanceAtYellowTransition = sig.stopLineDistanceMeters - currentPhysics.distanceTraveled;
        playSoundEffect('YELLOW');
      } else if (sig.state === 'YELLOW_TO_RED') {
        sig.state = 'RED';
        sig.timer = TRAFFIC_SIGNAL_CONFIG.RED_DURATION;
        playSoundEffect('RED');
      }
    }

    // 2. Continuous Tracking for Stopped Before Stop Line Compliance (Case 3)
    const distToStopLine = sig.stopLineDistanceMeters - currentPhysics.distanceTraveled;
    
    // If player stops (speed = 0) within 30 meters before the stop line during RED or YELLOW phase
    if (distToStopLine > 0 && distToStopLine <= 30 && currentPhysics.speed < 0.2) {
      if (sig.state === 'RED' || sig.state === 'YELLOW_TO_RED' || sig.state === 'YELLOW_TO_GREEN') {
        sig.hasStoppedBefore = true;
      }
    }

    // Award bonus if player stopped correctly and light now turns GREEN
    if (sig.state === 'GREEN' && sig.hasStoppedBefore && !sig.stoppedBonusAwarded) {
      sig.stoppedBonusAwarded = true;
      sig.hasStoppedBefore = false;
      setBonusPoints(prev => prev + TRAFFIC_SIGNAL_CONFIG.BONUS_STOPPED_CORRECTLY);
      playSoundEffect('BONUS');
      triggerTrafficAlert('+100 Compliance Bonus!', '#10b981');
    }

    // 3. Check crossing the stop line (Compliance / Violation check)
    if (currentPhysics.distanceTraveled >= sig.stopLineDistanceMeters && !sig.checkedCompliance) {
      sig.checkedCompliance = true;

      if (sig.state === 'GREEN') {
        setBonusPoints(prev => prev + TRAFFIC_SIGNAL_CONFIG.BONUS_PASSED_GREEN);
        playSoundEffect('BONUS');
        triggerTrafficAlert('+50 Green Light Passed!', '#10b981');
      } else if (sig.state === 'RED') {
        if (currentPhysics.speed > 0.1) {
          playSoundEffect('VIOLATION');
          setGameOverTitle('TRAFFIC RULE VIOLATION');
          setGameOverMessage('RED SIGNAL JUMPED');
          setGameOver(true);
          setPhysics((prev) => ({
            ...prev,
            status: 'Crashed',
            speed: 0,
            speedMs: 0,
            velocity: 0,
            acceleration: 0,
            engineForce: 0,
          }));
        }
      } else if (sig.state === 'YELLOW_TO_RED') {
        const transitionDist = sig.distanceAtYellowTransition !== undefined ? sig.distanceAtYellowTransition : 999;
        if (transitionDist > TRAFFIC_SIGNAL_CONFIG.YELLOW_CROSS_THRESHOLD) {
          playSoundEffect('VIOLATION');
          setGameOverTitle('TRAFFIC RULE VIOLATION');
          setGameOverMessage('YELLOW SIGNAL JUMPED');
          setGameOver(true);
          setPhysics((prev) => ({
            ...prev,
            status: 'Crashed',
            speed: 0,
            speedMs: 0,
            velocity: 0,
            acceleration: 0,
            engineForce: 0,
          }));
        } else {
          triggerTrafficAlert('Crossed Safely on Yellow', '#f59e0b');
        }
      }
    }

    // 4. Despawn signal if player has passed it completely (30 meters past signal)
    if (currentPhysics.distanceTraveled > sig.distanceMeters + 30) {
      activeSignalRef.current = null;
      setActiveSignal(null);
    } else {
      setActiveSignal({ ...sig });
    }
  };

  const updateSchoolZone = (dt: number, now: number) => {
    if (gameOverRef.current) return;
    const currentPhysics = physicsRef.current;
    const dist = currentPhysics.distanceTraveled;

    // 1. Enter School Zone (300m - 400m)
    if (dist >= 300 && dist <= 400) {
      if (!schoolZoneNoticeTriggeredRef.current) {
        schoolZoneNoticeTriggeredRef.current = true;
        setShowSchoolZoneNotice(true);
        playSoundEffect('VIOLATION'); // warning sound
        
        if (schoolZoneNoticeTimerRef.current) {
          window.clearTimeout(schoolZoneNoticeTimerRef.current);
        }
        schoolZoneNoticeTimerRef.current = window.setTimeout(() => {
          setShowSchoolZoneNotice(false);
        }, 3000);
      }

      // 2. Compliance check: Speed <= 50 km/h (with 0.5 km/h tolerance to be user friendly)
      if (currentPhysics.speed > 50.5) {
        playSoundEffect('VIOLATION');
        setGameOverTitle('TRAFFIC RULE VIOLATION');
        setGameOverMessage('Overspeeding in School Zone (Exceeded 50 km/h)');
        setGameOver(true);
        setPhysics((prev) => ({
          ...prev,
          status: 'Crashed',
          speed: 0,
          speedMs: 0,
          velocity: 0,
          acceleration: 0,
          engineForce: 0,
        }));
      }
    }

    // 3. Exit School Zone successfully
    if (dist > 400 && schoolZoneNoticeTriggeredRef.current && !schoolZoneBonusAwardedRef.current) {
      setSchoolZoneBonusAwarded(true);
      schoolZoneBonusAwardedRef.current = true;
      setBonusPoints((prev) => prev + 100);
      playSoundEffect('BONUS');
      triggerTrafficAlert('+100 Safe School Zone Bonus!', '#10b981');
    }
  };

  // Main game physics loop (runs smoothly at up to 60 FPS)
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const gameLoop = (now: number) => {
      // Cap dt to prevent massive physics jumps when tab loses focus
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (isPausedRef.current) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      if (gameOverRef.current) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      setPhysics((prev) => {
        const inputs = inputRefs.current;
        
        let activeThrottle = prev.status === 'Crashed' ? 0 : inputs.throttle;
        let activeBrake = prev.status === 'Crashed' ? 1.0 : inputs.brake;
        
        if (inputs.autoAccelerate && prev.status !== 'Crashed') {
          activeThrottle = 1.0;
          activeBrake = 0.0;
        }

        const next = updatePhysics(
          prev,
          dt,
          activeThrottle,
          activeBrake,
          inputs.steer,
          inputs.manualGear,
          inputs.autoShift
        );

        return next;
      });

      // Update AI Traffic
      updateTraffic(dt, now);

      // Update Traffic Signal Training System
      updateTrafficSignal(dt, now);

      // Update School Zone Training System
      updateSchoolZone(dt, now);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Pre-generate roadside objects for stable 3D scrolling
  const roadsideObjects = React.useMemo(() => {
    const objects: { worldY: number; side: number; type: 'tree' | 'sign' | 'building' | 'light_pole'; color: string }[] = [];
    const objectTypes: ('tree' | 'sign' | 'building' | 'light_pole')[] = ['tree', 'building', 'light_pole', 'sign'];
    const colors = {
      tree: ['#047857', '#065f46', '#0f766e'],
      building: ['#1e293b', '#0f172a', '#334155'],
      light_pole: ['#475569', '#334155'],
      sign: ['#d97706', '#2563eb', '#dc2626'],
    };

    // Generate trees, signs, skyscrapers, and light poles along a 2000 meter cycle
    for (let m = 0; m < 2000; m += 30) {
      const side = m % 60 === 0 ? -1 : (m % 90 === 0 ? 1 : (m % 150 === 0 ? 1 : -1));
      const type = objectTypes[(m / 30) % objectTypes.length];
      const colorList = colors[type];
      const color = colorList[m % colorList.length];
      objects.push({ worldY: m, side, type, color });
    }
    return objects;
  }, []);

  // Draw simulation to the Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    canvasSizeRef.current = { width, height };

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
        canvasSizeRef.current = { width, height };
      }
    };
    window.addEventListener('resize', handleResize);

    // Simple building structures to render in background
    interface Building {
      x: number;
      width: number;
      height: number;
      color: string;
    }

    const buildings: Building[] = [
      { x: 50, width: 80, height: 180, color: '#16191c' },
      { x: 150, width: 120, height: 260, color: '#1c1f24' },
      { x: 320, width: 90, height: 220, color: '#181a1f' },
      { x: 450, width: 140, height: 310, color: '#15171a' },
      { x: 620, width: 70, height: 140, color: '#191b20' },
      { x: 740, width: 100, height: 240, color: '#1a1c22' },
    ];

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      const currentPhysics = physicsRef.current;
      const VISUAL_SPEED_MULTIPLIER = 4.0;
      const visualDist = currentPhysics.distanceTraveled * VISUAL_SPEED_MULTIPLIER;
      const horizonDist = 12;

      // 1. SKY / BACKGROUND HORIZON
      const gradSky = ctx.createLinearGradient(0, 0, 0, height * 0.45);
      gradSky.addColorStop(0, '#0a0b0d');
      gradSky.addColorStop(0.6, '#131518');
      gradSky.addColorStop(1, '#1b2126');
      ctx.fillStyle = gradSky;
      ctx.fillRect(0, 0, width, height * 0.45);

      // Draw distant city skyline
      buildings.forEach((b) => {
        ctx.fillStyle = b.color;
        // Shift skyline slightly relative to lean angle for visual sway
        const leanShift = currentPhysics.leanAngle * 1.5;
        ctx.fillRect(b.x + leanShift, height * 0.45 - b.height, b.width, b.height);

        // draw windows
        ctx.fillStyle = '#007FFF';
        ctx.globalAlpha = 0.1;
        for (let wy = height * 0.45 - b.height + 20; wy < height * 0.45 - 10; wy += 30) {
          for (let wx = b.x + leanShift + 10; wx < b.x + leanShift + b.width - 15; wx += 20) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
        ctx.globalAlpha = 1.0;
      });

      // Horizon glow line
      ctx.strokeStyle = '#007FFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      ctx.lineTo(width, height * 0.45);
      ctx.stroke();

      // 2. THE HIGHWAY ROAD (3D perspective grid lines)
      const horizonY = height * 0.45;
      const roadW_Bottom = width * 0.85;
      const roadW_Top = width * 0.08;
      const centerBottomX = width / 2 + currentPhysics.leanAngle * 2.5; // road sway offset when leaning
      const centerTopX = width / 2;

      // Draw Ground Side Grass (Background Base)
      ctx.fillStyle = '#051009'; // deep cyber-grass green
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Draw Scrolling Side Grass Bands (motion lines on grassy sides)
      const grassBandCycle = 24; // meters
      const startGrassBand = Math.floor(visualDist / grassBandCycle) * grassBandCycle;
      for (let worldPos = startGrassBand; worldPos < visualDist + 160; worldPos += grassBandCycle) {
        const d1 = worldPos - visualDist;
        const d2 = d1 + grassBandCycle / 2;
        if (d1 < 0.1) continue;
        
        const r1 = horizonDist / (d1 + horizonDist);
        const r2 = horizonDist / (d2 + horizonDist);
        
        const y1 = horizonY + r1 * (height - horizonY);
        const y2 = horizonY + r2 * (height - horizonY);
        
        // Slightly lighter green band
        ctx.fillStyle = '#0a2313';
        
        // Left grass band
        ctx.beginPath();
        ctx.moveTo(0, y1);
        ctx.lineTo(0, y2);
        const rw2 = roadW_Top + r2 * (roadW_Bottom - roadW_Top);
        const c2 = centerTopX + r2 * (centerBottomX - centerTopX);
        ctx.lineTo(c2 - rw2/2 - 20 * r2, y2);
        const rw1 = roadW_Top + r1 * (roadW_Bottom - roadW_Top);
        const c1 = centerTopX + r1 * (centerBottomX - centerTopX);
        ctx.lineTo(c1 - rw1/2 - 20 * r1, y1);
        ctx.closePath();
        ctx.fill();
        
        // Right grass band
        ctx.beginPath();
        ctx.moveTo(width, y1);
        ctx.lineTo(width, y2);
        ctx.lineTo(c2 + rw2/2 + 20 * r2, y2);
        ctx.lineTo(c1 + rw1/2 + 20 * r1, y1);
        ctx.closePath();
        ctx.fill();
      }

      // Draw Sidewalks (Concrete shoulder strips running beside the road edge)
      ctx.fillStyle = '#1e293b'; // slate concrete
      ctx.beginPath();
      ctx.moveTo(centerTopX - roadW_Top / 2, horizonY);
      ctx.lineTo(centerTopX - roadW_Top / 2 - 4, horizonY);
      ctx.lineTo(centerBottomX - roadW_Bottom / 2 - 35, height);
      ctx.lineTo(centerBottomX - roadW_Bottom / 2, height);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerTopX + roadW_Top / 2, horizonY);
      ctx.lineTo(centerTopX + roadW_Top / 2 + 4, horizonY);
      ctx.lineTo(centerBottomX + roadW_Bottom / 2 + 35, height);
      ctx.lineTo(centerBottomX + roadW_Bottom / 2, height);
      ctx.closePath();
      ctx.fill();

      // Draw Alternating Curbs (Rumble strips) along the asphalt boundaries
      const curbCycle = 8; // meters
      const startCurbDist = Math.floor(visualDist / curbCycle) * curbCycle;
      for (let worldPos = startCurbDist; worldPos < visualDist + 160; worldPos += curbCycle) {
        const d1 = worldPos - visualDist;
        const d2 = d1 + curbCycle / 2;
        if (d1 < 0.1) continue;
        
        const r1 = horizonDist / (d1 + horizonDist);
        const r2 = horizonDist / (d2 + horizonDist);
        
        const y1 = horizonY + r1 * (height - horizonY);
        const y2 = horizonY + r2 * (height - horizonY);
        
        const rw1 = roadW_Top + r1 * (roadW_Bottom - roadW_Top);
        const rw2 = roadW_Top + r2 * (roadW_Bottom - roadW_Top);
        
        const c1 = centerTopX + r1 * (centerBottomX - centerTopX);
        const c2 = centerTopX + r2 * (centerBottomX - centerTopX);
        
        const isRed = Math.floor(worldPos / (curbCycle / 2)) % 2 === 0;
        ctx.fillStyle = isRed ? '#ef4444' : '#f8fafc'; // alternating red and white
        
        // Left curb
        ctx.beginPath();
        ctx.moveTo(c1 - rw1/2, y1);
        ctx.lineTo(c2 - rw2/2, y2);
        ctx.lineTo(c2 - rw2/2 - 6 * r2, y2);
        ctx.lineTo(c1 - rw1/2 - 6 * r1, y1);
        ctx.closePath();
        ctx.fill();
        
        // Right curb
        ctx.beginPath();
        ctx.moveTo(c1 + rw1/2, y1);
        ctx.lineTo(c2 + rw2/2, y2);
        ctx.lineTo(c2 + rw2/2 + 6 * r2, y2);
        ctx.lineTo(c1 + rw1/2 + 6 * r1, y1);
        ctx.closePath();
        ctx.fill();
      }

      // Draw perspective road pavement
      ctx.fillStyle = '#0f1115'; // charcoal black pavement
      ctx.beginPath();
      ctx.moveTo(centerTopX - roadW_Top / 2, horizonY);
      ctx.lineTo(centerTopX + roadW_Top / 2, horizonY);
      ctx.lineTo(centerBottomX + roadW_Bottom / 2, height);
      ctx.lineTo(centerBottomX - roadW_Bottom / 2, height);
      ctx.closePath();
      ctx.fill();

      // Highway side guard rails / neon outlines (cyan borders)
      ctx.strokeStyle = '#00fbfb';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerTopX - roadW_Top / 2, horizonY);
      ctx.lineTo(centerBottomX - roadW_Bottom / 2, height);
      ctx.moveTo(centerTopX + roadW_Top / 2, horizonY);
      ctx.lineTo(centerBottomX + roadW_Bottom / 2, height);
      ctx.stroke();

      // PERSPECTIVE HORIZONTAL DASHED LINES (SCROLLING GRID)
      ctx.strokeStyle = 'rgba(0, 127, 255, 0.25)';
      ctx.lineWidth = 1;
      
      const gridSpacingMeters = 10;
      const startGridDist = Math.floor(visualDist / gridSpacingMeters) * gridSpacingMeters;
      
      for (let worldPos = startGridDist; worldPos < visualDist + 150; worldPos += gridSpacingMeters) {
        const d = worldPos - visualDist;
        if (d < 0.1) continue;
        
        const r = horizonDist / (d + horizonDist); // 0 at horizon, 1 at bottom
        
        const y = horizonY + r * (height - horizonY);
        const currentRoadW = roadW_Top + r * (roadW_Bottom - roadW_Top);
        const currentCenterX = centerTopX + r * (centerBottomX - centerTopX);

        ctx.beginPath();
        ctx.moveTo(currentCenterX - currentRoadW / 2, y);
        ctx.lineTo(currentCenterX + currentRoadW / 2, y);
        ctx.stroke();
      }

      // CENTER ROAD SEPARATOR YELLOW DASHED LINES (SCROLLING)
      const dashCycle = 10; // meters (4m dash, 6m gap)
      const startDashDist = Math.floor(visualDist / dashCycle) * dashCycle;
      
      for (let worldPos = startDashDist; worldPos < visualDist + 150; worldPos += dashCycle) {
        const d1 = worldPos - visualDist;
        const d2 = d1 + 4; // 4 meters long dash
        
        if (d1 < 0.1) continue;
        
        const r1 = horizonDist / (d1 + horizonDist);
        const r2 = horizonDist / (d2 + horizonDist);
        
        const y1 = horizonY + r1 * (height - horizonY);
        const y2 = horizonY + r2 * (height - horizonY);
        
        const c1 = centerTopX + r1 * (centerBottomX - centerTopX);
        const c2 = centerTopX + r2 * (centerBottomX - centerTopX);
        
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1 + r1 * 5;
        ctx.beginPath();
        ctx.moveTo(c1, y1);
        ctx.lineTo(c2, y2);
        ctx.stroke();
      }

      // 2.5 DRAW WHITE STOP LINE FOR TRAFFIC SIGNALS
      const currentSignal = activeSignalRef.current;
      if (currentSignal) {
        const stopLineD = (currentSignal.stopLineDistanceMeters - currentPhysics.distanceTraveled) * 4.0;
        if (stopLineD > -25.0 && stopLineD < 160) {
          ctx.save();
          ctx.fillStyle = 'rgba(240, 240, 240, 0.95)'; // bright clean asphalt line white
          
          // Draw a nice 3D perspective quad
          const r1 = horizonDist / Math.max(1.0, stopLineD + horizonDist);
          const r2 = horizonDist / Math.max(1.0, stopLineD + 2.5 + horizonDist); // 2.5 visual meters thick
          
          const y1 = horizonY + r1 * (height - horizonY);
          const y2 = horizonY + r2 * (height - horizonY);
          
          const rw1 = roadW_Top + r1 * (roadW_Bottom - roadW_Top);
          const rw2 = roadW_Top + r2 * (roadW_Bottom - roadW_Top);
          
          const c1 = centerTopX + r1 * (centerBottomX - centerTopX);
          const c2 = centerTopX + r2 * (centerBottomX - centerTopX);
          
          ctx.beginPath();
          ctx.moveTo(c1 - rw1 / 2, y1);
          ctx.lineTo(c1 + rw1 / 2, y1);
          ctx.lineTo(c2 + rw2 / 2, y2);
          ctx.lineTo(c2 - rw2 / 2, y2);
          ctx.closePath();
          ctx.fill();
          
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          ctx.restore();
        }
      }

      // 2.6 DRAW YELLOW LINE FOR SCHOOL ZONE (Exactly at 300 meters)
      const schoolStartLineD = (300 - currentPhysics.distanceTraveled) * 4.0;
      if (schoolStartLineD > -25.0 && schoolStartLineD < 160) {
        ctx.save();
        ctx.fillStyle = 'rgba(239, 180, 0, 0.95)'; // glowing bright warning yellow
        
        // Draw a nice 3D perspective quad
        const r1 = horizonDist / Math.max(1.0, schoolStartLineD + horizonDist);
        const r2 = horizonDist / Math.max(1.0, schoolStartLineD + 2.5 + horizonDist); // 2.5 visual meters thick
        
        const y1 = horizonY + r1 * (height - horizonY);
        const y2 = horizonY + r2 * (height - horizonY);
        
        const rw1 = roadW_Top + r1 * (roadW_Bottom - roadW_Top);
        const rw2 = roadW_Top + r2 * (roadW_Bottom - roadW_Top);
        
        const c1 = centerTopX + r1 * (centerBottomX - centerTopX);
        const c2 = centerTopX + r2 * (centerBottomX - centerTopX);
        
        ctx.beginPath();
        ctx.moveTo(c1 - rw1 / 2, y1);
        ctx.lineTo(c1 + rw1 / 2, y1);
        ctx.lineTo(c2 + rw2 / 2, y2);
        ctx.lineTo(c2 - rw2 / 2, y2);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(239, 180, 0, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      }

      // 3. ROADSIDE DYNAMIC PERSPECTIVE OBJECTS
      const trackLength = 2000;
      roadsideObjects.forEach((obj) => {
        let d = (obj.worldY - visualDist) % trackLength;
        if (d < 0) d += trackLength;
        
        if (d > 160 || d < 0.1) return;
        
        const horizonDist = 12;
        const r = horizonDist / (d + horizonDist);
        
        const y = horizonY + r * (height - horizonY);
        const roadW = roadW_Top + r * (roadW_Bottom - roadW_Top);
        const centerX = centerTopX + r * (centerBottomX - centerTopX);
        
        // Put objects slightly outside the guard rail
        const xOffset = obj.side * (roadW / 2 + 30 * r);
        const x = centerX + xOffset;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(r, r);
        
        if (obj.type === 'tree') {
          // Trunk
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-5, -12, 10, 12);
          // Foliage
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          ctx.moveTo(0, -50);
          ctx.lineTo(-22, -20);
          ctx.lineTo(22, -20);
          ctx.closePath();
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(0, -35);
          ctx.lineTo(-18, -10);
          ctx.lineTo(18, -10);
          ctx.closePath();
          ctx.fill();
        } else if (obj.type === 'light_pole') {
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -80);
          ctx.quadraticCurveTo(0, -95, obj.side * 22, -95);
          ctx.stroke();
          
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(obj.side * 22, -95, 5, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = 'rgba(254, 240, 138, 0.1)';
          ctx.beginPath();
          ctx.moveTo(obj.side * 22, -95);
          ctx.lineTo(obj.side * 40, 0);
          ctx.lineTo(obj.side * 4, 0);
          ctx.closePath();
          ctx.fill();
        } else if (obj.type === 'sign') {
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -35);
          ctx.stroke();
          
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          ctx.moveTo(-12, -35);
          ctx.lineTo(0, -47);
          ctx.lineTo(12, -35);
          ctx.lineTo(0, -23);
          ctx.closePath();
          ctx.fill();
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          if (obj.side < 0) {
            ctx.moveTo(4, -35);
            ctx.lineTo(-4, -35);
            ctx.lineTo(-1, -38);
            ctx.moveTo(-4, -35);
            ctx.lineTo(-1, -32);
          } else {
            ctx.moveTo(-4, -35);
            ctx.lineTo(4, -35);
            ctx.lineTo(1, -38);
            ctx.moveTo(4, -35);
            ctx.lineTo(1, -32);
          }
          ctx.stroke();
        } else if (obj.type === 'building') {
          ctx.fillStyle = obj.color;
          const bW = 50;
          const bH = 130;
          ctx.fillRect(obj.side < 0 ? -bW : 0, -bH, bW, bH);
          
          ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
          for (let wy = -bH + 12; wy < -10; wy += 22) {
            for (let wx = (obj.side < 0 ? -bW + 8 : 8); wx < (obj.side < 0 ? -8 : bW - 8); wx += 12) {
              if ((wy + wx) % 3 === 0) {
                ctx.fillRect(wx, wy, 5, 8);
               }
            }
          }
        }
        
        ctx.restore();
      });

      // 3.4 DRAW TRAFFIC SIGNAL POLE AND LIGHTS
      if (currentSignal) {
        drawTrafficSignalPole({
          ctx,
          activeSignal: currentSignal,
          currentPhysics,
          canvasWidth: width,
          canvasHeight: height,
          horizonY,
          horizonDist,
          roadW_Top,
          roadW_Bottom,
          centerTopX,
          centerBottomX,
        });
      }

      // 3.4.1 DRAW SCHOOL ZONE ROADSIDE SIGN (Static pole at 300 meters)
      drawSchoolZoneSign({
        ctx,
        distanceMeters: 300,
        currentPhysics,
        canvasWidth: width,
        canvasHeight: height,
        horizonY,
        horizonDist,
        roadW_Top,
        roadW_Bottom,
        centerTopX,
        centerBottomX,
      });

      // 3.5 DRAW TRAFFIC CARS WITH 3D PERSPECTIVE
      trafficCarsRef.current.forEach((car) => {
        const d = car.visualY;
        // Only draw if within visible range
        if (d > 160 || d < -25) return;
        
        const horizonDist = 12;
        const r = horizonDist / (d + horizonDist);
        
        const y = horizonY + r * (height - horizonY);
        const currentRoadW = roadW_Top + r * (roadW_Bottom - roadW_Top);
        const currentCenterX = centerTopX + r * (centerBottomX - centerTopX);
        
        // Car's lane is either -1 (left) or 1 (right)
        // Let's place the centers of left and right lanes at -0.3 and 0.3 relative to road width
        const carX = currentCenterX + car.lane * 0.3 * currentRoadW;
        
        ctx.save();
        ctx.translate(carX, y);
        
        // Make cars generally 1.8x larger, and prevent them from becoming microscopic at a distance (min scale 0.18)
        const carScale = Math.max(0.18, r * 1.8);
        ctx.scale(carScale, carScale);

        // Cyber-sporty futuristic rear view of the car
        const carWidth = 96;
        const carHeight = 64;

        // Tires
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(-carWidth / 2 + 10, -12, 18, 14);
        ctx.fillRect(carWidth / 2 - 28, -12, 18, 14);

        // Underglow matching the chassis color
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = car.color;
        ctx.fillStyle = car.color;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(-carWidth / 2 + 15, -6, carWidth - 30, 4);
        ctx.restore();

        // Main chassis body
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.moveTo(-carWidth / 2, -10);
        ctx.lineTo(-carWidth / 2 + 6, -36);
        ctx.lineTo(-carWidth / 2 + 20, -42);
        ctx.lineTo(carWidth / 2 - 20, -42);
        ctx.lineTo(carWidth / 2 - 6, -36);
        ctx.lineTo(carWidth / 2, -10);
        ctx.closePath();
        ctx.fill();
        
        // Edge contrast border
        ctx.strokeStyle = '#05070a';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Cabin / Rear Window
        ctx.fillStyle = '#0a101d';
        ctx.beginPath();
        ctx.moveTo(-carWidth / 2 + 18, -42);
        ctx.lineTo(-carWidth / 2 + 26, -62);
        ctx.lineTo(carWidth / 2 - 26, -62);
        ctx.lineTo(carWidth / 2 - 18, -42);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Window sheen
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-carWidth / 2 + 24, -46);
        ctx.lineTo(-carWidth / 2 + 30, -58);
        ctx.stroke();

        // Spoiler
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-carWidth / 2 + 4, -62, carWidth - 8, 3);
        ctx.fillStyle = car.color;
        ctx.fillRect(-carWidth / 2 + 2, -66, carWidth - 4, 4);

        // Bumper area
        ctx.fillStyle = '#111827';
        ctx.fillRect(-carWidth / 2 + 8, -22, carWidth - 16, 12);

        // LED Neon Taillights (Thicker and with brighter neon light-bar style)
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ff0000'; // Pure radiant red
        ctx.fillRect(-carWidth / 2 + 8, -34, 22, 6);
        ctx.fillRect(carWidth / 2 - 30, -34, 22, 6);
        
        // Taillight inner core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-carWidth / 2 + 12, -32, 14, 2);
        ctx.fillRect(carWidth / 2 - 26, -32, 14, 2);
        ctx.restore();

        // License Plate
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(-10, -18, 20, 8);
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VSYNC', 0, -12);

        ctx.restore();
      });

      // 4. MOTORCYCLE REAR-VIEW PNG SPRITE (CENTER BOTTOM WITH LEAN)
      ctx.save();
      const laneShiftX = (currentPhysics.laneOffset || 0) * (roadW_Bottom * 0.4);
      const targetPivotX = (width / 2) + laneShiftX;
      const targetPivotY = height * 0.88;
      
      ctx.translate(targetPivotX, targetPivotY);
      ctx.rotate(((currentPhysics.leanAngle || 0) * Math.PI) / 180);

      const bikeImg = bikeImageRef.current;
      if (bikeImg) {
        // Draw centered horizontally with the bottom of tires exactly at (0, 0)
        ctx.drawImage(bikeImg, -60, -145, 120, 150);
      } else {
        // High quality fallback
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(-20, -100, 40, 100);
      }

      // Exhaust blue flame effect (reactive to throttle when moving)
      if (currentPhysics.throttle > 0.15 && currentPhysics.speed > 1) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#22d3ee';
        ctx.fillStyle = '#22d3ee';
        const flameLength = 15 + Math.random() * 20;
        ctx.beginPath();
        // Exhaust nozzle is at around x = 32, y = -30
        ctx.moveTo(32, -30);
        ctx.lineTo(32 + (Math.random() - 0.5) * 5, -30 + flameLength);
        ctx.lineTo(26, -30);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowColor = '#fb7185';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(31, -30);
        ctx.lineTo(31, -30 + flameLength * 0.65);
        ctx.lineTo(27, -30);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Brake light glow (when braking)
      if (currentPhysics.brake > 0.15) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -128, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Left Turn Signal Flash
      if (currentPhysics.leanAngle < -1) {
        if (Math.floor(Date.now() / 300) % 2 === 0) {
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#f59e0b';
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(-34, -118, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Right Turn Signal Flash
      if (currentPhysics.leanAngle > 1) {
        if (Math.floor(Date.now() / 300) % 2 === 0) {
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#f59e0b';
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(34, -118, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();
    };

    let animId: number;
    const loop = () => {
      drawFrame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const gearSpec = GEARS[physics.gear] || GEARS[1];
  const currentScore = overtakesCount * 500 + Math.floor(physics.distanceTraveled * 1.5) + bonusPoints;

  return (
    <div className="relative w-screen h-screen bg-[#0a0b0d] text-[#e2e2e2] overflow-hidden select-none animate-fade-in">
      
      {/* 2. THE MAIN SIMULATION ROAD CANVAS */}
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* SCALED HUD CONTAINER (0.8x scaled) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none origin-top-left scale-[0.8] w-[calc(125vw-40px)] flex flex-col gap-3">
        <div className="pointer-events-auto flex flex-col gap-4">
          
          {/* 1. TOP STATS STATUS RIBBON */}
          <header className="relative flex items-center justify-between gap-4 border border-white/10 bg-[#16181a]/30 backdrop-blur-md rounded-xl p-4 shadow-xl">
            {/* Left segment */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  physics.status === 'Redlining' ? 'bg-red-500 animate-ping' : 
                  physics.status === 'Accelerating' ? 'bg-[#00fbfb] animate-pulse' : 'bg-emerald-400'
                }`} />
                <span className="font-mono text-xs font-bold tracking-widest text-[#00fbfb] uppercase">
                  STATUS: {physics.status}
                </span>
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="font-mono text-xs text-[#c1c6d7] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#007FFF]" />
                <span>CIRCUIT RANGE: {Math.round(physics.distanceTraveled)} / 1500 m</span>
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="font-mono text-xs text-[#c1c6d7] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>SCORE: <strong className="text-white">{currentScore}</strong></span>
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="font-mono text-xs text-[#c1c6d7] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>OVERTAKES: <strong className="text-white">{overtakesCount}</strong></span>
              </div>
            </div>

            {/* Center Title */}
            <div className="hidden xl:block text-center">
              <h1 className="font-sans font-black tracking-[0.15em] text-[#e2e2e2] text-sm">
                RIDER V-SYNC DOCK
              </h1>
            </div>

            {/* Right segment */}
            <div className="flex items-center gap-4">
              <div className="font-mono text-xs flex items-center gap-2 border border-white/10 bg-black/40 px-3 py-1.5 rounded-lg">
                <span className={`w-2 h-2 rounded-full ${
                  cvConnectionStatus === 'connected' ? 'bg-[#00fbfb] animate-pulse' :
                  cvConnectionStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#c1c6d7]">
                  {cvConnectionStatus === 'connected' ? `CV ACTIVE: ${lastCvCommand}` :
                   cvConnectionStatus === 'connecting' ? 'CV CONNECTING' : 'CV OFFLINE'}
                </span>
              </div>
              <div className="font-mono text-xs text-white">
                ELAPSED: <span className="font-bold text-[#00fbfb]">{activeDuration}s</span>
              </div>
              <button
                id="hud-pause-button"
                onClick={onPause}
                className="p-2 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-[#c1c6d7] hover:text-white transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* 3. TOP DASHBOARD TELETEX BAR */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-4">
            
            {/* LEFT COMPONENT: DIAL GAUGES (SPEED & RPM & GEAR) & CONTROL INTERFACE */}
            <div className="w-full max-w-lg md:max-w-xl bg-[#16181a]/25 border border-white/10 rounded-xl p-4 backdrop-blur-md shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00fbfb]/30 to-transparent" />
              
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Speed block */}
                <div className="col-span-4 text-center border-r border-white/5 pr-4">
                  <span className="font-mono text-[9px] text-[#c1c6d7] opacity-60 uppercase block">VELOCITY</span>
                  <div className="font-sans font-black text-3xl md:text-4xl text-white tracking-wide mt-1">
                    {Math.round(physics.speed)}
                  </div>
                  <span className="font-mono text-[10px] text-[#00fbfb] font-bold tracking-widest block mt-0.5">km/h</span>
                </div>

                {/* RPM Dial representation */}
                <div className="col-span-5 border-r border-white/5 pr-4 flex flex-col justify-center">
                  <span className="font-mono text-[9px] text-[#c1c6d7] opacity-60 uppercase block">ENGINE SPEED</span>
                  <div className="font-mono text-xs text-white font-bold tracking-wide mt-1">
                    {physics.rpm} <span className="opacity-50 font-normal">RPM</span>
                  </div>
                  {/* Dynamic progress block for RPM */}
                  <div className="w-full h-2 bg-white/5 border border-white/5 rounded-full overflow-hidden mt-2 relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-100 ${
                        physics.rpm >= 9500 
                          ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]' 
                          : 'bg-gradient-to-r from-[#007FFF] to-[#00fbfb]'
                      }`} 
                      style={{ width: `${(physics.rpm / 11500) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Gear mapping indicator */}
                <div className="col-span-3 text-center">
                  <span className="font-mono text-[9px] text-[#c1c6d7] opacity-60 uppercase block">GEAR</span>
                  <div className="font-sans font-black text-3xl text-[#00fbfb] mt-1">
                    {physics.gear}
                  </div>
                  <span className="font-mono text-[8px] text-[#c1c6d7] opacity-40 uppercase block">MAX {gearSpec.maxSpeedKmH} km/h</span>
                </div>
              </div>

              {/* Quick status row */}
              <div className="border-t border-white/5 mt-3 pt-2 flex items-center justify-between text-[10px] font-mono text-[#c1c6d7]">
                <div className="flex items-center gap-4">
                  <span>WHEEL ANG: <strong className="text-white">{physics.angularVelocity.toFixed(1)} rad/s</strong></span>
                  <span>TURN RAD: <strong className="text-white">{physics.turningRadius > 1000 ? '∞' : `${physics.turningRadius.toFixed(1)} m`}</strong></span>
                </div>
                <span>BIKE LEAN: <strong className={Math.abs(physics.leanAngle) > 35 ? 'text-amber-400' : 'text-white'}>{physics.leanAngle}°</strong></span>
              </div>

              {/* Compact Throttle & Brake meters */}
              <div className="border-t border-white/5 mt-2 pt-2 flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2 font-mono text-[10px] text-[#c1c6d7]">
                  <span className="shrink-0 uppercase text-[9px] opacity-75">THR:</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                    <div className="h-full bg-[#00fbfb] transition-all duration-75" style={{ width: `${physics.throttle * 100}%` }} />
                  </div>
                  <span className="font-bold text-[#00fbfb] w-8 text-right text-[9px]">{Math.round(physics.throttle * 100)}%</span>
                </div>
                <div className="flex-1 flex items-center gap-2 font-mono text-[10px] text-[#c1c6d7]">
                  <span className="shrink-0 uppercase text-[9px] opacity-75">BRK:</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                    <div className="h-full bg-red-400 transition-all duration-75" style={{ width: `${physics.brake * 100}%` }} />
                  </div>
                  <span className="font-bold text-red-400 w-8 text-right text-[9px]">{Math.round(physics.brake * 100)}%</span>
                </div>
              </div>

              {/* Action Triggers Footer */}
              <div className="border-t border-white/5 mt-2 pt-2 flex items-center justify-between gap-3 text-[10px] font-mono">
                {/* Gesture Simulators */}
                <div className="flex items-center gap-2">
                  <span className="text-[#c1c6d7] opacity-60 uppercase text-[9px]">GESTURE:</span>
                  {physics.speed < 0.2 && !autoAccelerate ? (
                    <button
                      id="btn-trigger-restart-gesture"
                      onClick={() => {
                        setAutoAccelerate(true);
                        setThrottleInput(1.0);
                        setBrakeInput(0);
                      }}
                      className="px-2.5 py-1 rounded font-bold tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 cursor-pointer active:scale-95 transition-all text-[9px]"
                    >
                      RESTART & RUN
                    </button>
                  ) : (
                    <button
                      id="btn-trigger-stop-gesture"
                      onClick={triggerGracefulStop}
                      disabled={isGracefulStopping}
                      className={`px-2.5 py-1 rounded font-bold tracking-wider border transition-all text-[9px] ${
                        isGracefulStopping 
                          ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                          : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/25 cursor-pointer active:scale-95'
                      }`}
                    >
                      {isGracefulStopping ? 'STOPPING...' : 'TRIGGER STOP'}
                    </button>
                  )}
                </div>

                {/* Shifting toggles */}
                <div className="flex items-center gap-2">
                  <span className="text-[#c1c6d7] opacity-60 uppercase font-mono text-[9px]">SHIFT:</span>
                  <button
                    id="btn-toggle-autoshift"
                    onClick={() => {
                      setAutoShift(!autoShift);
                      setManualGearInput(null);
                    }}
                    className={`px-2.5 py-1 rounded border text-[9px] font-bold tracking-wider cursor-pointer transition-all ${
                      autoShift 
                        ? 'bg-[#00fbfb]/10 border-[#00fbfb]/40 text-[#00fbfb]' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {autoShift ? 'AUTO' : 'MANUAL'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FLOATING COMPLIANCE NOTIFICATIONS */}
      {trafficAlert && (
        <div id="traffic-compliance-alert" className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40 bg-black/85 border border-white/10 rounded-full px-6 py-2 backdrop-blur-md shadow-2xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-sans font-black text-xs tracking-wider uppercase" style={{ color: trafficAlert.color }}>
            {trafficAlert.message}
          </span>
        </div>
      )}

      {/* SCHOOL ZONE HUD INDICATOR */}
      {physics.distanceTraveled >= 300 && physics.distanceTraveled <= 400 && (
        <div 
          id="school-zone-hud-indicator" 
          className="absolute right-4 top-24 z-30 w-44 bg-black/85 border-2 border-yellow-500 rounded-xl p-3.5 backdrop-blur-md shadow-2xl shadow-yellow-950/20 flex flex-col gap-2.5 animate-pulse"
        >
          <div className="flex items-center gap-1.5 border-b border-yellow-500/20 pb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping" />
            <span className="font-sans font-black text-xs text-yellow-500 tracking-wider">
              SCHOOL ZONE ACTIVE
            </span>
          </div>
          
          <div className="flex flex-col gap-1 text-[10px] font-mono">
            <div className="flex justify-between">
              <span className="text-[#c1c6d7] uppercase">SPEED RANGE:</span>
              <span className="text-white font-bold">0 - 50 km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7] uppercase">GEAR LIMIT:</span>
              <span className="text-white font-bold">No Restriction</span>
            </div>
            <div className="flex justify-between border-t border-white/5 mt-1 pt-1">
              <span className="text-[#c1c6d7] uppercase">REMAINING:</span>
              <span className="text-yellow-400 font-bold">
                {Math.max(0, Math.round(400 - physics.distanceTraveled))} m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LARGE SCHOOL ZONE ANNOUNCEMENT */}
      {showSchoolZoneNotice && (
        <div 
          id="school-zone-announcement" 
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-sm bg-gradient-to-b from-yellow-500/20 to-black/95 border-2 border-yellow-500 rounded-2xl p-6 backdrop-blur-lg shadow-2xl shadow-yellow-500/10 text-center animate-fade-in"
        >
          <div className="text-yellow-500 text-3xl mb-2">⚠</div>
          <h2 className="font-sans font-black text-yellow-500 tracking-widest text-xl uppercase mb-1">
            SCHOOL ZONE ENTERED
          </h2>
          <p className="font-mono text-[10px] text-yellow-400/80 uppercase tracking-wider mb-4">
            Maintain Safe Speed Limit
          </p>
          <div className="bg-black/50 border border-yellow-500/20 rounded-xl p-3 flex flex-col gap-2 text-left text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">MAX SPEED:</span>
              <span className="text-yellow-400 font-black">50 KM/H</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">MIN SPEED:</span>
              <span className="text-yellow-400 font-black">0 KM/H</span>
            </div>
          </div>
        </div>
      )}

      {/* QUICK FLOATING CONTROL LEGENDS OVERLAY FOR DESKTOP */}
      <div className="absolute right-4 top-40 z-10 hidden xl:flex flex-col gap-1.5 font-mono text-[9px] text-white/30 bg-black/40 border border-white/5 rounded-lg p-2.5 backdrop-blur-xs text-right">
        <div>▲/W : THROTTLE</div>
        <div>▼/S : BRAKE</div>
        <div>◀▶/A/D : LEAN</div>
        <div>1-3 : SHIFT GEAR</div>
        <div>G : SHIFT MODE</div>
        <div>ESC : PAUSE</div>
      </div>

      {/* GAME OVER MODAL DIALOG */}
      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#16181a]/95 border-2 border-red-500/50 rounded-2xl p-6 shadow-2xl shadow-red-950/40 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-500" />
            
            <h2 className="text-red-500 font-sans font-black tracking-widest text-2xl uppercase mb-1">
              {gameOverTitle}
            </h2>
            <div className="text-red-400/80 font-mono text-[10px] uppercase tracking-widest mb-6">
              {gameOverMessage}
            </div>
            
            <div className="bg-black/45 border border-white/5 rounded-xl p-4 mb-6 flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-mono text-xs text-[#c1c6d7] uppercase">FINAL SCORE</span>
                <span className="font-sans font-black text-xl text-emerald-400 tracking-wider">
                  {currentScore}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[#c1c6d7] uppercase">DISTANCE TRAVELED</span>
                <span className="font-mono font-bold text-white">
                  {Math.round(physics.distanceTraveled)} m
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[#c1c6d7] uppercase">MAX SPEED</span>
                <span className="font-mono font-bold text-[#00fbfb]">
                  {Math.round(maxObservedSpeed)} km/h
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[#c1c6d7] uppercase">TIME SURVIVED</span>
                <span className="font-mono font-bold text-amber-400">
                  {activeDuration} s
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[#c1c6d7] uppercase">OVERTAKES</span>
                <span className="font-mono font-bold text-indigo-400">
                  {overtakesCount} AI CARS
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <button
                id="gameover-restart-btn"
                onClick={() => {
                  // Reset State
                  setPhysics({
                    speed: 0,
                    speedMs: 0,
                    velocity: 0,
                    acceleration: 0,
                    gear: 1,
                    rpm: 1200,
                    throttle: 0,
                    brake: 0,
                    leanAngle: 0,
                    targetLeanAngle: 0,
                    turningRadius: 9999,
                    angularVelocity: 0,
                    distanceTraveled: 0,
                    mass: 280,
                    dragForce: 0,
                    frictionForce: 0,
                    engineForce: 0,
                    laneOffset: 0,
                    status: 'Stopped',
                  });
                  setOvertakesCount(0);
                  setActiveDuration(0);
                  setMaxObservedSpeed(0);
                  setMaxObservedLean(0);
                  setGameOver(false);
                  setAutoShift(false);
                  setManualGearInput(null);
                  setAutoAccelerate(true);
                  setThrottleInput(1.0);
                  setBrakeInput(0);
                  setSteerInput(0);
                  trafficCarsRef.current = [];
                  setBonusPoints(0);
                  activeSignalRef.current = null;
                  setActiveSignal(null);
                  setTrafficAlert(null);
                  schoolZoneNoticeTriggeredRef.current = false;
                  setSchoolZoneBonusAwarded(false);
                  schoolZoneBonusAwardedRef.current = false;
                  setShowSchoolZoneNotice(false);
                  if (schoolZoneNoticeTimerRef.current) {
                    window.clearTimeout(schoolZoneNoticeTimerRef.current);
                    schoolZoneNoticeTimerRef.current = null;
                  }
                  setGameOverTitle('RIDE CRASHED');
                  setGameOverMessage('SYSTEM CRITICAL: COLLISION DETECTED');
                }}
                className="w-full font-sans font-extrabold text-xs py-3 rounded-lg tracking-widest bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer"
              >
                RESTART RIDE
              </button>
              
              <button
                id="gameover-menu-btn"
                onClick={() => {
                  if (onMainMenu) {
                    onMainMenu();
                  } else {
                    window.location.reload();
                  }
                }}
                className="w-full font-sans font-extrabold text-xs py-3 rounded-lg tracking-widest border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95 cursor-pointer"
              >
                MAIN MENU
              </button>
              
              <button
                id="gameover-exit-btn"
                onClick={() => {
                  if (onExit) {
                    onExit();
                  } else {
                    window.location.reload();
                  }
                }}
                className="w-full font-sans font-extrabold text-xs py-3 rounded-lg tracking-widest border border-white/5 bg-transparent hover:bg-white/5 text-white/50 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
