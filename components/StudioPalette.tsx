import React, { useState, useMemo } from 'react';
import {
  History,
  Code,
  Zap,
  ShieldAlert,
  Wrench,
  Cpu,
  Layers,
  Play,
  FastForward,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitBranch
} from 'lucide-react';
import { WorkspaceSnapshot, GraphNode, GraphLink, WorkspaceCodeFile } from '../types';
import { homologyAuditor, BridgingAxiom } from '../services/homologyEngine';
import {
  evolutionOrchestrator,
  RecursiveCycleRecord,
  RecursiveEvolutionDomain
} from '../services/evolutionOrchestrator';

interface StudioPaletteProps {
  snapshots: WorkspaceSnapshot[];
  onScrub: (snapshot: WorkspaceSnapshot) => void;
  onExecuteKernel: (code: string) => void;
  nodes?: GraphNode[];
  links?: GraphLink[];
  codeFiles?: WorkspaceCodeFile[];
  onApplyRecursiveCycle?: (record: RecursiveCycleRecord) => void;
  onBridgeCavityAxiom?: (axiom: BridgingAxiom) => void;
}

const DOMAIN_META: Array<{
  id: RecursiveEvolutionDomain;
  short: string;
  color: string;
}> = [
  { id: 'SELF_OPTIMIZING_CODE', short: 'Optimize O(N log N)', color: 'text-sky-400 border-sky-500/40' },
  { id: 'ADVERSARIAL_TEST_GEN', short: 'Adversarial Red/Blue', color: 'text-rose-400 border-rose-500/40' },
  { id: 'SELF_REPAIR_DEBUG', short: 'Self-Repair AST/Topo', color: 'text-amber-400 border-amber-500/40' },
  { id: 'ARCHITECTURAL_EXPANSION', short: 'Expand Simplicial', color: 'text-emerald-400 border-emerald-500/40' }
];

export const StudioPalette: React.FC<StudioPaletteProps> = ({
  snapshots,
  onScrub,
  onExecuteKernel,
  nodes = [],
  links = [],
  codeFiles = [],
  onApplyRecursiveCycle,
  onBridgeCavityAxiom
}) => {
  const [scrubberValue, setScrubberValue] = useState(Math.max(0, snapshots.length - 1));
  const [collapsed, setCollapsed] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<RecursiveEvolutionDomain | 'AUTO'>('AUTO');
  const [cycleHistory, setCycleHistory] = useState<RecursiveCycleRecord[]>([]);
  const [checkpointPending, setCheckpointPending] = useState(false);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const signature = useMemo(() => homologyAuditor.audit(nodes, links), [nodes, links]);
  const candidateAxioms = useMemo(
    () => homologyAuditor.synthesizeBridgingAxioms(nodes, links, signature),
    [nodes, links, signature]
  );

  if (nodes.length === 0) return null;

  const runSingleCycle = (overrideDomain?: RecursiveEvolutionDomain) => {
    const domainToRun =
      overrideDomain || (selectedDomain === 'AUTO' ? undefined : selectedDomain);
    const record = evolutionOrchestrator.executeRecursiveCycle(
      nodes,
      links,
      codeFiles,
      domainToRun
    );
    setCycleHistory(prev => [record, ...prev.slice(0, 14)]);
    if (record.requiresCheckpointReview) {
      setCheckpointPending(true);
    }
    onApplyRecursiveCycle?.(record);
    return record;
  };

  const runAutonomousBatchToCheckpoint = () => {
    if (isBatchRunning) return;
    setIsBatchRunning(true);
    let step = 0;
    const totalSteps = 5;

    const timer = window.setInterval(() => {
      step += 1;
      const rec = runSingleCycle();
      if (step >= totalSteps || rec.requiresCheckpointReview) {
        window.clearInterval(timer);
        setIsBatchRunning(false);
        setCheckpointPending(true);
      }
    }, 450);
  };

  const latestCycle = cycleHistory[0];

  return (
    <div className="fixed bottom-16 right-4 z-30 rounded-xl bg-[#07090e]/95 border border-purple-500/40 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.75)] w-76 max-w-[calc(100vw-2rem)] text-white font-mono text-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800/90 bg-slate-900/60 rounded-t-xl">
        <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-wider text-[10px]">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>v18.2 Recursive Evolution</span>
          {cycleHistory.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 text-[9px] text-purple-200">
              C#{cycleHistory[0].cycleNumber}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(prev => !prev)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand Evolution Dock' : 'Minimize Evolution Dock'}
        >
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-3.5 space-y-3.5 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* 1. Simplicial Homology Telemetry */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-sky-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                Vietoris-Rips Homology
              </span>
              <span className="text-slate-400">χ = {signature.eulerCharacteristic}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded bg-slate-950/90 border border-slate-800/80">
                <div className="text-[9px] text-slate-500">β₀ Comp</div>
                <div className="text-xs font-bold text-sky-300">{signature.beta0Components}</div>
              </div>
              <div className="p-1.5 rounded bg-slate-950/90 border border-slate-800/80">
                <div className="text-[9px] text-slate-500">β₁ Cycles</div>
                <div className="text-xs font-bold text-purple-300">{signature.beta1Cycles}</div>
              </div>
              <div className="p-1.5 rounded bg-slate-950/90 border border-slate-800/80">
                <div className="text-[9px] text-slate-500">β₂ Voids</div>
                <div className="text-xs font-bold text-emerald-300">{signature.beta2Voids}</div>
              </div>
              <div className="p-1.5 rounded bg-slate-950/90 border border-slate-800/80">
                <div className="text-[9px] text-slate-500">2-Simplex</div>
                <div className="text-xs font-bold text-amber-300">{signature.simplexCounts.s2}</div>
              </div>
            </div>

            {candidateAxioms.length > 0 && onBridgeCavityAxiom && (
              <button
                type="button"
                onClick={() => onBridgeCavityAxiom(candidateAxioms[0])}
                className="w-full py-1.5 px-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-[10px] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="truncate">
                  Bridge β_{candidateAxioms[0].cavityDimension}: {candidateAxioms[0].sourceLabel} ↔{' '}
                  {candidateAxioms[0].targetLabel}
                </span>
                <GitBranch className="w-3 h-3 shrink-0 ml-1" />
              </button>
            )}
          </div>

          {/* 2. Hybrid Governance & 4-Domain Recursive Cycles */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3 h-3" />
                Hybrid Governance Cycles
              </span>
              <span className="text-[9px] text-slate-400">
                {selectedDomain === 'AUTO' ? '4-Domain Rotation' : 'Targeted'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1">
              {DOMAIN_META.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() =>
                    setSelectedDomain(prev => (prev === d.id ? 'AUTO' : d.id))
                  }
                  className={`px-2 py-1 rounded text-[9px] border text-left truncate transition-all cursor-pointer ${
                    selectedDomain === d.id
                      ? `${d.color} bg-slate-800 font-bold`
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>

            {checkpointPending ? (
              <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-400/50 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Governance Checkpoint Reached
                  </span>
                  <span>{latestCycle?.version}</span>
                </div>
                <p className="text-[9px] text-slate-300 leading-relaxed">
                  5 recursive cycles verified (Health {latestCycle?.health.healthScore}%, Adversarial{' '}
                  {latestCycle?.adversarial.resilienceScore}%). Ratify to continue autonomous batching.
                </p>
                <button
                  type="button"
                  onClick={() => setCheckpointPending(false)}
                  className="w-full py-1.5 rounded bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400 text-emerald-200 font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ratify Checkpoint & Unlock Next Batch</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={isBatchRunning}
                  onClick={() => runSingleCycle()}
                  className="flex-1 py-1.5 px-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-lg flex items-center justify-center gap-1.5 text-purple-200 font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  <span>Step 1 Cycle</span>
                </button>
                <button
                  type="button"
                  disabled={isBatchRunning}
                  onClick={runAutonomousBatchToCheckpoint}
                  className="flex-1 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 rounded-lg flex items-center justify-center gap-1.5 text-emerald-200 font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FastForward className="w-3 h-3" />
                  <span>{isBatchRunning ? 'Running 5x...' : 'Batch 5x Cycles'}</span>
                </button>
              </div>
            )}

            {latestCycle && (
              <div className="p-2 rounded bg-slate-950/90 border border-slate-800/90 space-y-1 text-[9px]">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span className="text-purple-300">{latestCycle.version}</span>
                  <span className="text-emerald-400">+{latestCycle.fitnessGain}% Fitness</span>
                </div>
                <div className="text-slate-400 leading-snug">{latestCycle.summary}</div>
                <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-900">
                  <span>Red/Blue: {latestCycle.adversarial.resilienceScore}%</span>
                  <span>Health: {latestCycle.health.healthScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Time-Travel Scrubber */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5 text-purple-400 font-bold uppercase tracking-wider text-[10px]">
              <span className="flex items-center gap-1.5">
                <History className="w-3 h-3" />
                Time-Travel Scrubber
              </span>
              <span className="text-slate-400 text-[9px]">
                {snapshots.length} Snapshot{snapshots.length === 1 ? '' : 's'}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={Math.max(0, snapshots.length - 1)}
              value={Math.min(scrubberValue, Math.max(0, snapshots.length - 1))}
              disabled={snapshots.length === 0}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setScrubberValue(val);
                if (snapshots[val]) {
                  onScrub(snapshots[val]);
                }
              }}
              className="w-full accent-purple-500 mb-1"
            />
            <div className="flex justify-between text-slate-500 text-[9px]">
              <span>Epoch 0</span>
              <span>Epoch {Math.max(0, snapshots.length - 1)}</span>
            </div>
          </div>

          {/* 4. Kernel Sandbox */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onExecuteKernel(
                  `// WGSL Vietoris-Rips Filtration Kernel (β₀=${signature.beta0Components}, β₁=${signature.beta1Cycles}, Δ₂=${signature.simplexCounts.s2})`
                )
              }
              className="w-full py-2 bg-slate-900 border border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-950/30 rounded-xl flex items-center justify-center gap-2 transition-colors text-[10px] font-bold text-emerald-300 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <Zap className="w-3 h-3" />
              <span>Execute WGSL/Rust Homology Kernel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
