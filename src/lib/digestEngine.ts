import { DailyResearchDigest, Project, Task, LiveActivity, PlanckLogEntry } from '../types';

export interface GenerateDigestParams {
  project: Project;
  tasks: Task[];
  activities: LiveActivity[];
  planckLogs: PlanckLogEntry[];
  recipientEmail?: string;
}

export async function generateDailyResearchDigest(params: GenerateDigestParams): Promise<{
  digest: DailyResearchDigest;
  generatedAt: string;
  model: string;
}> {
  const completedTasks = params.tasks.filter((t) => t.status === 'completed');

  const res = await fetch('/api/gemini/research-digest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectTitle: params.project.title,
      projectCategory: params.project.category,
      projectLead: params.project.lead,
      recipientEmail: params.recipientEmail || params.project.leadEmail || 'team@lab.edu',
      activities: params.activities,
      tasks: params.tasks,
      completedTasks,
      planckLogs: params.planckLogs,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Failed to synthesize research digest`);
  }

  const data = await res.json();
  return data;
}
