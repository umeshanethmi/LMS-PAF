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
    case 'RESOLVED':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <CircleCheck className="w-3.5 h-3.5" />
      };
    case 'IN_PROGRESS':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: <Clock className="w-3.5 h-3.5" />
      };
    case 'OPEN':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: <TriangleAlert className="w-3.5 h-3.5" />
      };
    case 'REJECTED':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: <XIcon className="w-3.5 h-3.5" />
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
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
            <tr className="bg-slate-50/50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Resource & Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4">Created</th>
              {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tickets.map((t) => {
              const styles = getStatusStyles(t.status);
              return (
                <tr
                  key={t.id}
                  className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                  onClick={() => onSelectTicket(t)}
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-slate-900">{t.resourceId || 'N/A'}</span>
                         <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">#{t.id}</span>
                      </div>
                      <span className="mt-0.5 text-xs font-medium text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {t.location}
                      </span>
                      <span className="mt-1 text-[10px] font-bold text-indigo-500 uppercase tracking-tight">{t.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all shadow-sm ${styles.bg} ${styles.text} ${styles.border}`}>
                      {styles.icon}
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      t.priority === 'HIGH' ? 'text-rose-600' : t.priority === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{t.assignedTechnicianId || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{new Date(t.createdAt).toLocaleDateString()}</span>
                      <span className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      {t.status === 'OPEN' ? (
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                          onClick={() => onAssignTechnician?.(t)}
                        >
                          <UserIcon className="w-3 h-3" />
                          Assign
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Manage in Detail</span>
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
