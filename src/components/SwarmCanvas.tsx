import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';

export interface SwarmInteractiveNode {
  id: string;
  name: string;
  role: string;
  avatar: string;
  friendlyTask: string;
  latencyMs: number;
  health: number;
  color: string;
  statusText: string;
  sector: string;
  pos: [number, number, number];
}

const MAJOR_NODES: SwarmInteractiveNode[] = [
  {
    id: 'node-001',
    name: 'Hermes-Core',
    role: 'Primary Reasoning Maestro',
    avatar: '🧠',
    friendlyTask: 'Synthesizing strategic pipeline plans and coordinating sub-agents.',
    latencyMs: 6.2,
    health: 100,
    color: '#FFD700', // Gold
    statusText: 'Humming smoothly with zero context drift.',
    sector: 'Sector 01 // Cognitive Core',
    pos: [0, 48, 52]
  },
  {
    id: 'node-014',
    name: 'Weaver-Prime',
    role: 'Automated Code Refactorer',
    avatar: '🛠️',
    friendlyTask: 'Polishing TypeScript interfaces and AST trees for squeaky-clean builds.',
    latencyMs: 8.4,
    health: 99.8,
    color: '#00FF66', // Neon Green
    statusText: 'All 47 smoke test assertions verified passing.',
    sector: 'Sector 02 // Mesh Code Engine',
    pos: [-55, 22, 38]
  },
  {
    id: 'node-042',
    name: 'Breaker-Sentinel',
    role: 'Security & Invariant Auditor',
    avatar: '🛡️',
    friendlyTask: 'Guarding loopback boundaries (127.0.0.1) and hunting rogue memory leaks.',
    latencyMs: 9.1,
    health: 100,
    color: '#FF2A55', // Red
    statusText: 'Zero-trust socket firewall locked down tight.',
    sector: 'Sector 03 // Vault Perimeter',
    pos: [58, -24, 42]
  },
  {
    id: 'node-078',
    name: 'Gloop-Hydrator',
    role: 'Viscosity Hydro-Regulator',
    avatar: '🧪',
    friendlyTask: 'Pumping and circulating 1,420 cP laminar gloop through the reactor lines.',
    latencyMs: 11.2,
    health: 98.6,
    color: '#A855F7', // Purple
    statusText: 'Reserves steady at 18,450 Liters. No cavitation.',
    sector: 'Sector 04 // Fluid Dynamics',
    pos: [42, 45, -35]
  },
  {
    id: 'node-103',
    name: 'Quantum-Scheduler',
    role: 'QUBO Task Allocator',
    avatar: '⚡',
    friendlyTask: 'Aligning 15-second Chronos heartbeat pulses to eliminate state jitter.',
    latencyMs: 7.9,
    health: 100,
    color: '#70D6FF', // Baby Blue
    statusText: '4-phase cardiac cycle in perfect synchrony.',
    sector: 'Sector 01 // Chronos Kernel',
    pos: [-35, -52, 44]
  },
  {
    id: 'node-142',
    name: 'FAISS-Recall',
    role: 'Semantic Memory Scout',
    avatar: '📚',
    friendlyTask: 'Indexing 1,024,000 vector chunks in SQLite & ChromaDB for instant recall.',
    latencyMs: 4.8,
    health: 100,
    color: '#FF66C4', // Pink
    statusText: 'Sub-millisecond retrieval with zero agent amnesia.',
    sector: 'Sector 03 // Shell Cracked Vault',
    pos: [-62, -22, -38]
  },
  {
    id: 'node-210',
    name: 'Termux-Edge-Relay',
    role: 'Low-Power Mobile Daemon',
    avatar: '📱',
    friendlyTask: 'Managing thermal throttle ceiling (<75°C) and conserving battery.',
    latencyMs: 14.5,
    health: 99.2,
    color: '#70D6FF', // Baby Blue
    statusText: 'Resting at 0.0% background idle CPU overhead.',
    sector: 'Sector 05 // Edge Termux APU',
    pos: [28, -58, -30]
  },
  {
    id: 'node-312',
    name: 'Banano-Catalyst',
    role: 'Enzymatic Potassium Balancer',
    avatar: '🍌',
    friendlyTask: 'Dispensing playful cartoon motivation and high-potassium energy.',
    latencyMs: 5.1,
    health: 100,
    color: '#FFD700', // Gold
    statusText: 'Good vibes strictly enforced across the swarm.',
    sector: 'Sector 04 // Nano Banano Lab',
    pos: [0, -32, 62]
  }
];

interface SwarmCanvasProps {
  nodeCount?: number;
  pulseSpeed?: number;
  activeModelId?: string;
  onSelectInteractiveNode?: (node: SwarmInteractiveNode) => void;
}

export const SwarmCanvas: React.FC<SwarmCanvasProps> = ({
  nodeCount = 200,
  pulseSpeed = 1.0,
  activeModelId = 'hermes',
  onSelectInteractiveNode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showLines, setShowLines] = useState(true);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [nodeStats, setNodeStats] = useState({ nodes: nodeCount, fps: 60 });
  const [selectedNode, setSelectedNode] = useState<SwarmInteractiveNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [coffeePouredCount, setCoffeePouredCount] = useState<Record<string, number>>({});

  // Refs for three instance
  const sceneRef = useRef<THREE.Scene | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const beaconMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x060410, 0.007);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 175;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 2. Swarm Color Definitions
    const colorScheme = {
      hermes: new THREE.Color('#FFD700'),
      deepseek: new THREE.Color('#70D6FF'),
      qwen: new THREE.Color('#A855F7'),
      claw_alpha: new THREE.Color('#FF2A55'),
      claw_beta: new THREE.Color('#FF66C4')
    };
    const primaryColor = colorScheme[activeModelId as keyof typeof colorScheme] || new THREE.Color('#FFD700');
    const secondaryColor = new THREE.Color('#00FF66');

    // 3. Ambient Particle Swarm
    const count = nodeCount;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 60 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      velocities[i * 3] = (Math.random() - 0.5) * 0.35;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.35;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.35;

      const mixFactor = Math.random();
      const pColor = primaryColor.clone().lerp(secondaryColor, mixFactor);
      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Glow Texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 215, 0, 0.85)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.beginPath();
      pCtx.arc(16, 16, 16, 0, Math.PI * 2);
      pCtx.fill();
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 4.8,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 4. Constellation Lines Mesh
    const maxConnections = count * 6;
    const linePositions = new Float32Array(maxConnections * 3);
    const lineColors = new Float32Array(maxConnections * 3);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });

    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // 5. Central Megabrain Orb
    const coreGeo = new THREE.IcosahedronGeometry(18, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      wireframe: true,
      emissive: primaryColor,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 6. Interactive Clickable Major Beacon Nodes in 3D Space
    const beaconGroup = new THREE.Group();
    scene.add(beaconGroup);

    const meshMap = new Map<string, THREE.Mesh>();

    MAJOR_NODES.forEach(node => {
      const nodeSubGroup = new THREE.Group();
      nodeSubGroup.position.set(node.pos[0], node.pos[1], node.pos[2]);

      // Glowing Spherical Node Core
      const sphereGeo = new THREE.SphereGeometry(3.6, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color),
        emissive: new THREE.Color(node.color),
        emissiveIntensity: 0.85,
        roughness: 0.1
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.userData = { nodeId: node.id, nodeData: node };
      nodeSubGroup.add(sphereMesh);
      meshMap.set(node.id, sphereMesh);

      // Outer Halo Ring
      const haloGeo = new THREE.RingGeometry(4.8, 5.8, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      nodeSubGroup.add(haloMesh);

      beaconGroup.add(nodeSubGroup);
    });
    beaconMeshesRef.current = meshMap;

    // 7. Mouse Orbit Controls & Raycasting
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let dragDistance = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragDistance = 0;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        dragDistance += Math.abs(dx) + Math.abs(dy);

        scene.rotation.y += dx * 0.005;
        scene.rotation.x += dy * 0.005;
        prevMouse = { x: e.clientX, y: e.clientY };
      } else {
        // Raycast hover check
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const clickableMeshes = Array.from(meshMap.values());
        const intersects = raycasterRef.current.intersectObjects(clickableMeshes, false);

        if (intersects.length > 0) {
          renderer.domElement.style.cursor = 'pointer';
          const hitNodeId = intersects[0].object.userData.nodeId;
          setHoveredNodeId(hitNodeId);
        } else {
          renderer.domElement.style.cursor = 'grab';
          setHoveredNodeId(null);
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      // If minimal drag, treat as click trigger
      if (dragDistance < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        const clickVec = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -(((e.clientY - rect.top) / rect.height) * 2 - 1)
        );
        raycasterRef.current.setFromCamera(clickVec, camera);
        const clickableMeshes = Array.from(meshMap.values());
        const intersects = raycasterRef.current.intersectObjects(clickableMeshes, false);

        if (intersects.length > 0) {
          const nodeData = intersects[0].object.userData.nodeData as SwarmInteractiveNode;
          soundFX.playClick();
          setSelectedNode(nodeData);
          onSelectInteractiveNode?.(nodeData);
        }
      }
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    let animId: number;
    let lastTime = performance.now();
    let frames = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      frames++;
      if (now - lastTime >= 1000) {
        setNodeStats({ nodes: count + MAJOR_NODES.length, fps: frames });
        frames = 0;
        lastTime = now;
      }

      if (isPaused) {
        renderer.render(scene, camera);
        return;
      }

      const speedMultiplier = (isBoosting ? 2.5 : 1.0) * pulseSpeed;

      // Rotate central core
      coreMesh.rotation.x += 0.005 * speedMultiplier;
      coreMesh.rotation.y += 0.008 * speedMultiplier;

      // Update particle positions
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < count; i++) {
        posArray[i * 3] += velocities[i * 3] * speedMultiplier;
        posArray[i * 3 + 1] += velocities[i * 3 + 1] * speedMultiplier;
        posArray[i * 3 + 2] += velocities[i * 3 + 2] * speedMultiplier;

        // Bounce inside sphere boundary
        const distSq = posArray[i * 3] ** 2 + posArray[i * 3 + 1] ** 2 + posArray[i * 3 + 2] ** 2;
        if (distSq > 110 ** 2) {
          velocities[i * 3] *= -1;
          velocities[i * 3 + 1] *= -1;
          velocities[i * 3 + 2] *= -1;
        }
      }
      posAttr.needsUpdate = true;

      // Update Constellation Lines
      if (showLines) {
        let lineIdx = 0;
        const connectDist = 32;

        for (let i = 0; i < count; i++) {
          for (let j = i + 1; j < count; j++) {
            const dx = posArray[i * 3] - posArray[j * 3];
            const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
            const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < connectDist && lineIdx < maxConnections) {
              linePositions[lineIdx * 3] = posArray[i * 3];
              linePositions[lineIdx * 3 + 1] = posArray[i * 3 + 1];
              linePositions[lineIdx * 3 + 2] = posArray[i * 3 + 2];

              linePositions[(lineIdx + 1) * 3] = posArray[j * 3];
              linePositions[(lineIdx + 1) * 3 + 1] = posArray[j * 3 + 1];
              linePositions[(lineIdx + 1) * 3 + 2] = posArray[j * 3 + 2];

              const alpha = 1.0 - dist / connectDist;
              lineColors[lineIdx * 3] = primaryColor.r * alpha;
              lineColors[lineIdx * 3 + 1] = primaryColor.g * alpha;
              lineColors[lineIdx * 3 + 2] = primaryColor.b * alpha;

              lineColors[(lineIdx + 1) * 3] = primaryColor.r * alpha;
              lineColors[(lineIdx + 1) * 3 + 1] = primaryColor.g * alpha;
              lineColors[(lineIdx + 1) * 3 + 2] = primaryColor.b * alpha;

              lineIdx += 2;
            }
          }
        }

        lineGeometry.setDrawRange(0, lineIdx);
        (lineGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (lineGeometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
        linesMesh.visible = true;
      } else {
        linesMesh.visible = false;
      }

      // Gentle rotation
      particles.rotation.y += 0.0012 * speedMultiplier;
      beaconGroup.rotation.y += 0.0012 * speedMultiplier;

      // Pulse beacon halos
      const timeSec = now / 1000;
      beaconGroup.children.forEach((subGrp) => {
        const halo = subGrp.children[1] as THREE.Mesh;
        if (halo) {
          const s = 1 + Math.sin(timeSec * 3) * 0.12;
          halo.scale.set(s, s, s);
          halo.lookAt(camera.position);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animId);
      if (mount.contains(domEl)) {
        mount.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, [nodeCount, activeModelId, showLines, isBoosting, isPaused, pulseSpeed, onSelectInteractiveNode]);

  // Action: Send Virtual Coffee to a Node
  const handleSendCoffee = (node: SwarmInteractiveNode) => {
    soundFX.playWiggle();
    setCoffeePouredCount(prev => ({
      ...prev,
      [node.id]: (prev[node.id] || 0) + 1
    }));

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#70D6FF', '#00FF66', '#FF66C4']
    });
  };

  const handlePingNode = (node: SwarmInteractiveNode) => {
    soundFX.playClick();
    // Simulate brief latency dip
    setSelectedNode(prev => prev ? { ...prev, latencyMs: +(prev.latencyMs * 0.9).toFixed(1) } : null);
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-gradient-to-b from-[#0C081A] via-[#070512] to-[#030208] rounded-2xl overflow-hidden border border-[#A855F7]/30 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] backdrop-blur-xl group">
      {/* 3D Canvas Mounting Div */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing absolute inset-0" />

      {/* Subtle Cyber Grid */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-15" />

      {/* Top Floating Badge Bar */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-[#0E0A20]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#FFD700]/30 text-xs font-code text-[#F3E5AB] pointer-events-auto shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
          <span className="font-bold">bHIVE_SWARM // 3D CONSTELLATION MAP</span>
          <span className="text-zinc-600">|</span>
          <span className="text-white font-bold">{nodeStats.nodes} NODES</span>
          <span className="text-[#70D6FF]">[{nodeStats.fps} FPS]</span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowLines(!showLines)}
            className={`px-3 py-1.5 text-xs font-code rounded-xl border transition-all cursor-pointer ${
              showLines
                ? 'gold-gradient-bg text-black font-extrabold border-0 shadow-sm'
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'
            }`}
          >
            {showLines ? 'LINES: ON' : 'LINES: OFF'}
          </button>
          <button
            onClick={() => setIsBoosting(!isBoosting)}
            className={`px-3 py-1.5 text-xs font-code rounded-xl border transition-all cursor-pointer ${
              isBoosting
                ? 'bg-[#FF2A55] border-[#FF2A55] text-white animate-pulse shadow-[0_0_15px_rgba(255,42,85,0.4)]'
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:border-[#FFD700]'
            }`}
          >
            {isBoosting ? '⚡ HYPER-DRIVE' : 'BOOST SWARM'}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 text-xs font-code rounded-xl border bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:border-white transition-all cursor-pointer"
          >
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
        </div>
      </div>

      {/* Quick Interactive Beacon Node Selector Chips (Top-Middle) */}
      <div className="absolute top-16 left-4 right-4 flex items-center gap-1.5 overflow-x-auto py-1 z-10 pointer-events-auto scrollbar-none">
        <span className="text-[10px] text-zinc-400 font-code font-bold uppercase tracking-wider flex-shrink-0 bg-black/60 px-2 py-1 rounded-lg border border-white/5">
          QUICK NODES:
        </span>
        {MAJOR_NODES.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => {
                soundFX.playClick();
                setSelectedNode(node);
                onSelectInteractiveNode?.(node);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-code whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-white text-black font-bold border-white shadow-md'
                  : 'bg-[#0E0A20]/80 text-zinc-300 border-white/10 hover:border-[#FFD700]/50'
              }`}
            >
              <span>{node.avatar}</span>
              <span>{node.name}</span>
            </button>
          );
        })}
      </div>

      {/* Friendly Node Card Popup (when a node is clicked) */}
      {selectedNode && (
        <div className="absolute bottom-14 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-16 sm:w-[380px] z-20 pointer-events-auto bg-[#0E0A22]/95 backdrop-blur-xl border border-[#FFD700]/50 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.9)] font-code text-xs space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border"
                style={{ backgroundColor: `${selectedNode.color}25`, borderColor: selectedNode.color }}
              >
                {selectedNode.avatar}
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  {selectedNode.name}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800">
                    {selectedNode.health}% HEALTH
                  </span>
                </h4>
                <p className="text-[11px] font-medium" style={{ color: selectedNode.color }}>
                  {selectedNode.role}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="w-6 h-6 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Friendly Plain-English Task Description */}
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">CURRENT FOCUS:</div>
            <p className="text-zinc-200 text-xs leading-relaxed font-sans font-medium">
              "{selectedNode.friendlyTask}"
            </p>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-black/30 rounded-lg border border-white/5">
              <span className="text-zinc-400 block text-[10px]">NETWORK LATENCY</span>
              <strong className="text-[#00FF66] font-mono text-xs">
                {selectedNode.latencyMs}ms
              </strong>
              <span className="text-[9px] text-zinc-500 block leading-tight">Faster than a blink!</span>
            </div>
            <div className="p-2 bg-black/30 rounded-lg border border-white/5">
              <span className="text-zinc-400 block text-[10px]">SECTOR DOMAIN</span>
              <strong className="text-zinc-200 truncate block text-xs">
                {selectedNode.sector.split('//')[0]}
              </strong>
              <span className="text-[9px] text-zinc-500 block leading-tight">100% Loopback Locked</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
            <button
              onClick={() => handlePingNode(selectedNode)}
              className="px-3 py-1.5 rounded-xl font-bold text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚡ PING NODE</span>
            </button>

            <button
              onClick={() => handleSendCoffee(selectedNode)}
              className="px-3 py-1.5 rounded-xl font-extrabold text-[11px] text-black bg-gradient-to-r from-[#FFD700] to-[#FF66C4] hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>☕ SEND COFFEE</span>
              {(coffeePouredCount[selectedNode.id] || 0) > 0 && (
                <span className="text-[10px] bg-black/20 px-1 rounded-full font-mono">
                  {coffeePouredCount[selectedNode.id]}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Stats Bar */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-code text-zinc-400 bg-[#0E0A20]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 z-10 pointer-events-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-[#00FF66]">●</span> CONSTELLATION HEALTH: <strong className="text-[#F3E5AB]">100% NOMINAL</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-300">
            <span className="text-[#70D6FF]">●</span> MATRIX LATENCY: <strong className="text-[#70D6FF]">8.4ms</strong>
          </span>
        </div>
        <div className="text-zinc-400 hidden md:block">
          👆 CLICK ANY NODE IN THE 3D CONSTELLATION TO INSPECT ITS TASKS
        </div>
      </div>
    </div>
  );
};
