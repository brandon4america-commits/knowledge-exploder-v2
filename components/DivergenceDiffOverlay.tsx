import React from 'react';
import { GraphNode, GraphLink, TopologicalDivergenceDiff } from '../types';

interface DivergenceDiffOverlayProps {
  diff: TopologicalDivergenceDiff | null;
  role: 'CANONICAL' | 'FORK';
  width: number;
  height: number;
  transformK: number;
  transformX: number;
  transformY: number;
  nodes: GraphNode[];
  links: GraphLink[];
  enabled?: boolean;
}

export const DivergenceDiffOverlay: React.FC<DivergenceDiffOverlayProps> = ({
  diff,
  role,
  width,
  height,
  transformK,
  transformX,
  transformY,
  nodes,
  links,
  enabled = true
}) => {
  if (!enabled || !diff) return null;

  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach(n => {
    if (typeof n.x === 'number' && typeof n.y === 'number') {
      nodeMap.set(n.id, n);
    }
  });

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-15 overflow-visible"
      width={width}
      height={height}
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <filter id="diff-glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="diff-glow-rose" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="diff-glow-violet" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`translate(${transformX}, ${transformY}) scale(${transformK})`}>
        {/* Divergent Link Synapse Heat Trails */}
        {links.map((link, idx) => {
          const sId = typeof link.source === 'string' ? link.source : (link.source as any)?.id;
          const tId = typeof link.target === 'string' ? link.target : (link.target as any)?.id;
          if (!sId || !tId) return null;

          const lKey = sId < tId ? `${sId}__${tId}` : `${tId}__${sId}`;
          const divItem = diff.linkDivergenceMap.get(lKey);
          if (!divItem || divItem.status === 'UNCHANGED') return null;

          const sNode = nodeMap.get(sId);
          const tNode = nodeMap.get(tId);
          if (!sNode || !tNode) return null;

          const sx = sNode.x!;
          const sy = sNode.y!;
          const tx = tNode.x!;
          const ty = tNode.y!;

          const isAdded = divItem.status === 'ADDED_SYNAPSE';
          const isRemoved = divItem.status === 'REMOVED_SYNAPSE';
          const isDrift = divItem.status === 'CONDUCTIVITY_DRIFT';

          if (isAdded && role === 'FORK') {
            return (
              <g key={`diff-link-${lKey}-${idx}`}>
                <line
                  x1={sx}
                  y1={sy}
                  x2={tx}
                  y2={ty}
                  stroke="#34d399"
                  strokeWidth={5}
                  strokeOpacity={0.4}
                  filter="url(#diff-glow-emerald)"
                />
                <line
                  x1={sx}
                  y1={sy}
                  x2={tx}
                  y2={ty}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="6,4"
                  strokeOpacity={0.9}
                />
              </g>
            );
          }

          if (isRemoved && role === 'CANONICAL') {
            return (
              <g key={`diff-link-${lKey}-${idx}`}>
                <line
                  x1={sx}
                  y1={sy}
                  x2={tx}
                  y2={ty}
                  stroke="#f43f5e"
                  strokeWidth={5}
                  strokeOpacity={0.4}
                  filter="url(#diff-glow-rose)"
                />
                <line
                  x1={sx}
                  y1={sy}
                  x2={tx}
                  y2={ty}
                  stroke="#fb7185"
                  strokeWidth={2}
                  strokeDasharray="4,4"
                  strokeOpacity={0.85}
                />
              </g>
            );
          }

          if (isDrift) {
            return (
              <line
                key={`diff-link-${lKey}-${idx}`}
                x1={sx}
                y1={sy}
                x2={tx}
                y2={ty}
                stroke={divItem.color}
                strokeWidth={3}
                strokeDasharray="8,4"
                strokeOpacity={0.7}
              />
            );
          }

          return null;
        })}

        {/* Divergent Node Halos, Heatmap Rings & Epicenter Reticles */}
        {nodes.map(node => {
          if (typeof node.x !== 'number' || typeof node.y !== 'number') return null;
          const divItem = diff.nodeDivergenceMap.get(node.id);
          if (!divItem || divItem.status === 'UNCHANGED') return null;

          const isEpicenter = diff.epicenterNodeId === node.id;
          const isAdded = divItem.status === 'ADDED_IN_FORK';
          const isRemoved = divItem.status === 'REMOVED_IN_FORK';
          const isMutated = divItem.status === 'MUTATED';

          // Viewport role matching:
          // In FORK: highlight added and mutated nodes
          // In CANONICAL: highlight removed and mutated nodes
          const shouldHighlight =
            (role === 'FORK' && (isAdded || isMutated)) ||
            (role === 'CANONICAL' && (isRemoved || isMutated));

          if (!shouldHighlight) return null;

          const baseRadius = node.radius || 24;
          const heatRadius = baseRadius + divItem.heatScore * 28;

          return (
            <g key={`diff-node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
              {/* Outer Heatmap Aura */}
              <circle
                r={heatRadius + 14}
                fill={divItem.color}
                opacity={0.16 * divItem.heatScore}
                filter="url(#diff-glow-emerald)"
              />

              {/* Pulsing Chromatic Ring */}
              <circle
                r={heatRadius}
                fill="none"
                stroke={divItem.color}
                strokeWidth={isEpicenter ? 2.5 : 1.8}
                strokeDasharray={isAdded ? '6,3' : '4,4'}
                opacity={0.85}
              />

              {/* Epicenter Target Bracket & Badge */}
              {isEpicenter && (
                <g>
                  {/* Corner bracket reticle */}
                  {[
                    [-heatRadius - 10, -heatRadius - 10, 10, 0, 0, 10],
                    [heatRadius + 10, -heatRadius - 10, -10, 0, 0, 10],
                    [-heatRadius - 10, heatRadius + 10, 10, 0, 0, -10],
                    [heatRadius + 10, heatRadius + 10, -10, 0, 0, -10]
                  ].map(([bx, by, dx, , , dy], i) => (
                    <path
                      key={i}
                      d={`M ${bx + dx} ${by} L ${bx} ${by} L ${bx} ${by + dy}`}
                      stroke={divItem.color}
                      strokeWidth={2.2}
                      fill="none"
                    />
                  ))}

                  {/* Epicenter HUD Badge */}
                  <g transform={`translate(0, ${-heatRadius - 18})`}>
                    <rect
                      x={-72}
                      y={-12}
                      width={144}
                      height={18}
                      rx={4}
                      fill="#020617"
                      stroke={divItem.color}
                      strokeWidth={1.2}
                      opacity={0.95}
                    />
                    <text
                      textAnchor="middle"
                      y={1}
                      fill={divItem.color}
                      fontSize="8px"
                      fontFamily="monospace"
                      fontWeight="800"
                    >
                      EPICENTER · {(divItem.heatScore * 100).toFixed(0)}% DIVERGENCE
                    </text>
                  </g>
                </g>
              )}

              {/* Status Label Pill */}
              {!isEpicenter && (
                <g transform={`translate(0, ${heatRadius + 14})`}>
                  <rect
                    x={-45}
                    y={-8}
                    width={90}
                    height={14}
                    rx={3}
                    fill="#020617"
                    stroke={divItem.color}
                    strokeWidth={1}
                    opacity={0.9}
                  />
                  <text
                    textAnchor="middle"
                    y={2}
                    fill={divItem.color}
                    fontSize="7.5px"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {isAdded ? '+ FORK BRANCH' : isRemoved ? '− SEVERED' : 'MUTATED'}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};
