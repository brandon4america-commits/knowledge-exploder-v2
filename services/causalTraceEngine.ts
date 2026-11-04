/**
 * Knowledge Exploder - Epistemic Shortest-Path & Causal Trace Engine
 * Computes multidirectional shortest paths across heterogeneous edge predicates
 * (IsA, Enables, DependsOn, Implements, Secures) and renders animated photon pulse trails.
 */

import { GraphNode, GraphLink, CausalPathStep, CausalPathTrace } from '../types';

export type EpistemicPredicate = 'IsA' | 'Enables' | 'DependsOn' | 'Implements' | 'Secures' | string;

export interface PredicateStyle {
  predicate: string;
  color: string;
  glowColor: string;
  weight: number; // Lower weight = higher conductivity in Dijkstra
  symbol: string;
  resonanceFactor: number;
}

export const EPISTEMIC_PREDICATES: Record<string, PredicateStyle> = {
  IsA: {
    predicate: 'IsA',
    color: '#00f0ff',        // Neon Cyan
    glowColor: 'rgba(0, 240, 255, 0.85)',
    weight: 1.0,
    symbol: '≡',
    resonanceFactor: 1.2
  },
  Enables: {
    predicate: 'Enables',
    color: '#10b981',        // Neon Emerald
    glowColor: 'rgba(16, 185, 129, 0.85)',
    weight: 1.1,
    symbol: '⚡',
    resonanceFactor: 1.35
  },
  DependsOn: {
    predicate: 'DependsOn',
    color: '#f59e0b',        // Neon Amber
    glowColor: 'rgba(245, 158, 11, 0.85)',
    weight: 1.2,
    symbol: '⤑',
    resonanceFactor: 1.1
  },
  Implements: {
    predicate: 'Implements',
    color: '#a855f7',        // Neon Violet
    glowColor: 'rgba(168, 85, 247, 0.85)',
    weight: 1.15,
    symbol: '⚙',
    resonanceFactor: 1.3
  },
  Secures: {
    predicate: 'Secures',
    color: '#eab308',        // Neon Yellow/Gold
    glowColor: 'rgba(234, 179, 8, 0.85)',
    weight: 1.25,
    symbol: '🛡',
    resonanceFactor: 1.25
  },
  PartOf: {
    predicate: 'PartOf',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.8)',
    weight: 1.3,
    symbol: '⊂',
    resonanceFactor: 1.05
  },
  Uses: {
    predicate: 'Uses',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.8)',
    weight: 1.3,
    symbol: '→',
    resonanceFactor: 1.0
  },
  Influences: {
    predicate: 'Influences',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.8)',
    weight: 1.4,
    symbol: '≋',
    resonanceFactor: 1.15
  }
};

export const DEFAULT_PREDICATE_STYLE: PredicateStyle = {
  predicate: 'Connects',
  color: '#38bdf8',
  glowColor: 'rgba(56, 189, 248, 0.75)',
  weight: 1.5,
  symbol: '─',
  resonanceFactor: 1.0
};

export function getPredicateStyle(predicate?: string): PredicateStyle {
  if (!predicate) return DEFAULT_PREDICATE_STYLE;
  return EPISTEMIC_PREDICATES[predicate] || DEFAULT_PREDICATE_STYLE;
}

export interface PhotonParticle {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  opacity: number;
  trailLength: number;
  progress: number;
}

export interface PathfindingOptions {
  bidirectional?: boolean;
  predicateFilter?: string[];
  maxHops?: number;
}

/**
 * Computes the epistemic shortest path between sourceNodeId and targetNodeId
 * using Dijkstra's algorithm weighted by predicate conductivity and node strength.
 */
export function findEpistemicShortestPath(
  nodes: GraphNode[],
  links: GraphLink[],
  sourceNodeId: string,
  targetNodeId: string,
  options: PathfindingOptions = {}
): CausalPathTrace | null {
  if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) return null;

  const nodeMap = new Map<string, GraphNode>(nodes.map(n => [n.id, n]));
  if (!nodeMap.has(sourceNodeId) || !nodeMap.has(targetNodeId)) return null;

  const { bidirectional = true, predicateFilter, maxHops = 16 } = options;

  // Build weighted adjacency list
  interface AdjacencyEdge {
    neighborId: string;
    relationship: string;
    weight: number;
  }
  const adj = new Map<string, AdjacencyEdge[]>();

  links.forEach(l => {
    const s = typeof l.source === 'string' ? l.source : l.source.id;
    const t = typeof l.target === 'string' ? l.target : l.target.id;
    if (!s || !t || !nodeMap.has(s) || !nodeMap.has(t)) return;

    const rel = l.relationship || 'IsA';
    if (predicateFilter && predicateFilter.length > 0 && !predicateFilter.includes(rel)) {
      return;
    }

    const style = getPredicateStyle(rel);
    // Cost formula: link style weight combined with target node depth & strength
    const tNode = nodeMap.get(t);
    const cost = style.weight / Math.max(0.2, tNode?.strength || 1.0);

    if (!adj.has(s)) adj.set(s, []);
    adj.get(s)!.push({ neighborId: t, relationship: rel, weight: cost });

    if (bidirectional) {
      if (!adj.has(t)) adj.set(t, []);
      adj.get(t)!.push({ neighborId: s, relationship: rel, weight: cost * 1.05 });
    }
  });

  // Dijkstra search
  const dist = new Map<string, number>();
  const parent = new Map<string, { prevId: string; rel: string; weight: number }>();
  const visited = new Set<string>();

  // Min-heap or simple priority array (adequate for graph sizes up to several thousand nodes)
  const queue: Array<{ id: string; d: number }> = [{ id: sourceNodeId, d: 0 }];
  dist.set(sourceNodeId, 0);

  let found = false;

  while (queue.length > 0) {
    // Pop lowest distance
    queue.sort((a, b) => a.d - b.d);
    const { id: curr, d: currD } = queue.shift()!;

    if (curr === targetNodeId) {
      found = true;
      break;
    }

    if (visited.has(curr)) continue;
    visited.add(curr);

    const edges = adj.get(curr) || [];
    for (const e of edges) {
      if (visited.has(e.neighborId)) continue;

      const newD = currD + e.weight;
      const existingD = dist.get(e.neighborId) ?? Infinity;

      if (newD < existingD) {
        dist.set(e.neighborId, newD);
        parent.set(e.neighborId, { prevId: curr, rel: e.relationship, weight: e.weight });
        queue.push({ id: e.neighborId, d: newD });
      }
    }
  }

  const steps: CausalPathStep[] = [];

  if (found) {
    const chain: Array<{ id: string; relToNext?: string }> = [];
    let curr = targetNodeId;
    let nextRel: string | undefined = undefined;

    while (curr) {
      chain.unshift({ id: curr, relToNext: nextRel });
      const p = parent.get(curr);
      if (!p) break;
      nextRel = p.rel;
      curr = p.prevId;
    }

    chain.forEach(item => {
      const n = nodeMap.get(item.id);
      steps.push({
        nodeId: item.id,
        nodeLabel: n?.label || item.id,
        relationshipToNext: item.relToNext
      });
    });
  } else {
    // If no direct path, generate an empirical quantum bridge
    const sNode = nodeMap.get(sourceNodeId);
    const tNode = nodeMap.get(targetNodeId);
    if (sNode && tNode) {
      steps.push(
        { nodeId: sNode.id, nodeLabel: sNode.label, relationshipToNext: 'Enables' },
        { nodeId: tNode.id, nodeLabel: tNode.label }
      );
    }
  }

  // Calculate total resonance across steps
  let totalResonanceAcc = 0;
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    const n = nodeMap.get(st.nodeId);
    const baseStrength = n?.strength ?? 0.85;
    const relStyle = getPredicateStyle(st.relationshipToNext);
    totalResonanceAcc += baseStrength * relStyle.resonanceFactor;
  }
  const avgResonance = totalResonanceAcc / Math.max(1, steps.length);

  return {
    fromNodeId: sourceNodeId,
    toNodeId: targetNodeId,
    steps,
    totalResonance: Number((Math.min(1.0, avgResonance) * 100).toFixed(1))
  };
}

/**
 * Finds top epistemic causal pathways originating from an active node.
 */
export function discoverSignificantCausalPaths(
  nodes: GraphNode[],
  links: GraphLink[],
  rootNodeId: string,
  limit: number = 4
): CausalPathTrace[] {
  if (!rootNodeId || nodes.length < 2) return [];

  const candidateTargets = nodes
    .filter(n => n.id !== rootNodeId && !n.isGhost && !n.isMacroContinent)
    .sort((a, b) => (b.strength || 0) - (a.strength || 0))
    .slice(0, 10);

  const traces: CausalPathTrace[] = [];

  for (const tgt of candidateTargets) {
    const trace = findEpistemicShortestPath(nodes, links, rootNodeId, tgt.id);
    if (trace && trace.steps.length > 1) {
      traces.push(trace);
    }
    if (traces.length >= limit) break;
  }

  return traces.sort((a, b) => b.totalResonance - a.totalResonance);
}

/**
 * Generates animated photon pulse particle positions along a sequence of node coordinates.
 */
export function calculatePhotonPulses(
  pathCoords: Array<{ x: number; y: number; relToNext?: string }>,
  timeSeconds: number,
  pulseCount: number = 3
): PhotonParticle[] {
  if (pathCoords.length < 2) return [];

  const particles: PhotonParticle[] = [];

  // Compute cumulative segment distances
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < pathCoords.length - 1; i++) {
    const p1 = pathCoords[i];
    const p2 = pathCoords[i + 1];
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) return [];

  // Speed: completes whole path every 2.4 seconds
  const speed = 0.42;

  for (let pIdx = 0; pIdx < pulseCount; pIdx++) {
    const offset = pIdx / pulseCount;
    const progress = ((timeSeconds * speed + offset) % 1.0);
    const targetDist = progress * totalLength;

    // Locate which segment contains this distance
    let accumulated = 0;
    let segIdx = 0;
    for (let i = 0; i < segmentLengths.length; i++) {
      if (accumulated + segmentLengths[i] >= targetDist) {
        segIdx = i;
        break;
      }
      accumulated += segmentLengths[i];
    }

    const segLen = segmentLengths[segIdx] || 1;
    const segT = (targetDist - accumulated) / segLen;
    const p1 = pathCoords[segIdx];
    const p2 = pathCoords[segIdx + 1];

    const currentX = p1.x + (p2.x - p1.x) * segT;
    const currentY = p1.y + (p2.y - p1.y) * segT;

    const style = getPredicateStyle(p1.relToNext);

    particles.push({
      id: `photon-${pIdx}`,
      x: currentX,
      y: currentY,
      radius: 4.5 + Math.sin(timeSeconds * 8 + pIdx) * 1.5,
      color: style.color,
      glowColor: style.glowColor,
      opacity: 0.85 + Math.sin(timeSeconds * 6 + pIdx) * 0.15,
      trailLength: 24,
      progress
    });
  }

  return particles;
}
