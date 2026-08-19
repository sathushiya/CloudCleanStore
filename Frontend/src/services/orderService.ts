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
  payment_method?: 'cash' | 'bank_transfer';
  payment_status?: 'pending' | 'submitted' | 'confirmed' | 'rejected';
  payment_reference?: string | null;
  items: OrderItem[];
  user?: { id: number; name: string; email: string };
  created_at: string;
}

export const orderService = {
  // ─── Customer ───────────────────────────────────────────────────────────────

  async checkout(deliveryAddress: string, paymentMethod: 'cash' | 'bank_transfer' = 'cash') {
  const { data } = await api.post('/customer/orders/checkout', {
    delivery_address: deliveryAddress,
    payment_method: paymentMethod,
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

  async staffList(status?: OrderStatus, paymentStatus?: string) {
    const { data } = await api.get('/staff/orders', {
    params: { ...(status ? { status } : {}), ...(paymentStatus ? { payment_status: paymentStatus } : {}) },
  });
    return data.data as Order[];
},

  async updateStatus(orderId: number, status: OrderStatus) {
    const { data } = await api.patch(`/staff/orders/${orderId}/status`, { status });
    return data.data as Order;
  },

  async assignToSelf(orderId: number, staffId?: number) {
    const { data } = await api.patch(`/staff/orders/${orderId}/assign`, staffId ? { staff_id: staffId } : {});
    return data.data as Order;
},

  async submitPayment(orderId: number, paymentReference: string, proofUrl?: string) {
    const { data } = await api.post(`/customer/orders/${orderId}/submit-payment`, {
      payment_reference: paymentReference,
      payment_proof_url: proofUrl,
    });
    return data.data as Order;
  },

  async confirmPayment(orderId: number, approved: boolean) {
    const { data } = await api.patch(`/staff/orders/${orderId}/confirm-payment`, { approved });
    return data.data as Order;
  },
};

export default orderService;
