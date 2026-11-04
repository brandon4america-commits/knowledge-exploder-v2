import {
  GraphData,
  GraphNode,
  GraphLink,
  TopologicalDivergenceDiff,
  NodeDivergenceItem,
  LinkDivergenceItem,
  NodeDiffStatus,
  LinkDiffStatus
} from '../types';

function getLinkId(l: GraphLink, field: 'source' | 'target'): string {
  const val = l[field];
  if (typeof val === 'string') return val;
  return (val as GraphNode).id || '';
}

function makeLinkKey(sourceId: string, targetId: string): string {
  return sourceId < targetId ? `${sourceId}__${targetId}` : `${targetId}__${sourceId}`;
}

export function computeTopologicalDiff(
  canonical: GraphData,
  forked: GraphData
): TopologicalDivergenceDiff {
  const canonicalNodeMap = new Map<string, GraphNode>();
  const forkedNodeMap = new Map<string, GraphNode>();

  canonical.nodes.forEach(n => canonicalNodeMap.set(n.id, n));
  forked.nodes.forEach(n => forkedNodeMap.set(n.id, n));

  const canonicalDegreeMap = new Map<string, number>();
  canonical.links.forEach(l => {
    const s = getLinkId(l, 'source');
    const t = getLinkId(l, 'target');
    if (s) canonicalDegreeMap.set(s, (canonicalDegreeMap.get(s) || 0) + 1);
    if (t) canonicalDegreeMap.set(t, (canonicalDegreeMap.get(t) || 0) + 1);
  });

  const forkedDegreeMap = new Map<string, number>();
  forked.links.forEach(l => {
    const s = getLinkId(l, 'source');
    const t = getLinkId(l, 'target');
    if (s) forkedDegreeMap.set(s, (forkedDegreeMap.get(s) || 0) + 1);
    if (t) forkedDegreeMap.set(t, (forkedDegreeMap.get(t) || 0) + 1);
  });

  const nodeDivergenceMap = new Map<string, NodeDivergenceItem>();
  let addedNodeCount = 0;
  let removedNodeCount = 0;
  let mutatedNodeCount = 0;

  let maxNodeHeat = 0;
  let epicenterNodeId: string | null = null;
  let epicenterNodeLabel: string | null = null;

  // Process nodes present in Canonical
  canonical.nodes.forEach(cNode => {
    const fNode = forkedNodeMap.get(cNode.id);
    if (!fNode) {
      // Node was pruned/removed in the counterfactual fork
      removedNodeCount++;
      const heat = 0.9;
      if (heat > maxNodeHeat) {
        maxNodeHeat = heat;
        epicenterNodeId = cNode.id;
        epicenterNodeLabel = cNode.label;
      }
      nodeDivergenceMap.set(cNode.id, {
        nodeId: cNode.id,
        label: cNode.label,
        status: 'REMOVED_IN_FORK',
        heatScore: heat,
        color: '#f43f5e', // Radiant Rose
        notes: 'Pruned / severed in counterfactual branch',
        degreeDelta: -(canonicalDegreeMap.get(cNode.id) || 0)
      });
    } else {
      // Common node: check for degree or kinetic mutation
      const cDeg = canonicalDegreeMap.get(cNode.id) || 0;
      const fDeg = forkedDegreeMap.get(fNode.id) || 0;
      const degDiff = fDeg - cDeg;

      if (degDiff !== 0) {
        mutatedNodeCount++;
        const heat = Math.min(1.0, 0.4 + Math.abs(degDiff) * 0.15);
        if (heat > maxNodeHeat) {
          maxNodeHeat = heat;
          epicenterNodeId = cNode.id;
          epicenterNodeLabel = cNode.label;
        }
        nodeDivergenceMap.set(cNode.id, {
          nodeId: cNode.id,
          label: cNode.label,
          status: 'MUTATED',
          heatScore: heat,
          color: '#a855f7', // Violet Quantum
          notes: `Degree shifted by ${degDiff > 0 ? '+' : ''}${degDiff} connections`,
          degreeDelta: degDiff
        });
      } else {
        nodeDivergenceMap.set(cNode.id, {
          nodeId: cNode.id,
          label: cNode.label,
          status: 'UNCHANGED',
          heatScore: 0.05,
          color: '#0ea5e9', // Default Sky
          degreeDelta: 0
        });
      }
    }
  });

  // Process nodes added in Fork (not in Canonical)
  forked.nodes.forEach(fNode => {
    if (!canonicalNodeMap.has(fNode.id)) {
      addedNodeCount++;
      const heat = 1.0;
      if (heat > maxNodeHeat) {
        maxNodeHeat = heat;
        epicenterNodeId = fNode.id;
        epicenterNodeLabel = fNode.label;
      }
      nodeDivergenceMap.set(fNode.id, {
        nodeId: fNode.id,
        label: fNode.label,
        status: 'ADDED_IN_FORK',
        heatScore: heat,
        color: '#34d399', // Emerald Luminescence
        notes: 'Newly synthesized counterfactual hypothesis node',
        degreeDelta: forkedDegreeMap.get(fNode.id) || 0
      });
    }
  });

  // Process links
  const canonicalLinkMap = new Map<string, GraphLink>();
  canonical.links.forEach(l => {
    const s = getLinkId(l, 'source');
    const t = getLinkId(l, 'target');
    if (s && t) canonicalLinkMap.set(makeLinkKey(s, t), l);
  });

  const forkedLinkMap = new Map<string, GraphLink>();
  forked.links.forEach(l => {
    const s = getLinkId(l, 'source');
    const t = getLinkId(l, 'target');
    if (s && t) forkedLinkMap.set(makeLinkKey(s, t), l);
  });

  const linkDivergenceMap = new Map<string, LinkDivergenceItem>();
  let addedLinkCount = 0;
  let removedLinkCount = 0;
  let sumConductanceDelta = 0;
  let conductanceComparisons = 0;

  canonicalLinkMap.forEach((cLink, key) => {
    const s = getLinkId(cLink, 'source');
    const t = getLinkId(cLink, 'target');
    const fLink = forkedLinkMap.get(key);

    if (!fLink) {
      removedLinkCount++;
      linkDivergenceMap.set(key, {
        linkKey: key,
        sourceId: s,
        targetId: t,
        relationship: cLink.relationship || 'Synapse',
        status: 'REMOVED_SYNAPSE',
        heatScore: 0.85,
        conductivityDelta: -(cLink.conductivity || 0.6),
        color: '#fb7185' // Light Rose
      });
    } else {
      const cCond = typeof cLink.conductivity === 'number' ? cLink.conductivity : 0.65;
      const fCond = typeof fLink.conductivity === 'number' ? fLink.conductivity : 0.65;
      const delta = fCond - cCond;
      sumConductanceDelta += Math.abs(delta);
      conductanceComparisons++;

      if (Math.abs(delta) > 0.08) {
        linkDivergenceMap.set(key, {
          linkKey: key,
          sourceId: s,
          targetId: t,
          relationship: fLink.relationship || cLink.relationship || 'Synapse',
          status: 'CONDUCTIVITY_DRIFT',
          heatScore: Math.min(1.0, Math.abs(delta) * 1.5),
          conductivityDelta: delta,
          color: delta > 0 ? '#38bdf8' : '#f59e0b'
        });
      } else {
        linkDivergenceMap.set(key, {
          linkKey: key,
          sourceId: s,
          targetId: t,
          relationship: cLink.relationship || 'Synapse',
          status: 'UNCHANGED',
          heatScore: 0.05,
          conductivityDelta: 0,
          color: '#64748b'
        });
      }
    }
  });

  forkedLinkMap.forEach((fLink, key) => {
    if (!canonicalLinkMap.has(key)) {
      addedLinkCount++;
      const s = getLinkId(fLink, 'source');
      const t = getLinkId(fLink, 'target');
      linkDivergenceMap.set(key, {
        linkKey: key,
        sourceId: s,
        targetId: t,
        relationship: fLink.relationship || 'CounterfactualBranch',
        status: 'ADDED_SYNAPSE',
        heatScore: 1.0,
        conductivityDelta: fLink.conductivity || 0.8,
        color: '#10b981' // Emerald
      });
    }
  });

  const totalDivergentNodes = addedNodeCount + removedNodeCount + mutatedNodeCount;
  const totalDivergentLinks = addedLinkCount + removedLinkCount;
  const totalMaxNodes = Math.max(1, Math.max(canonical.nodes.length, forked.nodes.length));
  const totalMaxLinks = Math.max(1, Math.max(canonical.links.length, forked.links.length));

  const nodeDivergenceFraction = totalDivergentNodes / totalMaxNodes;
  const linkDivergenceFraction = totalDivergentLinks / totalMaxLinks;
  const meanConductanceDelta =
    conductanceComparisons > 0 ? sumConductanceDelta / conductanceComparisons : 0;

  const rawDivergenceScore =
    (nodeDivergenceFraction * 0.48 +
      linkDivergenceFraction * 0.38 +
      Math.min(1.0, meanConductanceDelta * 1.8) * 0.14) * 100;

  const divergenceScore = Math.min(100, Math.max(0, Math.round(rawDivergenceScore)));

  return {
    timestamp: Date.now(),
    divergenceScore,
    totalDivergentNodes,
    totalDivergentLinks,
    nodeDivergenceMap,
    linkDivergenceMap,
    epicenterNodeId,
    epicenterNodeLabel,
    epicenterHeatScore: maxNodeHeat,
    addedNodeCount,
    removedNodeCount,
    mutatedNodeCount,
    addedLinkCount,
    removedLinkCount,
    meanConductanceDelta
  };
}
