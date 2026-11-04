import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DiagramParadigm, SpatialPatternType, KnowledgeContinent } from '../types';

interface GraphLegendProps {
  primaryParadigm: DiagramParadigm;
  activeSpatialPattern?: SpatialPatternType;
  continents?: KnowledgeContinent[];
  totalNodes: number;
  totalLinks: number;
  className?: string;
}

export const GraphLegend: React.FC<GraphLegendProps> = ({
  primaryParadigm,
  activeSpatialPattern = 'FORCE_DEFAULT',
  continents = [],
  totalNodes,
  totalLinks,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Paradigm-specific visual mapping descriptions
  const getMappingDetails = () => {
    if (activeSpatialPattern !== 'FORCE_DEFAULT') {
      const spatialDescriptions: Record<SpatialPatternType, { title: string; nodeSize: string; positionLogic: string; edgeLogic: string }> = {
        FORCE_DEFAULT: {
          title: 'Dynamic Spring Physics',
          nodeSize: 'Composite Centrality (Degree + Betweenness + Eigenvector)',
          positionLogic: 'Spring-electrical equilibrium with continental centroid gravitation',
          edgeLogic: 'Spring Tensor modulation: tight coils = high shared resonance'
        },
        CENTRALITY_RADIAL: {
          title: 'Radial Concentric Rings',
          nodeSize: 'Composite Centrality & Epistemic Depth',
          positionLogic: 'Concentric radius = BFS Geodesic Hop Distance from selected Anchor node',
          edgeLogic: 'Radial bezier curves modulated by endpoint resonance tensors'
        },
        CENTRALITY_TREE: {
          title: 'Rooted Hierarchical Tree',
          nodeSize: 'Epistemic Strength & Centrality',
          positionLogic: 'Vertical level = BFS depth from Anchor Root; horizontal slot = Composite score',
          edgeLogic: 'Hierarchical S-curve connectors with elastic damping'
        },
        CENTRALITY_GRID: {
          title: 'Centrality Orthogonal Matrix',
          nodeSize: 'Normalized Composite Rank',
          positionLogic: 'Matrix coordinate sorted by descending Composite Centrality; Anchor centered',
          edgeLogic: 'Orthogonal link vectors tensioned by shared synaptic resonance'
        },
        CENTRALITY_SPIRAL: {
          title: 'Fibonacci Golden Lattice',
          nodeSize: 'Rank Magnitude & Authority',
          positionLogic: 'Fermat / Golden-angle spiral (θ = 137.5°, r ∝ √k) radiating from Anchor',
          edgeLogic: 'Continuous harmonic spiral track with damping coils'
        },
        CENTRALITY_BIPARTITE: {
          title: 'Quartile Centrality Strata',
          nodeSize: 'Quartile Tier Tier 1 (Apex) to Tier 4 (Frontier)',
          positionLogic: '4 discrete vertical columns partitioning centrality quartiles',
          edgeLogic: 'Cross-stratum connective ribbons with spring tension'
        }
      };
      return spatialDescriptions[activeSpatialPattern] || spatialDescriptions.FORCE_DEFAULT;
    }

    const paradigmDescriptions: Record<DiagramParadigm, { title: string; nodeSize: string; positionLogic: string; edgeLogic: string }> = {
      FORCE_CONTINENTS: {
        title: 'Force-Directed Continents',
        nodeSize: 'Concept Depth & Resonance (16px – 42px)',
        positionLogic: 'Continental gravitation based on dominant relationship archetype',
        edgeLogic: 'Dynamic Spring Tensor: Frequency & stiffness proportional to Shared Resonance'
      },
      HOLOGRAPHIC_3D: {
        title: 'Holographic 3D Manifold',
        nodeSize: 'Quantum Tensor Mass',
        positionLogic: 'Rank-4 Tensor Adjacency Projection in 3D Euclidean Space',
        edgeLogic: 'Emissive photon beam particle pulses'
      },
      RADIAL_DENDROGRAM: {
        title: 'Radial Tree / Dendrogram',
        nodeSize: 'Hierarchical Branching Factor',
        positionLogic: 'Concentric polar strata r = depth · ΔR with non-crossing angular sectors',
        edgeLogic: 'Polar cubic curves tensioned along radial rays'
      },
      CHORD_WHEEL: {
        title: 'Circular Chord Wheel',
        nodeSize: 'Synaptic Connection Degree',
        positionLogic: '2π circular perimeter partitioned by continent arc length',
        edgeLogic: 'Inner tensioned quadratic Bézier chords through center'
      },
      VORONOI_EULER: {
        title: 'Voronoi & Euler Set Map',
        nodeSize: 'Territorial Centroid Density',
        positionLogic: 'Nearest-neighbor metric polygonal cells R_k = {x : d(x, p_k) ≤ d(x, p_j)}',
        edgeLogic: 'Delaunay dual straight links spanning polygon boundaries'
      },
      LAYERED_DAG: {
        title: 'Layered Flowchart (DAG)',
        nodeSize: 'Epistemic Derivation Tier',
        positionLogic: 'Monotonic horizontal rank stratification by epistemic depth',
        edgeLogic: 'Left-to-right cubic S-curve causal pathways'
      },
      SANKEY_FLOW: {
        title: 'Sankey Alluvial Flow',
        nodeSize: 'Flux Throughput Bar Height',
        positionLogic: 'Stage columns ordered by conceptual throughput',
        edgeLogic: 'Translucent alluvial ribbons with width proportional to flux'
      }
    };

    return paradigmDescriptions[primaryParadigm] || paradigmDescriptions.FORCE_CONTINENTS;
  };

  const mapping = getMappingDetails();

  return (
    <div
      className={cn(
        'absolute bottom-16 left-6 z-30 select-none transition-all duration-300 font-sans',
        className
      )}
    >
      <div className="bg-[#07090e]/95 border border-slate-800/80 rounded-md shadow-2xl backdrop-blur-md overflow-hidden text-left max-w-[340px]">
        {/* Header / Collapse Bar */}
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="w-full px-3 py-2 flex items-center justify-between gap-3 text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/60 transition-colors cursor-pointer border-b border-slate-800/60"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
              DYNAMIC GRAPH LEGEND
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-400 tabular-nums">
              {totalNodes}N · {totalLinks}L
            </span>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </button>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-3 space-y-3 text-[11px] leading-relaxed max-h-[380px] overflow-y-auto custom-scrollbar">
            {/* Active Mode Banner */}
            <div className="p-2 rounded bg-slate-900/80 border border-cyan-500/30 space-y-1">
              <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                <span>LAYOUT LOGIC</span>
                <span>{mapping.title}</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium">
                {mapping.positionLogic}
              </p>
            </div>

            {/* Visual Encoding Rules */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Target className="w-3 h-3 text-sky-400" />
                <span>VISUAL ENCODING RULES</span>
              </div>
              <div className="grid grid-cols-1 gap-1 text-[10px] font-mono">
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                  <span className="text-sky-300 shrink-0 font-bold">Node Size:</span>
                  <span className="text-slate-300">{mapping.nodeSize}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">Connections:</span>
                  <span className="text-slate-300">{mapping.edgeLogic}</span>
                </div>
              </div>
            </div>

            {/* Spring Tensor Harmonic Scale */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>SPRING TENSOR COIL FREQUENCY</span>
                </span>
                <span className="text-amber-400 text-[8px]">Geometric Mean</span>
              </div>
              <div className="space-y-1 text-[9px] font-mono">
                <div className="flex items-center justify-between p-1 rounded bg-slate-950/80 border border-cyan-500/30">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                    <span className="text-slate-200">High Resonance (&gt;0.75)</span>
                  </div>
                  <span className="text-cyan-300 font-bold">Tight Coils · High Stiffness</span>
                </div>
                <div className="flex items-center justify-between p-1 rounded bg-slate-950/80 border border-purple-500/30">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-slate-200">Medium (0.50–0.75)</span>
                  </div>
                  <span className="text-purple-300">Harmonic Sine Waves</span>
                </div>
                <div className="flex items-center justify-between p-1 rounded bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-slate-200">Low Resonance (&lt;0.50)</span>
                  </div>
                  <span className="text-slate-400">Loose Oscillations</span>
                </div>
              </div>
            </div>

            {/* Biomimetic Plasticity & Mycelial Foraging Scale */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>BIOMIMETIC PLASTICITY</span>
                </span>
                <span className="text-emerald-400 text-[8px]">Hebbian STDP</span>
              </div>
              <div className="space-y-1 text-[9px] font-mono">
                <div className="flex items-center justify-between p-1 rounded bg-slate-950/80 border border-emerald-500/30">
                  <span className="text-slate-200">Micro-Hyphae Sprouts</span>
                  <span className="text-emerald-300 font-bold">Autonomous Foraging</span>
                </div>
                <div className="flex items-center justify-between p-1 rounded bg-slate-950/80 border border-cyan-500/30">
                  <span className="text-slate-200">Cytoplasmic Streaming</span>
                  <span className="text-cyan-300">Nutrient Pulse Wave</span>
                </div>
                <div className="flex items-center justify-between p-1 rounded bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-200">Hebbian Synaptic Decay</span>
                  <span className="text-slate-400">Half-life Pruning</span>
                </div>
              </div>
            </div>

            {/* Knowledge Continents Color Palette */}
            {continents.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>KNOWLEDGE CONTINENTS ({continents.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                  {continents.map(c => (
                    <div
                      key={c.id}
                      className="p-1 rounded bg-slate-950/70 border border-slate-800 flex items-center gap-1.5 truncate"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-slate-300 truncate" title={c.label}>
                        {c.dominantRelationship} ({c.nodeCount})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
