import React, { useState } from 'react';
import {
  Plus,
  Table,
  FlaskConical,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Assay, AssayDataPoint } from '../types';
import { AdvancedVisualizations } from './AdvancedVisualizations';

interface AssayManagerProps {
  assays: Assay[];
  onAddDataPoint: (assayId: string, point: AssayDataPoint) => void;
  onExportToSheets: (assay: Assay) => void;
}

export const AssayManager: React.FC<AssayManagerProps> = ({
  assays,
  onAddDataPoint,
  onExportToSheets,
}) => {
  const [selectedAssayId, setSelectedAssayId] = useState<string>(assays[0]?.id || '');
  const [showAddPointModal, setShowAddPointModal] = useState(false);
  const [newX, setNewX] = useState('');
  const [newY, setNewY] = useState('');
  const [newError, setNewError] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const activeAssay = assays.find((a) => a.id === selectedAssayId) || assays[0];

  const handleAddPointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newX || !newY) return;

    onAddDataPoint(activeAssay.id, {
      x: parseFloat(newX),
      y: parseFloat(newY),
      error: newError ? parseFloat(newError) : undefined,
      label: newLabel || `${newX} µM`,
    });

    setNewX('');
    setNewY('');
    setNewError('');
    setNewLabel('');
    setShowAddPointModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Assays Selector Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Quantitative Assay Datasets</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage biochemical measurements, microplate reads, and real-time kinetic curves.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportToSheets(activeAssay)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Sync to Google Sheets
            </button>
            <button
              onClick={() => setShowAddPointModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Data Point
            </button>
          </div>
        </div>

        {/* Assay Pills */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {assays.map((assay) => (
            <button
              key={assay.id}
              onClick={() => setSelectedAssayId(assay.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                assay.id === activeAssay?.id
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs font-semibold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              <span>{assay.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white font-mono text-slate-500 border border-slate-200">
                {assay.type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Visualizer */}
      <AdvancedVisualizations assays={assays} activeAssayId={activeAssay.id} />

      {/* Raw Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Measurement Matrix: {activeAssay.name}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {activeAssay.dataPoints?.length || 0} Data Points Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[11px]">
              <tr>
                <th className="px-5 py-2.5">#</th>
                <th className="px-5 py-2.5">Condition / Dose</th>
                <th className="px-5 py-2.5">X Value (Log / Min)</th>
                <th className="px-5 py-2.5">Response (Y)</th>
                <th className="px-5 py-2.5">Standard Error (±)</th>
                <th className="px-5 py-2.5">Series</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {(activeAssay.dataPoints || []).map((pt, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-2 text-slate-400">{idx + 1}</td>
                  <td className="px-5 py-2 font-sans font-medium text-slate-800">
                    {pt.label || `Point ${idx + 1}`}
                  </td>
                  <td className="px-5 py-2 text-blue-700 font-semibold">{pt.x}</td>
                  <td className="px-5 py-2 text-slate-900">{pt.y.toFixed(2)}</td>
                  <td className="px-5 py-2 text-slate-500">
                    {pt.error !== undefined ? `±${pt.error.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-5 py-2 text-slate-600 font-sans">
                    {pt.series || 'Primary Curve'}
                  </td>
                </tr>
              ))}
              {(!activeAssay.dataPoints || activeAssay.dataPoints.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-400 font-sans">
                    No discrete data points logged. This assay utilizes a 96-well grid.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Point Modal */}
      {showAddPointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Log New Assay Point</h3>
              <button
                onClick={() => setShowAddPointModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPointSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  X Coordinate (Log Dose or Minutes) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newX}
                  onChange={(e) => setNewX(e.target.value)}
                  placeholder="e.g. -7.5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Y Coordinate (Observed Response / OD) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newY}
                  onChange={(e) => setNewY(e.target.value)}
                  placeholder="e.g. 78.4"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Standard Error (SE / SD)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newError}
                  onChange={(e) => setNewError(e.target.value)}
                  placeholder="e.g. 1.2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Condition Label</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. 31.6 nM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPointModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Append Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
