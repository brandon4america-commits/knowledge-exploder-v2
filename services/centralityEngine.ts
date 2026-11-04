import * as d3 from 'd3';
import {
  GraphNode,
  GraphLink,
  SpatialPatternType,
  NodeCentralityMetrics
} from '../types';

export interface CentralityAnalysisResult {
  metrics: Map<string, NodeCentralityMetrics>;
  anchorNode: GraphNode | null;
  sortedByCentrality: GraphNode[];
}

export interface SpatialPatternProjection {
  pattern: SpatialPatternType;
  anchorNodeId: string | null;
  nodeTargets: Map<string, { x: number; y: number; targetR?: number; targetTheta?: number }>;
  guides: CentralitySpatialGuide[];
}

export interface CentralitySpatialGuide {
  id: string;
  type: 'circle' | 'line' | 'rect' | 'path';
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  d?: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  strokeOpacity: number;
  fill?: string;
  fillOpacity?: number;
  label?: string;
  labelX?: number;
  labelY?: number;
}

/**
 * Computes Composite Centrality (Degree, Betweenness via Brandes algorithm, Eigenvector via power iteration)
 * and Geodesic Hop Distance from anchorNodeId for every node.
 */
export function computeCentralityMetrics(
  nodes: GraphNode[],
  links: GraphLink[],
  anchorNodeId?: string | null
): CentralityAnalysisResult {
  const metrics = new Map<string, NodeCentralityMetrics>();
  if (nodes.length === 0) {
    return { metrics, anchorNode: null, sortedByCentrality: [] };
  }

  const n = nodes.length;
  const adj = new Map<string, string[]>();
  const linkWeight = new Map<string, number>();

  nodes.forEach(node => {
    adj.set(node.id, []);
  });

  links.forEach(l => {
    const s = typeof l.source === 'string' ? l.source : l.source.id;
    const t = typeof l.target === 'string' ? l.target : l.target.id;
    if (adj.has(s) && adj.has(t)) {
      adj.get(s)!.push(t);
      adj.get(t)!.push(s);
      const w = l.strength || 0.6;
      linkWeight.set(`${s}__${t}`, w);
      linkWeight.set(`${t}__${s}`, w);
    }
  });

  // 1. Degree Centrality
  const rawDegree = new Map<string, number>();
  nodes.forEach(node => {
    const deg = adj.get(node.id)?.length || 0;
    rawDegree.set(node.id, deg);
  });
  const maxDegree = Math.max(1, ...Array.from(rawDegree.values()));

  // 2. Betweenness Centrality (Brandes Algorithm for unweighted shortest paths)
  const rawBetweenness = new Map<string, number>();
  nodes.forEach(node => rawBetweenness.set(node.id, 0));

  nodes.forEach(sNode => {
    const s = sNode.id;
    const S: string[] = [];
    const P = new Map<string, string[]>();
    const sigma = new Map<string, number>();
    const d = new Map<string, number>();
    const delta = new Map<string, number>();

    nodes.forEach(v => {
      P.set(v.id, []);
      sigma.set(v.id, 0);
      d.set(v.id, -1);
      delta.set(v.id, 0);
    });

    sigma.set(s, 1);
    d.set(s, 0);
    const Q: string[] = [s];

    while (Q.length > 0) {
      const v = Q.shift()!;
      S.push(v);
      const neighbors = adj.get(v) || [];
      for (const w of neighbors) {
        if (d.get(w)! < 0) {
          d.set(w, d.get(v)! + 1);
          Q.push(w);
        }
        if (d.get(w)! === d.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          P.get(w)!.push(v);
        }
      }
    }

    while (S.length > 0) {
      const w = S.pop()!;
      const preds = P.get(w) || [];
      for (const v of preds) {
        const coeff = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
        delta.set(v, delta.get(v)! + coeff);
      }
      if (w !== s) {
        rawBetweenness.set(w, rawBetweenness.get(w)! + delta.get(w)!);
      }
    }
  });

  const maxBetweenness = Math.max(1e-5, ...Array.from(rawBetweenness.values()));

  // 3. Eigenvector Centrality (Power Iteration, 15 rounds)
  let eigen = new Map<string, number>();
  nodes.forEach(node => eigen.set(node.id, (node.strength || 0.6) + 0.1));

  for (let round = 0; round < 15; round++) {
    const nextEigen = new Map<string, number>();
    let norm = 0;

    nodes.forEach(node => {
      const neighbors = adj.get(node.id) || [];
      let sum = (node.strength || 0.5) * 0.2;
      for (const nb of neighbors) {
        const w = linkWeight.get(`${node.id}__${nb}`) || 0.7;
        sum += (eigen.get(nb) || 0) * w;
      }
      nextEigen.set(node.id, sum);
      norm += sum * sum;
    });

    norm = Math.sqrt(norm) || 1;
    nodes.forEach(node => {
      eigen.set(node.id, (nextEigen.get(node.id) || 0) / norm);
    });
  }

  const maxEigen = Math.max(1e-5, ...Array.from(eigen.values()));

  // 4. Determine Anchor Node: use selected anchor or the highest-centrality node
  let anchorNode: GraphNode | null = null;
  if (anchorNodeId) {
    anchorNode = nodes.find(nd => nd.id === anchorNodeId) || null;
  }
  if (!anchorNode) {
    // Pick node with highest degree * strength
    anchorNode = [...nodes].sort((a, b) => {
      const scoreA = (rawDegree.get(a.id) || 0) * (a.strength || 0.5);
      const scoreB = (rawDegree.get(b.id) || 0) * (b.strength || 0.5);
      return scoreB - scoreA;
    })[0] || null;
  }

  // 5. Compute BFS Shortest Path Hop Distance from Anchor Node
  const hopDistances = new Map<string, number>();
  if (anchorNode) {
    const queue: string[] = [anchorNode.id];
    hopDistances.set(anchorNode.id, 0);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const currDist = hopDistances.get(curr)!;
      const neighbors = adj.get(curr) || [];
      for (const nb of neighbors) {
        if (!hopDistances.has(nb)) {
          hopDistances.set(nb, currDist + 1);
          queue.push(nb);
        }
      }
    }
  }

  // Disconnected fallback: depth + 2
  nodes.forEach(node => {
    if (!hopDistances.has(node.id)) {
      hopDistances.set(node.id, Math.max(1, (node.depth || 1) + 1));
    }
  });

  // 6. Build Composite Score & Rank
  const computedList: Array<{ node: GraphNode; compositeScore: number; degNorm: number; betwNorm: number; eigNorm: number; hops: number }> = [];

  nodes.forEach(node => {
    const degNorm = (rawDegree.get(node.id) || 0) / maxDegree;
    const betwNorm = (rawBetweenness.get(node.id) || 0) / maxBetweenness;
    const eigNorm = (eigen.get(node.id) || 0) / maxEigen;
    // Composite: 35% Degree + 35% Betweenness + 30% Eigenvector
    const compositeScore = Number((0.35 * degNorm + 0.35 * betwNorm + 0.30 * eigNorm).toFixed(4));
    const hops = hopDistances.get(node.id) || 0;
    computedList.push({ node, compositeScore, degNorm, betwNorm, eigNorm, hops });
  });

  // Sort descending by compositeScore
  computedList.sort((a, b) => b.compositeScore - a.compositeScore);

  computedList.forEach((item, index) => {
    const rank = index + 1;
    const quartileFraction = index / Math.max(1, n);
    let quartileTier: 1 | 2 | 3 | 4 = 4;
    if (quartileFraction < 0.25) quartileTier = 1;
    else if (quartileFraction < 0.50) quartileTier = 2;
    else if (quartileFraction < 0.75) quartileTier = 3;

    metrics.set(item.node.id, {
      nodeId: item.node.id,
      degreeCentrality: Number(item.degNorm.toFixed(3)),
      betweennessCentrality: Number(item.betwNorm.toFixed(3)),
      eigenvectorCentrality: Number(item.eigNorm.toFixed(3)),
      compositeScore: item.compositeScore,
      hopDistanceFromAnchor: item.hops,
      centralityRank: rank,
      quartileTier
    });
  });

  return {
    metrics,
    anchorNode,
    sortedByCentrality: computedList.map(c => c.node)
  };
}

/**
 * Computes target coordinates (x, y) and SVG coordinate guides for the 5 spatial patterns:
 * - RADIAL: Concentric rings by BFS hop distance, sorted by composite centrality
 * - TREE: Rooted BFS hierarchy from selected anchor node downward
 * - GRID: Orthogonal matrix ordered by composite centrality with anchor at center
 * - SPIRAL: Fermat / Fibonacci golden-angle spiral outward from anchor node
 * - BIPARTITE: 4 vertical columns representing centrality quartiles
 */
export function computeCentralitySpatialProjection(
  pattern: SpatialPatternType,
  nodes: GraphNode[],
  links: GraphLink[],
  anchorNodeId: string | null,
  width: number,
  height: number
): SpatialPatternProjection {
  const safeW = Math.max(640, width || 1200);
  const safeH = Math.max(480, height || 800);
  const cx = safeW / 2;
  const cy = safeH / 2;

  const nodeTargets = new Map<string, { x: number; y: number; targetR?: number; targetTheta?: number }>();
  const guides: CentralitySpatialGuide[] = [];

  if (pattern === 'FORCE_DEFAULT' || nodes.length === 0) {
    return { pattern, anchorNodeId, nodeTargets, guides };
  }

  const analysis = computeCentralityMetrics(nodes, links, anchorNodeId);
  const anchor = analysis.anchorNode;
  const effectiveAnchorId = anchor?.id || null;

  // =========================================================================
  // 1. CENTRALITY_RADIAL: Concentric Rings by Hop Distance & Centrality
  // =========================================================================
  if (pattern === 'CENTRALITY_RADIAL') {
    // Group nodes by hop distance
    const hopGroups = new Map<number, GraphNode[]>();
    nodes.forEach(node => {
      const m = analysis.metrics.get(node.id);
      const h = m?.hopDistanceFromAnchor ?? 1;
      if (!hopGroups.has(h)) hopGroups.set(h, []);
      hopGroups.get(h)!.push(node);
    });

    const maxHops = Math.max(1, ...Array.from(hopGroups.keys()));
    const maxRadius = Math.min(safeW, safeH) * 0.42;
    const ringSpacing = Math.max(90, maxRadius / maxHops);

    // Anchor node is at center (0, 0)
    if (anchor) {
      nodeTargets.set(anchor.id, { x: cx, y: cy, targetR: 0, targetTheta: 0 });
    }

    // Concentric ring guides
    for (let h = 1; h <= maxHops; h++) {
      const r = h * ringSpacing;
      guides.push({
        id: `radial-guide-ring-${h}`,
        type: 'circle',
        cx,
        cy,
        r,
        stroke: h === 1 ? '#06b6d4' : '#38bdf8',
        strokeWidth: h === 1 ? 1.5 : 1,
        strokeDasharray: h === 1 ? '4,4' : '6,6',
        strokeOpacity: 0.35,
        fill: '#06b6d4',
        fillOpacity: 0.02,
        label: `HOP 0${h} RING · ${Math.round(r)}px`,
        labelX: cx,
        labelY: cy - r - 8
      });
    }

    // Radial axes
    [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach((ang, idx) => {
      const outerR = maxHops * ringSpacing + 25;
      guides.push({
        id: `radial-axis-${idx}`,
        type: 'line',
        x1: cx - Math.cos(ang) * outerR,
        y1: cy - Math.sin(ang) * outerR,
        x2: cx + Math.cos(ang) * outerR,
        y2: cy + Math.sin(ang) * outerR,
        stroke: '#1e293b',
        strokeWidth: 1,
        strokeOpacity: 0.55
      });
    });

    // Distribute nodes along each ring, sorted by composite centrality
    hopGroups.forEach((groupNodes, hop) => {
      if (hop === 0 && anchor) return;
      // Sort by descending compositeScore
      groupNodes.sort((a, b) => {
        const scA = analysis.metrics.get(a.id)?.compositeScore || 0;
        const scB = analysis.metrics.get(b.id)?.compositeScore || 0;
        return scB - scA;
      });

      const r = hop * ringSpacing;
      const count = groupNodes.length;
      groupNodes.forEach((node, idx) => {
        // Offset starting angle per hop to stagger nodes
        const startOffset = (hop * Math.PI) / 4;
        const theta = startOffset + (2 * Math.PI * idx) / count;
        const nx = cx + Math.cos(theta) * r;
        const ny = cy + Math.sin(theta) * r;
        nodeTargets.set(node.id, { x: nx, y: ny, targetR: r, targetTheta: theta });
      });
    });

    return { pattern, anchorNodeId: effectiveAnchorId, nodeTargets, guides };
  }

  // =========================================================================
  // 2. CENTRALITY_TREE: Hierarchical Rooted Tree / DAG from Selected Root
  // =========================================================================
  if (pattern === 'CENTRALITY_TREE') {
    // Stratify by hop distance from anchor (Level 0 = anchor)
    const levelGroups = new Map<number, GraphNode[]>();
    nodes.forEach(node => {
      const m = analysis.metrics.get(node.id);
      const h = m?.hopDistanceFromAnchor ?? 0;
      if (!levelGroups.has(h)) levelGroups.set(h, []);
      levelGroups.get(h)!.push(node);
    });

    const maxLevel = Math.max(1, ...Array.from(levelGroups.keys()));
    const usableW = Math.max(680, safeW * 0.85);
    const usableH = Math.max(440, safeH * 0.76);
    const startY = cy - usableH / 2;
    const levelSpacing = usableH / maxLevel;

    // Horizontal level guides
    for (let lvl = 0; lvl <= maxLevel; lvl++) {
      const ly = startY + lvl * levelSpacing;
      guides.push({
        id: `tree-level-rail-${lvl}`,
        type: 'line',
        x1: cx - usableW / 2,
        y1: ly,
        x2: cx + usableW / 2,
        y2: ly,
        stroke: lvl === 0 ? '#f59e0b' : '#334155',
        strokeWidth: lvl === 0 ? 1.5 : 1,
        strokeDasharray: '4,4',
        strokeOpacity: 0.45,
        label: lvl === 0 ? `TREE ROOT LEVEL (ANCHOR: ${anchor?.label || 'ROOT'})` : `HIERARCHICAL LEVEL 0${lvl}`,
        labelX: cx - usableW / 2 + 12,
        labelY: ly - 6
      });
    }

    levelGroups.forEach((groupNodes, lvl) => {
      // Sort nodes in each level by descending compositeScore
      groupNodes.sort((a, b) => {
        const scA = analysis.metrics.get(a.id)?.compositeScore || 0;
        const scB = analysis.metrics.get(b.id)?.compositeScore || 0;
        return scB - scA;
      });

      const ly = startY + lvl * levelSpacing;
      const count = groupNodes.length;
      const slotW = usableW / Math.max(1, count + 1);

      groupNodes.forEach((node, idx) => {
        const nx = (cx - usableW / 2) + (idx + 1) * slotW;
        nodeTargets.set(node.id, { x: nx, y: ly });
      });
    });

    return { pattern, anchorNodeId: effectiveAnchorId, nodeTargets, guides };
  }

  // =========================================================================
  // 3. CENTRALITY_GRID: Orthogonal Matrix Sorted by Composite Centrality
  // =========================================================================
  if (pattern === 'CENTRALITY_GRID') {
    const sorted = [...analysis.sortedByCentrality];
    // Put anchor node in the center of the list
    if (anchor) {
      const anchorIdx = sorted.findIndex(n => n.id === anchor.id);
      if (anchorIdx > -1) {
        sorted.splice(anchorIdx, 1);
        const midIdx = Math.floor(sorted.length / 2);
        sorted.splice(midIdx, 0, anchor);
      }
    }

    const n = sorted.length;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const usableW = Math.min(safeW * 0.8, cols * 140);
    const usableH = Math.min(safeH * 0.75, rows * 110);
    const cellW = usableW / Math.max(1, cols);
    const cellH = usableH / Math.max(1, rows);
    const startX = cx - (cols * cellW) / 2 + cellW / 2;
    const startY = cy - (rows * cellH) / 2 + cellH / 2;

    // Outer grid bounding rect guide
    guides.push({
      id: 'grid-bounding-box',
      type: 'rect',
      x: cx - (cols * cellW) / 2,
      y: cy - (rows * cellH) / 2,
      width: cols * cellW,
      height: rows * cellH,
      stroke: '#06b6d4',
      strokeWidth: 1.2,
      strokeDasharray: '6,6',
      strokeOpacity: 0.35,
      fill: '#020617',
      fillOpacity: 0.15,
      label: `CENTRALITY MATRIX · ${cols}×${rows} CELLS`,
      labelX: cx - (cols * cellW) / 2 + 10,
      labelY: cy - (rows * cellH) / 2 - 8
    });

    // Column grid lines
    for (let c = 1; c < cols; c++) {
      const gx = cx - (cols * cellW) / 2 + c * cellW;
      guides.push({
        id: `grid-col-line-${c}`,
        type: 'line',
        x1: gx,
        y1: cy - (rows * cellH) / 2,
        x2: gx,
        y2: cy + (rows * cellH) / 2,
        stroke: '#1e293b',
        strokeWidth: 1,
        strokeOpacity: 0.4
      });
    }

    // Row grid lines
    for (let r = 1; r < rows; r++) {
      const gy = cy - (rows * cellH) / 2 + r * cellH;
      guides.push({
        id: `grid-row-line-${r}`,
        type: 'line',
        x1: cx - (cols * cellW) / 2,
        y1: gy,
        x2: cx + (cols * cellW) / 2,
        y2: gy,
        stroke: '#1e293b',
        strokeWidth: 1,
        strokeOpacity: 0.4
      });
    }

    sorted.forEach((node, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const nx = startX + col * cellW;
      const ny = startY + row * cellH;
      nodeTargets.set(node.id, { x: nx, y: ny });
    });

    return { pattern, anchorNodeId: effectiveAnchorId, nodeTargets, guides };
  }

  // =========================================================================
  // 4. CENTRALITY_SPIRAL: Fibonacci Golden-Angle Spiral from Anchor
  // =========================================================================
  if (pattern === 'CENTRALITY_SPIRAL') {
    const sorted = [...analysis.sortedByCentrality];
    if (anchor) {
      const anchorIdx = sorted.findIndex(n => n.id === anchor.id);
      if (anchorIdx > -1) {
        sorted.splice(anchorIdx, 1);
        sorted.unshift(anchor); // Anchor at origin
      }
    }

    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
    const maxRadius = Math.min(safeW, safeH) * 0.42;
    const cScale = maxRadius / Math.sqrt(Math.max(1, sorted.length));

    // Anchor node at origin
    nodeTargets.set(sorted[0].id, { x: cx, y: cy, targetR: 0, targetTheta: 0 });

    // Build spiral trajectory guide path
    const spiralPts: Array<[number, number]> = [[cx, cy]];
    sorted.forEach((node, idx) => {
      if (idx === 0) return;
      const r = cScale * Math.sqrt(idx);
      const theta = idx * goldenAngle;
      const nx = cx + Math.cos(theta) * r;
      const ny = cy + Math.sin(theta) * r;
      nodeTargets.set(node.id, { x: nx, y: ny, targetR: r, targetTheta: theta });
      spiralPts.push([nx, ny]);
    });

    // Continuous spiral spline guide
    const lineGen = d3.line<[number, number]>().curve(d3.curveCatmullRom.alpha(0.5));
    const spiralPath = lineGen(spiralPts) || '';

    guides.push({
      id: 'fibonacci-spiral-track',
      type: 'path',
      d: spiralPath,
      stroke: '#06b6d4',
      strokeWidth: 1.2,
      strokeDasharray: '5,5',
      strokeOpacity: 0.4,
      fill: 'none',
      label: 'FIBONACCI GOLDEN-RATIO LATTICE (137.5°)',
      labelX: cx + 20,
      labelY: cy - 14
    });

    return { pattern, anchorNodeId: effectiveAnchorId, nodeTargets, guides };
  }

  // =========================================================================
  // 5. CENTRALITY_BIPARTITE: Multi-Tier Centrality Quartile Strata
  // =========================================================================
  if (pattern === 'CENTRALITY_BIPARTITE') {
    const qGroups = new Map<1 | 2 | 3 | 4, GraphNode[]>([
      [1, []],
      [2, []],
      [3, []],
      [4, []]
    ]);

    nodes.forEach(node => {
      const m = analysis.metrics.get(node.id);
      const tier = m?.quartileTier || 4;
      qGroups.get(tier)!.push(node);
    });

    const usableW = Math.max(680, safeW * 0.82);
    const usableH = Math.max(440, safeH * 0.72);
    const startX = cx - usableW / 2;
    const colSpacing = usableW / 3;

    const tierSpecs: Array<{ tier: 1 | 2 | 3 | 4; label: string; color: string; desc: string }> = [
      { tier: 1, label: 'TIER 1 · CORE HUBS', color: '#06b6d4', desc: 'Apex Centrality & Anchor' },
      { tier: 2, label: 'TIER 2 · BRIDGE VECTORS', color: '#10b981', desc: 'High Betweenness' },
      { tier: 3, label: 'TIER 3 · OPERATIONAL MESH', color: '#f59e0b', desc: 'Medium Connectivity' },
      { tier: 4, label: 'TIER 4 · PERIPHERAL FRONTIER', color: '#8b5cf6', desc: 'Frontier Vectors' }
    ];

    tierSpecs.forEach((spec, colIdx) => {
      const colX = startX + colIdx * colSpacing;
      const groupNodes = qGroups.get(spec.tier) || [];

      // Sort nodes in each column by composite score
      groupNodes.sort((a, b) => {
        const scA = analysis.metrics.get(a.id)?.compositeScore || 0;
        const scB = analysis.metrics.get(b.id)?.compositeScore || 0;
        return scB - scA;
      });

      // Column container guide
      guides.push({
        id: `quartile-lane-${spec.tier}`,
        type: 'rect',
        x: colX - 70,
        y: cy - usableH / 2 - 36,
        width: 140,
        height: usableH + 72,
        stroke: spec.color,
        strokeWidth: 1.2,
        strokeDasharray: '4,4',
        strokeOpacity: 0.5,
        fill: spec.color,
        fillOpacity: 0.04,
        label: spec.label,
        labelX: colX,
        labelY: cy - usableH / 2 - 44
      });

      const count = groupNodes.length;
      groupNodes.forEach((node, rowIdx) => {
        const ny = count === 1
          ? cy
          : (cy - usableH / 2) + (rowIdx / (count - 1)) * usableH;
        nodeTargets.set(node.id, { x: colX, y: ny });
      });
    });

    return { pattern, anchorNodeId: effectiveAnchorId, nodeTargets, guides };
  }

  return { pattern, anchorNodeId: effectiveAnchorId, nodeTargets, guides };
}
