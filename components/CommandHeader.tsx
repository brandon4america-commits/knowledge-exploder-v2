import React from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Cpu,
  Hexagon,
  Users,
  Sparkles,
  PenTool,
  Code2,
  Kanban,
  Library,
  Command,
  Route,
  History,
  Box
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  MissionType,
  DiscoveryMission,
  GraphNode,
  GraphLink,
  WorkspaceLayoutMode,
  WorkspaceModuleType,
  AutogenesisState
} from '../types';
import NodeSearchBar from './NodeSearchBar';
import { EvolutionaryStateMemoryHUD } from './EvolutionaryStateMemoryHUD';
import { VoiceTelemetryHUD } from './VoiceTelemetryHUD';

interface CommandHeaderProps {
  topic: string;
  setTopic: (t: string) => void;
  startMission: (type: MissionType) => void;
  loading: boolean;
  mission: DiscoveryMission | null;
  autoExplode: boolean;
  setAutoExplode: (v: boolean) => void;
  swarmActive: boolean;
  setSwarmActive: (v: boolean) => void;
  graphNodes?: GraphNode[];
  graphLinks?: GraphLink[];
  selectedNode?: GraphNode | null;
  focusedNodeId?: string | null;
  onJumpFocus?: (node: GraphNode) => void;
  workspaceLayoutMode?: WorkspaceLayoutMode;
  onChangeWorkspaceLayoutMode?: (mode: WorkspaceLayoutMode) => void;
  activeWorkspaceModule?: WorkspaceModuleType;
  onSelectWorkspaceModule?: (module: WorkspaceModuleType) => void;
  onOpenCommandPalette?: (tab?: 'COMMANDS' | 'CAUSAL_TRACE' | 'SNAPSHOTS' | 'QUANTUM_TENSOR') => void;
  snapshotCount?: number;
  selfDevActive?: boolean;
  onToggleSelfDev?: () => void;
  generationVersion?: string;
  autogenesis?: AutogenesisState;
  onSaveStateNow?: () => void;
  onImportState?: (fileContent: string) => void;
  onResetMemory?: () => void;
  onExportState?: () => void;
  onStepAutogenesis?: () => void;
  onToggle3DSpatial?: () => void;
  onCaptureSnapshot?: () => void;
  onTriggerDeployment?: () => void;
}

const CommandHeader: React.FC<CommandHeaderProps> = ({
  topic,
  setTopic,
  startMission,
  loading,
  mission,
  autoExplode,
  setAutoExplode,
  swarmActive,
  setSwarmActive,
  graphNodes = [],
  graphLinks = [],
  selectedNode = null,
  focusedNodeId,
  onJumpFocus,
  workspaceLayoutMode = 'GRAPH_ONLY',
  onChangeWorkspaceLayoutMode,
  activeWorkspaceModule = 'WHITEBOARD',
  onSelectWorkspaceModule,
  onOpenCommandPalette,
  snapshotCount = 0,
  selfDevActive = false,
  onToggleSelfDev,
  generationVersion = 'v16.0.0',
  autogenesis,
  onSaveStateNow,
  onImportState,
  onResetMemory,
  onExportState,
  onStepAutogenesis,
  onToggle3DSpatial,
  onCaptureSnapshot,
  onTriggerDeployment
}) => {
  const studioOpen = workspaceLayoutMode !== 'GRAPH_ONLY';

  return (
    <header className="z-20 px-6 py-3.5 bg-slate-950/90 backdrop-blur-3xl border-b-2 border-sky-500/40 shadow-[0_4px_30px_rgba(0,0,0,0.7)] flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3.5">
        <motion.div
          animate={{
            backgroundColor: selfDevActive
              ? 'rgb(16 185 129)'
              : autoExplode
              ? 'rgb(14 165 233)'
              : 'rgb(15 23 42 / 0.8)',
            scale: selfDevActive || autoExplode ? 1.05 : 1
          }}
          className={cn(
            'w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 border-2 border-sky-400/50 shadow-[0_0_15px_rgba(14,165,233,0.25)]',
            (autoExplode || selfDevActive) && 'shadow-sky-500/50 border-sky-300'
          )}
        >
          {autoExplode || selfDevActive ? (
            <Cpu className="w-5 h-5 text-white" />
          ) : (
            <Hexagon className="w-5 h-5 text-sky-400" />
          )}
        </motion.div>
        <div className="hidden xl:block">
          <h1 className="text-base font-black tracking-tighter italic uppercase text-white flex items-center gap-2">
            <span>Omega Point</span>
            <span
              data-swarm-target="gaze-tracking-badge"
              className="px-2 py-0.5 rounded-md bg-slate-900 border border-sky-500/40 text-[8px] font-mono font-bold text-sky-300 uppercase tracking-widest flex items-center gap-1"
              title="Gaze-Directional Holographic Parallax Tracking Active"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              <span>Gaze 3D Parallax</span>
            </span>
          </h1>
          <div className="text-[8px] font-black tracking-[0.25em] text-sky-400 uppercase flex items-center gap-1.5">
            <span>Cognitive Studio</span>
            <span className="text-emerald-400 font-mono">{generationVersion}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg flex items-center gap-2.5">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400 transition-colors group-focus-within:text-sky-300" />
          <input
            type="text"
            data-swarm-target="header-search-input"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startMission('DEEP_DIVE')}
            placeholder="Initialize Neural Inquiry..."
            className="w-full bg-slate-900/80 border-2 border-sky-500/40 rounded-2xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20 transition-all text-xs font-bold text-white placeholder:text-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
          />
        </div>
        <div className="flex bg-slate-950/90 p-1 rounded-2xl border-2 border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.15)] gap-1">
          {(['DEEP_DIVE', 'BREADTH_SCAN', 'FOUNDATIONS'] as MissionType[]).map(type => (
            <button
              key={type}
              data-swarm-target={`mission-type-${type}`}
              onClick={() => startMission(type)}
              disabled={loading}
              className={cn(
                'px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer',
                mission?.type === type
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 border border-sky-300'
                  : 'text-slate-400 hover:text-white hover:bg-sky-500/10'
              )}
            >
              {type.split('_')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Global Node Search Bar with live autocomplete and jump-focus */}
      {onJumpFocus && (
        <NodeSearchBar
          nodes={graphNodes}
          links={graphLinks}
          focusedNodeId={focusedNodeId}
          onJumpFocus={onJumpFocus}
        />
      )}

      {/* Integrated Creative Workspace Studio Switcher */}
      {onChangeWorkspaceLayoutMode && onSelectWorkspaceModule && (
        <div className="flex items-center bg-slate-950/95 p-1 rounded-2xl border-2 border-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.18)] gap-1">
          <button
            type="button"
            data-swarm-target="header-studio-toggle"
            onClick={() =>
              onChangeWorkspaceLayoutMode(studioOpen ? 'GRAPH_ONLY' : 'SPLIT_STUDIO')
            }
            className={cn(
              'px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer',
              studioOpen
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 border border-sky-300'
                : 'text-sky-300 hover:text-white hover:bg-sky-500/15'
            )}
            title="Toggle Integrated Creative Workspace Studio (Split Graph + Studio)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creative Studio</span>
          </button>

          {(
            [
              { id: 'WHITEBOARD', label: 'Board', icon: <PenTool className="w-3 h-3" /> },
              { id: 'CODE_IDE', label: 'IDE', icon: <Code2 className="w-3 h-3" /> },
              { id: 'PROJECT_BOARD', label: 'Sprint', icon: <Kanban className="w-3 h-3" /> },
              { id: 'ASSET_LIBRARY', label: 'Assets', icon: <Library className="w-3 h-3" /> },
              { id: 'AUTOGENESIS', label: 'Self-Dev', icon: <Cpu className="w-3 h-3 text-emerald-400" /> }
            ] as const
          ).map(mod => {
            const isModActive = studioOpen && activeWorkspaceModule === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                data-swarm-target={`header-module-${mod.id}`}
                onClick={() => {
                  onSelectWorkspaceModule(mod.id);
                  if (!studioOpen) {
                    onChangeWorkspaceLayoutMode('SPLIT_STUDIO');
                  }
                }}
                className={cn(
                  'px-2.5 py-2 rounded-xl text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer',
                  isModActive
                    ? 'bg-sky-500/25 text-sky-200 border border-sky-400/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                )}
                title={`Open ${mod.label} Workspace Module`}
              >
                {mod.icon}
                <span className="hidden 2xl:inline">{mod.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Command Palette, Causal Path Tracer & Time-Travel Snapshots */}
      {onOpenCommandPalette && (
        <div className="flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800 gap-1">
          <button
            type="button"
            data-swarm-target="header-command-palette"
            onClick={() => onOpenCommandPalette('COMMANDS')}
            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-[9px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Open Universal Command Palette (Cmd+K / Ctrl+K)"
          >
            <Command className="w-3 h-3 text-sky-400" />
            <span>⌘K</span>
          </button>

          <button
            type="button"
            data-swarm-target="header-causal-trace"
            onClick={() => onOpenCommandPalette('CAUSAL_TRACE')}
            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 hover:text-white text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Open Shortest-Path Causal Trace Analyzer"
          >
            <Route className="w-3 h-3 text-emerald-400" />
            <span className="hidden 2xl:inline">Trace</span>
          </button>

          <button
            type="button"
            data-swarm-target="header-snapshots"
            onClick={() => onOpenCommandPalette('SNAPSHOTS')}
            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-white text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Time-Travel Workspace Snapshots"
          >
            <History className="w-3 h-3 text-amber-400" />
            <span>{snapshotCount}</span>
          </button>

          <button
            type="button"
            data-swarm-target="header-quantum-tensor"
            onClick={() => onOpenCommandPalette('QUANTUM_TENSOR')}
            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 hover:text-white text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Open Quantum Tensor Matrix Inspector"
          >
            <Box className="w-3 h-3 text-purple-400" />
            <span className="hidden 2xl:inline">Tensor</span>
          </button>
        </div>
      )}

      {/* Multi-Modal AI Voice Telemetry & Speech Control HUD */}
      {onJumpFocus && (
        <VoiceTelemetryHUD
          nodes={graphNodes}
          selectedNode={selectedNode}
          fitnessScore={autogenesis?.fitnessScore}
          onJumpFocus={onJumpFocus}
          onStepAutogenesis={onStepAutogenesis || (() => {})}
          onToggle3DSpatial={onToggle3DSpatial || (() => {})}
          onCaptureSnapshot={onSaveStateNow || (() => {})}
          onTriggerDeployment={onTriggerDeployment || (() => {})}
        />
      )}

      {/* Evolutionary State Memory Persistence HUD */}
      {autogenesis && onSaveStateNow && onImportState && onResetMemory && onExportState && (
        <EvolutionaryStateMemoryHUD
          autogenesis={autogenesis}
          snapshotCount={snapshotCount}
          onSaveStateNow={onSaveStateNow}
          onImportState={onImportState}
          onResetMemory={onResetMemory}
          onExportState={onExportState}
        />
      )}

      <div className="flex items-center gap-2.5">
        {/* Recursive Self-Development ("Develop Itself") Toggle */}
        {onToggleSelfDev && (
          <button
            type="button"
            data-swarm-target="header-self-develop-toggle"
            onClick={onToggleSelfDev}
            className={cn(
              'px-3.5 py-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 group cursor-pointer',
              selfDevActive
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                : 'border-emerald-500/40 bg-slate-900/75 text-emerald-300 hover:border-emerald-400 hover:text-white'
            )}
            title="Toggle Autonomous Recursive Self-Development Engine (App Develops Itself)"
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-500',
                selfDevActive
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.95)] animate-ping'
                  : 'bg-emerald-500/60'
              )}
            />
            <span className="text-[9px] font-black uppercase tracking-[0.14em] font-mono">
              {selfDevActive ? `Self-Dev ${generationVersion}` : 'Self-Develop'}
            </span>
          </button>
        )}

        <button
          data-swarm-target="header-autopilot-toggle"
          onClick={() => setAutoExplode(!autoExplode)}
          className={cn(
            'px-3.5 py-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 group cursor-pointer',
            autoExplode
              ? 'border-sky-400 bg-sky-500/15 text-sky-300 shadow-[0_0_25px_rgba(14,165,233,0.25)]'
              : 'border-sky-500/30 bg-slate-900/60 text-slate-400 hover:border-sky-400/60 hover:text-slate-200'
          )}
        >
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-500',
              autoExplode ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]' : 'bg-slate-700'
            )}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] group-hover:text-slate-200 transition-colors">
            Auto Pilot
          </span>
        </button>

        {/* 100 Expert Researchers & Builders Swarm Toggle */}
        <button
          data-swarm-target="header-swarm-toggle"
          onClick={() => setSwarmActive(!swarmActive)}
          className={cn(
            'px-3.5 py-2 rounded-2xl border-2 transition-all flex items-center gap-2.5 group relative select-none cursor-pointer',
            swarmActive
              ? 'border-sky-300 bg-sky-500/25 text-white shadow-[0_0_28px_rgba(14,165,233,0.5)] ring-2 ring-sky-400/40'
              : 'border-sky-500/40 bg-slate-900/90 text-slate-300 hover:border-sky-400 hover:text-white shadow-[0_0_15px_rgba(14,165,233,0.15)]'
          )}
          title={
            swarmActive
              ? 'Deactivate 100 Sovereign Researchers & Builders Swarm'
              : 'Activate 100 Sovereign Researchers & Builders Swarm (Toggle ON)'
          }
        >
          <div
            className={cn(
              'w-7 h-4 rounded-full p-0.5 transition-all duration-300 border flex items-center',
              swarmActive ? 'bg-sky-500 border-sky-300 justify-end' : 'bg-slate-800 border-slate-700 justify-start'
            )}
          >
            <motion.div
              layout
              className={cn(
                'w-2.5 h-2.5 rounded-full shadow',
                swarmActive ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]' : 'bg-slate-500'
              )}
            />
          </div>

          <div className="flex flex-col items-start leading-tight">
            <div className="flex items-center gap-1.5">
              <Users className={cn('w-3.5 h-3.5', swarmActive ? 'text-sky-300' : 'text-sky-400')} />
              <span
                className={cn(
                  'text-[9px] font-black uppercase tracking-[0.15em] font-mono',
                  swarmActive ? 'text-sky-200' : 'text-slate-300'
                )}
              >
                Expert Swarms
              </span>
            </div>
            <span
              className={cn(
                'text-[7px] font-mono uppercase tracking-widest font-bold',
                swarmActive ? 'text-emerald-400' : 'text-slate-500'
              )}
            >
              {swarmActive ? '100 EXPERTS ACTIVE' : 'TOGGLE OFF'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default CommandHeader;

