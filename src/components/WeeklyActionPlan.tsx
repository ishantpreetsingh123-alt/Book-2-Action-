import React, { useState, useEffect } from 'react';
import { ActionPlan, WeekPlan, DayPlan } from '../types';
import { CheckCircle2, Clock, Eye, AlertCircle, Target, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeeklyActionPlanProps {
  actionPlan: ActionPlan;
  bookTitle: string;
}

export default function WeeklyActionPlan({ actionPlan, bookTitle }: WeeklyActionPlanProps) {
  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(0);
  // Persist completed days in standard indices. Since day index can go up to 30, let's keep an array of finished day numbers.
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  // Load from local storage if available for this specific book to provide premium persistence
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`b2a_checklist_${bookTitle}`);
      if (stored) {
        setCompletedDays(JSON.parse(stored));
      } else {
        setCompletedDays([]);
      }
    } catch (e) {
      console.warn("Could not retrieve local checklists", e);
    }
  }, [bookTitle]);

  const toggleDayCompletion = (dayNumber: number) => {
    let next: number[];
    if (completedDays.includes(dayNumber)) {
      next = completedDays.filter(d => d !== dayNumber);
    } else {
      next = [...completedDays, dayNumber];
    }
    setCompletedDays(next);
    try {
      localStorage.setItem(`b2a_checklist_${bookTitle}`, JSON.stringify(next));
    } catch (e) {
      console.warn("Failed to persist checklist", e);
    }
  };

  const activeWeek: WeekPlan | undefined = actionPlan.weeks[activeWeekIndex];

  // Statistics calculation
  const totalDaysCount = actionPlan.weeks.reduce((acc, week) => acc + week.days.length, 0) || 28;
  const totalCompletedCount = completedDays.length;
  const overallPercentage = Math.round((totalCompletedCount / totalDaysCount) * 100);

  // Active week stats
  const activeWeekDays = activeWeek?.days || [];
  const activeWeekCompletedCount = activeWeekDays.filter(d => completedDays.includes(d.dayNumber)).length;
  const activeWeekPercentage = Math.round((activeWeekCompletedCount / (activeWeekDays.length || 7)) * 100);

  return (
    <div className="space-y-6">
      {/* Platform execution header and statistics widget */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase bg-brand/30 text-blue-300 px-3 py-1 rounded-full font-bold tracking-wider border border-brand/40">
            Feature Roadmap Matrix
          </span>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Your 30-Day execution Blueprint
          </h3>
          <p className="text-sm text-slate-300 max-w-lg font-light leading-relaxed">
            Stop reading passively. Action is structural wisdom. This sequential gameplan organizes {bookTitle}'s core actions into tiny habits.
          </p>
        </div>

        {/* Progress Displays */}
        <div className="flex items-center gap-5 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
          {/* Radial Ring */}
          <div className="relative h-16 w-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-95">
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                className="stroke-slate-700 fill-none" 
                strokeWidth="4"
              />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                className="stroke-brand-light fill-none transition-all duration-500 ease-out" 
                strokeWidth="4.5"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (175.9 * overallPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-sm font-bold font-mono text-white leading-none">{overallPercentage}%</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Done</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 leading-none">Compounding Progress</span>
            <p className="text-base font-bold font-mono tracking-tight text-white leading-tight">
              {totalCompletedCount} of {totalDaysCount} Days
            </p>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium inline-block">
              {overallPercentage === 100 ? "Mastery Unlocked!" : `${totalDaysCount - totalCompletedCount} checkpoints remaining`}
            </span>
          </div>
        </div>
      </div>

      {/* Week Selector Tab Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch border-b border-slate-200/60 pb-1.5 overflow-x-auto">
        {actionPlan.weeks.map((week, index) => {
          const isSelected = activeWeekIndex === index;
          const finishedInWeek = week.days.filter(d => completedDays.includes(d.dayNumber)).length;
          const isWeekFullyDone = finishedInWeek === week.days.length && week.days.length > 0;

          return (
            <button
              key={index}
              onClick={() => setActiveWeekIndex(index)}
              className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between cursor-pointer outline-none min-w-[150px] ${
                isSelected 
                  ? 'bg-[#EFF6FF] border-brand text-brand hover:brightness-99 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Week {week.weekNumber}
                </span>
                {isWeekFullyDone ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">DONE</span>
                ) : finishedInWeek > 0 ? (
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1.5 py-0.5 rounded">{finishedInWeek}/{week.days.length}</span>
                ) : null}
              </div>
              <h4 className="font-bold text-xs line-clamp-1 text-slate-800 mb-2">
                {week.weekTitle}
              </h4>
              {/* Mini linear progress indicator */}
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${isWeekFullyDone ? 'bg-emerald-500' : 'bg-brand'}`}
                  style={{ width: `${(finishedInWeek / (week.days.length || 7)) * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Week Insights & Header */}
      <AnimatePresence mode="wait">
        {activeWeek && (
          <motion.div
            key={activeWeekIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200/40">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-brand" />
                <span className="text-sm font-semibold text-slate-800">
                  Week {activeWeek.weekNumber} Focus: <span className="font-extrabold">{activeWeek.weekTitle}</span>
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {activeWeekCompletedCount} of {activeWeekDays.length} Action plans checked ({activeWeekPercentage}%)
              </span>
            </div>

            {/* Daily grid roadmap list */}
            <div className="grid grid-cols-1 gap-4">
              {activeWeek.days.map((day) => {
                const isCompleted = completedDays.includes(day.dayNumber);

                return (
                  <motion.div
                    key={day.dayNumber}
                    layoutId={`day-card-${day.dayNumber}`}
                    className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col md:flex-row md:items-stretch group ${
                      isCompleted 
                        ? 'border-emerald-200 shadow-sm bg-emerald-50/10' 
                        : 'border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow'
                    }`}
                  >
                    {/* Day number sidebar */}
                    <div className={`md:w-36 flex flex-row md:flex-col items-center justify-between md:justify-center p-4 md:p-6 border-b md:border-b-0 md:border-r gap-3 shrink-0 ${
                      isCompleted 
                        ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800' 
                        : 'bg-slate-50/50 border-slate-100 text-slate-700'
                    }`}>
                      <div className="flex flex-row md:flex-col items-center gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Day Target</span>
                        <span className="text-2xl md:text-3xl font-extrabold font-mono tracking-tighter">
                          {day.dayNumber}
                        </span>
                      </div>

                      {/* Interactive check button */}
                      <button
                        onClick={() => toggleDayCompletion(day.dayNumber)}
                        className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 md:py-2 rounded-xl text-xs font-bold w-full transition-all border outline-none cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 size={13} className="fill-white stroke-emerald-500" />
                            <span>Done!</span>
                          </>
                        ) : (
                          <span>Mark Done</span>
                        )}
                      </button>
                    </div>

                    {/* Day detail body */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-5">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                            <Clock size={12} className="text-slate-500" /> {day.estimatedTime} Estim.
                          </span>
                          <span className="text-[10px] md:text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                            <Award size={12} className="text-blue-500" /> Objective Achiever
                          </span>
                        </div>

                        <h4 className={`text-base md:text-lg font-bold tracking-tight ${isCompleted ? 'text-slate-500 line-through decoration-slate-400/60' : 'text-slate-900'}`}>
                          {day.dailyObjective}
                        </h4>

                        {/* Action checklist list */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sequence details</span>
                          <ul className="space-y-2">
                            {day.actionSteps.map((step, stepIdx) => (
                              <li key={stepIdx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                                <span className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                  {stepIdx + 1}
                                </span>
                                <span className={isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}>
                                  {step}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Expected outcome pill block */}
                      <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                        <Eye size={14} className="text-[#2563EB]" />
                        <p className="text-xs text-slate-500 leading-normal">
                          <strong className="text-slate-700 font-bold">Outcome:</strong> {day.expectedOutcome}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week consolidation summary review */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 flex flex-col sm:flex-row items-center gap-4">
        <Sparkles size={28} className="text-[#AE7AFF] shrink-0" />
        <div className="space-y-0.5 text-center sm:text-left">
          <h5 className="text-sm font-bold text-slate-800">Weekly Reflection Mechanism</h5>
          <p className="text-xs text-slate-500 leading-relaxed font-light">
            Each cycle builds upon the prior. Spend 10 minutes at the end of Week {activeWeek?.weekNumber} adjusting your workspace environment to make failure extremely high friction, cementing the habit permanently.
          </p>
        </div>
      </div>
    </div>
  );
}
