import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  getCurrentUser,
} from '../services/googleAuth';
import {
  listTaskLists,
  createTaskList,
  deleteTaskList,
  listTasks,
  createTask,
  toggleTaskStatus,
  deleteTask,
  GoogleTaskList,
  GoogleTask,
} from '../services/googleTasks';
import { soundFX } from '../utils/audio';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  RefreshCw,
  LogOut,
  FolderPlus,
  Folder,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';

export type UrgencyTier = 'P0' | 'P1' | 'P2' | 'P3';

export interface UrgencyInfo {
  tier: UrgencyTier;
  label: string;
  badge: string;
  colorHex: string;
  bgColor: string;
  borderColor: string;
  glowClass: string;
  score: number;
}

export const URGENCY_CONFIG: Record<UrgencyTier, UrgencyInfo> = {
  P0: {
    tier: 'P0',
    label: 'Crab Claw Orange (Critical Urgent)',
    badge: 'CRAB-P0 URGENT',
    colorHex: '#FF4D00',
    bgColor: 'rgba(255, 77, 0, 0.15)',
    borderColor: 'rgba(255, 77, 0, 0.5)',
    glowClass: 'shadow-[0_0_15px_rgba(255,77,0,0.35)]',
    score: 4,
  },
  P1: {
    tier: 'P1',
    label: 'Amber / Coral (High Priority)',
    badge: 'P1 HIGH',
    colorHex: '#FF8C00',
    bgColor: 'rgba(255, 140, 0, 0.12)',
    borderColor: 'rgba(255, 140, 0, 0.4)',
    glowClass: 'shadow-[0_0_12px_rgba(255,140,0,0.25)]',
    score: 3,
  },
  P2: {
    tier: 'P2',
    label: 'Gold / Yellow (Medium Priority)',
    badge: 'P2 NORMAL',
    colorHex: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.10)',
    borderColor: 'rgba(255, 215, 0, 0.35)',
    glowClass: 'shadow-[0_0_10px_rgba(255,215,0,0.2)]',
    score: 2,
  },
  P3: {
    tier: 'P3',
    label: 'Cyber Cyan (Low Priority)',
    badge: 'P3 LOW',
    colorHex: '#70D6FF',
    bgColor: 'rgba(112, 214, 255, 0.08)',
    borderColor: 'rgba(112, 214, 255, 0.25)',
    glowClass: '',
    score: 1,
  },
};

export function detectTaskUrgency(task: GoogleTask): UrgencyInfo {
  const title = (task.title || '').toUpperCase();
  const notes = (task.notes || '').toUpperCase();
  const combined = `${title} ${notes}`;

  // 1. Explicit keyword triggers
  if (
    combined.includes('[CRAB-P0]') ||
    combined.includes('[P0]') ||
    combined.includes('CRAB CLAW ORANGE') ||
    combined.includes('CRITICAL') ||
    combined.includes('EMERGENCY') ||
    combined.includes('URGENT') ||
    combined.includes('HOTFIX')
  ) {
    return URGENCY_CONFIG.P0;
  }

  // 2. Due Date proximity triggers (overdue or due within 24h -> auto Crab Claw Orange)
  if (task.due) {
    const dueDate = new Date(task.due).getTime();
    const now = Date.now();
    const diffHours = (dueDate - now) / (1000 * 60 * 60);

    if (diffHours <= 24) {
      return URGENCY_CONFIG.P0; // Overdue or due today
    } else if (diffHours <= 72) {
      return URGENCY_CONFIG.P1; // Due in next 3 days
    } else if (diffHours <= 168) {
      return URGENCY_CONFIG.P2; // Due in next 7 days
    }
  }

  if (
    combined.includes('[CRAB-P1]') ||
    combined.includes('[P1]') ||
    combined.includes('HIGH') ||
    combined.includes('IMPORTANT')
  ) {
    return URGENCY_CONFIG.P1;
  }

  if (
    combined.includes('[CRAB-P2]') ||
    combined.includes('[P2]') ||
    combined.includes('MEDIUM') ||
    combined.includes('NORMAL')
  ) {
    return URGENCY_CONFIG.P2;
  }

  return URGENCY_CONFIG.P3;
}

interface GoogleTasksViewProps {
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenGemini?: () => void;
}

export const GoogleTasksView: React.FC<GoogleTasksViewProps> = ({ onNotify, onOpenGemini }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Task Lists State
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(false);

  // Tasks State
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | UrgencyTier>('ALL');

  // New Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<UrgencyTier>('P0');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // New List modal state
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSubmittingList, setIsSubmittingList] = useState(false);

  // Destructive Action Confirmation Modal
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'task' | 'list';
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setIsAuthenticated(true);
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    );

    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      getAccessToken().then((tok) => {
        if (tok) {
          setToken(tok);
          setIsAuthenticated(true);
        }
      });
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch Task Lists
  const fetchTaskLists = useCallback(
    async (authToken: string) => {
      setIsLoadingLists(true);
      try {
        const lists = await listTaskLists(authToken);
        setTaskLists(lists);
        if (lists.length > 0 && !selectedListId) {
          setSelectedListId(lists[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching task lists:', err);
        onNotify?.(`Failed to load task lists: ${err.message}`, 'error');
      } finally {
        setIsLoadingLists(false);
      }
    },
    [selectedListId, onNotify]
  );

  // Fetch Tasks for current list
  const fetchTasks = useCallback(
    async (authToken: string, listId: string) => {
      if (!listId) return;
      setIsLoadingTasks(true);
      try {
        const items = await listTasks(authToken, listId, true);
        setTasks(items);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        onNotify?.(`Failed to load tasks: ${err.message}`, 'error');
      } finally {
        setIsLoadingTasks(false);
      }
    },
    [onNotify]
  );

  // Trigger loading when token or selected list changes
  useEffect(() => {
    if (token) {
      fetchTaskLists(token);
    }
  }, [token, fetchTaskLists]);

  useEffect(() => {
    if (token && selectedListId) {
      fetchTasks(token, selectedListId);
    }
  }, [token, selectedListId, fetchTasks]);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    soundFX.playWiggle();
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setIsAuthenticated(true);
        onNotify?.('Successfully signed in to Google Tasks', 'success');
        soundFX.playSuccess();
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      onNotify?.(`Sign in failed: ${err.message}`, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setTaskLists([]);
      setTasks([]);
      setSelectedListId('');
      onNotify?.('Signed out of Google Workspace', 'info');
      soundFX.playClick();
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedListId || !newTaskTitle.trim()) return;

    setIsSubmittingTask(true);
    try {
      // Prefix title with priority tag if not already prefixed
      let finalTitle = newTaskTitle.trim();
      const prefix = `[CRAB-${selectedPriority}]`;
      if (
        !finalTitle.toUpperCase().startsWith('[CRAB-') &&
        !finalTitle.toUpperCase().startsWith('[P')
      ) {
        finalTitle = `${prefix} ${finalTitle}`;
      }

      const created = await createTask(token, selectedListId, {
        title: finalTitle,
        notes: newTaskNotes.trim() || undefined,
        due: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
      });

      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDueDate('');
      soundFX.playSuccess();
      onNotify?.(`Task "${created.title}" synchronized to Google Tasks`, 'success');
    } catch (err: any) {
      console.error('Failed to create task:', err);
      onNotify?.(`Task creation error: ${err.message}`, 'error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleToggleTask = async (task: GoogleTask) => {
    if (!token || !selectedListId) return;
    const isCompleted = task.status === 'completed';
    const nextCompleted = !isCompleted;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: nextCompleted ? 'completed' : 'needsAction',
              completed: nextCompleted ? new Date().toISOString() : undefined,
            }
          : t
      )
    );

    if (nextCompleted) {
      soundFX.playChime();
    } else {
      soundFX.playClick();
    }

    try {
      const updated = await toggleTaskStatus(token, selectedListId, task.id, nextCompleted);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err: any) {
      console.error('Failed to toggle task:', err);
      // Revert optimistic update on failure
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      onNotify?.(`Failed to update task: ${err.message}`, 'error');
    }
  };

  const confirmDeleteAction = async () => {
    if (!pendingDelete || !token) return;
    setIsDeleting(true);

    try {
      if (pendingDelete.type === 'task') {
        if (!selectedListId) return;
        await deleteTask(token, selectedListId, pendingDelete.id);
        setTasks((prev) => prev.filter((t) => t.id !== pendingDelete.id));
        soundFX.playClick();
        onNotify?.(`Task "${pendingDelete.title}" deleted from Google Tasks`, 'info');
      } else if (pendingDelete.type === 'list') {
        await deleteTaskList(token, pendingDelete.id);
        const remainingLists = taskLists.filter((l) => l.id !== pendingDelete.id);
        setTaskLists(remainingLists);
        setSelectedListId(remainingLists.length > 0 ? remainingLists[0].id : '');
        soundFX.playClick();
        onNotify?.(`Task list "${pendingDelete.title}" deleted`, 'info');
      }
    } catch (err: any) {
      console.error('Delete action failed:', err);
      onNotify?.(`Delete operation failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newListName.trim()) return;

    setIsSubmittingList(true);
    try {
      const created = await createTaskList(token, newListName.trim());
      setTaskLists((prev) => [...prev, created]);
      setSelectedListId(created.id);
      setNewListName('');
      setIsCreateListModalOpen(false);
      soundFX.playSuccess();
      onNotify?.(`Created task list "${created.title}"`, 'success');
    } catch (err: any) {
      console.error('Failed to create list:', err);
      onNotify?.(`Error creating list: ${err.message}`, 'error');
    } finally {
      setIsSubmittingList(false);
    }
  };

  // Quick Action: Batch import Crabdeck Ultra Daily Sprint 2026-10-29 tasks
  const handleQuickImportSprintBriefing = async () => {
    if (!token || !selectedListId) return;
    const sprintChecklist = [
      {
        title: '[CRAB-P0] Verify 127.0.0.1 Loopback & Port 3000 Boundary Integrity',
        notes: 'Enforce tri-tier tool gating (safe, write, destructive approval) with HMAC key check.',
      },
      {
        title: '[CRAB-P0] Audit bHive 1440-minute peer mesh heartbeat gossip delta',
        notes: 'Inspect D3 latency heatmap and rolling 60-second gossip sync frequency graph.',
      },
      {
        title: '[CRAB-P1] Megabrain Quantum Overclocking Thermal Benchmark',
        notes: 'Confirm core clock stabilization at 4.8 GHz without thermal throttling.',
      },
      {
        title: '[CRAB-P1] Deploy Carbon SecAuditor AST patch validation suite',
        notes: 'Execute security smoke tests across all agent worker node manifests.',
      },
      {
        title: '[CRAB-P2] Synchronize Tiered Memory Vault cold storage snapshots',
        notes: 'Backup memory checkpoints to Google Drive & Google Cloud storage bucket.',
      },
      {
        title: '[CRAB-P3] Refresh local log-o-matic ring buffer cache',
        notes: 'Clear non-critical telemetry streams older than 48 hours.',
      },
    ];

    try {
      onNotify?.('Synchronizing Crabdeck Sprint checklist items to Google Tasks...', 'info');
      soundFX.playSuccess();
      for (const item of sprintChecklist) {
        const created = await createTask(token, selectedListId, item);
        setTasks((prev) => [created, ...prev]);
      }
      onNotify?.('All Crabdeck Sprint items synchronized successfully!', 'success');
      soundFX.playChime();
    } catch (err: any) {
      console.error('Failed to sync sprint tasks:', err);
      onNotify?.(`Sprint sync error: ${err.message}`, 'error');
    }
  };

  // Filter tasks based on status tab and urgency heat map filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (filterMode === 'active' && t.status === 'completed') return false;
      if (filterMode === 'completed' && t.status !== 'completed') return false;

      // Urgency heat map filter
      if (urgencyFilter !== 'ALL') {
        const urgency = detectTaskUrgency(t);
        if (urgency.tier !== urgencyFilter) return false;
      }

      return true;
    });
  }, [tasks, filterMode, urgencyFilter]);

  // Compute Urgency Distribution metrics for the Heat Map Visualizer
  const urgencyStats = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status !== 'completed');
    const counts = { P0: 0, P1: 0, P2: 0, P3: 0 };
    activeTasks.forEach((t) => {
      const u = detectTaskUrgency(t);
      counts[u.tier]++;
    });

    const totalActive = activeTasks.length || 1;
    return {
      counts,
      percentages: {
        P0: Math.round((counts.P0 / totalActive) * 100),
        P1: Math.round((counts.P1 / totalActive) * 100),
        P2: Math.round((counts.P2 / totalActive) * 100),
        P3: Math.round((counts.P3 / totalActive) * 100),
      },
      totalActive: activeTasks.length,
    };
  }, [tasks]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const currentList = taskLists.find((l) => l.id === selectedListId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Banner */}
      <div className="clay-card-3d p-6 relative overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-[#FF4D00]/20 via-[#FF8C00]/10 to-transparent pointer-events-none rounded-bl-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded bg-[#70D6FF]/15 text-[#70D6FF] border border-[#70D6FF]/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                WORKSPACE INTEGRATION
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded bg-[#FF4D00]/20 text-[#FF4D00] border border-[#FF4D00]/40 flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                CRAB CLAW ORANGE HEAT MAP
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30">
                GOOGLE TASKS API v1
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
              Google Tasks Matrix & Priority Heat Map
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl font-mono">
              Real-time urgency heat visualization with Crab Claw Orange (#FF4D00) intensity alerts for high-priority sprint items.
            </p>
          </div>

          {/* Auth State Button */}
          <div>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 bg-[#0A0D12] border border-white/10 rounded-2xl p-2.5 px-4 shadow-inner">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Operator'}
                    className="w-9 h-9 rounded-full ring-2 ring-[#FF4D00]/40 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#FF4D00]/20 text-[#FF4D00] font-bold flex items-center justify-center text-sm border border-[#FF4D00]/30">
                    {user.email?.charAt(0).toUpperCase() || 'O'}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[150px]">
                    {user.displayName || 'Operator'}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[150px] font-mono">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign out of Google"
                  className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-[#FF2A55] transition-colors ml-2"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        /* Sign-in Callout */
        <div className="clay-card-3d p-12 text-center rounded-3xl border border-white/5 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FF4D00]/10 border border-[#FF4D00]/30 flex items-center justify-center text-[#FF4D00] shadow-xl shadow-[#FF4D00]/10">
            <Flame className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white font-display">
              Google Tasks Priority Heat Map
            </h3>
            <p className="text-sm text-gray-400 font-mono">
              Sign in with your Google account to enable real-time synchronization, priority color-coding (Crab Claw Orange for urgent items), and task orchestration.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className="gsi-material-button mx-auto hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{ display: 'block' }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
              </span>
            </div>
          </button>
        </div>
      ) : (
        /* Authenticated Main Task Operations View */
        <div className="space-y-6">
          {/* 1. Dedicated Urgency Heat Map Visualizer Matrix */}
          <div className="clay-card-3d p-6 rounded-3xl border border-white/5 relative overflow-hidden bg-[#0A0D12]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF4D00]/20 border border-[#FF4D00]/40 flex items-center justify-center text-[#FF4D00] shadow-md shadow-[#FF4D00]/20">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-display font-extrabold text-white flex items-center gap-2">
                    <span>TASK URGENCY HEAT MAP & DENSITY SPECTRUM</span>
                  </h2>
                  <p className="text-xs font-mono text-gray-400">
                    Visual intensity scanning across active operational objectives
                  </p>
                </div>
              </div>

              {/* Gemini Bot AI Assist Button */}
              {onOpenGemini && (
                <button
                  onClick={onOpenGemini}
                  className="px-3.5 py-2 rounded-2xl bg-[#FF4D00]/15 hover:bg-[#FF4D00]/25 text-[#FF4D00] border border-[#FF4D00]/30 text-xs font-mono font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Gemini to Prioritize Tasks</span>
                </button>
              )}
            </div>

            {/* Continuous Heat Intensity Gradient Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 font-bold flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4D00]" />
                  SPECTRUM DISTRIBUTION
                </span>
                <span className="text-gray-300">
                  <strong className="text-white">{urgencyStats.totalActive}</strong> Active Tasks Monitored
                </span>
              </div>

              {/* Segmented Gradient Bar */}
              <div className="h-4 w-full bg-black/60 rounded-full overflow-hidden flex border border-white/10 shadow-inner">
                <div
                  style={{ width: `${urgencyStats.percentages.P0}%` }}
                  className="bg-gradient-to-r from-[#FF4D00] to-[#FF3300] transition-all duration-500 relative group"
                  title={`P0 Critical: ${urgencyStats.counts.P0} tasks (${urgencyStats.percentages.P0}%)`}
                />
                <div
                  style={{ width: `${urgencyStats.percentages.P1}%` }}
                  className="bg-gradient-to-r from-[#FF8C00] to-[#FFA500] transition-all duration-500 relative group"
                  title={`P1 High: ${urgencyStats.counts.P1} tasks (${urgencyStats.percentages.P1}%)`}
                />
                <div
                  style={{ width: `${urgencyStats.percentages.P2}%` }}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFEE55] transition-all duration-500 relative group"
                  title={`P2 Normal: ${urgencyStats.counts.P2} tasks (${urgencyStats.percentages.P2}%)`}
                />
                <div
                  style={{ width: `${urgencyStats.percentages.P3}%` }}
                  className="bg-gradient-to-r from-[#70D6FF] to-[#00FF66] transition-all duration-500 relative group"
                  title={`P3 Low: ${urgencyStats.counts.P3} tasks (${urgencyStats.percentages.P3}%)`}
                />
              </div>
            </div>

            {/* 4 Interactive Heat Level Cards / Quick Filters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {/* P0 Crab Claw Orange */}
              <button
                onClick={() => setUrgencyFilter(urgencyFilter === 'P0' ? 'ALL' : 'P0')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                  urgencyFilter === 'P0'
                    ? 'bg-[#FF4D00]/25 border-[#FF4D00] shadow-[0_0_20px_rgba(255,77,0,0.4)]'
                    : 'bg-black/40 border-white/10 hover:border-[#FF4D00]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FF4D00]/20 text-[#FF4D00] border border-[#FF4D00]/40 flex items-center gap-1">
                    <Flame className="w-3 h-3 animate-pulse" />
                    P0 CRITICAL
                  </span>
                  <span className="text-xl font-display font-extrabold text-[#FF4D00]">
                    {urgencyStats.counts.P0}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-2">Crab Claw Orange</div>
                <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                  {urgencyStats.percentages.P0}% of active workload
                </div>
              </button>

              {/* P1 Amber */}
              <button
                onClick={() => setUrgencyFilter(urgencyFilter === 'P1' ? 'ALL' : 'P1')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                  urgencyFilter === 'P1'
                    ? 'bg-[#FF8C00]/25 border-[#FF8C00] shadow-[0_0_20px_rgba(255,140,0,0.3)]'
                    : 'bg-black/40 border-white/10 hover:border-[#FF8C00]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    P1 HIGH
                  </span>
                  <span className="text-xl font-display font-extrabold text-[#FF8C00]">
                    {urgencyStats.counts.P1}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-2">Amber Coral</div>
                <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                  {urgencyStats.percentages.P1}% of active workload
                </div>
              </button>

              {/* P2 Gold */}
              <button
                onClick={() => setUrgencyFilter(urgencyFilter === 'P2' ? 'ALL' : 'P2')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                  urgencyFilter === 'P2'
                    ? 'bg-[#FFD700]/25 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                    : 'bg-black/40 border-white/10 hover:border-[#FFD700]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    P2 NORMAL
                  </span>
                  <span className="text-xl font-display font-extrabold text-[#FFD700]">
                    {urgencyStats.counts.P2}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-2">Gold Yellow</div>
                <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                  {urgencyStats.percentages.P2}% of active workload
                </div>
              </button>

              {/* P3 Cyan */}
              <button
                onClick={() => setUrgencyFilter(urgencyFilter === 'P3' ? 'ALL' : 'P3')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                  urgencyFilter === 'P3'
                    ? 'bg-[#70D6FF]/25 border-[#70D6FF] shadow-[0_0_20px_rgba(112,214,255,0.3)]'
                    : 'bg-black/40 border-white/10 hover:border-[#70D6FF]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#70D6FF]/20 text-[#70D6FF] border border-[#70D6FF]/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    P3 LOW
                  </span>
                  <span className="text-xl font-display font-extrabold text-[#70D6FF]">
                    {urgencyStats.counts.P3}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-2">Cyber Cyan</div>
                <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                  {urgencyStats.percentages.P3}% of active workload
                </div>
              </button>
            </div>

            {/* Filter Reset notification when filtered */}
            {urgencyFilter !== 'ALL' && (
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-[#FF4D00] flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" />
                  Filtering by heat tier: <strong>{urgencyFilter} ({URGENCY_CONFIG[urgencyFilter].label})</strong>
                </span>
                <button
                  onClick={() => setUrgencyFilter('ALL')}
                  className="text-gray-400 hover:text-white underline text-xs cursor-pointer"
                >
                  Show All Heat Levels
                </button>
              </div>
            )}
          </div>

          {/* 2. Main Two-Column View: Left (Lists & Progress) | Right (Task Feed & Heat Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Task Lists & Stats (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Task Lists Card */}
              <div className="clay-card-3d p-5 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#70D6FF]" />
                    <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">
                      Task Lists
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsCreateListModalOpen(true)}
                    className="p-1.5 bg-[#70D6FF]/10 text-[#70D6FF] hover:bg-[#70D6FF]/20 border border-[#70D6FF]/30 rounded-xl transition-all flex items-center gap-1 text-xs font-mono font-bold active:scale-95"
                    title="Create new task list"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>New List</span>
                  </button>
                </div>

                {isLoadingLists ? (
                  <div className="py-8 text-center text-gray-500 font-mono text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#70D6FF]" />
                    Loading task lists...
                  </div>
                ) : taskLists.length === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-xs font-mono">
                    No task lists found. Create your first list!
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {taskLists.map((list) => {
                      const isSelected = list.id === selectedListId;
                      return (
                        <div
                          key={list.id}
                          className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#FF4D00]/15 border-[#FF4D00]/40 text-white font-medium shadow-md'
                              : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                          onClick={() => setSelectedListId(list.id)}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Layers
                              className={`w-4 h-4 ${isSelected ? 'text-[#FF4D00]' : 'text-gray-500'}`}
                            />
                            <span className="truncate text-xs font-mono">{list.title}</span>
                          </div>
                          {taskLists.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDelete({
                                  type: 'list',
                                  id: list.id,
                                  title: list.title,
                                });
                              }}
                              className="p-1 text-gray-500 hover:text-[#FF2A55] transition-colors rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100"
                              title="Delete task list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Actions Panel */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <div className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[#FFD700]" />
                    Crabdeck Quick Sync
                  </div>
                  <button
                    onClick={handleQuickImportSprintBriefing}
                    disabled={!selectedListId || isLoadingTasks}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-[#FF4D00]/20 via-[#FF8C00]/20 to-[#FFD700]/20 hover:from-[#FF4D00]/30 hover:to-[#FFD700]/30 border border-[#FF4D00]/30 text-white rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-md cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-[#FF4D00] animate-pulse" />
                    Sync Sprint 2026-10-29 Tasks
                  </button>
                </div>
              </div>

              {/* Metrics & Progress Card */}
              <div className="clay-card-3d p-5 rounded-3xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>COMPLETION RATE</span>
                  <span className="font-bold text-white">{progressPercent}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#FF4D00] via-[#FFD700] to-[#00FF66] h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <div className="text-gray-500 text-[10px]">TOTAL TASKS</div>
                    <div className="text-base font-bold text-white">{tasks.length}</div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <div className="text-gray-500 text-[10px]">COMPLETED</div>
                    <div className="text-base font-bold text-[#00FF66]">{completedCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Tasks Stream & Creation (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Create Task Form with Priority Tags */}
              <div className="clay-card-3d p-5 rounded-3xl border border-white/5 bg-[#0D0F14]">
                <form onSubmit={handleCreateTask} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#FF4D00]" />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        Add Task to {currentList?.title || 'Selected List'}
                      </span>
                    </div>

                    {/* Urgency selector buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPriority('P0')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-extrabold transition-all ${
                          selectedPriority === 'P0'
                            ? 'bg-[#FF4D00] text-black shadow-md shadow-[#FF4D00]/40'
                            : 'bg-[#FF4D00]/15 text-[#FF4D00] border border-[#FF4D00]/30 hover:bg-[#FF4D00]/30'
                        }`}
                      >
                        P0 (Crab Claw)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPriority('P1')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-extrabold transition-all ${
                          selectedPriority === 'P1'
                            ? 'bg-[#FF8C00] text-black shadow-md shadow-[#FF8C00]/40'
                            : 'bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/30 hover:bg-[#FF8C00]/30'
                        }`}
                      >
                        P1 (Amber)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPriority('P2')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-extrabold transition-all ${
                          selectedPriority === 'P2'
                            ? 'bg-[#FFD700] text-black shadow-md shadow-[#FFD700]/40'
                            : 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 hover:bg-[#FFD700]/30'
                        }`}
                      >
                        P2 (Gold)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPriority('P3')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-extrabold transition-all ${
                          selectedPriority === 'P3'
                            ? 'bg-[#70D6FF] text-black shadow-md shadow-[#70D6FF]/40'
                            : 'bg-[#70D6FF]/15 text-[#70D6FF] border border-[#70D6FF]/30 hover:bg-[#70D6FF]/30'
                        }`}
                      >
                        P3 (Low)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter task title (priority tag will be attached)..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4D00] transition-all font-mono"
                      disabled={isSubmittingTask}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newTaskNotes}
                        onChange={(e) => setNewTaskNotes(e.target.value)}
                        placeholder="Optional notes / specifications..."
                        className="bg-black/30 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4D00] transition-all font-mono"
                        disabled={isSubmittingTask}
                      />
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="date"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#FF4D00] transition-all font-mono"
                            disabled={isSubmittingTask}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmittingTask || !newTaskTitle.trim() || !selectedListId}
                          className="py-2 px-5 bg-gradient-to-r from-[#FF4D00] to-[#FF8C00] hover:opacity-90 active:scale-95 text-black font-extrabold text-xs rounded-2xl transition-all disabled:opacity-50 flex items-center gap-1.5 font-mono shadow-md shadow-[#FF4D00]/25 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{isSubmittingTask ? 'Adding...' : 'Add Task'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Task Stream Controls & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0D12] p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-gray-500 ml-1" />
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-white/15 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All ({tasks.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('active')}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      filterMode === 'active'
                        ? 'bg-[#FF4D00]/20 text-[#FF4D00]'
                        : 'text-gray-400 hover:text-[#FF4D00]'
                    }`}
                  >
                    Active ({tasks.length - completedCount})
                  </button>
                  <button
                    onClick={() => setFilterMode('completed')}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      filterMode === 'completed'
                        ? 'bg-[#00FF66]/20 text-[#00FF66]'
                        : 'text-gray-400 hover:text-[#00FF66]'
                    }`}
                  >
                    Completed ({completedCount})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => token && selectedListId && fetchTasks(token, selectedListId)}
                    disabled={isLoadingTasks}
                    className="p-1.5 px-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all text-xs flex items-center gap-1.5 font-mono cursor-pointer active:scale-95"
                    title="Refresh tasks from Google"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isLoadingTasks ? 'animate-spin text-[#FF4D00]' : ''}`}
                    />
                    <span>Sync</span>
                  </button>
                </div>
              </div>

              {/* Task Items Stream with Heat Intensity Bars */}
              <div className="space-y-2.5">
                {isLoadingTasks ? (
                  <div className="clay-card-3d p-12 text-center rounded-3xl border border-white/5 font-mono text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#FF4D00]" />
                    <span>Synchronizing Google Tasks...</span>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="clay-card-3d p-12 text-center rounded-3xl border border-white/5 font-mono text-xs text-gray-500 space-y-2">
                    <CheckSquare className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                    <p>No tasks found matching this criteria.</p>
                    <p className="text-[11px] text-gray-600">
                      Add a task above or switch the urgency heat filter.
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isCompleted = task.status === 'completed';
                    const urgency = detectTaskUrgency(task);
                    const isP0Urgent = urgency.tier === 'P0' && !isCompleted;

                    return (
                      <div
                        key={task.id}
                        style={{
                          borderLeftWidth: '5px',
                          borderLeftColor: isCompleted ? '#374151' : urgency.colorHex,
                        }}
                        className={`clay-card-3d p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 group relative overflow-hidden ${
                          isCompleted
                            ? 'bg-black/40 border-white/5 opacity-60'
                            : isP0Urgent
                            ? 'bg-[#150D0A] border-[#FF4D00]/40 shadow-[0_0_15px_rgba(255,77,0,0.2)]'
                            : 'bg-[#0D0F14] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Background ambient glow for P0 Crab Claw Orange */}
                        {isP0Urgent && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF4D00]/15 to-transparent pointer-events-none rounded-bl-full" />
                        )}

                        <div className="flex items-start gap-3 flex-1 min-w-0 relative z-10">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleTask(task)}
                            className="mt-0.5 text-gray-400 hover:text-[#00FF66] transition-colors flex-shrink-0 cursor-pointer active:scale-95"
                            title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                          >
                            {isCompleted ? (
                              <CheckSquare className="w-5 h-5 text-[#00FF66]" />
                            ) : (
                              <Square
                                className={`w-5 h-5 ${
                                  isP0Urgent ? 'text-[#FF4D00]' : 'text-gray-500 hover:text-[#70D6FF]'
                                }`}
                              />
                            )}
                          </button>

                          {/* Title and details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {/* Urgency Heat Badge */}
                              {!isCompleted && (
                                <span
                                  style={{
                                    backgroundColor: urgency.bgColor,
                                    borderColor: urgency.borderColor,
                                    color: urgency.colorHex,
                                  }}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold border flex items-center gap-1 ${
                                    isP0Urgent ? 'animate-pulse' : ''
                                  }`}
                                >
                                  {urgency.tier === 'P0' ? (
                                    <Flame className="w-2.5 h-2.5" />
                                  ) : (
                                    <Zap className="w-2.5 h-2.5" />
                                  )}
                                  {urgency.badge}
                                </span>
                              )}

                              <div
                                className={`text-sm font-mono break-words font-medium ${
                                  isCompleted ? 'line-through text-gray-500' : 'text-white'
                                }`}
                              >
                                {task.title}
                              </div>
                            </div>

                            {task.notes && (
                              <p className="text-xs text-gray-400 font-mono mt-1 break-words">
                                {task.notes}
                              </p>
                            )}

                            {/* Metadata row */}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-mono text-gray-500">
                              {task.due && (
                                <span
                                  className={`flex items-center gap-1 ${
                                    isP0Urgent ? 'text-[#FF4D00] font-bold' : 'text-[#FFD700]'
                                  }`}
                                >
                                  <Calendar className="w-3 h-3" />
                                  Due {new Date(task.due).toLocaleDateString()}
                                </span>
                              )}
                              {task.completed && (
                                <span className="flex items-center gap-1 text-[#00FF66]">
                                  <Clock className="w-3 h-3" />
                                  Completed {new Date(task.completed).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons (Delete Destructive Safeguard) */}
                        <div className="flex items-center gap-1 shrink-0 relative z-10">
                          <button
                            onClick={() =>
                              setPendingDelete({
                                type: 'task',
                                id: task.id,
                                title: task.title,
                              })
                            }
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-[#FF2A55] rounded-xl hover:bg-white/10 transition-all flex-shrink-0 cursor-pointer"
                            title="Delete task from Google Tasks"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Destructive Action Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="clay-card-3d max-w-md w-full p-6 rounded-3xl border border-[#FF2A55]/30 shadow-2xl space-y-5 bg-[#0D0F14]">
            <div className="flex items-center gap-3 text-[#FF2A55]">
              <div className="p-3 bg-[#FF2A55]/10 rounded-2xl border border-[#FF2A55]/30">
                <AlertTriangle className="w-6 h-6 text-[#FF2A55]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Permanent Deletion</h3>
                <p className="text-xs text-[#FF2A55] font-mono uppercase tracking-wider">
                  Destructive Action Safeguard
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-300 font-mono space-y-2">
              <p>
                Are you sure you want to permanently delete this{' '}
                <strong className="text-white">{pendingDelete.type}</strong> from Google Tasks?
              </p>
              <div className="bg-black/50 p-3 rounded-2xl border border-white/5 text-white font-bold text-xs truncate">
                "{pendingDelete.title}"
              </div>
              <p className="text-xs text-gray-400">
                This action cannot be undone and will remove the item from all synchronized devices.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-2xl text-xs font-mono font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-2xl text-xs font-mono font-bold text-white bg-[#FF2A55] hover:bg-[#FF2A55]/80 transition-all flex items-center gap-1.5 shadow-lg shadow-[#FF2A55]/30 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task List Modal */}
      {isCreateListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="clay-card-3d max-w-md w-full p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4 bg-[#0D0F14]">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#70D6FF]" />
              <h3 className="text-base font-bold text-white font-mono">Create New Task List</h3>
            </div>
            <form onSubmit={handleCreateList} className="space-y-4">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name (e.g., Crabdeck Sprint Logistics)..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4D00] transition-all font-mono"
                autoFocus
                disabled={isSubmittingList}
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateListModalOpen(false)}
                  disabled={isSubmittingList}
                  className="px-4 py-2 rounded-2xl text-xs font-mono text-gray-400 hover:text-white bg-white/5 transition-all cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingList || !newListName.trim()}
                  className="px-5 py-2 rounded-2xl text-xs font-mono font-bold text-black bg-[#FF4D00] hover:bg-[#FF4D00]/80 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isSubmittingList ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
