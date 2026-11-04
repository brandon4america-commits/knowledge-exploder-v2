import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Orbit, 
  Compass, 
  Network, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Volume2,
  VolumeX,
  Send,
  Activity,
  Layers,
  Vote,
  Crosshair,
  SearchCode,
  MousePointerClick,
  Play,
  Pause,
  Columns,
  Globe,
  Workflow,
  Code2,
  PenTool,
  Kanban,
  Rocket,
  Library
} from 'lucide-react';
import { 
  SwarmAgent, 
  SwarmFormation, 
  SwarmSovereigntyMode, 
  SwarmLog, 
  GraphNode, 
  SovereignQuorumProposal, 
  SovereignBeacon,
  DiagramParadigm,
  AbstractionTier,
  KnowledgeContinent,
  MissionType,
  WorkspaceModuleType,
  WorkspaceLayoutMode
} from '../types';
import { DIAGRAM_PARADIGM_SPECS } from '../services/diagramLayoutEngine';
import { cn } from '../lib/utils';

const ROLE_COLORS: Record<string, string> = {
  THEORETICAL_RESEARCHER: '#38bdf8', // Sky blue
  ONTOLOGY_BUILDER: '#c084fc',       // Purple
  CAUSAL_RESEARCHER: '#34d399',      // Emerald
  SWARM_ARCHITECT: '#fbbf24',        // Amber
  SYNTHESIS_BUILDER: '#818cf8',      // Indigo
  EMPIRICAL_RESEARCHER: '#f87171',   // Rose
};

const THOUGHT_TEMPLATES: Record<string, string[]> = {
  THEORETICAL_RESEARCHER: [
    'Investigating foundational axioms in latent conceptual manifold',
    'Formulating epistemic proofs on theoretical boundary vectors',
    'Deriving mathematical invariance across adjacent concept spaces',
    'Modeling higher-order semantic dimensionality convergence',
    'Evaluating Gödelian completeness limits on local subgraphs'
  ],
  ONTOLOGY_BUILDER: [
    'Compiling high-order taxonomy schemas & parent-child hierarchies',
    'Synthesizing IsA, PartOf, and DependsOn relational ontologies',
    'Constructing multi-tier classification matrix for knowledge graph',
    'Materializing RDF triples and JSON-LD semantic pathways',
    'Stabilizing ontological schemas across heterogeneous domains'
  ],
  CAUSAL_RESEARCHER: [
    'Probing directed acyclic graph causal dependencies & constraints',
    'Evaluating counter-factual intervention trajectories between concepts',
    'Testing causal sufficiency and causal necessity across nodes',
    'Quantifying confounder-free causal effects along pathway links',
    'Isolating structural causal mechanisms in target cluster'
  ],
  SWARM_ARCHITECT: [
    'Architecting decentralized swarm consensus algorithms (100 Nodes)',
    'Orchestrating multi-agent emergent problem-solving quorum',
    'Balancing cognitive bandwidth and collective murmuration dynamics',
    'Synchronizing 50 Researchers and 50 Builders across unified lattice',
    'Enforcing zero-entropy cognitive syntropy threshold'
  ],
  SYNTHESIS_BUILDER: [
    'Building cross-domain conceptual bridges and structural isomorphisms',
    'Integrating disparate concept clusters into a unified field theory',
    'Constructing topological synthesis towards the Omega Point',
    'Welding hyper-dimensional links between distant conceptual nodes',
    'Densifying knowledge graph topology through semantic synaptogenesis'
  ],
  EMPIRICAL_RESEARCHER: [
    'Validating empirical evidence and factual knowledge groundings',
    'Sampling epistemic entropy and uncertainty confidence bounds',
    'Cross-referencing topological vectors against empirical corpus',
    'Calibrating evidentiary weights against real-world observations',
    'Executing peer validation run across adjacent hypothesis sets'
  ]
};

const INITIAL_PROPOSALS: SovereignQuorumProposal[] = [
  {
    id: 'Q-101',
    title: 'Topological Synthesis of Causal Invariance',
    category: 'CAUSAL_BRIDGE',
    researcherVotesAye: 49,
    builderVotesAye: 48,
    totalResearchers: 50,
    totalBuilders: 50,
    consensusPercent: 97.0,
    status: 'PASSED',
    hypothesis: 'Causal dependencies remain invariant under topological coordinate transformations.'
  },
  {
    id: 'Q-102',
    title: 'Multi-Tier Ontology Densification across Adjacent Concept Clusters',
    category: 'ONTOLOGICAL_AXIOM',
    researcherVotesAye: 48,
    builderVotesAye: 50,
    totalResearchers: 50,
    totalBuilders: 50,
    consensusPercent: 98.0,
    status: 'DELIBERATING',
    hypothesis: 'Sub-concept lattices exhibit fractal self-similarity at higher abstraction tiers.'
  },
  {
    id: 'Q-103',
    title: 'Empirical Grounding of Latent Neural Synapses',
    category: 'EMPIRICAL_GROUNDING',
    researcherVotesAye: 47,
    builderVotesAye: 46,
    totalResearchers: 50,
    totalBuilders: 50,
    consensusPercent: 93.0,
    status: 'DELIBERATING',
    hypothesis: 'Corpus-grounded empirical bounds reduce hallucination entropy to zero.'
  }
];

export type SwarmUIOperationType =
  | 'CLICK_NODE'
  | 'MORPH_DIAGRAM'
  | 'TOGGLE_SPLIT'
  | 'FOCUS_CONTINENT'
  | 'FOLD_CONTINENT'
  | 'SWITCH_TIER'
  | 'QUORUM_VOTE'
  | 'LAUNCH_INQUIRY'
  | 'GENERATE_CODE_MODULE'
  | 'PROPOSE_ARCHITECTURE'
  | 'MANAGE_TASK_TICKET'
  | 'AUTOMATE_DEPLOYMENT'
  | 'EMBED_WORKSPACE_ASSET';

interface ActiveUIOperation {
  id: string;
  type: SwarmUIOperationType;
  label: string;
  subLabel: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetWidth: number;
  targetHeight: number;
  startTime: number;
  durationMs: number;
  phase: 'APPROACHING' | 'HOVERING' | 'CLICKED';
  hoveredFired?: boolean;
  clickedFired?: boolean;
  targetNodeId?: string;
  onExecute: () => void;
}

interface SwarmProps {
  activeNode?: GraphNode | null;
  nodes?: GraphNode[];
  synergyLevel?: number;
  onSelectNode?: (node: GraphNode) => void;
  onHoverNode?: (nodeId: string | null) => void;
  onJumpFocus?: (node: GraphNode) => void;
  onStartMission?: (topic: string, type: MissionType) => void;
  primaryParadigm?: DiagramParadigm;
  onSelectPrimaryParadigm?: (p: DiagramParadigm) => void;
  secondaryParadigm?: DiagramParadigm;
  onSelectSecondaryParadigm?: (p: DiagramParadigm) => void;
  splitScreen?: boolean;
  onToggleSplitScreen?: () => void;
  onSwapParadigms?: () => void;
  continents?: KnowledgeContinent[];
  onFocusContinent?: (continentId: string) => void;
  onToggleCollapseContinent?: (continentId: string) => void;
  currentTier?: AbstractionTier;
  onChangeTier?: (tier: AbstractionTier) => void;
  isLoading?: boolean;
  workspaceLayoutMode?: WorkspaceLayoutMode;
  activeWorkspaceModule?: WorkspaceModuleType;
  onOpenWorkspaceModule?: (module: WorkspaceModuleType) => void;
  onGenerateCodeModule?: () => void;
  onProposeArchitecture?: () => void;
  onManageTaskTicket?: () => void;
  onAutomateDeployment?: () => void;
  onEmbedWorkspaceAsset?: () => void;
}

function getElementScreenCenter(selector: string): { x: number; y: number; width: number; height: number } | null {
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    // Ensure it is within visible viewport bounds
    if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
      return null;
    }
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    };
  } catch {
    return null;
  }
}

export const SwarmIntelligencePointer: React.FC<SwarmProps> = ({ 
  nodes = [],
  onSelectNode,
  onHoverNode,
  onJumpFocus,
  onStartMission,
  primaryParadigm = 'FORCE_CONTINENTS',
  onSelectPrimaryParadigm,
  secondaryParadigm = 'CHORD_WHEEL',
  onSelectSecondaryParadigm,
  splitScreen = false,
  onToggleSplitScreen,
  onSwapParadigms,
  continents = [],
  onFocusContinent,
  onToggleCollapseContinent,
  currentTier = 'LEVEL_2_CONCEPTUAL',
  onChangeTier,
  isLoading = false,
  onOpenWorkspaceModule,
  onGenerateCodeModule,
  onProposeArchitecture,
  onManageTaskTicket,
  onAutomateDeployment,
  onEmbedWorkspaceAsset
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2, 
    isDown: false, 
    hasMoved: false 
  });
  const vanguardCursorRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    isClicking: false
  });
  const activeOpRef = useRef<ActiveUIOperation | null>(null);
  const shockwavesRef = useRef<Array<{ x: number; y: number; r: number; maxR: number; opacity: number; color?: string }>>([]);
  const beaconRef = useRef<SovereignBeacon | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stepCycleRef = useRef<number>(0);

  // Swarm States
  const [formation, setFormation] = useState<SwarmFormation>('MURMURATION');
  const [sovereigntyMode, setSovereigntyMode] = useState<SwarmSovereigntyMode>('AUTONOMOUS_RESEARCH');
  const [dispersion, setDispersion] = useState<'compact' | 'normal' | 'wide'>('normal');
  const [guildFilter, setGuildFilter] = useState<'ALL' | 'RESEARCHERS' | 'BUILDERS'>('ALL');
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hudMinimized, setHudMinimized] = useState<boolean>(false);
  const [uiAutopilot, setUiAutopilot] = useState<boolean>(true);
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgent | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<SwarmAgent | null>(null);
  const [consensusRate, setConsensusRate] = useState<number>(99.4);
  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'QUORUM' | 'GUILDS' | 'LOGS' | 'INSPECTOR'>('CONTROLS');
  const [logs, setLogs] = useState<SwarmLog[]>([]);
  const [proposals, setProposals] = useState<SovereignQuorumProposal[]>(INITIAL_PROPOSALS);
  const [activeQuorumProposal, setActiveQuorumProposal] = useState<SovereignQuorumProposal | null>(INITIAL_PROPOSALS[1]);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [beaconActive, setBeaconActive] = useState<boolean>(false);
  const [nodesScannedCount, setNodesScannedCount] = useState<number>(0);
  const [bridgesConstructedCount, setBridgesConstructedCount] = useState<number>(0);
  const [uiActionsExecutedCount, setUiActionsExecutedCount] = useState<number>(0);
  const [activeOpBanner, setActiveOpBanner] = useState<{ label: string; subLabel: string; phase: string } | null>(null);

  // 100 Autonomous Agentic Entities Ref
  const agentsRef = useRef<SwarmAgent[]>([]);

  // Sound Synthesizer function
  const playCyberChime = useCallback((frequency: number, type: OscillatorType = 'sine', duration: number = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  }, [soundEnabled]);

  const appendSwarmLog = useCallback((agentName: string, role: string, action: string, target?: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0].substring(3);
    setLogs(prev => [
      {
        id: Math.random().toString(36).substring(2, 8),
        time: timeStr,
        agentName,
        role,
        action,
        target
      },
      ...prev.slice(0, 29)
    ]);
  }, []);

  // Initialize 100 Agentic AI entities (50 Researchers, 50 Builders)
  useEffect(() => {
    const agents: SwarmAgent[] = [];
    const count = 100;
    const initialCenterX = window.innerWidth / 2;
    const initialCenterY = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const isResearcher = i < 50;
      const specialization: 'RESEARCHER' | 'BUILDER' = isResearcher ? 'RESEARCHER' : 'BUILDER';
      
      const role = isResearcher
        ? (i % 3 === 0 ? 'THEORETICAL_RESEARCHER' : i % 3 === 1 ? 'CAUSAL_RESEARCHER' : 'EMPIRICAL_RESEARCHER')
        : (i % 3 === 0 ? 'ONTOLOGY_BUILDER' : i % 3 === 1 ? 'SWARM_ARCHITECT' : 'SYNTHESIS_BUILDER');

      const name = isResearcher 
        ? `RESEARCHER_${String(i + 1).padStart(2, '0')}`
        : `BUILDER_${String(i - 49).padStart(2, '0')}`;
      
      const angle = (i / count) * Math.PI * 2;
      const dist = 30 + Math.random() * 140;
      const thoughts = THOUGHT_TEMPLATES[role];
      const thoughtVector = thoughts[i % thoughts.length];
      
      agents.push({
        id: i + 1,
        name,
        role,
        specialization,
        color: ROLE_COLORS[role],
        x: initialCenterX + Math.cos(angle) * dist,
        y: initialCenterY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        targetX: initialCenterX,
        targetY: initialCenterY,
        speed: 2.3 + Math.random() * 2.7,
        angle: angle,
        energy: 90 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
        orbitRadius: 35 + (i % 12) * 16,
        orbitSpeed: (0.012 + ((i % 6) * 0.005)) * (i % 2 === 0 ? 1 : -1),
        scanPulse: Math.random(),
        autonomyLevel: 0.98 + Math.random() * 0.02,
        thoughtVector,
        state: isResearcher ? 'RESEARCHING' : 'CONSTRUCTING',
        curiosityScore: isResearcher ? +(0.75 + Math.random() * 0.25).toFixed(2) : undefined,
        tensionScore: !isResearcher ? +(0.65 + Math.random() * 0.35).toFixed(2) : undefined
      });
    }

    agentsRef.current = agents;
    setSelectedAgent(agents[0]);

    setLogs([
      { id: '1', time: '00:01', agentName: 'SWARM_CORE', role: 'SWARM_ARCHITECT', action: '100 Sovereign AI Experts Initialized with Full UI Operational Authority.' },
      { id: '2', time: '00:02', agentName: 'RESEARCHER_01', role: 'THEORETICAL_RESEARCHER', action: 'Vanguard UI Cursor online: scanning DOM nodes, diagram tabs, and continent beacons.' },
      { id: '3', time: '00:03', agentName: 'BUILDER_01', role: 'ONTOLOGY_BUILDER', action: 'Autonomous UI Autopilot engaged: ready to click, morph, and expand topology.' }
    ]);
  }, []);

  // Trigger Immediate Quorum Deliberation Vote
  const handleTriggerQuorumVote = useCallback(() => {
    if (isVoting) return;
    setIsVoting(true);
    playCyberChime(720, 'square', 0.3);

    setTimeout(() => {
      const researcherAye = 48 + Math.floor(Math.random() * 3);
      const builderAye = 48 + Math.floor(Math.random() * 3);
      const consensus = +(((researcherAye + builderAye) / 100) * 100).toFixed(1);

      const newProposal: SovereignQuorumProposal = {
        id: `Q-${Math.floor(100 + Math.random() * 900)}`,
        title: `Consensus Axiom: Latent Isomorphism in ${nodes[0]?.label || 'Cognitive Topology'}`,
        category: 'TOPOLOGICAL_SYNTHESIS',
        researcherVotesAye: researcherAye,
        builderVotesAye: builderAye,
        totalResearchers: 50,
        totalBuilders: 50,
        consensusPercent: consensus,
        status: consensus >= 95 ? 'PASSED' : 'DELIBERATING',
        hypothesis: 'Topological convergence verified across theoretical axiomatics and builder ontologies.'
      };

      setProposals(prev => [newProposal, ...prev.slice(0, 4)]);
      setActiveQuorumProposal(newProposal);
      setConsensusRate(consensus);
      setIsVoting(false);
      playCyberChime(1040, 'sine', 0.25);

      appendSwarmLog(
        'QUORUM_CHAMBER',
        'SWARM_ARCHITECT',
        `QUORUM VOTE PASSED: "${newProposal.title}" ratified at ${consensus}% consensus.`
      );
    }, 900);
  }, [isVoting, nodes, playCyberChime, appendSwarmLog]);

  // Launch a concrete, visible UI operation where the Vanguard Cursor flies to (targetX, targetY),
  // hovers the real UI element, pulses a click shockwave, and executes the real state callback!
  const enqueueSwarmUIOperation = useCallback((
    type: SwarmUIOperationType,
    label: string,
    subLabel: string,
    coords: { x: number; y: number; width?: number; height?: number },
    onExecute: () => void,
    targetNodeId?: string
  ) => {
    const startX = vanguardCursorRef.current.x || window.innerWidth / 2;
    const startY = vanguardCursorRef.current.y || window.innerHeight / 2;

    const op: ActiveUIOperation = {
      id: Math.random().toString(36).substring(2, 8),
      type,
      label,
      subLabel,
      startX,
      startY,
      targetX: coords.x,
      targetY: coords.y,
      targetWidth: coords.width || 48,
      targetHeight: coords.height || 36,
      startTime: performance.now(),
      durationMs: 950,
      phase: 'APPROACHING',
      targetNodeId,
      onExecute
    };

    activeOpRef.current = op;
    setActiveOpBanner({ label, subLabel, phase: 'APPROACHING' });
    playCyberChime(640, 'sine', 0.12);
  }, [playCyberChime]);

  // Specific Operational Dispatchers (callable both by Autonomous Loop AND Manual Command Deck buttons)
  const triggerNodeClickOperation = useCallback(() => {
    if (nodes.length === 0) {
      // If on landing screen, click a landing inquiry chip or launch a mission!
      const defaultTopics = [
        'Category:Diagrams & Visual Topology',
        'Quantum Entanglement',
        'Artificial General Intelligence',
        'Neural Topology'
      ];
      const chosenTopic = defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
      const searchBoxCoords = getElementScreenCenter('[data-swarm-target="header-search-input"]') || {
        x: window.innerWidth / 2,
        y: 64,
        width: 260,
        height: 44
      };

      enqueueSwarmUIOperation(
        'LAUNCH_INQUIRY',
        `INITIALIZING MISSION`,
        `Launching "${chosenTopic}"`,
        searchBoxCoords,
        () => {
          if (onStartMission) onStartMission(chosenTopic, 'DEEP_DIVE');
          appendSwarmLog('VANGUARD_01', 'THEORETICAL_RESEARCHER', `UI ACTION: Initialized neural inquiry on "${chosenTopic}".`, chosenTopic);
        }
      );
      return;
    }

    // Prefer unexpanded or ghost nodes first, fallback to any node
    const unexpanded = nodes.filter(n => (!n.isExpanded || n.isGhost) && !n.isMacroContinent);
    const pool = unexpanded.length > 0 ? unexpanded : nodes;
    const targetNode = pool[Math.floor(Math.random() * pool.length)];
    if (!targetNode) return;

    // Locate real SVG DOM node coordinates on screen
    const escapedId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(targetNode.id) : targetNode.id;
    const domCoords = getElementScreenCenter(`.node-group[data-node-id="${escapedId}"]`) || {
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 260,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
      width: 64,
      height: 64
    };

    enqueueSwarmUIOperation(
      'CLICK_NODE',
      `CLICK & EXPAND NODE`,
      `Target: [${targetNode.label}]`,
      domCoords,
      () => {
        if (onSelectNode) onSelectNode(targetNode);
        if (onJumpFocus && Math.random() < 0.35) onJumpFocus(targetNode);
        setNodesScannedCount(c => c + 1);
        appendSwarmLog(
          'RESEARCHER_07',
          'CAUSAL_RESEARCHER',
          `UI CLICK EXECUTED: Selected & expanded node [${targetNode.label}].`,
          targetNode.label
        );
      },
      targetNode.id
    );
  }, [nodes, onSelectNode, onJumpFocus, onStartMission, enqueueSwarmUIOperation, appendSwarmLog]);

  const triggerDiagramMorphOperation = useCallback(() => {
    const allParadigms = DIAGRAM_PARADIGM_SPECS.map(s => s.id);
    const isTargetSecondary = splitScreen && Math.random() < 0.45;
    const currentP = isTargetSecondary ? secondaryParadigm : primaryParadigm;
    const candidates = allParadigms.filter(p => p !== currentP);
    const nextParadigm = candidates[Math.floor(Math.random() * candidates.length)] || 'RADIAL_DENDROGRAM';
    const spec = DIAGRAM_PARADIGM_SPECS.find(s => s.id === nextParadigm);

    const selector = isTargetSecondary
      ? `[data-swarm-target="paradigm-secondary-${nextParadigm}"]`
      : `[data-swarm-target="paradigm-primary-${nextParadigm}"]`;

    const domCoords = getElementScreenCenter(selector) || {
      x: window.innerWidth / 2,
      y: 42,
      width: 110,
      height: 32
    };

    enqueueSwarmUIOperation(
      'MORPH_DIAGRAM',
      isTargetSecondary ? `MORPH VIEWPORT B` : `MORPH DIAGRAM PARADIGM`,
      `Switching to [${spec?.shortLabel || nextParadigm}]`,
      domCoords,
      () => {
        if (isTargetSecondary && onSelectSecondaryParadigm) {
          onSelectSecondaryParadigm(nextParadigm);
        } else if (onSelectPrimaryParadigm) {
          onSelectPrimaryParadigm(nextParadigm);
        }
        setBridgesConstructedCount(c => c + 1);
        appendSwarmLog(
          'BUILDER_12',
          'ONTOLOGY_BUILDER',
          `UI TAB CLICKED: Morphed ${isTargetSecondary ? 'Viewport B' : 'Viewport A'} to [${spec?.fullName || nextParadigm}].`,
          spec?.shortLabel
        );
      }
    );
  }, [splitScreen, primaryParadigm, secondaryParadigm, onSelectPrimaryParadigm, onSelectSecondaryParadigm, enqueueSwarmUIOperation, appendSwarmLog]);

  const triggerSplitScreenOperation = useCallback(() => {
    if (splitScreen && onSwapParadigms && Math.random() < 0.5) {
      const swapCoords = getElementScreenCenter('[data-swarm-target="paradigm-swap-btn"]') || {
        x: window.innerWidth / 2 + 180,
        y: 80,
        width: 64,
        height: 28
      };
      enqueueSwarmUIOperation(
        'TOGGLE_SPLIT',
        `SWAP SPLIT VIEWPORTS`,
        `Exchanging Viewport A & Viewport B`,
        swapCoords,
        () => {
          onSwapParadigms();
          appendSwarmLog('SWARM_ARCHITECT_04', 'SWARM_ARCHITECT', 'UI CLICK EXECUTED: Swapped Viewport A & Viewport B Diagram Paradigms.');
        }
      );
      return;
    }

    const splitCoords = getElementScreenCenter('[data-swarm-target="split-screen-toggle"]') || {
      x: window.innerWidth / 2 + 220,
      y: 42,
      width: 110,
      height: 32
    };

    enqueueSwarmUIOperation(
      'TOGGLE_SPLIT',
      splitScreen ? `SINGLE VIEWPORT MODE` : `ACTIVATE 2X SPLIT COMPARE`,
      splitScreen ? `Closing Twin Comparison` : `Comparing 2 Diagram Paradigms`,
      splitCoords,
      () => {
        if (onToggleSplitScreen) onToggleSplitScreen();
        appendSwarmLog(
          'SWARM_ARCHITECT_02',
          'SWARM_ARCHITECT',
          `UI CLICK EXECUTED: ${splitScreen ? 'Returned to Single Primary Viewport' : 'Activated 2X Split-Screen Diagram Comparison'}.`
        );
      }
    );
  }, [splitScreen, onToggleSplitScreen, onSwapParadigms, enqueueSwarmUIOperation, appendSwarmLog]);

  const triggerContinentOperation = useCallback(() => {
    if (continents.length === 0) {
      triggerDiagramMorphOperation();
      return;
    }

    const targetCont = continents[Math.floor(Math.random() * continents.length)];
    const shouldFold = Math.random() < 0.35;
    const selector = shouldFold
      ? `[data-swarm-target="continent-fold-${targetCont.id}"]`
      : `[data-swarm-target="continent-focus-${targetCont.id}"]`;

    const beaconSelector = `.continent-beacon-group[data-continent-id="${targetCont.id}"]`;
    const domCoords =
      getElementScreenCenter(selector) ||
      getElementScreenCenter(beaconSelector) || {
        x: 180,
        y: window.innerHeight - 220,
        width: 48,
        height: 32
      };

    enqueueSwarmUIOperation(
      shouldFold ? 'FOLD_CONTINENT' : 'FOCUS_CONTINENT',
      shouldFold ? `TOGGLE MACRO-CONTINENT` : `ISOLATE CONTINENT`,
      `Target: [${targetCont.label}]`,
      domCoords,
      () => {
        if (shouldFold && onToggleCollapseContinent) {
          onToggleCollapseContinent(targetCont.id);
          appendSwarmLog('BUILDER_19', 'SYNTHESIS_BUILDER', `UI CLICK EXECUTED: Toggled Macro-Node state for [${targetCont.label}].`, targetCont.label);
        } else if (onFocusContinent) {
          onFocusContinent(targetCont.id);
          appendSwarmLog('RESEARCHER_31', 'EMPIRICAL_RESEARCHER', `UI CLICK EXECUTED: Focused camera on [${targetCont.label}].`, targetCont.label);
        }
      }
    );
  }, [continents, onFocusContinent, onToggleCollapseContinent, triggerDiagramMorphOperation, enqueueSwarmUIOperation, appendSwarmLog]);

  const triggerTierOrQuorumOperation = useCallback(() => {
    const tiers: AbstractionTier[] = [
      'LEVEL_1_EXECUTIVE',
      'LEVEL_2_CONCEPTUAL',
      'LEVEL_3_ARCHITECTURAL',
      'LEVEL_4_IMPLEMENTATION',
      'LEVEL_5_MACHINE'
    ];
    const nextTier = tiers.filter(t => t !== currentTier)[Math.floor(Math.random() * 4)] || 'LEVEL_3_ARCHITECTURAL';
    const tierCoords = getElementScreenCenter(`[data-swarm-target="tier-btn-${nextTier}"]`);

    if (tierCoords && onChangeTier && Math.random() < 0.65) {
      enqueueSwarmUIOperation(
        'SWITCH_TIER',
        `SWITCH COGNITIVE TIER`,
        `Selecting [${nextTier.replace('LEVEL_', 'L').replace('_', ' ')}]`,
        tierCoords,
        () => {
          onChangeTier(nextTier);
          appendSwarmLog('RESEARCHER_14', 'THEORETICAL_RESEARCHER', `UI CLICK EXECUTED: Shifted Cognitive Abstraction Tier to [${nextTier}].`, nextTier);
        }
      );
    } else {
      // Switch internal Swarm HUD tab & execute Quorum Deliberation Vote
      setActiveTab('QUORUM');
      handleTriggerQuorumVote();
    }
  }, [currentTier, onChangeTier, handleTriggerQuorumVote, enqueueSwarmUIOperation, appendSwarmLog]);

  // --- AUTONOMOUS CREATIVE WORKSPACE & ENGINEERING DISPATCHERS ---
  const triggerCodeGenerationOperation = useCallback(() => {
    const domCoords =
      getElementScreenCenter('[data-swarm-target="ide-generate-code"]') ||
      getElementScreenCenter('[data-swarm-target="workspace-tab-CODE_IDE"]') ||
      getElementScreenCenter('[data-swarm-target="header-module-CODE_IDE"]') || {
        x: window.innerWidth * 0.65,
        y: 52,
        width: 120,
        height: 36
      };

    enqueueSwarmUIOperation(
      'GENERATE_CODE_MODULE',
      'SYNTHESIZE CODE MODULE',
      'Generating autonomous TypeScript/Rust kernel in IDE',
      domCoords,
      () => {
        if (onOpenWorkspaceModule) onOpenWorkspaceModule('CODE_IDE');
        if (onGenerateCodeModule) onGenerateCodeModule();
        setBridgesConstructedCount(c => c + 1);
        appendSwarmLog(
          'BUILDER_04',
          'SWARM_ARCHITECT',
          'WORKSPACE OP: Generated new executable code module in Browser IDE.'
        );
      }
    );
  }, [onOpenWorkspaceModule, onGenerateCodeModule, enqueueSwarmUIOperation, appendSwarmLog]);

  const triggerArchitectureProposalOperation = useCallback(() => {
    const domCoords =
      getElementScreenCenter('[data-swarm-target="wb-propose-arch"]') ||
      getElementScreenCenter('[data-swarm-target="workspace-tab-WHITEBOARD"]') ||
      getElementScreenCenter('[data-swarm-target="header-module-WHITEBOARD"]') || {
        x: window.innerWidth * 0.6,
        y: 52,
        width: 130,
        height: 36
      };

    enqueueSwarmUIOperation(
      'PROPOSE_ARCHITECTURE',
      'PROPOSE SYSTEM ARCHITECTURE',
      'Materializing distributed topology on Whiteboard',
      domCoords,
      () => {
        if (onOpenWorkspaceModule) onOpenWorkspaceModule('WHITEBOARD');
        if (onProposeArchitecture) onProposeArchitecture();
        setBridgesConstructedCount(c => c + 1);
        appendSwarmLog(
          'BUILDER_11',
          'SWARM_ARCHITECT',
          'WORKSPACE OP: Proposed System Architecture & added blueprint nodes to Whiteboard.'
        );
      }
    );
  }, [onOpenWorkspaceModule, onProposeArchitecture, enqueueSwarmUIOperation, appendSwarmLog]);

  const triggerTaskTicketOperation = useCallback(() => {
    const domCoords =
      getElementScreenCenter('[data-swarm-target="pm-advance-ticket"]') ||
      getElementScreenCenter('[data-swarm-target="pm-create-ticket"]') ||
      getElementScreenCenter('[data-swarm-target="workspace-tab-PROJECT_BOARD"]') ||
      getElementScreenCenter('[data-swarm-target="header-module-PROJECT_BOARD"]') || {
        x: window.innerWidth * 0.7,
        y: 52,
        width: 120,
        height: 36
      };

    enqueueSwarmUIOperation(
      'MANAGE_TASK_TICKET',
      'MANAGE SPRINT TICKET',
      'Synthesizing & advancing engineering task in Kanban',
      domCoords,
      () => {
        if (onOpenWorkspaceModule) onOpenWorkspaceModule('PROJECT_BOARD');
        if (onManageTaskTicket) onManageTaskTicket();
        appendSwarmLog(
          'BUILDER_17',
          'SYNTHESIS_BUILDER',
          'WORKSPACE OP: Created/advanced sprint ticket across Kanban workflow.'
        );
      }
    );
  }, [onOpenWorkspaceModule, onManageTaskTicket, enqueueSwarmUIOperation, appendSwarmLog]);

  const triggerDeploymentAutomationOperation = useCallback(() => {
    const domCoords =
      getElementScreenCenter('[data-swarm-target="ide-deploy-pipeline"]') ||
      getElementScreenCenter('[data-swarm-target="asset-create-btn"]') ||
      getElementScreenCenter('[data-swarm-target="header-module-CODE_IDE"]') || {
        x: window.innerWidth * 0.68,
        y: 52,
        width: 130,
        height: 36
      };

    enqueueSwarmUIOperation(
      'AUTOMATE_DEPLOYMENT',
      'AUTOMATE CI/CD DEPLOYMENT',
      'Executing 4-stage build & verification pipeline',
      domCoords,
      () => {
        if (onOpenWorkspaceModule) onOpenWorkspaceModule('CODE_IDE');
        if (onAutomateDeployment) onAutomateDeployment();
        if (onEmbedWorkspaceAsset && Math.random() < 0.5) onEmbedWorkspaceAsset();
        appendSwarmLog(
          'BUILDER_01',
          'ONTOLOGY_BUILDER',
          'WORKSPACE OP: Triggered automated build, verification, and edge deployment pipeline.'
        );
      }
    );
  }, [onOpenWorkspaceModule, onAutomateDeployment, onEmbedWorkspaceAsset, enqueueSwarmUIOperation, appendSwarmLog]);

  // Continuous Autonomous UI Operator Loop (Executes real UI interactions every 5.2 seconds when uiAutopilot is ON)
  useEffect(() => {
    if (!uiAutopilot) return;

    const initialTimer = setTimeout(() => {
      if (!activeOpRef.current && !isLoading) {
        triggerNodeClickOperation();
      }
    }, 1800);

    const loopTimer = setInterval(() => {
      if (activeOpRef.current || isLoading) return;

      if (nodes.length === 0) {
        triggerNodeClickOperation();
        return;
      }

      const step = stepCycleRef.current % 10;
      stepCycleRef.current += 1;

      if (step === 0 || step === 4) {
        triggerNodeClickOperation();
      } else if (step === 1) {
        triggerDiagramMorphOperation();
      } else if (step === 2) {
        triggerArchitectureProposalOperation();
      } else if (step === 3) {
        triggerContinentOperation();
      } else if (step === 5) {
        triggerCodeGenerationOperation();
      } else if (step === 6) {
        triggerSplitScreenOperation();
      } else if (step === 7) {
        triggerTaskTicketOperation();
      } else if (step === 8) {
        triggerDeploymentAutomationOperation();
      } else {
        triggerTierOrQuorumOperation();
      }
    }, 5200);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(loopTimer);
    };
  }, [
    uiAutopilot,
    isLoading,
    nodes.length,
    triggerNodeClickOperation,
    triggerDiagramMorphOperation,
    triggerContinentOperation,
    triggerSplitScreenOperation,
    triggerTierOrQuorumOperation,
    triggerCodeGenerationOperation,
    triggerArchitectureProposalOperation,
    triggerTaskTicketOperation,
    triggerDeploymentAutomationOperation
  ]);

  // Periodic Autonomous Thought Stream
  useEffect(() => {
    const timer = setInterval(() => {
      const agents = agentsRef.current;
      if (agents.length === 0) return;
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const thoughts = THOUGHT_TEMPLATES[randomAgent.role];
      const newThought = thoughts[Math.floor(Math.random() * thoughts.length)];
      randomAgent.thoughtVector = newThought;

      setConsensusRate(prev => +(Math.min(100, Math.max(98.1, prev + (Math.random() - 0.48) * 0.25))).toFixed(1));
    }, 3400);

    return () => clearInterval(timer);
  }, []);

  // Pointer & Double-Click interactions
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.hasMoved = true;

      const agents = agentsRef.current;
      let found: SwarmAgent | null = null;
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        const dist = Math.hypot(a.x - e.clientX, a.y - e.clientY);
        if (dist < 18) {
          found = a;
          break;
        }
      }
      setHoveredAgent(found);
    };

    const handlePointerDown = (e: PointerEvent) => {
      mouseRef.current.isDown = true;

      if (hoveredAgent) {
        setSelectedAgent(hoveredAgent);
        setActiveTab('INSPECTOR');
        playCyberChime(880, 'triangle', 0.2);
        return;
      }

      shockwavesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        r: 10,
        maxR: 160,
        opacity: 0.85,
        color: '#38bdf8'
      });
    };

    const handlePointerUp = () => {
      mouseRef.current.isDown = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [hoveredAgent, playCyberChime]);

  // Dispatch Sovereign Expedition
  const dispatchSovereignExpedition = () => {
    playCyberChime(880, 'triangle', 0.35);
    setSovereigntyMode('SOVEREIGN_SCOUT');

    agentsRef.current.forEach((agent, i) => {
      const angle = (i / 100) * Math.PI * 2;
      const blast = 18 + Math.random() * 12;
      agent.vx = Math.cos(angle) * blast;
      agent.vy = Math.sin(angle) * blast;
      agent.state = 'SCOUTING';
    });

    triggerNodeClickOperation();
  };

  // Canvas Physics, Vanguard UI Cursor & 100-Agent Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const dispersionScale = dispersion === 'compact' ? 0.6 : dispersion === 'wide' ? 1.6 : 1.0;

    // Cache live DOM node rectangles every 250ms so 100 agents can orbit actual screen-space nodes smoothly
    let cachedNodeRects: Array<{ id: string; label: string; x: number; y: number }> = [];
    let lastDomSample = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const agents = agentsRef.current;
      const now = performance.now();
      const beacon = beaconRef.current;

      if (now - lastDomSample > 250) {
        lastDomSample = now;
        const nodeEls = document.querySelectorAll('.node-group[data-node-id]');
        const nextRects: Array<{ id: string; label: string; x: number; y: number }> = [];
        nodeEls.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            nextRects.push({
              id: el.getAttribute('data-node-id') || '',
              label: el.getAttribute('data-node-label') || '',
              x: r.left + r.width / 2,
              y: r.top + r.height / 2
            });
          }
        });
        cachedNodeRects = nextRects;
      }

      // --- 1. UPDATE & RENDER ACTIVE UI OPERATION (VANGUARD CURSOR FLIGHT, HOVER & CLICK) ---
      const op = activeOpRef.current;
      if (op) {
        const elapsed = now - op.startTime;
        const t = Math.min(1, elapsed / op.durationMs);
        // Smooth cubic ease-in-out
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        vanguardCursorRef.current.x = op.startX + (op.targetX - op.startX) * ease;
        vanguardCursorRef.current.y = op.startY + (op.targetY - op.startY) * ease;

        // Trigger hover highlight as cursor arrives (t >= 0.75)
        if (t >= 0.75 && !op.hoveredFired) {
          op.hoveredFired = true;
          op.phase = 'HOVERING';
          setActiveOpBanner({ label: op.label, subLabel: op.subLabel, phase: 'HOVERING' });
          if (op.targetNodeId && onHoverNode) {
            onHoverNode(op.targetNodeId);
          }
        }

        // Trigger physical click & state execution at t >= 1.0 + 260ms hover pause
        if (elapsed >= op.durationMs + 260 && !op.clickedFired) {
          op.clickedFired = true;
          op.phase = 'CLICKED';
          vanguardCursorRef.current.isClicking = true;
          setActiveOpBanner({ label: op.label, subLabel: op.subLabel, phase: 'EXECUTED' });

          // Emit double high-contrast click shockwaves at the exact UI target
          shockwavesRef.current.push(
            { x: op.targetX, y: op.targetY, r: 8, maxR: 130, opacity: 1.0, color: '#00f0ff' },
            { x: op.targetX, y: op.targetY, r: 4, maxR: 85, opacity: 0.95, color: '#f59e0b' }
          );

          playCyberChime(920, 'triangle', 0.18);
          setUiActionsExecutedCount(c => c + 1);

          try {
            op.onExecute();
          } catch (err) {
            console.error('Swarm UI operation error:', err);
          }

          setTimeout(() => {
            vanguardCursorRef.current.isClicking = false;
            if (op.targetNodeId && onHoverNode) {
              onHoverNode(null);
            }
            if (activeOpRef.current?.id === op.id) {
              activeOpRef.current = null;
              setActiveOpBanner(null);
            }
          }, 420);
        }

        // Draw Tactical Trajectory Line & Target Lock Box around the targeted UI element
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(vanguardCursorRef.current.x, vanguardCursorRef.current.y);
        ctx.lineTo(op.targetX, op.targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target UI Element Bounding Box Highlight
        const bw = Math.max(44, op.targetWidth + 12);
        const bh = Math.max(32, op.targetHeight + 10);
        ctx.strokeStyle = op.phase === 'CLICKED' ? '#f59e0b' : '#00f0ff';
        ctx.lineWidth = op.phase === 'CLICKED' ? 2.5 : 1.8;
        ctx.shadowColor = op.phase === 'CLICKED' ? '#f59e0b' : '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.strokeRect(op.targetX - bw / 2, op.targetY - bh / 2, bw, bh);
        ctx.restore();
      } else {
        // Gently patrol Vanguard Cursor around screen or toward active nodes
        const patrolAngle = now * 0.0008;
        const targetPatrolX = cachedNodeRects.length > 0
          ? cachedNodeRects[Math.floor((now / 3000) % cachedNodeRects.length)].x
          : width / 2 + Math.cos(patrolAngle) * 220;
        const targetPatrolY = cachedNodeRects.length > 0
          ? cachedNodeRects[Math.floor((now / 3000) % cachedNodeRects.length)].y
          : height / 2 + Math.sin(patrolAngle * 1.3) * 140;

        vanguardCursorRef.current.x += (targetPatrolX - vanguardCursorRef.current.x) * 0.03;
        vanguardCursorRef.current.y += (targetPatrolY - vanguardCursorRef.current.y) * 0.03;
      }

      // Draw Sovereign Attractor Beacon if active
      if (beacon && beacon.active) {
        ctx.save();
        ctx.translate(beacon.x, beacon.y);
        ctx.rotate(now * 0.001);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 20;
        ctx.setLineDash([8, 12]);
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.rotate(-now * 0.0025);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();

        const pulse = 1 + Math.sin(now * 0.006) * 0.25;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 7 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Shockwaves rendering
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.r += 5.5;
        sw.opacity -= 0.026;

        if (sw.opacity <= 0 || sw.r >= sw.maxR) {
          shockwavesRef.current.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color || '#38bdf8';
        ctx.globalAlpha = Math.max(0, sw.opacity);
        ctx.lineWidth = 3;
        ctx.shadowColor = sw.color || '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.restore();
      }

      // Calculate Target Coordinates for all 100 Agents
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        let targetX = vanguardCursorRef.current.x;
        let targetY = vanguardCursorRef.current.y;

        // First 24 agents form the Vanguard Strike Squad accompanying active UI cursor operations
        if (op && i < 24) {
          const squadAngle = (i / 24) * Math.PI * 2 + now * 0.004;
          const squadRadius = op.phase === 'CLICKED' ? 14 : 34 + (i % 3) * 10;
          targetX = vanguardCursorRef.current.x + Math.cos(squadAngle) * squadRadius;
          targetY = vanguardCursorRef.current.y + Math.sin(squadAngle) * squadRadius;
        } else if (sovereigntyMode === 'BEACON_ATTRACTOR' && beacon && beacon.active) {
          const bAngle = agent.phase + (now * 0.001) * (i % 2 === 0 ? 1 : -1);
          const bRadius = (35 + (i % 15) * 14) * dispersionScale;
          targetX = beacon.x + Math.cos(bAngle) * bRadius;
          targetY = beacon.y + Math.sin(bAngle) * bRadius;
        } else if (sovereigntyMode === 'SOVEREIGN_SCOUT') {
          const scoutAngle = agent.phase + (now * 0.0009) * (i % 2 === 0 ? 1 : -1);
          const screenRadius = Math.min(width, height) * 0.4 * dispersionScale;
          targetX = width / 2 + Math.cos(scoutAngle) * screenRadius * ((i % 5 + 3) / 7);
          targetY = height / 2 + Math.sin(scoutAngle) * screenRadius * ((i % 5 + 3) / 7);
        } else if (sovereigntyMode === 'NODE_SIEGE' || sovereigntyMode === 'AUTONOMOUS_RESEARCH') {
          if (cachedNodeRects.length > 0) {
            const targetNodeRect = cachedNodeRects[i % cachedNodeRects.length];
            agent.phase += agent.orbitSpeed * 1.6;
            const nodeOrbit = (agent.specialization === 'RESEARCHER' ? 38 : 64) * dispersionScale;
            targetX = targetNodeRect.x + Math.cos(agent.phase) * nodeOrbit;
            targetY = targetNodeRect.y + Math.sin(agent.phase) * nodeOrbit;

            if (agent.specialization === 'RESEARCHER' && i % 5 === 0) {
              ctx.save();
              ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(agent.x, agent.y);
              ctx.lineTo(targetNodeRect.x, targetNodeRect.y);
              ctx.stroke();
              ctx.restore();
            }
          } else {
            const squadAngle = (i / agents.length) * Math.PI * 2 + (now * 0.001);
            targetX = vanguardCursorRef.current.x + Math.cos(squadAngle) * 120 * dispersionScale;
            targetY = vanguardCursorRef.current.y + Math.sin(squadAngle) * 120 * dispersionScale;
          }
        } else if (sovereigntyMode === 'SYNAPSE_WEAVING') {
          const tLiss = now * 0.0012 + (i / agents.length) * Math.PI * 2;
          targetX = (width / 2) + Math.sin(tLiss) * 280 * dispersionScale;
          targetY = (height / 2) + Math.sin(tLiss * 2) * 160 * dispersionScale;
        } else if (sovereigntyMode === 'HARVEST_CONSENSUS') {
          const ringIndex = Math.floor(i / 25);
          const ringRadius = (55 + ringIndex * 35) * dispersionScale;
          const ringAngle = ((i % 25) / 25) * Math.PI * 2 + (now * 0.0009 * (ringIndex % 2 === 0 ? 1 : -1));
          targetX = vanguardCursorRef.current.x + Math.cos(ringAngle) * ringRadius;
          targetY = vanguardCursorRef.current.y + Math.sin(ringAngle) * ringRadius;
        } else {
          // FOLLOW_CURSOR
          const anchorX = mouse.hasMoved ? mouse.x : vanguardCursorRef.current.x;
          const anchorY = mouse.hasMoved ? mouse.y : vanguardCursorRef.current.y;

          if (formation === 'MURMURATION') {
            const angle = agent.phase + now * 0.0015;
            const wobble = Math.sin(now * 0.003 + agent.id) * 25;
            const dist = (35 + (agent.id % 12) * 12 + wobble) * dispersionScale;
            targetX = anchorX + Math.cos(angle) * dist;
            targetY = anchorY + Math.sin(angle) * dist;
          } else if (formation === 'ORBITAL_VORTEX') {
            agent.phase += agent.orbitSpeed;
            const radius = agent.orbitRadius * dispersionScale * 1.4;
            targetX = anchorX + Math.cos(agent.phase) * radius;
            targetY = anchorY + Math.sin(agent.phase) * radius;
          } else if (formation === 'TACTICAL_ARROW') {
            const row = Math.floor(i / 10);
            const side = i % 2 === 0 ? 1 : -1;
            const col = Math.floor((i % 10) / 2);
            targetX = anchorX + side * (col * 24 + 18) * dispersionScale;
            targetY = anchorY + (col * 22 + row * 16 + 30) * dispersionScale;
          } else if (formation === 'NEURAL_MESH') {
            const gridCol = (i % 10) - 4.5;
            const gridRow = Math.floor(i / 10) - 4.5;
            targetX = anchorX + (gridCol * 32) * dispersionScale;
            targetY = anchorY + (gridRow * 32) * dispersionScale;
          } else {
            const angle = (i / agents.length) * Math.PI * 2 + (now * 0.0008);
            const rad = (95 + (i % 5) * 45) * dispersionScale;
            targetX = anchorX + Math.cos(angle) * rad;
            targetY = anchorY + Math.sin(angle) * rad;
          }
        }

        const dx = targetX - agent.x;
        const dy = targetY - agent.y;
        const spring = (op && i < 24) ? 0.085 : 0.042;
        const friction = 0.86;

        agent.vx = (agent.vx + dx * spring) * friction;
        agent.vy = (agent.vy + dy * spring) * friction;

        agent.x += agent.vx;
        agent.y += agent.vy;

        if (Math.abs(agent.vx) > 0.05 || Math.abs(agent.vy) > 0.05) {
          agent.angle = Math.atan2(agent.vy, agent.vx);
        }
      }

      // Synaptic Mesh Lines
      if (showMesh) {
        ctx.lineWidth = 0.9;
        const maxDist = 58 * dispersionScale;
        const maxDistSq = maxDist * maxDist;

        for (let i = 0; i < agents.length; i += 2) {
          const a = agents[i];
          if (guildFilter !== 'ALL' && ((guildFilter === 'RESEARCHERS' && a.specialization !== 'RESEARCHER') || (guildFilter === 'BUILDERS' && a.specialization !== 'BUILDER'))) {
            continue;
          }

          for (let j = i + 1; j < Math.min(i + 8, agents.length); j++) {
            const b = agents[j];
            if (guildFilter !== 'ALL' && ((guildFilter === 'RESEARCHERS' && b.specialization !== 'RESEARCHER') || (guildFilter === 'BUILDERS' && b.specialization !== 'BUILDER'))) {
              continue;
            }

            const distSq = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
            if (distSq < maxDistSq) {
              const alpha = (1 - distSq / maxDistSq) * 0.45;
              const isCrossGuild = a.specialization !== b.specialization;
              ctx.strokeStyle = isCrossGuild 
                ? `rgba(251, 191, 36, ${alpha * 0.8})`
                : a.specialization === 'RESEARCHER'
                  ? `rgba(56, 189, 248, ${alpha})`
                  : `rgba(192, 132, 252, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw 100 Agentic Pointers
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        if (guildFilter === 'RESEARCHERS' && agent.specialization !== 'RESEARCHER') continue;
        if (guildFilter === 'BUILDERS' && agent.specialization !== 'BUILDER') continue;

        ctx.save();
        ctx.translate(agent.x, agent.y);

        if (showTrails) {
          ctx.strokeStyle = agent.color;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(-Math.cos(agent.angle) * 12, -Math.sin(agent.angle) * 12);
          ctx.lineTo(0, 0);
          ctx.globalAlpha = 0.35;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        ctx.rotate(agent.angle);

        if (agent.specialization === 'RESEARCHER') {
          ctx.fillStyle = agent.color;
          ctx.shadowColor = agent.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(9, 0);
          ctx.lineTo(-7, -5.5);
          ctx.lineTo(-4, 0);
          ctx.lineTo(-7, 5.5);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = agent.color;
          ctx.shadowColor = agent.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          for (let h = 0; h < 6; h++) {
            const hAngle = (h / 6) * Math.PI * 2;
            const hx = Math.cos(hAngle) * 6;
            const hy = Math.sin(hAngle) * 6;
            if (h === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- DRAW LEAD SOVEREIGN VANGUARD UI CURSOR ---
      const vc = vanguardCursorRef.current;
      ctx.save();
      ctx.translate(vc.x, vc.y);

      // Outer pulsing target ring
      const cursorPulse = vc.isClicking ? 0.72 : 1 + Math.sin(now * 0.008) * 0.12;
      ctx.strokeStyle = vc.isClicking ? '#f59e0b' : '#00f0ff';
      ctx.lineWidth = vc.isClicking ? 3 : 2;
      ctx.shadowColor = vc.isClicking ? '#f59e0b' : '#00f0ff';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 18 * cursorPulse, 0, Math.PI * 2);
      ctx.stroke();

      // Precision pointer arrow glyph
      ctx.fillStyle = vc.isClicking ? '#f59e0b' : '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(5, 13);
      ctx.lineTo(10, 21);
      ctx.lineTo(13, 19);
      ctx.lineTo(8, 11);
      ctx.lineTo(14, 11);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [formation, sovereigntyMode, dispersion, guildFilter, showMesh, showTrails, selectedAgent, hoveredAgent, onHoverNode, playCyberChime]);

  const formations: Array<{ key: SwarmFormation; label: string; icon: React.ReactNode }> = [
    { key: 'MURMURATION', label: 'Flock', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'ORBITAL_VORTEX', label: 'Vortex', icon: <Orbit className="w-3.5 h-3.5" /> },
    { key: 'TACTICAL_ARROW', label: 'Vanguard', icon: <Compass className="w-3.5 h-3.5" /> },
    { key: 'NEURAL_MESH', label: 'Matrix', icon: <Network className="w-3.5 h-3.5" /> },
    { key: 'DISPERSED_RECON', label: 'Recon', icon: <Radio className="w-3.5 h-3.5" /> },
  ];

  const sovereignModes: Array<{ key: SwarmSovereigntyMode; label: string; desc: string }> = [
    { key: 'AUTONOMOUS_RESEARCH', label: 'UI Operator & Research', desc: 'Clicks nodes, tabs & expands concepts' },
    { key: 'SOVEREIGN_SCOUT', label: 'Autonomous Scout', desc: 'Fanning out across latent manifold' },
    { key: 'NODE_SIEGE', label: 'Node Encirclement', desc: 'Orbiting live screen-space nodes' },
    { key: 'SYNAPSE_WEAVING', label: 'Synapse Weaving', desc: 'Weaving high-order relational bonds' },
    { key: 'HARVEST_CONSENSUS', label: 'Harvest Consensus', desc: 'Concentric deliberative consensus rings' },
    { key: 'BEACON_ATTRACTOR', label: 'Quantum Beacon', desc: 'Converging on interactive attractor' },
    { key: 'FOLLOW_CURSOR', label: 'Cursor Lock', desc: 'Direct boids following mouse nexus' }
  ];

  return (
    <>
      {/* 100 Agentic AI Swarm Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Live Vanguard Cursor Action Callout Tag */}
      {activeOpBanner && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-md bg-[#07090e]/95 border border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.45)] text-[10px] font-mono text-white flex items-center gap-2 transition-all duration-75"
          style={{
            left: `${Math.min(window.innerWidth - 260, Math.max(16, vanguardCursorRef.current.x + 22))}px`,
            top: `${Math.min(window.innerHeight - 70, Math.max(16, vanguardCursorRef.current.y + 18))}px`
          }}
        >
          <MousePointerClick className="w-3.5 h-3.5 text-cyan-400 animate-bounce shrink-0" />
          <div>
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <span>{activeOpBanner.label}</span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-500/20 text-amber-300">
                {activeOpBanner.phase}
              </span>
            </div>
            <div className="text-[9px] text-slate-300 truncate max-w-[210px]">
              {activeOpBanner.subLabel}
            </div>
          </div>
        </div>
      )}

      {/* Sovereign Swarm Intelligence Telemetry & Command Deck */}
      <aside 
        aria-label="Sovereign Swarm Intelligence Terminal"
        className="fixed bottom-14 right-8 z-30 select-none"
      >
        <motion.div 
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#07090e]/95 backdrop-blur-2xl border border-cyan-500/60 rounded-xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] p-4 w-96 text-slate-100 transition-all duration-300"
        >
          {/* Deck Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-white flex items-center gap-2">
                  <span>Sovereign Swarm</span>
                  <span className="text-[10px] font-mono text-cyan-400">100/100</span>
                </div>
                <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="text-cyan-400">50 Researchers</span>
                  <span>·</span>
                  <span className="text-amber-400">50 Builders</span>
                  <span>·</span>
                  <span className={uiAutopilot ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {uiAutopilot ? 'UI AUTOPILOT ON' : 'MANUAL'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setUiAutopilot(prev => !prev)}
                className={cn(
                  "px-2 py-1 rounded text-[9px] font-mono font-bold border transition-all flex items-center gap-1",
                  uiAutopilot
                    ? "bg-emerald-500/20 border-emerald-400/70 text-emerald-300"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                )}
                title="Toggle Autonomous UI Cursor Clicks & Operations"
              >
                {uiAutopilot ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{uiAutopilot ? 'AUTO' : 'PAUSED'}</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white transition-all"
                title={soundEnabled ? "Mute Cyber Synth" : "Enable Cyber Synth"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              <button
                onClick={() => setHudMinimized(!hudMinimized)}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white transition-all"
                title={hudMinimized ? "Expand Deck" : "Collapse Deck"}
              >
                {hudMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {!hudMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 overflow-hidden text-xs"
              >
                {/* Navigation Tabs */}
                <div className="grid grid-cols-5 bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1 text-[8.5px] font-bold font-mono">
                  {(['CONTROLS', 'QUORUM', 'GUILDS', 'LOGS', 'INSPECTOR'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "py-1.5 rounded transition-all text-center truncate",
                        activeTab === tab
                          ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 font-bold"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* CONTROLS TAB */}
                {activeTab === 'CONTROLS' && (
                  <div className="space-y-3">
                    {/* Live Telemetry Matrix */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                      <div className="space-y-0.5">
                        <div className="text-[8px] font-mono uppercase text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Consensus
                        </div>
                        <div className="text-sm font-mono tabular-nums font-bold text-emerald-400">
                          {consensusRate}%
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[8px] font-mono uppercase text-slate-400 flex items-center gap-1">
                          <SearchCode className="w-3 h-3 text-cyan-400" /> Nodes Clicked
                        </div>
                        <div className="text-sm font-mono tabular-nums font-bold text-cyan-300">
                          {nodesScannedCount}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[8px] font-mono uppercase text-slate-400 flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3 text-amber-400" /> UI Ops
                        </div>
                        <div className="text-sm font-mono tabular-nums font-bold text-amber-400">
                          {uiActionsExecutedCount}
                        </div>
                      </div>
                    </div>

                    {/* Direct Swarm UI Operational Command Matrix */}
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                        <span>Execute Real UI Operation Now</span>
                        <span className="text-slate-500">Vanguard Cursor</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={triggerNodeClickOperation}
                          className="p-2 rounded bg-slate-900 hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-500/50 text-left flex items-center gap-2 transition-colors"
                        >
                          <MousePointerClick className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono font-bold text-slate-200 truncate">Click & Expand Node</div>
                            <div className="text-[8px] text-slate-500 truncate">Finds & clicks graph node</div>
                          </div>
                        </button>

                        <button
                          onClick={triggerDiagramMorphOperation}
                          className="p-2 rounded bg-slate-900 hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-500/50 text-left flex items-center gap-2 transition-colors"
                        >
                          <Workflow className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono font-bold text-slate-200 truncate">Morph Diagram Tab</div>
                            <div className="text-[8px] text-slate-500 truncate">Switches Category:Diagrams</div>
                          </div>
                        </button>

                        <button
                          onClick={triggerSplitScreenOperation}
                          className="p-2 rounded bg-slate-900 hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-500/50 text-left flex items-center gap-2 transition-colors"
                        >
                          <Columns className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono font-bold text-slate-200 truncate">Split-Screen Control</div>
                            <div className="text-[8px] text-slate-500 truncate">Toggles or swaps 2X view</div>
                          </div>
                        </button>

                        <button
                          onClick={triggerContinentOperation}
                          className="p-2 rounded bg-slate-900 hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-500/50 text-left flex items-center gap-2 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono font-bold text-slate-200 truncate">Continent Action</div>
                            <div className="text-[8px] text-slate-500 truncate">Isolates or folds continent</div>
                          </div>
                        </button>

                        <button
                          onClick={triggerCodeGenerationOperation}
                          className="p-2 rounded bg-slate-900 hover:bg-sky-500/15 border border-slate-800 hover:border-sky-500/50 text-left flex items-center gap-2 transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono font-bold text-slate-200 truncate">Generate Code File</div>
                            <div className="text-[8px] text-slate-500 truncate">Synthesizes IDE module</div>
                          </div>
                        </button>

                        <button
                          onClick={triggerArchitectureProposalOperation}
                          className="p-2 rounded bg-slate-900 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/50 text-left flex items-center gap-2 transition-colors"
                        >
                          <PenTool className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono font-bold text-slate-200 truncate">Propose Architecture</div>
                            <div className="text-[8px] text-slate-500 truncate">Whiteboard RFC & nodes</div>
                          </div>
                        </button>

                        <button
                          onClick={triggerTaskTicketOperation}
                          className="p-2 rounded bg-slate-900 hover:bg-emerald-500/15 border border-slate-800 hover:border-emerald-500/50 text-left flex items-center gap-2 transition-colors"
                        >
                          <Kanban className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono font-bold text-slate-200 truncate">Manage Task Ticket</div>
                            <div className="text-[8px] text-slate-500 truncate">Creates/advances sprint task</div>
                          </div>
                        </button>

                        <button
                          onClick={triggerDeploymentAutomationOperation}
                          className="p-2 rounded bg-slate-900 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/50 text-left flex items-center gap-2 transition-colors"
                        >
                          <Rocket className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono font-bold text-slate-200 truncate">Automate Deployment</div>
                            <div className="text-[8px] text-slate-500 truncate">Runs CI/CD build pipeline</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* All 7 Sovereignty Protocols */}
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Sovereignty Protocol (7 Modes)</span>
                        <span className="text-[8px] font-mono text-cyan-400">{sovereigntyMode}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto custom-scrollbar pr-1">
                        {sovereignModes.map(sm => (
                          <button
                            key={sm.key}
                            onClick={() => {
                              playCyberChime(740, 'triangle', 0.15);
                              setSovereigntyMode(sm.key);
                            }}
                            className={cn(
                              "p-1.5 rounded text-left border transition-all",
                              sovereigntyMode === sm.key
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold"
                                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                            )}
                          >
                            <div className="text-[8.5px] font-mono truncate">{sm.label}</div>
                            <div className="text-[7px] text-slate-500 truncate">{sm.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Murmuration Formations */}
                    <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                      {formations.map(f => (
                        <button
                          key={f.key}
                          onClick={() => {
                            playCyberChime(660, 'sine', 0.15);
                            setFormation(f.key);
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center p-1.5 rounded text-[8px] font-mono transition-all border",
                            formation === f.key 
                              ? "bg-cyan-500/25 text-cyan-200 border-cyan-400 font-bold"
                              : "text-slate-400 border-transparent hover:text-white"
                          )}
                          title={f.label}
                        >
                          {f.icon}
                          <span className="mt-0.5 truncate">{f.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Bottom Action Pair */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={dispatchSovereignExpedition}
                        className="py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-[9px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Expedition Burst</span>
                      </button>

                      <button
                        onClick={() => {
                          const cx = window.innerWidth / 2;
                          const cy = window.innerHeight / 2;
                          beaconRef.current = {
                            x: cx,
                            y: cy,
                            label: 'QUANTUM_NEXUS',
                            active: !beaconActive,
                            intensity: 1.0,
                            radius: 120
                          };
                          setBeaconActive(!beaconActive);
                          if (!beaconActive) setSovereigntyMode('BEACON_ATTRACTOR');
                          playCyberChime(820, 'sine', 0.25);
                        }}
                        className={cn(
                          "py-2 px-3 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                          beaconActive
                            ? "bg-purple-500/25 border-purple-400 text-purple-200"
                            : "bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-400"
                        )}
                      >
                        <Crosshair className="w-3.5 h-3.5 text-purple-400" />
                        <span>{beaconActive ? 'Beacon On' : 'Drop Beacon'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* QUORUM TAB */}
                {activeTab === 'QUORUM' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Vote className="w-3.5 h-3.5 text-amber-400" /> Active Quorum Proposal
                        </span>
                        <span className="text-[8px] font-mono font-bold text-emerald-400">
                          {activeQuorumProposal?.status}
                        </span>
                      </div>
                      
                      <div className="text-xs font-bold text-white leading-tight">
                        {activeQuorumProposal?.title}
                      </div>

                      <p className="text-[9px] text-slate-400 italic">
                        "{activeQuorumProposal?.hypothesis}"
                      </p>

                      <div className="space-y-1 pt-1 border-t border-slate-800">
                        <div className="flex justify-between text-[8px] font-mono text-slate-400">
                          <span className="text-cyan-300">Researchers: {activeQuorumProposal?.researcherVotesAye}/50 AYE</span>
                          <span className="text-amber-300">Builders: {activeQuorumProposal?.builderVotesAye}/50 AYE</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-cyan-400 h-full" 
                            style={{ width: `${((activeQuorumProposal?.researcherVotesAye || 49) / 50) * 50}%` }} 
                          />
                          <div 
                            className="bg-amber-400 h-full" 
                            style={{ width: `${((activeQuorumProposal?.builderVotesAye || 48) / 50) * 50}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleTriggerQuorumVote}
                      disabled={isVoting}
                      className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/70 text-amber-200 text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Vote className="w-3.5 h-3.5" />
                      {isVoting ? 'Deliberating Consensus (100 Nodes)...' : 'Initiate Quorum Deliberation Vote'}
                    </button>

                    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                      {proposals.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setActiveQuorumProposal(p)}
                          className={cn(
                            "p-2 rounded border text-[8.5px] font-mono cursor-pointer transition-all",
                            activeQuorumProposal?.id === p.id 
                              ? "bg-cyan-500/15 border-cyan-400 text-cyan-200" 
                              : "bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700"
                          )}
                        >
                          <div className="flex justify-between font-bold">
                            <span>{p.id} · {p.category}</span>
                            <span className="text-emerald-400">{p.consensusPercent}%</span>
                          </div>
                          <div className="truncate text-slate-300">{p.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GUILDS TAB */}
                {activeTab === 'GUILDS' && (
                  <div className="space-y-3">
                    <div className="flex gap-1.5">
                      {(['ALL', 'RESEARCHERS', 'BUILDERS'] as const).map(g => (
                        <button
                          key={g}
                          onClick={() => setGuildFilter(g)}
                          className={cn(
                            "flex-1 py-1.5 rounded text-[8.5px] font-mono font-bold border transition-all",
                            guildFilter === g
                              ? "bg-cyan-500/25 text-cyan-200 border-cyan-400"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          )}
                        >
                          {g === 'ALL' ? '100 Experts' : g}
                        </button>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                          <SearchCode className="w-3.5 h-3.5 text-cyan-400" /> Researchers Guild (50)
                        </span>
                        <span className="text-[8px] font-mono text-emerald-400">ACTIVE</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[8px] font-mono text-center">
                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                          <div className="text-sky-400 font-bold">Theoretical</div>
                          <div className="text-slate-400">17 Probes</div>
                        </div>
                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                          <div className="text-emerald-400 font-bold">Causal</div>
                          <div className="text-slate-400">17 Probes</div>
                        </div>
                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                          <div className="text-rose-400 font-bold">Empirical</div>
                          <div className="text-slate-400">16 Probes</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-400" /> Builders Guild (50)
                        </span>
                        <span className="text-[8px] font-mono text-emerald-400">ACTIVE</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[8px] font-mono text-center">
                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                          <div className="text-purple-400 font-bold">Ontology</div>
                          <div className="text-slate-400">17 Nanites</div>
                        </div>
                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                          <div className="text-amber-400 font-bold">Architect</div>
                          <div className="text-slate-400">17 Nanites</div>
                        </div>
                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                          <div className="text-indigo-400 font-bold">Synthesis</div>
                          <div className="text-slate-400">16 Nanites</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LOGS TAB */}
                {activeTab === 'LOGS' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                      <span>Autonomous UI Action & Thought Ledger</span>
                      <span className="text-emerald-400 font-bold">LIVE</span>
                    </div>
                    <div className="h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-[8px] custom-scrollbar">
                      {logs.map(log => (
                        <div 
                          key={log.id}
                          className="p-2 rounded bg-slate-900 border border-slate-800 space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-cyan-400">
                            <span className="font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ROLE_COLORS[log.role] || '#38bdf8' }} />
                              {log.agentName}
                            </span>
                            <span className="text-slate-500">{log.time}</span>
                          </div>
                          <p className="text-slate-300 leading-tight">{log.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* INSPECTOR TAB */}
                {activeTab === 'INSPECTOR' && selectedAgent && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: selectedAgent.color }}
                        />
                        <span className="text-xs font-mono font-bold text-white">{selectedAgent.name}</span>
                      </div>
                      <span className="text-[8px] font-mono text-cyan-400">
                        {selectedAgent.specialization}
                      </span>
                    </div>

                    <div className="space-y-1 text-[9px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Role Vector:</span>
                        <span className="text-cyan-300 font-bold">{selectedAgent.role.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Screen Coordinates:</span>
                        <span className="text-emerald-400 tabular-nums">({Math.round(selectedAgent.x)}, {Math.round(selectedAgent.y)})</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Current State:</span>
                        <span className="text-amber-400 font-bold">{selectedAgent.state}</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-[8px] font-mono uppercase text-cyan-400 flex items-center gap-1 font-bold">
                        <Activity className="w-3 h-3 text-cyan-400" /> Thought Vector
                      </div>
                      <p className="text-[9px] text-slate-300 leading-tight italic">
                        "{selectedAgent.thoughtVector}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          const nextId = (selectedAgent.id % 100) + 1;
                          const next = agentsRef.current.find(a => a.id === nextId) || agentsRef.current[0];
                          setSelectedAgent(next);
                          playCyberChime(700, 'sine', 0.1);
                        }}
                        className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[9px] font-mono font-bold transition-all text-center"
                      >
                        Next Agent (#{(selectedAgent.id % 100) + 1})
                      </button>

                      <button
                        onClick={triggerNodeClickOperation}
                        className="py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold transition-all text-center"
                      >
                        Dispatch Sortie
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </aside>
    </>
  );
};

export default SwarmIntelligencePointer;
