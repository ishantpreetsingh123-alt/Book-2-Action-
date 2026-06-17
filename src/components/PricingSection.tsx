import React from 'react';
import { Check, Dot, AlertCircle } from 'lucide-react';

interface PricingSectionProps {
  onUpgradeClick: () => void;
  activeTier: 'free' | 'premium';
}

export default function PricingSection({ onUpgradeClick, activeTier }: PricingSectionProps) {
  return (
    <div className="py-12 bg-white rounded-3xl border border-slate-200/60 shadow-sm px-6 max-w-5xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand uppercase tracking-wider bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-blue-100">
          Transparent Premium Plans
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Choose Your Path to Mastery
        </h3>
        <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto font-light">
          Get actionable intelligence. Fuel your progress with unlimited book breakdowns, custom action plan checklists, and interactive maps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan Card */}
        <div className="bg-white border text-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-sm border-slate-200 hover:border-slate-300 transition-all">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Baseline Tier</span>
              <h4 className="text-xl font-extrabold text-slate-900">Free Account</h4>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Simple trial to test analysis capabilities on limited volume.
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-3xl font-black font-mono text-slate-900">$0</span>
              <span className="text-xs text-slate-400 font-medium">/ forever</span>
            </div>

            {/* List features */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Scope Limitations</span>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2 text-slate-600">
                  <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span>1 Book Concept Analysis Only</span>
                </li>
                <li className="flex items-start gap-2 text-slate-600">
                  <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span>View 30-Day Checklist Roadmap</span>
                </li>
                <li className="flex items-start gap-2 text-slate-400 line-through">
                  <span>Access Complete Summary (Main Idea, frameworks)</span>
                </li>
                <li className="flex items-start gap-2 text-slate-400 line-through">
                  <span>Interactive Book Flowchart Map</span>
                </li>
                <li className="flex items-start gap-2 text-slate-400 line-through">
                  <span>Key Concepts Priority Intensity Map</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 w-full">
            {activeTier === 'free' ? (
              <button 
                disabled
                className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              >
                Current Baseline Plan
              </button>
            ) : (
              <button 
                disabled
                className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100"
              >
                Downgraded Tier available
              </button>
            )}
          </div>
        </div>

        {/* Premium Plan Card (Visual highlight recommended) */}
        <div className="bg-white border-2 border-brand text-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative shadow-md ring-4 ring-blue-50">
          {/* Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] uppercase font-black tracking-widest px-3.5 py-1 rounded-full shadow-sm">
            RECOMMENDED FOR LEARNERS
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold text-blue-500 tracking-wider">Unlimited Mastery</span>
              <h4 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5">
                Premium Plan <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-md font-bold tracking-tight border border-blue-100">PRO</span>
              </h4>
              <p className="text-xs text-[#64748B] font-light leading-relaxed">
                Transform unlimited libraries into custom action panels, printable flowcharts, and saved personal history logs.
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-4xl font-extrabold text-slate-900">$5</span>
              <span className="text-xs text-slate-400 font-medium">/ month</span>
            </div>

            {/* List features matching core constraints */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] text-brand uppercase tracking-wider font-extrabold block">Ultimate Capabilities</span>
              <ul className="space-y-2.5 text-xs font-medium text-slate-800">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span>Unlimited High-Fidelity Book Analyses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span>Unlimited 30-Day Checklist Planners</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span>Unlock Interactive Section Summary Cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span>Interactive Flowcharts (Zoom, Pan, Inspect Nodes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span>Unlock Key Concepts Analyzer + Importance Rings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span>Saved Personal Queries Timeline History</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span>Priority Model Processing Queue</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 w-full">
            {activeTier === 'premium' ? (
              <div className="text-center px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                Active Premium Subscription
              </div>
            ) : (
              <button 
                onClick={onUpgradeClick}
                className="w-full text-center px-4 py-3 rounded-xl text-xs font-extrabold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm hover:shadow transition-all cursor-pointer outline-none focus:ring-4 focus:ring-blue-100"
              >
                Upgrade to Premium ($5)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
