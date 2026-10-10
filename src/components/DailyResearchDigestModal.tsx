import React, { useState, useEffect } from 'react';
import {
  Mail,
  Sparkles,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Calendar,
  Layers,
  FlaskConical,
  Users,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  ListTodo,
} from 'lucide-react';
import { Project, Task, LiveActivity, PlanckLogEntry, DailyResearchDigest } from '../types';
import { generateDailyResearchDigest } from '../lib/digestEngine';
import { sendLabEmail } from '../lib/workspace';
import { ConfirmationModal } from './ConfirmationModal';
import { User } from 'firebase/auth';

interface DailyResearchDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  tasks: Task[];
  activities: LiveActivity[];
  planckLogs: PlanckLogEntry[];
  user: User | null;
  accessToken: string | null;
  onLogin: () => void;
}

export const DailyResearchDigestModal: React.FC<DailyResearchDigestModalProps> = ({
  isOpen,
  onClose,
  project,
  tasks,
  activities,
  planckLogs,
  user,
  accessToken,
  onLogin,
}) => {
  const [recipientEmail, setRecipientEmail] = useState<string>(
    user?.email || project.leadEmail || 'icestonemalam@gmail.com'
  );
  const [digest, setDigest] = useState<DailyResearchDigest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Auto-fill recipient email when user or project changes
  useEffect(() => {
    if (user?.email) {
      setRecipientEmail(user.email);
    } else if (project.leadEmail) {
      setRecipientEmail(project.leadEmail);
    }
  }, [user, project]);

  // Confirmation modal state before sending email via Gmail
  const [showConfirmSendModal, setShowConfirmSendModal] = useState(false);

  // Generate digest using Gemini
  const handleSynthesizeDigest = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const result = await generateDailyResearchDigest({
        project,
        tasks,
        activities,
        planckLogs,
        recipientEmail,
      });
      setDigest(result.digest);
      setStatusMessage({
        type: 'info',
        text: `Synthesized with ${result.model || 'Gemini 3.5 Flash'} based on ${activities.length} activities and ${tasks.length} tasks.`,
      });
    } catch (err: any) {
      console.error('Synthesis failed:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to generate Daily Research Digest with Gemini.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy plain text digest
  const handleCopy = () => {
    if (!digest) return;
    const fullText = `Subject: ${digest.subject}\n\n${digest.emailBodyFormatted}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dispatch email via real Gmail API (or prompt Google Workspace auth)
  const handleInitiateSend = () => {
    if (!digest) return;
    if (!accessToken) {
      setStatusMessage({
        type: 'info',
        text: 'Please connect your Google Workspace account with Gmail permissions to transmit the digest.',
      });
      onLogin();
      return;
    }
    setShowConfirmSendModal(true);
  };

  const handleConfirmSendEmail = async () => {
    if (!digest || !accessToken) return;
    setShowConfirmSendModal(false);
    setIsSending(true);
    setStatusMessage(null);

    try {
      await sendLabEmail(accessToken, recipientEmail, digest.subject, digest.emailBodyFormatted);
      setStatusMessage({
        type: 'success',
        text: `Daily Research Digest email successfully transmitted to ${recipientEmail} via Gmail.`,
      });
    } catch (err: any) {
      console.error('Email send failed:', err);
      setStatusMessage({
        type: 'error',
        text: `Gmail transmission failed: ${err?.message || 'Check network or OAuth permissions.'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Daily Research Digest</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-800 rounded-full">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Gemini Synthesis
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically generate and transmit executive research progress emails to team members.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-medium p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-600">
              <FlaskConical className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium text-slate-700">{project.title}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <ListTodo className="w-3.5 h-3.5 text-slate-400" />
              <span>{completedCount} completed</span>
              <span>•</span>
              <span>{inProgressCount} active tasks</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{activities.length} activity logs</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSynthesizeDigest}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Synthesizing with Gemini...' : digest ? 'Re-Synthesize Digest' : 'Generate Digest'}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-600 ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Email Recipient Input */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Recipient Email (Team Member / PI)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="colleague@university.edu"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-600">
                  {user ? `Signed in as ${user.email}` : 'Google Workspace Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Digest Preview or Empty State */}
          {!digest && !isGenerating && (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                Generate Today's Research Digest
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Gemini will ingest real-time activity feeds, task completion logs, and Planck apparatus telemetry to synthesize an executive daily research progress report.
              </p>
              <button
                onClick={handleSynthesizeDigest}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Synthesize Daily Digest Now
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-16 space-y-4">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Synthesizing Daily Research Progress with Gemini...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Correlating {activities.length} activity entries, {tasks.length} tasks, and physical apparatus telemetry.
                </p>
              </div>
            </div>
          )}

          {digest && !isGenerating && (
            <div className="space-y-4">
              {/* Digest Executive Card */}
              <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Subject Line
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{digest.subject}</h3>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Executive Summary */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Executive Summary
                  </span>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-sans">
                    {digest.executiveSummary}
                  </p>
                </div>

                {/* Key Achievements */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Key Achievements Today
                  </span>
                  <ul className="mt-1 space-y-1">
                    {digest.keyAchievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Apparatus & Telemetry Note */}
                {digest.apparatusAndDataHighlights && (
                  <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200/50">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                      Physical Instrumentation & Assay Telemetry
                    </span>
                    <p className="text-xs text-blue-900 mt-0.5 leading-relaxed">
                      {digest.apparatusAndDataHighlights}
                    </p>
                  </div>
                )}

                {/* Immediate Next Steps */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Immediate Next Steps
                  </span>
                  <ul className="mt-1 space-y-1">
                    {digest.immediateNextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Formatted Full Email View */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Complete Plain-Text Email (Transmitted via Gmail)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ready for send
                  </span>
                </div>
                <textarea
                  readOnly
                  rows={9}
                  value={digest.emailBodyFormatted}
                  className="w-full p-3 text-xs bg-slate-900 text-slate-200 font-mono rounded-xl border border-slate-700 focus:outline-none leading-relaxed select-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sends via authorized Gmail API with ABAC confirmation</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Close
            </button>

            {digest && (
              <button
                onClick={handleInitiateSend}
                disabled={isSending}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                {isSending ? 'Transmitting via Gmail...' : 'Send Digest via Gmail'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal (Mandatory Workspace Integration Rule) */}
      {showConfirmSendModal && digest && (
        <ConfirmationModal
          isOpen={showConfirmSendModal}
          onCancel={() => setShowConfirmSendModal(false)}
          onConfirm={handleConfirmSendEmail}
          title="Transmit Daily Research Digest via Gmail"
          description={`You are about to transmit the synthesized Daily Research Digest email to ${recipientEmail} from your authorized Google Workspace account.`}
          affectedItems={[
            `Recipient: ${recipientEmail}`,
            `Subject: ${digest.subject}`,
            `Project: ${project.title}`,
            `Tasks Referenced: ${tasks.length} total tasks`,
            `Activity Logs: ${activities.length} entries`,
          ]}
          isDestructive={false}
          confirmLabel="Send Digest Email"
        />
      )}
    </div>
  );
};
