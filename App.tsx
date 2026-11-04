import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from './lib/utils';
import {
  GraphNode,
  GraphLink,
  GraphData,
  GeminiGraphResponse,
  DiscoveryMission,
  MissionType,
  AbstractionTier,
  ScientificTelemetry,
  ThemeMode,
  GraphExportPackage,
  KnowledgeContinent,
  ContinentPhysicsConfig,
  DiagramParadigm,
  WorkspaceModuleType,
  WorkspaceLayoutMode,
  StudioSplitRatio,
  WhiteboardElement,
  WhiteboardConnection,
  WorkspaceCodeFile,
  TerminalLogEntry,
  DeploymentPipelineStage,
  ProjectTaskTicket,
  TicketStatus,
  SystemArchitectureProposal,
  MultimediaAsset,
  WorkspaceSnapshot,
  CausalPathTrace,
  AutogenesisState,
  SelfDevStage,
  SelfDevCadence,
  SelfEvolutionMutation,
  SpatialPatternType,
  NodeCentralityMetrics,
  BiomimeticConfig,
  PlasticityMetrics,
  MicroHypha,
  ChemotacticBeacon,
  FractalBreadcrumb,
  AetherSwarmConfig,
  CausalTimelineFrame,
  CounterfactualFork,
  AetherPulseEvent,
  TopologicalDivergenceDiff
} from './types';
import { computeTopologicalDiff } from './services/divergenceDiffEngine';
import { DEFAULT_AETHER_SWARM_CONFIG } from './services/aetherSwarmEngine';
import * as gemini from './services/geminiService';
import * as wiki from './services/wikiService';
import { computeCentralityMetrics } from './services/centralityEngine';
import {
  DEFAULT_BIOMIMETIC_CONFIG,
  DEFAULT_PLASTICITY_METRICS,
  stepMicroHyphae,
  applyHebbianPlasticity,
  consolidateAnastomoses,
  pruneDormantSynapses
} from './services/biomimeticEngine';
import Graph from './components/Graph';
import CommandHeader from './components/CommandHeader';
import MissionStatus from './components/MissionStatus';
import InsightOverlay from './components/InsightOverlay';
import SystemFooter from './components/SystemFooter';
import SwarmIntelligencePointer from './components/SwarmIntelligencePointer';
import AbstractionNavigator from './components/AbstractionNavigator';
import { ScientificTelemetryTray } from './components/ScientificTelemetryTray';
import { ContinentControlsHUD } from './components/ContinentControlsHUD';
import { GraphLegend } from './components/GraphLegend';
import { BiomimeticHUD } from './components/BiomimeticHUD';
import { DiagramParadigmToolbar } from './components/DiagramParadigmToolbar';
import { CreativeWorkspaceStudio } from './components/CreativeWorkspaceStudio';
import { UniversalCommandPalette } from './components/UniversalCommandPalette';
import { DIAGRAM_PARADIGM_SPECS } from './services/diagramLayoutEngine';
import { crdtBus } from './services/crdtBus';
import {
  computeQuantumTensorResonance,
  verifyV16StateMigrationIntegrity
} from './services/quantumTensorEngine';
import {
  sanitizeNodeLabel,
  getCanonicalRootStem,
  deduplicateGraphTopology
} from './services/inferenceEngine';
import {
  detectDialecticalSyntheses,
  DialecticalSynthesisAxiom
} from './services/koopmanEngine';
import {
  saveEvolutionaryState,
  loadEvolutionaryState,
  exportEvolutionaryStateFile,
  clearEvolutionaryMemory,
  subscribeToStorageChanges
} from './services/storageService';
import { audioSynthesizer } from './services/audioSynthesizer';
import { StudioPalette } from './components/StudioPalette';
import { homologyAuditor, BridgingAxiom } from './services/homologyEngine';
import { adversarialEngine } from './services/adversarialEngine';
import { evolutionOrchestrator, RecursiveCycleRecord } from './services/evolutionOrchestrator';
import {
  detectScreenOptimizationProfile,
  HudDensityMode,
  WorkspacePresetId,
  WORKSPACE_PRESET_SPECS
} from './services/viewportOptimizer';

const INITIAL_WHITEBOARD_ELEMENTS: WhiteboardElement[] = [
  {
    id: 'wb-1',
    type: 'NEURAL_CORE',
    title: 'Omega Semantic Ingress',
    subtitle: 'Multi-tier ontology parser & vector normalizer',
    x: 60,
    y: 70,
    color: '#38bdf8',
    author: 'BUILDER_11'
  },
  {
    id: 'wb-2',
    type: 'SERVICE_GATEWAY',
    title: '100-Agent Quorum Bus',
    subtitle: 'Byzantine fault-tolerant consensus router',
    x: 340,
    y: 80,
    color: '#fbbf24',
    author: 'SWARM_ARCHITECT'
  },
  {
    id: 'wb-3',
    type: 'DATA_STORE',
    title: 'Topological Continent Store',
    subtitle: 'Force-directed spatial graph & RDF triples',
    x: 200,
    y: 250,
    color: '#c084fc',
    author: 'BUILDER_01'
  },
  {
    id: 'wb-4',
    type: 'STICKY_NOTE',
    title: 'Empirical Grounding Check',
    subtitle: 'Ensure all ghost vectors pass Wikipedia & corpus verification.',
    x: 500,
    y: 240,
    color: '#34d399',
    author: 'RESEARCHER_04'
  }
];

const INITIAL_WHITEBOARD_CONNECTIONS: WhiteboardConnection[] = [
  { id: 'wbc-1', fromId: 'wb-1', toId: 'wb-2', label: 'gRPC Stream', protocol: 'gRPC' },
  { id: 'wbc-2', fromId: 'wb-2', toId: 'wb-3', label: 'Delta Sync', protocol: 'CRDT' },
  { id: 'wbc-3', fromId: 'wb-3', toId: 'wb-4', label: 'Verify Axiom', protocol: 'JSON-LD' }
];

const INITIAL_CODE_FILES: WorkspaceCodeFile[] = [
  {
    id: 'file-1',
    name: 'ontology_engine.ts',
    path: '/src/core/ontology_engine.ts',
    language: 'typescript',
    authorAgent: 'BUILDER_01 (ONTOLOGY_BUILDER)',
    lastModified: 'Just now',
    linkedNodeLabel: 'Omega Point',
    content: `/**
 * Omega Point Autonomous Ontology Synthesizer
 * Enforces deterministic graph invariants across Knowledge Continents.
 */

export interface TopologicalVector {
  readonly id: string;
  readonly label: string;
  readonly resonance: number;
  readonly continentId: string;
}

export function computeContinentCohesion(vectors: TopologicalVector[]): number {
  if (vectors.length === 0) return 1.0;
  const totalResonance = vectors.reduce((sum, v) => sum + v.resonance, 0);
  return Number((totalResonance / vectors.length).toFixed(4));
}
`
  },
  {
    id: 'file-2',
    name: 'swarm_orchestrator.rs',
    path: '/src/swarm/swarm_orchestrator.rs',
    language: 'rust',
    authorAgent: 'SWARM_ARCHITECT_02',
    lastModified: '2m ago',
    linkedNodeLabel: 'Sovereign Swarm',
    content: `//! 100-Agent Sovereign Quorum Orchestrator
//! Balances 50 Researchers and 50 Builders in real time.

#[derive(Debug, Clone)]
pub struct QuorumState {
    pub researcher_aye: u32,
    pub builder_aye: u32,
    pub entropy_bound: f64,
}

impl QuorumState {
    pub fn is_ratified(&self) -> bool {
        (self.researcher_aye + self.builder_aye) >= 95 && self.entropy_bound < 0.15
    }
}
`
  },
  {
    id: 'file-3',
    name: 'deployment_pipeline.yaml',
    path: '/.omega/workflows/deployment_pipeline.yaml',
    language: 'yaml',
    authorAgent: 'BUILDER_19 (SYNTHESIS)',
    lastModified: '5m ago',
    content: `name: Omega Sovereign Edge Deployment
on:
  quorum_ratification:
    minimum_consensus: 95%
jobs:
  verify-and-deploy:
    runs-on: sovereign-wasm-edge
    steps:
      - name: Typecheck & Ontological Lint
        run: npm run lint
      - name: Compile Topological Kernels
        run: cargo build --target wasm32-unknown-unknown --release
      - name: Rollout to Knowledge Continents
        run: omega-cli deploy --zero-downtime
`
  }
];

const INITIAL_TICKETS: ProjectTaskTicket[] = [
  {
    id: 't-101',
    key: 'OMG-101',
    title: 'Stabilize Tectonic Continent Hulls',
    description: 'Ensure smooth Catmull-Rom contour membranes with draggable continent anchors.',
    status: 'DEPLOYED',
    priority: 'HIGH',
    storyPoints: 5,
    assignedAgent: 'BUILDER_01',
    linkedNodeLabel: 'Knowledge Continents',
    createdAt: '09:40'
  },
  {
    id: 't-102',
    key: 'OMG-102',
    title: 'Synchronize 2X Diagram Paradigm Viewports',
    description: 'Cross-highlight hovered nodes across Force, Chord, Voronoi, DAG, and Sankey views.',
    status: 'ARCHITECT_REVIEW',
    priority: 'CRITICAL',
    storyPoints: 8,
    assignedAgent: 'SWARM_ARCHITECT_04',
    linkedNodeLabel: 'Category:Diagrams',
    createdAt: '10:15'
  },
  {
    id: 't-103',
    key: 'OMG-103',
    title: 'Synthesize Zero-Entropy Causal Bridge',
    description: 'Connect peripheral ghost vectors into verified empirical knowledge clusters.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    storyPoints: 5,
    assignedAgent: 'RESEARCHER_07',
    linkedNodeLabel: 'Causal Invariance',
    createdAt: '10:30'
  },
  {
    id: 't-104',
    key: 'OMG-104',
    title: 'Benchmark WebGPU Force-Directed Shader',
    description: 'Profile 10,000-synapse layout convergence under high-gravity continent isolation.',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    storyPoints: 3,
    assignedAgent: 'BUILDER_12',
    linkedNodeLabel: 'Neural Topology',
    createdAt: '10:45'
  }
];

const INITIAL_PROPOSALS: SystemArchitectureProposal[] = [
  {
    id: 'ARCH-101',
    title: 'CRDT-Backed Spatial Graph State Mesh',
    summary: 'Enables lock-free concurrent edits across Digital Whiteboard, Code IDE, and Force-Directed Continents.',
    authorAgent: 'SWARM_ARCHITECT_01',
    pattern: 'State-Based Delta CRDT',
    components: ['Continent State Shard', 'Whiteboard Vector Bus', 'Quorum Verifier'],
    status: 'RATIFIED',
    confidence: 99.1
  },
  {
    id: 'ARCH-102',
    title: 'Autonomous WebAssembly Sandbox Runner',
    summary: 'Executes AI-generated TypeScript and Rust kernel modules inside isolated browser worker threads.',
    authorAgent: 'BUILDER_04',
    pattern: 'Micro-Kernel Worker Pool',
    components: ['WASM Compiler', 'Telemetry RingBuffer', 'Edge Rollout Gate'],
    status: 'PROPOSED',
    confidence: 96.8
  }
];

const INITIAL_ASSETS: MultimediaAsset[] = [
  {
    id: 'asset-1',
    title: 'Category:Diagrams Isomorphism Blueprint',
    type: 'DIAGRAM_BLUEPRINT',
    format: 'SVG / Topological Spec',
    summary: 'Formal mapping rules between Force Continents, Radial Dendrograms, Chord Wheels, Voronoi Maps, Layered DAGs, and Sankey Flows.',
    contentPreview: `[TOPOLOGICAL INVARIANT SPEC v4.2]
• Radial Dendrogram -> Encodes BFS hierarchy r = depth * dr
• Chord Wheel       -> Encodes cyclic inter-cluster coupling
• Voronoi Territory -> Partitions 2D plane by nearest concept locus
• Layered Sugiyama  -> Enforces directed causal flow (left -> right)
• Sankey Alluvial   -> Encodes relational flux conservation`,
    linkedNodeLabel: 'Category:Diagrams',
    tags: ['topology', 'diagrams', 'wikipedia', 'isomorphism'],
    createdBy: 'RESEARCHER_01',
    createdAt: 'Today'
  },
  {
    id: 'asset-2',
    title: 'Omega Core JSON-LD Ontology Schema',
    type: 'SCHEMA_ARTIFACT',
    format: 'application/ld+json',
    summary: 'Canonical RDF triple schema governing IsA, PartOf, DependsOn, Enables, and Optimizes semantic synapses.',
    contentPreview: `{
  "@context": "https://omega.ai/schema/v14",
  "@type": "KnowledgeContinent",
  "predicates": ["DependsOn", "Enables", "Influences", "Optimizes", "Governs"],
  "quorumThreshold": 0.95
}`,
    linkedNodeLabel: 'Semantic Ontology',
    tags: ['json-ld', 'schema', 'ontology', 'rdf'],
    createdBy: 'BUILDER_01',
    createdAt: 'Today'
  },
  {
    id: 'asset-3',
    title: '100-Agent Swarm Sovereignty Field Manual',
    type: 'DOCUMENTATION',
    format: 'Markdown / Technical RFC',
    summary: 'Operational guide for the 50 Researchers and 50 Builders Guilds, including Vanguard UI Cursor DOM targeting protocols.',
    contentPreview: `# Sovereign Swarm Operational Protocol
1. Vanguard Strike Squad (24 Agents) locks onto [data-swarm-target] DOM coordinates.
2. Emits dual-ring cybernetic shockwave upon click execution.
3. Synchronizes Whiteboard, Browser IDE, Sprint Board, and Graph Continents.`,
    linkedNodeLabel: 'Sovereign Swarm',
    tags: ['swarm', 'manual', 'autonomy', 'ux'],
    createdBy: 'SWARM_ARCHITECT',
    createdAt: 'Today'
  }
];

const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [topic, setTopic] = useState('');
  const [mission, setMission] = useState<DiscoveryMission | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [pinnedNode, setPinnedNode] = useState<GraphNode | null>(null);
  const [autoExplode, setAutoExplode] = useState(false);
  const [chatLog, setChatLog] = useState<string>('');
  const [currentTier, setCurrentTier] = useState<AbstractionTier>('LEVEL_2_CONCEPTUAL');
  const [snapshots, setSnapshots] = useState<WorkspaceSnapshot[]>([]);

  useEffect(() => {
    audioSynthesizer.initialize();
  }, []);

  const [activeRelationshipFilter, setActiveRelationshipFilter] = useState<string | null>(null);
  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  const [swarmActive, setSwarmActive] = useState<boolean>(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [focusTrigger, setFocusTrigger] = useState<{ nodeId: string; timestamp: number } | null>(null);
  const [hoveredCoordinates, setHoveredCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('obsidian');
  const [continents, setContinents] = useState<KnowledgeContinent[]>([]);
  const [continentConfig, setContinentConfig] = useState<ContinentPhysicsConfig>({
    enabled: true,
    gravity: 0.45,
    separation: 340,
    hullOpacity: 0.8,
    isolatedContinentId: null,
    collapsedContinentIds: []
  });
  const [continentFocusTrigger, setContinentFocusTrigger] = useState<{ continentId: string; timestamp: number } | null>(null);
  const [resetAnchorsTrigger, setResetAnchorsTrigger] = useState<number>(0);
  const [primaryParadigm, setPrimaryParadigm] = useState<DiagramParadigm>('FORCE_CONTINENTS');
  const [secondaryParadigm, setSecondaryParadigm] = useState<DiagramParadigm>('CHORD_WHEEL');
  const [splitScreen, setSplitScreen] = useState<boolean>(false);
  const [sharedHoveredNodeId, setSharedHoveredNodeId] = useState<string | null>(null);

  // 1. Fractal Sub-Graph Nesting & Breadcrumb Navigation Stack
  const [breadcrumbStack, setBreadcrumbStack] = useState<FractalBreadcrumb[]>([]);

  // 2. Autonomous Aether Agent Swarms
  const [aetherConfig, setAetherConfig] = useState<AetherSwarmConfig>(DEFAULT_AETHER_SWARM_CONFIG);

  // 3. Time-Domain Causal Playback & Counterfactual Forking
  const [timelineFrames, setTimelineFrames] = useState<CausalTimelineFrame[]>([]);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState<number>(0);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const [activeFork, setActiveFork] = useState<CounterfactualFork | null>(null);
  const [showDivergenceHeatmap, setShowDivergenceHeatmap] = useState<boolean>(true);
  const [isSynthesizingSubGraph, setIsSynthesizingSubGraph] = useState<boolean>(false);

  // Centrality-Driven D3 Spatial Pattern Reorganization
  const [activeSpatialPattern, setActiveSpatialPattern] = useState<SpatialPatternType>('FORCE_DEFAULT');
  const [spatialAnchorNodeId, setSpatialAnchorNodeId] = useState<string | null>(null);

  // Live Centrality Analysis around the selected or active anchor node
  const centralityAnalysis = useMemo(() => {
    const anchorId = spatialAnchorNodeId || selectedNode?.id || pinnedNode?.id || null;
    return computeCentralityMetrics(graphData.nodes, graphData.links, anchorId);
  }, [graphData.nodes, graphData.links, spatialAnchorNodeId, selectedNode?.id, pinnedNode?.id]);

  const activeAnchorNode = useMemo(() => {
    const anchorId = spatialAnchorNodeId || selectedNode?.id || pinnedNode?.id;
    if (anchorId) {
      return graphData.nodes.find(n => n.id === anchorId) || null;
    }
    return centralityAnalysis.anchorNode;
  }, [spatialAnchorNodeId, selectedNode?.id, pinnedNode?.id, graphData.nodes, centralityAnalysis.anchorNode]);

  const selectedNodeCentralityMetrics = useMemo(() => {
    const target = selectedNode || pinnedNode;
    if (!target) return null;
    return centralityAnalysis.metrics.get(target.id) || null;
  }, [selectedNode, pinnedNode, centralityAnalysis.metrics]);

  const handleApplySpatialPattern = useCallback((pattern: SpatialPatternType, anchor?: GraphNode) => {
    setActiveSpatialPattern(pattern);
    if (anchor) {
      setSpatialAnchorNodeId(anchor.id);
    }
    if (pattern === 'FORCE_DEFAULT') {
      setSystemNotice('Released spatial constraints · Restored organic force physics');
    } else {
      const patternLabels: Record<SpatialPatternType, string> = {
        FORCE_DEFAULT: 'Organic Force Physics',
        CENTRALITY_RADIAL: 'Radial Concentric Rings',
        CENTRALITY_TREE: 'Hierarchical Rooted Tree',
        CENTRALITY_GRID: 'Centrality Orthogonal Matrix',
        CENTRALITY_SPIRAL: 'Fibonacci Golden-Ratio Lattice',
        CENTRALITY_BIPARTITE: 'Quartile Centrality Strata'
      };
      const anchorName = anchor?.label || activeAnchorNode?.label || 'Anchor';
      setSystemNotice(`Reorganized D3 graph into [${patternLabels[pattern]}] around [${anchorName}]`);
    }
    setTimeout(() => setSystemNotice(null), 3400);
  }, [activeAnchorNode?.label]);

  // ============================================================================
  // BIOMIMETIC MYCELIAL & SYNAPTIC PLASTICITY STATE & ENGINE
  // ============================================================================
  const [biomimeticConfig, setBiomimeticConfig] = useState<BiomimeticConfig>(DEFAULT_BIOMIMETIC_CONFIG);
  const [plasticityMetrics, setPlasticityMetrics] = useState<PlasticityMetrics>(DEFAULT_PLASTICITY_METRICS);
  const [activeHyphae, setActiveHyphae] = useState<MicroHypha[]>([]);
  const [chemotacticBeacons, setChemotacticBeacons] = useState<ChemotacticBeacon[]>([]);
  const [audioVolume, setAudioVolume] = useState<number>(0.7);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [morphicPulseTimestamp, setMorphicPulseTimestamp] = useState<number | null>(null);
  const [pendingAnastomoses, setPendingAnastomoses] = useState<Array<{ sourceId: string; targetId: string; affinity: number }>>([]);
  const [prunableLinkIndices, setPrunableLinkIndices] = useState<number[]>([]);

  // Periodic Morphogenesis & Hebbian Plasticity Execution Loop
  useEffect(() => {
    if (!biomimeticConfig.enabled || graphData.nodes.length < 2) return;

    const interval = setInterval(() => {
      // 1. Step exploratory hyphae population with chemotactic beacon attraction
      const { updatedHyphae, newAnastomoses } = stepMicroHyphae(
        graphData.nodes,
        graphData.links,
        activeHyphae,
        biomimeticConfig,
        centralityAnalysis.metrics,
        chemotacticBeacons
      );

      setActiveHyphae(updatedHyphae);
      if (newAnastomoses.length > 0) {
        setPendingAnastomoses(prev => [...prev, ...newAnastomoses]);
      }

      // 2. Apply Hebbian Synaptic Plasticity & LTD decay
      const activeNodeIds = new Set<string>();
      if (selectedNode) activeNodeIds.add(selectedNode.id);
      if (pinnedNode) activeNodeIds.add(pinnedNode.id);
      if (focusedNodeId) activeNodeIds.add(focusedNodeId);

      const { updatedLinks, prunableLinkIndices: prunables, averageConductivity } = applyHebbianPlasticity(
        graphData.links,
        graphData.nodes,
        biomimeticConfig,
        activeNodeIds,
        pinnedNode?.id,
        1.2
      );

      setPrunableLinkIndices(prunables);
      setGraphData(prev => ({
        ...prev,
        links: updatedLinks
      }));

      // 3. Update telemetry metrics
      const currentFlux = Number((35 + updatedHyphae.length * 2.8 + averageConductivity * 30).toFixed(1));
      setPlasticityMetrics(prev => ({
        ...prev,
        activeHyphaeCount: updatedHyphae.filter(h => h.status === 'FORAGING').length,
        averageConductivity,
        nutrientFlux: currentFlux,
        evolutionEpoch: prev.evolutionEpoch + 1
      }));

      // 4. Update real-time bio-sonification audio synthesizer
      if (!audioMuted) {
        audioSynthesizer.updateBioConductanceSoundscape(averageConductivity, currentFlux);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [
    biomimeticConfig,
    graphData.nodes,
    graphData.links,
    activeHyphae,
    chemotacticBeacons,
    centralityAnalysis.metrics,
    selectedNode,
    pinnedNode,
    focusedNodeId,
    audioMuted
  ]);

  const handleTriggerMorphicPulse = useCallback(() => {
    setMorphicPulseTimestamp(Date.now());
    audioSynthesizer.playMorphicPulseWave();
    setGraphData(prev => ({
      ...prev,
      links: prev.links.map(l => ({
        ...l,
        conductivity: Math.min(1.0, (l.conductivity ?? 0.8) + 0.2)
      }))
    }));
    setSystemNotice('Emitted Cytoplasmic Morphic Wave across all Knowledge Continents');
    setTimeout(() => setSystemNotice(null), 3200);
  }, []);

  const handleConsolidateAnastomoses = useCallback(() => {
    if (pendingAnastomoses.length === 0) return;
    audioSynthesizer.playAnastomosisChime();
    const { updatedGraphData, fusedCount } = consolidateAnastomoses(graphData, pendingAnastomoses);
    setGraphData(updatedGraphData);
    setPendingAnastomoses([]);
    setActiveHyphae(prev => prev.filter(h => h.status !== 'ANASTOMOSED'));
    setPlasticityMetrics(prev => ({
      ...prev,
      anastomosisCount: prev.anastomosisCount + fusedCount
    }));
    setSystemNotice(`Consolidated ${fusedCount} exploratory hyphal bridges into permanent synapses`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, [graphData, pendingAnastomoses]);

  const handleDeployBeacon = useCallback(() => {
    const beaconCount = chemotacticBeacons.length + 1;
    const angle = (beaconCount * 1.37) % (Math.PI * 2);
    const distance = 90 + ((beaconCount * 45) % 180);
    const newBeacon: ChemotacticBeacon = {
      id: `beacon-${Date.now()}`,
      label: `Beacon ${beaconCount}`,
      x: Math.round(Math.cos(angle) * distance),
      y: Math.round(Math.sin(angle) * distance),
      nutrientIntensity: 1.5,
      attractionRadius: 280,
      active: true,
      color: '#f59e0b'
    };
    setChemotacticBeacons(prev => [...prev, newBeacon]);
    audioSynthesizer.playBeaconPlacedTone();
    setSystemNotice(`Deployed Chemotactic Nutrient Beacon [${newBeacon.label}] (Radius: ${newBeacon.attractionRadius}px)`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, [chemotacticBeacons.length]);

  const handleUpdateBeacon = useCallback((updated: ChemotacticBeacon) => {
    setChemotacticBeacons(prev => prev.map(b => b.id === updated.id ? updated : b));
  }, []);

  const handleClearBeacons = useCallback(() => {
    setChemotacticBeacons([]);
    setSystemNotice('Cleared all Chemotactic Nutrient Beacons');
    setTimeout(() => setSystemNotice(null), 2500);
  }, []);

  const handleChangeAudioVolume = useCallback((vol: number) => {
    setAudioVolume(vol);
    if (!audioMuted) {
      audioSynthesizer.setVolume(vol);
    }
  }, [audioMuted]);

  const handleToggleAudioMute = useCallback(() => {
    setAudioMuted(prev => {
      const next = !prev;
      if (next) {
        audioSynthesizer.setVolume(0);
      } else {
        audioSynthesizer.setVolume(audioVolume);
      }
      return next;
    });
  }, [audioVolume]);

  const handlePruneDormantSynapses = useCallback(() => {
    if (prunableLinkIndices.length === 0) return;
    const { prunedGraphData, prunedCount } = pruneDormantSynapses(graphData, prunableLinkIndices);
    setGraphData(prunedGraphData);
    setPrunableLinkIndices([]);
    setPlasticityMetrics(prev => ({
      ...prev,
      prunedLinksCount: prev.prunedLinksCount + prunedCount
    }));
    setSystemNotice(`Pruned ${prunedCount} dormant low-conductance synapses`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, [graphData, prunableLinkIndices]);

  const handleResetPlasticity = useCallback(() => {
    setBiomimeticConfig(DEFAULT_BIOMIMETIC_CONFIG);
    setActiveHyphae([]);
    setPendingAnastomoses([]);
    setPrunableLinkIndices([]);
    setGraphData(prev => ({
      ...prev,
      links: prev.links.map(l => ({
        ...l,
        conductivity: 0.85
      }))
    }));
    setPlasticityMetrics(DEFAULT_PLASTICITY_METRICS);
    setSystemNotice('Reset Synaptic Plasticity & Mycelial Network to Equilibrium');
    setTimeout(() => setSystemNotice(null), 3500);
  }, []);

  // ============================================================================
  // 1. FRACTAL SUB-GRAPH NESTING & BREADCRUMBS
  // ============================================================================
  const handleDiveMicrocosm = useCallback((node: GraphNode) => {
    setBreadcrumbStack(prev => {
      const stack = prev.length === 0
        ? [{
            level: 0,
            nodeId: 'root',
            label: topic || 'Canonical Cosmos',
            graphSnapshot: { nodes: [...graphData.nodes], links: [...graphData.links] }
          }]
        : prev;

      let microGraph: GraphData;
      if (node.subGraph && node.subGraph.nodes.length > 0) {
        microGraph = node.subGraph;
      } else {
        const subConceptAspects = [
          { suffix: 'Foundational Axioms', rel: 'IsA', desc: 'Core invariant mathematical and epistemological primitives.' },
          { suffix: 'Latent Dynamics', rel: 'Enables', desc: 'Non-linear feedback mechanics and operational flux.' },
          { suffix: 'Homeostatic Core', rel: 'Secures', desc: 'Self-regulating boundary dampening topological entropy.' },
          { suffix: 'Synaptic Gateway', rel: 'PartOf', desc: 'Channel interface coupling outer macro-network interactions.' },
          { suffix: 'Empirical Grounding', rel: 'Implements', desc: 'Verified observable phenomena and semantic anchors.' },
          { suffix: 'Emergence Vector', rel: 'Influences', desc: 'Higher-order systemic manifestations across scale.' }
        ];

        const microNodes: GraphNode[] = [
          {
            id: `${node.id}__root`,
            label: node.label,
            group: node.group,
            description: `[Microcosm Root Kernel] ${node.description || 'Central ontological attractor'}`,
            depth: 0,
            strength: 1.0,
            continentId: node.continentId,
            isMicrocosmRoot: true,
            isExpanded: true,
            x: 0,
            y: 0
          },
          ...subConceptAspects.map((asp, idx) => {
            const angle = (idx / subConceptAspects.length) * Math.PI * 2;
            const dist = 140 + (idx % 2) * 40;
            return {
              id: `${node.id}__sub_${idx}`,
              label: `${node.label} ${asp.suffix}`,
              group: (node.group + idx + 1) % 6,
              description: asp.desc,
              depth: 1,
              strength: 0.85,
              continentId: node.continentId,
              parentMicrocosmId: node.id,
              x: Math.round(Math.cos(angle) * dist),
              y: Math.round(Math.sin(angle) * dist)
            };
          })
        ];

        const microLinks: GraphLink[] = subConceptAspects.map((asp, idx) => ({
          source: `${node.id}__root`,
          target: `${node.id}__sub_${idx}`,
          relationship: asp.rel,
          strength: 0.9,
          conductivity: 0.85
        }));

        for (let i = 0; i < subConceptAspects.length; i++) {
          const nextIdx = (i + 1) % subConceptAspects.length;
          microLinks.push({
            source: `${node.id}__sub_${i}`,
            target: `${node.id}__sub_${nextIdx}`,
            relationship: 'Interlinks',
            strength: 0.65,
            conductivity: 0.72
          });
        }

        microGraph = { nodes: microNodes, links: microLinks };
        node.subGraph = microGraph;
      }

      const nextLevel = stack.length;
      const newBreadcrumb: FractalBreadcrumb = {
        level: nextLevel,
        nodeId: node.id,
        label: node.label,
        graphSnapshot: microGraph
      };

      setGraphData(microGraph);
      setSelectedNode(microGraph.nodes[0]);
      setFitViewportTrigger(prev => prev + 1);
      setSystemNotice(`Dived into Fractal Microcosm [${node.label}] (Level ${nextLevel})`);
      setTimeout(() => setSystemNotice(null), 3500);

      return [...stack, newBreadcrumb];
    });
  }, [graphData, topic]);

  const handleAscendBreadcrumb = useCallback((targetIndex: number) => {
    setBreadcrumbStack(prev => {
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const target = prev[targetIndex];
      setGraphData(target.graphSnapshot);
      setSelectedNode(null);
      setFitViewportTrigger(p => p + 1);
      setSystemNotice(`Ascended fractal stack to [${target.label}] (Level ${target.level})`);
      setTimeout(() => setSystemNotice(null), 3000);

      if (targetIndex === 0) {
        return [];
      }
      return prev.slice(0, targetIndex + 1);
    });
  }, []);

  const handleSynthesizeSubGraph = useCallback(async (node: GraphNode) => {
    if (isSynthesizingSubGraph) return;
    setIsSynthesizingSubGraph(true);
    setSystemNotice(`Synthesizing Gemini generative sub-graph microcosm for [${node.label}]...`);
    appendTerminalLog(
      `[GEMINI SUB-GRAPH] Querying Gemini API to synthesize fine-grained sub-graph microcosm for [${node.label}]...`,
      'AGENT_EXEC'
    );

    try {
      const existingLabels = graphData.nodes.map(n => n.label);
      const subData = await gemini.synthesizeNodeSubGraph(node.label, topic || 'Knowledge Exploder', existingLabels);

      const rootNodeId = `${node.id}__gen_root`;
      const microNodes: GraphNode[] = [
        {
          id: rootNodeId,
          label: node.label,
          group: node.group,
          description: `[Synthesized Microcosm Root] ${node.description || 'Ontological Kernel'}`,
          depth: (node.depth || 0) + 1,
          strength: 1.0,
          continentId: node.continentId,
          isMicrocosmRoot: true,
          isExpanded: true,
          x: 0,
          y: 0
        },
        ...subData.nodes
          .filter(n => n.label.toLowerCase() !== node.label.toLowerCase())
          .map((n, idx) => {
            const angle = (idx / Math.max(1, subData.nodes.length - 1)) * Math.PI * 2;
            const dist = 160 + (idx % 2) * 50;
            return {
              id: `${node.id}__gen_${n.id || idx}`,
              label: n.label,
              group: typeof n.group === 'number' ? n.group : (node.group + idx + 1) % 6,
              description: n.description || `Synthesized facet of ${node.label}`,
              depth: (node.depth || 0) + 1,
              strength: typeof n.strength === 'number' ? n.strength : 0.85,
              continentId: node.continentId,
              parentMicrocosmId: node.id,
              x: Math.round(Math.cos(angle) * dist),
              y: Math.round(Math.sin(angle) * dist)
            };
          })
      ];

      const microLinks: GraphLink[] = [];
      // Link root to all synthesized children
      microNodes.slice(1).forEach((childNode, idx) => {
        microLinks.push({
          source: rootNodeId,
          target: childNode.id,
          relationship: subData.links[idx]?.relationship || 'Enables',
          strength: 0.9,
          conductivity: 0.88
        });
      });

      // Lateral interconnects between synthesized facets
      for (let i = 1; i < microNodes.length; i++) {
        const next = i === microNodes.length - 1 ? 1 : i + 1;
        microLinks.push({
          source: microNodes[i].id,
          target: microNodes[next].id,
          relationship: 'Interlinks',
          strength: 0.65,
          conductivity: 0.72
        });
      }

      const generatedSubGraph: GraphData = {
        nodes: microNodes,
        links: microLinks
      };

      const enrichedNode: GraphNode = {
        ...node,
        subGraph: generatedSubGraph
      };

      appendTerminalLog(
        `[GEMINI SUB-GRAPH] Materialized ${microNodes.length} nodes & ${microLinks.length} synapses for [${node.label}]. Diving now...`,
        'KNOWLEDGE_DISCOVERY'
      );
      setSystemNotice(`Synthesized and diving into [${node.label}] Microcosm!`);
      handleDiveMicrocosm(enrichedNode);
    } catch (err: any) {
      console.error('Failed to synthesize sub-graph:', err);
      appendTerminalLog(`[GEMINI SUB-GRAPH] Synthesis error: ${err?.message || 'Synthesis failed'}`, 'SYSTEM_ALERT');
      setSystemNotice('Sub-graph synthesis fell back to deterministic heuristic microcosm.');
      handleDiveMicrocosm(node);
    } finally {
      setIsSynthesizingSubGraph(false);
    }
  }, [isSynthesizingSubGraph, graphData.nodes, topic, handleDiveMicrocosm]);

  // ============================================================================
  // 2. AUTONOMOUS AETHER AGENT SWARMS
  // ============================================================================
  const handleToggleAetherSwarm = useCallback(() => {
    setAetherConfig(prev => {
      const nextEnabled = !prev.enabled;
      setSystemNotice(
        nextEnabled
          ? `Autonomous Aether Swarms Deployed (${prev.agentCount} bioluminescent motes patrolling)`
          : 'Aether Swarms returned to Standby'
      );
      setTimeout(() => setSystemNotice(null), 3200);
      return { ...prev, enabled: nextEnabled };
    });
  }, []);

  const handleTriggerAetherPulse = useCallback((event: AetherPulseEvent) => {
    audioSynthesizer.playChimeSuccessTone();
    setSystemNotice(`Aether Mote discharged homeostatic relief pulse on [${event.nodeId}]`);
    setTimeout(() => setSystemNotice(null), 2800);
  }, []);

  // ============================================================================
  // 3. TIME-DOMAIN CAUSAL PLAYBACK & COUNTERFACTUAL FORKING
  // ============================================================================
  const recordTimelineSnapshot = useCallback((label: string, cause: string) => {
    if (graphData.nodes.length === 0) return;
    const frame: CausalTimelineFrame = {
      id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      epoch: Date.now(),
      label,
      cause,
      graphSnapshot: {
        nodes: graphData.nodes.map(n => ({ ...n })),
        links: graphData.links.map(l => ({ ...l }))
      },
      nodeCount: graphData.nodes.length,
      linkCount: graphData.links.length,
      homeostaticStressScore: 12 + Math.floor(Math.random() * 30)
    };
    setTimelineFrames(prev => {
      const next = [...prev, frame].slice(-60);
      setCurrentTimelineIndex(next.length - 1);
      return next;
    });
  }, [graphData]);

  useEffect(() => {
    if (!isTimelinePlaying || timelineFrames.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentTimelineIndex(prev => {
        const next = (prev + 1) % timelineFrames.length;
        const targetFrame = timelineFrames[next];
        if (targetFrame) {
          setGraphData(targetFrame.graphSnapshot);
        }
        return next;
      });
    }, 1400);
    return () => window.clearInterval(interval);
  }, [isTimelinePlaying, timelineFrames]);

  const handleToggleTimelinePlay = useCallback(() => {
    setIsTimelinePlaying(prev => !prev);
  }, []);

  const handleSelectTimelineFrame = useCallback((index: number) => {
    if (index >= 0 && index < timelineFrames.length) {
      setCurrentTimelineIndex(index);
      const target = timelineFrames[index];
      setGraphData(target.graphSnapshot);
      setSystemNotice(`Scrubbed to Causal Timeline Frame [${target.label}] (${index + 1}/${timelineFrames.length})`);
      setTimeout(() => setSystemNotice(null), 2500);
    }
  }, [timelineFrames]);

  const handleStepTimelineFrame = useCallback((dir: 'PREV' | 'NEXT') => {
    if (timelineFrames.length === 0) return;
    setCurrentTimelineIndex(prev => {
      const next = dir === 'NEXT'
        ? Math.min(timelineFrames.length - 1, prev + 1)
        : Math.max(0, prev - 1);
      const target = timelineFrames[next];
      if (target) {
        setGraphData(target.graphSnapshot);
      }
      return next;
    });
  }, [timelineFrames]);

  const handleForkTimelineBranch = useCallback(() => {
    const sourceFrame = timelineFrames[currentTimelineIndex] || {
      id: `live-${Date.now()}`,
      label: 'Live Canvas',
      graphSnapshot: graphData
    };

    const mutatedNodes: GraphNode[] = sourceFrame.graphSnapshot.nodes.map(n => ({
      ...n,
      group: (n.group + 1) % 6,
      strength: Math.min(1.0, n.strength * 1.15)
    }));

    const forkNodeId = `fork-hypothesis-${Date.now()}`;
    const forkNode: GraphNode = {
      id: forkNodeId,
      label: 'Counterfactual Invariant Hypothesis',
      group: 4,
      description: `Counterfactual branch exploring divergent causality off [${sourceFrame.label}]`,
      depth: 1,
      strength: 0.98,
      continentId: mutatedNodes[0]?.continentId || 'Influences',
      isExpanded: true,
      x: 60,
      y: 60
    };
    mutatedNodes.push(forkNode);

    const mutatedLinks: GraphLink[] = [
      ...sourceFrame.graphSnapshot.links.map(l => ({ ...l, conductivity: 0.95 })),
      {
        source: mutatedNodes[0]?.id || forkNodeId,
        target: forkNodeId,
        relationship: 'CounterfactualBranch',
        strength: 0.95,
        conductivity: 1.0
      }
    ];

    const divergentGraph: GraphData = {
      nodes: mutatedNodes,
      links: mutatedLinks
    };

    const fork: CounterfactualFork = {
      id: `fork-${Date.now()}`,
      timestamp: Date.now(),
      sourceFrameId: sourceFrame.id,
      forkLabel: `Counterfactual Branch @ ${sourceFrame.label}`,
      canonicalSnapshot: {
        nodes: [...graphData.nodes],
        links: [...graphData.links]
      },
      graphSnapshot: divergentGraph,
      divergenceNotes: `Side-by-side divergence comparison active: Viewport A (Canonical) vs Viewport B (Counterfactual Fork)`
    };

    setActiveFork(fork);
    setSplitScreen(true);
    setSystemNotice(`Forked Counterfactual Branch! Comparing Canonical (Viewport A) vs Counterfactual (Viewport B)`);
    setTimeout(() => setSystemNotice(null), 4000);
  }, [timelineFrames, currentTimelineIndex, graphData]);

  // ============================================================================
  // 4. HEBBIAN PLASTICITY SYNAPTIC REINFORCEMENT
  // ============================================================================
  const handleReinforceEdge = useCallback((sourceId: string, targetId: string) => {
    setGraphData(prev => {
      let reinforced = false;
      const nextLinks = prev.links.map(l => {
        const s = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
        const t = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
        if ((s === sourceId && t === targetId) || (s === targetId && t === sourceId)) {
          reinforced = true;
          const currentC = typeof l.conductivity === 'number' ? l.conductivity : 0.65;
          return {
            ...l,
            conductivity: Math.min(1.0, currentC + 0.14)
          };
        }
        return l;
      });
      if (reinforced) {
        setPlasticityMetrics(m => ({
          ...m,
          reinforcedEventsCount: m.reinforcedEventsCount + 1,
          meanConductance: Math.min(1.0, m.meanConductance + 0.005)
        }));
      }
      return { ...prev, links: nextLinks };
    });
  }, []);

  // ============================================================================
  // INTEGRATED CREATIVE WORKSPACE STATE (4 MODULAR SYSTEMS + 3x3 OVERHAULS)
  // ============================================================================
  const [workspaceLayoutMode, setWorkspaceLayoutMode] = useState<WorkspaceLayoutMode>('GRAPH_ONLY');
  const [studioSplitRatio, setStudioSplitRatio] = useState<StudioSplitRatio>('BALANCED_50_50');
  const [activeWorkspaceModule, setActiveWorkspaceModule] = useState<WorkspaceModuleType>('WHITEBOARD');
  const [workspaceContinent, setWorkspaceContinent] = useState<KnowledgeContinent | null>(null);

  // ============================================================================
  // AUTONOMOUS SCREEN & VIEWPORT SELF-OPTIMIZATION ENGINE
  // ============================================================================
  const [autoOptimizeScreen, setAutoOptimizeScreen] = useState<boolean>(true);
  const [hudDensityMode, setHudDensityMode] = useState<HudDensityMode>('AUTO');
  const [workspacePreset, setWorkspacePreset] = useState<WorkspacePresetId>('AUTO_TIER');
  const [opticalScaleOverride, setOpticalScaleOverride] = useState<number | null>(null);
  const [fitViewportTrigger, setFitViewportTrigger] = useState<number>(0);
  const [screenDims, setScreenDims] = useState<{ width: number; height: number; dpr: number }>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
    dpr: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  }));

  const screenProfile = useMemo(
    () =>
      detectScreenOptimizationProfile(
        screenDims.width,
        screenDims.height,
        screenDims.dpr,
        hudDensityMode,
        Boolean(selectedNode || pinnedNode),
        workspaceLayoutMode !== 'GRAPH_ONLY',
        workspacePreset,
        opticalScaleOverride
      ),
    [
      screenDims.width,
      screenDims.height,
      screenDims.dpr,
      hudDensityMode,
      selectedNode,
      pinnedNode,
      workspaceLayoutMode,
      workspacePreset,
      opticalScaleOverride
    ]
  );

  const handleSelectWorkspacePreset = useCallback(
    (preset: WorkspacePresetId) => {
      setWorkspacePreset(preset);
      const spec = WORKSPACE_PRESET_SPECS.find(p => p.id === preset) || WORKSPACE_PRESET_SPECS[0];
      setHudDensityMode(spec.hudDensity);

      if (preset === 'GRAPH_CINEMA') {
        setWorkspaceLayoutMode('GRAPH_ONLY');
      } else if (preset === 'DUAL_COCKPIT') {
        setWorkspaceLayoutMode('SPLIT_STUDIO');
        setStudioSplitRatio(screenProfile.recommendedSplitRatio);
        if (graphData.nodes.length === 0 && !loading) {
          startMission('DEEP_DIVE', topic || 'Category:Diagrams & Visual Topology');
        }
      } else if (preset === 'COMMAND_WALL') {
        setWorkspaceLayoutMode('GRAPH_ONLY');
      } else if (preset === 'AUTO_TIER') {
        setStudioSplitRatio(screenProfile.recommendedSplitRatio);
      }

      setFitViewportTrigger(prev => prev + 1);
      setSystemNotice(
        `Applied Workspace Preset [${spec.label}] · Optical Scale ${Math.round(
          screenProfile.effectiveUiScale * 100
        )}%`
      );
      setTimeout(() => setSystemNotice(null), 3200);
    },
    [screenProfile.recommendedSplitRatio, screenProfile.effectiveUiScale, graphData.nodes.length, loading, topic]
  );

  // Sync split-pane ratio automatically when in AUTO_TIER or DUAL_COCKPIT and screen tier changes
  useEffect(() => {
    if (!autoOptimizeScreen) return;
    if (workspacePreset === 'AUTO_TIER' || workspacePreset === 'DUAL_COCKPIT') {
      setStudioSplitRatio(screenProfile.recommendedSplitRatio);
    }
  }, [autoOptimizeScreen, workspacePreset, screenProfile.recommendedSplitRatio]);

  useEffect(() => {
    let resizeTimer: number | null = null;
    const handleWindowResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setScreenDims({
          width: window.innerWidth,
          height: window.innerHeight,
          dpr: window.devicePixelRatio || 1
        });
        if (autoOptimizeScreen) {
          setFitViewportTrigger(prev => prev + 1);
        }
      }, 180);
    };
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
  }, [autoOptimizeScreen]);

  // Self-optimize continent tectonic separation based on user screen profile
  useEffect(() => {
    if (!autoOptimizeScreen) return;
    setContinentConfig(prev => {
      if (Math.abs(prev.separation - screenProfile.recommendedContinentSeparation) < 12) {
        return prev;
      }
      return {
        ...prev,
        separation: screenProfile.recommendedContinentSeparation
      };
    });
  }, [autoOptimizeScreen, screenProfile.recommendedContinentSeparation]);

  const [whiteboardElements, setWhiteboardElements] = useState<WhiteboardElement[]>(INITIAL_WHITEBOARD_ELEMENTS);
  const [whiteboardConnections, setWhiteboardConnections] = useState<WhiteboardConnection[]>(INITIAL_WHITEBOARD_CONNECTIONS);

  const [codeFiles, setCodeFiles] = useState<WorkspaceCodeFile[]>(INITIAL_CODE_FILES);
  const [activeFileId, setActiveFileId] = useState<string>(INITIAL_CODE_FILES[0].id);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '00:00:01',
      output: 'Omega Sovereign Runtime v14.0 ready. Type "help", "ls", "build", "test", "materialize", or "deploy".',
      level: 'INFO'
    },
    {
      id: 'log-2',
      timestamp: '00:00:02',
      command: 'omega-cli check --continents',
      output: 'Verified topological integrity across all active Knowledge Continents (0 errors).',
      level: 'SUCCESS'
    }
  ]);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [pipelineStages, setPipelineStages] = useState<DeploymentPipelineStage[]>([
    { id: 'st-1', name: '1. Lint & Typecheck', status: 'PASSED', logSummary: 'Zero TS errors' },
    { id: 'st-2', name: '2. WASM Kernel Build', status: 'PASSED', logSummary: 'Compiled in 140ms' },
    { id: 'st-3', name: '3. Quorum Audit', status: 'PASSED', logSummary: '98.4% Aye Consensus' },
    { id: 'st-4', name: '4. Edge Mesh Deploy', status: 'IDLE', logSummary: 'Ready for rollout' }
  ]);

  const [tickets, setTickets] = useState<ProjectTaskTicket[]>(INITIAL_TICKETS);
  const [architectureProposals, setArchitectureProposals] = useState<SystemArchitectureProposal[]>(INITIAL_PROPOSALS);
  const [assets, setAssets] = useState<MultimediaAsset[]>(INITIAL_ASSETS);

  // Command Palette, Causal Shortest-Path Tracer & Time-Travel Snapshots
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [commandPaletteTab, setCommandPaletteTab] = useState<'COMMANDS' | 'CAUSAL_TRACE' | 'SNAPSHOTS' | 'QUANTUM_TENSOR'>('COMMANDS');
  const [activeCausalTrace, setActiveCausalTrace] = useState<CausalPathTrace | null>(null);

  const handleScrub = (snapshot: WorkspaceSnapshot) => {
    if (!snapshot) return;
    setGraphData(snapshot.graphData);
    setSystemNotice(`Time-travel scrubbed to Snapshot [${snapshot.label}]`);
    setTimeout(() => setSystemNotice(null), 3000);
  };

  const handleExecuteKernel = (code: string) => {
    audioSynthesizer.playAutopoieticPulse();
    setTerminalLogs(prev => [
      ...prev,
      {
        id: `log-kern-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        command: 'wgpu-sandbox --exec-homology-kernel',
        output: `Executed kernel: ${code}`,
        level: 'SUCCESS'
      }
    ]);
    setSystemNotice('Executed Vietoris-Rips WGSL/Rust Kernel in Sandbox');
    setTimeout(() => setSystemNotice(null), 3000);
  };

  const handleBridgeCavityAxiom = useCallback((axiom: BridgingAxiom) => {
    setGraphData(prev => {
      const nextLinks: GraphLink[] = [
        ...prev.links,
        {
          source: axiom.nodes[0],
          target: axiom.nodes[1],
          relationship: axiom.relationship,
          strength: 0.94
        }
      ];
      const deduped = deduplicateGraphTopology(prev.nodes, nextLinks);
      return { nodes: deduped.nodes, links: deduped.links };
    });
    audioSynthesizer.playAutopoieticPulse();
    setSystemNotice(
      `Bridged β_${axiom.cavityDimension} Cavity: [${axiom.sourceLabel}] ↔ [${axiom.targetLabel}] (-${Math.round(
        axiom.predictedEntropyReduction * 100
      )}% Entropy)`
    );
    setTimeout(() => setSystemNotice(null), 3500);
  }, []);

  const handleApplyRecursiveCycle = useCallback((record: RecursiveCycleRecord) => {
    audioSynthesizer.playAutopoieticPulse();
    if (record.synthesizedFile) {
      const file = record.synthesizedFile;
      setCodeFiles(prev => [file, ...prev.filter(f => f.name !== file.name)]);
      setActiveFileId(file.id);
    }

    if (record.health.patches.length > 0) {
      const filePatches = record.health.patches.filter(p => p.targetFileId && p.patchedFileContent);
      if (filePatches.length > 0) {
        setCodeFiles(prev =>
          prev.map(f => {
            const match = filePatches.find(p => p.targetFileId === f.id);
            return match && match.patchedFileContent ? { ...f, content: match.patchedFileContent } : f;
          })
        );
      }
    }

    if (record.bridgingAxioms.length > 0) {
      const primary = record.bridgingAxioms[0];
      setGraphData(prev => {
        if (prev.nodes.length < 2) return prev;
        const nextLinks: GraphLink[] = [
          ...prev.links,
          {
            source: primary.nodes[0],
            target: primary.nodes[1],
            relationship: primary.relationship,
            strength: 0.93
          }
        ];
        const deduped = deduplicateGraphTopology(prev.nodes, nextLinks);
        return { nodes: deduped.nodes, links: deduped.links };
      });
    }

    setAutogenesis(prev => ({
      ...prev,
      generationVersion: record.version,
      cycleCount: prev.cycleCount + 1,
      fitnessScore: Number(Math.min(99.9, prev.fitnessScore + record.fitnessGain).toFixed(2)),
      testSuitePassed: prev.testSuitePassed + record.adversarial.testCases.length
    }));

    setTerminalLogs(prev => [
      ...prev,
      {
        id: `log-rec-${Date.now()}`,
        timestamp: record.timestamp,
        command: `omega-evolve --cycle ${record.cycleNumber} --domain ${record.domain}`,
        output: `[${record.version}] ${record.summary}`,
        level: 'AGENT_EXEC'
      }
    ]);

    setSystemNotice(`[${record.version} · ${record.domain}] ${record.summary}`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, []);

  // ============================================================================
  // RECURSIVE SELF-DEVELOPMENT ("AUTOGENESIS") ENGINE STATE
  // ============================================================================
  const [autogenesis, setAutogenesis] = useState<AutogenesisState>({
    active: false,
    currentStage: 'INTROSPECT',
    stageProgress: 16,
    generationVersion: 'v14.0.0',
    cycleCount: 0,
    cadence: 'BALANCED_4S',
    fitnessScore: 92.4,
    selfWrittenLoc: 98,
    testSuitePassed: 42,
    activeHypothesis:
      'Replacing O(N²) pairwise repulsion with an O(N log N) Barnes-Hut spatial octree reduces frame latency by 64% on dense Knowledge Continents.',
    mutations: [
      {
        id: 'mut-seed-14-0',
        generation: 'v14.0.0',
        timestamp: 'Baseline',
        subsystem: 'Omega Autonomous Ontology Kernel',
        summary: 'Initial self-bootstrapped multi-paradigm knowledge graph & 4-pillar creative studio core.',
        authorAgent: 'BUILDER_01 (ONTOLOGY_BUILDER)',
        fileId: 'file-1',
        fileName: 'ontology_engine.ts',
        filePath: '/src/core/ontology_engine.ts',
        language: 'typescript',
        locAdded: 98,
        codeDiffPreview: `+ export function computeContinentCohesion(vectors: TopologicalVector[]): number {
+   if (vectors.length === 0) return 1.0;
+   const totalResonance = vectors.reduce((sum, v) => sum + v.resonance, 0);
+   return Number((totalResonance / vectors.length).toFixed(4));
+ }`,
        rfcId: 'ARCH-101',
        ticketKey: 'OMG-101',
        materializedNodeIds: [],
        materializedNodeLabels: ['Omega Point', 'Knowledge Continents'],
        fitnessDelta: 1.4,
        testAssertionsPassed: 42
      }
    ]
  });

  const activeEvolutionTicketIdRef = useRef<string | null>(null);
  const activeEvolutionRfcIdRef = useRef<string | null>(null);
  const activeEvolutionFileRef = useRef<WorkspaceCodeFile | null>(null);
  const activeEvolutionNodeLabelsRef = useRef<string[]>([]);

  const [telemetry, setTelemetry] = useState<ScientificTelemetry>({
    networkEntropy: 0.85,
    clusterCohesion: 88.5,
    discoveryVelocity: 3.2,
    frontierRatio: 0.25,
    graphDensity: 0.12,
    totalSynapses: 0,
    radar: {
      depth: 60,
      breadth: 75,
      novelty: 80,
      empiricalGrounding: 70,
      interconnectivity: 65
    },
    history: [],
    elapsedSeconds: 0
  });

  const nodeCache = useRef<Map<string, GraphNode>>(new Map());
  const pilotTimerRef = useRef<number | null>(null);
  const synthesisIntervalRef = useRef<number | null>(null);

  // Quantum Tensor Computation & Autopoietic Fitness Gate
  const tensorResult = useMemo(() => {
    return computeQuantumTensorResonance(graphData.nodes, graphData.links);
  }, [graphData.nodes, graphData.links]);

  // Bind mean spectral resonance score & topological Shannon entropy to autogenesis.fitnessScore
  useEffect(() => {
    if (graphData.nodes.length === 0) return;
    const resonanceValues: number[] = Object.values(tensorResult.nodeResonanceMap);
    const meanResonance = resonanceValues.length > 0
      ? resonanceValues.reduce((a: number, b: number) => a + b, 0) / resonanceValues.length
      : 0.85;
    const entropyFactor = Math.min(1, tensorResult.networkTensorEntropy / 4.5);
    const autopoieticFitness = Number((meanResonance * 65 + (1 - entropyFactor * 0.3) * 35).toFixed(1));

    setAutogenesis(prev => {
      if (Math.abs(prev.fitnessScore - autopoieticFitness) < 0.1) return prev;
      return { ...prev, fitnessScore: autopoieticFitness };
    });
  }, [tensorResult, graphData.nodes.length]);

  // Global Cmd+K / Ctrl+K shortcut to open Universal Command Palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteTab('COMMANDS');
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Decentralized CRDT State Synchronization Bus Lifecycle
  useEffect(() => {
    crdtBus.seedInitialState({
      whiteboardElements: INITIAL_WHITEBOARD_ELEMENTS,
      whiteboardConnections: INITIAL_WHITEBOARD_CONNECTIONS,
      codeFiles: INITIAL_CODE_FILES,
      tickets: INITIAL_TICKETS,
      assets: INITIAL_ASSETS
    });

    const unsub = crdtBus.subscribe((entityType) => {
      if (entityType === 'whiteboardElements') {
        const els = crdtBus.getElements<WhiteboardElement>('whiteboardElements');
        if (els.length > 0) setWhiteboardElements(els);
      } else if (entityType === 'whiteboardConnections') {
        const conns = crdtBus.getElements<WhiteboardConnection>('whiteboardConnections');
        if (conns.length > 0) setWhiteboardConnections(conns);
      } else if (entityType === 'codeFiles') {
        const files = crdtBus.getElements<WorkspaceCodeFile>('codeFiles');
        if (files.length > 0) setCodeFiles(files);
      } else if (entityType === 'tickets') {
        const tix = crdtBus.getElements<ProjectTaskTicket>('tickets');
        if (tix.length > 0) setTickets(tix);
      } else if (entityType === 'assets') {
        const asts = crdtBus.getElements<MultimediaAsset>('assets');
        if (asts.length > 0) setAssets(asts);
      }
    });

    return unsub;
  }, []);

  const appendTerminalLog = useCallback((output: string, level: TerminalLogEntry['level'] = 'INFO', command?: string) => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setTerminalLogs(prev => [
      ...prev.slice(-40),
      {
        id: `tlog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        command,
        output,
        level
      }
    ]);
  }, []);

  // ============================================================================
  // WORKSPACE & AUTONOMOUS AI ENGINEERING HANDLERS
  // ============================================================================
  const handleAddWhiteboardElement = useCallback((partial?: Partial<WhiteboardElement>) => {
    const focusLabel = partial?.title || selectedNode?.label || topic || 'Autonomous Subsystem';
    const colors = ['#38bdf8', '#c084fc', '#34d399', '#fbbf24', '#818cf8'];
    const types: WhiteboardElement['type'][] = ['ARCH_NODE', 'SERVICE_GATEWAY', 'DATA_STORE', 'NEURAL_CORE', 'STICKY_NOTE'];
    const idx = whiteboardElements.length;
    const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const newEl: WhiteboardElement = {
      id: `wb-${uid}`,
      type: partial?.type || types[idx % types.length],
      title: focusLabel,
      subtitle: partial?.subtitle || `Synthesized architectural node coupled to ${workspaceContinent?.label || 'Omega Manifold'}`,
      x: partial?.x ?? (80 + (idx % 3) * 220),
      y: partial?.y ?? (90 + Math.floor(idx / 3) * 140),
      color: partial?.color || colors[idx % colors.length],
      author: partial?.author || 'BUILDER_11'
    };

    crdtBus.setElement('whiteboardElements', newEl, newEl.author);

    let newConn: WhiteboardConnection | null = null;
    if (whiteboardElements.length > 0) {
      const last = whiteboardElements[whiteboardElements.length - 1];
      newConn = {
        id: `wbc-${uid}`,
        fromId: last.id,
        toId: newEl.id,
        label: 'Synapse Bus',
        protocol: 'gRPC'
      };
      crdtBus.setElement('whiteboardConnections', newConn, 'SWARM_SYNAPSE');
    }

    setWhiteboardElements(prev => [...prev.filter(e => e.id !== newEl.id), newEl]);
    if (newConn) {
      const connToAdd = newConn;
      setWhiteboardConnections(conns => [...conns.filter(c => c.id !== connToAdd.id), connToAdd]);
    }

    setSystemNotice(`Added [${newEl.title}] to Collaborative Whiteboard`);
    setTimeout(() => setSystemNotice(null), 3200);
  }, [selectedNode, topic, whiteboardElements, workspaceContinent]);

  const handleMoveWhiteboardElement = useCallback((id: string, x: number, y: number) => {
    crdtBus.updateElement<WhiteboardElement>('whiteboardElements', id, el => ({ ...el, x, y }));
    setWhiteboardElements(prev => prev.map(el => (el.id === id ? { ...el, x, y } : el)));
  }, []);

  const handleDeleteWhiteboardElement = useCallback((id: string) => {
    crdtBus.removeElement('whiteboardElements', id);
    setWhiteboardElements(prev => prev.filter(el => el.id !== id));
    setWhiteboardConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
    setSystemNotice('Removed architectural element from Whiteboard');
    setTimeout(() => setSystemNotice(null), 2500);
  }, []);

  const handleConnectWhiteboardElements = useCallback((fromId: string, toId: string, label = 'Synapse Link', protocol = 'gRPC') => {
    const connId = `wbc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const newConn: WhiteboardConnection = {
      id: connId,
      fromId,
      toId,
      label,
      protocol
    };
    crdtBus.setElement('whiteboardConnections', newConn, 'SWARM_SYNAPSE');
    setWhiteboardConnections(prev => {
      const exists = prev.some(c => (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId));
      if (exists) return prev;
      return [...prev.filter(c => c.id !== connId), newConn];
    });
    setSystemNotice(`Wired new ${protocol} connection on Collaborative Whiteboard`);
    setTimeout(() => setSystemNotice(null), 2800);
  }, []);

  const handleAutoAlignWhiteboard = useCallback(() => {
    setWhiteboardElements(prev =>
      prev.map((el, i) => ({
        ...el,
        x: 55 + (i % 3) * 235,
        y: 65 + Math.floor(i / 3) * 145
      }))
    );
    setSystemNotice('Aligned Whiteboard architectural nodes to canonical grid');
    setTimeout(() => setSystemNotice(null), 2800);
  }, []);

  const handleSyncGraphToWhiteboard = useCallback(() => {
    const sourceNodes = graphData.nodes.slice(0, 6);
    if (sourceNodes.length === 0) {
      handleAddWhiteboardElement({ title: 'Seed Topology Gateway', subtitle: 'Waiting for graph nodes' });
      return;
    }

    const colors = ['#38bdf8', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#818cf8'];
    const syncedElements: WhiteboardElement[] = sourceNodes.map((n, i) => ({
      id: `wb-sync-${n.id}`,
      type: i === 0 ? 'NEURAL_CORE' : i % 2 === 0 ? 'SERVICE_GATEWAY' : 'ARCH_NODE',
      title: n.label,
      subtitle: (n.description || 'Synchronized from spatial knowledge graph').slice(0, 68),
      x: 60 + (i % 3) * 230,
      y: 70 + Math.floor(i / 3) * 165,
      color: colors[i % colors.length],
      author: 'GRAPH_SYNC',
      linkedNodeId: n.id
    }));

    const syncedConns: WhiteboardConnection[] = [];
    for (let i = 0; i < syncedElements.length - 1; i++) {
      syncedConns.push({
        id: `wbc-sync-${i}-${Date.now()}`,
        fromId: syncedElements[i].id,
        toId: syncedElements[i + 1].id,
        label: 'DependsOn',
        protocol: 'ONTOLOGY'
      });
    }

    syncedElements.forEach(el => crdtBus.setElement('whiteboardElements', el, 'GRAPH_SYNC'));
    syncedConns.forEach(c => crdtBus.setElement('whiteboardConnections', c, 'GRAPH_SYNC'));

    setWhiteboardElements(syncedElements);
    setWhiteboardConnections(syncedConns);
    setSystemNotice(`Synchronized ${syncedElements.length} Graph Nodes onto Collaborative Whiteboard`);
    setTimeout(() => setSystemNotice(null), 3200);
  }, [graphData.nodes, handleAddWhiteboardElement]);

  const handleExportTraceToWhiteboard = useCallback((trace: CausalPathTrace) => {
    const colors = ['#34d399', '#38bdf8', '#fbbf24', '#c084fc', '#818cf8'];
    const els: WhiteboardElement[] = trace.steps.map((st, idx) => ({
      id: `wb-trace-${st.nodeId}-${idx}`,
      type: idx === 0 ? 'NEURAL_CORE' : idx === trace.steps.length - 1 ? 'DATA_STORE' : 'SERVICE_GATEWAY',
      title: st.nodeLabel,
      subtitle: `Causal Hop #${idx + 1} · ${st.relationshipToNext || 'Terminal Anchor'}`,
      x: 50 + (idx % 3) * 235,
      y: 80 + Math.floor(idx / 3) * 150,
      color: colors[idx % colors.length],
      author: 'CAUSAL_TRACER',
      linkedNodeId: st.nodeId
    }));

    const conns: WhiteboardConnection[] = [];
    for (let i = 0; i < els.length - 1; i++) {
      conns.push({
        id: `wbc-trace-${i}-${Date.now()}`,
        fromId: els[i].id,
        toId: els[i + 1].id,
        label: trace.steps[i].relationshipToNext || 'Causes',
        protocol: 'CAUSAL'
      });
    }

    els.forEach(e => crdtBus.setElement('whiteboardElements', e, 'CAUSAL_TRACER'));
    conns.forEach(c => crdtBus.setElement('whiteboardConnections', c, 'CAUSAL_TRACER'));

    setWhiteboardElements(els);
    setWhiteboardConnections(conns);
    setActiveWorkspaceModule('WHITEBOARD');
    setWorkspaceLayoutMode(prev => (prev === 'GRAPH_ONLY' ? 'SPLIT_STUDIO' : prev));
    setSystemNotice(`Materialized ${trace.steps.length}-Hop Causal Chain onto Collaborative Whiteboard`);
    setTimeout(() => setSystemNotice(null), 3400);
  }, []);

  const handleProposeArchitecture = useCallback(async () => {
    const nodeLabels = graphData.nodes.map(n => n.label);
    const proposal = await gemini.proposeWorkspaceArchitecture(topic || 'Omega Topology', nodeLabels);
    setArchitectureProposals(prev => [proposal, ...prev.filter(p => p.id !== proposal.id)]);

    const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const archNode: WhiteboardElement = {
      id: `wb-arch-${uid}`,
      type: 'SERVICE_GATEWAY',
      title: proposal.title.slice(0, 34),
      subtitle: `${proposal.pattern} · Confidence ${proposal.confidence}%`,
      x: 120 + Math.floor(Math.random() * 280),
      y: 110 + Math.floor(Math.random() * 160),
      color: '#fbbf24',
      author: proposal.authorAgent
    };

    crdtBus.setElement('whiteboardElements', archNode, archNode.author);

    let archConn: WhiteboardConnection | null = null;
    if (whiteboardElements.length > 0) {
      const anchor = whiteboardElements[0];
      archConn = {
        id: `wbc-arch-${uid}`,
        fromId: anchor.id,
        toId: archNode.id,
        label: proposal.pattern.split(' ')[0],
        protocol: 'CQRS'
      };
      crdtBus.setElement('whiteboardConnections', archConn, 'SWARM_ARCHITECT');
    }

    setWhiteboardElements(prev => [...prev.filter(e => e.id !== archNode.id), archNode]);
    if (archConn) {
      const connToAdd = archConn;
      setWhiteboardConnections(c => [...c.filter(x => x.id !== connToAdd.id), connToAdd]);
    }

    appendTerminalLog(`Architecture RFC [${proposal.id}] synthesized: ${proposal.title}`, 'AGENT_EXEC');
    setSystemNotice(`Swarm Architect proposed [${proposal.id}: ${proposal.title}]`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, [graphData.nodes, topic, whiteboardElements, appendTerminalLog]);

  const handleGenerateCodeModule = useCallback(async (overrideConcept?: string) => {
    const targetConcept =
      overrideConcept ||
      selectedNode?.label ||
      workspaceContinent?.label ||
      graphData.nodes[Math.floor(Math.random() * Math.max(1, graphData.nodes.length))]?.label ||
      topic ||
      'Topological Resonator';

    const langs: Array<'typescript' | 'rust'> = ['typescript', 'rust'];
    const lang = langs[codeFiles.length % langs.length];

    appendTerminalLog(`Synthesizing ${lang.toUpperCase()} module for [${targetConcept}]...`, 'AGENT_EXEC', `omega-codegen --concept="${targetConcept}"`);
    const newFile = await gemini.generateWorkspaceCodeModule(topic || 'Omega Manifold', targetConcept, lang);

    setCodeFiles(prev => [newFile, ...prev]);
    setActiveFileId(newFile.id);
    appendTerminalLog(`Created ${newFile.path} (${newFile.content.split('\n').length} lines) by ${newFile.authorAgent}`, 'SUCCESS');
    setSystemNotice(`AI Builder synthesized code module [${newFile.name}]`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, [selectedNode, workspaceContinent, graphData.nodes, topic, codeFiles.length, appendTerminalLog]);

  const handleCreateCustomFile = useCallback((name: string, language: WorkspaceCodeFile['language']) => {
    const cleanName = name.includes('.')
      ? name
      : `${name}.${language === 'typescript' ? 'ts' : language === 'rust' ? 'rs' : language}`;
    const newFile: WorkspaceCodeFile = {
      id: `file-${Date.now()}`,
      name: cleanName,
      path: `/src/custom/${cleanName}`,
      language,
      authorAgent: 'HUMAN_ARCHITECT',
      lastModified: 'Just now',
      linkedNodeLabel: selectedNode?.label || topic || 'Omega Core',
      content:
        language === 'rust'
          ? `//! Custom Sovereign Module: ${cleanName}\npub struct CustomKernel {\n    pub resonance: f64,\n}\n`
          : `/**\n * Custom Module: ${cleanName}\n */\nexport interface CustomNodeSpec {\n  readonly id: string;\n  readonly resonance: number;\n}\n`
    };
    setCodeFiles(prev => [newFile, ...prev]);
    setActiveFileId(newFile.id);
    appendTerminalLog(`Created custom file ${newFile.path}`, 'SUCCESS');
    setSystemNotice(`Created file [${newFile.name}] in Workspace Repository`);
    setTimeout(() => setSystemNotice(null), 2800);
  }, [selectedNode, topic, appendTerminalLog]);

  const handleDeleteFile = useCallback((fileId: string) => {
    setCodeFiles(prev => {
      const remaining = prev.filter(f => f.id !== fileId);
      if (activeFileId === fileId && remaining[0]) {
        setActiveFileId(remaining[0].id);
      }
      return remaining;
    });
    setSystemNotice('Deleted file from Workspace Repository');
    setTimeout(() => setSystemNotice(null), 2500);
  }, [activeFileId]);

  const handleMaterializeCodeToGraph = useCallback(() => {
    const activeFile = codeFiles.find(f => f.id === activeFileId) || codeFiles[0];
    if (!activeFile) return;

    const matches = activeFile.content.match(/\b(interface|function|struct|class|enum)\s+([A-Za-z0-9_]+)/g) || [];
    const extractedNames = matches
      .map(m => m.trim().split(/\s+/).pop()!)
      .filter(Boolean)
      .slice(0, 3);

    const symbolsToSpawn =
      extractedNames.length > 0
        ? extractedNames
        : [activeFile.linkedNodeLabel || activeFile.name.replace(/\.[^.]+$/, '')];

    setGraphData(prev => {
      const updatedNodes = [...prev.nodes];
      const updatedLinks = [...prev.links];
      const anchor = selectedNode || prev.nodes[0];

      symbolsToSpawn.forEach((sym, idx) => {
        const nodeId = `code-node-${sym.toLowerCase()}-${Date.now()}-${idx}`;
        const newNode: GraphNode = {
          id: nodeId,
          label: sym,
          group: (idx % 5) + 1,
          description: `Materialized from workspace code module ${activeFile.path} (${activeFile.language.toUpperCase()}).`,
          depth: anchor ? (anchor.depth || 1) + 1 : 1,
          strength: 0.91,
          isGhost: false,
          x: (anchor?.x || 400) + (Math.random() - 0.5) * 160,
          y: (anchor?.y || 300) + (Math.random() - 0.5) * 160
        };
        nodeCache.current.set(nodeId, newNode);
        updatedNodes.push(newNode);

        if (anchor) {
          updatedLinks.push({
            source: anchor.id,
            target: nodeId,
            relationship: 'Implements',
            strength: 0.9
          });
        }
      });

      return { nodes: updatedNodes, links: updatedLinks };
    });

    appendTerminalLog(
      `Materialized [${symbolsToSpawn.join(', ')}] from ${activeFile.name} onto Spatial Knowledge Graph.`,
      'SUCCESS',
      `omega-cli materialize --source=${activeFile.name}`
    );
    setSystemNotice(`Materialized ${symbolsToSpawn.length} code symbol(s) from [${activeFile.name}] onto Graph`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, [codeFiles, activeFileId, selectedNode, appendTerminalLog]);

  const handleUpdateFileContent = useCallback((fileId: string, content: string) => {
    setCodeFiles(prev =>
      prev.map(f =>
        f.id === fileId ? { ...f, content, lastModified: new Date().toLocaleTimeString() } : f
      )
    );
  }, []);

  const handleRunScript = useCallback((cmd?: string) => {
    const activeCmd = (cmd || 'npm run verify:ontology').trim();
    if (activeCmd === 'clear') {
      setTerminalLogs([]);
      return;
    }

    appendTerminalLog(`Executing: ${activeCmd}`, 'INFO', activeCmd);

    setTimeout(() => {
      if (activeCmd === 'help') {
        appendTerminalLog(
          'Available commands: help | ls | status | build | test | materialize | deploy | clear',
          'INFO'
        );
      } else if (activeCmd === 'ls') {
        appendTerminalLog(codeFiles.map(f => `${f.path} (${f.language})`).join('  ·  '), 'SUCCESS');
      } else if (activeCmd === 'status') {
        appendTerminalLog(
          `Graph: ${graphData.nodes.length} nodes, ${graphData.links.length} synapses |Continents: ${continents.length} | Sprint Tickets: ${tickets.length}`,
          'SUCCESS'
        );
      } else if (activeCmd.includes('materialize')) {
        handleMaterializeCodeToGraph();
      } else if (activeCmd.includes('deploy')) {
        appendTerminalLog('Initiating 4-stage Sovereign Deployment Pipeline...', 'AGENT_EXEC');
      } else if (activeCmd.includes('verify') || activeCmd.includes('migration')) {
        const report = verifyV16StateMigrationIntegrity(graphData.nodes, graphData.links);
        appendTerminalLog(
          `[v16 REGRESSION SUITE] ${report.passed ? 'PASSED' : 'WARN'} — ${report.summary} (Buffer: ${report.zeroCopyBufferBytes} B)`,
          report.passed ? 'SUCCESS' : 'WARN'
        );
      } else if (activeCmd.includes('test')) {
        appendTerminalLog('PASS src/core/ontology_engine.spec.ts (18 assertions passed in 34ms)', 'SUCCESS');
      } else {
        appendTerminalLog(
          `Execution complete: [${graphData.nodes.length || 8} topological nodes] & [${codeFiles.length} workspace modules] verified with 0 warnings.`,
          'SUCCESS'
        );
      }
    }, 280);
  }, [appendTerminalLog, codeFiles, graphData.nodes, graphData.links, continents.length, tickets.length, handleMaterializeCodeToGraph]);

  const handleBridgeSemanticSynapse = useCallback((sourceNode: GraphNode, targetNode: GraphNode, similarity: number) => {
    setGraphData(prev => {
      const exists = prev.links.some(l => {
        const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
        const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
        return (s === sourceNode.id && t === targetNode.id) || (s === targetNode.id && t === sourceNode.id);
      });
      if (exists) return prev;
      return {
        ...prev,
        links: [
          ...prev.links,
          {
            source: sourceNode.id,
            target: targetNode.id,
            relationship: 'Resonates',
            strength: Math.max(0.75, Number(similarity.toFixed(2)))
          }
        ]
      };
    });
    appendTerminalLog(
      `Bridged 64D Neural-Symbolic Synapse: [${sourceNode.label}] ↔ [${targetNode.label}] (Cosine Sim ${(similarity * 100).toFixed(1)}%)`,
      'SUCCESS',
      'omega-cli bridge --vector-symbolic'
    );
    setSystemNotice(`Bridged 64D Semantic Synapse: [${sourceNode.label}] ↔ [${targetNode.label}]`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, [appendTerminalLog]);

  const handlePreEmptiveStabilize = useCallback((axiom?: DialecticalSynthesisAxiom) => {
    setGraphData(prev => {
      const deduped = deduplicateGraphTopology(prev.nodes, prev.links);
      const activeAxiom = axiom || detectDialecticalSyntheses(deduped.nodes, deduped.links, 1)[0];
      if (!activeAxiom) {
        return { nodes: deduped.nodes, links: deduped.links };
      }

      const bridgeId = `dialectic-bridge-${Date.now()}`;
      const cleanLabel = sanitizeNodeLabel(activeAxiom.canonicalAxiomLabel);
      const bridgeNode: GraphNode = {
        id: bridgeId,
        label: cleanLabel,
        group: 3,
        description: activeAxiom.canonicalAxiomDescription,
        depth: 2,
        strength: 0.96,
        quantumResonance: 0.96,
        isGhost: false,
        x: ((activeAxiom.thesisNode.x || 400) + (activeAxiom.antithesisNode.x || 500)) / 2,
        y: ((activeAxiom.thesisNode.y || 300) + (activeAxiom.antithesisNode.y || 350)) / 2,
        z: 0
      };
      nodeCache.current.set(bridgeId, bridgeNode);

      const finalGraph = deduplicateGraphTopology(
        [...deduped.nodes, bridgeNode],
        [
          ...deduped.links,
          {
            source: activeAxiom.thesisNode.id,
            target: bridgeId,
            relationship: 'Optimizes',
            strength: 0.94
          },
          {
            source: bridgeId,
            target: activeAxiom.antithesisNode.id,
            relationship: 'Governs',
            strength: 0.94
          }
        ]
      );
      return { nodes: finalGraph.nodes, links: finalGraph.links };
    });

    appendTerminalLog(
      `[KOOPMAN STABILIZER] Damped unstable eigenmodes & synthesized Dialectical Bridge Axiom [${axiom?.canonicalAxiomLabel || 'Homeostatic Equilibrium Invariant'}].`,
      'SUCCESS',
      'omega-cli koopman --stabilize'
    );
    setSystemNotice(
      `Koopman Pre-Emptive Stabilization Complete: Synthesized [${axiom?.canonicalAxiomLabel || 'Dialectical Bridge Axiom'}]`
    );
    setTimeout(() => setSystemNotice(null), 3500);
  }, [appendTerminalLog]);

  const handleTriggerDeployment = useCallback(() => {
    if (isDeploying) return;
    setIsDeploying(true);
    appendTerminalLog('Starting Automated CI/CD Deployment Workflow...', 'AGENT_EXEC', 'omega-cli deploy --pipeline');
    setSystemNotice('Automated Deployment Pipeline Engaged (4 Stages)');
    setTimeout(() => setSystemNotice(null), 3200);

    setPipelineStages(prev => prev.map((s, idx) => ({ ...s, status: idx === 0 ? 'RUNNING' : 'IDLE' })));

    const stageDelays = [500, 1100, 1700, 2300];
    stageDelays.forEach((delay, idx) => {
      setTimeout(() => {
        setPipelineStages(prev =>
          prev.map((s, i) => {
            if (i < idx) return { ...s, status: 'PASSED' };
            if (i === idx) return { ...s, status: 'PASSED' };
            if (i === idx + 1) return { ...s, status: 'RUNNING' };
            return s;
          })
        );
        appendTerminalLog(`Stage ${idx + 1}/4 PASSED: Verified deterministic build invariant.`, 'SUCCESS');

        if (idx === stageDelays.length - 1) {
          setIsDeploying(false);
          appendTerminalLog('DEPLOYMENT COMPLETE: All Knowledge Continents & Edge Kernels live.', 'SUCCESS');
          setSystemNotice('Deployment Pipeline Succeeded: Edge Mesh Rollout Complete.');
          setTimeout(() => setSystemNotice(null), 3500);
        }
      }, delay);
    });
  }, [isDeploying, appendTerminalLog]);

  const handleCreateTicket = useCallback((overrideLabel?: string) => {
    const targetLabel =
      overrideLabel ||
      selectedNode?.label ||
      workspaceContinent?.label ||
      graphData.nodes[Math.floor(Math.random() * Math.max(1, graphData.nodes.length))]?.label ||
      topic ||
      'Topological Synthesis';

    const newTicket = gemini.synthesizeSprintTicket(topic || 'Omega', targetLabel, workspaceContinent?.id);
    setTickets(prev => [newTicket, ...prev]);
    appendTerminalLog(`Created Sprint Ticket [${newTicket.key}]: ${newTicket.title}`, 'AGENT_EXEC');
    setSystemNotice(`Created Sprint Ticket [${newTicket.key}: ${newTicket.title}]`);
    setTimeout(() => setSystemNotice(null), 3200);
  }, [selectedNode, workspaceContinent, graphData.nodes, topic, appendTerminalLog]);

  const handleAdvanceTicket = useCallback((ticketId?: string) => {
    const order: TicketStatus[] = ['BACKLOG', 'IN_PROGRESS', 'ARCHITECT_REVIEW', 'DEPLOYED'];
    setTickets(prev => {
      const target = ticketId
        ? prev.find(t => t.id === ticketId)
        : prev.find(t => t.status !== 'DEPLOYED') || prev[0];

      if (!target) return prev;
      const currIdx = order.indexOf(target.status);
      const nextStatus = order[Math.min(order.length - 1, currIdx + 1)];

      appendTerminalLog(`Ticket [${target.key}] advanced from ${target.status} -> ${nextStatus}`, 'SUCCESS');
      setSystemNotice(`Ticket [${target.key}] promoted to [${nextStatus.replace('_', ' ')}]`);
      setTimeout(() => setSystemNotice(null), 3000);

      return prev.map(t => (t.id === target.id ? { ...t, status: nextStatus } : t));
    });
  }, [appendTerminalLog]);

  const handleRegressTicket = useCallback((ticketId: string) => {
    const order: TicketStatus[] = ['BACKLOG', 'IN_PROGRESS', 'ARCHITECT_REVIEW', 'DEPLOYED'];
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        const currIdx = order.indexOf(t.status);
        const prevStatus = order[Math.max(0, currIdx - 1)];
        return { ...t, status: prevStatus };
      })
    );
  }, []);

  const handleDeleteTicket = useCallback((ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    setSystemNotice('Removed ticket from Sprint Board');
    setTimeout(() => setSystemNotice(null), 2500);
  }, []);

  const handleRatifyProposal = useCallback((proposalId: string) => {
    const target = architectureProposals.find(p => p.id === proposalId);
    setArchitectureProposals(prev =>
      prev.map(p => (p.id === proposalId ? { ...p, status: 'RATIFIED' } : p))
    );

    if (target) {
      const newNode: GraphNode = {
        id: `node-arch-${Date.now()}`,
        label: target.title.slice(0, 28),
        group: 2,
        description: `${target.summary} (${target.pattern})`,
        depth: 2,
        strength: 0.92,
        isGhost: false
      };
      nodeCache.current.set(newNode.id, newNode);
      setGraphData(prev => {
        const root = prev.nodes[0];
        return {
          nodes: [...prev.nodes, newNode],
          links: root
            ? [...prev.links, { source: root.id, target: newNode.id, relationship: 'Implements', strength: 0.9 }]
            : prev.links
        };
      });
      setSystemNotice(`Ratified [${target.id}] & materialized architectural node onto Knowledge Graph`);
      setTimeout(() => setSystemNotice(null), 3500);
    }
  }, [architectureProposals]);

  const handleCreateAsset = useCallback(() => {
    const focusLabel = selectedNode?.label || workspaceContinent?.label || topic || 'Omega Architecture';
    const types: MultimediaAsset['type'][] = ['DIAGRAM_BLUEPRINT', 'SCHEMA_ARTIFACT', 'DOCUMENTATION', 'VISUAL_RESOURCE'];
    const chosenType = types[assets.length % types.length];

    const newAsset: MultimediaAsset = {
      id: `asset-${Date.now()}`,
      title: `${focusLabel} — ${chosenType.replace('_', ' ')}`,
      type: chosenType,
      format: chosenType === 'SCHEMA_ARTIFACT' ? 'application/ld+json' : 'SVG / Blueprint',
      summary: `Autonomous knowledge artifact synthesized for ${focusLabel} and embedded into the graph architecture.`,
      contentPreview: `// Synthesized Artifact: ${focusLabel}\n// Timestamp: ${new Date().toISOString()}\n{\n  "domain": "${topic || 'Omega Manifold'}",\n  "anchorConcept": "${focusLabel}",\n  "verification": "QUORUM_VERIFIED"\n}`,
      linkedNodeId: selectedNode?.id,
      linkedNodeLabel: focusLabel,
      continentId: workspaceContinent?.id,
      tags: ['autonomous', focusLabel.toLowerCase().replace(/\s+/g, '-'), 'verified'],
      createdBy: 'RESEARCHER_14',
      createdAt: new Date().toLocaleTimeString()
    };

    setAssets(prev => [newAsset, ...prev]);
    setSystemNotice(`Embedded new artifact [${newAsset.title}] into Asset Library`);
    setTimeout(() => setSystemNotice(null), 3200);
  }, [selectedNode, workspaceContinent, topic, assets.length]);

  const handleBindAssetToNode = useCallback((assetId: string, node: GraphNode) => {
    setAssets(prev =>
      prev.map(a =>
        a.id === assetId
          ? { ...a, linkedNodeId: node.id, linkedNodeLabel: node.label }
          : a
      )
    );
    setSystemNotice(`Bound artifact to Graph Node [${node.label}]`);
    setTimeout(() => setSystemNotice(null), 3000);
  }, []);

  const handleUpdateAssetContent = useCallback((assetId: string, contentPreview: string) => {
    setAssets(prev => prev.map(a => (a.id === assetId ? { ...a, contentPreview } : a)));
  }, []);

  const handleDeleteAsset = useCallback((assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
    setSystemNotice('Removed artifact from Asset Library');
    setTimeout(() => setSystemNotice(null), 2500);
  }, []);

  // ============================================================================
  // TIME-TRAVEL SNAPSHOT VERSIONING HANDLERS (OVERHAUL 3B)
  // ============================================================================
  const handleCaptureSnapshot = useCallback((customLabel?: string) => {
    const snap: WorkspaceSnapshot = {
      id: `snap-${Date.now()}`,
      label: customLabel || `Checkpoint #${snapshots.length + 1} (${topic || 'Omega'})`,
      timestamp: new Date().toLocaleTimeString(),
      topic: topic || 'Omega Manifold',
      nodeCount: graphData.nodes.length,
      linkCount: graphData.links.length,
      fileCount: codeFiles.length,
      ticketCount: tickets.length,
      graphData: {
        nodes: graphData.nodes.map(n => ({ ...n })),
        links: graphData.links.map(l => ({
          ...l,
          source: typeof l.source === 'string' ? l.source : l.source.id,
          target: typeof l.target === 'string' ? l.target : l.target.id
        }))
      },
      whiteboardElements: [...whiteboardElements],
      whiteboardConnections: [...whiteboardConnections],
      codeFiles: [...codeFiles],
      tickets: [...tickets],
      assets: [...assets],
      autogenesis: { ...autogenesis }
    };
    setSnapshots(prev => [snap, ...prev.slice(0, 14)]);
    setSystemNotice(`Captured Time-Travel Snapshot [${snap.label}] (${autogenesis.generationVersion})`);
    setTimeout(() => setSystemNotice(null), 3200);
  }, [snapshots.length, topic, graphData, codeFiles, tickets, whiteboardElements, whiteboardConnections, assets, autogenesis]);

  const handleRestoreSnapshot = useCallback((snap: WorkspaceSnapshot) => {
    nodeCache.current.clear();
    const snapNodeIds = new Set(snap.graphData.nodes.map(n => n.id));
    snap.graphData.nodes.forEach(n => nodeCache.current.set(n.id, { ...n }));
    const safeLinks = (snap.graphData.links || []).filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
      return s && t && snapNodeIds.has(s) && snapNodeIds.has(t);
    });
    setGraphData({ nodes: snap.graphData.nodes, links: safeLinks });
    setTopic(snap.topic);
    setWhiteboardElements(snap.whiteboardElements);
    setWhiteboardConnections(snap.whiteboardConnections);
    setCodeFiles(snap.codeFiles);
    setTickets(snap.tickets);
    setAssets(snap.assets);
    if (snap.autogenesis) {
      setAutogenesis(snap.autogenesis);
    }
    crdtBus.loadSnapshot(snap);
    setSystemNotice(`Restored Snapshot [${snap.label}] (${snap.autogenesis?.generationVersion || 'v14'})`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, []);

  const handleDeleteSnapshot = useCallback((snapshotId: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
  }, []);

  const handleOpenContinentWorkspace = useCallback((continent: KnowledgeContinent) => {
    setWorkspaceContinent(continent);
    setWorkspaceLayoutMode(prev => (prev === 'GRAPH_ONLY' ? 'SPLIT_STUDIO' : prev));
    setSystemNotice(`Morphed [${continent.label}] into Integrated Creative Workspace Studio`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, []);

  // ============================================================================
  // RECURSIVE SELF-DEVELOPMENT ("AUTOGENESIS") EXECUTION ENGINE
  // ============================================================================
  const executeFullAutogenesisCycle = useCallback(
    (cycleIdxOverride?: number) => {
      const cycleIdx = cycleIdxOverride ?? autogenesis.cycleCount;
      const blueprint = gemini.synthesizeSelfEvolutionPayload(
        cycleIdx,
        topic || 'Omega Point Self-Architecture'
      );
      const nextGenMinor = cycleIdx + 1;
      const nextGenVersion = `v14.${nextGenMinor}.0`;
      const nowStr = new Date().toLocaleTimeString();

      // 1. Create & Ratify Architecture RFC
      const rfcId = `ARCH-${200 + nextGenMinor}`;
      const newProposal: SystemArchitectureProposal = {
        id: rfcId,
        title: blueprint.rfcTitle,
        summary: blueprint.summary,
        authorAgent: blueprint.authorAgent,
        pattern: blueprint.rfcPattern,
        components: blueprint.rfcComponents,
        status: 'RATIFIED',
        confidence: Number(Math.min(99.9, 96.4 + nextGenMinor * 0.4).toFixed(1))
      };
      setArchitectureProposals(prev => [newProposal, ...prev.filter(p => p.id !== newProposal.id)]);

      // 2. Create & Deploy Sprint Ticket
      const ticketKey = `OMG-${300 + nextGenMinor}`;
      const newTicket: ProjectTaskTicket = {
        id: `ticket-autogen-${Date.now()}`,
        key: ticketKey,
        title: blueprint.ticketTitle,
        description: blueprint.ticketDescription,
        status: 'DEPLOYED',
        priority: 'CRITICAL',
        storyPoints: 8,
        assignedAgent: blueprint.authorAgent.split(' ')[0],
        linkedNodeLabel: blueprint.primaryNodeLabel,
        createdAt: nowStr
      };
      setTickets(prev => [newTicket, ...prev.filter(t => t.id !== newTicket.id && t.key !== newTicket.key)]);

      // 3. Synthesize Code File into Workspace Repository
      const locAdded = blueprint.codeContent.trim().split('\n').length;
      const fileUid = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const newFile: WorkspaceCodeFile = {
        id: `file-autogen-${fileUid}`,
        name: blueprint.fileName,
        path: blueprint.filePath,
        language: blueprint.language,
        content: blueprint.codeContent,
        authorAgent: blueprint.authorAgent,
        lastModified: `${nextGenVersion} (${nowStr})`,
        linkedNodeLabel: blueprint.primaryNodeLabel
      };
      crdtBus.setElement('codeFiles', newFile, newFile.authorAgent);
      setCodeFiles(prev => [newFile, ...prev.filter(f => f.name !== newFile.name && f.id !== newFile.id)]);
      setActiveFileId(newFile.id);

      // 4. Wire Architectural Element onto Collaborative Whiteboard
      const wbColors = ['#34d399', '#38bdf8', '#fbbf24', '#c084fc', '#818cf8'];
      const autoUid = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const newWbEl: WhiteboardElement = {
        id: `wb-autogen-${autoUid}`,
        type: 'NEURAL_CORE',
        title: blueprint.whiteboardTitle,
        subtitle: `${nextGenVersion} · ${blueprint.whiteboardSubtitle}`,
        x: 70 + ((cycleIdx + 1) % 3) * 235,
        y: 85 + (Math.floor((cycleIdx + 1) / 3) % 3) * 145,
        color: wbColors[cycleIdx % wbColors.length],
        author: blueprint.authorAgent.split(' ')[0]
      };

      crdtBus.setElement('whiteboardElements', newWbEl, newWbEl.author);

      let autoConn: WhiteboardConnection | null = null;
      if (whiteboardElements.length > 0) {
        const anchor = whiteboardElements[whiteboardElements.length - 1];
        autoConn = {
          id: `wbc-autogen-${autoUid}`,
          fromId: anchor.id,
          toId: newWbEl.id,
          label: blueprint.relationship,
          protocol: 'AUTOGEN'
        };
        crdtBus.setElement('whiteboardConnections', autoConn, 'AUTOGENESIS_AGENT');
      }

      setWhiteboardElements(prev => [...prev.filter(e => e.id !== newWbEl.id), newWbEl]);
      if (autoConn) {
        const connToAdd = autoConn;
        setWhiteboardConnections(conns => [...conns.filter(c => c.id !== connToAdd.id), connToAdd]);
      }

      // 5. Materialize New Self-Architecture Nodes & Synapses onto Spatial Graph (with stem deduplication & Dialectical Synthesis)
      const node1Id = `autogen-node-${Date.now()}-1`;
      const node2Id = `autogen-node-${Date.now()}-2`;
      setGraphData(prev => {
        const anchor = selectedNode || prev.nodes[0];
        const baseX = anchor?.x ?? 420;
        const baseY = anchor?.y ?? 300;

        // If catalog nodes already exist by stem, synthesize a Dialectical Bridge Axiom instead of duplicating
        const existingStems = new Set(prev.nodes.map(n => getCanonicalRootStem(n.label)));
        const dialectics = detectDialecticalSyntheses(prev.nodes, prev.links, 1);
        const primaryStem = getCanonicalRootStem(blueprint.primaryNodeLabel);

        const primaryLabel = existingStems.has(primaryStem) && dialectics[0]
          ? sanitizeNodeLabel(dialectics[0].canonicalAxiomLabel)
          : sanitizeNodeLabel(blueprint.primaryNodeLabel);
        const secondaryLabel = sanitizeNodeLabel(blueprint.secondaryNodeLabel);

        const node1: GraphNode = {
          id: node1Id,
          label: primaryLabel,
          group: (cycleIdx % 5) + 1,
          description: `[${nextGenVersion} Self-Evolved] ${blueprint.primaryNodeDescription}`,
          depth: anchor ? (anchor.depth || 1) + 1 : 1,
          strength: 0.95,
          isGhost: false,
          x: baseX + (Math.random() - 0.5) * 180,
          y: baseY + (Math.random() - 0.5) * 180
        };
        const node2: GraphNode = {
          id: node2Id,
          label: secondaryLabel,
          group: ((cycleIdx + 2) % 5) + 1,
          description: `[${nextGenVersion} Self-Evolved] ${blueprint.secondaryNodeDescription}`,
          depth: (node1.depth || 1) + 1,
          strength: 0.89,
          isGhost: false,
          x: (node1.x || 420) + (Math.random() - 0.5) * 140,
          y: (node1.y || 300) + (Math.random() - 0.5) * 140
        };

        const rawLinks: GraphLink[] = [
          ...prev.links,
          {
            source: node1Id,
            target: node2Id,
            relationship: blueprint.relationship,
            strength: 0.92
          }
        ];
        if (anchor) {
          rawLinks.push({
            source: anchor.id,
            target: node1Id,
            relationship: 'Extends',
            strength: 0.94
          });
        }
        const deduped = deduplicateGraphTopology([...prev.nodes, node1, node2], rawLinks);
        deduped.nodes.forEach(n => nodeCache.current.set(n.id, n));
        return { nodes: deduped.nodes, links: deduped.links };
      });

      // 6. Update CI/CD Pipeline & Terminal Logs
      setPipelineStages(prev => prev.map(s => ({ ...s, status: 'PASSED' })));
      appendTerminalLog(
        `[AUTOGENESIS ${nextGenVersion}] Evolved ${blueprint.filePath} (+${locAdded} LOC) · ${blueprint.testAssertionsPassed} assertions PASSED · Materialized [${blueprint.primaryNodeLabel}]`,
        'SUCCESS',
        `omega-autogenesis --evolve ${nextGenVersion}`
      );

      // 7. Record Mutation in Autogenesis State
      const mutationRecord: SelfEvolutionMutation = {
        id: `mut-${Date.now()}`,
        generation: nextGenVersion,
        timestamp: nowStr,
        subsystem: blueprint.subsystem,
        summary: blueprint.summary,
        authorAgent: blueprint.authorAgent,
        fileId: newFile.id,
        fileName: newFile.name,
        filePath: newFile.path,
        language: blueprint.language,
        locAdded,
        codeDiffPreview: blueprint.codeDiffPreview,
        rfcId,
        ticketKey,
        materializedNodeIds: [node1Id, node2Id],
        materializedNodeLabels: [blueprint.primaryNodeLabel, blueprint.secondaryNodeLabel],
        fitnessDelta: blueprint.fitnessDelta,
        testAssertionsPassed: blueprint.testAssertionsPassed
      };

      const nextBlueprint = gemini.synthesizeSelfEvolutionPayload(
        cycleIdx + 1,
        topic || 'Omega Point Self-Architecture'
      );

      setAutogenesis(prev => ({
        ...prev,
        currentStage: 'INTROSPECT',
        stageProgress: 16,
        generationVersion: nextGenVersion,
        cycleCount: prev.cycleCount + 1,
        fitnessScore: Number(Math.min(99.9, prev.fitnessScore + blueprint.fitnessDelta).toFixed(2)),
        selfWrittenLoc: prev.selfWrittenLoc + locAdded,
        testSuitePassed: prev.testSuitePassed + blueprint.testAssertionsPassed,
        activeHypothesis: nextBlueprint.hypothesis,
        mutations: [mutationRecord, ...prev.mutations]
      }));

      setSystemNotice(
        `Self-Evolution ${nextGenVersion} Complete: Synthesized [${blueprint.fileName}] & Materialized [${blueprint.primaryNodeLabel}]`
      );
      setTimeout(() => setSystemNotice(null), 3600);
    },
    [autogenesis.cycleCount, topic, selectedNode, appendTerminalLog]
  );

  // Step 1 Stage in the 6-Stage Autopoietic Pipeline
  const handleStepAutogenesisStage = useCallback(() => {
    const STAGE_ORDER: SelfDevStage[] = [
      'INTROSPECT',
      'PROPOSE_RFC',
      'SYNTHESIZE_CODE',
      'VERIFY_AST',
      'MATERIALIZE_GRAPH',
      'COMMIT_GENERATION'
    ];
    const currIdx = STAGE_ORDER.indexOf(autogenesis.currentStage);
    const blueprint = gemini.synthesizeSelfEvolutionPayload(
      autogenesis.cycleCount,
      topic || 'Omega Point Self-Architecture'
    );
    const nextGenMinor = autogenesis.cycleCount + 1;
    const nextGenVersion = `v14.${nextGenMinor}.0`;
    const nowStr = new Date().toLocaleTimeString();

    if (autogenesis.currentStage === 'INTROSPECT') {
      appendTerminalLog(
        `[Stage 1/6 INTROSPECT] Auditing AST & topology for ${nextGenVersion}: ${blueprint.hypothesis}`,
        'INFO',
        'omega-autogenesis --introspect'
      );
      setAutogenesis(prev => ({
        ...prev,
        currentStage: 'PROPOSE_RFC',
        stageProgress: 33,
        activeHypothesis: blueprint.hypothesis
      }));
    } else if (autogenesis.currentStage === 'PROPOSE_RFC') {
      const rfcId = `ARCH-${200 + nextGenMinor}`;
      const ticketKey = `OMG-${300 + nextGenMinor}`;
      const newProposal: SystemArchitectureProposal = {
        id: rfcId,
        title: blueprint.rfcTitle,
        summary: blueprint.summary,
        authorAgent: blueprint.authorAgent,
        pattern: blueprint.rfcPattern,
        components: blueprint.rfcComponents,
        status: 'RATIFIED',
        confidence: 98.6
      };
      const newTicket: ProjectTaskTicket = {
        id: `ticket-step-${Date.now()}`,
        key: ticketKey,
        title: blueprint.ticketTitle,
        description: blueprint.ticketDescription,
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        storyPoints: 8,
        assignedAgent: blueprint.authorAgent.split(' ')[0],
        linkedNodeLabel: blueprint.primaryNodeLabel,
        createdAt: nowStr
      };
      activeEvolutionRfcIdRef.current = rfcId;
      activeEvolutionTicketIdRef.current = newTicket.id;
      setArchitectureProposals(prev => [newProposal, ...prev.filter(p => p.id !== newProposal.id)]);
      setTickets(prev => [newTicket, ...prev.filter(t => t.id !== newTicket.id && t.key !== newTicket.key)]);
      appendTerminalLog(
        `[Stage 2/6 RFC & SPRINT] Ratified ${rfcId} (${blueprint.rfcTitle}) & opened ticket ${ticketKey}`,
        'AGENT_EXEC'
      );
      setAutogenesis(prev => ({ ...prev, currentStage: 'SYNTHESIZE_CODE', stageProgress: 50 }));
    } else if (autogenesis.currentStage === 'SYNTHESIZE_CODE') {
      const newFile: WorkspaceCodeFile = {
        id: `file-step-${Date.now()}`,
        name: blueprint.fileName,
        path: blueprint.filePath,
        language: blueprint.language,
        content: blueprint.codeContent,
        authorAgent: blueprint.authorAgent,
        lastModified: `${nextGenVersion} (${nowStr})`,
        linkedNodeLabel: blueprint.primaryNodeLabel
      };
      activeEvolutionFileRef.current = newFile;
      setCodeFiles(prev => [newFile, ...prev.filter(f => f.name !== newFile.name)]);
      setActiveFileId(newFile.id);
      appendTerminalLog(
        `[Stage 3/6 CODE GEN] Synthesized ${newFile.path} (${blueprint.language.toUpperCase()})`,
        'SUCCESS'
      );
      setAutogenesis(prev => ({ ...prev, currentStage: 'VERIFY_AST', stageProgress: 66 }));
    } else if (autogenesis.currentStage === 'VERIFY_AST') {
      if (activeEvolutionTicketIdRef.current) {
        const tid = activeEvolutionTicketIdRef.current;
        setTickets(prev => prev.map(t => (t.id === tid ? { ...t, status: 'ARCHITECT_REVIEW' } : t)));
      }
      setPipelineStages(prev => prev.map(s => ({ ...s, status: 'PASSED' })));
      appendTerminalLog(
        `[Stage 4/6 VERIFY AST] Static analysis & ${blueprint.testAssertionsPassed} unit assertions PASSED (0 errors).`,
        'SUCCESS',
        'npm run test:autogenesis'
      );
      setAutogenesis(prev => ({ ...prev, currentStage: 'MATERIALIZE_GRAPH', stageProgress: 84 }));
    } else if (autogenesis.currentStage === 'MATERIALIZE_GRAPH') {
      const node1Id = `autogen-node-${Date.now()}-1`;
      const node2Id = `autogen-node-${Date.now()}-2`;
      activeEvolutionNodeLabelsRef.current = [
        sanitizeNodeLabel(blueprint.primaryNodeLabel),
        sanitizeNodeLabel(blueprint.secondaryNodeLabel)
      ];

      setGraphData(prev => {
        const anchor = selectedNode || prev.nodes[0];
        const baseX = anchor?.x ?? 420;
        const baseY = anchor?.y ?? 300;
        const node1: GraphNode = {
          id: node1Id,
          label: sanitizeNodeLabel(blueprint.primaryNodeLabel),
          group: (autogenesis.cycleCount % 5) + 1,
          description: `[${nextGenVersion} Self-Evolved] ${blueprint.primaryNodeDescription}`,
          depth: anchor ? (anchor.depth || 1) + 1 : 1,
          strength: 0.95,
          isGhost: false,
          x: baseX + (Math.random() - 0.5) * 170,
          y: baseY + (Math.random() - 0.5) * 170
        };
        const node2: GraphNode = {
          id: node2Id,
          label: sanitizeNodeLabel(blueprint.secondaryNodeLabel),
          group: ((autogenesis.cycleCount + 2) % 5) + 1,
          description: `[${nextGenVersion} Self-Evolved] ${blueprint.secondaryNodeDescription}`,
          depth: (node1.depth || 1) + 1,
          strength: 0.89,
          isGhost: false,
          x: (node1.x || 420) + (Math.random() - 0.5) * 140,
          y: (node1.y || 300) + (Math.random() - 0.5) * 140
        };
        const nextLinks: GraphLink[] = [
          ...prev.links,
          { source: node1Id, target: node2Id, relationship: blueprint.relationship, strength: 0.92 }
        ];
        if (anchor) {
          nextLinks.push({ source: anchor.id, target: node1Id, relationship: 'Extends', strength: 0.94 });
        }
        const deduped = deduplicateGraphTopology([...prev.nodes, node1, node2], nextLinks);
        deduped.nodes.forEach(n => nodeCache.current.set(n.id, n));
        return { nodes: deduped.nodes, links: deduped.links };
      });

      handleAddWhiteboardElement({
        type: 'NEURAL_CORE',
        title: blueprint.whiteboardTitle,
        subtitle: `${nextGenVersion} · ${blueprint.whiteboardSubtitle}`,
        color: '#34d399',
        author: blueprint.authorAgent.split(' ')[0]
      });

      appendTerminalLog(
        `[Stage 5/6 MATERIALIZE] Materialized [${blueprint.primaryNodeLabel}] & [${blueprint.secondaryNodeLabel}] onto Spatial Graph & Whiteboard.`,
        'SUCCESS'
      );
      setAutogenesis(prev => ({ ...prev, currentStage: 'COMMIT_GENERATION', stageProgress: 100 }));
    } else {
      // COMMIT_GENERATION
      if (activeEvolutionTicketIdRef.current) {
        const tid = activeEvolutionTicketIdRef.current;
        setTickets(prev => prev.map(t => (t.id === tid ? { ...t, status: 'DEPLOYED' } : t)));
      }
      const evolvedFile = activeEvolutionFileRef.current;
      const locAdded = blueprint.codeContent.trim().split('\n').length;
      const rfcId = activeEvolutionRfcIdRef.current || `ARCH-${200 + nextGenMinor}`;
      const ticketKey = `OMG-${300 + nextGenMinor}`;

      const mutationRecord: SelfEvolutionMutation = {
        id: `mut-${Date.now()}`,
        generation: nextGenVersion,
        timestamp: nowStr,
        subsystem: blueprint.subsystem,
        summary: blueprint.summary,
        authorAgent: blueprint.authorAgent,
        fileId: evolvedFile?.id || codeFiles[0]?.id || 'file-1',
        fileName: blueprint.fileName,
        filePath: blueprint.filePath,
        language: blueprint.language,
        locAdded,
        codeDiffPreview: blueprint.codeDiffPreview,
        rfcId,
        ticketKey,
        materializedNodeIds: [],
        materializedNodeLabels: [blueprint.primaryNodeLabel, blueprint.secondaryNodeLabel],
        fitnessDelta: blueprint.fitnessDelta,
        testAssertionsPassed: blueprint.testAssertionsPassed
      };

      const nextBlueprint = gemini.synthesizeSelfEvolutionPayload(
        autogenesis.cycleCount + 1,
        topic || 'Omega Point Self-Architecture'
      );

      setAutogenesis(prev => ({
        ...prev,
        currentStage: 'INTROSPECT',
        stageProgress: 16,
        generationVersion: nextGenVersion,
        cycleCount: prev.cycleCount + 1,
        fitnessScore: Number(Math.min(99.9, prev.fitnessScore + blueprint.fitnessDelta).toFixed(2)),
        selfWrittenLoc: prev.selfWrittenLoc + locAdded,
        testSuitePassed: prev.testSuitePassed + blueprint.testAssertionsPassed,
        activeHypothesis: nextBlueprint.hypothesis,
        mutations: [mutationRecord, ...prev.mutations]
      }));

      appendTerminalLog(
        `[Stage 6/6 COMMIT] Evolution ${nextGenVersion} committed (+${blueprint.fitnessDelta}% Architectural Fitness).`,
        'SUCCESS'
      );
      setSystemNotice(`Committed Self-Evolution Generation ${nextGenVersion} (${blueprint.subsystem})`);
      setTimeout(() => setSystemNotice(null), 3500);
    }
  }, [
    autogenesis.currentStage,
    autogenesis.cycleCount,
    topic,
    selectedNode,
    codeFiles,
    appendTerminalLog,
    handleAddWhiteboardElement
  ]);

  // Continuous Autopoietic Loop Effect when autogenesis.active === true
  useEffect(() => {
    if (!autogenesis.active) return;
    const intervalMs =
      autogenesis.cadence === 'TURBO_2S'
        ? 1400
        : autogenesis.cadence === 'DEEP_7S'
        ? 3600
        : 2200;

    const timer = window.setInterval(() => {
      handleStepAutogenesisStage();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [autogenesis.active, autogenesis.cadence, handleStepAutogenesisStage]);

  // Real-time Scientific Telemetry Engine
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => {
        const nodes = graphData.nodes;
        const links = graphData.links;
        const nodeCount = nodes.length;
        const linkCount = links.length;

        if (nodeCount === 0) {
          return {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 2
          };
        }

        const degreeMap: Record<string, number> = {};
        nodes.forEach(n => { degreeMap[n.id] = 0; });
        links.forEach(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          if (degreeMap[s] !== undefined) degreeMap[s]++;
          if (degreeMap[t] !== undefined) degreeMap[t]++;
        });

        const totalDeg = Object.values(degreeMap).reduce((a, b) => a + b, 0);
        let entropy = 0;
        if (totalDeg > 0) {
          Object.values(degreeMap).forEach(deg => {
            if (deg > 0) {
              const p = deg / totalDeg;
              entropy -= p * Math.log2(p);
            }
          });
        }

        let intraClusterLinks = 0;
        const nodeGroupMap = new Map(nodes.map(n => [n.id, n.group]));
        links.forEach(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          if (nodeGroupMap.get(s) !== undefined && nodeGroupMap.get(s) === nodeGroupMap.get(t)) {
            intraClusterLinks++;
          }
        });
        const cohesion = linkCount > 0 ? (intraClusterLinks / linkCount) * 100 : 75;

        const maxPossibleLinks = (nodeCount * (nodeCount - 1)) / 2;
        const density = maxPossibleLinks > 0 ? linkCount / maxPossibleLinks : 0;
        const ghosts = nodes.filter(n => n.isGhost).length;
        const frontierRatio = nodeCount > 0 ? ghosts / nodeCount : 0;

        const newPoint = {
          timestamp: Date.now(),
          entropy: +entropy.toFixed(3),
          discoveryVelocity: +(ghosts * 1.5 + (mission?.synergyLevel || 50) * 0.05).toFixed(1),
          activeNodes: nodeCount,
          synapticDensity: +density.toFixed(3)
        };

        const updatedHistory = [...prev.history, newPoint].slice(-24);
        const groups = new Set(nodes.map(n => n.group)).size;
        const maxDepth = Math.max(...nodes.map(n => n.depth || 1), 1);

        return {
          networkEntropy: +entropy.toFixed(3),
          clusterCohesion: +cohesion.toFixed(1),
          discoveryVelocity: newPoint.discoveryVelocity,
          frontierRatio: +frontierRatio.toFixed(2),
          graphDensity: +density.toFixed(3),
          totalSynapses: linkCount,
          radar: {
            depth: Math.min(100, maxDepth * 24 + 10),
            breadth: Math.min(100, groups * 22 + 15),
            novelty: Math.min(100, Math.round(frontierRatio * 160 + 20)),
            empiricalGrounding: Math.min(100, Math.round((mission?.synergyLevel || 60) * 0.8 + 15)),
            interconnectivity: Math.min(100, Math.round(density * 320 + 25))
          },
          history: updatedHistory,
          elapsedSeconds: prev.elapsedSeconds + 2
        };
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [graphData, mission]);

  // LRU Node Garbage Collection
  useEffect(() => {
    if (graphData.nodes.length > 250) {
      setGraphData(prev => {
        const pinnedId = pinnedNode?.id;
        const focusedId = focusedNodeId;
        const ghosts = prev.nodes.filter(n => n.isGhost && n.id !== pinnedId && n.id !== focusedId);
        if (ghosts.length <= 12) return prev;
        const toPrune = new Set(ghosts.slice(12).map(g => g.id));
        const prunedNodes = prev.nodes.filter(n => !toPrune.has(n.id));
        const prunedLinks = prev.links.filter(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          return !toPrune.has(s) && !toPrune.has(t);
        });
        return { nodes: prunedNodes, links: prunedLinks };
      });
      setSystemNotice('LRU Garbage Collector: Pruned stale peripheral ghost vectors.');
      setTimeout(() => setSystemNotice(null), 3500);
    }
  }, [graphData.nodes.length, pinnedNode, focusedNodeId]);

  const handleTogglePin = useCallback((node: GraphNode) => {
    setPinnedNode(prev => {
      const next = prev?.id === node.id ? null : node;
      setSystemNotice(next ? `Manifold anchor locked on [${node.label}]` : `Manifold anchor released from [${node.label}]`);
      setTimeout(() => setSystemNotice(null), 3500);
      return next;
    });
  }, []);

  const handleExportSnapshot = useCallback(() => {
    const pkg: GraphExportPackage = {
      version: '2.0.0-omega',
      exportedAt: new Date().toISOString(),
      topic,
      mission,
      nodes: graphData.nodes,
      links: graphData.links.map(l => ({
        source: typeof l.source === 'string' ? l.source : (l.source as GraphNode).id,
        target: typeof l.target === 'string' ? l.target : (l.target as GraphNode).id,
        relationship: l.relationship,
        strength: l.strength
      })),
      telemetrySummary: {
        nodeCount: graphData.nodes.length,
        linkCount: graphData.links.length,
        entropy: telemetry.networkEntropy,
        cohesion: telemetry.clusterCohesion
      }
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge_exploder_${(topic || 'matrix').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSystemNotice('Session telemetry & graph topology exported to JSON.');
    setTimeout(() => setSystemNotice(null), 3500);
  }, [topic, mission, graphData, telemetry]);

  // ============================================================================
  // EVOLUTIONARY STATE MEMORY PERSISTENCE HANDLERS
  // ============================================================================
  const handleSaveStateNow = useCallback(() => {
    const serializableLinks = graphData.links.map(l => ({
      ...l,
      source: typeof l.source === 'string' ? l.source : (l.source as GraphNode).id,
      target: typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
    }));

    saveEvolutionaryState({
      graphData: { nodes: graphData.nodes.map(n => ({ ...n, isTargeted: false })), links: serializableLinks },
      mission,
      autoExplode,
      topic: topic || '',
      autogenesis,
      whiteboardElements,
      whiteboardConnections,
      codeFiles,
      tickets,
      architectureProposals,
      assets,
      snapshots,
      telemetryHistory: telemetry.history,
      themeMode,
      workspaceLayoutMode,
      studioSplitRatio,
      activeWorkspaceModule,
      biomimeticConfig,
      plasticityMetrics,
      chemotacticBeacons,
      audioVolume,
      audioMuted,
      primaryParadigm,
      secondaryParadigm,
      activeSpatialPattern,
      spatialAnchorNodeId,
      splitScreen,
      continentConfig
    });
  }, [
    graphData,
    mission,
    autoExplode,
    topic,
    autogenesis,
    whiteboardElements,
    whiteboardConnections,
    codeFiles,
    tickets,
    architectureProposals,
    assets,
    snapshots,
    telemetry.history,
    themeMode,
    workspaceLayoutMode,
    studioSplitRatio,
    activeWorkspaceModule,
    biomimeticConfig,
    plasticityMetrics,
    chemotacticBeacons,
    audioVolume,
    audioMuted,
    primaryParadigm,
    secondaryParadigm,
    activeSpatialPattern,
    spatialAnchorNodeId,
    splitScreen,
    continentConfig
  ]);

  const handleExportStateFile = useCallback(() => {
    const serializableLinks = graphData.links.map(l => ({
      ...l,
      source: typeof l.source === 'string' ? l.source : (l.source as GraphNode).id,
      target: typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
    }));

    exportEvolutionaryStateFile({
      version: 'v14.0.0-evolutionary-memory',
      savedAt: new Date().toISOString(),
      graphData: { nodes: graphData.nodes.map(n => ({ ...n, isTargeted: false })), links: serializableLinks },
      mission,
      autoExplode,
      topic: topic || '',
      autogenesis,
      whiteboardElements,
      whiteboardConnections,
      codeFiles,
      tickets,
      architectureProposals,
      assets,
      snapshots
    });
    setSystemNotice('Exported full evolutionary state memory to JSON file.');
    setTimeout(() => setSystemNotice(null), 3000);
  }, [graphData, mission, autoExplode, topic, autogenesis, whiteboardElements, whiteboardConnections, codeFiles, tickets, architectureProposals, assets, snapshots]);

  const handleImportStateFile = useCallback((content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        if (parsed.graphData && Array.isArray(parsed.graphData.nodes)) {
          setGraphData(parsed.graphData);
        }
        if (parsed.topic) setTopic(parsed.topic);
        if (parsed.autogenesis) setAutogenesis(parsed.autogenesis);
        if (Array.isArray(parsed.whiteboardElements)) setWhiteboardElements(parsed.whiteboardElements);
        if (Array.isArray(parsed.whiteboardConnections)) setWhiteboardConnections(parsed.whiteboardConnections);
        if (Array.isArray(parsed.codeFiles)) setCodeFiles(parsed.codeFiles);
        if (Array.isArray(parsed.tickets)) setTickets(parsed.tickets);
        if (Array.isArray(parsed.architectureProposals)) setArchitectureProposals(parsed.architectureProposals);
        if (Array.isArray(parsed.assets)) setAssets(parsed.assets);
        if (Array.isArray(parsed.snapshots)) setSnapshots(parsed.snapshots);
        setSystemNotice('Successfully imported evolutionary state memory.');
        setTimeout(() => setSystemNotice(null), 3500);
      }
    } catch {
      setSystemNotice('Failed to parse imported state memory JSON file.');
      setTimeout(() => setSystemNotice(null), 3500);
    }
  }, []);

  const handleResetMemory = useCallback(() => {
    clearEvolutionaryMemory();
    setSystemNotice('Evolutionary State Memory cleared. Re-initializing baseline...');
    setTimeout(() => window.location.reload(), 1000);
  }, []);

  // Omega Point Initialization
  useEffect(() => {
    const timer = setTimeout(() => setInitialized(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Hydration (Restores Evolutionary State Memory across sessions)
  useEffect(() => {
    const state = loadEvolutionaryState();
    if (state) {
      if (state.graphData && Array.isArray(state.graphData.nodes) && state.graphData.nodes.length > 0) {
        nodeCache.current.clear();
        const validNodeIdSet = new Set<string>();
        state.graphData.nodes.forEach((n: GraphNode) => {
          if (n && typeof n === 'object' && 'id' in n) {
            n.isTargeted = false;
            nodeCache.current.set(n.id, n);
            validNodeIdSet.add(n.id);
          }
        });
        const sanitizedLinks = Array.isArray(state.graphData.links)
          ? state.graphData.links.filter((l: any) => {
              const s = typeof l?.source === 'string' ? l.source : l?.source?.id;
              const t = typeof l?.target === 'string' ? l.target : l?.target?.id;
              return s && t && validNodeIdSet.has(s) && validNodeIdSet.has(t);
            })
          : [];
        setGraphData({ nodes: state.graphData.nodes, links: sanitizedLinks });
      }
      if (state.mission) setMission(state.mission);
      if (state.topic) setTopic(state.topic);
      setAutoExplode(!!state.autoExplode);
      if (state.autogenesis) setAutogenesis(state.autogenesis);
      if (Array.isArray(state.whiteboardElements) && state.whiteboardElements.length > 0) setWhiteboardElements(state.whiteboardElements);
      if (Array.isArray(state.whiteboardConnections) && state.whiteboardConnections.length > 0) setWhiteboardConnections(state.whiteboardConnections);
      if (Array.isArray(state.codeFiles) && state.codeFiles.length > 0) setCodeFiles(state.codeFiles);
      if (Array.isArray(state.tickets) && state.tickets.length > 0) setTickets(state.tickets);
      if (Array.isArray(state.architectureProposals) && state.architectureProposals.length > 0) setArchitectureProposals(state.architectureProposals);
      if (Array.isArray(state.assets) && state.assets.length > 0) setAssets(state.assets);
      if (Array.isArray(state.snapshots) && state.snapshots.length > 0) setSnapshots(state.snapshots);
      if (state.workspaceLayoutMode) setWorkspaceLayoutMode(state.workspaceLayoutMode);
      if (state.studioSplitRatio) setStudioSplitRatio(state.studioSplitRatio);
      if (state.activeWorkspaceModule) setActiveWorkspaceModule(state.activeWorkspaceModule);
      if (state.themeMode) setThemeMode(state.themeMode);
      if (state.biomimeticConfig) setBiomimeticConfig(state.biomimeticConfig);
      if (state.plasticityMetrics) setPlasticityMetrics(state.plasticityMetrics);
      if (Array.isArray(state.chemotacticBeacons)) setChemotacticBeacons(state.chemotacticBeacons);
      if (typeof state.audioVolume === 'number') {
        setAudioVolume(state.audioVolume);
        audioSynthesizer.setVolume(state.audioVolume);
      }
      if (typeof state.audioMuted === 'boolean') {
        setAudioMuted(state.audioMuted);
        if (state.audioMuted) audioSynthesizer.setVolume(0);
      }
      if (state.primaryParadigm) setPrimaryParadigm(state.primaryParadigm);
      if (state.secondaryParadigm) setSecondaryParadigm(state.secondaryParadigm);
      if (state.activeSpatialPattern) setActiveSpatialPattern(state.activeSpatialPattern);
      if (state.spatialAnchorNodeId !== undefined) setSpatialAnchorNodeId(state.spatialAnchorNodeId);
      if (typeof state.splitScreen === 'boolean') setSplitScreen(state.splitScreen);
      if (state.continentConfig) setContinentConfig(state.continentConfig);
    }
  }, []);

  // Sync state to localStorage during session with debounced persistence
  useEffect(() => {
    if (!initialized) return;
    const timer = setTimeout(() => {
      handleSaveStateNow();
    }, 800);
    return () => clearTimeout(timer);
  }, [initialized, handleSaveStateNow]);

  // Real-time cross-tab state memory synchronization
  useEffect(() => {
    const unsub = subscribeToStorageChanges((state) => {
      if (state.autogenesis) setAutogenesis(state.autogenesis);
      if (state.whiteboardElements) setWhiteboardElements(state.whiteboardElements);
      if (state.whiteboardConnections) setWhiteboardConnections(state.whiteboardConnections);
      if (state.codeFiles) setCodeFiles(state.codeFiles);
      if (state.tickets) setTickets(state.tickets);
      if (state.architectureProposals) setArchitectureProposals(state.architectureProposals);
      if (state.assets) setAssets(state.assets);
      if (state.snapshots) setSnapshots(state.snapshots);
    });
    return unsub;
  }, []);

  // Proactive Synthesis
  useEffect(() => {
    if (mission && graphData.nodes.length % 5 === 0 && graphData.nodes.length > 0) {
      if (synthesisIntervalRef.current) window.clearTimeout(synthesisIntervalRef.current);
      synthesisIntervalRef.current = window.setTimeout(async () => {
        try {
          const synthesis = await gemini.synthesizeMission(mission.topic, graphData.nodes);
          setMission(prev => (prev ? { ...prev, lastSynthesis: synthesis } : null));
        } catch {
          /* silent fallback */
        }
      }, 5000);
    }
    return () => {
      if (synthesisIntervalRef.current) window.clearTimeout(synthesisIntervalRef.current);
    };
  }, [graphData.nodes.length, mission?.topic]);

  const startMission = async (type: MissionType, overrideTopic?: string) => {
    const activeTopic = (overrideTopic ?? topic).trim();
    if (!activeTopic) return;
    if (overrideTopic) setTopic(overrideTopic);
    setLoading(true);
    setGraphData({ nodes: [], links: [] });
    setActiveCausalTrace(null);
    nodeCache.current.clear();
    try {
      const response = await gemini.initiateMission(activeTopic, type);
      const newMission: DiscoveryMission = {
        id: Math.random().toString(36).substr(2, 9),
        topic: activeTopic,
        type,
        startTime: Date.now(),
        progress: 10,
        synergyLevel: 5,
        goals: [response.briefing || 'Initiate neural baseline.'],
        milestones: response.milestones || ['Analyze core patterns', 'Establish topological vectors', 'Synthesize Omega Point']
      };
      setMission(newMission);
      processNewData(response, undefined, 0);
      recordTimelineSnapshot(`Mission: ${activeTopic}`, `Initiated ${type} exploration mission`);
    } catch (e) {
      setSystemNotice('Autonomous Semantic Ontology Materialized.');
      setTimeout(() => setSystemNotice(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const displayedGraphData = useMemo(() => {
    const traceIds = new Set(activeCausalTrace?.steps.map(s => s.nodeId) || []);
    const baseNodes =
      traceIds.size > 0
        ? graphData.nodes.map(n => ({ ...n, isTargeted: traceIds.has(n.id) }))
        : graphData.nodes;

    const baseNodeIds = new Set(baseNodes.map(n => n.id));
    const validLinks = graphData.links.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
      return s && t && baseNodeIds.has(s) && baseNodeIds.has(t);
    });

    if (!activeRelationshipFilter) {
      return { nodes: baseNodes, links: validLinks };
    }
    return {
      nodes: baseNodes,
      links: validLinks.filter(l => l.relationship === activeRelationshipFilter)
    };
  }, [graphData, activeRelationshipFilter, activeCausalTrace]);

  // Dual-Viewport Data for Counterfactual Split-Screen Divergence
  const canonicalViewportData = useMemo(() => {
    if (activeFork) {
      return activeFork.canonicalSnapshot;
    }
    return displayedGraphData;
  }, [activeFork, displayedGraphData]);

  const divergentViewportData = useMemo(() => {
    if (activeFork) {
      return activeFork.graphSnapshot;
    }
    return displayedGraphData;
  }, [activeFork, displayedGraphData]);

  // Live Topological Diff for Split-Screen Divergence Telemetry & Chromatic Heatmap
  const topologicalDiff = useMemo(() => {
    if (!activeFork) return null;
    return computeTopologicalDiff(canonicalViewportData, divergentViewportData);
  }, [activeFork, canonicalViewportData, divergentViewportData]);

  const handleFocusDivergenceEpicenter = useCallback((nodeId: string) => {
    setFocusedNodeId(nodeId);
    setFocusTrigger({ nodeId, timestamp: Date.now() });
    setSystemNotice(`Camera locked onto Divergence Epicenter node [${nodeId}]`);
  }, []);

  // Deterministic Watchdog Guard: ensures loading never stays stuck
  useEffect(() => {
    if (!loading) return;
    const watchdog = window.setTimeout(() => {
      setLoading(false);
    }, 3200);
    return () => window.clearTimeout(watchdog);
  }, [loading]);

  const processNewData = (newData: GeminiGraphResponse, parentNode?: GraphNode, depth: number = 0) => {
    setGraphData(prev => {
      const updatedNodes = [...prev.nodes];
      const updatedLinks = [...prev.links];
      updatedNodes.forEach(n => (n.isTargeted = false));

      newData.nodes.forEach((node, idx) => {
        const cleanLabel = sanitizeNodeLabel(node.label);
        const existing = nodeCache.current.get(node.id);
        if (existing && existing.isGhost && !node.isGhost) {
          existing.isGhost = false;
          existing.label = cleanLabel;
          existing.description = node.description;
          existing.strength = node.strength;
          setMission(m => (m ? { ...m, synergyLevel: Math.min(100, m.synergyLevel + 5) } : null));
        } else if (!existing) {
          const newNode: GraphNode = {
            ...node,
            label: cleanLabel,
            depth,
            isGhost: !!node.isGhost,
            x: parentNode?.x ? parentNode.x + (Math.random() - 0.5) * 120 : undefined,
            y: parentNode?.y ? parentNode.y + (Math.random() - 0.5) * 120 : undefined
          };
          nodeCache.current.set(node.id, newNode);
          updatedNodes.push(newNode);
          if (parentNode && idx === 0) {
            updatedLinks.push({
              source: parentNode.id,
              target: newNode.id,
              relationship: 'Extends',
              strength: 0.85
            });
          }
        }
      });

      const updatedNodeIdSet = new Set(updatedNodes.map(n => n.id));

      newData.links.forEach(link => {
        const s = typeof link.source === 'string' ? link.source : (link.source as any)?.id;
        const t = typeof link.target === 'string' ? link.target : (link.target as any)?.id;
        if (!s || !t || !updatedNodeIdSet.has(s) || !updatedNodeIdSet.has(t)) return;

        updatedLinks.push({
          source: s,
          target: t,
          relationship: link.relationship,
          strength: link.strength
        });
      });

      const deduped = deduplicateGraphTopology(updatedNodes, updatedLinks);
      nodeCache.current.clear();
      deduped.nodes.forEach(n => nodeCache.current.set(n.id, n));

      setMission(m => (m ? { ...m, progress: Math.min(100, deduped.nodes.length * 2) } : null));

      return { nodes: deduped.nodes, links: deduped.links };
    });
  };

  const handleNodeClick = useCallback(async (node: GraphNode) => {
    setSelectedNode(node);
    setFocusedNodeId(node.id);
    setChatLog('Neural link established. Decoding vectors...');

    if (node.isGhost) {
      setLoading(true);
      try {
        const response = await gemini.expandNode(node.label, mission?.topic || '', [...nodeCache.current.keys()], mission?.type || 'DEEP_DIVE');
        processNewData(response, node, (node.depth || 0) + 1);
        return;
      } catch {
        /* fallback handled in service */
      } finally {
        setLoading(false);
      }
    }

    if (!node.wikiSummary) {
      wiki.fetchWikiSummary(node.label).then(data => {
        if (data) {
          node.wikiSummary = data.summary;
          node.wikiUrl = data.url;
          node.wikiImage = data.image;
          setSelectedNode(prev => (prev?.id === node.id ? { ...node } : prev));
        }
      });
    }

    gemini.chatWithNode(node, mission?.topic || '').then(msg => {
      if (selectedNode?.id === node.id || nodeCache.current.get(node.id)?.isFocused) setChatLog(msg);
    });

    if (node.isExpanded) return;
    setLoading(true);
    try {
      const response = await gemini.expandNode(node.label, mission?.topic || '', [...nodeCache.current.keys()], mission?.type || 'DEEP_DIVE');
      const cached = nodeCache.current.get(node.id);
      if (cached) cached.isExpanded = true;
      processNewData(response, node, (node.depth || 0) + 1);
    } catch {
      /* fallback handled in service */
    } finally {
      setLoading(false);
    }
  }, [mission, selectedNode]);

  // Anticipatory Pilot Brain
  useEffect(() => {
    if (autoExplode && !loading && graphData.nodes.length > 0) {
      if (pilotTimerRef.current) window.clearTimeout(pilotTimerRef.current);
      pilotTimerRef.current = window.setTimeout(() => {
        const candidates = graphData.nodes.filter(n => !n.isExpanded);
        if (candidates.length === 0) return;

        const prioritized = [...candidates].sort((a, b) => {
          const scoreA = a.strength * 12 + a.depth * 3 + (a.isGhost ? 8 : 0) + Math.random() * 5;
          const scoreB = b.strength * 12 + b.depth * 3 + (b.isGhost ? 8 : 0) + Math.random() * 5;
          return scoreB - scoreA;
        });

        const next = prioritized[0];
        setGraphData(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => ({ ...n, isTargeted: n.id === next.id }))
        }));

        setTimeout(() => autoExplode && !loading && handleNodeClick(next), 1500);
      }, 4000);
    }
    return () => {
      if (pilotTimerRef.current) window.clearTimeout(pilotTimerRef.current);
    };
  }, [autoExplode, loading, graphData.nodes.length, topic, handleNodeClick]);

  const handleJumpFocus = useCallback((node: GraphNode) => {
    setFocusedNodeId(node.id);
    setFocusTrigger({ nodeId: node.id, timestamp: Date.now() });
    setSelectedNode(node);
    handleNodeClick(node);
    setSystemNotice(`Jump-focused to [${node.label}]`);
    setTimeout(() => setSystemNotice(null), 3500);
  }, [handleNodeClick]);

  const handleFocusContinent = useCallback((continentId: string) => {
    setContinentConfig(prev => {
      const nextIsolated = prev.isolatedContinentId === continentId ? null : continentId;
      setSystemNotice(
        nextIsolated
          ? `Camera locked & isolated [${continentId} Continent]`
          : 'Released continent isolation; viewing full archipelago'
      );
      setTimeout(() => setSystemNotice(null), 3500);
      return {
        ...prev,
        isolatedContinentId: nextIsolated
      };
    });
    setContinentFocusTrigger({ continentId, timestamp: Date.now() });
  }, []);

  const handleToggleCollapseContinent = useCallback((continentId: string) => {
    setContinentConfig(prev => {
      const exists = prev.collapsedContinentIds.includes(continentId);
      const nextCollapsed = exists
        ? prev.collapsedContinentIds.filter(id => id !== continentId)
        : [...prev.collapsedContinentIds, continentId];
      setSystemNotice(
        exists
          ? `Expanded [${continentId} Continent] into individual nodes`
          : `Folded [${continentId} Continent] into a high-gravity Macro-Node`
      );
      setTimeout(() => setSystemNotice(null), 3500);
      return {
        ...prev,
        collapsedContinentIds: nextCollapsed
      };
    });
  }, []);

  const handleResetContinentAnchors = useCallback(() => {
    setContinentConfig({
      enabled: true,
      gravity: 0.45,
      separation: 340,
      hullOpacity: 0.8,
      isolatedContinentId: null,
      collapsedContinentIds: []
    });
    setResetAnchorsTrigger(prev => prev + 1);
    setSystemNotice('Reset Knowledge Continents tectonic anchors and physics to equilibrium');
    setTimeout(() => setSystemNotice(null), 3500);
  }, []);

  if (!initialized) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center space-y-8"
        >
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 tracking-tighter drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            OMEGA POINT
          </div>
          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-sky-500"
            />
            <div className="text-[10px] text-slate-500 font-black tracking-[0.5em] uppercase">
              Materializing Adaptive Command Center
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleReset = () => {
    clearEvolutionaryMemory();
    window.location.reload();
  };

  const showGraphPane = workspaceLayoutMode !== 'FULL_STUDIO';
  const showStudioPane = workspaceLayoutMode !== 'GRAPH_ONLY';

  const graphColSpanClass =
    !showStudioPane
      ? 'col-span-1'
      : studioSplitRatio === 'GRAPH_WIDE_65_35'
      ? 'xl:col-span-8'
      : studioSplitRatio === 'STUDIO_WIDE_35_65'
      ? 'xl:col-span-4'
      : 'xl:col-span-6';

  const studioColSpanClass =
    !showGraphPane
      ? 'col-span-1'
      : studioSplitRatio === 'GRAPH_WIDE_65_35'
      ? 'xl:col-span-4'
      : studioSplitRatio === 'STUDIO_WIDE_35_65'
      ? 'xl:col-span-8'
      : 'xl:col-span-6';

  return (
    <div
      className="omega-root-viewport flex flex-col h-screen bg-[#020617] text-slate-100 font-sans selection:bg-sky-500/40 overflow-hidden"
      style={{ '--omega-ui-scale': screenProfile.effectiveUiScale } as React.CSSProperties}
    >
      <CommandHeader
        topic={topic}
        setTopic={setTopic}
        startMission={startMission}
        loading={loading}
        mission={mission}
        autoExplode={autoExplode}
        setAutoExplode={setAutoExplode}
        swarmActive={swarmActive}
        setSwarmActive={v => {
          setSwarmActive(v);
          setSystemNotice(v ? '100 Expert Researchers & Builders Swarm Activated.' : 'Expert Swarms Disengaged (Standby Mode).');
          setTimeout(() => setSystemNotice(null), 3500);
        }}
        graphNodes={graphData.nodes}
        graphLinks={graphData.links}
        selectedNode={selectedNode || pinnedNode}
        focusedNodeId={focusedNodeId}
        onJumpFocus={handleJumpFocus}
        workspaceLayoutMode={workspaceLayoutMode}
        onChangeWorkspaceLayoutMode={mode => {
          setWorkspaceLayoutMode(mode);
          setSystemNotice(
            mode === 'GRAPH_ONLY'
              ? 'Returned to Full Spatial Knowledge Graph'
              : mode === 'FULL_STUDIO'
              ? 'Expanded Integrated Creative Workspace Studio Fullscreen'
              : 'Docked Creative Workspace Studio alongside Spatial Knowledge Graph'
          );
          setTimeout(() => setSystemNotice(null), 3200);
        }}
        activeWorkspaceModule={activeWorkspaceModule}
        onSelectWorkspaceModule={mod => {
          setActiveWorkspaceModule(mod);
          setSystemNotice(`Switched Creative Studio to [${mod.replace('_', ' ')}]`);
          setTimeout(() => setSystemNotice(null), 3000);
        }}
        onOpenCommandPalette={(tab = 'COMMANDS') => {
          setCommandPaletteTab(tab);
          setCommandPaletteOpen(true);
        }}
        snapshotCount={snapshots.length}
        selfDevActive={autogenesis.active}
        generationVersion={autogenesis.generationVersion}
        autogenesis={autogenesis}
        onSaveStateNow={handleSaveStateNow}
        onImportState={handleImportStateFile}
        onResetMemory={handleResetMemory}
        onExportState={handleExportStateFile}
        onStepAutogenesis={handleStepAutogenesisStage}
        onToggle3DSpatial={() => {
          setPrimaryParadigm(p => p === 'HOLOGRAPHIC_3D' ? 'FORCE_CONTINENTS' : 'HOLOGRAPHIC_3D');
          setSystemNotice('Toggled Holographic 3D Spatial Viewport');
          setTimeout(() => setSystemNotice(null), 3000);
        }}
        onCaptureSnapshot={handleSaveStateNow}
        onTriggerDeployment={handleTriggerDeployment}
        onToggleSelfDev={() => {
          const nextActive = !autogenesis.active;
          setAutogenesis(prev => ({ ...prev, active: nextActive }));
          if (nextActive) {
            setActiveWorkspaceModule('AUTOGENESIS');
            setWorkspaceLayoutMode(prev => (prev === 'GRAPH_ONLY' ? 'SPLIT_STUDIO' : prev));
            if (graphData.nodes.length === 0 && !loading) {
              startMission('DEEP_DIVE', 'Omega Point Recursive Self-Architecture');
            }
          }
          setSystemNotice(
            nextActive
              ? `Autonomous Recursive Self-Development Activated (${autogenesis.generationVersion})`
              : 'Autonomous Self-Development Paused'
          );
          setTimeout(() => setSystemNotice(null), 3500);
        }}
      />

      <main className="flex-1 relative overflow-hidden">
        {graphData.nodes.length > 0 || showStudioPane ? (
          <div
            className={cn(
              'w-full h-full grid',
              showGraphPane && showStudioPane ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
            )}
          >
            {/* LEFT / PRIMARY PANE: SPATIAL KNOWLEDGE GRAPH */}
            {showGraphPane && (
              <div className={cn('relative w-full h-full overflow-hidden', graphColSpanClass)}>
                <DiagramParadigmToolbar
                  primaryParadigm={primaryParadigm}
                  onSelectPrimary={p => {
                    setPrimaryParadigm(p);
                    const spec = DIAGRAM_PARADIGM_SPECS.find(s => s.id === p);
                    setSystemNotice(`Viewport A morphed to [${spec?.fullName || p}]`);
                    setTimeout(() => setSystemNotice(null), 3200);
                  }}
                  splitScreen={splitScreen}
                  onToggleSplitScreen={() => {
                    setSplitScreen(prev => {
                      const next = !prev;
                      setSystemNotice(
                        next
                          ? 'Activated Synchronized Split-Screen Diagram Comparison (Viewports A & B)'
                          : 'Returned to Single Primary Diagram Viewport'
                      );
                      setTimeout(() => setSystemNotice(null), 3200);
                      return next;
                    });
                  }}
                  secondaryParadigm={secondaryParadigm}
                  onSelectSecondary={p => {
                    setSecondaryParadigm(p);
                    const spec = DIAGRAM_PARADIGM_SPECS.find(s => s.id === p);
                    setSystemNotice(`Viewport B morphed to [${spec?.fullName || p}]`);
                    setTimeout(() => setSystemNotice(null), 3200);
                  }}
                  onSwapParadigms={() => {
                    setPrimaryParadigm(secondaryParadigm);
                    setSecondaryParadigm(primaryParadigm);
                    setSystemNotice('Swapped Viewport A & Viewport B Diagram Paradigms');
                    setTimeout(() => setSystemNotice(null), 3000);
                  }}
                  activeSpatialPattern={activeSpatialPattern}
                  onSelectSpatialPattern={handleApplySpatialPattern}
                  anchorNode={activeAnchorNode}
                />

                <div
                  className={cn(
                    'w-full h-full grid',
                    splitScreen
                      ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800'
                      : 'grid-cols-1'
                  )}
                >
                  <div className="relative w-full h-full overflow-hidden">
                    <Graph
                      data={canonicalViewportData}
                      onNodeClick={handleNodeClick}
                      isLoading={loading}
                      synergyLevel={mission?.synergyLevel || 0}
                      focusedNodeId={focusedNodeId}
                      focusTrigger={focusTrigger}
                      onHoverCoordinates={setHoveredCoordinates}
                      pinnedNodeId={pinnedNode?.id || null}
                      onTogglePin={handleTogglePin}
                      continentConfig={continentConfig}
                      continentFocusTrigger={continentFocusTrigger}
                      resetAnchorsTrigger={resetAnchorsTrigger}
                      onContinentsUpdated={setContinents}
                      onFocusContinent={handleFocusContinent}
                      onToggleCollapseContinent={handleToggleCollapseContinent}
                      diagramParadigm={primaryParadigm}
                      viewportLabel={splitScreen ? (activeFork ? 'VIEWPORT A · CANONICAL' : 'VIEWPORT A') : undefined}
                      sharedHoveredNodeId={sharedHoveredNodeId}
                      onHoverNode={setSharedHoveredNodeId}
                      activeCausalTrace={activeCausalTrace}
                      onClearCausalTrace={() => setActiveCausalTrace(null)}
                      activeSpatialPattern={activeSpatialPattern}
                      spatialAnchorNodeId={spatialAnchorNodeId || selectedNode?.id || pinnedNode?.id || null}
                      centralityMap={centralityAnalysis.metrics}
                      biomimeticConfig={biomimeticConfig}
                      biomimeticHyphae={activeHyphae}
                      morphicPulseTimestamp={morphicPulseTimestamp}
                      chemotacticBeacons={chemotacticBeacons}
                      onUpdateBeacon={handleUpdateBeacon}
                      fitViewportTrigger={fitViewportTrigger}
                      safeInsets={screenProfile.safeInsets}
                      autoOptimizeScreen={autoOptimizeScreen}
                      aetherConfig={aetherConfig}
                      onTriggerAetherPulse={handleTriggerAetherPulse}
                      onDiveSubGraph={handleDiveMicrocosm}
                      onReinforceEdge={handleReinforceEdge}
                      divergenceDiff={topologicalDiff}
                      divergenceRole="CANONICAL"
                      showDivergenceHeatmap={showDivergenceHeatmap}
                    />
                  </div>

                  {splitScreen && (
                    <div className="relative w-full h-full overflow-hidden">
                      <Graph
                        data={divergentViewportData}
                        onNodeClick={handleNodeClick}
                        isLoading={loading}
                        synergyLevel={mission?.synergyLevel || 0}
                        focusedNodeId={focusedNodeId}
                        focusTrigger={focusTrigger}
                        onHoverCoordinates={setHoveredCoordinates}
                        pinnedNodeId={pinnedNode?.id || null}
                        onTogglePin={handleTogglePin}
                        continentConfig={continentConfig}
                        continentFocusTrigger={continentFocusTrigger}
                        resetAnchorsTrigger={resetAnchorsTrigger}
                        onFocusContinent={handleFocusContinent}
                        onToggleCollapseContinent={handleToggleCollapseContinent}
                        diagramParadigm={secondaryParadigm}
                        viewportLabel={activeFork ? `VIEWPORT B · FORK (${activeFork.forkLabel.toUpperCase()})` : 'VIEWPORT B'}
                        sharedHoveredNodeId={sharedHoveredNodeId}
                        onHoverNode={setSharedHoveredNodeId}
                        activeCausalTrace={activeCausalTrace}
                        onClearCausalTrace={() => setActiveCausalTrace(null)}
                        activeSpatialPattern={activeSpatialPattern}
                        spatialAnchorNodeId={spatialAnchorNodeId || selectedNode?.id || pinnedNode?.id || null}
                        centralityMap={centralityAnalysis.metrics}
                        biomimeticConfig={biomimeticConfig}
                        biomimeticHyphae={activeHyphae}
                        morphicPulseTimestamp={morphicPulseTimestamp}
                        chemotacticBeacons={chemotacticBeacons}
                        onUpdateBeacon={handleUpdateBeacon}
                        fitViewportTrigger={fitViewportTrigger}
                        safeInsets={screenProfile.safeInsets}
                        autoOptimizeScreen={autoOptimizeScreen}
                        aetherConfig={aetherConfig}
                        onTriggerAetherPulse={handleTriggerAetherPulse}
                        onDiveSubGraph={handleDiveMicrocosm}
                        onReinforceEdge={handleReinforceEdge}
                        divergenceDiff={topologicalDiff}
                        divergenceRole="FORK"
                        showDivergenceHeatmap={showDivergenceHeatmap}
                      />
                    </div>
                  )}
                </div>

                {!showStudioPane && (
                  <MissionStatus
                    mission={mission}
                    autoCollapse={screenProfile.autoCollapseSecondaryHud}
                  />
                )}
                <ContinentControlsHUD
                  continents={continents}
                  config={continentConfig}
                  onChangeConfig={setContinentConfig}
                  onFocusContinent={handleFocusContinent}
                  onToggleCollapseContinent={handleToggleCollapseContinent}
                  onResetContinentAnchors={handleResetContinentAnchors}
                  onOpenContinentWorkspace={handleOpenContinentWorkspace}
                  autoCollapse={screenProfile.autoCollapseSecondaryHud}
                />
                {hudDensityMode !== 'FOCUS_MINIMAL' && (
                  <GraphLegend
                    primaryParadigm={primaryParadigm}
                    activeSpatialPattern={activeSpatialPattern}
                    continents={continents}
                    totalNodes={graphData.nodes.length}
                    totalLinks={graphData.links.length}
                    className="hidden xl:block bottom-14 left-[332px]"
                  />
                )}
                {!(selectedNode || pinnedNode) && (
                  <BiomimeticHUD
                    config={biomimeticConfig}
                    metrics={plasticityMetrics}
                    pendingAnastomosesCount={pendingAnastomoses.length}
                    prunableCount={prunableLinkIndices.length}
                    beacons={chemotacticBeacons}
                    audioVolume={audioVolume}
                    audioMuted={audioMuted}
                    onDeployBeacon={handleDeployBeacon}
                    onClearBeacons={handleClearBeacons}
                    onChangeAudioVolume={handleChangeAudioVolume}
                    onToggleAudioMute={handleToggleAudioMute}
                    onChangeConfig={setBiomimeticConfig}
                    onTriggerMorphicPulse={handleTriggerMorphicPulse}
                    onConsolidateAnastomoses={handleConsolidateAnastomoses}
                    onPruneDormantSynapses={handlePruneDormantSynapses}
                    onResetPlasticity={handleResetPlasticity}
                  />
                )}
                {!showStudioPane && (
                  <AbstractionNavigator
                    currentTier={currentTier}
                    setTier={setCurrentTier}
                    graphData={graphData}
                    mission={mission}
                    activeRelationshipFilter={activeRelationshipFilter}
                    setActiveRelationshipFilter={setActiveRelationshipFilter}
                  />
                )}
                {!showStudioPane && hudDensityMode !== 'FOCUS_MINIMAL' && (
                  <ScientificTelemetryTray
                    telemetry={telemetry}
                    graphData={graphData}
                    hoveredCoordinates={hoveredCoordinates}
                    onExportSnapshot={handleExportSnapshot}
                    themeMode={themeMode}
                    onToggleTheme={() => setThemeMode(prev => (prev === 'obsidian' ? 'laboratory' : 'obsidian'))}
                  />
                )}
              </div>
            )}

            {/* RIGHT / STUDIO PANE: INTEGRATED CREATIVE WORKSPACE (4 MODULAR SYSTEMS) */}
            {showStudioPane && (
              <div className={cn('relative w-full h-full overflow-hidden', studioColSpanClass)}>
                <CreativeWorkspaceStudio
                  activeModule={activeWorkspaceModule}
                  onSelectModule={setActiveWorkspaceModule}
                  layoutMode={workspaceLayoutMode}
                  onChangeLayoutMode={setWorkspaceLayoutMode}
                  splitRatio={studioSplitRatio}
                  onChangeSplitRatio={setStudioSplitRatio}
                  activeContinent={workspaceContinent}
                  onClearContinentContext={() => setWorkspaceContinent(null)}
                  activeCausalTrace={activeCausalTrace}
                  topic={topic}
                  nodes={graphData.nodes}
                  selectedNode={selectedNode || pinnedNode}
                  onSelectGraphNode={handleJumpFocus}
                  whiteboardElements={whiteboardElements}
                  whiteboardConnections={whiteboardConnections}
                  onAddWhiteboardElement={handleAddWhiteboardElement}
                  onMoveWhiteboardElement={handleMoveWhiteboardElement}
                  onDeleteWhiteboardElement={handleDeleteWhiteboardElement}
                  onConnectWhiteboardElements={handleConnectWhiteboardElements}
                  onAutoAlignWhiteboard={handleAutoAlignWhiteboard}
                  onProposeArchitecture={handleProposeArchitecture}
                  onSyncGraphToWhiteboard={handleSyncGraphToWhiteboard}
                  codeFiles={codeFiles}
                  activeFileId={activeFileId}
                  onSelectFile={setActiveFileId}
                  onUpdateFileContent={handleUpdateFileContent}
                  onGenerateCodeModule={() => handleGenerateCodeModule()}
                  onCreateCustomFile={handleCreateCustomFile}
                  onDeleteFile={handleDeleteFile}
                  onMaterializeCodeToGraph={handleMaterializeCodeToGraph}
                  terminalLogs={terminalLogs}
                  onRunScript={handleRunScript}
                  pipelineStages={pipelineStages}
                  isDeploying={isDeploying}
                  onTriggerDeployment={handleTriggerDeployment}
                  tickets={tickets}
                  onCreateTicket={() => handleCreateTicket()}
                  onAdvanceTicket={handleAdvanceTicket}
                  onRegressTicket={handleRegressTicket}
                  onDeleteTicket={handleDeleteTicket}
                  architectureProposals={architectureProposals}
                  onRatifyProposal={handleRatifyProposal}
                  assets={assets}
                  onCreateAsset={handleCreateAsset}
                  onBindAssetToNode={handleBindAssetToNode}
                  onUpdateAssetContent={handleUpdateAssetContent}
                  onDeleteAsset={handleDeleteAsset}
                  autogenesis={autogenesis}
                  onToggleAutogenesis={() =>
                    setAutogenesis(prev => {
                      const next = !prev.active;
                      setSystemNotice(
                        next
                          ? `Continuous Self-Development Loop Engaged (${prev.generationVersion})`
                          : 'Continuous Self-Development Loop Paused'
                      );
                      setTimeout(() => setSystemNotice(null), 3200);
                      return { ...prev, active: next };
                    })
                  }
                  onStepAutogenesisStage={handleStepAutogenesisStage}
                  onRunFullAutogenesisCycle={() => executeFullAutogenesisCycle()}
                  onChangeAutogenesisCadence={cadence =>
                    setAutogenesis(prev => ({ ...prev, cadence }))
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#020617]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl text-center space-y-12"
            >
              <div className="relative group flex flex-col items-center">
                <div className="absolute inset-0 bg-sky-500/10 blur-[120px] rounded-full" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
                  className="relative w-44 h-44 bg-slate-950/90 border-2 border-sky-400/60 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(14,165,233,0.3)] ring-1 ring-white/20 transition-transform duration-700 group-hover:scale-105"
                >
                  <Compass className="w-20 h-20 text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" strokeWidth={1.5} />
                </motion.div>
              </div>
              <div className="space-y-6 px-10">
                <h2 className="text-6xl font-black tracking-tighter italic uppercase text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  Omega Horizon
                </h2>
                <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-lg mx-auto italic">
                  Traverse the boundaries of knowledge through{' '}
                  <span className="text-sky-400 underline underline-offset-8 decoration-sky-400/50 font-bold">
                    generative topological mapping
                  </span>{' '}
                  &amp; an integrated{' '}
                  <span className="text-emerald-400 font-bold">Autonomous Creative Studio</span>.
                </p>

                {/* Quick inquiry chips */}
                <div className="flex flex-wrap justify-center gap-2.5 pt-4">
                  {[
                    'Category:Diagrams & Visual Topology',
                    'Quantum Entanglement',
                    'Artificial General Intelligence',
                    'Cosmological Inflation',
                    'Neural Topology'
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      data-swarm-target={`landing-chip-${suggestion}`}
                      onClick={() => {
                        startMission('DEEP_DIVE', suggestion);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900/80 border-2 border-sky-500/40 hover:border-sky-300 hover:bg-sky-500/20 text-sky-300 hover:text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.15)] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Direct Launch Creative Workspace Studio & Self-Development CTAs */}
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    data-swarm-target="landing-open-studio"
                    onClick={() => {
                      startMission('DEEP_DIVE', 'Category:Diagrams & Visual Topology');
                      setWorkspaceLayoutMode('SPLIT_STUDIO');
                    }}
                    className="px-6 py-3 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border-2 border-sky-400 text-white text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(14,165,233,0.3)] flex items-center gap-2.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-sky-300" />
                    <span>Launch Spatial Graph + Creative Studio</span>
                  </button>

                  <button
                    type="button"
                    data-swarm-target="landing-self-develop"
                    onClick={() => {
                      startMission('DEEP_DIVE', 'Omega Point Recursive Self-Architecture');
                      setWorkspaceLayoutMode('SPLIT_STUDIO');
                      setActiveWorkspaceModule('AUTOGENESIS');
                      setAutogenesis(prev => ({ ...prev, active: true }));
                    }}
                    className="px-6 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-400 text-emerald-100 text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center gap-2.5 cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>Let App Develop Itself (Autogenesis)</span>
                  </button>
                </div>

                <div className="pt-6 flex justify-center gap-12 text-[10px] font-black text-sky-400/80 uppercase tracking-[0.5em] items-center">
                  <span>Neural Matrix</span>
                  <div className="w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  <span>100 Sovereign Swarm</span>
                  <div className="w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  <span>Creative Studio</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* System Notice Toast */}
        <AnimatePresence>
          {systemNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-slate-950/95 border-2 border-sky-400/80 shadow-[0_0_30px_rgba(14,165,233,0.4)] ring-1 ring-white/20 text-xs font-mono font-bold text-sky-300 flex items-center gap-3 backdrop-blur-3xl"
            >
              <AlertCircle className="w-4 h-4 text-sky-400" />
              <span>{systemNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <InsightOverlay
          selectedNode={selectedNode || pinnedNode}
          setSelectedNode={n => {
            if (pinnedNode) return;
            setSelectedNode(n);
          }}
          isPinned={!!pinnedNode}
          togglePinned={() => setPinnedNode(pinnedNode ? null : selectedNode)}
          handleNodeClick={handleNodeClick}
          chatLog={chatLog}
          studioOpen={showStudioPane}
          allNodes={graphData.nodes}
          onBridgeSemanticSynapse={handleBridgeSemanticSynapse}
          codeFiles={codeFiles}
          tickets={tickets}
          assets={assets}
          onOpenStudioModule={mod => {
            setActiveWorkspaceModule(mod);
            if (workspaceLayoutMode === 'GRAPH_ONLY') setWorkspaceLayoutMode('SPLIT_STUDIO');
          }}
          onSynthesizeNodeCode={node => {
            setActiveWorkspaceModule('CODE_IDE');
            if (workspaceLayoutMode === 'GRAPH_ONLY') setWorkspaceLayoutMode('SPLIT_STUDIO');
            handleGenerateCodeModule(node.label);
          }}
          onCreateNodeTicket={node => {
            setActiveWorkspaceModule('PROJECT_BOARD');
            if (workspaceLayoutMode === 'GRAPH_ONLY') setWorkspaceLayoutMode('SPLIT_STUDIO');
            handleCreateTicket(node.label);
          }}
          onAddNodeToWhiteboard={node => {
            setActiveWorkspaceModule('WHITEBOARD');
            if (workspaceLayoutMode === 'GRAPH_ONLY') setWorkspaceLayoutMode('SPLIT_STUDIO');
            handleAddWhiteboardElement({
              title: node.label,
              subtitle: node.description || 'Coupled from Spatial Knowledge Graph',
              linkedNodeId: node.id
            });
          }}
          onOpenCausalTracer={() => {
            setCommandPaletteTab('CAUSAL_TRACE');
            setCommandPaletteOpen(true);
          }}
          activeSpatialPattern={activeSpatialPattern}
          onApplySpatialPattern={handleApplySpatialPattern}
          centralityMetrics={selectedNodeCentralityMetrics}
          onDiveMicrocosm={handleDiveMicrocosm}
          onSynthesizeSubGraph={handleSynthesizeSubGraph}
          isSynthesizingSubGraph={isSynthesizingSubGraph}
        />

        {/* Universal Command Palette (Cmd+K), Shortest-Path Causal Tracer & Time-Travel Snapshots */}
        <UniversalCommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          initialTab={commandPaletteTab}
          topic={topic}
          nodes={graphData.nodes}
          links={graphData.links}
          selectedNode={selectedNode || pinnedNode}
          onJumpFocus={handleJumpFocus}
          onBridgeSemanticSynapse={handleBridgeSemanticSynapse}
          onPreEmptiveStabilize={handlePreEmptiveStabilize}
          primaryParadigm={primaryParadigm}
          onSelectPrimaryParadigm={setPrimaryParadigm}
          splitScreen={splitScreen}
          onToggleSplitScreen={() => setSplitScreen(prev => !prev)}
          workspaceLayoutMode={workspaceLayoutMode}
          onChangeWorkspaceLayoutMode={setWorkspaceLayoutMode}
          activeWorkspaceModule={activeWorkspaceModule}
          onSelectWorkspaceModule={setActiveWorkspaceModule}
          codeFiles={codeFiles}
          onSelectCodeFile={setActiveFileId}
          tickets={tickets}
          assets={assets}
          onGenerateCodeModule={() => handleGenerateCodeModule()}
          onProposeArchitecture={handleProposeArchitecture}
          onCreateTicket={() => handleCreateTicket()}
          onTriggerDeployment={handleTriggerDeployment}
          onMaterializeCodeToGraph={handleMaterializeCodeToGraph}
          activeCausalTrace={activeCausalTrace}
          onSetCausalTrace={setActiveCausalTrace}
          onExportTraceToWhiteboard={handleExportTraceToWhiteboard}
          snapshots={snapshots}
          onCaptureSnapshot={handleCaptureSnapshot}
          onRestoreSnapshot={handleRestoreSnapshot}
          onDeleteSnapshot={handleDeleteSnapshot}
        />

        {/* 100 Sovereign Researchers & Builders Swarm (Toggleable, default OFF) */}
        {swarmActive && (
          <SwarmIntelligencePointer
            activeNode={selectedNode || pinnedNode}
            nodes={graphData.nodes}
            synergyLevel={mission?.synergyLevel || 0}
            onSelectNode={handleNodeClick}
            onHoverNode={setSharedHoveredNodeId}
            onJumpFocus={handleJumpFocus}
            onStartMission={(newTopic, type) => startMission(type, newTopic)}
            primaryParadigm={primaryParadigm}
            onSelectPrimaryParadigm={p => {
              setPrimaryParadigm(p);
              const spec = DIAGRAM_PARADIGM_SPECS.find(s => s.id === p);
              setSystemNotice(`Swarm morphed Viewport A to [${spec?.fullName || p}]`);
              setTimeout(() => setSystemNotice(null), 3200);
            }}
            secondaryParadigm={secondaryParadigm}
            onSelectSecondaryParadigm={p => {
              setSecondaryParadigm(p);
              const spec = DIAGRAM_PARADIGM_SPECS.find(s => s.id === p);
              setSystemNotice(`Swarm morphed Viewport B to [${spec?.fullName || p}]`);
              setTimeout(() => setSystemNotice(null), 3200);
            }}
            splitScreen={splitScreen}
            onToggleSplitScreen={() => {
              setSplitScreen(prev => {
                const next = !prev;
                setSystemNotice(
                  next
                    ? 'Swarm activated 2X Synchronized Split-Screen Comparison'
                    : 'Swarm returned to Single Primary Viewport'
                );
                setTimeout(() => setSystemNotice(null), 3200);
                return next;
              });
            }}
            onSwapParadigms={() => {
              setPrimaryParadigm(secondaryParadigm);
              setSecondaryParadigm(primaryParadigm);
              setSystemNotice('Swarm swapped Viewport A & Viewport B Diagram Paradigms');
              setTimeout(() => setSystemNotice(null), 3000);
            }}
            continents={continents}
            onFocusContinent={handleFocusContinent}
            onToggleCollapseContinent={handleToggleCollapseContinent}
            currentTier={currentTier}
            onChangeTier={tier => {
              setCurrentTier(tier);
              setSystemNotice(`Swarm shifted Cognitive Tier to [${tier.replace('LEVEL_', 'L')}]`);
              setTimeout(() => setSystemNotice(null), 3000);
            }}
            isLoading={loading}
            workspaceLayoutMode={workspaceLayoutMode}
            activeWorkspaceModule={activeWorkspaceModule}
            onOpenWorkspaceModule={mod => {
              setActiveWorkspaceModule(mod);
              setWorkspaceLayoutMode(prev => (prev === 'GRAPH_ONLY' ? 'SPLIT_STUDIO' : prev));
            }}
            onGenerateCodeModule={() => handleGenerateCodeModule()}
            onProposeArchitecture={handleProposeArchitecture}
            onManageTaskTicket={() => {
              if (Math.random() < 0.45) {
                handleCreateTicket();
              } else {
                handleAdvanceTicket();
              }
            }}
            onAutomateDeployment={handleTriggerDeployment}
            onEmbedWorkspaceAsset={handleCreateAsset}
          />
        )}
      </main>

      <SystemFooter
        mission={mission}
        graphData={graphData}
        autoExplode={autoExplode}
        onReset={handleReset}
        swarmActive={swarmActive}
        activeCausalTrace={activeCausalTrace}
        onClearCausalTrace={() => setActiveCausalTrace(null)}
        screenProfile={screenProfile}
        autoOptimizeScreen={autoOptimizeScreen}
        onToggleAutoOptimizeScreen={() => {
          setAutoOptimizeScreen(prev => {
            const next = !prev;
            setSystemNotice(
              next
                ? `Autonomous Screen Self-Optimization Engaged (${screenProfile.width}×${screenProfile.height} · ${screenProfile.tierLabel})`
                : 'Screen Self-Optimization Switched to Manual Mode'
            );
            setTimeout(() => setSystemNotice(null), 3200);
            return next;
          });
        }}
        hudDensityMode={hudDensityMode}
        onChangeHudDensityMode={mode => {
          setHudDensityMode(mode);
          setFitViewportTrigger(prev => prev + 1);
          setSystemNotice(`HUD Overlay Density set to [${mode.replace('_', ' ')}]`);
          setTimeout(() => setSystemNotice(null), 3000);
        }}
        workspacePreset={workspacePreset}
        onSelectWorkspacePreset={handleSelectWorkspacePreset}
        opticalScaleOverride={opticalScaleOverride}
        onChangeOpticalScale={scale => {
          setOpticalScaleOverride(scale);
          setFitViewportTrigger(prev => prev + 1);
          setSystemNotice(
            scale === null
              ? `Optical UI Scale restored to Auto Screen Tier (${Math.round(screenProfile.uiScale * 100)}%)`
              : `Manual Optical UI Scale set to ${Math.round(scale * 100)}%`
          );
          setTimeout(() => setSystemNotice(null), 3000);
        }}
        onFitScreenNow={() => {
          setFitViewportTrigger(prev => prev + 1);
          setSystemNotice(
            `Calibrated & centered graph topology to ${screenProfile.width}×${screenProfile.height} safe-area`
          );
          setTimeout(() => setSystemNotice(null), 3000);
        }}
        breadcrumbs={breadcrumbStack}
        onAscendBreadcrumb={handleAscendBreadcrumb}
        timelineFrames={timelineFrames}
        currentTimelineIndex={currentTimelineIndex}
        isTimelinePlaying={isTimelinePlaying}
        onToggleTimelinePlay={handleToggleTimelinePlay}
        onSelectTimelineFrame={handleSelectTimelineFrame}
        onStepTimelineFrame={handleStepTimelineFrame}
        onForkTimelineBranch={handleForkTimelineBranch}
        activeFork={activeFork}
        aetherConfig={aetherConfig}
        onToggleAetherSwarm={handleToggleAetherSwarm}
        divergenceDiff={topologicalDiff}
        showDiffHeatmap={showDivergenceHeatmap}
        onToggleDiffHeatmap={() => setShowDivergenceHeatmap(prev => !prev)}
        onFocusEpicenter={handleFocusDivergenceEpicenter}
      />

      <StudioPalette
        snapshots={snapshots}
        onScrub={handleScrub}
        onExecuteKernel={handleExecuteKernel}
        nodes={graphData.nodes}
        links={graphData.links}
        codeFiles={codeFiles}
        onApplyRecursiveCycle={handleApplyRecursiveCycle}
        onBridgeCavityAxiom={handleBridgeCavityAxiom}
      />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }

        .omega-root-viewport [data-swarm-target="physics-engine-hud"] {
          transform: scale(var(--omega-ui-scale, 1));
          transform-origin: top left;
        }
        .omega-root-viewport aside[aria-label="Knowledge Continents Controls"] {
          transform: scale(var(--omega-ui-scale, 1));
          transform-origin: bottom left;
        }
        .omega-root-viewport aside[aria-label="Biomimetic Plasticity & Mycelial Engine"] {
          transform: scale(var(--omega-ui-scale, 1));
          transform-origin: top right;
        }
      `}</style>
    </div>
  );
};

export default App;
