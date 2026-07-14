/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GestureControl } from '../types';
import { Sliders, Camera, AlertTriangle, ArrowLeft, RefreshCw, Radio, PlayCircle } from 'lucide-react';

interface ControlsScreenProps {
  onBack: () => void;
  gestureControls: GestureControl[];
  onUpdateGesture: (id: string, updates: Partial<GestureControl>) => void;
}

export default function ControlsScreen({ onBack, gestureControls, onUpdateGesture }: ControlsScreenProps) {
  const [selectedGestureId, setSelectedGestureId] = useState<string>('throttle');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('SENSOR STANDBY. PRESS TEST TO BROADCAST TELEMETRY.');

  const selectedGesture = gestureControls.find(g => g.id === selectedGestureId) || gestureControls[0];

  const handleTestGesture = () => {
    setIsTesting(true);
    setFeedbackMsg(`TESTING SENSOR PULSES FOR [${selectedGesture.name.toUpperCase()}]...`);
    
    setTimeout(() => {
      setIsTesting(false);
      setFeedbackMsg(`GESTURE METRIC RECORDED SUCCESSFULLY! VALUE: ${(selectedGesture.intensity * 0.95).toFixed(1)} N/A`);
    }, 1500);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#121414] text-[#e2e2e2] flex flex-col justify-between p-8 md:p-12 lg:p-16 select-none animate-fade-in">
      {/* Background Cam blurred overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 filter blur-md scale-105 pointer-events-none" 
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDklibY2qSV6JXqFohYxFuLSuTy36DgfegJtw7f1mC6fjpMlQ1ARs3Hh6lWOeBzYIsFWu7kjPzd7OgROvkdj0tlNy6Jn-OjhWubgRlPkPQqVd-qqDgZRSDNbD5wjMO1FUOtsN3hFDDZ37jOmNSEyNGTLlkk0RbiAEdMZaWcD4-_HFB4mqWFIgIW18do_aKwRTwiv30_fM9U9V31nyldgpLE5Tf90jRHjgFCswC_04EZRgEqNJMNxF8MNpf15qx6e_LxIXRlip-W1Rw')`
        }}
      />
      <div className="absolute inset-0 bg-[#121414]/95 z-0" />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            id="back-button-controls"
            onClick={onBack}
            className="p-3 rounded-lg bg-white/5 border border-white/5 text-[#c1c6d7] hover:text-[#00fbfb] hover:border-[#00fbfb]/30 hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans font-bold tracking-[0.15em] text-[#00fbfb] text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(0,251,251,0.3)]">
              CV TELEMETRY MAPPING
            </h1>
            <p className="font-mono text-xs text-[#c1c6d7] opacity-60 tracking-wider uppercase">
              Configure Computer Vision Gestures and Trigger Intensities
            </p>
          </div>
        </div>
      </header>

      {/* CORE BODY GRID */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto h-[70%] max-h-[550px] items-stretch">
        {/* Left Side: Gesture Selection & Adjustment sliders (5 cols) */}
        <div className="lg:col-span-5 bg-[#16181a]/70 border border-white/10 rounded-xl p-6 backdrop-blur-md flex flex-col justify-between relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00fbfb]/25 to-transparent" />
          
          <div>
            <h2 className="font-sans font-bold text-xs tracking-widest text-[#00fbfb] mb-4 uppercase">
              GESTURE REGISTER
            </h2>

            {/* Gestures selector list */}
            <div className="flex flex-col gap-2.5">
              {gestureControls.map((control) => {
                const isSelected = control.id === selectedGestureId;
                return (
                  <button
                    key={control.id}
                    id={`gesture-item-${control.id}`}
                    onClick={() => setSelectedGestureId(control.id)}
                    className={`text-left p-3.5 rounded-lg border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-white/5 border-[#00fbfb]/40 text-[#00fbfb] shadow-[0_0_12px_rgba(0,251,251,0.05)]' 
                        : 'bg-transparent border-white/5 text-[#c1c6d7] opacity-60 hover:opacity-100 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <h4 className="font-sans font-bold text-xs">{control.name}</h4>
                      <p className="font-mono text-[9px] uppercase opacity-55 mt-0.5">TARGET: {control.inputTarget}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] font-bold block">{control.intensity}%</span>
                      <span className="font-mono text-[8px] opacity-40 uppercase">THRESHOLD</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Threshold Sliders adjustments */}
          <div className="border-t border-white/5 pt-4 mt-4">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#c1c6d7] mb-2">
              <span className="uppercase">{selectedGesture.name} SENSITIVITY</span>
              <span className="font-bold text-[#00fbfb]">{selectedGesture.intensity}%</span>
            </div>
            <input 
              id="slider-gesture-sensitivity"
              type="range" 
              min="10" 
              max="100" 
              value={selectedGesture.intensity}
              onChange={(e) => onUpdateGesture(selectedGesture.id, { intensity: parseInt(e.target.value) })}
              className="w-full accent-[#00fbfb] bg-white/10 rounded-lg appearance-none h-2 cursor-pointer focus:outline-none mb-4"
            />
            <div className="flex items-center gap-2 justify-between">
              <button
                id="btn-recalibrate"
                onClick={handleTestGesture}
                disabled={isTesting}
                className="font-sans font-bold text-[10px] bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2.5 rounded text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} /> RECALIBRATE LIMITS
              </button>
              <button
                id="btn-test-gesture"
                onClick={handleTestGesture}
                disabled={isTesting}
                className="font-sans font-bold text-[10px] bg-gradient-to-r from-[#007FFF] to-[#00fbfb] text-[#121414] px-4 py-2.5 rounded flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(0,251,251,0.3)] transition-all cursor-pointer"
              >
                <PlayCircle className="w-3.5 h-3.5" /> TEST SIGNAL
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Simulated Webcam Wireframe Tracker (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full justify-between">
          <div className="bg-[#16181a]/50 border border-white/5 rounded-xl p-6 backdrop-blur-md flex-grow flex flex-col items-center justify-center relative overflow-hidden">
            {/* Camera feed overlay lines */}
            <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[10px] text-[#c1c6d7]">
              <Camera className="w-4 h-4 text-[#00fbfb]" />
              <span>MATRIX FEED: USB_WEBCAM_DEV</span>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-mono bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" /> SYSTEM READY
            </div>

            {/* Glowing webcam box */}
            <div className="w-full max-w-sm h-64 border border-white/5 rounded-lg bg-black/40 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs" 
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDklibY2qSV6JXqFohYxFuLSuTy36DgfegJtw7f1mC6fjpMlQ1ARs3Hh6lWOeBzYIsFWu7kjPzd7OgROvkdj0tlNy6Jn-OjhWubgRlPkPQqVd-qqDgZRSDNbD5wjMO1FUOtsN3hFDDZ37jOmNSEyNGTLlkk0RbiAEdMZaWcD4-_HFB4mqWFIgIW18do_aKwRTwiv30_fM9U9V31nyldgpLE5Tf90jRHjgFCswC_04EZRgEqNJMNxF8MNpf15qx6e_LxIXRlip-W1Rw')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-10" />

              {/* Intermittent tracking crosshair overlays */}
              <div className="absolute w-8 h-8 border-t-2 border-l-2 border-[#00fbfb]/30 top-4 left-4" />
              <div className="absolute w-8 h-8 border-t-2 border-r-2 border-[#00fbfb]/30 top-4 right-4" />
              <div className="absolute w-8 h-8 border-b-2 border-l-2 border-[#00fbfb]/30 bottom-4 left-4" />
              <div className="absolute w-8 h-8 border-b-2 border-r-2 border-[#00fbfb]/30 bottom-4 right-4" />

              {/* Wireframe Hand Tracker Overlay */}
              <div className={`relative z-20 flex flex-col items-center justify-center ${isTesting ? 'scale-110' : ''} transition-all duration-300`}>
                <svg className={`w-40 h-40 ${isTesting ? 'text-[#00fbfb]' : 'text-white/40'} drop-shadow-[0_0_10px_rgba(0,251,251,0.2)]`} viewBox="0 0 100 100" fill="none">
                  {/* Wireframe Hand model */}
                  <path d="M40,75 L42,50 L30,45 L40,35 L45,45 L50,30 L55,45 L62,35 L68,48 L75,55 L55,75 Z" stroke="currentColor" strokeWidth="1" strokeDasharray={isTesting ? "" : "2 2"} />
                  {/* Tracker dots */}
                  <circle cx="42" cy="50" r="2" fill="#007FFF" />
                  <circle cx="30" cy="45" r="2" fill="#007FFF" />
                  <circle cx="40" cy="35" r="2" fill="#00fbfb" className={isTesting ? "animate-ping" : ""} />
                  <circle cx="50" cy="30" r="2" fill="#00fbfb" className={isTesting ? "animate-ping" : ""} />
                  <circle cx="62" cy="35" r="2" fill="#00fbfb" className={isTesting ? "animate-ping" : ""} />
                  <circle cx="68" cy="48" r="2" fill="#007FFF" />
                  <circle cx="55" cy="75" r="3" fill="#00fbfb" />
                </svg>
                
                <span className="font-mono text-[9px] text-[#c1c6d7] opacity-65 bg-[#121414]/90 border border-white/5 rounded px-2 py-0.5 mt-2 uppercase">
                  ACTIVE MATRIX: {selectedGesture.inputTarget}
                </span>
              </div>
            </div>

            {/* Test feedback text bar */}
            <div className="w-full mt-4 bg-[#111314] border border-white/5 rounded p-3 font-mono text-[10px] text-center text-[#c1c6d7]">
              FEEDBACK: <span className={isTesting ? "text-[#00fbfb] font-bold" : "text-white"}>{feedbackMsg}</span>
            </div>
          </div>

          <div className="bg-[#111314]/70 border border-white/5 rounded-lg p-4 flex gap-3 text-[11px] font-mono text-[#c1c6d7] opacity-75">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-amber-400 font-bold">CALIBRATION WARNING:</span> Minimize background clutter and ensure uniform front lighting. If tracking drops, realign hand with the active coordinate boundaries immediately.
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6 text-[10px] font-mono text-[#c1c6d7] opacity-50 tracking-wider">
        <div>FRAME FREQ: 60.0 FPS</div>
        <div>V-SYNC CALIBRATION KEY: CV_MATRIX_RAW_04</div>
      </footer>
    </div>
  );
}
