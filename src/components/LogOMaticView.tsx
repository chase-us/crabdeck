import React, { useState } from 'react';
import { LogEntry } from '../types';
import { soundFX } from '../utils/audio';

interface LogOMaticViewProps {
  logs: LogEntry[];
  onAddLog: (entry: LogEntry) => void;
  gloopSaturation: number;
}

export const LogOMaticView: React.FC<LogOMaticViewProps> = ({
  logs,
  onAddLog,
  gloopSaturation
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [stickers, setStickers] = useState([
    { label: 'HEALTHY', active: true, color: 'bg-[#22c55e]' },
    { label: 'ENERGIZED', active: true, color: 'bg-[#ffd700]' },
    { label: 'WET & GLOOPY', active: true, color: 'bg-[#00f0ff]' },
    { label: 'ORGANIC', active: false, color: 'bg-[#a7e2ff]' }
  ]);

  const [speechBubble, setSpeechBubble] = useState('Megabrain is thinking super hard!');

  const handleDripFeed = () => {
    soundFX.playGloop();
    const sources = ['CRAB_CLAW', 'VISCOSITY_VALVE', 'BHIVE_NODE', 'MEGABRAIN_LOBE', 'HOT_SWAP_ROUTER'];
    const levels: LogEntry['level'][] = ['INFO', 'WARN', 'GLOOP', 'SUCCESS'];
    const messages = [
      'Gloop viscosity calibrated to 4,209.88 Liters.',
      'Juggling Crab verified 1,024 byte packets.',
      'Megabrain Lobe 04 temperature dropped by 1.2°C.',
      'Wasp wiggle harmonic resonance synchronized.',
      'Faiss Vector index cache refreshed in 2.1ms.'
    ];

    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    onAddLog({
      id: `log-${Date.now()}`,
      timestamp,
      level: randomLevel,
      source: randomSource,
      message: randomMsg
    });

    const bubbles = [
      'Glug glug glug!',
      'Node_01 is wiggling!',
      'Viscosity check passed!',
      'More Gloop needed!',
      'Quantum pincer locked!'
    ];
    setSpeechBubble(bubbles[Math.floor(Math.random() * bubbles.length)]);
  };

  const filteredLogs = logs.filter(l => filterLevel === 'ALL' || l.level === filterLevel);

  return (
    <div className="space-y-6 font-hanken">
      {/* Marquee Banner */}
      <div className="overflow-hidden bg-[#0A0A0F] text-[#F3E5AB] font-bold text-xs py-2 border-y border-[#D4AF37]/30">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          <span className="mx-4 font-mono">⚡ QUANTUM_FLUX_STABLE: 104.2%</span>
          <span className="mx-4 font-mono">🦀 CRAB_WRENCH_LUBRICATION_NEEDED</span>
          <span className="mx-4 font-mono">💧 GLOOP_SATURATION: {gloopSaturation}%</span>
          <span className="mx-4 font-mono">🐝 BHIVE_SWARM: 8,492 NODES</span>
          <span className="mx-4 font-mono">⚡ QUANTUM_FLUX_STABLE: 104.2%</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive Juggling Crab & Gloop Valve */}
        <div className="p-5 sophisticated-card rounded-2xl space-y-4 flex flex-col justify-between border border-[#D4AF37]/30">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif-luxury text-xl font-bold gold-gradient-text">
                LOG-O-MATIC 3000
              </h3>
              <span className="px-2.5 py-0.5 gold-badge text-xs rounded font-mono">
                LIVE DRIP
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              Behold the pulsing veins of the Quantum Omni-Layer. Everything is fine. Probably.
            </p>
          </div>

          {/* Juggling Crab Graphic & Speech Bubble */}
          <div className="relative flex flex-col items-center justify-center p-4 bg-[#0A0A0F]/80 border border-[#D4AF37]/20 rounded-xl">
            {/* Speech Bubble */}
            <div className="absolute -top-4 bg-[#1A1810] border border-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold text-[#F3E5AB] shadow-md animate-bounce">
              {speechBubble}
            </div>

            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_SEuGwTkpdvhv-Mlz67wjpEi1mlRbh7O9heFdTmvm8dpmmdqPljYpLsVHQbRr_mRgTzRYgOzuqs03-J0OIz9uX6wsH1DyCIIOTbhzz2nl8NazBR00Kr4b8rVggEjrzV2PfMQ_ms7AI6N5dq9PeaGwgDk8upX43sJN89UnvSuSGUonUQfxm2xBl7umqte_R4Is6LAXvURKHgD4FVDwFO0p8JQ43JobRaom9MeJu_yxvajlKegEGlac9frqXBJ0zDmnIm6Fq0SLl-A"
              alt="Juggling Crab"
              className="w-32 h-32 object-contain hover:scale-105 transition-transform cursor-pointer"
              onClick={handleDripFeed}
              referrerPolicy="no-referrer"
            />
            <span className="text-[11px] font-bold text-[#D4AF37] mt-1 font-mono">CLICK CRAB TO DRIP LOGS</span>
          </div>

          {/* Vitality Check Stickers */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              VITALITY CHECK STICKERS
            </h4>
            <div className="flex flex-wrap gap-2">
              {stickers.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundFX.playClick();
                    setStickers(prev => prev.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
                  }}
                  className={`px-3 py-1 text-xs font-bold text-black rounded-lg border border-black transition-all cursor-pointer ${
                    st.active ? st.color : 'bg-zinc-800 text-zinc-500 line-through opacity-60 border-zinc-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drip Feed Action Button */}
          <button
            onClick={handleDripFeed}
            className="w-full py-3 gold-gradient-bg text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all cursor-pointer"
          >
            💧 TRIGGER DRIP FEED LOG
          </button>
        </div>

        {/* Right Log Stream Window */}
        <div className="lg:col-span-2 p-5 sophisticated-card rounded-2xl border border-[#D4AF37]/30 flex flex-col justify-between">
          <div>
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 font-mono-space">FILTER LEVEL:</span>
                {['ALL', 'INFO', 'WARN', 'CRITICAL', 'GLOOP'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-2.5 py-1 text-xs font-bold font-code rounded border transition-all cursor-pointer ${
                      filterLevel === lvl
                        ? 'gold-gradient-bg text-black font-extrabold border-0'
                        : 'bg-[#121218] text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <span className="text-xs font-code text-[#F3E5AB]">
                {filteredLogs.length} LOG ENTRIES
              </span>
            </div>

            {/* Log Entries Container */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2 font-code text-xs">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#0A0A0F]/90 border border-white/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-[#D4AF37]/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      log.level === 'CRITICAL' || log.level === 'WARN'
                        ? 'bg-[#EF4444] text-white'
                        : log.level === 'GLOOP'
                        ? 'gold-badge'
                        : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-zinc-500">{log.timestamp}</span>
                    <span className="text-[#D4AF37] font-bold">[{log.source}]</span>
                  </div>
                  <div className="text-zinc-200 font-medium">
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Gloop Saturation Bar */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex justify-between text-xs font-code text-zinc-300 mb-1">
              <span>GLOOP RESERVOIR CAPACITY:</span>
              <strong className="text-[#F3E5AB]">{gloopSaturation}% FULL</strong>
            </div>
            <div className="w-full h-3 bg-zinc-900 border border-white/10 rounded-full overflow-hidden">
              <div
                className="h-full gold-gradient-bg transition-all duration-500"
                style={{ width: `${gloopSaturation}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
