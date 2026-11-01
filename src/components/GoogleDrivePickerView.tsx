import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
  getCurrentUser,
  WORKSPACE_DRIVE_SCOPES
} from '../services/googleAuth';
import {
  openGooglePicker,
  PickedGoogleDriveFile
} from '../services/googlePicker';
import {
  listDriveFiles,
  getDriveFileContent,
  uploadDriveFile,
  deleteDriveFile,
  DriveFileItem
} from '../services/googleDrive';
import { FEATURE_ARTIFACTS } from '../data/featureArtifactsData';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Folder,
  FileText,
  Search,
  Upload,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  ShieldCheck,
  Eye,
  LogOut,
  FolderOpen
} from 'lucide-react';

export const GoogleDrivePickerView: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive state
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileContent, setSelectedFileContent] = useState<{ name: string; content: string } | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Picker state
  const [pickedFiles, setPickedFiles] = useState<PickedGoogleDriveFile[]>([]);
  const [pickerViewMode, setPickerViewMode] = useState<string>('DOCS');
  const [pickerMultiSelect, setPickerMultiSelect] = useState<boolean>(true);
  const [isPickerOpening, setIsPickerOpening] = useState(false);

  // Destructive Action Confirmation Modal State
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Artifact export state
  const [isExportingArtifacts, setIsExportingArtifacts] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        fetchFiles(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setFiles([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchFiles = async (token?: string, query?: string) => {
    const tokenToUse = token || accessToken;
    if (!tokenToUse) return;

    setIsLoadingFiles(true);
    try {
      let q = "trashed = false";
      if (query && query.trim()) {
        q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
      }
      const res = await listDriveFiles(tokenToUse, { query: q });
      setFiles(res.files || []);
    } catch (err: any) {
      console.error('Failed to list Drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      soundFX.playClick();
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        soundFX.playSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        fetchFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    soundFX.playClick();
    await logout();
    setUser(null);
    setAccessToken(null);
    setFiles([]);
    setPickedFiles([]);
    setSelectedFileContent(null);
  };

  // Launch Google Picker
  const handleLaunchPicker = async () => {
    if (!accessToken) {
      handleSignIn();
      return;
    }

    setIsPickerOpening(true);
    try {
      soundFX.playWiggle();
      await openGooglePicker({
        accessToken,
        viewId: pickerViewMode,
        multiSelect: pickerMultiSelect,
        onPicked: (selected) => {
          setPickedFiles(prev => [...selected, ...prev]);
          soundFX.playSuccess();
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.5 }
          });
        },
        onCancel: () => {
          soundFX.playClick();
        }
      });
    } catch (err: any) {
      console.error('Google Picker launch error:', err);
    } finally {
      setIsPickerOpening(false);
    }
  };

  // Preview file content
  const handlePreviewFile = async (file: DriveFileItem) => {
    if (!accessToken) return;
    setIsLoadingContent(true);
    soundFX.playClick();
    try {
      const content = await getDriveFileContent(accessToken, file.id);
      setSelectedFileContent({ name: file.name, content });
    } catch (err: any) {
      setSelectedFileContent({
        name: file.name,
        content: `Could not load plain text preview: ${err.message}. Use "Open in Drive" to view.`
      });
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Confirm and Execute Destructive Deletion
  const handleConfirmDelete = async () => {
    if (!accessToken || !fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      soundFX.playSuccess();
      setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Crabdeck Specifications to Drive
  const handleExportArtifactsToDrive = async () => {
    if (!accessToken) return;
    setIsExportingArtifacts(true);
    setExportStatus('Uploading 14 specifications to Google Drive...');
    soundFX.playWiggle();

    try {
      let count = 0;
      for (const art of FEATURE_ARTIFACTS.slice(0, 5)) {
        const markdown = `# ${art.id}: ${art.title}\n\n**Category:** ${art.category}\n**Security Tier:** ${art.securityTier}\n\n## Executive Summary\n${art.summary}\n\n` +
          art.sections.map(s => `### ${s.heading}\n${s.body}`).join('\n\n');
        
        await uploadDriveFile(accessToken, `Crabdeck_${art.fileName}`, markdown, 'text/markdown');
        count++;
      }

      setExportStatus(`Successfully synced ${count} Crabdeck architecture artifacts to Google Drive!`);
      soundFX.playSuccess();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 }
      });
      fetchFiles(accessToken);
    } catch (err: any) {
      setExportStatus(`Export failed: ${err.message}`);
    } finally {
      setIsExportingArtifacts(false);
    }
  };

  return (
    <div className="space-y-6 text-white font-code animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Authentication Cockpit */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0C081E] via-[#150d32] to-[#0A0618] border border-[#FFD700]/30 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl clay-btn-blue flex items-center justify-center text-2xl shadow-lg shrink-0">
            📁
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-display font-extrabold text-white tracking-tight">
                Google Drive &amp; Google Picker Workspace
              </h2>
              <span className="text-[10px] font-code font-bold px-2 py-0.5 rounded-full badge-blue">
                Workspace 1P OAuth
              </span>
              <span className="text-[10px] font-code font-bold px-2 py-0.5 rounded-full badge-green">
                Zero-Leak In-Memory Token
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-hanken mt-1">
              Select files from Google Drive via the native <strong>Google Picker</strong> dialog, browse cloud assets, and persist Crabdeck architecture artifacts.
            </p>
          </div>
        </div>

        {/* Authentication Controls */}
        <div>
          {user ? (
            <div className="flex items-center gap-3 p-2 px-3 rounded-2xl clay-card-3d border border-emerald-500/30 bg-black/40">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-9 h-9 rounded-full ring-2 ring-emerald-400 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shrink-0">
                  {user.email ? user.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">
                  {user.displayName || 'Authenticated User'}
                </div>
                <div className="text-[10px] text-zinc-400 font-code truncate max-w-[140px] sm:max-w-[180px]">
                  {user.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Sign out of Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Official Google Sign-In Button as mandated by SKILL.md */
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-800 font-sans font-medium text-xs rounded-xl shadow-md border border-gray-300 transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {authError && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{authError}</span>
        </div>
      )}

      {/* 2. Google Picker Control Center */}
      <div className="p-5 rounded-2xl clay-card-3d border border-[#70D6FF]/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#70D6FF]" />
            <h3 className="text-base font-display font-extrabold text-white">
              Launch Google Picker
            </h3>
            <span className="text-[10px] font-code badge-blue px-2 py-0.5 rounded-full">
              Client-Side Widget
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Id Filter */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-code">
              {(['DOCS', 'SPREADSHEETS', 'PRESENTATIONS', 'DOCS_IMAGES'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPickerViewMode(mode)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    pickerViewMode === mode
                      ? 'bg-[#70D6FF] text-black font-extrabold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mode.replace('DOCS_', '')}
                </button>
              ))}
            </div>

            {/* Multi-Select Toggle */}
            <button
              onClick={() => setPickerMultiSelect(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-code font-bold transition-all cursor-pointer ${
                pickerMultiSelect
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border-white/10 bg-black/40 text-zinc-400'
              }`}
            >
              {pickerMultiSelect ? 'Multi-Select: ON' : 'Multi-Select: OFF'}
            </button>

            {/* Primary Launch Button */}
            <button
              onClick={handleLaunchPicker}
              disabled={isPickerOpening}
              className="px-4 py-2 rounded-xl clay-btn-gold font-display font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPickerOpening ? 'Opening Picker...' : 'Open Google Picker'}</span>
            </button>
          </div>
        </div>

        {/* Recently Picked Files Tray */}
        {pickedFiles.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-code font-bold text-zinc-400 flex items-center justify-between">
              <span>Recently Picked via Google Picker ({pickedFiles.length} files)</span>
              <button
                onClick={() => setPickedFiles([])}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                Clear Tray
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {pickedFiles.map((doc, idx) => (
                <div
                  key={`${doc.id}-${idx}`}
                  className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-[#70D6FF]/40 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    {doc.iconUrl ? (
                      <img src={doc.iconUrl} alt="icon" className="w-5 h-5 shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-[#70D6FF] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate font-display">
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-code truncate">
                        {doc.mimeType}
                      </div>
                    </div>
                  </div>

                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#70D6FF] shrink-0"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-black/30 border border-dashed border-white/10 text-center space-y-1 text-zinc-400">
            <p className="text-xs font-hanken">
              No files picked yet. Click <strong>"Open Google Picker"</strong> to choose documents from your Google Drive.
            </p>
          </div>
        )}
      </div>

      {/* 3. Google Drive Explorer & Crabdeck Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Drive File Browser */}
        <div className="lg:col-span-2 p-5 rounded-2xl clay-card-3d border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-[#FFD700]" />
              <h3 className="text-sm font-display font-extrabold text-white">
                Google Drive Files
              </h3>
              <span className="text-xs font-code text-zinc-400">({files.length} found)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchFiles(undefined, e.target.value);
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD700]/50 font-code w-44"
                />
              </div>

              <button
                onClick={() => fetchFiles(undefined, searchQuery)}
                disabled={isLoadingFiles}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                title="Refresh Drive files"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Files List Table */}
          {user ? (
            isLoadingFiles ? (
              <div className="py-12 text-center text-xs text-zinc-400 font-code flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#70D6FF]" />
                <span>Loading Google Drive files...</span>
              </div>
            ) : files.length > 0 ? (
              <div className="divide-y divide-white/5 max-h-96 overflow-y-auto pr-1">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="py-2.5 px-2 rounded-xl hover:bg-white/5 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {file.iconLink ? (
                        <img src={file.iconLink} alt="" className="w-4 h-4 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-[#70D6FF] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate font-display">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-code flex items-center gap-2">
                          <span>{file.mimeType.split('.').pop()}</span>
                          {file.size && <span>· {(Number(file.size) / 1024).toFixed(1)} KB</span>}
                          {file.modifiedTime && (
                            <span>· {new Date(file.modifiedTime).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handlePreviewFile(file)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                        title="Preview text/metadata"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#70D6FF] transition-all"
                          title="Open in Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => setFileToDelete(file)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-all cursor-pointer"
                        title="Delete file (Requires confirmation)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-400 font-hanken">
                No files found in Google Drive matching this query.
              </div>
            )
          ) : (
            <div className="py-12 text-center space-y-3">
              <Lock className="w-8 h-8 text-zinc-500 mx-auto" />
              <p className="text-xs text-zinc-400 font-hanken">
                Sign in with Google above to view and manage your Google Drive files.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Crabdeck Sync & File Preview */}
        <div className="space-y-4">
          {/* Crabdeck Artifacts -> Drive Sync */}
          <div className="p-4 sm:p-5 rounded-2xl clay-card-3d border border-[#FFD700]/30 space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#FFD700]" />
              <h4 className="text-xs font-display font-extrabold text-white uppercase tracking-wider">
                Sync Specifications to Drive
              </h4>
            </div>

            <p className="text-xs text-zinc-300 font-hanken leading-relaxed">
              Export Crabdeck Quantum architecture specifications and sprint blueprints directly into your Google Drive as Markdown documents.
            </p>

            <button
              onClick={handleExportArtifactsToDrive}
              disabled={!accessToken || isExportingArtifacts}
              className="w-full py-2.5 px-3 rounded-xl clay-btn-purple font-code font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isExportingArtifacts ? 'Exporting...' : 'Export 14 Specs to Drive'}</span>
            </button>

            {exportStatus && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[10px] font-code text-emerald-300">
                {exportStatus}
              </div>
            )}
          </div>

          {/* File Content Preview Box */}
          {selectedFileContent && (
            <div className="p-4 rounded-2xl clay-card-3d border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-2">
                <span className="truncate max-w-[180px]">{selectedFileContent.name}</span>
                <button
                  onClick={() => setSelectedFileContent(null)}
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <pre className="text-[10px] font-mono text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap p-2 bg-black/50 rounded-lg">
                {selectedFileContent.content}
              </pre>
            </div>
          )}

          {/* Scope Compliance & Security Badge */}
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1.5 text-xs font-code">
            <div className="flex items-center gap-2 text-[#00FF66] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Security &amp; Consent Certified</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-hanken leading-relaxed">
              Tokens are held in-memory and cleared on sign-out. All destructive file mutations require explicit operator confirmation dialogs.
            </p>
          </div>
        </div>

      </div>

      {/* 4. MANDATORY EXPLICIT USER CONFIRMATION DIALOG FOR DESTRUCTIVE ACTIONS */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl clay-card-3d border-2 border-red-500/80 shadow-2xl space-y-4 bg-gradient-to-br from-[#1c0812] to-[#0a0407]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl clay-btn-red flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-display font-extrabold text-white">
                  Confirm Permanent Deletion
                </h3>
                <p className="text-[11px] text-red-300 font-code">
                  Mandatory Google Workspace Security Invariant
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-code space-y-1 text-zinc-300">
              <div>Are you sure you want to permanently delete this file from Google Drive?</div>
              <div className="font-bold text-white pt-1">
                File: <span className="text-[#FFD700]">{fileToDelete.name}</span>
              </div>
              <div className="text-[10px] text-zinc-500 truncate">
                ID: {fileToDelete.id}
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-hanken">
              This operation will permanently remove the file from your Google Drive storage. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-code text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl clay-btn-red font-code text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Deletion'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
