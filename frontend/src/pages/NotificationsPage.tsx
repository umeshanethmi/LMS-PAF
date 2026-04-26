import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 p-2 lg:p-6">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 lg:p-12 text-white shadow-3xl border border-white/5">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="rounded-3xl bg-gradient-to-tr from-indigo-500 to-blue-400 p-5 shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-500/20">
              <Bell className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter text-white lg:text-5xl">Notifications</h1>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/10">Alerts</span>
              </div>
              <p className="mt-2 text-lg font-medium text-slate-400 max-w-xl">
                Stay updated with your latest alerts and system messages.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white text-center shadow-sm">
        <Bell className="h-16 w-16 text-slate-300 mx-auto mb-6" />
        <h3 className="text-2xl font-black tracking-tight text-slate-800">No new notifications</h3>
        <p className="text-slate-500 mt-2 font-medium">You're all caught up! Check back later for updates.</p>
      </div>
    </div>
  );
}
