import { describe, it, expect } from 'vitest';
import { groupOrdersForActivity } from '../orderActivity';
import type { Order } from '../../services/orderService';

function makeOrder(overrides: Partial<Order>): Order {
  return {
    id: 1,
    order_number: 'ORD-TEST',
    total: 100,
    status: 'pending',
    delivery_address: '123 Test St',
    items: [],
    created_at: '2026-01-01T00:00:00.000000Z',
    ...overrides,
  };
}

describe('groupOrdersForActivity', () => {
  it('puts pending orders in the pending group', () => {
    const order = makeOrder({ id: 1, status: 'pending' });
    const groups = groupOrdersForActivity([order]);
    expect(groups.pending).toEqual([order]);
    expect(groups.ongoing).toEqual([]);
    expect(groups.history).toEqual([]);
  });

  it('puts processing and out_for_delivery orders in the ongoing group', () => {
    const processing = makeOrder({ id: 1, status: 'processing' });
    const outForDelivery = makeOrder({ id: 2, status: 'out_for_delivery' });
    const groups = groupOrdersForActivity([processing, outForDelivery]);
    expect(groups.ongoing).toEqual([processing, outForDelivery]);
    expect(groups.pending).toEqual([]);
    expect(groups.history).toEqual([]);
  });

  it('puts delivered and cancelled orders in the history group', () => {
    const delivered = makeOrder({ id: 1, status: 'delivered' });
    const cancelled = makeOrder({ id: 2, status: 'cancelled' });
    const groups = groupOrdersForActivity([delivered, cancelled]);
    expect(groups.history).toEqual([delivered, cancelled]);
    expect(groups.ongoing).toEqual([]);
    expect(groups.pending).toEqual([]);
  });

  it('preserves the original order within each group', () => {
    const first = makeOrder({ id: 1, status: 'pending', order_number: 'ORD-1' });
    const second = makeOrder({ id: 2, status: 'pending', order_number: 'ORD-2' });
    const groups = groupOrdersForActivity([first, second]);
    expect(groups.pending.map((o) => o.order_number)).toEqual(['ORD-1', 'ORD-2']);
  });

  it('returns empty groups for an empty order list', () => {
    const groups = groupOrdersForActivity([]);
    expect(groups).toEqual({ ongoing: [], pending: [], history: [] });
  });

  it('sorts a mixed list of statuses into the correct groups', () => {
    const pending = makeOrder({ id: 1, status: 'pending' });
    const processing = makeOrder({ id: 2, status: 'processing' });
    const outForDelivery = makeOrder({ id: 3, status: 'out_for_delivery' });
    const delivered = makeOrder({ id: 4, status: 'delivered' });
    const cancelled = makeOrder({ id: 5, status: 'cancelled' });

    const groups = groupOrdersForActivity([pending, processing, outForDelivery, delivered, cancelled]);

    expect(groups.pending).toEqual([pending]);
    expect(groups.ongoing).toEqual([processing, outForDelivery]);
    expect(groups.history).toEqual([delivered, cancelled]);
  });
});
