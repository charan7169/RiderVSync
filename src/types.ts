/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AppScreen {
  SPLASH = 'SPLASH',
  MAIN_MENU = 'MAIN_MENU',
  GAME_HUD = 'GAME_HUD',
  TRAINING = 'TRAINING',
  SETTINGS = 'SETTINGS',
  CONTROLS = 'CONTROLS',
  PROFILE = 'PROFILE',
}

export interface PhysicsState {
  speed: number; // in km/h
  speedMs: number; // in m/s
  velocity: number; // in m/s, forward component
  acceleration: number; // in m/s²
  gear: number; // 1, 2, 3, 4
  rpm: number; // Engine RPM (1000 - 12000)
  throttle: number; // 0 to 1 (fraction)
  brake: number; // 0 to 1 (fraction)
  leanAngle: number; // degrees, positive for right, negative for left
  targetLeanAngle: number; // degrees
  turningRadius: number; // meters
  angularVelocity: number; // rad/s of the wheels
  distanceTraveled: number; // in meters
  mass: number; // in kg (bike + rider)
  dragForce: number; // N
  frictionForce: number; // N
  engineForce: number; // N
  laneOffset: number; // lateral position on the road, from -1.0 (far left) to 1.0 (far right)
  status: 'Stopped' | 'Idle' | 'Accelerating' | 'Cruising' | 'Coasting' | 'Braking' | 'Redlining' | 'Crashed';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  type: 'speed' | 'lean' | 'safety' | 'distance';
}

export interface TelemetryLog {
  id: string;
  trackName: string;
  timeAgo: string;
  rank: '1st' | '2nd' | '3rd' | 'DNF';
  xp: number;
  maxSpeed: number;
}

export interface AudioSettings {
  masterVolume: number; // 0 - 100
  musicVolume: number; // 0 - 100
  sfxVolume: number; // 0 - 100
  subtitlesEnabled: boolean;
  outputDevice: string;
}

export interface GestureControl {
  id: string;
  name: string;
  inputTarget: string;
  intensity: number; // 0 to 100
  icon: string;
}
