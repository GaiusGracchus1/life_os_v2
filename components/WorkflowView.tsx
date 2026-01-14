import React from 'react';
import { LifeAnalysis } from '../types';
import { BrainCircuit, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface WorkflowViewProps {
  analysis: LifeAnalysis | null;
  loading: boolean;
  onAnalyze: () => void;
}

const PriorityChip: React.FC<{ level: 'LOW' | 'MEDIUM' | 'HIGH' }> = ({ level }) => {
  const colors = {
    LOW: 'bg-[#2D2E30] text-[#C4C7C5] border-[#444746]',
    MEDIUM: 'bg-[#392C1D] text-[#FFDCC1] border-[#392C1D]', // Muted Orange/Brown
    HIGH: 'bg-[#3C1B1D] text-[#FFB4AB] border-[#3C1B1D]', // Muted Red
  };

  return (
    <span className={`px-3 py-1 text-[11px] font-medium rounded-full border ${colors[level]}`}>
      {level}
    </span>
  );
};

export const WorkflowView: React.FC<WorkflowViewProps> = ({ analysis, loading, onAnalyze }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#1E1F20] rounded-3xl min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#A8C7FA] animate-spin mb-4" />
        <p className="text-[#E3E3E3]">Analyzing context...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#1E1F20] rounded-3xl p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 bg-[#2D2E30] rounded-full flex items-center justify-center mb-6">
          <BrainCircuit className="w-8 h-8 text-[#A8C7FA]" />
        </div>
        <h3 className="text-xl text-[#E3E3E3] mb-2">LifeOS Intelligence</h3>
        <p className="text-[#C4C7C5] max-w-sm mb-8 text-sm leading-relaxed">
          Generate a briefing of your day based on your calendar and inbox.
        </p>
        <button
          onClick={onAnalyze}
          className="px-6 py-2.5 bg-[#A8C7FA] text-[#062E6F] font-medium rounded-full hover:bg-[#D3E3FD] transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Briefing
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Overview & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Overview */}
        <div className="lg:col-span-1">
            <div className="bg-[#1E1F20] rounded-3xl p-6 h-full flex flex-col">
                <h3 className="text-lg font-normal text-[#E3E3E3] mb-4">Overview</h3>
                <div className="space-y-6 flex-1">
                    {analysis.overview.map((item, idx) => (
                    <div key={idx}>
                        <h4 className="text-sm font-medium text-[#D3E3FD] mb-1">{item.title}</h4>
                        <p className="text-sm text-[#C4C7C5] leading-relaxed">
                        {item.description}
                        </p>
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Key Insights */}
        <div className="lg:col-span-2">
            <div className="bg-[#1E1F20] rounded-3xl p-6 h-full">
                <h3 className="text-lg font-normal text-[#E3E3E3] mb-4">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.keyInsights.map((insight, idx) => (
                        <div key={idx} className="bg-[#2D2E30] p-4 rounded-2xl border border-[#444746]/30 h-full">
                            <p className="text-sm text-[#E3E3E3] leading-relaxed">{insight}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Action Plan (Workflows) */}
      <div>
        <h3 className="text-lg font-normal text-[#E3E3E3] mb-4 ml-2 mt-2">Action Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysis.workflows.map((workflow, idx) => (
            <div key={idx} className="bg-[#1E1F20] rounded-3xl p-6 hover:bg-[#2D2E30] transition-colors border border-transparent hover:border-[#444746]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-medium text-[#E3E3E3]">{workflow.categoryName}</h3>
                <PriorityChip level={workflow.urgencyLevel} />
              </div>
              
              <div className="space-y-3">
                {workflow.outstandingItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                     <div className="mt-1.5 w-3 h-3 rounded-full border border-[#8E918F] flex items-center justify-center shrink-0">
                     </div>
                     <span className="text-sm text-[#C4C7C5] leading-snug">
                       {item}
                     </span>
                  </div>
                ))}
                {workflow.outstandingItems.length === 0 && (
                     <div className="flex items-center gap-2 text-[#8E918F] text-sm italic">
                       <CheckCircle2 className="w-4 h-4" /> All clear
                     </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};