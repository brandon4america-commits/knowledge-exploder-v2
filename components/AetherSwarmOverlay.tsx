import React from 'react';
import { AetherAgent } from '../types';
import { AetherPulseEvent } from '../services/aetherSwarmEngine';

interface AetherSwarmOverlayProps {
  agents?: AetherAgent[];
  pulses?: AetherPulseEvent[];
  pulseEvents?: AetherPulseEvent[];
  width: number;
  height: number;
  transformK: number;
  transformX: number;
  transformY: number;
  enabled?: boolean;
}

export const AetherSwarmOverlay: React.FC<AetherSwarmOverlayProps> = ({
  agents = [],
  pulses,
  pulseEvents,
  width,
  height,
  transformK,
  transformX,
  transformY,
  enabled = true
}) => {
  const activePulses = pulseEvents || pulses || [];
  if (!enabled || !agents || agents.length === 0) return null;

  const now = Date.now();

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10 overflow-visible"
      width={width}
      height={height}
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <filter id="aether-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`translate(${transformX}, ${transformY}) scale(${transformK})`}>
        {/* Render Expanding Relief Pulse Waves from Aether Homeostasis */}
        {activePulses.map(pulse => {
          const age = now - pulse.timestamp;
          if (age > 1200) return null;
          const progress = age / 1200;
          const r = 24 + progress * 160;
          const opacity = (1 - progress) * 0.85;

          return (
            <g key={`pulse-${pulse.timestamp}-${pulse.x}`} className="pointer-events-none">
              <circle
                cx={pulse.x}
                cy={pulse.y}
                r={r}
                fill="none"
                stroke={pulse.color}
                strokeWidth={2.4 * (1 - progress * 0.5)}
                opacity={opacity}
              />
              <circle
                cx={pulse.x}
                cy={pulse.y}
                r={Math.max(10, r * 0.65)}
                fill="none"
                stroke="#67e8f9"
                strokeWidth={1.5}
                strokeDasharray="6,4"
                opacity={opacity * 0.75}
              />
            </g>
          );
        })}

        {/* Render Bioluminescent Aether Motes */}
        {agents.map(agent => {
          const isRelieving = agent.state === 'RELIEVING_STRESS';
          const isConverging = agent.state === 'CONVERGING';

          return (
            <g key={agent.id} transform={`translate(${agent.x}, ${agent.y})`}>
              {/* Velocity motion vector streak */}
              <line
                x1={-agent.vx * 3.5}
                y1={-agent.vy * 3.5}
                x2={0}
                y2={0}
                stroke={agent.color}
                strokeWidth={agent.size * 0.6}
                strokeLinecap="round"
                opacity={0.5}
              />

              {/* Outer halo */}
              <circle
                r={agent.size * (isRelieving ? 2.4 : 1.8)}
                fill={agent.color}
                opacity={isRelieving ? 0.35 : 0.18}
                filter="url(#aether-glow)"
              />

              {/* Core mote */}
              <circle
                r={agent.size}
                fill={isRelieving ? '#ffffff' : agent.color}
                opacity={0.95}
              />

              {/* Stress relief orbital pulse ring */}
              {isRelieving && (
                <circle
                  r={agent.size * 3.2}
                  fill="none"
                  stroke={agent.color}
                  strokeWidth={1.2}
                  strokeDasharray="3,3"
                  opacity={0.8}
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};
