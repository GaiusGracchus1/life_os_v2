import { CalendarEvent, Email, MessageStatus, ThreadMessage } from '../types';

// Types for the Google Client
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
          revoke: (accessToken: string, callback: () => void) => void;
        }
      }
    };
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<void>;
        setToken: (token: any) => void;
        getToken: () => any;
        calendar?: {
          events: {
            list: (params: any) => Promise<{ result: { items: GapiCalendarEvent[] } }>;
          }
        };
        gmail?: {
          users: {
            threads: {
              list: (params: any) => Promise<{ result: { threads?: GapiThreadRef[] } }>;
              get: (params: any) => Promise<{ result: GapiThreadDetail }>;
            }
          }
        }
      }
    };
  }
}

// --- Google API Interfaces ---

interface GapiCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

interface GapiThreadRef {
  id: string;
  snippet: string;
  historyId: string;
}

interface GapiThreadDetail {
  id: string;
  historyId: string;
  messages: GapiMessage[];
}

interface GapiMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: GapiMessagePayload;
}

interface GapiMessagePayload {
  mimeType: string;
  headers: GapiHeader[];
  body?: GapiMessageBody;
  parts?: GapiMessagePart[];
}

interface GapiHeader {
  name: string;
  value: string;
}

interface GapiMessagePart {
  mimeType: string;
  body?: GapiMessageBody;
  parts?: GapiMessagePart[];
}

interface GapiMessageBody {
  size: number;
  data?: string;
}

// ---------------------------

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'
];

const SCOPES = 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/gmail.readonly';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGoogleClient = async (clientId: string) => {
  return new Promise<void>((resolve, reject) => {
    if (gapiInited && gisInited) {
      resolve();
      return;
    }

    if (!clientId) {
      console.warn("Google Client ID is missing. Auth will not work.");
      resolve();
      return;
    }

    const checkScripts = () => {
      if (typeof window !== 'undefined' && window.gapi && window.google) {
        initializeGapi();
        initializeGis(clientId);
      } else {
        setTimeout(checkScripts, 100);
      }
    };

    const initializeGapi = () => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
          });
          gapiInited = true;
          if (gisInited) resolve();
        } catch (err) {
          console.error("GAPI Init Error", err);
          // We resolve anyway to allow the app to load, 
          // though API calls might fail later.
          resolve();
        }
      });
    };

    const initializeGis = (cid: string) => {
      try {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: cid,
          scope: SCOPES,
          callback: '', // defined at request time
        });
        gisInited = true;
        if (gapiInited) resolve();
      } catch (err) {
        console.error("GIS Init Error", err);
        resolve(); // resolve to prevent app blocking
      }
    };

    checkScripts();
  });
};

export const loginToGoogle = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      return reject(new Error("Google Identity Services not initialized. Check Client ID and Network."));
    }

    tokenClient.callback = (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        return;
      }

      // CRITICAL: Set the token for GAPI client to enable API calls
      if (window.gapi.client) {
        window.gapi.client.setToken(resp);
      }

      resolve();
    };

    // Trigger the popup
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const logoutFromGoogle = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {
      window.gapi.client.setToken(null);
      console.log('Token revoked');
    });
  }
};

// --- Helper Functions for Data Parsing ---

const getHeader = (headers: GapiHeader[], name: string) => {
  if (!headers) return '';
  const header = headers.find((h) => h.name === name);
  return header ? header.value : '';
};

const decodeBody = (data: string) => {
  if (!data) return '';
  try {
    const cleanData = data.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(escape(window.atob(cleanData)));
  } catch (e) {
    console.error("Error decoding email body", e);
    return "";
  }
};

// Recursive function needs return type explicit or inferred.
const getEmailBody = (part: GapiMessagePart | GapiMessagePayload): string => {
  if (!part) return '';

  // If the message has a body data directly
  if (part.body && part.body.size > 0 && part.body.data) {
    return decodeBody(part.body.data);
  }

  // If multipart
  if (part.parts) {
    // 1. Try to find plain text first
    for (const p of part.parts) {
      if (p.mimeType === 'text/plain') {
        return getEmailBody(p);
      }
    }
    // 2. Try to find HTML
    for (const p of part.parts) {
      if (p.mimeType === 'text/html') {
        const html = getEmailBody(p);
        // Strip HTML tags for simplicity in this view
        return html.replace(/<[^>]*>?/gm, ' ');
      }
    }
    // 3. Recursively check nested parts (e.g. multipart/related inside multipart/alternative)
    for (const p of part.parts) {
      // Only recurse if it's a multipart container
      if (p.mimeType.startsWith('multipart/')) {
        const res = getEmailBody(p);
        if (res) return res;
      }
    }
  }

  return '';
};

// --- Data Fetching ---

export const fetchGoogleEvents = async (): Promise<CalendarEvent[]> => {
  try {
    if (!window.gapi.client.calendar) {
      throw new Error("Calendar API not loaded");
    }

    const response = await window.gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 50,
      'orderBy': 'startTime'
    });

    const events = response.result.items;
    return events.map((event) => {
      // Handle Date Parsing safely
      // Google sends 'date' for all-day events (YYYY-MM-DD)
      // Google sends 'dateTime' for timed events (ISO string with offset)
      let start = event.start.dateTime;
      let end = event.end.dateTime;

      if (!start && event.start.date) {
        // Force local time for all-day events to prevent timezone shifts
        start = `${event.start.date}T00:00:00`;
      }
      if (!end && event.end.date) {
        end = `${event.end.date}T00:00:00`;
      }

      return {
        id: event.id,
        title: event.summary || 'No Title',
        description: event.description,
        startTime: start || new Date().toISOString(),
        endTime: end || new Date().toISOString(),
        location: event.location,
        type: 'work',
      };
    });
  } catch (error) {
    console.error("Error fetching events", error);
    throw error;
  }
};

export const fetchGoogleEmails = async (): Promise<Email[]> => {
  try {
    if (!window.gapi.client.gmail) {
      throw new Error("Gmail API not loaded");
    }

    // 1. List Threads instead of Messages to get context
    const listResponse = await window.gapi.client.gmail.users.threads.list({
      'userId': 'me',
      'maxResults': 15, // Fetch slightly more to ensure we have good data
      'q': 'category:primary'
    });

    const threads = listResponse.result.threads;
    if (!threads) return [];

    // 2. Fetch details for each thread
    const threadPromises = threads.map(async (t) => {
      try {
        const detail = await window.gapi.client.gmail.users.threads.get({
          'userId': 'me',
          'id': t.id
        });

        const messages = detail.result.messages;
        if (!messages || messages.length === 0) return null;

        // Sort messages chronologically
        messages.sort((a, b) => parseInt(a.internalDate) - parseInt(b.internalDate));

        // The last message is the "latest" one we display in the list
        const lastMsg = messages[messages.length - 1];
        const payload = lastMsg.payload;
        const headers = payload.headers;

        const isUnread = messages.some((m) => m.labelIds && m.labelIds.includes('UNREAD'));
        const sender = getHeader(headers, 'From');
        const subject = getHeader(headers, 'Subject');
        const fullBody = getEmailBody(payload);
        // Use message snippet which is often cleaner than body parsing
        const snippet = lastMsg.snippet;

        // Map full history
        const threadMessages: ThreadMessage[] = messages.map((m) => ({
          id: m.id,
          sender: getHeader(m.payload.headers, 'From'),
          snippet: m.snippet,
          body: getEmailBody(m.payload),
          timestamp: new Date(parseInt(m.internalDate)).toISOString()
        }));

        return {
          id: t.id,
          sender: sender,
          subject: subject,
          snippet: snippet,
          fullBody: fullBody,
          timestamp: new Date(parseInt(lastMsg.internalDate)).toISOString(),
          status: isUnread ? MessageStatus.UNREAD : MessageStatus.READ,
          isThread: messages.length > 1,
          threadCount: messages.length,
          threadMessages: threadMessages
        } as Email;
      } catch (e) {
        console.error("Failed to fetch thread detail", e);
        return null;
      }
    });

    const results = await Promise.all(threadPromises);
    return results.filter((e): e is Email => e !== null);

  } catch (error) {
    console.error("Error fetching emails", error);
    throw error;
  }
};