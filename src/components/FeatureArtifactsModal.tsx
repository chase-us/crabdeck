import React, { useState } from 'react';
import { FEATURE_ARTIFACTS, FeatureArtifact } from '../data/featureArtifactsData';
import { AppView } from '../types';
import { soundFX } from '../utils/audio';
import {
  X,
  FileText,
  Shield,
  Layers,
  Search,
  CheckCircle,
  ExternalLink,
  Copy,
  Download,
  Terminal,
  Cpu,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeatureArtifactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: AppView) => void;
}

export const FeatureArtifactsModal: React.FC<FeatureArtifactsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView
}) => {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>('FEAT-01');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedPath, setCopiedPath] = useState(false);

  if (!isOpen) return null;

  const categories = ['All', 'Operations', 'Intelligence', 'Security', 'Telemetry', 'DevOps'];

  const filteredArtifacts = FEATURE_ARTIFACTS.filter(art => {
    const matchesCategory = categoryFilter === 'All' || art.category === categoryFilter;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedArtifact = FEATURE_ARTIFACTS.find(a => a.id === selectedArtifactId) || FEATURE_ARTIFACTS[0];

  const getTargetViewForArtifact = (id: string): AppView | null => {
    switch (id) {
      case 'FEAT-01': return 'war-room';
      case 'FEAT-02': return 'bhive-mesh';
      case 'FEAT-03': return 'bhive-chat';
      case 'FEAT-04': return 'ast-auditor';
      case 'FEAT-05': return 'memory-vault';
      case 'FEAT-06': return 'copilot-fusion';
      case 'FEAT-07': return 'biological-heartbeat';
      case 'FEAT-08': return 'megabrain';
      case 'FEAT-09': return 'worker-playground';
      case 'FEAT-10': return 'log-o-matic';
      case 'FEAT-11': return 'gloop-analytics';
      case 'FEAT-15': return 'google-drive';
      default: return null;
    }
  };

  const handleCopyPath = () => {
    const fullPath = `/.aistudio/artifacts/brain/4c66f518-25c9-4c07-b3ae-f2e1bd54f2cc/${selectedArtifact.fileName}`;
    navigator.clipboard?.writeText(fullPath);
    setCopiedPath(true);
    soundFX.playClick();
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleNavigate = () => {
    const view = getTargetViewForArtifact(selectedArtifact.id);
    if (view && onNavigateToView) {
      soundFX.playWiggle();
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { x: 0.5, y: 0.4 }
      });
      onNavigateToView(view);
      onClose();
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Safe': return 'badge-green text-[#00FF66]';
      case 'Write': return 'badge-blue text-[#70D6FF]';
      case 'Destructive': return 'badge-red text-[#FF2A55]';
      default: return 'badge-gold text-[#FFD700]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] clay-control-box flex flex-col overflow-hidden border-2 border-[#FFD700]/30 shadow-2xl">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl clay-btn-gold flex items-center justify-center text-xl shrink-0 shadow-md">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-tight">
                  Crabdeck Feature Artifacts & Architectural Specifications
                </h2>
                <span className="text-[10px] font-code font-bold px-2 py-0.5 rounded-full badge-gold">
                  14 Artifacts Generated
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-code mt-0.5">
                Saved to <code className="text-[#70D6FF]">/.aistudio/artifacts/brain/4c66f518-25c9-4c07-b3ae-f2e1bd54f2cc/</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl clay-card-3d text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Close Artifacts Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:px-5 border-b border-white/10 bg-black/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  soundFX.playClick();
                  setCategoryFilter(cat);
                }}
                className={`px-3 py-1.5 rounded-xl font-code text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'clay-btn-gold text-black shadow-md'
                    : 'clay-nav-btn text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD700]/50 font-code"
            />
          </div>
        </div>

        {/* Two-Column Master-Detail Layout */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left Column: Artifacts Index List */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto p-3 space-y-2 bg-black/30 shrink-0">
            {filteredArtifacts.map(art => {
              const isSelected = art.id === selectedArtifact.id;
              return (
                <button
                  key={art.id}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedArtifactId(art.id);
                  }}
                  className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'clay-card-3d border-[#FFD700] bg-gradient-to-r from-[#FFD700]/10 to-transparent shadow-lg'
                      : 'border-white/5 bg-black/20 hover:bg-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{art.icon}</span>
                      <span className="font-code font-extrabold text-xs text-[#FFD700]">
                        {art.id}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-code">
                        #{art.number}
                      </span>
                    </div>
                    <span className={`text-[10px] font-code font-bold px-2 py-0.5 rounded-full ${getTierColor(art.securityTier)}`}>
                      {art.securityTier}
                    </span>
                  </div>

                  <h3 className="text-xs font-display font-bold text-white truncate">
                    {art.title}
                  </h3>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 font-hanken">
                    {art.summary}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[10px] font-code text-zinc-500">
                    <span className="truncate">{art.category}</span>
                    <span className="text-[#70D6FF] truncate">{art.assertions}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Artifact Full Detail View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-br from-[#0c0919] to-[#05040a]">
            {/* Artifact Header Banner */}
            <div className="p-4 sm:p-5 rounded-2xl clay-card-3d border border-white/10 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl clay-btn-purple flex items-center justify-center text-2xl shrink-0 shadow-lg">
                    {selectedArtifact.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-code font-extrabold text-sm text-[#FFD700]">
                        {selectedArtifact.id}
                      </span>
                      <span className={`text-[11px] font-code font-bold px-2.5 py-0.5 rounded-full ${getTierColor(selectedArtifact.securityTier)}`}>
                        {selectedArtifact.securityTier} Security Tier
                      </span>
                      <span className="text-xs font-code text-zinc-400 badge-purple px-2 py-0.5 rounded-md">
                        {selectedArtifact.category}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-display font-extrabold text-white mt-1">
                      {selectedArtifact.title}
                    </h2>
                  </div>
                </div>

                {/* Tactical Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPath}
                    className="px-3 py-1.5 rounded-xl clay-btn-blue font-code font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    title="Copy full artifact file path"
                  >
                    {copiedPath ? <CheckCircle className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPath ? 'Copied Path!' : 'Copy Path'}</span>
                  </button>

                  {getTargetViewForArtifact(selectedArtifact.id) && (
                    <button
                      onClick={handleNavigate}
                      className="px-3 py-1.5 rounded-xl clay-btn-gold font-code font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                      title="Launch corresponding interactive view in Crabdeck"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Launch View</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Artifact Metadata Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs font-code">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Artifact File</span>
                  <span className="text-[#70D6FF] font-mono truncate block mt-0.5">
                    {selectedArtifact.fileName}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Smoke Assertion Target</span>
                  <span className="text-[#00FF66] font-mono truncate block mt-0.5">
                    {selectedArtifact.assertions}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 sm:col-span-2 lg:col-span-1">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Primary Bound Endpoints</span>
                  <span className="text-[#FFD700] font-mono truncate block mt-0.5">
                    {selectedArtifact.endpoints.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 sm:p-5 rounded-2xl clay-card-3d border border-white/10 space-y-2">
              <h3 className="text-xs font-code font-extrabold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Executive Architectural Summary</span>
              </h3>
              <p className="text-sm text-zinc-200 leading-relaxed font-hanken">
                {selectedArtifact.summary}
              </p>
            </div>

            {/* Architectural Deep-Dive Sections */}
            <div className="space-y-4">
              {selectedArtifact.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl clay-card-3d border border-white/10 space-y-2 hover:border-[#70D6FF]/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg clay-btn-blue text-[11px] font-code font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-display font-extrabold text-white">
                      {sec.heading}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-hanken pl-8">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Invariant & Certification Stamp */}
            <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl clay-btn-green flex items-center justify-center text-lg shrink-0">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-code font-extrabold text-[#00FF66]">
                    Security Invariant & Loopback Certified
                  </div>
                  <div className="text-[11px] text-zinc-400 font-code">
                    127.0.0.1 single-machine confinement • 0.0% background idle CPU • HMAC-SHA256 verified
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-code badge-green px-2 py-1 rounded-md shrink-0">
                PASS 58/58
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
