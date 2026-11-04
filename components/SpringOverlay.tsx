import React, { useEffect, useRef } from 'react';
import { GraphNode, GraphLink, NodeCentralityMetrics } from '../types';
import { generateSpringCoilPoints, computeSharedResonance } from '../services/springTensorEngine';

interface SpringOverlayProps {
  links: GraphLink[];
  width: number;
  height: number;
  transformK?: number;
  transformX?: number;
  transformY?: number;
  centralityMap?: Map<string, NodeCentralityMetrics>;
  enabled?: boolean;
}

export const SpringOverlay: React.FC<SpringOverlayProps> = ({
  links,
  width,
  height,
  transformK = 1,
  transformX = 0,
  transformY = 0,
  centralityMap,
  enabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

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
      timeRef.current += 0.04;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply current SVG zoom & pan transform to align canvas rendering with SVG coordinates
      ctx.translate(transformX, transformY);
      ctx.scale(transformK, transformK);

      const t = timeRef.current;

      links.forEach(l => {
        const s = l.source as GraphNode;
        const target = l.target as GraphNode;

        if (
          typeof s !== 'object' ||
          typeof target !== 'object' ||
          typeof s.x !== 'number' ||
          typeof s.y !== 'number' ||
          typeof target.x !== 'number' ||
          typeof target.y !== 'number'
        ) {
          return;
        }

        const tensor = computeSharedResonance(s, target, l.strength || 0.7, centralityMap);
        const res = tensor.resonanceScore;

        // Generate vector spring coil points
        const points = generateSpringCoilPoints(s.x, s.y, target.x, target.y, res, t);
        if (points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }

        // Color & style: High resonance cyan/phosphor, medium amber/violet, low subtle slate
        let strokeColor = 'rgba(56, 189, 248, 0.45)'; // cyan
        if (res > 0.75) {
          strokeColor = 'rgba(6, 182, 212, 0.75)'; // High resonance laser cyan
        } else if (res > 0.5) {
          strokeColor = 'rgba(168, 85, 247, 0.55)'; // Medium violet
        } else if (res > 0.3) {
          strokeColor = 'rgba(245, 158, 11, 0.45)'; // Amber
        } else {
          strokeColor = 'rgba(148, 163, 184, 0.25)'; // Low slate
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(0.8, Math.min(2.2, 0.8 + res * 1.4));
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Add subtle neon glow to apex resonance links
        if (res > 0.7) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#00f0ff';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [links, enabled, transformK, transformX, transformY, centralityMap]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};
