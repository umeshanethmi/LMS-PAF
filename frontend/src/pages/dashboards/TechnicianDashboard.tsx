import React, { useEffect, useState, useMemo } from 'react';
import { getAllTickets } from '../../services/ticketApi';
import type { Ticket } from '../../services/ticketApi';
import { useAuth } from '../../contexts/AuthContext';
import { Wrench, CheckCircle2, Clock, Activity, BarChart3, AlertTriangle, ArrowUpRight, RefreshCw, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const TechnicianDashboard = () => {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

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

    useEffect(() => {
      loadTickets();
    }, [user, role]);

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
          
          <div className="flex items-center gap-4">
            <button 
              onClick={loadTickets}
              disabled={loading}
              className="p-4 bg-white/10 border border-white/10 rounded-2xl hover:bg-white/20 transition-all group"
              title="Sync Tasks"
            >
              <RefreshCw className={`w-5 h-5 text-white transition-all duration-700 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            </button>
            <Link to="/tickets" className="group relative flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 shadow-2xl transition-all hover:scale-105 hover:bg-indigo-50 active:scale-95">
              View All Tasks
              <div className="rounded-lg bg-slate-950 p-1 text-white transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-indigo-200 transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Missions</p>
            <p className="text-4xl font-black text-slate-900 mt-2">{stats.assigned}</p>
            <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-tighter">Live from Registry</p>
          </div>
          <div className="relative z-10 p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
             <Wrench className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-amber-200 transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Active Fixing</p>
            <p className="text-4xl font-black text-amber-600 mt-2">{stats.inProgress}</p>
            <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-tighter">High Priority</p>
          </div>
          <div className="relative z-10 p-4 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors">
             <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-emerald-200 transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Resolved</p>
            <p className="text-4xl font-black text-emerald-600 mt-2">{stats.resolved}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter">Success Rate 100%</p>
          </div>
          <div className="relative z-10 p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
             <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Recent Assigned Tasks Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Recent Assigned Tasks</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Registry</p>
            </div>
          </div>
          <Link to="/tickets" className="text-sm font-black text-indigo-600 hover:text-slate-900 transition-colors uppercase tracking-widest">
            View Full List
          </Link>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching assignments...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-400">No active tasks assigned to you.</p>
              <p className="text-sm text-slate-300 mt-1">Assignments will appear here once dispatched by admin.</p>
            </div>
          ) : (
            tickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${
                    ticket.status === 'IN_PROGRESS' ? 'bg-amber-500 animate-pulse' : 
                    ticket.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">{ticket.category}</h3>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200">
                        #{ticket.id.substring(0, 8)}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-1">{ticket.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        <MapPin size={12} className="text-indigo-500" /> {ticket.location}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        <Calendar size={12} className="text-indigo-500" /> {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                      {ticket.dispatchedAt && (
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 animate-pulse">
                          <Activity size={12} /> Dispatched: {new Date(ticket.dispatchedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Link 
                  to="/tickets" 
                  state={{ selectedId: ticket.id }}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95"
                >
                  Manage <ArrowUpRight size={14} />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Visual Activity Mockup */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8">
         <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-100 p-3 rounded-2xl">
               <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-800">System Insights</h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Productivity Hub</p>
            </div>
         </div>
         
         <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
            <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-bold">Advanced performance analytics will be deployed in the next update.</p>
         </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
