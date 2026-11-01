import { ModelBot, WorkerBot, LogEntry, SystemMetrics } from '../types';

export const INITIAL_MODELS: ModelBot[] = [
  {
    id: 'hermes',
    name: 'HERMES',
    subTitle: 'Hermesclaw Velocity Engine',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8QAdiXpBVDPTEm0JblGIS2dni7VuUxtLxVxnap0t7CAL55N4-L96KKCTHHraAhCMcldzbQHu3DW6hW97BwVkvCP5kI0mb804spRhMy9duTOUxlKKYmfqsqGoRAa7Skl7-G2mQCjKflcnQGSlfr__vG2urdnZX-hTA8by1v9jYyJU1qzjsbnRXwo8DdsX5oLBpZHGm_8xkQNkGV-L4Z0Y1uy0p3IK2ZYvyFbR82hXttSfskeVZdfABZiNVslQdqR_4d4ciBpufJsY',
    tagline: 'Velocity Tier: ULTRA. The fastest node in the quantum nest.',
    badge: 'ACTIVE PRIMARY',
    tier: 'ULTRA SPEED',
    latency: 8.4,
    active: true,
    color: 'from-[#FFD700] to-[#F59E0B]',
    accentHex: '#FFD700',
    description: 'Specialized in hyper-threaded reasoning, instant vector dispatch, and sub-10ms response times.',
    specs: [
      { label: 'Clock Frequency', value: '8.4 GHz' },
      { label: 'Wasp Frequency', value: '142 Hz' },
      { label: 'Vector Cache', value: '256 MB L1' },
      { label: 'Throughput', value: '12,400 T/s' }
    ]
  },
  {
    id: 'deepseek',
    name: 'DEEPSEEK',
    subTitle: 'Abyssal Deep Reasoning Core',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC4nf0SLYppHzK1ymLZKstngw6CEnQ1JSLTRgJoDO5gYSCE6y-nEfpJKyE50mN_JKPqKH6mZ9ZqNmgYRaH5u2LzTSfaspkuvsWjwKhbsX-2aWENjaEMRcH2FStqeAo97AXD908caILqCVsOEfLkedhGHvu2NoWWNEdpDAYxnEjlWDge5P2f7IehlK7HsA049gDzYRpO2jgI-XFoY9Grmd2u3kJu8_1pWPe9zPS6uYtKbL1bQNWm0giw0M1hTgo26-948z-18rRp8k',
    tagline: 'Depth Rating: ABYSSAL. Trench-level data extraction protocols active.',
    badge: 'HOT STANDBY',
    tier: 'ABYSSAL REASONING',
    latency: 14.2,
    active: false,
    color: 'from-[#70D6FF] to-[#38BDF8]',
    accentHex: '#70D6FF',
    description: 'Designed for massive multi-step reasoning, dense context trees, and trench-level code architecture.',
    specs: [
      { label: 'Depth Level', value: '11,000m Trench' },
      { label: 'Context Buffer', value: '2.5M Tokens' },
      { label: 'Math Density', value: '99.8%' },
      { label: 'Subsea Link', value: 'Direct Optic' }
    ]
  },
  {
    id: 'qwen',
    name: 'QWEN',
    subTitle: 'Wisdom Matrix Synthesis',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzGXdNxS6hbgIGO0KzLsdR-tkV-MuMATNJjk6K1oYd3G_JeOG-17Qp4BYq9Weo-7m_3D5gY3QCIUP8SQs0OeNBF2O021_wGQbxEntrmHx5JD5hUV6EpwtQr-dHf0q4neMNOlxJBeEyestpgLggyWvAK_1kyfROmFM-gngbWHMURKLtos46LDqjSBgb7ad2yH8dxSrCP0KZQ8hktTfP5BNsBpVJTXoMHEhoaYTxGXbVhpfwIu_9AUEI08QKlUf0jSSMEmg5FYOeCMs',
    tagline: 'Wisdom Buffer: MAX. Ancient logic meets quantum future-state.',
    badge: 'AUXILIARY',
    tier: 'MAX WISDOM',
    latency: 11.8,
    active: false,
    color: 'from-[#A855F7] to-[#FF66C4]',
    accentHex: '#A855F7',
    description: 'Unites multilingual semantic synthesis with high-frequency logic optimization.',
    specs: [
      { label: 'Wisdom Buffer', value: 'MAX 100%' },
      { label: 'Language Mesh', value: '180+ Dialects' },
      { label: 'Logic Precision', value: '99.91%' },
      { label: 'Owl Resonance', value: '432 Hz' }
    ]
  },
  {
    id: 'claw_alpha',
    name: 'CLAW_ALPHA_v1',
    subTitle: 'Pincer Tactical Swarm Operator',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_SEuGwTkpdvhv-Mlz67wjpEi1mlRbh7O9heFdTmvm8dpmmdqPljYpLsVHQbRr_mRgTzRYgOzuqs03-J0OIz9uX6wsH1DyCIIOTbhzz2nl8NazBR00Kr4b8rVggEjrzV2PfMQ_ms7AI6N5dq9PeaGwgDk8upX43sJN89UnvSuSGUonUQfxm2xBl7umqte_R4Is6LAXvURKHgD4FVDwFO0p8JQ43JobRaom9MeJu_yxvajlKegEGlac9frqXBJ0zDmnIm6Fq0SLl-A',
    tagline: 'Execution Protocol: HEAVY CLAW. Direct pincer manipulation of bytecode.',
    badge: 'EXPERIMENTAL',
    tier: 'CLAW OVERLORD',
    latency: 9.1,
    active: false,
    color: 'from-[#FF2A55] to-[#00FF66]',
    accentHex: '#FF2A55',
    description: 'Heavy pincer architecture designed for instant system-level hot-reloading and memory manipulation.',
    specs: [
      { label: 'Pincer Force', value: '8,500 PSI' },
      { label: 'Gloop Valve', value: 'OPEN 100%' },
      { label: 'Reflex Speed', value: '1.2ms' },
      { label: 'Crab Rank', value: 'COMMANDER' }
    ]
  }
];

export const INITIAL_WORKER_BOTS: WorkerBot[] = [
  { id: 'bot-001', name: 'Bot_001', status: 'HAPPY', task: 'Sorting Vector Matrix', wiggleFreq: 88, temperature: 41.2, efficiency: 99.4, color: '#00FF66', avatar: '🤖' },
  { id: 'bot-002', name: 'Bot_002', status: 'WIGGLY', task: 'Pumping Megabrain Gloop', wiggleFreq: 142, temperature: 46.8, efficiency: 98.1, color: '#FFD700', avatar: '🐝' },
  { id: 'bot-003', name: 'Bot_003', status: 'ZOOMING', task: 'FAISS Index Cache Sweep', wiggleFreq: 210, temperature: 49.3, efficiency: 99.9, color: '#00F0FF', avatar: '⚡' },
  { id: 'bot-004', name: 'Bot_004', status: 'SLEEPY', task: 'Cooling Thermal Radiator', wiggleFreq: 12, temperature: 34.0, efficiency: 89.2, color: '#A7E2FF', avatar: '💤' },
  { id: 'bot-005', name: 'Bot_005', status: 'CHILLIN', task: 'Monitoring Neo4j Graph', wiggleFreq: 45, temperature: 38.5, efficiency: 95.0, color: '#A855F7', avatar: '😎' },
  { id: 'bot-006', name: 'Bot_006', status: 'ERROR', task: 'Gloop Saturation Overflow!', wiggleFreq: 310, temperature: 68.4, efficiency: 62.1, color: '#FF0055', avatar: '💥' },
  { id: 'bot-007', name: 'Bot_007', status: 'LUCKY', task: 'Quantum Hash Collisions', wiggleFreq: 108, temperature: 40.1, efficiency: 100.0, color: '#22C55E', avatar: '🍀' },
  { id: 'bot-008', name: 'Bot_008', status: 'LEARNING', task: 'Absorbing Markdown Logs', wiggleFreq: 95, temperature: 42.6, efficiency: 97.5, color: '#3B82F6', avatar: '🧠' },
  { id: 'bot-009', name: 'Bot_009', status: 'LEGEND', task: 'Overclocking Core Lobe', wiggleFreq: 255, temperature: 52.0, efficiency: 99.8, color: '#EC4899', avatar: '👑' },
  { id: 'bot-010', name: 'Bot_010', status: 'SYNCED', task: 'Heartbeat Phase Lock', wiggleFreq: 120, temperature: 43.1, efficiency: 99.2, color: '#10B981', avatar: '💖' },
  { id: 'bot-011', name: 'Bot_011', status: 'WIGGLY', task: 'Crab Claw Wrench Lubing', wiggleFreq: 165, temperature: 45.3, efficiency: 96.8, color: '#F97316', avatar: '🦀' },
  { id: 'bot-012', name: 'Bot_012', status: 'ZOOMING', task: 'Throughput Pipeline 4.2TB', wiggleFreq: 220, temperature: 48.9, efficiency: 99.7, color: '#06B6D4', avatar: '🚀' }
];

export const INITIAL_LOGS: LogEntry[] = [
  { id: 'log-1', timestamp: '08:42:01.012', level: 'INFO', source: 'MEGABRAIN', message: 'Megabrain Core successfully initialized at 4.20 Gloop-Hertz.' },
  { id: 'log-2', timestamp: '08:42:01.189', level: 'SWARM', source: 'BHIVE_SWARM', message: 'Swarm density verified: 8,492 active nodes locked in hexagonal orbit.' },
  { id: 'log-3', timestamp: '08:42:01.405', level: 'SUCCESS', source: 'HERMES_CORE', message: 'Hermesclaw Velocity Engine online. Primary vector path established.' },
  { id: 'log-4', timestamp: '08:42:02.091', level: 'GLOOP', source: 'VISCOSITY', message: 'Gloop Saturation at 75.2%. Sludge volume stable at 4,209.88 Liters.' },
  { id: 'log-5', timestamp: '08:42:02.883', level: 'WARN', source: 'BOT_006', message: 'Wasp vibration spike detected in Node Cluster Alpha-7. Wiggle frequency 310Hz.' },
  { id: 'log-6', timestamp: '08:42:03.220', level: 'INFO', source: 'HEARTBEAT', message: 'Biological cycle phase [Systole -> Flow]. Pulse synchronized at 1.25 Hz.' }
];

export const INITIAL_METRICS: SystemMetrics = {
  gloopSaturation: 75.2,
  totalSludgeLtrs: 4209.88,
  activeWorkerBots: 14992,
  systemStability: 99.9,
  pulseFrequencyHz: 4.20,
  heartbeatPhase: 'Systole',
  swarmNodeCount: 8492,
  nodeDensity: 98.4,
  latencyMs: 8.4,
  throughputTbps: 4.2,
  thermalC: 42.8,
  memoryGb: 14.2
};
