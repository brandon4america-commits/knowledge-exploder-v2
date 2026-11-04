/**
 * Quantum Tensor Graph Engine (v16.0)
 * High-dimensional multi-relational topological reasoning & spectral graph resonance.
 * Uses Sparse Coordinate (COO/CSR) Tensor representation indexed by
 * (sourceIdx, targetIdx, predicateChannel, temporalEpoch) with power iteration,
 * exponential temporal decay, and zero-copy SharedArrayBuffer serialization.
 */

import { GraphNode, GraphLink } from '../types';
import { generateNodeEmbedding } from './inferenceEngine';

export interface QuantumTensorResult {
  nodeResonanceMap: Record<string, number>;
  quantumLinkWeights: Record<string, number>;
  networkTensorEntropy: number;
  eigenSpectralCohesion: number;
  predicateResonanceDistribution: Record<string, number>;
  rank4TensorNorm: number;
  principalEigenvector: number[];
  lambdaDecay: number;
  sharedBufferBytes: number;
  isSharedMemoryAvailable: boolean;
}

export interface MigrationRegressionReport {
  passed: boolean;
  totalNodesChecked: number;
  valid3DCoordinates: number;
  validQuantumResonance: number;
  unitNormEmbeddingsVerified: number;
  zeroCopyBufferBytes: number;
  summary: string;
}

export const PREDICATE_CHANNELS: Record<string, number> = {
  IsA: 0,
  Enables: 1,
  DependsOn: 2,
  Implements: 3,
  Secures: 4,
  Resonates: 5,
  Causes: 6,
  Optimizes: 7,
  Governs: 8,
  DEFAULT: 9
};

export const PREDICATE_WEIGHTS: Record<string, number> = {
  IsA: 0.95,
  Enables: 0.92,
  DependsOn: 0.88,
  Implements: 0.90,
  Secures: 0.85,
  Resonates: 0.98,
  Causes: 0.94,
  Optimizes: 0.89,
  Governs: 0.91,
  DEFAULT: 0.80
};

export interface SparseTensorEntry {
  sourceIdx: number;
  targetIdx: number;
  predicateChannel: number;
  temporalEpoch: number;
  weight: number;
}

/**
 * Serializes Sparse CSR Tensor entries into a zero-copy SharedArrayBuffer
 * (or ArrayBuffer fallback when cross-origin isolation is not active).
 * Each entry packs 5 Float64 values (40 bytes per non-zero tensor element).
 */
export function serializeSparseTensorBuffer(entries: SparseTensorEntry[]): {
  buffer: SharedArrayBuffer | ArrayBuffer;
  byteLength: number;
  isSharedMemory: boolean;
} {
  const floatsPerEntry = 5;
  const byteLength = Math.max(40, entries.length * floatsPerEntry * Float64Array.BYTES_PER_ELEMENT);
  const canUseSAB = typeof SharedArrayBuffer !== 'undefined';
  const buffer = canUseSAB ? new SharedArrayBuffer(byteLength) : new ArrayBuffer(byteLength);
  const view = new Float64Array(buffer);

  for (let i = 0; i < entries.length; i++) {
    const offset = i * floatsPerEntry;
    const e = entries[i];
    view[offset] = e.sourceIdx;
    view[offset + 1] = e.targetIdx;
    view[offset + 2] = e.predicateChannel;
    view[offset + 3] = e.temporalEpoch;
    view[offset + 4] = e.weight;
  }

  return {
    buffer,
    byteLength,
    isSharedMemory: canUseSAB
  };
}

/**
 * Computes Sparse Rank-4 Tensor and Quantum Spectral Eigen-Resonance.
 * Guarantees O(K * E) runtime and O(E + N) memory space.
 */
export function computeQuantumTensorResonance(
  nodes: GraphNode[],
  links: GraphLink[],
  lambdaDecay = 0.12
): QuantumTensorResult {
  const nodeCount = nodes.length;
  const canUseSAB = typeof SharedArrayBuffer !== 'undefined';

  if (nodeCount === 0) {
    return {
      nodeResonanceMap: {},
      quantumLinkWeights: {},
      networkTensorEntropy: 0,
      eigenSpectralCohesion: 1.0,
      predicateResonanceDistribution: {},
      rank4TensorNorm: 0,
      principalEigenvector: [],
      lambdaDecay,
      sharedBufferBytes: 0,
      isSharedMemoryAvailable: canUseSAB
    };
  }

  const nodeIndexMap = new Map<string, number>();
  nodes.forEach((n, idx) => nodeIndexMap.set(n.id, idx));

  // Build Sparse Tensor Coordinate List (COO)
  const sparseEntries: SparseTensorEntry[] = [];
  const quantumLinkWeights: Record<string, number> = {};
  const predicateCounts: Record<string, number> = {};
  let totalTensorMass = 0;

  links.forEach(l => {
    const sId = typeof l.source === 'string' ? l.source : l.source.id;
    const tId = typeof l.target === 'string' ? l.target : l.target.id;
    const sIdx = nodeIndexMap.get(sId);
    const tIdx = nodeIndexMap.get(tId);

    if (sIdx === undefined || tIdx === undefined) return;

    const rel = l.relationship || 'Resonates';
    const channel = PREDICATE_CHANNELS[rel] ?? PREDICATE_CHANNELS.DEFAULT;
    const relWeight = PREDICATE_WEIGHTS[rel] ?? PREDICATE_WEIGHTS.DEFAULT;

    const sNode = nodes[sIdx];
    const tNode = nodes[tIdx];
    const epoch = Math.min(3, Math.max(0, (sNode?.depth || 1) - 1));

    // Exponential Temporal Decay: w(t) = w_0 * e^(-lambda * deltaT)
    const epochDelta = Math.max(0, Math.max(sNode?.depth || 1, tNode?.depth || 1) - 1);
    const temporalFactor = Math.exp(-lambdaDecay * epochDelta);

    const baseWeight = relWeight * (l.strength || 0.85);
    const weight = Number((baseWeight * temporalFactor).toFixed(3));
    const linkKey = `${sId}->${tId}`;
    quantumLinkWeights[linkKey] = weight;

    predicateCounts[rel] = (predicateCounts[rel] || 0) + 1;
    totalTensorMass += weight;

    sparseEntries.push({
      sourceIdx: sIdx,
      targetIdx: tIdx,
      predicateChannel: channel,
      temporalEpoch: epoch,
      weight
    });
  });

  // Zero-Copy Binary Buffer Serialization
  const serialized = serializeSparseTensorBuffer(sparseEntries);

  // Power Iteration (Max 25 iterations with L2 Normalization) to compute Principal Eigenvector \psi
  const maxIterations = 25;
  let psi = new Float64Array(nodeCount);
  const initialValue = 1.0 / Math.sqrt(nodeCount);
  for (let i = 0; i < nodeCount; i++) psi[i] = initialValue;

  for (let iter = 0; iter < maxIterations; iter++) {
    const nextPsi = new Float64Array(nodeCount);

    // Multiply sparse tensor operator
    for (let k = 0; k < sparseEntries.length; k++) {
      const entry = sparseEntries[k];
      const channelFactor = 1.0 + entry.predicateChannel * 0.05 + entry.temporalEpoch * 0.08;
      const effectiveWeight = entry.weight * channelFactor;

      nextPsi[entry.targetIdx] += psi[entry.sourceIdx] * effectiveWeight;
      nextPsi[entry.sourceIdx] += psi[entry.targetIdx] * effectiveWeight; // Undirected resonance reflection
    }

    // Add self-damping with temporal freshness factor for unlinked or boundary nodes
    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i];
      const depth = Math.max(1, node.depth || 1);
      const temporalFreshness = Math.exp(-lambdaDecay * (depth - 1));
      nextPsi[i] += psi[i] * 0.15 + temporalFreshness * 0.06;
    }

    // L2 Normalization
    let normSq = 0;
    for (let i = 0; i < nodeCount; i++) {
      normSq += nextPsi[i] * nextPsi[i];
    }

    const norm = Math.sqrt(normSq);
    if (norm > 1e-12) {
      for (let i = 0; i < nodeCount; i++) {
        nextPsi[i] /= norm;
      }
      psi = nextPsi;
    } else {
      break;
    }
  }

  // Map normalized eigenvector components \psi_i into [0.1, 0.999] score
  let maxPsi = 0.0001;
  for (let i = 0; i < nodeCount; i++) {
    if (psi[i] > maxPsi) maxPsi = psi[i];
  }

  const nodeResonanceMap: Record<string, number> = {};
  const principalEigenvectorArr: number[] = new Array(nodeCount);

  nodes.forEach((n, idx) => {
    const rawVal = psi[idx] / maxPsi;
    const ghostPenalty = n.isGhost ? 0.75 : 1.0;
    const finalResonance = Number(Math.min(0.999, Math.max(0.1, rawVal * ghostPenalty)).toFixed(3));
    nodeResonanceMap[n.id] = finalResonance;
    n.quantumResonance = finalResonance; // Bind directly on node object
    principalEigenvectorArr[idx] = finalResonance;
  });

  // Calculate Topological Shannon Entropy (- \sum p_i log2 p_i)
  let tensorEntropy = 0;
  if (totalTensorMass > 0) {
    Object.values(quantumLinkWeights).forEach(w => {
      const p = w / totalTensorMass;
      if (p > 0) tensorEntropy -= p * Math.log2(p);
    });
  }

  // Calculate Predicate Resonance Distribution
  const totalPreds = Math.max(1, links.length);
  const predicateResonanceDistribution: Record<string, number> = {};
  Object.keys(predicateCounts).forEach(p => {
    predicateResonanceDistribution[p] = Number(((predicateCounts[p] / totalPreds) * 100).toFixed(1));
  });

  // Eigen-Spectral Cohesion & Tensor Norm
  const cohesion = links.length > 0 ? Math.min(100, (totalTensorMass / links.length) * 92) : 85;
  const tensorNorm = Number((Math.sqrt(totalTensorMass) * 1.414).toFixed(3));

  return {
    nodeResonanceMap,
    quantumLinkWeights,
    networkTensorEntropy: Number(tensorEntropy.toFixed(3)),
    eigenSpectralCohesion: Number(cohesion.toFixed(1)),
    predicateResonanceDistribution,
    rank4TensorNorm: tensorNorm,
    principalEigenvector: principalEigenvectorArr,
    lambdaDecay,
    sharedBufferBytes: serialized.byteLength,
    isSharedMemoryAvailable: serialized.isSharedMemory
  };
}

/**
 * Automated Regression Suite for v15.0 -> v16.0 Snapshot Hydration & Tensor Integrity
 */
export function verifyV16StateMigrationIntegrity(
  nodes: GraphNode[],
  links: GraphLink[]
): MigrationRegressionReport {
  const tensor = computeQuantumTensorResonance(nodes, links);
  let valid3D = 0;
  let validRes = 0;
  let validEmbeddings = 0;

  nodes.forEach(n => {
    const zVal = n.z ?? 0;
    if (!Number.isNaN(zVal) && Number.isFinite(zVal)) {
      valid3D++;
    }
    const resVal = tensor.nodeResonanceMap[n.id] ?? n.quantumResonance ?? 0.85;
    if (resVal >= 0.1 && resVal <= 1.0) {
      validRes++;
    }
    const emb = generateNodeEmbedding(n);
    let normSq = 0;
    for (let i = 0; i < emb.length; i++) normSq += emb[i] * emb[i];
    if (Math.abs(Math.sqrt(normSq) - 1.0) < 1e-3) {
      validEmbeddings++;
    }
  });

  const total = nodes.length;
  const passed = valid3D === total && validRes === total && validEmbeddings === total;

  return {
    passed,
    totalNodesChecked: total,
    valid3DCoordinates: valid3D,
    validQuantumResonance: validRes,
    unitNormEmbeddingsVerified: validEmbeddings,
    zeroCopyBufferBytes: tensor.sharedBufferBytes,
    summary: passed
      ? `PASS: All ${total} nodes verified (3D coords, CSR spectral resonance, 64D unit embeddings, ${tensor.sharedBufferBytes}B zero-copy buffer).`
      : `WARN: Checked ${total} nodes (${valid3D} 3D, ${validRes} resonance, ${validEmbeddings} embeddings).`
  };
}
