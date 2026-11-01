import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Droplets,
  Calendar,
  ShieldCheck,
  Copy,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SystemMetrics } from '../types';
import { soundFX } from '../utils/audio';

export interface HistoryDataPoint {
  time: string;
  sludgeLtrs: number;
  gloopSaturation: number;
  viscosityCP: number;
  flowRateLps: number;
  purityScore: number;
}

export interface SectorVelocity {
  sector: string;
  inflow: number;
  outflow: number;
  delta: string;
}

export interface GloopCompositionItem {
  name: string;
  value: number;
  color: string;
}

interface GloopReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SystemMetrics;
  historyData: HistoryDataPoint[];
  gloopComposition: GloopCompositionItem[];
  sectorVelocity: SectorVelocity[];
  simulatedInjections: number;
  isClayMode?: boolean;
}

export const GloopReportModal: React.FC<GloopReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  historyData,
  gloopComposition,
  sectorVelocity,
  simulatedInjections,
  isClayMode = false
}) => {
  const [activePage, setActivePage] = useState<1 | 2>(1);
  const [paperStyle, setPaperStyle] = useState<'cyber-noir' | 'archival-white'>('cyber-noir');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Derive summary metrics
  const latestPoint = historyData[historyData.length - 1] || {
    sludgeLtrs: metrics.totalSludgeLtrs || 18450,
    gloopSaturation: metrics.gloopSaturation || 68.5,
    viscosityCP: 1420,
    flowRateLps: 8.4,
    purityScore: 99.4
  };

  const peakSludge = Math.max(...historyData.map(d => d.sludgeLtrs));
  const avgSaturation = +(historyData.reduce((acc, d) => acc + d.gloopSaturation, 0) / historyData.length).toFixed(1);
  const reportId = `GLOOP-RPT-2026-X94`;
  const reportDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const reportTime = new Date().toLocaleTimeString('en-US', { hour12: false });

  // Print Action
  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  // Raw JSON Telemetry Download
  const handleExportJSON = () => {
    soundFX.playHotSwap();
    const exportData = {
      reportId,
      generatedAt: `${reportDate} ${reportTime}`,
      systemStatus: 'NOMINAL',
      complianceLevel: 'CLASS-4-VALIDATED',
      currentMetrics: {
        sludgeReserveLiters: latestPoint.sludgeLtrs,
        gloopSaturationPercent: latestPoint.gloopSaturation,
        kinematicViscosityCp: latestPoint.viscosityCP,
        flowRateLps: latestPoint.flowRateLps,
        purityScore: latestPoint.purityScore,
        thermalC: metrics.thermalC || 44.2,
        systemStability: metrics.systemStability || 99.9,
        simulatedInjectionsCount: simulatedInjections
      },
      sludgeAccumulationHistory: historyData,
      sectorTelemetry: sectorVelocity,
      chemicalComposition: gloopComposition,
      certifiedOfficer: 'Crab-E Autonomous Sentinel & Nano Banano Unit #0482'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRABDECK-GLOOP-REPORT-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download PDF / Printable HTML Document
  const handleDownloadReport = () => {
    soundFX.playHotSwap();
    setIsExporting(true);

    // Build self-contained HTML document for immediate saving or printing
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Crabdeck Quantum - Sludge & Gloop Dynamics Audit Report [${reportId}]</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0c0a18; color: #e4e4e7; margin: 0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; background: #130d2a; border: 2px solid #a855f7; border-radius: 12px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
    h1 { color: #ffd700; margin-top: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 11px; margin-right: 8px; }
    .badge-gold { background: rgba(255,215,0,0.15); color: #ffd700; border: 1px solid #ffd700; }
    .badge-green { background: rgba(0,255,102,0.15); color: #00ff66; border: 1px solid #00ff66; }
    .badge-blue { background: rgba(112,214,255,0.15); color: #70d6ff; border: 1px solid #70d6ff; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
    .card { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; }
    .metric-val { font-size: 26px; font-weight: 800; color: #fff; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th { text-align: left; padding: 10px; background: rgba(168,85,247,0.2); color: #70d6ff; border-bottom: 2px solid #a855f7; }
    td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px dashed rgba(255,255,255,0.2); font-size: 11px; color: #888; display: flex; justify-content: space-between; }
    @media print {
      body { background: #fff !important; color: #000 !important; padding: 0 !important; }
      .container { border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; }
      .card { border: 1px solid #ddd !important; background: #f9f9f9 !important; }
      .metric-val { color: #000 !important; }
      th { background: #eee !important; color: #000 !important; border-bottom: 2px solid #000 !important; }
      td { border-bottom: 1px solid #ddd !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-size:11px; color:#a855f7; font-weight:bold; letter-spacing:2px;">CRABDECK QUANTUM // MONOREPO FACILITY #0482</div>
        <h1>Comprehensive Sludge & Gloop Dynamics Audit</h1>
      </div>
      <div style="text-align:right;">
        <span class="badge badge-gold">REF: ${reportId}</span>
        <span class="badge badge-green">STATUS: CERTIFIED</span>
        <div style="font-size:11px; color:#888; margin-top:6px;">${reportDate} - ${reportTime} UTC</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div style="font-size:11px; color:#a855f7; font-weight:bold;">TOTAL SLUDGE RESERVES</div>
        <div class="metric-val" style="color:#c084fc;">${latestPoint.sludgeLtrs.toLocaleString()} L</div>
        <div style="font-size:11px; color:#888;">Peak 24h: ${peakSludge.toLocaleString()} L</div>
      </div>
      <div class="card">
        <div style="font-size:11px; color:#00ff66; font-weight:bold;">GLOOP SATURATION</div>
        <div class="metric-val" style="color:#00ff66;">${latestPoint.gloopSaturation}%</div>
        <div style="font-size:11px; color:#888;">Threshold: 45% - 75% Nom</div>
      </div>
      <div class="card">
        <div style="font-size:11px; color:#ffd700; font-weight:bold;">KINEMATIC VISCOSITY</div>
        <div class="metric-val" style="color:#ffd700;">${latestPoint.viscosityCP} cP</div>
        <div style="font-size:11px; color:#888;">Laminar Regime Stable</div>
      </div>
    </div>

    <h3 style="color:#70d6ff; margin-bottom:8px;">Historical Sludge Accumulation Readings</h3>
    <table>
      <thead>
        <tr>
          <th>Timecode</th>
          <th>Sludge Reserves</th>
          <th>Gloop Saturation</th>
          <th>Kinematic Viscosity</th>
          <th>Flow Velocity</th>
          <th>Purity Index</th>
        </tr>
      </thead>
      <tbody>
        ${historyData.map(h => `
          <tr>
            <td><strong>${h.time}</strong></td>
            <td>${h.sludgeLtrs.toLocaleString()} L</td>
            <td>${h.gloopSaturation}%</td>
            <td>${h.viscosityCP} cP</td>
            <td>${h.flowRateLps} L/s</td>
            <td style="color:#00ff66;">${h.purityScore}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3 style="color:#ff66c4; margin-top:24px; margin-bottom:8px;">Chemical Composition & Enzymatic Fractions</h3>
    <table>
      <thead>
        <tr>
          <th>Fraction Name</th>
          <th>Concentration</th>
          <th>Role in Stabilization</th>
        </tr>
      </thead>
      <tbody>
        ${gloopComposition.map(c => `
          <tr>
            <td><strong style="color:${c.color}">${c.name}</strong></td>
            <td>${c.value}%</td>
            <td>${c.name.includes('Banano') ? 'Potassium Catalytic Breakdown' : 'Carrier Medium'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <div>Audited by: Crab-E Autonomous Companion & Nano Banano 3D Unit</div>
      <div>Crabdeck Quantum Monorepo // Hydraulic Cryptographic Signature Verified</div>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRABDECK-GLOOP-REPORT-${reportId}.html`;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
    }, 400);
  };

  // Copy Executive Markdown Briefing to clipboard
  const handleCopyMarkdown = () => {
    soundFX.playClick();
    const md = `
# 🍌 CRABDECK QUANTUM // GLOOP & SLUDGE HYDRAULIC AUDIT REPORT
**Document ID**: ${reportId}
**Date/Time**: ${reportDate} ${reportTime} UTC
**Classification**: RESTRICTED // MONOREPO FACILITY 0482
**System Status**: NOMINAL (All Valves Regulated)

### Executive Metrics Summary
- **Total Sludge Reserves**: ${latestPoint.sludgeLtrs.toLocaleString()} L (Max Cap: 50,000L)
- **Gloop Saturation**: ${latestPoint.gloopSaturation}% (Cavitation Limit: 85%)
- **Kinematic Viscosity**: ${latestPoint.viscosityCP} cP
- **Quantum Flow Rate**: ${latestPoint.flowRateLps} L/s @ 4.2 Bar
- **Nano Banano Purity Score**: ${latestPoint.purityScore}%
- **Simulated Injections**: ${simulatedInjections}

### 24-Hour Sludge Accumulation Timeline
${historyData.map(d => `- [${d.time}] Sludge: ${d.sludgeLtrs.toLocaleString()}L | Sat: ${d.gloopSaturation}% | Visc: ${d.viscosityCP}cP`).join('\n')}

### Sector Velocity Telemetry
${sectorVelocity.map(s => `- ${s.sector}: Inflow ${s.inflow} L/hr, Outflow ${s.outflow} L/hr (Delta: ${s.delta})`).join('\n')}

*Digitally Certified by Crab-E Autonomous Sentinel & Nano Banano Engine.*
    `.trim();

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Outer Modal Container */}
      <div className="relative w-full max-w-5xl my-auto rounded-2xl bg-[#080512] border border-[#A855F7]/40 shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Control Toolbar (Simulated PDF Reader App Chrome) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#120B27] border-b border-white/10 select-none">
          {/* Document Title & Pages */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2A55] to-[#A855F7] flex items-center justify-center text-white shadow-md">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white font-mono tracking-tight">
                  {reportId}.pdf
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/40">
                  SIMULATED PDF
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Generated {reportDate} at {reportTime} UTC
              </p>
            </div>
          </div>

          {/* Page Selector & Zoom controls */}
          <div className="flex items-center gap-2 bg-[#090518] px-2.5 py-1 rounded-xl border border-white/10 text-xs">
            <span className="text-[11px] text-zinc-400 font-mono">Page:</span>
            <button
              onClick={() => { soundFX.playClick(); setActivePage(1); }}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activePage === 1
                  ? 'bg-[#A855F7] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              1
            </button>
            <button
              onClick={() => { soundFX.playClick(); setActivePage(2); }}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activePage === 2
                  ? 'bg-[#A855F7] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              2
            </button>
            <span className="text-zinc-600 px-1">|</span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
              className="text-zinc-400 hover:text-white p-0.5 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-zinc-300 font-mono w-8 text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
              className="text-zinc-400 hover:text-white p-0.5 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Paper Theme & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaperStyle(prev => prev === 'cyber-noir' ? 'archival-white' : 'cyber-noir')}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Toggle dark preview or crisp archival white mode"
            >
              <Layers className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="hidden sm:inline">Theme:</span>
              <span className="font-mono text-xs text-[#FFD700]">
                {paperStyle === 'cyber-noir' ? 'Cyber Noir' : 'Archival Paper'}
              </span>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
              title="Copy Markdown Summary"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-[#00FF66]" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-[#70D6FF]/40 bg-[#70D6FF]/10 text-[#70D6FF] hover:bg-[#70D6FF]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export Raw Telemetry JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">JSON</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Print via Browser / Save to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Direct Download HTML/PDF File */}
            <button
              onClick={handleDownloadReport}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-black bg-gradient-to-r from-[#FFD700] to-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => { soundFX.playClick(); onClose(); }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#05030A]/95 flex justify-center">
          <div
            ref={reportRef}
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className={`w-full max-w-4xl transition-all duration-200 rounded-xl shadow-2xl p-6 sm:p-10 font-mono text-xs border ${
              paperStyle === 'cyber-noir'
                ? 'bg-[#0E0922] text-zinc-200 border-[#A855F7]/30 shadow-[0_0_40px_rgba(168,85,247,0.15)]'
                : 'bg-[#FBFBFB] text-[#18181B] border-zinc-300 shadow-[0_10px_35px_rgba(0,0,0,0.4)]'
            }`}
          >
            {/* ================= PAGE 1 ================= */}
            {activePage === 1 && (
              <div className="space-y-6">
                {/* Official Report Header */}
                <div className={`pb-6 border-b ${paperStyle === 'cyber-noir' ? 'border-white/15' : 'border-zinc-300'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🦀</span>
                        <span className={`text-[11px] font-extrabold uppercase tracking-widest ${
                          paperStyle === 'cyber-noir' ? 'text-[#FFD700]' : 'text-amber-700'
                        }`}>
                          CRABDECK QUANTUM TERMINAL // HYDRAULICS DIVISION
                        </span>
                      </div>
                      <h1 className={`text-xl sm:text-2xl font-extrabold font-serif-luxury tracking-tight ${
                        paperStyle === 'cyber-noir' ? 'text-white' : 'text-zinc-900'
                      }`}>
                        QUARTERLY GLOOP & SLUDGE HYDRAULIC AUDIT REPORT
                      </h1>
                      <p className={`text-[11px] ${paperStyle === 'cyber-noir' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Comprehensive telemetry on viscous slurry accumulation, enzymatic breakdown, and core cavitation margins.
                      </p>
                    </div>

                    {/* Official Stamp & Reference Badge */}
                    <div className="flex flex-col sm:items-end gap-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-[#00FF66] bg-[#00FF66]/10 text-[#00FF66] font-bold text-[10px] tracking-widest uppercase rotate-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>AUDIT CERTIFIED // PASS</span>
                      </div>
                      <div className={`text-[10px] font-mono ${paperStyle === 'cyber-noir' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        REF: <strong className={paperStyle === 'cyber-noir' ? 'text-[#70D6FF]' : 'text-blue-700'}>{reportId}</strong>
                      </div>
                      <div className={`text-[10px] ${paperStyle === 'cyber-noir' ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        Timestamp: {reportDate} {reportTime}
                      </div>
                    </div>
                  </div>

                  {/* Metadata strip */}
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t ${
                    paperStyle === 'cyber-noir' ? 'border-white/10 text-zinc-400' : 'border-zinc-200 text-zinc-600'
                  } text-[10px]`}>
                    <div>
                      <span className="block font-bold opacity-60">FACILITY ID</span>
                      <span className="font-extrabold text-foreground">STATION-0482-ULTRA</span>
                    </div>
                    <div>
                      <span className="block font-bold opacity-60">AUDIT CADENCE</span>
                      <span className="font-extrabold text-foreground">Continuous Real-Time (24h)</span>
                    </div>
                    <div>
                      <span className="block font-bold opacity-60">ENZYME REGULATOR</span>
                      <span className="font-extrabold text-[#FFD700]">Nano Banano 3D v2.4</span>
                    </div>
                    <div>
                      <span className="block font-bold opacity-60">SECURITY CLEARANCE</span>
                      <span className="font-extrabold text-[#FF2A55]">RESTRICTED LEVEL 4</span>
                    </div>
                  </div>
                </div>

                {/* Executive Scorecard (KPI Cards) */}
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                    paperStyle === 'cyber-noir' ? 'text-[#FFD700]' : 'text-amber-800'
                  }`}>
                    <Activity className="w-4 h-4" />
                    <span>I. Executive Hydraulic Telemetry Scorecard</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Card 1: Sludge Reserves */}
                    <div className={`p-3.5 rounded-xl border ${
                      paperStyle === 'cyber-noir'
                        ? 'bg-[#150E30] border-[#A855F7]/30'
                        : 'bg-purple-50/70 border-purple-200'
                    }`}>
                      <div className="text-[10px] font-bold text-purple-400 uppercase">Sludge Reserves</div>
                      <div className={`text-2xl font-extrabold my-1 ${
                        paperStyle === 'cyber-noir' ? 'text-[#C084FC]' : 'text-purple-700'
                      }`}>
                        {latestPoint.sludgeLtrs.toLocaleString()} <span className="text-xs">Liters</span>
                      </div>
                      <div className={`text-[10px] ${paperStyle === 'cyber-noir' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Capacity: 36.9% / 50,000L Max
                      </div>
                    </div>

                    {/* Card 2: Gloop Saturation */}
                    <div className={`p-3.5 rounded-xl border ${
                      paperStyle === 'cyber-noir'
                        ? 'bg-[#0B1E13] border-[#00FF66]/30'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase">Gloop Saturation</div>
                      <div className={`text-2xl font-extrabold my-1 ${
                        paperStyle === 'cyber-noir' ? 'text-[#00FF66]' : 'text-emerald-700'
                      }`}>
                        {latestPoint.gloopSaturation}%
                      </div>
                      <div className={`text-[10px] ${paperStyle === 'cyber-noir' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Equilibrium Band: 45% - 75%
                      </div>
                    </div>

                    {/* Card 3: Kinematic Viscosity */}
                    <div className={`p-3.5 rounded-xl border ${
                      paperStyle === 'cyber-noir'
                        ? 'bg-[#201808] border-[#FFD700]/30'
                        : 'bg-amber-50/70 border-amber-200'
                    }`}>
                      <div className="text-[10px] font-bold text-amber-400 uppercase">Kinematic Viscosity</div>
                      <div className={`text-2xl font-extrabold my-1 ${
                        paperStyle === 'cyber-noir' ? 'text-[#FFD700]' : 'text-amber-700'
                      }`}>
                        {latestPoint.viscosityCP} <span className="text-xs">cP</span>
                      </div>
                      <div className={`text-[10px] ${paperStyle === 'cyber-noir' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Reynolds # Nominal (Laminar)
                      </div>
                    </div>

                    {/* Card 4: Quantum Flow Rate */}
                    <div className={`p-3.5 rounded-xl border ${
                      paperStyle === 'cyber-noir'
                        ? 'bg-[#0A1828] border-[#70D6FF]/30'
                        : 'bg-sky-50/70 border-sky-200'
                    }`}>
                      <div className="text-[10px] font-bold text-sky-400 uppercase">Flow Rate & Pressure</div>
                      <div className={`text-2xl font-extrabold my-1 ${
                        paperStyle === 'cyber-noir' ? 'text-[#70D6FF]' : 'text-sky-700'
                      }`}>
                        {latestPoint.flowRateLps} <span className="text-xs">L/s</span>
                      </div>
                      <div className={`text-[10px] ${paperStyle === 'cyber-noir' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Manifold Pressure: 4.2 Bar
                      </div>
                    </div>

                    {/* Card 5: Banano Purity Score */}
                    <div className={`p-3.5 rounded-xl border ${
                      paperStyle === 'cyber-noir'
                        ? 'bg-[#220B1F] border-[#FF66C4]/30'
                        : 'bg-pink-50/70 border-pink-200'
                    }`}>
                      <div className="text-[10px] font-bold text-pink-400 uppercase">Banano Enzyme Purity</div>
                      <div className={`text-2xl font-extrabold my-1 ${
                        paperStyle === 'cyber-noir' ? 'text-[#FF66C4]' : 'text-pink-700'
                      }`}>
                        {latestPoint.purityScore}%
                      </div>
                      <div className={`text-[10px] ${paperStyle === 'cyber-noir' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Enzyme Catalysis Active
                      </div>
                    </div>

                    {/* Card 6: Cavitation Risk */}
                    <div className={`p-3.5 rounded-xl border ${
                      paperStyle === 'cyber-noir'
                        ? 'bg-[#200A12] border-[#FF2A55]/30'
                        : 'bg-rose-50/70 border-rose-200'
                    }`}>
                      <div className="text-[10px] font-bold text-rose-400 uppercase">Cavitation Margin</div>
                      <div className={`text-2xl font-extrabold my-1 ${
                        paperStyle === 'cyber-noir' ? 'text-[#00FF66]' : 'text-emerald-700'
                      }`}>
                        OPTIMAL
                      </div>
                      <div className={`text-[10px] ${paperStyle === 'cyber-noir' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Delta to Alert: +{(85 - latestPoint.gloopSaturation).toFixed(1)}% Margin
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historical Progression Table */}
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center justify-between ${
                    paperStyle === 'cyber-noir' ? 'text-[#70D6FF]' : 'text-blue-800'
                  }`}>
                    <span className="flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      <span>II. 24-Hour Sludge Accumulation & Gloop Saturation Log</span>
                    </span>
                    <span className="text-[10px] opacity-70">13 Chrono-Samples Recorded</span>
                  </div>

                  <div className={`overflow-x-auto rounded-xl border ${
                    paperStyle === 'cyber-noir' ? 'border-white/10 bg-black/30' : 'border-zinc-200 bg-white'
                  }`}>
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className={`${
                          paperStyle === 'cyber-noir'
                            ? 'bg-[#180E35] text-[#70D6FF] border-b border-white/10'
                            : 'bg-zinc-100 text-zinc-700 border-b border-zinc-200'
                        }`}>
                          <th className="py-2.5 px-3 font-bold">Timecode</th>
                          <th className="py-2.5 px-3 font-bold">Sludge Level (L)</th>
                          <th className="py-2.5 px-3 font-bold">Saturation (%)</th>
                          <th className="py-2.5 px-3 font-bold">Viscosity (cP)</th>
                          <th className="py-2.5 px-3 font-bold">Flow (L/s)</th>
                          <th className="py-2.5 px-3 font-bold">Purity (%)</th>
                          <th className="py-2.5 px-3 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {historyData.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}>
                            <td className="py-2 px-3 font-extrabold text-foreground">{row.time}</td>
                            <td className="py-2 px-3 font-mono text-[#C084FC]">
                              {row.sludgeLtrs.toLocaleString()} L
                            </td>
                            <td className="py-2 px-3 font-mono text-[#00FF66]">{row.gloopSaturation}%</td>
                            <td className="py-2 px-3 font-mono text-[#FFD700]">{row.viscosityCP} cP</td>
                            <td className="py-2 px-3 font-mono text-[#70D6FF]">{row.flowRateLps}</td>
                            <td className="py-2 px-3 font-mono text-[#FF66C4]">{row.purityScore}%</td>
                            <td className="py-2 px-3">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                NOMINAL
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Page 1 Footer */}
                <div className={`pt-4 border-t flex items-center justify-between text-[10px] ${
                  paperStyle === 'cyber-noir' ? 'border-white/10 text-zinc-500' : 'border-zinc-200 text-zinc-500'
                }`}>
                  <div>CRABDECK-GLOOP-REPORT // CLASSIFIED RECORD // PAGE 1 OF 2</div>
                  <button
                    onClick={() => { soundFX.playClick(); setActivePage(2); }}
                    className={`font-bold hover:underline cursor-pointer ${
                      paperStyle === 'cyber-noir' ? 'text-[#A855F7]' : 'text-purple-700'
                    }`}
                  >
                    Proceed to Page 2 (Sector Telemetry & Sign-off) →
                  </button>
                </div>
              </div>
            )}

            {/* ================= PAGE 2 ================= */}
            {activePage === 2 && (
              <div className="space-y-6">
                {/* Page 2 Header */}
                <div className={`pb-4 border-b flex items-center justify-between ${
                  paperStyle === 'cyber-noir' ? 'border-white/15' : 'border-zinc-300'
                }`}>
                  <div>
                    <div className="text-[10px] font-bold text-[#FFD700]">CRABDECK QUANTUM // FACILITY #0482</div>
                    <h2 className={`text-lg font-bold font-serif-luxury ${
                      paperStyle === 'cyber-noir' ? 'text-white' : 'text-zinc-900'
                    }`}>
                      SECTOR BALANCE, CHEMICAL COMPOSITION & PROTOCOL SIGN-OFF
                    </h2>
                  </div>
                  <div className="text-right text-[10px] text-zinc-500 font-mono">
                    DOC ID: {reportId} // PAGE 2 OF 2
                  </div>
                </div>

                {/* Sector Flow Balance Section */}
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                    paperStyle === 'cyber-noir' ? 'text-[#70D6FF]' : 'text-blue-800'
                  }`}>
                    <Layers className="w-4 h-4" />
                    <span>III. Monorepo Sector Sludge Inflow & Outflow Differential</span>
                  </div>

                  <div className={`overflow-x-auto rounded-xl border ${
                    paperStyle === 'cyber-noir' ? 'border-white/10 bg-black/30' : 'border-zinc-200 bg-white'
                  }`}>
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className={`${
                          paperStyle === 'cyber-noir'
                            ? 'bg-[#180E35] text-[#70D6FF] border-b border-white/10'
                            : 'bg-zinc-100 text-zinc-700 border-b border-zinc-200'
                        }`}>
                          <th className="py-2.5 px-3 font-bold">Monorepo Sector</th>
                          <th className="py-2.5 px-3 font-bold">Inflow (L/hr)</th>
                          <th className="py-2.5 px-3 font-bold">Outflow (L/hr)</th>
                          <th className="py-2.5 px-3 font-bold">Net Accumulation</th>
                          <th className="py-2.5 px-3 font-bold">Line Pressure</th>
                          <th className="py-2.5 px-3 font-bold">Regulation State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sectorVelocity.map((sec, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}>
                            <td className="py-2.5 px-3 font-extrabold text-white">{sec.sector}</td>
                            <td className="py-2.5 px-3 font-mono text-[#FF66C4]">{sec.inflow.toLocaleString()} L/hr</td>
                            <td className="py-2.5 px-3 font-mono text-[#00FF66]">{sec.outflow.toLocaleString()} L/hr</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#FFD700]">{sec.delta} L/hr</td>
                            <td className="py-2.5 px-3 font-mono text-zinc-300">4.18 Bar</td>
                            <td className="py-2.5 px-3">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                                AUTO-BALANCED
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chemical Composition Breakdown */}
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                    paperStyle === 'cyber-noir' ? 'text-[#FF66C4]' : 'text-pink-800'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                    <span>IV. Chemical Composition & Enzymatic Fractions</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {gloopComposition.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          paperStyle === 'cyber-noir'
                            ? 'bg-[#120B24] border-white/10'
                            : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <div>
                            <div className="font-bold text-foreground text-[11px]">{item.name}</div>
                            <div className="text-[10px] text-zinc-500">
                              {item.name.includes('Banano') ? 'Potassium Catalytic Breakdown' : 'Solvent & Carrier'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold font-mono text-sm" style={{ color: item.color }}>
                            {item.value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Directives & Automated Recommendations */}
                <div className={`p-4 rounded-xl border ${
                  paperStyle === 'cyber-noir'
                    ? 'bg-[#150D2E] border-[#A855F7]/30'
                    : 'bg-purple-50/80 border-purple-200'
                }`}>
                  <div className="text-[11px] font-extrabold text-[#FFD700] uppercase tracking-wide mb-2 flex items-center gap-2">
                    <span>📋</span> AUTOMATED DIRECTIVES & OPERATIONAL SAFEGUARDS
                  </div>
                  <ul className={`space-y-1.5 text-[11px] list-disc list-inside ${
                    paperStyle === 'cyber-noir' ? 'text-zinc-300' : 'text-zinc-700'
                  }`}>
                    <li>
                      <strong className="text-white">Cavitation Safeguard:</strong> Gloop saturation currently at{' '}
                      <span className="text-[#00FF66] font-bold">{latestPoint.gloopSaturation}%</span>, comfortably under the 85.0% critical alert boundary.
                    </li>
                    <li>
                      <strong className="text-white">Enzymatic Flushing:</strong> Recommended interval for full potassium flush is 12 hours. Nano Banano catalyst actively recirculating.
                    </li>
                    <li>
                      <strong className="text-white">Sector 05 Optimization:</strong> Banano inflow buffer delta is +700 L/hr. Surplus is redirected to auxiliary heat exchanger.
                    </li>
                  </ul>
                </div>

                {/* Digital Cryptographic Signatures & Bureau Stamp */}
                <div className={`pt-4 border-t ${paperStyle === 'cyber-noir' ? 'border-white/15' : 'border-zinc-300'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border border-dashed border-white/20 space-y-1">
                      <div className="text-[9px] uppercase tracking-widest text-zinc-500">
                        OFFICER IN CHARGE // CERTIFIED CLAW
                      </div>
                      <div className="font-serif-luxury font-bold text-sm text-[#FFD700] italic">
                        Crab-E Autonomous Sentinel
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        Digital Signature: SHA256//98a2f-71b3e-4890c-crab
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-dashed border-white/20 space-y-1">
                      <div className="text-[9px] uppercase tracking-widest text-zinc-500">
                        AUTONOMOUS ENZYMATIC VERIFIER
                      </div>
                      <div className="font-serif-luxury font-bold text-sm text-[#00FF66] italic">
                        🍌 Nano Banano Unit #0482
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        Enzymatic Proof: POTASSIUM-ION-OK//99.4%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 2 Footer */}
                <div className={`pt-3 border-t flex items-center justify-between text-[10px] ${
                  paperStyle === 'cyber-noir' ? 'border-white/10 text-zinc-500' : 'border-zinc-200 text-zinc-500'
                }`}>
                  <button
                    onClick={() => { soundFX.playClick(); setActivePage(1); }}
                    className={`font-bold hover:underline cursor-pointer ${
                      paperStyle === 'cyber-noir' ? 'text-[#A855F7]' : 'text-purple-700'
                    }`}
                  >
                    ← Back to Page 1
                  </button>
                  <div>CRABDECK-GLOOP-REPORT // CLASSIFIED RECORD // PAGE 2 OF 2</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Bar with Direct Actions */}
        <div className="px-5 py-3 bg-[#0A0618] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
            <span className="text-[11px]">Report rendered via Crabdeck Ultra Hydraulic Engine.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-[11px]"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Print Document</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#FFD700] via-[#FF66C4] to-[#70D6FF] text-black font-extrabold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer text-[11px] shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report File</span>
            </button>
            <button
              onClick={() => { soundFX.playClick(); onClose(); }}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-[11px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
