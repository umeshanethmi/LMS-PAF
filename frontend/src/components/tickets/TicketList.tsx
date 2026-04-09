import { Ticket } from '../../services/ticketApi';

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

function TicketList({ tickets, onSelectTicket }: TicketListProps) {
  if (tickets.length === 0) {
    return <p className="mt-4">No tickets yet.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">My Tickets</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">Title</th>
            <th className="px-2 py-1 border">Location</th>
            <th className="px-2 py-1 border">Priority</th>
            <th className="px-2 py-1 border">Status</th>
            <th className="px-2 py-1 border">Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr
              key={t.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectTicket(t)}
            >
              <td className="px-2 py-1 border">{t.title}</td>
              <td className="px-2 py-1 border">{t.location}</td>
              <td className="px-2 py-1 border">{t.priority}</td>
              <td className="px-2 py-1 border">{t.status}</td>
              <td className="px-2 py-1 border">{new Date(t.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketList;
