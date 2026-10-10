import React from 'react';
import { User } from 'firebase/auth';
import {
  Activity,
  Layers,
  FlaskConical,
  Dna,
  Share2,
  Sparkles,
  ChevronDown,
  Plus,
  Radio,
  LogOut,
  FolderGit2,
  Network,
  Clock,
  Mail,
} from 'lucide-react';
import { Project } from '../types';

interface NavigationProps {
  currentTab: 'dashboard' | 'virtuallab' | 'swarm' | 'logs' | 'tasks' | 'assays' | 'science' | 'workspace' | 'ai';
  onSelectTab: (tab: 'dashboard' | 'virtuallab' | 'swarm' | 'logs' | 'tasks' | 'assays' | 'science' | 'workspace' | 'ai') => void;
  projects: Project[];
  selectedProject: Project;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  onOpenDailyDigest?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  projects,
  selectedProject,
  onSelectProject,
  onNewProject,
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  syncStatus,
  onOpenDailyDigest,
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Project Selector */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <span className="font-serif font-bold text-lg tracking-wider">Q</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 tracking-tight">Q Tracker</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded-sm border border-blue-200/60 uppercase">
                    Virtual Lab
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-none">Real-Time Scientific Workbench</p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* Project Selector */}
            <div className="relative">
              <button
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors max-w-[260px]"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{selectedProject.title}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
              </button>

              {projectDropdownOpen && (
                <div className="absolute left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Active Project
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          onSelectProject(proj);
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex flex-col gap-0.5 ${
                          proj.id === selectedProject.id ? 'bg-blue-50/60 text-blue-900 font-medium' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{proj.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{proj.category}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate">{proj.lead}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        setProjectDropdownOpen(false);
                        onNewProject();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50/60 rounded-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Research Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              onClick={() => onSelectTab('virtuallab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'virtuallab'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Virtual Lab
            </button>

            <button
              onClick={() => onSelectTab('swarm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'swarm'
                  ? 'bg-purple-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-purple-400" />
              Agent Swarm
            </button>

            <button
              onClick={() => onSelectTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'logs'
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Planck Logs
            </button>

            <button
              onClick={() => onSelectTab('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'tasks'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Tasks & Workflow
            </button>

            <button
              onClick={() => onSelectTab('assays')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'assays'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Assays & Data
            </button>

            <button
              onClick={() => onSelectTab('science')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'science'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Dna className="w-3.5 h-3.5" />
              Science Scout & 3D
            </button>

            <button
              onClick={() => onSelectTab('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'workspace'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Google Workspace
            </button>

            <button
              onClick={() => onSelectTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentTab === 'ai'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              AI Lab Assistant
            </button>
          </nav>

          {/* Right Status & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Daily Research Digest Trigger */}
            {onOpenDailyDigest && (
              <button
                onClick={onOpenDailyDigest}
                title="Synthesize and transmit Daily Research Digest via Gemini & Gmail"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">Daily Digest</span>
              </button>
            )}

            {/* Real-Time Sync Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Firestore Sync: Live</span>
            </div>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 pl-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-semibold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-medium text-slate-800 leading-none truncate max-w-[120px]">
                      {user.displayName || 'Scientist'}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-none truncate max-w-[120px] mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'virtuallab', label: 'Virtual Lab', icon: FlaskConical },
            { id: 'swarm', label: 'Agent Swarm', icon: Network },
            { id: 'logs', label: 'Planck Logs', icon: Clock },
            { id: 'tasks', label: 'Tasks', icon: Layers },
            { id: 'assays', label: 'Assays', icon: FlaskConical },
            { id: 'science', label: 'Science 3D', icon: Dna },
            { id: 'workspace', label: 'Workspace', icon: Share2 },
            { id: 'ai', label: 'AI Studio', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as any)}
                className={`flex items-center gap-1 px-3 py-1 text-xs whitespace-nowrap rounded-md ${
                  currentTab === item.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
