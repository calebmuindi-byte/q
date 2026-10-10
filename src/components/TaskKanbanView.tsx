import React, { useState } from 'react';
import {
  Plus,
  Clock,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ArrowRight,
  Send,
  Calendar,
} from 'lucide-react';
import { Task } from '../types';

interface TaskKanbanViewProps {
  tasks: Task[];
  projectId: string;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onAddTask?: (task: Partial<Task>) => void;
  onPushToGoogleTasks?: (task: Task) => void;
  compact?: boolean;
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  projectId,
  onUpdateStatus,
  onAddTask,
  onPushToGoogleTasks,
  compact = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProtocolStep, setNewProtocolStep] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [newAssignee, setNewAssignee] = useState('Dr. Elena Rostova');
  const [newDueDate, setNewDueDate] = useState('');

  const columns: { id: Task['status']; title: string; color: string }[] = [
    { id: 'backlog', title: 'Protocol Backlog', color: 'border-slate-300' },
    { id: 'in_progress', title: 'Active Runs / In-Progress', color: 'border-blue-500' },
    { id: 'review', title: 'Peer & QC Review', color: 'border-amber-500' },
    { id: 'completed', title: 'Validated & Archived', color: 'border-emerald-500' },
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (onAddTask) {
      onAddTask({
        projectId,
        title: newTitle.trim(),
        description: newDesc.trim(),
        protocolStep: newProtocolStep.trim() || 'General Protocol',
        priority: newPriority,
        status: 'backlog',
        assignee: newAssignee,
        dueDate: newDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        tags: ['Lab Protocol'],
      });
    }

    setNewTitle('');
    setNewDesc('');
    setNewProtocolStep('');
    setShowAddModal(false);
  };

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action header for full view */}
      {!compact && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Laboratory Workflow Board</h2>
            <p className="text-xs text-slate-500">
              Interactive real-time task visualization across all experimental milestones.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Protocol Task
          </button>
        </div>
      )}

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-50/80 rounded-xl border border-slate-200 p-3 flex flex-col min-h-[300px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.color.replace('border', 'bg')}`} />
                  <span className="text-xs font-semibold text-slate-800">{col.title}</span>
                </div>
                <span className="px-1.5 py-0.2 bg-white text-slate-600 rounded text-[11px] font-mono border border-slate-200">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[520px]">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all group"
                  >
                    {/* Header: Priority & Protocol Step */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      {task.protocolStep && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[140px] font-mono">
                          {task.protocolStep}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>

                    {/* Metadata Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 truncate max-w-[110px]">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>

                    {/* Quick Move Status Buttons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 opacity-90 group-hover:opacity-100">
                      <div className="flex items-center gap-1">
                        {col.id !== 'backlog' && (
                          <button
                            onClick={() => {
                              const prev =
                                col.id === 'completed'
                                  ? 'review'
                                  : col.id === 'review'
                                  ? 'in_progress'
                                  : 'backlog';
                              onUpdateStatus(task.id, prev);
                            }}
                            className="text-[10px] text-slate-500 hover:text-slate-800 px-1 py-0.5 rounded hover:bg-slate-100"
                            title="Move back"
                          >
                            ← Prev
                          </button>
                        )}
                        {col.id !== 'completed' && (
                          <button
                            onClick={() => {
                              const next =
                                col.id === 'backlog'
                                  ? 'in_progress'
                                  : col.id === 'in_progress'
                                  ? 'review'
                                  : 'completed';
                              onUpdateStatus(task.id, next);
                            }}
                            className="text-[10px] font-medium text-blue-600 hover:text-blue-700 px-1 py-0.5 rounded hover:bg-blue-50"
                            title="Advance status"
                          >
                            Next →
                          </button>
                        )}
                      </div>

                      {onPushToGoogleTasks && (
                        <button
                          onClick={() => onPushToGoogleTasks(task)}
                          className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-0.5"
                          title="Sync to Google Tasks"
                        >
                          <Send className="w-2.5 h-2.5" /> G-Tasks
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    No protocols in this lane
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Create Protocol Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Plate Reader Readout Run #5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Protocol Step / Method</label>
                <input
                  type="text"
                  value={newProtocolStep}
                  onChange={(e) => setNewProtocolStep(e.target.value)}
                  placeholder="e.g. Phase 3: Fluorometry"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Experimental instructions, dilution concentrations, or reagent lot..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Dr. Elena Rostova">Dr. Elena Rostova</option>
                    <option value="K. Takahashi, Ph.D.">K. Takahashi, Ph.D.</option>
                    <option value="M. Thorne (Lab Tech)">M. Thorne (Lab Tech)</option>
                    <option value="Sarah Lin, M.D.">Sarah Lin, M.D.</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
