import React, { useState } from 'react';
import {
  Brain,
  Network,
  GitBranch,
  Layers,
  Cpu,
  Archive,
  Download,
  Search,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Activity,
  History,
  FileCode,
  Terminal,
  Zap,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  SwarmState,
  AgentNode,
  SwarmTask,
  INITIAL_SWARM_STATE,
  dispatchSwarmTask,
  Q_FACILITIES_CATALOG,
  executeAgentFacilityAccess,
} from '../lib/agentSwarmEngine';
import { executeSimultaneousFacilityCascade } from '../lib/planckLogger';
import {
  generateCivilizationZip,
  searchCivilizationArchive,
  CIVILIZATION_DATA,
} from '../lib/civilizationArchive';

export const AgentSwarmView: React.FC = () => {
  const [swarmState, setSwarmState] = useState<SwarmState>(INITIAL_SWARM_STATE);
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskDesc, setCustomTaskDesc] = useState('');
  const [taskComplexity, setTaskComplexity] = useState(7);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[Apex Director] Initialized Omniscience Civilization Archive (3500 BCE - 2026 CE).',
    '[Apex Director] Autonomous multi-agent hierarchy daemon active.',
    '[System] Ready to accept research workloads with recursive sub-agent scaling.',
  ]);

  // Archive Browser State
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [selectedEraFilter, setSelectedEraFilter] = useState('all');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);

  // Facility Authorization State (Apex Director Authorizing Swarm across all Q Facilities)
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(Q_FACILITIES_CATALOG[0].facilityId);
  const [facilityRequestingAgentId, setFacilityRequestingAgentId] = useState<string>('agent-prim-1');
  const [facilityParamNote, setFacilityParamNote] = useState<string>('');
  const [lastAuthorizedToken, setLastAuthorizedToken] = useState<string | null>(null);

  const handleAuthorizeFacilityAccess = () => {
    const facility = Q_FACILITIES_CATALOG.find((f) => f.facilityId === selectedFacilityId) || Q_FACILITIES_CATALOG[0];
    const allAgents = [swarmState.apexDirector, ...swarmState.primaryAgents, ...swarmState.subagents];
    const agent = allAgents.find((a) => a.id === facilityRequestingAgentId) || swarmState.apexDirector;

    const entry = executeAgentFacilityAccess(agent, facility, facilityParamNote || undefined);
    setLastAuthorizedToken(entry.apexAuthToken);
    setConsoleLogs((prev) => [
      ...prev,
      `[Apex Director] AUTHORIZED FACILITY ACCESS: ${agent.name} -> ${facility.facilityName}. Token: ${entry.apexAuthToken} (Planck Scale Recorded: ${entry.planckUnits})`,
    ]);
  };

  const handleExecuteFullFacilityCascade = () => {
    const added = executeSimultaneousFacilityCascade();
    setLastAuthorizedToken(added[added.length - 1].apexAuthToken);
    setConsoleLogs((prev) => [
      ...prev,
      `[Apex Director] MULTI-FACILITY CASCADE: Executed simultaneous operations across ${added.length} Q facilities within 1 second. Each sub-action assigned sub-second nanoseconds and distinct Planck delta (+Δt_P).`,
    ]);
  };

  // Dispatch single or batch tasks
  const handleDispatch = (title: string, desc: string, complexity: number) => {
    const { nextState, logMessages } = dispatchSwarmTask(swarmState, title, desc, complexity);
    setSwarmState(nextState);
    setConsoleLogs((prev) => [...prev, ...logMessages]);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;
    handleDispatch(customTaskTitle.trim(), customTaskDesc.trim(), taskComplexity);
    setCustomTaskTitle('');
    setCustomTaskDesc('');
  };

  // Simulate heavy surge
  const handleSimulateSurge = (count: number) => {
    setIsProcessingBatch(true);
    const surgeTasks = [
      {
        title: 'Cross-Examine 5,000 Years of Anti-Inflammatory Compounds',
        desc: 'Trace Sumerian willow bark to aspirin and modern covalent kinase inhibitors.',
        comp: 8,
      },
      {
        title: 'Decompress Islamic Golden Age Optics to Modern Laser Confocal Microscopy',
        desc: 'Alhazen camera obscura principles applied to fluorophore diffraction limits.',
        comp: 7,
      },
      {
        title: 'AlphaFold Conformer Docking for Venetoclax Resistance',
        desc: 'Compute steric clash in BCL2 G101V mutant binding pocket.',
        comp: 9,
      },
      {
        title: 'Audit PCR Thermal Cycling Kinetics vs Lavoisier Conservation',
        desc: 'Check thermodynamic equilibrium in 40-cycle amplification.',
        comp: 6,
      },
      {
        title: 'Synthesize Human Civilization Evolutionary Biology Archive',
        desc: 'From Aristotle animal taxonomy to modern CRISPR gene editing.',
        comp: 8,
      },
      {
        title: 'High-Throughput Assay Quality Control Matrix Simulation',
        desc: 'Evaluate 384-well microplate Z-factors across chemical gradients.',
        comp: 5,
      },
    ];

    let currentState = swarmState;
    const allLogs: string[] = [];

    const toRun = surgeTasks.slice(0, count);
    toRun.forEach((task) => {
      const { nextState, logMessages } = dispatchSwarmTask(
        currentState,
        task.title,
        task.desc,
        task.comp
      );
      currentState = nextState;
      allLogs.push(...logMessages);
    });

    setSwarmState(currentState);
    setConsoleLogs((prev) => [...prev, ...allLogs]);
    setIsProcessingBatch(false);
  };

  // Download real ZIP file generated via JSZip
  const handleDownloadArchiveZip = async () => {
    setIsDownloadingZip(true);
    try {
      const { blob, totalBytes, fileCount } = await generateCivilizationZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'civilization_archive_3500BCE_2026CE.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setConsoleLogs((prev) => [
        ...prev,
        `[Archive Export] Successfully packed and downloaded civilization_archive.zip (${(totalBytes / 1024).toFixed(1)} KB, ${fileCount} files, DEFLATE Level 9).`,
      ]);
    } catch (err: any) {
      alert(`ZIP generation failed: ${err.message}`);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const filteredArchive = searchCivilizationArchive(archiveSearchQuery, selectedEraFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-md border border-purple-200/60 uppercase tracking-wider">
                Autonomous Recursive Multi-Agent Architecture
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Workload-Triggered Spawning • Dynamic Sub-Agents • Compressed Civilization Archive
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Autonomous Swarm Orchestration & Civilization Omniscience Archive
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              The Master Apex Director automatically spawns Primary Agents as research workloads increase. Primary Agents spawn specialized Sub-Agents when their load exceeds 65% or when specialized historical/biochemical computations are required.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400">TOTAL AGENTS</div>
              <div className="text-sm font-bold text-purple-700 font-mono">
                {1 + swarmState.primaryAgents.length + swarmState.subagents.length}
              </div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400">SUBAGENTS</div>
              <div className="text-sm font-bold text-blue-600 font-mono">
                {swarmState.subagents.length}
              </div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400">COMPLETED TASKS</div>
              <div className="text-sm font-bold text-emerald-600 font-mono">
                {swarmState.completedTasks.length}
              </div>
            </div>
          </div>
        </div>

        {/* Workload Influx Simulator Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Inject Task Influx:</span>
            <button
              onClick={() => handleSimulateSurge(1)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium transition-colors"
            >
              +1 Single Task
            </button>
            <button
              onClick={() => handleSimulateSurge(3)}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded font-medium transition-colors"
            >
              +3 Surge (Triggers Primary Spawn)
            </button>
            <button
              onClick={() => handleSimulateSurge(6)}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-medium transition-colors"
            >
              +6 Heavy Surge (Triggers Recursive Subagents!)
            </button>
          </div>

          {/* Download Zip CTA */}
          <button
            onClick={handleDownloadArchiveZip}
            disabled={isDownloadingZip}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingZip ? 'Packing ZIP...' : 'Download civilization_archive.zip'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Hierarchical Agent Tree + Civilization Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: The Recursive Multi-Agent Tree */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Autonomous Agent Hierarchy Tree
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Live Topology • Dynamic Branching
            </span>
          </div>

          {/* LEVEL 0: Apex Director */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => setSelectedAgent(swarmState.apexDirector)}
              className="p-4 bg-purple-50/80 border-2 border-purple-300 rounded-xl max-w-md w-full shadow-xs cursor-pointer hover:border-purple-500 transition-all text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse" />
                  <span className="font-bold text-purple-950 text-sm">
                    {swarmState.apexDirector.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded font-bold">
                  Apex Director
                </span>
              </div>

              <p className="text-[11px] text-purple-900 mt-1 font-medium">
                {swarmState.apexDirector.specialization}
              </p>

              {/* Workload Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-mono text-purple-900 mb-1">
                  <span>Workload Index</span>
                  <span>{swarmState.apexDirector.workloadPercent}%</span>
                </div>
                <div className="w-full bg-purple-200/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${swarmState.apexDirector.workloadPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Vertical Connecting Stem */}
            <div className="w-0.5 h-6 bg-purple-300 my-1" />
          </div>

          {/* LEVEL 1: Primary Agents */}
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                Primary Agent Tier ({swarmState.primaryAgents.length} Active)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {swarmState.primaryAgents.map((prim) => {
                const childSubagents = swarmState.subagents.filter((s) => s.parentId === prim.id);
                const isOverloaded = prim.workloadPercent >= 65;

                return (
                  <div key={prim.id} className="space-y-3">
                    {/* Primary Agent Card */}
                    <div
                      onClick={() => setSelectedAgent(prim)}
                      className={`p-3.5 rounded-xl border transition-all text-xs cursor-pointer shadow-2xs ${
                        isOverloaded
                          ? 'bg-amber-50/80 border-amber-300 hover:border-amber-500'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">{prim.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                          Primary
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                        {prim.specialization}
                      </p>

                      {prim.activeTask && (
                        <div className="mt-2 text-[10px] text-blue-700 bg-blue-50/80 px-2 py-1 rounded font-mono truncate border border-blue-100">
                          Task: {prim.activeTask}
                        </div>
                      )}

                      {/* Workload Bar */}
                      <div className="mt-2.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span>Internal Load</span>
                          <span className={isOverloaded ? 'text-amber-700 font-bold' : ''}>
                            {prim.workloadPercent}% {isOverloaded ? '(Spawned Subagent)' : ''}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isOverloaded ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${prim.workloadPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* LEVEL 2: Sub-Agents branched from this primary agent */}
                    {childSubagents.length > 0 && (
                      <div className="pl-4 border-l-2 border-purple-200 space-y-2">
                        <span className="text-[9px] font-mono text-purple-600 uppercase font-bold tracking-wider block">
                          Autonomous Subagents ({childSubagents.length})
                        </span>
                        {childSubagents.map((sub) => (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedAgent(sub)}
                            className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-xs shadow-2xs cursor-pointer hover:border-blue-400 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-blue-950 text-[11px] truncate">
                                {sub.name}
                              </span>
                              <span className="text-[9px] font-mono text-blue-700 bg-blue-100 px-1 rounded">
                                Leaf Specialist
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-0.5 truncate font-mono">
                              {sub.specialization}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span>Load: {sub.workloadPercent}%</span>
                              <span>RAM: {sub.memoryUsageMb} MB</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Task Injection Form */}
          <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Submit Influx Task to Swarm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                required
                value={customTaskTitle}
                onChange={(e) => setCustomTaskTitle(e.target.value)}
                placeholder="e.g. Synthesize Greek Aristotle vs 2026 AlphaFold biology"
                className="md:col-span-3 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Delegate Task
              </button>
            </div>
          </form>
        </div>

        {/* Right: Civilization Omniscience Archive (.ZIP) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-purple-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Civilization Omniscience Archive
                </h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  All Human Knowledge (3500 BCE - 2026 CE)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-bold">
              .ZIP DEFLATE
            </span>
          </div>

          {/* Search bar & Era Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={archiveSearchQuery}
                onChange={(e) => setArchiveSearchQuery(e.target.value)}
                placeholder="Search archive: penicillin, calculus, papyrus, surgery..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto text-[11px] font-medium pb-1">
              {[
                { id: 'all', label: 'All Eras' },
                { id: 'Ancient', label: 'Antiquity (3500BCE)' },
                { id: 'Golden Age', label: 'Medieval' },
                { id: 'Scientific Revolution', label: '1500-1800' },
                { id: 'Industrial', label: '1800-1950' },
                { id: 'Information', label: 'Modern 2026' },
              ].map((era) => (
                <button
                  key={era.id}
                  onClick={() => setSelectedEraFilter(era.id)}
                  className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                    selectedEraFilter === era.id
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>
          </div>

          {/* Archive Records List */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto text-xs pr-1">
            {filteredArchive.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors space-y-1"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">{rec.title}</h4>
                  <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 rounded shrink-0 ml-2">
                    {rec.year}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{rec.domain}</div>
                <p className="text-[11px] text-slate-700 leading-relaxed pt-0.5">
                  {rec.summary}
                </p>
                <div className="pt-1 flex flex-wrap gap-1 text-[10px] font-mono text-slate-500">
                  {rec.primarySources.slice(0, 2).map((s, idx) => (
                    <span key={idx} className="bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      📜 {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {filteredArchive.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                No archive records matched query.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* APEX DIRECTOR FACILITY AUTHORIZATION CONSOLE */}
      <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-indigo-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Apex Director Facility Authorization Console
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                  Full Q Facility Access
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Authorizes the agent swarm to execute operations across all apparatus, modules, workflows, and cloud storage in Q. All actions are verified with an Apex Auth Token and recorded in the Planck log ledger.
              </p>
            </div>
          </div>

          <button
            onClick={handleExecuteFullFacilityCascade}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Simultaneous Multi-Facility Cascade</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          {/* Agent Selector */}
          <div className="md:col-span-3 space-y-1">
            <label className="block font-semibold text-slate-700">Requesting Agent:</label>
            <select
              value={facilityRequestingAgentId}
              onChange={(e) => setFacilityRequestingAgentId(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value={swarmState.apexDirector.id}>
                {swarmState.apexDirector.name} (Apex Director)
              </option>
              {swarmState.primaryAgents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              {swarmState.subagents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Q Facility Target Selector */}
          <div className="md:col-span-5 space-y-1">
            <label className="block font-semibold text-slate-700">Target Q Facility / Apparatus:</label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            >
              {Q_FACILITIES_CATALOG.map((f) => (
                <option key={f.facilityId} value={f.facilityId}>
                  [{f.category.toUpperCase()}] {f.facilityName}
                </option>
              ))}
            </select>
          </div>

          {/* Parameter Note */}
          <div className="md:col-span-4 space-y-1">
            <label className="block font-semibold text-slate-700">Execution Parameters / Note:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={facilityParamNote}
                onChange={(e) => setFacilityParamNote(e.target.value)}
                placeholder="e.g. Plate #3, 450nm, 15 min"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <button
                onClick={handleAuthorizeFacilityAccess}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorize & Run</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Facility Details Card */}
        {(() => {
          const activeCmd = Q_FACILITIES_CATALOG.find((f) => f.facilityId === selectedFacilityId) || Q_FACILITIES_CATALOG[0];
          return (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 font-mono">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{activeCmd.actionName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded uppercase font-semibold">
                    {activeCmd.category}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] font-sans">{activeCmd.details}</div>
              </div>

              {lastAuthorizedToken && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] shrink-0 font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Last Token: {lastAuthorizedToken}</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Bottom Console & Completed Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Real-Time Agent Communication Console */}
        <div className="lg:col-span-6 bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-2xs font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>Inter-Agent Autonomous Protocol Log</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">STREAM: ACTIVE</span>
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto text-[11px] leading-relaxed pr-1">
            {consoleLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes('Apex Director')
                    ? 'text-purple-300'
                    : log.includes('Primary Agent')
                    ? 'text-blue-300'
                    : log.includes('Subagent')
                    ? 'text-cyan-300'
                    : 'text-slate-400'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Completed Multi-Agent Research Dossiers */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Synthesized Research Dossiers ({swarmState.completedTasks.length})
            </h3>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">
              Autonomous Resolutions
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto text-xs pr-1">
            {swarmState.completedTasks.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-900 text-xs">{t.title}</h4>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                    Complexity: {t.complexity}/10
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{t.result}</p>
                {t.archiveCitations && t.archiveCitations.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1 text-[10px] font-mono text-purple-700">
                    <span className="font-semibold">Citations:</span>
                    {t.archiveCitations.map((c, i) => (
                      <span key={i} className="bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
