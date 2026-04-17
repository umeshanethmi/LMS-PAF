import React, { useEffect, useState, useMemo } from 'react';
import { getAllTickets, getTicketById } from '../../services/ticketApi';
import type { Ticket } from '../../services/ticketApi';
import TicketList from '../../components/tickets/TicketList';
import TicketCreateForm from '../../components/tickets/TicketCreateForm';
import TicketDetailView from '../../components/tickets/TicketDetailView';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Ticket as TicketIcon, CheckCircle2, Clock, Activity } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const stats = useMemo(() => ({
    total: tickets.length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    pending: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
  }), [tickets]);

  return (
    <>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Incident Hub</h1>
            <p className="text-slate-500 font-medium mt-1">Efficiently track and manage your campus maintenance requests.</p>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            <Plus className="w-5 h-5" />
            Report New Incident
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Reported</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors"><Activity className="w-6 h-6 text-indigo-600" /></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items Resolved</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{stats.resolved}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-amber-200 transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Work</p>
              <p className="text-3xl font-black text-amber-600 mt-1">{stats.pending}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors"><Clock className="w-6 h-6 text-amber-600" /></div>
          </div>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <TicketIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">My Maintenance Tickets</h2>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
            {loading ? (
              <div className="p-20 flex justify-center">
                <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <TicketList 
                tickets={tickets} 
                onSelectTicket={setSelectedTicket}
                role="USER"
              />
            )}
          </div>
        </section>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl p-2 custom-scrollbar">
             <TicketCreateForm 
               currentUserId={user?.id || 0}
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

      {selectedTicket && (
        <TicketDetailView 
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={loadTickets}
          currentUserId={user?.id || 0}
          role="USER"
        />
      )}
    </>
  );
};

export default UserDashboard;
