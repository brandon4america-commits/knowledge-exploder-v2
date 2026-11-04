import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  GitBranch,
  History,
  X,
  Clock,
  Sparkles,
  Flame,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CausalTimelineFrame, CounterfactualFork, TopologicalDivergenceDiff } from '../types';

interface VcrTimelineControllerProps {
  frames?: CausalTimelineFrame[];
  currentFrameIndex?: number;
  currentIndex?: number;
  isPlaying?: boolean;
  onTogglePlay: () => void;
  onSelectFrameIndex?: (index: number) => void;
  onSelectFrame?: (index: number) => void;
  onStepFrame: (direction: 'PREV' | 'NEXT') => void;
  onForkBranch: () => void;
  activeFork?: CounterfactualFork | null;
  onClose?: () => void;
  divergenceDiff?: TopologicalDivergenceDiff | null;
  showDiffHeatmap?: boolean;
  onToggleDiffHeatmap?: () => void;
  onFocusEpicenter?: (nodeId: string) => void;
}

export const VcrTimelineController: React.FC<VcrTimelineControllerProps> = ({
  frames = [],
  currentFrameIndex,
  currentIndex,
  isPlaying = false,
  onTogglePlay,
  onSelectFrameIndex,
  onSelectFrame,
  onStepFrame,
  onForkBranch,
  activeFork,
  onClose,
  divergenceDiff = null,
  showDiffHeatmap = true,
  onToggleDiffHeatmap,
  onFocusEpicenter
}) => {
  const activeIndex =
    typeof currentFrameIndex === 'number'
      ? currentFrameIndex
      : typeof currentIndex === 'number'
      ? currentIndex
      : 0;
  const handleSelect = onSelectFrameIndex || onSelectFrame || (() => {});
  const currentFrame = frames[activeIndex] || frames[frames.length - 1];
  const totalFrames = frames.length;

  return (
    <div className="bg-[#07090e]/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] p-3 text-slate-100 select-none font-mono text-xs max-w-2xl w-full mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-[11px] text-cyan-300">
            Time-Domain Causal VCR Controller
          </span>
          {activeFork && (
            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-400/50 text-purple-300 text-[9px] font-bold">
              Fork: {activeFork.branchName || activeFork.forkLabel || 'Counterfactual'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentFrame && (
            <span className="text-[10px] text-slate-400 tabular-nums">
              Epoch #{currentFrame.epoch} · {new Date(currentFrame.timestamp).toLocaleTimeString()}
            </span>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scrubber slider */}
      <div className="space-y-1 mb-2.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Frame {totalFrames > 0 ? activeIndex + 1 : 0} of {totalFrames}</span>
          <span className="truncate max-w-[280px] text-slate-300">{currentFrame?.label || 'Current Active State'}</span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalFrames - 1)}
          value={Math.min(activeIndex, Math.max(0, totalFrames - 1))}
          disabled={totalFrames <= 1}
          onChange={e => handleSelect(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Dynamic Divergence Diff Telemetry Tray */}
      {divergenceDiff && (
        <div className="mb-2.5 p-2 rounded-lg bg-slate-900/90 border border-purple-500/30 flex flex-wrap items-center justify-between gap-2 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>DIVERGENCE: {divergenceDiff.divergenceScore.toFixed(0)}%</span>
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 tabular-nums">
              <span className="text-emerald-400" title="Nodes Added in Fork">+{divergenceDiff.summary.addedInForkCount}N</span>
              <span className="text-rose-400" title="Nodes Removed in Fork">-{divergenceDiff.summary.removedInForkCount}N</span>
              <span className="text-amber-400" title="Nodes Mutated">~{divergenceDiff.summary.mutatedCount}N</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400" title="Synapses Added">+{divergenceDiff.summary.addedSynapseCount}L</span>
              <span className="text-pink-400" title="Synapses Pruned">-{divergenceDiff.summary.removedSynapseCount}L</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleDiffHeatmap && (
              <button
                type="button"
                onClick={onToggleDiffHeatmap}
                className={cn(
                  "px-2 py-0.5 rounded border text-[9px] uppercase font-bold transition-all cursor-pointer flex items-center gap-1",
                  showDiffHeatmap
                    ? "bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                    : "bg-slate-950 border-slate-700 text-slate-400 hover:text-white"
                )}
                title="Toggle dynamic chromatic divergence heatmap overlay"
              >
                <Flame className="w-2.5 h-2.5" />
                <span>Heatmap: {showDiffHeatmap ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {divergenceDiff.divergenceEpicenterNodeId && onFocusEpicenter && (
              <button
                type="button"
                onClick={() => onFocusEpicenter(divergenceDiff.divergenceEpicenterNodeId!)}
                className="px-2 py-0.5 rounded border border-rose-400/50 bg-rose-500/20 text-rose-200 hover:bg-rose-500/35 text-[9px] uppercase font-bold transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                title={`Pan camera directly to divergence epicenter node [${divergenceDiff.divergenceEpicenterNodeId}]`}
              >
                <Target className="w-2.5 h-2.5 text-rose-300" />
                <span>Epicenter</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transport Controls + Fork CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onStepFrame('PREV')}
            disabled={activeIndex <= 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Step Back 1 Epoch"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            disabled={totalFrames <= 1}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/60 text-cyan-200 hover:bg-cyan-500/30 font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            title={isPlaying ? 'Pause Playback' : 'Play Timeline'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[10px] uppercase">{isPlaying ? 'Pause' : 'Play VCR'}</span>
          </button>

          <button
            type="button"
            onClick={() => onStepFrame('NEXT')}
            disabled={activeIndex >= totalFrames - 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Step Forward 1 Epoch"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentFrame?.metrics && (
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 tabular-nums">
              <span>{currentFrame.metrics.nodeCount}N</span>
              <span>·</span>
              <span>{currentFrame.metrics.linkCount}L</span>
              <span>·</span>
              <span className="text-emerald-400">G: {(currentFrame.metrics.avgConductivity * 100).toFixed(0)}%</span>
            </div>
          )}

          <button
            type="button"
            onClick={onForkBranch}
            className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 border border-purple-400/60 text-purple-200 hover:bg-purple-500/30 text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.25)]"
            title="Fork a counterfactual exploration branch and engage split-screen divergence comparison"
          >
            <GitBranch className="w-3 h-3 text-purple-300" />
            <span>Fork Branch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
