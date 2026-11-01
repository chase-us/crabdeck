import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';

const WITTY_QUOTES = [
  "Swarm is humming smoothly at 8.4ms! No coffee spills on the servers today. ☕",
  "Caught a stray syntax bug and sent it straight to the recycling bin! 🐛💨",
  "All 4 primary model cores are chill and operating well below 45°C. Pure zen. ❄️",
  "Pumping fresh gloop into the quantum reactor. It's extra viscous and shiny today! 💧",
  "Hermes and DeepSeek are having a polite, civilized debate about quantum coherence. 🧠✨",
  "Click my claws if you want to see a happy victory snap! 🦀🎉",
  "Pro tip: Click any node in the constellation map to see what task it's working on!",
  "Zero critical warnings across all sectors. You're running a tight ship, Operator! 🚢"
];

interface CrabEMascot3DProps {
  onStatusChange?: (status: string) => void;
  className?: string;
}

export const CrabEMascot3D: React.FC<CrabEMascot3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);

  // Three.js References
  const crabGroupRef = useRef<THREE.Group | null>(null);
  const leftClawRef = useRef<THREE.Group | null>(null);
  const rightClawRef = useRef<THREE.Group | null>(null);
  const leftPupilRef = useRef<THREE.Mesh | null>(null);
  const rightPupilRef = useRef<THREE.Mesh | null>(null);
  const eyelidsRef = useRef<THREE.Mesh[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Blinking loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Update eyelid visibility based on state
  useEffect(() => {
    eyelidsRef.current.forEach(eyelid => {
      eyelid.visible = isBlinking;
    });
  }, [isBlinking]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 240;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.replaceChildren(renderer.domElement);

    // 2. Lighting Setup (Warm Coral Key, Soft Baby Blue Fill, Golden Rim)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xff6b6b, 2.4);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x70d6ff, 1.5);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd700, 2.0);
    rimLight.position.set(0, -3, -3);
    scene.add(rimLight);

    // 3. Assemble Procedural Composite Crab-E (3-12 parts)
    const crabMaster = new THREE.Group();
    crabGroupRef.current = crabMaster;
    scene.add(crabMaster);

    // Part 1: Main Carapace Shell (Glossy Coral Red)
    const shellGeo = new THREE.SphereGeometry(0.72, 32, 24);
    shellGeo.scale(1.2, 0.75, 0.95);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0xff3355, // Coral Red
      roughness: 0.22,
      metalness: 0.2,
      emissive: 0x440818,
      emissiveIntensity: 0.2
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    crabMaster.add(shellMesh);

    // Part 2: Gold Crown Trim / Cyber Plaque
    const trimGeo = new THREE.TorusGeometry(0.76, 0.04, 16, 32);
    trimGeo.scale(1.2, 0.75, 0.95);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.15
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.rotation.x = Math.PI / 2;
    trimMesh.position.y = -0.05;
    crabMaster.add(trimMesh);

    // Part 3: Underbelly Plate
    const bellyGeo = new THREE.SphereGeometry(0.68, 24, 16);
    bellyGeo.scale(1.15, 0.5, 0.9);
    const bellyMat = new THREE.MeshStandardMaterial({
      color: 0xffe5d9,
      roughness: 0.4
    });
    const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
    bellyMesh.position.y = -0.22;
    crabMaster.add(bellyMesh);

    // Part 4 & 5: Big Googly Eyes on Stalks
    const eyeStalkMat = new THREE.MeshStandardMaterial({ color: 0xff3355, roughness: 0.3 });
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.1 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x070712, roughness: 0.1 });
    const eyelidMat = new THREE.MeshStandardMaterial({ color: 0xff2a55, roughness: 0.2 });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const createEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const xOffset = isLeft ? -0.36 : 0.36;

      // Stalk
      const stalkGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 12);
      const stalk = new THREE.Mesh(stalkGeo, eyeStalkMat);
      stalk.position.set(xOffset, 0.55, 0.25);
      stalk.rotation.z = isLeft ? 0.2 : -0.2;
      eyeGroup.add(stalk);

      // Sclera
      const eyeBallGeo = new THREE.SphereGeometry(0.22, 24, 24);
      const eyeBall = new THREE.Mesh(eyeBallGeo, eyeWhiteMat);
      eyeBall.position.set(xOffset * 1.15, 0.78, 0.32);
      eyeGroup.add(eyeBall);

      // Pupil
      const pupilGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(xOffset * 1.15, 0.78, 0.5);
      eyeGroup.add(pupil);

      // Highlight Glint
      const glintGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const glint = new THREE.Mesh(glintGeo, glintMat);
      glint.position.set(xOffset * 1.15 + 0.04, 0.83, 0.56);
      eyeGroup.add(glint);

      // Eyelid for Blinking
      const eyelidGeo = new THREE.SphereGeometry(0.23, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelid.position.set(xOffset * 1.15, 0.78, 0.32);
      eyelid.visible = false;
      eyeGroup.add(eyelid);
      eyelidsRef.current.push(eyelid);

      if (isLeft) leftPupilRef.current = pupil;
      else rightPupilRef.current = pupil;

      return eyeGroup;
    };

    crabMaster.add(createEye(true));
    crabMaster.add(createEye(false));

    // Part 6 & 7: Cute Claws / Pincers (Left & Right)
    const clawMat = new THREE.MeshStandardMaterial({
      color: 0xff4757,
      roughness: 0.2,
      metalness: 0.25
    });

    const createPincer = (isLeft: boolean) => {
      const pincerGroup = new THREE.Group();
      const xMult = isLeft ? -1 : 1;

      // Arm joint
      const armGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.45, 12);
      const arm = new THREE.Mesh(armGeo, clawMat);
      arm.position.set(xMult * 0.75, 0.05, 0.25);
      arm.rotation.z = xMult * -0.65;
      arm.rotation.y = xMult * 0.4;
      pincerGroup.add(arm);

      // Lower Palm
      const palmGeo = new THREE.SphereGeometry(0.24, 16, 16);
      palmGeo.scale(1.2, 0.8, 1);
      const palm = new THREE.Mesh(palmGeo, clawMat);
      palm.position.set(xMult * 1.05, 0.22, 0.4);
      pincerGroup.add(palm);

      // Top Pincer Claw
      const clawTipGeo = new THREE.ConeGeometry(0.12, 0.45, 16);
      const topClaw = new THREE.Mesh(clawTipGeo, clawMat);
      topClaw.position.set(xMult * 1.15, 0.45, 0.4);
      topClaw.rotation.z = xMult * -0.4;
      pincerGroup.add(topClaw);

      // Bottom Pincer Thumb
      const bottomClaw = new THREE.Mesh(clawTipGeo, clawMat);
      bottomClaw.position.set(xMult * 1.02, 0.38, 0.52);
      bottomClaw.rotation.z = xMult * -0.7;
      bottomClaw.rotation.x = 0.4;
      pincerGroup.add(bottomClaw);

      if (isLeft) leftClawRef.current = pincerGroup;
      else rightClawRef.current = pincerGroup;

      return pincerGroup;
    };

    crabMaster.add(createPincer(true));
    crabMaster.add(createPincer(false));

    // Part 8: Walking Legs (4 subtle cute legs)
    const legGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.55, 8);
    for (let i = 0; i < 4; i++) {
      const isLeft = i < 2;
      const xMult = isLeft ? -1 : 1;
      const zOffset = (i % 2 === 0 ? 0.1 : -0.25);

      const leg = new THREE.Mesh(legGeo, eyeStalkMat);
      leg.position.set(xMult * 0.7, -0.28, zOffset);
      leg.rotation.z = xMult * 0.75;
      leg.rotation.x = zOffset * 0.5;
      crabMaster.add(leg);
    }

    // Part 9: Cyber Visor & Mini Antenna Spark
    const sparkGeo = new THREE.OctahedronGeometry(0.09, 0);
    const sparkMat = new THREE.MeshStandardMaterial({
      color: 0x70d6ff, // Baby Blue
      emissive: 0x70d6ff,
      emissiveIntensity: 0.9,
      roughness: 0.1
    });
    const spark = new THREE.Mesh(sparkGeo, sparkMat);
    spark.position.set(0, 0.95, 0.1);
    crabMaster.add(spark);

    // Part 10: Rosy Pink Cheeks
    const blushGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xff66c4,
      emissive: 0xff66c4,
      emissiveIntensity: 0.5,
      roughness: 0.4
    });
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.35, -0.05, 0.65);
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.35, -0.05, 0.65);
    crabMaster.add(leftBlush, rightBlush);

    // Soft Radial Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(1.0, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.95;
    scene.add(shadow);

    // Mouse Tracking
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };
    container.addEventListener('mousemove', handlePointerMove);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Floating gentle bobbing
      if (crabMaster) {
        crabMaster.position.y = Math.sin(elapsed * 2.2) * 0.08;
        crabMaster.rotation.y = THREE.MathUtils.lerp(crabMaster.rotation.y, mouseRef.current.x * 0.45, 0.08);
        crabMaster.rotation.x = THREE.MathUtils.lerp(crabMaster.rotation.x, -mouseRef.current.y * 0.25, 0.08);
      }

      // Claw gentle idle pulsing / snapping
      if (leftClawRef.current) {
        leftClawRef.current.rotation.z = -0.2 + Math.sin(elapsed * 3) * 0.08;
      }
      if (rightClawRef.current) {
        rightClawRef.current.rotation.z = 0.2 - Math.sin(elapsed * 3 + 1) * 0.08;
      }

      // Pupils track mouse
      if (leftPupilRef.current && rightPupilRef.current) {
        const px = mouseRef.current.x * 0.035;
        const py = mouseRef.current.y * 0.035;
        leftPupilRef.current.position.x = -0.36 * 1.15 + px;
        leftPupilRef.current.position.y = 0.78 + py;
        rightPupilRef.current.position.x = 0.36 * 1.15 + px;
        rightPupilRef.current.position.y = 0.78 + py;
      }

      // Rotating crown spark
      spark.rotation.y += 0.04;
      spark.rotation.x += 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Resize listener
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      renderer.dispose();
      shellGeo.dispose();
      shellMat.dispose();
    };
  }, []);

  // Handle Crab-E click micro-interaction
  const handleCrabClick = useCallback(() => {
    soundFX.playWiggle();
    setPokeCount(prev => prev + 1);

    // Cycle quote
    setCurrentQuoteIndex(prev => (prev + 1) % WITTY_QUOTES.length);

    // Confetti burst on click
    confetti({
      particleCount: 28,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#FF3355', '#FFD700', '#70D6FF', '#00FF66', '#FF66C4']
    });

    // Animate jump / flip
    if (crabGroupRef.current) {
      crabGroupRef.current.position.y += 0.35;
      crabGroupRef.current.rotation.z += 0.2;
      setTimeout(() => {
        if (crabGroupRef.current) {
          crabGroupRef.current.position.y = 0;
          crabGroupRef.current.rotation.z = 0;
        }
      }, 250);
    }
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-between p-4 rounded-2xl bg-gradient-to-b from-[#1E1128]/90 via-[#120B1D]/95 to-[#080512] border border-[#FF66C4]/35 shadow-[0_10px_35px_-5px_rgba(255,102,196,0.18)] backdrop-blur-xl transition-all ${className}`}>
      {/* Speech Bubble Micro-Interaction */}
      <div className="relative w-full z-10 mb-1">
        <div className="relative bg-[#1A122E]/95 border border-[#FFD700]/40 rounded-2xl p-3 shadow-lg text-xs font-code text-zinc-100 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF3355] to-[#FFD700] flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            🦀
          </div>
          <div className="space-y-0.5 flex-grow">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-extrabold text-[#FFD700] tracking-wider">CRAB-E // COMPANION</span>
              <span className="text-[#00FF66] font-bold">ONLINE</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-200">
              "{WITTY_QUOTES[currentQuoteIndex]}"
            </p>
          </div>
        </div>
        {/* Speech Bubble Little Tail Arrow */}
        <div className="w-3 h-3 bg-[#1A122E] border-b border-r border-[#FFD700]/40 transform rotate-45 mx-auto -mt-1.5 z-0" />
      </div>

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        onClick={handleCrabClick}
        className="w-full h-[220px] cursor-pointer active:scale-95 transition-transform"
        title="Click Crab-E to poke, celebrate, and get fresh witty updates!"
      />

      {/* Mascot Footer Micro-Action Deck */}
      <div className="w-full pt-2 flex items-center justify-between border-t border-white/10 text-xs font-code">
        <button
          onClick={handleCrabClick}
          className="px-3 py-1.5 rounded-xl font-extrabold text-[11px] text-black bg-gradient-to-r from-[#FFD700] via-[#FF66C4] to-[#70D6FF] hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <span>🦀 POKE CRAB-E</span>
          <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded-full font-mono">{pokeCount}</span>
        </button>

        <span className="text-[10px] text-[#70D6FF] font-mono flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
          <span>VIBES: ZEN</span>
        </span>
      </div>
    </div>
  );
};
