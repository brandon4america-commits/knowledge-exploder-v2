import {
  GraphNode,
  GraphLink,
  GraphData,
  MicroHypha,
  MicroHyphaPoint,
  BiomimeticConfig,
  PlasticityMetrics,
  NodeCentralityMetrics,
  ChemotacticBeacon
} from '../types';

export const DEFAULT_BIOMIMETIC_CONFIG: BiomimeticConfig = {
  enabled: true,
  growthRate: 1.0,
  hebbianHalfLifeSec: 45,
  pruningThreshold: 0.15,
  fluxIntensity: 1.0,
  showHyphae: true
};

export const DEFAULT_PLASTICITY_METRICS: PlasticityMetrics = {
  activeHyphaeCount: 0,
  anastomosisCount: 0,
  prunedLinksCount: 0,
  averageConductivity: 0.82,
  nutrientFlux: 64.8,
  evolutionEpoch: 1
};

/**
 * Computes organic bezier curve points for an exploratory micro-hypha
 * with natural fungal wave modulation and directional chemotactic pull toward beacons.
 */
export function computeHyphaCurvePoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  progress: number,
  seed: number = 0,
  beacons?: ChemotacticBeacon[]
): { points: MicroHyphaPoint[]; tipX: number; tipY: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1) {
    return { points: [{ x: x1, y: y1 }], tipX: x1, tipY: y1 };
  }

  // Normal unit vector for lateral branching undulation
  const nx = -dy / dist;
  const ny = dx / dist;

  const sampleCount = Math.max(5, Math.round(18 * progress));
  const points: MicroHyphaPoint[] = [];

  const maxWobble = Math.min(18, dist * 0.12);

  for (let i = 0; i <= sampleCount; i++) {
    const fraction = (i / sampleCount) * progress;
    const px = x1 + dx * fraction;
    const py = y1 + dy * fraction;

    // Harmonic fungal wave envelope (peaks in middle, zero at source soma)
    const envelope = Math.sin(fraction * Math.PI);
    const wave = Math.sin(fraction * Math.PI * 4 + seed) * 0.7 + Math.cos(fraction * Math.PI * 7 + seed * 1.5) * 0.3;
    const lateralOffset = wave * maxWobble * envelope;

    // Chemotactic Beacon Attraction Vector Pull
    let chemoOffsetX = 0;
    let chemoOffsetY = 0;
    if (beacons && beacons.length > 0) {
      beacons.forEach(b => {
        if (!b.active) return;
        const bdx = b.x - px;
        const bdy = b.y - py;
        const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
        if (bdist > 0 && bdist < b.attractionRadius) {
          const pullIntensity = (1 - bdist / b.attractionRadius) * b.nutrientIntensity * 0.45 * envelope;
          chemoOffsetX += (bdx / bdist) * Math.min(50, pullIntensity * bdist);
          chemoOffsetY += (bdy / bdist) * Math.min(50, pullIntensity * bdist);
        }
      });
    }

    points.push({
      x: px + nx * lateralOffset + chemoOffsetX,
      y: py + ny * lateralOffset + chemoOffsetY
    });
  }

  const tip = points[points.length - 1] || { x: x1, y: y1 };
  return {
    points,
    tipX: tip.x,
    tipY: tip.y
  };
}

/**
 * Steps the exploratory micro-hyphae population:
 * 1. Advances existing hyphae along their foraging trajectories (steered by Chemotactic Beacons)
 * 2. Sprouts new hyphae from high-nutrient/high-centrality somas
 * 3. Identifies anastomoses when tips reach candidate nodes
 */
export function stepMicroHyphae(
  nodes: GraphNode[],
  links: GraphLink[],
  currentHyphae: MicroHypha[],
  config: BiomimeticConfig,
  centralityMap?: Map<string, NodeCentralityMetrics>,
  maxHyphae: number = 20,
  beacons?: ChemotacticBeacon[]
): {
  updatedHyphae: MicroHypha[];
  newAnastomoses: Array<{ sourceId: string; targetId: string; affinity: number }>;
} {
  if (!config.enabled || nodes.length < 2) {
    return { updatedHyphae: [], newAnastomoses: [] };
  }

  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Build existing direct link adjacency lookup
  const connectedPairs = new Set<string>();
  links.forEach(l => {
    const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
    const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
    if (sId && tId) {
      connectedPairs.add(`${sId}->${tId}`);
      connectedPairs.add(`${tId}->${sId}`);
    }
  });

  const updatedHyphae: MicroHypha[] = [];
  const newAnastomoses: Array<{ sourceId: string; targetId: string; affinity: number }> = [];

  // 1. Advance existing hyphae
  currentHyphae.forEach(hypha => {
    const sNode = nodeMap.get(hypha.sourceNodeId);
    const tNode = nodeMap.get(hypha.targetCandidateNodeId);

    if (!sNode || !tNode || typeof sNode.x !== 'number' || typeof tNode.x !== 'number') {
      return; // Orphaned hypha
    }

    if (hypha.status === 'ANASTOMOSED') {
      return; // Already fused
    }

    const nextProgress = Math.min(1.0, hypha.growthProgress + 0.025 * config.growthRate);
    const seed = parseInt(hypha.id.slice(-4), 16) || 1;
    const curve = computeHyphaCurvePoints(
      sNode.x,
      sNode.y || 0,
      tNode.x,
      tNode.y || 0,
      nextProgress,
      seed,
      beacons
    );

    // Check proximity to target node
    const tipDx = (tNode.x || 0) - curve.tipX;
    const tipDy = (tNode.y || 0) - curve.tipY;
    const distToTarget = Math.sqrt(tipDx * tipDx + tipDy * tipDy);

    if (nextProgress >= 0.96 || distToTarget < 32) {
      newAnastomoses.push({
        sourceId: hypha.sourceNodeId,
        targetId: hypha.targetCandidateNodeId,
        affinity: hypha.affinityScore
      });
      updatedHyphae.push({
        ...hypha,
        growthProgress: 1.0,
        tipX: tNode.x,
        tipY: tNode.y || 0,
        points: curve.points,
        status: 'ANASTOMOSED'
      });
    } else {
      updatedHyphae.push({
        ...hypha,
        growthProgress: nextProgress,
        tipX: curve.tipX,
        tipY: curve.tipY,
        points: curve.points
      });
    }
  });

  // 2. Autonomous Sprouting: If under quota, choose nutrient-rich nodes to sprout micro-hyphae
  const activeCount = updatedHyphae.filter(h => h.status === 'FORAGING').length;
  const slotsAvailable = maxHyphae - activeCount;

  if (slotsAvailable > 0 && Math.random() < 0.65 * config.growthRate) {
    // Sort candidate somas by nutrient potential (centrality composite score or strength)
    const sortedSomas = [...nodes].sort((a, b) => {
      const centA = centralityMap?.get(a.id)?.compositeScore ?? (a.strength || 0.5);
      const centB = centralityMap?.get(b.id)?.compositeScore ?? (b.strength || 0.5);
      return centB - centA;
    });

    const activeSproutPairs = new Set(
      updatedHyphae.map(h => `${h.sourceNodeId}->${h.targetCandidateNodeId}`)
    );

    for (const source of sortedSomas.slice(0, 8)) {
      if (updatedHyphae.length >= maxHyphae) break;

      // Find best unlinked target within organic foraging distance (120px to 450px)
      const candidates = nodes.filter(candidate => {
        if (candidate.id === source.id) return false;
        if (connectedPairs.has(`${source.id}->${candidate.id}`)) return false;
        if (activeSproutPairs.has(`${source.id}->${candidate.id}`)) return false;

        const dx = (candidate.x || 0) - (source.x || 0);
        const dy = (candidate.y || 0) - (source.y || 0);
        const d = Math.sqrt(dx * dx + dy * dy);
        return d >= 80 && d <= 500;
      });

      if (candidates.length === 0) continue;

      // Select candidate with highest affinity (same continent or complimentary group)
      candidates.sort((a, b) => {
        const aSameCont = a.continentId === source.continentId ? 0.3 : 0;
        const bSameCont = b.continentId === source.continentId ? 0.3 : 0;
        const aScore = (a.strength || 0.5) + aSameCont;
        const bScore = (b.strength || 0.5) + bSameCont;
        return bScore - aScore;
      });

      const target = candidates[0];
      const affinity = Number((0.45 + Math.random() * 0.45).toFixed(3));
      const hyphaId = `hypha-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

      const curve = computeHyphaCurvePoints(
        source.x || 0,
        source.y || 0,
        target.x || 0,
        target.y || 0,
        0.05,
        Math.random() * 10
      );

      updatedHyphae.push({
        id: hyphaId,
        sourceNodeId: source.id,
        targetCandidateNodeId: target.id,
        growthProgress: 0.05,
        tipX: curve.tipX,
        tipY: curve.tipY,
        points: curve.points,
        affinityScore: affinity,
        createdAt: Date.now(),
        status: 'FORAGING'
      });

      activeSproutPairs.add(`${source.id}->${target.id}`);
      if (updatedHyphae.length >= maxHyphae) break;
    }
  }

  return { updatedHyphae, newAnastomoses };
}

/**
 * Applies Hebbian Synaptic Plasticity & STDP:
 * - Strengthens connections exercised during interactions
 * - Exponentially decays unexercised synapses according to half-life
 * - Flags dormant links that drop below pruningThreshold
 */
export function applyHebbianPlasticity(
  links: GraphLink[],
  nodes: GraphNode[],
  config: BiomimeticConfig,
  activeNodeIds: Set<string>,
  pinnedNodeId?: string | null,
  deltaSec: number = 1.0
): {
  updatedLinks: GraphLink[];
  prunableLinkIndices: number[];
  averageConductivity: number;
} {
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const lambda = Math.LN2 / Math.max(5, config.hebbianHalfLifeSec);
  const decayFactor = Math.exp(-lambda * deltaSec);

  let totalConductivity = 0;
  const prunableIndices: number[] = [];

  const updatedLinks = links.map((link, idx) => {
    const sId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
    const tId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
    const sNode = nodeMap.get(sId);
    const tNode = nodeMap.get(tId);

    const prevConductivity = link.conductivity ?? 0.82;
    const isExercised = activeNodeIds.has(sId) || activeNodeIds.has(tId);
    const isPinned = pinnedNodeId && (pinnedNodeId === sId || pinnedNodeId === tId);
    const isSeed = sNode?.depth === 0 || tNode?.depth === 0;

    let nextConductivity: number;

    if (isExercised) {
      // Hebbian LTP (Long-Term Potentiation): Activity strengthens synapse
      nextConductivity = Math.min(1.0, prevConductivity + 0.12 * config.fluxIntensity);
    } else {
      // Exponential LTD (Long-Term Depression) decay
      nextConductivity = Math.max(0.08, prevConductivity * decayFactor);
    }

    totalConductivity += nextConductivity;

    // Pruning qualification: Below threshold and NOT protected by seed/pinned immunity
    if (
      config.enabled &&
      nextConductivity < config.pruningThreshold &&
      !isPinned &&
      !isSeed &&
      links.length > 5 // Maintain minimal topological connectivity
    ) {
      prunableIndices.push(idx);
    }

    return {
      ...link,
      conductivity: Number(nextConductivity.toFixed(4)),
      lastFiredTimestamp: isExercised ? Date.now() : link.lastFiredTimestamp
    };
  });

  const averageConductivity = links.length > 0
    ? Number((totalConductivity / links.length).toFixed(3))
    : 0.85;

  return {
    updatedLinks,
    prunableLinkIndices: prunableIndices,
    averageConductivity
  };
}

/**
 * Consolidates qualified anastomoses into permanent GraphLink entities.
 */
export function consolidateAnastomoses(
  graphData: GraphData,
  anastomoses: Array<{ sourceId: string; targetId: string; affinity: number }>
): {
  updatedGraphData: GraphData;
  fusedCount: number;
} {
  if (anastomoses.length === 0) {
    return { updatedGraphData: graphData, fusedCount: 0 };
  }

  const existingPairs = new Set<string>();
  graphData.links.forEach(l => {
    const sId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
    const tId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
    if (sId && tId) {
      existingPairs.add(`${sId}->${tId}`);
      existingPairs.add(`${tId}->${sId}`);
    }
  });

  const newLinks: GraphLink[] = [];

  anastomoses.forEach(a => {
    const key = `${a.sourceId}->${a.targetId}`;
    if (!existingPairs.has(key)) {
      existingPairs.add(key);
      newLinks.push({
        source: a.sourceId,
        target: a.targetId,
        relationship: 'Enables',
        strength: a.affinity,
        conductivity: 0.92,
        resonanceScore: a.affinity,
        lastFiredTimestamp: Date.now()
      });
    }
  });

  if (newLinks.length === 0) {
    return { updatedGraphData: graphData, fusedCount: 0 };
  }

  return {
    updatedGraphData: {
      nodes: graphData.nodes,
      links: [...graphData.links, ...newLinks]
    },
    fusedCount: newLinks.length
  };
}

/**
 * Prunes non-essential links whose conductivity has decayed below the pruning threshold.
 */
export function pruneDormantSynapses(
  graphData: GraphData,
  prunableIndices: number[]
): {
  prunedGraphData: GraphData;
  prunedCount: number;
} {
  if (prunableIndices.length === 0) {
    return { prunedGraphData: graphData, prunedCount: 0 };
  }

  const pruneSet = new Set(prunableIndices);
  const remainingLinks = graphData.links.filter((_, idx) => !pruneSet.has(idx));

  return {
    prunedGraphData: {
      nodes: graphData.nodes,
      links: remainingLinks
    },
    prunedCount: prunableIndices.length
  };
}
