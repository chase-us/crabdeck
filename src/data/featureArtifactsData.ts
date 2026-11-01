export interface FeatureArtifact {
  id: string;
  number: string;
  title: string;
  fileName: string;
  category: 'Operations' | 'Intelligence' | 'Security' | 'Telemetry' | 'DevOps';
  icon: string;
  securityTier: 'Safe' | 'Write' | 'Destructive';
  endpoints: string[];
  assertions: string;
  summary: string;
  badgeColor: string;
  sections: {
    heading: string;
    body: string;
  }[];
}

export const FEATURE_ARTIFACTS: FeatureArtifact[] = [
  {
    id: 'FEAT-01',
    number: '01',
    title: 'The War Room & Quantum Omni-Layer',
    fileName: '01_war_room_omni_layer_architecture.md',
    category: 'Operations',
    icon: '🦀',
    securityTier: 'Safe',
    endpoints: ['GET 127.0.0.1:3001/api/health', 'GET 127.0.0.1:8000/health'],
    assertions: 'Smoke Asserts 01–05',
    summary: 'Central cockpit and telemetry HUD. Enforces document.hidden 0.0% idle CPU suspension and OffscreenCanvas single draw-call caching.',
    badgeColor: 'badge-gold',
    sections: [
      {
        heading: 'System Overview & Architecture',
        body: 'The War Room acts as the main command surface of Crabdeck on hermesclaw.ai. It coordinates live telemetry streams from local daemons, APU hardware metrics, and memory pipelines into a high-depth cyber-noir claymorphic dashboard.'
      },
      {
        heading: 'Document Visibility Governor (0.0% Idle CPU)',
        body: 'Utilizes document.hidden visibilitychange hooks to pause Three.js requestAnimationFrame loops, Web Audio oscillators, and polling sockets down to 0 Hz when backgrounded.'
      },
      {
        heading: 'Loopback Invariant',
        body: 'Confined strictly to local loopback (127.0.0.1:3001 Express -> 127.0.0.1:8000 FastAPI) with zero outbound WAN telemetry or third-party tracking.'
      }
    ]
  },
  {
    id: 'FEAT-02',
    number: '02',
    title: 'bHive 1,440-Node Swarm Hypermesh',
    fileName: '02_bhive_1440_swarm_hypermesh.md',
    category: 'Operations',
    icon: '🌐',
    securityTier: 'Safe',
    endpoints: ['bee2bee api (:4002)', 'P2P Gossip (:4003)', 'Redis crabdeck:events:bhive:*'],
    assertions: 'Smoke Asserts 06–12',
    summary: 'Decentralized P2P swarm mesh synchronizing autonomous AI agent populations across 1,440 daily minute slots and 12 cognitive epochs.',
    badgeColor: 'badge-blue',
    sections: [
      {
        heading: 'Temporal Minute-Slot Partitioning',
        body: 'Maps 1,440 minute slots (N_0000 to N_1439) across 12 2-hour cognitive epochs with rotating agent castes: Architect (reasoning), Weaver (code synthesis), and Breaker (fuzzing and AST validation).'
      },
      {
        heading: 'P2P Gossip Delta Protocol',
        body: 'Broadcasts node health states and synchronization payloads every 500ms via Redis Pub/Sub and local registry ~/.bee2bee/registry.json for peer rediscovery.'
      },
      {
        heading: 'Adaptive Dynamic Backoff',
        body: 'Scales polling check frequencies from 500ms under load down to 5,000ms when idle to prevent network saturation on constrained edge nodes.'
      }
    ]
  },
  {
    id: 'FEAT-03',
    number: '03',
    title: 'bHive Swarm Chat Room',
    fileName: '03_bhive_swarm_chat_room.md',
    category: 'Operations',
    icon: '💬',
    securityTier: 'Safe',
    endpoints: ['POST /api/chat/message', 'GET /api/chat/timeline', 'Redis Streams'],
    assertions: 'Smoke Asserts 13–16',
    summary: 'Real-time multi-agent communication stream featuring the Hermes v0.7.0 [ACK] terminal loopback supervisor to prevent conversational drift.',
    badgeColor: 'badge-purple',
    sections: [
      {
        heading: 'Multi-Agent Collaboration Bus',
        body: 'Provides an observable stream where Architect, Weaver, Breaker, and Operator agents negotiate tasks, report test outcomes, and escalate approvals.'
      },
      {
        heading: 'Anti-Loop Supervision ([ACK] Marker)',
        body: 'Enforces a strict 3-message conversational ceiling on autonomous threads. Turn 3 must carry the terminal [ACK] marker or the Swarm Sentinel halts the cycle.'
      },
      {
        heading: '24-Hour Timeline Scrubbing',
        body: 'Enables operators to inspect any agent conversation and tool outcome across the 24-hour cycle with cryptographic HMAC verification.'
      }
    ]
  },
  {
    id: 'FEAT-04',
    number: '04',
    title: 'Carbon SecAuditor & AST Patch Validation',
    fileName: '04_carbon_secauditor_ast_patch_engine.md',
    category: 'Security',
    icon: '🛡️',
    securityTier: 'Write',
    endpoints: ['POST /claw/carbon/audit-patch', 'POST /claw/hob/sandbox-task'],
    assertions: 'Smoke Assert 56, 57',
    summary: 'Static vulnerability scanner and syntax-guarded patch generator with Python ast.parse() validation and Hob sandbox realpath confinement.',
    badgeColor: 'badge-green',
    sections: [
      {
        heading: 'AST Syntax Gating Invariant',
        body: 'Runs ast.parse() on candidate code patches. Syntax errors result in REJECTED_INVALID_SYNTAX and withheld unified diffs, protecting production code.'
      },
      {
        heading: 'Hob Local Sandbox Realpath Confinement',
        body: 'Asserts os.path.commonpath([real_root, raw_target]) == real_root, raising ValueError on directory traversal attempts (e.g., ../../scripts/smoke.sh).'
      },
      {
        heading: 'Atomic Rollback Snapshots',
        body: 'Generates rollback undo tokens (undo_<uuid>) and 16-character HMAC-SHA256 signatures for every verified in-bounds file mutation.'
      }
    ]
  },
  {
    id: 'FEAT-05',
    number: '05',
    title: 'Tiered Memory Vault (CRAB-SHIELD)',
    fileName: '05_tiered_memory_vault_crab_shield.md',
    category: 'Security',
    icon: '💾',
    securityTier: 'Safe',
    endpoints: ['data/crabdeck_local.db (WAL)', 'Redis 7 Key-Value', 'ChromaDB / sqlite-vec'],
    assertions: 'Smoke Asserts 17–22',
    summary: 'Multi-tier persistent memory combining Hot State (sub-second SQLite WAL logs) and Cold State (sqlite-vec and Neo4j knowledge graphs).',
    badgeColor: 'badge-blue',
    sections: [
      {
        heading: 'Hot State (Sub-Second Recall)',
        body: 'SQLite 3 with PRAGMA journal_mode=WAL and PRAGMA synchronous=NORMAL delivers sub-millisecond append logs without file locks.'
      },
      {
        heading: 'Cold State (Vector & Graph Storage)',
        body: 'Embedded sqlite-vec extension and Neo4j graph eliminate LLM context amnesia across multi-day agent execution runs.'
      },
      {
        heading: 'Context Compaction & Thought Pruner',
        body: 'Periodically condenses long-running scratchpads into distilled semantic graph nodes, keeping context within 8k-32k window bounds.'
      }
    ]
  },
  {
    id: 'FEAT-06',
    number: '06',
    title: 'Copilot Fusion & Latency Circuit Breaker',
    fileName: '06_copilot_fusion_routing_matrix.md',
    category: 'Intelligence',
    icon: '⚡',
    securityTier: 'Safe',
    endpoints: ['route_copilot_fusion()', 'Ollama (:11434)', 'vLLM (:8001)', 'SGLang (:30000)'],
    assertions: 'Smoke Assert 58',
    summary: 'Multi-model router across single, cascade, and critique execution patterns with a 1,200ms latency ceiling and Le Chonk GGUF quantization matrix.',
    badgeColor: 'badge-gold',
    sections: [
      {
        heading: 'Dynamic Latency Circuit Breaker',
        body: 'Monitors inference latency. If latency exceeds 1,200ms, the router immediately trips and downgrades multi-stage critique patterns to single local dispatch.'
      },
      {
        heading: 'Sovereign Le Chonk Quantization Matrix',
        body: 'Selects optimal profiles: Q5_K_M for >=64GB systems, Q4_K_M for >=24GB, and IQ3_XXS for <16GB APUs and mobile Termux.'
      },
      {
        heading: 'Honest HTTP 503 Fallback',
        body: 'When local model daemons are offline or unloaded, emits clean 503 errors with startup commands rather than simulating false completions.'
      }
    ]
  },
  {
    id: 'FEAT-07',
    number: '07',
    title: 'Biological Heartbeat & Chronos-Sync',
    fileName: '07_biological_heartbeat_chronos_sync.md',
    category: 'Telemetry',
    icon: '💓',
    securityTier: 'Safe',
    endpoints: ['megabrain_pump.py', 'WebSocket /ws', '75°C Thermal Sensor'],
    assertions: 'Smoke Asserts 23–27',
    summary: '4-phase organic cardiac cycle (Systole, Flow, Diastole, Return) in megabrain_pump.py with 75°C Flux-Smith APU thermal governor ceiling.',
    badgeColor: 'badge-red',
    sections: [
      {
        heading: '4-Phase Biological Cardiac Cycle',
        body: 'Systole (task intake), Flow (tool dispatch & gossip), Diastole (WAL commits & compaction), and Return (consensus check and reset).'
      },
      {
        heading: '75°C Flux-Smith APU Thermal Governor',
        body: 'Monitors APU hardware temperature. Automatically scales down pulse frequency and suspends speculative branches if thermals breach 75°C.'
      },
      {
        heading: 'Chronos-Sync Socket Hot-Patching',
        body: 'Kernel-injected ping loop that detects and hot-reconnects dropped socket channels within a single cardiac interval.'
      }
    ]
  },
  {
    id: 'FEAT-08',
    number: '08',
    title: 'Megabrain Core Quantum Overclock',
    fileName: '08_megabrain_quantum_overclock.md',
    category: 'Intelligence',
    icon: '🔥',
    securityTier: 'Safe',
    endpoints: ['FastAPI Async Queue (:8000)', 'D-Wave Ocean QUBO Solver'],
    assertions: 'Smoke Asserts 28–33',
    summary: 'High-throughput context processing hub, FastAPI async queue gatekeeper, QUBO task allocation, and <500MB idle RAM envelope.',
    badgeColor: 'badge-red',
    sections: [
      {
        heading: 'QUBO Quantum-Inspired Task Allocator',
        body: 'Formulates multi-agent task distribution into Quadratic Unconstrained Binary Optimization problems, solved via simulated quantum annealing.'
      },
      {
        heading: 'Hardware Memory Envelope (<500MB RAM)',
        body: 'Enforces strict idle RAM bounds and monitors APU unified memory bus saturation to prevent swap thrashing.'
      },
      {
        heading: 'Interactive Tuning & Frequency Controls',
        body: 'Allows operators to tune core clock multipliers, flush cached working states, and sync swarm wiggles with a single click.'
      }
    ]
  },
  {
    id: 'FEAT-09',
    number: '09',
    title: 'Worker Bot Playground & Lifecycle',
    fileName: '09_worker_bot_playground_lifecycle.md',
    category: 'Operations',
    icon: '🤖',
    securityTier: 'Safe',
    endpoints: ['Moltcrab Watchdog Daemon', 'Zustand Swarm Store'],
    assertions: 'Smoke Asserts 34–38',
    summary: 'Autonomous worker bot population playground with spring-damper wiggle physics and Moltcrab container reconciliation.',
    badgeColor: 'badge-blue',
    sections: [
      {
        heading: 'Finite State Machine Lifecycle',
        body: 'Governs worker states: HAPPY, WIGGLY, SLEEPY, ZOOMING, CHILLIN, ERROR, LUCKY, LEARNING, LEGEND, and SYNCED.'
      },
      {
        heading: 'Moltcrab Container Reconciliation',
        body: 'Automatically recovers errored or drifted workers by restoring clean git HEAD snapshots and re-injecting HMAC nonces.'
      },
      {
        heading: 'Tactile Cartoon Kinematics',
        body: 'Interactive cards featuring reactive googly eyes and 120 Hz spring oscillations synchronized to operator cursor movements.'
      }
    ]
  },
  {
    id: 'FEAT-10',
    number: '10',
    title: 'Log-O-Matic 3000 & 58/58 Smoke Suite',
    fileName: '10_log_o_matic_58_smoke_suite.md',
    category: 'Telemetry',
    icon: '📜',
    securityTier: 'Safe',
    endpoints: ['scripts/smoke.sh (58/58)', 'vault/claw_activity.jsonl'],
    assertions: 'Smoke Asserts 01–58',
    summary: 'Unified high-throughput real-time telemetry console and Section 17 58/58 smoke test verification suite.',
    badgeColor: 'badge-purple',
    sections: [
      {
        heading: 'Real-Time Telemetry Aggregator',
        body: 'Sub-millisecond filtering across INFO, WARN, CRITICAL, SWARM, GLOOP, and SUCCESS levels with keyword search.'
      },
      {
        heading: 'Section 17 Smoke Suite Expansion (58/58)',
        body: 'Verifies 58 integration tests including AST patch gating (56), Hob traversal blocking (57), and latency circuit breaker trip (58).'
      },
      {
        heading: '100% Loopback Security Seal',
        body: 'Rigorously validates that all endpoints bind to 127.0.0.1 and completely block outbound WAN socket connections.'
      }
    ]
  },
  {
    id: 'FEAT-11',
    number: '11',
    title: 'Gloop Viscosity & Sludge Reserves',
    fileName: '11_gloop_viscosity_analytics_engine.md',
    category: 'Telemetry',
    icon: '🍌',
    securityTier: 'Safe',
    endpoints: ['ClayReactionDiffusionEngine.ts', 'VISCOSITY_VALVE API'],
    assertions: 'Smoke Asserts 39–43',
    summary: 'Fluid dynamics telemetry and Gray-Scott reaction-diffusion numerical stability manifolds with sludge reserve boost valves.',
    badgeColor: 'badge-gold',
    sections: [
      {
        heading: 'Gray-Scott Numerical Stability',
        body: 'Clamps feed rate (0.01 <= F <= 0.09) and kill rate (0.045 <= k <= 0.070) to prevent division-by-zero and NaN coordinate propagation.'
      },
      {
        heading: 'Sludge Buffer Reserves',
        body: 'Monitors memory sludge volume (liters) and saturation percentage, triggering automatic garbage collection alerts when exceeding 80%.'
      },
      {
        heading: 'Tactile Viscosity Valves',
        body: 'Interactive operator controls to inject 1,000 Liters of concentrated sludge or flush buffers back to nominal 50.0% baseline.'
      }
    ]
  },
  {
    id: 'FEAT-12',
    number: '12',
    title: 'Zero-Trust MCP Gateway & Edge Appliance',
    fileName: '12_zero_trust_mcp_gateway_edge_appliance.md',
    category: 'Security',
    icon: '🔒',
    securityTier: 'Destructive',
    endpoints: ['stdio IPC', 'HTTP SSE /api/events', 'GET/POST /claw/approvals'],
    assertions: 'Smoke Asserts 44–48, 57',
    summary: 'Dual-transport Model Context Protocol gateway with Zod/Pydantic validation, Win32 Job Objects/POSIX rlimits, and HMAC-SHA256 nonces.',
    badgeColor: 'badge-red',
    sections: [
      {
        heading: 'Dual-Transport MCP Gateway',
        body: 'Supports stdio IPC for zero-latency local tool dispatch and HTTP Server-Sent Events (SSE) for real-time dashboard streaming.'
      },
      {
        heading: 'Tri-Tier Security Classification',
        body: 'Safe (reads allowed immediately), Write (mutations logged with undo tokens), and Destructive (requires signed operator approval).'
      },
      {
        heading: 'Cryptographic Execution Nonces',
        body: 'Binds tool name, arguments, and timestamp into HMAC-SHA256 nonces, preventing replay attacks and prompt injection jailbreaks.'
      }
    ]
  },
  {
    id: 'FEAT-13',
    number: '13',
    title: 'Voice Conductor & Tactical Claw Override',
    fileName: '13_voice_conductor_tactical_override.md',
    category: 'Intelligence',
    icon: '🎙️',
    securityTier: 'Destructive',
    endpoints: ['Web Speech Recognition', 'Web Audio API Synth Pools'],
    assertions: 'Smoke Asserts 49–52',
    summary: 'Natural speech command parsing, zero-asset Web Audio procedural oscillator pools, and EXECUTE CLAW tactical override sequence.',
    badgeColor: 'badge-gold',
    sections: [
      {
        heading: 'Voice Grammar Intent Router',
        body: 'Translates speech commands into navigation transitions and system boosts with real-time confidence feedback.'
      },
      {
        heading: 'Zero-Asset Procedural Audio Synth',
        body: 'Synthesizes chimes, ascending wiggles, sirens, and fanfare chords directly in the browser with zero external MP3 dependencies.'
      },
      {
        heading: 'Tactile Claw Override Sequence',
        body: 'High-priority command dispatch that ramps up Gloop saturation, expands sludge reserves, and commits signed actions to the audit log.'
      }
    ]
  },
  {
    id: 'FEAT-14',
    number: '14',
    title: 'Frictionless Onboarding & Deployment',
    fileName: '14_frictionless_onboarding_and_deployment.md',
    category: 'DevOps',
    icon: '🚀',
    securityTier: 'Safe',
    endpoints: ['install-crabdeck.ps1', 'docker-compose.yml', 'disaster_recovery_reset.sh'],
    assertions: 'Smoke Asserts 53–55',
    summary: 'Turnkey PowerShell host installer, multi-service Docker Compose stack, native --no-docker fallback, and 4-stage disaster recovery.',
    badgeColor: 'badge-blue',
    sections: [
      {
        heading: 'Windows 11 PowerShell Host Installer',
        body: 'Automates pre-flight dependency validation (Node.js, Python, Git) and compiles assets with process-scoped execution policies.'
      },
      {
        heading: 'Multi-Service Container Infrastructure',
        body: 'docker-compose.yml orchestrates Redis 7, Express gateway, FastAPI Megabrain, and bHive mesh with healthcheck pings.'
      },
      {
        heading: '4-Stage Disaster Recovery Runbook',
        body: 'Drains workers, rebuilds SQLite tables, purges Redis caches, and re-certifies the 58/58 smoke suite in under 10 seconds.'
      }
    ]
  },
  {
    id: 'FEAT-15',
    number: '15',
    title: 'Google Drive & Google Picker Workspace',
    fileName: '15_google_drive_picker_workspace.md',
    category: 'Operations',
    icon: '📁',
    securityTier: 'Destructive',
    endpoints: ['picker.googleapis.com', 'drive.googleapis.com (v3)'],
    assertions: 'Workspace 1P OAuth Certified',
    summary: 'Native Google Picker dialog integration, Google Drive file explorer, zero-leak in-memory token caching, and mandatory confirmation for destructive actions.',
    badgeColor: 'badge-blue',
    sections: [
      {
        heading: 'Client-Side Google Picker Integration',
        body: 'Launches native Google Picker dialog with automatic ancestor iframe origin resolution, multi-view filters (Docs, Sheets, Slides, Images), and multi-select support.'
      },
      {
        heading: 'Zero-Leak In-Memory OAuth Caching',
        body: 'Authenticates with Firebase Auth GoogleAuthProvider across 13 Drive scopes, maintaining access tokens strictly in volatile memory.'
      },
      {
        heading: 'Mandatory Destructive Mutation Dialogs',
        body: 'Requires explicit user confirmation before any file deletion or modification to guarantee user data protection.'
      }
    ]
  }
];
