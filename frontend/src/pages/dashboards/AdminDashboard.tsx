import React, { useEffect, useState, useMemo } from 'react';
import { getAllTickets } from '../../services/ticketApi';
import type { Ticket } from '../../services/ticketApi';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, RefreshCw, Activity, Users, Settings, ArrowUpRight, BarChart3 } from 'lucide-react';
import { DashboardSummary } from '../../components/tickets/DashboardSummary';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTickets(user?.id, 'ADMIN');
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const summary = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length
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
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <div>
               <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black tracking-tighter text-white lg:text-5xl">Dashboard</h1>
                 <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/10">Administrator</span>
               </div>
               <p className="mt-2 text-lg font-medium text-slate-400 max-w-xl">
                 Campus Infrastructure & Incident Management Overview.
               </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={loadTickets}
               className="p-4 bg-white/10 border border-white/10 rounded-2xl hover:bg-white/20 transition-all group"
             >
               <RefreshCw className={`w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
             </button>
             <Link to="/tickets" className="group relative flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 shadow-2xl transition-all hover:scale-105 hover:bg-indigo-50 active:scale-95">
               Manage Tickets
               <div className="rounded-lg bg-slate-950 p-1 text-white transition-transform group-hover:rotate-45">
                 <ArrowUpRight className="h-4 w-4" />
               </div>
             </Link>
          </div>
        </div>
      </div>

      <DashboardSummary {...summary} />

      {/* Visual Activity Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8">
            <div className="flex items-center gap-4 mb-8">
               <div className="bg-indigo-100 p-3 rounded-2xl">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-slate-800">System Activity</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Last 30 Days</p>
               </div>
            </div>
            
            <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
               <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
               <p className="font-bold">Analytics visualization will be deployed in the next update.</p>
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8">
            <div className="flex items-center gap-4 mb-8">
               <div className="bg-emerald-100 p-3 rounded-2xl">
                  <Activity className="w-6 h-6 text-emerald-600" />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-slate-800">Quick Links</h2>
               </div>
            </div>

            <div className="space-y-4">
               <Link to="/users" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Users className="w-5 h-5" />
                     </div>
                     <span className="font-bold text-slate-700 group-hover:text-indigo-600">User Management</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
               </Link>
               <Link to="/settings" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Settings className="w-5 h-5" />
                     </div>
                     <span className="font-bold text-slate-700 group-hover:text-indigo-600">System Settings</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
