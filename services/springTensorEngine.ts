import * as d3 from 'd3';
import { GraphNode, GraphLink, NodeCentralityMetrics } from '../types';

export interface SpringTensorModulation {
  resonanceScore: number;
  stiffness: number;
  damping: number;
  targetDistance: number;
}

/**
 * Calculates the Shared Resonance Score between connected endpoints:
 * ResonanceScore(u, v) = sqrt(C_comp(u) * C_comp(v)) * w_uv
 * where C_comp is the normalized composite centrality and w_uv is predicate strength.
 */
export function computeSharedResonance(
  source: GraphNode,
  target: GraphNode,
  linkStrength: number = 0.7,
  centralityMap?: Map<string, NodeCentralityMetrics>,
  conductivity?: number
): SpringTensorModulation {
  const sourceCentrality = centralityMap?.get(source.id)?.compositeScore ?? (source.strength || 0.6);
  const targetCentrality = centralityMap?.get(target.id)?.compositeScore ?? (target.strength || 0.6);

  // Geometric mean of composite centrality multiplied by predicate link strength and biological conductivity
  const baseResonance = Math.sqrt(Math.max(0.01, sourceCentrality * targetCentrality));
  const condFactor = typeof conductivity === 'number' ? Math.max(0.2, Math.min(1.2, conductivity)) : 1.0;
  const normalizedStrength = Math.min(1.2, Math.max(0.3, linkStrength * condFactor));
  const resonanceScore = Number(Math.min(1.0, Math.max(0.05, baseResonance * normalizedStrength)).toFixed(4));

  // Dynamic stiffness mapping: tighter, high-resonance links have higher stiffness
  // k in [0.2, 0.95]
  const stiffness = Number((0.2 + 0.75 * Math.pow(resonanceScore, 1.8)).toFixed(3));

  // Damping coefficient: critical damping ratio gamma in [0.35, 0.85]
  const damping = Number((0.35 + 0.5 * (1 - resonanceScore)).toFixed(3));

  // Target equilibrium distance centered around 90px (tighter for high resonance)
  const targetDistance = Math.round(90 + (0.6 - resonanceScore) * 35);

  return {
    resonanceScore,
    stiffness,
    damping,
    targetDistance
  };
}

/**
 * Enriches a collection of GraphLinks with calculated resonance scores and spring stiffness.
 */
export function enrichLinksWithSpringTensor(
  links: GraphLink[],
  nodes: GraphNode[],
  centralityMap?: Map<string, NodeCentralityMetrics>
): GraphLink[] {
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  return links.map(link => {
    const sId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
    const tId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
    const sNode = nodeMap.get(sId);
    const tNode = nodeMap.get(tId);

    if (!sNode || !tNode) return link;

    const tensor = computeSharedResonance(sNode, tNode, link.strength || 0.7, centralityMap, link.conductivity);
    return {
      ...link,
      resonanceScore: tensor.resonanceScore,
      springStiffness: tensor.stiffness
    };
  });
}

/**
 * Creates custom D3 Force Link parameters using the Spring Tensor Engine.
 */
export function configureSpringTensorForces(
  forceLink: d3.ForceLink<GraphNode, GraphLink>,
  centralityMap?: Map<string, NodeCentralityMetrics>,
  continentSeparation: number = 340,
  sameContinentBias: boolean = true
) {
  forceLink
    .distance(d => {
      const s = d.source as GraphNode;
      const t = d.target as GraphNode;
      const tensor = computeSharedResonance(s, t, d.strength || 0.7, centralityMap, d.conductivity);

      if (sameContinentBias && s.continentId && t.continentId) {
        const sameCont = s.continentId === t.continentId;
        return sameCont
          ? 90
          : Math.max(135, continentSeparation * 0.55 - tensor.resonanceScore * 30);
      }
      return 90;
    })
    .strength(d => {
      const s = d.source as GraphNode;
      const t = d.target as GraphNode;
      const tensor = computeSharedResonance(s, t, d.strength || 0.7, centralityMap, d.conductivity);
      return tensor.stiffness;
    });
}

/**
 * Generates vector-based harmonic spring coil coordinates between (x1, y1) and (x2, y2).
 * Higher resonance generates tighter, higher-frequency zig-zag coil geometry.
 */
export function generateSpringCoilPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  resonance: number = 0.5,
  timeOffset: number = 0
): Array<{ x: number; y: number }> {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 20) {
    return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  }

  // Normal unit vectors
  const ux = dx / dist;
  const uy = dy / dist;
  const nx = -uy;
  const ny = ux;

  // Higher resonance = more coils, smaller coil amplitude (tighter spring)
  // Low resonance = fewer coils, looser waving oscillations
  const minCoils = 4;
  const maxCoils = 16;
  const coilCount = Math.round(minCoils + resonance * (maxCoils - minCoils));

  const amplitude = Math.max(2.5, (10 - resonance * 6));
  const leadFraction = 0.15; // Straight lead wire at ends
  const activeStart = dist * leadFraction;
  const activeEnd = dist * (1 - leadFraction);
  const activeLen = activeEnd - activeStart;

  const points: Array<{ x: number; y: number }> = [{ x: x1, y: y1 }];

  // Lead-in point
  points.push({
    x: x1 + ux * activeStart,
    y: y1 + uy * activeStart
  });

  const totalSegments = coilCount * 2;
  for (let i = 1; i < totalSegments; i++) {
    const fraction = i / totalSegments;
    const progress = activeStart + fraction * activeLen;
    // Harmonic phase alternation with time animation
    const sign = (i % 2 === 1) ? 1 : -1;
    const phaseOffset = Math.sin(fraction * Math.PI * 2 + timeOffset) * 0.3;
    const currentAmp = amplitude * (1 + phaseOffset) * sign;

    const px = x1 + ux * progress + nx * currentAmp;
    const py = y1 + uy * progress + ny * currentAmp;
    points.push({ x: px, y: py });
  }

  // Lead-out point
  points.push({
    x: x1 + ux * activeEnd,
    y: y1 + uy * activeEnd
  });

  // End point
  points.push({ x: x2, y: y2 });

  return points;
}
