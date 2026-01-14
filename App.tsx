import React, { useState, useEffect } from 'react';
import { CalendarView } from './components/CalendarView';
import { EmailView } from './components/EmailView';
import { WorkflowView } from './components/WorkflowView';
import { StatCard } from './components/StatCard';
import { MOCK_CALENDAR_EVENTS, MOCK_EMAILS } from './services/mockData';
import { analyzeLifeData } from './services/geminiService';
import { initGoogleClient, loginToGoogle, fetchGoogleEvents, fetchGoogleEmails, logoutFromGoogle } from './services/googleService';
import { LifeAnalysis, MessageStatus, Email, CalendarEvent } from './types';
import { LayoutDashboard, Mail, Calendar as CalendarIcon, Activity, RefreshCw, KeyRound, Info, LogOut } from 'lucide-react';

type Section = 'summary' | 'schedule' | 'inbox';

// Specific Client ID configured for this application
const ENV_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '568153049799-fqsuvrkj1jarirrt755sdij0hdvna8pf.apps.googleusercontent.com';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('summary');
  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [lifeAnalysis, setLifeAnalysis] = useState<LifeAnalysis | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Manage Client ID state to support manual entry
  const [clientId, setClientId] = useState<string>(() => {
    return ENV_CLIENT_ID || localStorage.getItem('lifeos_google_client_id') || '';
  });

  useEffect(() => {
    // Initialize Google Client whenever clientId changes and is valid
    const init = async () => {
      try {
        if (clientId) {
            await initGoogleClient(clientId);
        }
      } catch (e) {
        console.error("Failed to initialize Google Client", e);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    init();
  }, [clientId]);

  const handleGoogleLogin = async () => {
    if (!clientId) {
        alert("Please enter a valid Google Client ID to proceed.");
        return;
    }
    
    // Save to local storage for persistence if manually entered
    if (!ENV_CLIENT_ID) {
        localStorage.setItem('lifeos_google_client_id', clientId);
    }
    
    try {
      // Ensure init is called at least once with the current ID before login
      await initGoogleClient(clientId);
      await loginToGoogle();
      setIsAuthenticated(true);
      await loadGoogleData();
    } catch (e: any) {
      console.error("Login failed", e);
      if (e.error === 'popup_closed_by_user') {
          return;
      }
      alert(`Login failed: ${e.error || e.message || "Unknown error"}. Check console.`);
    }
  };

  const handleSignOut = () => {
      logoutFromGoogle();
      setIsAuthenticated(false);
      setEvents([]);
      setEmails([]);
      setLifeAnalysis(null);
  };

  const loadGoogleData = async () => {
    setIsDataLoading(true);
    try {
      const [fetchedEvents, fetchedEmails] = await Promise.all([
        fetchGoogleEvents(),
        fetchGoogleEmails()
      ]);
      setEvents(fetchedEvents);
      setEmails(fetchedEmails);
      
      // Auto-analyze after fetching
      handleAnalyze(fetchedEvents, fetchedEmails);
    } catch (e) {
      console.error("Failed to load Google data", e);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleDemoMode = () => {
    setEvents(MOCK_CALENDAR_EVENTS);
    setEmails(MOCK_EMAILS);
    setIsAuthenticated(true);
    handleAnalyze(MOCK_CALENDAR_EVENTS, MOCK_EMAILS);
  };

  const handleUpdateEmailStatus = (id: string, status: MessageStatus) => {
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, status } : email
    ));
  };

  const handleAnalyze = async (currentEvents = events, currentEmails = emails) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeLifeData(currentEvents, currentEmails);
      setLifeAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Render Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-4">
             <h1 className="text-4xl font-normal text-[#E3E3E3]">LifeOS</h1>
             <p className="text-[#C4C7C5]">Your executive assistant</p>
          </div>

          <div className="space-y-4 pt-4">
            {/* Manual Client ID Input - Only show if env var is missing */}
            {!ENV_CLIENT_ID && (
                <div className="space-y-2">
                    <div className="relative group">
                        <KeyRound className="absolute left-3 top-3 w-5 h-5 text-[#8E918F] group-focus-within:text-[#A8C7FA] transition-colors" />
                        <input 
                            type="text" 
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="Enter Google Client ID"
                            className="w-full bg-[#1E1F20] border border-[#444746] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#E3E3E3] placeholder-[#8E918F] focus:outline-none focus:border-[#A8C7FA] transition-all"
                        />
                    </div>
                    <div className="flex items-start gap-2 text-[10px] text-[#8E918F] px-1">
                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
                        <p>
                           Client ID required for Calendar/Gmail access. 
                           <br />(Format: <code>...apps.googleusercontent.com</code>)
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <button 
                onClick={handleGoogleLogin}
                disabled={isLoadingAuth}
                className={`w-full py-3 px-4 bg-[#A8C7FA] text-[#062E6F] rounded-full font-medium transition-all flex items-center justify-center gap-2 ${isLoadingAuth ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D3E3FD]'}`}
                >
                {isLoadingAuth ? 'Initializing...' : 'Sign in with Google'}
                </button>
                <button 
                onClick={handleDemoMode}
                className="w-full py-3 px-4 text-[#A8C7FA] rounded-full font-medium hover:bg-[#1E1F20] transition-all border border-[#444746]"
                >
                Try Demo
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeSection) {
      case 'summary':
        // Calculate Stats
        const todayDate = new Date();
        
        // Events
        const todayEventsList = events.filter(e => {
          const d = new Date(e.startTime);
          return d.getDate() === todayDate.getDate() && 
                 d.getMonth() === todayDate.getMonth() && 
                 d.getFullYear() === todayDate.getFullYear();
        });
        const upcomingEvent = todayEventsList
          .filter(e => new Date(e.endTime) > new Date())
          .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
          
        const eventContext = upcomingEvent 
          ? `${new Date(upcomingEvent.startTime).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})} • ${upcomingEvent.title}`
          : (todayEventsList.length > 0 ? "All events completed" : "No events today");

        // Action
        const actionEmails = emails.filter(e => e.status === MessageStatus.NEEDS_REPLY);
        const actionCount = actionEmails.length;
        const latestAction = actionEmails.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const actionContext = latestAction 
          ? `Wait on: ${latestAction.sender.split('@')[0]}` 
          : "You're all caught up";

        // Unread
        const unreadEmails = emails.filter(e => e.status === MessageStatus.UNREAD);
        const unreadCount = unreadEmails.length;
        const latestUnread = unreadEmails.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const unreadContext = latestUnread
          ? `Latest: ${latestUnread.subject}`
          : "Inbox zero";

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {/* Stats Row */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  label="Today's Schedule" 
                  count={todayEventsList.length}
                  context={eventContext}
                  colorClass="text-[#A8C7FA]"
                  bgClass="bg-[#A8C7FA]"
                  onClick={() => setActiveSection('schedule')}
                />
                <StatCard 
                  label="Action Needed" 
                  count={actionCount} 
                  context={actionContext}
                  colorClass="text-[#FFB4AB]"
                  bgClass="bg-[#FFB4AB]"
                  onClick={() => setActiveSection('inbox')}
                />
                 <StatCard 
                  label="Unread Inbox" 
                  count={unreadCount} 
                  context={unreadContext}
                  colorClass="text-[#C4EDD4]"
                  bgClass="bg-[#C4EDD4]"
                  onClick={() => setActiveSection('inbox')}
                />
             </div>

            {/* AI Workflows */}
            <WorkflowView 
                analysis={lifeAnalysis} 
                loading={isAnalyzing} 
                onAnalyze={() => handleAnalyze()} 
            />
          </div>
        );
      
      case 'schedule':
        return (
          <div className="h-[calc(100vh-8rem)] animate-in fade-in duration-300">
             <CalendarView events={events} />
          </div>
        );

      case 'inbox':
        return (
          <div className="h-[calc(100vh-8rem)] animate-in fade-in duration-300">
            <EmailView 
              emails={emails} 
              analysis={lifeAnalysis?.inboxAnalysis} 
              onUpdateStatus={handleUpdateEmailStatus}
            />
          </div>
        );
        
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen text-[#E3E3E3] flex flex-col max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <header className="h-20 flex items-center justify-between px-6 shrink-0">
         <div className="text-xl font-normal text-[#E3E3E3]">LifeOS</div>
         
         <nav className="bg-[#1E1F20] rounded-full p-1 flex items-center">
            <button 
               onClick={() => setActiveSection('summary')}
               className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'summary' ? 'bg-[#A8C7FA] text-[#062E6F]' : 'text-[#C4C7C5] hover:text-[#E3E3E3]'}`}
            >
               <LayoutDashboard className="w-4 h-4" />
               <span className="hidden sm:inline">Summary</span>
            </button>
            <button 
               onClick={() => setActiveSection('schedule')}
               className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'schedule' ? 'bg-[#A8C7FA] text-[#062E6F]' : 'text-[#C4C7C5] hover:text-[#E3E3E3]'}`}
            >
               <CalendarIcon className="w-4 h-4" />
               <span className="hidden sm:inline">Schedule</span>
            </button>
            <button 
               onClick={() => setActiveSection('inbox')}
               className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'inbox' ? 'bg-[#A8C7FA] text-[#062E6F]' : 'text-[#C4C7C5] hover:text-[#E3E3E3]'}`}
            >
               <Mail className="w-4 h-4" />
               <span className="hidden sm:inline">Inbox</span>
            </button>
         </nav>

         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#A8C7FA] flex items-center justify-center text-[#062E6F] font-bold text-xs">
                {isAuthenticated ? 'JD' : ''}
            </div>
            <button onClick={handleSignOut} className="p-2 hover:bg-[#2D2E30] rounded-full text-[#C4C7C5] hover:text-[#FFB4AB] transition-colors" title="Sign Out">
                <LogOut className="w-4 h-4" />
            </button>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 pb-6 overflow-hidden">
         {renderContent()}
      </main>
    </div>
  );
};

export default App;