import React from 'react';
import type { Ticket, TicketRole } from '../../services/ticketApi';
import { Clock, CircleCheck, TriangleAlert, X as XIcon, User as UserIcon, MapPin, Hash } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onAssignTechnician?: (ticket: Ticket) => void;
  role: TicketRole;
}

function getStatusStyles(status: Ticket['status']) {
  switch (status) {
    case 'ASSIGNED':
      return {
        bg: 'bg-indigo-100/50',
        text: 'text-indigo-700',
        border: 'border-indigo-200/50',
        dot: 'bg-indigo-500',
        icon: <Clock className="w-3.5 h-3.5" />
      };
    case 'RESOLVED':
      return {
        bg: 'bg-emerald-100/50',
        text: 'text-emerald-700',
        border: 'border-emerald-200/50',
        dot: 'bg-emerald-500',
        icon: <CircleCheck className="w-3.5 h-3.5" />
      };
    case 'IN_PROGRESS':
      return {
        bg: 'bg-amber-100/50',
        text: 'text-amber-700',
        border: 'border-amber-200/50',
        dot: 'bg-amber-500',
        icon: <Clock className="w-3.5 h-3.5" />
      };
    case 'OPEN':
      return {
        bg: 'bg-rose-100/50',
        text: 'text-rose-700',
        border: 'border-rose-200/50',
        dot: 'bg-rose-500',
        icon: <TriangleAlert className="w-3.5 h-3.5" />
      };
    case 'REJECTED':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        icon: <XIcon className="w-3.5 h-3.5" />
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        icon: <Clock className="w-3.5 h-3.5" />
      };
  }
}

function TicketList({ tickets, onSelectTicket, onAssignTechnician, role }: TicketListProps) {
  const isAdmin = role === 'ADMIN';

  if (tickets.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center backdrop-blur-sm">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <TicketIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No tickets found</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-[250px]">
          {role === 'USER' ? "You haven't reported any incidents yet." : "There are no tickets matching this view."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl shadow-slate-200/50">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/50 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-100">
              <th className="px-8 py-5">Incident / Area</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Priority</th>
              <th className="px-8 py-5">Technician</th>
              <th className="px-8 py-5">Reported</th>
              {isAdmin && <th className="px-8 py-5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tickets.map((t) => {
              const styles = getStatusStyles(t.status);
              return (
                <tr
                  key={t.id}
                  className="group cursor-pointer transition-all duration-300 hover:bg-slate-50/80"
                  onClick={() => onSelectTicket(t)}
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-slate-900 tracking-tight">{t.email || 'General Issue'}</span>
                         <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-black text-slate-400">#{t.id}</span>
                      </div>
                      <span className="mt-1 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" /> {t.location}
                      </span>
                      <span className="mt-1.5 text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t.category}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black transition-all shadow-sm ${styles.bg} ${styles.text} ${styles.border}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`}></div>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${
                      t.priority === 'HIGH' ? 'text-rose-600' : t.priority === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="text-sm font-bold tracking-tight">{t.assignedTechnicianId || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 tracking-tight">{new Date(t.createdAt).toLocaleDateString()}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                      {t.status === 'OPEN' ? (
                        <button
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95"
                          onClick={() => onAssignTechnician?.(t)}
                        >
                          <UserIcon className="w-3 h-3" />
                          Assign
                        </button>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">In Workflow</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M2 9V5.2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2V9" />
      <path d="M2 15v3.8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V15" />
      <path d="M2 13a2 2 0 0 0 2-2V9" />
      <path d="M2 15a2 2 0 0 1 2-2" />
      <path d="M22 13a2 2 0 0 1-2-2V9" />
      <path d="M22 15a2 2 0 0 0-2-2" />
    </svg>
  );
}

export default TicketList;
