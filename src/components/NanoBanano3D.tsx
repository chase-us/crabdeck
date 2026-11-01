import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundFX } from '../utils/audio';

interface NanoBanano3DProps {
  mood?: 'happy' | 'overclock' | 'chillin' | 'gloop-drip';
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showControls?: boolean;
}

export const NanoBanano3D: React.FC<NanoBanano3DProps> = ({
  mood = 'happy',
  interactive = true,
  size = 'md',
  showControls = true
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeMood, setActiveMood] = useState(mood);
  const [gloopDrippedCount, setGloopDrippedCount] = useState(42);
  const [isRotating, setIsRotating] = useState(true);

  // References for animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const bananaGroupRef = useRef<THREE.Group | null>(null);
  const eyesGroupRef = useRef<THREE.Group | null>(null);
  const thrustersGroupRef = useRef<THREE.Group | null>(null);
  const auraRingRef = useRef<THREE.Mesh | null>(null);
  const gloopDropletsRef = useRef<THREE.Mesh[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 2. Lighting Setup (Studio Cartoon Lighting: Key, Fill, Rim)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key Light (Warm Gold)
    const keyLight = new THREE.DirectionalLight(0xffd700, 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill Light (Baby Blue)
    const fillLight = new THREE.DirectionalLight(0x70d6ff, 1.4);
    fillLight.position.set(-4, 2, 2);
    scene.add(fillLight);

    // Rim/Back Light (Purple / Pink)
    const rimLight = new THREE.DirectionalLight(0xff66c4, 2.0);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    // Top Neon Green Accent
    const neonLight = new THREE.PointLight(0x00ff66, 1.8, 10);
    neonLight.position.set(0, 3, 1);
    scene.add(neonLight);

    // 3. Assemble Procedural Composite Nano Banano (3-12 parts)
    const bananaMaster = new THREE.Group();
    bananaGroupRef.current = bananaMaster;
    scene.add(bananaMaster);

    // Part 1: Curved Banana Body
    // Create a smooth curved tube path
    const curvePoints = [
      new THREE.Vector3(0, -1.1, 0.2),
      new THREE.Vector3(0.25, -0.6, 0.1),
      new THREE.Vector3(0.35, 0.0, 0),
      new THREE.Vector3(0.18, 0.7, -0.1),
      new THREE.Vector3(-0.15, 1.2, -0.15)
    ];
    const bananaCurve = new THREE.CatmullRomCurve3(curvePoints);
    const bodyGeo = new THREE.TubeGeometry(bananaCurve, 32, 0.42, 16, false);

    // Cartoon Banana Skin Material
    const bananaMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Gold
      roughness: 0.25,
      metalness: 0.15,
      emissive: 0x442200,
      emissiveIntensity: 0.1
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bananaMat);
    bodyMesh.castShadow = true;
    bananaMaster.add(bodyMesh);

    // Part 2: Dark Stem (Top)
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.35, 12);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x223812, // Deep organic stem green
      roughness: 0.6
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.set(-0.25, 1.35, -0.18);
    stemMesh.rotation.z = 0.35;
    bananaMaster.add(stemMesh);

    // Part 3: Banana Tip (Bottom)
    const tipGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.7 });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.set(-0.02, -1.18, 0.22);
    bananaMaster.add(tipMesh);

    // Part 4: Cartoon Googly Eyes & Pupils
    const eyesGroup = new THREE.Group();
    eyesGroupRef.current = eyesGroup;
    eyesGroup.position.set(0.38, 0.15, 0.25);

    const eyeGeo = new THREE.SphereGeometry(0.17, 24, 24);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.1
    });

    const pupilGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.1
    });

    const eyeHighlightGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Left Eye
    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.16, 0, 0);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.16, 0.02, 0.13);
    const leftHi = new THREE.Mesh(eyeHighlightGeo, highlightMat);
    leftHi.position.set(-0.14, 0.05, 0.18);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.16, 0, 0);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.16, 0.02, 0.13);
    const rightHi = new THREE.Mesh(eyeHighlightGeo, highlightMat);
    rightHi.position.set(0.18, 0.05, 0.18);

    eyesGroup.add(leftEye, leftPupil, leftHi, rightEye, rightPupil, rightHi);
    bananaMaster.add(eyesGroup);

    // Part 5: Cute Rosy Cartoon Cheeks (Pink)
    const cheekGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xff66c4, // Pink
      emissive: 0xff66c4,
      emissiveIntensity: 0.45,
      roughness: 0.3
    });
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(0.15, 0.02, 0.36);
    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.48, 0.02, 0.28);
    bananaMaster.add(leftCheek, rightCheek);

    // Part 6: Peel Cyber-Thrusters (Neon Green & Baby Blue Flares)
    const thrustersGroup = new THREE.Group();
    thrustersGroupRef.current = thrustersGroup;
    bananaMaster.add(thrustersGroup);

    const peelGeo = new THREE.ConeGeometry(0.18, 0.65, 5);
    peelGeo.rotateX(Math.PI);
    const peelMat = new THREE.MeshStandardMaterial({
      color: 0x00ff66, // Neon Green
      emissive: 0x00aa33,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.5
    });

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const peel = new THREE.Mesh(peelGeo, peelMat);
      peel.position.set(Math.cos(angle) * 0.35, -0.6, Math.sin(angle) * 0.35);
      peel.rotation.z = Math.cos(angle) * 0.6;
      peel.rotation.x = Math.sin(angle) * 0.6;
      thrustersGroup.add(peel);
    }

    // Part 7: Cyber Jet Ring / Thruster Collar (Purple)
    const collarGeo = new THREE.TorusGeometry(0.36, 0.07, 16, 24);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7, // Purple
      emissive: 0xa855f7,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0.2, -0.5, 0.05);
    bananaMaster.add(collarMesh);

    // Part 8: Holo-Antenna & Crown Spark (Pink + Red)
    const antennaStemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
    const antennaStemMat = new THREE.MeshStandardMaterial({ color: 0x70d6ff, metalness: 0.9 });
    const antennaStem = new THREE.Mesh(antennaStemGeo, antennaStemMat);
    antennaStem.position.set(-0.22, 1.6, -0.18);
    bananaMaster.add(antennaStem);

    const sparkGeo = new THREE.OctahedronGeometry(0.1, 0);
    const sparkMat = new THREE.MeshStandardMaterial({
      color: 0xff2a55, // Red/Pink
      emissive: 0xff2a55,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });
    const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
    sparkMesh.position.set(-0.22, 1.82, -0.18);
    bananaMaster.add(sparkMesh);

    // Part 9: Floating Baby Blue Holographic Aura Ring
    const auraGeo = new THREE.TorusGeometry(0.9, 0.025, 12, 48);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x70d6ff, // Baby Blue
      transparent: true,
      opacity: 0.65
    });
    const auraRing = new THREE.Mesh(auraGeo, auraMat);
    auraRing.rotation.x = Math.PI / 3;
    auraRing.position.set(0.1, 0, 0);
    auraRingRef.current = auraRing;
    bananaMaster.add(auraRing);

    // Part 10: Floating Gloop Sludge Droplets (Neon Green & Gold)
    const droplets: THREE.Mesh[] = [];
    const dropGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const dropMat = new THREE.MeshStandardMaterial({
      color: 0x00ff66,
      roughness: 0.1,
      metalness: 0.3,
      emissive: 0x00ff66,
      emissiveIntensity: 0.3
    });

    for (let i = 0; i < 5; i++) {
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.position.set(
        (Math.random() - 0.5) * 1.6,
        -0.8 + Math.random() * 1.6,
        (Math.random() - 0.5) * 1.6
      );
      drop.scale.setScalar(0.6 + Math.random() * 0.8);
      bananaMaster.add(drop);
      droplets.push(drop);
    }
    gloopDropletsRef.current = droplets;

    // Soft Radial Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(1.2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.6;
    scene.add(shadowMesh);

    // Mouse Tracking for Interactive Eye Follow & Orbit
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };

    if (interactive) {
      container.addEventListener('mousemove', handlePointerMove);
    }

    // Animation Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Floating / Bobbing Harmonic Motion
      if (bananaMaster) {
        bananaMaster.position.y = Math.sin(elapsedTime * 2.5) * 0.12;

        if (isRotating) {
          bananaMaster.rotation.y += 0.012;
        } else {
          // Subtle mouse tilt
          bananaMaster.rotation.y = THREE.MathUtils.lerp(
            bananaMaster.rotation.y,
            mouseRef.current.x * 0.6,
            0.08
          );
          bananaMaster.rotation.x = THREE.MathUtils.lerp(
            bananaMaster.rotation.x,
            -mouseRef.current.y * 0.4,
            0.08
          );
        }
      }

      // Eyes pupil tracking
      if (eyesGroupRef.current) {
        leftPupil.position.x = -0.16 + mouseRef.current.x * 0.04;
        leftPupil.position.y = 0.02 + mouseRef.current.y * 0.04;
        rightPupil.position.x = 0.16 + mouseRef.current.x * 0.04;
        rightPupil.position.y = 0.02 + mouseRef.current.y * 0.04;
      }

      // Spark Spin
      if (sparkMesh) {
        sparkMesh.rotation.y += 0.05;
        sparkMesh.rotation.x += 0.03;
      }

      // Aura Ring Rotation
      if (auraRingRef.current) {
        auraRingRef.current.rotation.z += 0.02;
        auraRingRef.current.rotation.y = Math.sin(elapsedTime) * 0.3;
      }

      // Gloop Droplets Bounce
      droplets.forEach((d, idx) => {
        d.position.y += Math.sin(elapsedTime * 3 + idx) * 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (interactive) container.removeEventListener('mousemove', handlePointerMove);
      renderer.dispose();
      bodyGeo.dispose();
      bananaMat.dispose();
    };
  }, [interactive, isRotating]);

  // Click Reaction: Playful cartoon bounce
  const handleBananaClick = () => {
    soundFX.playWiggle();
    setGloopDrippedCount(prev => prev + 1);

    if (bananaGroupRef.current) {
      // Squish animation in Three.js
      bananaGroupRef.current.scale.set(1.25, 0.8, 1.25);
      setTimeout(() => {
        if (bananaGroupRef.current) bananaGroupRef.current.scale.set(1, 1, 1);
      }, 180);
    }
  };

  const containerSizes = {
    sm: 'h-[180px] w-full',
    md: 'h-[300px] w-full',
    lg: 'h-[420px] w-full'
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#181133]/90 via-[#0C081D]/95 to-[#040209] border border-[#A855F7]/35 shadow-[0_0_35px_rgba(168,85,247,0.18)] group overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20" />

      {/* Floating Nano Banano Top Badge */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#0E0A1E]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#FFD700]/30 text-[11px] font-code text-[#FFD700] pointer-events-auto shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
          <span className="font-bold">NANO BANANO v3.8</span>
          <span className="text-zinc-500">|</span>
          <span className="text-[#70D6FF] uppercase">{activeMood}</span>
        </div>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className="pointer-events-auto px-2 py-1 text-[10px] font-code rounded border border-[#A855F7]/40 bg-[#160E2E]/80 text-[#C084FC] hover:text-white transition-all cursor-pointer"
        >
          {isRotating ? '🔄 AUTO-SPIN' : '🎯 MANUAL TILT'}
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        onClick={handleBananaClick}
        className={`${containerSizes[size]} cursor-pointer active:scale-98 transition-transform`}
        title="Click Nano Banano to squish & drip gloop!"
      />

      {/* Interactive Mascot Action Dock */}
      {showControls && (
        <div className="relative z-10 w-full pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#A855F7]/20 font-code text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveMood('happy');
              }}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activeMood === 'happy'
                  ? 'bg-[#FFD700] text-black shadow-[0_0_10px_rgba(255,215,0,0.4)]'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
              }`}
            >
              🍌 HAPPY
            </button>
            <button
              onClick={() => {
                soundFX.playWiggle();
                setActiveMood('overclock');
              }}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activeMood === 'overclock'
                  ? 'bg-[#FF2A55] text-white shadow-[0_0_10px_rgba(255,42,85,0.4)]'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
              }`}
            >
              ⚡ OVERCLOCK
            </button>
            <button
              onClick={() => {
                soundFX.playGloop();
                setActiveMood('gloop-drip');
              }}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activeMood === 'gloop-drip'
                  ? 'bg-[#00FF66] text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
              }`}
            >
              🧪 GLOOP DRIP
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBananaClick}
              className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-gradient-to-r from-[#FF66C4] to-[#A855F7] text-white shadow-[0_0_12px_rgba(255,102,196,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              ✨ BOUNCE BANANO
            </button>
            <span className="text-[10px] text-[#70D6FF] font-mono">
              💧 {gloopDrippedCount} L
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
