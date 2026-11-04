import React, { useEffect, useRef } from 'react';
import { MicroHypha, GraphLink, GraphNode, ChemotacticBeacon } from '../types';

interface BiomimeticOverlayProps {
  hyphae: MicroHypha[];
  links: GraphLink[];
  width: number;
  height: number;
  transformK?: number;
  transformX?: number;
  transformY?: number;
  enabled?: boolean;
  showHyphae?: boolean;
  morphicPulseTimestamp?: number | null;
  beacons?: ChemotacticBeacon[];
}

interface NutrientParticle {
  linkIndex: number;
  progress: number;
  speed: number;
  size: number;
  color: string;
}

export const BiomimeticOverlay: React.FC<BiomimeticOverlayProps> = ({
  hyphae,
  links,
  width,
  height,
  transformK = 1,
  transformX = 0,
  transformY = 0,
  enabled = true,
  showHyphae = true,
  morphicPulseTimestamp = null,
  beacons = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<NutrientParticle[]>([]);
  const lastTimeRef = useRef<number>(performance.now());

  // Initialize and maintain a pool of cytoplasmic nutrient particles
  useEffect(() => {
    if (!enabled) {
      particlesRef.current = [];
      return;
    }

    const highConductivityIndices: number[] = [];
    links.forEach((l, idx) => {
      if ((l.conductivity ?? 0.8) >= 0.5) {
        highConductivityIndices.push(idx);
      }
    });

    if (highConductivityIndices.length === 0) {
      particlesRef.current = [];
      return;
    }

    const targetParticleCount = Math.min(48, highConductivityIndices.length * 3);
    const existing = particlesRef.current.filter(p => p.linkIndex < links.length);

    while (existing.length < targetParticleCount) {
      const randomLinkIdx = highConductivityIndices[Math.floor(Math.random() * highConductivityIndices.length)];
      existing.push({
        linkIndex: randomLinkIdx,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.007,
        size: 1.2 + Math.random() * 1.6,
        color: Math.random() > 0.4 ? 'rgba(16, 185, 129, 0.75)' : 'rgba(6, 182, 212, 0.75)'
      });
    }

    particlesRef.current = existing.slice(0, targetParticleCount);
  }, [links, enabled]);

  // Animation Loop
  useEffect(() => {
    if (!enabled) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const render = () => {
      const now = performance.now();
      const dt = Math.min(64, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Synchronize with SVG pan/zoom matrix
      ctx.translate(transformX, transformY);
      ctx.scale(transformK, transformK);

      // 1. Render Exploratory Micro-Hyphae Filaments
      if (showHyphae && hyphae.length > 0) {
        hyphae.forEach(h => {
          if (h.points.length < 2) return;

          const isAnastomosed = h.status === 'ANASTOMOSED';
          const filamentOpacity = isAnastomosed ? 0.75 : Math.min(0.65, 0.2 + h.growthProgress * 0.45);

          ctx.beginPath();
          ctx.moveTo(h.points[0].x, h.points[0].y);

          for (let i = 1; i < h.points.length; i++) {
            ctx.lineTo(h.points[i].x, h.points[i].y);
          }

          ctx.strokeStyle = isAnastomosed
            ? `rgba(6, 182, 212, ${filamentOpacity})`
            : `rgba(16, 185, 129, ${filamentOpacity})`;
          ctx.lineWidth = isAnastomosed ? 1.5 : 1.1;
          ctx.setLineDash(isAnastomosed ? [] : [4, 2]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Dendritic lateral micro-branching
          if (h.points.length >= 6 && h.growthProgress > 0.35) {
            const midIdx = Math.floor(h.points.length * 0.45);
            const midPt = h.points[midIdx];
            const nextPt = h.points[Math.min(h.points.length - 1, midIdx + 2)];
            const bdx = nextPt.x - midPt.x;
            const bdy = nextPt.y - midPt.y;
            const blen = Math.sqrt(bdx * bdx + bdy * bdy) || 1;
            const bnx = -bdy / blen;
            const bny = bdx / blen;
            const branchLen = Math.min(22, 8 + h.growthProgress * 14);
            const branchEnd = {
              x: midPt.x + (bdx * 0.4 + bnx * branchLen),
              y: midPt.y + (bdy * 0.4 + bny * branchLen)
            };

            ctx.beginPath();
            ctx.moveTo(midPt.x, midPt.y);
            ctx.quadraticCurveTo(
              midPt.x + bnx * (branchLen * 0.6),
              midPt.y + bny * (branchLen * 0.6),
              branchEnd.x,
              branchEnd.y
            );
            ctx.strokeStyle = `rgba(16, 185, 129, ${filamentOpacity * 0.55})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();

            // Tiny lateral apex spore
            ctx.beginPath();
            ctx.arc(branchEnd.x, branchEnd.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = '#6ee7b7';
            ctx.fill();
          }

          // Glowing tip growth cone (apex foraging bud)
          if (!isAnastomosed && h.growthProgress > 0.05) {
            const pulse = 1 + 0.35 * Math.sin(now * 0.008 + h.affinityScore * 10);
            ctx.save();
            ctx.beginPath();
            ctx.arc(h.tipX, h.tipY, 3.2 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = '#34d399';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#10b981';
            ctx.fill();

            // Outer bioluminescent halo
            ctx.beginPath();
            ctx.arc(h.tipX, h.tipY, 6.5 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(52, 211, 153, 0.18)';
            ctx.fill();
            ctx.restore();
          }
        });
      }

      // 2. Render Cytoplasmic Streaming Particles along Conductive Synaptic Chords
      const particles = particlesRef.current;
      particles.forEach(p => {
        const link = links[p.linkIndex];
        if (!link) return;

        const s = link.source as GraphNode;
        const t = link.target as GraphNode;

        if (
          typeof s !== 'object' ||
          typeof t !== 'object' ||
          typeof s.x !== 'number' ||
          typeof s.y !== 'number' ||
          typeof t.x !== 'number' ||
          typeof t.y !== 'number'
        ) {
          return;
        }

        p.progress += p.speed * (dt / 16);
        if (p.progress > 1) p.progress = 0;

        const px = s.x + (t.x - s.x) * p.progress;
        const py = s.y + (t.y - s.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // 3. Render Morphic Shockwave Pulse (if recently triggered within last 2.5s)
      if (morphicPulseTimestamp) {
        const pulseElapsed = (Date.now() - morphicPulseTimestamp) / 1000;
        if (pulseElapsed < 2.5) {
          const progress = pulseElapsed / 2.5; // 0 to 1
          const radius = progress * 850;
          const alpha = Math.max(0, 0.75 * (1 - progress));
          const originX = width / 2;
          const originY = height / 2;

          // Draw double expanding concentric wave rings centered at canvas origin
          ctx.save();
          ctx.beginPath();
          ctx.arc(originX, originY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#10b981';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(originX, originY, Math.max(0, radius - 60), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.7})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4. Render Chemotactic Nutrient Beacons & Dynamic Chemical Gradient Fields
      if (beacons && beacons.length > 0) {
        beacons.forEach(b => {
          if (!b.active) return;

          ctx.save();
          const beaconColor = b.color || '#f59e0b';

          // A. Radial nutrient gradient field
          const grad = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, b.attractionRadius);
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
          grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.04)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.attractionRadius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Outer attraction boundary ring
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.attractionRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
          ctx.lineWidth = 1;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // B. Expanding concentric diffusion waves
          const wavePhase = (now * 0.04) % b.attractionRadius;
          const wavePhase2 = ((now * 0.04) + b.attractionRadius * 0.5) % b.attractionRadius;

          [wavePhase, wavePhase2].forEach(wRad => {
            if (wRad > 8) {
              const alphaRatio = Math.max(0, 0.45 * (1 - wRad / b.attractionRadius));
              ctx.beginPath();
              ctx.arc(b.x, b.y, wRad, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(251, 191, 36, ${alphaRatio})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });

          // C. Crosshair target ticks at 0, 90, 180, 270 deg
          const tickDist = 18;
          const tickLen = 6;
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          // Horizontal ticks
          ctx.moveTo(b.x - tickDist - tickLen, b.y);
          ctx.lineTo(b.x - tickDist, b.y);
          ctx.moveTo(b.x + tickDist, b.y);
          ctx.lineTo(b.x + tickDist + tickLen, b.y);
          // Vertical ticks
          ctx.moveTo(b.x, b.y - tickDist - tickLen);
          ctx.lineTo(b.x, b.y - tickDist);
          ctx.moveTo(b.x, b.y + tickDist);
          ctx.lineTo(b.x, b.y + tickDist + tickLen);
          ctx.stroke();

          // D. Radiant amber beacon core
          const corePulse = 1 + 0.15 * Math.sin(now * 0.006 + b.x);
          const coreRadius = 7 * corePulse;

          // Outer bloom glow
          ctx.beginPath();
          ctx.arc(b.x, b.y, coreRadius * 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
          ctx.fill();

          // Solid core
          ctx.beginPath();
          ctx.arc(b.x, b.y, coreRadius, 0, Math.PI * 2);
          ctx.fillStyle = beaconColor;
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#f59e0b';
          ctx.fill();

          // Central diamond glint
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // E. Monospace HUD annotation
          ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
          const labelText = `${b.label.toUpperCase()} · Φ ${b.nutrientIntensity.toFixed(1)}x`;
          const textMetrics = ctx.measureText(labelText);
          const badgeW = textMetrics.width + 12;
          const badgeH = 18;
          const badgeX = b.x - badgeW / 2;
          const badgeY = b.y + coreRadius + 10;

          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
          ctx.lineWidth = 1;
          ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
          ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

          ctx.fillStyle = '#fde68a';
          ctx.fillText(labelText, badgeX + 6, badgeY + 12);

          ctx.restore();
        });
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    hyphae,
    links,
    beacons,
    enabled,
    showHyphae,
    transformK,
    transformX,
    transformY,
    morphicPulseTimestamp
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-15"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};
