import api from './api';

export interface LogisticsEvent {
  id: number;
  logistics_id: number;
  status: string;
  location: string | null;
  description: string | null;
  event_time: string;
}

export interface LogisticsRecord {
  id: number;
  order_id: number;
  tracking_no: string | null;
  carrier: string | null;
  status: string;
  current_location: string | null;
  description: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  events: LogisticsEvent[];
  created_at: string;
  updated_at: string;
}

export const logisticsStatusMap: Record<string, string> = {
  pending: '待揽收',
  picked_up: '已揽收',
  in_transit: '运输中',
  out_for_delivery: '派送中',
  delivered: '已签收',
  exception: '运输异常',
};

export const getOrderLogistics = async (orderId: number): Promise<LogisticsRecord> => {
  const response = await api.get(`/logistics/order/${orderId}`);
  return response.data.data;
};

export const getLogisticsDetail = async (logisticsId: number): Promise<LogisticsRecord> => {
  const response = await api.get(`/logistics/${logisticsId}`);
  return response.data.data;
};
