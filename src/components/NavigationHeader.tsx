import React from 'react';
import { AppView, AppThemeMode } from '../types';
import { ChevronRight, Menu, Radio, ShieldCheck, Sparkles, Volume2, VolumeX, BookOpen, Bot, Database } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface NavigationHeaderProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  themeMode: AppThemeMode;
  onToggleTheme: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onExecuteClaw: () => void;
  activeModelName: string;
  onOpenVoiceConductor?: () => void;
  onOpenOnboarding?: () => void;
  onOpenAudit?: () => void;
  onOpenArtifacts?: () => void;
  onOpenGemini?: () => void;
  onOpenFirebase?: () => void;
  onToggleSidebar?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentView,
  onToggleSidebar,
  activeModelName,
  onOpenArtifacts,
  onOpenGemini,
  onOpenFirebase
}) => {
  const getViewDetails = (view: AppView): { section: string; title: string; icon: string } => {
    switch (view) {
      case 'war-room':
      case 'neural-hub':
        return { section: 'Operations', title: 'The War Room', icon: '🦀' };
      case 'bhive-mesh':
        return { section: 'Operations', title: '1,440-Node Swarm Mesh', icon: '🌐' };
      case 'bhive-chat':
        return { section: 'Operations', title: '24h Swarm Chat Room', icon: '💬' };
      case 'ast-auditor':
        return { section: 'Security', title: 'AST SecAuditor & Sandbox', icon: '🛡️' };
      case 'memory-vault':
        return { section: 'Security', title: 'Tiered Memory Vault', icon: '💾' };
      case 'copilot-fusion':
        return { section: 'Intelligence', title: 'Copilot Fusion & Quantization', icon: '⚡' };
      case 'worker-playground':
        return { section: 'Agents', title: 'Worker Bots Playground', icon: '🤖' };
      case 'biological-heartbeat':
        return { section: 'Telemetry', title: 'Biological Heartbeat (72 BPM)', icon: '💓' };
      case 'gloop-analytics':
        return { section: 'Telemetry', title: 'Gloop & Sludge Analytics', icon: '🍌' };
      case 'megabrain':
        return { section: 'Engine', title: 'Megabrain APU Overclock', icon: '🔥' };
      case 'log-o-matic':
        return { section: 'Logs', title: 'Live Telemetry Stream', icon: '📜' };
      case 'pulse-select':
        return { section: 'Routing', title: 'Model Routing Matrix', icon: '🎯' };
      case 'google-drive':
        return { section: 'Workspace', title: 'Google Drive & Picker', icon: '📁' };
      case 'google-tasks':
        return { section: 'Workspace', title: 'Google Tasks Matrix', icon: '✅' };
      default:
        return { section: 'Workspace', title: 'Control Plane', icon: '🦀' };
    }
  };

  const { section, title, icon } = getViewDetails(currentView);

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#070510]/85 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Drawer Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={() => {
              soundFX.playClick();
              onToggleSidebar();
            }}
            className="p-2 rounded-xl clay-card-3d text-white hover:text-[#70D6FF] transition-all cursor-pointer lg:hidden"
            title="Open Control Box"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs truncate">
          <span className="text-base shrink-0">{icon}</span>
          <span className="font-display font-extrabold text-white text-sm tracking-tight truncate">
            {title}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 hidden sm:inline" />
          <span className="text-zinc-400 font-code text-xs hidden sm:inline">{section}</span>
        </div>
      </div>

      {/* Center: Live 3D & Telemetry Status Badges */}
      <div className="hidden md:flex items-center gap-3 text-xs font-code tabular-nums">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[#70D6FF]">
          <span className="w-2 h-2 rounded-full bg-[#70D6FF] animate-pulse" />
          <span>Swarm: <strong>1,440 Nodes</strong></span>
        </span>

        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[#FFD700]">
          <span>⚡ Primary: <strong>{activeModelName}</strong></span>
        </span>

        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[#00FF66]">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
          <span>60 FPS WebGL</span>
        </span>
      </div>

      {/* Right: Quick Signal Indicator + Artifacts Modal Launcher */}
      <div className="flex items-center gap-2">
        {onOpenFirebase && (
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenFirebase();
            }}
            className="px-2.5 py-1 rounded-xl bg-[#FF4D00]/20 hover:bg-[#FF4D00]/30 text-[#FF4D00] border border-[#FF4D00]/40 text-xs font-code font-bold flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="Open Firebase & Firestore Database Status"
          >
            <Database className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden md:inline">FIREBASE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
          </button>
        )}

        {onOpenGemini && (
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenGemini();
            }}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#FF4D00] to-[#FF8C00] text-black text-xs font-code font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF4D00]/20 hover:scale-105 active:scale-95 transition-transform"
            title="Open Gemini Assistant Bot"
          >
            <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">GEMINI AI</span>
          </button>
        )}

        {onOpenArtifacts && (
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenArtifacts();
            }}
            className="px-2.5 py-1 rounded-xl clay-btn-gold text-xs font-code font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform"
            title="Open Feature Artifacts & Architectural Specifications"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">ARTIFACTS</span>
            <span className="text-[10px] bg-black/20 px-1 py-0.2 rounded font-extrabold">16</span>
          </button>
        )}

        <div className="px-2.5 py-1 rounded-xl badge-green text-xs font-code font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
          <span>127.0.0.1:3001 OK</span>
        </div>
      </div>
    </header>
  );
};
