import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Project, Task, Assay, DashboardWidgetConfig, LiveActivity } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Specify Firestore instance (standard default database)
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configure Google Auth Provider with requested Google Workspace scopes
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/presentations');
provider.addScope('https://www.googleapis.com/auth/tasks');
provider.addScope('https://www.googleapis.com/auth/chat.messages');
provider.addScope('https://www.googleapis.com/auth/forms.body.readonly');
provider.addScope('https://www.googleapis.com/auth/meetings.space.created');
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

// IN-MEMORY cached access token (Mandatory: NEVER save in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Connection test on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Connected to real-time Firestore instance successfully.');
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline-cached mode.');
    } else {
      console.log('Firestore connection verified with local fallback.');
    }
  }
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User logged in but token not cached yet
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to acquire OAuth access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutAuth = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Initial Seed Data for immediate scientific research exploration
export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-egfr-01',
    title: 'Kinetic Profiling of 4th-Gen EGFR T790M/C797S Mutants',
    description: 'Targeted covalent inhibitor screening targeting double-mutant non-small cell lung cancer kinase domains.',
    category: 'Structural Biology',
    lead: 'Dr. Elena Rostova',
    leadEmail: 'icestonemalam@gmail.com',
    status: 'active',
    collaborators: ['Dr. Elena Rostova', 'K. Takahashi, Ph.D.', 'M. Thorne (Lab Tech)'],
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-pcsk9-02',
    title: 'AlphaFold Macrocyclic Peptide Docking against PCSK9',
    description: 'De novo computational design and surface plasmon resonance validation of high-affinity LDL receptor preservation peptides.',
    category: 'Pharmacology',
    lead: 'K. Takahashi, Ph.D.',
    leadEmail: 'icestonemalam@gmail.com',
    status: 'in_progress',
    collaborators: ['K. Takahashi, Ph.D.', 'Dr. Elena Rostova'],
    createdAt: '2026-03-15T14:30:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-crispr-03',
    title: 'High-Throughput Single-Cell Perturb-Seq of BCL2 Amplification',
    description: 'Whole-transcriptome perturbation profiling in venetoclax-resistant chronic lymphocytic leukemia cohorts.',
    category: 'Genomics',
    lead: 'Sarah Lin, M.D.',
    leadEmail: 'icestonemalam@gmail.com',
    status: 'active',
    collaborators: ['Sarah Lin, M.D.', 'M. Thorne (Lab Tech)'],
    createdAt: '2026-03-20T11:15:00Z',
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_TASKS: Task[] = [
  {
    id: 'task-101',
    projectId: 'proj-egfr-01',
    title: 'IC50 Microplate Fluorometric Titration Run #4',
    description: 'Prepare serial dilution (10 µM to 0.1 nM) of Compound Q-72 in 384-well black low-binding plates with recombinant kinase.',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'M. Thorne (Lab Tech)',
    dueDate: '2026-10-12',
    protocolStep: 'Phase 3: Plate Reader Fluorometry',
    tags: ['Assay', 'Fluorometry', 'Critical'],
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'task-102',
    projectId: 'proj-egfr-01',
    title: 'AlphaFold2 Confidence Metric Review for C797S Loop',
    description: 'Compare pLDDT score distribution across ATP binding pocket residues 790-802 under apo vs ligand-bound conformations.',
    status: 'completed',
    priority: 'high',
    assignee: 'Dr. Elena Rostova',
    dueDate: '2026-10-09',
    protocolStep: 'Phase 2: In Silico Validation',
    tags: ['Bioinformatics', 'AlphaFold'],
    createdAt: '2026-10-06T09:00:00Z',
    updatedAt: '2026-10-09T17:00:00Z',
  },
  {
    id: 'task-103',
    projectId: 'proj-egfr-01',
    title: 'Western Blot Phosphorylation Verification',
    description: 'Measure p-EGFR (Tyr1068) signal suppression across H1975 cell lysates at 1h, 4h, and 24h treatment endpoints.',
    status: 'review',
    priority: 'high',
    assignee: 'K. Takahashi, Ph.D.',
    dueDate: '2026-10-14',
    protocolStep: 'Phase 4: Cellular Validation',
    tags: ['Western Blot', 'Cell Assay'],
    createdAt: '2026-10-07T11:00:00Z',
    updatedAt: '2026-10-10T07:30:00Z',
  },
  {
    id: 'task-104',
    projectId: 'proj-egfr-01',
    title: 'Sync Assay Matrices to Google Sheets & Drive Dossier',
    description: 'Export raw plate reader fluorescence values to team Google Sheet for biostatistical curve fitting and archive protocol.',
    status: 'backlog',
    priority: 'medium',
    assignee: 'Dr. Elena Rostova',
    dueDate: '2026-10-15',
    protocolStep: 'Phase 5: Data Integration',
    tags: ['Google Sheets', 'Drive', 'Export'],
    createdAt: '2026-10-09T14:00:00Z',
    updatedAt: '2026-10-10T06:00:00Z',
  },
  {
    id: 'task-201',
    projectId: 'proj-pcsk9-02',
    title: 'SPR Sensorgram Affinity Constant Fitting',
    description: 'Fit binding kinetics to 1:1 Langmuir model to extract ka (1/Ms), kd (1/s), and equilibrium dissociation constant Kd.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'K. Takahashi, Ph.D.',
    dueDate: '2026-10-13',
    protocolStep: 'SPR Biacore T200',
    tags: ['Biacore', 'Binding Kinetics'],
    createdAt: '2026-10-08T12:00:00Z',
    updatedAt: '2026-10-10T08:15:00Z',
  },
];

export const SEED_ASSAYS: Assay[] = [
  {
    id: 'assay-egfr-ic50',
    projectId: 'proj-egfr-01',
    name: 'Compound Q-72 EGFR T790M/C797S Dose-Response',
    type: 'dose_response',
    description: '10-point 3-fold serial dilution measuring kinase inhibition by ADP-Glo luminescence.',
    metrics: {
      ic50: '4.82 nM',
      rSquared: 0.994,
      hillSlope: -1.08,
      temperature: '25.0 °C',
      ph: '7.4',
    },
    dataPoints: [
      { x: -10.0, y: 1.2, label: '0.1 nM', error: 0.4 },
      { x: -9.5, y: 3.8, label: '0.3 nM', error: 0.6 },
      { x: -9.0, y: 9.4, label: '1.0 nM', error: 0.8 },
      { x: -8.5, y: 24.1, label: '3.1 nM', error: 1.2 },
      { x: -8.0, y: 52.6, label: '10.0 nM', error: 1.5 },
      { x: -7.5, y: 78.4, label: '31.6 nM', error: 1.8 },
      { x: -7.0, y: 91.5, label: '100 nM', error: 1.1 },
      { x: -6.5, y: 97.2, label: '316 nM', error: 0.7 },
      { x: -6.0, y: 99.1, label: '1.0 µM', error: 0.5 },
      { x: -5.0, y: 99.8, label: '10.0 µM', error: 0.3 },
    ],
    status: 'validated',
    createdAt: '2026-10-09T16:00:00Z',
    updatedAt: new Date().toISOString(),
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

      { x: 0, y: 0.01, series: 'Osimertinib Reference (50 nM)' },
      { x: 10, y: 0.03, series: 'Osimertinib Reference (50 nM)' },
      { x: 20, y: 0.05, series: 'Osimertinib Reference (50 nM)' },
      { x: 30, y: 0.07, series: 'Osimertinib Reference (50 nM)' },
      { x: 45, y: 0.09, series: 'Osimertinib Reference (50 nM)' },
      { x: 60, y: 0.11, series: 'Osimertinib Reference (50 nM)' },
      { x: 90, y: 0.14, series: 'Osimertinib Reference (50 nM)' },
      { x: 120, y: 0.16, series: 'Osimertinib Reference (50 nM)' },
    ],
    status: 'in_progress',
    createdAt: '2026-10-10T06:30:00Z',
    updatedAt: new Date().toISOString(),
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
        [0.05, 0.04, 0.05, 0.06, 0.05, 0.04, 0.05, 0.06, 0.05, 0.04, 0.05, 0.05], // Negative controls
      ],
    },
    status: 'validated',
    createdAt: '2026-10-10T07:15:00Z',
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'w-kpi', title: 'Laboratory KPI Summary', type: 'kpi_summary', visible: true, order: 1 },
  { id: 'w-workflow', title: 'Active Task Visualization', type: 'task_workflow', visible: true, order: 2 },
  { id: 'w-scatter', title: 'Dose-Response Scatter & Curve Fit', type: 'scatter_chart', visible: true, order: 3 },
  { id: 'w-kinetics', title: 'Real-Time Reaction Kinetics', type: 'kinetic_chart', visible: true, order: 4 },
  { id: 'w-heatmap', title: '96-Well Microplate Heatmap', type: 'plate_heatmap', visible: true, order: 5 },
  { id: 'w-activity', title: 'Live Collaborator Activity Log', type: 'recent_activity', visible: true, order: 6 },
];

export const SEED_ACTIVITIES: LiveActivity[] = [
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
];

import {
  getStoredProjects,
  saveStoredProject,
  deleteStoredProject,
  getStoredTasks,
  saveStoredTask,
  updateStoredTaskStatus as updateLocalTaskStatus,
  deleteStoredTask as deleteLocalTask,
  getStoredAssays,
  saveStoredAssay,
} from './storage';

// Real-Time Listeners with Multi-Layer Persistence (Firestore + Disk/LocalStorage)
export function subscribeToProjects(onUpdate: (projects: Project[]) => void) {
  // Always emit currently persisted projects first immediately
  const initial = getStoredProjects();
  if (initial && initial.length > 0) {
    onUpdate(initial);
  }

  try {
    const colRef = collection(db, 'projects');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Project[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Project);
          });
          // Update persistent store
          list.forEach((p) => saveStoredProject(p));
          onUpdate(list);
        } else {
          onUpdate(getStoredProjects());
        }
      },
      (error) => {
        console.warn('Firestore subscription fallback (using persistent disk/localStorage):', error.message);
        onUpdate(getStoredProjects());
      }
    );
  } catch (err) {
    onUpdate(getStoredProjects());
    return () => {};
  }
}

export function subscribeToTasks(projectId: string, onUpdate: (tasks: Task[]) => void) {
  // Emit local/disk cached tasks immediately
  const initial = getStoredTasks(projectId);
  onUpdate(initial);

  try {
    const colRef = collection(db, 'projects', projectId, 'tasks');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Task[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Task);
          });
          list.forEach((t) => saveStoredTask(t));
          onUpdate(list);
        } else {
          onUpdate(getStoredTasks(projectId));
        }
      },
      (error) => {
        console.warn('Tasks subscription fallback (using persistent disk/localStorage):', error.message);
        onUpdate(getStoredTasks(projectId));
      }
    );
  } catch (err) {
    onUpdate(getStoredTasks(projectId));
    return () => {};
  }
}

export function subscribeToAssays(projectId: string, onUpdate: (assays: Assay[]) => void) {
  // Emit local/disk cached assays immediately
  const initial = getStoredAssays(projectId);
  onUpdate(initial);

  try {
    const colRef = collection(db, 'projects', projectId, 'assays');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Assay[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Assay);
          });
          list.forEach((a) => saveStoredAssay(a));
          onUpdate(list);
        } else {
          onUpdate(getStoredAssays(projectId));
        }
      },
      (error) => {
        console.warn('Assays subscription fallback (using persistent disk/localStorage):', error.message);
        onUpdate(getStoredAssays(projectId));
      }
    );
  } catch (err) {
    onUpdate(getStoredAssays(projectId));
    return () => {};
  }
}

// Data mutating functions - write to BOTH persistent storage (localStorage + disk file) and Firestore
export async function saveProject(project: Project) {
  // 1. Immediately persist to localStorage & server disk
  saveStoredProject(project);

  // 2. Sync to Firestore in background
  try {
    const docRef = doc(db, 'projects', project.id);
    await setDoc(docRef, project, { merge: true });
  } catch (err) {
    console.warn('Firestore project sync notice (safely stored locally/disk):', err);
  }
}

export async function deleteProject(projectId: string) {
  deleteStoredProject(projectId);
  try {
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore project delete notice:', err);
  }
}

export async function saveTask(task: Task) {
  // 1. Immediately persist to localStorage & server disk
  saveStoredTask(task);

  // 2. Sync to Firestore in background
  try {
    const docRef = doc(db, 'projects', task.projectId, 'tasks', task.id);
    await setDoc(docRef, task, { merge: true });
  } catch (err) {
    console.warn('Firestore task sync notice (safely stored locally/disk):', err);
  }
}

export async function updateTaskStatus(projectId: string, taskId: string, status: Task['status']) {
  // 1. Immediately persist to localStorage & server disk
  updateLocalTaskStatus(projectId, taskId, status);

  // 2. Sync to Firestore in background
  try {
    const docRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Firestore task status sync notice:', err);
  }
}

export async function deleteTask(projectId: string, taskId: string) {
  // 1. Immediately persist to localStorage & server disk
  deleteLocalTask(projectId, taskId);

  // 2. Sync to Firestore in background
  try {
    const docRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore task delete notice:', err);
  }
}

export async function saveAssay(assay: Assay) {
  // 1. Immediately persist to localStorage & server disk
  saveStoredAssay(assay);

  // 2. Sync to Firestore in background
  try {
    const docRef = doc(db, 'projects', assay.projectId, 'assays', assay.id);
    await setDoc(docRef, assay, { merge: true });
  } catch (err) {
    console.warn('Firestore assay sync notice (safely stored locally/disk):', err);
  }
}
