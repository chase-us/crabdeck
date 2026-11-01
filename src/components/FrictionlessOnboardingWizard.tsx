import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';

interface FrictionlessOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const FrictionlessOnboardingWizard: React.FC<FrictionlessOnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNextStep = () => {
    soundFX.playWiggle();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (step < 3) {
        setStep((s) => s + 1);
        soundFX.playClick();
      } else {
        soundFX.playChime();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 }
        });
        setTimeout(() => {
          onComplete();
          onClose();
        }, 800);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-code">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#140E2A] to-[#0A0716] border border-[#FFD700]/40 shadow-[0_0_50px_rgba(255,215,0,0.25)] p-6 space-y-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🚀</span>
            <div>
              <h3 className="text-base font-extrabold text-white font-sans">
                Frictionless Setup Wizard
              </h3>
              <p className="text-[11px] text-[#FFD700]">3-Step Loopback & Swarm Calibration</p>
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

        {/* Progress Stepper */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div
            className={`p-2 rounded-xl border transition-all ${
              step >= 1
                ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]'
                : 'bg-white/5 border-white/5 text-zinc-500'
            }`}
          >
            <span className="font-bold block text-[10px]">STEP 1</span>
            <span>127.0.0.1 Gateway</span>
          </div>

          <div
            className={`p-2 rounded-xl border transition-all ${
              step >= 2
                ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]'
                : 'bg-white/5 border-white/5 text-zinc-500'
            }`}
          >
            <span className="font-bold block text-[10px]">STEP 2</span>
            <span>1,440-Node Mesh</span>
          </div>

          <div
            className={`p-2 rounded-xl border transition-all ${
              step >= 3
                ? 'bg-[#70D6FF]/20 border-[#70D6FF] text-[#70D6FF]'
                : 'bg-white/5 border-white/5 text-zinc-500'
            }`}
          >
            <span className="font-bold block text-[10px]">STEP 3</span>
            <span>Crab-E Mascot</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
          {step === 1 && (
            <div className="space-y-2">
              <span className="text-[#FFD700] font-bold block text-sm">
                Step 1: Loopback Socket & Megabrain Handshake
              </span>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Crabdeck operates with strict local-first loopback boundaries. Binding Express gateway to 127.0.0.1 and mounting FastAPI Megabrain telemetry streams.
              </p>
              <div className="p-2.5 bg-black/60 rounded-lg text-[11px] font-mono text-emerald-400">
                [OK] Socket bound to 127.0.0.1:3000 // Zero-Trust Loopback active.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <span className="text-[#00FF66] font-bold block text-sm">
                Step 2: bHive Swarm Mesh Discovery & Chronos-Sync
              </span>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Discovering and mapping all 1,440 continuous minute-slot peer nodes. Aligning the 15-second Chronos pulse to eliminate temporal amnesia.
              </p>
              <div className="p-2.5 bg-black/60 rounded-lg text-[11px] font-mono text-emerald-400">
                [OK] 1,440/1,440 nodes verified. Chronos 15s heartbeat locked.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <span className="text-[#70D6FF] font-bold block text-sm">
                Step 3: Crab-E 3D Mascot Companion Awakening
              </span>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Calibrating Crab-E's blinking googly eyes, snappy claws, Web Audio synthesizer, and witty conversational speech bubble.
              </p>
              <div className="p-2.5 bg-black/60 rounded-lg text-[11px] font-mono text-[#70D6FF]">
                "Claws primed, eyes blinking! Ready to orchestrate the swarm, Boss!" 🦀
              </div>
            </div>
          )}
        </div>

        {/* Next / Launch Button */}
        <button
          onClick={handleNextStep}
          disabled={isProcessing}
          className="w-full py-3 bg-gradient-to-r from-[#FFD700] via-[#FFA800] to-[#FF8800] text-black font-extrabold rounded-xl text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-50"
        >
          <span>{step === 3 ? '🎉' : '➔'}</span>
          <span>
            {isProcessing
              ? 'CALIBRATING...'
              : step === 3
              ? 'LAUNCH CRABDECK OPERATING SYSTEM'
              : `CONTINUE TO STEP ${step + 1}`}
          </span>
        </button>
      </div>
    </div>
  );
};
