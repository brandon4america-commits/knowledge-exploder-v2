/**
 * Evolutionary State Memory Storage Service
 * Enforces robust, cross-session persistent state memory for Omega Point.
 * Synchronizes Knowledge Continents, Autogenesis Mutations, Code IDE, Whiteboard, and CRDT Bus.
 */

import {
  GraphData,
  DiscoveryMission,
  AutogenesisState,
  WhiteboardElement,
  WhiteboardConnection,
  WorkspaceCodeFile,
  ProjectTaskTicket,
  SystemArchitectureProposal,
  MultimediaAsset,
  WorkspaceSnapshot,
  ScientificTelemetry,
  ThemeMode,
  WorkspaceLayoutMode,
  StudioSplitRatio,
  WorkspaceModuleType,
  BiomimeticConfig,
  PlasticityMetrics,
  ChemotacticBeacon,
  DiagramParadigm,
  SpatialPatternType,
  ContinentPhysicsConfig
} from '../types';
import { crdtBus } from './crdtBus';
import { sanitizeNodeLabel, deduplicateGraphTopology } from './inferenceEngine';

export const STORAGE_KEY = 'omega_point_vOmega';
export const EVOLUTION_MEMORY_KEY = 'omega_evolutionary_memory_v1';

export interface PersistentStatePayload {
  version: string;
  savedAt: string;
  graphData: GraphData;
  mission: DiscoveryMission | null;
  autoExplode: boolean;
  topic: string;
  autogenesis: AutogenesisState;
  whiteboardElements: WhiteboardElement[];
  whiteboardConnections: WhiteboardConnection[];
  codeFiles: WorkspaceCodeFile[];
  tickets: ProjectTaskTicket[];
  architectureProposals: SystemArchitectureProposal[];
  assets: MultimediaAsset[];
  snapshots: WorkspaceSnapshot[];
  telemetryHistory?: ScientificTelemetry['history'];
  themeMode?: ThemeMode;
  workspaceLayoutMode?: WorkspaceLayoutMode;
  studioSplitRatio?: StudioSplitRatio;
  activeWorkspaceModule?: WorkspaceModuleType;
  biomimeticConfig?: BiomimeticConfig;
  plasticityMetrics?: PlasticityMetrics;
  chemotacticBeacons?: ChemotacticBeacon[];
  audioVolume?: number;
  audioMuted?: boolean;
  primaryParadigm?: DiagramParadigm;
  secondaryParadigm?: DiagramParadigm;
  activeSpatialPattern?: SpatialPatternType;
  spatialAnchorNodeId?: string | null;
  splitScreen?: boolean;
  continentConfig?: ContinentPhysicsConfig;
  crdtLamport?: number;
}

export interface StorageStats {
  usedBytes: number;
  formattedSize: string;
  quotaPercent: number;
  mutationCount: number;
  snapshotCount: number;
  codeFileCount: number;
  graphNodeCount: number;
  lastSavedAt: string;
}

/**
 * Persists the entire evolutionary state tree to localStorage and syncs with CRDT bus.
 */
export function saveEvolutionaryState(payload: Omit<PersistentStatePayload, 'version' | 'savedAt'>): boolean {
  try {
    const cleanGraph = deduplicateGraphTopology(
      payload.graphData?.nodes || [],
      payload.graphData?.links || []
    );

    const fullPayload: PersistentStatePayload = {
      ...payload,
      graphData: {
        nodes: cleanGraph.nodes,
        links: cleanGraph.links
      },
      version: 'v17.0.0-evolutionary-memory',
      savedAt: new Date().toISOString(),
      crdtLamport: crdtBus.getLamport()
    };

    const serialized = JSON.stringify(fullPayload);
    localStorage.setItem(STORAGE_KEY, serialized);
    
    // Backup autogenesis mutations separately to guarantee evolutionary lineage recovery
    if (payload.autogenesis) {
      localStorage.setItem(EVOLUTION_MEMORY_KEY, JSON.stringify({
        generationVersion: payload.autogenesis.generationVersion,
        cycleCount: payload.autogenesis.cycleCount,
        fitnessScore: Number((payload.autogenesis.fitnessScore || 92.4).toFixed(2)),
        selfWrittenLoc: payload.autogenesis.selfWrittenLoc,
        testSuitePassed: payload.autogenesis.testSuitePassed,
        activeHypothesis: payload.autogenesis.activeHypothesis,
        mutations: payload.autogenesis.mutations,
        savedAt: fullPayload.savedAt
      }));
    }

    return true;
  } catch (err) {
    console.error('[STORAGE_SERVICE] Save state memory failed:', err);
    return false;
  }
}

/**
 * Loads and validates persisted evolutionary state from localStorage.
 */
export function loadEvolutionaryState(): PersistentStatePayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistentStatePayload>;
    if (!parsed || typeof parsed !== 'object') return null;

    // Check backup evolution memory if autogenesis was missing in primary key
    let autogenesis = parsed.autogenesis;
    if (!autogenesis) {
      const backupRaw = localStorage.getItem(EVOLUTION_MEMORY_KEY);
      if (backupRaw) {
        try {
          const backupParsed = JSON.parse(backupRaw);
          autogenesis = {
            active: false,
            currentStage: 'INTROSPECT',
            stageProgress: 16,
            generationVersion: backupParsed.generationVersion || 'v17.0.0',
            cycleCount: backupParsed.cycleCount || 0,
            cadence: 'BALANCED_4S',
            fitnessScore: Number((backupParsed.fitnessScore || 92.4).toFixed(2)),
            selfWrittenLoc: backupParsed.selfWrittenLoc || 98,
            testSuitePassed: backupParsed.testSuitePassed || 42,
            activeHypothesis: backupParsed.activeHypothesis || 'Pairwise force optimizations',
            mutations: Array.isArray(backupParsed.mutations) ? backupParsed.mutations : []
          };
        } catch {
          /* fallback */
        }
      }
    }

    if (autogenesis && Array.isArray(autogenesis.mutations)) {
      const seenSubsystems = new Set<string>();
      autogenesis = {
        ...autogenesis,
        fitnessScore: Number((autogenesis.fitnessScore || 92.4).toFixed(2)),
        mutations: autogenesis.mutations
          .map(m => ({
            ...m,
            subsystem: sanitizeNodeLabel(m.subsystem),
            fitnessDelta: Number((m.fitnessDelta || 0.8).toFixed(2)),
            materializedNodeLabels: Array.isArray(m.materializedNodeLabels)
              ? m.materializedNodeLabels.map(l => sanitizeNodeLabel(l))
              : []
          }))
          .filter(m => {
            const key = `${m.fileName}::${m.generation}`;
            if (seenSubsystems.has(key)) return false;
            seenSubsystems.add(key);
            return true;
          })
          .slice(0, 24)
      };
    }

    return {
      version: parsed.version || 'v17.0.0',
      savedAt: parsed.savedAt || new Date().toISOString(),
      graphData: (() => {
        const gd = parsed.graphData || { nodes: [], links: [] };
        const rawNodes = Array.isArray(gd.nodes) ? gd.nodes : [];
        const rawLinks = Array.isArray(gd.links) ? gd.links : [];
        const deduped = deduplicateGraphTopology(rawNodes, rawLinks);
        deduped.nodes.forEach(n => {
          if (n.z === undefined) n.z = 0;
          if (n.quantumResonance === undefined) n.quantumResonance = 0.85;
        });
        return { nodes: deduped.nodes, links: deduped.links };
      })(),
      mission: parsed.mission || null,
      autoExplode: !!parsed.autoExplode,
      topic: parsed.topic || '',
      autogenesis: autogenesis || {
        active: false,
        currentStage: 'INTROSPECT',
        stageProgress: 16,
        generationVersion: 'v17.0.0',
        cycleCount: 0,
        cadence: 'BALANCED_4S',
        fitnessScore: 92.4,
        selfWrittenLoc: 98,
        testSuitePassed: 42,
        activeHypothesis: 'Replacing O(N²) pairwise repulsion with an O(N log N) Barnes-Hut spatial octree.',
        mutations: []
      },
      whiteboardElements: Array.isArray(parsed.whiteboardElements) ? parsed.whiteboardElements : [],
      whiteboardConnections: Array.isArray(parsed.whiteboardConnections) ? parsed.whiteboardConnections : [],
      codeFiles: Array.isArray(parsed.codeFiles) ? parsed.codeFiles : [],
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
      architectureProposals: Array.isArray(parsed.architectureProposals) ? parsed.architectureProposals : [],
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : [],
      telemetryHistory: Array.isArray(parsed.telemetryHistory) ? parsed.telemetryHistory : [],
      themeMode: parsed.themeMode || 'obsidian',
      workspaceLayoutMode: parsed.workspaceLayoutMode || 'GRAPH_ONLY',
      studioSplitRatio: parsed.studioSplitRatio || 'BALANCED_50_50',
      activeWorkspaceModule: parsed.activeWorkspaceModule || 'WHITEBOARD',
      biomimeticConfig: parsed.biomimeticConfig,
      plasticityMetrics: parsed.plasticityMetrics,
      chemotacticBeacons: Array.isArray(parsed.chemotacticBeacons) ? parsed.chemotacticBeacons : [],
      audioVolume: typeof parsed.audioVolume === 'number' ? parsed.audioVolume : 0.7,
      audioMuted: !!parsed.audioMuted,
      primaryParadigm: parsed.primaryParadigm,
      secondaryParadigm: parsed.secondaryParadigm,
      activeSpatialPattern: parsed.activeSpatialPattern,
      spatialAnchorNodeId: parsed.spatialAnchorNodeId,
      splitScreen: parsed.splitScreen,
      continentConfig: parsed.continentConfig,
      crdtLamport: parsed.crdtLamport || 0
    };
  } catch (err) {
    console.error('[STORAGE_SERVICE] Load state memory failed:', err);
    return null;
  }
}

/**
 * Calculates current localStorage usage statistics.
 */
export function getStorageStats(): StorageStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([raw]).size;
    const formattedSize = bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;
    
    // Typical localStorage limit is ~5MB (5,242,880 bytes)
    const quotaPercent = Math.min(100, Number(((bytes / 5242880) * 100).toFixed(1)));

    let parsed: Partial<PersistentStatePayload> = {};
    if (raw) {
      try { parsed = JSON.parse(raw); } catch { /* ignore */ }
    }

    return {
      usedBytes: bytes,
      formattedSize,
      quotaPercent,
      mutationCount: parsed.autogenesis?.mutations?.length || 0,
      snapshotCount: parsed.snapshots?.length || 0,
      codeFileCount: parsed.codeFiles?.length || 0,
      graphNodeCount: parsed.graphData?.nodes?.length || 0,
      lastSavedAt: parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString() : 'Never'
    };
  } catch {
    return {
      usedBytes: 0,
      formattedSize: '0 KB',
      quotaPercent: 0,
      mutationCount: 0,
      snapshotCount: 0,
      codeFileCount: 0,
      graphNodeCount: 0,
      lastSavedAt: 'Never'
    };
  }
}

/**
 * Exports the entire evolutionary state to a downloadable JSON file.
 */
export function exportEvolutionaryStateFile(payload: PersistentStatePayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omega_evolutionary_memory_${payload.autogenesis?.generationVersion || 'v14'}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Clears persistent memory storage.
 */
export function clearEvolutionaryMemory() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(EVOLUTION_MEMORY_KEY);
}

/**
 * Subscribes to window storage events to support multi-tab synchronization.
 */
export function subscribeToStorageChanges(onExternalChange: (state: PersistentStatePayload) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const state = loadEvolutionaryState();
        if (state) {
          onExternalChange(state);
        }
      } catch (err) {
        console.error('[STORAGE_SERVICE] Storage change handler failed:', err);
      }
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
