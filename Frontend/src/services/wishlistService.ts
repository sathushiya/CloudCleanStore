import api from './api';
import { Product, toFrontendProduct } from './productService';

export interface WishlistApiItem {
  id: number;
  product_id: number;
  product: Product;
}

export const wishlistService = {
  async list() {
    const { data } = await api.get('/customer/wishlist');
    const items = data.data as WishlistApiItem[];
    return items.map((item) => ({
      wishlistId: item.id,
      product: toFrontendProduct(item.product),
    }));
  },

  async add(productId: number) {
    const { data } = await api.post('/customer/wishlist', { product_id: productId });
    return data.data;
  },

  async remove(productId: number) {
    await api.delete(`/customer/wishlist/${productId}`);
  },
};

export default wishlistService;