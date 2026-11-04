import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Scissors,
  Network,
  Radio,
  Volume2,
  VolumeX,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BiomimeticConfig, PlasticityMetrics, ChemotacticBeacon } from '../types';

interface BiomimeticHUDProps {
  config: BiomimeticConfig;
  metrics: PlasticityMetrics;
  pendingAnastomosesCount: number;
  prunableCount: number;
  beacons?: ChemotacticBeacon[];
  audioVolume?: number;
  audioMuted?: boolean;
  onDeployBeacon?: () => void;
  onClearBeacons?: () => void;
  onChangeAudioVolume?: (volume: number) => void;
  onToggleAudioMute?: () => void;
  onChangeConfig: (updater: (prev: BiomimeticConfig) => BiomimeticConfig) => void;
  onTriggerMorphicPulse: () => void;
  onConsolidateAnastomoses: () => void;
  onPruneDormantSynapses: () => void;
  onResetPlasticity: () => void;
  className?: string;
}

export const BiomimeticHUD: React.FC<BiomimeticHUDProps> = ({
  config,
  metrics,
  pendingAnastomosesCount,
  prunableCount,
  beacons = [],
  audioVolume = 0.7,
  audioMuted = false,
  onDeployBeacon,
  onClearBeacons,
  onChangeAudioVolume,
  onToggleAudioMute,
  onChangeConfig,
  onTriggerMorphicPulse,
  onConsolidateAnastomoses,
  onPruneDormantSynapses,
  onResetPlasticity,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showSliders, setShowSliders] = useState<boolean>(false);

  return (
    <aside
      className={cn(
        'absolute top-14 right-4 z-20 w-76 max-w-[calc(100vw-2rem)] select-none font-sans transition-all duration-200',
        className
      )}
      aria-label="Biomimetic Plasticity & Mycelial Engine"
    >
      <div className="bg-[#07090e]/95 border border-slate-800/90 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden text-left">
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-opacity cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-6 h-6 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              {config.enabled && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-100 tracking-wide">
                  Biomimetic Plasticity
                </span>
                <span
                  className={cn(
                    'text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold',
                    config.enabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  )}
                >
                  {config.enabled ? 'Active' : 'Stasis'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                {metrics.activeHyphaeCount} Hyphae · {(metrics.averageConductivity * 100).toFixed(0)}% Synaptic Conductance
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowSliders(prev => !prev)}
              className={cn(
                'p-1.5 rounded transition-colors text-slate-400 hover:text-white',
                showSliders ? 'bg-slate-800 text-cyan-400' : 'hover:bg-slate-800/60'
              )}
              title="Plasticity Calibration Sliders"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              className="p-1.5 rounded hover:bg-slate-800/60 transition-colors text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quick Biological Action Toolbar */}
        <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between gap-1 text-[10px] font-mono">
          <button
            type="button"
            onClick={onTriggerMorphicPulse}
            className="flex-1 py-1 px-2 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Emit Cytoplasmic Nutrient Shockwave"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Pulse</span>
          </button>

          {onDeployBeacon && (
            <button
              type="button"
              onClick={onDeployBeacon}
              className="py-1 px-2 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/35 text-amber-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Deploy Chemotactic Nutrient Beacon"
            >
              <Radio className="w-3 h-3 text-amber-400" />
              <span>+Beacon{beacons.length > 0 ? ` (${beacons.length})` : ''}</span>
            </button>
          )}

          {pendingAnastomosesCount > 0 && (
            <button
              type="button"
              onClick={onConsolidateAnastomoses}
              className="py-1 px-2 rounded bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Fuse Exploratory Tips to Permanent Synapses"
            >
              <Network className="w-3 h-3 text-cyan-400" />
              <span>Fuse ({pendingAnastomosesCount})</span>
            </button>
          )}

          {prunableCount > 0 && (
            <button
              type="button"
              onClick={onPruneDormantSynapses}
              className="py-1 px-2 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Prune Dormant Low-Conductance Synapses"
            >
              <Scissors className="w-3 h-3 text-rose-400" />
              <span>Prune ({prunableCount})</span>
            </button>
          )}
        </div>

        {/* Expanded Telemetry & Calibration Details */}
        {isExpanded && (
          <div className="p-3.5 space-y-3 text-xs">
            {/* Live Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800/80">
                <span className="text-slate-400 block uppercase">Nutrient Flux</span>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">
                  {metrics.nutrientFlux.toFixed(1)}{' '}
                  <span className="text-[9px] font-normal text-slate-400">μmol/s</span>
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800/80">
                <span className="text-slate-400 block uppercase">Synaptic Half-Life</span>
                <span className="text-sm font-bold text-cyan-400 tabular-nums">
                  {config.hebbianHalfLifeSec}{' '}
                  <span className="text-[9px] font-normal text-slate-400">sec</span>
                </span>
              </div>
            </div>

            {/* Chemotactic Nutrient Beacons Panel */}
            <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span>CHEMOTACTIC BEACONS ({beacons.length})</span>
                </div>
                {beacons.length > 0 && onClearBeacons && (
                  <button
                    type="button"
                    onClick={onClearBeacons}
                    className="flex items-center gap-1 text-[9px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Remove all active nutrient beacons"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono leading-tight">
                Beacons generate directional attraction gradient fields (<span className="text-amber-300">v<sub>chemo</sub></span>) that steer hyphal tips. Drag beacons directly on the canvas.
              </p>
              {onDeployBeacon && (
                <button
                  type="button"
                  onClick={onDeployBeacon}
                  className="w-full py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[10px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  <span>Deploy Nutrient Beacon</span>
                </button>
              )}
            </div>

            {/* Generative Bio-Sonification Synthesizer */}
            <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  <span>BIO-SONIFICATION</span>
                </div>
                {onToggleAudioMute && (
                  <button
                    type="button"
                    onClick={onToggleAudioMute}
                    className={cn(
                      'flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer',
                      audioMuted
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                        : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                    )}
                    title={audioMuted ? 'Unmute Generative Bio-Audio' : 'Mute Generative Bio-Audio'}
                  >
                    {audioMuted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                    <span>{audioMuted ? 'Muted' : 'Live'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Master Volume</span>
                  <span className="text-cyan-400 tabular-nums">
                    {audioMuted ? '0%' : `${Math.round(audioVolume * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioVolume}
                  onChange={e => onChangeAudioVolume?.(parseFloat(e.target.value))}
                  disabled={audioMuted}
                  className="w-full accent-cyan-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-0.5 border-t border-cyan-900/40">
                <span>Lowpass Cutoff:</span>
                <span className="text-cyan-300 tabular-nums font-semibold">
                  {Math.round(350 + metrics.averageConductivity * 1850)} Hz
                </span>
              </div>
            </div>

            {/* Calibration Sliders Drawer */}
            {showSliders && (
              <div className="space-y-2.5 p-2.5 rounded bg-slate-900/40 border border-slate-800/80 text-[11px]">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">
                  <span>PLASTICITY PARAMETERS</span>
                  <button
                    type="button"
                    onClick={onResetPlasticity}
                    className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset
                  </button>
                </div>

                {/* Growth Rate Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Hyphal Sprouting Velocity</span>
                    <span className="text-emerald-400 tabular-nums">{config.growthRate.toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={config.growthRate}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      onChangeConfig(prev => ({ ...prev, growthRate: v }));
                    }}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
                  />
                </div>

                {/* Hebbian Half-Life Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Hebbian Decay Half-Life</span>
                    <span className="text-cyan-400 tabular-nums">{config.hebbianHalfLifeSec}s</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="5"
                    value={config.hebbianHalfLifeSec}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10);
                      onChangeConfig(prev => ({ ...prev, hebbianHalfLifeSec: v }));
                    }}
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
                  />
                </div>

                {/* Pruning Threshold Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Pruning Threshold</span>
                    <span className="text-rose-400 tabular-nums">{(config.pruningThreshold * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.35"
                    step="0.01"
                    value={config.pruningThreshold}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      onChangeConfig(prev => ({ ...prev, pruningThreshold: v }));
                    }}
                    className="w-full accent-rose-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* State Toggles */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={e => onChangeConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>Active Morphogenesis</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.showHyphae}
                  onChange={e => onChangeConfig(prev => ({ ...prev, showHyphae: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span>Render Hyphae</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
