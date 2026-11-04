import React, { useEffect, useState } from 'react';
import {
  Activity,
  Cpu,
  Crosshair,
  Eye,
  Flame,
  Layers,
  Palette,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sliders,
  StepForward,
  Unlock,
  X,
  Zap,
  Link2,
  Compass
} from 'lucide-react';

export type PhysicsPresetId =
  | 'EQUILIBRIUM_BASELINE'
  | 'SPARSE_CONSTELLATION'
  | 'DENSE_CLUSTER'
  | 'HIGH_RIGIDITY_CRYSTAL'
  | 'CUSTOM';

export type PhysicsVisualEncodingMode =
  | 'QUANTUM_STRESS'
  | 'NONE'
  | 'LINK_TENSION'
  | 'KINETIC_STRESS';

export interface PhysicsDebugConfig {
  activePreset: PhysicsPresetId;
  autoAdaptiveDensity: boolean;
  visualEncodingMode: PhysicsVisualEncodingMode;
  collisionEnabled: boolean;
  collisionStrength: number;
  collisionRadiusOffset: number;
  chargeEnabled: boolean;
  chargeStrength: number;
  linkEnabled: boolean;
  linkDistance: number;
  linkStrengthMultiplier: number;
  centerEnabled: boolean;
  boundaryClampingEnabled: boolean;
  boundaryPadding: number;
  alphaDecay: number;
  velocityDecay: number;
  isPaused: boolean;
  showCollisionRadii: boolean;
  showVelocityVectors: boolean;
  showBoundaryBox: boolean;
  showStressHotspots: boolean;
  autoHomeostasis: boolean;
}

export const DEFAULT_PHYSICS_DEBUG_CONFIG: PhysicsDebugConfig = {
  activePreset: 'EQUILIBRIUM_BASELINE',
  autoAdaptiveDensity: false,
  visualEncodingMode: 'QUANTUM_STRESS',
  collisionEnabled: true,
  collisionStrength: 0.85,
  collisionRadiusOffset: 12,
  chargeEnabled: true,
  chargeStrength: -220,
  linkEnabled: true,
  linkDistance: 90,
  linkStrengthMultiplier: 1.0,
  centerEnabled: true,
  boundaryClampingEnabled: true,
  boundaryPadding: 40,
  alphaDecay: 0.015,
  velocityDecay: 0.4,
  isPaused: false,
  showCollisionRadii: false,
  showVelocityVectors: false,
  showBoundaryBox: false,
  showStressHotspots: true,
  autoHomeostasis: false
};

export interface PhysicsPresetSpec {
  id: Exclude<PhysicsPresetId, 'CUSTOM'>;
  label: string;
  shortTag: string;
  description: string;
  config: Pick<
    PhysicsDebugConfig,
    | 'alphaDecay'
    | 'velocityDecay'
    | 'linkDistance'
    | 'linkStrengthMultiplier'
    | 'chargeStrength'
    | 'collisionStrength'
    | 'collisionRadiusOffset'
  >;
}

export const PHYSICS_PRESET_SPECS: PhysicsPresetSpec[] = [
  {
    id: 'EQUILIBRIUM_BASELINE',
    label: 'Equilibrium Baseline',
    shortTag: '90px · -220',
    description: 'Balanced weightless gliding with gentle settling (αDecay 0.015, vDecay 0.40)',
    config: {
      alphaDecay: 0.015,
      velocityDecay: 0.4,
      linkDistance: 90,
      linkStrengthMultiplier: 1.0,
      chargeStrength: -220,
      collisionStrength: 0.85,
      collisionRadiusOffset: 12
    }
  },
  {
    id: 'SPARSE_CONSTELLATION',
    label: 'Sparse Constellation',
    shortTag: '135px · -360',
    description: 'Wide orbital breathing room for low-density or tree-like topologies',
    config: {
      alphaDecay: 0.012,
      velocityDecay: 0.35,
      linkDistance: 135,
      linkStrengthMultiplier: 0.85,
      chargeStrength: -360,
      collisionStrength: 0.9,
      collisionRadiusOffset: 18
    }
  },
  {
    id: 'DENSE_CLUSTER',
    label: 'Dense De-entangle',
    shortTag: '70px · -310',
    description: 'Strong multi-body repulsion and high collision separation for packed hubs',
    config: {
      alphaDecay: 0.018,
      velocityDecay: 0.48,
      linkDistance: 70,
      linkStrengthMultiplier: 1.05,
      chargeStrength: -310,
      collisionStrength: 0.95,
      collisionRadiusOffset: 16
    }
  },
  {
    id: 'HIGH_RIGIDITY_CRYSTAL',
    label: 'High-Rigidity Crystal',
    shortTag: '85px · 1.5x',
    description: 'Crisp geometric spring lock-in with high damping for hierarchy inspection',
    config: {
      alphaDecay: 0.022,
      velocityDecay: 0.55,
      linkDistance: 85,
      linkStrengthMultiplier: 1.5,
      chargeStrength: -180,
      collisionStrength: 0.9,
      collisionRadiusOffset: 12
    }
  }
];

export function recommendPresetForTopology(
  nodeCount: number,
  linkCount: number
): Exclude<PhysicsPresetId, 'CUSTOM'> {
  if (nodeCount <= 1) return 'EQUILIBRIUM_BASELINE';
  const densityRatio = linkCount / Math.max(1, nodeCount);
  if (nodeCount >= 22 || densityRatio >= 1.45) {
    return 'DENSE_CLUSTER';
  }
  if (nodeCount <= 9 && densityRatio <= 1.05) {
    return 'SPARSE_CONSTELLATION';
  }
  if (densityRatio >= 1.25 && nodeCount < 22) {
    return 'HIGH_RIGIDITY_CRYSTAL';
  }
  return 'EQUILIBRIUM_BASELINE';
}

export interface StressHotspotNodeItem {
  nodeId: string;
  label: string;
  stressScore: number; // 0 to 100
  kineticEnergy: number;
  velocity: number;
  incidentStrain: number;
  bottleneckIndex: number;
  quantumColor: string;
}

export interface SynapticBottleneckLinkItem {
  linkKey: string;
  sourceId: string;
  targetId: string;
  sourceLabel: string;
  targetLabel: string;
  relationship: string;
  conductivity: number;
  strainRatio: number;
  bottleneckScore: number;
  quantumColor: string;
}

export interface PhysicsTelemetrySnapshot {
  alpha: number;
  alphaMin: number;
  alphaDecay: number;
  velocityDecay: number;
  avgVelocity: number;
  maxVelocity: number;
  kineticEnergy: number;
  avgLinkStrain: number;
  avgConductivity: number;
  pinnedCount: number;
  nodeCount: number;
  linkCount: number;
  tickCount: number;
  homeostaticPulsesCount: number;
  topStressNodes: StressHotspotNodeItem[];
  topBottleneckLinks: SynapticBottleneckLinkItem[];
}

interface PhysicsDebuggerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  config: PhysicsDebugConfig;
  telemetry: PhysicsTelemetrySnapshot;
  onUpdateConfig: (patch: Partial<PhysicsDebugConfig>, reheatAlpha?: number) => void;
  onSelectPreset: (presetId: Exclude<PhysicsPresetId, 'CUSTOM'>) => void;
  onResetDefaults: () => void;
  onReheat: (alpha?: number) => void;
  onStepTick: () => void;
  onReleaseAllPins: () => void;
  onFocusHotspotNode?: (nodeId: string) => void;
  onFocusBottleneckLink?: (sourceId: string, targetId: string) => void;
  onTriggerHomeostaticPulse?: () => void;
  activeHotspotNodeId?: string | null;
}

export const PhysicsDebuggerOverlay: React.FC<PhysicsDebuggerOverlayProps> = ({
  isOpen,
  onClose,
  config,
  telemetry,
  onUpdateConfig,
  onSelectPreset,
  onResetDefaults,
  onReheat,
  onStepTick,
  onReleaseAllPins,
  onFocusHotspotNode,
  onFocusBottleneckLink,
  onTriggerHomeostaticPulse,
  activeHotspotNodeId
}) => {
  const [history, setHistory] = useState<Array<{ alpha: number; vel: number }>>([]);

  useEffect(() => {
    if (!isOpen) return;
    setHistory(prev => {
      const next = [...prev, { alpha: telemetry.alpha, vel: telemetry.avgVelocity }];
      return next.length > 48 ? next.slice(next.length - 48) : next;
    });
  }, [isOpen, telemetry.tickCount, telemetry.alpha, telemetry.avgVelocity]);

  if (!isOpen) return null;

  const alphaPercent = Math.min(100, Math.max(0, telemetry.alpha * 100));
  const velocityPercent = Math.min(100, Math.max(0, (telemetry.avgVelocity / 8) * 100));
  const isSettled = telemetry.alpha <= telemetry.alphaMin + 0.002;
  const recommendedPreset = recommendPresetForTopology(telemetry.nodeCount, telemetry.linkCount);
  const edgeToNodeRatio =
    telemetry.nodeCount > 0 ? (telemetry.linkCount / telemetry.nodeCount).toFixed(2) : '0.00';

  const sparkW = 280;
  const sparkH = 38;
  const alphaPath =
    history.length > 1
      ? history
          .map((pt, idx) => {
            const x = (idx / Math.max(1, history.length - 1)) * sparkW;
            const y = sparkH - Math.min(1, Math.max(0, pt.alpha)) * (sparkH - 6) - 3;
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(' ')
      : '';
  const velPath =
    history.length > 1
      ? history
          .map((pt, idx) => {
            const x = (idx / Math.max(1, history.length - 1)) * sparkW;
            const normV = Math.min(1, Math.max(0, pt.vel / 8));
            const y = sparkH - normV * (sparkH - 6) - 3;
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(' ')
      : '';

  return (
    <div
      data-swarm-target="physics-debugger-overlay"
      className="absolute top-14 left-4 z-30 w-88 bg-[#07090e]/95 backdrop-blur-md border border-slate-800 rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.85)] text-slate-200 font-mono text-[10px] pointer-events-auto select-none overflow-hidden"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-100">
            Physics Debugger
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider border ${
              config.isPaused
                ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                : isSettled
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {config.isPaused ? 'Paused' : isSettled ? 'Equilibrium' : 'Active'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          title="Close Physics Debugger"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto">
        {/* 1. Physics Preset Profiles for Graph Densities & Topologies */}
        <div className="p-2.5 rounded bg-slate-950/90 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
              <Layers className="w-3 h-3" />
              Topology Physics Presets
            </span>
            <button
              type="button"
              data-swarm-target="toggle-auto-adaptive-density"
              onClick={() =>
                onUpdateConfig({ autoAdaptiveDensity: !config.autoAdaptiveDensity }, 0.45)
              }
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase cursor-pointer border transition-colors ${
                config.autoAdaptiveDensity
                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
              title="Automatically tune physics preset as node/link density changes"
            >
              <Cpu className="w-2.5 h-2.5" />
              Auto-Density: {config.autoAdaptiveDensity ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between text-[8px] text-slate-400 tabular-nums px-0.5">
            <span>
              Topology Density (|E|/|V|): <strong className="text-slate-200">{edgeToNodeRatio}</strong>
            </span>
            <span>
              Suggested:{' '}
              <strong className="text-emerald-300">
                {PHYSICS_PRESET_SPECS.find(p => p.id === recommendedPreset)?.label}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {PHYSICS_PRESET_SPECS.map(preset => {
              const isSelected = config.activePreset === preset.id;
              const isRecommended = recommendedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-swarm-target={`physics-preset-${preset.id.toLowerCase()}`}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`flex flex-col items-start p-1.5 rounded text-left cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/85 border-cyan-500/70 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                  title={preset.description}
                >
                  <div className="flex items-center justify-between w-full gap-1">
                    <span className="text-[9px] font-bold truncate">{preset.label}</span>
                    {isRecommended && (
                      <span className="px-1 py-0.2 rounded-xs bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[7px] uppercase font-bold shrink-0">
                        Fit
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-400 tabular-nums mt-0.5">
                    {preset.shortTag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Real-Time Visual Color Encoding on Nodes & Links */}
        <div className="p-2.5 rounded bg-slate-950/90 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
              <Palette className="w-3 h-3" />
              Node & Link Color Encoding
            </span>
            <div className="flex items-center gap-2 text-[8px] text-slate-400 tabular-nums">
              <span>
                Ḡ: <strong className="text-cyan-300">{telemetry.avgConductivity.toFixed(2)}</strong>
              </span>
              <span>
                Strain: <strong className="text-amber-300">{(telemetry.avgLinkStrain * 100).toFixed(1)}%</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {(
              [
                { id: 'QUANTUM_STRESS', label: 'Quantum' },
                { id: 'NONE', label: 'Ontology' },
                { id: 'LINK_TENSION', label: 'Strain' },
                { id: 'KINETIC_STRESS', label: 'Kinetic' }
              ] as Array<{ id: PhysicsVisualEncodingMode; label: string }>
            ).map(mode => {
              const active = config.visualEncodingMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  data-swarm-target={`visual-encoding-${mode.id.toLowerCase()}`}
                  onClick={() => onUpdateConfig({ visualEncodingMode: mode.id })}
                  className={`px-1.5 py-1.5 rounded text-[8px] font-bold uppercase cursor-pointer border transition-colors ${
                    active
                      ? mode.id === 'QUANTUM_STRESS'
                        ? 'bg-violet-950/90 text-cyan-200 border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Calibrated Bioluminescent Quantum Spectrum Legend */}
          {config.visualEncodingMode === 'QUANTUM_STRESS' && (
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="h-1.5 w-full rounded-xs bg-gradient-to-r from-indigo-950 via-violet-600 via-cyan-400 to-white" />
              <div className="flex justify-between text-[7px] text-slate-400 uppercase tabular-nums">
                <span className="text-violet-300">Indigo/Violet (Rest/Low G)</span>
                <span className="text-cyan-300">Electric Cyan</span>
                <span className="text-white font-semibold">White (Peak E_k / High G)</span>
              </div>
            </div>
          )}

          {/* Calibrated Scientific Color Scale Legend */}
          {config.visualEncodingMode === 'LINK_TENSION' && (
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="h-1.5 w-full rounded-xs bg-gradient-to-r from-cyan-400 via-emerald-400 via-amber-400 to-rose-500" />
              <div className="flex justify-between text-[7px] text-slate-400 uppercase tabular-nums">
                <span className="text-cyan-300">Compressed (&lt;0.8x)</span>
                <span className="text-emerald-300">Equilibrium (90px)</span>
                <span className="text-rose-400">Tensile Strain (&gt;1.4x)</span>
              </div>
            </div>
          )}

          {config.visualEncodingMode === 'KINETIC_STRESS' && (
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="h-1.5 w-full rounded-xs bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-500" />
              <div className="flex justify-between text-[7px] text-slate-400 uppercase tabular-nums">
                <span className="text-sky-300">At Rest (0 px/t)</span>
                <span className="text-emerald-300">Gliding</span>
                <span className="text-rose-400">High Kinetic (&gt;4 px/t)</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Real-Time Simulation Telemetry Readout */}
        <div className="p-2.5 rounded bg-slate-950/90 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-[9px] text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <Activity className="w-3 h-3" />
              Real-Time Telemetry
            </span>
            <span className="tabular-nums text-slate-500">
              Ticks: <strong className="text-slate-300">{telemetry.tickCount}</strong>
            </span>
          </div>

          {/* Dual-Trace Settling & Damping Waveform Sparkline */}
          <div className="relative w-full h-10 bg-slate-900/90 rounded-sm border border-slate-800/90 overflow-hidden">
            <svg
              viewBox={`0 0 ${sparkW} ${sparkH}`}
              className="w-full h-full preserve-3d"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1={sparkH / 2}
                x2={sparkW}
                y2={sparkH / 2}
                stroke="rgba(148,163,184,0.12)"
                strokeDasharray="2,2"
              />
              {alphaPath && (
                <path
                  d={alphaPath}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
              {velPath && (
                <path
                  d={velPath}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.25"
                  strokeDasharray="2,1"
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div className="absolute top-1 right-1.5 flex items-center gap-2 text-[8px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />α Curve
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />v̄ Curve
              </span>
            </div>
          </div>

          {/* Alpha Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] tabular-nums">
              <span className="text-slate-400">Simulation Alpha (α)</span>
              <span className="font-bold text-cyan-300">
                {telemetry.alpha.toFixed(4)}{' '}
                <span className="text-[8px] text-slate-500 font-normal">
                  / min {telemetry.alphaMin.toFixed(3)}
                </span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75"
                style={{ width: `${alphaPercent}%` }}
              />
            </div>
          </div>

          {/* Velocity Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] tabular-nums">
              <span className="text-slate-400">Mean / Max Velocity (v)</span>
              <span className="font-bold text-emerald-300">
                {telemetry.avgVelocity.toFixed(2)}{' '}
                <span className="text-slate-500 font-normal">/</span>{' '}
                <span className="text-amber-300">{telemetry.maxVelocity.toFixed(2)}</span>{' '}
                <span className="text-[8px] text-slate-500 font-normal">px/tick</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-75"
                style={{ width: `${velocityPercent}%` }}
              />
            </div>
          </div>

          {/* Telemetry Matrix Grid */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800/80 tabular-nums">
            <div className="px-2 py-1 rounded bg-slate-900/70 border border-slate-800/70">
              <div className="text-[8px] text-slate-500 uppercase">α Decay</div>
              <div className="text-[10px] font-bold text-slate-200">{config.alphaDecay.toFixed(3)}</div>
            </div>
            <div className="px-2 py-1 rounded bg-slate-900/70 border border-slate-800/70">
              <div className="text-[8px] text-slate-500 uppercase">v Damping</div>
              <div className="text-[10px] font-bold text-slate-200">{config.velocityDecay.toFixed(2)}</div>
            </div>
            <div className="px-2 py-1 rounded bg-slate-900/70 border border-slate-800/70">
              <div className="text-[8px] text-slate-500 uppercase">Kinetic E</div>
              <div className="text-[10px] font-bold text-cyan-300">{telemetry.kineticEnergy.toFixed(1)}</div>
            </div>
            <div className="px-2 py-1 rounded bg-slate-900/70 border border-slate-800/70">
              <div className="text-[8px] text-slate-500 uppercase">Nodes</div>
              <div className="text-[10px] font-bold text-slate-200">{telemetry.nodeCount}</div>
            </div>
            <div className="px-2 py-1 rounded bg-slate-900/70 border border-slate-800/70">
              <div className="text-[8px] text-slate-500 uppercase">Links</div>
              <div className="text-[10px] font-bold text-slate-200">{telemetry.linkCount}</div>
            </div>
            <div className="px-2 py-1 rounded bg-slate-900/70 border border-slate-800/70">
              <div className="text-[8px] text-slate-500 uppercase">Pinned</div>
              <div className="text-[10px] font-bold text-amber-300">{telemetry.pinnedCount}</div>
            </div>
          </div>

          {/* On-Canvas Vector & Spatial Overlay Toggles */}
          <div className="pt-1.5 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[8px] text-slate-400 uppercase tracking-wider">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>Canvas Diagnostic Overlays</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                data-swarm-target="toggle-debug-stress-hotspots"
                onClick={() =>
                  onUpdateConfig({ showStressHotspots: !config.showStressHotspots })
                }
                className={`px-1 py-1 rounded text-[8px] font-bold uppercase cursor-pointer border transition-colors ${
                  config.showStressHotspots
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Hotspots
              </button>
              <button
                type="button"
                data-swarm-target="toggle-debug-collision-radii"
                onClick={() =>
                  onUpdateConfig({ showCollisionRadii: !config.showCollisionRadii })
                }
                className={`px-1 py-1 rounded text-[8px] font-bold uppercase cursor-pointer border transition-colors ${
                  config.showCollisionRadii
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Collide
              </button>
              <button
                type="button"
                data-swarm-target="toggle-debug-velocity-vectors"
                onClick={() =>
                  onUpdateConfig({ showVelocityVectors: !config.showVelocityVectors })
                }
                className={`px-1 py-1 rounded text-[8px] font-bold uppercase cursor-pointer border transition-colors ${
                  config.showVelocityVectors
                    ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Velocity
              </button>
              <button
                type="button"
                data-swarm-target="toggle-debug-boundary-box"
                onClick={() =>
                  onUpdateConfig({ showBoundaryBox: !config.showBoundaryBox })
                }
                className={`px-1 py-1 rounded text-[8px] font-bold uppercase cursor-pointer border transition-colors ${
                  config.showBoundaryBox
                    ? 'bg-purple-950/90 text-purple-300 border-purple-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Bounds
              </button>
            </div>
          </div>
        </div>

        {/* 3.5 Interactive Network Stress Hotspot & Synaptic Bottleneck Inspector */}
        <div
          data-swarm-target="stress-hotspot-inspector"
          className="p-2.5 rounded bg-slate-950/90 border border-slate-800/90 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              Stress Hotspots & Homeostasis
            </span>
            <button
              type="button"
              data-swarm-target="toggle-auto-homeostasis"
              onClick={() => onUpdateConfig({ autoHomeostasis: !config.autoHomeostasis })}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase cursor-pointer border transition-colors ${
                config.autoHomeostasis
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
              title="Automatically reinforce bottleneck synaptic conductivity and relax tension when stress spikes"
            >
              Auto-Heal: {config.autoHomeostasis ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* One-Click Synaptic Homeostasis Relief Action */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              data-swarm-target="debugger-homeostatic-pulse-btn"
              onClick={() => onTriggerHomeostaticPulse?.()}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-gradient-to-r from-violet-950/90 via-cyan-950/90 to-emerald-950/90 hover:from-violet-900/90 hover:to-emerald-900/90 text-cyan-200 border border-cyan-500/50 font-bold uppercase text-[8px] cursor-pointer transition-all shadow-[0_0_12px_rgba(6,182,212,0.18)]"
              title="Reinforce low-conductivity bottleneck synapses, damp excess kinetic jitter, and relax spring strain"
            >
              <Zap className="w-3 h-3 text-cyan-300" />
              Homeostatic Relief Pulse
            </button>
            <span className="px-1.5 py-1 rounded bg-slate-900 border border-slate-800 text-[8px] text-slate-400 tabular-nums shrink-0">
              Pulses: <strong className="text-emerald-300">{telemetry.homeostaticPulsesCount}</strong>
            </span>
          </div>

          {/* Top Stress Nodes */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px] text-slate-400 uppercase font-semibold tracking-wider">
              <span>Top Stress Nodes (Kinetic E_k + Strain)</span>
              <span className="text-[7px] text-slate-500">Click to Auto-Pan</span>
            </div>
            {telemetry.topStressNodes.length === 0 ? (
              <div className="text-[8px] text-slate-500 py-1">No active nodes in simulation.</div>
            ) : (
              <div className="space-y-1">
                {telemetry.topStressNodes.map((item, idx) => {
                  const isFocused = activeHotspotNodeId === item.nodeId;
                  return (
                    <button
                      key={item.nodeId}
                      type="button"
                      data-swarm-target={`stress-hotspot-node-${idx}`}
                      onClick={() => onFocusHotspotNode?.(item.nodeId)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-left cursor-pointer border transition-all ${
                        isFocused
                          ? 'bg-cyan-950/85 border-cyan-400/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200'
                      }`}
                      title={`Auto-pan camera and highlight ${item.label} (Stress ${item.stressScore.toFixed(0)}%, v=${item.velocity.toFixed(2)} px/t, strain=${(item.incidentStrain * 100).toFixed(0)}%)`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 border border-white/40"
                          style={{ backgroundColor: item.quantumColor }}
                        />
                        <span className="text-[8px] text-slate-500 font-bold">#{idx + 1}</span>
                        <span className="text-[9px] font-bold truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 tabular-nums text-[8px]">
                        <span className="text-slate-400">
                          ε {(item.incidentStrain * 100).toFixed(0)}%
                        </span>
                        <span className="px-1 py-0.2 rounded bg-violet-950/90 border border-cyan-500/40 text-cyan-200 font-bold">
                          {item.stressScore.toFixed(0)}% Stress
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Synaptic Bottleneck Links */}
          {telemetry.topBottleneckLinks.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="text-[8px] text-slate-400 uppercase font-semibold tracking-wider">
                Synaptic Bottleneck Bridges (High Strain / Low G)
              </div>
              <div className="space-y-1">
                {telemetry.topBottleneckLinks.map((bLink, idx) => (
                  <button
                    key={bLink.linkKey}
                    type="button"
                    data-swarm-target={`synaptic-bottleneck-link-${idx}`}
                    onClick={() => onFocusBottleneckLink?.(bLink.sourceId, bLink.targetId)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded bg-slate-900/75 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 text-left cursor-pointer transition-colors"
                    title={`Auto-pan to synaptic bottleneck ${bLink.sourceLabel} → ${bLink.targetLabel} (${bLink.relationship})`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-1.5 h-3 rounded-xs shrink-0"
                        style={{ backgroundColor: bLink.quantumColor }}
                      />
                      <span className="text-[8px] text-slate-200 font-semibold truncate">
                        {bLink.sourceLabel} → {bLink.targetLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 tabular-nums text-[8px]">
                      <span className="text-cyan-300">G {bLink.conductivity.toFixed(2)}</span>
                      <span className="text-amber-300 font-bold">
                        {(bLink.strainRatio * 100).toFixed(0)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Force Toggles & Intensities */}
        <div className="space-y-2.5">
          {/* Collision Force */}
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-slate-200 uppercase tracking-wide">
                  Collision Force
                </span>
              </div>
              <button
                type="button"
                data-swarm-target="toggle-collision-force"
                onClick={() =>
                  onUpdateConfig({ collisionEnabled: !config.collisionEnabled }, 0.45)
                }
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer transition-colors border ${
                  config.collisionEnabled
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {config.collisionEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {config.collisionEnabled && (
              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex justify-between text-[9px] text-slate-400 tabular-nums mb-0.5">
                    <span>Collision Strength</span>
                    <span className="text-emerald-300 font-bold">
                      {config.collisionStrength.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={config.collisionStrength}
                    onChange={e =>
                      onUpdateConfig(
                        {
                          activePreset: 'CUSTOM',
                          collisionStrength: parseFloat(e.target.value)
                        },
                        0.35
                      )
                    }
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] text-slate-400 tabular-nums mb-0.5">
                    <span>Radius Padding Offset</span>
                    <span className="text-emerald-300 font-bold">
                      +{config.collisionRadiusOffset}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="36"
                    step="2"
                    value={config.collisionRadiusOffset}
                    onChange={e =>
                      onUpdateConfig(
                        {
                          activePreset: 'CUSTOM',
                          collisionRadiusOffset: parseInt(e.target.value, 10)
                        },
                        0.35
                      )
                    }
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Charge / ManyBody Repulsion Force */}
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-slate-200 uppercase tracking-wide">
                  Charge (ManyBody)
                </span>
              </div>
              <button
                type="button"
                data-swarm-target="toggle-charge-force"
                onClick={() => onUpdateConfig({ chargeEnabled: !config.chargeEnabled }, 0.45)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer transition-colors border ${
                  config.chargeEnabled
                    ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {config.chargeEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {config.chargeEnabled && (
              <div className="pt-1">
                <div className="flex justify-between text-[9px] text-slate-400 tabular-nums mb-0.5">
                  <span>Repulsion Strength</span>
                  <span className="text-amber-300 font-bold">{config.chargeStrength}</span>
                </div>
                <input
                  type="range"
                  min="-800"
                  max="0"
                  step="10"
                  value={config.chargeStrength}
                  onChange={e =>
                    onUpdateConfig(
                      {
                        activePreset: 'CUSTOM',
                        chargeStrength: parseInt(e.target.value, 10)
                      },
                      0.4
                    )
                  }
                  className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Link Equilibrium Force */}
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-slate-200 uppercase tracking-wide">
                  Link Spring Force
                </span>
              </div>
              <button
                type="button"
                data-swarm-target="toggle-link-force"
                onClick={() => onUpdateConfig({ linkEnabled: !config.linkEnabled }, 0.45)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer transition-colors border ${
                  config.linkEnabled
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {config.linkEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {config.linkEnabled && (
              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex justify-between text-[9px] text-slate-400 tabular-nums mb-0.5">
                    <span>Equilibrium Distance</span>
                    <span className="text-cyan-300 font-bold">{config.linkDistance}px</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="240"
                    step="5"
                    value={config.linkDistance}
                    onChange={e =>
                      onUpdateConfig(
                        {
                          activePreset: 'CUSTOM',
                          linkDistance: parseInt(e.target.value, 10)
                        },
                        0.4
                      )
                    }
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] text-slate-400 tabular-nums mb-0.5">
                    <span>Spring Stiffness Multiplier</span>
                    <span className="text-cyan-300 font-bold">
                      {config.linkStrengthMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={config.linkStrengthMultiplier}
                    onChange={e =>
                      onUpdateConfig(
                        {
                          activePreset: 'CUSTOM',
                          linkStrengthMultiplier: parseFloat(e.target.value)
                        },
                        0.35
                      )
                    }
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Damping, Decay & Spatial Bounds */}
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold text-slate-200 uppercase tracking-wide">
                  Decay & Bounding
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({ centerEnabled: !config.centerEnabled }, 0.35)
                  }
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase cursor-pointer border ${
                    config.centerEnabled
                      ? 'bg-purple-950/90 text-purple-300 border-purple-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Center Force"
                >
                  Center: {config.centerEnabled ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig(
                      { boundaryClampingEnabled: !config.boundaryClampingEnabled },
                      0.25
                    )
                  }
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase cursor-pointer border ${
                    config.boundaryClampingEnabled
                      ? 'bg-purple-950/90 text-purple-300 border-purple-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Canvas Boundary Clamping"
                >
                  Clamp: {config.boundaryClampingEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[9px] text-slate-400 tabular-nums mb-0.5">
                  <span>Alpha Decay (Settling Rate)</span>
                  <span className="text-purple-300 font-bold">{config.alphaDecay.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.002"
                  max="0.080"
                  step="0.001"
                  value={config.alphaDecay}
                  onChange={e =>
                    onUpdateConfig(
                      {
                        activePreset: 'CUSTOM',
                        alphaDecay: parseFloat(e.target.value)
                      },
                      0.25
                    )
                  }
                  className="w-full accent-purple-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[9px] text-slate-400 tabular-nums mb-0.5">
                  <span>Velocity Decay (Jitter Damping)</span>
                  <span className="text-purple-300 font-bold">
                    {config.velocityDecay.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.05"
                  value={config.velocityDecay}
                  onChange={e =>
                    onUpdateConfig(
                      {
                        activePreset: 'CUSTOM',
                        velocityDecay: parseFloat(e.target.value)
                      },
                      0.25
                    )
                  }
                  className="w-full accent-purple-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting Action Bar */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            data-swarm-target="debugger-reheat-btn"
            onClick={() => onReheat(0.85)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/40 font-bold uppercase text-[9px] cursor-pointer transition-colors"
          >
            <Flame className="w-3 h-3 text-cyan-400" />
            Reheat (α=0.85)
          </button>

          <button
            type="button"
            data-swarm-target="debugger-pause-resume-btn"
            onClick={() => onUpdateConfig({ isPaused: !config.isPaused })}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded font-bold uppercase text-[9px] cursor-pointer transition-colors border ${
              config.isPaused
                ? 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-200 border-emerald-500/40'
                : 'bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border-amber-500/40'
            }`}
          >
            {config.isPaused ? (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                Resume Sim
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                Freeze Sim
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onStepTick}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold uppercase text-[9px] cursor-pointer transition-colors"
            title="Advance simulation by 1 discrete physics tick"
          >
            <StepForward className="w-3 h-3 text-slate-400" />
            Step Tick
          </button>

          <button
            type="button"
            onClick={onReleaseAllPins}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold uppercase text-[9px] cursor-pointer transition-colors"
            title="Release all user-pinned node coordinates (fx/fy)"
          >
            <Unlock className="w-3 h-3 text-amber-400" />
            Unpin ({telemetry.pinnedCount})
          </button>
        </div>

        <button
          type="button"
          data-swarm-target="debugger-reset-defaults-btn"
          onClick={onResetDefaults}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 font-semibold uppercase text-[9px] cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Tuned Defaults (αDecay 0.015 · vDecay 0.40)
        </button>
      </div>
    </div>
  );
};
