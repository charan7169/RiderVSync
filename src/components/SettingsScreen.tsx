/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AudioSettings } from '../types';
import { Volume2, VolumeX, Music, Shield, ArrowLeft, Disc } from 'lucide-react';

interface SettingsScreenProps {
  settings: AudioSettings;
  onUpdateSettings: (settings: Partial<AudioSettings>) => void;
  onBack: () => void;
}

export default function SettingsScreen({ settings, onUpdateSettings, onBack }: SettingsScreenProps) {
  const devices = [
    'DEFAULT AUDIO DEVICE',
    'HEADSET (3D SPATIAL BIKE HAPTICS)',
    'VIRTUAL TELEMETRY DAC OUT',
    'PCM STEER MONITOR v2',
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#121414] text-[#e2e2e2] flex flex-col justify-between p-8 md:p-12 lg:p-16 select-none animate-fade-in">
      {/* Background Sportbike Garage Image (Blended Dark) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 filter grayscale scale-105 pointer-events-none" 
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBl0cEzvnQvaub0dvvsNJRQ1SKJFpZdbwo0_zwE2wkJmUJEarU0AVN0AhHNXk5IHXn29wrX8l4EwxYgrZhJt80PDF519zxhYJGHTxzqx6lKpVHDE6337DvE-w4sisFeX40h91JwC4vc7Fu80sgqNZvJhccBOUPTAYkyz6oEH5ocEkyr719RT3_veCgXi71nbPXlMjev1Eip29opWH5JxG9vczaU4oqQaTCYcwtIxzrZfd2nWSbcv5rv97FcixaZAe3SZFoG7EyuU7Q')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#121414] via-[#121414]/95 to-transparent z-0" />

      {/* HEADER SECTION */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            id="back-button-settings"
            onClick={onBack}
            className="p-3 rounded-lg bg-white/5 border border-white/5 text-[#c1c6d7] hover:text-[#00fbfb] hover:border-[#00fbfb]/30 hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans font-bold tracking-[0.15em] text-[#00fbfb] text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(0,251,251,0.3)]">
              AUDIO & INTERFACE
            </h1>
            <p className="font-mono text-xs text-[#c1c6d7] opacity-60 tracking-wider uppercase">
              Configure Soundscape Mixers and Display Layouts
            </p>
          </div>
        </div>
      </header>

      {/* CORE BODY SECTION */}
      <main className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 my-auto items-center">
        {/* Left Side: Volume sliders & switches (8 columns) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="bg-[#16181a]/60 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-lg shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00fbfb]/20 to-transparent" />
            
            <h2 className="font-sans font-bold tracking-[0.1em] text-sm text-white uppercase mb-6 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#00fbfb]" /> TELEMETRY SOUNDSCAPE MIXER
            </h2>

            {/* Sliders Stack */}
            <div className="flex flex-col gap-6">
              {/* MASTER VOLUME */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-xs text-[#c1c6d7]">
                  <span className="opacity-75 uppercase">MASTER VOLUME</span>
                  <span className="font-bold text-[#00fbfb]">{settings.masterVolume}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <VolumeX className="w-4 h-4 text-[#c1c6d7] opacity-40 shrink-0" />
                  <input 
                    id="slider-master-volume"
                    type="range" 
                    min="0" 
                    max="100" 
                    value={settings.masterVolume}
                    onChange={(e) => onUpdateSettings({ masterVolume: parseInt(e.target.value) })}
                    className="w-full accent-[#00fbfb] bg-white/10 rounded-lg appearance-none h-2 cursor-pointer focus:outline-none"
                  />
                  <Volume2 className="w-4 h-4 text-[#00fbfb] shrink-0" />
                </div>
              </div>

              {/* SFX VOLUME */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-xs text-[#c1c6d7]">
                  <span className="opacity-75 uppercase">ENGINE & HAPTIC SFX</span>
                  <span className="font-bold text-[#007FFF]">{settings.sfxVolume}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <VolumeX className="w-4 h-4 text-[#c1c6d7] opacity-40 shrink-0" />
                  <input 
                    id="slider-sfx-volume"
                    type="range" 
                    min="0" 
                    max="100" 
                    value={settings.sfxVolume}
                    onChange={(e) => onUpdateSettings({ sfxVolume: parseInt(e.target.value) })}
                    className="w-full accent-[#007FFF] bg-white/10 rounded-lg appearance-none h-2 cursor-pointer focus:outline-none"
                  />
                  <Volume2 className="w-4 h-4 text-[#007FFF] shrink-0" />
                </div>
              </div>

              {/* MUSIC VOLUME */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-xs text-[#c1c6d7]">
                  <span className="opacity-75 uppercase">AMBIENT RETROWAVE SOUNDTRACK</span>
                  <span className="font-bold text-amber-400">{settings.musicVolume}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <VolumeX className="w-4 h-4 text-[#c1c6d7] opacity-40 shrink-0" />
                  <input 
                    id="slider-music-volume"
                    type="range" 
                    min="0" 
                    max="100" 
                    value={settings.musicVolume}
                    onChange={(e) => onUpdateSettings({ musicVolume: parseInt(e.target.value) })}
                    className="w-full accent-amber-400 bg-white/10 rounded-lg appearance-none h-2 cursor-pointer focus:outline-none"
                  />
                  <Music className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="border-t border-white/5 mt-8 pt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-bold text-xs text-white">SUBTITLES & CAPTIONS</h4>
                  <p className="font-mono text-[10px] text-[#c1c6d7] opacity-50 uppercase mt-0.5">
                    Show dynamic telemetry voice guidance text
                  </p>
                </div>
                <button
                  id="toggle-subtitles"
                  onClick={() => onUpdateSettings({ subtitlesEnabled: !settings.subtitlesEnabled })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    settings.subtitlesEnabled ? 'bg-[#00fbfb]' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#121414] transition-transform duration-200 ${
                    settings.subtitlesEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Audio device output selectors (4 columns) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-[#16181a]/60 border border-white/10 rounded-xl p-6 backdrop-blur-lg shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

            <h3 className="font-sans font-bold tracking-[0.1em] text-xs text-white uppercase mb-4 flex items-center gap-2">
              <Disc className="w-4 h-4 text-amber-400 animate-spin-slow" /> OUTPUT DEVICE
            </h3>

            <div className="flex flex-col gap-2">
              {devices.map((dev) => {
                const isSelected = settings.outputDevice === dev;
                return (
                  <button
                    key={dev}
                    id={`device-opt-${dev.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onUpdateSettings({ outputDevice: dev })}
                    className={`text-left p-3 rounded-lg font-mono text-[11px] border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-white/10 border-[#00fbfb]/40 text-[#00fbfb] shadow-[0_0_10px_rgba(0,251,251,0.05)]' 
                        : 'bg-transparent border-white/5 text-[#c1c6d7] opacity-60 hover:opacity-100 hover:border-white/10'
                    }`}
                  >
                    {dev}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#111314]/70 border border-white/5 rounded-lg p-4 flex gap-3 text-[11px] font-mono text-[#c1c6d7] opacity-75">
            <Shield className="w-5 h-5 text-[#00fbfb] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#00fbfb] font-bold">SYSTEM NOTICE:</span> All sound samples are synthetic, reproducing exact bike acceleration noise, high RPM exhaust screams, and cornering friction chirps proportionally.
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6 text-[10px] font-mono text-[#c1c6d7] opacity-50 tracking-wider">
        <div>AUDIO API ENGINE: WEBAUDIO ANALYZER</div>
        <div>V-SYNC CONTEXT VALID</div>
      </footer>
    </div>
  );
}
