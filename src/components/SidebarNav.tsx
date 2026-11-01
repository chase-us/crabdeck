import React from 'react';
import { AppView, ModelBot } from '../types';
import { soundFX } from '../utils/audio';
import {
  LayoutDashboard,
  Network,
  MessageSquare,
  ShieldCheck,
  Database,
  Zap,
  Bot,
  Activity,
  Sliders,
  Gauge,
  Terminal,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Radio,
  Cpu
} from 'lucide-react';

interface SidebarNavProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  activeModel: ModelBot;
  onOpenModelSelector?: () => void;
  onOpenAudit?: () => void;
  onOpenVoice?: () => void;
}

interface NavGroup {
  label: string;
  items: {
    view: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  audioEnabled,
  onToggleAudio,
  activeModel,
  onOpenModelSelector,
  onOpenAudit,
  onOpenVoice
}) => {
  const navGroups: NavGroup[] = [
    {
      label: 'OPERATIONS',
      items: [
        { view: 'war-room', label: 'War Room', icon: LayoutDashboard },
        { view: 'bhive-mesh', label: '1,440 Swarm', icon: Network, badge: '1,440' },
        { view: 'bhive-chat', label: 'Swarm Chat', icon: MessageSquare, badge: '24h' }
      ]
    },
    {
      label: 'SECURITY & AGENTS',
      items: [
        { view: 'ast-auditor', label: 'AST SecAuditor', icon: ShieldCheck, badge: 'Hob' },
        { view: 'memory-vault', label: 'Memory Vault', icon: Database },
        { view: 'copilot-fusion', label: 'Copilot Fusion', icon: Zap },
        { view: 'worker-playground', label: 'Worker Agents', icon: Bot }
      ]
    },
    {
      label: 'SYSTEM TELEMETRY',
      items: [
        { view: 'biological-heartbeat', label: 'Heartbeat Pulse', icon: Activity, badge: '72 bpm' },
        { view: 'gloop-analytics', label: 'Gloop & Sludge', icon: Sliders },
        { view: 'megabrain', label: 'APU Overclock', icon: Gauge },
        { view: 'log-o-matic', label: 'Live Logs', icon: Terminal }
      ]
    }
  ];

  const isItemActive = (viewKey: AppView) => {
    if (viewKey === 'war-room') {
      return currentView === 'war-room' || currentView === 'neural-hub';
    }
    return currentView === viewKey;
  };

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col justify-between bg-[#0B0F17] border-r border-slate-800/80 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Header / Brand */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/70">
          <button
            onClick={() => {
              soundFX.playWiggle();
              onSelectView('war-room');
            }}
            className="flex items-center gap-3 text-left group cursor-pointer overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/20 via-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-lg text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-sm shrink-0">
              🦀
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-sm tracking-tight text-white leading-none">
                    CRABDECK
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold px-1 py-0.2 bg-cyan-950/60 rounded border border-cyan-800/40">
                    v0.4
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 tracking-tight mt-0.5 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  127.0.0.1:3001
                </p>
              </div>
            )}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 flex items-center justify-center transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Active Primary Model Quick Card */}
        {!isCollapsed ? (
          <div className="p-3 border-b border-slate-800/70">
            <button
              onClick={() => {
                soundFX.playClick();
                if (onOpenModelSelector) onOpenModelSelector();
                else onSelectView('pulse-select');
              }}
              className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              title="Click to hot-swap active model"
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Primary LLM</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 tabular-nums">
                  {activeModel.latency}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                  {activeModel.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  Local APU
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="py-3 flex justify-center border-b border-slate-800/70">
            <div
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400"
              title={`Primary: ${activeModel.name} (${activeModel.latency}ms)`}
            >
              <Cpu className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Navigation Categories */}
        <div className="p-2.5 space-y-4 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-none">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isItemActive(item.view);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      onClick={() => {
                        soundFX.playClick();
                        onSelectView(item.view);
                      }}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-slate-800/90 text-white shadow-sm border border-slate-700/80 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      title={item.label}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between text-left truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                active
                                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/40'
                                  : 'bg-slate-800/80 text-slate-400'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Telemetry & System Utilities */}
      <div className="p-3 border-t border-slate-800/70 space-y-2 bg-[#0A0D14]">
        {!isCollapsed && (
          <div className="px-1 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/70 text-[10px] font-mono text-slate-400 flex items-center justify-between tabular-nums">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>CPU 14%</span>
            </span>
            <span>·</span>
            <span>APU 38°C</span>
            <span>·</span>
            <span className="text-emerald-400">0.0% Idle</span>
          </div>
        )}

        <div className={`flex items-center gap-1.5 ${isCollapsed ? 'flex-col' : 'justify-between'}`}>
          {/* Audio Toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              onToggleAudio();
            }}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-800 ${
              !audioEnabled ? 'text-slate-500' : 'text-cyan-400'
            }`}
            title={audioEnabled ? 'Mute sound FX' : 'Enable sound FX'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 58-Point Smoke Suite shortcut */}
          {onOpenAudit && !isCollapsed && (
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenAudit();
              }}
              className="flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/40 flex items-center justify-center gap-1 transition-all cursor-pointer"
              title="58-Point Smoke Suite & Stack Verification"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>58/58 AUDIT</span>
            </button>
          )}

          {/* Voice shortcut */}
          {onOpenVoice && !isCollapsed && (
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenVoice();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Voice Conductor"
            >
              <Radio className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
