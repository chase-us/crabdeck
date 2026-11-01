export type AppView = 
  | 'war-room'
  | 'neural-hub'
  | 'bhive-mesh'
  | 'bhive-chat'
  | 'memory-vault'
  | 'ast-auditor'
  | 'copilot-fusion'
  | 'biological-heartbeat'
  | 'gloop-analytics'
  | 'pulse-select'
  | 'megabrain'
  | 'log-o-matic'
  | 'worker-playground'
  | 'terminal'
  | 'google-drive'
  | 'google-tasks';

export type AppThemeMode = 'sophisticated-dark' | 'cyber' | 'claymorphic';

export interface ModelBot {
  id: 'hermes' | 'deepseek' | 'qwen' | 'claw_alpha' | 'claw_beta';
  name: string;
  subTitle: string;
  avatarUrl: string;
  tagline: string;
  badge: string;
  tier: string;
  latency: number;
  active: boolean;
  color: string;
  accentHex: string;
  description: string;
  specs: { label: string; value: string }[];
}

export interface WorkerBot {
  id: string;
  name: string;
  status: 'HAPPY' | 'WIGGLY' | 'SLEEPY' | 'ZOOMING' | 'CHILLIN' | 'ERROR' | 'LUCKY' | 'LEARNING' | 'LEGEND' | 'SYNCED';
  task: string;
  wiggleFreq: number;
  temperature: number;
  efficiency: number;
  color: string;
  avatar: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SWARM' | 'GLOOP' | 'SUCCESS';
  message: string;
  source: string;
}

export interface SystemMetrics {
  gloopSaturation: number;
  totalSludgeLtrs: number;
  activeWorkerBots: number;
  systemStability: number;
  pulseFrequencyHz: number;
  heartbeatPhase: 'Systole' | 'Flow' | 'Diastole' | 'Return';
  swarmNodeCount: number;
  nodeDensity: number;
  latencyMs: number;
  throughputTbps: number;
  thermalC: number;
  memoryGb: number;
}
