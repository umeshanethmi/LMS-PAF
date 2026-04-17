import React, { useEffect, useState, useMemo } from 'react';
import { getAllTickets, getTicketById } from '../../services/ticketApi';
import type { Ticket } from '../../services/ticketApi';
import { DashboardSummary } from '../../components/tickets/DashboardSummary';
import TicketList from '../../components/tickets/TicketList';
import TicketDetailView from '../../components/tickets/TicketDetailView';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTickets();
      setTickets(data);
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
  }, []);

  const summary = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length
  }), [tickets]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-xl">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium">Campus Infrastructure & Incident Management</p>
          </div>
        </div>
        <button 
          onClick={loadTickets}
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group"
        >
          <RefreshCw className={`w-5 h-5 text-slate-400 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <DashboardSummary {...summary} />

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Global Ticket Registry</h2>
          <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            {tickets.length} Total Records
          </span>
        </div>
        
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <TicketList 
            tickets={tickets} 
            onSelectTicket={setSelectedTicket}
            role="ADMIN"
          />
        )}
      </div>

      {selectedTicket && (
        <TicketDetailView 
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={loadTickets}
          currentUserId={user?.id || 0}
          role="ADMIN"
        />
      )}
    </div>
  );
};

export default AdminDashboard;
