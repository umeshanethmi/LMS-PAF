import apiClient from './apiClient';

export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';

export interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  capacity: number | null;
  location: string;
  description: string;
  status: ResourceStatus;
  availabilityStart: string | null;
  availabilityEnd: string | null;
  availableDays: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceRequest {
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  description?: string;
  status: ResourceStatus;
  availabilityStart?: string;
  availabilityEnd?: string;
  availableDays?: string;
  imageUrl?: string;
}

export interface ResourceFilters {
  type?: ResourceType;
  minCapacity?: number;
  location?: string;
  status?: ResourceStatus;
}

export const resourceService = {
  getAll: (filters: ResourceFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.minCapacity) params.append('minCapacity', String(filters.minCapacity));
    if (filters.location) params.append('location', filters.location);
    if (filters.status) params.append('status', filters.status);
    return apiClient.get<Resource[]>(`/resources?${params.toString()}`);
  },

  getById: (id: number) =>
    apiClient.get<Resource>(`/resources/${id}`),

  create: (data: CreateResourceRequest) =>
    apiClient.post<Resource>('/resources', data),

  update: (id: number, data: CreateResourceRequest) =>
    apiClient.put<Resource>(`/resources/${id}`, data),

  updateStatus: (id: number, status: ResourceStatus) =>
    apiClient.patch<Resource>(`/resources/${id}/status?status=${status}`),

  delete: (id: number) =>
    apiClient.delete(`/resources/${id}`),
};
