import api from './api';

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatRequest {
  session_id: string;
  message: string;
  interaction_type?: string;
  context?: Record<string, unknown>;
  history?: AIChatMessage[];
}

export interface AISuggestion {
  type: string;
  label: string;
  path?: string;
}

export interface AIChatResponse {
  session_id: string;
  interaction_id: number | null;
  message: string;
  interaction_type: string;
  suggestions: AISuggestion[] | null;
  actions: Array<{ label: string; path: string }> | null;
}

export interface ClothingDonation {
  id: number;
  user_id: number;
  campaign_id: number | null;
  clothing_type: string;
  quantity: number;
  condition: string;
  description: string | null;
  images: string[];
  pickup_address: string | null;
  pickup_time_slot: string | null;
  status: string;
  converted_product_id: number | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface SustainabilityMetric {
  entity_type: string;
  entity_id: number;
  carbon_saved_kg: number | null;
  water_saved_liters: number | null;
  textile_recycled_kg: number | null;
  trees_equivalent: number | null;
  sustainability_score: number | null;
  certification: string | null;
  is_estimated?: boolean;
}

export interface SustainabilitySummary {
  total_carbon_saved_kg: number;
  total_water_saved_liters: number;
  total_textile_recycled_kg: number;
  total_items: number;
  children_helped?: number;
  artworks_created?: number;
}

export const sendChatMessage = async (data: AIChatRequest): Promise<AIChatResponse> => {
  const response = await api.post('/ai/chat', data);
  return response.data.data;
};

export const submitAIFeedback = async (interactionId: number, feedback: 'helpful' | 'not_helpful') => {
  const response = await api.post('/ai/feedback', { interaction_id: interactionId, feedback });
  return response.data.data;
};

export const getAIRecommendations = async (context = 'general', limit = 4) => {
  const response = await api.get('/ai/recommend', { params: { context, limit } });
  return response.data.data;
};

export const submitClothingDonation = async (data: {
  clothing_type: string;
  quantity: number;
  condition: string;
  description?: string;
  images?: string[];
  pickup_address?: string;
  pickup_time_slot?: string;
  campaign_id?: number;
}): Promise<ClothingDonation> => {
  const response = await api.post('/ai/clothing-donations', data);
  return response.data.data;
};

export const getMyClothingDonations = async (page = 1, pageSize = 20) => {
  const response = await api.get('/ai/clothing-donations/mine', {
    params: { page, page_size: pageSize },
  });
  return response.data;
};

export const getSustainabilityMetric = async (
  entityType: string,
  entityId: number
): Promise<SustainabilityMetric> => {
  const response = await api.get(`/ai/sustainability/${entityType}/${entityId}`);
  return response.data.data;
};

export const getSustainabilitySummary = async (): Promise<SustainabilitySummary> => {
  const response = await api.get('/ai/sustainability/summary');
  return response.data.data;
};

export const clothingConditionMap: Record<string, string> = {
  new: '全新',
  like_new: '近全新',
  good: '良好',
  fair: '一般',
};

export const clothingDonationStatusMap: Record<string, string> = {
  submitted: '已提交',
  scheduled: '已安排取件',
  picked_up: '已取件',
  processing: '处理中',
  converted: '已转化为商品',
  completed: '完成',
  rejected: '不符合标准',
};
