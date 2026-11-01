import React, { useState, useEffect } from 'react';
import { AppView, AppThemeMode, ModelBot, WorkerBot, LogEntry, SystemMetrics } from './types';
import { INITIAL_MODELS, INITIAL_WORKER_BOTS, INITIAL_LOGS, INITIAL_METRICS } from './data/mockData';
import { LeftControlBox } from './components/LeftControlBox';
import { NavigationHeader } from './components/NavigationHeader';
import { NeuralHubView } from './components/NeuralHubView';
import { BHiveSwarmView } from './components/BHiveSwarmView';
import { BHiveChatRoom } from './components/BHiveChatRoom';
import { TieredMemoryVaultView } from './components/TieredMemoryVaultView';
import { ASTPatchPlaygroundView } from './components/ASTPatchPlaygroundView';
import { CopilotFusionView } from './components/CopilotFusionView';
import { PulseSelectView } from './components/PulseSelectView';
import { MegabrainOverclockView } from './components/MegabrainOverclockView';
import { LogOMaticView } from './components/LogOMaticView';
import { WorkerBotPlayground } from './components/WorkerBotPlayground';
import { BiologicalHeartbeatView } from './components/BiologicalHeartbeatView';
import { GloopAnalyticsView } from './components/GloopAnalyticsView';
import { ExecuteClawModal } from './components/ExecuteClawModal';
import { VoiceConductorModal } from './components/VoiceConductorModal';
import { FrictionlessOnboardingWizard } from './components/FrictionlessOnboardingWizard';
import { StackAuditVerificationModal } from './components/StackAuditVerificationModal';
import { FeatureArtifactsModal } from './components/FeatureArtifactsModal';
import { GoogleDrivePickerView } from './components/GoogleDrivePickerView';
import { GoogleTasksView } from './components/GoogleTasksView';
import { GeminiAssistantBot } from './components/GeminiAssistantBot';
import { FirebaseStatusModal } from './components/FirebaseStatusModal';
import { soundFX } from './utils/audio';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('war-room');
  const [themeMode, setThemeMode] = useState<AppThemeMode>('claymorphic');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [models, setModels] = useState<ModelBot[]>(INITIAL_MODELS);
  const [activeModelId, setActiveModelId] = useState<string>('hermes');
  const [workerBots, setWorkerBots] = useState<WorkerBot[]>(INITIAL_WORKER_BOTS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);
  
  // Modals state
  const [isClawModalOpen, setIsClawModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isArtifactsModalOpen, setIsArtifactsModalOpen] = useState(false);
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);
  const [isBackgrounded, setIsBackgrounded] = useState(false);

  // Document Visibility Lifecycle Hooks: 0.0% Idle CPU overhead when backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsBackgrounded(hidden);

      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

      if (hidden) {
        setLogs(prev => [
          {
            id: `log-vis-${Date.now()}`,
            timestamp,
            level: 'INFO',
            source: 'LIFECYCLE_GOVERNOR',
            message: 'document.hidden=true. Express gateway (127.0.0.1:3001) and FastAPI Megabrain (127.0.0.1:8000) idle CPU suspended to 0.0%.'
          },
          ...prev.slice(0, 49)
        ]);
      } else {
        setLogs(prev => [
          {
            id: `log-vis-${Date.now()}`,
            timestamp,
            level: 'SUCCESS',
            source: 'LIFECYCLE_GOVERNOR',
            message: 'document.hidden=false. Foreground active. 60 FPS WebSocket (/ws) telemetry & Chronos consensus resumed.'
          },
          ...prev.slice(0, 49)
        ]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Sync soundFX flag
  soundFX.enabled = audioEnabled;

  const activeModel = models.find(m => m.id === activeModelId) || models[0];

  const handleSelectModel = (id: string) => {
    setActiveModelId(id);
    setModels(prev => prev.map(m => ({ ...m, active: m.id === id })));
    
    // Add log entry for hot-swap
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    const modelObj = models.find(m => m.id === id);

    setLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp,
        level: 'SUCCESS',
        source: 'HOT_SWAP_ROUTER',
        message: `Quantum routing hot-swapped to primary node: [ ${modelObj?.name} ].`
      },
      ...prev
    ]);
  };

  const handleExecuteClaw = () => {
    setIsClawModalOpen(true);
    setMetrics(prev => ({
      ...prev,
      gloopSaturation: Math.min(100, prev.gloopSaturation + 5),
      totalSludgeLtrs: prev.totalSludgeLtrs + 500,
      pulseFrequencyHz: +(prev.pulseFrequencyHz + 0.2).toFixed(2)
    }));
  };

  const handleGloopBoost = () => {
    setMetrics(prev => ({
      ...prev,
      gloopSaturation: Math.min(100, prev.gloopSaturation + 10),
      totalSludgeLtrs: prev.totalSludgeLtrs + 1000
    }));

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    setLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp,
        level: 'GLOOP',
        source: 'VISCOSITY_VALVE',
        message: 'Manual Gloop injection triggered: 1,000 Liters added to sludge reserves.'
      },
      ...prev
    ]);
  };

  const handleFlushCache = () => {
    setMetrics(prev => ({
      ...prev,
      gloopSaturation: 50.0,
      systemStability: 99.9,
      pulseFrequencyHz: 4.20
    }));
  };

  const handleSyncAllBots = () => {
    setWorkerBots(prev => prev.map(bot => ({
      ...bot,
      status: 'SYNCED',
      temperature: 39.0,
      efficiency: 99.8,
      wiggleFreq: 120
    })));
  };

  const handleVoiceCommand = (cmd: string) => {
    const c = cmd.toLowerCase();
    if (c.includes('artifact') || c.includes('spec') || c.includes('blueprint')) {
      setIsArtifactsModalOpen(true);
    } else if (c.includes('chat') || c.includes('room') || c.includes('conversation')) {
      setCurrentView('bhive-chat');
    } else if (c.includes('war room') || c.includes('home')) {
      setCurrentView('war-room');
    } else if (c.includes('swarm') || c.includes('1,440') || c.includes('mesh')) {
      setCurrentView('bhive-mesh');
    } else if (c.includes('memory') || c.includes('vault') || c.includes('wal')) {
      setCurrentView('memory-vault');
    } else if (c.includes('ast') || c.includes('audit') || c.includes('patch')) {
      setCurrentView('ast-auditor');
    } else if (c.includes('copilot') || c.includes('fusion') || c.includes('quant')) {
      setCurrentView('copilot-fusion');
    } else if (c.includes('heartbeat') || c.includes('pulse')) {
      setCurrentView('biological-heartbeat');
    } else if (c.includes('gloop') || c.includes('sludge')) {
      handleGloopBoost();
      setCurrentView('gloop-analytics');
    } else if (c.includes('drive') || c.includes('picker') || c.includes('google drive')) {
      setCurrentView('google-drive');
    }
  };

  return (
    <div className="min-h-screen clay-obsidian-bg text-slate-100 flex antialiased selection:bg-[#FFD700]/30 selection:text-[#FFD700]">
      {/* 1. Master Left Control Box: Houses ALL Clickable Buttons & Links */}
      <div className="hidden lg:block">
        <LeftControlBox
          currentView={currentView}
          onSelectView={setCurrentView}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(prev => !prev)}
          activeModel={activeModel}
          models={models}
          onSelectModel={handleSelectModel}
          onExecuteClaw={handleExecuteClaw}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onOpenVoice={() => setIsVoiceModalOpen(true)}
          onOpenSetup={() => setIsOnboardingOpen(true)}
          onOpenArtifacts={() => setIsArtifactsModalOpen(true)}
          onOpenGemini={() => setIsGeminiOpen(true)}
          onOpenFirebase={() => setIsFirebaseOpen(true)}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode(prev => prev === 'claymorphic' ? 'cyber' : 'claymorphic')}
          thermalC={metrics.thermalC || 42.8}
        />
      </div>

      {/* Mobile Slide-In Drawer for Left Control Box */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-md">
          <div className="relative w-84 max-w-[90vw] h-full">
            <LeftControlBox
              currentView={currentView}
              onSelectView={(v) => {
                setCurrentView(v);
                setIsMobileDrawerOpen(false);
              }}
              audioEnabled={audioEnabled}
              onToggleAudio={() => setAudioEnabled(prev => !prev)}
              activeModel={activeModel}
              models={models}
              onSelectModel={handleSelectModel}
              onExecuteClaw={() => {
                handleExecuteClaw();
                setIsMobileDrawerOpen(false);
              }}
              onOpenAudit={() => {
                setIsAuditModalOpen(true);
                setIsMobileDrawerOpen(false);
              }}
              onOpenVoice={() => {
                setIsVoiceModalOpen(true);
                setIsMobileDrawerOpen(false);
              }}
              onOpenSetup={() => {
                setIsOnboardingOpen(true);
                setIsMobileDrawerOpen(false);
              }}
              onOpenArtifacts={() => {
                setIsArtifactsModalOpen(true);
                setIsMobileDrawerOpen(false);
              }}
              onOpenGemini={() => {
                setIsGeminiOpen(true);
                setIsMobileDrawerOpen(false);
              }}
              onOpenFirebase={() => {
                setIsFirebaseOpen(true);
                setIsMobileDrawerOpen(false);
              }}
              themeMode={themeMode}
              onToggleTheme={() => setThemeMode(prev => prev === 'claymorphic' ? 'cyber' : 'claymorphic')}
              thermalC={metrics.thermalC || 42.8}
            />
          </div>
          <div
            className="flex-1"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
        </div>
      )}

      {/* 2. Main Workstation Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Status Header */}
        <NavigationHeader
          currentView={currentView}
          onSelectView={setCurrentView}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode(prev => prev === 'claymorphic' ? 'cyber' : 'claymorphic')}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(prev => !prev)}
          onExecuteClaw={handleExecuteClaw}
          activeModelName={activeModel.name}
          onOpenVoiceConductor={() => setIsVoiceModalOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onOpenArtifacts={() => setIsArtifactsModalOpen(true)}
          onOpenGemini={() => setIsGeminiOpen(true)}
          onOpenFirebase={() => setIsFirebaseOpen(true)}
          onToggleSidebar={() => setIsMobileDrawerOpen(prev => !prev)}
        />

        {/* View Content Canvas with 3D Cartoon Claymorphism */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* The War Room (Main Command Center) */}
          {(currentView === 'war-room' || currentView === 'neural-hub') && (
            <NeuralHubView
              models={models}
              activeModelId={activeModelId}
              onSelectModel={handleSelectModel}
              metrics={metrics}
              onExecuteClaw={handleExecuteClaw}
              onGloopBoost={handleGloopBoost}
              isClayMode={true}
              onNavigateToHeartbeat={() => setCurrentView('biological-heartbeat')}
              onNavigateToGloop={() => setCurrentView('gloop-analytics')}
              onNavigateToView={(view) => setCurrentView(view as AppView)}
            />
          )}

          {/* bHive 1,440-Node Swarm Mesh & Intelligence Grid */}
          {currentView === 'bhive-mesh' && (
            <BHiveSwarmView onNavigateToChatRoom={() => setCurrentView('bhive-chat')} />
          )}

          {/* bHive 1,440-Node Swarm Chat Room & Orchestration Engine */}
          {currentView === 'bhive-chat' && (
            <BHiveChatRoom
              onNavigateToSwarmMesh={() => setCurrentView('bhive-mesh')}
              onNavigateToMemoryVault={() => setCurrentView('memory-vault')}
            />
          )}

          {/* Shell Cracked Tiered Memory Vault */}
          {currentView === 'memory-vault' && (
            <TieredMemoryVaultView />
          )}

          {/* Carbon SecAuditor & AST Patch Validation */}
          {currentView === 'ast-auditor' && (
            <ASTPatchPlaygroundView />
          )}

          {/* Copilot Fusion & Quantization */}
          {currentView === 'copilot-fusion' && (
            <CopilotFusionView />
          )}

          {/* Biological Heartbeat View */}
          {currentView === 'biological-heartbeat' && (
            <BiologicalHeartbeatView
              metrics={metrics}
              onUpdateMetrics={setMetrics}
              isClayMode={true}
            />
          )}

          {/* Gloop & Sludge Analytics View */}
          {currentView === 'gloop-analytics' && (
            <GloopAnalyticsView
              metrics={metrics}
              onGloopBoost={handleGloopBoost}
              onFlushCache={handleFlushCache}
              isClayMode={true}
            />
          )}

          {/* Overclock Megabrain View */}
          {currentView === 'megabrain' && (
            <MegabrainOverclockView
              onInitiateGloop={handleGloopBoost}
              onFlushCache={handleFlushCache}
              onFixWiggles={handleSyncAllBots}
              gloopSaturation={metrics.gloopSaturation}
              sludgeLtrs={metrics.totalSludgeLtrs}
            />
          )}

          {/* Pulse Model Selection */}
          {currentView === 'pulse-select' && (
            <PulseSelectView
              models={models}
              activeModelId={activeModelId}
              onSelectModel={handleSelectModel}
              onConfirmDeployment={() => setCurrentView('war-room')}
            />
          )}

          {/* Log-O-Matic */}
          {currentView === 'log-o-matic' && (
            <LogOMaticView
              logs={logs}
              onAddLog={(newLog) => setLogs(prev => [newLog, ...prev])}
              gloopSaturation={metrics.gloopSaturation}
            />
          )}

          {/* Worker Bots Playground */}
          {currentView === 'worker-playground' && (
            <WorkerBotPlayground
              bots={workerBots}
              onUpdateBot={(updated) => setWorkerBots(prev => prev.map(b => b.id === updated.id ? updated : b))}
              onSyncAllBots={handleSyncAllBots}
            />
          )}

          {/* Google Drive & Google Picker Workspace View */}
          {currentView === 'google-drive' && (
            <GoogleDrivePickerView />
          )}

          {/* Google Tasks Workspace View with Urgency Heat Map */}
          {currentView === 'google-tasks' && (
            <GoogleTasksView onOpenGemini={() => setIsGeminiOpen(true)} />
          )}
        </main>
      </div>

      {/* Gemini Assistant Bot AI Co-Pilot Panel */}
      <GeminiAssistantBot
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
        onNavigateToView={(view) => {
          setCurrentView(view);
          setIsGeminiOpen(false);
        }}
      />

      {/* Tactical Claw Override Modal */}
      <ExecuteClawModal
        isOpen={isClawModalOpen}
        onClose={() => setIsClawModalOpen(false)}
        activeModelName={activeModel.name}
      />

      {/* Voice Conductor Modal */}
      <VoiceConductorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteCommand={handleVoiceCommand}
      />

      {/* Frictionless Onboarding Wizard Modal */}
      <FrictionlessOnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => setCurrentView('war-room')}
      />

      {/* Stack Audit & Verification Modal */}
      <StackAuditVerificationModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        isBackgrounded={isBackgrounded}
      />

      {/* Feature Artifacts & Technical Specifications Modal */}
      <FeatureArtifactsModal
        isOpen={isArtifactsModalOpen}
        onClose={() => setIsArtifactsModalOpen(false)}
        onNavigateToView={(view) => setCurrentView(view)}
      />

      {/* Firebase & Firestore ABAC Status Modal */}
      <FirebaseStatusModal
        isOpen={isFirebaseOpen}
        onClose={() => setIsFirebaseOpen(false)}
      />
    </div>
  );
}

export default App;
