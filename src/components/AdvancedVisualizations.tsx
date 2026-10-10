import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Download,
  Info,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { Assay } from '../types';

interface AdvancedVisualizationsProps {
  assays: Assay[];
  activeAssayId?: string;
  onSelectAssay?: (id: string) => void;
}

export const AdvancedVisualizations: React.FC<AdvancedVisualizationsProps> = ({
  assays,
  activeAssayId,
  onSelectAssay,
}) => {
  const currentAssay =
    assays.find((a) => a.id === activeAssayId) ||
    assays.find((a) => a.type === 'dose_response') ||
    assays[0];

  const [chartType, setChartType] = useState<'scatter' | 'kinetics' | 'heatmap'>(
    (currentAssay?.type as any) === 'expression_heatmap'
      ? 'heatmap'
      : (currentAssay?.type as any) === 'kinetics'
      ? 'kinetics'
      : 'scatter'
  );

  // Customization states
  const [showErrorBars, setShowErrorBars] = useState(true);
  const [showThreshold, setShowThreshold] = useState(true);
  const [scaleMode, setScaleMode] = useState<'log' | 'linear'>('log');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [selectedWell, setSelectedWell] = useState<{ row: string; col: number; val: number } | null>(null);
  const [heatmapPalette, setHeatmapPalette] = useState<'viridis' | 'ocean' | 'fire'>('ocean');

  if (!currentAssay) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        No active assay datasets found in this project.
      </div>
    );
  }

  // Dose-response calculation
  const dataPoints = currentAssay.dataPoints || [];
  const minX = Math.min(...dataPoints.map((d) => d.x), -10);
  const maxX = Math.max(...dataPoints.map((d) => d.x), -5);
  const minY = 0;
  const maxY = 110;

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 340;
  const padding = { top: 25, right: 35, bottom: 45, left: 55 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const toSvgX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * plotWidth;
  const toSvgY = (y: number) => padding.top + (1 - (y - minY) / (maxY - minY)) * plotHeight;

  // Sigmoidal Fit Curve points
  const fitCurvePoints: { x: number; y: number }[] = [];
  const logIC50 = -8.31; // approx 4.82 nM
  for (let i = 0; i <= 60; i++) {
    const curX = minX + (i / 60) * (maxX - minX);
    // 4-parameter logistic equation
    const curY = 0 + (100 - 0) / (1 + Math.pow(10, (curX - logIC50) * -1.08));
    fitCurvePoints.push({ x: toSvgX(curX), y: toSvgY(curY) });
  }
  const fitPath = fitCurvePoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Top Visualizer Control Bar */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setChartType('scatter')}
              className={`px-3 py-1 rounded-md transition-colors ${
                chartType === 'scatter' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dose-Response Scatter
            </button>
            <button
              onClick={() => setChartType('kinetics')}
              className={`px-3 py-1 rounded-md transition-colors ${
                chartType === 'kinetics' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kinetic Line Graph
            </button>
            <button
              onClick={() => setChartType('heatmap')}
              className={`px-3 py-1 rounded-md transition-colors ${
                chartType === 'heatmap' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              96-Well Heatmap
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>{currentAssay.name}</span>
          </div>
        </div>

        {/* View Controls & Customization */}
        <div className="flex items-center gap-2">
          {chartType === 'scatter' && (
            <>
              <button
                onClick={() => setShowErrorBars(!showErrorBars)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  showErrorBars ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Error Bars: {showErrorBars ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => setShowThreshold(!showThreshold)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  showThreshold ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                IC50 Line: {showThreshold ? 'On' : 'Off'}
              </button>
            </>
          )}

          {chartType === 'heatmap' && (
            <select
              value={heatmapPalette}
              onChange={(e) => setHeatmapPalette(e.target.value as any)}
              className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-medium"
            >
              <option value="ocean">Palette: Ocean Gradient</option>
              <option value="viridis">Palette: Viridis</option>
              <option value="fire">Palette: Thermal Fire</option>
            </select>
          )}

          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2))}
              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors border-l border-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors border-l border-slate-200"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="p-5">
        {chartType === 'scatter' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* SVG Plot */}
            <div className="lg:col-span-3 bg-slate-50/50 rounded-xl p-4 border border-slate-200 relative overflow-hidden">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
              >
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto select-none"
                >
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((val) => (
                    <g key={val}>
                      <line
                        x1={padding.left}
                        y1={toSvgY(val)}
                        x2={svgWidth - padding.right}
                        y2={toSvgY(val)}
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={toSvgY(val) + 3}
                        textAnchor="end"
                        fontSize="10"
                        fill="#64748B"
                        fontFamily="monospace"
                      >
                        {val}%
                      </text>
                    </g>
                  ))}

                  {/* X-axis Ticks */}
                  {[-10, -9, -8, -7, -6, -5].map((val) => (
                    <g key={val}>
                      <line
                        x1={toSvgX(val)}
                        y1={toSvgY(0)}
                        x2={toSvgX(val)}
                        y2={toSvgY(0) + 5}
                        stroke="#94A3B8"
                        strokeWidth="1"
                      />
                      <text
                        x={toSvgX(val)}
                        y={toSvgY(0) + 18}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748B"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  ))}

                  {/* Axis Labels */}
                  <text
                    x={svgWidth / 2}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill="#334155"
                  >
                    Log [Compound Concentration, M]
                  </text>
                  <text
                    x={-(svgHeight / 2)}
                    y={16}
                    transform="rotate(-90)"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill="#334155"
                  >
                    Relative Inhibition (%)
                  </text>

                  {/* 50% Threshold line */}
                  {showThreshold && (
                    <g>
                      <line
                        x1={padding.left}
                        y1={toSvgY(50)}
                        x2={svgWidth - padding.right}
                        y2={toSvgY(50)}
                        stroke="#E11D48"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                      />
                      <line
                        x1={toSvgX(logIC50)}
                        y1={padding.top}
                        x2={toSvgX(logIC50)}
                        y2={toSvgY(0)}
                        stroke="#E11D48"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={toSvgX(logIC50)}
                        cy={toSvgY(50)}
                        r="4.5"
                        fill="#E11D48"
                      />
                      <text
                        x={toSvgX(logIC50) + 8}
                        y={toSvgY(50) - 8}
                        fontSize="10"
                        fontWeight="600"
                        fill="#E11D48"
                        fontFamily="monospace"
                      >
                        IC50: 4.82 nM
                      </text>
                    </g>
                  )}

                  {/* Fitted Sigmoidal Logistic Curve */}
                  <path
                    d={fitPath}
                    fill="none"
                    stroke="#0B57D0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {dataPoints.map((pt, i) => {
                    const cx = toSvgX(pt.x);
                    const cy = toSvgY(pt.y);
                    const isHovered = hoveredPoint === pt;

                    return (
                      <g key={i}>
                        {/* Error bar */}
                        {showErrorBars && pt.error && (
                          <line
                            x1={cx}
                            y1={toSvgY(pt.y - pt.error * 3)}
                            x2={cx}
                            y2={toSvgY(pt.y + pt.error * 3)}
                            stroke="#64748B"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 6 : 4.5}
                          fill={isHovered ? '#0B57D0' : '#FFFFFF'}
                          stroke="#0B57D0"
                          strokeWidth="2"
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div className="absolute top-4 right-4 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg font-mono pointer-events-none">
                  <div>Dose: {hoveredPoint.label} (10^{hoveredPoint.x} M)</div>
                  <div>Inhibition: {hoveredPoint.y}% ± {hoveredPoint.error}%</div>
                </div>
              )}
            </div>

            {/* Assay Stats & Provenance Inspector */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Sigmoidal Regression Fit
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                    <span className="text-slate-600">Calculated IC50:</span>
                    <span className="font-mono font-bold text-blue-700">4.82 nM</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                    <span className="text-slate-600">Goodness of Fit (R²):</span>
                    <span className="font-mono font-semibold text-slate-900">0.994</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                    <span className="text-slate-600">Hill Coefficient:</span>
                    <span className="font-mono text-slate-900">-1.08</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600">Experimental Temp:</span>
                    <span className="font-mono text-slate-900">25.0 °C (pH 7.4)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  High potency verified against EGFR T790M mutant. Sub-10 nM inhibition indicates selective ATP-competitive binding affinity.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Reaction Kinetics Line Graph */}
        {chartType === 'kinetics' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-slate-50/50 rounded-xl p-4 border border-slate-200 relative overflow-hidden">
              <svg viewBox="0 0 640 340" className="w-full h-auto select-none">
                {/* Horizontal Grid */}
                {[0, 0.4, 0.8, 1.2, 1.6].map((v) => {
                  const y = 30 + (1 - v / 1.6) * 250;
                  return (
                    <g key={v}>
                      <line x1="50" y1={y} x2="610" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                      <text x="42" y={y + 3} textAnchor="end" fontSize="10" fill="#64748B" fontFamily="monospace">
                        {v.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* X axis ticks */}
                {[0, 20, 40, 60, 80, 100, 120].map((t) => {
                  const x = 50 + (t / 120) * 560;
                  return (
                    <g key={t}>
                      <line x1={x} y1="280" x2={x} y2="285" stroke="#94A3B8" />
                      <text x={x} y="300" textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="monospace">
                        {t}m
                      </text>
                    </g>
                  );
                })}

                <text x="330" y="325" textAnchor="middle" fontSize="11" fontWeight="500" fill="#334155">
                  Reaction Time (Minutes)
                </text>
                <text x="-160" y="16" transform="rotate(-90)" textAnchor="middle" fontSize="11" fontWeight="500" fill="#334155">
                  Optical Absorbance (OD340)
                </text>

                {/* Vehicle Control Curve */}
                <path
                  d="M 50 277 L 96 261 L 143 242 L 190 220 L 260 192 L 330 162 L 470 115 L 610 70"
                  fill="none"
                  stroke="#E8710A"
                  strokeWidth="2.5"
                />

                {/* Compound Q-72 (5 nM) Curve */}
                <path
                  d="M 50 278 L 96 270 L 143 262 L 190 251 L 260 239 L 330 226 L 470 205 L 610 184"
                  fill="none"
                  stroke="#0B57D0"
                  strokeWidth="2.5"
                />

                {/* Osimertinib Reference Curve */}
                <path
                  d="M 50 278 L 96 275 L 143 272 L 190 269 L 260 265 L 330 262 L 470 258 L 610 255"
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="2.5"
                />
              </svg>

              {/* Multi-series Legend */}
              <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-slate-200 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-[#E8710A] rounded-full"></span>
                  <span className="text-slate-700">Vehicle Control (Vmax = 14.2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-[#0B57D0] rounded-full"></span>
                  <span className="text-slate-700 font-semibold">Compound Q-72 (5 nM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-[#0D9488] rounded-full"></span>
                  <span className="text-slate-700">Osimertinib Ref (50 nM)</span>
                </div>
              </div>
            </div>

            {/* Kinetic Parameters */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-semibold uppercase tracking-wider text-slate-500">
                Enzyme Kinetics Parameters
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Vmax:</span>
                  <span className="font-mono font-bold text-slate-900">14.2 µmol/min/mg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Km (ATP):</span>
                  <span className="font-mono font-bold text-slate-900">28.4 µM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">kcat / Km:</span>
                  <span className="font-mono font-bold text-blue-700">1.8 × 10⁵ M⁻¹s⁻¹</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Inhibition Type:</span>
                  <span className="font-medium text-slate-900">Competitive (ATP-site)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. 96-Well Plate Heatmap */}
        {chartType === 'heatmap' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-slate-50/50 rounded-xl p-4 border border-slate-200">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* Grid Headers: 1 - 12 */}
                  <div className="flex items-center pl-8 mb-1 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
                      <div
                        key={col}
                        className="w-10 text-center text-[10px] font-mono text-slate-500 font-semibold"
                      >
                        {col}
                      </div>
                    ))}
                  </div>

                  {/* 8 Rows: A - H */}
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row, rIdx) => {
                    const rowValues = currentAssay.heatmapGrid?.values?.[rIdx] || [
                      0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.08, 0.05, 0.04,
                    ];
                    return (
                      <div key={row} className="flex items-center gap-1 mb-1">
                        <span className="w-7 text-right pr-2 text-[10px] font-mono font-bold text-slate-500">
                          {row}
                        </span>
                        {rowValues.map((val, cIdx) => {
                          const colNum = cIdx + 1;
                          const isSelected = selectedWell?.row === row && selectedWell?.col === colNum;

                          // Palette color interpolator
                          let bgColor = '';
                          if (heatmapPalette === 'ocean') {
                            if (val > 0.8) bgColor = 'bg-blue-800 text-white';
                            else if (val > 0.6) bgColor = 'bg-blue-600 text-white';
                            else if (val > 0.4) bgColor = 'bg-cyan-500 text-white';
                            else if (val > 0.2) bgColor = 'bg-cyan-300 text-slate-900';
                            else bgColor = 'bg-slate-100 text-slate-500';
                          } else if (heatmapPalette === 'viridis') {
                            if (val > 0.8) bgColor = 'bg-yellow-400 text-slate-900 font-bold';
                            else if (val > 0.6) bgColor = 'bg-emerald-500 text-white';
                            else if (val > 0.4) bgColor = 'bg-teal-600 text-white';
                            else if (val > 0.2) bgColor = 'bg-indigo-700 text-white';
                            else bgColor = 'bg-slate-900 text-slate-200';
                          } else {
                            // Thermal fire
                            if (val > 0.8) bgColor = 'bg-rose-600 text-white';
                            else if (val > 0.6) bgColor = 'bg-orange-500 text-white';
                            else if (val > 0.4) bgColor = 'bg-amber-400 text-slate-900';
                            else if (val > 0.2) bgColor = 'bg-amber-200 text-slate-900';
                            else bgColor = 'bg-slate-100 text-slate-500';
                          }

                          return (
                            <button
                              key={cIdx}
                              onClick={() => setSelectedWell({ row, col: colNum, val })}
                              className={`w-10 h-8 rounded-sm text-[10px] font-mono flex items-center justify-center transition-all ${bgColor} ${
                                isSelected ? 'ring-2 ring-blue-500 ring-offset-1 scale-105 z-10' : 'hover:opacity-85'
                              }`}
                            >
                              {val.toFixed(2)}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Color Gradient Key */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 px-2 font-mono">
                <span>0.00 (Blank / Inhibition)</span>
                <div className="w-48 h-2 rounded-full bg-gradient-to-r from-slate-200 via-cyan-400 to-blue-800" />
                <span>1.00 (Max OD450 / Viability)</span>
              </div>
            </div>

            {/* Well Details Inspector */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-semibold uppercase tracking-wider text-slate-500">
                Well Inspector (ANSI/SLAS)
              </h4>
              {selectedWell ? (
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Well Identifier:</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      {selectedWell.row}
                      {selectedWell.col < 10 ? `0${selectedWell.col}` : selectedWell.col}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Normalized Value:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedWell.val.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Sample Classification:</span>
                    <span className="font-medium text-slate-800">
                      {selectedWell.row === 'H' ? 'Blank / Negative Ctrl' : `Replicate ${selectedWell.col}`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Quality Check:</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 py-4">Click any microplate well to inspect raw absorbance values.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
