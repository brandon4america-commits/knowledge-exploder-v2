import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Zap,
  Globe,
  ExternalLink,
  Copy,
  Pin,
  Code2,
  Kanban,
  PenTool,
  Library,
  Route,
  Sparkles,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  GraphNode,
  WorkspaceCodeFile,
  ProjectTaskTicket,
  MultimediaAsset,
  WorkspaceModuleType,
  SpatialPatternType,
  NodeCentralityMetrics
} from '../types';
import { querySemanticProximity } from '../services/inferenceEngine';

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

interface InsightOverlayProps {
  selectedNode: GraphNode | null;
  setSelectedNode: (n: GraphNode | null) => void;
  isPinned: boolean;
  togglePinned: () => void;
  handleNodeClick: (n: GraphNode) => void;
  chatLog: string;
  studioOpen?: boolean;
  allNodes?: GraphNode[];
  onBridgeSemanticSynapse?: (source: GraphNode, target: GraphNode, similarity: number) => void;
  codeFiles?: WorkspaceCodeFile[];
  tickets?: ProjectTaskTicket[];
  assets?: MultimediaAsset[];
  onOpenStudioModule?: (mod: WorkspaceModuleType) => void;
  onSynthesizeNodeCode?: (node: GraphNode) => void;
  onCreateNodeTicket?: (node: GraphNode) => void;
  onAddNodeToWhiteboard?: (node: GraphNode) => void;
  onOpenCausalTracer?: (node: GraphNode) => void;
  activeSpatialPattern?: SpatialPatternType;
  onApplySpatialPattern?: (pattern: SpatialPatternType, anchorNode?: GraphNode) => void;
  centralityMetrics?: NodeCentralityMetrics | null;
  onDiveMicrocosm?: (node: GraphNode) => void;
  onSynthesizeSubGraph?: (node: GraphNode) => void;
  isSynthesizingSubGraph?: boolean;
}

const InsightOverlay: React.FC<InsightOverlayProps> = ({
  selectedNode,
  setSelectedNode,
  isPinned,
  togglePinned,
  handleNodeClick,
  chatLog,
  studioOpen = false,
  allNodes = [],
  onBridgeSemanticSynapse,
  codeFiles = [],
  tickets = [],
  assets = [],
  onOpenStudioModule,
  onSynthesizeNodeCode,
  onCreateNodeTicket,
  onAddNodeToWhiteboard,
  onOpenCausalTracer,
  activeSpatialPattern = 'FORCE_DEFAULT',
  onApplySpatialPattern,
  centralityMetrics = null,
  onDiveMicrocosm,
  onSynthesizeSubGraph,
  isSynthesizingSubGraph = false
}) => {
  const semanticNeighbors = selectedNode && allNodes.length > 1
    ? querySemanticProximity(allNodes, selectedNode.id, 3)
    : [];
  const linkedFiles = selectedNode
    ? codeFiles.filter(
        f =>
          f.linkedNodeLabel?.toLowerCase() === selectedNode.label.toLowerCase() ||
          f.content.toLowerCase().includes(selectedNode.label.toLowerCase())
      )
    : [];

  const linkedTickets = selectedNode
    ? tickets.filter(
        t =>
          t.linkedNodeLabel?.toLowerCase() === selectedNode.label.toLowerCase() ||
          t.title.toLowerCase().includes(selectedNode.label.toLowerCase())
      )
    : [];

  const linkedAssets = selectedNode
    ? assets.filter(
        a =>
          a.linkedNodeId === selectedNode.id ||
          a.linkedNodeLabel?.toLowerCase() === selectedNode.label.toLowerCase()
      )
    : [];

  return (
    <AnimatePresence mode="wait">
      {selectedNode && (
        <motion.div
          key={selectedNode.id}
          initial={{ x: studioOpen ? -60 : 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: studioOpen ? -60 : 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 180 }}
          className={cn(
            'absolute top-14 max-h-[calc(100%-125px)] bg-slate-950/95 backdrop-blur-3xl border border-sky-400/70 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] z-40 overflow-hidden flex flex-col max-w-[calc(100vw-2rem)]',
            studioOpen ? 'left-4 w-[360px] xl:w-[390px]' : 'right-4 w-[380px] xl:w-[430px]'
          )}
        >
          {selectedNode.isGhost ? (
            <div className="p-12 text-center space-y-6 h-full flex flex-col justify-center bg-gradient-to-b from-sky-500/10 to-transparent">
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-20 h-20 bg-sky-500/20 rounded-3xl mx-auto flex items-center justify-center border-2 border-sky-400/60"
              >
                <Zap className="w-9 h-9 text-sky-400" />
              </motion.div>
              <div className="space-y-2">
                <div className="text-sky-400 text-[10px] font-black uppercase tracking-[0.4em]">
                  Spectral Intent Vector
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none uppercase">
                  {selectedNode.label}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium px-4">
                This concept resides in the latent topological frontier. Materializing it will expand connected Knowledge Continents.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleNodeClick(selectedNode)}
                  className="bg-sky-500 hover:bg-sky-400 border border-sky-200 text-[10px] font-black text-white px-8 py-3 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-sky-500/30 cursor-pointer"
                >
                  Manifest Concept
                </button>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative h-44 bg-slate-900 group overflow-hidden border-b border-sky-500/40 shrink-0">
                {selectedNode.wikiImage ? (
                  <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    src={selectedNode.wikiImage}
                    className="w-full h-full object-cover opacity-55 group-hover:opacity-75 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[14rem] font-black text-white/5 italic select-none absolute -bottom-12 -right-10 leading-none">
                    {selectedNode.label[0]}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute top-4 left-5 flex gap-2">
                  <span className="px-3 py-1 bg-sky-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow border border-sky-300">
                    Depth 0{selectedNode.depth}
                  </span>
                  <span className="px-3 py-1 bg-slate-900/85 text-sky-300 text-[9px] font-mono font-bold uppercase rounded-lg border border-sky-400/50">
                    Resonance {(selectedNode.strength * 100).toFixed(0)}%
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/85 hover:bg-black rounded-full transition-all text-sky-400 hover:text-white border border-sky-400/50 cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePinned}
                  className={cn(
                    'absolute top-4 right-14 p-2 bg-slate-900/85 hover:bg-black rounded-full transition-all border border-sky-400/50 cursor-pointer',
                    isPinned ? 'text-sky-300 bg-sky-500/30 border-sky-300' : 'text-slate-400 hover:text-white'
                  )}
                  title="Pin Node Inspector"
                >
                  <Pin className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-5 right-5">
                  <h3 className="text-2xl font-black tracking-tight text-white uppercase truncate">
                    {selectedNode.label}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex-1 overflow-y-auto space-y-5 custom-scrollbar">
                {/* Concept Description */}
                <div className="relative p-3.5 rounded-xl bg-slate-900/70 border border-sky-500/30 group/desc">
                  <button
                    onClick={() => copyToClipboard(selectedNode.description || '')}
                    className="absolute right-2.5 top-2.5 opacity-0 group-hover/desc:opacity-100 transition-opacity p-1 text-sky-400 hover:text-white bg-slate-800 rounded"
                    title="Copy description"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <p className="text-slate-200 font-medium text-xs leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Centrality Metrics & Spatial Pattern Reorganization Panel */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-500/40 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-800 pb-1.5">
                    <span className="text-sky-300 uppercase font-bold tracking-wider">
                      D3 Centrality Analytics
                    </span>
                    {centralityMetrics ? (
                      <span className="text-amber-400 font-bold tabular-nums">
                        Rank #{centralityMetrics.centralityRank} · Tier {centralityMetrics.quartileTier}
                      </span>
                    ) : (
                      <span className="text-slate-500">Evaluating topology...</span>
                    )}
                  </div>

                  {centralityMetrics && (
                    <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                      <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                        <div className="text-[8px] uppercase text-slate-400">Composite</div>
                        <div className="text-xs font-bold text-sky-300 tabular-nums">
                          {(centralityMetrics.compositeScore * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                        <div className="text-[8px] uppercase text-slate-400">Degree</div>
                        <div className="text-xs font-bold text-slate-200 tabular-nums">
                          {centralityMetrics.degreeCentrality.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                        <div className="text-[8px] uppercase text-slate-400">Betweenness</div>
                        <div className="text-xs font-bold text-emerald-400 tabular-nums">
                          {centralityMetrics.betweennessCentrality.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800">
                        <div className="text-[8px] uppercase text-slate-400">Hop Distance</div>
                        <div className="text-xs font-bold text-purple-300 tabular-nums">
                          {centralityMetrics.hopDistanceFromAnchor} hops
                        </div>
                      </div>
                    </div>
                  )}

                  {onApplySpatialPattern && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[9px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
                        <span>Reorganize Graph Around This Node</span>
                        {activeSpatialPattern !== 'FORCE_DEFAULT' && (
                          <span className="text-sky-400">Active</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px]">
                        <button
                          type="button"
                          onClick={() => onApplySpatialPattern('CENTRALITY_RADIAL', selectedNode)}
                          className={cn(
                            'px-2 py-1.5 rounded border transition-colors cursor-pointer text-center truncate',
                            activeSpatialPattern === 'CENTRALITY_RADIAL'
                              ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          )}
                          title="Concentric circles by BFS hop distance from this node"
                        >
                          Radial Rings
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplySpatialPattern('CENTRALITY_TREE', selectedNode)}
                          className={cn(
                            'px-2 py-1.5 rounded border transition-colors cursor-pointer text-center truncate',
                            activeSpatialPattern === 'CENTRALITY_TREE'
                              ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          )}
                          title="Hierarchical BFS spanning tree rooted at this node"
                        >
                          Rooted Tree
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplySpatialPattern('CENTRALITY_GRID', selectedNode)}
                          className={cn(
                            'px-2 py-1.5 rounded border transition-colors cursor-pointer text-center truncate',
                            activeSpatialPattern === 'CENTRALITY_GRID'
                              ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          )}
                          title="Orthogonal matrix ordered by composite centrality with this node at center"
                        >
                          Central Grid
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplySpatialPattern('CENTRALITY_SPIRAL', selectedNode)}
                          className={cn(
                            'px-2 py-1.5 rounded border transition-colors cursor-pointer text-center truncate',
                            activeSpatialPattern === 'CENTRALITY_SPIRAL'
                              ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          )}
                          title="Fibonacci golden-angle spiral radiating outward from this node"
                        >
                          Spiral Lattice
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplySpatialPattern('CENTRALITY_BIPARTITE', selectedNode)}
                          className={cn(
                            'px-2 py-1.5 rounded border transition-colors cursor-pointer text-center truncate',
                            activeSpatialPattern === 'CENTRALITY_BIPARTITE'
                              ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          )}
                          title="Multi-tier columns partitioning nodes into centrality quartiles"
                        >
                          Quartile Strata
                        </button>
                        <button
                          type="button"
                          onClick={() => onApplySpatialPattern('FORCE_DEFAULT')}
                          className="px-2 py-1.5 rounded border border-slate-700 bg-slate-900 text-slate-400 hover:text-sky-300 hover:border-sky-400/60 transition-colors cursor-pointer text-center truncate"
                          title="Release spatial constraint and resume organic force physics"
                        >
                          Release Force
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Creative Studio & Causal Bridge Actions */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                    Creative Studio & Autonomous Synthesis Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {onSynthesizeNodeCode && (
                      <button
                        type="button"
                        onClick={() => onSynthesizeNodeCode(selectedNode)}
                        className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/50 text-sky-200 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Code2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">Synthesize Code</span>
                      </button>
                    )}
                    {onCreateNodeTicket && (
                      <button
                        type="button"
                        onClick={() => onCreateNodeTicket(selectedNode)}
                        className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/50 text-purple-200 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Kanban className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">Create Sprint Ticket</span>
                      </button>
                    )}
                    {onAddNodeToWhiteboard && (
                      <button
                        type="button"
                        onClick={() => onAddNodeToWhiteboard(selectedNode)}
                        className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-200 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <PenTool className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Pin to Whiteboard</span>
                      </button>
                    )}
                    {onOpenCausalTracer && (
                      <button
                        type="button"
                        onClick={() => onOpenCausalTracer(selectedNode)}
                        className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Route className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">Trace Causal Path</span>
                      </button>
                    )}
                    {onDiveMicrocosm && (
                      <button
                        type="button"
                        onClick={() => onDiveMicrocosm(selectedNode)}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/35 hover:to-indigo-500/35 border border-purple-400/60 text-purple-200 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                        title="Dive into isolated fractal sub-graph microcosm simulation"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-300 shrink-0 animate-pulse" />
                        <span className="truncate">Dive Microcosm</span>
                      </button>
                    )}
                    {onSynthesizeSubGraph && (
                      <button
                        type="button"
                        disabled={isSynthesizingSubGraph}
                        onClick={() => onSynthesizeSubGraph(selectedNode)}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/35 hover:to-teal-500/35 border border-cyan-400/60 text-cyan-200 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] disabled:opacity-50"
                        title="Synthesize sub-graph microcosm dynamically using Gemini API"
                      >
                        <Sparkles className={cn("w-3.5 h-3.5 text-cyan-300 shrink-0", isSynthesizingSubGraph && "animate-spin")} />
                        <span className="truncate">{isSynthesizingSubGraph ? 'Synthesizing...' : 'AI Synthesize Sub-Graph'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 64D Neural-Symbolic Latent Proximity Bridge */}
                {semanticNeighbors.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/40 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-purple-300 uppercase font-bold">
                        64D Latent Semantic Proximity
                      </span>
                      <span className="text-slate-500">Cosine Vector Bridge</span>
                    </div>
                    <div className="space-y-1.5">
                      {semanticNeighbors.map(({ node: neighbor, cosineSimilarity }) => (
                        <div
                          key={neighbor.id}
                          className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-white truncate">
                              {neighbor.label}
                            </div>
                            <div className="text-[9px] font-mono text-purple-300">
                              Cosine Sim: {(cosineSimilarity * 100).toFixed(1)}% · Depth 0{neighbor.depth}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {onBridgeSemanticSynapse && (
                              <button
                                type="button"
                                data-swarm-target={`bridge-synapse-${neighbor.id}`}
                                onClick={() => onBridgeSemanticSynapse(selectedNode, neighbor, cosineSimilarity)}
                                className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/60 text-[9px] font-mono font-bold text-purple-200 uppercase cursor-pointer transition-colors"
                              >
                                Bridge Synapse
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleNodeClick(neighbor)}
                              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[9px] font-mono text-sky-300 cursor-pointer"
                            >
                              Focus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Studio Artifacts (Code, Tickets, Assets) */}
                {(linkedFiles.length > 0 || linkedTickets.length > 0 || linkedAssets.length > 0) && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      Coupled Studio Artifacts ({linkedFiles.length + linkedTickets.length + linkedAssets.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {linkedFiles.map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => onOpenStudioModule?.('CODE_IDE')}
                          className="px-2 py-1 rounded bg-sky-950/60 border border-sky-500/40 text-[9px] font-mono text-sky-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>{f.name}</span>
                        </button>
                      ))}
                      {linkedTickets.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onOpenStudioModule?.('PROJECT_BOARD')}
                          className="px-2 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-[9px] font-mono text-purple-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Kanban className="w-3 h-3" />
                          <span>{t.key}</span>
                        </button>
                      ))}
                      {linkedAssets.map(a => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => onOpenStudioModule?.('ASSET_LIBRARY')}
                          className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Library className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{a.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Neural Synthetic Logic */}
                <div className="p-4 bg-sky-950/35 rounded-2xl border border-sky-400/50 space-y-2 relative group">
                  <button
                    onClick={() => copyToClipboard(chatLog)}
                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-sky-400 hover:text-white bg-slate-900 border border-sky-400/40 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <div className="text-[9px] font-mono font-bold text-sky-300 uppercase tracking-widest flex items-center gap-2">
                    <div className={cn('w-2 h-2 bg-sky-400 rounded-full', !chatLog && 'animate-pulse')} />
                    {chatLog ? 'Topological Synthesis' : 'Synchronizing...'}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    {chatLog || 'Synchronizing with topological manifold...'}
                  </p>
                </div>

                {/* Wikipedia Empirical Grounding */}
                {selectedNode.wikiSummary && (
                  <div className="space-y-3 pt-3 border-t border-sky-500/30">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">
                        Empirical Encyclopedia Grounding
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.wikiSummary}</p>
                    <a
                      href={selectedNode.wikiUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-sky-400 hover:text-sky-300 uppercase tracking-wider border-b border-sky-400/40 pb-1"
                    >
                      <span>Open Wikipedia Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InsightOverlay;
