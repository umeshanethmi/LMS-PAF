import React, { useEffect, useState, useMemo } from 'react';
import { getAllTickets, getTicketById } from '../../services/ticketApi';
import type { Ticket } from '../../services/ticketApi';
import TicketList from '../../components/tickets/TicketList';
import TicketDetailView from '../../components/tickets/TicketDetailView';
import { useAuth } from '../../contexts/AuthContext';
import { Wrench, CheckCircle2, Clock } from 'lucide-react';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTickets();
      // Filter for tickets assigned to this technician
      // We assume a naming convention or ID match for demo purposes
      const filtered = data.filter(t => {
        if (!user) return true; // Show all in simulation/guest mode
        return (
          t.assignedTechnicianId === user.id.toString() || 
          t.assignedTechnicianId === user.username ||
          (t.assignedTechnicianId && t.assignedTechnicianId.includes('TECH'))
        );
      });
      setTickets(filtered);
      
      if (selectedTicket) {
        const updated = await getTicketById(selectedTicket.id);
        setSelectedTicket(updated);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  const stats = useMemo(() => ({
    assigned: tickets.length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  }), [tickets]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-6">
        <div className="bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-600/30">
          <Wrench className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Technician Hub</h1>
          <p className="text-slate-500 font-medium">Manage your assigned campus repairs and updates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned To You</p>
            <p className="text-3xl font-black text-slate-900">{stats.assigned}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl"><Wrench className="w-6 h-6 text-indigo-600" /></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">In Progress</p>
            <p className="text-3xl font-black text-amber-600">{stats.inProgress}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl"><Clock className="w-6 h-6 text-amber-600" /></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolved Today</p>
            <p className="text-3xl font-black text-emerald-600">{stats.resolved}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Assigned Tasks</h2>
        </div>
        
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <TicketList 
            tickets={tickets} 
            onSelectTicket={setSelectedTicket}
            role="TECHNICIAN"
          />
        )}
      </div>

      {selectedTicket && (
        <TicketDetailView 
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={loadTickets}
          currentUserId={user?.id || 0}
          role="TECHNICIAN"
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;
