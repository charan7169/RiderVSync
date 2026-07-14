/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhysicsState } from '../types';

// Constants
export const GRAVITY = 9.81; // m/s²
export const BIKE_MASS_DEFAULT = 200; // kg
export const RIDER_MASS_DEFAULT = 80; // kg
export const WHEEL_RADIUS = 0.31; // meters (typical 17-inch tire)
export const C_ROLLING_RESISTANCE = 0.018; // road rolling coefficient
export const C_AERODYNAMIC_DRAG = 0.28; // drag coefficient * frontal area * air density / 2

export interface GearSpecs {
  maxSpeedKmH: number;
  maxSpeedMs: number;
  torqueMultiplier: number;
  baseRatio: number;
}

export const GEARS: Record<number, GearSpecs> = {
  1: { maxSpeedKmH: 20, maxSpeedMs: 20 / 3.6, torqueMultiplier: 1.8, baseRatio: 2.2 },
  2: { maxSpeedKmH: 40, maxSpeedMs: 40 / 3.6, torqueMultiplier: 1.4, baseRatio: 1.5 },
  3: { maxSpeedKmH: 65, maxSpeedMs: 65 / 3.6, torqueMultiplier: 1.1, baseRatio: 1.0 },
  4: { maxSpeedKmH: 80, maxSpeedMs: 80 / 3.6, torqueMultiplier: 0.85, baseRatio: 0.75 },
};

/**
 * Updates the motorcycle physics state for a single frame.
 * @param currentState The current physics state of the motorcycle.
 * @param dt Time elapsed in seconds since the last update (delta time).
 * @param throttle Throttle input (0 to 1).
 * @param brake Brake input (0 to 1).
 * @param steer Steering input (-1 for hard left, 1 for hard right, 0 for straight).
 * @param manualGear Optional manual gear override.
 * @param autoShift If true, the transmission shifts gears automatically.
 */
export function updatePhysics(
  currentState: PhysicsState,
  dt: number,
  throttle: number,
  brake: number,
  steer: number,
  manualGear: number | null,
  autoShift: boolean
): PhysicsState {
  const mass = currentState.mass || (BIKE_MASS_DEFAULT + RIDER_MASS_DEFAULT);
  let speedMs = currentState.speedMs;
  let gear = currentState.gear;

  // 1. Gear Selection & Shift Logic
  if (autoShift) {
    const speedKmH = speedMs * 3.6;
    if (speedKmH < 19 && gear > 1) {
      gear = 1;
    } else if (speedKmH >= 19 && speedKmH < 38 && gear !== 2) {
      if (speedKmH > 20) gear = 2;
    } else if (speedKmH >= 38 && speedKmH < 62 && gear !== 3) {
      if (speedKmH > 40) gear = 3;
    } else if (speedKmH >= 62 && gear !== 4) {
      if (speedKmH > 65) gear = 4;
    }
  } else if (manualGear !== null) {
    gear = manualGear;
  }

  const gearSpec = GEARS[gear] || GEARS[1];

  // 2. Engine Force Calculation
  // Torque Curve simulation: Engine has peak efficiency around 7000 RPM
  const gearMaxMs = gearSpec.maxSpeedMs;
  let engineForce = 0;
  
  if (throttle > 0 && speedMs < gearMaxMs) {
    // Smooth torque curve with high starting torque (0.5 minimum) and peak in mid-RPMs
    const speedRatio = speedMs / gearMaxMs;
    const enginePeakPowerFactor = 0.5 + 0.5 * Math.sin(speedRatio * Math.PI);
    const baseForce = 1350 * gearSpec.torqueMultiplier;
    engineForce = throttle * baseForce * enginePeakPowerFactor;
  } else if (speedMs >= gearMaxMs) {
    // Speed limit for current gear hit
    engineForce = 0;
  }

  // 3. Rolling Resistance Force
  const normalForce = mass * GRAVITY;
  const frictionForce = C_ROLLING_RESISTANCE * normalForce; // Constant against movement

  // 4. Aerodynamic Drag Force (Drag increases quadratically with velocity)
  const dragForce = C_AERODYNAMIC_DRAG * speedMs * speedMs;

  // 5. Braking Force
  const maxBrakingForce = 4500; // Newtons (stronger than friction as requested)
  const brakingForce = brake * maxBrakingForce;

  // 6. Net Forward Force Calculation
  let netForce = 0;
  if (speedMs > 0.01) {
    netForce = engineForce - dragForce - frictionForce - brakingForce;
  } else {
    // Starting from rest
    netForce = Math.max(0, engineForce - frictionForce);
  }

  // 7. Compute Acceleration
  let acceleration = netForce / mass;

  // 8. Update Velocity (Euler Integration)
  speedMs += acceleration * dt;

  // Bound velocity
  if (speedMs < 0) {
    speedMs = 0;
    acceleration = 0;
  } else if (speedMs < 0.05 && acceleration <= 0) {
    speedMs = 0;
    acceleration = 0;
  }

  // 9. RPM Calculation (simulated engine sound and dial)
  const idleRpm = 1200;
  const redlineRpm = 10500;
  let rpm = idleRpm;
  if (speedMs > 0.1) {
    const speedRatio = speedMs / gearMaxMs;
    rpm = idleRpm + (redlineRpm - idleRpm) * speedRatio * 1.1;
    if (rpm > 11500) {
      rpm = 11500;
    }
  } else if (throttle > 0) {
    rpm = idleRpm + throttle * 4500;
  }

  // 10. Cornering & Leaning Physics
  // Lean angle limited strictly to 10-15 degrees (we use 14) for realistic visual steering
  const maxLean = 14; 
  const targetLeanAngle = steer * maxLean;

  // Smooth lean interpolation
  const leanInertiaSpeed = 6.0; 
  let leanAngle = currentState.leanAngle + (targetLeanAngle - currentState.leanAngle) * leanInertiaSpeed * dt;

  // Clamp lean angle
  if (leanAngle > maxLean) leanAngle = maxLean;
  if (leanAngle < -maxLean) leanAngle = -maxLean;

  // Smooth lateral movement (lane changes)
  // Left moves smoothly to left, right moves smoothly to right, bounded within asphalt edge
  let laneOffset = currentState.laneOffset !== undefined ? currentState.laneOffset : 0;
  const lateralSpeedFactor = Math.min(1.0, speedMs / 7.0) * 1.6; // transitions speed-proportionately
  laneOffset += steer * lateralSpeedFactor * dt;
  if (laneOffset > 0.65) laneOffset = 0.65;
  if (laneOffset < -0.65) laneOffset = -0.65;

  // Turning radius: R = v^2 / (g * tan(theta))
  let turningRadius = 9999;
  const absLeanRad = Math.abs(leanAngle) * (Math.PI / 180);
  if (absLeanRad > 0.01 && speedMs > 1) {
    turningRadius = (speedMs * speedMs) / (GRAVITY * Math.tan(absLeanRad));
    turningRadius = Math.max(5, Math.min(turningRadius, 150));
  }

  // 11. Angular Velocity of Wheels
  const angularVelocity = speedMs / WHEEL_RADIUS;

  // 12. Distance Traveled
  const distanceTraveled = currentState.distanceTraveled + speedMs * dt;

  // 13. Determine status
  let status: PhysicsState['status'] = 'Stopped';
  if (speedMs < 0.1) {
    status = 'Stopped';
  } else if (brake > 0.1) {
    status = 'Braking';
  } else if (rpm >= redlineRpm - 500) {
    status = 'Redlining';
  } else if (throttle > 0.7) {
    status = 'Accelerating';
  } else if (throttle > 0.1) {
    status = 'Cruising';
  } else {
    status = 'Coasting';
  }

  return {
    speed: Math.round(speedMs * 3.6 * 10) / 10,
    speedMs,
    velocity: speedMs,
    acceleration: Math.round(acceleration * 100) / 100,
    gear,
    rpm: Math.round(rpm),
    throttle,
    brake,
    leanAngle: Math.round(leanAngle * 10) / 10,
    targetLeanAngle: Math.round(targetLeanAngle),
    turningRadius: Math.round(turningRadius * 10) / 10,
    angularVelocity: Math.round(angularVelocity * 100) / 100,
    distanceTraveled,
    laneOffset,
    mass,
    dragForce: Math.round(dragForce * 10) / 10,
    frictionForce: Math.round(frictionForce * 10) / 10,
    engineForce: Math.round(engineForce * 10) / 10,
    status,
  };
}
