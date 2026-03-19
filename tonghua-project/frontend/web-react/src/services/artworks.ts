import api from './api';
import type { Artwork, PaginatedResponse } from '@/types';

export const artworksApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    campaignId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Artwork>> => {
    const response = await api.get<PaginatedResponse<Artwork>>('/artworks', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Artwork> => {
    const response = await api.get<Artwork>(`/artworks/${id}`);
    return response.data;
  },

  getFeatured: async (): Promise<Artwork[]> => {
    const response = await api.get<Artwork[]>('/artworks/featured');
    return response.data;
  },

  vote: async (id: string): Promise<{ voteCount: number }> => {
    const response = await api.post<{ voteCount: number }>(
      `/artworks/${id}/vote`
    );
    return response.data;
  },
};
