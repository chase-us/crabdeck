import React, { useState, useEffect } from 'react';
import { soundFX } from '../utils/audio';

interface WalFrame {
  frameNumber: number;
  timestamp: string;
  pageNumber: number;
  transactionId: string;
  salt1: string;
  salt2: string;
  sizeBytes: number;
  isCommit: boolean;
}

interface VectorEmbeddingItem {
  id: string;
  collection: string;
  snippet: string;
  similarity: number;
  tokens: number;
  dimensions: number;
  metadata: { agent: string; sector: string; timestamp: string };
}

interface KnowledgeEdge {
  source: string;
  target: string;
  relationship: string;
  confidence: number;
}

export const TieredMemoryVaultView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HOT_SQLITE_WAL' | 'COLD_CHROMADB_GRAPH'>('HOT_SQLITE_WAL');
  
  // Hot SQLite WAL State
  const [walRingBufferOccupancy, setWalRingBufferOccupancy] = useState<number>(42); // 42%
  const [walFrames, setWalFrames] = useState<WalFrame[]>([
    {
      frameNumber: 84920,
      timestamp: '14:28:10.042',
      pageNumber: 142,
      transactionId: 'tx_0x9b1c7',
      salt1: '0xFA31',
      salt2: '0x8802',
      sizeBytes: 4096,
      isCommit: true
    },
    {
      frameNumber: 84919,
      timestamp: '14:28:09.814',
      pageNumber: 89,
      transactionId: 'tx_0x9b1c6',
      salt1: '0xFA31',
      salt2: '0x8801',
      sizeBytes: 4096,
      isCommit: false
    },
    {
      frameNumber: 84918,
      timestamp: '14:28:09.110',
      pageNumber: 210,
      transactionId: 'tx_0x9b1c5',
      salt1: '0xFA31',
      salt2: '0x8800',
      sizeBytes: 4096,
      isCommit: true
    },
    {
      frameNumber: 84917,
      timestamp: '14:28:08.520',
      pageNumber: 15,
      transactionId: 'tx_0x9b1c4',
      salt1: '0xFA30',
      salt2: '0x8799',
      sizeBytes: 4096,
      isCommit: true
    }
  ]);
  const [isCheckpointing, setIsCheckpointing] = useState<boolean>(false);

  // Cold ChromaDB Vector State
  const [searchQuery, setSearchQuery] = useState<string>('AST patch safety invariants');
  const [embeddings, setEmbeddings] = useState<VectorEmbeddingItem[]>([
    {
      id: 'vec_7749',
      collection: 'sec_auditor_rules',
      snippet: 'Invariant SEC-04: Ensure AST parser checks for forbidden global prototypes before hot-applying code.',
      similarity: 0.942,
      tokens: 38,
      dimensions: 1536,
      metadata: { agent: 'Breaker-Sentinel', sector: 'Sector 03', timestamp: '2026-10-28 10:14' }
    },
    {
      id: 'vec_8102',
      collection: 'gloop_hydro_spec',
      snippet: 'Flux-Smith thermal ceiling established at 75°C. Gloop cooling loop dispatches at 1,420 cP dynamic viscosity.',
      similarity: 0.887,
      tokens: 42,
      dimensions: 1536,
      metadata: { agent: 'Gloop-Hydrator', sector: 'Sector 04', timestamp: '2026-10-29 08:32' }
    },
    {
      id: 'vec_9410',
      collection: 'swarm_chronos_sync',
      snippet: 'Chronos-Sync 15-second heartbeat loop prevents node amnesia across 1,440 continuous minute-slots.',
      similarity: 0.865,
      tokens: 34,
      dimensions: 1536,
      metadata: { agent: 'Quantum-Scheduler', sector: 'Sector 01', timestamp: '2026-10-30 14:02' }
    }
  ]);

  const knowledgeEdges: KnowledgeEdge[] = [
    { source: 'Hermes-3-Bio', target: 'Shell Cracked Memory', relationship: 'WRITES_WAL', confidence: 0.99 },
    { source: 'Shell Cracked Memory', target: 'ChromaDB Cold Index', relationship: 'ASYNCS_EMBEDDINGS', confidence: 0.98 },
    { source: 'Carbon SecAuditor', target: 'AST Validator', relationship: 'ENFORCES_INVARIANT', confidence: 1.0 },
    { source: 'Weaver-Prime', target: 'FastAPI Megabrain', relationship: 'STREAMS_TELEMETRY', confidence: 0.95 }
  ];

  // Live incoming WAL frames
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      const isCommit = Math.random() > 0.35;
      const newFrame: WalFrame = {
        frameNumber: 84920 + Math.floor(Math.random() * 500),
        timestamp: timeStr,
        pageNumber: Math.floor(Math.random() * 300) + 1,
        transactionId: `tx_0x${Math.random().toString(16).slice(2, 7)}`,
        salt1: '0xFA32',
        salt2: `0x${Math.floor(Math.random() * 9000).toString(16)}`,
        sizeBytes: 4096,
        isCommit
      };

      setWalFrames((prev) => [newFrame, ...prev.slice(0, 15)]);
      setWalRingBufferOccupancy((prev) => Math.min(95, Math.max(15, +(prev + (isCommit ? 0.4 : -0.3)).toFixed(1))));
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const handleCheckpointWAL = () => {
    soundFX.playWiggle();
    setIsCheckpointing(true);
    setTimeout(() => {
      setWalRingBufferOccupancy(12.5);
      setIsCheckpointing(false);
      soundFX.playChime();
    }, 1200);
  };

  const handleRunVectorQuery = () => {
    soundFX.playClick();
    // Simulate query re-ranking
    setEmbeddings((prev) =>
      prev.map((e) => ({
        ...e,
        similarity: +(0.82 + Math.random() * 0.17).toFixed(3)
      })).sort((a, b) => b.similarity - a.similarity)
    );
  };

  return (
    <div className="space-y-6 font-code text-white">
      {/* Top Header */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#0E0A22] via-[#160E36] to-[#0A071A] border border-[#A855F7]/30 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💾</span>
              <h2 className="text-xl font-extrabold text-white font-sans tracking-wide">
                Shell Cracked Tiered Memory Vault
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Zero-amnesia multi-tier memory architecture. Hot state: ultra-fast SQLite WAL loopback buffer. Cold state: ChromaDB vector embeddings & Neo4j graph.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('HOT_SQLITE_WAL');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                activeTab === 'HOT_SQLITE_WAL'
                  ? 'bg-[#FFD700] text-black shadow-[0_0_12px_rgba(255,215,0,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🔥 HOT STATE // SQLITE WAL
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setActiveTab('COLD_CHROMADB_GRAPH');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                activeTab === 'COLD_CHROMADB_GRAPH'
                  ? 'bg-[#70D6FF] text-black shadow-[0_0_12px_rgba(112,214,255,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🧊 COLD STATE // CHROMADB & GRAPH
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'HOT_SQLITE_WAL' ? (
        /* ================= HOT STATE: SQLITE WAL ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Live WAL Log Ring Buffer (2 cols) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#090616]/90 border border-[#FFD700]/25 shadow-lg backdrop-blur-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#FFD700] flex items-center gap-2">
                  <span>⚡</span> WRITE-AHEAD LOG (WAL) FRAME PIPELINE
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Direct loopback commit buffer (127.0.0.1). 4KB aligned pages with sub-millisecond sync.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400">COMMIT LATENCY:</span>
                <span className="text-emerald-400 font-extrabold text-sm">0.24 ms</span>
              </div>
            </div>

            {/* WAL Frame Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-[10px] uppercase">
                    <th className="py-2 px-3">Frame #</th>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Page #</th>
                    <th className="py-2 px-3">Tx ID</th>
                    <th className="py-2 px-3">Salt 1 / 2</th>
                    <th className="py-2 px-3">Size</th>
                    <th className="py-2 px-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {walFrames.map((f) => (
                    <tr key={`${f.frameNumber}-${f.timestamp}`} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-3 text-[#FFD700] font-bold">#{f.frameNumber}</td>
                      <td className="py-2 px-3 text-zinc-400">{f.timestamp}</td>
                      <td className="py-2 px-3 text-white">p.{f.pageNumber}</td>
                      <td className="py-2 px-3 text-[#70D6FF]">{f.transactionId}</td>
                      <td className="py-2 px-3 text-zinc-500">{f.salt1} / {f.salt2}</td>
                      <td className="py-2 px-3 text-zinc-300">{f.sizeBytes} B</td>
                      <td className="py-2 px-3">
                        {f.isCommit ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            COMMIT
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-400">
                            FRAME
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: WAL Ring Buffer Diagnostics & Checkpointing (1 col) */}
          <div className="flex flex-col gap-5">
            <div className="p-5 rounded-2xl bg-[#0D0924]/90 border border-[#FFD700]/30 shadow-lg backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs text-[#FFD700] font-bold tracking-wider">
                  RING BUFFER CAPACITY
                </span>
                <span className="text-xs text-white font-extrabold">{walRingBufferOccupancy}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-500 ${
                    walRingBufferOccupancy > 75
                      ? 'bg-rose-500'
                      : walRingBufferOccupancy > 50
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${walRingBufferOccupancy}%` }}
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex justify-between">
                  <span className="text-zinc-400">WAL File Size:</span>
                  <span className="text-white font-bold">14.8 MB</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex justify-between">
                  <span className="text-zinc-400">Active DB Readers:</span>
                  <span className="text-[#00FF66] font-bold">8 Connections</span>
                </div>
                <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex justify-between">
                  <span className="text-zinc-400">Last Checkpoint:</span>
                  <span className="text-zinc-300 font-mono">14:25:00 UTC</span>
                </div>
              </div>

              <button
                onClick={handleCheckpointWAL}
                disabled={isCheckpointing}
                className="w-full py-2.5 bg-gradient-to-r from-[#FFD700] to-[#E5C158] text-black font-extrabold rounded-xl text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <span>🔄</span>
                <span>{isCheckpointing ? 'CHECKPOINTING WAL PAGES...' : 'CHECKPOINT WAL (FLUSH TO DISK)'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-zinc-400 space-y-1.5">
              <span className="text-white font-bold block">💡 SQLite WAL Architecture Note:</span>
              <p>
                In WAL mode, writes are appended directly to the wal file without modifying the main database page tree. Readers read concurrently without locking writers.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ================= COLD STATE: CHROMADB & GRAPH ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: ChromaDB Semantic Search & Vector Explorer (2 cols) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#080618]/90 border border-[#70D6FF]/25 shadow-lg backdrop-blur-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#70D6FF] flex items-center gap-2">
                  <span>🧊</span> CHROMADB VECTOR STORE EMBEDDINGS (1,024,000 VECTORS)
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Cosine distance KNN retrieval. 1536-dimensional embeddings with sub-millisecond approximate lookup.
                </p>
              </div>

              <div className="text-xs text-zinc-400">
                TOTAL EMBEDDINGS: <span className="text-[#70D6FF] font-extrabold">1,024,000</span>
              </div>
            </div>

            {/* Semantic Query Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter semantic query prompt..."
                className="flex-1 px-3 py-2 text-xs bg-black/60 border border-white/15 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#70D6FF]"
              />
              <button
                onClick={handleRunVectorQuery}
                className="px-4 py-2 bg-[#70D6FF] text-black font-extrabold rounded-xl text-xs hover:bg-[#5bc5ff] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🔍</span> QUERY
              </button>
            </div>

            {/* Embeddings Result Cards */}
            <div className="space-y-3">
              {embeddings.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-2 hover:border-[#70D6FF]/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#70D6FF]/20 text-[#70D6FF] font-bold">
                        {item.collection}
                      </span>
                      <span className="text-zinc-500 font-mono text-[10px]">{item.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400">COSINE SIMILARITY:</span>
                      <span className="text-emerald-400 font-extrabold text-xs">
                        {(item.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">{item.snippet}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500 pt-1 border-t border-white/5">
                    <span>Agent: {item.metadata.agent} ({item.metadata.sector})</span>
                    <span>{item.tokens} Tokens | {item.dimensions} Dimensions | {item.metadata.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Neo4j Knowledge Graph Relationships (1 col) */}
          <div className="flex flex-col gap-5">
            <div className="p-5 rounded-2xl bg-[#0D0922]/90 border border-[#A855F7]/30 shadow-lg backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs text-[#A855F7] font-bold tracking-wider flex items-center gap-1.5">
                  <span>🕸️</span> NEO4J KNOWLEDGE GRAPH
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">RELATIONSHIPS</span>
              </div>

              <p className="text-[11px] text-zinc-400">
                Semantic entity triples connecting agents, memories, AST checkers, and thermal safety boundaries.
              </p>

              <div className="space-y-2.5">
                {knowledgeEdges.map((edge, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white font-bold">{edge.source}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono font-bold">
                        {edge.relationship}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>➔ {edge.target}</span>
                      <span className="text-emerald-400 font-bold">{(edge.confidence * 100).toFixed(0)}% Conf</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  soundFX.playClick();
                }}
                className="w-full py-2 bg-[#A855F7]/20 border border-[#A855F7] text-[#A855F7] hover:bg-[#A855F7] hover:text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer"
              >
                SYNC KNOWLEDGE GRAPH EDGES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
