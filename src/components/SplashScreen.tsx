/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Smooth incremental steps
      current += Math.random() * 8 + 2;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
      setProgress(Math.min(current, 100));
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#121414] text-[#e2e2e2] flex flex-col items-center justify-center">
      {/* Background Silhouette */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center mix-blend-screen opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDd1uNJT8M3i4GWqldLYR2MA9UHz77wHM6b8_eQAgvSUXSKXyQ_rfRrdY0ySjKhRtHDY0G7MORt2v9rHllNCtGB_WhEQBcPSj1gArIm8aCCAKKnvWB2djKK64rq2BGYwMgkvpX022_2ILypAGadWkqNd14NrmTQVKO_BEEY1OTYv1nKQEYYXWRvnDCP4PPamhWIxgkplEIHzaL8paxCvDhaASfo4i9mdkMtD8EKUotCVetzvGMFxQlrtlTdd-pb8xKZcGaihgdUOnM')`
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        {/* Logo */}
        <div className="mb-12 relative group">
          <div className="absolute inset-0 rounded-full blur-3xl opacity-40 bg-[#448fff] group-hover:opacity-60 transition-opacity duration-1000 animate-pulse" />
          <img 
            alt="Rider V Sync Logo" 
            className="w-56 h-56 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(0,251,251,0.3)] select-none pointer-events-none" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSyh8mAmO3SXKFd9CipS5m-mzAr3qJ4X7Ah6VRfxXQfEvra9TsZrSoakOhtQozlEEfqBlb4n-JWW7geGL7lBe52dyrb7ritcWdjnGSKj0yNBf3YlL0llme6LBUxEuSV6wTVRfb5n4VQTiWMELhSjps_4pA6aAwsNJtJPp9YSMpxo8TC296aaGEfN7ycn_on0_3d6nP69E_OHxKxlOw7T1EyxNvsBcucexl0zZ8arTBzdolywpDURyhbgflZll6BqMM5F4IROD4mWA"
          />
        </div>

        {/* Loading Bar Container */}
        <div className="w-full mt-6 flex flex-col items-center">
          <p className="font-mono text-xs text-[#00fbfb] mb-2 opacity-80 tracking-widest uppercase animate-pulse">
            Initializing Telemetry... {Math.round(progress)}%
          </p>
          <div className="w-full h-2 bg-[#282a2b] rounded-full overflow-hidden relative border border-white/5 shadow-inner">
            {/* Inner glow/border effect for the track */}
            <div className="absolute inset-0 border border-white/10 rounded-full" />
            {/* The progress indicator */}
            <div 
              className="h-full bg-gradient-to-r from-[#007FFF] to-[#00fbfb] rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(0,255,255,0.7)]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-6 z-10">
        <p className="font-mono text-xs text-[#c1c6d7] opacity-40 uppercase tracking-[0.2em]">
          STITCH STUDIOS © 2026
        </p>
      </div>
    </div>
  );
}
