import React, { useState } from 'react';
import { Email, MessageStatus, InboxAnalysis } from '../types';
import { Mail, Archive, Trash2, Reply, MoreVertical, Search, ArrowLeft, Sparkles } from 'lucide-react';

interface EmailViewProps {
  emails: Email[];
  analysis?: InboxAnalysis;
  onUpdateStatus: (id: string, status: MessageStatus) => void;
}

type Tab = 'all' | 'unread';

export const EmailView: React.FC<EmailViewProps> = ({ emails, analysis, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEmails = emails.filter(email => {
    if (activeTab === 'unread') return email.status === MessageStatus.UNREAD;
    return true;
  });

  const activeEmail = emails.find(e => e.id === expandedId);

  const handleBack = () => {
    setExpandedId(null);
  };

  const markRead = (id: string) => {
      onUpdateStatus(id, MessageStatus.READ);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Inbox Intelligence - Top Header */}
      {analysis && (
        <div className="bg-[#1E1F20] rounded-3xl p-5 shrink-0 border border-[#444746]/30">
           <div className="flex flex-col md:flex-row gap-6">
              {/* Summary */}
              <div className="md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#444746]/50 pb-4 md:pb-0 md:pr-6">
                 <div className="flex items-center gap-2 mb-2 text-[#A8C7FA]">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="text-sm font-medium uppercase tracking-wide">Inbox Intelligence</h3>
                 </div>
                 <p className="text-sm text-[#E3E3E3] leading-relaxed">
                    {analysis.summary}
                 </p>
              </div>

              {/* Topics Scroll */}
              <div className="md:w-2/3 overflow-x-auto">
                 <div className="flex gap-3 pb-2 min-w-max">
                    {analysis.topics.map((t, i) => (
                        <div key={i} className="bg-[#2D2E30] p-4 rounded-2xl border border-[#444746]/30 w-72 flex flex-col justify-between hover:bg-[#323335] transition-colors cursor-default group h-32">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-[#E3E3E3] truncate pr-2 group-hover:text-white transition-colors" title={t.topic}>{t.topic}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${t.status.includes('Action') || t.count > 3 ? 'bg-[#3C1B1D] text-[#FFB4AB]' : 'bg-[#444746] text-[#C4C7C5]'}`}>
                                        {t.count}
                                    </span>
                                </div>
                                <p className="text-xs text-[#C4C7C5] line-clamp-3 leading-relaxed">
                                    {t.description || "No description available."}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${t.status.includes('Action') ? 'bg-[#FFB4AB]' : 'bg-[#8E918F]'}`}></div>
                                <span className={`text-[10px] font-medium uppercase tracking-wider ${t.status.includes('Action') ? 'text-[#FFB4AB]' : 'text-[#8E918F]'}`}>
                                    {t.status}
                                </span>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Inbox List */}
        <div className={`flex-1 bg-[#1E1F20] rounded-3xl overflow-hidden flex flex-col border border-[#444746]/30 ${expandedId ? 'hidden lg:flex lg:w-96 lg:flex-none' : ''}`}>
          {/* Gmail-style Header */}
          <div className="p-4 bg-[#1E1F20] flex items-center justify-between">
             <div className="bg-[#2D2E30] rounded-full flex items-center px-4 py-3 w-full">
                <Search className="w-5 h-5 text-[#8E918F] mr-3" />
                <input 
                  type="text" 
                  placeholder="Search mail" 
                  className="bg-transparent border-none outline-none text-[#E3E3E3] placeholder-[#8E918F] text-sm w-full"
                />
             </div>
          </div>
          
          <div className="px-4 pb-2">
             <div className="flex gap-4 border-b border-[#444746]">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-[#A8C7FA] text-[#A8C7FA]' : 'border-transparent text-[#C4C7C5]'}`}
                >
                  All
                </button>
                <button 
                   onClick={() => setActiveTab('unread')}
                   className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'unread' ? 'border-[#A8C7FA] text-[#A8C7FA]' : 'border-transparent text-[#C4C7C5]'}`}
                >
                  Unread
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             {filteredEmails.map(email => (
               <div 
                  key={email.id}
                  onClick={() => {
                      setExpandedId(email.id);
                      if (email.status === MessageStatus.UNREAD) markRead(email.id);
                  }}
                  className={`px-4 py-3 border-b border-[#444746] cursor-pointer hover:bg-[#2D2E30] transition-colors flex gap-3 ${expandedId === email.id ? 'bg-[#2D2E30]' : ''}`}
               >
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${email.status === MessageStatus.UNREAD ? 'bg-[#A8C7FA] text-[#062E6F]' : 'bg-[#444746] text-[#C4C7C5]'}`}>
                     {email.sender[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`text-sm truncate ${email.status === MessageStatus.UNREAD ? 'font-bold text-[#E3E3E3]' : 'font-medium text-[#C4C7C5]'}`}>
                          {email.sender.split('@')[0]}
                        </span>
                        <span className="text-xs text-[#8E918F]">
                          {new Date(email.timestamp).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}
                        </span>
                     </div>
                     <p className={`text-sm truncate mb-0.5 ${email.status === MessageStatus.UNREAD ? 'font-bold text-[#E3E3E3]' : 'font-normal text-[#C4C7C5]'}`}>
                       {email.subject}
                     </p>
                     <p className="text-sm text-[#8E918F] truncate font-normal">
                       {email.snippet}
                     </p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Message Detail View */}
        {activeEmail ? (
            <div className="flex-[2] bg-[#1E1F20] rounded-3xl overflow-hidden flex flex-col h-full absolute inset-0 lg:static z-20 border border-[#444746]/30">
               {/* Toolbar */}
               <div className="px-4 py-3 flex items-center justify-between border-b border-[#444746]">
                  <div className="flex items-center gap-2">
                     <button onClick={handleBack} className="p-2 hover:bg-[#2D2E30] rounded-full text-[#E3E3E3] lg:hidden">
                        <ArrowLeft className="w-5 h-5" />
                     </button>
                     <button className="p-2 hover:bg-[#2D2E30] rounded-full text-[#E3E3E3]">
                        <Archive className="w-5 h-5" />
                     </button>
                     <button className="p-2 hover:bg-[#2D2E30] rounded-full text-[#E3E3E3]">
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                  <button className="p-2 hover:bg-[#2D2E30] rounded-full text-[#E3E3E3]">
                     <MoreVertical className="w-5 h-5" />
                  </button>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-6">
                     <h1 className="text-xl font-medium text-[#E3E3E3]">{activeEmail.subject}</h1>
                     <div className="bg-[#2D2E30] text-[#C4C7C5] text-xs px-2 py-1 rounded-md">Inbox</div>
                  </div>

                  {/* Thread Render */}
                  {(activeEmail.threadMessages && activeEmail.threadMessages.length > 0 ? activeEmail.threadMessages : [activeEmail]).map((msg, idx) => (
                      <div key={idx} className="mb-8 last:mb-0">
                          <div className="flex items-center gap-3 mb-4">
                             <div className="w-10 h-10 rounded-full bg-[#444746] flex items-center justify-center text-[#E3E3E3]">
                                {typeof msg.sender === 'string' ? msg.sender[0].toUpperCase() : 'U'}
                             </div>
                             <div className="flex-1">
                                <div className="flex justify-between">
                                   <span className="text-sm font-bold text-[#E3E3E3]">{typeof msg.sender === 'string' ? msg.sender.split('<')[0] : 'Unknown'}</span>
                                   <span className="text-xs text-[#8E918F]">
                                      {new Date(msg.timestamp).toLocaleString()}
                                   </span>
                                </div>
                                <span className="text-xs text-[#8E918F]">to me</span>
                             </div>
                          </div>
                          <div className="text-sm text-[#E3E3E3] leading-relaxed whitespace-pre-wrap pl-13 ml-13">
                             {'body' in msg ? msg.body : (activeEmail as any).fullBody}
                          </div>
                      </div>
                  ))}
               </div>
               
               {/* Reply Bar */}
               <div className="p-4 border-t border-[#444746]">
                  <button className="w-full border border-[#8E918F] rounded-full py-3 px-6 text-left text-[#8E918F] text-sm hover:bg-[#2D2E30] transition-colors flex items-center gap-2">
                     <Reply className="w-4 h-4" /> Reply
                  </button>
               </div>
            </div>
        ) : (
            <div className="flex-[2] bg-[#1E1F20] rounded-3xl hidden lg:flex flex-col items-center justify-center text-[#8E918F] border border-[#444746]/30">
                <div className="bg-[#2D2E30] p-6 rounded-full mb-4">
                    <Mail className="w-12 h-12 opacity-50" />
                </div>
                <p>Select an email to read</p>
            </div>
        )}
      </div>
    </div>
  );
};