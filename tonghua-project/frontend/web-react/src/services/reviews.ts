import api from './api';

export interface Review {
  id: number;
  product_id: number;
  order_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  content: string | null;
  images: string[];
  sustainability_rating: number | null;
  sustainability_comment: string | null;
  is_verified_purchase: boolean;
  is_anonymous: boolean;
  helpful_count: number;
  status: string;
  created_at: string;
}

export interface ReviewSummary {
  product_id: number;
  total_reviews: number;
  average_rating: number;
  sustainability_avg: number | null;
  rating_distribution: Record<string, number>;
}

export interface CreateReviewData {
  product_id: number;
  order_id: number;
  rating: number;
  title?: string;
  content?: string;
  images?: string[];
  sustainability_rating?: number;
  sustainability_comment?: string;
  is_anonymous?: boolean;
}

export const getProductReviews = async (
  productId: number,
  page = 1,
  pageSize = 10
) => {
  const response = await api.get(`/reviews/product/${productId}`, {
    params: { page, page_size: pageSize, status: 'approved' },
  });
  return response.data;
};

export const getReviewSummary = async (productId: number): Promise<ReviewSummary> => {
  const response = await api.get(`/reviews/product/${productId}/summary`);
  return response.data.data;
};

export const createReview = async (data: CreateReviewData): Promise<Review> => {
  const response = await api.post('/reviews', data);
  return response.data.data;
};

export const markReviewHelpful = async (reviewId: number) => {
  const response = await api.post(`/reviews/${reviewId}/helpful`);
  return response.data.data;
};
