/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Award, Compass, Gauge, Shield, RotateCcw, Home, Star } from 'lucide-react';

interface MissionCompleteProps {
  topSpeed: number;
  distance: number;
  maxLean: number;
  safetyRating: string;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function MissionComplete({
  topSpeed,
  distance,
  maxLean,
  safetyRating,
  onRestart,
  onMainMenu,
}: MissionCompleteProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Particle class
    class Sparkle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;

      constructor() {
        this.x = width / 2;
        this.y = height / 3;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - Math.random() * 3; // slight upward bias
        this.size = Math.random() * 3.5 + 1.5;
        const colors = ['#00fbfb', '#007FFF', '#fbbf24', '#34d599', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // gravity pull down
        this.vx *= 0.98; // friction
        this.alpha -= this.decay;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.shadowBlur = 10;
        c.shadowColor = this.color;
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    let sparkles: Sparkle[] = [];
    const maxSparkles = 100;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Continuously spawn some sparkles from center
      if (sparkles.length < maxSparkles && Math.random() < 0.4) {
        for (let i = 0; i < 5; i++) {
          sparkles.push(new Sparkle());
        }
      }

      sparkles = sparkles.filter((s) => s.alpha > 0);
      sparkles.forEach((s) => {
        s.update();
        s.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-[#121414]/90 flex items-center justify-center p-4 overflow-hidden select-none animate-fade-in">
      {/* Interactive Background Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Main glassmorphic container card */}
      <div className="relative z-10 bg-[#16181a]/95 border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col items-center">
        {/* Border indicator */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00fbfb] to-transparent" />

        {/* Celebrating Header */}
        <div className="p-3 bg-gradient-to-tr from-[#007FFF] to-[#00fbfb] rounded-full border border-white/10 text-[#121414] mb-4 shadow-[0_0_20px_rgba(0,251,251,0.3)] animate-pulse">
          <Award className="w-10 h-10" />
        </div>
        <h2 className="font-sans font-black tracking-[0.15em] text-[#00fbfb] text-xl md:text-2xl text-center uppercase drop-shadow-[0_0_12px_rgba(0,251,251,0.2)]">
          CIRCUIT COMPLETE
        </h2>
        <p className="font-mono text-[9px] text-[#c1c6d7] opacity-65 tracking-widest uppercase mt-1 text-center">
          V-Sync Ride Data Logs Synchronized Successfully
        </p>

        {/* Stars decoration */}
        <div className="flex items-center gap-2 my-5">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-bounce" style={{ animationDelay: '0ms' }} />
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-bounce" style={{ animationDelay: '150ms' }} />
          <Star className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Ride performance stats card */}
        <div className="bg-[#111314]/70 border border-white/5 rounded-xl w-full p-4 mb-6 flex flex-col gap-3 font-mono text-xs text-[#c1c6d7]">
          {/* Top speed */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="opacity-60 flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-[#00fbfb]" /> PEAK VELOCITY</span>
            <span className="font-sans font-bold text-white text-sm">{Math.round(topSpeed)} <span className="text-[10px] text-[#00fbfb]">km/h</span></span>
          </div>

          {/* Distance */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="opacity-60 flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-[#007FFF]" /> RIDE DISTANCE</span>
            <span className="font-sans font-bold text-white text-sm">{Math.round(distance)} <span className="text-[10px] text-[#007FFF]">meters</span></span>
          </div>

          {/* Max lean */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="opacity-60 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400" /> MAX LEAN ANGLE</span>
            <span className="font-sans font-bold text-white text-sm">{Math.round(maxLean)}° <span className="text-[10px] text-amber-400">tilt</span></span>
          </div>

          {/* Safety rating */}
          <div className="flex items-center justify-between">
            <span className="opacity-60 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> SAFETY SCORE</span>
            <span className="font-sans font-black text-emerald-400 text-base">{safetyRating}</span>
          </div>
        </div>

        {/* Buttons Stack */}
        <div className="flex items-center gap-4 w-full">
          <button
            id="complete-btn-restart"
            onClick={onRestart}
            className="flex-1 font-sans font-bold text-xs py-3.5 border border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10 text-white rounded-lg tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> REPLAY
          </button>
          
          <button
            id="complete-btn-menu"
            onClick={onMainMenu}
            className="flex-1 font-sans font-bold text-xs py-3.5 bg-gradient-to-r from-[#007FFF] to-[#00fbfb] text-[#121414] rounded-lg tracking-wider hover:shadow-[0_0_15px_rgba(0,251,251,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
