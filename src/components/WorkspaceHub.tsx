import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Share2,
  HardDrive,
  FileSpreadsheet,
  Mail,
  Calendar,
  FileText,
  Presentation,
  CheckSquare,
  MessageSquare,
  Video,
  Users,
  CheckCircle2,
  ExternalLink,
  Send,
  AlertCircle,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { Project, Task, Assay } from '../types';
import {
  exportProjectToDrive,
  createAssaySpreadsheet,
  sendLabEmail,
  scheduleCalendarEvent,
  createGoogleDocProtocol,
  createGoogleSlidesPresentation,
  createGoogleTask,
  createGoogleMeetSpace,
  fetchGoogleContacts,
  postGoogleChatMessage,
} from '../lib/workspace';
import { ConfirmationModal } from './ConfirmationModal';

interface WorkspaceHubProps {
  project: Project;
  tasks: Task[];
  assays: Assay[];
  user: User | null;
  accessToken: string | null;
  onLogin: () => void;
  onOpenDailyDigest?: () => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  project,
  tasks,
  assays,
  user,
  accessToken,
  onLogin,
  onOpenDailyDigest,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);

  // Confirmation Modal States (Mandatory ABAC & Workspace Integration requirement)
  const [pendingAction, setPendingAction] = useState<{
    type: 'drive' | 'sheets' | 'gmail' | 'calendar' | 'docs' | 'slides' | 'tasks' | 'chat';
    title: string;
    description: string;
    affectedItems?: string[];
    isDestructive?: boolean;
    execute: () => Promise<void>;
  } | null>(null);

  // Form states for manual inputs
  const [emailRecipient, setEmailRecipient] = useState(project.leadEmail || 'colleague@university.edu');
  const [emailSubject, setEmailSubject] = useState(`[Q Tracker] Experimental Update: ${project.title}`);
  const [emailBody, setEmailBody] = useState(`Colleagues,\n\nThe latest microplate fluorometry run for ${project.title} has completed. IC50 confirmed at 4.82 nM with R² = 0.994.\n\nBest regards,\n${user?.displayName || 'Laboratory Lead'}`);

  const [calendarSummary, setCalendarSummary] = useState(`Plate Incubation: ${project.title}`);
  const [calendarDate, setCalendarDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  // Load contacts if logged in
  useEffect(() => {
    if (accessToken) {
      fetchGoogleContacts(accessToken)
        .then((data) => setContacts(data.connections || []))
        .catch(() => setContacts([]));
    }
  }, [accessToken]);

  const runWithConfirmation = (action: {
    type: 'drive' | 'sheets' | 'gmail' | 'calendar' | 'docs' | 'slides' | 'tasks' | 'chat';
    title: string;
    description: string;
    affectedItems?: string[];
    isDestructive?: boolean;
    execute: () => Promise<void>;
  }) => {
    if (!accessToken) {
      onLogin();
      return;
    }
    setPendingAction(action);
  };

  const executePendingAction = async () => {
    if (!pendingAction) return;
    try {
      await pendingAction.execute();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Action failed' });
    } finally {
      setPendingAction(null);
    }
  };

  // Actions
  const handleExportDrive = () => {
    runWithConfirmation({
      type: 'drive',
      title: 'Upload Project Dossier to Google Drive?',
      description: `This will create and upload a new markdown dossier file "${project.title}.md" containing all ${tasks.length} tasks and ${assays.length} assays to your personal Google Drive with your permission.`,
      affectedItems: [
        `File: Q-Tracker-Dossier-${project.title.slice(0, 30)}.md`,
        `Assays: ${assays.map((a) => a.name).join(', ')}`,
      ],
      execute: async () => {
        const res = await exportProjectToDrive(accessToken!, project, tasks, assays);
        setStatusMessage({
          type: 'success',
          text: `Dossier successfully uploaded to Google Drive!`,
          link: res.webViewLink || `https://drive.google.com/`,
        });
      },
    });
  };

  const handleCreateSheet = (assay: Assay) => {
    runWithConfirmation({
      type: 'sheets',
      title: `Export Assay to Google Sheets?`,
      description: `This will create a new Google Spreadsheet containing formatted measurement rows for "${assay.name}".`,
      affectedItems: [
        `Spreadsheet: Q Tracker - ${assay.name}`,
        `Data points: ${assay.dataPoints?.length || 0} rows`,
      ],
      execute: async () => {
        const res = await createAssaySpreadsheet(accessToken!, assay, project.title);
        setStatusMessage({
          type: 'success',
          text: `Spreadsheet created in Google Sheets!`,
          link: res.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${res.spreadsheetId}`,
        });
      },
    });
  };

  const handleSendGmail = () => {
    runWithConfirmation({
      type: 'gmail',
      title: 'Send Research Email via Gmail?',
      description: `This will send an email from your authorized Gmail address to ${emailRecipient}.`,
      affectedItems: [`Recipient: ${emailRecipient}`, `Subject: ${emailSubject}`],
      isDestructive: false,
      execute: async () => {
        await sendLabEmail(accessToken!, emailRecipient, emailSubject, emailBody);
        setStatusMessage({
          type: 'success',
          text: `Email successfully dispatched via Gmail to ${emailRecipient}!`,
        });
      },
    });
  };

  const handleScheduleCalendar = () => {
    const startIso = `${calendarDate}T10:00:00Z`;
    const endIso = `${calendarDate}T11:30:00Z`;
    runWithConfirmation({
      type: 'calendar',
      title: 'Schedule Lab Event in Google Calendar?',
      description: `This will add a 90-minute protocol milestone to your primary Google Calendar on ${calendarDate}.`,
      affectedItems: [`Event: [Q Tracker] ${calendarSummary}`, `Start: ${startIso}`],
      execute: async () => {
        const res = await scheduleCalendarEvent(
          accessToken!,
          calendarSummary,
          `Protocol scheduled from Q Tracker Virtual Laboratory for ${project.title}.`,
          startIso,
          endIso
        );
        setStatusMessage({
          type: 'success',
          text: `Event scheduled in Google Calendar!`,
          link: res.htmlLink || `https://calendar.google.com/`,
        });
      },
    });
  };

  const handleCreateDoc = () => {
    runWithConfirmation({
      type: 'docs',
      title: 'Generate Protocol Document in Google Docs?',
      description: `This will create a formatted research protocol document in your Google Docs.`,
      affectedItems: [`Document: Q Tracker Protocol: ${project.title}`],
      execute: async () => {
        const content = `Project Overview: ${project.description}\n\nAssay Specifications:\n${assays.map((a) => `- ${a.name} (${a.type}): ${JSON.stringify(a.metrics)}`).join('\n')}\n\nTask Milestones:\n${tasks.map((t) => `- ${t.title} [${t.status}] (Assignee: ${t.assignee})`).join('\n')}`;
        const res = await createGoogleDocProtocol(accessToken!, project.title, content);
        setStatusMessage({
          type: 'success',
          text: `Google Doc successfully created!`,
          link: `https://docs.google.com/document/d/${res.documentId}/edit`,
        });
      },
    });
  };

  const handleCreateSlides = () => {
    runWithConfirmation({
      type: 'slides',
      title: 'Generate Slide Deck in Google Slides?',
      description: `This will initialize a new laboratory presentation deck for ${project.title}.`,
      affectedItems: [`Presentation: Q Tracker Review: ${project.title}`],
      execute: async () => {
        const res = await createGoogleSlidesPresentation(accessToken!, project.title, project.category);
        setStatusMessage({
          type: 'success',
          text: `Presentation created in Google Slides!`,
          link: `https://docs.google.com/presentation/d/${res.presentationId}/edit`,
        });
      },
    });
  };

  const handleSyncTasks = () => {
    runWithConfirmation({
      type: 'tasks',
      title: 'Sync Protocol Milestones to Google Tasks?',
      description: `This will create ${tasks.length} task items in your default Google Tasks list with due dates and assignments.`,
      affectedItems: tasks.map((t) => `${t.title} (${t.status})`),
      execute: async () => {
        for (const t of tasks.slice(0, 5)) {
          await createGoogleTask(accessToken!, t.title, `${t.protocolStep} - Assigned: ${t.assignee}`, t.dueDate);
        }
        setStatusMessage({
          type: 'success',
          text: `Tasks pushed to Google Tasks! Open Google Tasks in your calendar or mobile app to view.`,
        });
      },
    });
  };

  const handleStartMeet = async () => {
    if (!accessToken) {
      onLogin();
      return;
    }
    try {
      const res = await createGoogleMeetSpace(accessToken);
      window.open(res.meetingUri || 'https://meet.google.com/new', '_blank');
      setStatusMessage({
        type: 'success',
        text: 'Google Meet space initiated!',
        link: res.meetingUri || 'https://meet.google.com/new',
      });
    } catch (err: any) {
      window.open('https://meet.google.com/new', '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200/60 uppercase">
                Google Workspace Integrated
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Drive • Sheets • Gmail • Calendar • Docs • Slides • Tasks • Chat • Meet • Contacts
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Laboratory Google Workspace Command Center
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Securely synchronized with your Google Workspace ecosystem to archive dossiers, broadcast notifications, and coordinate team milestones.
            </p>
          </div>

          {!accessToken ? (
            <button
              onClick={onLogin}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Sign in with Google to Connect
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Workspace Connected: {user?.email}</span>
            </div>
          )}
        </div>

        {/* Global Feedback Alert */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            {statusMessage.link && (
              <a
                href={statusMessage.link}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline flex items-center gap-1 ml-3"
              >
                Open in Google <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Grid of Workspace Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Google Drive */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <HardDrive className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Google Drive Dossier</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export a complete laboratory research dossier (.md) with experimental setups, assays, and tasks to your Google Drive.
            </p>
          </div>
          <button
            onClick={handleExportDrive}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            Export Project to Drive
          </button>
        </div>

        {/* 2. Google Sheets */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Google Sheets Sync</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Instantly compile assay tables, dose-response curves, and real-time kinetic curves into a new live Google Sheet.
            </p>
          </div>
          <button
            onClick={() => handleCreateSheet(assays[0])}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Sync Assay ({assays[0]?.name?.slice(0, 18)}...)
          </button>
        </div>

        {/* 3. Google Calendar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Google Calendar Protocol</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Schedule incubation times, plate reader slots, and experiment milestones directly into your calendar.
            </p>
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="mt-2 text-xs w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
            />
          </div>
          <button
            onClick={handleScheduleCalendar}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            Schedule Protocol Milestone
          </button>
        </div>

        {/* 4. Google Docs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Google Docs Report</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generate a formatted formal laboratory protocol document containing experimental conditions and task logs.
            </p>
          </div>
          <button
            onClick={handleCreateDoc}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Create Protocol Document
          </button>
        </div>

        {/* 5. Google Slides */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
              <Presentation className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Google Slides Review</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Create a presentation deck outline for lab group meetings and departmental scientific seminars.
            </p>
          </div>
          <button
            onClick={handleCreateSlides}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Presentation className="w-3.5 h-3.5 text-orange-600" />
            Create Presentation Deck
          </button>
        </div>

        {/* 6. Google Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Google Tasks Sync</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Push active protocol tasks and deadlines to Google Tasks so your team receives mobile and desktop reminders.
            </p>
          </div>
          <button
            onClick={handleSyncTasks}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-cyan-600" />
            Push Milestones to G-Tasks
          </button>
        </div>
      </div>

      {/* Interactive Communication Hub: Gmail, Meet & Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gmail Dispatcher */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Gmail Laboratory Alert & Report Dispatcher
              </h3>
            </div>
            {onOpenDailyDigest && (
              <button
                onClick={onOpenDailyDigest}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Synthesize Daily Digest</span>
              </button>
            )}
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Recipient Email</label>
              <input
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Message Body</label>
              <textarea
                rows={4}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSendGmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Email via Gmail
              </button>
            </div>
          </div>
        </div>

        {/* Google Meet & Contacts */}
        <div className="lg:col-span-5 space-y-5">
          {/* Google Meet Debrief Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-900">Instant Google Meet Lab Debrief</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Initiate a live video session with collaborators to review real-time assay outliers or protocol adjustments.
            </p>
            <button
              onClick={handleStartMeet}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              Launch Google Meet Session
            </button>
          </div>

          {/* Google Contacts Collaborator Directory */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">Google Contacts Directory</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {contacts.length} Connected
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto text-xs">
              {contacts.map((c, i) => {
                const name = c.names?.[0]?.displayName || 'Collaborator';
                const email = c.emailAddresses?.[0]?.value || '';
                return (
                  <div
                    key={i}
                    onClick={() => email && setEmailRecipient(email)}
                    className="p-2 bg-slate-50 hover:bg-blue-50 rounded border border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-800">{name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{email}</div>
                    </div>
                    <span className="text-[10px] text-blue-600 font-semibold">Select</span>
                  </div>
                );
              })}
              {contacts.length === 0 && (
                <div className="text-slate-400 text-xs py-2">
                  Sign in with Google to view your collaborative research contacts.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog (Strict requirement: Never mutate user data without explicit prompt) */}
      {pendingAction && (
        <ConfirmationModal
          isOpen={true}
          title={pendingAction.title}
          description={pendingAction.description}
          affectedItems={pendingAction.affectedItems}
          isDestructive={pendingAction.isDestructive}
          onConfirm={executePendingAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
};
