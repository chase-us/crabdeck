import React from 'react';
import confetti from 'canvas-confetti';
import { AppView, ModelBot } from '../types';
import { soundFX } from '../utils/audio';
import {
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  ShieldCheck,
  Zap,
  Cpu,
  RefreshCw,
  BookOpen,
  Bot,
  Database
} from 'lucide-react';

interface LeftControlBoxProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  activeModel: ModelBot;
  models: ModelBot[];
  onSelectModel: (id: string) => void;
  onExecuteClaw: () => void;
  onOpenAudit: () => void;
  onOpenVoice: () => void;
  onOpenSetup: () => void;
  onOpenArtifacts?: () => void;
  onOpenGemini?: () => void;
  onOpenFirebase?: () => void;
  themeMode: string;
  onToggleTheme: () => void;
  thermalC?: number;
}

export const LeftControlBox: React.FC<LeftControlBoxProps> = ({
  currentView,
  onSelectView,
  audioEnabled,
  onToggleAudio,
  activeModel,
  models,
  onSelectModel,
  onExecuteClaw,
  onOpenAudit,
  onOpenVoice,
  onOpenSetup,
  onOpenArtifacts,
  onOpenGemini,
  onOpenFirebase,
  themeMode,
  onToggleTheme,
  thermalC = 42.8
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: 0.15, y: 0.25 },
      colors: ['#FFD700', '#FF2A55', '#70D6FF', '#00FF66', '#A855F7']
    });
  };

  const navItems: { view: AppView; label: string; icon: string; tag: string; tagColor: string }[] = [
    { view: 'war-room', label: 'The War Room', icon: '🦀', tag: 'Core', tagColor: 'badge-gold' },
    { view: 'bhive-mesh', label: '1,440 Swarm Mesh', icon: '🌐', tag: '1,440', tagColor: 'badge-blue' },
    { view: 'bhive-chat', label: 'Swarm Chat Room', icon: '💬', tag: '24h', tagColor: 'badge-purple' },
    { view: 'ast-auditor', label: 'AST SecAuditor', icon: '🛡️', tag: 'Hob', tagColor: 'badge-green' },
    { view: 'memory-vault', label: 'Tiered Memory Vault', icon: '💾', tag: 'WAL', tagColor: 'badge-blue' },
    { view: 'copilot-fusion', label: 'Copilot Fusion', icon: '⚡', tag: 'DAG', tagColor: 'badge-gold' },
    { view: 'biological-heartbeat', label: 'Biological Heartbeat', icon: '💓', tag: '72 bpm', tagColor: 'badge-red' },
    { view: 'gloop-analytics', label: 'Gloop & Sludge', icon: '🍌', tag: 'Viscous', tagColor: 'badge-gold' },
    { view: 'megabrain', label: 'Megabrain Overclock', icon: '🔥', tag: 'APU', tagColor: 'badge-red' },
    { view: 'worker-playground', label: 'Worker Bots', icon: '🤖', tag: 'Swarm', tagColor: 'badge-blue' },
    { view: 'log-o-matic', label: 'Live Telemetry Logs', icon: '📜', tag: '60 FPS', tagColor: 'badge-purple' },
    { view: 'pulse-select', label: 'Model Routing Matrix', icon: '🎯', tag: 'GGUF', tagColor: 'badge-green' },
    { view: 'google-tasks', label: 'Google Tasks Heat Map', icon: '🔥', tag: 'Crab P0', tagColor: 'badge-red' },
    { view: 'google-drive', label: 'Drive & Picker', icon: '📁', tag: 'OAuth', tagColor: 'badge-blue' }
  ];

  const handleNextModel = () => {
    soundFX.playHotSwap();
    triggerConfetti();
    const currentIndex = models.findIndex(m => m.id === activeModel.id);
    const nextIndex = (currentIndex + 1) % models.length;
    onSelectModel(models[nextIndex].id);
  };

  const isViewActive = (viewKey: AppView) => {
    if (viewKey === 'war-room') {
      return currentView === 'war-room' || currentView === 'neural-hub';
    }
    return currentView === viewKey;
  };

  return (
    <aside className="w-80 shrink-0 select-none p-3 lg:p-4 sticky top-0 h-screen overflow-hidden flex flex-col justify-between">
      {/* The Master Claymorphic Control Box Container */}
      <div className="clay-control-box h-full flex flex-col justify-between p-4 relative overflow-hidden">
        {/* Ambient Top Glow Accents */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#A855F7]/20 via-[#70D6FF]/10 to-transparent pointer-events-none rounded-bl-full" />
        <div className="absolute top-1/2 left-0 w-36 h-36 bg-gradient-to-tr from-[#FF2A55]/15 to-transparent pointer-events-none rounded-tr-full" />

        {/* Scrollable Upper Section */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-none z-10">
          {/* 1. Brand & Header Block */}
          <div className="flex items-center gap-3 p-1 border-b border-white/10 pb-3">
            <button
              onClick={() => {
                soundFX.playWiggle();
                triggerConfetti();
                onSelectView('war-room');
              }}
              className="w-12 h-12 rounded-2xl clay-btn-red flex items-center justify-center text-2xl shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
              title="Click for celebratory wiggle & jump to War Room!"
            >
              🦀
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg tracking-tight gold-gradient-text leading-none">
                  CRABDECK
                </span>
                <span className="text-[10px] font-code font-bold px-1.5 py-0.5 rounded-lg badge-gold leading-none">
                  v1.0 PROD
                </span>
              </div>
              <p className="text-[11px] font-code text-[#70D6FF] flex items-center gap-1.5 mt-1 truncate">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse shrink-0" />
                <span>127.0.0.1:3001</span>
                <span className="text-zinc-500">·</span>
                <span className="text-[#00FF66]">Nominal</span>
              </p>
            </div>
          </div>

          {/* 2. Primary 3D Tactical Action Pad (All main tools in one box) */}
          <div className="space-y-2">
            <div className="text-[10px] font-code font-bold uppercase tracking-wider text-zinc-400 px-1 flex items-center justify-between">
              <span>Tactical Actions</span>
              <span className="text-[9px] badge-purple px-1.5 py-0.2 rounded-full">Interactive</span>
            </div>

            {/* Gemini Assistant Bot Launcher Button */}
            <button
              onClick={() => {
                soundFX.playWiggle();
                triggerConfetti();
                onOpenGemini?.();
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#FF4D00] via-[#A855F7] to-[#70D6FF] font-display font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF4D00]/25 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 border border-white/20"
              title="Launch Gemini Assistant Bot (gemini-3.8-flash)"
            >
              <Bot className="w-4 h-4 text-white" />
              <span>GEMINI ASSISTANT BOT</span>
              <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded-md font-code text-[#00FF66]">
                3.8 FLASH
              </span>
            </button>

            {/* Execute Claw Primary Button */}
            <button
              onClick={() => {
                soundFX.playWiggle();
                triggerConfetti();
                onExecuteClaw();
              }}
              className="w-full py-2.5 px-3 rounded-2xl clay-btn-red font-display font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
              title="Execute Claw protocol with tactical override"
            >
              <span className="text-base">🦀</span>
              <span>EXECUTE CLAW</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md font-code">PRO</span>
            </button>

            {/* Grid of Action Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Firebase / Firestore Status */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenFirebase?.();
                }}
                className="py-2 px-1 rounded-xl bg-[#FF4D00]/25 hover:bg-[#FF4D00]/35 text-[#FF4D00] border border-[#FF4D00]/40 font-code font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer text-center transition-all hover:scale-[1.02] active:scale-95"
                title="Open Firebase & Firestore Configuration"
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>FIREBASE</span>
              </button>

              {/* Gemini AI Bot */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenGemini?.();
                }}
                className="py-2 px-1 rounded-xl bg-gradient-to-r from-[#FF4D00] to-[#FF8C00] text-black font-code font-extrabold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer text-center transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                title="Open Gemini Assistant Bot"
              >
                <Bot className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span>GEMINI AI</span>
              </button>

              {/* 58/58 Smoke Audit */}
              <button
                onClick={() => {
                  soundFX.playSuccess();
                  triggerConfetti();
                  onOpenAudit();
                }}
                className="py-2 px-1 rounded-xl clay-btn-green font-code font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer text-center"
                title="Open 58-Point Smoke Suite & Stack Verification"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>58/58 AUDIT</span>
              </button>

              {/* Feature Artifacts Vault */}
              <button
                onClick={() => {
                  soundFX.playWiggle();
                  triggerConfetti();
                  onOpenArtifacts?.();
                }}
                className="py-2 px-1 rounded-xl clay-btn-gold font-code font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer text-center"
                title="Open All Feature Artifacts & Technical Specifications"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>ARTIFACTS</span>
              </button>

              {/* Voice Conductor */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenVoice();
                }}
                className="py-2 px-1 rounded-xl clay-btn-blue font-code font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer text-center"
                title="Open Voice Conductor"
              >
                <Radio className="w-3.5 h-3.5 shrink-0" />
                <span>VOICE</span>
              </button>

              {/* Setup Wizard */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenSetup();
                }}
                className="py-2 px-1 rounded-xl clay-btn-purple font-code font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer text-center"
                title="Open Setup Tour"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>SETUP</span>
              </button>
            </div>
          </div>

          {/* 3. Active Model Hot-Swap Clay Card */}
          <div className="p-3 rounded-2xl clay-card-3d border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-code">
              <span className="text-zinc-400 flex items-center gap-1.5 font-bold">
                <Cpu className="w-3.5 h-3.5 text-[#70D6FF]" />
                <span>Active Model</span>
              </span>
              <span className="text-[#00FF66] font-extrabold text-[10px] badge-green px-1.5 py-0.2 rounded-md">
                {activeModel.latency}ms
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-display font-extrabold text-white truncate">
                  {activeModel.name}
                </div>
                <div className="text-[11px] text-[#FFD700] truncate font-code">
                  {activeModel.subTitle}
                </div>
              </div>

              {/* Hot-Swap Click Button */}
              <button
                onClick={handleNextModel}
                className="px-2.5 py-1.5 rounded-xl clay-btn-gold text-[10px] font-code font-extrabold flex items-center gap-1 cursor-pointer shrink-0"
                title="Click to cycle next LLM node"
              >
                <RefreshCw className="w-3 h-3 animate-spin duration-3000" />
                <span>SWAP</span>
              </button>
            </div>
          </div>

          {/* 4. Complete Navigation Deck: All Clickable Views in Left Box */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-code font-bold uppercase tracking-wider text-zinc-400 px-1 flex items-center justify-between pt-1">
              <span>Control Deck Views</span>
              <span className="text-[9px] text-zinc-500 font-mono">12 Modules</span>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const active = isViewActive(item.view);
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      soundFX.playClick();
                      onSelectView(item.view);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      active ? 'clay-nav-btn-active text-white' : 'clay-nav-btn text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className={`truncate font-display text-[13px] ${active ? 'text-[#FFD700]' : 'text-zinc-200'}`}>
                        {item.label}
                      </span>
                    </div>

                    <span className={`text-[10px] font-code px-1.5 py-0.5 rounded-lg shrink-0 ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Bottom Hardware Dials & Sound/Theme Toggles (In Left Box) */}
        <div className="pt-3 border-t border-white/10 space-y-2.5 z-10">
          {/* Thermal & CPU Gauge Bar */}
          <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 font-code text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1 font-bold">
                <Flame className={`w-3.5 h-3.5 ${thermalC > 70 ? 'text-[#FF2A55] animate-ping' : 'text-[#00FF66]'}`} />
                <span>APU Thermals</span>
              </span>
              <span className={`font-extrabold ${thermalC > 70 ? 'text-[#FF2A55]' : 'text-[#00FF66]'}`}>
                {thermalC.toFixed(1)}°C <span className="text-zinc-500 text-[9px]">/ 75°C max</span>
              </span>
            </div>

            {/* Visual Color-Coded Progress Bar against 75°C Flux-Smith ceiling */}
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  thermalC > 70
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF2A55]'
                    : 'bg-gradient-to-r from-[#70D6FF] via-[#00FF66] to-[#FFD700]'
                }`}
                style={{ width: `${Math.min(100, (thermalC / 75) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
              <span>CPU: <strong className="text-white">14.2%</strong></span>
              <span>·</span>
              <span className="text-[#00FF66] font-bold">0.0% Idle CPU</span>
            </div>
          </div>

          {/* Utility Buttons: Sound FX & Theme Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                onToggleAudio();
              }}
              className={`py-2 px-2.5 rounded-xl font-code font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                audioEnabled ? 'clay-btn-blue' : 'bg-black/50 border border-white/10 text-zinc-500'
              }`}
              title="Toggle Web Audio SFX"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{audioEnabled ? 'SFX ON' : 'MUTED'}</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                onToggleTheme();
              }}
              className="py-2 px-2.5 rounded-xl clay-btn-purple font-code font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              title="Toggle Theme Visual Style"
            >
              <span>✨</span>
              <span>CLAY 3D</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
