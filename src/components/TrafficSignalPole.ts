/**
 * TrafficSignalPole Component
 * Renders a high-fidelity visual traffic signal pole on the 2D Canvas.
 * Correctly handles perspective projection, distance scaling, and horizontal road scrolling.
 */

export interface TrafficSignalPoleProps {
  ctx: CanvasRenderingContext2D;
  activeSignal: {
    distanceMeters: number;
    state: 'RED' | 'YELLOW_TO_GREEN' | 'GREEN' | 'YELLOW_TO_RED';
    timer: number;
  };
  currentPhysics: {
    distanceTraveled: number;
    leanAngle: number;
  };
  canvasWidth: number;
  canvasHeight: number;
  horizonY: number;
  horizonDist: number;
  roadW_Top: number;
  roadW_Bottom: number;
  centerTopX: number;
  centerBottomX: number;
}

export function drawTrafficSignalPole({
  ctx,
  activeSignal,
  currentPhysics,
  canvasWidth,
  canvasHeight,
  horizonY,
  horizonDist,
  roadW_Top,
  roadW_Bottom,
  centerTopX,
  centerBottomX,
}: TrafficSignalPoleProps) {
  // Use same scrolling multiplier as visualDist (* 4.0)
  const d = (activeSignal.distanceMeters - currentPhysics.distanceTraveled) * 4.0;
  
  // Only draw if within visual depth and in front of the camera (d > -11.5)
  if (d > -11.5 && d < 160) {
    const r = horizonDist / (d + horizonDist);
    const y = horizonY + r * (canvasHeight - horizonY);
    const currentRoadW = roadW_Top + r * (roadW_Bottom - roadW_Top);
    const centerX = centerTopX + r * (centerBottomX - centerTopX);
    
    // Place on the right side of the road, with an appropriate offset on the shoulder
    const x = centerX + (currentRoadW / 2 + 65 * r);
    
    ctx.save();
    ctx.translate(x, y);
    // Apply a robust 4.0x scaling factor to make the pole tall, big, and highly visible
    ctx.scale(r * 4.0, r * 4.0);
    
    // 1. Draw Pedestal Base Box (Vertical cabinet at ground level)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-10, -35, 20, 35, 4);
    ctx.fill();
    ctx.stroke();
    
    // Circuit indicator dots inside pedestal box (three orange dots horizontally)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(-5, -18, 1.5, 0, Math.PI * 2);
    ctx.arc(0, -18, 1.5, 0, Math.PI * 2);
    ctx.arc(5, -18, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. Draw Thick Metallic Support Pole
    ctx.fillStyle = '#475569';
    ctx.fillRect(-4, -135, 8, 100);
    
    // Decorative collar ring
    ctx.fillStyle = '#334155';
    ctx.fillRect(-6, -133, 12, 5);
    
    // 3. Draw Casing/Housing (Rounded Vertical Rectangle with cyan cyber border)
    ctx.fillStyle = '#0a0e14';
    ctx.strokeStyle = '#00fbfb'; // Sleek cyber-cyan border
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-22, -250, 44, 120, 14);
    ctx.fill();
    ctx.stroke();
    
    // Small top cap finial
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-5, -259, 10, 9, [3, 3, 0, 0]);
    ctx.fill();
    
    const isRed = activeSignal.state === 'RED';
    const isYellow = activeSignal.state === 'YELLOW_TO_GREEN' || activeSignal.state === 'YELLOW_TO_RED';
    const isGreen = activeSignal.state === 'GREEN';

    // RED Light (Top)
    ctx.save();
    if (isRed) {
      ctx.shadowBlur = 60;
      ctx.shadowColor = '#ff1111';
      ctx.fillStyle = '#ff1111';
    } else {
      ctx.fillStyle = '#2d0505';
    }
    ctx.beginPath();
    ctx.arc(0, -215, 13, 0, Math.PI * 2);
    ctx.fill();
    if (isRed) {
      // Inner hot core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -215, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // YELLOW Light (Middle)
    ctx.save();
    if (isYellow) {
      ctx.shadowBlur = 60;
      ctx.shadowColor = '#fbbf24';
      ctx.fillStyle = '#ffbf00';
    } else {
      ctx.fillStyle = '#2d1a02';
    }
    ctx.beginPath();
    ctx.arc(0, -185, 13, 0, Math.PI * 2);
    ctx.fill();
    if (isYellow) {
      // Inner hot core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -185, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // GREEN Light (Bottom)
    ctx.save();
    if (isGreen) {
      ctx.shadowBlur = 60;
      ctx.shadowColor = '#00ffcc';
      ctx.fillStyle = '#00ff66';
    } else {
      ctx.fillStyle = '#022412';
    }
    ctx.beginPath();
    ctx.arc(0, -155, 13, 0, Math.PI * 2);
    ctx.fill();
    if (isGreen) {
      // Inner hot core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -155, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    ctx.restore();
  }
}
