import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../utils/audio';

interface VoiceConductorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (command: string) => void;
}

const SAMPLE_COMMANDS = [
  'Show War Room',
  'Open 1,440-Node Swarm',
  'Inspect Memory Vault',
  'Audit AST Patch',
  'Copilot Fusion Bench',
  'Check Biological Heartbeat',
  'Inject 1,000L Gloop'
];

export const VoiceConductorModal: React.FC<VoiceConductorModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand
}) => {
  const [isListening, setIsListening] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  const [crabReply, setCrabReply] = useState<string>('Crab-E is listening! Say a command or pick a preset below.');
  const [voiceVolume, setVoiceVolume] = useState<number[]>([12, 28, 45, 62, 38, 20, 50, 75, 42, 18]);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    soundFX.playWiggle();

    // Simulate ambient microphone waveform
    const interval = setInterval(() => {
      setVoiceVolume(
        Array.from({ length: 14 }, () => Math.floor(15 + Math.random() * 80))
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCommandPick = (cmd: string) => {
    soundFX.playClick();
    setTranscript(cmd);
    setIsListening(false);

    // Provide friendly Crab-E reply
    let reply = `Executing "${cmd}" across the swarm!`;
    if (cmd.includes('War Room')) reply = 'Zooming back to the War Room command bridge! 🦀';
    if (cmd.includes('Swarm')) reply = 'Synchronizing all 1,440 minute-slot nodes! 🌐';
    if (cmd.includes('Memory')) reply = 'Opening SQLite WAL & ChromaDB vector vault! 💾';
    if (cmd.includes('AST')) reply = 'Engaging Carbon SecAuditor AST playground! 🛡️';
    if (cmd.includes('Gloop')) reply = 'Hydrating reactor lines with fresh sludge gloop! 🍌';

    setCrabReply(reply);
    soundFX.playChime();

    setTimeout(() => {
      onExecuteCommand(cmd);
      onClose();
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-code">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#140E2A] to-[#0A0716] border border-[#70D6FF]/40 shadow-[0_0_50px_rgba(112,214,255,0.25)] p-6 space-y-5 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-pulse">🎙️</span>
            <div>
              <h3 className="text-base font-extrabold text-white font-sans">
                Voice Conductor & Synthesizer
              </h3>
              <p className="text-[11px] text-[#70D6FF]">Real-time natural language voice orchestration</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Animated Microphone Frequency Visualizer */}
        <div className="p-4 bg-black/50 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-3">
          <div className="flex items-end justify-center gap-1.5 h-16 w-full px-4">
            {voiceVolume.map((vol, idx) => (
              <div
                key={idx}
                className="w-2 rounded-full transition-all duration-100"
                style={{
                  height: `${vol}%`,
                  background: `linear-gradient(to top, #70D6FF, #00FF66)`
                }}
              />
            ))}
          </div>

          <div className="text-center">
            <span className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {isListening ? 'MICROPHONE LISTENING (ACTIVE)' : 'COMMAND RECOGNIZED'}
            </span>
            <p className="text-xs text-zinc-300 font-sans mt-1">
              {transcript ? `"${transcript}"` : 'Listening for operator voice command...'}
            </p>
          </div>
        </div>

        {/* Crab-E Mascot Speech Bubble */}
        <div className="p-3 bg-[#1B1238] rounded-xl border border-[#FFD700]/30 flex items-start gap-3">
          <span className="text-2xl">🦀</span>
          <div className="text-xs">
            <span className="text-[#FFD700] font-bold block">Crab-E:</span>
            <p className="text-zinc-200 mt-0.5">{crabReply}</p>
          </div>
        </div>

        {/* Suggested Voice Commands */}
        <div className="space-y-2">
          <span className="text-[11px] text-zinc-400 font-bold block">
            OR CLICK A VOICE COMMAND SHORTCUT:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleCommandPick(cmd)}
                className="px-3 py-1.5 bg-white/5 hover:bg-[#70D6FF]/20 hover:border-[#70D6FF] border border-white/10 rounded-xl text-xs text-zinc-300 hover:text-white transition-all cursor-pointer font-sans"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
