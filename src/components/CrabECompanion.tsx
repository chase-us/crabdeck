import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';
import { SystemMetrics } from '../types';

export interface WittyQuote {
  id: string;
  category: 'SWARM_VIBES' | 'GLOOP_LOGS' | 'HARDWARE_ZEN' | 'BUG_PATROL' | 'NEURAL_SYNAPSE' | 'COFFEE_BREAK' | 'CRAB_WISDOM';
  tag: string;
  emoji: string;
  text: string;
  reactionMood?: 'happy' | 'zen' | 'alert' | 'proud' | 'witty';
}

export const WITTY_STATUS_UPDATES: WittyQuote[] = [
  {
    id: 'quote-1',
    category: 'SWARM_VIBES',
    tag: '#SWARM_VIBES',
    emoji: '☕',
    text: "Swarm is humming smoothly at 8.4ms! No coffee spills on the optical interconnects today.",
    reactionMood: 'zen'
  },
  {
    id: 'quote-2',
    category: 'BUG_PATROL',
    tag: '#BUG_PATROL',
    emoji: '🐛',
    text: "Caught a stray syntax bug in Sector 4 and safely escorted it to the digital terrarium.",
    reactionMood: 'witty'
  },
  {
    id: 'quote-3',
    category: 'HARDWARE_ZEN',
    tag: '#HARDWARE_ZEN',
    emoji: '❄️',
    text: "All primary model cores are running below 42°C. Sweaters recommended in the server rack!",
    reactionMood: 'zen'
  },
  {
    id: 'quote-4',
    category: 'GLOOP_LOGS',
    tag: '#GLOOP_LOGS',
    emoji: '💧',
    text: "Pumping fresh gloop into the quantum reactor. It's extra viscous and holographic today!",
    reactionMood: 'proud'
  },
  {
    id: 'quote-5',
    category: 'NEURAL_SYNAPSE',
    tag: '#NEURAL_SYNAPSE',
    emoji: '🧠',
    text: "Hermes and DeepSeek are currently debating if tabs or spaces hold more quantum entanglement.",
    reactionMood: 'witty'
  },
  {
    id: 'quote-6',
    category: 'CRAB_WISDOM',
    tag: '#CRAB_WISDOM',
    emoji: '🦀',
    text: "Crabs walk sideways so they can always keep one eye on the future and one claw in git history.",
    reactionMood: 'proud'
  },
  {
    id: 'quote-7',
    category: 'SWARM_VIBES',
    tag: '#SWARM_VIBES',
    emoji: '✨',
    text: "8,492 swarm nodes synchronized with zero dropped frames. Virtual high-fives all around!",
    reactionMood: 'happy'
  },
  {
    id: 'quote-8',
    category: 'HARDWARE_ZEN',
    tag: '#HARDWARE_ZEN',
    emoji: '🍃',
    text: "Radeon APU thermal dissipation is peak efficiency. Local silicon is purring like a kitten.",
    reactionMood: 'zen'
  },
  {
    id: 'quote-9',
    category: 'GLOOP_LOGS',
    tag: '#GLOOP_LOGS',
    emoji: '🍓',
    text: "Gloop viscosity is sitting at strawberry milkshake consistency—absolutely prime for quantum flux!",
    reactionMood: 'happy'
  },
  {
    id: 'quote-10',
    category: 'CRAB_WISDOM',
    tag: '#CRAB_WISDOM',
    emoji: '🦞',
    text: "Pinch twice, git commit once. Old crustacean proverb never fails.",
    reactionMood: 'proud'
  },
  {
    id: 'quote-11',
    category: 'BUG_PATROL',
    tag: '#BUG_PATROL',
    emoji: '🛡️',
    text: "Intercepted a rogue NaN before it could even assemble a stack trace. You're welcome, Operator!",
    reactionMood: 'proud'
  },
  {
    id: 'quote-12',
    category: 'NEURAL_SYNAPSE',
    tag: '#NEURAL_SYNAPSE',
    emoji: '🌌',
    text: "Quantum coherence score: 99.98%. The remaining 0.02% is just vibing in parallel universes.",
    reactionMood: 'witty'
  },
  {
    id: 'quote-13',
    category: 'COFFEE_BREAK',
    tag: '#COFFEE_BREAK',
    emoji: '☕',
    text: "Sent a fresh cup of virtual espresso to Node #042. Its latency immediately dropped by 3ms!",
    reactionMood: 'happy'
  },
  {
    id: 'quote-14',
    category: 'SWARM_VIBES',
    tag: '#SWARM_VIBES',
    emoji: '🎉',
    text: "Click any node in the Constellation Map to inspect its load or dispatch a direct ping!",
    reactionMood: 'witty'
  },
  {
    id: 'quote-15',
    category: 'CRAB_WISDOM',
    tag: '#CRAB_WISDOM',
    emoji: '💖',
    text: "Crab-E daily self-diagnostic: 100% pinch readiness, 0% impostor syndrome, 400% cute.",
    reactionMood: 'happy'
  },
  {
    id: 'quote-16',
    category: 'HARDWARE_ZEN',
    tag: '#HARDWARE_ZEN',
    emoji: '🎧',
    text: "Fans are whispering sweet lofi jazz beats. Thermal throttle status: firmly at zero.",
    reactionMood: 'zen'
  }
];

export interface CrabECompanionProps {
  className?: string;
  metrics?: SystemMetrics;
  defaultIntervalSeconds?: number;
  onPoke?: () => void;
}

export const CrabECompanion: React.FC<CrabECompanionProps> = ({
  className = '',
  metrics,
  defaultIntervalSeconds = 8,
  onPoke
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Interval & Speech State
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(defaultIntervalSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isBubblePopping, setIsBubblePopping] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');

  // Three.js Scene References
  const crabGroupRef = useRef<THREE.Group | null>(null);
  const leftClawRef = useRef<THREE.Group | null>(null);
  const rightClawRef = useRef<THREE.Group | null>(null);
  const leftPupilRef = useRef<THREE.Mesh | null>(null);
  const rightPupilRef = useRef<THREE.Mesh | null>(null);
  const eyelidsRef = useRef<THREE.Mesh[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentQuote = WITTY_STATUS_UPDATES[currentQuoteIndex];

  // Helper to advance quote with smooth animation
  const advanceQuote = useCallback((nextIndex?: number) => {
    setIsBubblePopping(true);
    setProgressPercent(0);

    setTimeout(() => {
      setCurrentQuoteIndex(prev => {
        if (typeof nextIndex === 'number') {
          return (nextIndex + WITTY_STATUS_UPDATES.length) % WITTY_STATUS_UPDATES.length;
        }
        // Random pick avoiding current
        let next = Math.floor(Math.random() * WITTY_STATUS_UPDATES.length);
        if (next === prev && WITTY_STATUS_UPDATES.length > 1) {
          next = (next + 1) % WITTY_STATUS_UPDATES.length;
        }
        return next;
      });

      // Update timestamp
      const now = new Date();
      setLastUpdatedTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );

      setIsBubblePopping(false);
    }, 180);
  }, []);

  // Interval Timer Loop: updates progress every 100ms and advances quote when reaching 100%
  useEffect(() => {
    if (!isTimerRunning) return;

    const tickMs = 100;
    const totalMs = intervalSeconds * 1000;
    const stepPercent = (tickMs / totalMs) * 100;

    const intervalId = setInterval(() => {
      setProgressPercent(prev => {
        const next = prev + stepPercent;
        if (next >= 100) {
          advanceQuote();
          return 0;
        }
        return next;
      });
    }, tickMs);

    return () => clearInterval(intervalId);
  }, [isTimerRunning, intervalSeconds, advanceQuote]);

  // Mascot Blinking Loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 3600 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, []);

  // Sync eyelids with blink state
  useEffect(() => {
    eyelidsRef.current.forEach(eyelid => {
      eyelid.visible = isBlinking;
    });
  }, [isBlinking]);

  // Mascot Interactive Poke Handler
  const handlePoke = useCallback(() => {
    soundFX.playWiggle();
    setPokeCount(prev => prev + 1);
    onPoke?.();

    // Advance to a random quote immediately and reset timer
    advanceQuote();

    // Celebration Confetti burst
    confetti({
      particleCount: 32,
      spread: 65,
      origin: { y: 0.72 },
      colors: ['#FF2A55', '#FFD700', '#70D6FF', '#00FF66', '#FF66C4', '#A855F7']
    });

    // Animate mascot jump & happy flip
    if (crabGroupRef.current) {
      crabGroupRef.current.position.y += 0.38;
      crabGroupRef.current.rotation.z += 0.25;
      setTimeout(() => {
        if (crabGroupRef.current) {
          crabGroupRef.current.position.y = 0;
          crabGroupRef.current.rotation.z = 0;
        }
      }, 260);
    }
  }, [advanceQuote, onPoke]);

  // 3D Three.js Procedural Cartoon Mascot Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 200;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.75, 4.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.replaceChildren(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xff3355, 2.5);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x70d6ff, 1.6);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const goldRim = new THREE.DirectionalLight(0xffd700, 2.2);
    goldRim.position.set(0, -3, -3);
    scene.add(goldRim);

    // Crab Master Group
    const crabMaster = new THREE.Group();
    crabGroupRef.current = crabMaster;
    scene.add(crabMaster);

    // 1. Carapace (Shell) - Glossy Coral Red
    const shellGeo = new THREE.SphereGeometry(0.72, 32, 24);
    shellGeo.scale(1.2, 0.75, 0.95);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0xff3355,
      roughness: 0.22,
      metalness: 0.2,
      emissive: 0x440818,
      emissiveIntensity: 0.25
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    crabMaster.add(shellMesh);

    // 2. Gold Cyber Crown Trim
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

    // 3. Underbelly Plate
    const bellyGeo = new THREE.SphereGeometry(0.68, 24, 16);
    bellyGeo.scale(1.15, 0.5, 0.9);
    const bellyMat = new THREE.MeshStandardMaterial({
      color: 0xffe5d9,
      roughness: 0.4
    });
    const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
    bellyMesh.position.y = -0.22;
    crabMaster.add(bellyMesh);

    // 4. Googly Eyes on Stalks with Blinking Eyelids
    const eyeStalkMat = new THREE.MeshStandardMaterial({ color: 0xff3355, roughness: 0.3 });
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.1 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x070712, roughness: 0.1 });
    const eyelidMat = new THREE.MeshStandardMaterial({ color: 0xff2a55, roughness: 0.2 });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    eyelidsRef.current = [];

    const createEye = (isLeft: boolean) => {
      const eyeGroup = new THREE.Group();
      const xOffset = isLeft ? -0.36 : 0.36;

      // Stalk
      const stalkGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.35, 16);
      const stalk = new THREE.Mesh(stalkGeo, eyeStalkMat);
      stalk.position.set(xOffset, 0.5, 0.3);
      stalk.rotation.z = isLeft ? 0.22 : -0.22;
      stalk.rotation.x = 0.15;
      eyeGroup.add(stalk);

      // Eye Ball
      const ballGeo = new THREE.SphereGeometry(0.25, 24, 20);
      const eyeBall = new THREE.Mesh(ballGeo, eyeWhiteMat);
      eyeBall.position.set(xOffset * 1.15, 0.78, 0.42);
      eyeGroup.add(eyeBall);

      // Pupil
      const pupilGeo = new THREE.SphereGeometry(0.11, 20, 16);
      pupilGeo.scale(1, 1, 0.5);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(xOffset * 1.15, 0.78, 0.63);
      eyeGroup.add(pupil);

      if (isLeft) leftPupilRef.current = pupil;
      else rightPupilRef.current = pupil;

      // Eye Glint (Cute cartoon sparkle)
      const glintGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const glint = new THREE.Mesh(glintGeo, glintMat);
      glint.position.set(xOffset * 1.15 + (isLeft ? -0.04 : 0.04), 0.83, 0.67);
      eyeGroup.add(glint);

      // Eyelid for Blinking
      const eyelidGeo = new THREE.SphereGeometry(0.27, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.7);
      const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelid.position.set(xOffset * 1.15, 0.78, 0.42);
      eyelid.rotation.x = -Math.PI / 2.3;
      eyelid.visible = false;
      eyeGroup.add(eyelid);
      eyelidsRef.current.push(eyelid);

      return eyeGroup;
    };

    crabMaster.add(createEye(true));
    crabMaster.add(createEye(false));

    // 5. Claws (Left & Right)
    const clawMat = new THREE.MeshStandardMaterial({
      color: 0xff2244,
      roughness: 0.2,
      metalness: 0.25,
      emissive: 0x330011,
      emissiveIntensity: 0.2
    });
    const goldPinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });

    const createClaw = (isLeft: boolean) => {
      const clawGroup = new THREE.Group();
      const side = isLeft ? -1 : 1;

      // Arm joint 1
      const arm1Geo = new THREE.CylinderGeometry(0.08, 0.09, 0.4, 16);
      const arm1 = new THREE.Mesh(arm1Geo, clawMat);
      arm1.position.set(side * 0.9, 0.05, 0.1);
      arm1.rotation.z = side * 0.9;
      clawGroup.add(arm1);

      // Main Pincer Body
      const pincerGroup = new THREE.Group();
      pincerGroup.position.set(side * 1.35, 0.35, 0.3);

      const palmGeo = new THREE.SphereGeometry(0.28, 20, 16);
      palmGeo.scale(1.2, 0.8, 0.7);
      const palm = new THREE.Mesh(palmGeo, clawMat);
      pincerGroup.add(palm);

      // Pincer Tip Upper
      const upperGeo = new THREE.ConeGeometry(0.14, 0.45, 16);
      upperGeo.scale(1, 1, 0.6);
      const upper = new THREE.Mesh(upperGeo, clawMat);
      upper.position.set(side * 0.1, 0.26, 0);
      upper.rotation.z = side * -0.4;
      pincerGroup.add(upper);

      // Pincer Tip Lower
      const lowerGeo = new THREE.ConeGeometry(0.12, 0.38, 16);
      lowerGeo.scale(1, 1, 0.6);
      const lower = new THREE.Mesh(lowerGeo, clawMat);
      lower.position.set(side * 0.05, -0.22, 0);
      lower.rotation.z = side * 0.4 + Math.PI;
      pincerGroup.add(lower);

      // Golden Pincer Joint Rivet
      const rivetGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 12);
      const rivet = new THREE.Mesh(rivetGeo, goldPinMat);
      rivet.rotation.x = Math.PI / 2;
      pincerGroup.add(rivet);

      clawGroup.add(pincerGroup);
      return { clawGroup, pincerGroup };
    };

    const leftClawObj = createClaw(true);
    const rightClawObj = createClaw(false);
    leftClawRef.current = leftClawObj.pincerGroup;
    rightClawRef.current = rightClawObj.pincerGroup;

    crabMaster.add(leftClawObj.clawGroup);
    crabMaster.add(rightClawObj.clawGroup);

    // 6. Cute Blush Cheeks
    const blushGeo = new THREE.SphereGeometry(0.1, 16, 16);
    blushGeo.scale(1.4, 0.8, 0.4);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff66c4, transparent: true, opacity: 0.65 });

    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.35, -0.05, 0.65);
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.35, -0.05, 0.65);
    crabMaster.add(leftBlush, rightBlush);

    // 7. Rotating Cyber Star Spark atop Crown
    const sparkGeo = new THREE.OctahedronGeometry(0.12, 0);
    const sparkMat = new THREE.MeshStandardMaterial({
      color: 0x70d6ff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.1
    });
    const spark = new THREE.Mesh(sparkGeo, sparkMat);
    spark.position.set(0, 0.85, 0);
    crabMaster.add(spark);

    // 8. Contact Drop Shadow
    const shadowGeo = new THREE.CircleGeometry(1.0, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.92;
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
        leftClawRef.current.rotation.z = -0.2 + Math.sin(elapsed * 3) * 0.09;
      }
      if (rightClawRef.current) {
        rightClawRef.current.rotation.z = 0.2 - Math.sin(elapsed * 3 + 1) * 0.09;
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

      // Spark rotation
      spark.rotation.y += 0.04;
      spark.rotation.x += 0.02;

      renderer.render(scene, camera);
    };

    animate();

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

  // Tag Color helper
  const getTagColor = (cat: WittyQuote['category']) => {
    switch (cat) {
      case 'SWARM_VIBES':
        return 'text-cyan-400 border-cyan-800/40 bg-cyan-950/40';
      case 'GLOOP_LOGS':
        return 'text-amber-400 border-amber-800/40 bg-amber-950/40';
      case 'HARDWARE_ZEN':
        return 'text-emerald-400 border-emerald-800/40 bg-emerald-950/40';
      case 'BUG_PATROL':
        return 'text-sky-400 border-sky-800/40 bg-sky-950/40';
      case 'NEURAL_SYNAPSE':
        return 'text-indigo-400 border-indigo-800/40 bg-indigo-950/40';
      case 'COFFEE_BREAK':
        return 'text-amber-300 border-amber-800/40 bg-amber-950/40';
      case 'CRAB_WISDOM':
      default:
        return 'text-rose-400 border-rose-800/40 bg-rose-950/40';
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between p-5 rounded-3xl clay-card-3d transition-all ${className}`}
    >
      {/* 1. Header Bar: Companion Status & Interval Timer Controls */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
          <span className="font-display font-extrabold text-[#FFD700] text-sm tracking-tight">Crab-E 3D Mascot</span>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
          {/* Pause / Play Toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              setIsTimerRunning(prev => !prev);
            }}
            className="text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer px-1 flex items-center gap-1"
            title={isTimerRunning ? 'Pause auto-interval timer' : 'Resume auto-interval timer'}
          >
            <span>{isTimerRunning ? '⏸' : '▶'}</span>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              {isTimerRunning ? 'Auto' : 'Paused'}
            </span>
          </button>

          {/* Interval Frequency Switcher */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-slate-800 text-[10px] font-mono">
            {[5, 8, 12].map(sec => (
              <button
                key={sec}
                onClick={() => {
                  soundFX.playClick();
                  setIntervalSeconds(sec);
                  setProgressPercent(0);
                }}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  intervalSeconds === sec
                    ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Change timer interval to ${sec} seconds`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive Speech Bubble Triggered by Interval Timer */}
      <div className="relative w-full z-10 my-3">
        <div
          className={`relative bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 shadow-sm text-xs text-slate-200 transition-all duration-200 ${
            isBubblePopping ? 'opacity-30 scale-98 translate-y-1' : 'opacity-100 scale-100 translate-y-0'
          }`}
        >
          {/* Top Meta Row: Category Tag, Emoji & Timestamp */}
          <div className="flex items-center justify-between gap-2 mb-2 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded font-mono font-medium border ${getTagColor(currentQuote.category)}`}>
                {currentQuote.emoji} {currentQuote.tag}
              </span>
              <span className="text-slate-500 font-mono text-[9px] hidden sm:inline">
                #{currentQuoteIndex + 1}/{WITTY_STATUS_UPDATES.length}
              </span>
            </div>

            <span className="text-slate-400 font-mono text-[10px]">{lastUpdatedTime}</span>
          </div>

          {/* The Speech Bubble Body: Witty Status Quote */}
          <p className="text-[13px] leading-relaxed text-slate-100 font-sans min-h-[38px] flex items-center">
            "{currentQuote.text}"
          </p>

          {/* Animated Countdown Progress Bar for Interval Timer */}
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  isTimerRunning ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
                style={{ width: `${isTimerRunning ? progressPercent : 100}%` }}
              />
            </div>

            {/* Manual Cycle Chevrons & Shuffle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundFX.playClick();
                  advanceQuote(currentQuoteIndex - 1);
                }}
                className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer border border-slate-800"
                title="Previous witty update"
              >
                ◀
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  advanceQuote(currentQuoteIndex + 1);
                }}
                className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer border border-slate-800"
                title="Next witty update"
              >
                ▶
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  advanceQuote();
                }}
                className="w-5 h-5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-400 flex items-center justify-center text-[10px] transition-colors cursor-pointer border border-cyan-800/40"
                title="Randomize witty status update"
              >
                🎲
              </button>
            </div>
          </div>
        </div>

        {/* Downward Speech Bubble Triangle Pointer */}
        <div className="w-3 h-3 bg-slate-950 border-b border-r border-slate-800 transform rotate-45 mx-auto -mt-1.5 z-0" />
      </div>

      {/* 3. Interactive 3D WebGL Mascot Canvas */}
      <div
        ref={mountRef}
        onClick={handlePoke}
        className="w-full h-[180px] cursor-pointer active:scale-95 transition-transform relative select-none"
        title="Click Crab-E to poke, trigger a victory flip & confetti, and get an instant witty reply!"
      >
        {/* Subtle click guide */}
        <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500 bg-slate-950/70 border border-slate-800 px-1.5 py-0.5 rounded pointer-events-none">
          Click to poke
        </div>
      </div>

      {/* 4. Mascot Action & Telemetry Footer */}
      <div className="w-full pt-3 flex items-center justify-between border-t border-white/10 text-xs">
        <button
          onClick={handlePoke}
          className="px-3.5 py-2 rounded-xl font-display font-extrabold text-xs clay-btn-red active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <span>🦀 POKE CRAB-E</span>
          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full font-code">{pokeCount}</span>
        </button>

        <div className="flex items-center gap-2 text-[10px] font-code">
          {metrics && (
            <span className="text-zinc-400 hidden sm:inline">
              Swarm: <span className="text-[#00FF66] font-bold">{metrics.swarmNodeCount}</span>
            </span>
          )}
          <span className="text-[#70D6FF] flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
            <span>MOOD: {currentQuote.reactionMood?.toUpperCase() || 'ZEN'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
