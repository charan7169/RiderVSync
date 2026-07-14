/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Achievement, TelemetryLog } from '../types';
import { User, Award, History, ArrowLeft, ShieldCheck, Gauge, Compass, Bike } from 'lucide-react';

interface ProfileScreenProps {
  achievements: Achievement[];
  recentLogs: TelemetryLog[];
  topSpeed: number;
  totalDistance: number;
  onBack: () => void;
}

export default function ProfileScreen({ 
  achievements, 
  recentLogs, 
  topSpeed, 
  totalDistance, 
  onBack 
}: ProfileScreenProps) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#121414] text-[#e2e2e2] flex flex-col justify-between p-8 md:p-12 lg:p-16 select-none animate-fade-in">
      {/* Background Neon Blur */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#00fbfb]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[#007FFF]/5 blur-[120px] pointer-events-none z-0" />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            id="back-button-profile"
            onClick={onBack}
            className="p-3 rounded-lg bg-white/5 border border-white/5 text-[#c1c6d7] hover:text-[#00fbfb] hover:border-[#00fbfb]/30 hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans font-bold tracking-[0.15em] text-[#00fbfb] text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(0,251,251,0.3)]">
              PILOT PROFILE & GARAGE
            </h1>
            <p className="font-mono text-xs text-[#c1c6d7] opacity-60 tracking-wider uppercase">
              Rider Telemetry Records & Hardware Assets
            </p>
          </div>
        </div>
      </header>

      {/* CORE BODY GRID */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-stretch h-[70%] max-h-[600px]">
        {/* Left Hand Column: Pilot Badge & Stats (4 columns) */}
        <div className="lg:col-span-4 bg-[#16181a]/60 border border-white/10 rounded-xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00fbfb]/20 to-transparent" />
          
          <div className="flex flex-col items-center text-center mt-4">
            {/* Avatar image frame */}
            <div className="relative mb-4 group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#007FFF] to-[#00fbfb] opacity-35 blur-md group-hover:opacity-65 transition-all duration-300" />
              <img 
                alt="Pilot Avatar" 
                className="w-24 h-24 rounded-full border border-white/20 relative z-10 object-cover shadow-[0_0_20px_rgba(0,251,251,0.1)]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5H6RhxTAIG1Vh6PsRsRj2w0uQYJ1E2ryo8Kw0VBV3sNoUTtT64oUvqgq_aLPGRfVk43xrZzMMnToq2vhOJytIBbHb-nhDx6YFPE03MRUWBuxRCNnpUAHnHOqRuYVhcTfSCDsy-cTg2oonUkTtSC6uWhpUTPWAivZ2FDQLX2pjwbEogcGC3WW00zVKe8R0HWs8ESK2s_a_ZDmhpcUVhU3VYLICiX6moBfNmVFT2mnHOGuAuv6dg9wroClvVY3JoGILCjzUDyszUx4"
              />
            </div>
            <h2 className="font-sans font-bold text-[#e2e2e2] tracking-wide text-base">PILOT_STITCH_01</h2>
            <p className="font-mono text-[10px] text-[#00fbfb] tracking-widest mt-1">RANK: SENIOR V-SYNC RIDER</p>
          </div>

          {/* Quick core logs */}
          <div className="flex flex-col gap-3 my-6 border-y border-white/5 py-4 font-mono text-xs text-[#c1c6d7]">
            <div className="flex items-center justify-between">
              <span className="opacity-60 flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-[#00fbfb]" /> TOP VELOCITY</span>
              <span className="font-bold text-white">{Math.round(topSpeed)} km/h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-60 flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-[#007FFF]" /> TOTAL DISTANCE</span>
              <span className="font-bold text-white">{Math.round(totalDistance)} m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-60 flex items-center gap-1.5"><Bike className="w-3.5 h-3.5 text-amber-400" /> ACTIVE BIKE</span>
              <span className="font-bold text-white">ZX-10R EV</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex gap-2.5 items-start font-mono text-[10px] text-[#c1c6d7] opacity-75">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-emerald-400 font-bold">LICENSE STABLE:</span> Telemetry signals are valid and encrypted. Active controller is locked to local precision buffers.
            </div>
          </div>
        </div>

        {/* Right Hand Column: Achievements & History (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          {/* Achievements Grid */}
          <div className="bg-[#16181a]/60 border border-white/10 rounded-xl p-6 backdrop-blur-md flex-1 overflow-y-auto min-h-0 relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#007FFF]/20 to-transparent" />
            <h3 className="font-sans font-bold tracking-[0.1em] text-xs text-white uppercase mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00fbfb]" /> RIDER TROPHIES & MILESTONES
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`border rounded-lg p-3.5 flex items-start gap-3 transition-all duration-300 backdrop-blur-sm ${
                    ach.unlocked 
                      ? 'bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/30' 
                      : 'bg-[#111314]/30 border-white/5 opacity-50'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border ${
                    ach.unlocked 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.15)]' 
                      : 'bg-white/5 border-white/5 text-white/30'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-sans font-bold text-xs tracking-wide transition-colors ${
                      ach.unlocked ? 'text-white' : 'text-[#c1c6d7] opacity-60'
                    }`}>
                      {ach.title}
                    </h4>
                    <p className="font-mono text-[10px] text-[#c1c6d7] opacity-60 mt-0.5 leading-relaxed uppercase">
                      {ach.description}
                    </p>
                    <span className={`font-mono text-[9px] mt-1.5 inline-block px-1.5 py-0.5 rounded ${
                      ach.unlocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-white/5 text-white/30'
                    }`}>
                      {ach.unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Telemetry Logs */}
          <div className="bg-[#16181a]/60 border border-white/10 rounded-xl p-6 backdrop-blur-md h-[40%] overflow-y-auto min-h-0 relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
            <h3 className="font-sans font-bold tracking-[0.1em] text-xs text-white uppercase mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" /> HISTORICAL TELEMETRY LOGS
            </h3>

            <div className="flex flex-col gap-2">
              {recentLogs.map((log) => (
                <div 
                  key={log.id}
                  className="bg-[#111314]/40 border border-white/5 rounded-lg p-3 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00fbfb]" />
                    <div>
                      <h4 className="font-sans font-bold text-white text-xs">{log.trackName}</h4>
                      <p className="text-[10px] text-[#c1c6d7] opacity-40 uppercase mt-0.5">{log.timeAgo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-[#c1c6d7] opacity-40 uppercase text-[9px]">MAX SPEED</span>
                      <p className="text-white font-bold">{log.maxSpeed} km/h</p>
                    </div>
                    <div>
                      <span className="text-[#c1c6d7] opacity-40 uppercase text-[9px]">RANK</span>
                      <p className={`font-bold ${
                        log.rank === '1st' ? 'text-[#00fbfb]' : log.rank === 'DNF' ? 'text-red-400' : 'text-white'
                      }`}>{log.rank}</p>
                    </div>
                    <div>
                      <span className="text-[#c1c6d7] opacity-40 uppercase text-[9px]">XP AWARD</span>
                      <p className="text-emerald-400 font-bold">+{log.xp} XP</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6 text-[10px] font-mono text-[#c1c6d7] opacity-50 tracking-wider">
        <div>HARDWARE MODEL: GP-RIDER EVO-04</div>
        <div>STITCH TELEMETRY SYSTEM v1.82</div>
      </footer>
    </div>
  );
}
