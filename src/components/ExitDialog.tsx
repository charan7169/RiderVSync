/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';

interface ExitDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ExitDialog({ onConfirm, onCancel }: ExitDialogProps) {
  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in select-none">
      <div className="bg-[#16181a] border border-red-500/30 rounded-xl p-8 max-w-sm w-full relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)]">
        {/* Glow neon accents */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        
        {/* Cancel corner button */}
        <button 
          id="exit-dialog-close"
          onClick={onCancel}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full mb-4 animate-bounce">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-sans font-extrabold tracking-wider text-white text-lg">
            EXIT SIMULATION?
          </h2>
          <p className="font-mono text-[10px] text-[#c1c6d7] opacity-60 uppercase tracking-wide mt-2 leading-relaxed">
            Are you sure you want to shut down the V-Sync telemetry engine? Your local calibration parameters will be safely cached.
          </p>
        </div>

        {/* Buttons Stack */}
        <div className="flex items-center gap-4">
          <button
            id="exit-btn-cancel"
            onClick={onCancel}
            className="flex-1 font-mono text-xs font-bold py-3 border border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10 text-white rounded transition-all cursor-pointer"
          >
            CANCEL
          </button>
          
          <button
            id="exit-btn-confirm"
            onClick={onConfirm}
            className="flex-1 font-sans font-bold text-xs py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded tracking-wide hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> TERMINATE
          </button>
        </div>
      </div>
    </div>
  );
}
