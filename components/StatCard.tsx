import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  count: number;
  context: string;
  colorClass: string;
  bgClass: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  count, 
  context, 
  colorClass, 
  bgClass, 
  onClick 
}) => {
  return (
    <button 
      onClick={onClick}
      className="relative w-full text-left bg-[#1E1F20] rounded-2xl p-4 border border-[#444746]/30 hover:bg-[#2D2E30] transition-all cursor-pointer group overflow-hidden"
    >
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 p-20 blur-3xl rounded-full opacity-0 group-hover:opacity-10 pointer-events-none ${bgClass} -mr-10 -mt-10 transition-opacity duration-500`}></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Header: Label & Action Icon */}
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs font-medium text-[#C4C7C5] uppercase tracking-wider">{label}</p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
             <ArrowUpRight className="w-4 h-4 text-[#8E918F]" />
          </div>
        </div>

        {/* Content: Count */}
        <div className="flex items-center gap-3 my-1">
          <h3 className={`text-3xl font-medium tracking-tight ${colorClass}`}>{count}</h3>
        </div>

        {/* Footer: Context */}
        <div className="pt-2 mt-1 border-t border-[#444746]/50 w-full">
          <p className="text-[11px] text-[#8E918F] truncate font-medium">
            {context}
          </p>
        </div>
      </div>
    </button>
  );
};