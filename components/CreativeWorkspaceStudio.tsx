import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenTool,
  Code2,
  Kanban,
  Library,
  Play,
  Rocket,
  Plus,
  Sparkles,
  Terminal,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileCode,
  FolderGit2,
  Cpu,
  Maximize2,
  Minimize2,
  X,
  Link2,
  Users,
  GitBranch,
  Share2,
  RefreshCw,
  Trash2,
  Download,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  Search,
  Columns,
  TrendingUp
} from 'lucide-react';
import {
  WorkspaceModuleType,
  WorkspaceLayoutMode,
  StudioSplitRatio,
  WhiteboardElement,
  WhiteboardConnection,
  WhiteboardStroke,
  WorkspaceCodeFile,
  TerminalLogEntry,
  DeploymentPipelineStage,
  ProjectTaskTicket,
  TicketStatus,
  SystemArchitectureProposal,
  MultimediaAsset,
  GraphNode,
  KnowledgeContinent,
  AutogenesisState,
  SelfDevCadence,
  CausalPathTrace
} from '../types';
import { cn } from '../lib/utils';
import { AutogenesisStudioPanel } from './AutogenesisStudioPanel';
import { MultiAgentDebateArena } from './MultiAgentDebateArena';
import { QuantumAnalyticsStudio } from './QuantumAnalyticsStudio';
import { computeQuantumAnalytics } from '../services/quantumAnalyticsEngine';
import { crdtBus } from '../services/crdtBus';
import { getPredicateStyle } from '../services/causalTraceEngine';

interface CreativeWorkspaceStudioProps {
  activeModule: WorkspaceModuleType;
  onSelectModule: (m: WorkspaceModuleType) => void;
  layoutMode: WorkspaceLayoutMode;
  onChangeLayoutMode: (mode: WorkspaceLayoutMode) => void;
  splitRatio?: StudioSplitRatio;
  onChangeSplitRatio?: (ratio: StudioSplitRatio) => void;
  activeContinent: KnowledgeContinent | null;
  onClearContinentContext: () => void;
  topic: string;
  nodes: GraphNode[];
  selectedNode: GraphNode | null;
  onSelectGraphNode?: (node: GraphNode) => void;
  // Whiteboard handlers
  whiteboardElements: WhiteboardElement[];
  whiteboardConnections: WhiteboardConnection[];
  onAddWhiteboardElement: (el?: Partial<WhiteboardElement>) => void;
  onMoveWhiteboardElement?: (id: string, x: number, y: number) => void;
  onDeleteWhiteboardElement?: (id: string) => void;
  onConnectWhiteboardElements?: (fromId: string, toId: string, label?: string, protocol?: string) => void;
  onAutoAlignWhiteboard?: () => void;
  onProposeArchitecture: () => void;
  onSyncGraphToWhiteboard: () => void;
  // Code IDE handlers
  codeFiles: WorkspaceCodeFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onUpdateFileContent: (id: string, content: string) => void;
  onGenerateCodeModule: () => void;
  onCreateCustomFile?: (name: string, language: WorkspaceCodeFile['language']) => void;
  onDeleteFile?: (fileId: string) => void;
  onMaterializeCodeToGraph?: () => void;
  terminalLogs: TerminalLogEntry[];
  onRunScript: (cmd?: string) => void;
  pipelineStages: DeploymentPipelineStage[];
  isDeploying: boolean;
  onTriggerDeployment: () => void;
  // Project Board handlers
  tickets: ProjectTaskTicket[];
  onCreateTicket: () => void;
  onAdvanceTicket: (ticketId?: string) => void;
  onRegressTicket?: (ticketId: string) => void;
  onDeleteTicket?: (ticketId: string) => void;
  architectureProposals: SystemArchitectureProposal[];
  onRatifyProposal: (proposalId: string) => void;
  // Asset Library handlers
  assets: MultimediaAsset[];
  onCreateAsset: () => void;
  onBindAssetToNode: (assetId: string, node: GraphNode) => void;
  onUpdateAssetContent?: (assetId: string, contentPreview: string) => void;
  onDeleteAsset?: (assetId: string) => void;
  // Recursive Self-Development (Autogenesis) handlers
  autogenesis?: AutogenesisState;
  onToggleAutogenesis?: () => void;
  onStepAutogenesisStage?: () => void;
  onRunFullAutogenesisCycle?: () => void;
  onChangeAutogenesisCadence?: (cadence: SelfDevCadence) => void;
  activeCausalTrace?: CausalPathTrace | null;
}

export const CreativeWorkspaceStudio: React.FC<CreativeWorkspaceStudioProps> = ({
  activeModule,
  onSelectModule,
  layoutMode,
  onChangeLayoutMode,
  splitRatio = 'BALANCED_50_50',
  onChangeSplitRatio,
  activeContinent,
  onClearContinentContext,
  topic,
  nodes,
  selectedNode,
  onSelectGraphNode,
  whiteboardElements,
  whiteboardConnections,
  onAddWhiteboardElement,
  onMoveWhiteboardElement,
  onDeleteWhiteboardElement,
  onConnectWhiteboardElements,
  onAutoAlignWhiteboard,
  onProposeArchitecture,
  onSyncGraphToWhiteboard,
  codeFiles,
  activeFileId,
  onSelectFile,
  onUpdateFileContent,
  onGenerateCodeModule,
  onCreateCustomFile,
  onDeleteFile,
  onMaterializeCodeToGraph,
  terminalLogs,
  onRunScript,
  pipelineStages,
  isDeploying,
  onTriggerDeployment,
  tickets,
  onCreateTicket,
  onAdvanceTicket,
  onRegressTicket,
  onDeleteTicket,
  architectureProposals,
  onRatifyProposal,
  assets,
  onCreateAsset,
  onBindAssetToNode,
  onUpdateAssetContent,
  onDeleteAsset,
  autogenesis,
  onToggleAutogenesis,
  onStepAutogenesisStage,
  onRunFullAutogenesisCycle,
  onChangeAutogenesisCadence,
  activeCausalTrace = null
}) => {
  // Decentralized CRDT bus state subscription
  const [crdtClock, setCrdtClock] = useState<number>(() => crdtBus.getLamport());

  useEffect(() => {
    const unsub = crdtBus.subscribe(() => {
      setCrdtClock(crdtBus.getLamport());
    });
    return unsub;
  }, []);

  // Whiteboard interaction state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [localOffsets, setLocalOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [sketchMode, setSketchMode] = useState<boolean>(false);
  const [connectMode, setConnectMode] = useState<boolean>(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [wbZoom, setWbZoom] = useState<number>(1);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number }>>([]);
  const wbCanvasRef = useRef<HTMLDivElement | null>(null);

  // Code IDE new file creator state
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileLang, setNewFileLang] = useState<WorkspaceCodeFile['language']>('typescript');

  // Terminal input state
  const [terminalInput, setTerminalInput] = useState<string>('');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Kanban filter & subview state
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<'ALL' | ProjectTaskTicket['priority']>('ALL');
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [sprintSubView, setSprintSubView] = useState<'KANBAN' | 'DEBATE_ARENA'>('KANBAN');

  // Asset filter state
  const [assetFilter, setAssetFilter] = useState<'ALL' | MultimediaAsset['type']>('ALL');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(assets[0]?.id || null);

  // Guaranteed Unique Mapped Collections (Prevents React Key Collision Errors)
  const uniqueWhiteboardElements = useMemo(() => {
    const map = new Map<string, WhiteboardElement>();
    whiteboardElements.forEach(e => map.set(e.id, e));
    return Array.from(map.values());
  }, [whiteboardElements]);

  const uniqueWhiteboardConnections = useMemo(() => {
    const map = new Map<string, WhiteboardConnection>();
    whiteboardConnections.forEach(c => map.set(c.id, c));
    return Array.from(map.values());
  }, [whiteboardConnections]);

  const uniqueCodeFiles = useMemo(() => {
    const map = new Map<string, WorkspaceCodeFile>();
    codeFiles.forEach(f => map.set(f.id, f));
    return Array.from(map.values());
  }, [codeFiles]);

  const uniqueTickets = useMemo(() => {
    const map = new Map<string, ProjectTaskTicket>();
    tickets.forEach(t => map.set(t.id, t));
    return Array.from(map.values());
  }, [tickets]);

  const uniqueAssets = useMemo(() => {
    const map = new Map<string, MultimediaAsset>();
    assets.forEach(a => map.set(a.id, a));
    return Array.from(map.values());
  }, [assets]);

  const uniqueArchitectureProposals = useMemo(() => {
    const map = new Map<string, SystemArchitectureProposal>();
    architectureProposals.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  }, [architectureProposals]);

  // Simulated real-time autonomous collaborator cursors on the whiteboard
  const [collabCursors, setCollabCursors] = useState([
    { id: 'c1', name: 'BUILDER_11 (Architect)', color: '#fbbf24', x: 280, y: 180, task: 'Verifying service mesh' },
    { id: 'c2', name: 'RESEARCHER_04 (Causal)', color: '#38bdf8', x: 520, y: 290, task: 'Mapping edge invariants' }
  ]);

  useEffect(() => {
    if (activeModule !== 'WHITEBOARD') return;
    const timer = setInterval(() => {
      setCollabCursors(prev =>
        prev.map((c, idx) => ({
          ...c,
          x: Math.max(80, Math.min(720, c.x + Math.sin(Date.now() * 0.002 + idx * 2) * 35)),
          y: Math.max(70, Math.min(420, c.y + Math.cos(Date.now() * 0.0025 + idx) * 28))
        }))
      );
    }, 900);
    return () => clearInterval(timer);
  }, [activeModule]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs.length]);

  const activeFile = uniqueCodeFiles.find(f => f.id === activeFileId) || uniqueCodeFiles[0];
  const selectedAsset = uniqueAssets.find(a => a.id === selectedAssetId) || uniqueAssets[0];

  // Static AST & Complexity Diagnostics for Active Code File
  const codeDiagnostics = useMemo(() => {
    if (!activeFile) return { lines: 0, exports: 0, complexity: 1, symbols: [] as string[] };
    const lines = activeFile.content.split('\n').length;
    const exportMatches = activeFile.content.match(/\b(export|pub)\s+(interface|function|const|class|struct|fn|enum)\s+([A-Za-z0-9_]+)/g) || [];
    const symbols = exportMatches.map(m => {
      const parts = m.trim().split(/\s+/);
      return parts[parts.length - 1];
    });
    const branchMatches = activeFile.content.match(/\b(if|for|while|match|switch|reduce|map)\b/g) || [];
    return {
      lines,
      exports: symbols.length,
      complexity: 1 + branchMatches.length,
      symbols
    };
  }, [activeFile]);

  const filteredTickets = useMemo(() => {
    return uniqueTickets.filter(t => {
      if (ticketPriorityFilter !== 'ALL' && t.priority !== ticketPriorityFilter) return false;
      if (ticketSearch.trim()) {
        const q = ticketSearch.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.linkedNodeLabel || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [uniqueTickets, ticketPriorityFilter, ticketSearch]);

  const filteredAssets = uniqueAssets.filter(a => assetFilter === 'ALL' || a.type === assetFilter);

  const getElementPos = (el: WhiteboardElement) => {
    const off = localOffsets[el.id];
    return {
      x: off ? off.x : el.x,
      y: off ? off.y : el.y
    };
  };

  const handleWhiteboardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wbCanvasRef.current) return;
    const rect = wbCanvasRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / wbZoom;
    const relY = (e.clientY - rect.top) / wbZoom;

    if (sketchMode && e.buttons === 1) {
      setCurrentStroke(prev => [...prev, { x: relX, y: relY }]);
      return;
    }

    if (draggingId) {
      const nextX = Math.max(20, Math.min(rect.width / wbZoom - 180, Math.round(relX - 85)));
      const nextY = Math.max(20, Math.min(rect.height / wbZoom - 90, Math.round(relY - 35)));
      setLocalOffsets(prev => ({
        ...prev,
        [draggingId]: { x: nextX, y: nextY }
      }));
    }
  };

  const handleWhiteboardPointerUp = () => {
    if (sketchMode && currentStroke.length > 1) {
      setStrokes(prev => [
        ...prev,
        { id: `stroke-${Date.now()}`, points: currentStroke, color: '#38bdf8' }
      ]);
      setCurrentStroke([]);
    }
    if (draggingId) {
      const off = localOffsets[draggingId];
      if (off && onMoveWhiteboardElement) {
        onMoveWhiteboardElement(draggingId, off.x, off.y);
      }
    }
    setDraggingId(null);
  };

  const handleExportWhiteboardSvg = () => {
    const svgParts: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width="1000" height="650" style="background:#040814;font-family:monospace">`,
      `<defs><marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/></marker></defs>`
    ];

    whiteboardConnections.forEach(conn => {
      const fromEl = whiteboardElements.find(e => e.id === conn.fromId);
      const toEl = whiteboardElements.find(e => e.id === conn.toId);
      if (!fromEl || !toEl) return;
      const p1 = getElementPos(fromEl);
      const p2 = getElementPos(toEl);
      const x1 = p1.x + 95;
      const y1 = p1.y + 42;
      const x2 = p2.x + 95;
      const y2 = p2.y + 42;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 - 24;
      svgParts.push(
        `<path d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#arrow)"/>`,
        `<text x="${mx}" y="${my - 4}" fill="#7dd3fc" font-size="10" text-anchor="middle">${conn.label} (${conn.protocol})</text>`
      );
    });

    whiteboardElements.forEach(el => {
      const pos = getElementPos(el);
      svgParts.push(
        `<rect x="${pos.x}" y="${pos.y}" width="205" height="86" rx="10" fill="#090d16" stroke="${el.color}" stroke-width="2"/>`,
        `<text x="${pos.x + 12}" y="${pos.y + 20}" fill="${el.color}" font-size="9" font-weight="bold">${el.type}</text>`,
        `<text x="${pos.x + 12}" y="${pos.y + 42}" fill="#ffffff" font-size="12" font-weight="bold">${el.title.replace(/[<>&]/g, '')}</text>`,
        `<text x="${pos.x + 12}" y="${pos.y + 62}" fill="#94a3b8" font-size="9">${el.subtitle.slice(0, 34).replace(/[<>&]/g, '')}</text>`
      );
    });

    svgParts.push(`</svg>`);
    const blob = new Blob([svgParts.join('\n')], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omega_whiteboard_${(topic || 'architecture').toLowerCase().replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAsset = (asset: MultimediaAsset) => {
    const ext =
      asset.type === 'SCHEMA_ARTIFACT'
        ? 'json'
        : asset.type === 'DIAGRAM_BLUEPRINT'
        ? 'svg.txt'
        : 'md';
    const blob = new Blob([asset.contentPreview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJumpToLabel = (label?: string) => {
    if (!label || !onSelectGraphNode) return;
    const match = nodes.find(
      n => n.label.toLowerCase() === label.toLowerCase() || n.label.toLowerCase().includes(label.toLowerCase())
    );
    if (match) {
      onSelectGraphNode(match);
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    onRunScript(terminalInput.trim());
    setTerminalInput('');
  };

  const moduleTabs: Array<{ id: WorkspaceModuleType; label: string; short: string; icon: React.ReactNode; badge: number }> = [
    {
      id: 'WHITEBOARD',
      label: 'Collaborative Whiteboard',
      short: 'Whiteboard',
      icon: <PenTool className="w-3.5 h-3.5" />,
      badge: whiteboardElements.length
    },
    {
      id: 'CODE_IDE',
      label: 'Code IDE & Build Terminal',
      short: 'Code & Terminal',
      icon: <Code2 className="w-3.5 h-3.5" />,
      badge: codeFiles.length
    },
    {
      id: 'PROJECT_BOARD',
      label: 'Sprint & Architecture Hub',
      short: 'Project Sprint',
      icon: <Kanban className="w-3.5 h-3.5" />,
      badge: tickets.length
    },
    {
      id: 'ASSET_LIBRARY',
      label: 'Multimedia Asset Library',
      short: 'Asset Library',
      icon: <Library className="w-3.5 h-3.5" />,
      badge: assets.length
    },
    {
      id: 'AUTOGENESIS',
      label: 'Recursive Self-Development Engine',
      short: 'Self-Dev',
      icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" />,
      badge: autogenesis ? autogenesis.mutations.length : 0
    },
    {
      id: 'QUANTUM_ANALYTICS',
      label: 'Quantum Analytics & Pathfinding',
      short: 'Quantum',
      icon: <TrendingUp className="w-3.5 h-3.5 text-sky-400" />,
      badge: 3
    }
  ];

  const columns: Array<{ key: TicketStatus; title: string; accent: string }> = [
    { key: 'BACKLOG', title: 'Backlog Queue', accent: 'border-slate-700 text-slate-300' },
    { key: 'IN_PROGRESS', title: 'Active Synthesis', accent: 'border-sky-500/50 text-sky-300' },
    { key: 'ARCHITECT_REVIEW', title: 'Quorum Review', accent: 'border-amber-500/50 text-amber-300' },
    { key: 'DEPLOYED', title: 'Verified & Deployed', accent: 'border-emerald-500/50 text-emerald-300' }
  ];

  const totalStoryPoints = tickets.reduce((acc, t) => acc + t.storyPoints, 0);
  const deployedStoryPoints = tickets
    .filter(t => t.status === 'DEPLOYED')
    .reduce((acc, t) => acc + t.storyPoints, 0);
  const sprintCompletionPct = totalStoryPoints > 0 ? Math.round((deployedStoryPoints / totalStoryPoints) * 100) : 0;

  return (
    <section
      aria-label="Integrated Creative Workspace Studio"
      className="relative w-full h-full bg-[#030712]/95 backdrop-blur-2xl border-l-2 border-sky-500/40 flex flex-col overflow-hidden select-none"
    >
      {/* Top Studio Header & Module Navigation Bar */}
      <div className="px-4 py-3 bg-slate-950/95 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.25)]">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Creative Studio Continent
              </span>
              {activeContinent && (
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${activeContinent.color}20`,
                    borderColor: activeContinent.color,
                    color: '#f8fafc'
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeContinent.color }} />
                  {activeContinent.label}
                  <button
                    onClick={onClearContinentContext}
                    className="hover:text-sky-300 ml-1"
                    title="Unbind continent filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
              <span>Domain: {topic || 'Omega Manifold'}</span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> 3 Active Collaborators
              </span>
            </div>
          </div>
        </div>

        {/* 4 Modular System Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1">
          {moduleTabs.map(tab => {
            const active = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-swarm-target={`workspace-tab-${tab.id}`}
                onClick={() => onSelectModule(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer',
                  active
                    ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] border border-sky-300'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                )}
              >
                {tab.icon}
                <span>{tab.short}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded text-[9px]',
                    active ? 'bg-slate-950/40 text-sky-100' : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Viewport Split Ratio & Fullscreen Controls */}
        <div className="flex items-center gap-1.5">
          {layoutMode === 'SPLIT_STUDIO' && onChangeSplitRatio && (
            <div className="hidden 2xl:flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 mr-1">
              {(
                [
                  { id: 'GRAPH_WIDE_65_35', label: '35% Studio' },
                  { id: 'BALANCED_50_50', label: '50:50' },
                  { id: 'STUDIO_WIDE_35_65', label: '65% Studio' }
                ] as const
              ).map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onChangeSplitRatio(r.id)}
                  className={cn(
                    'px-2 py-1 rounded text-[9px] font-mono font-bold transition-colors cursor-pointer',
                    splitRatio === r.id
                      ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-white'
                  )}
                  title="Adjust Graph vs Studio split allocation"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Decentralized CRDT State Synchronization Status Badge */}
          <div
            data-swarm-target="crdt-sync-badge"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 mr-1"
            title="LWW-Element-Set CRDT Synchronization Active across tabs & swarm agents"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span className="font-bold">CRDT LWW-SET</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">L#{crdtClock}</span>
          </div>

          <button
            type="button"
            data-swarm-target="workspace-layout-toggle"
            onClick={() =>
              onChangeLayoutMode(layoutMode === 'FULL_STUDIO' ? 'SPLIT_STUDIO' : 'FULL_STUDIO')
            }
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={layoutMode === 'FULL_STUDIO' ? 'Dock alongside Spatial Graph (Split View)' : 'Expand Studio Fullscreen'}
          >
            {layoutMode === 'FULL_STUDIO' ? (
              <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            )}
          </button>

          <button
            type="button"
            data-swarm-target="workspace-close-btn"
            onClick={() => onChangeLayoutMode('GRAPH_ONLY')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Return to Pure Spatial Graph View"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Modular Workspace Body */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* =====================================================================
              MODULE 1: COLLABORATIVE REAL-TIME DIGITAL WHITEBOARD
          ===================================================================== */}
          {activeModule === 'WHITEBOARD' && (
            <motion.div
              key="whiteboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full flex flex-col"
            >
              {/* Whiteboard Toolbar */}
              <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    data-swarm-target="wb-add-node"
                    onClick={() => onAddWhiteboardElement()}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400" />
                    <span>Add Node</span>
                  </button>

                  <button
                    type="button"
                    data-swarm-target="wb-propose-arch"
                    onClick={onProposeArchitecture}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/70 text-sky-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>AI Propose RFC</span>
                  </button>

                  <button
                    type="button"
                    data-swarm-target="wb-sync-graph"
                    onClick={() => {
                      setLocalOffsets({});
                      onSyncGraphToWhiteboard();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/60 text-purple-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                    <span>Sync Graph</span>
                  </button>

                  {/* Synapse Link Connector Tool */}
                  <button
                    type="button"
                    onClick={() => {
                      setConnectMode(!connectMode);
                      setConnectSourceId(null);
                      setSketchMode(false);
                    }}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors',
                      connectMode
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    )}
                    title="Click two whiteboard nodes to connect them with a protocol link"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>
                      {connectMode
                        ? connectSourceId
                          ? 'Select Target Node...'
                          : 'Wire Link: ON'
                        : 'Wire Link'}
                    </span>
                  </button>

                  {/* Auto-Grid Align */}
                  {onAutoAlignWhiteboard && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalOffsets({});
                        onAutoAlignWhiteboard();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                      title="Snap all whiteboard nodes into a clean architectural grid"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
                      <span>Grid Align</span>
                    </button>
                  )}

                  {/* Freehand Ink Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setSketchMode(!sketchMode);
                      setConnectMode(false);
                    }}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors',
                      sketchMode
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    )}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{sketchMode ? 'Ink: ON' : 'Ink'}</span>
                  </button>

                  {strokes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setStrokes([])}
                      className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer"
                    >
                      Clear Ink
                    </button>
                  )}
                </div>

                {/* Zoom & SVG Export Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWbZoom(z => Math.max(0.75, +(z - 0.15).toFixed(2)))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 w-10 text-center">
                    {Math.round(wbZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setWbZoom(z => Math.min(1.45, +(z + 0.15).toFixed(2)))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportWhiteboardSvg}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-sky-300 flex items-center gap-1 cursor-pointer ml-1"
                    title="Export Whiteboard Architecture Blueprint as SVG"
                  >
                    <Download className="w-3 h-3" />
                    <span>SVG</span>
                  </button>
                </div>
              </div>

              {/* Interactive Spatial Whiteboard Surface */}
              <div
                ref={wbCanvasRef}
                onPointerMove={handleWhiteboardPointerMove}
                onPointerUp={handleWhiteboardPointerUp}
                className="flex-1 relative overflow-hidden bg-[#040814]"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(56, 189, 248, 0.16) 1px, transparent 1px)',
                  backgroundSize: `${28 * wbZoom}px ${28 * wbZoom}px`
                }}
              >
                <div
                  className="w-full h-full origin-top-left transition-transform duration-75"
                  style={{ transform: `scale(${wbZoom})` }}
                >
                  {/* SVG Connector & Freehand Sketch Layer */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <defs>
                      <marker
                        id="wb-arrow"
                        viewBox="0 0 10 10"
                        refX="7"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                      </marker>
                    </defs>

                    {uniqueWhiteboardConnections.map(conn => {
                      const fromEl = uniqueWhiteboardElements.find(e => e.id === conn.fromId);
                      const toEl = uniqueWhiteboardElements.find(e => e.id === conn.toId);
                      if (!fromEl || !toEl) return null;
                      const p1 = getElementPos(fromEl);
                      const p2 = getElementPos(toEl);
                      const x1 = p1.x + 95;
                      const y1 = p1.y + 42;
                      const x2 = p2.x + 95;
                      const y2 = p2.y + 42;
                      const mx = (x1 + x2) / 2;
                      const my = (y1 + y2) / 2 - 24;

                      const isCausalTraceConnection = Boolean(
                        activeCausalTrace &&
                        activeCausalTrace.steps.some(st => st.nodeLabel === fromEl.title || st.nodeId === fromEl.linkedNodeId) &&
                        activeCausalTrace.steps.some(st => st.nodeLabel === toEl.title || st.nodeId === toEl.linkedNodeId)
                      );

                      return (
                        <g key={conn.id}>
                          {/* Background wire */}
                          <path
                            d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                            fill="none"
                            stroke={isCausalTraceConnection ? '#10b981' : 'rgba(56, 189, 248, 0.55)'}
                            strokeWidth={isCausalTraceConnection ? 3.5 : 2}
                            strokeDasharray={isCausalTraceConnection ? undefined : '5 4'}
                            style={isCausalTraceConnection ? { filter: 'drop-shadow(0 0 10px #10b981)' } : undefined}
                            markerEnd="url(#wb-arrow)"
                          />

                          {/* Synaptic photon pulse animation along active causal path */}
                          {isCausalTraceConnection && (
                            <>
                              <path
                                d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                                fill="none"
                                stroke="#00f0ff"
                                strokeWidth={1.5}
                                strokeDasharray="12 18"
                                className="animate-pulse"
                              />
                              <circle
                                cx={(x1 + mx) / 2}
                                cy={(y1 + my) / 2}
                                r={4.5}
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth={1.5}
                                style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}
                              >
                                <animate
                                  attributeName="opacity"
                                  values="0.4;1;0.4"
                                  dur="1.4s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            </>
                          )}

                          <rect
                            x={mx - 48}
                            y={my - 11}
                            width={96}
                            height={18}
                            rx={4}
                            fill="#020617"
                            stroke={isCausalTraceConnection ? '#10b981' : 'rgba(56, 189, 248, 0.4)'}
                          />
                          <text
                            x={mx}
                            y={my + 1}
                            textAnchor="middle"
                            className={cn(
                              'text-[9px] font-mono font-bold',
                              isCausalTraceConnection ? 'fill-emerald-300' : 'fill-sky-300'
                            )}
                          >
                            {isCausalTraceConnection ? `⚡ ${conn.label}` : conn.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Freehand Ink Strokes */}
                    {strokes.map(st => (
                      <polyline
                        key={st.id}
                        fill="none"
                        stroke={st.color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={st.points.map(p => `${p.x},${p.y}`).join(' ')}
                      />
                    ))}
                    {currentStroke.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        points={currentStroke.map(p => `${p.x},${p.y}`).join(' ')}
                      />
                    )}
                  </svg>

                  {/* Draggable Architectural Nodes & Ideation Cards */}
                  {uniqueWhiteboardElements.map(el => {
                    const pos = getElementPos(el);
                    const isSource = connectSourceId === el.id;
                    const isCausalTraceNode = Boolean(
                      activeCausalTrace &&
                      activeCausalTrace.steps.some(st => st.nodeLabel === el.title || st.nodeId === el.linkedNodeId)
                    );
                    return (
                      <div
                        key={el.id}
                        data-swarm-target={`wb-element-${el.id}`}
                        onPointerDown={e => {
                          if (sketchMode) return;
                          e.stopPropagation();
                          if (connectMode) {
                            if (!connectSourceId) {
                              setConnectSourceId(el.id);
                            } else if (connectSourceId !== el.id) {
                              onConnectWhiteboardElements?.(connectSourceId, el.id, 'Synapse Link', 'gRPC');
                              setConnectSourceId(null);
                              setConnectMode(false);
                            }
                            return;
                          }
                          setDraggingId(el.id);
                        }}
                        style={{
                          transform: `translate(${pos.x}px, ${pos.y}px)`,
                          borderColor: isSource ? '#34d399' : (isCausalTraceNode ? '#10b981' : el.color)
                        }}
                        className={cn(
                          'absolute top-0 left-0 w-52 p-3 rounded-xl bg-slate-950/95 border-2 shadow-[0_8px_25px_rgba(0,0,0,0.75)] cursor-grab active:cursor-grabbing transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] group',
                          isSource && 'ring-2 ring-emerald-400',
                          isCausalTraceNode && 'ring-2 ring-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.45)]'
                        )}
                      >
                        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider mb-1">
                          <span style={{ color: el.color }} className="font-bold">
                            {el.type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">{el.author}</span>
                            {onDeleteWhiteboardElement && whiteboardElements.length > 1 && (
                              <button
                                type="button"
                                onPointerDown={e => e.stopPropagation()}
                                onClick={e => {
                                  e.stopPropagation();
                                  onDeleteWhiteboardElement(el.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity ml-1 cursor-pointer"
                                title="Delete Whiteboard Node"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-white leading-snug mb-1 flex items-center justify-between gap-1">
                          <span className="truncate">{el.title}</span>
                          <button
                            type="button"
                            onPointerDown={e => e.stopPropagation()}
                            onClick={e => {
                              e.stopPropagation();
                              handleJumpToLabel(el.title);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[9px] font-mono text-sky-400 hover:underline shrink-0 cursor-pointer"
                            title="Focus corresponding concept on Spatial Graph"
                          >
                            Focus ↗
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                          {el.subtitle}
                        </div>
                      </div>
                    );
                  })}

                  {/* Real-time Autonomous Collaborator Cursors */}
                  {collabCursors.map(c => (
                    <div
                      key={c.id}
                      style={{
                        transform: `translate(${c.x}px, ${c.y}px)`
                      }}
                      className="absolute top-0 left-0 pointer-events-none transition-transform duration-700 z-30 flex items-start gap-1.5"
                    >
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: c.color }}
                      />
                      <div
                        className="px-2 py-0.5 rounded bg-slate-950/90 border text-[9px] font-mono whitespace-nowrap shadow-md"
                        style={{ borderColor: c.color, color: c.color }}
                      >
                        <span className="font-bold">{c.name}</span> · {c.task}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* =====================================================================
              MODULE 2: BROWSER-BASED CODE EDITOR & TERMINAL ENVIRONMENT
          ===================================================================== */}
          {activeModule === 'CODE_IDE' && (
            <motion.div
              key="code-ide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full flex flex-col"
            >
              {/* IDE Action Toolbar */}
              <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-swarm-target="ide-generate-code"
                    onClick={onGenerateCodeModule}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/70 text-sky-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      AI Synthesize Module ({selectedNode?.label || topic || 'Core'})
                    </span>
                  </button>

                  {onMaterializeCodeToGraph && (
                    <button
                      type="button"
                      data-swarm-target="ide-materialize-graph"
                      onClick={onMaterializeCodeToGraph}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/70 text-purple-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Parse exported types/functions from this file and inject them as live nodes on the Knowledge Graph"
                    >
                      <Share2 className="w-3.5 h-3.5 text-purple-300" />
                      <span>Materialize to Graph</span>
                    </button>
                  )}

                  <button
                    type="button"
                    data-swarm-target="ide-run-script"
                    onClick={() => onRunScript(`npm run verify:module --target=${activeFile?.name}`)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/70 text-emerald-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Execute Script</span>
                  </button>

                  <button
                    type="button"
                    data-swarm-target="ide-deploy-pipeline"
                    onClick={onTriggerDeployment}
                    disabled={isDeploying}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/70 text-amber-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Rocket className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isDeploying ? 'Deploying Pipeline...' : 'Automate Deployment'}</span>
                  </button>
                </div>

                {/* Live Build & Deployment Pipeline Stage Pills */}
                <div className="flex items-center gap-1.5">
                  {pipelineStages.map(stage => (
                    <div
                      key={stage.id}
                      className={cn(
                        'px-2.5 py-1 rounded-md border text-[9px] font-mono flex items-center gap-1.5',
                        stage.status === 'PASSED'
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : stage.status === 'RUNNING'
                          ? 'bg-amber-950/60 border-amber-400 text-amber-200 animate-pulse'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      )}
                    >
                      {stage.status === 'PASSED' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-500" />
                      )}
                      <span>{stage.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor + File Tree Split */}
              <div className="flex-1 grid grid-cols-12 min-h-0">
                {/* File Tree Sidebar */}
                <div className="col-span-3 bg-slate-950/90 border-r border-slate-800 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between px-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Repository</span>
                    </div>
                    {onCreateCustomFile && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingFile(!isCreatingFile)}
                        className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[9px] font-mono text-sky-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>New File</span>
                      </button>
                    )}
                  </div>

                  {isCreatingFile && onCreateCustomFile && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-sky-500/40 space-y-2">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={e => setNewFileName(e.target.value)}
                        placeholder="module_name.ts"
                        className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[11px] font-mono text-white focus:outline-none focus:border-sky-400"
                      />
                      <div className="flex items-center justify-between gap-1">
                        <select
                          value={newFileLang}
                          onChange={e => setNewFileLang(e.target.value as WorkspaceCodeFile['language'])}
                          className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-[10px] font-mono text-slate-300"
                        >
                          <option value="typescript">TS</option>
                          <option value="rust">Rust</option>
                          <option value="wgsl">WGSL</option>
                          <option value="json">JSON</option>
                          <option value="yaml">YAML</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newFileName.trim()) return;
                            onCreateCustomFile(newFileName.trim(), newFileLang);
                            setNewFileName('');
                            setIsCreatingFile(false);
                          }}
                          className="px-2 py-1 rounded bg-sky-500 text-white text-[9px] font-mono font-bold uppercase cursor-pointer"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    {uniqueCodeFiles.map(file => {
                      const isSelected = file.id === activeFile?.id;
                      return (
                        <div
                          key={file.id}
                          data-swarm-target={`ide-file-${file.id}`}
                          onClick={() => onSelectFile(file.id)}
                          className={cn(
                            'w-full px-2.5 py-2 rounded-lg text-left font-mono text-xs flex items-center justify-between transition-colors cursor-pointer border group',
                            isSelected
                              ? 'bg-sky-500/20 border-sky-400/60 text-white'
                              : 'bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <div className="truncate">
                              <div className="text-[11px] font-bold truncate">{file.name}</div>
                              <div className="text-[9px] text-slate-500 truncate">{file.authorAgent}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-sky-300 uppercase">
                              {file.language}
                            </span>
                            {onDeleteFile && uniqueCodeFiles.length > 1 && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  onDeleteFile(file.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                                title="Delete File"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Code Editor + Integrated Terminal */}
                <div className="col-span-9 flex flex-col min-h-0 bg-[#050811]">
                  {/* Active File Tab & Static Invariant Diagnostics Bar */}
                  {activeFile && (
                    <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="flex items-center gap-2 text-sky-300">
                        <FileCode className="w-3.5 h-3.5" />
                        <span className="font-bold">{activeFile.path}</span>
                        {activeFile.linkedNodeLabel && (
                          <button
                            type="button"
                            onClick={() => handleJumpToLabel(activeFile.linkedNodeLabel)}
                            className="px-2 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/40 text-[9px] text-sky-300 cursor-pointer"
                            title="Jump-focus linked Graph Node"
                          >
                            Node: {activeFile.linkedNodeLabel} ↗
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>{codeDiagnostics.lines} LOC</span>
                        <span>·</span>
                        <span>Exports: <strong className="text-emerald-400">{codeDiagnostics.exports}</strong></span>
                        <span>·</span>
                        <span>Complexity: <strong className="text-sky-300">{codeDiagnostics.complexity}</strong></span>
                        <span>·</span>
                        <span>Updated {activeFile.lastModified}</span>
                      </div>
                    </div>
                  )}

                  {/* Editable Code Area with Line Numbers */}
                  <div className="flex-1 relative flex overflow-hidden min-h-0">
                    <div className="w-12 py-3 bg-slate-950/80 border-r border-slate-800/80 text-right pr-3 font-mono text-[11px] text-slate-600 select-none overflow-hidden">
                      {(activeFile?.content || '').split('\n').map((_, idx) => (
                        <div key={idx} className="leading-5">
                          {idx + 1}
                        </div>
                      ))}
                    </div>
                    <textarea
                      aria-label="Workspace Code Editor"
                      value={activeFile?.content || ''}
                      onChange={e => activeFile && onUpdateFileContent(activeFile.id, e.target.value)}
                      spellCheck={false}
                      className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-xs leading-5 focus:outline-none resize-none overflow-y-auto custom-scrollbar"
                    />
                  </div>

                  {/* Interactive Build & Execution Terminal */}
                  <div className="h-48 bg-slate-950 border-t-2 border-slate-800 flex flex-col">
                    <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-bold text-slate-200 uppercase">
                          Sovereign Runtime Terminal & CI/CD Pipeline
                        </span>
                      </div>
                      <span className="text-emerald-400">Commands: help, ls, build, test, materialize, deploy, clear</span>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1.5 custom-scrollbar">
                      {terminalLogs.map(entry => (
                        <div key={entry.id} className="leading-relaxed">
                          <span className="text-slate-500 mr-2">[{entry.timestamp}]</span>
                          {entry.command && (
                            <span className="text-sky-400 font-bold mr-2">$ {entry.command}</span>
                          )}
                          <span
                            className={cn(
                              entry.level === 'SUCCESS'
                                ? 'text-emerald-300'
                                : entry.level === 'AGENT_EXEC'
                                ? 'text-amber-300 font-bold'
                                : entry.level === 'WARN'
                                ? 'text-rose-300'
                                : 'text-slate-300'
                            )}
                          >
                            {entry.output}
                          </span>
                        </div>
                      ))}
                      <div ref={terminalEndRef} />
                    </div>

                    <form
                      onSubmit={handleTerminalSubmit}
                      className="px-3 py-1.5 bg-slate-900/70 border-t border-slate-800 flex items-center gap-2"
                    >
                      <span className="text-emerald-400 font-mono text-xs font-bold">$</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={e => setTerminalInput(e.target.value)}
                        placeholder="Enter command (help, ls, build, test, materialize, deploy, status)..."
                        className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-[10px] font-mono font-bold text-sky-300 cursor-pointer"
                      >
                        RUN
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* =====================================================================
              MODULE 3: COMPREHENSIVE PROJECT MANAGEMENT & ARCHITECTURE DASHBOARD
          ===================================================================== */}
          {activeModule === 'PROJECT_BOARD' && (
            <motion.div
              key="project-board"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full flex flex-col overflow-hidden"
            >
              {/* Sprint Toolbar & Filter Controls */}
              <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-swarm-target="pm-create-ticket"
                    onClick={onCreateTicket}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/70 text-sky-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400" />
                    <span>AI Create Ticket</span>
                  </button>

                  <button
                    type="button"
                    data-swarm-target="pm-advance-ticket"
                    onClick={() => onAdvanceTicket()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/70 text-emerald-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Advance Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={onProposeArchitecture}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/70 text-amber-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    <span>Propose RFC</span>
                  </button>

                  {/* Priority Filter Buttons */}
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 ml-1">
                    <button
                      type="button"
                      data-swarm-target="sprint-subview-kanban"
                      onClick={() => setSprintSubView('KANBAN')}
                      className={cn(
                        'px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors',
                        sprintSubView === 'KANBAN' ? 'bg-sky-500/25 text-sky-200 border border-sky-400/60' : 'text-slate-400 hover:text-white'
                      )}
                    >
                      Kanban Board
                    </button>
                    <button
                      type="button"
                      data-swarm-target="sprint-subview-debate"
                      onClick={() => setSprintSubView('DEBATE_ARENA')}
                      className={cn(
                        'px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors flex items-center gap-1',
                        sprintSubView === 'DEBATE_ARENA' ? 'bg-amber-500/25 text-amber-200 border border-amber-400/60' : 'text-slate-400 hover:text-white'
                      )}
                    >
                      <Users className="w-3 h-3 text-amber-400" />
                      <span>100-Agent Debate Arena</span>
                    </button>
                  </div>

                  {sprintSubView === 'KANBAN' && (
                    <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 ml-1">
                      {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTicketPriorityFilter(p)}
                          className={cn(
                            'px-2 py-1 rounded text-[9px] font-mono font-bold uppercase cursor-pointer transition-colors',
                            ticketPriorityFilter === p
                              ? 'bg-sky-500/25 text-sky-200'
                              : 'text-slate-500 hover:text-white'
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search + Velocity Burndown Meter */}
                {sprintSubView === 'KANBAN' && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={ticketSearch}
                        onChange={e => setTicketSearch(e.target.value)}
                        placeholder="Filter tickets..."
                        className="pl-7 pr-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-white focus:outline-none focus:border-sky-400 w-36"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="text-slate-400">
                        Burndown:{' '}
                        <strong className="text-emerald-400">
                          {deployedStoryPoints}/{totalStoryPoints} pts ({sprintCompletionPct}%)
                        </strong>
                      </span>
                      <div className="w-20 h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${sprintCompletionPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Subview Content */}
              {sprintSubView === 'DEBATE_ARENA' ? (
                <div className="flex-1 min-h-0 overflow-hidden">
                  <MultiAgentDebateArena
                    proposals={uniqueArchitectureProposals}
                    onRatifyProposal={onRatifyProposal}
                    onProposeNewRFC={onProposeArchitecture}
                  />
                </div>
              ) : (
                <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
                {/* 4 Kanban Columns (9 cols) */}
                <div className="col-span-9 grid grid-cols-4 gap-3 min-h-0 overflow-hidden">
                  {columns.map(col => {
                    const colTickets = filteredTickets.filter(t => t.status === col.key);
                    return (
                      <div
                        key={col.key}
                        className="bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col min-h-0 overflow-hidden"
                      >
                        <div
                          className={cn(
                            'px-3 py-2 border-b bg-slate-900/60 flex items-center justify-between text-[10px] font-mono font-bold uppercase',
                            col.accent
                          )}
                        >
                          <span>{col.title}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300">
                            {colTickets.length}
                          </span>
                        </div>

                        <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto custom-scrollbar">
                          {colTickets.map(ticket => (
                            <div
                              key={ticket.id}
                              data-swarm-target={`pm-ticket-${ticket.id}`}
                              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 space-y-2 transition-all group"
                            >
                              <div className="flex items-center justify-between text-[9px] font-mono">
                                <span className="font-bold text-sky-400">{ticket.key}</span>
                                <div className="flex items-center gap-1">
                                  <span
                                    className={cn(
                                      'px-1.5 py-0.5 rounded font-bold',
                                      ticket.priority === 'CRITICAL'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : ticket.priority === 'HIGH'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-slate-800 text-slate-300'
                                    )}
                                  >
                                    {ticket.priority} · {ticket.storyPoints}pt
                                  </span>
                                  {onDeleteTicket && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteTicket(ticket.id)}
                                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                                      title="Delete Ticket"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs font-bold text-white leading-snug">
                                {ticket.title}
                              </div>

                              <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                                {ticket.description}
                              </p>

                              {ticket.linkedNodeLabel && (
                                <button
                                  type="button"
                                  onClick={() => handleJumpToLabel(ticket.linkedNodeLabel)}
                                  className="text-[9px] font-mono text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Link2 className="w-2.5 h-2.5" />
                                  <span>{ticket.linkedNodeLabel} ↗</span>
                                </button>
                              )}

                              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono">
                                <span className="text-amber-300 truncate max-w-[90px]">{ticket.assignedAgent}</span>
                                <div className="flex items-center gap-1">
                                  {ticket.status !== 'BACKLOG' && onRegressTicket && (
                                    <button
                                      type="button"
                                      onClick={() => onRegressTicket(ticket.id)}
                                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                      title="Move ticket to previous stage"
                                    >
                                      <ArrowLeft className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                  {ticket.status !== 'DEPLOYED' && (
                                    <button
                                      type="button"
                                      onClick={() => onAdvanceTicket(ticket.id)}
                                      className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/35 text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Advance</span>
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* System Architecture Proposals Column (3 cols) */}
                <div className="col-span-3 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col min-h-0 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-[10px] font-mono font-bold uppercase text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                      Architecture RFCs
                    </span>
                    <span>{uniqueArchitectureProposals.length}</span>
                  </div>

                  <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto custom-scrollbar">
                    {uniqueArchitectureProposals.map(prop => (
                      <div
                        key={prop.id}
                        className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className="text-amber-400 font-bold">{prop.id}</span>
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded font-bold',
                              prop.status === 'RATIFIED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-sky-500/20 text-sky-300'
                            )}
                          >
                            {prop.status} ({prop.confidence}%)
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white leading-snug">{prop.title}</div>
                        <div className="text-[10px] text-slate-400 leading-relaxed">{prop.summary}</div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {prop.components.map(c => (
                            <span
                              key={c}
                              className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[8.5px] font-mono text-slate-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                        {prop.status !== 'RATIFIED' && (
                          <button
                            type="button"
                            data-swarm-target={`pm-ratify-${prop.id}`}
                            onClick={() => onRatifyProposal(prop.id)}
                            className="w-full mt-1 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 text-[9px] font-mono font-bold uppercase cursor-pointer"
                          >
                            Ratify & Materialize on Graph
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

          {/* =====================================================================
              MODULE 4: MULTI-MEDIA ASSET LIBRARY SYSTEM
          ===================================================================== */}
          {activeModule === 'ASSET_LIBRARY' && (
            <motion.div
              key="asset-library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full flex flex-col overflow-hidden"
            >
              {/* Asset Library Toolbar */}
              <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: 'ALL', label: 'All Artifacts' },
                      { id: 'DIAGRAM_BLUEPRINT', label: 'Blueprints' },
                      { id: 'SCHEMA_ARTIFACT', label: 'JSON-LD Schemas' },
                      { id: 'DOCUMENTATION', label: 'Documentation' },
                      { id: 'VISUAL_RESOURCE', label: 'Visual Media' }
                    ] as const
                  ).map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setAssetFilter(f.id)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border',
                        assetFilter === f.id
                          ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  data-swarm-target="asset-create-btn"
                  onClick={onCreateAsset}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/70 text-sky-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Synthesize & Embed Knowledge Artifact</span>
                </button>
              </div>

              {/* Asset Grid + Inspector Split */}
              <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
                <div className="col-span-7 grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-1">
                  {filteredAssets.map(asset => {
                    const isSelected = asset.id === selectedAsset?.id;
                    return (
                      <div
                        key={asset.id}
                        data-swarm-target={`asset-card-${asset.id}`}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={cn(
                          'p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 group',
                          isSelected
                            ? 'bg-sky-950/30 border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.2)]'
                            : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                        )}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[9px] font-mono">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300 font-bold">
                              {asset.type.replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">{asset.format}</span>
                              {onDeleteAsset && assets.length > 1 && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    onDeleteAsset(asset.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 cursor-pointer"
                                  title="Delete Artifact"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-xs font-bold text-white leading-snug">
                            {asset.title}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                            {asset.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono">
                          <span className="text-amber-300 truncate">{asset.createdBy}</span>
                          {asset.linkedNodeLabel ? (
                            <span className="text-emerald-400 flex items-center gap-1 truncate max-w-[120px]">
                              <Link2 className="w-3 h-3 shrink-0" />
                              {asset.linkedNodeLabel}
                            </span>
                          ) : (
                            <span className="text-slate-500">Unbound</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Asset Inspector, Interactive SVG Diagram Preview & Graph Node Linker */}
                <div className="col-span-5 bg-slate-950/95 border border-slate-800 rounded-xl p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                  {selectedAsset ? (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-mono text-sky-400 uppercase font-bold">
                            {selectedAsset.type} · {selectedAsset.format}
                          </div>
                          <h3 className="text-sm font-black text-white mt-0.5 truncate">
                            {selectedAsset.title}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadAsset(selectedAsset)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/60 text-sky-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1 shrink-0 cursor-pointer"
                          title="Download Artifact File"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export</span>
                        </button>
                      </div>

                      {/* Interactive Vector Topology Preview Box */}
                      <div className="p-2.5 rounded-xl bg-[#040814] border border-slate-800">
                        <div className="text-[9px] font-mono uppercase text-slate-400 mb-1.5 flex items-center justify-between">
                          <span>Live Topological Diagram Schematic</span>
                          {selectedAsset.linkedNodeLabel && (
                            <button
                              type="button"
                              onClick={() => handleJumpToLabel(selectedAsset.linkedNodeLabel)}
                              className="text-sky-400 hover:underline cursor-pointer"
                            >
                              Focus [{selectedAsset.linkedNodeLabel}] ↗
                            </button>
                          )}
                        </div>
                        <svg viewBox="0 0 320 90" className="w-full h-20 rounded bg-slate-950/90 border border-slate-800/80">
                          <line x1="55" y1="45" x2="160" y2="25" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                          <line x1="55" y1="45" x2="160" y2="65" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" />
                          <line x1="160" y1="25" x2="265" y2="45" stroke="#34d399" strokeWidth="1.5" />
                          <line x1="160" y1="65" x2="265" y2="45" stroke="#fbbf24" strokeWidth="1.5" />
                          <circle cx="55" cy="45" r="14" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
                          <circle cx="160" cy="25" r="11" fill="#3b0764" stroke="#c084fc" strokeWidth="1.5" />
                          <circle cx="160" cy="65" r="11" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
                          <circle cx="265" cy="45" r="14" fill="#451a03" stroke="#fbbf24" strokeWidth="2" />
                          <text x="55" y="74" textAnchor="middle" className="fill-sky-300 text-[8px] font-mono">
                            {(selectedAsset.linkedNodeLabel || 'Origin').slice(0, 12)}
                          </text>
                          <text x="160" y="50" textAnchor="middle" className="fill-slate-400 text-[7px] font-mono">
                            {selectedAsset.type.split('_')[0]}
                          </text>
                          <text x="265" y="74" textAnchor="middle" className="fill-amber-300 text-[8px] font-mono">
                            Verified
                          </text>
                        </svg>
                      </div>

                      {/* Editable Artifact Specification Box */}
                      <div className="space-y-1">
                        <div className="text-[9px] font-mono uppercase text-slate-400 flex items-center justify-between">
                          <span>Editable Artifact Specification</span>
                          <span className="text-slate-500">Live Sync</span>
                        </div>
                        <textarea
                          value={selectedAsset.contentPreview}
                          onChange={e =>
                            onUpdateAssetContent && onUpdateAssetContent(selectedAsset.id, e.target.value)
                          }
                          spellCheck={false}
                          rows={5}
                          className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-sky-400 focus:outline-none font-mono text-[10px] text-sky-200 resize-none custom-scrollbar"
                        />
                      </div>

                      {/* Embed / Bind to Active Graph Nodes */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>Bind & Embed Artifact into Graph Node</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                          {nodes.slice(0, 8).map(node => (
                            <button
                              key={node.id}
                              type="button"
                              data-swarm-target="asset-bind-node"
                              onClick={() => onBindAssetToNode(selectedAsset.id, node)}
                              className={cn(
                                'px-2.5 py-1 rounded-lg border text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1',
                                selectedAsset.linkedNodeId === node.id
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-sky-400'
                              )}
                            >
                              <Link2 className="w-3 h-3" />
                              <span className="truncate max-w-[130px]">{node.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-500 py-12">
                      Select an artifact to inspect or bind to the knowledge graph.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* MODULE 5: RECURSIVE SELF-DEVELOPMENT ("AUTOGENESIS") STUDIO */}
          {activeModule === 'AUTOGENESIS' && autogenesis && (
            <AutogenesisStudioPanel
              key="autogenesis"
              autogenesis={autogenesis}
              onToggleActive={() => onToggleAutogenesis && onToggleAutogenesis()}
              onStepStage={() => onStepAutogenesisStage && onStepAutogenesisStage()}
              onRunFullCycleNow={() => onRunFullAutogenesisCycle && onRunFullAutogenesisCycle()}
              onChangeCadence={c => onChangeAutogenesisCadence && onChangeAutogenesisCadence(c)}
              onOpenFileInIde={fileId => onSelectFile(fileId)}
              onSwitchModule={mod => onSelectModule(mod)}
              nodes={nodes}
              onFocusGraphNode={onSelectGraphNode}
            />
          )}

          {/* MODULE 6: QUANTUM GRAPH ANALYTICS & PATHFINDING */}
          {activeModule === 'QUANTUM_ANALYTICS' && (
            <QuantumAnalyticsStudio
              key="quantum-analytics"
              nodes={nodes}
              metrics={computeQuantumAnalytics(nodes, [], null, null)}
              selectedStartId={null}
              selectedEndId={null}
              onSelectStartNode={() => {}}
              onSelectEndNode={() => {}}
              onRecalculate={() => {}}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CreativeWorkspaceStudio;
