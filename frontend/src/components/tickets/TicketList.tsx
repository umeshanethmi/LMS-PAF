import type { Ticket } from '../../services/ticketApi';

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onAssignTechnician?: (ticket: Ticket) => void;
  isAdmin?: boolean;
}

function getStatusBadgeClass(status: Ticket['status']) {
  if (status === 'RESOLVED') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'IN_PROGRESS') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (status === 'OPEN') return 'bg-rose-100 text-rose-700 border-rose-200';
  if (status === 'CLOSED') return 'bg-slate-100 text-slate-700 border-slate-200';
  return 'bg-zinc-100 text-zinc-700 border-zinc-200';
}

function TicketList({ tickets, onSelectTicket, onAssignTechnician, isAdmin = false }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No tickets yet.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Incident Tickets</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3">Created</th>
              {isAdmin && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {tickets.map((t) => (
              <tr
                key={t.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => onSelectTicket(t)}
              >
                <td className="px-4 py-3 font-medium text-slate-800">{t.resourceId || t.title || '-'}</td>
                <td className="px-4 py-3">{t.category}</td>
                <td className="px-4 py-3">{t.priority}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">{t.assignedTechnicianId || 'Unassigned'}</td>
                <td className="px-4 py-3">{new Date(t.createdAt).toLocaleString()}</td>
                {isAdmin && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                      onClick={() => onAssignTechnician?.(t)}
                    >
                      Assign Tech
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketList;
