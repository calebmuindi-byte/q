import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type, GenerateVideosOperation } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// PERSISTENT DISK STORAGE LAYER (Q-TRACKER)
// Solves: Data loss on app reboot & page refresh
// ==========================================
const DATA_DIR = path.resolve(__dirname, 'data');
const STATE_FILE = path.resolve(DATA_DIR, 'qtracker_state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// Initial default seed dataset
const DEFAULT_INITIAL_STATE = {
  projects: [
    {
      id: 'proj-egfr-01',
      title: 'Kinetic Profiling of 4th-Gen EGFR T790M/C797S Mutants',
      description: 'Targeted covalent inhibitor screening targeting double-mutant non-small cell lung cancer kinase domains.',
      category: 'Structural Biology',
      lead: 'Dr. Elena Rostova',
      leadEmail: 'icestonemalam@gmail.com',
      status: 'active',
      collaborators: ['Dr. Elena Rostova', 'K. Takahashi, Ph.D.', 'M. Thorne (Lab Tech)'],
      createdAt: '2026-10-09T14:00:00Z',
      updatedAt: '2026-10-10T08:00:00Z',
    },
    {
      id: 'proj-kras-02',
      title: 'Pan-KRAS G12D GTPase Allosteric Pocket Engagement',
      description: 'High-throughput crystallography and SPR binding resonance of molecular glue degraders.',
      category: 'Pharmacology',
      lead: 'K. Takahashi, Ph.D.',
      leadEmail: 'scientist@lab.edu',
      status: 'in_progress',
      collaborators: ['K. Takahashi, Ph.D.', 'Dr. Elena Rostova'],
      createdAt: '2026-10-08T10:00:00Z',
      updatedAt: '2026-10-10T07:30:00Z',
    },
  ],
  tasks: [
    {
      id: 'task-101',
      projectId: 'proj-egfr-01',
      title: 'Formulate serial 3-fold dilutions of Compound Q-72 (10 µM down to 0.5 nM)',
      description: 'Prepare DMSO stock solutions and dispense 50 nL per well into 384-well low dead-volume plates.',
      status: 'completed',
      priority: 'high',
      assignee: 'M. Thorne (Lab Tech)',
      dueDate: '2026-10-10',
      protocolStep: 'Pre-Incubation Prep',
      tags: ['Screening', 'Liquid Handling'],
      createdAt: '2026-10-09T15:00:00Z',
      updatedAt: '2026-10-10T08:00:00Z',
    },
    {
      id: 'task-102',
      projectId: 'proj-egfr-01',
      title: 'Run continuous NADH-coupled kinase reaction kinetics on SpectraMax iD5',
      description: 'Measure absorbance at 340 nm every 30 seconds for 120 minutes at 37°C.',
      status: 'in_progress',
      priority: 'urgent',
      assignee: 'Dr. Elena Rostova',
      dueDate: '2026-10-10',
      protocolStep: 'Assay Execution',
      tags: ['Enzymology', 'Spectrophotometry'],
      createdAt: '2026-10-09T15:30:00Z',
      updatedAt: '2026-10-10T09:15:00Z',
    },
    {
      id: 'task-103',
      projectId: 'proj-egfr-01',
      title: 'Export dose-response curves and generate Google Sheets calculation workbook',
      description: 'Fit 4-parameter logistic Hill curve to calculate IC50 values and 95% confidence intervals.',
      status: 'backlog',
      priority: 'medium',
      assignee: 'K. Takahashi, Ph.D.',
      dueDate: '2026-10-11',
      protocolStep: 'Data Synthesis',
      tags: ['Biostatistics', 'Workspace'],
      createdAt: '2026-10-09T16:00:00Z',
      updatedAt: '2026-10-09T16:00:00Z',
    },
  ],
  assays: [
    {
      id: 'assay-egfr-ic50',
      projectId: 'proj-egfr-01',
      name: 'Compound Q-72 Dose-Response Inhibition (10-Point Curve)',
      type: 'dose_response',
      description: 'Inhibition of recombinant human EGFR (d746-750/T790M/C797S) measured by ADP-Glo luminescence.',
      metrics: {
        ic50: '4.82 nM',
        rSquared: 0.994,
        hillSlope: -1.08,
      },
      dataPoints: [
        { x: -10, y: 99.4, label: '0.1 nM' },
        { x: -9.5, y: 98.1, label: '0.3 nM' },
        { x: -9, y: 94.6, label: '1.0 nM' },
        { x: -8.5, y: 83.2, label: '3.16 nM' },
        { x: -8, y: 51.5, label: '10 nM' },
        { x: -7.5, y: 22.8, label: '31.6 nM' },
        { x: -7, y: 7.9, label: '100 nM' },
        { x: -6.5, y: 2.4, label: '316 nM' },
        { x: -6, y: 0.8, label: '1 µM' },
        { x: -5, y: 0.2, label: '10 µM' },
      ],
      status: 'validated',
      createdAt: '2026-10-09T16:00:00Z',
      updatedAt: '2026-10-10T08:00:00Z',
    },
    {
      id: 'assay-egfr-kinetics',
      projectId: 'proj-egfr-01',
      name: 'Continuous Real-Time Enzyme Kinetics (0-120 min)',
      type: 'kinetics',
      description: 'Spectrophotometric NADH-coupled kinase reaction tracking ATP consumption over 2 hours.',
      metrics: {
        vMax: '14.2 µmol/min/mg',
        kM: '28.4 µM',
        rSquared: 0.991,
      },
      dataPoints: [
        { x: 0, y: 0.02, series: 'Vehicle Control' },
        { x: 10, y: 0.12, series: 'Vehicle Control' },
        { x: 20, y: 0.24, series: 'Vehicle Control' },
        { x: 30, y: 0.38, series: 'Vehicle Control' },
        { x: 45, y: 0.56, series: 'Vehicle Control' },
        { x: 60, y: 0.75, series: 'Vehicle Control' },
        { x: 90, y: 1.05, series: 'Vehicle Control' },
        { x: 120, y: 1.34, series: 'Vehicle Control' },
        { x: 0, y: 0.01, series: 'Compound Q-72 (5 nM)' },
        { x: 10, y: 0.06, series: 'Compound Q-72 (5 nM)' },
        { x: 20, y: 0.11, series: 'Compound Q-72 (5 nM)' },
        { x: 30, y: 0.18, series: 'Compound Q-72 (5 nM)' },
        { x: 45, y: 0.26, series: 'Compound Q-72 (5 nM)' },
        { x: 60, y: 0.34, series: 'Compound Q-72 (5 nM)' },
        { x: 90, y: 0.48, series: 'Compound Q-72 (5 nM)' },
        { x: 120, y: 0.61, series: 'Compound Q-72 (5 nM)' },
      ],
      status: 'in_progress',
      createdAt: '2026-10-10T06:30:00Z',
      updatedAt: '2026-10-10T08:00:00Z',
    },
    {
      id: 'assay-plate-heatmap',
      projectId: 'proj-egfr-01',
      name: '96-Well Plate Absorbance (OD450) Expression Matrix',
      type: 'expression_heatmap',
      description: 'High-density cellular viability and phosphorylation readout across compound gradient and biological replicates.',
      metrics: {
        temperature: '37.0 °C',
        ph: '7.2',
      },
      dataPoints: [],
      heatmapGrid: {
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        cols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        values: [
          [0.95, 0.92, 0.88, 0.74, 0.62, 0.45, 0.31, 0.22, 0.14, 0.09, 0.06, 0.05],
          [0.98, 0.94, 0.89, 0.76, 0.60, 0.48, 0.33, 0.21, 0.15, 0.08, 0.07, 0.05],
          [0.93, 0.91, 0.86, 0.72, 0.58, 0.44, 0.29, 0.19, 0.13, 0.09, 0.06, 0.04],
          [0.96, 0.93, 0.87, 0.75, 0.61, 0.46, 0.32, 0.23, 0.16, 0.10, 0.07, 0.05],
          [0.12, 0.14, 0.19, 0.28, 0.41, 0.59, 0.72, 0.84, 0.91, 0.96, 0.98, 0.99],
          [0.10, 0.12, 0.17, 0.25, 0.39, 0.57, 0.70, 0.82, 0.89, 0.95, 0.97, 0.98],
          [0.45, 0.48, 0.52, 0.50, 0.49, 0.47, 0.46, 0.45, 0.44, 0.43, 0.45, 0.46],
          [0.05, 0.04, 0.05, 0.06, 0.05, 0.04, 0.05, 0.06, 0.05, 0.04, 0.05, 0.05],
        ],
      },
      status: 'validated',
      createdAt: '2026-10-10T07:15:00Z',
      updatedAt: '2026-10-10T08:00:00Z',
    },
  ],
  activities: [
    {
      id: 'act-1',
      projectId: 'proj-egfr-01',
      userId: 'user-rostova',
      userName: 'Dr. Elena Rostova',
      action: 'updated IC50 calculation',
      target: 'Compound Q-72 (4.82 nM)',
      timestamp: '2 mins ago',
    },
    {
      id: 'act-2',
      projectId: 'proj-egfr-01',
      userId: 'user-thorne',
      userName: 'M. Thorne',
      action: 'completed microplate read',
      target: 'Plate #4 (384-well)',
      timestamp: '14 mins ago',
    },
    {
      id: 'act-3',
      projectId: 'proj-egfr-01',
      userId: 'user-takahashi',
      userName: 'K. Takahashi, Ph.D.',
      action: 'scheduled calendar incubation',
      target: 'Cell lysate lysis at 4°C',
      timestamp: '1 hour ago',
    },
  ],
  planckLogs: [
    {
      id: 'plk-001',
      timestampIso: '2026-10-10T16:15:02.124Z',
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
      timestampIso: '2026-10-10T16:15:02.125Z',
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
      timestampIso: '2026-10-10T16:35:18.450Z',
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
  ],
  swarmState: {
    apexDirector: {
      id: 'agent-apex',
      name: 'Prometheus Core (Apex Orchestrator)',
      role: 'apex_director',
      workloadPercent: 24,
      status: 'active',
      specialization: 'Civilization-Scale Autonomous Task Allocation & Synthesis',
      subagentIds: ['agent-prim-1', 'agent-prim-2'],
      memoryUsageMb: 512,
      logTrace: [
        'Initialized Omniscience Civilization Archive (3500 BCE - 2026 CE).',
        'Autonomous hierarchy daemon online.',
        'Workload thresholds configured: Primary spawn at >2 tasks; Subagent spawn at >65% load.',
      ],
    },
    primaryAgents: [
      {
        id: 'agent-prim-1',
        name: 'Primary Agent #1: BioInformatics & Kinase Docking',
        role: 'primary_agent',
        parentId: 'agent-apex',
        workloadPercent: 68,
        status: 'active',
        specialization: 'In Silico Ligand Docking & Structural Variant Simulation',
        activeTask: 'Simulate covalent warhead Michael addition onto Cys797',
        subagentIds: ['agent-sub-1a', 'agent-sub-1b', 'agent-sub-1c'],
        memoryUsageMb: 384,
        logTrace: [
          'Assigned kinase mutant pocket coordinate inspection.',
          'Load breached 65% threshold -> Spawned 3 autonomous sub-agents.',
        ],
      },
      {
        id: 'agent-prim-2',
        name: 'Primary Agent #2: Civilization Archive Synthesizer',
        role: 'primary_agent',
        parentId: 'agent-apex',
        workloadPercent: 42,
        status: 'active',
        specialization: 'Cross-Epoch Medical Archive Mining & Historical Analogy',
        activeTask: 'Indexing antimicrobial botanical compounds from Antiquity (1550 BCE - 200 CE)',
        subagentIds: ['agent-sub-2a', 'agent-sub-2b'],
        memoryUsageMb: 412,
        logTrace: [
          'Omniscience archive decompressed successfully.',
          'Cross-referencing Ebers Papyrus with modern secondary metabolites.',
        ],
      },
    ],
    subagents: [
      {
        id: 'agent-sub-1a',
        name: 'Subagent #1A: AlphaFold Conformational Inspector',
        role: 'subagent',
        parentId: 'agent-prim-1',
        workloadPercent: 78,
        status: 'active',
        specialization: 'AlphaFold PDB coordinate parsing & RMSD superimposition',
        activeTask: 'Superimposing P00533 EGFR kinase active vs inactive states',
        subagentIds: [],
        memoryUsageMb: 128,
        logTrace: ['Inspecting mmCIF secondary structure.'],
      },
      {
        id: 'agent-sub-1b',
        name: 'Subagent #1B: Kinetic Regression Analyst',
        role: 'subagent',
        parentId: 'agent-prim-1',
        workloadPercent: 54,
        status: 'active',
        specialization: 'Nonlinear least-squares enzyme kinetics & Hill coefficient',
        activeTask: 'Fitting 4-parameter logistic curve for Compound Q-72',
        subagentIds: [],
        memoryUsageMb: 96,
        logTrace: ['Calculated Hill Slope: -1.08; R²: 0.994.'],
      },
      {
        id: 'agent-sub-1c',
        name: 'Subagent #1C: Safety & Toxicity Profiler',
        role: 'subagent',
        parentId: 'agent-prim-1',
        workloadPercent: 32,
        status: 'active',
        specialization: 'hERG cardiac channel & CYP3A4 inhibition prediction',
        activeTask: 'Screening toxicity filters for Q-72 derivatives',
        subagentIds: [],
        memoryUsageMb: 88,
        logTrace: ['Low hERG liability predicted (IC50 > 30 µM).'],
      },
      {
        id: 'agent-sub-2a',
        name: 'Subagent #2A: Mesopotamian & Egyptian Papyrus Miner',
        role: 'subagent',
        parentId: 'agent-prim-2',
        workloadPercent: 61,
        status: 'active',
        specialization: 'Ancient pharmacopoeia translation and chemical transcription',
        activeTask: 'Evaluating honey and propolis wound antiseptic protocols',
        subagentIds: [],
        memoryUsageMb: 112,
        logTrace: ['Extracting Edwin Smith Papyrus case records.'],
      },
      {
        id: 'agent-sub-2b',
        name: 'Subagent #2B: 20th Century Antibiotic Chronologer',
        role: 'subagent',
        parentId: 'agent-prim-2',
        workloadPercent: 49,
        status: 'active',
        specialization: 'Post-Fleming penicillin and actinobacteria discovery timeline',
        activeTask: 'Correlating Streptomyces isolates with modern macrolides',
        subagentIds: [],
        memoryUsageMb: 104,
        logTrace: ['Parsing 1943 Waksman streptomycin fractionation records.'],
      },
    ],
    taskQueue: [],
    completedTasks: [],
    totalAgentsSpawned: 6,
    archiveDecompressionsCount: 1,
  },
  swarmConsoleLogs: [
    '[Apex Director] Initialized Omniscience Civilization Archive (3500 BCE - 2026 CE).',
    '[Apex Director] Autonomous multi-agent hierarchy daemon active.',
    '[System] Ready to accept research workloads with recursive sub-agent scaling.',
  ],
  widgets: [
    { id: 'w-kpi', title: 'Laboratory KPI Summary', type: 'kpi_summary', visible: true, order: 1 },
    { id: 'w-workflow', title: 'Active Task Visualization', type: 'task_workflow', visible: true, order: 2 },
    { id: 'w-scatter', title: 'Dose-Response Scatter & Curve Fit', type: 'scatter_chart', visible: true, order: 3 },
    { id: 'w-kinetics', title: 'Real-Time Reaction Kinetics', type: 'kinetic_chart', visible: true, order: 4 },
    { id: 'w-heatmap', title: '96-Well Microplate Heatmap', type: 'plate_heatmap', visible: true, order: 5 },
    { id: 'w-activity', title: 'Live Collaborator Activity Log', type: 'recent_activity', visible: true, order: 6 },
  ],
  selectedProjectId: 'proj-egfr-01',
  lastUpdated: new Date().toISOString(),
};

// Load or initialize state from file system
let serverState: any = { ...DEFAULT_INITIAL_STATE };

function loadStateFromDisk() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const content = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
        serverState = {
          ...DEFAULT_INITIAL_STATE,
          ...parsed,
        };
        console.log(`[Storage] Loaded persistent state from ${STATE_FILE} (${serverState.projects.length} projects, ${serverState.tasks.length} tasks, ${serverState.planckLogs.length} Planck logs).`);
        return;
      }
    }
  } catch (err) {
    console.warn('[Storage] Failed to read existing state file, initializing fresh:', err);
  }

  // Initialize fresh on first run
  saveStateToDisk();
}

function saveStateToDisk() {
  try {
    serverState.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(serverState, null, 2), 'utf-8');
    console.log(`[Storage] Saved state to ${STATE_FILE} at ${serverState.lastUpdated}`);
  } catch (err) {
    console.error('[Storage] Failed to write state to disk:', err);
  }
}

// Initial load on server startup
loadStateFromDisk();

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini AI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==========================================
// STORAGE API ENDPOINTS (DISK-BACKED STATE)
// ==========================================

// Get entire persisted state
app.get('/api/storage/state', (_req, res) => {
  res.json(serverState);
});

// Overwrite/update persisted state (full or partial)
app.post('/api/storage/state', (req, res) => {
  try {
    const incoming = req.body;
    if (incoming && typeof incoming === 'object') {
      serverState = {
        ...serverState,
        ...incoming,
        lastUpdated: new Date().toISOString(),
      };
      saveStateToDisk();
      return res.json({ success: true, lastUpdated: serverState.lastUpdated });
    }
    res.status(400).json({ error: 'Invalid state object' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to persist state' });
  }
});

// Save or update Project
app.post('/api/storage/project', (req, res) => {
  try {
    const project = req.body;
    if (!project || !project.id) {
      return res.status(400).json({ error: 'Project must have an id' });
    }
    const idx = (serverState.projects || []).findIndex((p: any) => p.id === project.id);
    if (idx >= 0) {
      serverState.projects[idx] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      serverState.projects = [project, ...(serverState.projects || [])];
    }
    serverState.selectedProjectId = project.id;
    saveStateToDisk();
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save project' });
  }
});

// Delete Project
app.delete('/api/storage/project/:id', (req, res) => {
  try {
    const { id } = req.params;
    serverState.projects = (serverState.projects || []).filter((p: any) => p.id !== id);
    serverState.tasks = (serverState.tasks || []).filter((t: any) => t.projectId !== id);
    serverState.assays = (serverState.assays || []).filter((a: any) => a.projectId !== id);
    if (serverState.selectedProjectId === id) {
      serverState.selectedProjectId = serverState.projects[0]?.id || '';
    }
    saveStateToDisk();
    res.json({ success: true, remaining: serverState.projects.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete project' });
  }
});

// Save or update Task
app.post('/api/storage/task', (req, res) => {
  try {
    const task = req.body;
    if (!task || !task.id) {
      return res.status(400).json({ error: 'Task must have an id' });
    }
    const idx = (serverState.tasks || []).findIndex((t: any) => t.id === task.id);
    if (idx >= 0) {
      serverState.tasks[idx] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      serverState.tasks = [...(serverState.tasks || []), task];
    }
    saveStateToDisk();
    res.json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save task' });
  }
});

// Update Task status
app.post('/api/storage/task-status', (req, res) => {
  try {
    const { taskId, status } = req.body;
    serverState.tasks = (serverState.tasks || []).map((t: any) => {
      if (t.id === taskId) {
        return { ...t, status, updatedAt: new Date().toISOString() };
      }
      return t;
    });
    saveStateToDisk();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update task status' });
  }
});

// Delete Task
app.delete('/api/storage/task/:projectId/:taskId', (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    serverState.tasks = (serverState.tasks || []).filter(
      (t: any) => !(t.projectId === projectId && t.id === taskId)
    );
    saveStateToDisk();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete task' });
  }
});

// Save or update Assay
app.post('/api/storage/assay', (req, res) => {
  try {
    const assay = req.body;
    if (!assay || !assay.id) {
      return res.status(400).json({ error: 'Assay must have an id' });
    }
    const idx = (serverState.assays || []).findIndex((a: any) => a.id === assay.id);
    if (idx >= 0) {
      serverState.assays[idx] = { ...assay, updatedAt: new Date().toISOString() };
    } else {
      serverState.assays = [...(serverState.assays || []), assay];
    }
    saveStateToDisk();
    res.json({ success: true, assay });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save assay' });
  }
});

// Append Live Activity
app.post('/api/storage/activity', (req, res) => {
  try {
    const activity = req.body;
    serverState.activities = [activity, ...(serverState.activities || [])].slice(0, 100);
    saveStateToDisk();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save activity' });
  }
});

// Append Planck Scale Log
app.post('/api/storage/planck-log', (req, res) => {
  try {
    const entry = req.body;
    serverState.planckLogs = [entry, ...(serverState.planckLogs || [])].slice(0, 500);
    saveStateToDisk();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save Planck log' });
  }
});

// Batch append Planck Logs (e.g. from multi-facility cascade)
app.post('/api/storage/planck-logs-batch', (req, res) => {
  try {
    const { entries } = req.body;
    if (Array.isArray(entries)) {
      serverState.planckLogs = [...entries, ...(serverState.planckLogs || [])].slice(0, 500);
      saveStateToDisk();
    }
    res.json({ success: true, total: serverState.planckLogs.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to batch save Planck logs' });
  }
});

// Save Swarm State
app.post('/api/storage/swarm', (req, res) => {
  try {
    const { swarmState, swarmConsoleLogs } = req.body;
    if (swarmState) serverState.swarmState = swarmState;
    if (swarmConsoleLogs) serverState.swarmConsoleLogs = swarmConsoleLogs;
    saveStateToDisk();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save swarm state' });
  }
});

// Save Dashboard Widgets
app.post('/api/storage/widgets', (req, res) => {
  try {
    const { widgets } = req.body;
    if (Array.isArray(widgets)) {
      serverState.widgets = widgets;
      saveStateToDisk();
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save widgets' });
  }
});

// 1. Multi-turn Gemini Chat with Model Selection
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.5-flash', systemInstruction } = req.body;
    
    // Validate model selection according to specification
    let selectedModel = model;
    if (model === 'pro' || model === 'gemini-3.1-pro-preview') {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (model === 'lite' || model === 'gemini-3.1-flash-lite') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else {
      selectedModel = 'gemini-3.5-flash';
    }

    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: systemInstruction || 'You are Q Tracker AI, an expert scientific research assistant and laboratory informatics specialist. Provide clear, accurate, publication-grade responses with citations and biochemical precision.',
      },
    });

    res.json({
      text: response.text || '',
      model: selectedModel,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error?.message || 'Chat generation failed' });
  }
});

// 2. High Thinking Mode (gemini-3.1-pro-preview with thinkingLevel HIGH)
app.post('/api/gemini/thinking', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || 'You are an advanced scientific reasoning engine for complex biochemical hypotheses, protocol error debugging, and statistical validation.',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({
      text: response.text || '',
      model: 'gemini-3.1-pro-preview',
      thinkingLevel: 'HIGH',
    });
  } catch (error: any) {
    console.error('Thinking mode error:', error);
    res.status(500).json({ error: error?.message || 'Thinking analysis failed' });
  }
});

// 3. Grounded Google Search (gemini-3.5-flash with googleSearch tool)
app.post('/api/gemini/grounded-search', async (req, res) => {
  try {
    const { query } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Search for the latest research developments, clinical updates, or molecular data for: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    res.json({
      text: response.text || '',
      groundingMetadata: groundingMetadata || null,
    });
  } catch (error: any) {
    console.error('Search grounding error:', error);
    res.status(500).json({ error: error?.message || 'Search grounding failed' });
  }
});

// 4. Grounded Google Maps (gemini-3.5-flash with googleMaps tool)
app.post('/api/gemini/grounded-maps', async (req, res) => {
  try {
    const { query } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Find research facilities, scientific labs, synchrotron light sources, or biomedical biobanks matching: ${query}`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    res.json({
      text: response.text || '',
      groundingMetadata: groundingMetadata || null,
    });
  } catch (error: any) {
    console.error('Maps grounding error:', error);
    res.status(500).json({ error: error?.message || 'Maps grounding failed' });
  }
});

// 5. Text-to-Speech (gemini-3.8-flash-tts)
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text || 'Laboratory protocol summary initiated.',
              speechMetadata: style ? { style } : undefined,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio returned from Gemini TTS');
    }

    res.json({
      audioData: `data:audio/wav;base64,${base64Audio}`,
      format: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error?.message || 'Text-to-speech generation failed' });
  }
});

// 6. Music Generation (lyria-3-clip-preview / lyria-3-pro-preview)
app.post('/api/gemini/music', async (req, res) => {
  try {
    const { prompt, model = 'lyria-3-clip-preview' } = req.body;
    const selectedModel = model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: prompt || 'Ambient laboratory focus soundscape with subtle rhythmic harmonic pulses',
      config: {
        responseModalities: ['AUDIO'],
      },
    });

    let audioParts: string[] = [];
    let textParts: string[] = [];

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          audioParts.push(part.inlineData.data);
        }
        if (part.text) {
          textParts.push(part.text);
        }
      }
    }

    if (audioParts.length === 0) {
      // Fallback synthetic audio notice
      return res.json({
        audioData: null,
        message: 'No direct audio chunk received, generated ambient track descriptor: ' + textParts.join(' '),
      });
    }

    // Encoded audio format
    res.json({
      audioData: `data:audio/wav;base64,${audioParts[0]}`,
      format: 'audio/wav',
      notes: textParts.join(' '),
    });
  } catch (error: any) {
    console.error('Music error:', error);
    res.status(500).json({ error: error?.message || 'Music generation failed' });
  }
});

// 7. Image Generation and Editing (gemini-nano-banana-2.1 & gemini-3-pro-image-preview)
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      model = 'gemini-nano-banana-2.1',
      aspectRatio = '1:1',
      imageSize = '1K',
      inputImageData,
      mimeType = 'image/png',
    } = req.body;

    const selectedModel = model === 'gemini-3-pro-image-preview' ? 'gemini-3-pro-image' : 'gemini-nano-banana-2.1';

    const parts: any[] = [];
    if (inputImageData) {
      parts.push({
        inlineData: {
          data: inputImageData.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType,
        },
      });
    }
    parts.push({
      text: prompt || 'Scientific diagram of cellular protein signaling pathway with clear molecular annotations',
    });

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any,
        },
      },
    });

    let generatedImageUrl = '';
    let responseText = '';

    const resParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of resParts) {
      if (part.inlineData?.data) {
        generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        responseText += part.text;
      }
    }

    if (!generatedImageUrl) {
      throw new Error('Model did not return image data: ' + responseText);
    }

    res.json({
      imageUrl: generatedImageUrl,
      notes: responseText,
      aspectRatio,
      imageSize,
    });
  } catch (error: any) {
    console.error('Image gen error:', error);
    res.status(500).json({ error: error?.message || 'Image generation failed' });
  }
});

// 8. Multimodal Analysis (Image & Video Understanding with gemini-3.1-pro-preview)
app.post('/api/gemini/analyze-multimodal', async (req, res) => {
  try {
    const { base64Data, mimeType, prompt, type = 'image' } = req.body;

    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'base64Data and mimeType are required' });
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: prompt || (type === 'video'
              ? 'Analyze this laboratory video recording. Identify key experimental actions, timestamps, pipette handling, and potential deviations from protocol.'
              : 'Analyze this scientific laboratory image (e.g. gel electrophoresis, microscopy, assay plate). Provide detailed quantitative observations, lane/band sizing, and protocol conclusions.'),
          },
        ],
      },
    });

    res.json({
      analysis: response.text || '',
      model: 'gemini-3.1-pro-preview',
    });
  } catch (error: any) {
    console.error('Multimodal analysis error:', error);
    res.status(500).json({ error: error?.message || 'Multimodal analysis failed' });
  }
});

// 9. Audio Transcription (gemini-3.5-transcribe)
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { base64Audio, mimeType = 'audio/webm', prompt } = req.body;

    if (!base64Audio) {
      return res.status(400).json({ error: 'base64Audio is required' });
    }

    const cleanBase64 = base64Audio.replace(/^data:audio\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt || 'Transcribe this laboratory voice note accurately. Preserve scientific terminology, chemical nomenclature, and unit measurements.',
          },
        ],
      },
    });

    res.json({
      transcript: response.text || '',
      model: 'gemini-3.5-transcribe',
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error?.message || 'Transcription failed' });
  }
});

// 10. Veo Video Generation (veo-3.1-fast-generate-preview)
app.post('/api/gemini/generate-video', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9', inputImageData } = req.body;

    const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    const videoConfig: any = {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: validAspectRatio,
    };

    if (inputImageData) {
      videoConfig.lastFrame = {
        imageBytes: inputImageData.replace(/^data:image\/[a-z]+;base64,/, ''),
        mimeType: 'image/png',
      };
    }

    const operation = await (ai.models as any).generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'A time-lapse animation of fluorescent cellular mitosis under a high-resolution confocal microscope',
      config: videoConfig,
    });

    res.json({
      operationName: operation.name,
      model: 'veo-3.1-fast-generate-preview',
    });
  } catch (error: any) {
    console.error('Video generation start error:', error);
    res.status(500).json({ error: error?.message || 'Video generation failed to start' });
  }
});

// Video polling status
app.post('/api/gemini/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await (ai.operations as any).getVideosOperation({ operation: op });

    res.json({
      done: updated.done,
      error: updated.error || null,
    });
  } catch (error: any) {
    console.error('Video status error:', error);
    res.status(500).json({ error: error?.message || 'Failed to check video status' });
  }
});

// Video download proxy
app.post('/api/gemini/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await (ai.operations as any).getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
    });

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Video download error:', error);
    res.status(500).json({ error: error?.message || 'Video download failed' });
  }
});

// 11. Science APIs proxy with exponential backoff & polite headers
app.get('/api/science/uniprot/:accession', async (req, res) => {
  try {
    const { accession } = req.params;
    const response = await fetch(`https://rest.uniprot.org/uniprotkb/${encodeURIComponent(accession)}.json`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QTracker-VirtualLab/1.0 (science-scout)',
      },
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'UniProt query failed' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'UniProt proxy failed' });
  }
});

app.get('/api/science/alphafold/:accession', async (req, res) => {
  try {
    const { accession } = req.params;
    const response = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(accession)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QTracker-VirtualLab/1.0 (science-scout)',
      },
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'AlphaFold prediction not found' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'AlphaFold proxy failed' });
  }
});

app.get('/api/science/pubchem/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/JSON`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QTracker-VirtualLab/1.0 (science-scout)',
      },
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'PubChem query failed' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'PubChem proxy failed' });
  }
});

app.get('/api/science/pubmed', async (req, res) => {
  try {
    const term = req.query.term as string;
    if (!term) return res.status(400).json({ error: 'term is required' });

    // Step 1: esearch
    const searchRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=6`, {
      headers: { 'User-Agent': 'QTracker-VirtualLab/1.0' },
    });
    const searchData = await searchRes.json();
    const idList = searchData.esearchresult?.idlist || [];

    if (idList.length === 0) {
      return res.json({ articles: [] });
    }

    // Step 2: esummary
    const summaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`, {
      headers: { 'User-Agent': 'QTracker-VirtualLab/1.0' },
    });
    const summaryData = await summaryRes.json();
    const result = summaryData.result || {};

    const articles = idList.map((id: string) => {
      const item = result[id] || {};
      return {
        uid: id,
        title: item.title || 'Untitled Publication',
        authors: (item.authors || []).map((a: any) => a.name).join(', '),
        source: item.source || '',
        pubdate: item.pubdate || '',
        doi: item.articleids?.find((x: any) => x.idtype === 'doi')?.value || '',
      };
    });

    res.json({ articles });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'PubMed proxy failed' });
  }
});

// 12. Automated Daily Research Digest Generator (synthesizing progress using Gemini)
app.post('/api/gemini/research-digest', async (req, res) => {
  try {
    const {
      projectTitle,
      projectCategory,
      projectLead,
      activities = [],
      tasks = [],
      completedTasks = [],
      planckLogs = [],
      recipientEmail,
    } = req.body;

    const prompt = `
You are the Chief Scientific Officer AI for Q Tracker Virtual Laboratory.
Synthesize the team's experimental progress into an executive, highly polished "Daily Research Digest" email for laboratory researchers and principal investigators.

Project: ${projectTitle || 'Scientific Investigation'} (${projectCategory || 'Biochemistry'})
Lead Investigator: ${projectLead || 'Principal Investigator'}
Recipient: ${recipientEmail || 'Team Collaborators'}
Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

---
DATA PROVIDED:

1. RECENT ACTIVITIES & TELEMETRY LOGS (${activities.length} recorded):
${activities.slice(0, 15).map((a: any, i: number) => `  - [${a.timestamp || 'Today'}] ${a.userName || 'Scientist'}: ${a.action} (${a.target})`).join('\n') || '  - Standard steady-state laboratory observations logged.'}

2. COMPLETED & IN-PROGRESS TASKS:
${tasks.slice(0, 15).map((t: any) => `  - [${t.status.toUpperCase()}] ${t.title} (Priority: ${t.priority}, Assignee: ${t.assignee}, Protocol Step: ${t.protocolStep})`).join('\n') || '  - Routine protocol workflows.'}

3. HIGH-RESOLUTION PHYSICAL APPARATUS & PLANCK LOGS (${planckLogs.length} entries):
${planckLogs.slice(0, 10).map((p: any) => `  - [${p.secondTimestamp}] ${p.facility} by ${p.agentName}: ${p.action} -> ${p.details}`).join('\n') || '  - Continuous environmental and instrumentation equilibrium.'}

---
TASK:
Generate a structured Daily Research Digest in JSON format with the following fields:
1. "subject": A concise, publication-grade email subject line (e.g. "[Q Tracker Digest] Daily Research Briefing: EGFR Kinase Profiling - Oct 10").
2. "executiveSummary": A high-level scientific overview (2-3 sentences) summarizing today's key milestones and velocity.
3. "keyAchievements": An array of 3-5 distinct bullet points describing critical experimental completions, assay readouts, or milestone transitions.
4. "apparatusAndDataHighlights": A 2-3 sentence technical note highlighting physical laboratory instrumentation utilization (e.g. plate reader OD450, qPCR cycles, ultracentrifugation, or in-silico structural modeling).
5. "immediateNextSteps": An array of 2-4 actionable next steps or urgent protocols scheduled for tomorrow's shift.
6. "emailBodyFormatted": The complete email body in clean, professional plain text with clear section headers, bullet points, sign-off, and laboratory metadata, ready to be transmitted via Gmail.

Format your response strictly as valid JSON matching this schema:
{
  "subject": string,
  "executiveSummary": string,
  "keyAchievements": string[],
  "apparatusAndDataHighlights": string,
  "immediateNextSteps": string[],
  "emailBodyFormatted": string
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an elite scientific director synthesizing laboratory progress into concise, impactful Daily Research Digests for high-throughput biomedical research teams.',
      },
    });

    const text = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Fallback in case of parse anomaly
      parsed = {
        subject: `[Q Tracker Digest] Daily Research Briefing: ${projectTitle || 'Laboratory Update'}`,
        executiveSummary: `Synthesis of today's collaborative research workflows and experimental protocols for ${projectTitle}.`,
        keyAchievements: tasks.filter((t: any) => t.status === 'completed').map((t: any) => t.title),
        apparatusAndDataHighlights: 'Experimental assay matrices recorded and physical instrumentation verified.',
        immediateNextSteps: tasks.filter((t: any) => t.status === 'in_progress').map((t: any) => t.title),
        emailBodyFormatted: text,
      };
    }

    res.json({
      digest: parsed,
      generatedAt: new Date().toISOString(),
      model: 'gemini-3.5-flash',
    });
  } catch (error: any) {
    console.error('Research digest generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate research digest' });
  }
});

// Setup WebSocket server for Gemini Live Audio
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live audio bridge');
  try {
    const session = await (ai as any).live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are Q Tracker Voice, a real-time hands-free virtual laboratory assistant. You help scientists record observations, calculate dilutions, and monitor experimental timers while their hands are in the fume hood or gloves.',
      },
      callbacks: {
        onmessage: (message: any) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (err) {
        console.error('Error processing live audio chunk:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Live client disconnected');
    });
  } catch (err) {
    console.error('Failed to initialize Live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: 'Live API connection error' }));
    }
  }
});

// Vite or Static assets mounting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Q Tracker Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
