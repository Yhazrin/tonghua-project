import api from './api';
import type { Order, Address } from '@/types';

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[];
  shippingAddress: Address;
}

export const ordersApi = {
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/mine');
    return response.data;
  },

  cancel: async (id: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${id}/cancel`);
    return response.data;
  },
};
