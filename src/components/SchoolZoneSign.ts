/**
 * SchoolZoneSign Component
 * Renders a high-fidelity visual school zone sign pole on the 2D Canvas.
 * Correctly handles perspective projection, distance scaling, and horizontal road scrolling.
 */

export interface SchoolZoneSignProps {
  ctx: CanvasRenderingContext2D;
  distanceMeters: number;
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

export function drawSchoolZoneSign({
  ctx,
  distanceMeters,
  currentPhysics,
  canvasWidth,
  canvasHeight,
  horizonY,
  horizonDist,
  roadW_Top,
  roadW_Bottom,
  centerTopX,
  centerBottomX,
}: SchoolZoneSignProps) {
  // Use same scrolling multiplier as visualDist (* 4.0)
  const d = (distanceMeters - currentPhysics.distanceTraveled) * 4.0;
  
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
    // Apply a robust 4.0x scaling factor to match the traffic signal pole size!
    ctx.scale(r * 4.0, r * 4.0);
    
    // 1. Draw Pedestal Base Box (Vertical cabinet at ground level)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-10, -35, 20, 35, 4);
    ctx.fill();
    ctx.stroke();
    
    // 2. Draw support pole
    ctx.fillStyle = '#475569';
    ctx.fillRect(-3, -135, 6, 100);
    
    // Collar ring
    ctx.fillStyle = '#334155';
    ctx.fillRect(-5, -133, 10, 4);
    
    // 3. Draw Yellow school warning board with neon borders
    // Triangular warning sign (pointing up) centered at (0, -180).
    const centerY = -180;
    const signWidth = 54;
    const signHeight = 48;
    
    ctx.save();
    // Shadow glow for neon aesthetic
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444'; // Red glowing light border
    
    // Outer red triangle
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, centerY - signHeight / 2 - 4);
    ctx.lineTo(-signWidth / 2 - 4, centerY + signHeight / 2 + 2);
    ctx.lineTo(signWidth / 2 + 4, centerY + signHeight / 2 + 2);
    ctx.closePath();
    ctx.fill();
    
    // Inner white/cream triangle (creates red border)
    ctx.fillStyle = '#f8fafc'; // clean white
    ctx.shadowBlur = 0; // turn off shadow for inner details
    ctx.beginPath();
    ctx.moveTo(0, centerY - signHeight / 2 + 4);
    ctx.lineTo(-signWidth / 2 + 3, centerY + signHeight / 2 - 2);
    ctx.lineTo(signWidth / 2 - 3, centerY + signHeight / 2 - 2);
    ctx.closePath();
    ctx.fill();
    
    // 4. Draw Children Crossing Silhouette (vector style, black)
    ctx.fillStyle = '#0f172a'; // Deep slate/black
    
    // Figure 1 (Left - Taller child)
    // Head
    ctx.beginPath();
    ctx.arc(-5, centerY + 2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Torso
    ctx.beginPath();
    ctx.moveTo(-8, centerY + 7);
    ctx.lineTo(-2, centerY + 7);
    ctx.lineTo(-4, centerY + 16);
    ctx.lineTo(-6, centerY + 16);
    ctx.closePath();
    ctx.fill();
    // Legs
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-6, centerY + 16);
    ctx.lineTo(-8, centerY + 23);
    ctx.moveTo(-4, centerY + 16);
    ctx.lineTo(-2, centerY + 23);
    // Arms
    ctx.moveTo(-7, centerY + 9);
    ctx.lineTo(-12, centerY + 14); // arm out
    ctx.moveTo(-3, centerY + 9);
    ctx.lineTo(1, centerY + 12); // holding hand
    ctx.stroke();
    
    // Figure 2 (Right - Shorter child)
    // Head
    ctx.beginPath();
    ctx.arc(4, centerY + 5, 2.8, 0, Math.PI * 2);
    ctx.fill();
    // Torso
    ctx.beginPath();
    ctx.moveTo(1.5, centerY + 9);
    ctx.lineTo(6.5, centerY + 9);
    ctx.lineTo(5, centerY + 16);
    ctx.lineTo(3, centerY + 16);
    ctx.closePath();
    ctx.fill();
    // Legs
    ctx.beginPath();
    ctx.moveTo(3.5, centerY + 16);
    ctx.lineTo(2, centerY + 22);
    ctx.moveTo(4.5, centerY + 16);
    ctx.lineTo(6, centerY + 22);
    // Arms
    ctx.moveTo(2.5, centerY + 10);
    ctx.lineTo(-1, centerY + 12); // holding hand
    ctx.moveTo(5.5, centerY + 10);
    ctx.lineTo(10, centerY + 15); // arm out
    ctx.stroke();
    
    ctx.restore(); // sign shadow
    ctx.restore(); // scale translation
  }
}
