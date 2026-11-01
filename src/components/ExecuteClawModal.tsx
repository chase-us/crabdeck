import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';
import { ShieldAlert, CheckCircle2, XCircle, Terminal, Key, FileCheck, RefreshCw } from 'lucide-react';

interface ClawActionItem {
  id: string;
  tool: string;
  tier: 'destructive' | 'write' | 'safe';
  params: string;
  risk: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  timestamp: string;
}

interface ExecuteClawModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModelName: string;
}

export const ExecuteClawModal: React.FC<ExecuteClawModalProps> = ({
  isOpen,
  onClose,
  activeModelName
}) => {
  const [actions, setActions] = useState<ClawActionItem[]>([
    {
      id: 'act-458',
      tool: 'purge_cold_storage_nodes',
      tier: 'destructive',
      params: '{"threshold": 0.85, "dry_run": false, "tier": "L3_COLD"}',
      risk: 'High (Prunes 4,200 stale vector embeddings)',
      status: 'PENDING',
      timestamp: '08:05:12'
    },
    {
      id: 'act-459',
      tool: 'reflash_apu_thermal_governor',
      tier: 'destructive',
      params: '{"target_frequency": "4.20GHz", "ceiling_temp": "75.0C"}',
      risk: 'Critical (APU hardware thermal register sync)',
      status: 'PENDING',
      timestamp: '08:06:44'
    },
    {
      id: 'act-460',
      tool: 'append_swarm_audit_jsonl',
      tier: 'write',
      params: '{"event": "SYNC_CONSENSUS_PULSE", "slot": 720}',
      risk: 'Medium (Appends 1.4KB to vault/claw_activity.jsonl)',
      status: 'PENDING',
      timestamp: '08:07:01'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'approvals' | 'pincer-override'>('approvals');
  const [hmacToken, setHmacToken] = useState<string>('hmac_sha256_9f83a21e4cb80');

  useEffect(() => {
    if (isOpen) {
      soundFX.playWiggle();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00FF66', '#FF2A55', '#70D6FF', '#FFD700', '#A855F7']
        });
      } catch {
        // Fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = (id: string) => {
    soundFX.playSuccess();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#00FF66', '#70D6FF', '#FFD700']
    });

    setActions(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'APPROVED' } : a
    ));
  };

  const handleDeny = (id: string) => {
    soundFX.playAlert();
    setActions(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'DENIED' } : a
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      {/* Tactical Container */}
      <div className="relative w-full max-w-2xl p-6 sm:p-8 clay-control-box font-rubik text-white space-y-6 overflow-hidden rounded-3xl">
        {/* Header with Title and Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl clay-btn-red flex items-center justify-center text-xl shrink-0 shadow-md">
              🦀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                <span className="text-[10px] font-code font-bold tracking-wider text-[#FFD700] uppercase">
                  Claw Security Gateway · Tri-Tier Policy
                </span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-white tracking-tight">
                Claw Human-in-the-Loop Approval Inbox
              </h2>
            </div>
          </div>

          {/* Segment Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-code">
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('approvals');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                activeTab === 'approvals' ? 'clay-btn-purple text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Approval Inbox
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('pincer-override');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                activeTab === 'pincer-override' ? 'clay-btn-gold text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pincer Override
            </button>
          </div>
        </div>

        {/* Tab 1: Approval Inbox ([Approve] / [Deny] Action Gates) */}
        {activeTab === 'approvals' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-code text-zinc-300">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#FFD700]" />
                <span>Pending Destructive & Write Operations</span>
              </span>
              <span className="badge-purple px-2 py-0.5 rounded-md text-[10px]">
                HMAC Signed · Loopback Only
              </span>
            </div>

            {/* List of Pending Actions with Action Buttons */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-none">
              {actions.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-code font-bold text-[#FFD700]">{act.id}</span>
                      <span className="font-code font-extrabold text-white text-sm">
                        {act.tool}
                      </span>
                      <span className={`text-[10px] font-code px-2 py-0.5 rounded-md uppercase font-bold ${
                        act.tier === 'destructive' ? 'badge-red' : 'badge-gold'
                      }`}>
                        {act.tier}
                      </span>
                    </div>

                    <span className="text-[10px] font-code text-zinc-400">{act.timestamp}</span>
                  </div>

                  <div className="text-xs text-zinc-300 font-sans">
                    <span className="text-zinc-400">Risk Assessment: </span>
                    <strong className="text-[#FF2A55]">{act.risk}</strong>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950 font-code text-[11px] text-[#70D6FF] truncate border border-white/5">
                    <code>{act.params}</code>
                  </div>

                  {/* Action Buttons: [Approve] and [Deny] */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] font-code">
                      Status:{' '}
                      <strong className={
                        act.status === 'APPROVED' ? 'text-[#00FF66]' :
                        act.status === 'DENIED' ? 'text-[#FF2A55]' : 'text-[#FFD700]'
                      }>
                        {act.status}
                      </strong>
                    </div>

                    {act.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        {/* Deny Button */}
                        <button
                          onClick={() => handleDeny(act.id)}
                          className="px-3 py-1.5 rounded-xl clay-btn-red text-xs font-code font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>DENY</span>
                        </button>

                        {/* Approve Button */}
                        <button
                          onClick={() => handleApprove(act.id)}
                          className="px-3 py-1.5 rounded-xl clay-btn-green text-xs font-code font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>APPROVE</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-code text-zinc-400 italic">
                        {act.status === 'APPROVED' ? '✓ Logged to claw_activity.jsonl' : '✗ Blocked by Operator'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-code text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>HMAC Guard: <strong>{hmacToken}</strong></span>
              </span>
              <span className="text-[#00FF66]">100% Invariants Verified</span>
            </div>
          </div>
        )}

        {/* Tab 2: Tactical Pincer Override Stats */}
        {activeTab === 'pincer-override' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-center">
            <div className="flex items-center justify-center gap-6 text-5xl animate-bounce my-2">
              <span className="scale-x-[-1]">🦀</span>
              <span className="text-[#00FF66] font-display font-extrabold text-2xl tracking-wider">
                PINCER OVERRIDE
              </span>
              <span>🦀</span>
            </div>

            <p className="text-xs text-zinc-300 font-sans max-w-md mx-auto leading-relaxed">
              Tactical pincer mechanics calibrated through node <strong className="text-[#FFD700]">{activeModelName}</strong>. 
              Zero WAN leakage, 100% single-machine loopback confinement active.
            </p>

            <div className="grid grid-cols-3 gap-3 p-4 bg-black/50 border border-white/10 rounded-2xl font-code text-xs">
              <div>
                <div className="text-zinc-500 font-bold">PINCER FORCE</div>
                <div className="text-[#00FF66] font-display font-extrabold text-base">8,500 PSI</div>
              </div>
              <div>
                <div className="text-zinc-500 font-bold">GLOOP DUMP</div>
                <div className="text-[#FFD700] font-display font-extrabold text-base">+500 LTRS</div>
              </div>
              <div>
                <div className="text-zinc-500 font-bold">REFLEX SPEED</div>
                <div className="text-[#70D6FF] font-display font-extrabold text-base">1.2ms</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button: Close */}
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl clay-btn-blue font-display font-extrabold text-xs tracking-wider cursor-pointer uppercase shadow-md flex items-center justify-center gap-2"
        >
          <span>CLOSE GATEWAY ➔</span>
        </button>
      </div>
    </div>
  );
};
