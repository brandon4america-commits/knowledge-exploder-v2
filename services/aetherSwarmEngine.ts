import { GraphNode, GraphLink, AetherAgent, AetherSwarmConfig } from '../types';

export const DEFAULT_AETHER_SWARM_CONFIG: AetherSwarmConfig = {
  enabled: true,
  agentCount: 16,
  autonomousHomeostasis: true,
  speed: 1.2,
  stressSensitivity: 0.65,
  pulseStrength: 1.0
};

const AETHER_COLORS = [
  '#38bdf8', // Electric Sky
  '#34d399', // Emerald Luminescence
  '#a855f7', // Violet Quantum
  '#06b6d4', // Laser Cyan
  '#f472b6'  // Rose Phosphor
];

export function initializeAetherAgents(
  count: number = 16,
  bounds: { width: number; height: number }
): AetherAgent[] {
  const agents: AetherAgent[] = [];
  const cx = bounds.width / 2;
  const cy = bounds.height / 2;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = 120 + Math.random() * 250;
    agents.push({
      id: `aether-${i}-${Date.now().toString(36)}`,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      energy: 0.5 + Math.random() * 0.5,
      targetNodeId: null,
      state: 'PATROL',
      pulseTimer: Math.random() * 80,
      color: AETHER_COLORS[i % AETHER_COLORS.length],
      size: 2.5 + Math.random() * 2,
      orbitRadius: 28 + Math.random() * 22,
      orbitAngle: Math.random() * Math.PI * 2
    });
  }
  return agents;
}

export interface AetherPulseEvent {
  nodeId: string;
  x: number;
  y: number;
  intensity: number;
  color: string;
  timestamp: number;
}

export function stepAetherSwarm(
  agents: AetherAgent[],
  nodes: GraphNode[],
  links: GraphLink[],
  config: AetherSwarmConfig,
  bounds: { width: number; height: number },
  topStressNodeIds: string[] = []
): {
  updatedAgents: AetherAgent[];
  pulseEvents: AetherPulseEvent[];
} {
  if (!config.enabled || agents.length === 0) {
    return { updatedAgents: agents, pulseEvents: [] };
  }

  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const pulseEvents: AetherPulseEvent[] = [];
  const now = Date.now();

  // Find candidate hotspot nodes
  let primaryTargetNode: GraphNode | null = null;
  if (topStressNodeIds.length > 0 && nodeMap.has(topStressNodeIds[0])) {
    primaryTargetNode = nodeMap.get(topStressNodeIds[0]) || null;
  } else if (nodes.length > 0) {
    // Fallback: pick node with highest kinetic energy
    let maxV = -1;
    for (const n of nodes) {
      const v = Math.hypot(n.vx || 0, n.vy || 0);
      if (v > maxV && typeof n.x === 'number') {
        maxV = v;
        primaryTargetNode = n;
      }
    }
  }

  const updatedAgents = agents.map(agent => {
    let ax = 0;
    let ay = 0;

    // Check if target node exists
    const target = (agent.targetNodeId && nodeMap.get(agent.targetNodeId)) || primaryTargetNode;

    if (target && typeof target.x === 'number' && typeof target.y === 'number') {
      const dx = target.x - agent.x;
      const dy = target.y - agent.y;
      const dist = Math.hypot(dx, dy);

      if (dist < agent.orbitRadius + 20) {
        // Orbital vortex mode around hotspot
        agent.state = 'RELIEVING_STRESS';
        agent.orbitAngle += 0.06 * config.speed;
        const targetOrbitX = target.x + Math.cos(agent.orbitAngle) * agent.orbitRadius;
        const targetOrbitY = target.y + Math.sin(agent.orbitAngle) * agent.orbitRadius;
        
        ax += (targetOrbitX - agent.x) * 0.12;
        ay += (targetOrbitY - agent.y) * 0.12;

        agent.pulseTimer += 1;
        if (agent.pulseTimer > 100 && config.autonomousHomeostasis) {
          agent.pulseTimer = 0;
          pulseEvents.push({
            nodeId: target.id,
            x: target.x,
            y: target.y,
            intensity: config.pulseStrength,
            color: agent.color,
            timestamp: now
          });
        }
      } else {
        // Converge toward target
        agent.state = 'CONVERGING';
        const pull = 0.035 * config.speed;
        ax += (dx / Math.max(1, dist)) * pull * Math.min(dist, 100);
        ay += (dy / Math.max(1, dist)) * pull * Math.min(dist, 100);
      }
    } else {
      // Gentle patrol Brownian motion
      agent.state = 'PATROL';
      ax += (Math.random() - 0.5) * 0.2;
      ay += (Math.random() - 0.5) * 0.2;

      // Keep within bounds
      if (agent.x < 80) ax += 0.4;
      if (agent.x > bounds.width - 80) ax -= 0.4;
      if (agent.y < 80) ay += 0.4;
      if (agent.y > bounds.height - 80) ay -= 0.4;
    }

    // Apply damping and integrate velocity
    const newVx = (agent.vx + ax) * 0.94;
    const newVy = (agent.vy + ay) * 0.94;
    const newX = agent.x + newVx;
    const newY = agent.y + newVy;

    return {
      ...agent,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      targetNodeId: target?.id || null
    };
  });

  return { updatedAgents, pulseEvents };
}
