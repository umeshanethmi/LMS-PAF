import React, { useEffect, useState, useMemo } from 'react';
import { getAllTickets } from '../../services/ticketApi';
import type { Ticket } from '../../services/ticketApi';
import TicketCreateForm from '../../components/tickets/TicketCreateForm';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Ticket as TicketIcon, CheckCircle2, Clock, Activity, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTickets(user?.id || '0', 'USER');
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

  const stats = useMemo(() => ({
    total: tickets.length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    pending: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
  }), [tickets]);

  return (
    <>
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
                   <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/10">Student</span>
                 </div>
                 <p className="mt-2 text-lg font-medium text-slate-400 max-w-xl">
                   Easily report and track your campus maintenance requests.
                 </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/tickets" className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-white/10 border border-white/10 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl hover:bg-white/20 transition-all active:scale-95">
                 View History
              </Link>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="group relative w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 shadow-2xl transition-all hover:scale-105 hover:bg-indigo-50 active:scale-95"
              >
                Report Incident
                <div className="rounded-lg bg-slate-950 p-1 text-white transition-transform group-hover:rotate-90">
                  <Plus className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Reported</p>
              <p className="text-4xl font-black text-slate-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
               <TicketIcon className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Items Resolved</p>
              <p className="text-4xl font-black text-emerald-600 mt-2">{stats.resolved}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
               <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-amber-200 transition-all">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Active Work</p>
              <p className="text-4xl font-black text-amber-600 mt-2">{stats.pending}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors">
               <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Quick Links / Guide Mockup */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8">
           <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                 <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-slate-800">Quick Resources</h2>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Helpful Links</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/tickets" className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group bg-slate-50">
                 <div>
                    <h3 className="font-bold text-slate-800 text-lg">My Ticket History</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">View the status of all your submitted incidents.</p>
                 </div>
                 <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
              </Link>
              <div onClick={() => setShowCreateForm(true)} className="cursor-pointer flex items-center justify-between p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group bg-slate-50">
                 <div>
                    <h3 className="font-bold text-slate-800 text-lg">Priority Support</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Need immediate assistance? Submit a priority ticket.</p>
                 </div>
                 <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
              </div>
           </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl p-2 custom-scrollbar">
             <TicketCreateForm 
               currentUserId={user?.id || '0'}
               onCreated={() => {
                 loadTickets();
                 setShowCreateForm(false);
               }}
             />
             <button 
               onClick={() => setShowCreateForm(false)}
               className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2"
             >
               Dismiss
             </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;
