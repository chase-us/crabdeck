import React, { useRef } from 'react';
import { ModelBot, SystemMetrics } from '../types';
import { SwarmCanvas, SwarmInteractiveNode } from './SwarmCanvas';
import { CommandTerminal } from './CommandTerminal';
import { ModelSelectorPanel } from './ModelSelectorPanel';
import { BiologicalHeartbeat } from './BiologicalHeartbeat';
import { CrabECompanion } from './CrabECompanion';
import { HardwareHealthCard } from './HardwareHealthCard';
import { OperatorGreetingBanner } from './OperatorGreetingBanner';
import { soundFX } from '../utils/audio';

interface NeuralHubViewProps {
  models: ModelBot[];
  activeModelId: string;
  onSelectModel: (id: string) => void;
  metrics: SystemMetrics;
  onExecuteClaw: () => void;
  onGloopBoost: () => void;
  isClayMode: boolean;
  onNavigateToHeartbeat?: () => void;
  onNavigateToGloop?: () => void;
  onNavigateToView?: (view: string) => void;
}

export const NeuralHubView: React.FC<NeuralHubViewProps> = ({
  models,
  activeModelId,
  onSelectModel,
  metrics,
  onExecuteClaw,
  onGloopBoost,
  isClayMode,
  onNavigateToHeartbeat,
  onNavigateToGloop,
  onNavigateToView
}) => {
  const activeModel = models.find(m => m.id === activeModelId) || models[0];
  const mascotRef = useRef<HTMLDivElement>(null);

  const scrollToMascot = () => {
    mascotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="space-y-6">
      {/* 1. Frictionless Onboarding & Friendly Greeting Banner */}
      <OperatorGreetingBanner
        activeModelName={activeModel.name}
        onNavigateToView={onNavigateToView}
        onScrollToMascot={scrollToMascot}
      />

      {/* 2. Main Hero Grid: Interactive Constellation Map & Crab-E 3D Companion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive 3D/2.5D Topology Node Constellation Map (2 cols) */}
        <div className="lg:col-span-2 min-h-[460px]">
          <SwarmCanvas
            nodeCount={metrics.swarmNodeCount}
            activeModelId={activeModelId}
            onSelectInteractiveNode={(node: SwarmInteractiveNode) => {
              // Node selected feedback
            }}
          />
        </div>

        {/* Right Column: 3D Cartoon Companion 'Crab-E' & Tactical Quick Core Card (1 col) */}
        <div ref={mascotRef} className="flex flex-col gap-5">
          {/* Crab-E Interactive 3D Companion with Interval Timer Speech Bubble */}
          <CrabECompanion className="flex-1" metrics={metrics} />

          {/* Primary Runtime Overview Card */}
          <div className="p-5 rounded-3xl clay-card-3d space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-white font-display font-extrabold tracking-tight flex items-center gap-1.5">
                <span className="text-[#FFD700]">🧠</span> PRIMARY LLM RUNTIME
              </span>
              <span className="text-[10px] font-code px-2 py-0.5 rounded-full badge-green font-bold">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-white/10">
              <img
                src={activeModel.avatarUrl}
                alt={activeModel.name}
                className="w-12 h-12 rounded-xl border-2 border-[#FFD700] object-cover shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-extrabold text-white text-sm truncate">{activeModel.name}</h4>
                <p className="text-[11px] text-[#FFD700] truncate font-code">{activeModel.subTitle}</p>
                <p className="text-[10px] text-[#70D6FF] font-code tabular-nums font-bold">Latency: {activeModel.latency}ms</p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                onClick={() => {
                  soundFX.playClick();
                  onNavigateToGloop?.();
                }}
                className={`p-3 bg-black/40 rounded-2xl border border-white/10 transition-all ${
                  onNavigateToGloop ? 'cursor-pointer hover:border-[#FFD700] hover:bg-black/60' : ''
                }`}
                title="View full Gloop & Sludge Analytics"
              >
                <span className="text-[10px] text-zinc-400 block font-code font-bold">GLOOP VISCOSITY</span>
                <span className="text-[#FFD700] font-display font-extrabold text-base tabular-nums">{metrics.gloopSaturation}%</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-code font-bold">THROUGHPUT</span>
                <span className="text-[#00FF66] font-display font-extrabold text-base tabular-nums">{metrics.throughputTbps} TB/s</span>
              </div>
            </div>

            {/* Tactical Execute Button */}
            <button
              onClick={() => {
                soundFX.playWiggle();
                onExecuteClaw();
              }}
              className="w-full py-2.5 rounded-xl clay-btn-red text-white font-display font-extrabold text-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <span>🦀</span>
              <span className="font-code tracking-wider">EXECUTE CLAW PROTOCOL</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Thermal Throttle & Hardware Health Telemetry Card */}
      <HardwareHealthCard />

      {/* 4. Model Hot-Swapping Panel */}
      <ModelSelectorPanel
        models={models}
        activeModelId={activeModelId}
        onSelectModel={onSelectModel}
        isClayMode={isClayMode}
      />

      {/* 5. Terminal & Biological Heartbeat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommandTerminal
          onExecuteClaw={onExecuteClaw}
          onHotSwapModel={onSelectModel}
          onGloopBoost={onGloopBoost}
          activeModelName={activeModel.name}
        />

        <div className="space-y-2">
          {onNavigateToHeartbeat && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-zinc-400 font-code font-bold">AUTONOMIC PULSE MONITOR</span>
              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigateToHeartbeat();
                }}
                className="text-[11px] font-bold text-[#FFD700] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>OPEN FULL D3 MONITOR</span>
                <span>↗</span>
              </button>
            </div>
          )}
          <BiologicalHeartbeat
            pulseFrequency={metrics.pulseFrequencyHz}
            systemStability={metrics.systemStability}
            onSyncTrigger={() => {
              soundFX.playWiggle();
            }}
          />
        </div>
      </div>

      {/* 6. Persistent Knowledge & Storage Infrastructure */}
      <div className="p-5 md:p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-sm text-xs space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
          <div>
            <span className="text-slate-100 font-semibold tracking-tight flex items-center gap-2 text-sm">
              <span className="text-cyan-400">💾</span> Persistent Cold-Storage Archives · SQLite & Vector Graph
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Long-term episodic vector indices, relational session logs, and semantic knowledge relationships.</p>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 hover:text-white rounded-lg transition-all cursor-pointer font-medium text-xs"
          >
            Cold Storage Recall
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-cyan-400 font-medium block">FAISS Vector Index</span>
            <span className="text-slate-400 font-mono text-[11px] tabular-nums">1,024,000 Vectors Indexed · 0.8ms Lookup</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-indigo-400 font-medium block">Knowledge Graph</span>
            <span className="text-slate-400 font-mono text-[11px] tabular-nums">842,000 Nodes · 2,100,000 Relationships</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-emerald-400 font-medium block">Markdown Audit Logs</span>
            <span className="text-slate-400 font-mono text-[11px] tabular-nums">Loopback WAL Sync · 100% Intact</span>
          </div>
        </div>
      </div>
    </div>
  );
};
