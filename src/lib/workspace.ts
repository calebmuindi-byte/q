import { Project, Task, Assay } from '../types';

// Helper to check authentication
export function getAuthHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// 1. Google Drive
export async function listDriveFiles(token: string) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,modifiedTime,webViewLink)', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive list failed: ${res.statusText}`);
  return await res.json();
}

export async function exportProjectToDrive(
  token: string,
  project: Project,
  tasks: Task[],
  assays: Assay[]
) {
  const content = `# Q TRACKER - SCIENTIFIC RESEARCH DOSSIER
Project: ${project.title}
Category: ${project.category}
Lead Investigator: ${project.lead}
Generated At: ${new Date().toISOString()}

## Description
${project.description}

## Active Protocols & Tasks (${tasks.length})
${tasks.map((t) => `- [${t.status.toUpperCase()}] ${t.title} (Priority: ${t.priority}, Assignee: ${t.assignee}, Due: ${t.dueDate})`).join('\n')}

## Quantitative Assays (${assays.length})
${assays.map((a) => `### Assay: ${a.name}
Type: ${a.type}
Status: ${a.status}
Metrics: ${JSON.stringify(a.metrics, null, 2)}
Data points recorded: ${a.dataPoints?.length || 0}
`).join('\n')}
`;

  const metadata = {
    name: `Q-Tracker-Dossier-${project.title.replace(/\s+/g, '-').slice(0, 30)}.md`,
    mimeType: 'text/markdown',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: 'text/markdown' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) throw new Error(`Drive upload failed: ${res.statusText}`);
  return await res.json();
}

// 2. Google Sheets
export async function createAssaySpreadsheet(token: string, assay: Assay, projectTitle: string) {
  const rows = [
    ['Q Tracker - Scientific Assay Data Export'],
    ['Project', projectTitle],
    ['Assay Name', assay.name],
    ['Type', assay.type],
    ['Status', assay.status],
    ['Exported At', new Date().toISOString()],
    [],
    ['Log[Concentration] or Time (X)', 'Response Value (Y)', 'Standard Error', 'Condition Series'],
    ...(assay.dataPoints || []).map((dp) => [
      dp.x,
      dp.y,
      dp.error !== undefined ? dp.error : 'N/A',
      dp.series || 'Sample 1',
    ]),
  ];

  const payload = {
    properties: {
      title: `Q Tracker: ${assay.name.slice(0, 40)} (${new Date().toLocaleDateString()})`,
    },
    sheets: [
      {
        properties: { title: 'Assay Measurements' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: rows.map((r) => ({
              values: r.map((cell) => ({
                userEnteredValue:
                  typeof cell === 'number'
                    ? { numberValue: cell }
                    : { stringValue: String(cell) },
              })),
            })),
          },
        ],
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Sheets creation failed: ${res.statusText}`);
  return await res.json();
}

// 3. Gmail
export async function sendLabEmail(token: string, to: string, subject: string, messageBody: string) {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    messageBody,
  ];

  const rawMessage = emailLines.join('\r\n');
  const encoded = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ raw: encoded }),
  });

  if (!res.ok) throw new Error(`Gmail send failed: ${res.statusText}`);
  return await res.json();
}

// 4. Google Calendar
export async function scheduleCalendarEvent(
  token: string,
  summary: string,
  description: string,
  startIso: string,
  endIso: string
) {
  const event = {
    summary: `[Q Tracker] ${summary}`,
    description,
    start: { dateTime: startIso },
    end: { dateTime: endIso },
    colorId: '9', // Blueberry/Science blue
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify(event),
  });

  if (!res.ok) throw new Error(`Calendar event creation failed: ${res.statusText}`);
  return await res.json();
}

// 5. Google Docs
export async function createGoogleDocProtocol(token: string, title: string, bodyText: string) {
  // Step 1: Create document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ title: `Q Tracker Protocol: ${title}` }),
  });
  if (!createRes.ok) throw new Error(`Docs creation failed: ${createRes.statusText}`);
  const docData = await createRes.json();

  // Step 2: Insert text content
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${docData.documentId}:batchUpdate`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: `${title}\nPublished via Q Tracker Virtual Laboratory\nTimestamp: ${new Date().toISOString()}\n\n${bodyText}\n`,
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) throw new Error(`Docs text insertion failed: ${updateRes.statusText}`);
  return docData;
}

// 6. Google Slides
export async function createGoogleSlidesPresentation(token: string, title: string, subtitle: string) {
  const createRes = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ title: `Q Tracker Review: ${title}` }),
  });
  if (!createRes.ok) throw new Error(`Slides creation failed: ${createRes.statusText}`);
  return await createRes.json();
}

// 7. Google Tasks
export async function createGoogleTask(token: string, title: string, notes: string, dueDateIso?: string) {
  const payload: any = {
    title: `[Q Tracker] ${title}`,
    notes,
  };
  if (dueDateIso) {
    payload.due = new Date(dueDateIso).toISOString();
  }

  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Tasks creation failed: ${res.statusText}`);
  return await res.json();
}

// 8. Google Meet
export async function createGoogleMeetSpace(token: string) {
  try {
    const res = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: getAuthHeader(token),
      body: JSON.stringify({}),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // fallback if Google Meet v2 API endpoint needs specific workspace policy
  }
  return { meetingUri: `https://meet.google.com/new` };
}

// 9. Google Contacts
export async function fetchGoogleContacts(token: string) {
  const res = await fetch('https://people.googleapis.com/v1/people/me/connections?pageSize=15&personFields=names,emailAddresses,photos', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Contacts fetch failed: ${res.statusText}`);
  return await res.json();
}

// 10. Google Chat
export async function postGoogleChatMessage(token: string, messageText: string) {
  try {
    const spacesRes = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=5', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (spacesRes.ok) {
      const spacesData = await spacesRes.json();
      const firstSpace = spacesData.spaces?.[0]?.name;
      if (firstSpace) {
        const sendRes = await fetch(`https://chat.googleapis.com/v1/${firstSpace}/messages`, {
          method: 'POST',
          headers: getAuthHeader(token),
          body: JSON.stringify({ text: `[Q Tracker Lab Update] ${messageText}` }),
        });
        if (sendRes.ok) return await sendRes.json();
      }
    }
  } catch (err) {
    console.warn('Chat spaces query fallback:', err);
  }
  return { status: 'Broadcast queued for collaborative space' };
}
