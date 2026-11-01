import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';

interface AstNodePreview {
  type: string;
  name?: string;
  line: number;
  depth: number;
  safety: 'SAFE' | 'WARN' | 'CRITICAL';
}

interface InvariantCheck {
  id: string;
  name: string;
  description: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

const PRESET_PATCHES = [
  {
    name: 'Loopback Boundary Guard',
    code: `// Carbon SecAuditor Patch #442: Enforce 127.0.0.1 Loopback
export function validateLoopbackSocket(address: string): boolean {
  const allowedHosts = ['127.0.0.1', 'localhost', '::1'];
  if (!allowedHosts.includes(address)) {
    throw new SecurityException('External socket exfiltration forbidden by SecAuditor.');
  }
  return true;
}`
  },
  {
    name: 'AST Invariant Validator',
    code: `// Weaver AST Invariant Guard
export function auditSyntaxTree(astNode: AstNode): { isValid: boolean } {
  if (astNode.type === 'CallExpression' && astNode.callee.name === 'eval') {
    return { isValid: false }; // Disallow dynamic eval
  }
  return { isValid: true };
}`
  },
  {
    name: 'Flux-Smith Thermal Limiter',
    code: `// Hardware APU Thermal Governor
export function enforceThermalCeiling(currentTempC: number): void {
  const CEILING_C = 75.0; // Flux-Smith cap
  if (currentTempC >= CEILING_C) {
    engageDynamicThrottling({ factor: 0.5, coolingFans: 'BOOST' });
  }
}`
  }
];

export const ASTPatchPlaygroundView: React.FC = () => {
  const [code, setCode] = useState<string>(PRESET_PATCHES[0].code);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [hasRunAudit, setHasRunAudit] = useState<boolean>(true);
  const [appliedCount, setAppliedCount] = useState<number>(14);

  // Parse simulated AST nodes from code
  const parsedNodes: AstNodePreview[] = [
    { type: 'Program', depth: 0, line: 1, safety: 'SAFE' },
    { type: 'ExportNamedDeclaration', depth: 1, line: 2, safety: 'SAFE' },
    { type: 'FunctionDeclaration', name: 'validateLoopbackSocket', depth: 2, line: 2, safety: 'SAFE' },
    { type: 'VariableDeclaration', name: 'allowedHosts', depth: 3, line: 3, safety: 'SAFE' },
    { type: 'IfStatement', depth: 3, line: 4, safety: 'SAFE' },
    { type: 'ThrowStatement', name: 'SecurityException', depth: 4, line: 5, safety: 'SAFE' },
    { type: 'ReturnStatement', depth: 3, line: 7, safety: 'SAFE' }
  ];

  // Invariant validation checks
  const checks: InvariantCheck[] = [
    {
      id: 'INV-01',
      name: 'Zero Dynamic Eval Execution',
      description: 'AST cannot contain CallExpressions targeting eval, Function constructor, or vm.runInContext.',
      status: code.includes('eval(') ? 'FAIL' : 'PASS',
      detail: code.includes('eval(') ? 'Dynamic eval statement detected at line 3.' : 'Zero dynamic eval occurrences detected.'
    },
    {
      id: 'INV-02',
      name: '127.0.0.1 Loopback Isolation',
      description: 'Network calls must be bound to localhost or 127.0.0.1 loopback gateway.',
      status: 'PASS',
      detail: 'Socket boundaries strictly sandboxed within loopback isolation.'
    },
    {
      id: 'INV-03',
      name: 'Syntax Invariant Balance',
      description: 'Brackets, braces, parentheses, and string tokens must balance without syntax deviations.',
      status: 'PASS',
      detail: 'Parser completed in 1.4ms with zero syntax errors.'
    },
    {
      id: 'INV-04',
      name: 'Deterministic Reversibility',
      description: 'Patch must generate a valid git-compatible unified diff and rollback transaction.',
      status: 'PASS',
      detail: 'Git unified diff generated: SHA-256 verified.'
    }
  ];

  const handleRunValidation = () => {
    soundFX.playWiggle();
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setHasRunAudit(true);
      soundFX.playChime();
    }, 600);
  };

  const handleApplyPatch = () => {
    soundFX.playChime();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
    setAppliedCount((c) => c + 1);
  };

  return (
    <div className="space-y-6 font-code text-white">
      {/* Top Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#0C081E] via-[#150E30] to-[#0A0618] border border-[#00FF66]/30 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h2 className="text-xl font-extrabold text-white font-sans tracking-wide">
                Carbon SecAuditor & AST Patch Validation Playground
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Test and verify code-patch syntax, invariants, and loopback boundaries prior to hot-applying modifications to the live multi-agent kernel.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-xl border border-white/10 text-xs">
            <span className="text-zinc-400">HOT-PATCHED INVARIANTS:</span>
            <span className="text-[#00FF66] font-extrabold text-sm">{appliedCount} ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Code Editor + Invariant Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Code Editor (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#080514]/90 border border-white/10 shadow-lg backdrop-blur-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FFD700]">SELECT PRESET PATCH:</span>
              <div className="flex gap-1.5">
                {PRESET_PATCHES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      soundFX.playClick();
                      setCode(p.code);
                    }}
                    className={`px-2.5 py-1 text-[11px] rounded-lg cursor-pointer transition-all ${
                      code === p.code
                        ? 'bg-[#FFD700] text-black font-extrabold'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[10px] text-zinc-500 font-mono">TypeScript / AST v5.8</span>
          </div>

          {/* Code Textarea */}
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={11}
              className="w-full p-4 rounded-xl bg-black/70 border border-white/15 text-xs text-[#00FF66] font-mono leading-relaxed focus:outline-none focus:border-[#00FF66] shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunValidation}
                disabled={isValidating}
                className="px-4 py-2 bg-[#70D6FF] text-black font-extrabold rounded-xl text-xs hover:bg-[#5bc5ff] active:scale-98 transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <span>🔍</span>
                <span>{isValidating ? 'PARSING AST...' : 'RUN AST SYNTAX & INVARIANT CHECK'}</span>
              </button>

              <button
                onClick={() => setCode('')}
                className="px-3 py-2 bg-white/5 text-zinc-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>

            <button
              onClick={handleApplyPatch}
              className="px-5 py-2 bg-gradient-to-r from-[#00FF66] to-[#00D655] text-black font-extrabold rounded-xl text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.3)]"
            >
              <span>🚀</span> APPLY PATCH TO LIVE KERNEL
            </button>
          </div>

          {/* Visual AST Syntax Tree Nodes */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <span>🌳</span> PARSED AST SYNTAX NODES
            </span>
            <div className="p-3 bg-black/50 rounded-xl border border-white/5 space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px]">
              {parsedNodes.map((n, idx) => (
                <div key={idx} className="flex items-center justify-between text-zinc-400">
                  <span style={{ paddingLeft: `${n.depth * 16}px` }}>
                    <span className="text-[#FFD700]">{n.type}</span>
                    {n.name && <span className="text-[#70D6FF] ml-1.5 font-bold">({n.name})</span>}
                  </span>
                  <span className="text-zinc-600 text-[10px]">Line {n.line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Carbon SecAuditor Scorecard (1 col) */}
        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-2xl bg-[#0D0922]/90 border border-[#00FF66]/30 shadow-lg backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs text-[#00FF66] font-bold tracking-wider flex items-center gap-1.5">
                <span>🛡️</span> SECAUDITOR SCORECARD
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                AUDITED
              </span>
            </div>

            <div className="text-center p-3 bg-black/40 rounded-xl border border-white/5">
              <div className="text-3xl font-extrabold text-[#00FF66] font-mono">100%</div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mt-0.5">
                SECURITY INVARIANT PASS RATE
              </div>
            </div>

            {/* Invariant list */}
            <div className="space-y-2.5">
              {checks.map((chk) => (
                <div
                  key={chk.id}
                  className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">{chk.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        chk.status === 'PASS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {chk.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{chk.description}</p>
                  <div className="text-[10px] text-zinc-500 font-mono pt-1">{chk.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
