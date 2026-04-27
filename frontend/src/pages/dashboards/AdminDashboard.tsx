import React, { useEffect, useState, useMemo } from 'react';
import { getAllTickets } from '../../services/ticketApi';
import type { Ticket } from '../../services/ticketApi';
import { bookingApi, type BookingRecord } from '../../services/bookingApi';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, RefreshCw, Activity, Users, Settings, ArrowUpRight, BarChart3, Building2, CalendarCheck, Bot, Check, X, Loader2, MapPin, Clock } from 'lucide-react';
import { DashboardSummary } from '../../components/tickets/DashboardSummary';
import { Link } from 'react-router-dom';

interface CampusResource {
  id: string;
  type: 'HALL' | 'LAB' | 'EQUIPMENT';
  active: boolean;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [resources, setResources] = useState<CampusResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

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

  const loadBookings = async () => {
    try {
      const { data } = await bookingApi.allBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    }
  };

  const loadResources = async () => {
    try {
      const { data } = await apiClient.get<CampusResource[]>('/resources');
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load resources', err);
    }
  };

  const refreshAll = () => {
    loadTickets();
    loadBookings();
    loadResources();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const summary = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length
  }), [tickets]);

  const bookingStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      pending: bookings.filter(b => b.status === 'PENDING').length,
      todayCount: bookings.filter(b => {
        const start = new Date(b.startTime);
        return start >= today && start < tomorrow && b.status !== 'CANCELLED' && b.status !== 'REJECTED';
      }).length,
      total: bookings.length,
    };
  }, [bookings]);

  const resourceStats = useMemo(() => {
    const active = resources.filter(r => r.active);
    return {
      total: active.length,
      halls: active.filter(r => r.type === 'HALL').length,
      labs: active.filter(r => r.type === 'LAB').length,
      equipment: active.filter(r => r.type === 'EQUIPMENT').length,
    };
  }, [resources]);

  const pendingQueue = useMemo(() =>
    bookings
      .filter(b => b.status === 'PENDING')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5)
  , [bookings]);

  const handleStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    let reason: string | undefined;
    if (status === 'REJECTED') {
      const r = window.prompt('Reason for rejection (optional):') ?? '';
      reason = r.trim() || undefined;
    }
    setActingId(id);
    try {
      await bookingApi.updateStatus(id, status, reason);
      await loadBookings();
    } catch {
      alert('Could not update booking. Make sure you have admin permission.');
    } finally {
      setActingId(null);
    }
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });

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
               onClick={refreshAll}
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
               <Link to="/admin/resources" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Building2 className="w-5 h-5" />
                     </div>
                     <span className="font-bold text-slate-700 group-hover:text-indigo-600">Manage Resources</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
               </Link>
               <Link to="/users" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Users className="w-5 h-5" />
                     </div>
                     <span className="font-bold text-slate-700 group-hover:text-indigo-600">User Management</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
               </Link>
               <Link to="/book" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <Bot className="w-5 h-5" />
                     </div>
                     <span className="font-bold text-slate-700 group-hover:text-indigo-600">Booking Assistant</span>
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

      {/* Bookings & Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-emerald-100 p-3 rounded-2xl">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Booking System</h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Live Snapshot</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Approvals</p>
                <p className="text-3xl font-black text-amber-700 mt-1">{bookingStats.pending}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bookings Today</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{bookingStats.todayCount}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <CalendarCheck className="w-5 h-5 text-slate-500" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Active Resources</p>
                <p className="text-3xl font-black text-indigo-700 mt-1">{resourceStats.total}</p>
                <p className="text-[10px] font-bold text-indigo-700/70 mt-1 tracking-wide">
                  {resourceStats.halls} halls • {resourceStats.labs} labs • {resourceStats.equipment} equipment
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-indigo-100">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-2xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Pending Approval Queue</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Top {pendingQueue.length} of {bookingStats.pending}</p>
              </div>
            </div>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CalendarCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-bold">Inbox zero — no pending bookings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingQueue.map(b => (
                <div key={b.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 flex-wrap">
                  <div className="flex items-center gap-4 min-w-[220px] flex-1">
                    <div className="bg-white rounded-xl border border-indigo-100 px-3 py-2 shadow-sm text-center min-w-[68px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Code</p>
                      <p className="text-base font-black text-slate-900">{b.resourceCode}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{b.resourceName}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{b.building}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(b.startTime)}</span>
                        <span>· party of {b.partySize}</span>
                      </div>
                      {b.purpose && (
                        <p className="text-xs text-slate-600 mt-1 italic truncate">"{b.purpose}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={actingId === b.id}
                      onClick={() => handleStatus(b.id, 'APPROVED')}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow shadow-emerald-200 transition-colors disabled:opacity-50"
                    >
                      {actingId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      disabled={actingId === b.id}
                      onClick={() => handleStatus(b.id, 'REJECTED')}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold px-3 py-2 rounded-lg border border-rose-200 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
