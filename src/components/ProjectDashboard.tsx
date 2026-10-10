import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  FlaskConical,
  Users,
  Activity,
  ArrowUpRight,
  Eye,
  EyeOff,
  Sparkles,
  Mail,
} from 'lucide-react';
import { Project, Task, Assay, DashboardWidgetConfig, LiveActivity } from '../types';
import { AdvancedVisualizations } from './AdvancedVisualizations';
import { TaskKanbanView } from './TaskKanbanView';

interface ProjectDashboardProps {
  project: Project;
  tasks: Task[];
  assays: Assay[];
  activities: LiveActivity[];
  widgets: DashboardWidgetConfig[];
  onUpdateWidgets: (newWidgets: DashboardWidgetConfig[]) => void;
  onNavigateTab: (tab: 'dashboard' | 'virtuallab' | 'swarm' | 'logs' | 'tasks' | 'assays' | 'science' | 'workspace' | 'ai') => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onOpenDailyDigest?: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  project,
  tasks,
  assays,
  activities,
  widgets,
  onUpdateWidgets,
  onNavigateTab,
  onUpdateTaskStatus,
  onOpenDailyDigest,
}) => {
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const toggleWidget = (widgetId: string) => {
    const updated = widgets.map((w) =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    onUpdateWidgets(updated);
  };

  const isVisible = (id: string) => widgets.find((w) => w.id === id)?.visible ?? true;

  return (
    <div className="space-y-6">
      {/* Top Project Banner & Customization Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
                {project.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {project.id}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-xs text-slate-500 font-medium">Lead: {project.lead}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{project.title}</h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onOpenDailyDigest && (
              <button
                onClick={onOpenDailyDigest}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <span>Daily Digest</span>
                <span className="px-1.5 py-0.2 bg-purple-200/70 text-purple-800 rounded text-[10px] font-mono">
                  Gemini
                </span>
              </button>
            )}
            <button
              onClick={() => setShowCustomizeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              Customize Widgets
            </button>
            <button
              onClick={() => onNavigateTab('ai')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Protocol Scout
            </button>
          </div>
        </div>
      </div>

      {/* Widget 1: Laboratory KPI Summary */}
      {isVisible('w-kpi') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Task Completion</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">{completionRate}%</span>
              <span className="text-xs text-slate-400 font-mono">({completedTasks}/{tasks.length})</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Active Assays</span>
              <FlaskConical className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">{assays.length}</span>
              <span className="text-xs text-slate-500">Validated</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 truncate">
              Primary IC50: <span className="font-mono font-bold text-blue-600">4.82 nM</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Collaborators</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {project.collaborators?.length || 3}
              </span>
              <span className="text-xs text-emerald-600 font-medium">3 Active Now</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 truncate font-mono">
              Live Real-Time Sync
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>In-Progress Protocols</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900">{inProgressTasks}</span>
              <span className="text-xs text-amber-600 font-medium">Active Runs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 truncate">
              Next: Plate Reader Run #4
            </p>
          </div>
        </div>
      )}

      {/* Widget 2: Advanced Scientific Visualizations */}
      {(isVisible('w-scatter') || isVisible('w-kinetics') || isVisible('w-heatmap')) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Assay Data Visualizer
            </h2>
            <button
              onClick={() => onNavigateTab('assays')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              View Full Assays & Tables <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <AdvancedVisualizations assays={assays} />
        </div>
      )}

      {/* Widget 3: Task & Protocol Workflow Visualization */}
      {isVisible('w-workflow') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Protocol Task Workflow
            </h2>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              Open Full Kanban Board <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <TaskKanbanView
            tasks={tasks}
            projectId={project.id}
            onUpdateStatus={onUpdateTaskStatus}
            compact={true}
          />
        </div>
      )}

      {/* Widget 4: Live Activity Log */}
      {isVisible('w-activity') && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Live Collaborator Real-Time Stream
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {onOpenDailyDigest && (
                <button
                  onClick={onOpenDailyDigest}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Synthesize Daily Digest</span>
                </button>
              )}
              <span className="text-xs text-slate-400 font-mono">Synchronized with Firestore</span>
            </div>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-semibold text-[11px]">
                    {act.userName[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">{act.userName}</span>{' '}
                    <span className="text-slate-600">{act.action}</span>{' '}
                    <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                      {act.target}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-mono">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customize Dashboard Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Customize Personal Dashboard</h3>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-4">
              Toggle which widgets and key performance indicators appear on your active project dashboard.
            </p>

            <div className="space-y-2.5">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <span className="font-medium text-slate-800">{widget.title}</span>
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      widget.visible
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {widget.visible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hidden
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
