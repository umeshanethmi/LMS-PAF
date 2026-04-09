import apiClient from './apiClient';

export interface TicketAttachmentResponse {
  id: number;
  fileName: string;
  fileUrl: string;
}

export interface TicketCommentResponse {
  id: number;
  authorUserId: number;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  location?: string;
  facilityId?: number;
  preferredContact?: string;
  reporterUserId: number;
  technicianUserId?: number;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  attachments: TicketAttachmentResponse[];
  comments: TicketCommentResponse[];
}

export async function getMyTickets(currentUserId: number): Promise<Ticket[]> {
  const res = await apiClient.get<Ticket[]>(`/tickets/me`, {
    params: { currentUserId },
  });
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

export async function deleteTicketComment(ticketId: number, commentId: number, currentUserId: number, isStaffOrAdmin: boolean) {
  await apiClient.delete(`/tickets/${ticketId}/comments/${commentId}`, {
    params: { currentUserId, isStaffOrAdmin },
  });
}

export async function updateTicketStatus(ticketId: number, body: { newStatus: Ticket['status'] }, currentUserId: number, isStaffOrAdmin: boolean) {
  await apiClient.put(`/tickets/${ticketId}/status`, body, {
    params: { currentUserId, isStaffOrAdmin },
  });
}
