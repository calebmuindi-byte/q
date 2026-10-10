import { PlanckLogEntry } from '../types';
import {
  getStoredPlanckLogs,
  addStoredPlanckLog,
  addStoredPlanckLogsBatch,
  subscribeToFullState,
} from './storage';

// Physical Constant: Planck time t_P ≈ 5.391247 × 10^-44 seconds
export const PLANCK_TIME_SECONDS = 5.391247e-44;

let subSecondSeq = 0;
let lastSecondEpoch = Math.floor(Date.now() / 1000);

export function generatePlanckTimestamp(): {
  timestampIso: string;
  secondTimestamp: string;
  fractionalSeconds: number;
  subSecondNanoseconds: number;
  planckOffset: string;
  planckUnits: string;
  fullPlanckTimestamp: string;
} {
  const now = new Date();
  const currentSecondEpoch = Math.floor(now.getTime() / 1000);

  if (currentSecondEpoch === lastSecondEpoch) {
    subSecondSeq++;
  } else {
    lastSecondEpoch = currentSecondEpoch;
    subSecondSeq = 1;
  }

  // Base fractional seconds from high-res timer or sub-second sequence
  const ms = now.getMilliseconds();
  const perfFraction = (performance.now() % 1000) / 1000;
  const combinedNs = Math.floor(ms * 1_000_000 + (perfFraction * 1_000_000) % 1_000_000 + subSecondSeq * 1234);

  // Planck time offset calculation: Each simultaneous sub-action in a second receives distinct Planck delta
  const planckMultiplier = (subSecondSeq * 1.6180339887).toFixed(3);
  const planckOffsetSeconds = `${(parseFloat(planckMultiplier) * 5.391).toFixed(3)}e-44 s`;
  const planckUnits = `${planckMultiplier} t_P (${(parseFloat(planckMultiplier) * 5.391).toFixed(2)} × 10⁻⁴⁴ s)`;

  const secondTimestamp = now.toISOString().replace('T', ' ').slice(0, 19);
  const nsPadded = combinedNs.toString().padStart(9, '0');
  const fullPlanckTimestamp = `${secondTimestamp}.${nsPadded} [Δt_P: +${planckOffsetSeconds}]`;

  return {
    timestampIso: now.toISOString(),
    secondTimestamp,
    fractionalSeconds: combinedNs / 1_000_000_000,
    subSecondNanoseconds: combinedNs,
    planckOffset: planckOffsetSeconds,
    planckUnits,
    fullPlanckTimestamp,
  };
}

export function generateApexAuthToken(agentId: string, facility: string): string {
  const seed = `${agentId}-${facility}-${Date.now()}-${subSecondSeq}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
  return `AUTH-APEX-${hex}`;
}

export const INITIAL_PLANCK_LOGS: PlanckLogEntry[] = [
  {
    id: 'plk-001',
    timestampIso: new Date(Date.now() - 3600000).toISOString(),
    secondTimestamp: '2026-10-10 16:15:02',
    fractionalSeconds: 0.124892114,
    subSecondNanoseconds: 124892114,
    planckOffset: '1.618e-44 s',
    planckUnits: '1.618 t_P (8.72 × 10⁻⁴⁴ s)',
    fullPlanckTimestamp: '2026-10-10 16:15:02.124892114 [Δt_P: +1.618e-44 s]',
    facility: 'SpectraMax iD5 Multi-Mode Plate Reader',
    facilityCategory: 'virtual_lab',
    agentId: 'agent-prim-1',
    agentName: 'Primary Agent #1: BioInformatics',
    agentRole: 'primary_agent',
    action: 'FACILITY_ACCESS: Acquire 96-well optical scan at 450 nm',
    details: 'Readout calibrated for Compound Q-72 series. Optical density range: 0.04 - 0.99. Z-prime = 0.84.',
    apexAuthToken: 'AUTH-APEX-9C4B7E01',
    status: 'VERIFIED',
  },
  {
    id: 'plk-002',
    timestampIso: new Date(Date.now() - 3600000).toISOString(),
    secondTimestamp: '2026-10-10 16:15:02',
    fractionalSeconds: 0.124892289,
    subSecondNanoseconds: 124892289,
    planckOffset: '3.236e-44 s',
    planckUnits: '3.236 t_P (17.44 × 10⁻⁴⁴ s)',
    fullPlanckTimestamp: '2026-10-10 16:15:02.124892289 [Δt_P: +3.236e-44 s]',
    facility: 'Assay Kinetics & IC50 Fitting Engine',
    facilityCategory: 'assays',
    agentId: 'agent-sub-1a',
    agentName: 'Subagent #1A: AlphaFold Conformational Inspector',
    agentRole: 'subagent',
    action: 'FACILITY_ACCESS: 4-Parameter Logistic Hill Regression',
    details: 'Fitted 10-point titration curve: LogIC50 = -8.31, Hill slope = -1.08, R² = 0.994. Target potency: 4.82 nM.',
    apexAuthToken: 'AUTH-APEX-F28A1C04',
    status: 'VERIFIED',
  },
  {
    id: 'plk-003',
    timestampIso: new Date(Date.now() - 2400000).toISOString(),
    secondTimestamp: '2026-10-10 16:35:18',
    fractionalSeconds: 0.450123891,
    subSecondNanoseconds: 450123891,
    planckOffset: '1.618e-44 s',
    planckUnits: '1.618 t_P (8.72 × 10⁻⁴⁴ s)',
    fullPlanckTimestamp: '2026-10-10 16:35:18.450123891 [Δt_P: +1.618e-44 s]',
    facility: 'AlphaFold DB 3D Structural Explorer',
    facilityCategory: 'science_scout',
    agentId: 'agent-sub-1a',
    agentName: 'Subagent #1A: AlphaFold Conformational Inspector',
    agentRole: 'subagent',
    action: 'FACILITY_ACCESS: Query mmCIF P00533 Kinase Conformer',
    details: 'Verified Cys797 / Thr790 residue spatial coordinates. Computed solvent accessible surface area (SASA).',
    apexAuthToken: 'AUTH-APEX-3B90E4FA',
    status: 'VERIFIED',
  },
  {
    id: 'plk-004',
    timestampIso: new Date(Date.now() - 1200000).toISOString(),
    secondTimestamp: '2026-10-10 16:55:40',
    fractionalSeconds: 0.781290401,
    subSecondNanoseconds: 781290401,
    planckOffset: '1.618e-44 s',
    planckUnits: '1.618 t_P (8.72 × 10⁻⁴⁴ s)',
    fullPlanckTimestamp: '2026-10-10 16:55:40.781290401 [Δt_P: +1.618e-44 s]',
    facility: 'Civilization Omniscience Archive (Compressed .ZIP)',
    facilityCategory: 'civilization_archive',
    agentId: 'agent-prim-2',
    agentName: 'Primary Agent #2: Civilization Archive Synthesizer',
    agentRole: 'primary_agent',
    action: 'FACILITY_ACCESS: Decompress 3500 BCE - 2026 CE Manifest',
    details: 'Extracted Egyptian medical papyri (Edwin Smith & Ebers, c. 1600 BCE) for cross-era wound antiseptic comparison.',
    apexAuthToken: 'AUTH-APEX-81B43A19',
    status: 'COMMITTED',
  },
  {
    id: 'plk-005',
    timestampIso: new Date(Date.now() - 600000).toISOString(),
    secondTimestamp: '2026-10-10 17:05:12',
    fractionalSeconds: 0.052891230,
    subSecondNanoseconds: 52891230,
    planckOffset: '1.618e-44 s',
    planckUnits: '1.618 t_P (8.72 × 10⁻⁴⁴ s)',
    fullPlanckTimestamp: '2026-10-10 17:05:12.052891230 [Δt_P: +1.618e-44 s]',
    facility: 'Google Workspace: Sheets Real-Time Sync',
    facilityCategory: 'workspace',
    agentId: 'agent-prim-1',
    agentName: 'Primary Agent #1: BioInformatics',
    agentRole: 'primary_agent',
    action: 'FACILITY_ACCESS: Append Plate Reader Row Data to Live Sheet',
    details: 'Authorized by Apex Director under OAuth brand 277809404596. Dispatched 96 cell coordinate values.',
    apexAuthToken: 'AUTH-APEX-AA701F99',
    status: 'VERIFIED',
  },
];

let globalLogState: PlanckLogEntry[] = (() => {
  const stored = getStoredPlanckLogs();
  return stored && stored.length > 0 ? stored : [...INITIAL_PLANCK_LOGS];
})();

const listeners = new Set<(logs: PlanckLogEntry[]) => void>();

// Subscribe to storage changes as well
subscribeToFullState((state) => {
  if (state.planckLogs && state.planckLogs !== globalLogState) {
    globalLogState = state.planckLogs;
    listeners.forEach((cb) => cb(globalLogState));
  }
});

export function subscribeToPlanckLogs(callback: (logs: PlanckLogEntry[]) => void) {
  listeners.add(callback);
  callback(globalLogState);
  return () => {
    listeners.delete(callback);
  };
}

export function logApexAuthorizedAction(params: {
  facility: string;
  facilityCategory: PlanckLogEntry['facilityCategory'];
  agentId: string;
  agentName: string;
  agentRole: PlanckLogEntry['agentRole'];
  action: string;
  details: string;
}): PlanckLogEntry {
  const planckTime = generatePlanckTimestamp();
  const apexAuthToken = generateApexAuthToken(params.agentId, params.facility);

  const newEntry: PlanckLogEntry = {
    id: `plk-${Date.now()}-${subSecondSeq}`,
    timestampIso: planckTime.timestampIso,
    secondTimestamp: planckTime.secondTimestamp,
    fractionalSeconds: planckTime.fractionalSeconds,
    subSecondNanoseconds: planckTime.subSecondNanoseconds,
    planckOffset: planckTime.planckOffset,
    planckUnits: planckTime.planckUnits,
    fullPlanckTimestamp: planckTime.fullPlanckTimestamp,
    facility: params.facility,
    facilityCategory: params.facilityCategory,
    agentId: params.agentId,
    agentName: params.agentName,
    agentRole: params.agentRole,
    action: params.action,
    details: params.details,
    apexAuthToken,
    status: 'VERIFIED',
  };

  globalLogState = [newEntry, ...globalLogState];
  // Persist immediately to localStorage and disk file
  addStoredPlanckLog(newEntry);
  listeners.forEach((cb) => cb(globalLogState));
  return newEntry;
}

// Multi-Action Cascade Simulation across facilities
export function executeSimultaneousFacilityCascade(): PlanckLogEntry[] {
  const operations = [
    {
      facility: 'SpectraMax iD5 Multi-Mode Plate Reader',
      facilityCategory: 'virtual_lab' as const,
      agentId: 'agent-prim-1',
      agentName: 'Primary Agent #1: BioInformatics',
      agentRole: 'primary_agent' as const,
      action: 'FACILITY_TRIGGER: Microplate Readout Run #5',
      details: 'Acquired 384-well fluorometric intensity matrix at 450 nm. Baseline signal verified.',
    },
    {
      facility: 'Eppendorf 5424 R Refrigerated Centrifuge',
      facilityCategory: 'virtual_lab' as const,
      agentId: 'agent-sub-1a',
      agentName: 'Subagent #1A: Lab Executioner',
      agentRole: 'subagent' as const,
      action: 'FACILITY_TRIGGER: Chilled Centrifugation at 4°C',
      details: 'Spun cell lysates at 14,000 RPM (21,130 × g) for 15 minutes. Rotor balance verified.',
    },
    {
      facility: 'Applied Biosystems QuantStudio 5 qPCR Cycler',
      facilityCategory: 'virtual_lab' as const,
      agentId: 'agent-sub-1b',
      agentName: 'Subagent #1B: Thermal Kinetics Specialist',
      agentRole: 'subagent' as const,
      action: 'FACILITY_TRIGGER: Thermal Cycling Amplification Run',
      details: '40 cycles SYBR Green fluorescence acquisition. EGFR T790M Ct resolved at 21.4.',
    },
    {
      facility: 'Leica TCS SP8 Laser Confocal Microscope',
      facilityCategory: 'virtual_lab' as const,
      agentId: 'agent-sub-1c',
      agentName: 'Subagent #1C: Optical Imaging Specialist',
      agentRole: 'subagent' as const,
      action: 'FACILITY_TRIGGER: Confocal Z-Stack Acquisition',
      details: 'Acquired DAPI/GFP dual-channel fluorescence at 40x magnification. Pinhole: 1.0 Airy Unit.',
    },
    {
      facility: 'Google Workspace: Drive Project Dossier Sync',
      facilityCategory: 'workspace' as const,
      agentId: 'agent-prim-2',
      agentName: 'Primary Agent #2: Civilization Archive Synthesizer',
      agentRole: 'primary_agent' as const,
      action: 'FACILITY_TRIGGER: Export Research Dossier Archive',
      details: 'Uploaded Q-Tracker-Dossier-Kinetic-Profiling.md to authorized Google Drive folder.',
    },
  ];

  const added: PlanckLogEntry[] = [];
  operations.forEach((op) => {
    const entry = logApexAuthorizedAction(op);
    added.push(entry);
  });

  return added;
}

  return added;
}
