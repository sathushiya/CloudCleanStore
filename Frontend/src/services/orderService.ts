import api from './api';

export type OrderStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  product_variant_id: number;
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
  assigned_staff?: { id: number; name: string } | null;
  payment_method?: 'cash' | 'bank_transfer';
  payment_status?: 'pending' | 'submitted' | 'confirmed' | 'rejected';
  payment_reference?: string | null;
  items: OrderItem[];
  user?: { id: number; name: string; email: string };
  review?: { id: number; rating: number; comment: string } | null;
  created_at: string;
  updated_at?: string;
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

  // availableOnly excludes bank transfer orders whose payment hasn't been
  // confirmed yet -- use it for "orders staff can actually pick up"
  // (Available Orders / the new-order popup), not for general order
  // browsing where every pending order should still be visible.
  async staffList(status?: OrderStatus, paymentStatus?: string, availableOnly?: boolean) {
    const { data } = await api.get('/staff/orders', {
    params: {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { payment_status: paymentStatus } : {}),
      ...(availableOnly ? { available_only: 1 } : {}),
    },
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
