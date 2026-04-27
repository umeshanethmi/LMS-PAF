import React, { useEffect, useState, useMemo } from 'react';
import { getAllTickets } from '../../services/ticketApi';
import type { Ticket } from '../../services/ticketApi';
import { useAuth } from '../../contexts/AuthContext';
import { Wrench, CheckCircle2, Clock, Activity, BarChart3, AlertTriangle, ArrowUpRight, Bot, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        const data = await getAllTickets(user?.id || '0', 'TECHNICIAN');
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load tickets', err);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, [user]);

  const stats = useMemo(() => ({
    assigned: tickets.length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  }), [tickets]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 lg:p-12 text-white shadow-3xl border border-white/5">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="rounded-3xl bg-gradient-to-tr from-indigo-500 to-blue-400 p-5 shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-500/20">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <div>
               <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black tracking-tighter text-white lg:text-5xl">Dashboard</h1>
                 <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/10">Technician</span>
               </div>
               <p className="mt-2 text-lg font-medium text-slate-400 max-w-xl">
                 Real-time overview of your performance and active metrics.
               </p>
            </div>
          </div>
          
          <Link to="/tickets" className="group relative flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 shadow-2xl transition-all hover:scale-105 hover:bg-indigo-50 active:scale-95">
            View Assigned Tasks
            <div className="rounded-lg bg-slate-950 p-1 text-white transition-transform group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-indigo-200 transition-all">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Assigned Work</p>
            <p className="text-4xl font-black text-slate-900 mt-2">{stats.assigned}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
             <Wrench className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-amber-200 transition-all">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">In Progress</p>
            <p className="text-4xl font-black text-amber-600 mt-2">{stats.inProgress}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors">
             <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Resolved</p>
            <p className="text-4xl font-black text-emerald-600 mt-2">{stats.resolved}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
             <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Visual Activity Mockup */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8">
         <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-100 p-3 rounded-2xl">
               <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-800">Productivity Overview</h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">This Week</p>
            </div>
         </div>
         
         <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
            <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-bold">Chart visualization will be deployed in the next update.</p>
         </div>
      </div>

      {/* Booking quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/book" className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-indigo-200 hover:shadow-md transition-all group flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800">Book a Room</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Reserve a hall, lab or equipment for site work.</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
        </Link>
        <Link to="/my-bookings" className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-indigo-200 hover:shadow-md transition-all group flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800">My Bookings</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">See or cancel your active reservations.</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
        </Link>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
