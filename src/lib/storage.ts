import { Project, Task, Assay, DashboardWidgetConfig, LiveActivity, PlanckLogEntry } from '../types';
import { SwarmState, INITIAL_SWARM_STATE } from './agentSwarmEngine';
import {
  SEED_PROJECTS,
  SEED_TASKS,
  SEED_ASSAYS,
  DEFAULT_WIDGETS,
  SEED_ACTIVITIES,
} from './firebase';
import { INITIAL_PLANCK_LOGS } from './planckLogger';

export interface QTrackerPersistedState {
  projects: Project[];
  tasks: Task[];
  assays: Assay[];
  activities: LiveActivity[];
  planckLogs: PlanckLogEntry[];
  swarmState: SwarmState;
  swarmConsoleLogs: string[];
  widgets: DashboardWidgetConfig[];
  selectedProjectId?: string;
  lastUpdated: string;
}

const STORAGE_KEYS = {
  STATE: 'qtracker_full_state_v1',
  PROJECTS: 'qtracker_projects_v1',
  TASKS: 'qtracker_tasks_v1',
  ASSAYS: 'qtracker_assays_v1',
  ACTIVITIES: 'qtracker_activities_v1',
  PLANCK_LOGS: 'qtracker_planck_logs_v1',
  SWARM_STATE: 'qtracker_swarm_state_v1',
  SWARM_CONSOLE: 'qtracker_swarm_console_v1',
  WIDGETS: 'qtracker_widgets_v1',
  SELECTED_PROJECT_ID: 'qtracker_selected_proj_id_v1',
};

// Default seed state
export function getDefaultState(): QTrackerPersistedState {
  return {
    projects: [...SEED_PROJECTS],
    tasks: [...SEED_TASKS],
    assays: [...SEED_ASSAYS],
    activities: [...SEED_ACTIVITIES],
    planckLogs: [...INITIAL_PLANCK_LOGS],
    swarmState: { ...INITIAL_SWARM_STATE },
    swarmConsoleLogs: [
      '[Apex Director] Initialized Omniscience Civilization Archive (3500 BCE - 2026 CE).',
      '[Apex Director] Autonomous multi-agent hierarchy daemon active.',
      '[System] Ready to accept research workloads with recursive sub-agent scaling.',
    ],
    widgets: [...DEFAULT_WIDGETS],
    selectedProjectId: SEED_PROJECTS[0]?.id || 'proj-egfr-01',
    lastUpdated: new Date().toISOString(),
  };
}

// In-Memory cache of persistent state
let memoryState: QTrackerPersistedState = (() => {
  if (typeof window === 'undefined') {
    return getDefaultState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse state from localStorage:', err);
  }
  return getDefaultState();
})();

// Listeners for reactive updates
type StateListener = (state: QTrackerPersistedState) => void;
const listeners = new Set<StateListener>();

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb(memoryState);
    } catch (e) {
      console.error('Error in storage listener:', e);
    }
  });
}

// Save in-memory state to localStorage and asynchronously to server disk file
export function persistStateLocally(partial?: Partial<QTrackerPersistedState>) {
  if (partial) {
    memoryState = {
      ...memoryState,
      ...partial,
      lastUpdated: new Date().toISOString(),
    };
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(memoryState));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(memoryState.projects));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(memoryState.tasks));
      localStorage.setItem(STORAGE_KEYS.ASSAYS, JSON.stringify(memoryState.assays));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(memoryState.activities));
      localStorage.setItem(STORAGE_KEYS.PLANCK_LOGS, JSON.stringify(memoryState.planckLogs));
      localStorage.setItem(STORAGE_KEYS.SWARM_STATE, JSON.stringify(memoryState.swarmState));
      localStorage.setItem(STORAGE_KEYS.SWARM_CONSOLE, JSON.stringify(memoryState.swarmConsoleLogs));
      localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(memoryState.widgets));
      if (memoryState.selectedProjectId) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, memoryState.selectedProjectId);
      }
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }

  notifyListeners();
  syncToServerDisk();
}

// Debounced sync to Server API / disk
let serverSyncTimer: any = null;
export function syncToServerDisk() {
  if (typeof window === 'undefined') return;
  if (serverSyncTimer) clearTimeout(serverSyncTimer);

  serverSyncTimer = setTimeout(async () => {
    try {
      await fetch('/api/storage/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memoryState),
      });
    } catch (err) {
      // Offline or network error - localStorage holds state safely
      console.warn('Server disk sync deferred (offline/busy):', err);
    }
  }, 350);
}

// Initial hydration from Server disk file
let isHydratedFromServer = false;
export async function hydrateFromServer(): Promise<QTrackerPersistedState> {
  if (typeof window === 'undefined') return memoryState;
  try {
    const res = await fetch('/api/storage/state');
    if (res.ok) {
      const serverState = await res.json();
      if (serverState && Array.isArray(serverState.projects) && serverState.projects.length > 0) {
        // Compare timestamps: if server state has data, reconcile
        const serverTime = new Date(serverState.lastUpdated || 0).getTime();
        const localTime = new Date(memoryState.lastUpdated || 0).getTime();

        if (serverTime >= localTime || !localStorage.getItem(STORAGE_KEYS.STATE)) {
          memoryState = {
            ...serverState,
            projects: serverState.projects || memoryState.projects,
            tasks: serverState.tasks || memoryState.tasks,
            assays: serverState.assays || memoryState.assays,
            activities: serverState.activities || memoryState.activities,
            planckLogs: serverState.planckLogs || memoryState.planckLogs,
            swarmState: serverState.swarmState || memoryState.swarmState,
            swarmConsoleLogs: serverState.swarmConsoleLogs || memoryState.swarmConsoleLogs,
            widgets: serverState.widgets || memoryState.widgets,
            selectedProjectId: serverState.selectedProjectId || memoryState.selectedProjectId,
          };
          persistStateLocally();
        } else {
          // Local storage is newer, push to server disk
          syncToServerDisk();
        }
      }
    }
  } catch (err) {
    console.warn('Could not reach /api/storage/state on boot, using localStorage cache:', err);
  }
  isHydratedFromServer = true;
  return memoryState;
}

// Auto-run hydration on load in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    hydrateFromServer();
  }, 100);
}

// Subscription helper
export function subscribeToFullState(callback: StateListener): () => void {
  listeners.add(callback);
  callback(memoryState);
  return () => {
    listeners.delete(callback);
  };
}

// --- Projects ---
export function getStoredProjects(): Project[] {
  return memoryState.projects;
}

export function saveStoredProject(project: Project) {
  const existingIndex = memoryState.projects.findIndex((p) => p.id === project.id);
  let updated: Project[];
  if (existingIndex >= 0) {
    updated = [...memoryState.projects];
    updated[existingIndex] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    updated = [project, ...memoryState.projects];
  }
  persistStateLocally({ projects: updated, selectedProjectId: project.id });
}

export function deleteStoredProject(projectId: string) {
  const updatedProjects = memoryState.projects.filter((p) => p.id !== projectId);
  const updatedTasks = memoryState.tasks.filter((t) => t.projectId !== projectId);
  const updatedAssays = memoryState.assays.filter((a) => a.projectId !== projectId);
  const nextSelectedId = updatedProjects[0]?.id || '';
  persistStateLocally({
    projects: updatedProjects,
    tasks: updatedTasks,
    assays: updatedAssays,
    selectedProjectId: nextSelectedId,
  });
}

// --- Tasks ---
export function getStoredTasks(projectId?: string): Task[] {
  if (!projectId) return memoryState.tasks;
  return memoryState.tasks.filter((t) => t.projectId === projectId);
}

export function saveStoredTask(task: Task) {
  const index = memoryState.tasks.findIndex((t) => t.id === task.id);
  let updated: Task[];
  if (index >= 0) {
    updated = [...memoryState.tasks];
    updated[index] = { ...task, updatedAt: new Date().toISOString() };
  } else {
    updated = [...memoryState.tasks, task];
  }
  persistStateLocally({ tasks: updated });
}

export function updateStoredTaskStatus(projectId: string, taskId: string, status: Task['status']) {
  const updated = memoryState.tasks.map((t) => {
    if (t.id === taskId) {
      return { ...t, status, updatedAt: new Date().toISOString() };
    }
    return t;
  });
  persistStateLocally({ tasks: updated });
}

export function deleteStoredTask(projectId: string, taskId: string) {
  const updated = memoryState.tasks.filter((t) => !(t.projectId === projectId && t.id === taskId));
  persistStateLocally({ tasks: updated });
}

// --- Assays ---
export function getStoredAssays(projectId?: string): Assay[] {
  if (!projectId) return memoryState.assays;
  return memoryState.assays.filter((a) => a.projectId === projectId);
}

export function saveStoredAssay(assay: Assay) {
  const index = memoryState.assays.findIndex((a) => a.id === assay.id);
  let updated: Assay[];
  if (index >= 0) {
    updated = [...memoryState.assays];
    updated[index] = { ...assay, updatedAt: new Date().toISOString() };
  } else {
    updated = [...memoryState.assays, assay];
  }
  persistStateLocally({ assays: updated });
}

// --- Activities ---
export function getStoredActivities(): LiveActivity[] {
  return memoryState.activities;
}

export function addStoredActivity(activity: LiveActivity) {
  const updated = [activity, ...memoryState.activities].slice(0, 100); // keep up to 100 recent
  persistStateLocally({ activities: updated });
}

// --- Planck Logs ---
export function getStoredPlanckLogs(): PlanckLogEntry[] {
  return memoryState.planckLogs;
}

export function addStoredPlanckLog(entry: PlanckLogEntry) {
  const updated = [entry, ...memoryState.planckLogs].slice(0, 500); // keep up to 500 recent
  persistStateLocally({ planckLogs: updated });
}

export function addStoredPlanckLogsBatch(entries: PlanckLogEntry[]) {
  const updated = [...entries, ...memoryState.planckLogs].slice(0, 500);
  persistStateLocally({ planckLogs: updated });
}

// --- Swarm State & Console ---
export function getStoredSwarmState(): SwarmState {
  return memoryState.swarmState;
}

export function getStoredSwarmConsoleLogs(): string[] {
  return memoryState.swarmConsoleLogs;
}

export function saveStoredSwarmState(swarmState: SwarmState, consoleLogs?: string[]) {
  persistStateLocally({
    swarmState,
    ...(consoleLogs ? { swarmConsoleLogs: consoleLogs } : {}),
  });
}

// --- Widgets ---
export function getStoredWidgets(): DashboardWidgetConfig[] {
  return memoryState.widgets;
}

export function saveStoredWidgets(widgets: DashboardWidgetConfig[]) {
  persistStateLocally({ widgets });
}

// --- Selected Project ID ---
export function getStoredSelectedProjectId(): string | undefined {
  return memoryState.selectedProjectId;
}

export function saveStoredSelectedProjectId(projectId: string) {
  persistStateLocally({ selectedProjectId: projectId });
}
