import api from './api';
import type { ProductVariant, Product } from './productService';

export interface CartItem {
  id: number;
  user_id: number;
  product_variant_id: number;
  quantity: number;
  variant: ProductVariant & { product: Product };
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

export const cartService = {
  async get() {
    const { data } = await api.get('/customer/cart');
    return data.data as CartResponse;
  },

  async add(productVariantId: number, quantity: number = 1) {
    const { data } = await api.post('/customer/cart', {
      product_variant_id: productVariantId,
      quantity,
    });
    return data.data as CartItem;
  },

  async updateQuantity(cartItemId: number, quantity: number) {
    const { data } = await api.patch(`/customer/cart/${cartItemId}`, { quantity });
    return data.data as CartItem;
  },

  async remove(cartItemId: number) {
    await api.delete(`/customer/cart/${cartItemId}`);
  },

  async clear() {
    await api.delete('/customer/cart');
  },
};

export default cartService;
