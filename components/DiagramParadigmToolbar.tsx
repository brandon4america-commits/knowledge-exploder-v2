import React, { useState } from 'react';
import {
  Network,
  GitFork,
  Disc,
  Hexagon,
  Workflow,
  Waves,
  Columns,
  ArrowLeftRight,
  Info,
  ExternalLink,
  Box,
  Target,
  CircleDot,
  Grid,
  RotateCw,
  Split,
  Undo2
} from 'lucide-react';
import { DiagramParadigm, SpatialPatternType, GraphNode } from '../types';
import { DIAGRAM_PARADIGM_SPECS } from '../services/diagramLayoutEngine';

interface DiagramParadigmToolbarProps {
  primaryParadigm: DiagramParadigm;
  onSelectPrimary: (p: DiagramParadigm) => void;
  splitScreen: boolean;
  onToggleSplitScreen: () => void;
  secondaryParadigm: DiagramParadigm;
  onSelectSecondary: (p: DiagramParadigm) => void;
  onSwapParadigms: () => void;
  activeSpatialPattern?: SpatialPatternType;
  onSelectSpatialPattern?: (pattern: SpatialPatternType) => void;
  anchorNode?: GraphNode | null;
}

const PARADIGM_ICONS: Record<DiagramParadigm, React.ReactNode> = {
  FORCE_CONTINENTS: <Network className="w-3.5 h-3.5" />,
  HOLOGRAPHIC_3D: <Box className="w-3.5 h-3.5" />,
  RADIAL_DENDROGRAM: <GitFork className="w-3.5 h-3.5" />,
  CHORD_WHEEL: <Disc className="w-3.5 h-3.5" />,
  VORONOI_EULER: <Hexagon className="w-3.5 h-3.5" />,
  LAYERED_DAG: <Workflow className="w-3.5 h-3.5" />,
  SANKEY_FLOW: <Waves className="w-3.5 h-3.5" />
};

const SPATIAL_PATTERNS: Array<{
  id: SpatialPatternType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: 'CENTRALITY_RADIAL',
    label: 'Radial Rings',
    icon: <CircleDot className="w-3.5 h-3.5" />,
    description: 'Concentric rings by BFS hop distance & composite centrality'
  },
  {
    id: 'CENTRALITY_TREE',
    label: 'Rooted Tree',
    icon: <GitFork className="w-3.5 h-3.5" />,
    description: 'Breadth-first spanning tree rooted at anchor node'
  },
  {
    id: 'CENTRALITY_GRID',
    label: 'Centrality Grid',
    icon: <Grid className="w-3.5 h-3.5" />,
    description: 'Orthogonal matrix ranked by composite centrality'
  },
  {
    id: 'CENTRALITY_SPIRAL',
    label: 'Fibonacci Spiral',
    icon: <RotateCw className="w-3.5 h-3.5" />,
    description: 'Golden-angle spiral lattice radiating outward from anchor'
  },
  {
    id: 'CENTRALITY_BIPARTITE',
    label: 'Quartile Strata',
    icon: <Split className="w-3.5 h-3.5" />,
    description: 'Multi-tier columns partitioning centrality quartiles'
  }
];

export const DiagramParadigmToolbar: React.FC<DiagramParadigmToolbarProps> = ({
  primaryParadigm,
  onSelectPrimary,
  splitScreen,
  onToggleSplitScreen,
  secondaryParadigm,
  onSelectSecondary,
  onSwapParadigms,
  activeSpatialPattern = 'FORCE_DEFAULT',
  onSelectSpatialPattern,
  anchorNode = null
}) => {
  const [showTaxonomySpec, setShowTaxonomySpec] = useState(false);

  const activePrimarySpec =
    DIAGRAM_PARADIGM_SPECS.find(s => s.id === primaryParadigm) || DIAGRAM_PARADIGM_SPECS[0];
  const activeSecondarySpec =
    DIAGRAM_PARADIGM_SPECS.find(s => s.id === secondaryParadigm) || DIAGRAM_PARADIGM_SPECS[2];

  const isSpatialActive = activeSpatialPattern !== 'FORCE_DEFAULT';

  return (
    <div className="absolute top-14 2xl:top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 max-w-[94vw] select-none pointer-events-auto">
      {/* Main Segmented Control Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1 px-2 py-1 bg-[#07090e]/95 border border-slate-800 rounded-lg shadow-2xl backdrop-blur-md">
        <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-slate-800">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400">
            {splitScreen ? 'VIEWPORT A' : 'PARADIGM'}
          </span>
        </div>

        {/* Primary Paradigm Buttons */}
        <div className="flex items-center gap-1">
          {DIAGRAM_PARADIGM_SPECS.map(spec => {
            const isActive = primaryParadigm === spec.id && !isSpatialActive;
            return (
              <button
                key={spec.id}
                data-swarm-target={`paradigm-primary-${spec.id}`}
                onClick={() => {
                  if (onSelectSpatialPattern && isSpatialActive) {
                    onSelectSpatialPattern('FORCE_DEFAULT');
                  }
                  onSelectPrimary(spec.id);
                }}
                title={`${spec.fullName} — ${spec.invariant}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/60 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                  {PARADIGM_ICONS[spec.id]}
                </span>
                <span className="hidden sm:inline">{spec.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Split-Screen Comparison Toggle */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
          <button
            data-swarm-target="split-screen-toggle"
            onClick={onToggleSplitScreen}
            title="Toggle Synchronized Split-Screen Diagram Comparison"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all border ${
              splitScreen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{splitScreen ? 'SPLIT: 2X SYNC' : 'COMPARE SPLIT'}</span>
          </button>

          <button
            data-swarm-target="taxonomy-spec-toggle"
            onClick={() => setShowTaxonomySpec(prev => !prev)}
            title="Inspect Wikipedia Category:Diagrams Topological Specification"
            className={`p-1.5 rounded-sm border transition-colors ${
              showTaxonomySpec
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Centrality Spatial Pattern Reorganization Ribbon */}
      {onSelectSpatialPattern && (
        <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-1 bg-[#07090e]/95 border border-sky-500/40 rounded-md shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800">
            <Target className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-sky-300">
              CENTRALITY GEOMETRY
            </span>
            {anchorNode && (
              <span className="text-[9px] font-mono text-slate-400 max-w-[130px] truncate" title={`Anchor Node: ${anchorNode.label}`}>
                [ANCHOR: {anchorNode.label}]
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {SPATIAL_PATTERNS.map(pat => {
              const isActive = activeSpatialPattern === pat.id;
              return (
                <button
                  key={pat.id}
                  data-swarm-target={`spatial-pattern-${pat.id}`}
                  onClick={() => onSelectSpatialPattern(pat.id)}
                  title={pat.description}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-mono uppercase tracking-wider transition-all border ${
                    isActive
                      ? 'bg-sky-500/25 text-sky-200 border-sky-400 font-bold shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                      : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <span className={isActive ? 'text-sky-300' : 'text-slate-500'}>
                    {pat.icon}
                  </span>
                  <span>{pat.label}</span>
                </button>
              );
            })}
          </div>

          {isSpatialActive && (
            <button
              onClick={() => onSelectSpatialPattern('FORCE_DEFAULT')}
              title="Release geometry and restore organic force-directed physics"
              className="flex items-center gap-1 px-2 py-1 ml-1 rounded-sm bg-slate-900 border border-slate-700 hover:border-sky-400/60 text-[9px] font-mono uppercase text-slate-300 hover:text-sky-300 transition-colors"
            >
              <Undo2 className="w-3 h-3 text-slate-400" />
              <span>RELEASE FORCE</span>
            </button>
          )}
        </div>
      )}

      {/* Secondary Viewport B Selector Bar when Split-Screen Comparison is Active */}
      {splitScreen && (
        <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 bg-[#07090e]/95 border border-amber-500/40 rounded-md shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400">
              VIEWPORT B (TWIN)
            </span>
          </div>

          <div className="flex items-center gap-1">
            {DIAGRAM_PARADIGM_SPECS.map(spec => {
              const isActive = secondaryParadigm === spec.id;
              return (
                <button
                  key={spec.id}
                  data-swarm-target={`paradigm-secondary-${spec.id}`}
                  onClick={() => onSelectSecondary(spec.id)}
                  title={`Viewport B: ${spec.fullName}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all border ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <span className={isActive ? 'text-amber-400' : 'text-slate-500'}>
                    {PARADIGM_ICONS[spec.id]}
                  </span>
                  <span className="hidden sm:inline">{spec.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            data-swarm-target="paradigm-swap-btn"
            onClick={onSwapParadigms}
            title="Swap Viewport A & Viewport B Diagram Paradigms"
            className="flex items-center gap-1 px-2 py-1 ml-1 rounded-sm bg-slate-900 border border-slate-700 hover:border-amber-400/60 text-[9px] font-mono uppercase text-slate-300 hover:text-amber-300 transition-colors"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>SWAP</span>
          </button>
        </div>
      )}

      {/* Wikipedia Category:Diagrams Specification Readout Drawer */}
      {showTaxonomySpec && (
        <div className="w-full max-w-2xl bg-[#07090e]/95 border border-slate-800 rounded-md p-3.5 shadow-2xl backdrop-blur-md text-left space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              <span>WIKIPEDIA TAXONOMY REFERENCE</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">CATEGORY:DIAGRAMS</span>
            </div>
            <a
              href="https://en.wikipedia.org/wiki/Category:Diagrams"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
            >
              <span>en.wikipedia.org/wiki/Category:Diagrams</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className={`grid gap-3 ${splitScreen ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-300">
                  {splitScreen ? `VIEWPORT A · ${activePrimarySpec.fullName}` : activePrimarySpec.fullName}
                </span>
                <a
                  href={activePrimarySpec.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Wiki Spec</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Class: <span className="text-slate-200">{activePrimarySpec.wikiCategoryRef}</span>
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                Invariant: <span className="text-emerald-400">{activePrimarySpec.invariant}</span>
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                Encoding: <span className="text-slate-300">{activePrimarySpec.encodingRule}</span>
              </p>
            </div>

            {splitScreen && (
              <div className="p-2.5 bg-slate-900/60 border border-amber-500/30 rounded-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-300">
                    VIEWPORT B · {activeSecondarySpec.fullName}
                  </span>
                  <a
                    href={activeSecondarySpec.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-mono text-slate-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>Wiki Spec</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  Class: <span className="text-slate-200">{activeSecondarySpec.wikiCategoryRef}</span>
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  Invariant: <span className="text-emerald-400">{activeSecondarySpec.invariant}</span>
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  Encoding: <span className="text-slate-300">{activeSecondarySpec.encodingRule}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
