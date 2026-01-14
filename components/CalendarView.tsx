import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { Calendar as CalendarIcon, MapPin, Clock, ChevronLeft, ChevronRight, MoreHorizontal, CalendarCheck } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const sortedEvents = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const today = new Date();

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  const getDateLabel = (date: Date) => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, tomorrow)) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleToday = () => {
      setCurrentDate(new Date());
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getFirstDayOfMonth(currentYear, currentMonth); // 0 = Sun
  
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentYear, currentMonth, i));
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
      {/* Upcoming List (Side Panel) */}
      <div className="md:w-80 bg-[#1E1F20] rounded-3xl flex flex-col order-2 md:order-1 overflow-hidden">
        <div className="p-4 pl-6 flex items-center justify-between">
            <h2 className="text-xl font-normal text-[#E3E3E3]">Schedule</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2">
            {sortedEvents.length === 0 ? (
            <div className="text-center text-[#8E918F] py-8 text-sm">No events</div>
            ) : (
            sortedEvents.map((evt, index) => {
                const eventDate = new Date(evt.startTime);
                const dateLabel = getDateLabel(eventDate);
                const prevEventDate = index > 0 ? new Date(sortedEvents[index - 1].startTime) : null;
                const prevDateLabel = prevEventDate ? getDateLabel(prevEventDate) : '';
                const showHeader = dateLabel !== prevDateLabel;

                return (
                  <div key={evt.id} className="mb-1">
                    {showHeader && (
                      <div className="px-4 py-2 mt-2">
                        <span className="text-xs font-medium text-[#A8C7FA]">
                          {dateLabel}
                        </span>
                      </div>
                    )}
                    
                    <div className="mx-2 p-3 rounded-2xl hover:bg-[#2D2E30] transition-colors group cursor-pointer">
                        <div className="flex justify-between items-start mb-0.5">
                           <h4 className="text-sm font-medium text-[#E3E3E3]">{evt.title}</h4>
                        </div>
                        
                        <div className="flex flex-col gap-1 text-xs text-[#C4C7C5]">
                           <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A8C7FA]"></span>
                              {formatTime(evt.startTime)} - {formatTime(evt.endTime)}
                           </span>
                           {evt.location && (
                               <span className="text-[#8E918F] ml-3 truncate">{evt.location}</span>
                           )}
                        </div>
                    </div>
                  </div>
                );
            })
            )}
        </div>
      </div>

      {/* Visual Calendar (Main) */}
      <div className="flex-1 bg-[#1E1F20] rounded-3xl flex flex-col order-1 md:order-2 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-normal text-[#E3E3E3] ml-2">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-1">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-[#2D2E30] rounded-full text-[#E3E3E3] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-[#2D2E30] rounded-full text-[#E3E3E3] transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>
            <button 
                onClick={handleToday}
                className="px-4 py-2 border border-[#444746] rounded-full text-sm font-medium text-[#E3E3E3] hover:bg-[#2D2E30] transition-colors"
            >
                Today
            </button>
        </div>

        <div className="flex-1 p-4">
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <span key={i} className="text-xs font-medium text-[#8E918F]">{day}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2 h-full auto-rows-fr">
                {calendarDays.map((date, idx) => {
                    if (!date) return <div key={idx} />;
                    
                    const isToday = isSameDay(date, today);
                    const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), date));
                    
                    return (
                        <div key={idx} className="flex flex-col items-center pt-2 relative border-t border-[#444746] min-h-[60px]">
                            <span className={`text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-[#A8C7FA] text-[#062E6F]' : 'text-[#C4C7C5]'}`}>
                                {date.getDate()}
                            </span>
                            <div className="w-full px-1 space-y-1">
                                {dayEvents.slice(0, 3).map((e, i) => (
                                    <div key={i} className="text-[10px] truncate bg-[#392C1D] text-[#FFDCC1] px-1.5 py-0.5 rounded-sm w-full">
                                        {e.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                     <div className="text-[10px] text-[#8E918F] text-center">
                                       +{dayEvents.length - 3} more
                                     </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};