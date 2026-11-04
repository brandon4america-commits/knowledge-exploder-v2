/**
 * Neural-Symbolic Inference Engine (v16.0)
 * In-memory vector-symbolic embedding space (D=64) & cosine similarity matrix calculation.
 * Maps CSR tensor resonance scores into latent space for semantic distance queries
 * and discovers implicit semantic bridges across unlinked graph concepts.
 */

import { GraphNode, GraphLink } from '../types';

export interface SemanticQueryResult {
  node: GraphNode;
  cosineSimilarity: number;
  semanticDistance: number;
  embeddingPreview: number[];
}

export interface SemanticBridgeCandidate {
  sourceNode: GraphNode;
  targetNode: GraphNode;
  cosineSimilarity: number;
  latentResonanceProduct: number;
}

export interface CosineMatrixSummary {
  dimension: number;
  nodeCount: number;
  meanSimilarity: number;
  maxSimilarityPair: { sourceLabel: string; targetLabel: string; similarity: number } | null;
  bridgeCandidates: SemanticBridgeCandidate[];
}

export const EMBEDDING_DIM = 64;

/**
 * Strict canonicalizer that strips runaway recursive prefixes
 * ("Hypothetical", "Mechanisms of", "Vector Subsystem") and suffixes
 * ("Limit", "Resonance Core", "Vector Subsystem", "Gen-\d+"),
 * collapses whitespace, and caps length at 64 characters.
 */
export function sanitizeNodeLabel(rawLabel: string): string {
  if (!rawLabel || typeof rawLabel !== 'string') return 'Omega Concept Vector';

  let text = rawLabel.replace(/\s+/g, ' ').trim();

  // Iteratively strip runaway prefixes and suffixes up to 24 passes
  const prefixRegex = /^(?:hypothetical|mechanisms\s+of|vector\s+subsystem|speculative|emergent|dialectical\s+synthesis:?)\s+/i;
  const suffixRegex = /\s+(?:limit|resonance\s+core|vector\s+subsystem|gen-\d+|v\d+\.\d+(?:\.\d+)?)$/i;

  for (let pass = 0; pass < 24; pass++) {
    const next = text
      .replace(prefixRegex, '')
      .replace(suffixRegex, '')
      .trim();
    if (next === text || next.length === 0) {
      if (next.length > 0) text = next;
      break;
    }
    text = next;
  }

  // Collapse any consecutive duplicate words (e.g., "Limit Limit", "Hypothetical Hypothetical")
  const words = text.split(/\s+/);
  const dedupedWords: string[] = [];
  for (const w of words) {
    if (
      dedupedWords.length === 0 ||
      dedupedWords[dedupedWords.length - 1].toLowerCase() !== w.toLowerCase()
    ) {
      dedupedWords.push(w);
    }
  }
  text = dedupedWords.join(' ').trim();

  if (!text) return 'Omega Concept Vector';
  if (text.length > 64) {
    text = text.slice(0, 64).trim();
  }
  return text;
}

/**
 * Returns the normalized root stem for deduplicating nodes across generations.
 */
export function getCanonicalRootStem(label: string): string {
  return sanitizeNodeLabel(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Sanitizes all node labels and deduplicates nodes by canonical root stem,
 * remapping links to the canonical node IDs and removing self-loops or duplicate links.
 */
export function deduplicateGraphTopology(
  nodes: GraphNode[],
  links: GraphLink[]
): { nodes: GraphNode[]; links: GraphLink[]; removedCount: number } {
  const stemToWinner = new Map<string, GraphNode>();
  const idRemap = new Map<string, string>();
  const cleanNodes: GraphNode[] = [];

  for (const rawNode of nodes) {
    if (!rawNode || typeof rawNode !== 'object' || !rawNode.id) continue;
    const cleanLabel = sanitizeNodeLabel(rawNode.label || rawNode.id);
    const stem = getCanonicalRootStem(cleanLabel) || rawNode.id.toLowerCase();

    const existing = stemToWinner.get(stem);
    if (!existing) {
      const sanitizedNode: GraphNode = {
        ...rawNode,
        label: cleanLabel
      };
      stemToWinner.set(stem, sanitizedNode);
      idRemap.set(rawNode.id, sanitizedNode.id);
      cleanNodes.push(sanitizedNode);
    } else {
      idRemap.set(rawNode.id, existing.id);
      // Upgrade ghost to materialized if duplicate is non-ghost
      if (existing.isGhost && !rawNode.isGhost) {
        existing.isGhost = false;
      }
      if ((rawNode.strength || 0) > (existing.strength || 0)) {
        existing.strength = rawNode.strength;
      }
    }
  }

  const validIds = new Set(cleanNodes.map(n => n.id));
  const seenEdges = new Set<string>();
  const cleanLinks: GraphLink[] = [];

  for (const rawLink of links) {
    if (!rawLink) continue;
    const rawS = typeof rawLink.source === 'string' ? rawLink.source : (rawLink.source as GraphNode)?.id;
    const rawT = typeof rawLink.target === 'string' ? rawLink.target : (rawLink.target as GraphNode)?.id;
    if (!rawS || !rawT) continue;

    const s = idRemap.get(rawS) || rawS;
    const t = idRemap.get(rawT) || rawT;
    if (s === t || !validIds.has(s) || !validIds.has(t)) continue;

    const edgeKey = s < t ? `${s}::${t}` : `${t}::${s}`;
    if (seenEdges.has(edgeKey)) continue;
    seenEdges.add(edgeKey);

    cleanLinks.push({
      ...rawLink,
      source: s,
      target: t
    });
  }

  return {
    nodes: cleanNodes,
    links: cleanLinks,
    removedCount: Math.max(0, nodes.length - cleanNodes.length)
  };
}

// Deterministic hash to seed pseudo-random unit vector based on semantic attributes
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Generates a normalized 64D embedding vector for a node combining its label tokens,
 * ontological group, depth, and quantum spectral resonance.
 */
export function generateNodeEmbedding(node: GraphNode): Float32Array {
  const vec = new Float32Array(EMBEDDING_DIM);
  const labelClean = sanitizeNodeLabel(node.label || '').toLowerCase();
  const descClean = (node.description || '').toLowerCase().slice(0, 64);
  const baseSeed = hashString(`${node.id}:${labelClean}:${node.group || 1}`);
  const descSeed = hashString(descClean || labelClean);
  const groupVal = node.group || 1;
  const resonance = node.quantumResonance ?? node.strength ?? 0.85;

  let normSq = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    // Combine group harmonic subspace + lexical token phase + spectral resonance modulation
    const groupComponent = Math.cos(((groupVal * (i + 1)) % 13) * 0.48) * 0.55;
    const lexicalComponent = Math.sin(baseSeed * (i + 1) * 0.00017 + (descSeed % 97) * 0.05) * 0.35;
    const spectralComponent = Math.cos(resonance * Math.PI * ((i % 8) + 1) * 0.25) * 0.25;

    const val = groupComponent + lexicalComponent + spectralComponent;
    vec[i] = val;
    normSq += val * val;
  }

  // L2 Normalize to unit hypersphere (||u|| = 1.0)
  const norm = Math.sqrt(normSq) || 1.0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    vec[i] /= norm;
  }

  return vec;
}

/**
 * Computes cosine similarity between two 64D unit vectors: dot(u, v)
 */
export function computeCosineSimilarity(u: Float32Array, v: Float32Array): number {
  let dot = 0;
  const len = Math.min(u.length, v.length);
  for (let i = 0; i < len; i++) {
    dot += u[i] * v[i];
  }
  return Number(Math.max(-1.0, Math.min(1.0, dot)).toFixed(4));
}

/**
 * Queries nearest semantically related nodes in 64D latent space
 */
export function querySemanticProximity(
  nodes: GraphNode[],
  targetNodeId: string,
  topK = 5
): SemanticQueryResult[] {
  const targetNode = nodes.find(n => n.id === targetNodeId);
  if (!targetNode) return [];

  const targetVec = generateNodeEmbedding(targetNode);
  const results: SemanticQueryResult[] = [];

  nodes.forEach(node => {
    if (node.id === targetNodeId) return;
    const nodeVec = generateNodeEmbedding(node);
    const rawSim = computeCosineSimilarity(targetVec, nodeVec);
    // Map [-1, 1] to [0, 1] conceptual proximity
    const normalizedSim = Number(((rawSim + 1) / 2).toFixed(4));
    results.push({
      node,
      cosineSimilarity: normalizedSim,
      semanticDistance: Number((1.0 - normalizedSim).toFixed(4)),
      embeddingPreview: Array.from(nodeVec.slice(0, 12)).map(v => Number(v.toFixed(2)))
    });
  });

  return results.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity).slice(0, topK);
}

/**
 * Computes the in-memory N x N Cosine Similarity Matrix and discovers top unlinked
 * Semantic Bridge Candidates across the Knowledge Graph.
 */
export function computeCosineSimilarityMatrix(
  nodes: GraphNode[],
  links: GraphLink[],
  maxBridges = 6
): CosineMatrixSummary {
  const n = nodes.length;
  if (n === 0) {
    return {
      dimension: EMBEDDING_DIM,
      nodeCount: 0,
      meanSimilarity: 0,
      maxSimilarityPair: null,
      bridgeCandidates: []
    };
  }

  const embeddings = nodes.map(node => generateNodeEmbedding(node));
  const existingEdges = new Set<string>();
  links.forEach(l => {
    const s = typeof l.source === 'string' ? l.source : l.source.id;
    const t = typeof l.target === 'string' ? l.target : l.target.id;
    existingEdges.add(`${s}::${t}`);
    existingEdges.add(`${t}::${s}`);
  });

  let sumSim = 0;
  let pairCount = 0;
  let maxPair: { sourceLabel: string; targetLabel: string; similarity: number } | null = null;
  const candidates: SemanticBridgeCandidate[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const rawSim = computeCosineSimilarity(embeddings[i], embeddings[j]);
      const sim = Number(((rawSim + 1) / 2).toFixed(4));
      sumSim += sim;
      pairCount++;

      if (!maxPair || sim > maxPair.similarity) {
        maxPair = {
          sourceLabel: nodes[i].label,
          targetLabel: nodes[j].label,
          similarity: sim
        };
      }

      const key = `${nodes[i].id}::${nodes[j].id}`;
      if (!existingEdges.has(key)) {
        const resA = nodes[i].quantumResonance ?? nodes[i].strength ?? 0.8;
        const resB = nodes[j].quantumResonance ?? nodes[j].strength ?? 0.8;
        candidates.push({
          sourceNode: nodes[i],
          targetNode: nodes[j],
          cosineSimilarity: sim,
          latentResonanceProduct: Number((sim * Math.sqrt(resA * resB)).toFixed(4))
        });
      }
    }
  }

  candidates.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);

  return {
    dimension: EMBEDDING_DIM,
    nodeCount: n,
    meanSimilarity: pairCount > 0 ? Number((sumSim / pairCount).toFixed(3)) : 0,
    maxSimilarityPair: maxPair,
    bridgeCandidates: candidates.slice(0, maxBridges)
  };
}
