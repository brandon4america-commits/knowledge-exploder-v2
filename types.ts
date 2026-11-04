
import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export type MissionType = 'DEEP_DIVE' | 'BREADTH_SCAN' | 'FOUNDATIONS';

export interface DiscoveryMission {
  id: string;
  topic: string;
  type: MissionType;
  startTime: number;
  progress: number;
  synergyLevel: number; // 0 to 100, increases as patterns are uncovered
  goals: string[];
  milestones: string[];
  lastSynthesis?: string;
}

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  group: number;
  description?: string;
  isExpanded?: boolean;
  isGhost?: boolean;
  depth: number;
  strength: number;
  isTargeted?: boolean;
  isFocused?: boolean;
  wikiUrl?: string;
  wikiSummary?: string;
  wikiImage?: string;
  aiImagePrompt?: string;
  continentId?: string;
  isMacroContinent?: boolean;
  memberCount?: number;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
  radius?: number;
  quantumResonance?: number;
  subGraph?: GraphData;
  parentMicrocosmId?: string;
  isMicrocosmRoot?: boolean;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship?: string;
  strength?: number;
  resonanceScore?: number;
  springStiffness?: number;
  conductivity?: number; // Hebbian synaptic conductivity [0.1, 1.0]
  lastFiredTimestamp?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GeminiGraphResponse {
  nodes: Array<{ 
    id: string; 
    label: string; 
    group: number; 
    description: string; 
    strength: number; 
    isGhost?: boolean;
    aiImagePrompt?: string 
  }>;
  links: Array<{ source: string; target: string; relationship: string; strength?: number }>;
  briefing?: string;
  milestones?: string[];
}

export type SwarmFormation = 'MURMURATION' | 'ORBITAL_VORTEX' | 'TACTICAL_ARROW' | 'NEURAL_MESH' | 'DISPERSED_RECON';

export type SwarmSovereigntyMode = 'FOLLOW_CURSOR' | 'SOVEREIGN_SCOUT' | 'NODE_SIEGE' | 'SYNAPSE_WEAVING' | 'HARVEST_CONSENSUS' | 'AUTONOMOUS_RESEARCH' | 'BEACON_ATTRACTOR';

export type AbstractionTier = 'LEVEL_1_EXECUTIVE' | 'LEVEL_2_CONCEPTUAL' | 'LEVEL_3_ARCHITECTURAL' | 'LEVEL_4_IMPLEMENTATION' | 'LEVEL_5_MACHINE';

export interface SwarmLog {
  id: string;
  time: string;
  agentName: string;
  role: string;
  action: string;
  target?: string;
}

export interface SovereignQuorumProposal {
  id: string;
  title: string;
  category: 'ONTOLOGICAL_AXIOM' | 'TOPOLOGICAL_SYNTHESIS' | 'CAUSAL_BRIDGE' | 'EMPIRICAL_GROUNDING';
  researcherVotesAye: number;
  builderVotesAye: number;
  totalResearchers: number;
  totalBuilders: number;
  consensusPercent: number;
  status: 'DELIBERATING' | 'PASSED' | 'SYNTHESIZED';
  hypothesis: string;
}

export interface SovereignBeacon {
  x: number;
  y: number;
  label: string;
  active: boolean;
  intensity: number;
  radius: number;
}

export type SwarmAgentSpecialization = 'RESEARCHER' | 'BUILDER';

export interface SwarmAgent {
  id: number;
  name: string;
  role: 'THEORETICAL_RESEARCHER' | 'ONTOLOGY_BUILDER' | 'CAUSAL_RESEARCHER' | 'SWARM_ARCHITECT' | 'SYNTHESIS_BUILDER' | 'EMPIRICAL_RESEARCHER';
  specialization: SwarmAgentSpecialization;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  speed: number;
  angle: number;
  energy: number;
  phase: number;
  orbitRadius: number;
  orbitSpeed: number;
  scanPulse: number;
  assignedNodeId?: string;
  assignedNodeLabel?: string;
  autonomyLevel: number; // 0 to 1
  thoughtVector: string;
  state: 'SCOUTING' | 'RESEARCHING' | 'CONSTRUCTING' | 'DELIBERATING';
  curiosityScore?: number;
  tensionScore?: number;
}

export interface RadarMetrics {
  depth: number;              // 0-100
  breadth: number;            // 0-100
  novelty: number;            // 0-100
  empiricalGrounding: number; // 0-100
  interconnectivity: number;  // 0-100
}

export interface TelemetryHistoryPoint {
  timestamp: number;
  entropy: number;
  discoveryVelocity: number;
  activeNodes: number;
  synapticDensity: number;
}

export interface ScientificTelemetry {
  networkEntropy: number;
  clusterCohesion: number;
  discoveryVelocity: number;
  frontierRatio: number;
  graphDensity: number;
  totalSynapses: number;
  radar: RadarMetrics;
  history: TelemetryHistoryPoint[];
  elapsedSeconds: number;
}

export interface ClusterHull {
  groupId: number;
  groupLabel: string;
  color: string;
  points: Array<[number, number]>;
}

export interface KnowledgeContinent {
  id: string;
  label: string;
  dominantRelationship: string;
  color: string;
  nodeIds: string[];
  nodeCount: number;
  aggregateMass: number;
  cx: number;
  cy: number;
  fx?: number | null;
  fy?: number | null;
  isCollapsed: boolean;
}

export interface ContinentPhysicsConfig {
  enabled: boolean;
  gravity: number;
  separation: number;
  hullOpacity: number;
  isolatedContinentId: string | null;
  collapsedContinentIds: string[];
}

export type ThemeMode = 'obsidian' | 'laboratory' | 'monochrome';

export type DiagramParadigm =
  | 'FORCE_CONTINENTS'
  | 'HOLOGRAPHIC_3D'
  | 'RADIAL_DENDROGRAM'
  | 'CHORD_WHEEL'
  | 'VORONOI_EULER'
  | 'LAYERED_DAG'
  | 'SANKEY_FLOW';

export type SpatialPatternType =
  | 'FORCE_DEFAULT'
  | 'CENTRALITY_RADIAL'
  | 'CENTRALITY_TREE'
  | 'CENTRALITY_GRID'
  | 'CENTRALITY_SPIRAL'
  | 'CENTRALITY_BIPARTITE';

export interface NodeCentralityMetrics {
  nodeId: string;
  degreeCentrality: number;
  betweennessCentrality: number;
  eigenvectorCentrality: number;
  compositeScore: number;
  hopDistanceFromAnchor: number;
  centralityRank: number;
  quartileTier: 1 | 2 | 3 | 4;
}

export interface CentralitySpatialConfig {
  pattern: SpatialPatternType;
  anchorNodeId: string | null;
}

export interface DiagramParadigmSpec {
  id: DiagramParadigm;
  shortLabel: string;
  fullName: string;
  wikiCategoryRef: string;
  wikiUrl: string;
  invariant: string;
  encodingRule: string;
}

export interface GraphExportPackage {
  version: string;
  exportedAt: string;
  topic: string;
  mission: DiscoveryMission | null;
  nodes: GraphNode[];
  links: GraphLink[];
  telemetrySummary: {
    nodeCount: number;
    linkCount: number;
    entropy: number;
    cohesion: number;
  };
}

// ============================================================================
// INTEGRATED CREATIVE WORKSPACE & AUTONOMOUS AI ENGINEERING TYPES
// ============================================================================

export type WorkspaceModuleType =
  | 'WHITEBOARD'
  | 'CODE_IDE'
  | 'PROJECT_BOARD'
  | 'ASSET_LIBRARY'
  | 'AUTOGENESIS'
  | 'QUANTUM_ANALYTICS';

export type SelfDevStage =
  | 'INTROSPECT'
  | 'PROPOSE_RFC'
  | 'SYNTHESIZE_CODE'
  | 'VERIFY_AST'
  | 'MATERIALIZE_GRAPH'
  | 'COMMIT_GENERATION';

export type SelfDevCadence = 'TURBO_2S' | 'BALANCED_4S' | 'DEEP_7S';

export interface SelfEvolutionMutation {
  id: string;
  generation: string;
  timestamp: string;
  subsystem: string;
  summary: string;
  authorAgent: string;
  fileId: string;
  fileName: string;
  filePath: string;
  language: 'typescript' | 'rust' | 'wgsl';
  locAdded: number;
  codeDiffPreview: string;
  rfcId: string;
  ticketKey: string;
  materializedNodeIds: string[];
  materializedNodeLabels: string[];
  fitnessDelta: number;
  testAssertionsPassed: number;
}

export interface AutogenesisState {
  active: boolean;
  currentStage: SelfDevStage;
  stageProgress: number;
  generationVersion: string;
  cycleCount: number;
  cadence: SelfDevCadence;
  fitnessScore: number;
  selfWrittenLoc: number;
  testSuitePassed: number;
  activeHypothesis: string;
  mutations: SelfEvolutionMutation[];
}

export type WorkspaceLayoutMode = 'GRAPH_ONLY' | 'SPLIT_STUDIO' | 'FULL_STUDIO';

export interface WhiteboardElement {
  id: string;
  type: 'ARCH_NODE' | 'STICKY_NOTE' | 'SERVICE_GATEWAY' | 'DATA_STORE' | 'NEURAL_CORE';
  title: string;
  subtitle: string;
  x: number;
  y: number;
  color: string;
  author: string;
  linkedNodeId?: string;
  continentId?: string;
}

export interface WhiteboardConnection {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  protocol: string;
}

export interface WhiteboardStroke {
  id: string;
  points: Array<{ x: number; y: number }>;
  color: string;
}

export interface WorkspaceCodeFile {
  id: string;
  name: string;
  path: string;
  language: 'typescript' | 'rust' | 'wgsl' | 'yaml' | 'json';
  content: string;
  authorAgent: string;
  lastModified: string;
  linkedNodeLabel?: string;
}

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  command?: string;
  output: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'AGENT_EXEC';
}

export interface DeploymentPipelineStage {
  id: string;
  name: string;
  status: 'IDLE' | 'RUNNING' | 'PASSED' | 'FAILED';
  durationMs?: number;
  logSummary: string;
}

export type TicketStatus = 'BACKLOG' | 'IN_PROGRESS' | 'ARCHITECT_REVIEW' | 'DEPLOYED';

export interface ProjectTaskTicket {
  id: string;
  key: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  storyPoints: number;
  assignedAgent: string;
  linkedNodeLabel?: string;
  continentId?: string;
  createdAt: string;
}

export interface SystemArchitectureProposal {
  id: string;
  title: string;
  summary: string;
  authorAgent: string;
  pattern: string;
  components: string[];
  status: 'PROPOSED' | 'RATIFIED' | 'DEPLOYED';
  confidence: number;
}

export interface MultimediaAsset {
  id: string;
  title: string;
  type: 'DOCUMENTATION' | 'DIAGRAM_BLUEPRINT' | 'SCHEMA_ARTIFACT' | 'VISUAL_RESOURCE';
  format: string;
  summary: string;
  contentPreview: string;
  linkedNodeId?: string;
  linkedNodeLabel?: string;
  continentId?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
}

export type StudioSplitRatio = 'BALANCED_50_50' | 'GRAPH_WIDE_65_35' | 'STUDIO_WIDE_35_65';

export interface CausalPathStep {
  nodeId: string;
  nodeLabel: string;
  relationshipToNext?: string;
}

export interface CausalPathTrace {
  fromNodeId: string;
  toNodeId: string;
  steps: CausalPathStep[];
  totalResonance: number;
}

export interface WorkspaceSnapshot {
  id: string;
  label: string;
  timestamp: string;
  topic: string;
  nodeCount: number;
  linkCount: number;
  fileCount: number;
  ticketCount: number;
  graphData: GraphData;
  whiteboardElements: WhiteboardElement[];
  whiteboardConnections: WhiteboardConnection[];
  codeFiles: WorkspaceCodeFile[];
  tickets: ProjectTaskTicket[];
  assets: MultimediaAsset[];
  autogenesis?: AutogenesisState;
}

// ============================================================================
// BIOMIMETIC MYCELIAL & SYNAPTIC PLASTICITY TYPES
// ============================================================================

export interface MicroHyphaPoint {
  x: number;
  y: number;
}

export interface MicroHypha {
  id: string;
  sourceNodeId: string;
  targetCandidateNodeId: string;
  growthProgress: number; // 0 to 1
  tipX: number;
  tipY: number;
  points: MicroHyphaPoint[];
  affinityScore: number;
  createdAt: number;
  status: 'FORAGING' | 'ANASTOMOSED' | 'WITHERING';
}

export interface BiomimeticConfig {
  enabled: boolean;
  growthRate: number; // 0.1 to 3.0
  hebbianHalfLifeSec: number; // 10 to 120
  pruningThreshold: number; // 0.05 to 0.4
  fluxIntensity: number; // 0.2 to 2.0
  showHyphae: boolean;
}

export interface PlasticityMetrics {
  activeHyphaeCount: number;
  anastomosisCount: number;
  prunedLinksCount: number;
  averageConductivity: number;
  nutrientFlux: number; // in μmol/s
  evolutionEpoch: number;
}

export interface ChemotacticBeacon {
  id: string;
  label: string;
  x: number;
  y: number;
  nutrientIntensity: number; // 0.2 to 2.5
  attractionRadius: number; // 120 to 600 px
  active: boolean;
  color: string;
}

export interface RemoteCollaborator {
  id: string;
  name: string;
  role: string;
  color: string;
  x: number;
  y: number;
  activeModule: string;
  lastActiveTimestamp: number;
}

export interface QuantumAnalyticsMetrics {
  shortestPathNodeIds: string[];
  pathCost: number;
  anomalyMap: Map<string, number>; // node id -> anomaly score [0, 1]
  networkEntropy: number;
  centralityRankings: Array<{ nodeId: string; label: string; score: number }>;
}

export interface FractalBreadcrumb {
  id?: string;
  label: string;
  nodeId?: string;
  depth?: number;
  level?: number;
  graphData?: GraphData;
  graphSnapshot?: GraphData;
  zoomTransform?: { k: number; x: number; y: number };
  timestamp?: number;
}

export interface AetherAgent {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  targetNodeId: string | null;
  state: 'PATROL' | 'CONVERGING' | 'RELIEVING_STRESS';
  pulseTimer: number;
  color: string;
  size: number;
  orbitRadius: number;
  orbitAngle: number;
}

export interface AetherSwarmConfig {
  enabled: boolean;
  agentCount: number;
  autonomousHomeostasis: boolean;
  speed: number;
  stressSensitivity: number; // 0.1 to 1.0
  pulseStrength: number;
}

export interface AetherPulseEvent {
  nodeId: string;
  targetNodeId?: string;
  targetNodeX?: number;
  targetNodeY?: number;
  agentId?: string;
  x: number;
  y: number;
  intensity: number;
  color: string;
  timestamp: number;
}

export interface CausalTimelineFrame {
  id: string;
  epoch: number;
  timestamp: number;
  label: string;
  cause?: string;
  graphData?: GraphData;
  graphSnapshot?: GraphData;
  nodeCount?: number;
  linkCount?: number;
  homeostaticStressScore?: number;
  metrics?: {
    nodeCount: number;
    linkCount: number;
    avgConductivity: number;
    networkEntropy: number;
  };
  forkParentId?: string;
}

export interface CounterfactualFork {
  id: string;
  parentFrameId?: string;
  sourceFrameId?: string;
  forkTimestamp?: number;
  timestamp?: number;
  branchName?: string;
  forkLabel?: string;
  divergedGraphData?: GraphData;
  graphSnapshot?: GraphData;
  canonicalSnapshot?: GraphData;
  divergenceNotes?: string;
  divergenceScore?: number; // 0-100%
}

export type NodeDiffStatus = 'UNCHANGED' | 'ADDED_IN_FORK' | 'REMOVED_IN_FORK' | 'MUTATED';
export type LinkDiffStatus = 'UNCHANGED' | 'ADDED_SYNAPSE' | 'REMOVED_SYNAPSE' | 'CONDUCTIVITY_DRIFT';

export interface NodeDivergenceItem {
  nodeId: string;
  label: string;
  status: NodeDiffStatus;
  heatScore: number; // 0.0 to 1.0
  color: string;
  notes?: string;
  degreeDelta?: number;
}

export interface LinkDivergenceItem {
  linkKey: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  status: LinkDiffStatus;
  heatScore: number;
  conductivityDelta: number;
  color: string;
}

export interface TopologicalDivergenceDiff {
  timestamp: number;
  divergenceScore: number; // 0 - 100%
  totalDivergentNodes: number;
  totalDivergentLinks: number;
  nodeDivergenceMap: Map<string, NodeDivergenceItem>;
  linkDivergenceMap: Map<string, LinkDivergenceItem>;
  epicenterNodeId: string | null;
  epicenterNodeLabel: string | null;
  epicenterHeatScore: number;
  addedNodeCount: number;
  removedNodeCount: number;
  mutatedNodeCount: number;
  addedLinkCount: number;
  removedLinkCount: number;
  meanConductanceDelta: number;
}
