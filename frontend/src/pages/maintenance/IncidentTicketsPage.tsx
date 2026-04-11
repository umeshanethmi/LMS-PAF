import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  LayoutDashboard, 
  Ticket as TicketIcon 
} from 'lucide-react';
import TicketCreateForm from '../../components/tickets/TicketCreateForm';
import TicketList from '../../components/tickets/TicketList';
import TicketDetailView from '../../components/tickets/TicketDetailView';
import { assignTechnician } from '../../services/ticketApi';
import type { Ticket, TicketRole } from '../../services/ticketApi';
import { useAuth } from '../../contexts/AuthContext';

function toApiRole(role: string | null): TicketRole {
  if (role === 'admin') return 'ADMIN';
  if (role === 'technician') return 'TECHNICIAN';
  return 'USER';
}

const StatCard = ({ label, value, icon, bgClass }: { label: string, value: number, icon: React.ReactNode, bgClass: string }) => (
  <div className={`rounded-2xl border p-5 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${bgClass}`}>
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-300/90">{label}</p>
      {icon}
    </div>
    <p className="mt-3 text-4xl font-extrabold tracking-tight text-white">{value}</p>
  </div>
);

function IncidentTicketsPage() {
  const { role } = useAuth();
  const apiRole = toApiRole(role);
  const isAdmin = role === 'admin';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [assigningTicket, setAssigningTicket] = useState<Ticket | null>(null);
  const [technicianId, setTechnicianId] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = 1; // TODO: replace with auth context

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:8080/api/tickets');
      const data = response.data;
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
        setError('Unexpected ticket response format from API.');
      }
    } catch (error) {
      console.error('Failed to load tickets', error);
      setError('Failed to load tickets from the API.');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    return { open, inProgress, resolved, total: tickets.length };
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
      setError('Failed to assign technician.');
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md shadow-inner border border-white/10 ring-1 ring-white/5">
            <LayoutDashboard className="h-9 w-9 text-indigo-300 drop-shadow-sm" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">Incident Dashboard</h1>
            <p className="mt-1.5 text-[15px] font-medium text-indigo-200/80">Track incidents, manage maintenance, and monitor resolution progress.</p>
          </div>
        </div>

        <div className="relative z-10 mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          <StatCard 
            label="Total Tickets" 
            value={summary.total} 
            icon={<TicketIcon className="h-6 w-6 text-indigo-300 drop-shadow-md" />} 
            bgClass="bg-indigo-500/15 border-indigo-500/30" 
          />
          <StatCard 
            label="Open" 
            value={summary.open} 
            icon={<AlertCircle className="h-6 w-6 text-rose-300 drop-shadow-md" />} 
            bgClass="bg-rose-500/15 border-rose-500/30" 
          />
          <StatCard 
            label="In Progress" 
            value={summary.inProgress} 
            icon={<Clock className="h-6 w-6 text-amber-300 drop-shadow-md" />} 
            bgClass="bg-amber-500/15 border-amber-500/30" 
          />
          <StatCard 
            label="Resolved" 
            value={summary.resolved} 
            icon={<CheckCircle2 className="h-6 w-6 text-emerald-300 drop-shadow-md" />} 
            bgClass="bg-emerald-500/15 border-emerald-500/30" 
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200/60 bg-rose-50/50 p-4 text-sm text-rose-700 shadow-sm backdrop-blur-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <TicketCreateForm
            currentUserId={currentUserId}
            onCreated={loadTickets}
          />
        </div>
        
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200/50 bg-white/50 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <Clock className="h-5 w-5 animate-spin" />
                <span className="font-medium">Loading tickets...</span>
              </div>
            </div>
          ) : (
            <TicketList
              tickets={tickets}
              onSelectTicket={setSelectedTicket}
              onAssignTechnician={isAdmin ? setAssigningTicket : undefined}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md scale-100 rounded-3xl bg-white p-6 shadow-2xl transition-transform">
            <h2 className="text-xl font-bold text-slate-800">Assign Technician</h2>
            <p className="mt-2 text-sm text-slate-500">
              Assigning for ticket #{assigningTicket.id} - <span className="font-medium text-slate-700">{assigningTicket.resourceId || assigningTicket.title}</span>
            </p>
            
            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Technician ID</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                placeholder="e.g. TECH-102"
              />
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
                onClick={() => {
                  setAssigningTicket(null);
                  setTechnicianId('');
                }}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 transition-all"
                disabled={assignLoading}
                onClick={handleAssignTechnician}
              >
                {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentTicketsPage;
