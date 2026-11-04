import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronUp, 
  Download
} from 'lucide-react';
import { ScientificTelemetry, GraphData, ThemeMode } from '../types';

interface ScientificTelemetryTrayProps {
  telemetry: ScientificTelemetry;
  graphData: GraphData;
  hoveredCoordinates?: { x: number; y: number } | null;
  onExportSnapshot?: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
}

export const ScientificTelemetryTray: React.FC<ScientificTelemetryTrayProps> = ({
  telemetry,
  graphData,
  hoveredCoordinates,
  onExportSnapshot,
  themeMode = 'obsidian',
  onToggleTheme
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Compute Radar Polygon Points
  const radarAxes = useMemo(() => [
    { label: 'DEPTH', value: telemetry.radar.depth, key: 'depth' },
    { label: 'BREADTH', value: telemetry.radar.breadth, key: 'breadth' },
    { label: 'NOVELTY', value: telemetry.radar.novelty, key: 'novelty' },
    { label: 'GROUNDING', value: telemetry.radar.empiricalGrounding, key: 'empiricalGrounding' },
    { label: 'SYNAPSE', value: telemetry.radar.interconnectivity, key: 'interconnectivity' }
  ], [telemetry.radar]);

  const centerX = 100;
  const centerY = 100;
  const radius = 70;

  const radarPolygonPoints = useMemo(() => {
    return radarAxes.map((axis, i) => {
      const angle = (Math.PI * 2 / radarAxes.length) * i - Math.PI / 2;
      const normalized = Math.max(0.1, Math.min(1, axis.value / 100));
      const r = radius * normalized;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [radarAxes]);

  // Compute Time-series Path
  const historyPath = useMemo(() => {
    if (telemetry.history.length < 2) return { entropy: '', velocity: '' };
    const width = 280;
    const height = 80;
    const padding = 10;
    const points = telemetry.history;
    const maxVal = Math.max(...points.map(p => Math.max(p.entropy, p.discoveryVelocity, 1)));

    const entropyPts = points.map((p, idx) => {
      const x = padding + (idx / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - (p.entropy / maxVal) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const velocityPts = points.map((p, idx) => {
      const x = padding + (idx / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - (p.discoveryVelocity / maxVal) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return {
      entropy: `M ${entropyPts.join(' L ')}`,
      velocity: `M ${velocityPts.join(' L ')}`
    };
  }, [telemetry.history]);

  // Format Elapsed Time (MET)
  const formatMET = (secs: number) => {
    const hrs = Math.floor(secs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `T+${hrs}:${mins}:${s}`;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex justify-center">
      <div className="w-full max-w-xl xl:max-w-3xl 2xl:max-w-4xl px-4 pb-1.5 pointer-events-auto">
        
        {/* Collapsed Ribbon or Expanded Scientific Console */}
        <div className="bg-[#07090e]/95 backdrop-blur-md border border-slate-800 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] rounded-t-xl transition-all duration-300">
          
          {/* Top Telemetry Header Ribbon */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-6">
              
              {/* Mission State & MET */}
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200 tracking-wider">
                  TELEMETRY MATRIX
                </span>
                <span className="text-xs text-slate-500" aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-xs font-medium text-cyan-400">
                  {formatMET(telemetry.elapsedSeconds)}
                </span>
              </div>

              {/* Coordinates Probe */}
              {hoveredCoordinates && (
                <div className="hidden lg:flex items-center gap-2 text-xs font-mono tabular-nums text-slate-400">
                  <span className="text-slate-600">COORD:</span>
                  <span className="text-slate-300">X {hoveredCoordinates.x.toFixed(0)}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-300">Y {hoveredCoordinates.y.toFixed(0)}</span>
                </div>
              )}

              {/* Unboxed Metadata Stats */}
              <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
                <span className="text-slate-500" aria-hidden="true">·</span>
                <span>
                  ENTROPY <strong className="font-mono tabular-nums text-slate-200 font-semibold">{telemetry.networkEntropy.toFixed(3)}</strong>
                </span>
                <span className="text-slate-500" aria-hidden="true">·</span>
                <span>
                  DENSITY <strong className="font-mono tabular-nums text-slate-200 font-semibold">{telemetry.graphDensity.toFixed(3)}</strong>
                </span>
                <span className="text-slate-500" aria-hidden="true">·</span>
                <span>
                  COHESION <strong className="font-mono tabular-nums text-cyan-400 font-semibold">{telemetry.clusterCohesion.toFixed(1)}%</strong>
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {onExportSnapshot && (
                <button
                  onClick={onExportSnapshot}
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded hover:border-slate-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Export telemetry and graph state"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Export JSON</span>
                </button>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded hover:border-slate-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                aria-expanded={isExpanded}
              >
                <span>{isExpanded ? 'Collapse Console' : 'Expand Precision HUD'}</span>
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Expanded Instrument Console */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden p-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#07090e]/98"
              >
                {/* Panel 1: 5-Axis Spider Radar Calibration */}
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                      Cognitive Radar Calibration
                    </span>
                    <span className="text-xs font-mono tabular-nums text-cyan-400">
                      5-AXIS BALANCED
                    </span>
                  </div>

                  <div className="flex items-center justify-center">
                    <svg width="200" height="200" className="overflow-visible">
                      {/* Concentric Calibration Polygons */}
                      {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
                        const levelPoints = radarAxes.map((_, i) => {
                          const angle = (Math.PI * 2 / radarAxes.length) * i - Math.PI / 2;
                          const r = radius * level;
                          return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                        }).join(' ');

                        return (
                          <polygon
                            key={idx}
                            points={levelPoints}
                            fill="none"
                            stroke="#334155"
                            strokeWidth={idx === 3 ? "1.5" : "1"}
                            strokeDasharray={idx < 3 ? "2 2" : undefined}
                          />
                        );
                      })}

                      {/* Radial Spoke Lines */}
                      {radarAxes.map((axis, i) => {
                        const angle = (Math.PI * 2 / radarAxes.length) * i - Math.PI / 2;
                        const x = centerX + radius * Math.cos(angle);
                        const y = centerY + radius * Math.sin(angle);
                        const labelX = centerX + (radius + 18) * Math.cos(angle);
                        const labelY = centerY + (radius + 18) * Math.sin(angle);

                        return (
                          <g key={i}>
                            <line
                              x1={centerX}
                              y1={centerY}
                              x2={x}
                              y2={y}
                              stroke="#1e293b"
                              strokeWidth="1"
                            />
                            <text
                              x={labelX}
                              y={labelY}
                              fill="#94a3b8"
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              {axis.label}
                            </text>
                          </g>
                        );
                      })}

                      {/* Radar Area Polygon */}
                      <polygon
                        points={radarPolygonPoints}
                        fill="rgba(6, 182, 212, 0.25)"
                        stroke="#06b6d4"
                        strokeWidth="2"
                      />

                      {/* Vertex Dots */}
                      {radarAxes.map((axis, i) => {
                        const angle = (Math.PI * 2 / radarAxes.length) * i - Math.PI / 2;
                        const r = radius * (Math.max(0.1, Math.min(1, axis.value / 100)));
                        const x = centerX + r * Math.cos(angle);
                        const y = centerY + r * Math.sin(angle);

                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#06b6d4"
                            stroke="#07090e"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Panel 2: Dual-Axis Time-Series Curves (Entropy vs Velocity) */}
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                        Cognitive Entropy & Decay
                      </span>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="flex items-center gap-1.5 text-cyan-400">
                          <span className="w-2 h-0.5 bg-cyan-400" /> Entropy
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <span className="w-2 h-0.5 bg-amber-400" /> Velocity
                        </span>
                      </div>
                    </div>

                    <div className="h-28 w-full flex items-center justify-center pt-2">
                      {telemetry.history.length > 1 ? (
                        <svg viewBox="0 0 280 80" className="w-full h-full overflow-visible">
                          {/* Grid Lines */}
                          <line x1="10" y1="20" x2="270" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                          <line x1="10" y1="50" x2="270" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                          <line x1="10" y1="70" x2="270" y2="70" stroke="#334155" strokeWidth="1" />

                          {/* Dual Curves */}
                          <path
                            d={historyPath.entropy}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d={historyPath.velocity}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <div className="text-xs font-mono text-slate-500 text-center">
                          Awaiting telemetry sampling cycles...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-400 uppercase font-mono text-[10px]">Current Entropy</div>
                      <div className="font-mono tabular-nums text-lg font-bold text-slate-100">
                        {telemetry.networkEntropy.toFixed(3)} <span className="text-[10px] text-slate-500 font-normal">bits</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase font-mono text-[10px]">Discovery Rate</div>
                      <div className="font-mono tabular-nums text-lg font-bold text-amber-400">
                        +{telemetry.discoveryVelocity.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">nodes/min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Topological Density & Quadtree State */}
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                        Manifold Physics State
                      </span>
                      <span className="text-xs font-mono text-emerald-400">
                        ● CONVERGED
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Active Node Population</span>
                        <span className="font-mono tabular-nums font-semibold text-slate-200">
                          {graphData.nodes.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Synaptic Link Trajectories</span>
                        <span className="font-mono tabular-nums font-semibold text-slate-200">
                          {graphData.links.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Frontier Ghost Nodes</span>
                        <span className="font-mono tabular-nums font-semibold text-cyan-400">
                          {graphData.nodes.filter(n => n.isGhost).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Spatial Quadtree Depth</span>
                        <span className="font-mono tabular-nums font-semibold text-slate-300">
                          Level 4 (Barnes-Hut θ=0.8)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Hebbian Link Strengthening</span>
                    <span className="font-mono text-cyan-400 font-medium">ACTIVE (DECAY: 0.985)</span>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
