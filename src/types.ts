export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'Structural Biology' | 'Biochemistry' | 'Genomics' | 'Pharmacology' | 'Oncology' | 'Synthetic Biology';
  lead: string;
  leadEmail?: string;
  status: 'active' | 'in_progress' | 'review' | 'completed' | 'paused';
  collaborators: string[];
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  protocolStep: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssayDataPoint {
  x: number; // e.g. concentration log(M) or time (min)
  y: number; // e.g. % inhibition, absorbance, or fluorescence
  label?: string;
  error?: number;
  series?: string;
}

export interface Assay {
  id: string;
  projectId: string;
  name: string;
  type: 'dose_response' | 'kinetics' | 'expression_heatmap';
  description: string;
  metrics: {
    ic50?: string;
    rSquared?: number;
    hillSlope?: number;
    vMax?: string;
    kM?: string;
    temperature?: string;
    ph?: string;
  };
  dataPoints: AssayDataPoint[];
  heatmapGrid?: {
    rows: string[]; // ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    cols: number[]; // [1, 2, ..., 12]
    values: number[][]; // 8x12 matrix (0.0 to 1.0 or normalized OD450)
  };
  status: 'in_progress' | 'validated' | 'replicate_needed';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  type: 'kpi_summary' | 'task_workflow' | 'scatter_chart' | 'kinetic_chart' | 'plate_heatmap' | 'recent_activity';
  visible: boolean;
  order: number;
}

export interface LiveActivity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface ProteinData {
  accession: string;
  name: string;
  gene: string;
  organism: string;
  sequenceLength: number;
  sequence?: string;
  functionSummary?: string;
  alphafoldUrl?: string;
  pdbId?: string;
  plddtConfidence?: 'Very High' | 'Confident' | 'Low' | 'Very Low';
  domains?: Array<{ name: string; start: number; end: number }>;
}

export interface CompoundData {
  cid: number;
  name: string;
  iupacName: string;
  smiles: string;
  molecularWeight: number;
  xlogp?: number;
  hBondDonorCount?: number;
  hBondAcceptorCount?: number;
  rotatableBondCount?: number;
  tpsa?: number;
  formula: string;
}

export interface PubMedArticle {
  uid: string;
  title: string;
  authors: string;
  source: string;
  pubdate: string;
  doi?: string;
}

export interface PlanckLogEntry {
  id: string;
  timestampIso: string;
  secondTimestamp: string; // e.g. "2026-10-10 16:20:05"
  fractionalSeconds: number; // e.g. 0.384729104
  subSecondNanoseconds: number; // e.g. 384729104 ns
  planckOffset: string; // e.g. "+1.428e-44 s (26.5 t_P)"
  planckUnits: string; // e.g. "2.648 × 10⁴⁴ t_P"
  fullPlanckTimestamp: string; // formatted full Planck scale string
  facility: string; // e.g. "SpectraMax Plate Reader", "Google Drive", "AlphaFold 3D Scout"
  facilityCategory: 'virtual_lab' | 'assays' | 'tasks' | 'science_scout' | 'workspace' | 'civilization_archive';
  agentId: string;
  agentName: string;
  agentRole: 'apex_director' | 'primary_agent' | 'subagent';
  action: string;
  details: string;
  apexAuthToken: string; // e.g. "AUTH-APEX-7F9A2B"
  status: 'AUTHORIZED' | 'EXECUTING' | 'COMMITTED' | 'VERIFIED';
}

export interface DailyResearchDigest {
  subject: string;
  executiveSummary: string;
  keyAchievements: string[];
  apparatusAndDataHighlights: string;
  immediateNextSteps: string[];
  emailBodyFormatted: string;
  generatedAt?: string;
  model?: string;
  recipientEmail?: string;
}

