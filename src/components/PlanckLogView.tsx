import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  Zap,
  Filter,
  Search,
  Download,
  Terminal,
  Activity,
  Layers,
  FlaskConical,
  HardDrive,
  Dna,
  Archive,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { PlanckLogEntry } from '../types';
import {
  subscribeToPlanckLogs,
  executeSimultaneousFacilityCascade,
  logApexAuthorizedAction,
  PLANCK_TIME_SECONDS,
} from '../lib/planckLogger';

export const PlanckLogView: React.FC = () => {
  const [logs, setLogs] = useState<PlanckLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [agentRoleFilter, setAgentRoleFilter] = useState<string>('all');
  const [precisionMode, setPrecisionMode] = useState<'planck' | 'nano' | 'milli' | 'second'>('planck');
  const [selectedEntry, setSelectedEntry] = useState<PlanckLogEntry | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPlanckLogs((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => unsubscribe();
  }, []);

  const handleTriggerSimultaneousCascade = () => {
    executeSimultaneousFacilityCascade();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `q_tracker_planck_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter((log) => {
    if (categoryFilter !== 'all' && log.facilityCategory !== categoryFilter) return false;
    if (agentRoleFilter !== 'all' && log.agentRole !== agentRoleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.facility.toLowerCase().includes(q) ||
      log.agentName.toLowerCase().includes(q) ||
      log.apexAuthToken.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  const getCategoryBadge = (cat: PlanckLogEntry['facilityCategory']) => {
    switch (cat) {
      case 'virtual_lab':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'assays':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'workspace':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'science_scout':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'civilization_archive':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'tasks':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatTimestampByPrecision = (log: PlanckLogEntry) => {
    switch (precisionMode) {
      case 'second':
        return log.secondTimestamp;
      case 'milli':
        return `${log.secondTimestamp}.${Math.floor(log.fractionalSeconds * 1000).toString().padStart(3, '0')}`;
      case 'nano':
        return `${log.secondTimestamp}.${log.subSecondNanoseconds.toString().padStart(9, '0')}`;
      case 'planck':
      default:
        return log.fullPlanckTimestamp;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Planck Scale Metrics */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/60 uppercase tracking-wider">
                Sub-Second Planck Resolution Ledger
              </span>
              <span className="text-xs text-slate-400 font-mono">
                t_P = 5.391247 × 10⁻⁴⁴ s • Apex Director Enforced
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Q Tracker Master Facility Audit & Planck Time Log Ledger
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Every operation across all Q Tracker facilities is validated by the Apex Director and cataloged down to fractional seconds and the Planck time scale when multiple operations take place simultaneously.
            </p>
          </div>

          {/* Precision Gauges */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400">APEX SIGNATURE</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% ENFORCED
              </div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400">FACILITIES AUTH</div>
              <div className="text-xs font-bold text-blue-700 font-mono">
                6 / 6 CONNECTED
              </div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400">PLANCK PRECISION</div>
              <div className="text-xs font-bold text-purple-700 font-mono">
                10⁻⁴⁴ SECONDS
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Simulator */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerSimultaneousCascade}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Trigger Multi-Facility Swarm Run (Sub-Second Planck Differentiation)
            </button>

            <span className="text-slate-400 hidden sm:inline">|</span>

            {/* Precision Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[11px] font-mono">
              <span className="text-slate-500 px-1 font-sans">Precision:</span>
              <button
                onClick={() => setPrecisionMode('second')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  precisionMode === 'second' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                1s
              </button>
              <button
                onClick={() => setPrecisionMode('milli')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  precisionMode === 'milli' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                ms (10⁻³)
              </button>
              <button
                onClick={() => setPrecisionMode('nano')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  precisionMode === 'nano' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                ns (10⁻⁹)
              </button>
              <button
                onClick={() => setPrecisionMode('planck')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  precisionMode === 'planck' ? 'bg-indigo-600 text-white font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Planck Scale (t_P)
              </button>
            </div>
          </div>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Ledger (JSON)
          </button>
        </div>
      </div>

      {/* Main Log Table & Live Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search action, facility, agent, or AUTH-APEX token..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-xs"
            >
              <option value="all">All Facilities (6/6)</option>
              <option value="virtual_lab">Virtual Lab Apparatus</option>
              <option value="assays">Assays & Calculations</option>
              <option value="workspace">Google Workspace</option>
              <option value="science_scout">Science Scout & 3D</option>
              <option value="civilization_archive">Civilization Archive</option>
            </select>

            <select
              value={agentRoleFilter}
              onChange={(e) => setAgentRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-xs"
            >
              <option value="all">All Agent Tiers</option>
              <option value="apex_director">Apex Director Only</option>
              <option value="primary_agent">Primary Agents</option>
              <option value="subagent">Sub-Agents</option>
            </select>
          </div>
        </div>

        {/* The Planck Log Ledger Stream */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Planck Time Coordinate</th>
                <th className="px-4 py-2.5">Q Facility Target</th>
                <th className="px-4 py-2.5">Requesting Agent</th>
                <th className="px-4 py-2.5">Authorized Action</th>
                <th className="px-4 py-2.5">Apex Auth Token</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedEntry(log)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  {/* Timestamp */}
                  <td className="px-4 py-2.5 whitespace-nowrap text-indigo-950 font-bold">
                    <span className="text-slate-500 font-normal">
                      {log.secondTimestamp.split(' ')[0]}{' '}
                    </span>
                    <span className="text-slate-800">
                      {log.secondTimestamp.split(' ')[1]}
                    </span>
                    {precisionMode !== 'second' && (
                      <span className="text-indigo-600">
                        .{log.subSecondNanoseconds.toString().padStart(9, '0')}
                      </span>
                    )}
                    {precisionMode === 'planck' && (
                      <span className="ml-1 text-[10px] px-1 py-0.2 bg-purple-50 text-purple-700 rounded border border-purple-200">
                        +Δt_P: {log.planckOffset}
                      </span>
                    )}
                  </td>

                  {/* Facility */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadge(log.facilityCategory)}`}>
                      {log.facility}
                    </span>
                  </td>

                  {/* Agent */}
                  <td className="px-4 py-2.5 whitespace-nowrap font-sans font-medium text-slate-800">
                    <span className="truncate max-w-[160px] block" title={log.agentName}>
                      {log.agentName}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-2.5 font-sans text-slate-700">
                    <div className="font-semibold text-slate-900 line-clamp-1">{log.action}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{log.details}</div>
                  </td>

                  {/* Apex Token */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-emerald-400 rounded text-[10px] font-mono tracking-tight font-bold">
                      {log.apexAuthToken}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No log records matching filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal / Inspector when clicked */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Apex Director Authorization Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono">
              <div className="p-3 bg-slate-900 text-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-400">PLANCK TIME COORDINATE</div>
                <div className="text-emerald-400 font-bold text-xs">
                  {selectedEntry.fullPlanckTimestamp}
                </div>
                <div className="text-[10px] text-purple-300">
                  Planck Units: {selectedEntry.planckUnits}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[10px]">TARGET FACILITY</span>
                  <span className="font-bold text-slate-900">{selectedEntry.facility}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[10px]">APEX AUTH TOKEN</span>
                  <span className="font-bold text-blue-700">{selectedEntry.apexAuthToken}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[10px]">REQUESTING AGENT</span>
                  <span className="font-bold text-slate-900">{selectedEntry.agentName}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[10px]">STATUS</span>
                  <span className="font-bold text-emerald-600">{selectedEntry.status}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1 font-sans">
                <div className="text-xs font-bold text-slate-900">{selectedEntry.action}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{selectedEntry.details}</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
