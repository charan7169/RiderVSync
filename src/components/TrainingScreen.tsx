/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, HelpCircle, ShieldAlert, Wifi, Activity } from 'lucide-react';

interface TrainingScreenProps {
  onBack: () => void;
  onCalibrationComplete: () => void;
}

export default function TrainingScreen({ onBack, onCalibrationComplete }: TrainingScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [simulatedLean, setSimulatedLean] = useState(0); // -45 to 45 degrees
  const [subMessage, setSubMessage] = useState('Position your hand/device horizontally relative to the webcam or trackpad.');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCalibrating) {
      setCalibrationProgress(0);
      const interval = setInterval(() => {
        setCalibrationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsCalibrating(false);
            handleStepComplete();
            return 100;
          }
          // Dynamic sensor wobbling to simulate live feedback
          const drift = (Math.random() - 0.5) * 5;
          if (currentStep === 2) {
            setSimulatedLean(-35 + drift);
          } else if (currentStep === 3) {
            setSimulatedLean(35 + drift);
          } else {
            setSimulatedLean(drift);
          }
          return prev + Math.random() * 15 + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isCalibrating, currentStep]);

  const startCalibration = () => {
    setIsCalibrating(true);
    if (currentStep === 1) {
      setSubMessage('REGISTERING NEUTRAL COORDS... MAINTAIN CENTERED ALIGNMENT.');
    } else if (currentStep === 2) {
      setSubMessage('REGISTERING HARD LEFT DEVIATION... MAINTAIN MAXIMUM COMFORTABLE TILT.');
    } else if (currentStep === 3) {
      setSubMessage('REGISTERING HARD RIGHT DEVIATION... VERIFY SENSOR RANGE LIMITS.');
    }
  };

  const handleStepComplete = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 1) {
        setSimulatedLean(-35);
        setSubMessage('Tilt your hand or device LEFT. Ensure the calibration camera captures the change.');
      } else if (currentStep === 2) {
        setSimulatedLean(35);
        setSubMessage('Tilt your hand or device RIGHT. Hold position steady for telemetry sync.');
      }
    } else {
      setSubMessage('CALIBRATION SUCCESSFUL! TELEMETRY IS FULLY LOCKED TO THE PHYSICAL BIKE PROFILE.');
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCalibrationProgress(0);
    setSimulatedLean(0);
    setIsCalibrating(false);
    setSubMessage('Position your hand/device horizontally relative to the webcam or trackpad.');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#121414] text-[#e2e2e2] flex flex-col justify-between p-8 md:p-12 lg:p-16 select-none animate-fade-in">
      {/* Background Cam blurred overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-15 filter blur-sm scale-105 pointer-events-none" 
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDklibY2qSV6JXqFohYxFuLSuTy36DgfegJtw7f1mC6fjpMlQ1ARs3Hh6lWOeBzYIsFWu7kjPzd7OgROvkdj0tlNy6Jn-OjhWubgRlPkPQqVd-qqDgZRSDNbD5wjMO1FUOtsN3hFDDZ37jOmNSEyNGTLlkk0RbiAEdMZaWcD4-_HFB4mqWFIgIW18do_aKwRTwiv30_fM9U9V31nyldgpLE5Tf90jRHjgFCswC_04EZRgEqNJMNxF8MNpf15qx6e_LxIXRlip-W1Rw')`
        }}
      />
      <div className="absolute inset-0 bg-[#121414]/90 z-0" />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            id="back-button-training"
            onClick={onBack}
            className="p-3 rounded-lg bg-white/5 border border-white/5 text-[#c1c6d7] hover:text-[#00fbfb] hover:border-[#00fbfb]/30 hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans font-bold tracking-[0.15em] text-[#00fbfb] text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(0,251,251,0.3)]">
              CALIBRATE LEAN SENSORS
            </h1>
            <p className="font-mono text-xs text-[#c1c6d7] opacity-60 tracking-wider uppercase">
              RIDER V-SYNC COMPUTER VISION MATRIX
            </p>
          </div>
        </div>

        {/* Live Wifi Telemetry status */}
        <div className="flex items-center gap-2 font-mono text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-md text-[#c1c6d7]">
          <Wifi className="w-4 h-4 text-[#00fbfb] animate-pulse" />
          <span>SENSORS PINNED</span>
        </div>
      </header>

      {/* CORE CALIBRATION ROW */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 my-auto items-center">
        {/* Step Guide Panel (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#16181a]/70 border border-white/10 rounded-xl p-6 backdrop-blur-md relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00fbfb]/20 to-transparent" />
            
            <h2 className="font-sans font-bold text-xs tracking-widest text-[#00fbfb] mb-4 uppercase">
              CALIBRATION PROTOCOL
            </h2>

            {/* Stepper items */}
            <div className="flex flex-col gap-4">
              {/* Step 1 */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                currentStep === 1 
                  ? 'bg-white/5 border-[#00fbfb]/30 text-white shadow-[0_0_12px_rgba(0,251,251,0.05)]' 
                  : currentStep > 1 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 opacity-60' 
                    : 'bg-transparent border-white/5 text-white/30'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border ${
                  currentStep > 1 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-transparent border-current'
                }`}>
                  {currentStep > 1 ? '✓' : '01'}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs">CALIBRATING NEUTRAL (0°)</h4>
                  <p className="font-mono text-[9px] uppercase tracking-wider opacity-60 mt-0.5">Establishes level baseline</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                currentStep === 2 
                  ? 'bg-white/5 border-[#007FFF]/40 text-white shadow-[0_0_12px_rgba(0,127,255,0.05)]' 
                  : currentStep > 2 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 opacity-60' 
                    : 'bg-transparent border-white/5 text-white/30'
              }`}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border border-current">
                  {currentStep > 2 ? '✓' : '02'}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs">LEAN LEFT CALIBRATION</h4>
                  <p className="font-mono text-[9px] uppercase tracking-wider opacity-60 mt-0.5">Establishes full left pitch limit</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                currentStep === 3 
                  ? 'bg-white/5 border-[#00fbfb]/30 text-white shadow-[0_0_12px_rgba(0,251,251,0.05)]' 
                  : 'bg-transparent border-white/5 text-white/30'
              }`}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border border-current">
                  03
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs">LEAN RIGHT CALIBRATION</h4>
                  <p className="font-mono text-[9px] uppercase tracking-wider opacity-60 mt-0.5">Establishes full right pitch limit</p>
                </div>
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="bg-[#111314]/50 border border-white/5 rounded-lg p-4 mt-6 text-xs font-mono text-[#c1c6d7] leading-relaxed">
              <span className="text-[#00fbfb] font-bold">INSTRUCTIONS:</span> {subMessage}
            </div>

            {/* Trigger Button bar */}
            <div className="mt-6 flex items-center gap-4">
              {currentStep <= 3 && (
                <button
                  id="btn-trigger-calibration"
                  disabled={isCalibrating}
                  onClick={startCalibration}
                  className={`flex-grow font-sans font-bold text-xs py-3 rounded-lg tracking-wider border transition-all duration-200 ${
                    isCalibrating 
                      ? 'bg-[#1a1c1d] border-white/5 text-white/30 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#007FFF] to-[#00fbfb] border-transparent text-[#121414] hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  {isCalibrating ? `RECORDING SENSORS... ${Math.round(calibrationProgress)}%` : 'LOCK SENSOR ANGLE'}
                </button>
              )}

              {currentStep > 3 || (
                <button
                  id="btn-reset-calibration"
                  onClick={handleReset}
                  className="font-mono text-[10px] text-[#c1c6d7] hover:text-white border border-white/10 hover:border-white/20 p-3 rounded-lg bg-white/5 cursor-pointer"
                >
                  RESET
                </button>
              )}
            </div>

            {/* Calibration Successful final button */}
            {currentStep >= 3 && !isCalibrating && calibrationProgress >= 100 && (
              <div className="mt-4 animate-fade-in">
                <button
                  id="btn-finish-calibration"
                  onClick={onCalibrationComplete}
                  className="w-full font-sans font-bold text-xs py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-[#121414] rounded-lg tracking-wider hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:scale-[1.01] transition-all cursor-pointer"
                >
                  PROCEED TO RIDE CIRCUIT
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Visualizer & Glove Diagram Canvas / SVG Panel (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6 items-center justify-center">
          <div className="bg-[#16181a]/50 border border-white/5 rounded-xl p-8 backdrop-blur-md w-full flex flex-col items-center justify-center relative overflow-hidden h-[380px]">
            {/* Corner status glow lights */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 font-mono text-[10px] text-[#c1c6d7] opacity-60">
              <Activity className="w-3.5 h-3.5 text-[#00fbfb] animate-pulse" />
              <span>LIVE GESTURE FEED</span>
            </div>

            {/* Simulated webcam video framework preview */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#00fbfb]/5 via-transparent to-[#007FFF]/5 opacity-40 pointer-events-none" />

            {/* Interactive SVG Hand / Glove wireframe showing lean angle */}
            <div 
              className="relative z-10 transition-transform duration-300 ease-out flex flex-col items-center justify-center"
              style={{ transform: `rotate(${simulatedLean}deg)` }}
            >
              {/* Neon overlay grid of virtual tracking points */}
              <svg className="w-64 h-64 text-[#00fbfb] drop-shadow-[0_0_15px_rgba(0,251,251,0.5)]" viewBox="0 0 100 100" fill="none">
                {/* Simulated glove contour */}
                <path d="M50,15 L58,35 L75,40 L65,55 L70,80 L50,70 L30,80 L35,55 L25,40 L42,35 Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                
                {/* Wireframe skeleton lines */}
                <line x1="50" y1="15" x2="50" y2="70" stroke="currentColor" strokeWidth="2" />
                <line x1="25" y1="40" x2="75" y2="40" stroke="currentColor" strokeWidth="1.5" />
                <line x1="30" y1="80" x2="70" y2="80" stroke="currentColor" strokeWidth="1.5" />
                <line x1="58" y1="35" x2="42" y2="35" stroke="currentColor" strokeWidth="1.5" />

                {/* Hand joint tracking nodes */}
                <circle cx="50" cy="15" r="3" fill="#007FFF" stroke="#00fbfb" strokeWidth="1" />
                <circle cx="58" cy="35" r="2.5" fill="currentColor" />
                <circle cx="42" cy="35" r="2.5" fill="currentColor" />
                <circle cx="75" cy="40" r="3" fill="#007FFF" stroke="#00fbfb" strokeWidth="1" />
                <circle cx="25" cy="40" r="3" fill="#007FFF" stroke="#00fbfb" strokeWidth="1" />
                <circle cx="65" cy="55" r="2.5" fill="currentColor" />
                <circle cx="35" cy="55" r="2.5" fill="currentColor" />
                <circle cx="70" cy="80" r="3" fill="#007FFF" stroke="#00fbfb" strokeWidth="1" />
                <circle cx="30" cy="80" r="3" fill="#007FFF" stroke="#00fbfb" strokeWidth="1" />
                <circle cx="50" cy="70" r="4" fill="#00fbfb" />

                {/* Tracking coordinate box */}
                <rect x="15" y="45" width="20" height="8" rx="1" fill="#121414" stroke="currentColor" strokeWidth="0.5" opacity="0.8" />
                <text x="25" y="51" fontSize="5" fontFamily="monospace" fill="currentColor" textAnchor="middle" transform="rotate(0)">L_PITCH</text>

                <rect x="65" y="45" width="20" height="8" rx="1" fill="#121414" stroke="currentColor" strokeWidth="0.5" opacity="0.8" />
                <text x="75" y="51" fontSize="5" fontFamily="monospace" fill="currentColor" textAnchor="middle">R_PITCH</text>
              </svg>

              {/* Angle display overlay */}
              <div className="bg-[#121414]/90 border border-[#00fbfb]/30 px-4 py-2 rounded-lg font-mono text-xs text-[#00fbfb] tracking-widest mt-4 shadow-[0_0_12px_rgba(0,251,251,0.2)]">
                PITCH: {Math.round(simulatedLean)}° {simulatedLean < -5 ? 'LEFT LEAN' : simulatedLean > 5 ? 'RIGHT LEAN' : 'NEUTRAL'}
              </div>
            </div>

            {/* Matrix angle indicators */}
            <div className="absolute bottom-4 right-4 text-right font-mono text-[10px] text-[#c1c6d7] opacity-60">
              <div>V-SYNC ROT: {(simulatedLean * Math.PI / 180).toFixed(4)} RAD</div>
              <div>COHESION: 99.4%</div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6 text-[10px] font-mono text-[#c1c6d7] opacity-50 tracking-wider">
        <div>WEBCAM SIGNAL: LOCKED</div>
        <div>CALIBRATION CACHE: STITCH_RAW_02</div>
      </footer>
    </div>
  );
}
