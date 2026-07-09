import api from './api';

export type OrderStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  product_name: string;
  variant_size: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  total: number;
  status: OrderStatus;
  delivery_address: string;
  assigned_to?: number | null;
  items: OrderItem[];
  user?: { id: number; name: string; email: string };
  created_at: string;
}

export const orderService = {
  // ─── Customer ───────────────────────────────────────────────────────────────

  async checkout(deliveryAddress: string) {
    const { data } = await api.post('/customer/orders/checkout', {
      delivery_address: deliveryAddress,
    });
    return data.data as Order;
  },

  async myOrders() {
    const { data } = await api.get('/customer/orders');
    return data.data as Order[];
  },

  async myOrder(id: number) {
    const { data } = await api.get(`/customer/orders/${id}`);
    return data.data as Order;
  },

  // ─── Staff / Delivery (equal-tier — both can manage any order) ─────────────

  async staffList(status?: OrderStatus) {
    const { data } = await api.get('/staff/orders', { params: status ? { status } : {} });
    return data.data as Order[];
  },

  async updateStatus(orderId: number, status: OrderStatus) {
    const { data } = await api.patch(`/staff/orders/${orderId}/status`, { status });
    return data.data as Order;
  },

  async assignToSelf(orderId: number) {
    const { data } = await api.patch(`/staff/orders/${orderId}/assign`);
    return data.data as Order;
  },
};

export default orderService;
