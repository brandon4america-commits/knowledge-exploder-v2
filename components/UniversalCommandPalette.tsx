import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Command,
  Sparkles,
  Code2,
  PenTool,
  Kanban,
  Library,
  GitBranch,
  History,
  Route,
  ArrowRight,
  Play,
  Rocket,
  Layers,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  X,
  Compass,
  Share2,
  Box,
  Activity
} from 'lucide-react';
import {
  GraphNode,
  GraphLink,
  DiagramParadigm,
  WorkspaceModuleType,
  WorkspaceLayoutMode,
  WorkspaceCodeFile,
  ProjectTaskTicket,
  MultimediaAsset,
  WorkspaceSnapshot,
  CausalPathTrace,
  CausalPathStep
} from '../types';
import { DIAGRAM_PARADIGM_SPECS } from '../services/diagramLayoutEngine';
import {
  findEpistemicShortestPath,
  discoverSignificantCausalPaths,
  EPISTEMIC_PREDICATES,
  getPredicateStyle
} from '../services/causalTraceEngine';
import {
  computeQuantumTensorResonance,
  verifyV16StateMigrationIntegrity
} from '../services/quantumTensorEngine';
import { computeCosineSimilarityMatrix, sanitizeNodeLabel } from '../services/inferenceEngine';
import {
  computeKoopmanSpectralForecast,
  DialecticalSynthesisAxiom
} from '../services/koopmanEngine';
import { cn } from '../lib/utils';

interface UniversalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'COMMANDS' | 'CAUSAL_TRACE' | 'SNAPSHOTS' | 'QUANTUM_TENSOR';
  topic: string;
  nodes: GraphNode[];
  links: GraphLink[];
  selectedNode: GraphNode | null;
  onJumpFocus: (node: GraphNode) => void;
  onBridgeSemanticSynapse?: (source: GraphNode, target: GraphNode, similarity: number) => void;
  onPreEmptiveStabilize?: (axiom?: DialecticalSynthesisAxiom) => void;
  primaryParadigm: DiagramParadigm;
  onSelectPrimaryParadigm: (p: DiagramParadigm) => void;
  splitScreen: boolean;
  onToggleSplitScreen: () => void;
  workspaceLayoutMode: WorkspaceLayoutMode;
  onChangeWorkspaceLayoutMode: (m: WorkspaceLayoutMode) => void;
  activeWorkspaceModule: WorkspaceModuleType;
  onSelectWorkspaceModule: (m: WorkspaceModuleType) => void;
  codeFiles: WorkspaceCodeFile[];
  onSelectCodeFile: (fileId: string) => void;
  tickets: ProjectTaskTicket[];
  assets: MultimediaAsset[];
  onGenerateCodeModule: () => void;
  onProposeArchitecture: () => void;
  onCreateTicket: () => void;
  onTriggerDeployment: () => void;
  onMaterializeCodeToGraph: () => void;
  // Causal Pathfinding
  activeCausalTrace: CausalPathTrace | null;
  onSetCausalTrace: (trace: CausalPathTrace | null) => void;
  onExportTraceToWhiteboard: (trace: CausalPathTrace) => void;
  // Time-Travel Snapshots
  snapshots: WorkspaceSnapshot[];
  onCaptureSnapshot: (label?: string) => void;
  onRestoreSnapshot: (snapshot: WorkspaceSnapshot) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
}

export const UniversalCommandPalette: React.FC<UniversalCommandPaletteProps> = ({
  isOpen,
  onClose,
  initialTab = 'COMMANDS',
  topic,
  nodes,
  links,
  selectedNode,
  onJumpFocus,
  onBridgeSemanticSynapse,
  onPreEmptiveStabilize,
  primaryParadigm,
  onSelectPrimaryParadigm,
  splitScreen,
  onToggleSplitScreen,
  workspaceLayoutMode,
  onChangeWorkspaceLayoutMode,
  onSelectWorkspaceModule,
  codeFiles,
  onSelectCodeFile,
  tickets,
  assets,
  onGenerateCodeModule,
  onProposeArchitecture,
  onCreateTicket,
  onTriggerDeployment,
  onMaterializeCodeToGraph,
  activeCausalTrace,
  onSetCausalTrace,
  onExportTraceToWhiteboard,
  snapshots,
  onCaptureSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot
}) => {
  const [activeTab, setActiveTab] = useState<'COMMANDS' | 'CAUSAL_TRACE' | 'SNAPSHOTS' | 'QUANTUM_TENSOR'>(initialTab);
  const [query, setQuery] = useState('');
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [sourceNodeId, setSourceNodeId] = useState<string>('');
  const [targetNodeId, setTargetNodeId] = useState<string>('');
  const [selectedPredicates, setSelectedPredicates] = useState<string[]>([
    'IsA',
    'Enables',
    'DependsOn',
    'Implements',
    'Secures'
  ]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (nodes.length >= 2) {
        setSourceNodeId(prev => prev || nodes[0]?.id || '');
        setTargetNodeId(prev => prev || selectedNode?.id || nodes[nodes.length - 1]?.id || '');
      }
    }
  }, [isOpen, initialTab, nodes, selectedNode]);

  // Global keyboard shortcut Cmd+K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute Epistemic Shortest Path across heterogeneous edge predicates
  const computeShortestPath = () => {
    if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) return;

    const trace = findEpistemicShortestPath(nodes, links, sourceNodeId, targetNodeId, {
      bidirectional: true,
      predicateFilter: selectedPredicates.length > 0 ? selectedPredicates : undefined
    });

    if (trace) {
      onSetCausalTrace(trace);
    }
  };

  // Discover top epistemic paths from active context
  const discoveredPathways = useMemo(() => {
    const rootId = selectedNode?.id || sourceNodeId || nodes[0]?.id;
    if (!rootId) return [];
    return discoverSignificantCausalPaths(nodes, links, rootId, 3);
  }, [nodes, links, selectedNode, sourceNodeId]);

  const commandItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: Array<{
      id: string;
      category: string;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      action: () => void;
    }> = [
      {
        id: 'act-codegen',
        category: 'AI Autonomous Engineering',
        title: 'AI Synthesize Workspace Code Module',
        subtitle: `Generate TypeScript/Rust kernel for ${selectedNode?.label || topic || 'active ontology'}`,
        icon: <Code2 className="w-4 h-4 text-sky-400" />,
        action: () => {
          onSelectWorkspaceModule('CODE_IDE');
          if (workspaceLayoutMode === 'GRAPH_ONLY') onChangeWorkspaceLayoutMode('SPLIT_STUDIO');
          onGenerateCodeModule();
          onClose();
        }
      },
      {
        id: 'act-materialize',
        category: 'AI Autonomous Engineering',
        title: 'Compile & Materialize Active Code Module onto Graph',
        subtitle: 'Parse exported symbols in Code IDE and inject verified nodes into D3 topology',
        icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onMaterializeCodeToGraph();
          onClose();
        }
      },
      {
        id: 'act-arch',
        category: 'AI Autonomous Engineering',
        title: 'AI Propose System Architecture RFC',
        subtitle: 'Synthesize architectural pattern & materialize gateway on Digital Whiteboard',
        icon: <PenTool className="w-4 h-4 text-amber-400" />,
        action: () => {
          onSelectWorkspaceModule('WHITEBOARD');
          if (workspaceLayoutMode === 'GRAPH_ONLY') onChangeWorkspaceLayoutMode('SPLIT_STUDIO');
          onProposeArchitecture();
          onClose();
        }
      },
      {
        id: 'act-ticket',
        category: 'AI Autonomous Engineering',
        title: 'Create Sprint Task Ticket on Kanban Board',
        subtitle: 'Generate high-priority engineering ticket linked to active graph concept',
        icon: <Kanban className="w-4 h-4 text-purple-400" />,
        action: () => {
          onSelectWorkspaceModule('PROJECT_BOARD');
          if (workspaceLayoutMode === 'GRAPH_ONLY') onChangeWorkspaceLayoutMode('SPLIT_STUDIO');
          onCreateTicket();
          onClose();
        }
      },
      {
        id: 'act-deploy',
        category: 'AI Autonomous Engineering',
        title: 'Execute 4-Stage Automated Deployment Pipeline',
        subtitle: 'Run lint, WASM kernel compilation, quorum audit, and edge rollout',
        icon: <Rocket className="w-4 h-4 text-rose-400" />,
        action: () => {
          onSelectWorkspaceModule('CODE_IDE');
          if (workspaceLayoutMode === 'GRAPH_ONLY') onChangeWorkspaceLayoutMode('SPLIT_STUDIO');
          onTriggerDeployment();
          onClose();
        }
      },
      {
        id: 'act-split-compare',
        category: 'Diagram Paradigms',
        title: splitScreen ? 'Disable 2X Split-Screen Diagram Comparison' : 'Enable 2X Split-Screen Diagram Comparison',
        subtitle: 'Simultaneously compare two mathematical diagram projections side-by-side',
        icon: <Layers className="w-4 h-4 text-sky-400" />,
        action: () => {
          onToggleSplitScreen();
          onClose();
        }
      }
    ];

    // Add all 6 Diagram Paradigms
    DIAGRAM_PARADIGM_SPECS.forEach(spec => {
      list.push({
        id: `paradigm-${spec.id}`,
        category: 'Wikipedia Category:Diagrams',
        title: `Morph Graph to ${spec.fullName}`,
        subtitle: `${spec.invariant} — ${spec.encodingRule}`,
        icon: <Compass className="w-4 h-4 text-sky-300" />,
        action: () => {
          onSelectPrimaryParadigm(spec.id);
          onClose();
        }
      });
    });

    // Add Graph Nodes
    nodes.forEach(node => {
      list.push({
        id: `node-${node.id}`,
        category: 'Knowledge Graph Nodes',
        title: `Jump-Focus Node: ${node.label}`,
        subtitle: node.description || `Depth ${node.depth} · Resonance ${(node.strength * 100).toFixed(0)}%`,
        icon: <Share2 className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onJumpFocus(node);
          onClose();
        }
      });
    });

    // Add Code Files
    codeFiles.forEach(file => {
      list.push({
        id: `file-${file.id}`,
        category: 'Workspace Code Repository',
        title: `Open File: ${file.name}`,
        subtitle: `${file.path} · ${file.authorAgent}`,
        icon: <Code2 className="w-4 h-4 text-sky-400" />,
        action: () => {
          onSelectCodeFile(file.id);
          onSelectWorkspaceModule('CODE_IDE');
          if (workspaceLayoutMode === 'GRAPH_ONLY') onChangeWorkspaceLayoutMode('SPLIT_STUDIO');
          onClose();
        }
      });
    });

    if (!q) return list.slice(0, 18);
    return list.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [
    query,
    selectedNode,
    topic,
    workspaceLayoutMode,
    splitScreen,
    nodes,
    codeFiles,
    onSelectWorkspaceModule,
    onChangeWorkspaceLayoutMode,
    onGenerateCodeModule,
    onMaterializeCodeToGraph,
    onProposeArchitecture,
    onCreateTicket,
    onTriggerDeployment,
    onToggleSplitScreen,
    onSelectPrimaryParadigm,
    onJumpFocus,
    onSelectCodeFile,
    onClose
  ]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          className="w-full max-w-3xl bg-[#050914] border-2 border-sky-500/50 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Modal Top Tab Switcher */}
          <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('COMMANDS')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors',
                  activeTab === 'COMMANDS'
                    ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                )}
              >
                <Command className="w-3.5 h-3.5" />
                <span>Command Palette (⌘K)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CAUSAL_TRACE')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors',
                  activeTab === 'CAUSAL_TRACE'
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                )}
              >
                <Route className="w-3.5 h-3.5" />
                <span>Causal Path Analyzer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('SNAPSHOTS')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors',
                  activeTab === 'SNAPSHOTS'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                )}
              >
                <History className="w-3.5 h-3.5" />
                <span>Time-Travel Snapshots ({snapshots.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('QUANTUM_TENSOR')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors',
                  activeTab === 'QUANTUM_TENSOR'
                    ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                )}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Quantum Tensor</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TAB 1: UNIVERSAL COMMAND PALETTE */}
          {activeTab === 'COMMANDS' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-3">
                <Search className="w-4 h-4 text-sky-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search commands, graph nodes, diagram paradigms, code files, or AI workflows..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none font-mono"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-xs text-slate-500 hover:text-white font-mono"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                {commandItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className="w-full p-3 rounded-xl bg-slate-900/50 hover:bg-sky-500/15 border border-slate-800/80 hover:border-sky-400/60 flex items-center justify-between gap-4 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-sky-200 truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 shrink-0 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: EPISTEMIC SHORTEST-PATH & CAUSAL TRACE ANALYZER */}
          {activeTab === 'CAUSAL_TRACE' && (
            <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Epistemic Shortest-Path & Causal Pathway Tracer
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compute and highlight the shortest relational chain between any two concepts in the Knowledge Graph.
                  </p>
                </div>
                {activeCausalTrace && (
                  <button
                    type="button"
                    onClick={() => onSetCausalTrace(null)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-white cursor-pointer"
                  >
                    Clear Active Trace
                  </button>
                )}
              </div>

              {nodes.length < 2 ? (
                <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
                  Initialize a Knowledge Graph mission first to trace causal pathways between nodes.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="md:col-span-5 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        Origin Concept Node
                      </label>
                      <select
                        value={sourceNodeId}
                        onChange={e => setSourceNodeId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                      >
                        {nodes.map(n => (
                          <option key={n.id} value={n.id}>
                            {n.label} (Depth {n.depth})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-5 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        Target Destination Node
                      </label>
                      <select
                        value={targetNodeId}
                        onChange={e => setTargetNodeId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                      >
                        {nodes.map(n => (
                          <option key={n.id} value={n.id}>
                            {n.label} (Depth {n.depth})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="button"
                        data-swarm-target="trace-path-btn"
                        onClick={computeShortestPath}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase cursor-pointer transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        Trace Path
                      </button>
                    </div>
                  </div>

                  {/* Heterogeneous Edge Predicate Conductivity Filters */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400 uppercase font-bold">Active Epistemic Predicates</span>
                      <span className="text-slate-500">Filter synaptic conductivity</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {['IsA', 'Enables', 'DependsOn', 'Implements', 'Secures'].map(pred => {
                        const style = getPredicateStyle(pred);
                        const isSelected = selectedPredicates.includes(pred);
                        return (
                          <button
                            key={pred}
                            type="button"
                            onClick={() => {
                              setSelectedPredicates(prev =>
                                prev.includes(pred)
                                  ? prev.filter(p => p !== pred)
                                  : [...prev, pred]
                              );
                            }}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer',
                              isSelected
                                ? 'bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                            )}
                            style={{
                              borderColor: isSelected ? style.color : undefined,
                              color: isSelected ? style.color : undefined
                            }}
                          >
                            <span>{style.symbol}</span>
                            <span>{pred}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Discovered High-Resonance Epistemic Pathways */}
                  {discoveredPathways.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        Top Discovered Epistemic Pathways
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {discoveredPathways.map(trace => {
                          const sLabel = trace.steps[0]?.nodeLabel;
                          const tLabel = trace.steps[trace.steps.length - 1]?.nodeLabel;
                          return (
                            <button
                              key={`${trace.fromNodeId}-${trace.toNodeId}`}
                              type="button"
                              onClick={() => {
                                setSourceNodeId(trace.fromNodeId);
                                setTargetNodeId(trace.toNodeId);
                                onSetCausalTrace(trace);
                              }}
                              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                                <span className="text-emerald-400 font-bold">{trace.totalResonance}% Resonance</span>
                                <span className="text-slate-500">{trace.steps.length} hops</span>
                              </div>
                              <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                                {sLabel} → {tLabel}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeCausalTrace && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-mono text-emerald-300 font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>Causal Chain Resolved: {activeCausalTrace.steps.length} Hops · Aggregate Resonance {activeCausalTrace.totalResonance}%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onExportTraceToWhiteboard(activeCausalTrace);
                            onClose();
                          }}
                          className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/60 text-sky-200 text-[10px] font-mono font-bold uppercase cursor-pointer"
                        >
                          Materialize Chain on Whiteboard
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {activeCausalTrace.steps.map((step, idx) => {
                          const pStyle = getPredicateStyle(step.relationshipToNext);
                          return (
                            <React.Fragment key={step.nodeId}>
                              <button
                                type="button"
                                onClick={() => {
                                  const found = nodes.find(n => n.id === step.nodeId);
                                  if (found) {
                                    onJumpFocus(found);
                                    onClose();
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border text-xs font-bold text-white cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                style={{ borderColor: idx === 0 || idx === activeCausalTrace.steps.length - 1 ? '#10b981' : '#38bdf8' }}
                              >
                                <span className="text-[10px] font-mono text-emerald-400">#{idx + 1}</span>
                                <span>{step.nodeLabel}</span>
                              </button>
                              {step.relationshipToNext && (
                                <div
                                  className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border font-bold"
                                  style={{ color: pStyle.color, borderColor: `${pStyle.color}55` }}
                                >
                                  <span>{pStyle.symbol}</span>
                                  <span>{step.relationshipToNext}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: TIME-TRAVEL SNAPSHOT VERSIONING */}
          {activeTab === 'SNAPSHOTS' && (
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <input
                  type="text"
                  value={snapshotLabel}
                  onChange={e => setSnapshotLabel(e.target.value)}
                  placeholder="Checkpoint label (e.g. Pre-Refactor Ontology v2)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    onCaptureSnapshot(snapshotLabel.trim() || undefined);
                    setSnapshotLabel('');
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Capture State Checkpoint</span>
                </button>
              </div>

              <div className="space-y-2">
                {snapshots.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-mono border border-slate-800 rounded-xl">
                    No snapshots recorded yet. Capture a checkpoint above to enable instant time-travel restoration.
                  </div>
                ) : (
                  snapshots.map(snap => (
                    <div
                      key={snap.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{snap.label}</span>
                          <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                            {snap.timestamp}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
                          <span>Topic: {snap.topic || 'Omega'}</span>
                          <span>·</span>
                          <span>{snap.nodeCount} Nodes</span>
                          <span>·</span>
                          <span>{snap.linkCount} Synapses</span>
                          <span>·</span>
                          <span>{snap.fileCount} Code Files</span>
                          <span>·</span>
                          <span>{snap.ticketCount} Tickets</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onRestoreSnapshot(snap);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSnapshot(snap.id)}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-300 cursor-pointer"
                          title="Delete Snapshot"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: QUANTUM TENSOR & KOOPMAN SPECTRAL FORECAST INSPECTOR */}
          {activeTab === 'QUANTUM_TENSOR' && (() => {
            const tensor = computeQuantumTensorResonance(nodes, links);
            const cosineSummary = computeCosineSimilarityMatrix(nodes, links, 4);
            const migrationReport = verifyV16StateMigrationIntegrity(nodes, links);
            const koopman = computeKoopmanSpectralForecast(nodes, links, snapshots);
            return (
              <div className="flex flex-col flex-1 p-5 space-y-4 overflow-y-auto font-mono text-xs custom-scrollbar">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5" />
                      <span>Rank-4 CSR Tensor · Koopman DMD Operator · 64D Vector Bridge</span>
                    </div>
                    <h3 className="text-sm font-black text-white mt-0.5">
                      Quantum Spectral &amp; Koopman Forecasting ({topic || 'Omega Topology'})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase flex items-center gap-1',
                        migrationReport.passed
                          ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-400/50 text-rose-300'
                      )}
                      title="v17 State Hydration & Schema Regression Check"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>v17 Integrity: {migrationReport.passed ? 'PASS' : 'WARN'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onGenerateCodeModule();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/60 text-purple-200 text-[10px] font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Synthesize Quantum Kernel</span>
                    </button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Rank-4 Tensor Norm</span>
                    <span className="text-base font-black text-sky-400">R#{tensor.rank4TensorNorm}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Tensor Entropy</span>
                    <span className="text-base font-black text-amber-400">{tensor.networkTensorEntropy} Bits</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Koopman Radius ρ(K)</span>
                    <span
                      className={cn(
                        'text-base font-black',
                        koopman.spectralRadius > 1.0 ? 'text-rose-400' : 'text-emerald-400'
                      )}
                    >
                      |λ|={koopman.spectralRadius.toFixed(3)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Zero-Copy Buffer</span>
                    <span className="text-base font-black text-emerald-400">
                      {tensor.sharedBufferBytes || 0} B
                    </span>
                  </div>
                </div>

                {/* KOOPMAN OPERATOR SPECTRAL FORECAST SUB-PANEL (v17.0) */}
                <div className="p-4 rounded-xl bg-slate-900/85 border-2 border-sky-500/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[11px] font-black uppercase text-white tracking-wider">
                          Koopman Forecast &amp; Dynamic Mode Decomposition (5-Epoch Horizon)
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[9px] font-bold uppercase border',
                            koopman.spectralRadius > 1.0
                              ? 'bg-rose-500/15 border-rose-400/50 text-rose-300'
                              : 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                          )}
                        >
                          {koopman.spectralRadius > 1.0 ? '|λ_k| > 1 UNSTABLE GROWTH' : '|λ_k| ≤ 1 STABLE ATTRACTOR'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Primary Bottleneck Attractor: <span className="text-sky-300 font-bold">{koopman.dominantBottleneckCluster}</span> · {koopman.snapshotsAnalyzed} Temporal Snapshots Sampled
                      </p>
                    </div>

                    {onPreEmptiveStabilize && (
                      <button
                        type="button"
                        data-swarm-target="koopman-stabilize-btn"
                        onClick={() => onPreEmptiveStabilize(koopman.dialecticalAxioms[0])}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/70 text-emerald-200 text-[10px] font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Pre-Emptive Stabilize</span>
                      </button>
                    )}
                  </div>

                  {/* Eigenvalue Dynamic Modes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {koopman.eigenModes.map(mode => (
                      <div
                        key={mode.id}
                        className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <span>{mode.modeName}</span>
                            <span className="text-[9px] text-slate-500">({mode.observableChannel})</span>
                          </div>
                          <div className="text-[9.5px] text-slate-400 mt-0.5">
                            λ = {mode.real >= 0 ? `+${mode.real}` : mode.real} {mode.imag >= 0 ? `+ ${mode.imag}i` : `- ${Math.abs(mode.imag)}i`} · γ={mode.growthRate >= 0 ? `+${mode.growthRate}` : mode.growthRate}
                          </div>
                        </div>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[9px] font-bold uppercase border shrink-0',
                            mode.isUnstable
                              ? 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                              : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                          )}
                        >
                          |λ|={mode.modulus.toFixed(2)} {mode.isUnstable ? 'UNSTABLE' : 'STABLE'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 5-Epoch Horizon Forecast Strip */}
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {koopman.epochForecasts.map(ep => (
                      <div
                        key={ep.epochOffset}
                        className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-center space-y-0.5"
                      >
                        <div className="text-[9px] text-sky-400 font-bold uppercase">
                          Epoch +{ep.epochOffset}
                        </div>
                        <div className="text-[11px] font-black text-white">
                          {ep.projectedNodeCount} Nodes
                        </div>
                        <div className="text-[9px] text-amber-300">
                          H={ep.projectedEntropy.toFixed(2)}b
                        </div>
                        <div className="text-[8.5px] text-slate-400">
                          Drift {ep.clusterMassDriftPct.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Autonomous Dialectical Synthesis Bridge Axioms */}
                  {koopman.dialecticalAxioms.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="text-[9.5px] text-emerald-400 font-bold uppercase flex items-center justify-between">
                        <span>Autonomous Dialectical Synthesis (Canonical Bridge Axioms)</span>
                        <span className="text-slate-500">Zero Prefix Stacking</span>
                      </div>
                      <div className="space-y-1.5">
                        {koopman.dialecticalAxioms.map(ax => (
                          <div
                            key={ax.id}
                            className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-[10.5px] font-bold text-emerald-200 truncate">
                                {ax.canonicalAxiomLabel}
                              </div>
                              <div className="text-[9px] text-slate-400 truncate">
                                {sanitizeNodeLabel(ax.thesisNode.label)} ({ax.opposingPredicates[0]}) ⊕ {sanitizeNodeLabel(ax.antithesisNode.label)} ({ax.opposingPredicates[1]}) · -{ax.entropyReductionBits}b Entropy
                              </div>
                            </div>
                            {onPreEmptiveStabilize && (
                              <button
                                type="button"
                                onClick={() => onPreEmptiveStabilize(ax)}
                                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/60 text-emerald-200 text-[9px] font-bold uppercase shrink-0 cursor-pointer"
                              >
                                Synthesize Axiom
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Unlinked 64D Vector-Symbolic Bridge Candidates */}
                {cosineSummary.bridgeCandidates.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-purple-500/40 space-y-2">
                    <div className="text-[10px] text-purple-300 font-bold uppercase flex items-center justify-between">
                      <span>64D Latent Semantic Bridge Candidates (Unlinked High-Proximity Pairs)</span>
                      <span className="text-slate-500">N×N Cosine Matrix ({cosineSummary.dimension}D)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cosineSummary.bridgeCandidates.map(bridge => {
                        const sNode = bridge.sourceNode;
                        const tNode = bridge.targetNode;
                        return (
                          <div
                            key={`${sNode.id}-${tNode.id}`}
                            className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-white truncate">
                                {sanitizeNodeLabel(sNode.label)} ↔ {sanitizeNodeLabel(tNode.label)}
                              </div>
                              <div className="text-[9px] text-purple-300">
                                Cosine Sim: {(bridge.cosineSimilarity * 100).toFixed(1)}% · Latent Resonance: {(bridge.latentResonanceProduct * 100).toFixed(1)}%
                              </div>
                            </div>
                            {onBridgeSemanticSynapse && (
                              <button
                                type="button"
                                onClick={() => onBridgeSemanticSynapse(sNode, tNode, bridge.cosineSimilarity)}
                                className="px-2.5 py-1 rounded bg-purple-500/25 hover:bg-purple-500/40 border border-purple-400/60 text-purple-200 text-[9px] font-bold uppercase shrink-0 cursor-pointer transition-colors"
                              >
                                Bridge
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Predicate Resonance Channel Breakdown */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
                    <span>Predicate Resonance Channels (Exponential Epoch Decay λ={tensor.lambdaDecay})</span>
                    <span>{links.length} Synapses Analyzed</span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(tensor.predicateResonanceDistribution).map(([pred, pct]) => (
                      <div key={pred} className="space-y-0.5">
                        <div className="flex justify-between text-[9.5px]">
                          <span className="text-slate-300 font-bold">{pred}</span>
                          <span className="text-purple-300 font-bold">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-sky-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Eigen-Resonant Nodes Table */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Top Eigen-Resonant Nodes
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar">
                    {nodes.slice(0, 6).map(node => {
                      const res = tensor.nodeResonanceMap[node.id] || 0.5;
                      return (
                        <div
                          key={node.id}
                          onClick={() => {
                            onJumpFocus(node);
                            onClose();
                          }}
                          className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 flex items-center justify-between cursor-pointer transition-all"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">{node.label}</div>
                            <div className="text-[9px] text-slate-500">Group #{node.group} · Depth L#{node.depth}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                              {(res * 100).toFixed(1)}% Res
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UniversalCommandPalette;
