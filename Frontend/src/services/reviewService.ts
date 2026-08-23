import api from './api';

export interface PublicReview {
  id: number;
  rating: number;
  comment: string;
  name: string;
  created_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  order_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export const reviewService = {
  // Public -- powers the landing page testimonials section.
  async listPublic() {
    const { data } = await api.get('/reviews');
    return data.data as PublicReview[];
  },

  async submit(orderId: number, rating: number, comment: string) {
    const { data } = await api.post(`/customer/orders/${orderId}/review`, { rating, comment });
    return data.data as Review;
  },
};

export default reviewService;
