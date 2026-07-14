/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppScreen, PhysicsState, Achievement, TelemetryLog, AudioSettings, GestureControl } from './types';
import SplashScreen from './components/SplashScreen';
import MainMenu from './components/MainMenu';
import GameHud from './components/GameHud';
import TrainingScreen from './components/TrainingScreen';
import SettingsScreen from './components/SettingsScreen';
import ControlsScreen from './components/ControlsScreen';
import ProfileScreen from './components/ProfileScreen';
import PauseMenu from './components/PauseMenu';
import ExitDialog from './components/ExitDialog';
import MissionComplete from './components/MissionComplete';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.SPLASH);
  
  // Overall Player Stats
  const [topSpeed, setTopSpeed] = useState<number>(44.5);
  const [totalDistance, setTotalDistance] = useState<number>(340);
  
  // Custom states
  const [showExitDialog, setShowExitDialog] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [missionCompleteStats, setMissionCompleteStats] = useState<{
    topSpeed: number;
    distance: number;
    maxLean: number;
    safetyRating: string;
  } | null>(null);

  // Audio Settings default configuration
  const [settings, setSettings] = useState<AudioSettings>({
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 85,
    subtitlesEnabled: true,
    outputDevice: 'DEFAULT AUDIO DEVICE',
  });

  // Default Gesture Controls threshold mapping
  const [gestureControls, setGestureControls] = useState<GestureControl[]>([
    { id: 'throttle', name: 'GLOVE GRIP ROTATION', inputTarget: 'Throttle Input', intensity: 75, icon: 'Zap' },
    { id: 'steer-left', name: 'PITCH DEV LEFT', inputTarget: 'Steer Left', intensity: 60, icon: 'ArrowLeft' },
    { id: 'steer-right', name: 'PITCH DEV RIGHT', inputTarget: 'Steer Right', intensity: 60, icon: 'ArrowRight' },
    { id: 'stop', name: 'OPEN PALM UP gesture', inputTarget: 'Graceful Braking Engine', intensity: 85, icon: 'Square' },
  ]);

  // Default Trophy Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'speed-demon', title: 'SPEED DEMON', description: 'Surpass 75 km/h on a single dynamic run circuit', icon: 'Award', unlocked: false, type: 'speed' },
    { id: 'perfect-lean', title: 'PERFECT LEAN', description: 'Reach a deep cornering lean angle exceeding 45°', icon: 'Award', unlocked: false, type: 'lean' },
    { id: 'night-rider', title: 'NIGHT RIDER', description: 'Acquire 1000m or more of total cumulative travel', icon: 'Award', unlocked: false, type: 'distance' },
    { id: 'safety-first', title: 'PRESTIGE SAFETY LIC', description: 'Successfully trigger the stop gesture under full control', icon: 'Award', unlocked: true, type: 'safety' },
  ]);

  // Default Telemetry Logs
  const [recentLogs, setRecentLogs] = useState<TelemetryLog[]>([
    { id: 'log-1', trackName: 'City Highway V-Sync Circuit', timeAgo: '2 hours ago', rank: '1st', xp: 450, maxSpeed: 78.4 },
    { id: 'log-2', trackName: 'Grid Sector 7 Bypass', timeAgo: 'Yesterday', rank: '2nd', xp: 320, maxSpeed: 64.2 },
    { id: 'log-3', trackName: 'Cyberpunk Neon Coastline', timeAgo: '3 days ago', rank: 'DNF', xp: 50, maxSpeed: 38.0 },
  ]);

  // Check achievements unlocking parameters
  useEffect(() => {
    // 1. Night rider check
    if (totalDistance >= 1000) {
      unlockAchievement('night-rider');
    }
    // 2. Speed demon check
    if (topSpeed >= 75) {
      unlockAchievement('speed-demon');
    }
  }, [totalDistance, topSpeed]);

  const unlockAchievement = (id: string) => {
    setAchievements((prev) => 
      prev.map((ach) => ach.id === id ? { ...ach, unlocked: true } : ach)
    );
  };

  const handleUpdateSettings = (updates: Partial<AudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleUpdateGesture = (id: string, updates: Partial<GestureControl>) => {
    setGestureControls((prev) => 
      prev.map((ctrl) => ctrl.id === id ? { ...ctrl, ...updates } : ctrl)
    );
  };

  const handleRideComplete = (stats: { topSpeed: number; distance: number; maxLean: number; safetyRating: string }) => {
    // Save to overall statistics
    if (stats.topSpeed > topSpeed) {
      setTopSpeed(stats.topSpeed);
    }
    setTotalDistance((prev) => prev + stats.distance);

    // Save to logs
    const newLog: TelemetryLog = {
      id: `log-${Date.now()}`,
      trackName: 'Custom V-Sync Circuit',
      timeAgo: 'Just now',
      rank: stats.topSpeed >= 75 ? '1st' : '2nd',
      xp: Math.round(stats.distance * 0.35),
      maxSpeed: Math.round(stats.topSpeed * 10) / 10,
    };
    setRecentLogs((prev) => [newLog, ...prev]);

    // Check peak lean angle for achievements
    if (stats.maxLean >= 45) {
      unlockAchievement('perfect-lean');
    }

    setMissionCompleteStats(stats);
  };

  const handleRestartRide = () => {
    setMissionCompleteStats(null);
    setIsPaused(false);
    // Force Game HUD remount
    setCurrentScreen(AppScreen.MAIN_MENU);
    setTimeout(() => {
      setCurrentScreen(AppScreen.GAME_HUD);
    }, 100);
  };

  // Render routing router switch
  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.SPLASH:
        return <SplashScreen onComplete={() => setCurrentScreen(AppScreen.MAIN_MENU)} />;
      
      case AppScreen.MAIN_MENU:
        return (
          <MainMenu 
            onNavigate={(screen) => setCurrentScreen(screen)}
            onExitClick={() => setShowExitDialog(true)}
            topSpeed={topSpeed}
            totalDistance={totalDistance}
            unlockedAchievementsCount={achievements.filter(a => a.unlocked).length}
          />
        );

      case AppScreen.GAME_HUD:
        return (
          <GameHud 
            isPaused={isPaused}
            onResume={() => setIsPaused(false)}
            onPause={() => setIsPaused(true)}
            onMissionComplete={handleRideComplete}
            onMainMenu={() => setCurrentScreen(AppScreen.MAIN_MENU)}
            onExit={() => setCurrentScreen(AppScreen.SPLASH)}
          />
        );

      case AppScreen.TRAINING:
        return (
          <TrainingScreen 
            onBack={() => setCurrentScreen(AppScreen.MAIN_MENU)}
            onCalibrationComplete={() => {
              // Mark the training done & load Main Menu
              setCurrentScreen(AppScreen.MAIN_MENU);
            }}
          />
        );

      case AppScreen.SETTINGS:
        return (
          <SettingsScreen 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onBack={() => setCurrentScreen(AppScreen.MAIN_MENU)}
          />
        );

      case AppScreen.CONTROLS:
        return (
          <ControlsScreen 
            onBack={() => setCurrentScreen(AppScreen.MAIN_MENU)}
            gestureControls={gestureControls}
            onUpdateGesture={handleUpdateGesture}
          />
        );

      case AppScreen.PROFILE:
        return (
          <ProfileScreen 
            achievements={achievements}
            recentLogs={recentLogs}
            topSpeed={topSpeed}
            totalDistance={totalDistance}
            onBack={() => setCurrentScreen(AppScreen.MAIN_MENU)}
          />
        );

      default:
        return <SplashScreen onComplete={() => setCurrentScreen(AppScreen.MAIN_MENU)} />;
    }
  };

  return (
    <div id="rider-v-sync-app" className="relative w-screen h-screen overflow-hidden bg-[#121414] text-[#e2e2e2] font-sans">
      
      {/* Dynamic Screen viewport */}
      {renderScreen()}

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <PauseMenu 
          onResume={() => setIsPaused(false)}
          onRestart={handleRestartRide}
          onSettings={() => {
            setIsPaused(false);
            setCurrentScreen(AppScreen.SETTINGS);
          }}
          onMainMenu={() => {
            setIsPaused(false);
            setCurrentScreen(AppScreen.MAIN_MENU);
          }}
        />
      )}

      {/* EXIT DIALOG OVERLAY */}
      {showExitDialog && (
        <ExitDialog 
          onConfirm={() => {
            setShowExitDialog(false);
            setCurrentScreen(AppScreen.SPLASH); // reset to splash on exit
          }}
          onCancel={() => setShowExitDialog(false)}
        />
      )}

      {/* MISSION SUCCESS COMPLETE CELEBRATION OVERLAY */}
      {missionCompleteStats && (
        <MissionComplete 
          topSpeed={missionCompleteStats.topSpeed}
          distance={missionCompleteStats.distance}
          maxLean={missionCompleteStats.maxLean}
          safetyRating={missionCompleteStats.safetyRating}
          onRestart={handleRestartRide}
          onMainMenu={() => {
            setMissionCompleteStats(null);
            setCurrentScreen(AppScreen.MAIN_MENU);
          }}
        />
      )}
    </div>
  );
}
