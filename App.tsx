import React, { useState, useEffect } from 'react';
import { CalendarView } from './components/CalendarView';
import { EmailView } from './components/EmailView';
import { WorkflowView } from './components/WorkflowView';
import { StatCard } from './components/StatCard';
import { MessageStatus } from './types';
import { LayoutDashboard, Mail, Calendar as CalendarIcon, RefreshCw, KeyRound, Info, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useGoogleData } from './hooks/useGoogleData';

type Section = 'summary' | 'schedule' | 'inbox';

const App: React.FC = () => {
  const { isAuthenticated, isLoadingAuth, clientId, setClientId, login, loginDemo, logout } = useAuth();
  const {
    emails,
    events,
    lifeAnalysis,
    isAnalyzing,
    isDataLoading,
    dataLoadError,
    loadData,
    loadDemoData,
    analyze,
    updateEmailStatus,
    setDataLoadError
  } = useGoogleData();

  const [activeSection, setActiveSection] = useState<Section>('summary');

  // Load data when authenticated
  useEffect(() => {
    // Intentionally left empty for now. 
    // Data loading is triggered manually by login functions.
  }, [isAuthenticated]);

  const handleRealLogin = async () => {
    try {
      await login();
      await loadData(); // Load data after successful login
    } catch (e) {
      // Error handled in context
    }
  };

  const handleDemoModeValues = () => {
    loadDemoData();
    loginDemo();
  };

  // --- Render Login Screen ---
  if (!isAuthenticated && !isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-normal text-[#E3E3E3]">LifeOS</h1>
            <p className="text-[#C4C7C5]">Your executive assistant</p>
          </div>

          <div className="space-y-4 pt-4">
            {/* Manual Client ID Input - Only show if env var is missing/empty */}
            {/* We check if the current clientId matches the env one, if not provided via env, it's empty in context init logic, 
                actually context handles defaults. If we want to check if provided by ENV, we can check import.meta.env again or just expose a flag from context.
                For now, let's just check if clientId is empty? Or if the default one is empty.
                The logic in App.tsx was: `!ENV_CLIENT_ID && ...`
                Let's check directly here.
            */}
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
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
                onClick={handleRealLogin}
                disabled={isLoadingAuth}
                className={`w-full py-3 px-4 bg-[#A8C7FA] text-[#062E6F] rounded-full font-medium transition-all flex items-center justify-center gap-2 ${isLoadingAuth ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D3E3FD]'}`}
              >
                {isLoadingAuth ? 'Initializing...' : 'Sign in with Google'}
              </button>
              <button
                onClick={handleDemoModeValues}
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

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-[#C4C7C5]">Loading LifeOS...</div>;
  }

  const renderContent = () => {
    switch (activeSection) {
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
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

        const eventContext = upcomingEvent
          ? `${new Date(upcomingEvent.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} • ${upcomingEvent.title}`
          : (todayEventsList.length > 0 ? "All events completed" : "No events today");

        // Action
        const actionEmails = emails.filter(e => e.status === MessageStatus.NEEDS_REPLY);
        const actionCount = actionEmails.length;
        const latestAction = actionEmails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const actionContext = latestAction
          ? `Wait on: ${latestAction.sender.split('@')[0]}`
          : "You're all caught up";

        // Unread
        const unreadEmails = emails.filter(e => e.status === MessageStatus.UNREAD);
        const unreadCount = unreadEmails.length;
        const latestUnread = unreadEmails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const unreadContext = latestUnread
          ? `Latest: ${latestUnread.subject}`
          : "Inbox zero";

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {isDataLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-[#444746] bg-[#1E1F20] px-4 py-3 text-sm text-[#C4C7C5]">
                <RefreshCw className="h-4 w-4 animate-spin text-[#A8C7FA]" />
                <span>Refreshing your summary data…</span>
              </div>
            )}
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="Today's Schedule"
                count={todayEventsList.length}
                context={eventContext}
                colorClass="text-[#A8C7FA]"
                bgClass="bg-[#A8C7FA]"
                onClick={isDataLoading ? undefined : () => setActiveSection('schedule')}
              />
              <StatCard
                label="Action Needed"
                count={actionCount}
                context={actionContext}
                colorClass="text-[#FFB4AB]"
                bgClass="bg-[#FFB4AB]"
                onClick={isDataLoading ? undefined : () => setActiveSection('inbox')}
              />
              <StatCard
                label="Unread Inbox"
                count={unreadCount}
                context={unreadContext}
                colorClass="text-[#C4EDD4]"
                bgClass="bg-[#C4EDD4]"
                onClick={isDataLoading ? undefined : () => setActiveSection('inbox')}
              />
            </div>

            {/* AI Workflows */}
            <WorkflowView
              analysis={lifeAnalysis}
              loading={isAnalyzing}
              onAnalyze={isDataLoading ? () => undefined : () => analyze(events, emails)}
            />
          </div>
        );

      case 'schedule':
        return (
          <div className="h-[calc(100vh-8rem)] animate-in fade-in duration-300">
            {isDataLoading ? (
              <div className="h-full rounded-3xl border border-dashed border-[#444746] bg-[#1E1F20] flex flex-col items-center justify-center text-[#C4C7C5] gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-[#A8C7FA]" />
                <span className="text-sm">Loading your schedule…</span>
              </div>
            ) : (
              <CalendarView events={events} />
            )}
          </div>
        );

      case 'inbox':
        return (
          <div className="h-[calc(100vh-8rem)] animate-in fade-in duration-300">
            {isDataLoading ? (
              <div className="h-full rounded-3xl border border-dashed border-[#444746] bg-[#1E1F20] flex flex-col items-center justify-center text-[#C4C7C5] gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-[#A8C7FA]" />
                <span className="text-sm">Loading your inbox…</span>
              </div>
            ) : (
              <EmailView
                emails={emails}
                analysis={lifeAnalysis?.inboxAnalysis}
                onUpdateStatus={updateEmailStatus}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  }

  const isUiDisabled = isDataLoading;

  return (
    <div className="min-h-screen text-[#E3E3E3] flex flex-col max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <header className="h-20 flex items-center justify-between px-6 shrink-0">
        <div className="text-xl font-normal text-[#E3E3E3]">LifeOS</div>

        <nav className="bg-[#1E1F20] rounded-full p-1 flex items-center">
          <button
            onClick={() => setActiveSection('summary')}
            disabled={isUiDisabled}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'summary' ? 'bg-[#A8C7FA] text-[#062E6F]' : 'text-[#C4C7C5] hover:text-[#E3E3E3]'} ${isUiDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Summary</span>
          </button>
          <button
            onClick={() => setActiveSection('schedule')}
            disabled={isUiDisabled}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'schedule' ? 'bg-[#A8C7FA] text-[#062E6F]' : 'text-[#C4C7C5] hover:text-[#E3E3E3]'} ${isUiDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
          </button>
          <button
            onClick={() => setActiveSection('inbox')}
            disabled={isUiDisabled}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeSection === 'inbox' ? 'bg-[#A8C7FA] text-[#062E6F]' : 'text-[#C4C7C5] hover:text-[#E3E3E3]'} ${isUiDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Inbox</span>
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#A8C7FA] flex items-center justify-center text-[#062E6F] font-bold text-xs">
            {isAuthenticated ? 'JD' : ''}
          </div>
          <button
            onClick={() => {
              // Logout logic: clear events?? 
              // App.tsx previous logout cleared events/emails.
              // useGoogleData doesn't expose "clear".
              // That's fine, if we logout, component might unmount or re-render login screen.
              // When logging in again, state in hook depends on where hook is mounted.
              // Since hook is in App, and App is mounted, state persists unless we reset it.
              logout();
              // We might want to clear data.
            }}
            disabled={isUiDisabled}
            className={`p-2 hover:bg-[#2D2E30] rounded-full text-[#C4C7C5] hover:text-[#FFB4AB] transition-colors ${isUiDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 pb-6 overflow-hidden">
        {dataLoadError && (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-2xl border border-[#3C1B1D] bg-[#2A1416] px-4 py-3 text-sm text-[#FFB4AB]">
            <div>
              <p className="font-medium text-[#FFDAD6]">Google sync failed</p>
              <p className="text-xs text-[#FFB4AB]/90">{dataLoadError}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadData()}
                disabled={isDataLoading}
                className={`rounded-full border border-[#FFB4AB] px-3 py-1 text-xs font-medium text-[#FFB4AB] transition-colors ${isDataLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#3C1B1D]'}`}
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => setDataLoadError(null)}
                className="rounded-full border border-transparent px-3 py-1 text-xs text-[#FFB4AB] hover:bg-[#3C1B1D]/60 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
