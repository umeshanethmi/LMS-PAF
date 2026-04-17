import apiClient from './apiClient';

export interface TicketAttachmentResponse {
  id: number;
  imagePath: string;
  fileUrl?: string;
  createdAt?: string;
}

export interface TicketCommentResponse {
  id: number;
  ticketId: number;
  authorUserId: number;
  content: string;
  timestamp: string;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TicketRole = 'USER' | 'ADMIN' | 'TECHNICIAN';

export interface Ticket {
  id: number;
  resourceId: string;
  title?: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  location: string;
  contactDetails: string;
  preferredContact?: string;
  assignedTechnicianId?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
  attachments: TicketAttachmentResponse[];
  comments: TicketCommentResponse[];
}

export async function getAllTickets(): Promise<Ticket[]> {
  const res = await apiClient.get<Ticket[]>(`/tickets`);
  return res.data;
}

export async function getTicketById(id: number): Promise<Ticket> {
  const res = await apiClient.get<Ticket>(`/tickets/${id}`);
  return res.data;
}

export async function createTicket(formData: FormData): Promise<Ticket> {
  const res = await apiClient.post<Ticket>(`/tickets`, formData);
  return res.data;
}

export async function addTicketComment(ticketId: number, content: string, currentUserId: number) {
  const res = await apiClient.post(`/tickets/${ticketId}/comments`, { content }, {
    params: { currentUserId },
  });
  return res.data;
}

export async function updateTicketStatus(
  ticketId: number,
  newStatus: TicketStatus,
  currentUserId: number,
  role: TicketRole,
  resolutionNotes?: string
) {
  const res = await apiClient.patch(`/tickets/${ticketId}/status`, null, {
    params: { status: newStatus, resolutionNotes }
  });
  return res.data;
}

export async function assignTechnician(
  ticketId: number,
  technicianId: string,
  currentUserId: number,
  role: TicketRole
) {
  const res = await apiClient.put(`/tickets/${ticketId}/assign`, null, {
    params: { technicianId, currentUserId, role },
  });
  return res.data;
}
