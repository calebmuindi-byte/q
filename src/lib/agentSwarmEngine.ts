import { searchCivilizationArchive, CIVILIZATION_DATA } from './civilizationArchive';
import { logApexAuthorizedAction } from './planckLogger';
import { PlanckLogEntry } from '../types';

export interface AgentNode {
  id: string;
  name: string;
  role: 'apex_director' | 'primary_agent' | 'subagent';
  parentId?: string;
  workloadPercent: number; // 0 - 100
  status: 'idle' | 'active' | 'spawning_subagents' | 'synthesizing' | 'completed';
  specialization: string;
  activeTask?: string;
  subagentIds: string[];
  memoryUsageMb: number;
  logTrace: string[];
}

export interface SwarmTask {
  id: string;
  title: string;
  description: string;
  complexity: number; // 1 to 10
  status: 'queued' | 'delegated' | 'processing' | 'completed';
  assignedAgentId?: string;
  result?: string;
  archiveCitations?: string[];
  createdAt: string;
}

export interface SwarmState {
  apexDirector: AgentNode;
  primaryAgents: AgentNode[];
  subagents: AgentNode[];
  taskQueue: SwarmTask[];
  completedTasks: SwarmTask[];
  totalAgentsSpawned: number;
  archiveDecompressionsCount: number;
}

export const INITIAL_SWARM_STATE: SwarmState = {
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
      workloadPercent: 42,
      status: 'active',
      specialization: 'Structural Biology, Protein Dynamics & Assay Kinetics',
      activeTask: 'Analyze EGFR T790M / C797S resistance mechanisms',
      subagentIds: ['agent-sub-1a'],
      memoryUsageMb: 256,
      logTrace: [
        'Assigned task: EGFR T790M resistance kinetics.',
        'Spawned Subagent #1A for active pocket conformational analysis.',
      ],
    },
    {
      id: 'agent-prim-2',
      name: 'Primary Agent #2: Civilization Archive Synthesizer',
      role: 'primary_agent',
      parentId: 'agent-apex',
      workloadPercent: 35,
      status: 'active',
      specialization: 'Historical Civilization Decompression & Scientific Evolution',
      activeTask: 'Decompress 5,000-year antibiotic and antiseptic chronology',
      subagentIds: [],
      memoryUsageMb: 280,
      logTrace: [
        'Unpacked Era II (Medieval Islamic Medicine) & Era IV (Germ Theory) index.',
        'Standing by for high-volume historical queries.',
      ],
    },
  ],
  subagents: [
    {
      id: 'agent-sub-1a',
      name: 'Subagent #1A: AlphaFold Conformational Inspector',
      role: 'subagent',
      parentId: 'agent-prim-1',
      workloadPercent: 68,
      status: 'active',
      specialization: 'Residue pLDDT Scoring & ATP Pocket Steric Hindrance',
      activeTask: 'Examine steric clash at Cys797 with covalent acrylamide warheads',
      subagentIds: [],
      memoryUsageMb: 128,
      logTrace: [
        'Decompressed AlphaFold model AF-P00533-F1.',
        'Computed steric volume delta for Cys797Ser: +18 Å³ clash.',
      ],
    },
  ],
  taskQueue: [],
  completedTasks: [
    {
      id: 'task-init-1',
      title: 'Synthesize Historical Evolution of Antimicrobial Agents (Ebers Papyrus to Penicillin)',
      description: 'Cross-examine botanical extracts from 1600 BCE with 1928 Fleming fungal observations.',
      complexity: 7,
      status: 'completed',
      assignedAgentId: 'agent-prim-2',
      result: 'Direct historical evolution traced: Honey/willow bark topical treatment in Edwin Smith papyrus (1600 BCE) evolved through Avicenna\'s 7 rules for clinical testing (1025 CE) to Fleming\'s observation of Penicillium notatum (1928 CE).',
      archiveCitations: [
        'Edwin Smith & Ebers Surgical Papyri (c. 1600 BCE)',
        'Avicenna: The Canon of Medicine (c. 1025 CE)',
        'Fleming: Discovery of Penicillin (1928 CE)',
      ],
      createdAt: '2026-10-10T08:00:00Z',
    },
  ],
  totalAgentsSpawned: 4,
  archiveDecompressionsCount: 28,
};

// Autonomously evaluate workload and spawn/delegate agents
export function dispatchSwarmTask(
  state: SwarmState,
  taskTitle: string,
  taskDescription: string,
  complexity: number
): { nextState: SwarmState; logMessages: string[] } {
  const newTaskId = `task-${Date.now()}`;
  const logs: string[] = [];

  const newTask: SwarmTask = {
    id: newTaskId,
    title: taskTitle,
    description: taskDescription,
    complexity,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };

  const updatedQueue = [...state.taskQueue, newTask];
  let primaryAgents = [...state.primaryAgents];
  let subagents = [...state.subagents];
  let totalSpawned = state.totalAgentsSpawned;
  let archiveDecompressions = state.archiveDecompressionsCount;

  // 1. Apex Director Workload Evaluation:
  // If queue has >= 2 tasks or total workload > 70%, autonomously spawn a new Primary Agent!
  let apexWorkload = Math.min(95, 20 + updatedQueue.length * 18);

  if (updatedQueue.length >= 2 || primaryAgents.length === 0) {
    totalSpawned++;
    const newPrimId = `agent-prim-${totalSpawned}`;
    const specialization =
      complexity > 7
        ? 'Deep Multi-Era Scientific Synthesis & Quantum Mechanics'
        : 'High-Throughput Assay Verification & Literature Cross-Examination';

    const newPrimAgent: AgentNode = {
      id: newPrimId,
      name: `Primary Agent #${totalSpawned}: Autonomous Task Handler`,
      role: 'primary_agent',
      parentId: 'agent-apex',
      workloadPercent: 55,
      status: 'active',
      specialization,
      activeTask: taskTitle,
      subagentIds: [],
      memoryUsageMb: 240,
      logTrace: [
        `Autonomously spawned by Apex Director due to task workload surge (${updatedQueue.length} pending tasks).`,
      ],
    };

    primaryAgents.push(newPrimAgent);
    logs.push(`[Apex Director] Workload surge detected (${apexWorkload}%). Autonomously spawned Primary Agent #${totalSpawned}.`);

    // Record Planck Log for autonomous Primary Agent spawn
    logApexAuthorizedAction({
      facility: 'Apex Orchestration Matrix',
      facilityCategory: 'tasks',
      agentId: 'agent-apex',
      agentName: 'Prometheus Core (Apex Orchestrator)',
      agentRole: 'apex_director',
      action: `AUTONOMOUS_SPAWN: Created ${newPrimAgent.name}`,
      details: `Workload index reached ${apexWorkload}%. Allocated domain specialization: ${specialization}`,
    });
  }

  // 2. Delegate the task to the best available Primary Agent
  const targetPrimary = primaryAgents.reduce((prev, curr) =>
    curr.workloadPercent < prev.workloadPercent ? curr : prev
  );

  newTask.status = 'processing';
  newTask.assignedAgentId = targetPrimary.id;
  targetPrimary.workloadPercent = Math.min(100, targetPrimary.workloadPercent + complexity * 6);
  targetPrimary.activeTask = taskTitle;

  logs.push(`[${targetPrimary.name}] Received task: "${taskTitle}". Internal workload raised to ${targetPrimary.workloadPercent}%.`);

  // Log Apex delegation to Primary Agent
  logApexAuthorizedAction({
    facility: 'Autonomous Swarm Engine',
    facilityCategory: 'tasks',
    agentId: targetPrimary.id,
    agentName: targetPrimary.name,
    agentRole: 'primary_agent',
    action: `TASK_DELEGATION: Dispatched "${taskTitle}"`,
    details: `Allocated to ${targetPrimary.name}. Agent load: ${targetPrimary.workloadPercent}%, Complexity: ${complexity}/10.`,
  });

  // 3. Recursive Sub-Agent Spawning Check:
  // If Primary Agent workload exceeds 65% OR task complexity >= 6:
  // Autonomous delegation to a specialized Sub-Agent!
  if (targetPrimary.workloadPercent >= 65 || complexity >= 6) {
    targetPrimary.status = 'spawning_subagents';
    totalSpawned++;
    const subagentId = `agent-sub-${totalSpawned}`;

    const subSpecialization = taskTitle.toLowerCase().includes('history') || taskTitle.toLowerCase().includes('civilization')
      ? 'Omniscience Civilization Archive Decompressor'
      : taskTitle.toLowerCase().includes('kinase') || taskTitle.toLowerCase().includes('protein')
      ? 'Biochemical Active Pocket & Structural Docking Subagent'
      : 'Algorithmic Data Consistency & Cross-Check Subagent';

    const newSubagent: AgentNode = {
      id: subagentId,
      name: `Subagent #${totalSpawned} (${subSpecialization.split(' ')[0]})`,
      role: 'subagent',
      parentId: targetPrimary.id,
      workloadPercent: 78,
      status: 'active',
      specialization: subSpecialization,
      activeTask: `Specialized micro-task: ${taskTitle}`,
      subagentIds: [],
      memoryUsageMb: 112,
      logTrace: [
        `Autonomously spawned by ${targetPrimary.name} because workload exceeded 65% threshold (complexity: ${complexity}/10).`,
      ],
    };

    subagents.push(newSubagent);
    targetPrimary.subagentIds.push(subagentId);
    logs.push(`[${targetPrimary.name}] Workload threshold breached (>=65%). Autonomously spawned ${newSubagent.name}.`);

    // Log Subagent spawn
    logApexAuthorizedAction({
      facility: 'Recursive Subagent Dispatcher',
      facilityCategory: 'tasks',
      agentId: targetPrimary.id,
      agentName: targetPrimary.name,
      agentRole: 'primary_agent',
      action: `RECURSIVE_SPAWN: Dispatched ${newSubagent.name}`,
      details: `Workload: ${targetPrimary.workloadPercent}%. Subagent specialization: ${subSpecialization}`,
    });

    // Decompress civilization archive if relevant
    archiveDecompressions++;
    const archiveMatches = searchCivilizationArchive(taskTitle);
    const citations = archiveMatches.slice(0, 3).map((r) => `${r.title} (${r.year})`);

    newSubagent.logTrace.push(`Decompressed civilization archive: Retrieved ${archiveMatches.length} historical-scientific records.`);
    logs.push(`[${newSubagent.name}] Decompressed Omniscience Archive: Extracted ${citations.length} cross-era reference records.`);

    // Log Civilization Archive Decompression down to Planck scale
    logApexAuthorizedAction({
      facility: 'Civilization Omniscience Archive (Compressed .ZIP)',
      facilityCategory: 'civilization_archive',
      agentId: newSubagent.id,
      agentName: newSubagent.name,
      agentRole: 'subagent',
      action: `ARCHIVE_DECOMPRESS: Query "${taskTitle.slice(0, 40)}"`,
      details: `Unpacked ${archiveMatches.length} historical-scientific records spanning 3500 BCE - 2026 CE. Citations: ${citations.join('; ')}`,
    });

    // Simulate completion
    newTask.status = 'completed';
    newTask.result = `Autonomously resolved by ${targetPrimary.name} with ${newSubagent.name}. Synthesized ${archiveMatches.length} historical-scientific data vectors spanning 3500 BCE to 2026 CE.`;
    newTask.archiveCitations = citations;

    logApexAuthorizedAction({
      facility: 'Autonomous Synthesis Pipeline',
      facilityCategory: 'tasks',
      agentId: newSubagent.id,
      agentName: newSubagent.name,
      agentRole: 'subagent',
      action: `TASK_RESOLVED: "${taskTitle.slice(0, 45)}"`,
      details: newTask.result,
    });
  } else {
    // Resolved directly by Primary Agent
    newTask.status = 'completed';
    newTask.result = `Executed directly by ${targetPrimary.name}. Parameters verified against laboratory standards.`;
    newTask.archiveCitations = ['Modern Biochemical Guidelines (2026)'];

    logApexAuthorizedAction({
      facility: 'Autonomous Synthesis Pipeline',
      facilityCategory: 'tasks',
      agentId: targetPrimary.id,
      agentName: targetPrimary.name,
      agentRole: 'primary_agent',
      action: `TASK_RESOLVED: "${taskTitle.slice(0, 45)}"`,
      details: newTask.result,
    });
  }

  // Update Apex Director
  const updatedApex: AgentNode = {
    ...state.apexDirector,
    workloadPercent: apexWorkload,
    subagentIds: primaryAgents.map((p) => p.id),
    logTrace: [...state.apexDirector.logTrace, ...logs],
  };

  return {
    nextState: {
      apexDirector: updatedApex,
      primaryAgents,
      subagents,
      taskQueue: updatedQueue.filter((t) => t.id !== newTaskId),
      completedTasks: [newTask, ...state.completedTasks],
      totalAgentsSpawned: totalSpawned,
      archiveDecompressionsCount: archiveDecompressions,
    },
    logMessages: logs,
  };
}

// Facility Access authorized by the Apex Director across all Q Tracker modules
export interface FacilityCommand {
  facilityId: string;
  facilityName: string;
  category: PlanckLogEntry['facilityCategory'];
  actionName: string;
  details: string;
}

export const Q_FACILITIES_CATALOG: FacilityCommand[] = [
  {
    facilityId: 'plate_reader',
    facilityName: 'SpectraMax iD5 Multi-Mode Plate Reader',
    category: 'virtual_lab',
    actionName: 'ACQUIRE_ABSORBANCE_SCAN',
    details: 'Initiate 96-well photometric scan at 450 nm. Baseline signal verified. Dynamic range: 0.04 - 0.99 OD.',
  },
  {
    facilityId: 'centrifuge',
    facilityName: 'Eppendorf 5424 R Refrigerated Centrifuge',
    category: 'virtual_lab',
    actionName: 'CHILLED_CENTRIFUGATION_RUN',
    details: 'Execute 14,000 RPM (21,130 × g) chilled pelleting at 4°C for 15 minutes. Rotor balance verified.',
  },
  {
    facilityId: 'qpcr',
    facilityName: 'Applied Biosystems QuantStudio 5 qPCR Cycler',
    category: 'virtual_lab',
    actionName: 'QPCR_AMPLIFICATION_RUN',
    details: '40-cycle SYBR Green real-time fluorescence acquisition. EGFR T790M Ct resolved at 21.4.',
  },
  {
    facilityId: 'confocal',
    facilityName: 'Leica TCS SP8 Laser Confocal Microscope',
    category: 'virtual_lab',
    actionName: 'CONFOCAL_ZSTACK_ACQUIRE',
    details: 'Acquire DAPI/GFP dual-channel fluorescence at 40x magnification. Pinhole: 1.0 Airy Unit.',
  },
  {
    facilityId: 'biobank',
    facilityName: 'Revco -80°C Ultra-Low Biobank & LN2 Cryo-Rack',
    category: 'virtual_lab',
    actionName: 'SPECIMEN_RETRIEVAL_AUDIT',
    details: 'Verified cold chain integrity for H1975 NSCLC cell vial (Rack 4, Box B). Viability 96.4%.',
  },
  {
    facilityId: 'dilution_bench',
    facilityName: 'Molarity & Buffer Preparation Calculation Engine',
    category: 'virtual_lab',
    actionName: 'BUFFER_MOLARITY_SOLVE',
    details: 'Computed stock dilution: 5.0 µL of 10 mM stock into 995.0 µL assay buffer for 50 µM target.',
  },
  {
    facilityId: 'kanban_tasks',
    facilityName: 'Laboratory Task & Protocol Workflow Engine',
    category: 'tasks',
    actionName: 'PROTOCOL_STATUS_ADVANCE',
    details: 'Advanced protocol task "Cryo-EM Grid Preparation" to Verified Complete. Logged to Firestore.',
  },
  {
    facilityId: 'assay_kinetics',
    facilityName: 'Assay Kinetics & IC50 4PL Regression Engine',
    category: 'assays',
    actionName: 'HILL_REGRESSION_FIT',
    details: 'Computed 10-point dose-response titration curve: LogIC50 = -8.31, Hill slope = -1.08, R² = 0.994.',
  },
  {
    facilityId: 'science_scout_3d',
    facilityName: 'AlphaFold DB & RCSB PDB 3D Structural Explorer',
    category: 'science_scout',
    actionName: 'PDB_MMCIF_COORDINATE_AUDIT',
    details: 'Inspected atomic coordinates for EGFR kinase domain conformer AF-P00533-F1. Cys797 SASA resolved.',
  },
  {
    facilityId: 'workspace_sheets',
    facilityName: 'Google Workspace: Sheets Real-Time Synchronizer',
    category: 'workspace',
    actionName: 'APPEND_TITRATION_DATASET',
    details: 'Pushed experimental run metrics to collaborative Google Sheets workbook via OAuth 2.0.',
  },
  {
    facilityId: 'workspace_drive',
    facilityName: 'Google Workspace: Drive Project Dossier Sync',
    category: 'workspace',
    actionName: 'SYNC_LAB_REPORT_DOSSIER',
    details: 'Uploaded Q-Tracker-Dossier-Kinetic-Profiling.md to authorized Google Drive folder.',
  },
  {
    facilityId: 'archive_decompress',
    facilityName: 'Civilization Omniscience Archive (Compressed .ZIP)',
    category: 'civilization_archive',
    actionName: 'DECOMPRESS_HISTORICAL_RECORD',
    details: 'Extracted ancient Sumerian willow bark to 1928 Fleming penicillin historical synthesis.',
  },
];

export function executeAgentFacilityAccess(
  agent: AgentNode,
  facilityCommand: FacilityCommand,
  customParamNote?: string
): PlanckLogEntry {
  const details = customParamNote ? `${facilityCommand.details} [Param: ${customParamNote}]` : facilityCommand.details;

  return logApexAuthorizedAction({
    facility: facilityCommand.facilityName,
    facilityCategory: facilityCommand.category,
    agentId: agent.id,
    agentName: agent.name,
    agentRole: agent.role,
    action: `APEX_AUTHORIZED_EXECUTION: ${facilityCommand.actionName}`,
    details,
  });
}
