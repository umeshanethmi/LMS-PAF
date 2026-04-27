import apiClient from './apiClient';

export interface SlotSuggestion {
  resourceId: string;
  resourceCode: string;
  resourceName: string;
  building: string;
  startTime: string;
  endTime: string;
  availableHours: number;
  capacity: number;
  note: string;
}

export interface ChatResponse {
  reply: string;
  suggestions: SlotSuggestion[];
}

export interface BookingPayload {
  resourceId: string;
  startTime: string;
  endTime: string;
  partySize?: number;
  purpose?: string;
}

export interface BookingRecord {
  id: string;
  resourceId: string;
  resourceCode: string;
  resourceName: string;
  building: string;
  userId: string;
  startTime: string;
  endTime: string;
  partySize: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = BookingRecord['status'];

export const bookingApi = {
  chat: (message: string, userId?: string, preferredDate?: string) =>
    apiClient.post<ChatResponse>('/booking-chat', { message, userId, preferredDate }),

  create: (payload: BookingPayload) =>
    apiClient.post<BookingRecord>('/bookings', payload),

  myBookings: () =>
    apiClient.get<BookingRecord[]>('/bookings?mine=true'),

  /** Admin/Instructor: list every booking across all users. */
  allBookings: () =>
    apiClient.get<BookingRecord[]>('/bookings'),

  cancel: (id: string) =>
    apiClient.put<BookingRecord>(`/bookings/${id}/cancel`),

  /** Admin: approve or reject a booking. */
  updateStatus: (id: string, status: BookingStatus, reason?: string) =>
    apiClient.put<BookingRecord>(`/bookings/${id}/status`, { status, reason }),

  getResources: () =>
    apiClient.get('/resources'),
};
