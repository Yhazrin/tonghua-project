import api from './api';

export interface AfterSalesMessage {
  id: number;
  request_id: number;
  sender_id: number;
  sender_role: 'user' | 'admin';
  content: string;
  images: string[];
  created_at: string;
}

export interface AfterSalesRequest {
  id: number;
  order_id: number;
  user_id: number;
  request_type: string;
  reason: string;
  description: string | null;
  images: string[];
  status: string;
  refund_amount: string | null;
  refund_status: string | null;
  admin_note: string | null;
  resolved_at: string | null;
  messages: AfterSalesMessage[];
  created_at: string;
  updated_at: string;
}

export interface CreateAfterSalesData {
  order_id: number;
  request_type: 'return' | 'exchange' | 'repair' | 'complaint' | 'inquiry';
  reason: string;
  description?: string;
  images?: string[];
}

export const afterSalesTypeMap: Record<string, string> = {
  return: '退货退款',
  exchange: '换货',
  repair: '维修',
  complaint: '投诉',
  inquiry: '咨询',
};

export const afterSalesStatusMap: Record<string, string> = {
  submitted: '已提交',
  reviewing: '审核中',
  approved: '已批准',
  rejected: '已拒绝',
  processing: '处理中',
  completed: '已完成',
};

export const getMyAfterSales = async (page = 1, pageSize = 20) => {
  const response = await api.get('/after-sales/mine', {
    params: { page, page_size: pageSize },
  });
  return response.data;
};

export const createAfterSales = async (data: CreateAfterSalesData): Promise<AfterSalesRequest> => {
  const response = await api.post('/after-sales', data);
  return response.data.data;
};

export const getAfterSalesDetail = async (requestId: number): Promise<AfterSalesRequest> => {
  const response = await api.get(`/after-sales/${requestId}`);
  return response.data.data;
};

export const sendAfterSalesMessage = async (
  requestId: number,
  content: string,
  images?: string[]
): Promise<AfterSalesMessage> => {
  const response = await api.post(`/after-sales/${requestId}/messages`, {
    content,
    images,
  });
  return response.data.data;
};
