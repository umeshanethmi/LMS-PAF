import React from 'react';
import { Ticket as TicketIcon, TriangleAlert, Clock, CircleCheck } from 'lucide-react';

interface SummaryProps {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

const StatCard = ({ label, value, icon, gradient, index }: { label: string, value: number, icon: React.ReactNode, gradient: string, index: number }) => (
  <div 
    className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-6 shadow-xl transition-all duration-300"
  >
    <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-[0.03] blur-2xl group-hover:opacity-[0.08] transition-all duration-500`}></div>
    
    <div className="flex items-center justify-between relative z-10">
      <div className={`rounded-2xl p-4 bg-gradient-to-br ${gradient} shadow-lg shadow-indigo-500/10 border border-white/20`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 text-white' })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">Live Sync</span>
    </div>
    
    <div className="mt-8 relative z-10">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-5xl font-black tracking-tighter text-slate-900">{value}</p>
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export function DashboardSummary({ total, open, inProgress, resolved }: SummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard index={0} label="Total Records" value={total} icon={<TicketIcon />} gradient="from-violet-600 to-indigo-600" />
      <StatCard index={1} label="Open Tickets" value={open} icon={<TriangleAlert />} gradient="from-rose-600 to-pink-600" />
      <StatCard index={2} label="In Progress" value={inProgress} icon={<Clock />} gradient="from-orange-600 to-amber-600" />
      <StatCard index={3} label="Resolved Hub" value={resolved} icon={<CircleCheck />} gradient="from-emerald-600 to-teal-600" />
    </div>
  );
}

