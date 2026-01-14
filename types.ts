export enum MessageStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  REPLIED = 'REPLIED',
  NEEDS_REPLY = 'NEEDS_REPLY'
}

export interface ThreadMessage {
  id: string;
  sender: string;
  snippet: string;
  body: string;
  timestamp: string;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  fullBody: string;
  timestamp: string;
  status: MessageStatus;
  isThread: boolean; // Simulates if it's part of a larger conversation
  threadCount?: number;
  threadMessages?: ThreadMessage[]; // Full conversation history
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  location?: string;
  attendees?: string[];
  type: 'work' | 'personal' | 'health' | 'other';
}

// AI Analysis Types
export interface WorkflowCategory {
  categoryName: string;
  summary: string; // "What is happening"
  outstandingItems: string[]; // "What is outstanding"
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface OverviewItem {
  title: string;
  description: string;
}

export interface InboxTopic {
  topic: string;
  count: number;
  status: string; // e.g. "Action Needed", "Informational"
  description: string; // Brief summary of the topic
}

export interface InboxAnalysis {
  summary: string;
  topics: InboxTopic[];
}

export interface LifeAnalysis {
  overview: OverviewItem[];
  workflows: WorkflowCategory[];
  keyInsights: string[];
  inboxAnalysis: InboxAnalysis;
}