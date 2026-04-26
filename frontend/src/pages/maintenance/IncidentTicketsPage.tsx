import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  CircleAlert, 
  CircleCheck, 
  Clock, 
  LayoutGrid, 
  Ticket as TicketIcon,
  X,
  Search,
  Filter,
  Users,
  Activity,
  User as UserIcon,
  TriangleAlert,
  Plus
} from 'lucide-react';
import TicketCreateForm from '../../components/tickets/TicketCreateForm';
import TicketList from '../../components/tickets/TicketList';
import TicketDetailView from '../../components/tickets/TicketDetailView';
import { getAllTickets, assignTechnician, getTicketById, deleteTicket } from '../../services/ticketApi';
import type { Ticket, TicketRole } from '../../services/ticketApi';
import { useAuth } from '../../contexts/AuthContext';

function toApiRole(role: string | null): TicketRole {
  const upper = role?.toUpperCase();
  if (upper === 'ADMIN') return 'ADMIN';
  if (upper === 'TECHNICIAN') return 'TECHNICIAN';
  return 'USER';
}

const StatCard = ({ label, value, icon, bgClass, trend }: { label: string, value: number, icon: React.ReactNode, bgClass: string, trend?: string }) => (
  <div className={`group relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${bgClass}`}>
    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-all group-hover:bg-white/10"></div>
    <div className="flex items-center justify-between relative z-10">
      <div className="rounded-2xl bg-white/10 p-2.5 backdrop-blur-md border border-white/10 shadow-inner">
        {icon}
      </div>
      {trend && <span className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/10 px-2 py-1 rounded-lg border border-white/5">{trend}</span>}
    </div>
    <div className="mt-6 relative z-10">
      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/70">{label}</p>
      <p className="mt-2 text-4xl font-black tracking-tighter text-white">{value}</p>
    </div>
  </div>
);

function IncidentTicketsPage() {
  const { role, user } = useAuth();
  const location = useLocation();
  const apiRole = toApiRole(role);
  const isAdmin = apiRole === 'ADMIN';
  const isTechnician = apiRole === 'TECHNICIAN';
  const isUser = apiRole === 'USER';
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [assigningTicket, setAssigningTicket] = useState<Ticket | null>(null);
  const [technicianId, setTechnicianId] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use the actual logged-in user's ID
  const currentUserId = user?.id || '0';

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTickets(currentUserId, apiRole);
      setTickets(Array.isArray(data) ? data : []);
      
      // If a ticket was selected, refresh it
      if (selectedTicket) {
        const updated = await getTicketById(selectedTicket.id);
        setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Failed to load tickets', error);
      setError('Failed to sync with maintenance systems. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this ticket?')) return;
    try {
      setLoading(true);
      await deleteTicket(ticketId, currentUserId);
      await loadTickets();
    } catch (error: any) {
      console.error('Failed to delete ticket', error);
      setError('Failed to delete ticket: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    if (location.state && (location.state as any).openCreateModal) {
      setShowCreateModal(true);
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [user]);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    
    // Role-based filtering handled by backend ideally, but we have frontend fail-safes
    if (isTechnician) {
       result = result.filter(t => 
         t.assignedTechnicianId === currentUserId.toString() || 
         t.assignedTechnicianId === 'TECH-' + currentUserId ||
         (t.assignedTechnicianId && t.assignedTechnicianId.startsWith('TECH'))
       );
    } else if (isUser) {
       // If backend isn't filtering for user, we can enforce it here
       // result = result.filter(t => t.reportedBy === currentUserId);
    }

    if (searchTerm) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [tickets, role, searchTerm, currentUserId]);

  const summary = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    const rejected = tickets.filter((t) => t.status === 'REJECTED').length;
    return { open, inProgress, resolved, rejected, total: tickets.length };
  }, [tickets]);

  const handleAssignTechnician = async () => {
    if (!assigningTicket || !technicianId.trim()) return;
    setAssignLoading(true);
    try {
      await assignTechnician(assigningTicket.id, technicianId.trim(), currentUserId, apiRole);
      setAssigningTicket(null);
      setTechnicianId('');
      await loadTickets();
    } catch (err) {
      console.error('Failed to assign technician', err);
      setError('Technician assignment failed. Verify Technician ID.');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 p-2 lg:p-6">
      
      {/* Premium Header/Dashboard Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 lg:p-12 text-white shadow-3xl border border-white/5">
        {/* Animated Background Blobs */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="rounded-3xl bg-gradient-to-tr from-indigo-500 to-blue-400 p-5 shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-500/20">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <div>
               <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black tracking-tighter text-white lg:text-5xl">
                   {isAdmin ? 'Admin Panel' : isTechnician ? 'Tech Hub' : 'Student Incident Hub'}
                 </h1>
                 <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/10">Module C</span>
               </div>
               <p className="mt-2 text-lg font-medium text-slate-400 max-w-xl">
                 Smart Campus Maintenance & Incident Response System.
               </p>
            </div>
          </div>
          
          {(isUser || isAdmin) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="group relative flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 shadow-2xl transition-all hover:scale-105 hover:bg-indigo-50 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Report Incident
              <div className="rounded-lg bg-slate-950 p-1 text-white transition-transform group-hover:rotate-90">
                <TicketIcon className="h-4 w-4" />
              </div>
            </button>
          )}
        </div>

        {/* Dashboard Stats (Rendered for all, but specially useful for ADMIN) */}
        <div className="relative z-10 mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <StatCard 
            label="Total Incidents" 
            value={summary.total} 
            icon={<TicketIcon className="h-5 w-5 text-indigo-300" />} 
            bgClass="bg-indigo-600/20 border-indigo-500/20 shadow-indigo-900/10" 
            trend="Live Sync"
          />
          <StatCard 
            label="Pending Work" 
            value={summary.open} 
            icon={<TriangleAlert className="h-5 w-5 text-rose-300" />} 
            bgClass="bg-rose-600/20 border-rose-500/20 shadow-rose-900/10"
            trend="Escalated"
          />
          <StatCard 
            label="Active Fixing" 
            value={summary.inProgress} 
            icon={<Clock className="h-5 w-5 text-amber-300" />} 
            bgClass="bg-amber-600/20 border-amber-500/20 shadow-amber-900/10"
            trend="Priority"
          />
          <StatCard 
            label="Resolved" 
            value={summary.resolved} 
            icon={<CircleCheck className="h-5 w-5 text-emerald-300" />} 
            bgClass="bg-emerald-600/20 border-emerald-500/20 shadow-emerald-900/10"
            trend="+12% Match"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-[1.5rem] border-2 border-rose-100 bg-rose-50/50 p-5 text-sm text-rose-700 shadow-xl backdrop-blur-md flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="bg-rose-100 p-2 rounded-xl">
             <CircleAlert className="h-6 w-6 text-rose-600" />
          </div>
          <span className="font-bold tracking-tight">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded-lg"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                 className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                 placeholder="Search by ID, Resource or Category..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4" /> Filters
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all border-dashed">
                <Users className="w-4 h-4" /> {role?.toUpperCase()} VIEW
              </button>
           </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/50 backdrop-blur-sm">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
              <Clock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
            </div>
            <p className="mt-6 text-lg font-black text-slate-400 uppercase tracking-widest">Initalizing Sync...</p>
          </div>
        ) : (
          <TicketList
            tickets={filteredTickets}
            onSelectTicket={setSelectedTicket}
            onAssignTechnician={isAdmin ? setAssigningTicket : undefined}
            onDeleteTicket={apiRole === 'USER' ? handleDeleteTicket : undefined}
            role={apiRole}
          />
        )}
      </div>

      {/* Modals & Overlays */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto custom-scrollbar">
             <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute right-6 top-6 z-20 p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm"
             >
               <X className="h-6 w-6" />
             </button>
             <TicketCreateForm
                currentUserId={currentUserId}
                onCreated={() => {
                  loadTickets();
                  setShowCreateModal(false);
                }}
              />
           </div>
        </div>
      )}

      {selectedTicket && (
        <TicketDetailView
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={loadTickets}
          currentUserId={currentUserId}
          role={apiRole}
        />
      )}

      {isAdmin && assigningTicket && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in zoom-in-95 duration-300">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-3xl border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
               <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                  <Users className="w-6 h-6" />
               </div>
               <div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Assign Expert</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ticket #{assigningTicket.id}</p>
               </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Qualified Technician ID</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    value={technicianId}
                    onChange={(e) => setTechnicianId(e.target.value)}
                    placeholder="e.g. TECH_EL_021"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  disabled={assignLoading || !technicianId.trim()}
                  onClick={handleAssignTechnician}
                >
                  {assignLoading ? <Clock className="animate-spin w-5 h-5" /> : 'Confirm Deployment'}
                </button>
                <button
                  className="w-full rounded-2xl border-2 border-slate-100 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  onClick={() => {
                    setAssigningTicket(null);
                    setTechnicianId('');
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentTicketsPage;
