import React, { useState, useRef, useEffect } from 'react';
import { soundFX } from '../utils/audio';

interface CommandTerminalProps {
  onExecuteClaw: () => void;
  onHotSwapModel: (modelId: string) => void;
  onGloopBoost: () => void;
  activeModelName: string;
}

export const CommandTerminal: React.FC<CommandTerminalProps> = ({
  onExecuteClaw,
  onHotSwapModel,
  onGloopBoost,
  activeModelName
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<Array<{ text: string; type: 'cmd' | 'resp' | 'err' | 'success' }>>([
    { text: 'Crabdeck Quantum Omni-Layer v4.2.0-RELEASE', type: 'resp' },
    { text: 'Type "help" to view all tactical quantum protocols.', type: 'resp' },
    { text: `Current Active Primary: [ ${activeModelName.toUpperCase()} ]`, type: 'success' }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    soundFX.playClick();
    setHistory(prev => [...prev, { text: `root@crabdeck:~$ ${inputVal}`, type: 'cmd' }]);
    setInputVal('');

    if (cmd === 'help') {
      setHistory(prev => [
        ...prev,
        { text: '--- CRABDECK QUANTUM OMNI-LAYER COMMAND MANUAL ---', type: 'resp' },
        { text: '  status       - View Megabrain & bHive node telemetry', type: 'resp' },
        { text: '  execute claw - Fire tactical pincer override protocol', type: 'resp' },
        { text: '  hot-swap     - Hot-swap active primary model', type: 'resp' },
        { text: '  gloop        - Inject 1,000 Liters of Gloop sludge', type: 'resp' },
        { text: '  swarm        - Scan 8,492 bHive swarm nodes', type: 'resp' },
        { text: '  clear        - Clear terminal screen buffer', type: 'resp' }
      ]);
    } else if (cmd === 'status') {
      setHistory(prev => [
        ...prev,
        { text: `SYSTEM_STABILITY: 99.9% | MEGABRAIN_PULSE: 4.20 GHz`, type: 'success' },
        { text: `ACTIVE_MODEL: ${activeModelName} | LATENCY: 8.4ms`, type: 'success' },
        { text: `SWARM_NODES: 8,492 ONLINE | GLOOP_SATURATION: 75.2%`, type: 'success' }
      ]);
    } else if (cmd === 'execute claw' || cmd === 'claw') {
      onExecuteClaw();
      setHistory(prev => [
        ...prev,
        { text: '🦀 EXECUTE_CLAW Protocol Triggered! Tactical pincers deployed.', type: 'success' }
      ]);
    } else if (cmd.startsWith('hot-swap')) {
      const parts = cmd.split(' ');
      const target = parts[1] || 'next';
      onHotSwapModel(target);
      soundFX.playHotSwap();
      setHistory(prev => [
        ...prev,
        { text: `⚡ HOT-SWAP INITIATED! Swapping active model matrix...`, type: 'success' }
      ]);
    } else if (cmd === 'gloop') {
      onGloopBoost();
      soundFX.playGloop();
      setHistory(prev => [
        ...prev,
        { text: '💧 GLOOP INJECTION COMPLETE! Viscosity index boosted.', type: 'success' }
      ]);
    } else if (cmd === 'swarm') {
      soundFX.playWiggle();
      setHistory(prev => [
        ...prev,
        { text: '🐝 SWARM SCAN: 8,492 bHive nodes responding in 1.2ms. All wiggling in harmony.', type: 'resp' }
      ]);
    } else if (cmd === 'clear') {
      setHistory([]);
    } else {
      setHistory(prev => [
        ...prev,
        { text: `Command not recognized: "${cmd}". Type "help" for valid syntax.`, type: 'err' }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full clay-card-3d rounded-3xl overflow-hidden font-code border border-white/10 shadow-lg backdrop-blur-xl">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/50 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF2A55]" />
          <span className="w-3 h-3 rounded-full bg-[#FFD700]" />
          <span className="w-3 h-3 rounded-full bg-[#00FF66]" />
          <span className="ml-2 font-display font-extrabold tracking-tight text-white">SHELL CRACKED TERMINAL</span>
        </div>
        <span className="text-[#70D6FF] font-code text-[11px]">root@crabdeck:~#</span>
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-2 text-xs min-h-[180px] max-h-[280px]">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`${
              item.type === 'cmd'
                ? 'text-[#FFD700] font-bold'
                : item.type === 'err'
                ? 'text-[#FF2A55] font-bold'
                : item.type === 'success'
                ? 'text-[#00FF66] font-bold'
                : 'text-zinc-200'
            }`}
          >
            {item.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Input Prompt Form */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 px-5 py-3 bg-black/60 border-t border-white/10 text-xs">
        <span className="text-[#70D6FF] font-bold shrink-0">root@crabdeck:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="type 'help', 'execute claw', 'status', or 'hot-swap'..."
          className="flex-1 bg-transparent text-white outline-none font-code placeholder:text-zinc-600"
        />
        <button
          type="submit"
          className="px-4 py-1.5 rounded-xl clay-btn-gold font-display font-extrabold text-xs active:scale-95 transition-all cursor-pointer shrink-0 shadow-sm"
        >
          EXECUTE
        </button>
      </form>
    </div>
  );
};
