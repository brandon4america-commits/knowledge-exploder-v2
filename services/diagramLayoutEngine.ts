import * as d3 from 'd3';
import {
  GraphNode,
  GraphLink,
  KnowledgeContinent,
  DiagramParadigm,
  DiagramParadigmSpec
} from '../types';

export const DIAGRAM_PARADIGM_SPECS: DiagramParadigmSpec[] = [
  {
    id: 'FORCE_CONTINENTS',
    shortLabel: 'Force Continents',
    fullName: 'Force-Directed Knowledge Continents',
    wikiCategoryRef: 'Force-directed graph drawing · Euler & Topographic Cluster Map',
    wikiUrl: 'https://en.wikipedia.org/wiki/Force-directed_graph_drawing',
    invariant: 'Energy-minimized spring-electrical equilibrium with centroid gravity',
    encodingRule: 'Shared relationship archetypes form organic Catmull-Rom continental hulls'
  },
  {
    id: 'HOLOGRAPHIC_3D',
    shortLabel: '3D Spatial',
    fullName: 'Holographic 3D Spatial Manifold',
    wikiCategoryRef: '3D Computer Graphics · WebGL & Quantum Spectral Spatial Forces',
    wikiUrl: 'https://en.wikipedia.org/wiki/Spectral_graph_theory',
    invariant: 'Rank-4 Tensor Adjacency Projection in 3D Euclidean Space',
    encodingRule: 'Instanced emissive spheres with animated photon beam particle pulses'
  },
  {
    id: 'RADIAL_DENDROGRAM',
    shortLabel: 'Radial Tree',
    fullName: 'Hierarchical Tree & Radial Dendrogram',
    wikiCategoryRef: 'Dendrogram · Radial tree · Phylogenetic & Taxonomic Diagrams',
    wikiUrl: 'https://en.wikipedia.org/wiki/Dendrogram',
    invariant: 'Concentric polar strata r = depth · ΔR with non-crossing angular sectors',
    encodingRule: 'Root concept at origin (r=0); epistemic descendants radiate along polar steps'
  },
  {
    id: 'CHORD_WHEEL',
    shortLabel: 'Chord Wheel',
    fullName: 'Circular Chord & Dependency Wheel',
    wikiCategoryRef: 'Chord diagram (information visualization) · Dependency Graph',
    wikiUrl: 'https://en.wikipedia.org/wiki/Chord_diagram_(information_visualization)',
    invariant: '2π circular perimeter partitioned by Knowledge Continent arc length',
    encodingRule: 'Inner tensioned Bézier chords encode cross-continent synaptic coupling'
  },
  {
    id: 'VORONOI_EULER',
    shortLabel: 'Voronoi / Euler',
    fullName: 'Voronoi Territory & Euler Set Map',
    wikiCategoryRef: 'Voronoi diagram · Euler diagram · Spatial Partitioning',
    wikiUrl: 'https://en.wikipedia.org/wiki/Voronoi_diagram',
    invariant: 'Nearest-neighbor metric tessellation R_k = {x : d(x, p_k) ≤ d(x, p_j)}',
    encodingRule: 'Polygonal cells partition latent space into continental Euler territories'
  },
  {
    id: 'LAYERED_DAG',
    shortLabel: 'Layered DAG',
    fullName: 'Layered Flowchart & Directed Acyclic Graph',
    wikiCategoryRef: 'Layered graph drawing (Sugiyama) · Flowchart · Directed acyclic graph',
    wikiUrl: 'https://en.wikipedia.org/wiki/Layered_graph_drawing',
    invariant: 'Monotonic horizontal rank stratification by epistemic depth tier',
    encodingRule: 'Left-to-right causal flow columns connected by cubic S-curve pathways'
  },
  {
    id: 'SANKEY_FLOW',
    shortLabel: 'Sankey Flow',
    fullName: 'Sankey Flow & Alluvial Pathway Diagram',
    wikiCategoryRef: 'Sankey diagram · Alluvial diagram · Flow visualization',
    wikiUrl: 'https://en.wikipedia.org/wiki/Sankey_diagram',
    invariant: 'Conservation of conceptual flux across multi-stage vertical strata',
    encodingRule: 'Node bar height and translucent alluvial ribbon width scale with synaptic flux'
  }
];

export interface DiagramNodeProjection {
  x: number;
  y: number;
  angle?: number;
  radius?: number;
  rank?: number;
  barHeight?: number;
  color: string;
}

export interface DiagramGuideElement {
  id: string;
  type: 'path' | 'circle' | 'rect' | 'line';
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  strokeOpacity: number;
  fill: string;
  fillOpacity: number;
  label?: string;
  subLabel?: string;
  labelX?: number;
  labelY?: number;
  continentId?: string;
}

export interface DiagramLinkProjection {
  key: string;
  d: string;
  stroke: string;
  strokeWidth: number;
  isRibbon?: boolean;
  fill?: string;
  fillOpacity?: number;
  labelX: number;
  labelY: number;
}

export interface DiagramProjectionResult {
  paradigm: DiagramParadigm;
  nodeTargets: Map<string, DiagramNodeProjection>;
  guides: DiagramGuideElement[];
  links: Map<string, DiagramLinkProjection>;
}

const CONTINENT_COLORS: Record<string, string> = {
  IsA: '#06b6d4',
  PartOf: '#10b981',
  DependsOn: '#f59e0b',
  Uses: '#3b82f6',
  Enables: '#8b5cf6',
  Influences: '#ec4899',
  Extends: '#14b8a6',
  Implements: '#6366f1',
  Secures: '#eab308',
  Optimizes: '#22c55e',
  Governs: '#f43f5e'
};

const FALLBACK_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

function getNodeColor(node: GraphNode, continents: KnowledgeContinent[]): string {
  if (node.continentId && CONTINENT_COLORS[node.continentId]) {
    return CONTINENT_COLORS[node.continentId];
  }
  const found = continents.find(c => c.id === node.continentId);
  if (found) return found.color;
  return FALLBACK_COLORS[Math.abs(node.group || 0) % FALLBACK_COLORS.length];
}

function getLinkKey(l: GraphLink): string {
  const s = typeof l.source === 'string' ? l.source : l.source.id;
  const t = typeof l.target === 'string' ? l.target : l.target.id;
  return `${s}-${t}`;
}

export function computeDiagramProjection(
  nodes: GraphNode[],
  links: GraphLink[],
  continents: KnowledgeContinent[],
  width: number,
  height: number,
  paradigm: DiagramParadigm
): DiagramProjectionResult {
  const safeW = Math.max(640, width || 1200);
  const safeH = Math.max(480, height || 800);
  const cx = safeW / 2;
  const cy = safeH / 2;

  const nodeTargets = new Map<string, DiagramNodeProjection>();
  const guides: DiagramGuideElement[] = [];
  const projectedLinks = new Map<string, DiagramLinkProjection>();

  if (nodes.length === 0 || paradigm === 'FORCE_CONTINENTS') {
    return { paradigm, nodeTargets, guides, links: projectedLinks };
  }

  // Helper adjacency & degree map
  const degreeMap = new Map<string, number>();
  const adj = new Map<string, string[]>();
  nodes.forEach(n => {
    degreeMap.set(n.id, 0);
    adj.set(n.id, []);
  });

  links.forEach(l => {
    const s = typeof l.source === 'string' ? l.source : l.source.id;
    const t = typeof l.target === 'string' ? l.target : l.target.id;
    if (degreeMap.has(s) && degreeMap.has(t)) {
      degreeMap.set(s, (degreeMap.get(s) || 0) + 1);
      degreeMap.set(t, (degreeMap.get(t) || 0) + 1);
      adj.get(s)!.push(t);
      adj.get(t)!.push(s);
    }
  });

  // =========================================================================
  // 1. RADIAL DENDROGRAM (Hierarchical Polar Tree)
  // =========================================================================
  if (paradigm === 'RADIAL_DENDROGRAM') {
    // Identify primary root (lowest depth & highest degree)
    const sortedForRoot = [...nodes].sort((a, b) => {
      const da = a.depth ?? 1;
      const db = b.depth ?? 1;
      if (da !== db) return da - db;
      return (degreeMap.get(b.id) || 0) - (degreeMap.get(a.id) || 0);
    });

    const rootNode = sortedForRoot[0];
    const bfsDepth = new Map<string, number>();
    const parentMap = new Map<string, string>();
    const childrenMap = new Map<string, string[]>();
    nodes.forEach(n => childrenMap.set(n.id, []));

    const queue: string[] = [rootNode.id];
    bfsDepth.set(rootNode.id, 0);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const currDepth = bfsDepth.get(curr) || 0;
      const neighbors = adj.get(curr) || [];
      neighbors.forEach(nb => {
        if (!bfsDepth.has(nb)) {
          bfsDepth.set(nb, currDepth + 1);
          parentMap.set(nb, curr);
          childrenMap.get(curr)!.push(nb);
          queue.push(nb);
        }
      });
    }

    // Handle any disconnected nodes
    nodes.forEach(n => {
      if (!bfsDepth.has(n.id)) {
        const d = Math.max(1, n.depth || 1);
        bfsDepth.set(n.id, d);
        childrenMap.get(rootNode.id)!.push(n.id);
      }
    });

    const maxTreeDepth = Math.max(1, ...Array.from(bfsDepth.values()));
    const maxRadius = Math.min(safeW, safeH) * 0.41;
    const radiusStep = Math.max(125, maxRadius / maxTreeDepth);

    // Concentric Polar Ring Guides
    for (let rIdx = 1; rIdx <= maxTreeDepth; rIdx++) {
      const r = rIdx * radiusStep;
      guides.push({
        id: `radial-ring-${rIdx}`,
        type: 'circle',
        cx,
        cy,
        r,
        stroke: '#38bdf8',
        strokeWidth: 1,
        strokeDasharray: '6,6',
        strokeOpacity: 0.28,
        fill: 'none',
        fillOpacity: 0,
        label: `STRATUM R${rIdx} · ${Math.round(r)}px`,
        labelX: cx,
        labelY: cy - r - 8
      });
    }

    // Polar crosshairs
    [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach((ang, idx) => {
      const outerR = maxTreeDepth * radiusStep + 35;
      guides.push({
        id: `radial-axis-${idx}`,
        type: 'line',
        x1: cx - Math.cos(ang) * outerR,
        y1: cy - Math.sin(ang) * outerR,
        x2: cx + Math.cos(ang) * outerR,
        y2: cy + Math.sin(ang) * outerR,
        stroke: '#1e293b',
        strokeWidth: 1,
        strokeOpacity: 0.65,
        fill: 'none',
        fillOpacity: 0
      });
    });

    // Order nodes in DFS order to assign clean non-overlapping angles
    const leafAngles = new Map<string, number>();
    let leafCounter = 0;
    const countLeaves = (id: string): number => {
      const ch = childrenMap.get(id) || [];
      if (ch.length === 0) return 1;
      return ch.reduce((s, c) => s + countLeaves(c), 0);
    };
    const totalLeaves = Math.max(1, countLeaves(rootNode.id));

    const assignAngles = (id: string): number => {
      const ch = childrenMap.get(id) || [];
      // Sort children by continentId for thematic grouping
      ch.sort((a, b) => {
        const na = nodes.find(n => n.id === a);
        const nb = nodes.find(n => n.id === b);
        return (na?.continentId || '').localeCompare(nb?.continentId || '');
      });

      if (ch.length === 0) {
        const angle = (2 * Math.PI * leafCounter) / totalLeaves - Math.PI / 2;
        leafCounter++;
        leafAngles.set(id, angle);
        return angle;
      }

      const childAngles = ch.map(c => assignAngles(c));
      const avgAngle = childAngles.reduce((a, b) => a + b, 0) / childAngles.length;
      leafAngles.set(id, avgAngle);
      return avgAngle;
    };

    assignAngles(rootNode.id);

    nodes.forEach(n => {
      const d = bfsDepth.get(n.id) || 0;
      const angle = leafAngles.get(n.id) ?? 0;
      const r = d === 0 ? 0 : d * radiusStep;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      nodeTargets.set(n.id, {
        x,
        y,
        angle,
        radius: r,
        rank: d,
        color: getNodeColor(n, continents)
      });
    });

    // Build radial Bezier curves for links
    links.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : l.source.id;
      const tId = typeof l.target === 'string' ? l.target : l.target.id;
      const sPos = nodeTargets.get(sId);
      const tPos = nodeTargets.get(tId);
      if (!sPos || !tPos) return;

      const midR = ((sPos.radius || 0) + (tPos.radius || 0)) / 2;
      const c1x = cx + Math.cos(sPos.angle || 0) * midR;
      const c1y = cy + Math.sin(sPos.angle || 0) * midR;
      const c2x = cx + Math.cos(tPos.angle || 0) * midR;
      const c2y = cy + Math.sin(tPos.angle || 0) * midR;

      const d = `M ${sPos.x} ${sPos.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tPos.x} ${tPos.y}`;
      projectedLinks.set(getLinkKey(l), {
        key: getLinkKey(l),
        d,
        stroke: sPos.color,
        strokeWidth: Math.max(1.8, (l.strength || 0.6) * 3.5),
        labelX: (sPos.x + tPos.x + c1x + c2x) / 4,
        labelY: (sPos.y + tPos.y + c1y + c2y) / 4
      });
    });

    return { paradigm, nodeTargets, guides, links: projectedLinks };
  }

  // =========================================================================
  // 2. CHORD & DEPENDENCY WHEEL
  // =========================================================================
  if (paradigm === 'CHORD_WHEEL') {
    const wheelRadius = Math.min(safeW, safeH) * 0.37;
    const outerArcInnerR = wheelRadius + 34;
    const outerArcOuterR = wheelRadius + 48;

    // Group nodes by continentId
    const sortedNodes = [...nodes].sort((a, b) => {
      const ca = a.continentId || 'Z';
      const cb = b.continentId || 'Z';
      if (ca !== cb) return ca.localeCompare(cb);
      return (b.strength || 0.5) - (a.strength || 0.5);
    });

    const total = Math.max(1, sortedNodes.length);
    const continentAngles = new Map<string, { start: number; end: number; color: string; count: number }>();

    sortedNodes.forEach((n, idx) => {
      const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
      const x = cx + Math.cos(angle) * wheelRadius;
      const y = cy + Math.sin(angle) * wheelRadius;
      const color = getNodeColor(n, continents);

      nodeTargets.set(n.id, {
        x,
        y,
        angle,
        radius: wheelRadius,
        color
      });

      const cid = n.continentId || 'Core';
      const step = (2 * Math.PI) / total;
      if (!continentAngles.has(cid)) {
        continentAngles.set(cid, {
          start: angle - step * 0.42,
          end: angle + step * 0.42,
          color,
          count: 1
        });
      } else {
        const entry = continentAngles.get(cid)!;
        entry.end = angle + step * 0.42;
        entry.count += 1;
      }
    });

    // Inner reference ring
    guides.push({
      id: 'chord-inner-ring',
      type: 'circle',
      cx,
      cy,
      r: wheelRadius,
      stroke: '#334155',
      strokeWidth: 1,
      strokeDasharray: '3,3',
      strokeOpacity: 0.5,
      fill: 'none',
      fillOpacity: 0
    });

    // Outer Continent Perimeter Arcs
    const arcGen = d3.arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(outerArcInnerR)
      .outerRadius(outerArcOuterR)
      .cornerRadius(4);

    continentAngles.forEach((arcInfo, cid) => {
      // d3.arc angles have 0 at 12 o'clock, whereas Math.cos/sin have 0 at 3 o'clock
      const d3Start = arcInfo.start + Math.PI / 2;
      const d3End = arcInfo.end + Math.PI / 2;
      const arcPath = arcGen({ startAngle: d3Start, endAngle: d3End }) || '';
      const midAngle = (arcInfo.start + arcInfo.end) / 2;
      const labelR = outerArcOuterR + 28;

      guides.push({
        id: `chord-arc-${cid}`,
        type: 'path',
        d: `M ${cx} ${cy} ${arcPath}`, // Will translate or generate in global coords below
        stroke: arcInfo.color,
        strokeWidth: 1.5,
        strokeOpacity: 0.9,
        fill: arcInfo.color,
        fillOpacity: 0.25,
        label: `${cid.toUpperCase()} (${arcInfo.count})`,
        labelX: cx + Math.cos(midAngle) * labelR,
        labelY: cy + Math.sin(midAngle) * labelR,
        continentId: cid
      });
    });

    // Fix arc path coordinates to be centered at (cx, cy) without needing group transform
    guides.forEach(g => {
      if (g.id.startsWith('chord-arc-') && g.continentId) {
        const info = continentAngles.get(g.continentId)!;
        const a0 = info.start;
        const a1 = info.end;
        const rIn = outerArcInnerR;
        const rOut = outerArcOuterR;
        const largeArc = a1 - a0 > Math.PI ? 1 : 0;

        const x0Out = cx + Math.cos(a0) * rOut;
        const y0Out = cy + Math.sin(a0) * rOut;
        const x1Out = cx + Math.cos(a1) * rOut;
        const y1Out = cy + Math.sin(a1) * rOut;
        const x1In = cx + Math.cos(a1) * rIn;
        const y1In = cy + Math.sin(a1) * rIn;
        const x0In = cx + Math.cos(a0) * rIn;
        const y0In = cy + Math.sin(a0) * rIn;

        g.d = [
          `M ${x0Out} ${y0Out}`,
          `A ${rOut} ${rOut} 0 ${largeArc} 1 ${x1Out} ${y1Out}`,
          `L ${x1In} ${y1In}`,
          `A ${rIn} ${rIn} 0 ${largeArc} 0 ${x0In} ${y0In}`,
          'Z'
        ].join(' ');
      }
    });

    // Inner Tensioned Quadratic / Cubic Chord Ribbons through center
    links.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : l.source.id;
      const tId = typeof l.target === 'string' ? l.target : l.target.id;
      const sPos = nodeTargets.get(sId);
      const tPos = nodeTargets.get(tId);
      if (!sPos || !tPos) return;

      // Tension toward center (cx, cy)
      const tension = 0.22;
      const ctrlX = cx * (1 - tension) + ((sPos.x + tPos.x) / 2) * tension;
      const ctrlY = cy * (1 - tension) + ((sPos.y + tPos.y) / 2) * tension;

      const d = `M ${sPos.x} ${sPos.y} Q ${ctrlX} ${ctrlY} ${tPos.x} ${tPos.y}`;
      projectedLinks.set(getLinkKey(l), {
        key: getLinkKey(l),
        d,
        stroke: sPos.color,
        strokeWidth: Math.max(2, (l.strength || 0.6) * 4.5),
        labelX: 0.25 * sPos.x + 0.5 * ctrlX + 0.25 * tPos.x,
        labelY: 0.25 * sPos.y + 0.5 * ctrlY + 0.25 * tPos.y
      });
    });

    return { paradigm, nodeTargets, guides, links: projectedLinks };
  }

  // =========================================================================
  // 3. VORONOI TERRITORY & EULER SET MAP
  // =========================================================================
  if (paradigm === 'VORONOI_EULER') {
    const continentList = continents.length > 0
      ? continents
      : [{
          id: 'Core',
          label: 'Core Continent',
          dominantRelationship: 'IsA',
          color: '#06b6d4',
          nodeIds: nodes.map(n => n.id),
          nodeCount: nodes.length,
          aggregateMass: nodes.length,
          cx,
          cy,
          isCollapsed: false
        }];

    const totalConts = Math.max(1, continentList.length);
    const clusterRadius = totalConts === 1 ? 0 : Math.min(safeW, safeH) * 0.27;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    // Position nodes inside deterministic Euler Set circles per continent
    continentList.forEach((cont, cIdx) => {
      const cAngle = (2 * Math.PI * cIdx) / totalConts - Math.PI / 2;
      const centerX = cx + Math.cos(cAngle) * clusterRadius;
      const centerY = cy + Math.sin(cAngle) * clusterRadius;

      const members = nodes.filter(n => (n.continentId || 'Core') === cont.id);
      const eulerRadius = Math.max(115, Math.sqrt(members.length) * 68);

      // Add outer Euler Set boundary circle guide
      guides.push({
        id: `euler-set-${cont.id}`,
        type: 'circle',
        cx: centerX,
        cy: centerY,
        r: eulerRadius,
        stroke: cont.color,
        strokeWidth: 2,
        strokeDasharray: '10,5',
        strokeOpacity: 0.65,
        fill: cont.color,
        fillOpacity: 0.05,
        label: `EULER SET ⊂ [${cont.dominantRelationship.toUpperCase()}]`,
        labelX: centerX,
        labelY: centerY - eulerRadius - 10,
        continentId: cont.id
      });

      members.forEach((n, mIdx) => {
        const r = members.length === 1 ? 0 : Math.min(eulerRadius - 32, 46 * Math.sqrt(mIdx + 0.6));
        const theta = mIdx * goldenAngle + cIdx;
        const nx = centerX + Math.cos(theta) * r;
        const ny = centerY + Math.sin(theta) * r;
        nodeTargets.set(n.id, {
          x: nx,
          y: ny,
          color: cont.color
        });
      });
    });

    // Catch any unassigned nodes
    nodes.forEach((n, idx) => {
      if (!nodeTargets.has(n.id)) {
        const theta = idx * goldenAngle;
        nodeTargets.set(n.id, {
          x: cx + Math.cos(theta) * 90,
          y: cy + Math.sin(theta) * 90,
          color: getNodeColor(n, continents)
        });
      }
    });

    // Compute d3-delaunay Voronoi Tessellation across the bounded territory
    const pts: Array<[number, number]> = nodes.map(n => {
      const t = nodeTargets.get(n.id)!;
      return [t.x, t.y];
    });

    if (pts.length >= 2) {
      const pad = 110;
      const xs = pts.map(p => p[0]);
      const ys = pts.map(p => p[1]);
      const minX = Math.min(...xs) - pad;
      const maxX = Math.max(...xs) + pad;
      const minY = Math.min(...ys) - pad;
      const maxY = Math.max(...ys) + pad;

      const delaunay = d3.Delaunay.from(pts);
      const voronoi = delaunay.voronoi([minX, minY, maxX, maxY]);

      nodes.forEach((n, i) => {
        const cellPolygon = voronoi.cellPolygon(i);
        if (!cellPolygon || cellPolygon.length < 3) return;
        const t = nodeTargets.get(n.id)!;
        const dPath = `M ${cellPolygon.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L ')} Z`;
        guides.unshift({
          id: `voronoi-cell-${n.id}`,
          type: 'path',
          d: dPath,
          stroke: t.color,
          strokeWidth: 1.4,
          strokeOpacity: 0.55,
          fill: t.color,
          fillOpacity: 0.11,
          continentId: n.continentId
        });
      });
    }

    // Straight Delaunay Dual Links
    links.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : l.source.id;
      const tId = typeof l.target === 'string' ? l.target : l.target.id;
      const sPos = nodeTargets.get(sId);
      const tPos = nodeTargets.get(tId);
      if (!sPos || !tPos) return;

      projectedLinks.set(getLinkKey(l), {
        key: getLinkKey(l),
        d: `M ${sPos.x} ${sPos.y} L ${tPos.x} ${tPos.y}`,
        stroke: sPos.color,
        strokeWidth: Math.max(1.8, (l.strength || 0.6) * 3.2),
        labelX: (sPos.x + tPos.x) / 2,
        labelY: (sPos.y + tPos.y) / 2
      });
    });

    return { paradigm, nodeTargets, guides, links: projectedLinks };
  }

  // =========================================================================
  // 4. LAYERED FLOWCHART & DIRECTED ACYCLIC GRAPH (DAG)
  // =========================================================================
  if (paradigm === 'LAYERED_DAG') {
    // Stratify nodes by epistemic depth
    const strataMap = new Map<number, GraphNode[]>();
    nodes.forEach(n => {
      const d = Math.max(0, n.depth || 0);
      if (!strataMap.has(d)) strataMap.set(d, []);
      strataMap.get(d)!.push(n);
    });

    // If all nodes have the same depth, stratify by continent or degree rank
    if (strataMap.size <= 1 && nodes.length > 2) {
      strataMap.clear();
      nodes.forEach((n, idx) => {
        const syntheticRank = idx === 0 ? 0 : (idx % 3) + 1;
        if (!strataMap.has(syntheticRank)) strataMap.set(syntheticRank, []);
        strataMap.get(syntheticRank)!.push(n);
      });
    }

    const sortedRanks = Array.from(strataMap.keys()).sort((a, b) => a - b);
    const numCols = Math.max(1, sortedRanks.length);
    const usableW = Math.max(680, safeW * 0.78);
    const usableH = Math.max(460, safeH * 0.72);
    const startX = cx - usableW / 2;
    const colSpacing = numCols === 1 ? 0 : usableW / (numCols - 1);

    const rankTitles = [
      'TIER 0 · AXIOM ORIGIN',
      'TIER 1 · PRIMARY VECTORS',
      'TIER 2 · SECONDARY DERIVATIONS',
      'TIER 3 · TERTIARY SYNTHESIS',
      'TIER 4 · FRONTIER HORIZON'
    ];

    sortedRanks.forEach((rank, colIdx) => {
      const colNodes = strataMap.get(rank) || [];
      // Sort vertically by continentId to minimize edge crossings
      colNodes.sort((a, b) => (a.continentId || '').localeCompare(b.continentId || ''));

      const colX = numCols === 1 ? cx : startX + colIdx * colSpacing;
      const laneW = Math.min(200, Math.max(120, colSpacing * 0.55 || 160));

      // Swimlane Column Guide
      guides.push({
        id: `dag-lane-${rank}`,
        type: 'rect',
        x: colX - laneW / 2,
        y: cy - usableH / 2 - 48,
        width: laneW,
        height: usableH + 96,
        rx: 8,
        stroke: '#1e293b',
        strokeWidth: 1.2,
        strokeDasharray: '6,4',
        strokeOpacity: 0.85,
        fill: '#0f172a',
        fillOpacity: 0.28,
        label: rankTitles[colIdx] || `TIER ${rank} · STRATUM`,
        labelX: colX,
        labelY: cy - usableH / 2 - 26
      });

      const count = colNodes.length;
      colNodes.forEach((n, rowIdx) => {
        const rowY = count === 1
          ? cy
          : (cy - usableH / 2) + (rowIdx / (count - 1)) * usableH;

        nodeTargets.set(n.id, {
          x: colX,
          y: rowY,
          rank: colIdx,
          color: getNodeColor(n, continents)
        });
      });
    });

    // Horizontal Cubic Flowchart Connectors
    links.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : l.source.id;
      const tId = typeof l.target === 'string' ? l.target : l.target.id;
      const sPos = nodeTargets.get(sId);
      const tPos = nodeTargets.get(tId);
      if (!sPos || !tPos) return;

      const dx = tPos.x - sPos.x;
      const dy = tPos.y - sPos.y;
      let d = '';
      if (Math.abs(dx) < 20) {
        // Same column vertical arc
        const arcOffset = 75;
        d = `M ${sPos.x} ${sPos.y} C ${sPos.x + arcOffset} ${sPos.y}, ${tPos.x + arcOffset} ${tPos.y}, ${tPos.x} ${tPos.y}`;
      } else {
        const midX = (sPos.x + tPos.x) / 2;
        d = `M ${sPos.x} ${sPos.y} C ${midX} ${sPos.y}, ${midX} ${tPos.y}, ${tPos.x} ${tPos.y}`;
      }

      projectedLinks.set(getLinkKey(l), {
        key: getLinkKey(l),
        d,
        stroke: sPos.color,
        strokeWidth: Math.max(2, (l.strength || 0.6) * 3.8),
        labelX: (sPos.x + tPos.x) / 2,
        labelY: (sPos.y + tPos.y) / 2 - (Math.abs(dx) < 20 ? 0 : dy * 0.08)
      });
    });

    return { paradigm, nodeTargets, guides, links: projectedLinks };
  }

  // =========================================================================
  // 5. SANKEY FLOW & ALLUVIAL PATHWAY DIAGRAM
  // =========================================================================
  if (paradigm === 'SANKEY_FLOW') {
    // Stratify into vertical stages by epistemic depth
    const stageMap = new Map<number, GraphNode[]>();
    nodes.forEach(n => {
      const d = Math.max(0, n.depth || 0);
      if (!stageMap.has(d)) stageMap.set(d, []);
      stageMap.get(d)!.push(n);
    });

    if (stageMap.size <= 1 && nodes.length > 2) {
      stageMap.clear();
      nodes.forEach((n, idx) => {
        const s = idx === 0 ? 0 : (idx % 3) + 1;
        if (!stageMap.has(s)) stageMap.set(s, []);
        stageMap.get(s)!.push(n);
      });
    }

    const sortedStages = Array.from(stageMap.keys()).sort((a, b) => a - b);
    const numStages = Math.max(1, sortedStages.length);
    const usableW = Math.max(700, safeW * 0.78);
    const usableH = Math.max(460, safeH * 0.7);
    const startX = cx - usableW / 2;
    const stageSpacing = numStages === 1 ? 0 : usableW / (numStages - 1);

    // Compute flux mass per node
    const nodeFlux = new Map<string, number>();
    nodes.forEach(n => {
      const deg = degreeMap.get(n.id) || 1;
      nodeFlux.set(n.id, Math.max(1, deg * (n.strength || 0.65)));
    });

    sortedStages.forEach((stage, sIdx) => {
      const stageNodes = stageMap.get(stage) || [];
      stageNodes.sort((a, b) => (nodeFlux.get(b.id) || 1) - (nodeFlux.get(a.id) || 1));

      const stageX = numStages === 1 ? cx : startX + sIdx * stageSpacing;

      // Stage header guide line
      guides.push({
        id: `sankey-stage-line-${stage}`,
        type: 'line',
        x1: stageX,
        y1: cy - usableH / 2 - 42,
        x2: stageX,
        y2: cy + usableH / 2 + 42,
        stroke: '#1e293b',
        strokeWidth: 1.5,
        strokeDasharray: '4,4',
        strokeOpacity: 0.8,
        fill: 'none',
        fillOpacity: 0,
        label: `ALLUVIAL STAGE 0${sIdx + 1}`,
        labelX: stageX,
        labelY: cy - usableH / 2 - 52
      });

      const count = stageNodes.length;
      stageNodes.forEach((n, rIdx) => {
        const ny = count === 1
          ? cy
          : (cy - usableH / 2) + (rIdx / (count - 1)) * usableH;

        const flux = nodeFlux.get(n.id) || 1;
        const barH = Math.min(96, Math.max(36, flux * 20));
        const color = getNodeColor(n, continents);

        nodeTargets.set(n.id, {
          x: stageX,
          y: ny,
          rank: sIdx,
          barHeight: barH,
          color
        });

        // Sankey Vertical Node Throughput Bar Guide
        guides.push({
          id: `sankey-bar-${n.id}`,
          type: 'rect',
          x: stageX - 12,
          y: ny - barH / 2,
          width: 24,
          height: barH,
          rx: 4,
          stroke: color,
          strokeWidth: 1.8,
          strokeOpacity: 0.95,
          fill: color,
          fillOpacity: 0.32,
          continentId: n.continentId
        });
      });
    });

    // Wide Alluvial S-Ribbons for Links
    links.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : l.source.id;
      const tId = typeof l.target === 'string' ? l.target : l.target.id;
      const sPos = nodeTargets.get(sId);
      const tPos = nodeTargets.get(tId);
      if (!sPos || !tPos) return;

      const ribbonWidth = Math.max(8, (l.strength || 0.65) * 22);
      const midX = (sPos.x + tPos.x) / 2;
      const d = `M ${sPos.x} ${sPos.y} C ${midX} ${sPos.y}, ${midX} ${tPos.y}, ${tPos.x} ${tPos.y}`;

      projectedLinks.set(getLinkKey(l), {
        key: getLinkKey(l),
        d,
        stroke: sPos.color,
        strokeWidth: ribbonWidth,
        isRibbon: true,
        labelX: midX,
        labelY: (sPos.y + tPos.y) / 2
      });
    });

    return { paradigm, nodeTargets, guides, links: projectedLinks };
  }

  return { paradigm, nodeTargets, guides, links: projectedLinks };
}
