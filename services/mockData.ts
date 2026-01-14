import { CalendarEvent, Email, MessageStatus } from '../types';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);

const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 5);

const formatDate = (date: Date, hour: number, minute: number) => {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    title: 'Q3 Roadmap Review',
    description: 'Reviewing the engineering roadmap for the next quarter.',
    startTime: formatDate(today, 9, 0),
    endTime: formatDate(today, 10, 30),
    location: 'Conference Room A',
    attendees: ['alice@company.com', 'bob@company.com'],
    type: 'work',
  },
  {
    id: 'evt_2',
    title: 'Dentist Appointment',
    startTime: formatDate(today, 14, 0),
    endTime: formatDate(today, 15, 0),
    location: 'Downtown Dental',
    type: 'health',
  },
  {
    id: 'evt_3',
    title: 'Dinner with Sarah',
    startTime: formatDate(today, 19, 0),
    endTime: formatDate(today, 21, 0),
    location: 'Luigi\'s Italian',
    type: 'personal',
  },
  {
    id: 'evt_4',
    title: 'Team Standup',
    startTime: formatDate(tomorrow, 10, 0),
    endTime: formatDate(tomorrow, 10, 15),
    type: 'work',
  },
  {
    id: 'evt_5',
    title: 'Project Omega - Code Freeze',
    startTime: formatDate(tomorrow, 17, 0),
    endTime: formatDate(tomorrow, 17, 30),
    type: 'work',
  },
  {
    id: 'evt_6',
    title: 'Product Design Sync',
    startTime: formatDate(dayAfter, 11, 0),
    endTime: formatDate(dayAfter, 12, 0),
    location: 'Google Meet',
    type: 'work',
  },
  {
    id: 'evt_7',
    title: 'Lunch with Investors',
    startTime: formatDate(dayAfter, 13, 0),
    endTime: formatDate(dayAfter, 14, 30),
    location: 'Blue Hill',
    type: 'work',
  },
  {
    id: 'evt_8',
    title: 'Weekly Gym Session',
    startTime: formatDate(nextWeek, 18, 0),
    endTime: formatDate(nextWeek, 19, 30),
    location: 'FitLife Gym',
    type: 'health',
  }
];

export const MOCK_EMAILS: Email[] = [
  {
    id: 'em_1',
    sender: 'manager@company.com',
    subject: 'Urgent: Project Omega Timeline',
    snippet: 'We need to discuss the delays...',
    fullBody: 'Hi, we need to discuss the delays on Project Omega. Please send me your updated estimates by EOD.',
    timestamp: formatDate(today, 8, 30),
    status: MessageStatus.NEEDS_REPLY,
    isThread: true,
    threadCount: 3,
    threadMessages: [
      {
        id: 'msg_1_1',
        sender: 'manager@company.com',
        snippet: 'Initial timeline',
        body: 'Here is the initial timeline we agreed upon last month. Are we still on track?',
        timestamp: formatDate(today, 8, 0),
      },
      {
        id: 'msg_1_2',
        sender: 'me',
        snippet: 'Re: Initial timeline',
        body: 'We hit a few snags with the database migration. I will need a few more days.',
        timestamp: formatDate(today, 8, 15),
      },
      {
        id: 'msg_1_3',
        sender: 'manager@company.com',
        snippet: 'Delays',
        body: 'Hi, we need to discuss the delays on Project Omega. Please send me your updated estimates by EOD.',
        timestamp: formatDate(today, 8, 30),
      }
    ]
  },
  {
    id: 'em_2',
    sender: 'newsletter@techweekly.com',
    subject: 'This Week in AI: Gemini Updates',
    snippet: 'Check out the latest features in the Gemini API...',
    fullBody: 'Full newsletter content regarding AI updates...',
    timestamp: formatDate(today, 7, 0),
    status: MessageStatus.UNREAD,
    isThread: false,
    threadMessages: [
        {
            id: 'msg_2_1',
            sender: 'newsletter@techweekly.com',
            snippet: 'Check out the latest features in the Gemini API...',
            body: 'Full newsletter content regarding AI updates...',
            timestamp: formatDate(today, 7, 0),
        }
    ]
  },
  {
    id: 'em_3',
    sender: 'recruiter@competitor.com',
    subject: 'Opportunity at Generic Corp',
    snippet: 'I saw your profile and wanted to reach out...',
    fullBody: 'Hello, are you open to new opportunities? We have a Senior React role open.',
    timestamp: formatDate(today, 11, 15),
    status: MessageStatus.READ,
    isThread: false,
  },
  {
    id: 'em_4',
    sender: 'gym@fitlife.com',
    subject: 'Membership Renewal Warning',
    snippet: 'Your membership expires in 3 days.',
    fullBody: 'Please renew your membership to avoid interruption.',
    timestamp: formatDate(today, 12, 0),
    status: MessageStatus.UNREAD,
    isThread: false,
  },
  {
    id: 'em_5',
    sender: 'alice@company.com',
    subject: 'Re: Q3 Roadmap',
    snippet: 'I think we should deprioritize feature X.',
    fullBody: 'Agreed on the timeline, but I think we should deprioritize feature X for now.',
    timestamp: formatDate(today, 13, 45),
    status: MessageStatus.REPLIED,
    isThread: true,
    threadCount: 2,
    threadMessages: [
        {
            id: 'msg_5_1',
            sender: 'me',
            snippet: 'Q3 Roadmap Draft',
            body: 'Here is the first draft of the Q3 Roadmap. Let me know what you think.',
            timestamp: formatDate(today, 13, 0),
        },
        {
            id: 'msg_5_2',
            sender: 'alice@company.com',
            snippet: 'Re: Q3 Roadmap',
            body: 'Agreed on the timeline, but I think we should deprioritize feature X for now.',
            timestamp: formatDate(today, 13, 45),
        }
    ]
  },
  {
    id: 'em_6',
    sender: 'dad@family.com',
    subject: 'Weekend Plans?',
    snippet: 'Are you coming over for the BBQ?',
    fullBody: 'Hey! Just checking if you are still free for the BBQ this Saturday. Let me know!',
    timestamp: formatDate(today, 16, 20),
    status: MessageStatus.NEEDS_REPLY,
    isThread: false,
  }
];