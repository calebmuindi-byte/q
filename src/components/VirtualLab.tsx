import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Gauge,
  Thermometer,
  Disc,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Layers,
  Dna,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Droplets,
  Microscope,
  CheckCircle2,
  AlertTriangle,
  Beaker,
  Wind,
  Snowflake,
  Activity,
  Maximize2,
  Boxes,
} from 'lucide-react';
import { Assay } from '../types';
import { logApexAuthorizedAction } from '../lib/planckLogger';

interface VirtualLabProps {
  onSendAssayData?: (assayData: Partial<Assay>) => void;
}

export const VirtualLab: React.FC<VirtualLabProps> = ({ onSendAssayData }) => {
  const [activeStation, setActiveStation] = useState<
    'centrifuge' | 'spectrophotometer' | 'qpcr' | 'microscope' | 'chromatography' | 'specimens' | 'calculator'
  >('spectrophotometer');

  // 1. Centrifuge Simulation State
  const [centrifugeSpeed, setCentrifugeSpeed] = useState(14000); // RPM
  const [centrifugeTemp, setCentrifugeTemp] = useState(4); // °C
  const [centrifugeDuration, setCentrifugeDuration] = useState(15); // min
  const [centrifugeRunning, setCentrifugeRunning] = useState(false);
  const [centrifugeTimeLeft, setCentrifugeTimeLeft] = useState(15 * 60);

  useEffect(() => {
    let interval: any;
    if (centrifugeRunning && centrifugeTimeLeft > 0) {
      interval = setInterval(() => {
        setCentrifugeTimeLeft((t) => (t > 1 ? t - 1 : 0));
      }, 100); // accelerated clock for preview
    } else if (centrifugeTimeLeft === 0 && centrifugeRunning) {
      setCentrifugeRunning(false);
    }
    return () => clearInterval(interval);
  }, [centrifugeRunning, centrifugeTimeLeft]);

  // 2. Multi-Mode Microplate Reader / Spectrophotometer State
  const [plateReadMode, setPlateReadMode] = useState<'absorbance' | 'fluorescence' | 'luminescence'>('absorbance');
  const [wavelength, setWavelength] = useState(450); // nm
  const [shakingBeforeRead, setShakingBeforeRead] = useState(true);
  const [isReadingPlate, setIsReadingPlate] = useState(false);
  const [plateProgress, setPlateProgress] = useState(0);
  const [plateResultsReady, setPlateResultsReady] = useState(true);
  const [sampleWellData, setSampleWellData] = useState<number[][]>([
    [0.95, 0.91, 0.84, 0.72, 0.58, 0.41, 0.28, 0.19, 0.12, 0.08, 0.06, 0.05],
    [0.98, 0.93, 0.86, 0.75, 0.61, 0.45, 0.31, 0.21, 0.14, 0.09, 0.06, 0.05],
    [0.94, 0.89, 0.82, 0.71, 0.57, 0.42, 0.29, 0.18, 0.11, 0.07, 0.05, 0.04],
    [0.96, 0.92, 0.85, 0.74, 0.59, 0.43, 0.30, 0.20, 0.13, 0.08, 0.05, 0.04],
    [0.12, 0.14, 0.21, 0.35, 0.52, 0.71, 0.84, 0.91, 0.95, 0.97, 0.98, 0.99],
    [0.10, 0.13, 0.19, 0.33, 0.49, 0.69, 0.82, 0.89, 0.94, 0.96, 0.98, 0.99],
    [0.45, 0.46, 0.48, 0.49, 0.47, 0.46, 0.45, 0.44, 0.46, 0.45, 0.46, 0.45],
    [0.05, 0.05, 0.04, 0.05, 0.05, 0.04, 0.05, 0.05, 0.04, 0.05, 0.04, 0.05],
  ]);

  const handleStartPlateRead = () => {
    setIsReadingPlate(true);
    setPlateProgress(0);
    setPlateResultsReady(false);

    logApexAuthorizedAction({
      facility: 'SpectraMax iD5 Multi-Mode Plate Reader',
      facilityCategory: 'virtual_lab',
      agentId: 'agent-apex',
      agentName: 'Prometheus Core (Apex Orchestrator)',
      agentRole: 'apex_director',
      action: `OPTICAL_READOUT: ${plateReadMode.toUpperCase()} at ${wavelength}nm`,
      details: `96-well microplate scan initiated. Shaking: ${shakingBeforeRead ? 'Active' : 'Off'}. Dynamic OD: 0.04 - 0.99.`,
    });

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setPlateProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsReadingPlate(false);
        setPlateResultsReady(true);
      }
    }, 150);
  };

  // 3. Real-Time PCR (qPCR) Thermal Cycler State
  const [pcrCycles, setPcrCycles] = useState(40);
  const [denatureTemp, setDenatureTemp] = useState(95); // °C
  const [annealTemp, setAnnealTemp] = useState(60); // °C
  const [extendTemp, setExtendTemp] = useState(72); // °C
  const [currentPcrCycle, setCurrentPcrCycle] = useState(28);
  const [qpcrRunning, setQpcrRunning] = useState(false);

  // 4. Confocal Microscope State
  const [channelDapi, setChannelDapi] = useState(true); // Blue 405nm (Nuclei)
  const [channelGfp, setChannelGfp] = useState(true); // Green 488nm (EGFR-GFP)
  const [channelRfp, setChannelRfp] = useState(false); // Red 561nm (Actin-mCherry)
  const [objectiveLens, setObjectiveLens] = useState<'20x' | '40x' | '100x_oil'>('40x');
  const [laserPower, setLaserPower] = useState(15); // %
  const [focusZ, setFocusZ] = useState(2.4); // µm

  // 5. Molarity & Dilution Calculator State
  const [calcC1, setCalcC1] = useState('10'); // mM stock
  const [calcV1, setCalcV1] = useState('');
  const [calcC2, setCalcC2] = useState('50'); // µM target
  const [calcV2, setCalcV2] = useState('1000'); // µL target
  const [calcResult, setCalcResult] = useState<string>('5.0 µL stock needed');

  const handleCalculateDilution = () => {
    const c1 = parseFloat(calcC1); // mM = 1000 µM
    const c2 = parseFloat(calcC2); // µM
    const v2 = parseFloat(calcV2); // µL
    if (c1 > 0 && c2 > 0 && v2 > 0) {
      // (C2 * V2) / (C1 * 1000)
      const v1 = (c2 * v2) / (c1 * 1000);
      setCalcResult(`${v1.toFixed(2)} µL stock in ${(v2 - v1).toFixed(2)} µL buffer`);
    }
  };

  // 6. Specimens Repository
  const specimens = [
    {
      id: 'spec-1',
      name: 'H1975 Human NSCLC Cell Line',
      type: 'Mammalian Cell Culture',
      genotype: 'EGFR T790M / L858R Double Mutant',
      storage: 'LN2 Vapor Phase (Rack 4, Box B)',
      passage: 'P8',
      viability: '96.4%',
      status: 'Cryopreserved (-196°C)',
    },
    {
      id: 'spec-2',
      name: 'Recombinant EGFR Kinase Domain (695-1022)',
      type: 'Purified Protein',
      genotype: 'Hexahistidine-tagged (His6-EGFR)',
      storage: '-80°C Ultra-Low Freezer (Shelf 2)',
      passage: 'Lot #Q-2026-A',
      viability: 'Purity >95% by SDS-PAGE',
      status: 'Frozen Aliquots (50 µg/vial)',
    },
    {
      id: 'spec-3',
      name: 'E. coli BL21(DE3) Expression Host',
      type: 'Bacterial Host',
      genotype: 'F- ompT hsdS_B(r_B- m_B-) gal dcm (DE3)',
      storage: '-80°C Glycerol Stock',
      passage: 'Glycerol 20%',
      viability: 'Competence >10⁸ cfu/µg',
      status: 'Ready for Transformation',
    },
    {
      id: 'spec-4',
      name: 'pET-28a-EGFR-C797S Expression Vector',
      type: 'Plasmid DNA',
      genotype: 'KanR, T7 promoter, N-terminal 6xHis',
      storage: '-20°C DNA Archive',
      passage: 'Miniprep 150 ng/µL',
      viability: 'A260/A280 = 1.86',
      status: 'Verified by Sanger Sequencing',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Station Selector & Lab Telemetry Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60 uppercase tracking-wider">
                State-of-the-Art Virtual Laboratory
              </span>
              <span className="text-xs text-slate-400 font-mono">
                BSL-2 Certified • Cleanroom ISO Class 7
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Laboratory Apparatus, Analytical Instruments & Specimen Repository
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Simulate and monitor real-world laboratory workflows: microplate spectrophotometry, refrigerated centrifugation, qPCR thermal cycling, confocal microscopy, and stock dilution chemistry.
            </p>
          </div>

          {/* Environmental Telemetry Gauges */}
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-slate-200/80">
              <Thermometer className="w-3.5 h-3.5 text-blue-600" />
              <span>Lab Temp: 21.4°C</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-slate-200/80">
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span>Hood Velocity: 0.52 m/s</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-slate-200/80">
              <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
              <span>-80°C Freezer: -81.2°C</span>
            </div>
          </div>
        </div>

        {/* Station Navigation Pills */}
        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-xs font-medium">
          {[
            { id: 'spectrophotometer', label: 'Multi-Mode Plate Reader', icon: Disc },
            { id: 'centrifuge', label: 'Refrigerated Centrifuge', icon: RotateCcw },
            { id: 'qpcr', label: 'Real-Time qPCR Cycler', icon: Zap },
            { id: 'microscope', label: 'Laser Confocal Microscope', icon: Microscope },
            { id: 'specimens', label: 'Specimen & Cryo-Bank', icon: Boxes },
            { id: 'calculator', label: 'Molarity & Dilution Bench', icon: Beaker },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveStation(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeStation === item.id
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. SPECTROPHOTOMETER & MICROPLATE READER APPARATUS */}
      {activeStation === 'spectrophotometer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Instrument Console */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Disc className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    SpectraMax iD5 Multi-Mode Microplate Reader
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">Apparatus #PR-402 • Calibrated</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                Online
              </span>
            </div>

            {/* Read Modality */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detection Modality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['absorbance', 'fluorescence', 'luminescence'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPlateReadMode(mode)}
                    className={`py-1.5 px-2 text-xs rounded-lg border capitalize transition-colors font-medium ${
                      plateReadMode === mode
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Wavelength Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Analytical Wavelength (λ)</span>
                <span className="font-mono font-bold text-blue-600">{wavelength} nm</span>
              </div>
              <input
                type="range"
                min="230"
                max="850"
                step="5"
                value={wavelength}
                onChange={(e) => setWavelength(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>UV (230 nm)</span>
                <span>OD450 / OD600</span>
                <span>Near-IR (850 nm)</span>
              </div>
            </div>

            {/* Plate Format & Shaking */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Plate Format</span>
                <span className="font-semibold text-slate-800">96-Well Flat Clear</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Orbital Shaking</span>
                  <span className="font-semibold text-slate-800">{shakingBeforeRead ? '5s Linear' : 'None'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={shakingBeforeRead}
                  onChange={(e) => setShakingBeforeRead(e.target.checked)}
                  className="rounded text-blue-600"
                />
              </div>
            </div>

            {/* Execution Button */}
            <button
              onClick={handleStartPlateRead}
              disabled={isReadingPlate}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isReadingPlate ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" /> Scanning Microplate ({plateProgress}%)...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Acquire 96-Well Optical Readout
                </>
              )}
            </button>

            {isReadingPlate && (
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-150"
                  style={{ width: `${plateProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Real-Time Microplate Chamber Visualization */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  96-Well Optical Chamber Scan Matrix ({wavelength} nm)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Rows A-H • Cols 1-12 • Standard ANSI/SLAS Format
                </p>
              </div>
              <div className="text-xs font-mono text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                OD Range: 0.04 - 0.99
              </div>
            </div>

            {/* Microplate Grid */}
            <div className="overflow-x-auto p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="min-w-[500px]">
                {/* Column Headers */}
                <div className="flex items-center pl-8 mb-2 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
                    <div key={col} className="w-8 text-center text-[10px] font-mono text-slate-400 font-bold">
                      {col}
                    </div>
                  ))}
                </div>

                {/* Rows A - H */}
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row, rIdx) => (
                  <div key={row} className="flex items-center gap-1.5 mb-2">
                    <span className="w-6 text-right pr-2 text-xs font-mono font-bold text-slate-400">
                      {row}
                    </span>
                    {sampleWellData[rIdx].map((val, cIdx) => {
                      // Color based on read mode
                      let color = '#1E3A8A';
                      if (val > 0.8) color = '#0284C7';
                      else if (val > 0.6) color = '#0D9488';
                      else if (val > 0.3) color = '#EAB308';
                      else if (val > 0.1) color = '#F97316';
                      else color = '#334155';

                      return (
                        <div
                          key={cIdx}
                          title={`Well ${row}${cIdx + 1}: ${val.toFixed(2)}`}
                          style={{ backgroundColor: color }}
                          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[9px] font-mono text-white font-bold transition-all hover:scale-110 hover:ring-2 hover:ring-white cursor-pointer"
                        >
                          {val.toFixed(2)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Microplate Key & QC */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Well A01 - D04: Compound Q-72 Inhibition Series (Pass)</span>
              </div>
              <span className="text-slate-400">Z'-factor: 0.84 (Excellent)</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. REFRIGERATED CENTRIFUGE APPARATUS */}
      {activeStation === 'centrifuge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Eppendorf 5424 R Microcentrifuge
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">24 × 1.5/2.0 mL Aerosol-Tight Rotor</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                centrifugeRunning ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                {centrifugeRunning ? 'Spinning' : 'Lid Locked'}
              </span>
            </div>

            {/* RPM / RCF Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Rotor Speed (RPM)</span>
                <span className="font-mono font-bold text-blue-600">
                  {centrifugeSpeed.toLocaleString()} RPM ({Math.round(1.12 * 0.00001 * 85 * centrifugeSpeed * centrifugeSpeed / 1000)} × g)
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                disabled={centrifugeRunning}
                value={centrifugeSpeed}
                onChange={(e) => setCentrifugeSpeed(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Chamber Temperature */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Chamber Temperature</span>
                <span className="font-mono font-bold text-cyan-600">{centrifugeTemp} °C (Chilled)</span>
              </div>
              <div className="flex gap-2">
                {[-10, 4, 20].map((t) => (
                  <button
                    key={t}
                    disabled={centrifugeRunning}
                    onClick={() => setCentrifugeTemp(t)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-mono ${
                      centrifugeTemp === t
                        ? 'bg-cyan-50 border-cyan-300 text-cyan-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {t}°C
                  </button>
                ))}
              </div>
            </div>

            {/* Run Duration */}
            <div>
              <span className="font-semibold text-slate-700 text-xs block mb-1">Run Duration (Minutes)</span>
              <div className="flex gap-2">
                {[5, 10, 15, 30].map((m) => (
                  <button
                    key={m}
                    disabled={centrifugeRunning}
                    onClick={() => {
                      setCentrifugeDuration(m);
                      setCentrifugeTimeLeft(m * 60);
                    }}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-mono ${
                      centrifugeDuration === m
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="pt-2">
              <button
                onClick={() => {
                  const willRun = !centrifugeRunning;
                  setCentrifugeRunning(willRun);
                  if (willRun) {
                    logApexAuthorizedAction({
                      facility: 'Eppendorf 5424 R Refrigerated Centrifuge',
                      facilityCategory: 'virtual_lab',
                      agentId: 'agent-apex',
                      agentName: 'Prometheus Core (Apex Orchestrator)',
                      agentRole: 'apex_director',
                      action: `CENTRIFUGATION_START: ${centrifugeSpeed} RPM at ${centrifugeTemp}°C`,
                      details: `Chilled centrifugation run initiated for ${centrifugeDuration} minutes. RCF: ~${Math.round(1.118e-5 * 84 * centrifugeSpeed * centrifugeSpeed)} × g.`,
                    });
                  }
                }}
                className={`w-full py-2.5 font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  centrifugeRunning
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {centrifugeRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Stop Centrifugation
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Refrigerated Run
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rotor Visualization Viewport */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Rotor Chamber Telemetry & Balance Sensor
            </h3>
            <p className="text-xs text-slate-500 font-mono mb-6">
              24-Place Fixed-Angle Rotor FA-45-24-11
            </p>

            {/* Animated Spinning Rotor SVG */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className={`w-full h-full select-none ${
                  centrifugeRunning ? 'animate-spin' : ''
                }`}
                style={{
                  animationDuration: `${Math.max(0.2, 5000 / centrifugeSpeed)}s`,
                }}
              >
                {/* Rotor Body */}
                <circle cx="100" cy="100" r="90" fill="#1E293B" stroke="#475569" strokeWidth="4" />
                <circle cx="100" cy="100" r="30" fill="#0F172A" stroke="#334155" strokeWidth="2" />

                {/* 24 Tube Wells placed radially */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  const rad = (angle * Math.PI) / 180;
                  const cx = 100 + 64 * Math.cos(rad);
                  const cy = 100 + 64 * Math.sin(rad);
                  const hasSample = i % 2 === 0; // Balanced pairs
                  return (
                    <g key={i}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="6.5"
                        fill={hasSample ? '#38BDF8' : '#334155'}
                        stroke="#0F172A"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Center Status Display */}
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="text-lg font-mono font-bold text-white">
                  {centrifugeRunning ? Math.round(centrifugeSpeed) : 0}
                </span>
                <span className="text-[10px] font-mono text-cyan-400">RPM</span>
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-3 gap-4 w-full mt-6 text-center text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">TIME REMAINING</span>
                <span className="font-bold text-slate-800 text-sm">
                  {Math.floor(centrifugeTimeLeft / 60)}:{(centrifugeTimeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">CURRENT TEMP</span>
                <span className="font-bold text-cyan-700 text-sm">{centrifugeTemp}.0 °C</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">ROTOR BALANCE</span>
                <span className="font-bold text-emerald-600 text-sm">Balanced (12/12)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. REAL-TIME PCR (qPCR) CYCLER */}
      {activeStation === 'qpcr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Applied Biosystems QuantStudio 5 qPCR
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">96-Well 0.2 mL Peltier Block</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-600">Step 1 (Denature):</span>
                  <span className="font-bold text-slate-900">{denatureTemp}°C • 15 sec</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-600">Step 2 (Anneal/Extend):</span>
                  <span className="font-bold text-slate-900">{annealTemp}°C • 60 sec (SYBR Green Read)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-600">Cycles:</span>
                  <span className="font-bold text-blue-700">{pcrCycles} Cycles</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Target Gene Assays</span>
                <span className="font-mono text-blue-600 font-bold">EGFR exon 20 / GAPDH Ref</span>
              </div>
            </div>

            <button
              onClick={() => setQpcrRunning(!qpcrRunning)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {qpcrRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {qpcrRunning ? 'Pause Thermal Cycling' : 'Run 40-Cycle qPCR Protocol'}
            </button>
          </div>

          {/* qPCR Amplification Plot */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Fluorescence Amplification Curves (ΔRn vs Cycle)
                </h3>
                <p className="text-xs text-slate-500 font-mono">Cycle Threshold (Ct) Analysis</p>
              </div>
              <div className="text-xs font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Ct: 21.4 (EGFR T790M)
              </div>
            </div>

            {/* qPCR Sigmoid Curves SVG */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <svg viewBox="0 0 500 240" className="w-full h-auto">
                {/* Horizontal Grid */}
                {[0, 0.5, 1.0, 1.5, 2.0].map((val) => {
                  const y = 20 + (1 - val / 2.0) * 180;
                  return (
                    <g key={val}>
                      <line x1="40" y1={y} x2="480" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                      <text x="35" y={y + 3} textAnchor="end" fontSize="9" fill="#64748B" fontFamily="monospace">
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis */}
                {[0, 10, 20, 30, 40].map((cycle) => {
                  const x = 40 + (cycle / 40) * 440;
                  return (
                    <g key={cycle}>
                      <line x1={x} y1="200" x2={x} y2="205" stroke="#94A3B8" />
                      <text x={x} y="218" textAnchor="middle" fontSize="9" fill="#64748B" fontFamily="monospace">
                        {cycle}
                      </text>
                    </g>
                  );
                })}

                {/* Ct Threshold Line */}
                <line x1="40" y1="140" x2="480" y2="140" stroke="#E11D48" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="475" y="135" textAnchor="end" fontSize="9" fill="#E11D48" fontFamily="monospace" fontWeight="bold">
                  Baseline Threshold (0.2 ΔRn)
                </text>

                {/* EGFR T790M Curve (Ct ~ 21.4) */}
                <path
                  d="M 40 198 L 150 198 L 220 185 L 260 120 L 320 50 L 400 35 L 480 30"
                  fill="none"
                  stroke="#0B57D0"
                  strokeWidth="2.5"
                />

                {/* GAPDH Endogenous Control (Ct ~ 16.8) */}
                <path
                  d="M 40 198 L 120 198 L 180 170 L 220 90 L 280 40 L 360 30 L 480 28"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#0B57D0] rounded"></span>
                <span>EGFR T790M Amplicon (Ct = 21.4)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#059669] rounded"></span>
                <span>GAPDH Reference (Ct = 16.8)</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. CONFOCAL MICROSCOPE APPARATUS */}
      {activeStation === 'microscope' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Microscope className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Leica TCS SP8 Confocal Laser Microscope
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Apochromat Optical Stage</p>
              </div>
            </div>

            {/* Channels Multi-selection */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-2">Fluorescence Channels</span>
              <div className="space-y-1.5">
                <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span>DAPI (Nuclei, 405 nm)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={channelDapi}
                    onChange={(e) => setChannelDapi(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span>GFP (EGFR Tyrosine Kinase, 488 nm)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={channelGfp}
                    onChange={(e) => setChannelGfp(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span>mCherry (Cytoskeleton, 561 nm)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={channelRfp}
                    onChange={(e) => setChannelRfp(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                </label>
              </div>
            </div>

            {/* Objective lens */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">Objective Lens</span>
              <div className="grid grid-cols-3 gap-2">
                {(['20x', '40x', '100x_oil'] as const).map((lens) => (
                  <button
                    key={lens}
                    onClick={() => setObjectiveLens(lens)}
                    className={`py-1.5 text-xs rounded-lg border font-mono ${
                      objectiveLens === lens
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {lens.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Laser Intensity Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">Laser Power</span>
                <span className="font-mono font-bold text-indigo-600">{laserPower}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={laserPower}
                onChange={(e) => setLaserPower(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Confocal Viewport */}
          <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden h-[420px]">
            {/* Cellular Simulation Visualizer */}
            <div className="relative w-72 h-72 rounded-full border border-slate-800 overflow-hidden flex items-center justify-center bg-black">
              {/* Cells with DAPI and GFP fluorescence */}
              <svg viewBox="0 0 200 200" className="w-full h-full select-none">
                {/* Cell 1 Membrane (GFP) */}
                {channelGfp && (
                  <circle cx="90" cy="90" r="45" fill="none" stroke="#10B981" strokeWidth="4" opacity={laserPower / 60} />
                )}
                {/* Cell 1 Nucleus (DAPI) */}
                {channelDapi && (
                  <circle cx="90" cy="90" r="20" fill="#3B82F6" opacity={laserPower / 40} />
                )}

                {/* Cell 2 Membrane (GFP) */}
                {channelGfp && (
                  <circle cx="140" cy="130" r="38" fill="none" stroke="#10B981" strokeWidth="3" opacity={laserPower / 60} />
                )}
                {/* Cell 2 Nucleus (DAPI) */}
                {channelDapi && (
                  <circle cx="140" cy="130" r="16" fill="#3B82F6" opacity={laserPower / 40} />
                )}

                {/* Actin stress fibers (mCherry) */}
                {channelRfp && (
                  <path
                    d="M 60 90 Q 90 120 120 90 M 110 130 Q 140 160 170 130"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="2"
                    opacity={laserPower / 50}
                  />
                )}
              </svg>

              {/* Viewport Crosshair & Scale Bar */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-px bg-white/20"></div>
                <div className="h-16 w-px bg-white/20 absolute"></div>
              </div>

              <div className="absolute bottom-3 right-4 text-[10px] text-white/70 font-mono">
                — 10 µm
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between w-full text-xs font-mono text-slate-400 border-t border-slate-900 pt-3">
              <span>Magnification: {objectiveLens.replace('_', ' ')}</span>
              <span>Z-depth: {focusZ} µm</span>
              <span className="text-emerald-400">Pinhole: 1.0 Airy Unit</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. SPECIMEN & CRYO-BANK REPOSITORY */}
      {activeStation === 'specimens' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Laboratory Specimen Cryo-Bank & Biological Inventory
                </h3>
                <p className="text-xs text-slate-500">
                  LN2 Vapor Phase (-196°C) and -80°C Ultra-Low Specimen Catalog
                </p>
              </div>
            </div>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-200">
              4 Certified Lots Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {specimens.map((sp) => (
              <div
                key={sp.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all text-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{sp.name}</h4>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {sp.type}
                  </span>
                </div>

                <div className="text-slate-600 font-mono text-[11px]">
                  Genotype / Construct: <span className="text-blue-700 font-bold">{sp.genotype}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono">
                  <div>Storage: {sp.storage}</div>
                  <div>QC: {sp.viability}</div>
                  <div>Status: <span className="text-emerald-600 font-semibold">{sp.status}</span></div>
                  <div>ID: {sp.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. MOLARITY & BUFFER CALCULATOR */}
      {activeStation === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Beaker className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Stock Solution & Dilution Calculator (C₁V₁ = C₂V₂)
                </h3>
                <p className="text-xs text-slate-500">Calculate micropipette volumes for compound gradients</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Stock Concentration C₁ (mM)
                </label>
                <input
                  type="number"
                  value={calcC1}
                  onChange={(e) => setCalcC1(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Concentration C₂ (µM)
                </label>
                <input
                  type="number"
                  value={calcC2}
                  onChange={(e) => setCalcC2(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Volume V₂ (µL)
                </label>
                <input
                  type="number"
                  value={calcV2}
                  onChange={(e) => setCalcV2(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <button
                onClick={handleCalculateDilution}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Compute Required Pipette Volume
              </button>
            </div>

            {calcResult && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs font-mono font-bold text-teal-900">
                Formula Output: {calcResult}
              </div>
            )}
          </div>

          {/* Standard Laboratory Buffers Reference */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Standard Laboratory Buffer Formulations
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">1X Phosphate-Buffered Saline (PBS, pH 7.4)</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  137 mM NaCl, 2.7 mM KCl, 10 mM Na₂HPO₄, 1.8 mM KH₂PO₄
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Kinase Assay Reaction Buffer (5X)</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  125 mM Tris-HCl (pH 7.5), 50 mM MgCl₂, 5 mM DTT, 0.05% Triton X-100
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">RIPA Lysis & Extraction Buffer</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  50 mM Tris-HCl (pH 7.4), 150 mM NaCl, 1% NP-40, 0.5% Sodium deoxycholate, 0.1% SDS
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
