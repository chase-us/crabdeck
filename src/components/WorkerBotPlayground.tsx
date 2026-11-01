import React, { useState } from 'react';
import { WorkerBot } from '../types';
import { GooglyEyes } from './GooglyEyes';
import { soundFX } from '../utils/audio';

interface WorkerBotPlaygroundProps {
  bots: WorkerBot[];
  onUpdateBot: (bot: WorkerBot) => void;
  onSyncAllBots: () => void;
}

export const WorkerBotPlayground: React.FC<WorkerBotPlaygroundProps> = ({
  bots,
  onUpdateBot,
  onSyncAllBots
}) => {
  const [selectedBotId, setSelectedBotId] = useState<string>(bots[0]?.id || 'bot-001');
  const [isLeverPulled, setIsLeverPulled] = useState(false);

  const selectedBot = bots.find(b => b.id === selectedBotId) || bots[0];

  const handlePullLever = () => {
    soundFX.playWiggle();
    setIsLeverPulled(true);
    onSyncAllBots();
    setTimeout(() => setIsLeverPulled(false), 1200);
  };

  const handleRecalibrate = () => {
    if (!selectedBot) return;
    soundFX.playClick();
    onUpdateBot({
      ...selectedBot,
      wiggleFreq: Math.floor(60 + Math.random() * 100),
      temperature: 38.0 + +(Math.random() * 4).toFixed(1),
      efficiency: 99.5,
      status: 'SYNCED'
    });
  };

  return (
    <div className="space-y-6 font-hanken">
      {/* Control Deck Header */}
      <div className="p-6 sophisticated-card rounded-3xl text-white border border-[#D4AF37]/30">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 gold-badge font-bold text-xs rounded uppercase tracking-wider">
                NODE CLUSTER ALPHA-7
              </span>
              <span className="text-xs font-bold text-zinc-300">15,000 WIGGLING UNITS</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight gold-gradient-text">
              WORKER BOT PLAYGROUND 🤖
            </h2>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              Monitor individual bot wiggle frequencies, adjust heat dissipation, and pull the Master Sync Lever to align all quantum sub-nodes.
            </p>
          </div>

          {/* Interactive Pull Lever */}
          <div className="flex flex-col items-center justify-center p-3 bg-[#0A0A0F]/80 border border-[#D4AF37]/30 rounded-2xl">
            <span className="text-[11px] font-bold uppercase text-[#F3E5AB] mb-2 font-mono">PULL TO SYNC ALL BOTS</span>
            <button
              onClick={handlePullLever}
              className={`w-16 h-24 bg-zinc-900 border border-[#D4AF37]/40 rounded-xl relative flex justify-center cursor-pointer transition-all ${
                isLeverPulled ? 'bg-[#D4AF37]/30 border-[#D4AF37]' : 'hover:border-[#D4AF37]'
              }`}
            >
              <div
                className={`w-6 h-12 gold-gradient-bg border border-[#D4AF37] rounded-full absolute transition-all duration-300 shadow-md ${
                  isLeverPulled ? 'top-10 scale-95' : 'top-1'
                }`}
              />
            </button>
            <span className="text-[10px] font-extrabold text-[#F3E5AB] mt-2 font-mono">
              {isLeverPulled ? '⚡ SYNCING...' : 'PULL LEVER'}
            </span>
          </div>

          {/* Googly Eyes Box */}
          <div className="flex justify-center">
            <GooglyEyes size="md" label="BOT OVERSEER" expression={isLeverPulled ? 'crazy' : 'normal'} />
          </div>
        </div>
      </div>

      {/* Main Grid: Bot Tiles & Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 12 Bot Tiles Grid */}
        <div className="lg:col-span-2 p-5 sophisticated-card rounded-2xl border border-[#D4AF37]/30 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-serif-luxury text-base font-bold gold-gradient-text">
              ACTIVE WORKER BOT CLUSTER ({bots.length})
            </h3>
            <span className="text-xs font-code text-zinc-400">SELECT BOT TO INSPECT</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {bots.map((bot) => {
              const isSelected = bot.id === selectedBotId;
              return (
                <button
                  key={bot.id}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedBotId(bot.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#12121A] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] scale-105 z-10'
                      : 'bg-[#0A0A0F]/90 text-zinc-200 border-white/10 hover:border-[#D4AF37]/40 hover:bg-[#121218]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{bot.avatar}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'gold-badge'
                        : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                    }`}>
                      {bot.status}
                    </span>
                  </div>

                  <div>
                    <div className={`font-bold text-xs ${isSelected ? 'text-[#F3E5AB]' : 'text-white'}`}>
                      {bot.name}
                    </div>
                    <div className={`text-[10px] font-code ${isSelected ? 'text-[#D4AF37]' : 'text-zinc-400'}`}>
                      {bot.wiggleFreq} Hz Wiggle
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Bot Inspector Panel */}
        {selectedBot && (
          <div className="p-5 sophisticated-card rounded-2xl border border-[#D4AF37]/30 space-y-4 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedBot.avatar}</span>
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-white">{selectedBot.name}</h3>
                    <span className="text-xs font-bold text-[#D4AF37] uppercase font-mono">INSPECTION READOUT</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 gold-badge font-bold text-xs rounded-md">
                  {selectedBot.status}
                </span>
              </div>

              {/* Stats Specs */}
              <div className="space-y-3 font-mono-space text-xs">
                <div className="p-2.5 bg-[#0A0A0F]/80 border border-white/10 rounded-lg flex justify-between">
                  <span className="font-semibold text-zinc-400">WIGGLE FREQUENCY:</span>
                  <strong className="text-[#F3E5AB]">{selectedBot.wiggleFreq} Hz</strong>
                </div>

                <div className="p-2.5 bg-[#0A0A0F]/80 border border-white/10 rounded-lg flex justify-between">
                  <span className="font-semibold text-zinc-400">TEMPERATURE:</span>
                  <strong className={selectedBot.temperature > 50 ? 'text-[#EF4444]' : 'text-white'}>
                    {selectedBot.temperature}°C
                  </strong>
                </div>

                <div className="p-2.5 bg-[#0A0A0F]/80 border border-white/10 rounded-lg flex justify-between">
                  <span className="font-semibold text-zinc-400">EFFICIENCY RATING:</span>
                  <strong className="text-[#10B981]">{selectedBot.efficiency}%</strong>
                </div>

                <div className="p-3 bg-[#0A0A0F]/80 border border-[#D4AF37]/30 rounded-lg">
                  <span className="font-semibold text-zinc-400 block mb-1">ASSIGNED TASK:</span>
                  <span className="font-bold text-[#F3E5AB]">{selectedBot.task}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <button
                onClick={handleRecalibrate}
                className="w-full py-2.5 gold-gradient-bg text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all cursor-pointer"
              >
                🛠️ RECALIBRATE WIGGLE HARMONICS
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onUpdateBot({ ...selectedBot, status: 'SLEEPY', wiggleFreq: 10 });
                }}
                className="w-full py-2 bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-700 rounded-xl hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
              >
                💤 TOGGLE SLEEP MODE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
