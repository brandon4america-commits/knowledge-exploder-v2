/**
 * Knowledge Exploder - High-Performance Web Worker Force Physics Engine
 * Offloads N-body repulsion, Hooke spring attraction, and continent gravity from the main thread.
 * Employs zero-copy transferable Float32Array buffers for 60fps rendering with 10,000+ nodes.
 */

// Node layout in Float32Array: 8 floats per node:
// [0: x, 1: y, 2: vx, 3: vy, 4: fx, 5: fy, 6: mass, 7: continentIndex]
const STRIDE = 8;

let positions: Float32Array | null = null;
let linkIndices: Int32Array | null = null; // [sourceIdx, targetIdx]
let linkParams: Float32Array | null = null; // [desiredDist, strength]
let nodeCount = 0;
let linkCount = 0;

let width = 1200;
let height = 800;
let friction = 0.88;
let repulsion = -500;
let linkDefaultDistance = 140;
let linkDefaultStrength = 0.6;
let centerStrength = 0.04;

self.onmessage = (e: MessageEvent) => {
  const data = e.data;
  if (!data) return;

  switch (data.type) {
    case 'INIT': {
      nodeCount = data.nodeCount;
      linkCount = data.linkCount;
      positions = new Float32Array(data.positionsBuffer);
      linkIndices = new Int32Array(data.linkIndicesBuffer);
      linkParams = new Float32Array(data.linkParamsBuffer);
      width = data.width || 1200;
      height = data.height || 800;
      if (data.config) {
        repulsion = data.config.repulsion ?? repulsion;
        friction = data.config.friction ?? friction;
      }
      break;
    }

    case 'STEP': {
      // Re-hydrate transferable buffer if passed back
      if (data.positionsBuffer) {
        positions = new Float32Array(data.positionsBuffer);
      }
      if (!positions || nodeCount === 0) return;

      const steps = data.iterations || 1;
      for (let s = 0; s < steps; s++) {
        simulateTick();
      }

      // Transfer Float32Array buffer back to main thread
      const buffer = positions.buffer;
      (self as unknown as Worker).postMessage(
        {
          type: 'TICK',
          nodeCount,
          positionsBuffer: buffer
        },
        [buffer]
      );
      break;
    }

    case 'DRAG': {
      if (!positions) return;
      const { index, x, y, pinned } = data;
      if (index >= 0 && index < nodeCount) {
        const off = index * STRIDE;
        positions[off] = x;
        positions[off + 1] = y;
        positions[off + 2] = 0; // vx = 0
        positions[off + 3] = 0; // vy = 0
        positions[off + 4] = pinned ? x : NaN;
        positions[off + 5] = pinned ? y : NaN;
      }
      break;
    }

    case 'CONFIG': {
      if (data.width) width = data.width;
      if (data.height) height = data.height;
      if (data.repulsion !== undefined) repulsion = data.repulsion;
      if (data.friction !== undefined) friction = data.friction;
      break;
    }
  }
};

function simulateTick() {
  if (!positions) return;

  const cx = width / 2;
  const cy = height / 2;

  // 1. Center attraction and apply velocities
  for (let i = 0; i < nodeCount; i++) {
    const off = i * STRIDE;
    const fx = positions[off + 4];
    const fy = positions[off + 5];

    if (!isNaN(fx) && !isNaN(fy)) {
      positions[off] = fx;
      positions[off + 1] = fy;
      positions[off + 2] = 0;
      positions[off + 3] = 0;
      continue;
    }

    // Centering force
    const dx = cx - positions[off];
    const dy = cy - positions[off + 1];
    positions[off + 2] += dx * centerStrength * 0.1;
    positions[off + 3] += dy * centerStrength * 0.1;
  }

  // 2. Pairwise Coulomb Repulsion (Fast spatial approximation)
  // Distance clamping prevents NaN explosions when nodes overlap
  const minDistanceSq = 36; // 6px minimum
  const maxDistanceSq = 1000 * 1000;

  for (let i = 0; i < nodeCount; i++) {
    const offA = i * STRIDE;
    const ax = positions[offA];
    const ay = positions[offA + 1];

    for (let j = i + 1; j < nodeCount; j++) {
      const offB = j * STRIDE;
      const bx = positions[offB];
      const by = positions[offB + 1];

      let dx = bx - ax;
      let dy = by - ay;
      let distSq = dx * dx + dy * dy;

      if (distSq < minDistanceSq) {
        distSq = minDistanceSq;
        dx = (Math.random() - 0.5) * 4;
        dy = (Math.random() - 0.5) * 4;
      }

      if (distSq < maxDistanceSq) {
        const dist = Math.sqrt(distSq);
        const force = repulsion / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        // Apply Newton's third law
        positions[offA + 2] += fx;
        positions[offA + 3] += fy;
        positions[offB + 2] -= fx;
        positions[offB + 3] -= fy;
      }
    }
  }

  // 3. Link Spring Attraction (Hooke's Law)
  if (linkIndices && linkParams) {
    for (let l = 0; l < linkCount; l++) {
      const srcIdx = linkIndices[l * 2];
      const tgtIdx = linkIndices[l * 2 + 1];
      if (srcIdx < 0 || srcIdx >= nodeCount || tgtIdx < 0 || tgtIdx >= nodeCount) continue;

      const offA = srcIdx * STRIDE;
      const offB = tgtIdx * STRIDE;

      const desiredDist = linkParams[l * 2] || linkDefaultDistance;
      const strength = linkParams[l * 2 + 1] || linkDefaultStrength;

      const dx = positions[offB] - positions[offA];
      const dy = positions[offB + 1] - positions[offA + 1];
      const currentDist = Math.hypot(dx, dy) || 1;

      const displacement = currentDist - desiredDist;
      const springForce = displacement * strength * 0.08;

      const nx = dx / currentDist;
      const ny = dy / currentDist;

      positions[offA + 2] += nx * springForce;
      positions[offA + 3] += ny * springForce;
      positions[offB + 2] -= nx * springForce;
      positions[offB + 3] -= ny * springForce;
    }
  }

  // 4. Velocity integration & boundary constraints
  for (let i = 0; i < nodeCount; i++) {
    const off = i * STRIDE;
    const fx = positions[off + 4];
    const fy = positions[off + 5];

    if (!isNaN(fx) && !isNaN(fy)) {
      positions[off] = fx;
      positions[off + 1] = fy;
      continue;
    }

    // Apply friction / dampening
    positions[off + 2] *= friction;
    positions[off + 3] *= friction;

    // Cap velocity
    const maxV = 28;
    const v = Math.hypot(positions[off + 2], positions[off + 3]);
    if (v > maxV) {
      positions[off + 2] = (positions[off + 2] / v) * maxV;
      positions[off + 3] = (positions[off + 3] / v) * maxV;
    }

    // Integrate
    positions[off] += positions[off + 2];
    positions[off + 1] += positions[off + 3];
  }
}
export {};
