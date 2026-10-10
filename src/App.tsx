import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutAuth,
  subscribeToProjects,
  subscribeToTasks,
  subscribeToAssays,
  saveProject,
  saveTask,
  updateTaskStatus,
  saveAssay,
  testFirestoreConnection,
  SEED_PROJECTS,
  DEFAULT_WIDGETS,
  SEED_ACTIVITIES,
} from './lib/firebase';
import { Project, Task, Assay, DashboardWidgetConfig, LiveActivity, AssayDataPoint } from './types';
import { Navigation } from './components/Navigation';
import { ProjectDashboard } from './components/ProjectDashboard';
import { TaskKanbanView } from './components/TaskKanbanView';
import { AssayManager } from './components/AssayManager';
import { ScienceScout } from './components/ScienceScout';
import { WorkspaceHub } from './components/WorkspaceHub';
import { AILabAssistant } from './components/AILabAssistant';
import { VirtualLab } from './components/VirtualLab';
import { AgentSwarmView } from './components/AgentSwarmView';
import { PlanckLogView } from './components/PlanckLogView';
import { DailyResearchDigestModal } from './components/DailyResearchDigestModal';
import { createAssaySpreadsheet, createGoogleTask } from './lib/workspace';
import { subscribeToPlanckLogs } from './lib/planckLogger';
import { PlanckLogEntry } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'virtuallab' | 'swarm' | 'logs' | 'tasks' | 'assays' | 'science' | 'workspace' | 'ai'>('dashboard');

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Real-Time Data State
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project>(SEED_PROJECTS[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assays, setAssays] = useState<Assay[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_WIDGETS);
  const [activities, setActivities] = useState<LiveActivity[]>(SEED_ACTIVITIES);
  const [planckLogs, setPlanckLogs] = useState<PlanckLogEntry[]>([]);

  // Daily Research Digest Modal State
  const [showDailyDigestModal, setShowDailyDigestModal] = useState(false);

  // New Project Modal State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjCategory, setNewProjCategory] = useState<Project['category']>('Structural Biology');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLead, setNewProjLead] = useState('Dr. Elena Rostova');

  // Verify Firestore connection & setup Auth on mount
  useEffect(() => {
    testFirestoreConnection();

    initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
  }, []);

  // Subscribe to Projects in Real-Time
  useEffect(() => {
    const unsubscribe = subscribeToProjects((updatedProjects) => {
      setProjects(updatedProjects);
      // If current selected project is still in list, keep it; else set to first
      setSelectedProject((prev) => {
        const found = updatedProjects.find((p) => p.id === prev.id);
        return found || updatedProjects[0] || prev;
      });
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Tasks for current project
  useEffect(() => {
    if (!selectedProject?.id) return;
    const unsubscribe = subscribeToTasks(selectedProject.id, (updatedTasks) => {
      setTasks(updatedTasks);
    });
    return () => unsubscribe();
  }, [selectedProject.id]);

  // Subscribe to Assays for current project
  useEffect(() => {
    if (!selectedProject?.id) return;
    const unsubscribe = subscribeToAssays(selectedProject.id, (updatedAssays) => {
      setAssays(updatedAssays);
    });
    return () => unsubscribe();
  }, [selectedProject.id]);

  // Subscribe to Planck Logs
  useEffect(() => {
    const unsubscribe = subscribeToPlanckLogs((logs) => {
      setPlanckLogs(logs);
    });
    return () => unsubscribe();
  }, []);

  // Auth Handlers
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAuth();
    setUser(null);
    setAccessToken(null);
  };

  // Data Actions
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: newProjTitle.trim(),
      category: newProjCategory,
      description: newProjDesc.trim() || 'Biochemical protocol and experimental assay campaign.',
      lead: newProjLead,
      leadEmail: user?.email || 'scientist@lab.edu',
      status: 'active',
      collaborators: [newProjLead, 'Dr. Elena Rostova'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProject(newProj);
    setSelectedProject(newProj);
    setShowNewProjectModal(false);
    setNewProjTitle('');
    setNewProjDesc('');

    // Append to live activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        projectId: newProj.id,
        userId: user?.uid || 'user-local',
        userName: user?.displayName || newProjLead,
        action: 'created research project',
        target: newProj.title,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    await updateTaskStatus(selectedProject.id, taskId, status);
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    // Live activity update
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        projectId: selectedProject.id,
        userId: user?.uid || 'user-local',
        userName: user?.displayName || 'Dr. Elena Rostova',
        action: `updated protocol status to ${status}`,
        target: tasks.find((t) => t.id === taskId)?.title || 'Task',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: selectedProject.id,
      title: taskData.title || 'Untitled Protocol Task',
      description: taskData.description || '',
      status: taskData.status || 'backlog',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || 'Dr. Elena Rostova',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      protocolStep: taskData.protocolStep || 'Protocol Phase',
      tags: taskData.tags || ['General'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveTask(newTask);
    setTasks((prev) => [...prev, newTask]);
  };

  const handleAddDataPoint = async (assayId: string, point: AssayDataPoint) => {
    const targetAssay = assays.find((a) => a.id === assayId);
    if (!targetAssay) return;

    const updatedAssay: Assay = {
      ...targetAssay,
      dataPoints: [...(targetAssay.dataPoints || []), point],
      updatedAt: new Date().toISOString(),
    };

    await saveAssay(updatedAssay);
    setAssays((prev) => prev.map((a) => (a.id === assayId ? updatedAssay : a)));

    // Log live activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        projectId: selectedProject.id,
        userId: user?.uid || 'user-local',
        userName: user?.displayName || 'M. Thorne',
        action: `logged measurement point (X=${point.x}, Y=${point.y})`,
        target: targetAssay.name,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  const handlePushToGoogleTasks = async (task: Task) => {
    if (!accessToken) {
      handleLogin();
      return;
    }
    try {
      await createGoogleTask(accessToken, task.title, `${task.protocolStep} • Assigned to ${task.assignee}`, task.dueDate);
      alert(`Task "${task.title}" synced to your Google Tasks!`);
    } catch (err: any) {
      alert(`Google Tasks sync error: ${err.message}`);
    }
  };

  const handleExportAssayToSheets = async (assay: Assay) => {
    if (!accessToken) {
      handleLogin();
      return;
    }
    try {
      const res = await createAssaySpreadsheet(accessToken, assay, selectedProject.title);
      alert(`Assay spreadsheet created in Google Sheets! ID: ${res.spreadsheetId}`);
    } catch (err: any) {
      alert(`Google Sheets export error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Laboratory Navigation Header */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onNewProject={() => setShowNewProjectModal(true)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        syncStatus="synced"
        onOpenDailyDigest={() => setShowDailyDigestModal(true)}
      />

      {/* Main Workbench Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <ProjectDashboard
            project={selectedProject}
            tasks={tasks}
            assays={assays}
            activities={activities}
            widgets={widgets}
            onUpdateWidgets={setWidgets}
            onNavigateTab={setCurrentTab}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onOpenDailyDigest={() => setShowDailyDigestModal(true)}
          />
        )}

        {currentTab === 'virtuallab' && (
          <VirtualLab />
        )}

        {currentTab === 'swarm' && (
          <AgentSwarmView />
        )}

        {currentTab === 'logs' && (
          <PlanckLogView />
        )}

        {currentTab === 'tasks' && (
          <TaskKanbanView
            tasks={tasks}
            projectId={selectedProject.id}
            onUpdateStatus={handleUpdateTaskStatus}
            onAddTask={handleAddTask}
            onPushToGoogleTasks={handlePushToGoogleTasks}
            compact={false}
          />
        )}

        {currentTab === 'assays' && (
          <AssayManager
            assays={assays}
            onAddDataPoint={handleAddDataPoint}
            onExportToSheets={handleExportAssayToSheets}
          />
        )}

        {currentTab === 'science' && <ScienceScout />}

        {currentTab === 'workspace' && (
          <WorkspaceHub
            project={selectedProject}
            tasks={tasks}
            assays={assays}
            user={user}
            accessToken={accessToken}
            onLogin={handleLogin}
            onOpenDailyDigest={() => setShowDailyDigestModal(true)}
          />
        )}

        {currentTab === 'ai' && <AILabAssistant />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Q Tracker</span>
            <span>•</span>
            <span>Virtual Laboratory for Real-Time Scientific Research Data</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>DB: ai-studio-qtracker</span>
            <span>•</span>
            <span>Google Workspace OAuth 2.0</span>
          </div>
        </div>
      </footer>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Create Research Project</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  placeholder="e.g. Cryo-EM Characterization of KRAS G12D"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Scientific Domain</label>
                <select
                  value={newProjCategory}
                  onChange={(e) => setNewProjCategory(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Structural Biology">Structural Biology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Genomics">Genomics</option>
                  <option value="Pharmacology">Pharmacology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Synthetic Biology">Synthetic Biology</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Lead Investigator</label>
                <input
                  type="text"
                  value={newProjLead}
                  onChange={(e) => setNewProjLead(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Research Abstract</label>
                <textarea
                  rows={3}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Objective, target assay endpoints, experimental models..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Research Digest Modal */}
      {showDailyDigestModal && (
        <DailyResearchDigestModal
          isOpen={showDailyDigestModal}
          onClose={() => setShowDailyDigestModal(false)}
          project={selectedProject}
          tasks={tasks}
          activities={activities}
          planckLogs={planckLogs}
          user={user}
          accessToken={accessToken}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
