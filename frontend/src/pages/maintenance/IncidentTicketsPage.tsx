import { useEffect, useState } from 'react';
import TicketCreateForm from '../../components/tickets/TicketCreateForm';
import TicketList from '../../components/tickets/TicketList';
import TicketDetailView from '../../components/tickets/TicketDetailView';
import { getMyTickets, Ticket } from '../../services/ticketApi';

function IncidentTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const currentUserId = 1; // TODO: replace with real logged-in user ID when auth is integrated

  const loadTickets = async () =>
    {
      try {
        const data = await getMyTickets(currentUserId);
        setTickets(data);
      } catch (error) {
        console.error('Failed to load tickets', error);
      }
    };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Maintenance & Incident Tickets</h1>

      <TicketCreateForm
        currentUserId={currentUserId}
        onCreated={loadTickets}
      />

      <TicketList
        tickets={tickets}
        onSelectTicket={setSelectedTicket}
      />

      {selectedTicket && (
        <TicketDetailView
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={loadTickets}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}

export default IncidentTicketsPage;
