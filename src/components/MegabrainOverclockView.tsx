import React, { useState } from 'react';
import { GooglyEyes } from './GooglyEyes';
import { soundFX } from '../utils/audio';

interface MegabrainProps {
  onInitiateGloop: () => void;
  onFlushCache: () => void;
  onFixWiggles: () => void;
  gloopSaturation: number;
  sludgeLtrs: number;
}

export const MegabrainOverclockView: React.FC<MegabrainProps> = ({
  onInitiateGloop,
  onFlushCache,
  onFixWiggles,
  gloopSaturation,
  sludgeLtrs
}) => {
  const [pulseHertz, setPulseHertz] = useState(4.20);
  const [wobbleFreq, setWobbleFreq] = useState(88);
  const [isGlooping, setIsGlooping] = useState(false);

  const handleGloop = () => {
    soundFX.playGloop();
    setIsGlooping(true);
    setPulseHertz(prev => +(prev + 0.5).toFixed(2));
    onInitiateGloop();
    setTimeout(() => setIsGlooping(false), 1500);
  };

  const handleFlush = () => {
    soundFX.playClick();
    onFlushCache();
    setPulseHertz(4.20);
  };

  return (
    <div className="space-y-6 font-hanken">
      {/* Hero Overclocking Card */}
      <div className="p-6 sophisticated-card rounded-3xl text-white relative overflow-hidden border border-[#D4AF37]/30">
        {/* Background Glitch Elements */}
        <div className="absolute top-3 right-4 text-xs font-mono gold-badge px-3 py-1 rounded-md">
          STATUS: MEGABRAIN_OVERCLOCK_ACTIVE
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Text & Primary Actions */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight gold-gradient-text">
              MEGABRAIN IS OVERCLOCKING! ⚡
            </h2>
            <p className="text-sm font-medium leading-relaxed max-w-xl text-zinc-300">
              The Quantum Omni-Layer is pulsating at <strong className="text-[#F3E5AB]">{pulseHertz} Gloop-Hertz</strong>. All worker bots are wiggling in synchronized harmony. Sludge levels are within optimal parameters.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleGloop}
                className="gold-gradient-bg px-6 py-3 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all"
              >
                <span>💧 INITIATE GLOOP</span>
              </button>

              <button
                onClick={handleFlush}
                className="px-6 py-3 bg-[#1A1810] border border-[#D4AF37]/40 text-[#F3E5AB] font-bold text-xs rounded-xl uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:border-[#D4AF37] transition-all"
              >
                <span>⚡ FLUSH CACHE</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playWiggle();
                  onFixWiggles();
                }}
                className="px-5 py-3 bg-zinc-800 border border-zinc-700 text-white font-bold text-xs rounded-xl hover:bg-zinc-700 transition-all cursor-pointer"
              >
                🛠️ FIX WIGGLES
              </button>
            </div>
          </div>

          {/* Googly Eyes Companion */}
          <div className="flex justify-center md:justify-end">
            <GooglyEyes size="lg" label="MEGABRAIN CORE v.27" expression={isGlooping ? 'crazy' : 'happy'} />
          </div>
        </div>
      </div>

      {/* Metrics & Saturation Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sludge Volume Meter */}
        <div className="p-5 sophisticated-card rounded-2xl space-y-3 border border-[#D4AF37]/20">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-zinc-400 uppercase tracking-wider">TOTAL SLUDGE RESERVES</span>
            <span className="px-2 py-0.5 gold-badge text-xs rounded">
              VISCOSITY
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono-space">
            {sludgeLtrs.toLocaleString('en-US', { minimumFractionDigits: 2 })} LTRS
          </div>
          <div className="w-full h-3 bg-zinc-900 border border-white/10 rounded-full overflow-hidden">
            <div
              className="h-full gold-gradient-bg transition-all duration-500"
              style={{ width: `${Math.min(100, gloopSaturation)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium text-zinc-400">
            <span>SATURATION: {gloopSaturation}%</span>
            <span>CAPACITY: 6,000 LTRS</span>
          </div>
        </div>

        {/* Pulsator Wobble Frequency */}
        <div className="p-5 sophisticated-card rounded-2xl space-y-3 border border-[#D4AF37]/20">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-zinc-400 uppercase tracking-wider">WOBBLE HARMONICS</span>
            <span className="px-2 py-0.5 gold-badge text-xs rounded">
              PULSATOR-X
            </span>
          </div>
          <div className="text-2xl font-bold text-[#F3E5AB] font-mono-space">
            {wobbleFreq} Hz RESONANCE
          </div>
          <input
            type="range"
            min="20"
            max="200"
            value={wobbleFreq}
            onChange={(e) => setWobbleFreq(parseInt(e.target.value))}
            className="w-full accent-[#D4AF37] cursor-pointer"
          />
          <div className="flex justify-between text-xs font-medium text-zinc-400">
            <span>MIN: 20Hz</span>
            <span>MAX: 200Hz</span>
          </div>
        </div>

        {/* Worker Bot Sync Status */}
        <div className="p-5 sophisticated-card rounded-2xl text-white space-y-3 border border-[#D4AF37]/20">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs uppercase text-zinc-400 tracking-wider">WORKER BOT HARMONY</span>
            <span className="px-2 py-0.5 bg-[#10B981]/20 border border-[#10B981] text-[#10B981] font-bold text-xs rounded">
              100% SYNCED
            </span>
          </div>
          <div className="text-2xl font-bold text-[#10B981] font-mono-space">
            14,992 UNITS
          </div>
          <p className="text-xs text-zinc-300 leading-snug">
            All 14,992 wiggling bots are executing quantum matrix operations with zero heat throttling.
          </p>
        </div>
      </div>
    </div>
  );
};
