/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Settings, Home, LogOut } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export default function PauseMenu({ onResume, onRestart, onSettings, onMainMenu }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 z-50 bg-[#121414]/80 backdrop-blur-md flex items-center justify-center animate-fade-in select-none">
      <div className="bg-[#16181a]/95 border border-white/10 rounded-2xl p-8 max-w-sm w-full relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Glow neon accents */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00fbfb] to-transparent" />
        
        <div className="text-center mb-8">
          <h2 className="font-sans font-black tracking-[0.2em] text-[#00fbfb] text-2xl md:text-3xl drop-shadow-[0_0_15px_rgba(0,251,251,0.3)] animate-pulse">
            PAUSED
          </h2>
          <p className="font-mono text-[10px] text-[#c1c6d7] opacity-65 tracking-widest mt-1">
            V-SYNC ENGINE DOCKING SYSTEM ACTIVE
          </p>
        </div>

        {/* Buttons Stack */}
        <div className="flex flex-col gap-3">
          <button
            id="pause-btn-resume"
            onClick={onResume}
            className="w-full font-sans font-bold text-xs py-3.5 bg-gradient-to-r from-[#007FFF] to-[#00fbfb] text-[#121414] rounded-lg tracking-widest hover:shadow-[0_0_15px_rgba(0,251,251,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> RESUME RIDE
          </button>

          <button
            id="pause-btn-restart"
            onClick={onRestart}
            className="w-full font-sans font-bold text-xs py-3.5 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-white rounded-lg tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> RESTART CIRCUIT
          </button>

          <button
            id="pause-btn-settings"
            onClick={onSettings}
            className="w-full font-sans font-bold text-xs py-3.5 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-[#c1c6d7] rounded-lg tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4" /> AUDIO SETTINGS
          </button>

          <div className="h-px bg-white/5 my-2" />

          <button
            id="pause-btn-menu"
            onClick={onMainMenu}
            className="w-full font-sans font-bold text-xs py-3.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" /> RETURN TO GARAGE
          </button>
        </div>
      </div>
    </div>
  );
}
