/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppScreen } from '../types';
import { 
  Play, 
  BookOpen, 
  Settings, 
  Sliders, 
  User, 
  LogOut, 
  TrendingUp, 
  Gauge, 
  ShieldCheck, 
  Compass 
} from 'lucide-react';

interface MainMenuProps {
  onNavigate: (screen: AppScreen) => void;
  onExitClick: () => void;
  topSpeed: number;
  totalDistance: number;
  unlockedAchievementsCount: number;
}

export default function MainMenu({ 
  onNavigate, 
  onExitClick, 
  topSpeed, 
  totalDistance, 
  unlockedAchievementsCount 
}: MainMenuProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const menuItems = [
    { 
      id: 'start', 
      label: 'START RIDE', 
      description: 'LAUNCH V-SYNC MOTION PHYSICS ENGINE', 
      icon: Play, 
      action: () => onNavigate(AppScreen.GAME_HUD),
      color: 'hover:text-[#00fbfb]',
      glowColor: 'rgba(0,251,251,0.2)'
    },
    { 
      id: 'training', 
      label: 'TRAINING MODE', 
      description: 'CALIBRATE CORNERING & LEAN ANGLES', 
      icon: BookOpen, 
      action: () => onNavigate(AppScreen.TRAINING),
      color: 'hover:text-[#007FFF]',
      glowColor: 'rgba(0,127,255,0.2)'
    },
    { 
      id: 'controls', 
      label: 'CV TELEMETRY CONTROLS', 
      description: 'CONFIGURE GESTURE & CAMERA MATRIX', 
      icon: Sliders, 
      action: () => onNavigate(AppScreen.CONTROLS),
      color: 'hover:text-amber-400',
      glowColor: 'rgba(251,191,36,0.2)'
    },
    { 
      id: 'settings', 
      label: 'AUDIO & GRAPHICS', 
      description: 'ADJUST AUDIO MIXERS & COMPONENT VOLUMES', 
      icon: Settings, 
      action: () => onNavigate(AppScreen.SETTINGS),
      color: 'hover:text-[#e2e2e2]',
      glowColor: 'rgba(255,255,255,0.1)'
    },
    { 
      id: 'profile', 
      label: 'PROFILE & GARAGE', 
      description: 'VIEW ACHIEVEMENTS, STATS & RECENT LOGS', 
      icon: User, 
      action: () => onNavigate(AppScreen.PROFILE),
      color: 'hover:text-emerald-400',
      glowColor: 'rgba(52,211,153,0.2)'
    },
    { 
      id: 'exit', 
      label: 'EXIT TO DESKTOP', 
      description: 'CLOSE CONNECTION AND PERSIST STATE', 
      icon: LogOut, 
      action: onExitClick,
      color: 'hover:text-red-500',
      glowColor: 'rgba(239,68,68,0.2)'
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#121414] text-[#e2e2e2] flex flex-col justify-between p-8 md:p-12 lg:p-16 select-none">
      {/* Background Sportbike Garage Canvas Image (Glass Blurred) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25 filter blur-sm scale-105 pointer-events-none transition-transform duration-1000" 
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBl0cEzvnQvaub0dvvsNJRQ1SKJFpZdbwo0_zwE2wkJmUJEarU0AVN0AhHNXk5IHXn29wrX8l4EwxYgrZhJt80PDF519zxhYJGHTxzqx6lKpVHDE6337DvE-w4sisFeX40h91JwC4vc7Fu80sgqNZvJhccBOUPTAYkyz6oEH5ocEkyr719RT3_veCgXi71nbPXlMjev1Eip29opWH5JxG9vczaU4oqQaTCYcwtIxzrZfd2nWSbcv5rv97FcixaZAe3SZFoG7EyuU7Q')`
        }}
      />
      {/* Glowing subtle grids overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,127,255,0.15),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,251,251,0.1),transparent_50%)] pointer-events-none z-0" />

      {/* HEADER SECTION */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            alt="Rider V Sync Logo" 
            className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(0,251,251,0.2)]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSyh8mAmO3SXKFd9CipS5m-mzAr3qJ4X7Ah6VRfxXQfEvra9TsZrSoakOhtQozlEEfqBlb4n-JWW7geGL7lBe52dyrb7ritcWdjnGSKj0yNBf3YlL0llme6LBUxEuSV6wTVRfb5n4VQTiWMELhSjps_4pA6aAwsNJtJPp9YSMpxo8TC296aaGEfN7ycn_on0_3d6nP69E_OHxKxlOw7T1EyxNvsBcucexl0zZ8arTBzdolywpDURyhbgflZll6BqMM5F4IROD4mWA"
          />
          <div>
            <h1 className="font-sans font-bold tracking-[0.15em] text-[#00fbfb] text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(0,251,251,0.3)]">
              RIDER V-SYNC
            </h1>
            <p className="font-mono text-xs text-[#c1c6d7] opacity-60 tracking-wider">
              PRECISION TELEMETRY & PHYSICAL SIMULATION
            </p>
          </div>
        </div>

        {/* Top telemetry state bar */}
        <div className="hidden md:flex items-center gap-6 font-mono text-xs border border-white/5 bg-[#1a1c1d]/60 backdrop-blur-md rounded-lg px-4 py-2 text-[#c1c6d7]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00fbfb] animate-ping" />
            <span>CV SENSORS: ONLINE</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div>V-SYNC: LOCKED</div>
        </div>
      </header>

      {/* CORE BODY SECTION */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 my-auto items-center">
        {/* Left Hand Navigation Menu (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredOption === item.id;
            return (
              <button
                key={item.id}
                id={`menu-item-${item.id}`}
                className={`group flex items-center justify-between text-left p-4 md:p-5 rounded-lg border transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
                  isHovered 
                    ? 'bg-[#1e2124]/90 border-[#00fbfb]/30 shadow-[0_0_20px_rgba(0,251,251,0.08)] translate-x-2' 
                    : 'bg-[#16181a]/50 border-white/5 hover:border-white/10'
                }`}
                onMouseEnter={() => setHoveredOption(item.id)}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={item.action}
              >
                {/* Background color glow on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 10% 50%, ${item.glowColor}, transparent 50%)`
                  }}
                />

                <div className="flex items-center gap-4 relative z-10">
                  <div className={`p-3 rounded-lg bg-white/5 border border-white/5 transition-colors duration-300 ${
                    isHovered ? 'text-[#00fbfb]' : 'text-white/60'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-sans font-bold tracking-[0.1em] text-sm md:text-base transition-colors duration-300 ${
                      isHovered ? 'text-white' : 'text-[#c1c6d7]'
                    }`}>
                      {item.label}
                    </h3>
                    <p className="font-mono text-[10px] md:text-xs text-[#c1c6d7] opacity-50 mt-0.5 tracking-wider uppercase">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Trailing Arrow or Chevron indicator */}
                <div className={`transition-all duration-300 ${
                  isHovered ? 'text-[#00fbfb] translate-x-1 opacity-100' : 'text-white/20 opacity-0 -translate-x-2'
                }`}>
                  <Play className="w-4 h-4 fill-current" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Hand Telemetry Dashboard Summary Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#16181a]/60 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-lg shadow-2xl relative overflow-hidden group">
            {/* Visual gradient edge light */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00fbfb]/30 to-transparent" />
            <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-[#007FFF]/20 to-transparent" />

            <div className="flex items-center gap-3 mb-6">
              <Compass className="w-5 h-5 text-[#00fbfb] animate-spin-slow" />
              <h2 className="font-sans font-bold tracking-[0.12em] text-[#e2e2e2] text-sm md:text-base">
                PILOT HUD OVERVIEW
              </h2>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
                <span className="font-mono text-[10px] text-[#c1c6d7] opacity-60 uppercase">
                  TOP RECORDED
                </span>
                <span className="font-sans font-bold text-lg text-white tracking-wide">
                  {Math.round(topSpeed)} <span className="text-xs text-[#00fbfb]">km/h</span>
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex flex-col gap-1">
                <span className="font-mono text-[10px] text-[#c1c6d7] opacity-60 uppercase">
                  TOTAL DISTANCE
                </span>
                <span className="font-sans font-bold text-lg text-white tracking-wide">
                  {Math.round(totalDistance)} <span className="text-xs text-[#007FFF]">meters</span>
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex flex-col gap-1 col-span-2">
                <span className="font-mono text-[10px] text-[#c1c6d7] opacity-60 uppercase">
                  V-SYNC CORNERING ACCURACY
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <div className="h-2 bg-white/10 rounded-full flex-grow overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#007FFF] to-[#00fbfb] w-[88%]" />
                  </div>
                  <span className="font-mono text-xs text-[#00fbfb] font-bold">88%</span>
                </div>
              </div>
            </div>

            {/* Calibration Details status */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#c1c6d7] opacity-60">ACHIEVEMENTS UNLOCKED</span>
                <span className="font-sans font-bold text-emerald-400">{unlockedAchievementsCount} / 4</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#c1c6d7] opacity-60">CORNERING CALIBRATION</span>
                <span className="font-mono text-[#00fbfb] font-bold">CALIBRATED</span>
              </div>
            </div>
          </div>

          {/* Prompt banner detailing gesture controls */}
          <div className="bg-[#111314]/70 border border-white/5 rounded-lg p-4 flex items-start gap-3 font-mono text-[11px] text-[#c1c6d7] opacity-75">
            <ShieldCheck className="w-5 h-5 text-[#00fbfb] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#00fbfb] font-bold">IMMERSION NOTICE:</span> Real physics formulas apply. Maximum speeds are governed by gear ratios (G1: 20km/h, G2: 40km/h, G3: 65km/h, G4: 80km/h). Perform deep cornering leans or stop gestures with precision.
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER SECTION */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 text-[10px] font-mono tracking-wider text-[#c1c6d7] opacity-50">
        <div>
          LAUNCH COMPATIBILITY: REACT 19 + TAILWIND V4
        </div>
        <div className="mt-2 sm:mt-0">
          DESIGNED FOR PRECISION MOTORCYCLE IMMERSION
        </div>
      </footer>
    </div>
  );
}
