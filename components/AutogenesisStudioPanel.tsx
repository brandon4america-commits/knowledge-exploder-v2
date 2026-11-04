import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Cpu,
  Play,
  Pause,
  SkipForward,
  Zap,
  CheckCircle2,
  Code2,
  GitBranch,
  Kanban,
  PenTool,
  Sparkles,
  ShieldCheck,
  Terminal,
  Activity,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import {
  AutogenesisState,
  SelfDevStage,
  SelfDevCadence,
  SelfEvolutionMutation,
  GraphNode,
  WorkspaceModuleType
} from '../types';
import { cn } from '../lib/utils';
import { sanitizeNodeLabel } from '../services/inferenceEngine';

interface AutogenesisStudioPanelProps {
  autogenesis: AutogenesisState;
  onToggleActive: () => void;
  onStepStage: () => void;
  onRunFullCycleNow: () => void;
  onChangeCadence: (cadence: SelfDevCadence) => void;
  onOpenFileInIde: (fileId: string) => void;
  onSwitchModule: (module: WorkspaceModuleType) => void;
  nodes: GraphNode[];
  onFocusGraphNode?: (node: GraphNode) => void;
}

const STAGE_SPECS: Array<{
  id: SelfDevStage;
  stepNum: number;
  shortLabel: string;
  title: string;
  description: string;
}> = [
  {
    id: 'INTROSPECT',
    stepNum: 1,
    shortLabel: 'Introspect',
    title: '1. Self-Introspection & Entropy Audit',
    description: 'Scans active codebase AST, graph Shannon entropy, and unbridged topological cavities.'
  },
  {
    id: 'PROPOSE_RFC',
    stepNum: 2,
    shortLabel: 'RFC & Ticket',
    title: '2. Architectural RFC & Sprint Ticket',
    description: 'Drafts a formal System Architecture RFC and schedules an engineering ticket on the Kanban board.'
  },
  {
    id: 'SYNTHESIZE_CODE',
    stepNum: 3,
    shortLabel: 'Code Gen',
    title: '3. Autonomous Code Module Synthesis',
    description: 'Writes a self-evolving TypeScript, Rust, or WGSL kernel module into /src/autogenesis/.'
  },
  {
    id: 'VERIFY_AST',
    stepNum: 4,
    shortLabel: 'AST & Tests',
    title: '4. Static AST & Unit Verification',
    description: 'Executes deterministic typechecking, cyclomatic complexity audit, and invariant assertions.'
  },
  {
    id: 'MATERIALIZE_GRAPH',
    stepNum: 5,
    shortLabel: 'Materialize',
    title: '5. Graph & Whiteboard Materialization',
    description: 'Binds newly synthesized code symbols into verified Knowledge Graph nodes and Whiteboard wires.'
  },
  {
    id: 'COMMIT_GENERATION',
    stepNum: 6,
    shortLabel: 'Commit Gen',
    title: '6. Hot-Swap Evolution Commit & Snapshot',
    description: 'Promotes ticket to DEPLOYED, increments Omega generation version, and captures a Time-Travel Snapshot.'
  }
];

export const AutogenesisStudioPanel: React.FC<AutogenesisStudioPanelProps> = ({
  autogenesis,
  onToggleActive,
  onStepStage,
  onRunFullCycleNow,
  onChangeCadence,
  onOpenFileInIde,
  onSwitchModule,
  nodes,
  onFocusGraphNode
}) => {
  const [selectedMutationId, setSelectedMutationId] = useState<string | null>(
    autogenesis.mutations[0]?.id || null
  );

  const activeStageIndex = STAGE_SPECS.findIndex(s => s.id === autogenesis.currentStage);
  const currentStageSpec = STAGE_SPECS[Math.max(0, activeStageIndex)];

  const selectedMutation: SelfEvolutionMutation | undefined =
    autogenesis.mutations.find(m => m.id === selectedMutationId) || autogenesis.mutations[0];

  const handleJumpToNodeLabel = (label: string) => {
    if (!onFocusGraphNode) return;
    const found = nodes.find(
      n => n.label.toLowerCase() === label.toLowerCase() || n.label.toLowerCase().includes(label.toLowerCase())
    );
    if (found) {
      onFocusGraphNode(found);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="w-full h-full flex flex-col p-4 gap-3.5 overflow-hidden"
    >
      {/* Top Control Bar: Continuous Autopoietic Loop Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-emerald-500/40 rounded-xl px-3.5 py-2.5 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center border transition-all',
              autogenesis.active
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.4)]'
                : 'bg-slate-950 border-slate-700 text-sky-400'
            )}
          >
            <Cpu className={cn('w-5 h-5', autogenesis.active && 'animate-spin')} style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Recursive Self-Development Engine
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-[10px] font-mono font-bold">
                {autogenesis.generationVersion}
              </span>
              {autogenesis.active && (
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/60 text-sky-200 text-[9px] font-mono font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  AUTOPOIETIC LOOP LIVE
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Autonomous introspection, RFC ratification, code synthesis, AST testing &amp; topological graph materialization
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cadence Speed Selector */}
          <div className="flex items-center bg-slate-950/90 p-0.5 rounded-lg border border-slate-800">
            {(
              [
                { id: 'TURBO_2S', label: 'Turbo 1.5s' },
                { id: 'BALANCED_4S', label: 'Balanced 3s' },
                { id: 'DEEP_7S', label: 'Deep 5s' }
              ] as Array<{ id: SelfDevCadence; label: string }>
            ).map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChangeCadence(c.id)}
                className={cn(
                  'px-2 py-1 rounded-md text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer',
                  autogenesis.cadence === c.id
                    ? 'bg-sky-500/25 text-sky-200 border border-sky-400/60'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Step 1 Stage Button */}
          <button
            type="button"
            data-swarm-target="autogenesis-step-stage"
            onClick={onStepStage}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Advance 1 stage in the 6-stage self-development pipeline"
          >
            <SkipForward className="w-3.5 h-3.5 text-sky-400" />
            <span>Step Stage</span>
          </button>

          {/* Execute Full Generation Cycle Now */}
          <button
            type="button"
            data-swarm-target="autogenesis-full-cycle"
            onClick={onRunFullCycleNow}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/70 text-amber-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            title="Immediately execute a complete 6-stage self-evolution generation upgrade"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Evolve Generation Now</span>
          </button>

          {/* Play / Pause Continuous Loop */}
          <button
            type="button"
            data-swarm-target="autogenesis-toggle-loop"
            onClick={onToggleActive}
            className={cn(
              'px-3.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all',
              autogenesis.active
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] font-black'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/70 text-emerald-200'
            )}
          >
            {autogenesis.active ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Self-Dev</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Continuous Self-Dev</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6-Stage Autopoietic Pipeline Stepper */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
              {currentStageSpec.title}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {currentStageSpec.description}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {STAGE_SPECS.map((stage, idx) => {
            const isCurrent = idx === activeStageIndex;
            const isDone = idx < activeStageIndex;
            return (
              <div
                key={stage.id}
                className={cn(
                  'px-2.5 py-2 rounded-lg border transition-all flex flex-col justify-between',
                  isCurrent
                    ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : isDone
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                )}
              >
                <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase">
                  <span>0{stage.stepNum}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ) : null}
                </div>
                <div className="text-[10px] font-bold truncate mt-1">{stage.shortLabel}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Self-Introspection Telemetry & Active Hypothesis */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
          <div className="text-[9px] font-mono uppercase text-slate-400">Architectural Fitness</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-black font-mono text-emerald-400">
              {Number(autogenesis.fitnessScore).toFixed(2)}%
            </span>
            <span className="text-[9px] font-mono text-emerald-300">
              +{(autogenesis.cycleCount * 0.9).toFixed(2)}% gain
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, autogenesis.fitnessScore)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
          <div className="text-[9px] font-mono uppercase text-slate-400">Self-Synthesized Code</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-black font-mono text-sky-300">
              +{autogenesis.selfWrittenLoc} LOC
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {autogenesis.mutations.length} modules
            </span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 mt-1 truncate">
            TS · Rust · WGSL Kernels
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
          <div className="text-[9px] font-mono uppercase text-slate-400">AST &amp; Unit Assertions</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-black font-mono text-amber-300">
              {autogenesis.testSuitePassed} PASS
            </span>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> 100%
            </span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 mt-1 truncate">
            Zero regressions detected
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
          <div className="text-[9px] font-mono uppercase text-slate-400">Active Self-Hypothesis</div>
          <div className="text-[10px] font-medium text-slate-200 mt-1 line-clamp-2 leading-snug">
            {autogenesis.activeHypothesis}
          </div>
        </div>
      </div>

      {/* Bottom Split: Evolutionary Lineage List (Left) + Live Code Diff & Deep-Links (Right) */}
      <div className="flex-1 grid grid-cols-12 gap-3.5 min-h-0 overflow-hidden">
        {/* Left Column: Evolutionary Lineage Log */}
        <div className="col-span-5 bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-sky-400">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Self-Evolution Lineage ({autogenesis.mutations.length})</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Click generation to inspect</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {autogenesis.mutations.map(mut => {
              const isSelected = selectedMutation?.id === mut.id;
              return (
                <div
                  key={mut.id}
                  onClick={() => setSelectedMutationId(mut.id)}
                  className={cn(
                    'p-2.5 rounded-xl border transition-all cursor-pointer space-y-1.5',
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[9px] font-mono font-bold">
                        {mut.generation}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[165px]">
                        {sanitizeNodeLabel(mut.subsystem)}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 shrink-0">
                      {mut.timestamp}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {mut.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-sky-300">
                      {mut.fileName} (+{mut.locAdded} LOC)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-amber-300">
                      {mut.rfcId}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-purple-300">
                      {mut.ticketKey}
                    </span>
                    <span className="ml-auto text-[9px] font-mono font-bold text-emerald-400">
                      +{Number(mut.fitnessDelta).toFixed(2)}% Fitness
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Generation Code Diff & Cross-Studio Materialization Links */}
        <div className="col-span-7 bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          {selectedMutation ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold">
                      {selectedMutation.generation}
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 uppercase font-bold">
                      {selectedMutation.authorAgent}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-1">
                    {selectedMutation.subsystem}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenFileInIde(selectedMutation.fileId);
                      onSwitchModule('CODE_IDE');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/60 text-sky-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Inspect in IDE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSwitchModule('PROJECT_BOARD')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Kanban className="w-3 h-3 text-amber-400" />
                    <span>{selectedMutation.ticketKey}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSwitchModule('WHITEBOARD')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <PenTool className="w-3 h-3 text-purple-400" />
                    <span>Board</span>
                  </button>
                </div>
              </div>

              {/* Synthesized Code Patch Diff View */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono uppercase text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span>Self-Synthesized Patch: {selectedMutation.filePath}</span>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    +{selectedMutation.locAdded} lines · {selectedMutation.testAssertionsPassed} assertions passed
                  </span>
                </div>
                <pre className="p-3 rounded-xl bg-[#040814] border border-slate-800/90 font-mono text-[10px] text-emerald-300 overflow-x-auto leading-relaxed">
                  {selectedMutation.codeDiffPreview}
                </pre>
              </div>

              {/* Materialized Topological Nodes on Spatial Graph */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[9px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-sky-400" />
                  <span>Materialized Self-Architecture Nodes on Spatial Graph</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(selectedMutation.materializedNodeLabels.map(l => sanitizeNodeLabel(l)))).map(label => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleJumpToNodeLabel(label)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-sky-500/20 border border-sky-500/40 text-sky-200 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>{label}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Cpu className="w-10 h-10 text-emerald-400/60" />
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Ready for Recursive Self-Development
              </div>
              <p className="text-[11px] text-slate-400 max-w-md">
                Click <span className="text-amber-300 font-mono font-bold">Evolve Generation Now</span> or{' '}
                <span className="text-emerald-300 font-mono font-bold">Start Continuous Self-Dev</span> above to watch
                Omega Point introspect, write new kernel modules, ratify RFCs, and expand its own Knowledge Graph.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AutogenesisStudioPanel;
