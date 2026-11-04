import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ShieldCheck, Cpu, Sparkles, MessageSquare, CheckCircle2, ArrowRight, Zap, RefreshCw, Layers } from 'lucide-react';
import { SystemArchitectureProposal, SovereignQuorumProposal } from '../types';
import { cn } from '../lib/utils';

interface MultiAgentDebateArenaProps {
  proposals: SystemArchitectureProposal[];
  onRatifyProposal: (proposalId: string) => void;
  onProposeNewRFC?: () => void;
}

interface DebateArgument {
  id: string;
  agentName: string;
  agentRole: 'RESEARCHER' | 'BUILDER';
  color: string;
  argumentText: string;
  timestamp: string;
  stance: 'PROPOSE' | 'VALIDATE' | 'REFINE' | 'RATIFY';
  confidenceScore: number;
}

export const MultiAgentDebateArena: React.FC<MultiAgentDebateArenaProps> = ({
  proposals,
  onRatifyProposal,
  onProposeNewRFC
}) => {
  const [activeRfcId, setActiveRfcId] = useState<string>(proposals[0]?.id || 'RFC-201');
  const [isDebating, setIsDebating] = useState<boolean>(true);

  // Active RFC selected
  const activeProposal = useMemo(() => {
    return proposals.find(p => p.id === activeRfcId) || proposals[0] || {
      id: 'RFC-201',
      title: 'Quantum Tensor Graph Neural Manifold Pipeline',
      summary: 'High-dimensional topological resonance network with rank-4 tensor invariants.',
      authorAgent: 'SWARM_RESEARCHER_01',
      pattern: 'AUTOLYTIC_GRID',
      components: ['TensorCore', 'ResonanceEngine', 'HolographicViewport'],
      status: 'PROPOSED',
      confidence: 88
    };
  }, [proposals, activeRfcId]);

  // Quorum state for 50 Researchers vs 50 Builders
  const [quorum, setQuorum] = useState<SovereignQuorumProposal>({
    id: activeProposal.id,
    title: activeProposal.title,
    category: 'TOPOLOGICAL_SYNTHESIS',
    researcherVotesAye: 44,
    builderVotesAye: 42,
    totalResearchers: 50,
    totalBuilders: 50,
    consensusPercent: 86,
    status: activeProposal.status === 'RATIFIED' ? 'PASSED' : 'DELIBERATING',
    hypothesis: activeProposal.summary
  });

  // Dynamic live arguments feed
  const [argumentsLog, setArgumentsLog] = useState<DebateArgument[]>([
    {
      id: 'arg-1',
      agentName: 'THEORETICAL_RESEARCHER_03',
      agentRole: 'RESEARCHER',
      color: '#38bdf8',
      argumentText: 'Topological manifold geometry satisfies rank-4 Riemann curvature constraints across all synaptic links.',
      timestamp: '10:42:01',
      stance: 'PROPOSE',
      confidenceScore: 0.94
    },
    {
      id: 'arg-2',
      agentName: 'SYNTHESIS_BUILDER_12',
      agentRole: 'BUILDER',
      color: '#fbbf24',
      argumentText: 'Verified WebGL shader pipeline execution memory bounds. Render throughput exceeds 120 FPS under load.',
      timestamp: '10:42:05',
      stance: 'VALIDATE',
      confidenceScore: 0.91
    },
    {
      id: 'arg-3',
      agentName: 'CAUSAL_RESEARCHER_09',
      agentRole: 'RESEARCHER',
      color: '#38bdf8',
      argumentText: 'Information entropy delta exhibits negative gradient, confirming autopoietic stability in state transition.',
      timestamp: '10:42:11',
      stance: 'REFINE',
      confidenceScore: 0.88
    },
    {
      id: 'arg-4',
      agentName: 'ONTOLOGY_BUILDER_07',
      agentRole: 'BUILDER',
      color: '#fbbf24',
      argumentText: 'AST validation passed cleanly. Zero type collision across 100-agent CRDT state synchronization bus.',
      timestamp: '10:42:18',
      stance: 'RATIFY',
      confidenceScore: 0.96
    }
  ]);

  // Simulate ongoing agent debate stream
  useEffect(() => {
    if (!isDebating || activeProposal.status === 'RATIFIED') return;

    const debateTimer = setInterval(() => {
      const isResearcher = Math.random() > 0.5;
      const role = isResearcher ? 'RESEARCHER' : 'BUILDER';
      const agentNum = Math.floor(Math.random() * 49) + 1;
      const agentName = isResearcher
        ? `RESEARCHER_${agentNum < 10 ? '0' + agentNum : agentNum}`
        : `BUILDER_${agentNum < 10 ? '0' + agentNum : agentNum}`;

      const researcherQuotes = [
        'Synaptic weight distribution matches theoretical Pareto frontiers.',
        'Zero quantum tensor decoherence detected in 4D topological projection.',
        'Axiomatic invariant validated across all knowledge continent hulls.',
        'Causal path trace maintains 99.4% directional fidelity.'
      ];

      const builderQuotes = [
        'CRDT Lamport clock state set is fully resolved without conflict.',
        'Compiled TypeScript AST passes zero-warning strict type check.',
        'Holographic 3D force layout bounds checked with soft-GL fallback guard.',
        'Memory footprint optimized: 0 leaks detected in continuous stress test.'
      ];

      const text = isResearcher
        ? researcherQuotes[Math.floor(Math.random() * researcherQuotes.length)]
        : builderQuotes[Math.floor(Math.random() * builderQuotes.length)];

      const newArg: DebateArgument = {
        id: `arg-${Date.now()}`,
        agentName,
        agentRole: role,
        color: isResearcher ? '#38bdf8' : '#fbbf24',
        argumentText: text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        stance: Math.random() > 0.5 ? 'VALIDATE' : 'RATIFY',
        confidenceScore: +(0.85 + Math.random() * 0.14).toFixed(2)
      };

      setArgumentsLog(prev => [newArg, ...prev.slice(0, 12)]);

      setQuorum(q => {
        const nextRes = Math.min(50, q.researcherVotesAye + (isResearcher && Math.random() > 0.3 ? 1 : 0));
        const nextBld = Math.min(50, q.builderVotesAye + (!isResearcher && Math.random() > 0.3 ? 1 : 0));
        const pct = Math.round(((nextRes + nextBld) / 100) * 100);
        return {
          ...q,
          researcherVotesAye: nextRes,
          builderVotesAye: nextBld,
          consensusPercent: pct,
          status: pct >= 88 ? 'PASSED' : 'DELIBERATING'
        };
      });
    }, 2800);

    return () => clearInterval(debateTimer);
  }, [isDebating, activeProposal]);

  const handleExecuteRatification = () => {
    onRatifyProposal(activeProposal.id);
    setQuorum(q => ({
      ...q,
      researcherVotesAye: 50,
      builderVotesAye: 50,
      consensusPercent: 100,
      status: 'SYNTHESIZED'
    }));
  };

  return (
    <div
      data-swarm-target="debate-arena"
      className="w-full h-full bg-[#020617] p-4 flex flex-col gap-4 font-mono text-slate-200 overflow-hidden select-none"
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.25)]">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-white tracking-wider">
                100-Agent Swarm Multi-Agent Debate Arena
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-[9px] text-emerald-300 font-bold uppercase">
                Democratic Quorum
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              50 Theoretical Researchers ⚔️ 50 Ontology Builders · Automated RFC Architecture Ratification
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onProposeNewRFC && (
            <button
              type="button"
              onClick={onProposeNewRFC}
              className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/60 text-sky-200 text-[10px] font-bold uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Propose RFC</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDebating(!isDebating)}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors',
              isDebating ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-400'
            )}
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isDebating && 'animate-spin text-amber-400')} />
            <span>{isDebating ? 'Deliberating' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left Column: RFC Selector & Democratic Quorum Meter (5 cols) */}
        <div className="col-span-5 bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-4">
          {/* Active RFC Selector */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Select Architecture Proposal (RFC)
            </span>
            <div className="space-y-2">
              {proposals.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActiveRfcId(p.id)}
                  className={cn(
                    'p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5',
                    activeRfcId === p.id
                      ? 'bg-amber-950/20 border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="font-bold text-amber-400">{p.id}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded font-bold uppercase',
                        p.status === 'RATIFIED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'
                      )}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white leading-snug">{p.title}</div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{p.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Democratic Quorum Progress Bar */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase">
              <span className="text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Democratic Consensus Quorum
              </span>
              <span className="text-emerald-400 font-mono text-xs">{quorum.consensusPercent}%</span>
            </div>

            {/* Researchers Vote Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] text-sky-300">
                <span>50 Researchers Aye: {quorum.researcherVotesAye}/50</span>
                <span>{Math.round((quorum.researcherVotesAye / 50) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-sky-400 transition-all duration-500"
                  style={{ width: `${(quorum.researcherVotesAye / 50) * 100}%` }}
                />
              </div>
            </div>

            {/* Builders Vote Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] text-amber-300">
                <span>50 Builders Aye: {quorum.builderVotesAye}/50</span>
                <span>{Math.round((quorum.builderVotesAye / 50) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${(quorum.builderVotesAye / 50) * 100}%` }}
                />
              </div>
            </div>

            {/* Instant Ratification Trigger Button */}
            <button
              type="button"
              data-swarm-target="ratify-rfc-btn"
              disabled={activeProposal.status === 'RATIFIED'}
              onClick={handleExecuteRatification}
              className={cn(
                'w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg',
                activeProposal.status === 'RATIFIED'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
              )}
            >
              {activeProposal.status === 'RATIFIED' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>RFC Ratified & Materialized on Graph</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Ratify RFC Architecture & Materialize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Swarm Deliberation Argument Stream (7 cols) */}
        <div className="col-span-7 bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              Live Swarm Deliberation Transcripts
            </span>
            <span className="text-[10px] text-slate-400">
              {argumentsLog.length} Arguments Captured
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2.5 mt-2">
            <AnimatePresence>
              {argumentsLog.map(arg => (
                <motion.div
                  key={arg.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[9.5px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: arg.color }}>
                        {arg.agentName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {arg.agentRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>Conf {(arg.confidenceScore * 100).toFixed(0)}%</span>
                      <span>·</span>
                      <span>{arg.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{arg.argumentText}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiAgentDebateArena;
