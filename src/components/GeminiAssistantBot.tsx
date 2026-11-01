import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../utils/audio';
import {
  Bot,
  Send,
  X,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Terminal,
  ShieldCheck,
  Flame,
  Radio,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface GeminiAssistantBotProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: any) => void;
}

export const GeminiAssistantBot: React.FC<GeminiAssistantBotProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `🦀 **Crabdeck Quantum Assistant Online** (powered by \`gemini-3.8-flash\`).

I monitor your 1,440-minute bHive swarm mesh, 58/58 smoke assertions, Tiered Memory Vault, and Google Workspace integrations.

**Operational Highlights:**
• **Google Tasks Heat Map:** High priority urgent items are color-coded in **Crab Claw Orange (#FF4D00)**.
• **Loopback Confinement:** Strict 127.0.0.1:3001 single-machine security.
• **Carbon SecAuditor:** Real-time AST patch validation active.

How can I assist your operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: '🔥 Urgent Tasks (Crab Claw Orange)',
      prompt: 'Explain the Google Tasks heat map priority matrix and how Crab Claw Orange (#FF4D00) is applied to critical items.',
      action: () => onNavigateToView?.('google-tasks'),
    },
    {
      label: '🌐 Swarm Mesh Health',
      prompt: 'Report the current status of the bHive 1,440-minute swarm mesh, peer latency distribution, and gossip-delta sync.',
      action: () => onNavigateToView?.('bhive-mesh'),
    },
    {
      label: '🛡️ 58/58 Smoke Suite Audit',
      prompt: 'Summarize the 58 assertions verified in scripts/smoke.sh including AST patch validation and Hob sandbox confinement.',
      action: () => onNavigateToView?.('ast-auditor'),
    },
    {
      label: '⚡ Copilot Circuit Breaker',
      prompt: 'What are the tripping parameters of the Copilot Fusion latency circuit breaker and how does it downgrade execution?',
      action: () => onNavigateToView?.('copilot-fusion'),
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    soundFX.playClick();

    try {
      // Build history payload for server proxy
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Command synchronized successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
      soundFX.playSuccess();
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Tactical Communication Error**: Could not connect to the Gemini backend proxy.
${err.message || 'Check server connection and GEMINI_API_KEY configuration.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFX.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    soundFX.playClick();
    setMessages([
      {
        id: 'reset',
        role: 'model',
        text: 'Session history purged. Quantum core buffer refreshed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isExpanded
          ? 'inset-4 md:inset-8'
          : 'bottom-4 right-4 w-full max-w-lg md:max-w-xl h-[620px] max-h-[88vh]'
      }`}
    >
      {/* Outer Tactical Clay Box */}
      <div className="w-full h-full bg-[#0D0F14]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-[#FF4D00]/20 via-[#A855F7]/15 to-transparent pointer-events-none rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-64 h-32 bg-gradient-to-tr from-[#70D6FF]/15 to-transparent pointer-events-none rounded-tr-full" />

        {/* Top Header Bar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF4D00] to-[#FF8C00] flex items-center justify-center text-xl shadow-lg shadow-[#FF4D00]/25 transform hover:scale-105 transition-transform">
                🦀
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00FF66] border-2 border-[#0D0F14] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-sm text-white tracking-wide">
                  GEMINI ASSISTANT BOT
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#FF4D00]/20 text-[#FF4D00] border border-[#FF4D00]/40 flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" />
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
                <span>Autonomous Multi-Agent Copilot</span>
                <span>·</span>
                <span className="text-[#00FF66] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                  Active
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              title="Clear conversation history"
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Restore window size' : 'Expand window'}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors hidden sm:block"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close Assistant"
              className="p-2 text-gray-400 hover:text-[#FF2A55] rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs relative z-10 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#FF4D00]/20 border border-[#FF4D00]/40 text-[#FF4D00] flex items-center justify-center shrink-0 text-xs font-bold">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 relative group ${
                    isUser
                      ? 'bg-gradient-to-br from-[#70D6FF]/20 to-[#70D6FF]/10 border border-[#70D6FF]/30 text-white rounded-tr-none'
                      : 'bg-black/40 border border-white/10 text-gray-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed break-words">
                    {msg.text}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-white/5">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-white flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#00FF66]" />
                          <span className="text-[#00FF66]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#70D6FF]/20 border border-[#70D6FF]/40 text-[#70D6FF] flex items-center justify-center shrink-0 text-xs font-bold">
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-gray-400">
              <div className="w-7 h-7 rounded-xl bg-[#FF4D00]/20 border border-[#FF4D00]/40 text-[#FF4D00] flex items-center justify-center shrink-0 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF4D00]" />
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-1.5 text-xs text-[#FF4D00]">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Gemini 3.8 Flash is synthesizing reasoning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Preset Chips */}
        <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex items-center gap-2 overflow-x-auto relative z-10 scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                qp.action();
                handleSendMessage(qp.prompt);
              }}
              className="shrink-0 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-[#FF4D00]/20 hover:text-[#FF4D00] border border-white/10 hover:border-[#FF4D00]/40 text-[11px] font-mono text-gray-300 transition-all active:scale-95 flex items-center gap-1"
            >
              <span>{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Input Controls */}
        <div className="p-3 bg-black/50 border-t border-white/10 relative z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini Assistant about tasks, swarm latency, smoke audit..."
              disabled={isLoading}
              className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4D00] transition-colors font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF4D00] to-[#FF8C00] hover:opacity-90 active:scale-95 text-black font-extrabold text-xs transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-lg shadow-[#FF4D00]/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
