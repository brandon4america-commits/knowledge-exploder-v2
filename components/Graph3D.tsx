import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { motion, AnimatePresence } from 'motion/react';
import { Box, RotateCcw, Sparkles, Eye, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { GraphNode, GraphLink, KnowledgeContinent, CausalPathTrace } from '../types';
import { computeQuantumTensorResonance } from '../services/quantumTensorEngine';

interface Graph3DProps {
  nodes: GraphNode[];
  links: GraphLink[];
  continents?: KnowledgeContinent[];
  selectedNode?: GraphNode | null;
  pinnedNode?: GraphNode | null;
  focusedNodeId?: string | null;
  focusTrigger?: { nodeId: string; timestamp: number } | null;
  resetAnchorsTrigger?: number;
  onSelectNode?: (node: GraphNode) => void;
  onTogglePin?: (node: GraphNode) => void;
  onExplodeNode?: (node: GraphNode) => void;
  activeCausalTrace?: CausalPathTrace | null;
  topic?: string;
}

const PREDICATE_COLORS: Record<string, string> = {
  IsA: '#38bdf8',
  Enables: '#34d399',
  DependsOn: '#c084fc',
  Implements: '#fbbf24',
  Secures: '#f87171',
  Resonates: '#38bdf8',
  Causes: '#f43f5e',
  DEFAULT: '#818cf8'
};

interface MarchingClusterBlob {
  mc: MarchingCubes;
  wireMesh?: THREE.LineSegments;
  center: THREE.Vector3;
  scale: number;
  relativePoints: Array<{ rel: THREE.Vector3; strength: number; phase: number }>;
  groupKey: number;
}

export const Graph3D: React.FC<Graph3DProps> = ({
  nodes,
  links,
  selectedNode,
  pinnedNode,
  focusedNodeId,
  focusTrigger,
  resetAnchorsTrigger = 0,
  onSelectNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);

  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [particleSpeed, setParticleSpeed] = useState<number>(1.2);
  const [isSoftwareGl, setIsSoftwareGl] = useState<boolean>(false);
  const [isFallback3D, setIsFallback3D] = useState<boolean>(false);
  const [hullMode, setHullMode] = useState<'MARCHING_CUBES' | 'CONVEX_HULL'>('MARCHING_CUBES');
  const [dofBloomEnabled, setDofBloomEnabled] = useState<boolean>(true);
  const [gazeParallaxEnabled, setGazeParallaxEnabled] = useState<boolean>(true);
  const [gazeAngles, setGazeAngles] = useState<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });

  // Quantum Tensor Sparse Computations
  const tensorResult = useMemo(() => {
    return computeQuantumTensorResonance(nodes, links);
  }, [nodes, links]);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rootManifoldGroupRef = useRef<THREE.Group | null>(null);
  const nodeMeshGroupRef = useRef<THREE.Group | null>(null);
  const linkMeshGroupRef = useRef<THREE.Group | null>(null);
  const particleGroupRef = useRef<THREE.Group | null>(null);
  const continentGroupRef = useRef<THREE.Group | null>(null);
  const atmospherePointsRef = useRef<THREE.Points | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const targetGazeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const marchingBlobsRef = useRef<MarchingClusterBlob[]>([]);

  // Latest state refs for animation loop access without re-initializing WebGL context
  const particleSpeedRef = useRef<number>(particleSpeed);
  particleSpeedRef.current = particleSpeed;
  const dofBloomEnabledRef = useRef<boolean>(dofBloomEnabled);
  dofBloomEnabledRef.current = dofBloomEnabled;
  const gazeParallaxEnabledRef = useRef<boolean>(gazeParallaxEnabled);
  gazeParallaxEnabledRef.current = gazeParallaxEnabled;
  const hullModeRef = useRef<'MARCHING_CUBES' | 'CONVEX_HULL'>(hullMode);
  hullModeRef.current = hullMode;
  const nodesRef = useRef<GraphNode[]>(nodes);
  nodesRef.current = nodes;
  const linksRef = useRef<GraphLink[]>(links);
  linksRef.current = links;
  const selectedNodeRef = useRef<GraphNode | null | undefined>(selectedNode);
  selectedNodeRef.current = selectedNode;
  const pinnedNodeRef = useRef<GraphNode | null | undefined>(pinnedNode);
  pinnedNodeRef.current = pinnedNode;
  const tensorResultRef = useRef(tensorResult);
  tensorResultRef.current = tensorResult;

  // Store 3D node positions mapped by ID
  const node3DPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const fallbackProjectedNodesRef = useRef<Array<{ node: GraphNode; sx: number; sy: number; r: number }>>([]);
  const particleBeams = useRef<
    Array<{
      mesh: THREE.Mesh;
      start: THREE.Vector3;
      end: THREE.Vector3;
      progress: number;
      speed: number;
      color: string;
    }>
  >([]);

  // Deterministic Golden-Angle Fibonacci Sphere Distribution Seed for 3D Layout
  const calculate3DPositions = useCallback(() => {
    const posMap = new Map<string, THREE.Vector3>();
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399963 rad

    const clusterMap = new Map<number, GraphNode[]>();
    nodes.forEach(node => {
      const g = node.group || 1;
      if (!clusterMap.has(g)) clusterMap.set(g, []);
      clusterMap.get(g)!.push(node);
    });

    clusterMap.forEach((clusterNodes, groupKey) => {
      const groupAngle = groupKey * ((Math.PI * 2) / Math.max(1, clusterMap.size));
      const clusterRadius = 220 + (groupKey % 5) * 45;
      const centroidX = Math.cos(groupAngle) * clusterRadius;
      const centroidY = Math.sin(groupAngle) * clusterRadius;
      const centroidZ = ((groupKey % 5) - 2) * 110;

      const clusterCount = clusterNodes.length;

      clusterNodes.forEach((node, idx) => {
        if (
          node.x !== undefined &&
          node.y !== undefined &&
          node.z !== undefined &&
          !isNaN(node.x) &&
          !isNaN(node.y) &&
          !isNaN(node.z)
        ) {
          posMap.set(node.id, new THREE.Vector3((node.x - 450) * 1.4, (350 - node.y) * 1.4, node.z));
          return;
        }

        // Golden-Angle Fibonacci Sphere distribution around cluster centroid
        const y = clusterCount === 1 ? 0 : 1 - (idx / (clusterCount - 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = goldenAngle * idx;

        const sphereRadius = 80 + (node.depth || 1) * 35;
        const offsetX = Math.cos(theta) * radiusAtY * sphereRadius;
        const offsetY = y * sphereRadius;
        const offsetZ = Math.sin(theta) * radiusAtY * sphereRadius;

        const posX = isNaN(centroidX + offsetX) ? 0 : centroidX + offsetX;
        const posY = isNaN(centroidY + offsetY) ? 0 : centroidY + offsetY;
        const posZ = isNaN(centroidZ + offsetZ) ? 0 : centroidZ + offsetZ;

        node.z = posZ;
        posMap.set(node.id, new THREE.Vector3(posX, posY, posZ));
      });
    });

    node3DPositions.current = posMap;
  }, [nodes]);

  // Helper to build canvas texture for node labels
  const createTextSprite = (text: string, colorHex: string, opacity = 1.0) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Sprite();

    ctx.fillStyle = 'rgba(3, 7, 18, 0.78)';
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 2;
    ctx.roundRect(8, 8, 240, 48, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.length > 20 ? text.slice(0, 18) + '…' : text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity,
      depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(38, 9.5, 1);
    return sprite;
  };

  // Disposable Group Helper (prevents GPU memory leaks)
  const disposeGroup = (group: THREE.Group) => {
    while (group.children.length > 0) {
      const child = group.children.pop();
      if (child) {
        if (child instanceof THREE.Group) {
          disposeGroup(child);
        } else {
          if ('geometry' in child && (child as any).geometry) {
            (child as any).geometry.dispose();
          }
          if ('material' in child && (child as any).material) {
            const mat = (child as any).material;
            if (Array.isArray(mat)) {
              mat.forEach(m => {
                if (m.map) m.map.dispose();
                m.dispose();
              });
            } else {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            }
          }
        }
      }
    }
  };

  // Initialize Three.js Viewport & Post-Processing Pipeline (or 2D Perspective Fallback if WebGL unavailable)
  useEffect(() => {
    if (!containerRef.current || !canvasMountRef.current) return;

    const mountEl = canvasMountRef.current;
    mountEl.innerHTML = '';

    // Pre-flight WebGL Context & Shader Precision Validation
    let canUseWebGL = false;
    let softGl = true;
    try {
      const probeCanvas = document.createElement('canvas');
      const probeGl = (probeCanvas.getContext('webgl2') ||
        probeCanvas.getContext('webgl')) as WebGLRenderingContext | null;
      if (probeGl && !probeGl.isContextLost()) {
        const vHigh = probeGl.getShaderPrecisionFormat(probeGl.VERTEX_SHADER, probeGl.HIGH_FLOAT);
        const fHigh = probeGl.getShaderPrecisionFormat(probeGl.FRAGMENT_SHADER, probeGl.HIGH_FLOAT);
        if (vHigh && fHigh && typeof vHigh.precision === 'number') {
          canUseWebGL = true;
          const ext = probeGl.getExtension('WEBGL_debug_renderer_info');
          const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER;
          const gpu = String(probeGl.getParameter(param));
          softGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
        }
        probeGl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    } catch {
      canUseWebGL = false;
    }

    setIsSoftwareGl(softGl);

    const width = Math.max(1, containerRef.current.clientWidth);
    const height = Math.max(1, containerRef.current.clientHeight);

    let renderer: THREE.WebGLRenderer | null = null;
    if (canUseWebGL) {
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !softGl,
          powerPreference: 'high-performance',
          alpha: true
        });
      } catch {
        renderer = null;
      }
    }

    // Fallback to 2D Canvas 3D Perspective Projection if WebGL context cannot be created
    if (!renderer) {
      setIsFallback3D(true);
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.className = 'w-full h-full block';
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      mountEl.appendChild(fallbackCanvas);

      let animId: number;
      let startTime = performance.now();

      const renderFallback3D = (now: number) => {
        animId = requestAnimationFrame(renderFallback3D);
        if (document.hidden || !containerRef.current) return;

        const ctx = fallbackCanvas.getContext('2d');
        if (!ctx) return;

        const w = fallbackCanvas.width;
        const h = fallbackCanvas.height;
        const elapsed = (now - startTime) * 0.001;

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);

        const yaw = gazeParallaxEnabledRef.current
          ? targetGazeRef.current.x * 0.35 + elapsed * 0.18
          : elapsed * 0.15;
        const pitch = gazeParallaxEnabledRef.current ? targetGazeRef.current.y * 0.25 : 0.15;

        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosX = Math.cos(pitch);
        const sinX = Math.sin(pitch);
        const fov = 620;
        const camDist = 820;

        const project = (v: THREE.Vector3) => {
          const x1 = v.x * cosY - v.z * sinY;
          const z1 = v.z * cosY + v.x * sinY;
          const y2 = v.y * cosX - z1 * sinX;
          const z2 = z1 * cosX + v.y * sinX;
          const scale = fov / Math.max(120, camDist + z2);
          return {
            sx: w * 0.5 + x1 * scale,
            sy: h * 0.5 - y2 * scale,
            scale,
            depth: z2
          };
        };

        const groupColors = ['#38bdf8', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#818cf8'];

        // Draw volumetric cluster continent auras
        const clusters = new Map<number, THREE.Vector3[]>();
        nodesRef.current.forEach(n => {
          const pos = node3DPositions.current.get(n.id);
          if (pos) {
            const g = n.group || 1;
            if (!clusters.has(g)) clusters.set(g, []);
            clusters.get(g)!.push(pos);
          }
        });

        clusters.forEach((pts, gKey) => {
          if (pts.length === 0) return;
          const center = new THREE.Vector3();
          pts.forEach(p => center.add(p));
          center.divideScalar(pts.length);
          const proj = project(center);
          const radius = Math.max(45, 130 * proj.scale);
          const color = groupColors[gKey % groupColors.length];
          const grad = ctx.createRadialGradient(proj.sx, proj.sy, radius * 0.1, proj.sx, proj.sy, radius);
          grad.addColorStop(0, `${color}33`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(proj.sx, proj.sy, radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw 3D Links & Photon Beams
        linksRef.current.forEach((link, idx) => {
          const sId = typeof link.source === 'string' ? link.source : link.source.id;
          const tId = typeof link.target === 'string' ? link.target : link.target.id;
          const sPos = node3DPositions.current.get(sId);
          const tPos = node3DPositions.current.get(tId);
          if (!sPos || !tPos) return;

          const p1 = project(sPos);
          const p2 = project(tPos);
          const color = PREDICATE_COLORS[link.relationship || 'Resonates'] || PREDICATE_COLORS.DEFAULT;

          ctx.strokeStyle = `${color}66`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();

          const prog = (elapsed * 0.45 * particleSpeedRef.current + idx * 0.17) % 1;
          const bx = p1.sx + (p2.sx - p1.sx) * prog;
          const by = p1.sy + (p2.sy - p1.sy) * prog;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(bx, by, 2.8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw 3D Nodes sorted back-to-front
        const projectedList = nodesRef.current
          .map(node => {
            const pos = node3DPositions.current.get(node.id) || new THREE.Vector3();
            return { node, ...project(pos) };
          })
          .sort((a, b) => b.depth - a.depth);

        const hitCandidates: Array<{ node: GraphNode; sx: number; sy: number; r: number }> = [];

        projectedList.forEach(({ node, sx, sy, scale }) => {
          const color = groupColors[(node.group || 1) % groupColors.length];
          const res = tensorResultRef.current.nodeResonanceMap[node.id] || node.quantumResonance || 0.6;
          const isSel = selectedNodeRef.current?.id === node.id || pinnedNodeRef.current?.id === node.id;
          const r = Math.max(5, (12 + res * 12 + (isSel ? 6 : 0)) * scale);

          hitCandidates.push({ node, sx, sy, r });

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();

          if (isSel) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sx, sy, r * 1.45, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#e2e8f0';
          ctx.textAlign = 'center';
          ctx.fillText(node.label.slice(0, 22), sx, sy - r - 6);
        });

        fallbackProjectedNodesRef.current = hitCandidates;
      };

      animId = requestAnimationFrame(renderFallback3D);

      const handleFallbackResize = () => {
        if (!containerRef.current) return;
        fallbackCanvas.width = Math.max(1, containerRef.current.clientWidth);
        fallbackCanvas.height = Math.max(1, containerRef.current.clientHeight);
      };
      window.addEventListener('resize', handleFallbackResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleFallbackResize);
        mountEl.innerHTML = '';
      };
    }

    setIsFallback3D(false);
    renderer.setSize(width, height);
    renderer.setPixelRatio(softGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.className = 'w-full h-full block';
    mountEl.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene with Holographic Depth Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');
    scene.fog = new THREE.FogExp2('#020617', 0.00135);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(48, width / height, 1, 3000);
    camera.position.set(0, 0, 750);
    cameraRef.current = camera;

    // Post-Processing EffectComposer + UnrealBloomPass (GPU mode)
    let composer: EffectComposer | null = null;
    if (!softGl) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.75, // strength
        0.45, // radius
        0.78  // threshold
      );
      composer.addPass(bloomPass);
      composerRef.current = composer;
      bloomPassRef.current = bloomPass;
    }

    // RoomEnvironment Studio PMREM Generator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting Rigs
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight1.position.set(400, 500, 300);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc084fc, 1.2);
    dirLight2.position.set(-400, -300, -200);
    scene.add(dirLight2);

    // Volumetric Particle Atmosphere Points
    const particleCount = 650;
    const atmosPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      atmosPositions[i] = (Math.random() - 0.5) * 1600;
      atmosPositions[i + 1] = (Math.random() - 0.5) * 1200;
      atmosPositions[i + 2] = (Math.random() - 0.5) * 1200;
    }
    const atmosGeom = new THREE.BufferGeometry();
    atmosGeom.setAttribute('position', new THREE.BufferAttribute(atmosPositions, 3));
    const atmosMat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const atmosPoints = new THREE.Points(atmosGeom, atmosMat);
    scene.add(atmosPoints);
    atmospherePointsRef.current = atmosPoints;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !softGl;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 1800;
    controls.minDistance = 100;
    controlsRef.current = controls;

    // Hierarchical Manifold Group (supports Gaze-Directional Parallax rotation)
    const rootManifoldGroup = new THREE.Group();
    const continentGroup = new THREE.Group();
    const nodeGroup = new THREE.Group();
    const linkGroup = new THREE.Group();
    const particleGroup = new THREE.Group();

    rootManifoldGroup.add(continentGroup);
    rootManifoldGroup.add(nodeGroup);
    rootManifoldGroup.add(linkGroup);
    rootManifoldGroup.add(particleGroup);
    scene.add(rootManifoldGroup);

    rootManifoldGroupRef.current = rootManifoldGroup;
    continentGroupRef.current = continentGroup;
    nodeMeshGroupRef.current = nodeGroup;
    linkMeshGroupRef.current = linkGroup;
    particleGroupRef.current = particleGroup;

    // Animation Loop with Visibility Pause, Marching Cubes Tessellation & Gaze Parallax
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Pause rendering when document hidden or unmounted
      if (document.hidden || !containerRef.current) return;

      const elapsed = clock.getElapsedTime();
      controls.update();

      // Rotate particle atmosphere slowly
      if (atmospherePointsRef.current) {
        atmospherePointsRef.current.rotation.y += 0.0002;
        atmospherePointsRef.current.rotation.x += 0.0001;
      }

      // Animate photon beam particles along link curves
      particleBeams.current.forEach(beam => {
        beam.progress = (beam.progress + beam.speed * 0.008 * particleSpeedRef.current) % 1;
        beam.mesh.position.lerpVectors(beam.start, beam.end, beam.progress);
      });

      // Real-time Marching Cubes Scalar Field Isosurface Morphing
      if (hullModeRef.current === 'MARCHING_CUBES' && marchingBlobsRef.current.length > 0) {
        marchingBlobsRef.current.forEach(blob => {
          blob.mc.reset();
          const subtract = 12;
          blob.relativePoints.forEach((pt, idx) => {
            // Fluid organic oscillation simulating live agent deliberation & resonance pulse
            const waveX = Math.sin(elapsed * 1.8 + pt.phase + idx) * 0.035;
            const waveY = Math.cos(elapsed * 1.5 + pt.phase) * 0.035;
            const waveZ = Math.sin(elapsed * 2.1 + idx * 1.3) * 0.035;

            const bx = THREE.MathUtils.clamp(0.5 + pt.rel.x + waveX, 0.18, 0.82);
            const by = THREE.MathUtils.clamp(0.5 + pt.rel.y + waveY, 0.18, 0.82);
            const bz = THREE.MathUtils.clamp(0.5 + pt.rel.z + waveZ, 0.18, 0.82);

            blob.mc.addBall(bx, by, bz, pt.strength, subtract);
          });
          blob.mc.update();
        });
      }

      // Gaze-Directional Parallax & Ambient Orbital Rotation
      if (rootManifoldGroupRef.current) {
        if (gazeParallaxEnabledRef.current) {
          const targetYaw = targetGazeRef.current.x * 0.22;
          const targetPitch = targetGazeRef.current.y * 0.16;
          rootManifoldGroupRef.current.rotation.y +=
            (targetYaw + elapsed * 0.04 - rootManifoldGroupRef.current.rotation.y) * 0.06;
          rootManifoldGroupRef.current.rotation.x +=
            (targetPitch - rootManifoldGroupRef.current.rotation.x) * 0.06;
        } else if (!softGl) {
          rootManifoldGroupRef.current.rotation.y += 0.0006;
          rootManifoldGroupRef.current.rotation.x *= 0.95;
        }
      }

      if (!softGl && composerRef.current && dofBloomEnabledRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = Math.max(1, containerRef.current.clientWidth);
      const h = Math.max(1, containerRef.current.clientHeight);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      if (composerRef.current) {
        composerRef.current.setSize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);

    // Complete Cleanup & WebGL Context Hygiene
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);

      marchingBlobsRef.current = [];
      if (nodeMeshGroupRef.current) disposeGroup(nodeMeshGroupRef.current);
      if (linkMeshGroupRef.current) disposeGroup(linkMeshGroupRef.current);
      if (particleGroupRef.current) disposeGroup(particleGroupRef.current);
      if (continentGroupRef.current) disposeGroup(continentGroupRef.current);
      if (atmospherePointsRef.current) {
        atmospherePointsRef.current.geometry.dispose();
        (atmospherePointsRef.current.material as THREE.Material).dispose();
      }
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      mountEl.innerHTML = '';
      sceneRef.current = null;
    };
  }, []);

  // Rebuild 3D Graph Meshes & Isosurfaces on Node/Link/Mode Updates
  useEffect(() => {
    calculate3DPositions();

    if (
      !sceneRef.current ||
      !nodeMeshGroupRef.current ||
      !linkMeshGroupRef.current ||
      !particleGroupRef.current ||
      !continentGroupRef.current
    )
      return;

    // Adjust Fog density for Holographic Depth-of-Field Fading
    const activeFocusNode = selectedNode || pinnedNode || nodes.find(n => n.id === focusedNodeId) || null;
    const activeClusterGroup = activeFocusNode?.group ?? null;

    if (sceneRef.current.fog instanceof THREE.FogExp2) {
      sceneRef.current.fog.density = dofBloomEnabled && activeClusterGroup !== null ? 0.0019 : 0.0012;
    }

    const nodeGroup = nodeMeshGroupRef.current;
    const linkGroup = linkMeshGroupRef.current;
    const particleGroup = particleGroupRef.current;
    const continentGroup = continentGroupRef.current;

    // Clear and dispose old child meshes
    disposeGroup(nodeGroup);
    disposeGroup(linkGroup);
    disposeGroup(particleGroup);
    disposeGroup(continentGroup);

    particleBeams.current = [];
    marchingBlobsRef.current = [];

    const groupColors = ['#38bdf8', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#818cf8'];

    // Group nodes by group/continent
    const clusters = new Map<number, Array<{ pos: THREE.Vector3; node: GraphNode }>>();
    nodes.forEach(node => {
      const g = node.group || 1;
      const pos = node3DPositions.current.get(node.id);
      if (pos) {
        if (!clusters.has(g)) clusters.set(g, []);
        clusters.get(g)!.push({ pos, node });
      }
    });

    // Render Volumetric 3D Knowledge Continent Hulls (Marching Cubes Isosurfaces vs Convex Hulls)
    clusters.forEach((items, groupKey) => {
      if (items.length === 0) return;
      const points = items.map(it => it.pos);
      const colorHex = groupColors[groupKey % groupColors.length];
      const isClusterFocused = activeClusterGroup === null || activeClusterGroup === groupKey;
      const dofFactor = dofBloomEnabled && !isClusterFocused ? 0.35 : 1.0;

      const center = new THREE.Vector3();
      points.forEach(p => center.add(p));
      center.divideScalar(points.length);

      let maxRadius = 65;
      points.forEach(p => {
        const d = p.distanceTo(center);
        if (d > maxRadius) maxRadius = d;
      });
      const boundScale = (maxRadius + 75) * 1.45;

      if (hullMode === 'MARCHING_CUBES') {
        const mcMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex),
          emissive: new THREE.Color(colorHex),
          emissiveIntensity: 0.28 * dofFactor,
          transparent: true,
          opacity: 0.22 * dofFactor,
          roughness: 0.15,
          metalness: 0.85,
          depthWrite: false,
          side: THREE.DoubleSide
        });

        const resolution = 24;
        const mc = new MarchingCubes(resolution, mcMaterial, false, false, 20000);
        mc.position.copy(center);
        mc.scale.set(boundScale, boundScale, boundScale);
        mc.isolation = 72;

        const relativePoints = items.map((it, idx) => {
          const rel = it.pos.clone().sub(center).divideScalar(boundScale * 2.1);
          const res = tensorResult.nodeResonanceMap[it.node.id] || it.node.quantumResonance || 0.75;
          return {
            rel,
            strength: 0.42 + res * 0.35,
            phase: idx * 1.15 + groupKey
          };
        });

        // Initial isosurface evaluation
        mc.reset();
        relativePoints.forEach(pt => {
          const bx = THREE.MathUtils.clamp(0.5 + pt.rel.x, 0.18, 0.82);
          const by = THREE.MathUtils.clamp(0.5 + pt.rel.y, 0.18, 0.82);
          const bz = THREE.MathUtils.clamp(0.5 + pt.rel.z, 0.18, 0.82);
          mc.addBall(bx, by, bz, pt.strength, 12);
        });
        mc.update();

        continentGroup.add(mc);
        marchingBlobsRef.current.push({
          mc,
          center,
          scale: boundScale,
          relativePoints,
          groupKey
        });
        return;
      }

      // CONVEX_HULL Mode (or fallback harmonic sphere if < 4 points)
      if (points.length >= 4) {
        try {
          const paddedPoints = points.map((p, pIdx) =>
            p.clone().add(
              new THREE.Vector3(
                (pIdx % 2 === 0 ? 1 : -1) * 14,
                (pIdx % 3 === 0 ? 1 : -1) * 14,
                (pIdx % 5 === 0 ? 1 : -1) * 14
              )
            )
          );
          const convexGeom = new ConvexGeometry(paddedPoints);
          const hullMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colorHex),
            transparent: true,
            opacity: 0.14 * dofFactor,
            roughness: 0.1,
            metalness: 0.85,
            depthWrite: false,
            side: THREE.DoubleSide
          });
          const hullMesh = new THREE.Mesh(convexGeom, hullMat);
          continentGroup.add(hullMesh);

          const wireGeom = new THREE.WireframeGeometry(convexGeom);
          const wireMat = new THREE.LineBasicMaterial({
            color: new THREE.Color(colorHex),
            transparent: true,
            opacity: 0.35 * dofFactor
          });
          const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
          continentGroup.add(wireMesh);
          return;
        } catch {
          // Fallback to harmonic sphere
        }
      }

      const sphereGeom = new THREE.IcosahedronGeometry(maxRadius + 45, 2);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.12 * dofFactor,
        roughness: 0.1,
        metalness: 0.9,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
      sphereMesh.position.copy(center);
      continentGroup.add(sphereMesh);
    });

    // Render Nodes with Holographic Depth Fading (DoF Focus)
    nodes.forEach(node => {
      const pos = node3DPositions.current.get(node.id) || new THREE.Vector3();
      const colorHex = groupColors[(node.group || 1) % groupColors.length];
      const resonance = tensorResult.nodeResonanceMap[node.id] || node.quantumResonance || 0.5;

      const isSelected = selectedNode?.id === node.id;
      const isPinned = pinnedNode?.id === node.id;
      const isFocused = focusedNodeId === node.id;
      const isInFocusedCluster = activeClusterGroup === null || activeClusterGroup === (node.group || 1);
      const dofNodeFactor = dofBloomEnabled && !isInFocusedCluster && !isSelected && !isFocused ? 0.32 : 1.0;

      const radius = 12 + resonance * 14 + (isSelected || isFocused ? 8 : 0);
      const geometry = new THREE.SphereGeometry(radius, 24, 24);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: (isSelected || isFocused ? 0.95 : 0.38) * dofNodeFactor,
        roughness: 0.25,
        metalness: 0.75,
        transparent: dofNodeFactor < 1.0,
        opacity: dofNodeFactor
      });

      const sphereMesh = new THREE.Mesh(geometry, material);
      sphereMesh.position.copy(pos);
      sphereMesh.userData = { node };

      // Halo Wireframe Ring for Selected / Pinned Nodes
      if (isSelected || isPinned || isFocused) {
        const ringGeom = new THREE.RingGeometry(radius * 1.4, radius * 1.7, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isPinned ? 0xfbbf24 : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.position.copy(pos);
        ringMesh.rotation.x = Math.PI / 2;
        nodeGroup.add(ringMesh);
      }

      // Label Sprite
      const sprite = createTextSprite(node.label, colorHex, dofNodeFactor);
      sprite.position.set(pos.x, pos.y + radius + 18, pos.z);
      nodeGroup.add(sprite);

      nodeGroup.add(sphereMesh);
    });

    // Render Links & Synaptic Photon Beams
    links.forEach((link, idx) => {
      const sId = typeof link.source === 'string' ? link.source : link.source.id;
      const tId = typeof link.target === 'string' ? link.target : link.target.id;

      const startPos = node3DPositions.current.get(sId);
      const endPos = node3DPositions.current.get(tId);

      if (!startPos || !endPos) return;

      const rel = link.relationship || 'Resonates';
      const colorHex = PREDICATE_COLORS[rel] || PREDICATE_COLORS.DEFAULT;

      const lineGeom = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.45
      });
      const lineMesh = new THREE.Line(lineGeom, lineMat);
      linkGroup.add(lineMesh);

      const particleGeom = new THREE.SphereGeometry(3.5, 12, 12);
      const particleMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex)
      });
      const particleMesh = new THREE.Mesh(particleGeom, particleMat);
      particleMesh.position.copy(startPos);
      particleGroup.add(particleMesh);

      particleBeams.current.push({
        mesh: particleMesh,
        start: startPos.clone(),
        end: endPos.clone(),
        progress: (idx * 0.15) % 1,
        speed: 0.8 + (link.strength || 0.8) * 0.6,
        color: colorHex
      });
    });
  }, [
    nodes,
    links,
    tensorResult,
    selectedNode,
    pinnedNode,
    focusedNodeId,
    hullMode,
    dofBloomEnabled,
    calculate3DPositions
  ]);

  // Handle Focus Camera Animation
  useEffect(() => {
    if (!focusTrigger || !cameraRef.current || !controlsRef.current) return;
    const targetPos = node3DPositions.current.get(focusTrigger.nodeId);
    if (targetPos) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;

      const startCamPos = camera.position.clone();
      const endCamPos = targetPos.clone().add(new THREE.Vector3(0, 0, 240));

      let step = 0;
      const animateFocus = () => {
        step += 0.05;
        if (step <= 1) {
          camera.position.lerpVectors(startCamPos, endCamPos, step);
          controls.target.lerp(targetPos, step);
          controls.update();
          requestAnimationFrame(animateFocus);
        }
      };
      animateFocus();
    }
  }, [focusTrigger]);

  // Handle Reset Camera Trigger
  useEffect(() => {
    if (resetAnchorsTrigger > 0 && cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 750);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [resetAnchorsTrigger]);

  // Raycasting & Gaze-Directional Parallax Tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const nx = (localX / Math.max(1, rect.width)) * 2 - 1;
    const ny = -(localY / Math.max(1, rect.height)) * 2 + 1;

    mouseRef.current.x = nx;
    mouseRef.current.y = ny;

    // Update Gaze Parallax Target
    targetGazeRef.current = { x: nx, y: ny };
    setGazeAngles({
      yaw: Number((nx * 12.5).toFixed(1)),
      pitch: Number((ny * 9.0).toFixed(1))
    });

    if (isFallback3D || !cameraRef.current || !nodeMeshGroupRef.current) {
      const hit = [...fallbackProjectedNodesRef.current]
        .reverse()
        .find(item => Math.hypot(localX - item.sx, localY - item.sy) <= item.r + 6);
      if (hit) {
        setHoveredNode(hit.node);
        setHoverPos({ x: localX, y: localY });
      } else {
        setHoveredNode(null);
        setHoverPos(null);
      }
      return;
    }

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(nodeMeshGroupRef.current.children, true);

    const hitMesh = intersects.find(i => i.object.userData?.node);
    if (hitMesh) {
      const hitNode = hitMesh.object.userData.node as GraphNode;
      setHoveredNode(hitNode);
      setHoverPos({ x: localX, y: localY });
    } else {
      setHoveredNode(null);
      setHoverPos(null);
    }
  };

  const handleClick = () => {
    if (hoveredNode && onSelectNode) {
      onSelectNode(hoveredNode);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      aria-label="Holographic 3D Spatial Force Layout Viewport"
      className="relative w-full h-full bg-[#020617] overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      <div ref={canvasMountRef} className="w-full h-full" />

      {/* Top 3D Control HUD Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 font-mono text-[10px]">
        <div
          data-swarm-target="3d-hud-badge"
          className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-sky-500/40 text-sky-200 font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.25)]"
        >
          <Box className="w-3.5 h-3.5 text-sky-400" />
          <span className="uppercase">Holographic 3D Manifold</span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-mono">CSR R#{tensorResult.rank4TensorNorm}</span>
        </div>

        {/* Real-time Manifold Tessellation Mode Toggle: Marching Cubes vs Convex Hulls */}
        <button
          type="button"
          data-swarm-target="3d-hull-mode-toggle"
          onClick={e => {
            e.stopPropagation();
            setHullMode(prev => (prev === 'MARCHING_CUBES' ? 'CONVEX_HULL' : 'MARCHING_CUBES'));
          }}
          className={cn(
            'px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-colors font-bold uppercase',
            hullMode === 'MARCHING_CUBES'
              ? 'bg-emerald-950/90 border-emerald-400/70 text-emerald-200'
              : 'bg-slate-950/90 border-slate-700 text-slate-300 hover:text-white'
          )}
          title="Toggle between Dynamic Marching Cubes Scalar Field Isosurfaces and Polyhedral Convex Hulls"
        >
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>{hullMode === 'MARCHING_CUBES' ? 'Marching Cubes: ON' : 'Convex Hulls'}</span>
        </button>

        {/* Holographic Bloom & Depth-of-Field (DoF) Focus Toggle */}
        <button
          type="button"
          data-swarm-target="3d-dof-bloom-toggle"
          onClick={e => {
            e.stopPropagation();
            setDofBloomEnabled(prev => !prev);
          }}
          className={cn(
            'px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-colors font-bold uppercase',
            dofBloomEnabled
              ? 'bg-purple-950/90 border-purple-400/70 text-purple-200'
              : 'bg-slate-950/90 border-slate-700 text-slate-400 hover:text-white'
          )}
          title="Toggle EffectComposer UnrealBloom & Holographic Depth-of-Field Cluster Focus"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>DoF & Bloom: {dofBloomEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Gaze-Directional Parallax Toggle */}
        <button
          type="button"
          data-swarm-target="3d-gaze-parallax-toggle"
          onClick={e => {
            e.stopPropagation();
            setGazeParallaxEnabled(prev => !prev);
          }}
          className={cn(
            'px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-colors font-bold uppercase',
            gazeParallaxEnabled
              ? 'bg-sky-950/90 border-sky-400/70 text-sky-200'
              : 'bg-slate-950/90 border-slate-700 text-slate-400 hover:text-white'
          )}
          title="Toggle Gaze-Directional Holographic Parallax Rotation"
        >
          <Eye className="w-3 h-3 text-sky-400" />
          <span>
            Gaze Parallax {gazeParallaxEnabled ? `(${gazeAngles.yaw}°, ${gazeAngles.pitch}°)` : 'OFF'}
          </span>
        </button>

        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            if (cameraRef.current && controlsRef.current) {
              cameraRef.current.position.set(0, 0, 750);
              controlsRef.current.target.set(0, 0, 0);
              controlsRef.current.update();
            }
          }}
          className="px-2.5 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Reset 3D Orbit Camera Target"
        >
          <RotateCcw className="w-3 h-3 text-sky-400" />
          <span>Reset</span>
        </button>

        <div className="flex items-center bg-slate-950/90 p-0.5 rounded-xl border border-slate-800 gap-1 text-[9px]">
          <span className="text-slate-400 px-2 font-bold">Beam:</span>
          {[0.5, 1.2, 2.5].map(spd => (
            <button
              key={spd}
              type="button"
              onClick={e => {
                e.stopPropagation();
                setParticleSpeed(spd);
              }}
              className={cn(
                'px-2 py-1 rounded-lg uppercase font-bold cursor-pointer transition-colors',
                particleSpeed === spd
                  ? 'bg-sky-500/30 text-sky-200 border border-sky-400/60'
                  : 'text-slate-500 hover:text-white'
              )}
            >
              {spd === 0.5 ? 'Slow' : spd === 1.2 ? 'Norm' : 'Hyper'}
            </button>
          ))}
        </div>

        {isSoftwareGl && (
          <span className="px-2 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold text-[9px]">
            SOFTWARE GL GUARD ACTIVE
          </span>
        )}
      </div>

      {/* Live Hover Node Tooltip */}
      <AnimatePresence>
        {hoveredNode && hoverPos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-30 pointer-events-none p-3 rounded-xl bg-slate-950/95 border border-sky-400/80 shadow-[0_0_25px_rgba(14,165,233,0.35)] backdrop-blur-xl text-white font-mono text-[11px] max-w-xs space-y-1.5"
            style={{
              left: Math.min(window.innerWidth - 320, hoverPos.x + 16),
              top: Math.min(window.innerHeight - 180, hoverPos.y + 16)
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[9px]">
              <span className="text-sky-400 font-bold uppercase">Node #{hoveredNode.id}</span>
              <span className="text-emerald-400 font-bold">
                ψ = {tensorResult.nodeResonanceMap[hoveredNode.id] || hoveredNode.quantumResonance || 0.85}
              </span>
            </div>
            <div className="font-bold text-xs text-white leading-tight">{hoveredNode.label}</div>
            {hoveredNode.description && (
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                {hoveredNode.description}
              </p>
            )}
            <div className="text-[9px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <span>Continent #{hoveredNode.group}</span>
              <span>·</span>
              <span>Depth L#{hoveredNode.depth || 1}</span>
              <span>·</span>
              <span className="text-purple-300">64D Embedded</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Graph3D;
