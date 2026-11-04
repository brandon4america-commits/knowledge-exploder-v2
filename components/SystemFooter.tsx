import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCw,
  Route,
  Scale,
  X,
  Copy,
  Check,
  Monitor,
  Maximize2,
  Sliders,
  LayoutGrid,
  ZoomIn,
  RotateCcw,
  Layers,
  Film,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DiscoveryMission,
  GraphData,
  CausalPathTrace,
  FractalBreadcrumb,
  CausalTimelineFrame,
  CounterfactualFork,
  AetherSwarmConfig,
  TopologicalDivergenceDiff
} from '../types';
import {
  ScreenOptimizationProfile,
  HudDensityMode,
  WorkspacePresetId,
  WORKSPACE_PRESET_SPECS,
  OPTICAL_SCALE_STEPS
} from '../services/viewportOptimizer';
import { VcrTimelineController } from './VcrTimelineController';

const CONTROLLED_SOURCE_LICENSE_TEXT = `Controlled Source License

Copyright (c) 2026 Brandon Sypherd Gibbins. All rights reserved.

TERMS AND CONDITIONS FOR CONTROLLED SOURCE ACCESS, EVALUATION, AND USE

1. PREAMBLE & OWNERSHIP
This software and associated documentation files, architecture designs, and digital assets
(collectively, the "Software") are the sole proprietary and intellectual property of
Brandon Sypherd Gibbins ("Licensor"). The Software is distributed as controlled source code
exclusively under the terms of this Controlled Source License ("License").

2. GRANT OF CONTROLLED RIGHTS
Subject to the terms and limitations outlined herein, Licensor grants to you a personal,
revocable, non-exclusive, non-transferable, and royalty-free license to:
(a) Inspect, view, read, and examine the Software source code;
(b) Compile and execute the Software locally in a non-production environment solely for
    evaluation, research, educational, or private auditing purposes;
(c) Propose issues, architectural fixes, or enhancements directly to the Licensor.

3. EXPLICIT RESTRICTIONS & RESERVATION OF RIGHTS
Except as explicitly authorized in writing by Brandon Sypherd Gibbins, you shall NOT:
(a) Commercialize: Sell, rent, lease, sublicense, syndicate, monetize, or charge fees for
    the Software, any hosted version thereof, or any derivative works;
(b) Production & SaaS: Host, deploy, or operate the Software in production environments,
    multi-tenant networks, commercial cloud instances, or as a software-as-a-service (SaaS)
    offering without a separate commercial enterprise license;
(c) Redistribution: Distribute, broadcast, publish, mirror, or transfer copies of the Software
    or significant modifications thereof to any third party;
(d) Forking & Proprietary Sublicensing: Create standalone forks for public or proprietary
    redistribution without attribution and written consent from the Licensor;
(e) Alter Notices: Remove, alter, or obscure any copyright notices, license designations,
    trademarks, or author credits embedded in the Software.

4. DERIVATIVE WORKS & CONTRIBUTIONS
Any modifications, patches, extensions, or derivative works created by or on behalf of you
shall remain subject to this License and, unless otherwise agreed in writing, Licensor is
granted a perpetual, irrevocable, worldwide license to incorporate such contributions into
the Software.

5. TERMINATION
This License terminates automatically and immediately without notice if you fail to comply
with any of its terms or conditions. Upon termination, you must cease all use of the
Software and securely destroy all copies in your possession.

6. DISCLAIMER OF WARRANTIES
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE, TITLE, AND NON-INFRINGEMENT. IN NO EVENT SHALL BRANDON SYPHERD GIBBINS OR ANY
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
OR SERVICES, LOSS OF USE, DATA, REVENUE, OR PROFITS, OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`;

interface SystemFooterProps {
  mission: DiscoveryMission | null;
  graphData: GraphData;
  autoExplode: boolean;
  onReset: () => void;
  swarmActive?: boolean;
  activeCausalTrace?: CausalPathTrace | null;
  onClearCausalTrace?: () => void;
  screenProfile?: ScreenOptimizationProfile;
  autoOptimizeScreen?: boolean;
  onToggleAutoOptimizeScreen?: () => void;
  hudDensityMode?: HudDensityMode;
  onChangeHudDensityMode?: (mode: HudDensityMode) => void;
  workspacePreset?: WorkspacePresetId;
  onSelectWorkspacePreset?: (preset: WorkspacePresetId) => void;
  opticalScaleOverride?: number | null;
  onChangeOpticalScale?: (scale: number | null) => void;
  onFitScreenNow?: () => void;
  breadcrumbs?: FractalBreadcrumb[];
  onAscendBreadcrumb?: (index: number) => void;
  timelineFrames?: CausalTimelineFrame[];
  currentTimelineIndex?: number;
  isTimelinePlaying?: boolean;
  onToggleTimelinePlay?: () => void;
  onSelectTimelineFrame?: (index: number) => void;
  onStepTimelineFrame?: (direction: 'PREV' | 'NEXT') => void;
  onForkTimelineBranch?: () => void;
  activeFork?: CounterfactualFork | null;
  aetherConfig?: AetherSwarmConfig;
  onToggleAetherSwarm?: () => void;
  divergenceDiff?: TopologicalDivergenceDiff | null;
  showDiffHeatmap?: boolean;
  onToggleDiffHeatmap?: () => void;
  onFocusEpicenter?: (nodeId: string) => void;
}

const SystemFooter: React.FC<SystemFooterProps> = ({
  mission,
  graphData,
  autoExplode,
  onReset,
  swarmActive = false,
  activeCausalTrace = null,
  onClearCausalTrace,
  screenProfile,
  autoOptimizeScreen = true,
  onToggleAutoOptimizeScreen,
  hudDensityMode = 'AUTO',
  onChangeHudDensityMode,
  workspacePreset = 'AUTO_TIER',
  onSelectWorkspacePreset,
  opticalScaleOverride = null,
  onChangeOpticalScale,
  onFitScreenNow,
  breadcrumbs = [],
  onAscendBreadcrumb,
  timelineFrames = [],
  currentTimelineIndex = 0,
  isTimelinePlaying = false,
  onToggleTimelinePlay,
  onSelectTimelineFrame,
  onStepTimelineFrame,
  onForkTimelineBranch,
  activeFork = null,
  aetherConfig,
  onToggleAetherSwarm,
  divergenceDiff = null,
  showDiffHeatmap = true,
  onToggleDiffHeatmap,
  onFocusEpicenter
}) => {
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showScreenOptModal, setShowScreenOptModal] = useState(false);
  const [showVcrTimeline, setShowVcrTimeline] = useState(false);
  const [copiedLicense, setCopiedLicense] = useState(false);

  React.useEffect(() => {
    if (activeFork) {
      setShowVcrTimeline(true);
    }
  }, [activeFork]);

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(CONTROLLED_SOURCE_LICENSE_TEXT).then(() => {
      setCopiedLicense(true);
      setTimeout(() => setCopiedLicense(false), 2000);
    });
  };

  const isManualOverrideActive =
    workspacePreset !== 'AUTO_TIER' || typeof opticalScaleOverride === 'number';

  return (
    <>
      <footer className="px-4 xl:px-6 py-2.5 bg-slate-950/95 border-t border-sky-500/30 shadow-[0_-4px_30px_rgba(0,0,0,0.7)] flex flex-wrap items-center justify-between gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 z-20">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-sky-500/30">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            />
            <span className="text-emerald-400 font-bold">Kernel: Omega v14.0</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-sky-500/30">
            <span className="text-slate-400">Nodes</span>
            <span className="text-sky-300 font-mono tracking-normal font-bold tabular-nums">
              {graphData.nodes.length}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-sky-500/30">
            <span className="text-slate-400">Stream</span>
            <span
              className={cn(
                'font-bold transition-colors duration-500 font-mono tracking-wider',
                autoExplode ? 'text-sky-300' : 'text-slate-500'
              )}
            >
              {autoExplode ? 'ORCHESTRATING' : 'IDLE'}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-sky-500/30">
            <span className="text-slate-400">Swarms</span>
            <span
              className={cn(
                'font-bold transition-colors duration-500 font-mono tracking-wider',
                swarmActive ? 'text-emerald-400' : 'text-slate-500'
              )}
            >
              {swarmActive ? '100 DEPLOYED' : 'STANDBY'}
            </span>
          </div>

          {/* Fractal Breadcrumb Stack Navigation */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/70 border border-purple-400/60 text-[9px] font-mono text-purple-200">
              <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-purple-400 uppercase font-bold hidden sm:inline">Fractal:</span>
              <div className="flex items-center gap-1">
                {breadcrumbs.map((b, idx) => (
                  <React.Fragment key={b.level}>
                    {idx > 0 && <span className="text-purple-400/60 font-bold">›</span>}
                    <button
                      type="button"
                      onClick={() => onAscendBreadcrumb?.(idx)}
                      className={cn(
                        'hover:underline cursor-pointer font-bold transition-colors',
                        idx === breadcrumbs.length - 1 ? 'text-white underline' : 'text-purple-300'
                      )}
                      title={`Ascend to ${b.label}`}
                    >
                      {b.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {aetherConfig && (
            <button
              type="button"
              onClick={onToggleAetherSwarm}
              className={cn(
                'hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-mono tracking-wider',
                aetherConfig.enabled
                  ? 'bg-purple-950/60 border-purple-400/60 text-purple-300 hover:border-purple-300'
                  : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'
              )}
              title="Toggle Autonomous Aether Agent Swarms"
            >
              <Sparkles className={cn("w-3 h-3", aetherConfig.enabled ? "text-purple-400 animate-pulse" : "text-slate-500")} />
              <span>Aether: {aetherConfig.enabled ? `${aetherConfig.agentCount} Agents` : 'OFF'}</span>
            </button>
          )}

          {activeCausalTrace && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-400/60 text-emerald-300 font-mono tracking-normal">
              <Route className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[200px]">
                Trace: {activeCausalTrace.steps.map(s => s.nodeLabel).join(' → ')}
              </span>
              {onClearCausalTrace && (
                <button
                  type="button"
                  onClick={onClearCausalTrace}
                  className="ml-1 text-emerald-200 hover:text-white cursor-pointer"
                  title="Clear Causal Trace"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* VCR Causal Playback & Forking Toggle */}
          <button
            type="button"
            onClick={() => setShowVcrTimeline(prev => !prev)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-mono tracking-wider',
              showVcrTimeline || isTimelinePlaying || activeFork
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-emerald-400/60 hover:text-white'
            )}
            title="Toggle VCR Time-Domain Causal Playback & Counterfactual Forking"
          >
            <Film className="w-3 h-3 text-emerald-400" />
            <span>VCR Timeline</span>
            {timelineFrames.length > 0 && (
              <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200">
                {currentTimelineIndex + 1}/{timelineFrames.length}
              </span>
            )}
            {activeFork && (
              <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold">
                FORK
              </span>
            )}
          </button>
          {/* Quick Workspace Preset Segmented Switcher */}
          {onSelectWorkspacePreset && (
            <div className="hidden 2xl:flex items-center gap-1 p-0.5 rounded-xl bg-slate-900/90 border border-slate-800">
              {WORKSPACE_PRESET_SPECS.map(preset => {
                const isActive = workspacePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectWorkspacePreset(preset.id)}
                    className={cn(
                      'px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60'
                        : 'text-slate-400 hover:text-white'
                    )}
                    title={preset.description}
                  >
                    {preset.shortLabel}
                  </button>
                );
              })}
            </div>
          )}

          {screenProfile && (
            <button
              type="button"
              onClick={() => setShowScreenOptModal(true)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-mono tracking-wider',
                autoOptimizeScreen
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
              )}
              title="Open Screen & Viewport Self-Optimization Engine (Presets & Optical Scaling)"
            >
              <Monitor className="w-3 h-3 text-emerald-400" />
              <span className="tabular-nums">
                {screenProfile.width}×{screenProfile.height}
              </span>
              <span className="text-sky-300 tabular-nums">
                · {Math.round(screenProfile.effectiveUiScale * 100)}%
              </span>
              <span className="hidden xl:inline text-[9px] text-cyan-300">
                · {isManualOverrideActive ? 'Preset Override' : screenProfile.tierLabel}
              </span>
            </button>
          )}

          {onFitScreenNow && graphData.nodes.length > 0 && (
            <button
              type="button"
              onClick={onFitScreenNow}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-sky-500/30 hover:border-sky-400 hover:text-sky-300 transition-all text-slate-300 cursor-pointer"
              title="Recalibrate & Fit Graph Camera to User Screen"
            >
              <Maximize2 className="w-3 h-3 text-sky-400" />
              <span>Fit Screen</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLicenseModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all text-slate-300 cursor-pointer"
            title="View Controlled Source License (Copyright © 2026 Brandon Sypherd Gibbins)"
          >
            <Scale className="w-3 h-3 text-cyan-400" />
            <span>Controlled Source</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-sky-500/30 hover:border-sky-300 hover:text-sky-300 hover:bg-sky-500/10 transition-all text-slate-300 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-sky-400" />
            <span>Reset</span>
          </button>
          <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-sky-500/30">
            <div className="flex gap-1 h-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0.1 }}
                  animate={{
                    scaleY: (mission?.synergyLevel || 0) > (i + 1) * 20 ? 1 : 0.25,
                    opacity: (mission?.synergyLevel || 0) > (i + 1) * 20 ? 1 : 0.2
                  }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-sky-400 origin-bottom"
                />
              ))}
            </div>
            <span className="text-sky-300 font-bold">Synergy</span>
          </div>
        </div>
      </footer>

      {/* Docked VCR Time-Domain Causal Playback & Forking Bar */}
      <AnimatePresence>
        {showVcrTimeline && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-[44px] left-0 right-0 z-30 pointer-events-auto"
          >
            <VcrTimelineController
              frames={timelineFrames}
              currentIndex={currentTimelineIndex}
              isPlaying={isTimelinePlaying}
              onTogglePlay={onToggleTimelinePlay || (() => {})}
              onSelectFrame={onSelectTimelineFrame || (() => {})}
              onStepFrame={onStepTimelineFrame || (() => {})}
              onForkBranch={onForkTimelineBranch || (() => {})}
              activeFork={activeFork}
              divergenceDiff={divergenceDiff}
              showDiffHeatmap={showDiffHeatmap}
              onToggleDiffHeatmap={onToggleDiffHeatmap}
              onFocusEpicenter={onFocusEpicenter}
              onClose={() => setShowVcrTimeline(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen & Viewport Self-Optimization Engine Modal */}
      <AnimatePresence>
        {showScreenOptModal && screenProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
            onClick={() => setShowScreenOptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden text-slate-100"
            >
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                      Screen &amp; Viewport Self-Optimizer
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      Adaptive UI Optical Scaling · Layout Workspace Presets · Safe-Area Framing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isManualOverrideActive && onSelectWorkspacePreset && onChangeOpticalScale && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectWorkspacePreset('AUTO_TIER');
                        onChangeOpticalScale(null);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 hover:border-emerald-400 text-[10px] font-mono font-bold text-emerald-300 transition-colors cursor-pointer"
                      title="Reset manual preset and optical scale overrides back to automatic screen-tier sensing"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Auto Tier</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowScreenOptModal(false)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/70 hover:border-emerald-400/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4 font-mono text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
                {/* Live Screen Telemetry Matrix */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase">Detected Viewport</div>
                    <div className="text-sm font-bold text-cyan-300 tabular-nums mt-0.5">
                      {screenProfile.width} × {screenProfile.height}px
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5 tabular-nums">
                      Aspect {screenProfile.aspectRatio}:1 · {screenProfile.dpr}x DPR
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase">Screen Tier Profile</div>
                    <div className="text-xs font-bold text-emerald-300 mt-0.5 truncate">
                      {screenProfile.tierLabel}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {isManualOverrideActive ? 'Manual Override Active' : 'Auto-Tier Synced'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase">Optical &amp; Force Scale</div>
                    <div className="text-sm font-bold text-sky-300 tabular-nums mt-0.5">
                      UI {Math.round(screenProfile.effectiveUiScale * 100)}% · Sim{' '}
                      {(screenProfile.physicsScaleFactor * 100).toFixed(0)}%
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5 tabular-nums">
                      Sep: {screenProfile.recommendedContinentSeparation}px
                    </div>
                  </div>
                </div>

                {/* Layout Workspace Presets */}
                {onSelectWorkspacePreset && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
                      <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Layout Workspace Presets (Auto Tier + Manual Override)
                      </span>
                      <span className="text-emerald-300">
                        {WORKSPACE_PRESET_SPECS.find(p => p.id === workspacePreset)?.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {WORKSPACE_PRESET_SPECS.map(preset => {
                        const isActive = workspacePreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => onSelectWorkspacePreset(preset.id)}
                            className={cn(
                              'p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-1',
                              isActive
                                ? 'bg-cyan-950/60 border-cyan-400 text-slate-100 shadow-[0_0_20px_rgba(6,182,212,0.18)]'
                                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  'text-[11px] font-bold uppercase tracking-wider',
                                  isActive ? 'text-cyan-300' : 'text-slate-200'
                                )}
                              >
                                {preset.label}
                              </span>
                              {preset.id === 'AUTO_TIER' && (
                                <span className="text-[9px] text-emerald-400 font-bold">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug font-sans">
                              {preset.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Adaptive UI Optical Scale Stepper */}
                {onChangeOpticalScale && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
                      <span className="flex items-center gap-1.5 font-bold text-sky-300">
                        <ZoomIn className="w-3.5 h-3.5" />
                        Adaptive UI Optical Scaling (HUD Chrome Proportion)
                      </span>
                      <span className="tabular-nums text-sky-200 font-bold">
                        {opticalScaleOverride === null
                          ? `Auto (${Math.round(screenProfile.effectiveUiScale * 100)}%)`
                          : `Manual (${Math.round(opticalScaleOverride * 100)}%)`}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onChangeOpticalScale(null)}
                        className={cn(
                          'py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex flex-col items-center',
                          opticalScaleOverride === null
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        )}
                      >
                        <span>Auto</span>
                        <span className="text-[8px] text-slate-400 tabular-nums">
                          {Math.round(screenProfile.uiScale * 100)}%
                        </span>
                      </button>
                      {OPTICAL_SCALE_STEPS.map(step => {
                        const isSelected = opticalScaleOverride === step.value;
                        return (
                          <button
                            key={step.value}
                            type="button"
                            onClick={() => onChangeOpticalScale(step.value)}
                            className={cn(
                              'py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex flex-col items-center tabular-nums',
                              isSelected
                                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            )}
                          >
                            <span>{step.label}</span>
                            <span className="text-[8px] text-slate-500">{step.tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* HUD Density Mode Selector */}
                {onChangeHudDensityMode && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
                      <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                        <Sliders className="w-3 h-3" />
                        HUD Overlay Density Orchestration
                      </span>
                      <span>
                        {screenProfile.autoCollapseSecondaryHud
                          ? 'Compact Drawers'
                          : 'Expanded Drawers'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(
                        [
                          { id: 'AUTO', label: 'Auto Sense' },
                          { id: 'FOCUS_MINIMAL', label: 'Minimal' },
                          { id: 'BALANCED', label: 'Balanced' },
                          { id: 'FULL_COMMAND', label: 'Full HUD' }
                        ] as Array<{ id: HudDensityMode; label: string }>
                      ).map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onChangeHudDensityMode(opt.id)}
                          className={cn(
                            'py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer',
                            hudDensityMode === opt.id
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autonomous Screen Optimization Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div>
                    <div className="text-[11px] font-bold text-slate-100">
                      Autonomous Screen Self-Optimization
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Auto-adjusts force spacing, HUD drawer folding, and camera safe-area framing
                    </div>
                  </div>
                  {onToggleAutoOptimizeScreen && (
                    <button
                      type="button"
                      onClick={onToggleAutoOptimizeScreen}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-colors cursor-pointer shrink-0',
                        autoOptimizeScreen
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      )}
                    >
                      {autoOptimizeScreen ? 'Active (ON)' : 'Manual (OFF)'}
                    </button>
                  )}
                </div>

                {/* Safe-Area Insets Readout & Immediate Recalibrate CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 tabular-nums">
                    Safe Insets: T:{screenProfile.safeInsets.top}px · R:{screenProfile.safeInsets.right}px · B:{screenProfile.safeInsets.bottom}px · L:{screenProfile.safeInsets.left}px
                  </div>
                  {onFitScreenNow && (
                    <button
                      type="button"
                      onClick={() => {
                        onFitScreenNow();
                        setShowScreenOptModal(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400 text-sky-200 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Calibrate &amp; Fit Now</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MIT License Modal */}
      <AnimatePresence>
        {showLicenseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
            onClick={() => setShowLicenseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(34,211,238,0.2)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-cyan-500/30">
                <div className="flex items-center gap-2.5">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                      Controlled Source License Agreement
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      License: Controlled Source • Copyright (c) 2026 Brandon Sypherd Gibbins
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLicense}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-[10px] font-mono font-bold text-cyan-300 transition-colors cursor-pointer"
                  >
                    {copiedLicense ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-cyan-400" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLicenseModal(false)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/70 hover:border-cyan-400/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close License Modal"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <pre className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] leading-relaxed font-mono text-slate-200 whitespace-pre-wrap select-all max-h-[60vh] overflow-y-auto">
                  {CONTROLLED_SOURCE_LICENSE_TEXT}
                </pre>
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Files: /LICENSE &amp; /LICENSE.txt</span>
                  <span className="text-cyan-400 font-bold">Controlled Source Evaluation &amp; Research License</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SystemFooter;


