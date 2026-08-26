import React, { useEffect, useRef } from 'react';
import { FloatingParticle, InteractiveSpark } from '../types';

interface ThreadCanvasProps {
  currentTime: number;
  isPlaying: boolean;
  onCanvasClick?: (x: number, y: number) => void;
}

// Generate organic hand-drawn wobble for thread points
function addWobble(points: { x: number; y: number }[], wobbleAmount = 0.8): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const angle = i * 0.8 + Math.sin(i * 1.5) * 2;
    const offset = Math.sin(i * 2.2) * wobbleAmount;
    result.push({
      x: p.x + Math.cos(angle) * offset,
      y: p.y + Math.sin(angle) * offset,
    });
  }
  return result;
}

export const ThreadCanvas: React.FC<ThreadCanvasProps> = ({
  currentTime,
  isPlaying,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Background floating ambient particles & touch sparks
  const particlesRef = useRef<FloatingParticle[]>([]);
  const sparksRef = useRef<InteractiveSpark[]>([]);

  useEffect(() => {
    const particles: FloatingParticle[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.4 + 0.1,
        speedX: (Math.random() - 0.5) * 0.00008,
        speedY: -Math.random() * 0.00015 - 0.00004,
        phase: Math.random() * Math.PI * 2,
        color: i % 3 === 0 ? 'rgba(212, 175, 55,' : 'rgba(240, 230, 210,',
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    let animationTime = 0;

    const render = () => {
      if (!canvas || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      animationTime += 0.016;

      // Deep canvas background with warm radial illumination
      ctx.clearRect(0, 0, width, height);
      const radialGlow = ctx.createRadialGradient(
        width * 0.5, height * 0.44, 10,
        width * 0.5, height * 0.44, Math.min(width, height) * 0.88
      );
      radialGlow.addColorStop(0, 'rgba(26, 26, 36, 0.7)');
      radialGlow.addColorStop(0.55, 'rgba(15, 15, 20, 0.9)');
      radialGlow.addColorStop(1, 'rgba(9, 9, 11, 0.98)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 1. Ambient Floating Star Dust
      for (const p of particlesRef.current) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) p.y = 1;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;

        const pulse = Math.sin(animationTime * 1.5 + p.phase) * 0.25 + 0.75;
        const currentAlpha = p.alpha * pulse;

        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${currentAlpha})`;
        ctx.fill();
      }

      // Fast drawing progress & fade calculations
      // Draws in drawDuration (e.g. 2.2s), stays visible, then clears before next line
      const getFastPhase = (start: number, end: number, drawDuration: number = 2.2) => {
        if (currentTime < start || currentTime > end) {
          return { progress: 0, alpha: 0, active: false };
        }

        const elapsed = currentTime - start;
        const remaining = end - currentTime;
        const progress = Math.min(1, Math.max(0, elapsed / drawDuration));

        // Fade in rapidly over 0.2s, fade out smoothly over 0.6s at end
        let alpha = 1;
        if (elapsed < 0.2) {
          alpha = elapsed / 0.2;
        } else if (remaining < 0.6) {
          alpha = Math.max(0, remaining / 0.6);
        }

        return { progress, alpha, active: true };
      };

      // Helper function to draw glowing thread stroke
      const drawThreadStroke = (
        points: { x: number; y: number }[],
        progress: number,
        opacityMultiplier: number = 1,
        strokeColor = 'rgba(255, 245, 220,',
        glowColor = 'rgba(212, 175, 55,',
        lineWidth = 1.45,
        hasLeadSpark = true
      ) => {
        if (progress <= 0 || opacityMultiplier <= 0.01 || points.length < 2) return;

        const totalSegments = points.length - 1;
        const currentProgressLength = totalSegments * Math.min(1, Math.max(0, progress));
        const fullSegments = Math.floor(currentProgressLength);
        const partial = currentProgressLength - fullSegments;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = `${glowColor} ${0.6 * opacityMultiplier})`;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = `${strokeColor} ${0.95 * opacityMultiplier})`;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i <= fullSegments; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }

        let leadPoint = points[0];
        if (fullSegments < totalSegments && partial > 0) {
          const p1 = points[fullSegments];
          const p2 = points[fullSegments + 1];
          const currX = p1.x + (p2.x - p1.x) * partial;
          const currY = p1.y + (p2.y - p1.y) * partial;
          ctx.lineTo(currX, currY);
          leadPoint = { x: currX, y: currY };
        } else if (fullSegments >= totalSegments) {
          leadPoint = points[points.length - 1];
        }

        ctx.stroke();

        // Glowing golden needle spark while drawing
        if (hasLeadSpark && progress < 0.999 && opacityMultiplier > 0.3) {
          ctx.shadowBlur = 14;
          ctx.shadowColor = 'rgba(255, 240, 200, 0.95)';
          ctx.fillStyle = `rgba(255, 255, 245, ${opacityMultiplier})`;
          ctx.beginPath();
          ctx.arc(leadPoint.x, leadPoint.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle cross flare
          ctx.strokeStyle = `rgba(245, 215, 120, ${0.9 * opacityMultiplier})`;
          ctx.lineWidth = 1.2;
          const sparkSize = 5 + Math.sin(animationTime * 10) * 2;
          ctx.beginPath();
          ctx.moveTo(leadPoint.x - sparkSize, leadPoint.y);
          ctx.lineTo(leadPoint.x + sparkSize, leadPoint.y);
          ctx.moveTo(leadPoint.x, leadPoint.y - sparkSize);
          ctx.lineTo(leadPoint.x, leadPoint.y + sparkSize);
          ctx.stroke();
        }

        ctx.restore();
      };

      // =========================================================================
      // 1. FAST DRAWING: "WAITING EYES" (0.0s - 7.2s)
      // "As all the fools on parade cavort and carry on for waiting eyes"
      // Fast drawing in 2.6s, visible & glowing, then clears when line ends (7.2s)
      // =========================================================================
      const eyesPhase = getFastPhase(0.0, 7.2, 2.6);
      if (eyesPhase.active) {
        const eyeY = height * 0.40;
        const eyeSpacing = Math.min(width * 0.22, 85);
        const eyeW = Math.min(width * 0.18, 68);
        const eyeH = eyeW * 0.58;

        const leftCenter = { x: width * 0.5 - eyeSpacing, y: eyeY };
        const rightCenter = { x: width * 0.5 + eyeSpacing, y: eyeY };

        // Dynamic fast sub-progressions
        const pUpper = Math.min(1, eyesPhase.progress / 0.45);
        const pLower = Math.min(1, Math.max(0, (eyesPhase.progress - 0.2) / 0.4));
        const pIris = Math.min(1, Math.max(0, (eyesPhase.progress - 0.45) / 0.35));
        const pLashes = Math.min(1, Math.max(0, (eyesPhase.progress - 0.65) / 0.35));

        // Subtle lifelike flutter
        const blinkAmount = eyesPhase.progress >= 1 ? Math.max(0, Math.sin(animationTime * 2.2) - 0.93) * 12 : 0;
        const currentEyeH = Math.max(2, eyeH * (1 - blinkAmount));

        [leftCenter, rightCenter].forEach((c, isRight) => {
          // Upper eyelid arch
          const upperPts: { x: number; y: number }[] = [];
          const uSteps = 24;
          for (let i = 0; i <= uSteps; i++) {
            const u = i / uSteps;
            const x = c.x - eyeW + u * (eyeW * 2);
            const arch = Math.sin(u * Math.PI) * currentEyeH;
            upperPts.push({ x, y: c.y - arch });
          }
          drawThreadStroke(addWobble(upperPts, 0.5), pUpper, eyesPhase.alpha, 'rgba(255, 245, 225,', 'rgba(212, 175, 55,', 1.6, true);

          // Lower eyelid arch
          const lowerPts: { x: number; y: number }[] = [];
          const lSteps = 20;
          for (let i = 0; i <= lSteps; i++) {
            const u = i / lSteps;
            const x = c.x - eyeW + u * (eyeW * 2);
            const arch = Math.sin(u * Math.PI) * (currentEyeH * 0.7);
            lowerPts.push({ x, y: c.y + arch });
          }
          drawThreadStroke(addWobble(lowerPts, 0.4), pLower, eyesPhase.alpha, 'rgba(240, 225, 200,', 'rgba(212, 175, 55,', 1.3, false);

          // Iris & Glowing Pupil
          if (pIris > 0 && currentEyeH > 5) {
            const irisPts: { x: number; y: number }[] = [];
            const iSteps = 26;
            const irisRadius = currentEyeH * 0.78;
            for (let i = 0; i <= iSteps; i++) {
              const ang = (i / iSteps) * Math.PI * 2;
              irisPts.push({
                x: c.x + Math.cos(ang) * irisRadius,
                y: c.y + Math.sin(ang) * irisRadius * 0.92,
              });
            }
            drawThreadStroke(addWobble(irisPts, 0.4), pIris, eyesPhase.alpha, 'rgba(255, 220, 130,', 'rgba(245, 180, 80,', 1.4, false);

            if (pIris > 0.5) {
              const pupilAlpha = (pIris - 0.5) / 0.5 * eyesPhase.alpha;
              ctx.save();
              ctx.shadowBlur = 12;
              ctx.shadowColor = 'rgba(255, 230, 160, 0.9)';
              ctx.fillStyle = `rgba(255, 245, 220, ${pupilAlpha * 0.95})`;
              ctx.beginPath();
              ctx.arc(c.x + 2, c.y - 2, 3.4, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }

          // Sweeping Eyelashes
          if (pLashes > 0) {
            const lashAngles = [-0.6, -0.3, 0, 0.3, 0.6];
            lashAngles.forEach((ang, lIdx) => {
              const lashP = Math.min(1, Math.max(0, (pLashes - lIdx * 0.15) / 0.4));
              if (lashP <= 0) return;
              const u = (ang + 0.8) / 1.6;
              const baseX = c.x - eyeW * 0.8 + u * (eyeW * 1.6);
              const baseY = c.y - Math.sin(u * Math.PI) * currentEyeH;
              const dir = isRight ? 1 : -1;
              const lashLen = 15;
              const endX = baseX + (ang * 9 + dir * 3);
              const endY = baseY - lashLen;
              drawThreadStroke(
                [{ x: baseX, y: baseY }, { x: endX, y: endY }],
                lashP,
                eyesPhase.alpha,
                'rgba(245, 225, 195,',
                'rgba(212, 175, 55,',
                1.15,
                false
              );
            });
          }

          // Eyebrow Curve
          const browPts: { x: number; y: number }[] = [];
          const bSteps = 16;
          const browY = c.y - currentEyeH - 18;
          for (let i = 0; i <= bSteps; i++) {
            const u = i / bSteps;
            const bx = c.x - eyeW * 1.1 + u * (eyeW * 2.2);
            const by = browY - Math.sin(u * Math.PI) * 8;
            browPts.push({ x: bx, y: by });
          }
          drawThreadStroke(addWobble(browPts, 0.4), pUpper, eyesPhase.alpha, 'rgba(235, 215, 185,', 'rgba(212, 175, 55,', 1.2, false);
        });

        // Bridge flourish between eyes
        if (eyesPhase.progress > 0.75) {
          const bridgeP = (eyesPhase.progress - 0.75) / 0.25;
          const bridgePts: { x: number; y: number }[] = [];
          for (let i = 0; i <= 16; i++) {
            const u = i / 16;
            const bx = leftCenter.x + eyeW + u * (rightCenter.x - eyeW - (leftCenter.x + eyeW));
            const by = eyeY - Math.sin(u * Math.PI) * 10;
            bridgePts.push({ x: bx, y: by });
          }
          drawThreadStroke(addWobble(bridgePts, 0.4), bridgeP, eyesPhase.alpha, 'rgba(212, 175, 55,', 'rgba(212, 175, 55,', 1.1, false);
        }
      }

      // =========================================================================
      // 2. FAST DRAWING: "STARS & CONSTELLATIONS" (7.3s - 15.2s)
      // "Ones you would rather be beside than in front of, but she's never been the kind to be hollowed by the stares"
      // Fast drawing in 2.8s, stars shimmer & radiate, then clears cleanly at 15.2s
      // =========================================================================
      const starsPhase = getFastPhase(7.3, 15.2, 2.8);
      if (starsPhase.active) {
        const starLocations = [
          { x: width * 0.5, y: height * 0.32, r: 24, pts: 8, delay: 0.0 }, // Central radiant star
          { x: width * 0.22, y: height * 0.24, r: 16, pts: 6, delay: 0.15 },
          { x: width * 0.78, y: height * 0.22, r: 18, pts: 6, delay: 0.25 },
          { x: width * 0.18, y: height * 0.46, r: 14, pts: 8, delay: 0.35 },
          { x: width * 0.82, y: height * 0.44, r: 15, pts: 8, delay: 0.45 },
          { x: width * 0.34, y: height * 0.52, r: 12, pts: 5, delay: 0.55 },
          { x: width * 0.66, y: height * 0.50, r: 13, pts: 5, delay: 0.65 },
        ];

        // Draw connecting constellation lines
        if (starsPhase.progress > 0.4) {
          const constelP = (starsPhase.progress - 0.4) / 0.6;
          const constellationPaths = [
            [{ x: width * 0.22, y: height * 0.24 }, { x: width * 0.5, y: height * 0.32 }],
            [{ x: width * 0.5, y: height * 0.32 }, { x: width * 0.78, y: height * 0.22 }],
            [{ x: width * 0.18, y: height * 0.46 }, { x: width * 0.34, y: height * 0.52 }],
            [{ x: width * 0.34, y: height * 0.52 }, { x: width * 0.5, y: height * 0.32 }],
            [{ x: width * 0.5, y: height * 0.32 }, { x: width * 0.66, y: height * 0.50 }],
            [{ x: width * 0.66, y: height * 0.50 }, { x: width * 0.82, y: height * 0.44 }],
          ];

          constellationPaths.forEach((path) => {
            drawThreadStroke(
              path,
              constelP,
              starsPhase.alpha * 0.65,
              'rgba(212, 175, 55,',
              'rgba(212, 175, 55,',
              1.0,
              false
            );
          });
        }

        // Draw radiant stars
        starLocations.forEach((st) => {
          const sp = Math.min(1, Math.max(0, (starsPhase.progress - st.delay) / 0.4));
          if (sp <= 0) return;

          const stPts: { x: number; y: number }[] = [];
          const numPts = st.pts;
          const twinkle = 1 + Math.sin(animationTime * 4 + st.x) * 0.12;
          const outerR = st.r * twinkle;
          const innerR = st.r * 0.35 * twinkle;

          for (let i = 0; i <= numPts * 2; i++) {
            const angle = (i / (numPts * 2)) * Math.PI * 2 - Math.PI / 2;
            const rad = i % 2 === 0 ? outerR : innerR;
            stPts.push({
              x: st.x + Math.cos(angle) * rad,
              y: st.y + Math.sin(angle) * rad,
            });
          }

          drawThreadStroke(
            addWobble(stPts, 0.4),
            sp,
            starsPhase.alpha,
            'rgba(255, 245, 215,',
            'rgba(245, 205, 100,',
            1.4,
            true
          );

          // Center shining flare core
          if (sp > 0.6) {
            ctx.save();
            ctx.shadowBlur = 14;
            ctx.shadowColor = 'rgba(255, 225, 140, 0.9)';
            ctx.fillStyle = `rgba(255, 250, 230, ${starsPhase.alpha * 0.9})`;
            ctx.beginPath();
            ctx.arc(st.x, st.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }

      // =========================================================================
      // 3. FAST DRAWING: "PARADE MASQUERADE CROWN" (15.2s - 18.0s)
      // "Fools on parade"
      // Draws fast in 1.4s, clears at 18.0s
      // =========================================================================
      const crownPhase = getFastPhase(15.2, 18.0, 1.4);
      if (crownPhase.active) {
        const cCx = width * 0.5;
        const cCy = height * 0.38;
        const crownW = Math.min(width * 0.42, 140);

        const crownPts: { x: number; y: number }[] = [
          { x: cCx - crownW * 0.5, y: cCy + 15 },
          { x: cCx - crownW * 0.5, y: cCy - 10 },
          { x: cCx - crownW * 0.25, y: cCy + 5 },
          { x: cCx, y: cCy - 28 }, // High center peak
          { x: cCx + crownW * 0.25, y: cCy + 5 },
          { x: cCx + crownW * 0.5, y: cCy - 10 },
          { x: cCx + crownW * 0.5, y: cCy + 15 },
          { x: cCx - crownW * 0.5, y: cCy + 15 },
        ];

        drawThreadStroke(
          addWobble(crownPts, 0.6),
          crownPhase.progress,
          crownPhase.alpha,
          'rgba(255, 230, 150,',
          'rgba(212, 175, 55,',
          1.6,
          true
        );

        // Crown jewels
        if (crownPhase.progress > 0.6) {
          const jewelAlpha = crownPhase.alpha * 0.95;
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(255, 215, 120, 0.9)';
          ctx.fillStyle = `rgba(255, 245, 220, ${jewelAlpha})`;

          // Center jewel
          ctx.beginPath();
          ctx.arc(cCx, cCy - 28, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Left & right jewels
          ctx.beginPath();
          ctx.arc(cCx - crownW * 0.5, cCy - 10, 2.5, 0, Math.PI * 2);
          ctx.arc(cCx + crownW * 0.5, cCy - 10, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // =========================================================================
      // 4. FAST DRAWING: "FROLIC DANCE SWIRLS & HEARTS" (18.0s - 22.0s)
      // "Frolic and dance about to make a gaze"
      // Draws in 1.8s, clears at 22.0s
      // =========================================================================
      const frolicPhase = getFastPhase(18.0, 22.0, 1.8);
      if (frolicPhase.active) {
        const gCx = width * 0.5;
        const gCy = height * 0.38;

        // Dynamic dancing spiral ribbon
        const swirlPts: { x: number; y: number }[] = [];
        const sSteps = 48;
        for (let i = 0; i <= sSteps; i++) {
          const u = i / sSteps;
          const ang = u * Math.PI * 5 + animationTime * 1.2;
          const rad = 20 + u * Math.min(width * 0.38, 130);
          swirlPts.push({
            x: gCx + Math.cos(ang) * rad,
            y: gCy + Math.sin(ang) * (rad * 0.65),
          });
        }
        drawThreadStroke(
          addWobble(swirlPts, 0.7),
          frolicPhase.progress,
          frolicPhase.alpha,
          'rgba(245, 215, 160,',
          'rgba(212, 175, 55,',
          1.35,
          true
        );

        // Dancing twin hearts
        if (frolicPhase.progress > 0.4) {
          const hP = (frolicPhase.progress - 0.4) / 0.6;
          const hearts = [
            { cx: gCx - 40, cy: gCy - 20, size: 16, rot: -0.2 },
            { cx: gCx + 40, cy: gCy + 15, size: 18, rot: 0.2 },
          ];
          hearts.forEach((h) => {
            const hPts: { x: number; y: number }[] = [];
            for (let i = 0; i <= 32; i++) {
              const ang = (i / 32) * Math.PI * 2;
              const hx = 16 * Math.pow(Math.sin(ang), 3);
              const hy = -(13 * Math.cos(ang) - 5 * Math.cos(2 * ang) - 2 * Math.cos(3 * ang) - Math.cos(4 * ang));
              const scale = h.size / 16;
              const rx = (hx * Math.cos(h.rot) - hy * Math.sin(h.rot)) * scale;
              const ry = (hx * Math.sin(h.rot) + hy * Math.cos(h.rot)) * scale;
              hPts.push({ x: h.cx + rx, y: h.cy + ry });
            }
            drawThreadStroke(
              addWobble(hPts, 0.5),
              hP,
              frolicPhase.alpha,
              'rgba(255, 210, 225,',
              'rgba(244, 114, 182,',
              1.4,
              false
            );
          });
        }
      }

      // =========================================================================
      // 5. FAST DRAWING: "PICTURE FRAME & SCRIBBLE SILHOUETTE" (22.0s - 28.0s)
      // "Turn to a scribble on a page by a picture that hold her absence"
      // Draws in 2.2s, clears at 28.0s
      // =========================================================================
      const framePhase = getFastPhase(22.0, 28.0, 2.2);
      if (framePhase.active) {
        const fWidth = Math.min(width * 0.48, 160);
        const fHeight = fWidth * 1.25;
        const fLeft = width * 0.5 - fWidth * 0.5;
        const fTop = height * 0.30;

        // Picture frame outline
        const frameBorderPts: { x: number; y: number }[] = [
          { x: fLeft, y: fTop },
          { x: fLeft + fWidth, y: fTop },
          { x: fLeft + fWidth, y: fTop + fHeight },
          { x: fLeft, y: fTop + fHeight },
          { x: fLeft, y: fTop },
        ];
        drawThreadStroke(
          addWobble(frameBorderPts, 0.5),
          framePhase.progress,
          framePhase.alpha,
          'rgba(240, 230, 210,',
          'rgba(212, 175, 55,',
          1.4,
          true
        );

        // Portrait silhouette scribble inside
        if (framePhase.progress > 0.35) {
          const pScribble = (framePhase.progress - 0.35) / 0.65;
          const scribblePts: { x: number; y: number }[] = [];
          const scrSteps = 30;
          for (let i = 0; i <= scrSteps; i++) {
            const u = i / scrSteps;
            const sx = fLeft + 18 + Math.sin(u * Math.PI * 4) * (fWidth * 0.36) + (fWidth * 0.36);
            const sy = fTop + 20 + u * (fHeight - 40) + Math.cos(u * Math.PI * 5) * 5;
            scribblePts.push({ x: sx, y: sy });
          }
          drawThreadStroke(
            addWobble(scribblePts, 0.8),
            pScribble,
            framePhase.alpha,
            'rgba(255, 205, 225,',
            'rgba(244, 114, 182,',
            1.25,
            true
          );
        }
      }

      // =========================================================================
      // 6. FAST DRAWING: "SPROUTING STEM & LEAVES" (28.0s - 31.0s)
      // "But you'd have to think she cares"
      // Draws rapidly in 1.6s, rises smoothly toward bloom
      // =========================================================================
      const stemPhase = getFastPhase(28.0, 31.0, 1.6);
      const flowerBaseX = width * 0.5;
      const flowerBaseY = height * 0.58;
      const stemHeight = Math.min(height * 0.26, 170);
      const flowerHeadY = flowerBaseY - stemHeight;

      if (stemPhase.active) {
        const stemPts: { x: number; y: number }[] = [];
        const sSteps = 28;
        for (let i = 0; i <= sSteps; i++) {
          const u = i / sSteps;
          const sy = flowerBaseY - u * stemHeight;
          const sx = flowerBaseX + Math.sin(u * Math.PI * 2) * 8;
          stemPts.push({ x: sx, y: sy });
        }
        drawThreadStroke(
          addWobble(stemPts, 0.5),
          stemPhase.progress,
          stemPhase.alpha,
          'rgba(200, 240, 205,',
          'rgba(150, 225, 170,',
          1.5,
          true
        );

        if (stemPhase.progress > 0.5) {
          const leafP = (stemPhase.progress - 0.5) / 0.5;
          // Left leaf
          const leftLeafPts = [
            { x: flowerBaseX - 2, y: flowerBaseY - stemHeight * 0.45 },
            { x: flowerBaseX - 30, y: flowerBaseY - stemHeight * 0.54 },
            { x: flowerBaseX - 40, y: flowerBaseY - stemHeight * 0.42 },
            { x: flowerBaseX - 2, y: flowerBaseY - stemHeight * 0.45 },
          ];
          drawThreadStroke(addWobble(leftLeafPts, 0.5), leafP, stemPhase.alpha, 'rgba(180, 235, 190,', 'rgba(140, 220, 160,', 1.3, false);

          // Right leaf
          const rightLeafPts = [
            { x: flowerBaseX + 2, y: flowerBaseY - stemHeight * 0.65 },
            { x: flowerBaseX + 32, y: flowerBaseY - stemHeight * 0.72 },
            { x: flowerBaseX + 42, y: flowerBaseY - stemHeight * 0.6 },
            { x: flowerBaseX + 2, y: flowerBaseY - stemHeight * 0.65 },
          ];
          drawThreadStroke(addWobble(rightLeafPts, 0.5), leafP, stemPhase.alpha, 'rgba(180, 235, 190,', 'rgba(140, 220, 160,', 1.3, false);
        }
      }

      // =========================================================================
      // 7. FAST DRAWING: "MAGNIFICENT FLOWER BLOOM" (31.0s - 37.5s)
      // "Fools on parade" (Climax bloom!)
      // Draws in 2.0s, radiates with pollen, clears at 37.5s
      // =========================================================================
      const bloomPhase = getFastPhase(31.0, 37.5, 2.0);
      if (bloomPhase.active) {
        const bloomScale = 0.4 + bloomPhase.progress * 0.6;
        const swayAngle = Math.sin(animationTime * 1.5) * 0.03;
        const fCenterX = flowerBaseX;
        const fCenterY = flowerHeadY;

        // Stem stays during bloom
        const stemPts: { x: number; y: number }[] = [];
        for (let i = 0; i <= 24; i++) {
          const u = i / 24;
          const sy = flowerBaseY - u * stemHeight;
          const sx = flowerBaseX + Math.sin(u * Math.PI * 2) * 8;
          stemPts.push({ x: sx, y: sy });
        }
        drawThreadStroke(addWobble(stemPts, 0.4), 1, bloomPhase.alpha * 0.7, 'rgba(200, 240, 205,', 'rgba(150, 225, 170,', 1.4, false);

        // 2 Layers of opening petals
        const petalLayers = [
          { count: 5, length: 32 * bloomScale, width: 18 * bloomScale, rotOffset: 0, color: 'rgba(255, 215, 230,', glow: 'rgba(244, 114, 182,' },
          { count: 7, length: 50 * bloomScale, width: 26 * bloomScale, rotOffset: 0.35, color: 'rgba(255, 240, 245,', glow: 'rgba(251, 146, 198,' },
        ];

        petalLayers.forEach((layer) => {
          for (let pIdx = 0; pIdx < layer.count; pIdx++) {
            const baseAngle = (pIdx / layer.count) * Math.PI * 2 + layer.rotOffset + swayAngle;
            const pLen = layer.length;
            const pWid = layer.width;

            const petalPts: { x: number; y: number }[] = [];
            const pSteps = 24;
            for (let s = 0; s <= pSteps; s++) {
              const u = s / pSteps;
              const ang = u * Math.PI * 2;
              const px = Math.sin(ang) * (pWid * 0.5) * (1 - Math.cos(ang) * 0.3);
              const py = -Math.cos(ang) * pLen * 0.5 - pLen * 0.5;

              const rx = px * Math.cos(baseAngle) - py * Math.sin(baseAngle);
              const ry = px * Math.sin(baseAngle) + py * Math.cos(baseAngle);
              petalPts.push({ x: fCenterX + rx, y: fCenterY + ry });
            }

            drawThreadStroke(
              addWobble(petalPts, 0.5),
              bloomPhase.progress,
              bloomPhase.alpha,
              layer.color,
              layer.glow,
              1.4,
              pIdx === layer.count - 1
            );
          }
        });

        // Glowing center stamen and pollen sparks
        if (bloomPhase.progress > 0.4) {
          ctx.save();
          ctx.shadowBlur = 14;
          ctx.shadowColor = 'rgba(255, 225, 140, 0.95)';
          ctx.fillStyle = `rgba(255, 245, 210, ${bloomPhase.alpha * 0.98})`;
          ctx.beginPath();
          ctx.arc(fCenterX, fCenterY, 5 * bloomScale, 0, Math.PI * 2);
          ctx.fill();

          // Pollen rising sparks
          for (let pl = 0; pl < 6; pl++) {
            const plSeed = pl * 1.2;
            const plTime = (animationTime * 0.9 + plSeed) % 3.5;
            const plProgress = plTime / 3.5;
            const plX = fCenterX + Math.sin(plProgress * 5 + plSeed) * 28;
            const plY = fCenterY - plProgress * 90;
            const plAlpha = (1 - plProgress) * 0.85 * bloomPhase.alpha;

            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(212, 175, 55, 0.7)';
            ctx.fillStyle = `rgba(255, 235, 170, ${plAlpha})`;
            ctx.beginPath();
            ctx.arc(plX, plY, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // =========================================================================
      // 8. FAST DRAWING: "SECRET DOOR & BUTTERFLIES" (37.5s - 43.0s)
      // "Fools on parade..."
      // Draws in 2.0s, stays until the ending romance card reveals
      // =========================================================================
      const doorPhase = getFastPhase(37.5, 43.0, 2.0);
      if (doorPhase.active) {
        const dWidth = Math.min(width * 0.42, 140);
        const dHeight = dWidth * 1.5;
        const dLeft = width * 0.5 - dWidth * 0.5;
        const dTop = height * 0.22;

        const doorPts: { x: number; y: number }[] = [];
        doorPts.push({ x: dLeft, y: dTop + dHeight });
        doorPts.push({ x: dLeft, y: dTop + dWidth * 0.5 });

        const archSteps = 24;
        const archR = dWidth * 0.5;
        const archCx = dLeft + archR;
        const archCy = dTop + archR;
        for (let a = 0; a <= archSteps; a++) {
          const ang = Math.PI - (a / archSteps) * Math.PI;
          doorPts.push({
            x: archCx + Math.cos(ang) * archR,
            y: archCy - Math.sin(ang) * archR,
          });
        }
        doorPts.push({ x: dLeft + dWidth, y: dTop + dWidth * 0.5 });
        doorPts.push({ x: dLeft + dWidth, y: dTop + dHeight });

        drawThreadStroke(
          addWobble(doorPts, 0.6),
          doorPhase.progress,
          doorPhase.alpha,
          'rgba(255, 235, 190,',
          'rgba(212, 175, 55,',
          1.5,
          true
        );

        // Keyhole glowing golden light
        if (doorPhase.progress > 0.6) {
          ctx.save();
          ctx.shadowBlur = 14;
          ctx.shadowColor = 'rgba(255, 215, 120, 0.95)';
          ctx.fillStyle = `rgba(255, 245, 200, ${doorPhase.alpha * 0.95})`;
          ctx.beginPath();
          ctx.arc(dLeft + dWidth * 0.75, dTop + dHeight * 0.55, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Fluttering butterflies dancing around the door
        const bTime = animationTime * 2.0;
        const b1X = dLeft - 18 + Math.sin(bTime) * 14;
        const b1Y = dTop + 20 + Math.cos(bTime * 0.8) * 10;
        const flap = Math.abs(Math.sin(bTime * 7)) * 0.8 + 0.2;

        const bPts: { x: number; y: number }[] = [
          { x: b1X, y: b1Y },
          { x: b1X - 13 * flap, y: b1Y - 10 },
          { x: b1X - 17 * flap, y: b1Y - 3 },
          { x: b1X, y: b1Y },
          { x: b1X + 13 * flap, y: b1Y - 10 },
          { x: b1X + 17 * flap, y: b1Y - 3 },
          { x: b1X, y: b1Y },
        ];
        drawThreadStroke(
          addWobble(bPts, 0.4),
          doorPhase.progress,
          doorPhase.alpha,
          'rgba(255, 220, 235,',
          'rgba(244, 114, 182,',
          1.2,
          false
        );
      }

      // 9. Interactive Touch / Click Sparkles
      const sparks = sparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.018;
        s.size *= 0.98;

        if (s.alpha <= 0 || s.size <= 0.5) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.85)';
        ctx.fillStyle = `rgba(255, 235, 180, ${s.alpha})`;

        if (s.type === 'heart') {
          const hSize = s.size;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.bezierCurveTo(s.x - hSize, s.y - hSize, s.x - hSize * 1.4, s.y + hSize * 0.4, s.x, s.y + hSize * 1.2);
          ctx.bezierCurveTo(s.x + hSize * 1.4, s.y + hSize * 0.4, s.x + hSize, s.y - hSize, s.x, s.y);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTime, isPlaying]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparks: InteractiveSpark[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5);
      const speed = Math.random() * 2.0 + 0.8;
      newSparks.push({
        x,
        y,
        size: Math.random() * 4 + 4,
        alpha: 0.95,
        life: 1,
        type: i % 2 === 0 ? 'heart' : 'sparkle',
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
      });
    }
    sparksRef.current.push(...newSparks);

    if (onCanvasClick) {
      onCanvasClick(x / rect.width, y / rect.height);
    }
  };

  return (
    <div
      ref={containerRef}
      id="thread-canvas-container"
      className="absolute inset-0 w-full h-full cursor-pointer touch-none select-none"
      onPointerDown={handlePointerDown}
    >
      <canvas
        ref={canvasRef}
        id="thread-canvas"
        className="w-full h-full block"
      />
    </div>
  );
};
