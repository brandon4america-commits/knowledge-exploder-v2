import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { 
  GraphNode, 
  GraphLink, 
  GraphData, 
  KnowledgeContinent, 
  ContinentPhysicsConfig,
  DiagramParadigm,
  CausalPathTrace,
  SpatialPatternType,
  NodeCentralityMetrics,
  BiomimeticConfig,
  MicroHypha,
  ChemotacticBeacon,
  AetherAgent,
  AetherSwarmConfig,
  AetherPulseEvent,
  TopologicalDivergenceDiff
} from '../types';
import {
  computeDiagramProjection,
  DIAGRAM_PARADIGM_SPECS,
  DiagramGuideElement
} from '../services/diagramLayoutEngine';
import {
  computeCentralitySpatialProjection
} from '../services/centralityEngine';
import {
  configureSpringTensorForces,
  enrichLinksWithSpringTensor
} from '../services/springTensorEngine';
import { SpringOverlay } from './SpringOverlay';
import { BiomimeticOverlay } from './BiomimeticOverlay';
import { AetherSwarmOverlay } from './AetherSwarmOverlay';
import { DivergenceDiffOverlay } from './DivergenceDiffOverlay';
import {
  DEFAULT_AETHER_SWARM_CONFIG,
  initializeAetherAgents,
  stepAetherSwarm
} from '../services/aetherSwarmEngine';
import {
  calculatePhotonPulses,
  getPredicateStyle,
  EPISTEMIC_PREDICATES
} from '../services/causalTraceEngine';
import { physicsEngine, PhysicsEngineStatus } from '../services/physicsEngine';
import { sanitizeNodeLabel } from '../services/inferenceEngine';
import { Graph3D } from './Graph3D';
import {
  PhysicsDebuggerOverlay,
  PhysicsDebugConfig,
  DEFAULT_PHYSICS_DEBUG_CONFIG,
  PhysicsTelemetrySnapshot,
  PHYSICS_PRESET_SPECS,
  PhysicsPresetId,
  recommendPresetForTopology,
  StressHotspotNodeItem,
  SynapticBottleneckLinkItem
} from './PhysicsDebuggerOverlay';

interface GraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  isLoading: boolean;
  synergyLevel: number;
  focusedNodeId?: string | null;
  focusTrigger?: { nodeId: string; timestamp: number } | null;
  onHoverCoordinates?: (coords: { x: number; y: number } | null) => void;
  pinnedNodeId?: string | null;
  onTogglePin?: (node: GraphNode) => void;
  continentConfig?: ContinentPhysicsConfig;
  continentFocusTrigger?: { continentId: string; timestamp: number } | null;
  resetAnchorsTrigger?: number;
  onContinentsUpdated?: (continents: KnowledgeContinent[]) => void;
  onFocusContinent?: (continentId: string) => void;
  onToggleCollapseContinent?: (continentId: string) => void;
  diagramParadigm?: DiagramParadigm;
  viewportLabel?: string;
  sharedHoveredNodeId?: string | null;
  onHoverNode?: (nodeId: string | null) => void;
  activeCausalTrace?: CausalPathTrace | null;
  onClearCausalTrace?: () => void;
  activeSpatialPattern?: SpatialPatternType;
  spatialAnchorNodeId?: string | null;
  centralityMap?: Map<string, NodeCentralityMetrics>;
  biomimeticConfig?: BiomimeticConfig;
  biomimeticHyphae?: MicroHypha[];
  morphicPulseTimestamp?: number | null;
  chemotacticBeacons?: ChemotacticBeacon[];
  onUpdateBeacon?: (beacon: ChemotacticBeacon) => void;
  fitViewportTrigger?: number;
  safeInsets?: { top: number; right: number; bottom: number; left: number };
  autoOptimizeScreen?: boolean;
  aetherConfig?: AetherSwarmConfig;
  onTriggerAetherPulse?: (event: AetherPulseEvent) => void;
  onDiveSubGraph?: (node: GraphNode) => void;
  onReinforceEdge?: (sourceId: string, targetId: string) => void;
  divergenceDiff?: TopologicalDivergenceDiff | null;
  divergenceRole?: 'CANONICAL' | 'FORK';
  showDivergenceHeatmap?: boolean;
}

const CONTINENT_PALETTE: Record<string, string> = {
  IsA: '#06b6d4',        // Cyan
  PartOf: '#10b981',     // Emerald
  DependsOn: '#f59e0b',  // Amber
  Uses: '#3b82f6',       // Blue
  Enables: '#8b5cf6',    // Violet
  Influences: '#ec4899', // Pink
  Extends: '#14b8a6',    // Teal
  Implements: '#6366f1', // Indigo
  Secures: '#eab308',    // Yellow
  Optimizes: '#22c55e',  // Green
  Governs: '#f43f5e'     // Rose
};

const FALLBACK_ARCHETYPES = [
  'IsA',
  'Enables',
  'DependsOn',
  'PartOf',
  'Uses',
  'Influences'
];

const FALLBACK_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const DEFAULT_CONTINENT_CONFIG: ContinentPhysicsConfig = {
  enabled: true,
  gravity: 0.45,
  separation: 340,
  hullOpacity: 0.8,
  isolatedContinentId: null,
  collapsedContinentIds: []
};

const QUANTUM_BIOLUMINESCENT_INTERPOLATOR = d3.interpolateRgbBasis([
  '#1e1b4b', // Deep Indigo (Quiescent / Minimal Conductivity)
  '#4c1d95', // Royal Violet
  '#7c3aed', // Bioluminescent Violet
  '#06b6d4', // Electric Cyan
  '#67e8f9', // Luminous Cyan-White
  '#ffffff'  // Incandescent White (Peak Kinetic Energy / Maximum Synaptic Conductivity)
]);

/**
 * Real-time color-encoding function mapping a node's instantaneous kinetic energy
 * E_k = 0.5 * m * ||v||^2 onto the Bioluminescent Quantum spectrum.
 */
export function encodeNodeKineticQuantumColor(node: GraphNode): string {
  const vx = node.vx || 0;
  const vy = node.vy || 0;
  const speed = Math.hypot(vx, vy);
  const mass = Math.max(0.5, node.strength || 1.0);
  const kineticEnergy = 0.5 * mass * speed * speed;
  // Nonlinear square-root response curve so subtle motion visibly shifts from indigo/violet to cyan/white
  const normalized = Math.min(1, Math.max(0, 0.14 + Math.sqrt(kineticEnergy) / 2.4));
  return QUANTUM_BIOLUMINESCENT_INTERPOLATOR(normalized);
}

/**
 * Real-time color-encoding function mapping a link's synaptic conductivity (and live kinetic/strain flux)
 * onto the Bioluminescent Quantum spectrum.
 */
export function encodeLinkConductivityQuantumColor(
  link: GraphLink,
  targetEqDist: number
): { color: string; effectiveConductivity: number; normalized: number } {
  const sObj = link.source as GraphNode;
  const tObj = link.target as GraphNode;
  const baseConductivity = typeof link.conductivity === 'number' ? link.conductivity : 0.82;
  const sx = sObj.x || 0;
  const sy = sObj.y || 0;
  const tx = tObj.x || 0;
  const ty = tObj.y || 0;
  const actualDist = Math.hypot(tx - sx, ty - sy);
  const strainRatio = Math.abs(actualDist - targetEqDist) / Math.max(1, targetEqDist);
  const sv = Math.hypot(sObj.vx || 0, sObj.vy || 0);
  const tv = Math.hypot(tObj.vx || 0, tObj.vy || 0);
  const kineticFlux = (sv + tv) * 0.12;

  const effectiveConductivity = Math.max(
    0.1,
    Math.min(2.0, baseConductivity * (1 + strainRatio * 0.25) + kineticFlux)
  );
  // Normalize conductivity from [0.1, 1.65] -> [0, 1]
  const normalized = Math.min(1, Math.max(0, (effectiveConductivity - 0.1) / 1.55));
  return {
    color: QUANTUM_BIOLUMINESCENT_INTERPOLATOR(normalized),
    effectiveConductivity,
    normalized
  };
}

function generateRadialHullPoints(
  nodes: Array<{ x: number; y: number }>,
  radius: number,
  samplesPerNode: number = 12
): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (const n of nodes) {
    for (let i = 0; i < samplesPerNode; i++) {
      const angle = (Math.PI * 2 * i) / samplesPerNode;
      pts.push([
        n.x + Math.cos(angle) * radius,
        n.y + Math.sin(angle) * radius
      ]);
    }
  }
  return pts;
}

const Graph: React.FC<GraphProps> = ({ 
  data, 
  onNodeClick, 
  isLoading, 
  synergyLevel,
  focusedNodeId,
  focusTrigger,
  onHoverCoordinates,
  pinnedNodeId,
  onTogglePin,
  continentConfig = DEFAULT_CONTINENT_CONFIG,
  continentFocusTrigger,
  resetAnchorsTrigger = 0,
  onContinentsUpdated,
  onFocusContinent,
  onToggleCollapseContinent,
  diagramParadigm = 'FORCE_CONTINENTS',
  viewportLabel,
  sharedHoveredNodeId = null,
  onHoverNode,
  activeCausalTrace = null,
  onClearCausalTrace,
  activeSpatialPattern = 'FORCE_DEFAULT',
  spatialAnchorNodeId = null,
  centralityMap,
  biomimeticConfig,
  biomimeticHyphae = [],
  morphicPulseTimestamp = null,
  chemotacticBeacons = [],
  onUpdateBeacon,
  fitViewportTrigger = 0,
  safeInsets = { top: 88, right: 48, bottom: 72, left: 48 },
  autoOptimizeScreen = true,
  aetherConfig,
  onTriggerAetherPulse,
  onDiveSubGraph,
  onReinforceEdge,
  divergenceDiff = null,
  divergenceRole = 'CANONICAL',
  showDivergenceHeatmap = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const dimensionsRef = useRef({ width: 1200, height: 800 });
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [engineStatus, setEngineStatus] = useState<PhysicsEngineStatus>(() => physicsEngine.getStatus());
  const [viewportTransform, setViewportTransform] = useState<{ k: number; x: number; y: number }>({ k: 1, x: 0, y: 0 });
  const [isPhysicsDebuggerOpen, setIsPhysicsDebuggerOpen] = useState(false);
  const [physicsDebugConfig, setPhysicsDebugConfig] = useState<PhysicsDebugConfig>(DEFAULT_PHYSICS_DEBUG_CONFIG);
  const physicsDebugConfigRef = useRef<PhysicsDebugConfig>(DEFAULT_PHYSICS_DEBUG_CONFIG);
  physicsDebugConfigRef.current = physicsDebugConfig;

  const [activeHotspotNodeId, setActiveHotspotNodeId] = useState<string | null>(null);
  const hotspotCycleIndexRef = useRef<number>(0);
  const latestTopHotspotsRef = useRef<StressHotspotNodeItem[]>([]);
  const homeostaticPulsesCountRef = useRef<number>(0);
  const lastHomeostaticPulseMsRef = useRef<number>(0);
  const linkConductivityOverridesRef = useRef<Map<string, number>>(new Map());
  const homeostaticWaveOriginsRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);

  // Autonomous Aether Agent Swarms State
  const [aetherAgents, setAetherAgents] = useState<AetherAgent[]>([]);
  const [aetherPulses, setAetherPulses] = useState<AetherPulseEvent[]>([]);
  const aetherAgentsRef = useRef<AetherAgent[]>([]);
  const lastAetherStepMsRef = useRef<number>(performance.now());
  const effectiveAetherConfig = useMemo(() => aetherConfig || DEFAULT_AETHER_SWARM_CONFIG, [aetherConfig]);

  const tickCounterRef = useRef<number>(0);
  const lastTelemetryUpdateRef = useRef<number>(0);
  const [physicsTelemetry, setPhysicsTelemetry] = useState<PhysicsTelemetrySnapshot>({
    alpha: 0.8,
    alphaMin: 0.001,
    alphaDecay: DEFAULT_PHYSICS_DEBUG_CONFIG.alphaDecay,
    velocityDecay: DEFAULT_PHYSICS_DEBUG_CONFIG.velocityDecay,
    avgVelocity: 0,
    maxVelocity: 0,
    kineticEnergy: 0,
    avgLinkStrain: 0,
    avgConductivity: 0.82,
    pinnedCount: 0,
    nodeCount: 0,
    linkCount: 0,
    tickCount: 0,
    homeostaticPulsesCount: 0,
    topStressNodes: [],
    topBottleneckLinks: []
  });

  // Persistent map of continent centroids & user-pinned continent anchors
  const continentAnchorsRef = useRef<Map<string, { x: number; y: number; isUserPinned?: boolean }>>(new Map());
  // Persistent map of live node physics coordinates & user drag-pinned states to prevent spring-back snaps
  const nodePositionsRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number; fx: number | null; fy: number | null; isUserPinned?: boolean }>>(new Map());
  const latestConfigRef = useRef<ContinentPhysicsConfig>(continentConfig);
  latestConfigRef.current = continentConfig;

  const latestParadigmRef = useRef<DiagramParadigm>(diagramParadigm);
  latestParadigmRef.current = diagramParadigm;

  const colors = ['#0ea5e9', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Clear custom dragged anchors and pinned node coordinates when resetAnchorsTrigger increments
  useEffect(() => {
    if (resetAnchorsTrigger > 0) {
      continentAnchorsRef.current.clear();
      nodePositionsRef.current.forEach(pos => {
        pos.fx = null;
        pos.fy = null;
        pos.isUserPinned = false;
      });
      if (simulationRef.current) {
        simulationRef.current.nodes().forEach(n => {
          n.fx = null;
          n.fy = null;
        });
        simulationRef.current.alpha(0.75).restart();
      }
    }
  }, [resetAnchorsTrigger]);

  // 1. Compute Dominant Relationship Continent Assignment & Active Simulation Graph
  // Note: We clone node & link objects per Graph instance so Split-Screen Viewports A and B
  // can maintain independent (x, y, vx, vy) coordinates simultaneously without collision!
  const { activeGraphData, continentsMetadata } = useMemo(() => {
    const relScores = new Map<string, Map<string, number>>();
    data.nodes.forEach(n => {
      relScores.set(n.id, new Map<string, number>());
    });

    data.links.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : l.source.id;
      const tId = typeof l.target === 'string' ? l.target : l.target.id;
      const rel = (l.relationship || '').trim() || 'Enables';
      const weight = (l.strength || 0.7);

      if (relScores.has(sId)) {
        const map = relScores.get(sId)!;
        map.set(rel, (map.get(rel) || 0) + weight * 1.15);
      }
      if (relScores.has(tId)) {
        const map = relScores.get(tId)!;
        map.set(rel, (map.get(rel) || 0) + weight);
      }
    });

    const assignedMap = new Map<string, string>();
    const continentGroups = new Map<string, GraphNode[]>();

    // Clone nodes for instance isolation in Split-Screen Mode, preserve live simulation positions, and compute radius
    const clonedNodes: GraphNode[] = data.nodes.map(orig => {
      const savedPos = nodePositionsRef.current.get(orig.id);
      const computedRadius = orig.radius ?? (orig.isGhost ? 14 : Math.max(18, 26 - (orig.depth || 0) * 2));
      return {
        ...orig,
        label: sanitizeNodeLabel(orig.label),
        radius: computedRadius,
        x: savedPos ? savedPos.x : orig.x,
        y: savedPos ? savedPos.y : orig.y,
        vx: savedPos ? savedPos.vx : (orig.vx || 0),
        vy: savedPos ? savedPos.vy : (orig.vy || 0),
        fx: savedPos?.isUserPinned ? savedPos.fx : (orig.fx ?? null),
        fy: savedPos?.isUserPinned ? savedPos.fy : (orig.fy ?? null)
      };
    });

    clonedNodes.forEach(node => {
      const scores = relScores.get(node.id);
      let bestRel = '';
      let maxScore = -1;

      if (scores && scores.size > 0) {
        scores.forEach((score, rel) => {
          if (score > maxScore) {
            maxScore = score;
            bestRel = rel;
          }
        });
      }

      if (!bestRel) {
        bestRel = FALLBACK_ARCHETYPES[Math.abs(node.group || 0) % FALLBACK_ARCHETYPES.length];
      }

      node.continentId = bestRel;
      assignedMap.set(node.id, bestRel);

      if (!continentGroups.has(bestRel)) {
        continentGroups.set(bestRel, []);
      }
      continentGroups.get(bestRel)!.push(node);
    });

    const continentKeys = Array.from(continentGroups.keys()).sort();
    const { width, height } = dimensionsRef.current;
    const cxCenter = width > 0 ? width / 2 : 640;
    const cyCenter = height > 0 ? height / 2 : 420;
    const totalContinents = Math.max(1, continentKeys.length);

    const computedContinents: KnowledgeContinent[] = continentKeys.map((key, idx) => {
      const memberNodes = continentGroups.get(key) || [];
      const angle = (Math.PI * 2 * idx) / totalContinents - Math.PI / 2;
      const radialDist = totalContinents === 1 ? 0 : continentConfig.separation;

      const existingAnchor = continentAnchorsRef.current.get(key);
      const anchorX = existingAnchor?.isUserPinned
        ? existingAnchor.x
        : cxCenter + Math.cos(angle) * radialDist;
      const anchorY = existingAnchor?.isUserPinned
        ? existingAnchor.y
        : cyCenter + Math.sin(angle) * radialDist;

      continentAnchorsRef.current.set(key, {
        x: anchorX,
        y: anchorY,
        isUserPinned: existingAnchor?.isUserPinned
      });

      const aggregateMass = memberNodes.reduce((acc, n) => acc + (n.strength || 0.6), 0);
      const color = CONTINENT_PALETTE[key] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

      return {
        id: key,
        label: `${key} Continent`,
        dominantRelationship: key,
        color,
        nodeIds: memberNodes.map(n => n.id),
        nodeCount: memberNodes.length,
        aggregateMass,
        cx: anchorX,
        cy: anchorY,
        isCollapsed: continentConfig.collapsedContinentIds.includes(key)
      };
    });

    const collapsedSet = new Set(continentConfig.collapsedContinentIds);
    const activeNodes: GraphNode[] = [];

    computedContinents.forEach((cont, idx) => {
      if (collapsedSet.has(cont.id)) {
        const macroId = `__continent_macro__${cont.id}`;
        const macroNode: GraphNode = {
          id: macroId,
          label: `${cont.label} (${cont.nodeCount})`,
          group: idx,
          description: `Collapsed Knowledge Continent aggregating ${cont.nodeCount} nodes linked primarily via [${cont.dominantRelationship}] relationships.`,
          depth: 0,
          strength: Math.min(1, 0.7 + cont.nodeCount * 0.03),
          isExpanded: true,
          isGhost: false,
          continentId: cont.id,
          isMacroContinent: true,
          memberCount: cont.nodeCount,
          x: cont.cx,
          y: cont.cy
        };
        activeNodes.push(macroNode);
      } else {
        const members = continentGroups.get(cont.id) || [];
        members.forEach(m => activeNodes.push(m));
      }
    });

    const activeNodeIdSet = new Set(activeNodes.map(n => n.id));
    const activeLinks: GraphLink[] = [];
    const seenLinkKeys = new Set<string>();

    data.links.forEach(l => {
      const rawS = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
      const rawT = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
      if (!rawS || !rawT) return;

      const sCont = assignedMap.get(rawS);
      const tCont = assignedMap.get(rawT);

      const finalS = sCont && collapsedSet.has(sCont) ? `__continent_macro__${sCont}` : rawS;
      const finalT = tCont && collapsedSet.has(tCont) ? `__continent_macro__${tCont}` : rawT;

      if (finalS === finalT) return;
      if (!activeNodeIdSet.has(finalS) || !activeNodeIdSet.has(finalT)) return;

      const linkKey = finalS < finalT ? `${finalS}__${finalT}` : `${finalT}__${finalS}`;
      if (seenLinkKeys.has(linkKey)) return;
      seenLinkKeys.add(linkKey);

      const overrideCond = linkConductivityOverridesRef.current.get(linkKey);
      activeLinks.push({
        source: finalS,
        target: finalT,
        relationship: l.relationship,
        strength: l.strength,
        conductivity: overrideCond ?? l.conductivity
      });
    });

    return {
      activeGraphData: { nodes: activeNodes, links: activeLinks },
      continentsMetadata: computedContinents
    };
  }, [data, continentConfig.separation, continentConfig.collapsedContinentIds, resetAnchorsTrigger]);

  // Notify parent when continents change
  useEffect(() => {
    if (onContinentsUpdated) {
      onContinentsUpdated(continentsMetadata);
    }
  }, [continentsMetadata, onContinentsUpdated]);

  // Reheat simulation when continent physics sliders, diagram paradigm, or spatial pattern change
  useEffect(() => {
    if (!simulationRef.current) return;
    const simulation = simulationRef.current;
    simulation.alpha(0.85).restart();
  }, [continentConfig.enabled, continentConfig.gravity, continentConfig.separation, diagramParadigm, activeSpatialPattern, spatialAnchorNodeId]);

  // Reheat simulation when active graph nodes or edges are injected in real-time for spring interpolation
  useEffect(() => {
    if (!simulationRef.current) return;
    simulationRef.current.alpha(0.95).restart();
  }, [activeGraphData.nodes.length, activeGraphData.links.length]);

  // Initialize SVG, D3 Simulation, and Zoom
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        dimensionsRef.current = { width, height };
        
        if (simulationRef.current) {
          simulationRef.current.alpha(0.4).restart();
        }
      }
    });

    observer.observe(svgRef.current.parentElement!);

    const simulation = d3.forceSimulation<GraphNode>()
      .alphaDecay(0.015)   // Gentler, more gradual settling phase
      .velocityDecay(0.4); // Higher velocity damping removes high-frequency jitter
    simulationRef.current = simulation;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 10])
      .on('zoom', (event) => {
        d3.select(containerRef.current).attr('transform', event.transform);
        const k = event.transform.k;
        setViewportTransform({ k: event.transform.k, x: event.transform.x, y: event.transform.y });
        d3.select(containerRef.current).selectAll('.node-label').style('opacity', k > 0.28 ? 1 : 0);
        d3.select(containerRef.current).selectAll('.continent-beacon-group').style('opacity', k > 0.15 ? 1 : 0.4);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    svg.on('mousemove', (event) => {
      if (!onHoverCoordinates || !containerRef.current) return;
      const [mx, my] = d3.pointer(event, containerRef.current);
      onHoverCoordinates({ x: mx, y: my });
    });
    svg.on('mouseleave', () => {
      if (onHoverCoordinates) onHoverCoordinates(null);
    });

    // Filters & Defs
    const defs = svg.select('defs');
    if (defs.empty()) {
      const d = svg.append('defs');
      const filter = d.append('filter').attr('id', 'omega-glow');
      filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
      const merge = filter.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');

      const neonFilter = d.append('filter')
        .attr('id', 'radiant-neon-glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      neonFilter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'blur1');
      neonFilter.append('feGaussianBlur').attr('stdDeviation', '14').attr('result', 'blur2');
      const neonMerge = neonFilter.append('feMerge');
      neonMerge.append('feMergeNode').attr('in', 'blur2');
      neonMerge.append('feMergeNode').attr('in', 'blur1');
      neonMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      const grad = d.append('linearGradient').attr('id', 'link-grad');
      grad.append('stop').attr('offset', '0%').attr('stop-color', '#0ea5e9');
      grad.append('stop').attr('offset', '100%').attr('stop-color', '#8b5cf6');

      const radGrad = d.append('linearGradient').attr('id', 'radiant-link-grad');
      radGrad.append('stop').attr('offset', '0%').attr('stop-color', '#00f0ff');
      radGrad.append('stop').attr('offset', '50%').attr('stop-color', '#38bdf8');
      radGrad.append('stop').attr('offset', '100%').attr('stop-color', '#00f0ff');
    }

    return () => { 
      simulation.stop();
      observer.disconnect();
    };
  }, []);

  // Smooth Camera Centering when node Jump-Focus is triggered
  useEffect(() => {
    if (!focusTrigger?.nodeId || !svgRef.current || !zoomRef.current) return;
    const targetNode = activeGraphData.nodes.find(n => n.id === focusTrigger.nodeId);
    if (!targetNode) return;

    const centerCamera = () => {
      if (typeof targetNode.x !== 'number' || typeof targetNode.y !== 'number') return;
      const { width, height } = dimensionsRef.current;
      if (width <= 0 || height <= 0) return;

      const svg = d3.select(svgRef.current);
      const targetScale = 1.35;
      const tx = width / 2 - targetNode.x * targetScale;
      const ty = height / 2 - targetNode.y * targetScale;

      svg.transition()
        .duration(850)
        .ease(d3.easeCubicOut)
        .call(
          zoomRef.current!.transform,
          d3.zoomIdentity.translate(tx, ty).scale(targetScale)
        );
    };

    if (typeof targetNode.x === 'number' && typeof targetNode.y === 'number') {
      centerCamera();
    } else {
      const timer = setTimeout(centerCamera, 120);
      return () => clearTimeout(timer);
    }
  }, [focusTrigger, activeGraphData.nodes]);

  // Smooth Camera Fly-Zoom when a Knowledge Continent is focused
  useEffect(() => {
    if (!continentFocusTrigger?.continentId || !svgRef.current || !zoomRef.current) return;
    const cid = continentFocusTrigger.continentId;
    const memberNodes = activeGraphData.nodes.filter(
      n => n.continentId === cid && typeof n.x === 'number' && typeof n.y === 'number'
    );
    if (memberNodes.length === 0) return;

    const { width, height } = dimensionsRef.current;
    if (width <= 0 || height <= 0) return;

    const xs = memberNodes.map(n => n.x as number);
    const ys = memberNodes.map(n => n.y as number);
    const minX = Math.min(...xs) - 140;
    const maxX = Math.max(...xs) + 140;
    const minY = Math.min(...ys) - 140;
    const maxY = Math.max(...ys) + 140;

    const boxW = Math.max(260, maxX - minX);
    const boxH = Math.max(260, maxY - minY);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const scale = Math.max(0.35, Math.min(1.45, 0.78 / Math.max(boxW / width, boxH / height)));
    const tx = width / 2 - midX * scale;
    const ty = height / 2 - midY * scale;

    d3.select(svgRef.current)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale)
      );
  }, [continentFocusTrigger, activeGraphData.nodes]);

  // Main D3 Rendering, Continent Physics & Multi-Diagram Paradigm Morphing Loop
  useEffect(() => {
    if (!simulationRef.current || !containerRef.current) return;
    const simulation = simulationRef.current;
    const container = d3.select(containerRef.current);

    // Ensure ordered layer groups exist inside container
    let guidesLayer = container.select<SVGGElement>('.paradigm-guides-layer');
    if (guidesLayer.empty()) {
      guidesLayer = container.append('g').attr('class', 'paradigm-guides-layer');
    }
    let continentsLayer = container.select<SVGGElement>('.continents-layer');
    if (continentsLayer.empty()) {
      continentsLayer = container.append('g').attr('class', 'continents-layer');
    }
    let causalTraceLayer = container.select<SVGGElement>('.causal-trace-layer');
    if (causalTraceLayer.empty()) {
      causalTraceLayer = container.append('g').attr('class', 'causal-trace-layer');
    }
    let linksLayer = container.select<SVGGElement>('.links-layer');
    if (linksLayer.empty()) {
      linksLayer = container.append('g').attr('class', 'links-layer');
    }
    let nodesLayer = container.select<SVGGElement>('.nodes-layer');
    if (nodesLayer.empty()) {
      nodesLayer = container.append('g').attr('class', 'nodes-layer');
    }
    let causalParticlesLayer = container.select<SVGGElement>('.causal-particles-layer');
    if (causalParticlesLayer.empty()) {
      causalParticlesLayer = container.append('g').attr('class', 'causal-particles-layer');
    }
    let beaconsLayer = container.select<SVGGElement>('.continent-beacons-layer');
    if (beaconsLayer.empty()) {
      beaconsLayer = container.append('g').attr('class', 'continent-beacons-layer');
    }
    let chemoLayer = container.select<SVGGElement>('.chemotactic-beacons-layer');
    if (chemoLayer.empty()) {
      chemoLayer = container.append('g').attr('class', 'chemotactic-beacons-layer');
    }
    let physicsDebugLayer = container.select<SVGGElement>('.physics-debug-layer');
    if (physicsDebugLayer.empty()) {
      physicsDebugLayer = container.append('g').attr('class', 'physics-debug-layer pointer-events-none');
    }

    const { width, height } = dimensionsRef.current;
    const isForceMode = diagramParadigm === 'FORCE_CONTINENTS';

    // Compute mathematical diagram projection if in a non-force diagram paradigm
    const projection = computeDiagramProjection(
      activeGraphData.nodes,
      activeGraphData.links,
      continentsMetadata,
      width,
      height,
      diagramParadigm as DiagramParadigm
    );

    simulation.nodes(activeGraphData.nodes);

    // Defense-in-depth: Ensure links passed to d3.forceLink strictly connect nodes present in simulation.nodes()
    const simNodeIdSet = new Set(activeGraphData.nodes.map(n => n.id));
    const safeSimulationLinks = activeGraphData.links.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
      return s && t && simNodeIdSet.has(s) && simNodeIdSet.has(t);
    });

    // Synchronize with off-main-thread WebGPU / Web Worker physics engine
    physicsEngine.init(activeGraphData.nodes, safeSimulationLinks, width, height, {
      repulsion: -600,
      friction: 0.88,
      centerStrength: 0.05
    });
    setEngineStatus(physicsEngine.getStatus());

    // Compute centrality spatial pattern projection if an automated spatial pattern is requested
    const isSpatialActive = activeSpatialPattern !== 'FORCE_DEFAULT';
    const spatialProjection = isSpatialActive
      ? computeCentralitySpatialProjection(
          activeSpatialPattern as SpatialPatternType,
          activeGraphData.nodes,
          activeGraphData.links,
          spatialAnchorNodeId || focusedNodeId || null,
          width,
          height
        )
      : null;

    if (isForceMode && !isSpatialActive) {
      // Preserve coordinates for user-pinned or macro-continent nodes; release others
      activeGraphData.nodes.forEach(n => {
        const saved = nodePositionsRef.current.get(n.id);
        if (!n.isMacroContinent && n.id !== pinnedNodeId && !saved?.isUserPinned) {
          n.fx = null;
          n.fy = null;
        } else if (n.id === pinnedNodeId && typeof n.x === 'number' && typeof n.y === 'number') {
          n.fx = n.x;
          n.fy = n.y;
        }
      });

      const dbg = physicsDebugConfigRef.current;
      const springForceLink = d3.forceLink<GraphNode, GraphLink>(safeSimulationLinks)
        .id(d => d.id)
        .distance(dbg.linkDistance);
      configureSpringTensorForces(
        springForceLink,
        centralityMap,
        latestConfigRef.current.separation,
        latestConfigRef.current.enabled
      );
      if (!dbg.linkEnabled) {
        springForceLink.strength(0);
      } else if (dbg.linkStrengthMultiplier !== 1.0) {
        const baseStrengthFn = springForceLink.strength();
        springForceLink.strength((link, i, links) =>
          baseStrengthFn(link, i, links) * dbg.linkStrengthMultiplier
        );
      }

      simulation
        .alphaDecay(dbg.alphaDecay)     // Gentler, more gradual settling phase (default 0.015)
        .velocityDecay(dbg.velocityDecay) // Higher velocity damping removes high-frequency jitter (default 0.4)
        .force('link', springForceLink)
        .force(
          'charge',
          dbg.chargeEnabled
            ? d3.forceManyBody<GraphNode>()
                .theta(0.8)
                .distanceMax(850)
                .strength(dbg.chargeStrength)
            : null
        )
        .force(
          'collision',
          dbg.collisionEnabled
            ? d3.forceCollide<GraphNode>()
                .radius(d => (d.radius || 20) + dbg.collisionRadiusOffset)
                .strength(dbg.collisionStrength)
            : null
        )
        .force('center', dbg.centerEnabled ? d3.forceCenter(width / 2, height / 2) : null)
        .force('paradigmMorph', null)
        .force('spatialRadial', null)
        .force('spatialX', null)
        .force('spatialY', null);

      const continentForce = (alpha: number) => {
        const cfg = latestConfigRef.current;
        if (!cfg.enabled) return;

        const cxCenter = width > 0 ? width / 2 : 640;
        const cyCenter = height > 0 ? height / 2 : 420;
        const total = Math.max(1, continentsMetadata.length);

        continentsMetadata.forEach((cont, idx) => {
          const stored = continentAnchorsRef.current.get(cont.id);
          if (!stored?.isUserPinned) {
            const angle = (Math.PI * 2 * idx) / total - Math.PI / 2;
            const dist = total === 1 ? 0 : cfg.separation;
            continentAnchorsRef.current.set(cont.id, {
              x: cxCenter + Math.cos(angle) * dist,
              y: cyCenter + Math.sin(angle) * dist,
              isUserPinned: false
            });
          }
        });

        const pullStrength = cfg.gravity * 0.36 * alpha;
        activeGraphData.nodes.forEach(node => {
          if (!node.continentId) return;
          const anchor = continentAnchorsRef.current.get(node.continentId);
          if (!anchor) return;

          if (node.isMacroContinent) {
            node.fx = anchor.x;
            node.fy = anchor.y;
            return;
          }

          const dx = anchor.x - (node.x || cxCenter);
          const dy = anchor.y - (node.y || cyCenter);
          node.vx = (node.vx || 0) + dx * pullStrength;
          node.vy = (node.vy || 0) + dy * pullStrength;
        });
      };

      simulation.force('continents', continentForce);
    } else if (isSpatialActive && spatialProjection) {
      // D3 Force Reorganization into Specific Spatial Patterns (Radial, Tree, Grid, Spiral, Bipartite)
      // Release fixed positions unless explicitly pinned
      activeGraphData.nodes.forEach(n => {
        if (n.id !== pinnedNodeId) {
          n.fx = null;
          n.fy = null;
        }
      });

      // Pin anchor node at center if Radial or Spiral
      if (spatialProjection.anchorNodeId && (activeSpatialPattern === 'CENTRALITY_RADIAL' || activeSpatialPattern === 'CENTRALITY_SPIRAL')) {
        const anchorNodeObj = activeGraphData.nodes.find(n => n.id === spatialProjection.anchorNodeId);
        if (anchorNodeObj) {
          anchorNodeObj.fx = width / 2;
          anchorNodeObj.fy = height / 2;
        }
      }

      simulation
        .force(
          'link',
          d3.forceLink<GraphNode, GraphLink>(safeSimulationLinks)
            .id(d => d.id)
            .distance(d => {
              const s = d.source as GraphNode;
              const t = d.target as GraphNode;
              const sameContinent = s.continentId && s.continentId === t.continentId;
              return sameContinent ? 110 : 180;
            })
            .strength(activeSpatialPattern === 'CENTRALITY_TREE' ? 0.35 : 0.15)
        )
        .force(
          'charge',
          d3.forceManyBody<GraphNode>()
            .theta(0.8)
            .distanceMax(600)
            .strength(-180)
        )
        .force(
          'collision',
          d3.forceCollide<GraphNode>()
            .radius(d => (d.radius || 20) + 12)
            .strength(0.85)
        )
        .force('center', null)
        .force('continents', null)
        .force('paradigmMorph', null);

      if (activeSpatialPattern === 'CENTRALITY_RADIAL') {
        simulation
          .force(
            'spatialRadial',
            d3.forceRadial<GraphNode>(
              d => spatialProjection.nodeTargets.get(d.id)?.targetR ?? 0,
              width / 2,
              height / 2
            ).strength(0.88)
          )
          .force('spatialX', null)
          .force('spatialY', null);
      } else {
        simulation
          .force('spatialRadial', null)
          .force(
            'spatialX',
            d3.forceX<GraphNode>(d => spatialProjection.nodeTargets.get(d.id)?.x ?? width / 2).strength(0.82)
          )
          .force(
            'spatialY',
            d3.forceY<GraphNode>(d => spatialProjection.nodeTargets.get(d.id)?.y ?? height / 2).strength(0.82)
          );
      }
    } else {
      // Deterministic Mathematical Diagram Morphing Mode
      // Keep links bound so source/target references are resolved to GraphNode objects
      simulation
        .force(
          'link',
          d3.forceLink<GraphNode, GraphLink>(safeSimulationLinks)
            .id(d => d.id)
            .strength(0)
        )
        .force('charge', null)
        .force('collision', null)
        .force('center', null)
        .force('continents', null)
        .force('spatialRadial', null)
        .force('spatialX', null)
        .force('spatialY', null)
        .force('paradigmMorph', (alpha: number) => {
          const morphRate = Math.min(0.45, 0.28 + alpha * 0.25);
          activeGraphData.nodes.forEach(node => {
            const target = projection.nodeTargets.get(node.id);
            if (!target) return;
            node.fx = null;
            node.fy = null;
            const currX = typeof node.x === 'number' ? node.x : width / 2;
            const currY = typeof node.y === 'number' ? node.y : height / 2;
            node.vx = ((target.x - currX) * morphRate);
            node.vy = ((target.y - currY) * morphRate);
          });
        });
    }

    const activeFocusId = sharedHoveredNodeId || focusedNodeId;
    const isAnyFocused = !!activeFocusId;
    const isolatedId = continentConfig.isolatedContinentId;

    // --- 0. PARADIGM & SPATIAL STRUCTURAL GUIDES RENDERING (Voronoi cells, Chord arcs, Radial rings, DAG lanes, Sankey bars, Spatial grids) ---
    const allGuides: DiagramGuideElement[] = [
      ...projection.guides,
      ...(spatialProjection?.guides || []).map(sg => ({
        ...sg,
        continentId: undefined
      } as DiagramGuideElement))
    ];

    let guideGroups = guidesLayer
      .selectAll<SVGGElement, DiagramGuideElement>('.paradigm-guide-item')
      .data(allGuides, d => d.id);

    guideGroups.exit().remove();

    const guideEnter = guideGroups.enter()
      .append('g')
      .attr('class', 'paradigm-guide-item')
      .style('pointer-events', 'none');

    guideGroups = guideEnter.merge(guideGroups);

    guideGroups.each(function(gData) {
      const g = d3.select(this);
      g.selectAll('*').remove();

      const dimFactor = isolatedId && gData.continentId && gData.continentId !== isolatedId ? 0.15 : 1;

      if (gData.type === 'path' && gData.d) {
        g.append('path')
          .attr('d', gData.d)
          .attr('stroke', gData.stroke)
          .attr('stroke-width', gData.strokeWidth)
          .attr('stroke-dasharray', gData.strokeDasharray || null)
          .attr('stroke-opacity', gData.strokeOpacity * dimFactor)
          .attr('fill', gData.fill)
          .attr('fill-opacity', gData.fillOpacity * dimFactor);
      } else if (gData.type === 'circle') {
        g.append('circle')
          .attr('cx', gData.cx || 0)
          .attr('cy', gData.cy || 0)
          .attr('r', gData.r || 0)
          .attr('stroke', gData.stroke)
          .attr('stroke-width', gData.strokeWidth)
          .attr('stroke-dasharray', gData.strokeDasharray || null)
          .attr('stroke-opacity', gData.strokeOpacity * dimFactor)
          .attr('fill', gData.fill)
          .attr('fill-opacity', gData.fillOpacity * dimFactor);
      } else if (gData.type === 'rect') {
        g.append('rect')
          .attr('x', gData.x || 0)
          .attr('y', gData.y || 0)
          .attr('width', gData.width || 0)
          .attr('height', gData.height || 0)
          .attr('rx', gData.rx || 0)
          .attr('stroke', gData.stroke)
          .attr('stroke-width', gData.strokeWidth)
          .attr('stroke-dasharray', gData.strokeDasharray || null)
          .attr('stroke-opacity', gData.strokeOpacity * dimFactor)
          .attr('fill', gData.fill)
          .attr('fill-opacity', gData.fillOpacity * dimFactor);
      } else if (gData.type === 'line') {
        g.append('line')
          .attr('x1', gData.x1 || 0)
          .attr('y1', gData.y1 || 0)
          .attr('x2', gData.x2 || 0)
          .attr('y2', gData.y2 || 0)
          .attr('stroke', gData.stroke)
          .attr('stroke-width', gData.strokeWidth)
          .attr('stroke-dasharray', gData.strokeDasharray || null)
          .attr('stroke-opacity', gData.strokeOpacity * dimFactor);
      }

      if (gData.label && typeof gData.labelX === 'number' && typeof gData.labelY === 'number') {
        g.append('text')
          .attr('x', gData.labelX)
          .attr('y', gData.labelY)
          .attr('text-anchor', 'middle')
          .attr('fill', gData.stroke === '#1e293b' ? '#94a3b8' : gData.stroke)
          .attr('font-family', 'monospace')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .attr('letter-spacing', '0.08em')
          .attr('opacity', 0.85 * dimFactor)
          .text(gData.label);
      }
    });

    // --- 1. TOPOGRAPHIC CONTINENT HULLS RENDERING (Only in FORCE_CONTINENTS mode) ---
    const visibleContinents = isForceMode && continentConfig.enabled
      ? continentsMetadata.filter(c => !c.isCollapsed)
      : [];

    let hullGroups = continentsLayer
      .selectAll<SVGGElement, KnowledgeContinent>('.continent-hull-group')
      .data(visibleContinents, d => d.id);

    hullGroups.exit().remove();

    const hullEnter = hullGroups.enter()
      .append('g')
      .attr('class', 'continent-hull-group')
      .style('cursor', 'grab');

    hullEnter.append('path')
      .attr('class', 'continent-outer-hull')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '8,5')
      .style('transition', 'opacity 200ms ease');

    hullEnter.append('path')
      .attr('class', 'continent-inner-hull')
      .attr('stroke-width', 1.25)
      .style('transition', 'opacity 200ms ease');

    hullGroups = hullEnter.merge(hullGroups);

    hullGroups.call(
      d3.drag<SVGGElement, KnowledgeContinent>()
        .on('start', function(event) {
          if (!event.active) simulation.alphaTarget(0.25).restart();
          d3.select(this).style('cursor', 'grabbing');
        })
        .on('drag', (event, d) => {
          const anchor = continentAnchorsRef.current.get(d.id);
          if (anchor) {
            anchor.x += event.dx;
            anchor.y += event.dy;
            anchor.isUserPinned = true;
          }
          activeGraphData.nodes.forEach(n => {
            if (n.continentId === d.id) {
              n.x = (n.x || 0) + event.dx;
              n.y = (n.y || 0) + event.dy;
              if (n.fx != null) n.fx += event.dx;
              if (n.fy != null) n.fy += event.dy;
            }
          });
        })
        .on('end', function(event) {
          if (!event.active) simulation.alphaTarget(0);
          d3.select(this).style('cursor', 'grab');
        })
    );

    hullGroups.select('.continent-outer-hull')
      .attr('fill', d => d.color)
      .attr('stroke', d => d.color)
      .attr('fill-opacity', d => {
        const dim = isolatedId && isolatedId !== d.id ? 0.15 : 1;
        return 0.06 * continentConfig.hullOpacity * dim;
      })
      .attr('stroke-opacity', d => {
        const dim = isolatedId && isolatedId !== d.id ? 0.15 : 1;
        return 0.42 * continentConfig.hullOpacity * dim;
      });

    hullGroups.select('.continent-inner-hull')
      .attr('fill', d => d.color)
      .attr('stroke', d => d.color)
      .attr('fill-opacity', d => {
        const dim = isolatedId && isolatedId !== d.id ? 0.15 : 1;
        return 0.09 * continentConfig.hullOpacity * dim;
      })
      .attr('stroke-opacity', d => {
        const dim = isolatedId && isolatedId !== d.id ? 0.15 : 1;
        return 0.65 * continentConfig.hullOpacity * dim;
      });

    // --- 2. LINKS RENDERING (Unified SVG <path> supporting straight, radial, chord, DAG, and Sankey ribbons) ---
    let link = linksLayer.selectAll<SVGPathElement, GraphLink>('.link-path')
      .data(activeGraphData.links, d => `${(d.source as any).id || d.source}-${(d.target as any).id || d.target}`);

    link.exit().remove();
    const linkEnter = link.enter().append('path')
      .attr('class', 'link-path')
      .attr('fill', 'none')
      .attr('stroke', 'url(#link-grad)')
      .attr('stroke-linecap', 'round');

    link = linkEnter.merge(link);

    link
      .attr('stroke', d => {
        const sId = (d.source as any).id || d.source;
        const tId = (d.target as any).id || d.target;
        const isConnected = isAnyFocused && (sId === activeFocusId || tId === activeFocusId);
        if (isConnected) return 'url(#radiant-link-grad)';
        const proj = projection.links.get(`${sId}-${tId}`);
        if (!isForceMode && proj?.stroke) return proj.stroke;
        return 'url(#link-grad)';
      })
      .attr('stroke-width', d => {
        const sId = (d.source as any).id || d.source;
        const tId = (d.target as any).id || d.target;
        const isConnected = isAnyFocused && (sId === activeFocusId || tId === activeFocusId);
        const proj = projection.links.get(`${sId}-${tId}`);
        if (!isForceMode && proj?.isRibbon) {
          return isConnected ? proj.strokeWidth * 1.25 : proj.strokeWidth;
        }
        if (isConnected) return 5.5;
        const cond = d.conductivity ?? 0.82;
        const condMultiplier = 0.55 + cond * 0.55;
        const base = (proj?.strokeWidth || Math.max(1.8, (d.strength || 0.5) * 3.8)) * condMultiplier;
        return isAnyFocused ? Math.max(1.2, base * 0.75) : base;
      })
      .attr('stroke-dasharray', d => {
        if (diagramParadigm === 'SANKEY_FLOW' || diagramParadigm === 'CHORD_WHEEL') return null;
        return (d.source as any).isGhost || (d.target as any).isGhost ? '4,4' : '10,5';
      })
      .attr('stroke-opacity', d => {
        const sNode = d.source as GraphNode;
        const tNode = d.target as GraphNode;
        const sId = sNode.id || (d.source as string);
        const tId = tNode.id || (d.target as string);
        const isConnected = isAnyFocused && (sId === activeFocusId || tId === activeFocusId);
        if (diagramParadigm === 'SANKEY_FLOW') {
          if (isConnected) return 0.72;
          return isAnyFocused ? 0.1 : 0.34;
        }
        if (isConnected) return 1.0;
        if (isolatedId && sNode.continentId !== isolatedId && tNode.continentId !== isolatedId) {
          return 0.08;
        }
        const cond = d.conductivity ?? 0.82;
        const condFactor = Math.max(0.25, Math.min(1.0, 0.35 + cond * 0.65));
        return (isAnyFocused ? 0.15 : 0.72) * condFactor;
      })
      .style('filter', d => {
        const sId = (d.source as any).id || d.source;
        const tId = (d.target as any).id || d.target;
        const isConnected = isAnyFocused && (sId === activeFocusId || tId === activeFocusId);
        return isConnected 
          ? 'drop-shadow(0 0 10px #00f0ff) drop-shadow(0 0 20px rgba(0,240,255,0.85))' 
          : 'drop-shadow(0 0 4px rgba(14,165,233,0.35))';
      });

    // Link Relationship Badges
    let linkLabels = linksLayer.selectAll<SVGGElement, GraphLink>('.link-label-group')
      .data(activeGraphData.links.filter(l => l.relationship), d => `${(d.source as any).id || d.source}-${(d.target as any).id || d.target}`);

    linkLabels.exit().remove();
    const linkLabelEnter = linkLabels.enter().append('g')
      .attr('class', 'link-label-group')
      .style('pointer-events', 'none');

    linkLabelEnter.append('rect')
      .attr('class', 'link-label-bg')
      .attr('fill', '#020617')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1.2)
      .attr('rx', 4)
      .attr('height', 14);

    linkLabelEnter.append('text')
      .attr('class', 'link-label-text')
      .attr('text-anchor', 'middle')
      .attr('dy', 10.5)
      .attr('fill', '#e0f2fe')
      .attr('font-size', '8px')
      .attr('font-weight', '900')
      .attr('letter-spacing', '0.05em')
      .text(d => d.relationship || '');

    linkLabelEnter.select('rect')
      .attr('width', function() {
        const textNode = (this.parentNode as SVGGElement).querySelector('.link-label-text') as SVGTextElement;
        return (textNode?.getComputedTextLength?.() || 40) + 12;
      })
      .attr('x', function() {
        const w = parseFloat((this as SVGRectElement).getAttribute('width') || '40');
        return -w / 2;
      });

    linkLabels = linkLabelEnter.merge(linkLabels);

    linkLabels
      .style('opacity', d => {
        const sNode = d.source as GraphNode;
        const tNode = d.target as GraphNode;
        const sId = sNode.id || (d.source as string);
        const tId = tNode.id || (d.target as string);
        const isConnected = isAnyFocused && (sId === activeFocusId || tId === activeFocusId);
        if (isConnected) return 1;
        if (diagramParadigm === 'CHORD_WHEEL') return 0.35;
        if (isolatedId && sNode.continentId !== isolatedId && tNode.continentId !== isolatedId) {
          return 0.08;
        }
        return isAnyFocused ? 0.15 : 0.85;
      });

    // --- 3. NODES RENDERING ---
    let node = nodesLayer.selectAll<SVGGElement, GraphNode>('.node-group')
      .data(activeGraphData.nodes, d => d.id);

    node.exit().remove();
    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'node-group')
      .on('mouseenter', (_event, d) => {
        if (onHoverNode) onHoverNode(d.id);
      })
      .on('mouseleave', () => {
        if (onHoverNode) onHoverNode(null);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        if (d.isMacroContinent && d.continentId && onToggleCollapseContinent) {
          onToggleCollapseContinent(d.continentId);
          return;
        }

        // Hebbian Plasticity: Strengthen incident synapses on activation
        activeGraphData.links.forEach(l => {
          const sId = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
          const tId = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
          if (sId === d.id || tId === d.id) {
            const currentCond = typeof l.conductivity === 'number' ? l.conductivity : 0.65;
            l.conductivity = Math.min(1.0, currentCond + 0.12);
            (l as any).lastTraversedMs = performance.now();
            if (sId && tId) {
              const lKey = sId < tId ? `${sId}__${tId}` : `${tId}__${sId}`;
              linkConductivityOverridesRef.current.set(lKey, l.conductivity);
              if (onReinforceEdge) onReinforceEdge(sId, tId);
            }
          }
        });

        onNodeClick(d);
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        const saved = nodePositionsRef.current.get(d.id);
        if (saved?.isUserPinned || d.fx != null || d.fy != null) {
          d.fx = null;
          d.fy = null;
          if (saved) {
            saved.fx = null;
            saved.fy = null;
            saved.isUserPinned = false;
          }
          simulation.alpha(0.3).restart();
        }
        if (onTogglePin && !d.isMacroContinent) {
          onTogglePin(d);
        }
      })
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.25).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          const pad = 40;
          const w = dimensionsRef.current.width || 1200;
          const h = dimensionsRef.current.height || 800;
          const clampedX = Math.max(pad, Math.min(Math.max(pad + 10, w - pad), event.x));
          const clampedY = Math.max(pad, Math.min(Math.max(pad + 10, h - pad), event.y));

          d.fx = clampedX;
          d.fy = clampedY;
          d.x = clampedX;
          d.y = clampedY;

          nodePositionsRef.current.set(d.id, {
            x: clampedX,
            y: clampedY,
            vx: 0,
            vy: 0,
            fx: clampedX,
            fy: clampedY,
            isUserPinned: true
          });

          if (d.isMacroContinent && d.continentId) {
            continentAnchorsRef.current.set(d.continentId, {
              x: clampedX,
              y: clampedY,
              isUserPinned: true
            });
          }
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          const saved = nodePositionsRef.current.get(d.id);
          if (saved?.isUserPinned || d.id === pinnedNodeId || d.isMacroContinent) {
            d.fx = d.x;
            d.fy = d.y;
          } else {
            d.fx = null;
            d.fy = null;
          }
        })
      );

    // Radiant Neon Pulse Ring 1
    nodeEnter.append('circle')
      .attr('class', 'radiant-pulse-outer')
      .attr('r', 32)
      .attr('fill', 'none')
      .attr('stroke', '#00f0ff')
      .attr('stroke-width', 3)
      .style('pointer-events', 'none')
      .style('display', 'none')
      .style('filter', 'drop-shadow(0 0 12px #00f0ff)');

    // Radiant Neon Pulse Ring 2
    nodeEnter.append('circle')
      .attr('class', 'radiant-pulse-inner')
      .attr('r', 44)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 2.5)
      .style('pointer-events', 'none')
      .style('display', 'none')
      .style('filter', 'drop-shadow(0 0 8px #38bdf8)');

    // Radiant HUD Brackets
    const targetBracketGroup = nodeEnter.append('g')
      .attr('class', 'radiant-target-brackets')
      .style('pointer-events', 'none')
      .style('display', 'none');

    [
      [-42, -42, 14, 0, 0, 14],
      [42, -42, -14, 0, 0, 14],
      [-42, 42, 14, 0, 0, -14],
      [42, 42, -14, 0, 0, -14]
    ].forEach(([cxB, cyB, dxB, , , dyB]) => {
      targetBracketGroup.append('path')
        .attr('d', `M ${cxB + dxB} ${cyB} L ${cxB} ${cyB} L ${cxB} ${cyB + dyB}`)
        .attr('stroke', '#00f0ff')
        .attr('stroke-width', 2.5)
        .attr('fill', 'none')
        .style('filter', 'drop-shadow(0 0 8px #00f0ff)');
    });

    // Aura
    nodeEnter.append('circle')
      .attr('class', 'aura')
      .attr('r', d => d.isMacroContinent ? 85 : 52 - d.depth * 2)
      .attr('fill', d => (d.continentId && CONTINENT_PALETTE[d.continentId]) || colors[d.group % colors.length])
      .attr('opacity', 0.14)
      .attr('filter', 'blur(10px)');

    // Outer High-Contrast Ring
    nodeEnter.append('circle')
      .attr('class', 'contrast-ring')
      .attr('r', d => d.isMacroContinent ? 54 : (d.isGhost ? 14 : 32 - d.depth * 2))
      .attr('fill', 'none')
      .attr('stroke', d => (d.continentId && CONTINENT_PALETTE[d.continentId]) || '#38bdf8')
      .attr('stroke-width', d => d.isMacroContinent ? 2.5 : 1.5)
      .attr('stroke-dasharray', d => d.isMacroContinent ? '8,4' : (d.isGhost ? '3,3' : 'none'))
      .attr('opacity', 0.75);

    // Inner Core
    nodeEnter.append('circle')
      .attr('class', 'core')
      .attr('r', d => d.isMacroContinent ? 42 : (d.isGhost ? 9 : 26 - d.depth * 2))
      .attr('fill', d => {
        if (d.isGhost) return '#020617';
        return (d.continentId && CONTINENT_PALETTE[d.continentId]) || colors[d.group % colors.length];
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5)
      .style('cursor', 'pointer')
      .style('filter', 'url(#omega-glow)');

    // ID / Continent Tag Marker
    nodeEnter.append('text')
      .attr('class', 'id-marker font-mono')
      .attr('dy', d => d.isMacroContinent ? -62 : (d.isGhost ? -18 : -38))
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '7px')
      .attr('font-weight', '900')
      .style('pointer-events', 'none')
      .text(d => d.isMacroContinent ? `[MACRO CONTINENT · CLICK TO EXPAND]` : `[${(d.continentId || 'NODE').toUpperCase()}]`);

    // Label Background
    nodeEnter.append('rect')
      .attr('class', 'label-bg')
      .attr('fill', '#020617')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1.5)
      .attr('rx', 6)
      .attr('height', 20)
      .style('filter', 'drop-shadow(0 0 10px rgba(0,0,0,0.9))');

    // Label
    nodeEnter.append('text')
      .attr('class', 'node-label')
      .attr('dy', d => d.isMacroContinent ? 74 : (d.isGhost ? 36 : 56))
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-weight', '900')
      .attr('font-size', '12px')
      .style('pointer-events', 'none')
      .text(d => d.label);

    nodeEnter.select('.label-bg')
      .attr('y', d => d.isMacroContinent ? 60 : (d.isGhost ? 22 : 42))
      .attr('width', function() {
        const textNode = (this.parentNode as SVGGElement).querySelector('.node-label') as SVGTextElement;
        return (textNode?.getComputedTextLength?.() || 50) + 16;
      })
      .attr('x', function() {
        const w = parseFloat((this as SVGRectElement).getAttribute('width') || '50');
        return -w / 2;
      });

    node = nodeEnter.merge(node);

    node.style('opacity', d => {
      if (isolatedId && d.continentId !== isolatedId) return 0.16;
      return 1;
    })
    .attr('data-node-id', d => d.id)
    .attr('data-node-label', d => d.label);

    node.select('.node-label').text(d => d.label);
    node.select('.id-marker').text(d => d.isMacroContinent ? `[MACRO CONTINENT · CLICK TO EXPAND]` : `[${(d.continentId || 'NODE').toUpperCase()}]`);

    const isHighlighted = (d: GraphNode) =>
      d.id === focusedNodeId || d.id === sharedHoveredNodeId || d.id === activeHotspotNodeId;

    node.select('.radiant-pulse-outer')
      .style('display', d => isHighlighted(d) ? 'block' : 'none')
      .attr('class', d => isHighlighted(d) ? 'radiant-pulse-outer radiant-pulse-active-1' : 'radiant-pulse-outer');

    node.select('.radiant-pulse-inner')
      .style('display', d => isHighlighted(d) ? 'block' : 'none')
      .attr('class', d => isHighlighted(d) ? 'radiant-pulse-inner radiant-pulse-active-2' : 'radiant-pulse-inner');

    node.select('.radiant-target-brackets')
      .style('display', d => isHighlighted(d) ? 'block' : 'none')
      .attr('class', d => isHighlighted(d) ? 'radiant-target-brackets radiant-hud-rotate' : 'radiant-target-brackets');

    node.select('.core')
      .attr('fill', d => {
        if (d.isGhost) return '#020617';
        const cColor = (d.continentId && CONTINENT_PALETTE[d.continentId]) || colors[d.group % colors.length];
        return d.isExpanded || d.isMacroContinent ? cColor : '#0f172a';
      })
      .style('stroke', d => {
        if (isHighlighted(d)) return '#00f0ff';
        if (d.id === pinnedNodeId) return '#f59e0b';
        if (d.isTargeted) return '#38bdf8';
        return (d.continentId && CONTINENT_PALETTE[d.continentId]) || '#ffffff';
      })
      .style('stroke-width', d => {
        if (isHighlighted(d)) return 5.5;
        if (d.id === pinnedNodeId) return 4.5;
        if (d.isTargeted) return 5;
        return 2.5;
      })
      .style('filter', d => {
        if (isHighlighted(d)) return 'url(#radiant-neon-glow)';
        return 'url(#omega-glow)';
      });

    // --- 4. INTERACTIVE CONTINENT BEACONS RENDERING (Only in FORCE_CONTINENTS mode) ---
    const activeBeacons = isForceMode && continentConfig.enabled ? continentsMetadata : [];

    let beacons = beaconsLayer
      .selectAll<SVGGElement, KnowledgeContinent>('.continent-beacon-group')
      .data(activeBeacons, d => d.id);

    beacons.exit().remove();

    const beaconEnter = beacons.enter()
      .append('g')
      .attr('class', 'continent-beacon-group')
      .attr('data-continent-id', d => d.id)
      .style('cursor', 'grab');

    beaconEnter.append('rect')
      .attr('class', 'beacon-bg')
      .attr('x', -96)
      .attr('y', -22)
      .attr('width', 192)
      .attr('height', 36)
      .attr('rx', 8)
      .attr('fill', '#07090e')
      .attr('fill-opacity', 0.92)
      .attr('stroke-width', 1.5);

    beaconEnter.append('circle')
      .attr('class', 'beacon-dot')
      .attr('cx', -80)
      .attr('cy', -4)
      .attr('r', 4.5);

    beaconEnter.append('text')
      .attr('class', 'beacon-title')
      .attr('x', -68)
      .attr('y', -6)
      .attr('fill', '#f8fafc')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('letter-spacing', '0.04em');

    beaconEnter.append('text')
      .attr('class', 'beacon-subtitle font-mono')
      .attr('x', -68)
      .attr('y', 7)
      .attr('fill', '#94a3b8')
      .attr('font-size', '8.5px');

    const focusBtn = beaconEnter.append('g')
      .attr('class', 'beacon-focus-btn')
      .attr('transform', 'translate(44, -13)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onFocusContinent) onFocusContinent(d.id);
      });

    focusBtn.append('rect')
      .attr('width', 22)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('fill', '#0f172a')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1);

    focusBtn.append('text')
      .attr('x', 11)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#38bdf8')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '700')
      .text('◎');

    const foldBtn = beaconEnter.append('g')
      .attr('class', 'beacon-fold-btn')
      .attr('transform', 'translate(69, -13)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onToggleCollapseContinent) onToggleCollapseContinent(d.id);
      });

    foldBtn.append('rect')
      .attr('width', 22)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('fill', '#0f172a')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1);

    foldBtn.append('text')
      .attr('class', 'beacon-fold-label')
      .attr('x', 11)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f59e0b')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '700');

    beacons = beaconEnter.merge(beacons);

    beacons.style('opacity', d => {
      if (isolatedId && isolatedId !== d.id) return 0.25;
      return 1;
    });

    beacons.select('.beacon-bg').attr('stroke', d => d.color);
    beacons.select('.beacon-dot').attr('fill', d => d.color);
    beacons.select('.beacon-title').text(d => d.label.toUpperCase());
    beacons.select('.beacon-subtitle').text(d => `${d.nodeCount} NODES · ${d.isCollapsed ? 'FOLDED' : 'DRAG HULL'}`);
    beacons.select('.beacon-fold-label').text(d => d.isCollapsed ? '+' : '−');

    beacons.call(
      d3.drag<SVGGElement, KnowledgeContinent>()
        .on('start', function(event) {
          if (!event.active) simulation.alphaTarget(0.28).restart();
          d3.select(this).style('cursor', 'grabbing');
        })
        .on('drag', (event, d) => {
          const anchor = continentAnchorsRef.current.get(d.id);
          if (anchor) {
            anchor.x += event.dx;
            anchor.y += event.dy;
            anchor.isUserPinned = true;
          }
          activeGraphData.nodes.forEach(n => {
            if (n.continentId === d.id) {
              n.x = (n.x || 0) + event.dx;
              n.y = (n.y || 0) + event.dy;
              if (n.fx != null) n.fx += event.dx;
              if (n.fy != null) n.fy += event.dy;
            }
          });
        })
        .on('end', function(event) {
          if (!event.active) simulation.alphaTarget(0);
          d3.select(this).style('cursor', 'grab');
        })
    );

    // --- 5. INTERACTIVE CHEMOTACTIC NUTRIENT BEACONS DRAG HANDLES ---
    let chemoBeacons = chemoLayer
      .selectAll<SVGGElement, ChemotacticBeacon>('.chemo-beacon-node')
      .data(chemotacticBeacons.filter(b => b.active), d => d.id);

    chemoBeacons.exit().remove();

    const chemoEnter = chemoBeacons.enter()
      .append('g')
      .attr('class', 'chemo-beacon-node')
      .attr('data-beacon-id', d => d.id)
      .style('cursor', 'grab')
      .call(
        d3.drag<SVGGElement, ChemotacticBeacon>()
          .on('start', function() {
            d3.select(this).style('cursor', 'grabbing');
          })
          .on('drag', function(event, d) {
            d.x = event.x;
            d.y = event.y;
            d3.select(this).attr('transform', `translate(${event.x}, ${event.y})`);
            if (onUpdateBeacon) {
              onUpdateBeacon({ ...d, x: event.x, y: event.y });
            }
          })
          .on('end', function() {
            d3.select(this).style('cursor', 'grab');
          })
      );

    chemoEnter.append('circle')
      .attr('class', 'chemo-hit-target')
      .attr('r', 24)
      .attr('fill', 'rgba(245, 158, 11, 0.08)')
      .attr('stroke', 'rgba(245, 158, 11, 0.4)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,3');

    chemoEnter.append('circle')
      .attr('class', 'chemo-drag-pip')
      .attr('r', 8)
      .attr('fill', 'rgba(245, 158, 11, 0.95)')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    chemoBeacons = chemoEnter.merge(chemoBeacons);
    chemoBeacons.attr('transform', d => `translate(${d.x}, ${d.y})`);

    const hullLineGenerator = d3.line<[number, number]>()
      .curve(d3.curveCatmullRomClosed.alpha(0.65));

    simulation.on('tick', () => {
      const wTick = dimensionsRef.current.width || 1200;
      const hTick = dimensionsRef.current.height || 800;
      const cxTick = wTick / 2;
      const cyTick = hTick / 2;
      const dbgTick = physicsDebugConfigRef.current;
      const boundaryPadding = dbgTick.boundaryPadding;

      tickCounterRef.current += 1;
      let sumVel = 0;
      let maxVel = 0;
      let sumKinetic = 0;
      let pinnedCount = 0;

      // Strict boundary clamping within the simulation tick loop (padding ~40px)
      activeGraphData.nodes.forEach(d => {
        const nodeRadius = d.radius || 20;
        if (dbgTick.boundaryClampingEnabled) {
          const padX = Math.max(boundaryPadding, nodeRadius);
          const padY = Math.max(boundaryPadding, nodeRadius);
          const minX = padX;
          const maxX = Math.max(minX + 10, wTick - padX);
          const minY = padY;
          const maxY = Math.max(minY + 10, hTick - padY);

          if (typeof d.x === 'number') {
            d.x = Math.max(minX, Math.min(maxX, d.x));
          }
          if (typeof d.y === 'number') {
            d.y = Math.max(minY, Math.min(maxY, d.y));
          }
          if (typeof d.fx === 'number') {
            d.fx = Math.max(minX, Math.min(maxX, d.fx));
          }
          if (typeof d.fy === 'number') {
            d.fy = Math.max(minY, Math.min(maxY, d.fy));
          }
        }

        const vx = d.vx || 0;
        const vy = d.vy || 0;
        const speed = Math.hypot(vx, vy);
        sumVel += speed;
        if (speed > maxVel) maxVel = speed;
        sumKinetic += 0.5 * (d.strength || 1) * speed * speed;
        if (typeof d.fx === 'number' || typeof d.fy === 'number') {
          pinnedCount += 1;
        }

        const existingSaved = nodePositionsRef.current.get(d.id);
        nodePositionsRef.current.set(d.id, {
          x: d.x || cxTick,
          y: d.y || cyTick,
          vx,
          vy,
          fx: d.fx ?? null,
          fy: d.fy ?? null,
          isUserPinned: existingSaved?.isUserPinned
        });
      });

      // Compute real-time spring link strain, synaptic conductivity & per-node incident strain
      const targetEqDist = dbgTick.linkDistance || 90;
      let sumLinkStrain = 0;
      let sumConductivity = 0;
      const nodeIncidentStrain = new Map<
        string,
        { sumRatio: number; sumAbsStrain: number; sumBottleneck: number; count: number }
      >();

      safeSimulationLinks.forEach(l => {
        const sObj = l.source as GraphNode;
        const tObj = l.target as GraphNode;
        const sx = sObj.x || 0;
        const sy = sObj.y || 0;
        const tx = tObj.x || 0;
        const ty = tObj.y || 0;
        const actualDist = Math.hypot(tx - sx, ty - sy);
        const ratio = actualDist / Math.max(1, targetEqDist);
        const strain = Math.abs(actualDist - targetEqDist) / Math.max(1, targetEqDist);
        const cond = typeof l.conductivity === 'number' ? l.conductivity : 0.82;
        const linkBottleneck = (1 + strain) / Math.max(0.15, cond);

        sumLinkStrain += strain;
        sumConductivity += cond;

        if (sObj.id) {
          const prevS = nodeIncidentStrain.get(sObj.id) || {
            sumRatio: 0,
            sumAbsStrain: 0,
            sumBottleneck: 0,
            count: 0
          };
          prevS.sumRatio += ratio;
          prevS.sumAbsStrain += strain;
          prevS.sumBottleneck += linkBottleneck;
          prevS.count += 1;
          nodeIncidentStrain.set(sObj.id, prevS);
        }
        if (tObj.id) {
          const prevT = nodeIncidentStrain.get(tObj.id) || {
            sumRatio: 0,
            sumAbsStrain: 0,
            sumBottleneck: 0,
            count: 0
          };
          prevT.sumRatio += ratio;
          prevT.sumAbsStrain += strain;
          prevT.sumBottleneck += linkBottleneck;
          prevT.count += 1;
          nodeIncidentStrain.set(tObj.id, prevT);
        }
      });

      const nowMs = performance.now();
      if (nowMs - lastTelemetryUpdateRef.current >= 75) {
        lastTelemetryUpdateRef.current = nowMs;
        const nCount = activeGraphData.nodes.length;
        const lCount = safeSimulationLinks.length;

        // Rank top stress hotspot nodes (kinetic energy + incident spring strain + synaptic bottleneck pressure)
        const rankedNodes: StressHotspotNodeItem[] = activeGraphData.nodes
          .map(n => {
            const vx = n.vx || 0;
            const vy = n.vy || 0;
            const speed = Math.hypot(vx, vy);
            const mass = Math.max(0.5, n.strength || 1.0);
            const ek = 0.5 * mass * speed * speed;
            const inc = nodeIncidentStrain.get(n.id);
            const avgStrain = inc && inc.count > 0 ? inc.sumAbsStrain / inc.count : 0;
            const bIndex = inc && inc.count > 0 ? inc.sumBottleneck / inc.count : 1.0;
            const degreeFactor = inc ? Math.min(1.35, 0.75 + inc.count * 0.1) : 0.75;

            const kineticNorm = Math.min(1, Math.sqrt(ek) / 2.2);
            const strainNorm = Math.min(1, avgStrain / 0.65);
            const bottleneckNorm = Math.min(1, Math.max(0, (bIndex - 0.8) / 1.8));
            const rawScore =
              (kineticNorm * 0.42 + strainNorm * 0.36 + bottleneckNorm * 0.22) *
              degreeFactor *
              100;
            const stressScore = Math.min(99, Math.max(8, rawScore));

            return {
              nodeId: n.id,
              label: n.label,
              stressScore,
              kineticEnergy: ek,
              velocity: speed,
              incidentStrain: avgStrain,
              bottleneckIndex: bIndex,
              quantumColor: encodeNodeKineticQuantumColor(n)
            };
          })
          .sort((a, b) => b.stressScore - a.stressScore)
          .slice(0, 4);

        latestTopHotspotsRef.current = rankedNodes;

        // Rank top synaptic bottleneck links
        const rankedLinks: SynapticBottleneckLinkItem[] = safeSimulationLinks
          .map((l, idx) => {
            const sObj = l.source as GraphNode;
            const tObj = l.target as GraphNode;
            const sx = sObj.x || 0;
            const sy = sObj.y || 0;
            const tx = tObj.x || 0;
            const ty = tObj.y || 0;
            const actualDist = Math.hypot(tx - sx, ty - sy);
            const strainRatio = Math.abs(actualDist - targetEqDist) / Math.max(1, targetEqDist);
            const cond = typeof l.conductivity === 'number' ? l.conductivity : 0.82;
            const sv = Math.hypot(sObj.vx || 0, sObj.vy || 0);
            const tv = Math.hypot(tObj.vx || 0, tObj.vy || 0);
            const bottleneckScore =
              ((1 + strainRatio * 1.8 + (sv + tv) * 0.15) / Math.max(0.15, cond)) * 10;
            const qEnc = encodeLinkConductivityQuantumColor(l, targetEqDist);

            return {
              linkKey: `${sObj.id}-${tObj.id}-${idx}`,
              sourceId: sObj.id,
              targetId: tObj.id,
              sourceLabel: sObj.label,
              targetLabel: tObj.label,
              relationship: l.relationship || 'Synapse',
              conductivity: qEnc.effectiveConductivity,
              strainRatio,
              bottleneckScore,
              quantumColor: qEnc.color
            };
          })
          .sort((a, b) => b.bottleneckScore - a.bottleneckScore)
          .slice(0, 3);

        const avgStrainOverall = lCount > 0 ? sumLinkStrain / lCount : 0;

        // Auto-Homeostasis: automatically relieve bottlenecks when stress or strain spikes
        if (
          dbgTick.autoHomeostasis &&
          nowMs - lastHomeostaticPulseMsRef.current >= 2400 &&
          ((rankedNodes[0] && rankedNodes[0].stressScore >= 72) || avgStrainOverall >= 0.32)
        ) {
          lastHomeostaticPulseMsRef.current = nowMs;
          homeostaticPulsesCountRef.current += 1;

          safeSimulationLinks.forEach(l => {
            const sObj = l.source as GraphNode;
            const tObj = l.target as GraphNode;
            const sx = sObj.x || 0;
            const sy = sObj.y || 0;
            const tx = tObj.x || 0;
            const ty = tObj.y || 0;
            const actualDist = Math.hypot(tx - sx, ty - sy);
            const strain = Math.abs(actualDist - targetEqDist) / Math.max(1, targetEqDist);
            const curCond = typeof l.conductivity === 'number' ? l.conductivity : 0.82;

            if (strain > 0.16 || curCond < 0.95) {
              const nextCond = Math.min(1.85, curCond + 0.24 * (1 + strain));
              l.conductivity = nextCond;
              if (sObj.id && tObj.id) {
                const lKey = sObj.id < tObj.id ? `${sObj.id}__${tObj.id}` : `${tObj.id}__${sObj.id}`;
                linkConductivityOverridesRef.current.set(lKey, nextCond);
              }
            }
          });

          activeGraphData.nodes.forEach(n => {
            n.vx = (n.vx || 0) * 0.45;
            n.vy = (n.vy || 0) * 0.45;
          });

          const wavePts = rankedNodes
            .slice(0, 2)
            .map(h => activeGraphData.nodes.find(n => n.id === h.nodeId))
            .filter((n): n is GraphNode => !!n && typeof n.x === 'number' && typeof n.y === 'number')
            .map(n => ({ x: n.x!, y: n.y!, timestamp: nowMs }));
          homeostaticWaveOriginsRef.current = [
            ...homeostaticWaveOriginsRef.current.filter(w => nowMs - w.timestamp < 1100),
            ...wavePts
          ];
        }

        setPhysicsTelemetry({
          alpha: simulation.alpha(),
          alphaMin: simulation.alphaMin(),
          alphaDecay: simulation.alphaDecay(),
          velocityDecay: simulation.velocityDecay(),
          avgVelocity: nCount > 0 ? sumVel / nCount : 0,
          maxVelocity: maxVel,
          kineticEnergy: sumKinetic,
          avgLinkStrain: avgStrainOverall,
          avgConductivity: lCount > 0 ? sumConductivity / lCount : 0.82,
          pinnedCount,
          nodeCount: nCount,
          linkCount: lCount,
          tickCount: tickCounterRef.current,
          homeostaticPulsesCount: homeostaticPulsesCountRef.current,
          topStressNodes: rankedNodes,
          topBottleneckLinks: rankedLinks
        });
      }

      // Update unified link paths dynamically based on live node coordinates & active diagram paradigm
      link.attr('d', d => {
        const sx = (d.source as any).x || 0;
        const sy = (d.source as any).y || 0;
        const tx = (d.target as any).x || 0;
        const ty = (d.target as any).y || 0;

        if (latestParadigmRef.current === 'FORCE_CONTINENTS' || latestParadigmRef.current === 'VORONOI_EULER') {
          return `M ${sx} ${sy} L ${tx} ${ty}`;
        }
        if (latestParadigmRef.current === 'CHORD_WHEEL') {
          const tension = 0.22;
          const ctrlX = cxTick * (1 - tension) + ((sx + tx) / 2) * tension;
          const ctrlY = cyTick * (1 - tension) + ((sy + ty) / 2) * tension;
          return `M ${sx} ${sy} Q ${ctrlX} ${ctrlY} ${tx} ${ty}`;
        }
        if (latestParadigmRef.current === 'RADIAL_DENDROGRAM') {
          const sId = (d.source as any).id || d.source;
          const tId = (d.target as any).id || d.target;
          const sTarget = projection.nodeTargets.get(sId);
          const tTarget = projection.nodeTargets.get(tId);
          if (sTarget && tTarget) {
            const midR = ((sTarget.radius || 0) + (tTarget.radius || 0)) / 2;
            const c1x = cxTick + Math.cos(sTarget.angle || 0) * midR;
            const c1y = cyTick + Math.sin(sTarget.angle || 0) * midR;
            const c2x = cxTick + Math.cos(tTarget.angle || 0) * midR;
            const c2y = cyTick + Math.sin(tTarget.angle || 0) * midR;
            return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;
          }
          return `M ${sx} ${sy} L ${tx} ${ty}`;
        }
        // LAYERED_DAG or SANKEY_FLOW: smooth horizontal cubic S-curve
        const midX = (sx + tx) / 2;
        return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
      });

      linkLabels.attr('transform', d => {
        const sx = (d.source as any).x || 0;
        const sy = (d.source as any).y || 0;
        const tx = (d.target as any).x || 0;
        const ty = (d.target as any).y || 0;
        if (latestParadigmRef.current === 'CHORD_WHEEL') {
          const tension = 0.22;
          const ctrlX = cxTick * (1 - tension) + ((sx + tx) / 2) * tension;
          const ctrlY = cyTick * (1 - tension) + ((sy + ty) / 2) * tension;
          return `translate(${0.25 * sx + 0.5 * ctrlX + 0.25 * tx}, ${0.25 * sy + 0.5 * ctrlY + 0.25 * ty})`;
        }
        return `translate(${(sx + tx) / 2}, ${(sy + ty) / 2 - 4})`;
      });

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);

      // Real-Time Visual Color Encoding directly on Nodes and Links
      if (dbgTick.visualEncodingMode === 'QUANTUM_STRESS') {
        link
          .attr('stroke', d => encodeLinkConductivityQuantumColor(d, targetEqDist).color)
          .attr('stroke-opacity', d => {
            const sNode = d.source as GraphNode;
            const tNode = d.target as GraphNode;
            if (isolatedId && sNode.continentId !== isolatedId && tNode.continentId !== isolatedId) {
              return 0.08;
            }
            const { normalized } = encodeLinkConductivityQuantumColor(d, targetEqDist);
            return Math.min(0.98, 0.42 + normalized * 0.56);
          });

        node.select('.aura').attr('fill', d => encodeNodeKineticQuantumColor(d));
        node.select('.contrast-ring').attr('stroke', d => encodeNodeKineticQuantumColor(d));
        node.select('.core').attr('fill', d => {
          if (d.isGhost) return '#020617';
          return encodeNodeKineticQuantumColor(d);
        });
      } else if (dbgTick.visualEncodingMode === 'LINK_TENSION') {
        const getTensionColor = (ratio: number) => {
          if (ratio < 0.82) return '#06b6d4'; // Compressed (Cyan)
          if (ratio <= 1.18) return '#10b981'; // Equilibrium (Emerald)
          if (ratio <= 1.52) return '#f59e0b'; // Moderate Stretch (Amber)
          return '#f43f5e'; // High Tensile Strain (Crimson/Rose)
        };
        link.attr('stroke', d => {
          const sx = (d.source as any).x || 0;
          const sy = (d.source as any).y || 0;
          const tx = (d.target as any).x || 0;
          const ty = (d.target as any).y || 0;
          const ratio = Math.hypot(tx - sx, ty - sy) / Math.max(1, targetEqDist);
          return getTensionColor(ratio);
        });
        node.select('.aura').attr('fill', d => {
          const st = nodeIncidentStrain.get(d.id);
          const avgRatio = st && st.count > 0 ? st.sumRatio / st.count : 1.0;
          return getTensionColor(avgRatio);
        });
        node.select('.contrast-ring').attr('stroke', d => {
          const st = nodeIncidentStrain.get(d.id);
          const avgRatio = st && st.count > 0 ? st.sumRatio / st.count : 1.0;
          return getTensionColor(avgRatio);
        });
        node.select('.core').attr('fill', d => {
          if (d.isGhost) return '#020617';
          const st = nodeIncidentStrain.get(d.id);
          const avgRatio = st && st.count > 0 ? st.sumRatio / st.count : 1.0;
          return getTensionColor(avgRatio);
        });
      } else if (dbgTick.visualEncodingMode === 'KINETIC_STRESS') {
        const getKineticColor = (speed: number) => {
          if (speed < 0.22) return '#38bdf8'; // At Rest (Sky)
          if (speed < 1.15) return '#10b981'; // Gliding (Emerald)
          if (speed < 3.0) return '#f59e0b'; // Active Acceleration (Amber)
          return '#f43f5e'; // High Kinetic Velocity (Rose)
        };
        link.attr('stroke', d => {
          const sv = Math.hypot((d.source as any).vx || 0, (d.source as any).vy || 0);
          const tv = Math.hypot((d.target as any).vx || 0, (d.target as any).vy || 0);
          return getKineticColor((sv + tv) / 2);
        });
        node.select('.aura').attr('fill', d => {
          const speed = Math.hypot(d.vx || 0, d.vy || 0);
          return getKineticColor(speed);
        });
        node.select('.contrast-ring').attr('stroke', d => {
          const speed = Math.hypot(d.vx || 0, d.vy || 0);
          return getKineticColor(speed);
        });
        node.select('.core').attr('fill', d => {
          if (d.isGhost) return '#020617';
          const speed = Math.hypot(d.vx || 0, d.vy || 0);
          return getKineticColor(speed);
        });
      } else {
        // Standard Ontology Palette
        link.attr('stroke', d => {
          const sId = (d.source as any).id || d.source;
          const tId = (d.target as any).id || d.target;
          const isConnected = isAnyFocused && (sId === activeFocusId || tId === activeFocusId);
          if (isConnected) return 'url(#radiant-link-grad)';
          const proj = projection.links.get(`${sId}-${tId}`);
          if (!isForceMode && proj?.stroke) return proj.stroke;
          return 'url(#link-grad)';
        });
        node.select('.aura').attr('fill', d =>
          (d.continentId && CONTINENT_PALETTE[d.continentId]) || colors[d.group % colors.length]
        );
        node.select('.contrast-ring').attr('stroke', d =>
          (d.continentId && CONTINENT_PALETTE[d.continentId]) || '#38bdf8'
        );
        node.select('.core').attr('fill', d => {
          if (d.isGhost) return '#020617';
          const cColor = (d.continentId && CONTINENT_PALETTE[d.continentId]) || colors[d.group % colors.length];
          return d.isExpanded || d.isMacroContinent ? cColor : '#0f172a';
        });
      }

      // Update Organic Topographic Hulls in FORCE_CONTINENTS mode
      if (latestParadigmRef.current === 'FORCE_CONTINENTS' && latestConfigRef.current.enabled) {
        hullGroups.each(function(cont) {
          const members = activeGraphData.nodes.filter(
            n => n.continentId === cont.id && typeof n.x === 'number' && typeof n.y === 'number'
          ) as Array<{ x: number; y: number }>;

          if (members.length === 0) return;

          const outerSamplePts = generateRadialHullPoints(members, 74, 12);
          const innerSamplePts = generateRadialHullPoints(members, 46, 12);

          const outerHull = d3.polygonHull(outerSamplePts);
          const innerHull = d3.polygonHull(innerSamplePts);

          const g = d3.select(this);
          if (outerHull) {
            g.select('.continent-outer-hull').attr('d', hullLineGenerator(outerHull) || '');
          }
          if (innerHull) {
            g.select('.continent-inner-hull').attr('d', hullLineGenerator(innerHull) || '');
          }
        });

        beacons.attr('transform', cont => {
          const members = activeGraphData.nodes.filter(
            n => n.continentId === cont.id && typeof n.x === 'number' && typeof n.y === 'number'
          );
          if (members.length === 0) {
            const anchor = continentAnchorsRef.current.get(cont.id);
            return `translate(${anchor?.x || 0}, ${(anchor?.y || 0) - 90})`;
          }
          const avgX = members.reduce((s, n) => s + (n.x || 0), 0) / members.length;
          const minY = Math.min(...members.map(n => n.y || 0));
          return `translate(${avgX}, ${minY - 88})`;
        });
      }

      // Render Epistemic Causal Trace Paths & Glowing Synaptic Laser
      causalTraceLayer.selectAll('*').remove();
      causalParticlesLayer.selectAll('*').remove();

      if (activeCausalTrace && activeCausalTrace.steps.length > 1) {
        const tracePoints: Array<{ x: number; y: number; relToNext?: string; label: string; id: string }> = [];
        activeCausalTrace.steps.forEach(st => {
          const n = activeGraphData.nodes.find(node => node.id === st.nodeId);
          if (n && typeof n.x === 'number' && typeof n.y === 'number') {
            tracePoints.push({ x: n.x, y: n.y, relToNext: st.relationshipToNext, label: st.nodeLabel, id: st.nodeId });
          }
        });

        if (tracePoints.length > 1) {
          for (let i = 0; i < tracePoints.length - 1; i++) {
            const p1 = tracePoints[i];
            const p2 = tracePoints[i + 1];
            const pStyle = getPredicateStyle(p1.relToNext);

            // Glowing thick laser backbone
            causalTraceLayer.append('line')
              .attr('x1', p1.x)
              .attr('y1', p1.y)
              .attr('x2', p2.x)
              .attr('y2', p2.y)
              .attr('stroke', pStyle.color)
              .attr('stroke-width', 6)
              .attr('stroke-linecap', 'round')
              .attr('stroke-opacity', 0.88)
              .style('filter', 'url(#radiant-neon-glow)');

            causalTraceLayer.append('line')
              .attr('x1', p1.x)
              .attr('y1', p1.y)
              .attr('x2', p2.x)
              .attr('y2', p2.y)
              .attr('stroke', '#ffffff')
              .attr('stroke-width', 2)
              .attr('stroke-linecap', 'round')
              .attr('stroke-opacity', 0.95);
          }

          // Compute and render animated photon pulse particle trails
          const particles = calculatePhotonPulses(tracePoints, performance.now() / 1000, 4);
          particles.forEach(p => {
            const partG = causalParticlesLayer.append('g')
              .attr('transform', `translate(${p.x},${p.y})`);

            partG.append('circle')
              .attr('r', p.radius * 2.2)
              .attr('fill', p.glowColor)
              .attr('opacity', p.opacity * 0.45)
              .style('filter', 'url(#radiant-neon-glow)');

            partG.append('circle')
              .attr('r', p.radius)
              .attr('fill', p.color)
              .attr('stroke', '#ffffff')
              .attr('stroke-width', 1.5)
              .attr('opacity', p.opacity)
              .style('filter', 'url(#radiant-neon-glow)');
          });
        }
      }

      // Render On-Canvas Physics Debugger Overlays (Collision Radii, Velocity Vectors, Boundary Clamp Box)
      physicsDebugLayer.selectAll('*').remove();
      if (dbgTick.showBoundaryBox) {
        const pad = dbgTick.boundaryPadding;
        physicsDebugLayer
          .append('rect')
          .attr('x', pad)
          .attr('y', pad)
          .attr('width', Math.max(20, wTick - pad * 2))
          .attr('height', Math.max(20, hTick - pad * 2))
          .attr('fill', 'none')
          .attr('stroke', 'rgba(168, 85, 247, 0.55)')
          .attr('stroke-width', 1.25)
          .attr('stroke-dasharray', '6,4');
      }

      if (dbgTick.showCollisionRadii || dbgTick.showVelocityVectors) {
        activeGraphData.nodes.forEach(d => {
          if (typeof d.x !== 'number' || typeof d.y !== 'number') return;
          if (dbgTick.showCollisionRadii) {
            const colR = (d.radius || 20) + dbgTick.collisionRadiusOffset;
            physicsDebugLayer
              .append('circle')
              .attr('cx', d.x)
              .attr('cy', d.y)
              .attr('r', colR)
              .attr('fill', 'rgba(16, 185, 129, 0.04)')
              .attr('stroke', 'rgba(16, 185, 129, 0.5)')
              .attr('stroke-width', 1)
              .attr('stroke-dasharray', '3,3');
          }
          if (dbgTick.showVelocityVectors) {
            const vx = d.vx || 0;
            const vy = d.vy || 0;
            const speed = Math.hypot(vx, vy);
            if (speed > 0.04) {
              const vecScale = 14;
              const tx = d.x + vx * vecScale;
              const ty = d.y + vy * vecScale;
              physicsDebugLayer
                .append('line')
                .attr('x1', d.x)
                .attr('y1', d.y)
                .attr('x2', tx)
                .attr('y2', ty)
                .attr('stroke', '#fbbf24')
                .attr('stroke-width', 1.75)
                .attr('stroke-linecap', 'round');
              physicsDebugLayer
                .append('circle')
                .attr('cx', tx)
                .attr('cy', ty)
                .attr('r', 2.2)
                .attr('fill', '#fbbf24');
            }
          }
        });
      }

      // Render On-Canvas Stress Hotspot Reticles on Top 3 Stress Nodes
      if (dbgTick.showStressHotspots && latestTopHotspotsRef.current.length > 0) {
        latestTopHotspotsRef.current.slice(0, 3).forEach((hotspot, rankIdx) => {
          const targetNode = activeGraphData.nodes.find(n => n.id === hotspot.nodeId);
          if (!targetNode || typeof targetNode.x !== 'number' || typeof targetNode.y !== 'number') {
            return;
          }
          const rBase = (targetNode.radius || 22) + 16;
          const reticleG = physicsDebugLayer
            .append('g')
            .attr('class', 'stress-hotspot-reticle')
            .attr('transform', `translate(${targetNode.x}, ${targetNode.y})`);

          reticleG
            .append('circle')
            .attr('r', rBase)
            .attr('fill', 'none')
            .attr('stroke', rankIdx === 0 ? '#67e8f9' : '#a855f7')
            .attr('stroke-width', rankIdx === 0 ? 1.8 : 1.2)
            .attr('stroke-dasharray', '5,3')
            .attr('opacity', rankIdx === 0 ? 0.9 : 0.65);

          reticleG
            .append('text')
            .attr('y', -rBase - 5)
            .attr('text-anchor', 'middle')
            .attr('fill', rankIdx === 0 ? '#67e8f9' : '#c084fc')
            .attr('font-family', 'monospace')
            .attr('font-size', '8px')
            .attr('font-weight', '800')
            .text(`#${rankIdx + 1} STRESS ${hotspot.stressScore.toFixed(0)}%`);
        });
      }

      // Render Bioluminescent Homeostatic Relief Waves
      if (homeostaticWaveOriginsRef.current.length > 0) {
        const activeWaves = homeostaticWaveOriginsRef.current.filter(
          w => nowMs - w.timestamp < 1100
        );
        homeostaticWaveOriginsRef.current = activeWaves;
        activeWaves.forEach(wave => {
          const progress = Math.min(1, Math.max(0, (nowMs - wave.timestamp) / 1100));
          const radius = 24 + progress * 155;
          const opacity = (1 - progress) * 0.85;
          physicsDebugLayer
            .append('circle')
            .attr('cx', wave.x)
            .attr('cy', wave.y)
            .attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', '#34d399')
            .attr('stroke-width', 2.4 * (1 - progress * 0.5))
            .attr('opacity', opacity);
          physicsDebugLayer
            .append('circle')
            .attr('cx', wave.x)
            .attr('cy', wave.y)
            .attr('r', Math.max(12, radius * 0.68))
            .attr('fill', 'none')
            .attr('stroke', '#67e8f9')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '6,4')
            .attr('opacity', opacity * 0.8);
        });
      }
    });

    if (!physicsDebugConfigRef.current.isPaused) {
      simulation.alpha(0.8).restart();
    } else {
      simulation.stop();
    }
  }, [
    activeGraphData,
    continentsMetadata,
    continentConfig.enabled,
    continentConfig.hullOpacity,
    continentConfig.isolatedContinentId,
    diagramParadigm,
    onNodeClick,
    synergyLevel,
    focusedNodeId,
    sharedHoveredNodeId,
    activeHotspotNodeId,
    pinnedNodeId,
    onFocusContinent,
    onToggleCollapseContinent,
    onTogglePin,
    onHoverNode,
    activeCausalTrace
  ]);

  const applyLivePhysicsDebugConfig = (
    patch: Partial<PhysicsDebugConfig>,
    reheatAlpha?: number
  ) => {
    const nextConfig: PhysicsDebugConfig = {
      ...physicsDebugConfigRef.current,
      ...patch
    };
    physicsDebugConfigRef.current = nextConfig;
    setPhysicsDebugConfig(nextConfig);

    const sim = simulationRef.current;
    if (!sim) return;

    const { width, height } = dimensionsRef.current;
    const simNodeIdSet = new Set(activeGraphData.nodes.map(n => n.id));
    const safeSimulationLinks = activeGraphData.links.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
      return s && t && simNodeIdSet.has(s) && simNodeIdSet.has(t);
    });

    sim
      .alphaDecay(nextConfig.alphaDecay)
      .velocityDecay(nextConfig.velocityDecay)
      .force(
        'collision',
        nextConfig.collisionEnabled
          ? d3.forceCollide<GraphNode>()
              .radius(d => (d.radius || 20) + nextConfig.collisionRadiusOffset)
              .strength(nextConfig.collisionStrength)
          : null
      )
      .force(
        'charge',
        nextConfig.chargeEnabled
          ? d3.forceManyBody<GraphNode>()
              .theta(0.8)
              .distanceMax(850)
              .strength(nextConfig.chargeStrength)
          : null
      )
      .force('center', nextConfig.centerEnabled ? d3.forceCenter(width / 2, height / 2) : null);

    if (diagramParadigm === 'FORCE_CONTINENTS' && activeSpatialPattern === 'FORCE_DEFAULT') {
      const springForceLink = d3.forceLink<GraphNode, GraphLink>(safeSimulationLinks)
        .id(d => d.id)
        .distance(nextConfig.linkDistance);
      configureSpringTensorForces(
        springForceLink,
        centralityMap,
        latestConfigRef.current.separation,
        latestConfigRef.current.enabled
      );
      if (nextConfig.linkDistance !== 90) {
        springForceLink.distance(nextConfig.linkDistance);
      }
      if (!nextConfig.linkEnabled) {
        springForceLink.strength(0);
      } else if (nextConfig.linkStrengthMultiplier !== 1.0) {
        const baseStrengthFn = springForceLink.strength();
        springForceLink.strength((link, i, links) =>
          baseStrengthFn(link, i, links) * nextConfig.linkStrengthMultiplier
        );
      }
      sim.force('link', springForceLink);
    }

    if (nextConfig.isPaused) {
      sim.stop();
      const onTickFn = sim.on('tick');
      if (typeof onTickFn === 'function') {
        onTickFn.call(sim);
      }
    } else if (typeof reheatAlpha === 'number' || patch.isPaused === false) {
      sim.alpha(Math.max(sim.alpha(), reheatAlpha ?? 0.45)).restart();
    } else {
      const onTickFn = sim.on('tick');
      if (typeof onTickFn === 'function') {
        onTickFn.call(sim);
      }
    }

    setPhysicsTelemetry(prev => ({
      ...prev,
      alpha: sim.alpha(),
      alphaMin: sim.alphaMin(),
      alphaDecay: sim.alphaDecay(),
      velocityDecay: sim.velocityDecay()
    }));
  };

  const handleReleaseAllPinnedNodes = () => {
    nodePositionsRef.current.forEach(pos => {
      pos.fx = null;
      pos.fy = null;
      pos.isUserPinned = false;
    });
    if (simulationRef.current) {
      simulationRef.current.nodes().forEach(n => {
        if (!n.isMacroContinent) {
          n.fx = null;
          n.fy = null;
        }
      });
      if (!physicsDebugConfigRef.current.isPaused) {
        simulationRef.current.alpha(0.6).restart();
      }
    }
    setPhysicsTelemetry(prev => ({ ...prev, pinnedCount: 0 }));
  };

  const handleStepPhysicsTick = () => {
    if (!simulationRef.current) return;
    simulationRef.current.stop();
    if (simulationRef.current.alpha() < 0.15) {
      simulationRef.current.alpha(0.35);
    }
    simulationRef.current.tick(1);
    // Trigger registered tick listener manually so DOM & telemetry update immediately
    const onTickFn = simulationRef.current.on('tick');
    if (typeof onTickFn === 'function') {
      onTickFn.call(simulationRef.current);
    }
    setPhysicsDebugConfig(prev => ({ ...prev, isPaused: true }));
    physicsDebugConfigRef.current.isPaused = true;
  };

  const handleSelectPhysicsPreset = (presetId: Exclude<PhysicsPresetId, 'CUSTOM'>) => {
    const spec = PHYSICS_PRESET_SPECS.find(p => p.id === presetId);
    if (!spec) return;
    applyLivePhysicsDebugConfig(
      {
        activePreset: presetId,
        ...spec.config
      },
      0.6
    );
  };

  // Smooth Camera Auto-Pan & Highlight for Stress Hotspot Nodes
  const handleFocusHotspotNode = (nodeId: string) => {
    const targetNode = activeGraphData.nodes.find(n => n.id === nodeId);
    if (!targetNode) return;
    setActiveHotspotNodeId(nodeId);
    onNodeClick(targetNode);

    if (
      svgRef.current &&
      zoomRef.current &&
      typeof targetNode.x === 'number' &&
      typeof targetNode.y === 'number'
    ) {
      const { width, height } = dimensionsRef.current;
      if (width > 0 && height > 0) {
        const targetScale = 1.42;
        const tx = width / 2 - targetNode.x * targetScale;
        const ty = height / 2 - targetNode.y * targetScale;
        d3.select(svgRef.current)
          .transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .call(
            zoomRef.current.transform as any,
            d3.zoomIdentity.translate(tx, ty).scale(targetScale)
          );
      }
    }
  };

  // Smooth Camera Auto-Pan & Highlight for Synaptic Bottleneck Links
  const handleFocusBottleneckLink = (sourceId: string, targetId: string) => {
    const sNode = activeGraphData.nodes.find(n => n.id === sourceId);
    const tNode = activeGraphData.nodes.find(n => n.id === targetId);
    if (!sNode || !tNode) return;
    setActiveHotspotNodeId(sNode.id);
    onNodeClick(sNode);

    if (
      svgRef.current &&
      zoomRef.current &&
      typeof sNode.x === 'number' &&
      typeof sNode.y === 'number' &&
      typeof tNode.x === 'number' &&
      typeof tNode.y === 'number'
    ) {
      const { width, height } = dimensionsRef.current;
      if (width > 0 && height > 0) {
        const midX = (sNode.x + tNode.x) / 2;
        const midY = (sNode.y + tNode.y) / 2;
        const targetScale = 1.32;
        const tx = width / 2 - midX * targetScale;
        const ty = height / 2 - midY * targetScale;
        d3.select(svgRef.current)
          .transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .call(
            zoomRef.current.transform as any,
            d3.zoomIdentity.translate(tx, ty).scale(targetScale)
          );
      }
    }
  };

  // One-Click Synaptic Homeostasis & Bottleneck Relief Pulse
  const handleTriggerHomeostaticPulse = () => {
    const nowMs = performance.now();
    lastHomeostaticPulseMsRef.current = nowMs;
    homeostaticPulsesCountRef.current += 1;

    const targetEqDist = physicsDebugConfigRef.current.linkDistance || 90;
    const simNodeIdSet = new Set(activeGraphData.nodes.map(n => n.id));
    const safeLinks = activeGraphData.links.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
      return s && t && simNodeIdSet.has(s) && simNodeIdSet.has(t);
    });

    safeLinks.forEach(l => {
      const sObj = l.source as GraphNode;
      const tObj = l.target as GraphNode;
      const sx = sObj.x || 0;
      const sy = sObj.y || 0;
      const tx = tObj.x || 0;
      const ty = tObj.y || 0;
      const dx = tx - sx;
      const dy = ty - sy;
      const actualDist = Math.hypot(dx, dy);
      const strain = Math.abs(actualDist - targetEqDist) / Math.max(1, targetEqDist);
      const curCond = typeof l.conductivity === 'number' ? l.conductivity : 0.82;

      // 1. Reinforce synaptic conductivity on strained or low-G links
      if (strain > 0.12 || curCond < 1.05) {
        const nextCond = Math.min(1.85, curCond + 0.28 * (1 + strain));
        l.conductivity = nextCond;
        if (sObj.id && tObj.id) {
          const lKey = sObj.id < tObj.id ? `${sObj.id}__${tObj.id}` : `${tObj.id}__${sObj.id}`;
          linkConductivityOverridesRef.current.set(lKey, nextCond);
        }
      }

      // 2. Relax local spring tension 18% closer to equilibrium for unpinned endpoints
      if (actualDist > 1 && strain > 0.15) {
        const delta = (actualDist - targetEqDist) * 0.09;
        const ux = dx / actualDist;
        const uy = dy / actualDist;
        if (sObj.fx == null && sObj.fy == null && typeof sObj.x === 'number' && typeof sObj.y === 'number') {
          sObj.x += ux * delta;
          sObj.y += uy * delta;
        }
        if (tObj.fx == null && tObj.fy == null && typeof tObj.x === 'number' && typeof tObj.y === 'number') {
          tObj.x -= ux * delta;
          tObj.y -= uy * delta;
        }
      }
    });

    // 3. Damp excess kinetic velocity jitter across all nodes
    activeGraphData.nodes.forEach(n => {
      n.vx = (n.vx || 0) * 0.35;
      n.vy = (n.vy || 0) * 0.35;
    });

    // 4. Emit expanding bioluminescent homeostatic relief waves from top stress hotspots
    const waveNodes = latestTopHotspotsRef.current
      .slice(0, 3)
      .map(h => activeGraphData.nodes.find(n => n.id === h.nodeId))
      .filter((n): n is GraphNode => !!n && typeof n.x === 'number' && typeof n.y === 'number');

    const origins =
      waveNodes.length > 0
        ? waveNodes.map(n => ({ x: n.x!, y: n.y!, timestamp: nowMs }))
        : [{ x: (dimensionsRef.current.width || 1200) / 2, y: (dimensionsRef.current.height || 800) / 2, timestamp: nowMs }];

    homeostaticWaveOriginsRef.current = [...homeostaticWaveOriginsRef.current, ...origins];

    if (simulationRef.current) {
      if (!physicsDebugConfigRef.current.isPaused) {
        simulationRef.current.alpha(Math.max(simulationRef.current.alpha(), 0.28)).restart();
      } else {
        const onTickFn = simulationRef.current.on('tick');
        if (typeof onTickFn === 'function') {
          onTickFn.call(simulationRef.current);
        }
      }
    }

    setPhysicsTelemetry(prev => ({
      ...prev,
      homeostaticPulsesCount: homeostaticPulsesCountRef.current
    }));
  };

  // Autonomous Aether Agent Swarm Initialization & Background Step Loop
  useEffect(() => {
    if (activeGraphData.nodes.length > 0 && effectiveAetherConfig.enabled) {
      const bounds = {
        width: dimensionsRef.current.width || 1200,
        height: dimensionsRef.current.height || 800
      };
      const initialized = initializeAetherAgents(
        effectiveAetherConfig.agentCount,
        bounds
      );
      aetherAgentsRef.current = initialized;
      setAetherAgents(initialized);
    }
  }, [activeGraphData.nodes.length, effectiveAetherConfig.agentCount, effectiveAetherConfig.enabled]);

  useEffect(() => {
    if (!effectiveAetherConfig.enabled) return;
    let animId: number;
    const loop = () => {
      const now = performance.now();
      if (now - lastAetherStepMsRef.current >= 33) {
        lastAetherStepMsRef.current = now;

        if (aetherAgentsRef.current.length > 0 && activeGraphData.nodes.length > 0) {
          const bounds = {
            width: dimensionsRef.current.width || 1200,
            height: dimensionsRef.current.height || 800
          };
          const topStressIds = latestTopHotspotsRef.current.map(h => h.nodeId);
          const { updatedAgents, pulseEvents } = stepAetherSwarm(
            aetherAgentsRef.current,
            activeGraphData.nodes,
            activeGraphData.links,
            effectiveAetherConfig,
            bounds,
            topStressIds
          );
          aetherAgentsRef.current = updatedAgents;
          setAetherAgents(updatedAgents);

          if (pulseEvents.length > 0) {
            pulseEvents.forEach(p => {
              onTriggerAetherPulse?.(p);
              homeostaticWaveOriginsRef.current.push({
                x: p.x,
                y: p.y,
                timestamp: performance.now()
              });
              handleTriggerHomeostaticPulse();
            });

            setAetherPulses(prev => {
              const fresh = [...prev, ...pulseEvents].filter(
                item => now - item.timestamp < 2500
              );
              return fresh;
            });
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [effectiveAetherConfig, activeGraphData.nodes, activeGraphData.links, onTriggerAetherPulse]);

  // Screen-Adaptive Safe-Area Camera Auto-Fit
  const handleFitGraphToScreen = (durationMs: number = 680) => {
    if (!svgRef.current || !zoomRef.current) return;
    const validNodes = activeGraphData.nodes.filter(
      n => typeof n.x === 'number' && !Number.isNaN(n.x) && typeof n.y === 'number' && !Number.isNaN(n.y)
    );
    if (validNodes.length === 0) return;

    const { width, height } = dimensionsRef.current;
    if (width <= 0 || height <= 0) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    validNodes.forEach(n => {
      const r = (n.radius || 22) + 36;
      const nx = n.x as number;
      const ny = n.y as number;
      if (nx - r < minX) minX = nx - r;
      if (nx + r > maxX) maxX = nx + r;
      if (ny - r < minY) minY = ny - r;
      if (ny + r > maxY) maxY = ny + r;
    });

    const graphW = Math.max(180, maxX - minX);
    const graphH = Math.max(180, maxY - minY);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const padLeft = Math.min(width * 0.35, safeInsets.left);
    const padRight = Math.min(width * 0.35, safeInsets.right);
    const padTop = Math.min(height * 0.25, safeInsets.top);
    const padBottom = Math.min(height * 0.25, safeInsets.bottom);

    const availW = Math.max(220, width - padLeft - padRight);
    const availH = Math.max(200, height - padTop - padBottom);
    const safeCenterX = padLeft + availW / 2;
    const safeCenterY = padTop + availH / 2;

    const targetScale = Math.max(
      0.38,
      Math.min(1.28, Math.min(availW / graphW, availH / graphH) * 0.9)
    );

    const tx = safeCenterX - midX * targetScale;
    const ty = safeCenterY - midY * targetScale;

    d3.select(svgRef.current)
      .transition()
      .duration(durationMs)
      .ease(d3.easeCubicOut)
      .call(
        zoomRef.current.transform as any,
        d3.zoomIdentity.translate(tx, ty).scale(targetScale)
      );
  };

  // Trigger camera fit when fitViewportTrigger increments or when topology changes under autoOptimizeScreen
  useEffect(() => {
    if (fitViewportTrigger > 0) {
      const t = window.setTimeout(() => handleFitGraphToScreen(650), 120);
      return () => window.clearTimeout(t);
    }
  }, [fitViewportTrigger]);

  useEffect(() => {
    if (!autoOptimizeScreen || activeGraphData.nodes.length === 0) return;
    const t = window.setTimeout(() => {
      if (!focusedNodeId && !pinnedNodeId) {
        handleFitGraphToScreen(720);
      }
    }, 950);
    return () => window.clearTimeout(t);
  }, [activeGraphData.nodes.length, autoOptimizeScreen]);

  // Auto-Adaptive Density Tuning: automatically apply recommended preset when graph topology changes
  useEffect(() => {
    if (!physicsDebugConfigRef.current.autoAdaptiveDensity) return;
    const recommended = recommendPresetForTopology(
      activeGraphData.nodes.length,
      activeGraphData.links.length
    );
    if (physicsDebugConfigRef.current.activePreset !== recommended) {
      const spec = PHYSICS_PRESET_SPECS.find(p => p.id === recommended);
      if (spec) {
        applyLivePhysicsDebugConfig(
          {
            activePreset: recommended,
            ...spec.config
          },
          0.5
        );
      }
    }
  }, [activeGraphData.nodes.length, activeGraphData.links.length, physicsDebugConfig.autoAdaptiveDensity]);

  const activeSpec = useMemo(
    () => DIAGRAM_PARADIGM_SPECS.find(s => s.id === diagramParadigm) || DIAGRAM_PARADIGM_SPECS[0],
    [diagramParadigm]
  );

  if (diagramParadigm === 'HOLOGRAPHIC_3D') {
    const selectedNodeObj =
      data.nodes.find(n => n.id === pinnedNodeId) ||
      data.nodes.find(n => n.id === focusedNodeId) ||
      null;

    return (
      <div className="relative w-full h-full bg-[#020617] overflow-hidden">
        <Graph3D
          nodes={data.nodes}
          links={data.links}
          continents={data.nodes.length > 0 ? [] : []}
          selectedNode={selectedNodeObj}
          focusedNodeId={focusedNodeId}
          focusTrigger={focusTrigger}
          resetAnchorsTrigger={resetAnchorsTrigger}
          onSelectNode={onNodeClick}
          onTogglePin={onTogglePin}
          activeCausalTrace={activeCausalTrace}
        />
        {viewportLabel && (
          <div className="absolute bottom-14 right-6 z-20 pointer-events-none flex flex-col items-end gap-0.5 px-3 py-1.5 bg-[#07090e]/90 border border-slate-800 rounded-sm font-mono text-[9px]">
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="font-bold">{viewportLabel}</span>
              <span>·</span>
              <span className="text-slate-200 font-bold">{activeSpec.fullName}</span>
            </div>
            <div className="text-[8px] text-slate-500">{activeSpec.wikiCategoryRef}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#020617] overflow-hidden">
      {/* WebGPU / Web Worker Acceleration & Physics Debugger HUD */}
      <div
        data-swarm-target="physics-engine-hud"
        className="absolute top-3 left-4 z-20 flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#07090e]/95 border border-slate-800 shadow-lg text-[10px] font-mono pointer-events-auto tabular-nums max-w-[calc(100vw-2rem)]"
      >
        <div
          className={`w-2 h-2 rounded-full ${
            physicsDebugConfig.isPaused
              ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
              : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]'
          }`}
        />
        <span className="text-slate-400 uppercase font-semibold">Physics:</span>
        <span className="text-emerald-300 font-bold">{engineStatus.engineType}</span>
        <span className="text-slate-600">|</span>
        <span className="text-sky-300 font-semibold">{engineStatus.lastFps || 60} FPS</span>
        <span className="hidden md:inline text-slate-600">|</span>
        <span className="hidden md:inline text-cyan-300" title="Current Simulation Alpha">
          α {physicsTelemetry.alpha.toFixed(3)}
        </span>
        <span className="hidden md:inline text-slate-600">|</span>
        <span className="hidden md:inline text-amber-300" title="Mean Node Velocity (px/tick)">
          v̄ {physicsTelemetry.avgVelocity.toFixed(2)}
        </span>
        <button
          type="button"
          data-swarm-target="fit-screen-btn"
          onClick={() => handleFitGraphToScreen(600)}
          className="ml-0.5 px-2 py-0.5 rounded bg-sky-950/90 hover:bg-sky-900 text-[9px] font-bold uppercase text-sky-200 border border-sky-500/50 cursor-pointer transition-colors"
          title="Auto-fit and center graph topology inside unobstructed screen safe-area"
        >
          Fit Screen
        </button>
        <button
          type="button"
          data-swarm-target="reheat-physics-btn"
          onClick={() => {
            if (simulationRef.current) {
              physicsDebugConfigRef.current.isPaused = false;
              setPhysicsDebugConfig(prev => ({ ...prev, isPaused: false }));
              simulationRef.current.alpha(0.8).restart();
            }
            setEngineStatus(physicsEngine.getStatus());
          }}
          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-300 hover:text-white cursor-pointer transition-colors"
          title="Reheat Force Physics"
        >
          Reheat
        </button>
        <button
          type="button"
          data-swarm-target="hud-quantum-stress-toggle"
          onClick={() =>
            applyLivePhysicsDebugConfig({
              visualEncodingMode:
                physicsDebugConfig.visualEncodingMode === 'QUANTUM_STRESS'
                  ? 'NONE'
                  : 'QUANTUM_STRESS'
            })
          }
          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer transition-colors border ${
            physicsDebugConfig.visualEncodingMode === 'QUANTUM_STRESS'
              ? 'bg-violet-950/90 text-cyan-200 border-cyan-400/70 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              : 'bg-slate-800/90 hover:bg-slate-700 text-slate-400 border-slate-700'
          }`}
          title="Toggle Real-Time Bioluminescent Quantum Color Encoding (Node Kinetic Energy & Link Synaptic Conductivity)"
        >
          Quantum Stress: {physicsDebugConfig.visualEncodingMode === 'QUANTUM_STRESS' ? 'ON' : 'OFF'}
        </button>
        {physicsTelemetry.topStressNodes.length > 0 && (
          <button
            type="button"
            data-swarm-target="hud-next-hotspot-btn"
            onClick={() => {
              const list = physicsTelemetry.topStressNodes;
              if (list.length === 0) return;
              const idx = hotspotCycleIndexRef.current % list.length;
              hotspotCycleIndexRef.current = (idx + 1) % list.length;
              handleFocusHotspotNode(list[idx].nodeId);
            }}
            className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-200 border border-cyan-500/50 text-[9px] font-bold uppercase cursor-pointer transition-colors"
            title="Auto-pan camera and highlight next top network stress hotspot node"
          >
            Hotspot #{(hotspotCycleIndexRef.current % Math.max(1, physicsTelemetry.topStressNodes.length)) + 1}
          </button>
        )}
        <button
          type="button"
          data-swarm-target="hud-homeostatic-pulse-btn"
          onClick={handleTriggerHomeostaticPulse}
          className="px-2 py-0.5 rounded bg-emerald-950/85 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-500/50 text-[9px] font-bold uppercase cursor-pointer transition-colors"
          title="Trigger Synaptic Homeostasis Relief Pulse (Reinforce bottleneck conductivity G and relax spring tension)"
        >
          Heal Stress
        </button>
        <button
          type="button"
          data-swarm-target="physics-debugger-toggle"
          onClick={() => setIsPhysicsDebuggerOpen(prev => !prev)}
          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer transition-colors border ${
            isPhysicsDebuggerOpen
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border-slate-700'
          }`}
          title="Toggle Real-Time Physics Debugger Overlay"
        >
          Physics Debugger
        </button>
      </div>

      {/* Real-Time Interactive Physics Debugger Overlay */}
      <PhysicsDebuggerOverlay
        isOpen={isPhysicsDebuggerOpen}
        onClose={() => setIsPhysicsDebuggerOpen(false)}
        config={physicsDebugConfig}
        telemetry={physicsTelemetry}
        onUpdateConfig={applyLivePhysicsDebugConfig}
        onSelectPreset={handleSelectPhysicsPreset}
        onResetDefaults={() => applyLivePhysicsDebugConfig(DEFAULT_PHYSICS_DEBUG_CONFIG, 0.65)}
        onReheat={(alpha = 0.85) => {
          applyLivePhysicsDebugConfig({ isPaused: false }, alpha);
          setEngineStatus(physicsEngine.getStatus());
        }}
        onStepTick={handleStepPhysicsTick}
        onReleaseAllPins={handleReleaseAllPinnedNodes}
        onFocusHotspotNode={handleFocusHotspotNode}
        onFocusBottleneckLink={handleFocusBottleneckLink}
        onTriggerHomeostaticPulse={handleTriggerHomeostaticPulse}
        activeHotspotNodeId={activeHotspotNodeId}
      />

      {/* Active Epistemic Causal Trace HUD */}
      {activeCausalTrace && (
        <div
          data-swarm-target="causal-trace-hud"
          className="absolute top-4 right-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-950/95 border border-emerald-500/70 shadow-[0_0_25px_rgba(16,185,129,0.25)] text-xs font-mono pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-ping" />
            <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider">
              Synaptic Pathway Active
            </span>
          </div>
          <span className="text-slate-200 font-bold truncate max-w-[220px]">
            {activeCausalTrace.steps[0]?.nodeLabel} → {activeCausalTrace.steps[activeCausalTrace.steps.length - 1]?.nodeLabel}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold shrink-0">
            {activeCausalTrace.totalResonance}% Resonance
          </span>
          {onClearCausalTrace && (
            <button
              type="button"
              data-swarm-target="causal-trace-selector"
              onClick={onClearCausalTrace}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Viewport Paradigm Telemetry Watermark / Header Badge */}
      {viewportLabel && (
        <div className="absolute bottom-14 right-6 z-20 pointer-events-none flex flex-col items-end gap-0.5 px-3 py-1.5 bg-[#07090e]/90 border border-slate-800 rounded-sm">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-cyan-400">
            <span>{viewportLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-200 font-bold">{activeSpec.fullName}</span>
          </div>
          <div className="text-[8px] font-mono text-slate-500">
            {activeSpec.wikiCategoryRef}
          </div>
        </div>
      )}

      {/* Biomimetic Mycelial Foraging & Cytoplasmic Streaming Overlay */}
      <BiomimeticOverlay
        hyphae={biomimeticHyphae}
        links={activeGraphData.links}
        width={dimensionsRef.current.width}
        height={dimensionsRef.current.height}
        transformK={viewportTransform.k}
        transformX={viewportTransform.x}
        transformY={viewportTransform.y}
        enabled={biomimeticConfig?.enabled !== false && diagramParadigm === 'FORCE_CONTINENTS' && !isLoading}
        showHyphae={biomimeticConfig?.showHyphae !== false}
        morphicPulseTimestamp={morphicPulseTimestamp}
        beacons={chemotacticBeacons}
      />

      {/* D3 Spring Tensor Harmonic Vector Coil Overlay */}
      <SpringOverlay
        links={activeGraphData.links}
        width={dimensionsRef.current.width}
        height={dimensionsRef.current.height}
        transformK={viewportTransform.k}
        transformX={viewportTransform.x}
        transformY={viewportTransform.y}
        centralityMap={centralityMap}
        enabled={diagramParadigm === 'FORCE_CONTINENTS' && !isLoading}
      />

      {/* Autonomous Aether Agent Swarm Bioluminescent Telemetry Overlay */}
      <AetherSwarmOverlay
        agents={aetherAgents}
        pulses={aetherPulses}
        pulseEvents={aetherPulses}
        width={dimensionsRef.current.width}
        height={dimensionsRef.current.height}
        transformK={viewportTransform.k}
        transformX={viewportTransform.x}
        transformY={viewportTransform.y}
        enabled={effectiveAetherConfig.enabled && !isLoading}
      />

      {/* Dynamic Counterfactual Divergence Diff Heatmap Overlay */}
      <DivergenceDiffOverlay
        diff={divergenceDiff}
        role={divergenceRole}
        nodes={activeGraphData.nodes}
        links={activeGraphData.links}
        width={dimensionsRef.current.width}
        height={dimensionsRef.current.height}
        transformK={viewportTransform.k}
        transformX={viewportTransform.x}
        transformY={viewportTransform.y}
        enabled={showDivergenceHeatmap && !!divergenceDiff}
      />

      <svg ref={svgRef} className="w-full h-full cursor-crosshair" style={{ touchAction: 'none' }}>
        <g ref={containerRef} />
      </svg>

      {isLoading && data.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-3xl z-50 pointer-events-none">
          <div className="flex flex-col items-center gap-6 p-10 bg-slate-950/95 border-2 border-sky-400/60 rounded-[3rem] shadow-[0_0_50px_rgba(14,165,233,0.35)] ring-1 ring-white/20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 bg-sky-400 rounded-full animate-ping" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sky-300 font-black tracking-[0.4em] uppercase text-xs mb-1">Neural Link Active</p>
              <p className="text-slate-400 font-bold text-[10px] animate-pulse">Materializing conceptual vectors...</p>
            </div>
          </div>
        </div>
      )}

      {isLoading && data.nodes.length > 0 && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-sky-400/60 shadow-[0_0_20px_rgba(14,165,233,0.3)] font-mono text-[10px] text-sky-300">
          <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold uppercase tracking-wider">Syncing Frontier Vector...</span>
        </div>
      )}

      {/* Radiant Neon Pulse Ring Keyframe Animations */}
      <style>{`
        @keyframes radiantNeonPulse1 {
          0% {
            r: 32px;
            opacity: 0.95;
            stroke-width: 4px;
          }
          50% {
            opacity: 0.55;
            stroke-width: 2.5px;
          }
          100% {
            r: 85px;
            opacity: 0;
            stroke-width: 1px;
          }
        }

        @keyframes radiantNeonPulse2 {
          0% {
            r: 26px;
            opacity: 0;
          }
          20% {
            opacity: 0.9;
            stroke-width: 3.5px;
          }
          65% {
            opacity: 0.4;
            stroke-width: 2px;
          }
          100% {
            r: 115px;
            opacity: 0;
            stroke-width: 0.5px;
          }
        }

        @keyframes radiantHudRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .radiant-pulse-active-1 {
          animation: radiantNeonPulse1 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          transform-origin: 0 0;
        }

        .radiant-pulse-active-2 {
          animation: radiantNeonPulse2 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          animation-delay: 0.8s;
          transform-origin: 0 0;
        }

        .radiant-hud-rotate {
          animation: radiantHudRotate 20s linear infinite;
          transform-origin: 0 0;
        }
      `}</style>
    </div>
  );
};

export default Graph;
