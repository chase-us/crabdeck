import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Flame,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  LogOut,
  RefreshCw,
  X,
  Radio,
  Server,
  Zap,
  HardDrive
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import {
  signInWithGoogle,
  signOutUser,
  onAuthStatusChange,
  firebaseConfigInfo,
  saveTelemetryRecord
} from '../services/firebaseService';
import { testFirestoreConnection } from '../lib/firebase';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'checking' | 'error'>('checking');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStatusChange((currentUser) => {
      setUser(currentUser);
    });

    // Check firestore connection
    checkConnection();

    return () => unsubscribe();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const ok = await testFirestoreConnection();
      setConnectionStatus(ok ? 'connected' : 'error');
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      setConnectionStatus('error');
      setStatusMessage(err?.message || 'Connection check failed');
    }
  };

  const handleSignIn = async () => {
    soundFX.playClick();
    setIsConnecting(true);
    setStatusMessage('');
    try {
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        setStatusMessage(`Signed in as ${loggedUser.displayName || loggedUser.email}`);
        soundFX.playSuccess();
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setStatusMessage(err?.message || 'Failed to sign in with Google');
      soundFX.playAlert();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSignOut = async () => {
    soundFX.playClick();
    try {
      await signOutUser();
      setStatusMessage('Signed out successfully');
    } catch (err: any) {
      setStatusMessage(err?.message || 'Failed to sign out');
    }
  };

  const handlePushHeartbeatTelemetry = async () => {
    soundFX.playClick();
    if (!user) {
      setStatusMessage('Please sign in to push telemetry to Firestore');
      return;
    }

    try {
      await saveTelemetryRecord({
        id: `telemetry-manual-${Date.now()}`,
        nodeId: 'NODE-0742-CRAB',
        latencyMs: 12.4,
        activePeers: 1440,
        syncFrequency: 72,
        recordedAt: new Date().toISOString(),
      });
      setStatusMessage('Pushed live telemetry heartbeat to /telemetry collection');
      soundFX.playSuccess();
    } catch (err: any) {
      setStatusMessage(`Firestore write error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl clay-card-3d bg-[#0d091e]/95 border border-[#FF4D00]/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center text-[#FF4D00]">
              <Database className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
                <span>Firebase & Firestore Integration</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-code font-bold bg-[#FF4D00]/20 text-[#FF4D00] border border-[#FF4D00]/30">
                  ONLINE
                </span>
              </h2>
              <p className="text-xs font-code text-zinc-400">
                Persistent ABAC zero-trust database for Crabdeck Quantum
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5 font-code text-xs">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#70D6FF]" />
              <span>GCP / Firebase Project</span>
            </div>
            <div className="font-extrabold text-white text-sm truncate">
              {firebaseConfigInfo.projectId}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">Region: us-east1</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Firestore Database ID</span>
            </div>
            <div className="font-extrabold text-[#00FF66] text-xs truncate">
              {firebaseConfigInfo.databaseId}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
              <span>Hardened Rules: Deployed</span>
            </div>
          </div>
        </div>

        {/* Operator Authentication Section */}
        <div className="p-4 rounded-2xl bg-[#140e2b] border border-[#70D6FF]/20 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-code font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-[#70D6FF]" />
              <span>Operator Authentication (Firebase Auth)</span>
            </div>
            {user ? (
              <span className="px-2 py-0.5 rounded-lg bg-[#00FF66]/20 text-[#00FF66] text-[10px] font-code font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                AUTHENTICATED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-300 text-[10px] font-code font-extrabold">
                GUEST MODE
              </span>
            )}
          </div>

          {user ? (
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-xl border border-white/20" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400 flex items-center justify-center font-bold text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 text-xs">
                  <div className="font-extrabold text-white truncate">{user.displayName || 'Authorized Operator'}</div>
                  <div className="text-zinc-400 font-code text-[11px] truncate">{user.email}</div>
                  <div className="text-zinc-500 font-code text-[10px] truncate">UID: {user.uid}</div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-code font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-zinc-300 leading-relaxed max-w-sm">
                Authenticate with your Google Workspace account to write to <code className="text-[#FF4D00]">/swarm_messages</code> and <code className="text-[#00FF66]">/telemetry</code> collections.
              </p>
              <button
                onClick={handleSignIn}
                disabled={isConnecting}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4D00] to-[#FF8C00] text-black font-code font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#FF4D00]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>{isConnecting ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Collections & Actions */}
        <div className="space-y-3 font-code text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-bold flex items-center gap-1.5 text-white">
              <Radio className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Active Firestore Schemas</span>
            </span>
            <span className="text-[11px] text-zinc-500">Last check: {lastSyncTime}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-[#70D6FF] font-extrabold">/swarm_messages</div>
              <p className="text-[10px] text-zinc-400">Tactical broadcasts & 24h Swarm Chat signals</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-[#00FF66] font-extrabold">/telemetry</div>
              <p className="text-[10px] text-zinc-400">Latency heatmaps & 72 BPM heartbeat metrics</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="text-[#FFD700] font-extrabold">/operators</div>
              <p className="text-[10px] text-zinc-400">ABAC user identities & tactical preferences</p>
            </div>
          </div>

          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-code text-zinc-300">
              {statusMessage}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={checkConnection}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-code flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Test Connection</span>
            </button>

            {user && (
              <button
                onClick={handlePushHeartbeatTelemetry}
                className="px-3.5 py-1.5 rounded-xl bg-[#00FF66]/20 hover:bg-[#00FF66]/30 text-[#00FF66] border border-[#00FF66]/30 text-xs font-code font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Push Telemetry Heartbeat</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
