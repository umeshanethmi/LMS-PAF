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
  userId: number;
  authorUserId?: number;
  content: string;
  timestamp: string;
  createdAt?: string;
}

export interface Ticket {
  id: number;
  resourceId: string;
  title?: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
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

export type TicketRole = 'USER' | 'ADMIN' | 'TECHNICIAN';

export async function getAllTickets(): Promise<Ticket[]> {
  const res = await apiClient.get<Ticket[]>(`/tickets`);
  return res.data;
}

export async function createTicket(formData: FormData): Promise<Ticket> {
  const res = await apiClient.post<Ticket>(`/tickets`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function addTicketComment(ticketId: number, body: { content: string }, currentUserId: number) {
  const res = await apiClient.post(`/tickets/${ticketId}/comments`, body, {
    params: { currentUserId },
  });
  return res.data as TicketCommentResponse;
}

export async function deleteTicketComment(ticketId: number, commentId: number, currentUserId: number, role: TicketRole) {
  await apiClient.delete(`/tickets/${ticketId}/comments/${commentId}`, {
    params: { currentUserId, role },
  });
}

export async function updateTicketStatus(
  ticketId: number,
  body: { newStatus: Ticket['status']; resolutionNotes?: string },
  currentUserId: number,
  role: TicketRole,
) {
  await apiClient.put(`/tickets/${ticketId}/status`, body, {
    params: { currentUserId, role },
  });
}

export async function assignTechnician(
  ticketId: number,
  technicianId: string,
  currentUserId: number,
  role: TicketRole,
) {
  await apiClient.put(`/tickets/${ticketId}/assign`, null, {
    params: { technicianId, currentUserId, role },
  });
}
