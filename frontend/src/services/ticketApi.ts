import apiClient from './apiClient';

export interface TicketAttachmentResponse {
  id: string;
  imagePath: string;
  fileUrl?: string;
  createdAt?: string;
}

export interface TicketCommentResponse {
  id: string;
  ticketId: string;
  authorUserId: string;
  author?: string;
  authorRole?: TicketRole;
  content: string;
  timestamp: string;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TicketRole = 'USER' | 'ADMIN' | 'TECHNICIAN';

export interface Ticket {
  id: string;
  email: string;
  title?: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  location: string;
  contactDetails: string;
  preferredContact?: string;
  reporterUserId?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
  attachments: TicketAttachmentResponse[];
  comments: TicketCommentResponse[];
}

export async function getAllTickets(currentUserId?: string, role?: TicketRole): Promise<Ticket[]> {
  const res = await apiClient.get<Ticket[]>(`/tickets`, {
    params: { currentUserId, role }
  });
  return res.data;
}

export async function getTicketById(id: string): Promise<Ticket> {
  const res = await apiClient.get<Ticket>(`/tickets/${id}`);
  return res.data;
}

export async function createTicket(formData: FormData): Promise<Ticket> {
  const res = await apiClient.post<Ticket>(`/tickets`, formData);
  return res.data;
}

export async function updateTicket(ticketId: string, formData: FormData, currentUserId: string): Promise<Ticket> {
  const res = await apiClient.put<Ticket>(`/tickets/${ticketId}`, formData, {
    params: { currentUserId }
  });
  return res.data;
}

export async function deleteTicket(ticketId: string, currentUserId: string): Promise<void> {
  await apiClient.delete(`/tickets/${ticketId}`, {
    params: { currentUserId }
  });
}

export async function addTicketComment(ticketId: string, content: string, currentUserId: string, role: TicketRole) {
  const senderName = role === 'ADMIN' ? 'System Administrator' :
    role === 'TECHNICIAN' ? 'Campus Technician' : 'Student';

  const res = await apiClient.post(`/tickets/${ticketId}/comments`, {
    content,
    senderName,
    senderRole: role
  }, {
    params: { currentUserId, role },
  });
  return res.data;
}

export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  currentUserId: string,
  role: TicketRole,
  resolutionNotes?: string
) {
  const res = await apiClient.put(`/tickets/${ticketId}/status`, { newStatus, resolutionNotes }, {
    params: { currentUserId, role }
  });
  return res.data;
}

export async function assignTechnician(
  ticketId: string,
  technicianId: string,
  currentUserId: string,
  role: TicketRole
): Promise<Ticket> {
  const res = await apiClient.put(`/tickets/${ticketId}/assign`, null, {
    params: { technicianId, currentUserId, role },
  });
  return res.data;
}

export async function startWork(ticketId: string, currentUserId: string): Promise<Ticket> {
  const res = await apiClient.put(`/tickets/${ticketId}/start`, null, {
    params: { currentUserId },
  });
  return res.data;
}
export async function getTechnicians() {
  const res = await apiClient.get('/users/technicians');
  return res.data;
}

// UniOps V1 Endpoints
export async function getAssignedTasks(techId: string): Promise<Ticket[]> {
  const res = await apiClient.get<Ticket[]>(`/v1/tickets/technician/${techId}`);
  return res.data;
}

export async function dispatchTicket(ticketId: string, technicianId: string, requestingUserId: string): Promise<Ticket> {
  const res = await apiClient.put<Ticket>(`/v1/tickets/${ticketId}/dispatch`, null, {
    params: { technicianId, requestingUserId }
  });
  return res.data;
}

export async function resolveTicket(ticketId: string, technicianId: string, notes: string): Promise<Ticket> {
  const res = await apiClient.patch<Ticket>(`/v1/tickets/${ticketId}/resolve`, null, {
    params: { technicianId, notes }
  });
  return res.data;
}

export async function submitFeedback(ticketId: string, rating: number, comment: string, studentId: string): Promise<Ticket> {
  const res = await apiClient.post<Ticket>(`/v1/tickets/${ticketId}/feedback`, null, {
    params: { rating, comment, studentId }
  });
  return res.data;
}
