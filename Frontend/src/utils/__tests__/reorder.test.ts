import { describe, it, expect } from 'vitest';
import { buildReorderItems } from '../reorder';
import type { Order, OrderItem } from '../../services/orderService';
import type { Product as ApiProduct } from '../../services/productService';

function makeApiProduct(overrides: Partial<ApiProduct> = {}): ApiProduct {
  return {
    id: 1,
    brand_id: 1,
    name: 'Multi-Surface Cleaner',
    slug: 'multi-surface-cleaner',
    category: 'kitchen',
    rating: 4.5,
    reviews: 10,
    is_active: true,
    variants: [
      { id: 100, product_id: 1, size: '500ml', price: 250, shop_stock: 10, online_stock: 20 },
    ],
    ...overrides,
  };
}

function makeOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 1,
    product_variant_id: 100,
    product_name: 'Multi-Surface Cleaner',
    variant_size: '500ml',
    price: 250,
    quantity: 2,
    ...overrides,
  };
}

function makeOrder(items: OrderItem[]): Order {
  return {
    id: 1,
    order_number: 'ORD-TEST',
    total: 500,
    status: 'delivered',
    delivery_address: '123 Test St',
    items,
    created_at: '2026-01-01T00:00:00.000000Z',
  };
}

describe('buildReorderItems', () => {
  it('matches a single order item to its current product and variant', () => {
    const catalog = [makeApiProduct()];
    const order = makeOrder([makeOrderItem()]);

    const result = buildReorderItems(order, catalog);

    expect(result.unavailableItemNames).toEqual([]);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].product.name).toBe('Multi-Surface Cleaner');
    expect(result.items[0].variant.id).toBe('100');
    expect(result.items[0].quantity).toBe(2);
  });

  it('matches multiple items across multiple products', () => {
    const catalog = [
      makeApiProduct({ id: 1, name: 'Product A', variants: [{ id: 100, product_id: 1, size: '500ml', price: 250, shop_stock: 5, online_stock: 5 }] }),
      makeApiProduct({ id: 2, name: 'Product B', variants: [{ id: 200, product_id: 2, size: '1L', price: 400, shop_stock: 5, online_stock: 5 }] }),
    ];
    const order = makeOrder([
      makeOrderItem({ id: 1, product_variant_id: 100, product_name: 'Product A' }),
      makeOrderItem({ id: 2, product_variant_id: 200, product_name: 'Product B', quantity: 3 }),
    ]);

    const result = buildReorderItems(order, catalog);

    expect(result.unavailableItemNames).toEqual([]);
    expect(result.items).toHaveLength(2);
    expect(result.items.map((i) => i.product.name)).toEqual(['Product A', 'Product B']);
    expect(result.items[1].quantity).toBe(3);
  });

  it('reports an item as unavailable when its product no longer exists', () => {
    const catalog: ApiProduct[] = [];
    const order = makeOrder([makeOrderItem({ product_name: 'Discontinued Cleaner' })]);

    const result = buildReorderItems(order, catalog);

    expect(result.items).toEqual([]);
    expect(result.unavailableItemNames).toEqual(['Discontinued Cleaner']);
  });

  it('reports an item as unavailable when its specific variant no longer exists on the product', () => {
    // Product still exists, but the ordered variant (id 100) was removed --
    // only a different variant (id 999) remains.
    const catalog = [makeApiProduct({ variants: [{ id: 999, product_id: 1, size: '1L', price: 400, shop_stock: 5, online_stock: 5 }] })];
    const order = makeOrder([makeOrderItem({ product_variant_id: 100 })]);

    const result = buildReorderItems(order, catalog);

    expect(result.items).toEqual([]);
    expect(result.unavailableItemNames).toEqual(['Multi-Surface Cleaner']);
  });

  it('returns empty results for an order with no items', () => {
    const result = buildReorderItems(makeOrder([]), [makeApiProduct()]);
    expect(result).toEqual({ items: [], unavailableItemNames: [] });
  });

  it('handles a mix of available and unavailable items in the same order', () => {
    const catalog = [makeApiProduct()];
    const order = makeOrder([
      makeOrderItem({ id: 1, product_variant_id: 100, product_name: 'Multi-Surface Cleaner' }),
      makeOrderItem({ id: 2, product_variant_id: 999, product_name: 'Gone Product' }),
    ]);

    const result = buildReorderItems(order, catalog);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].product.name).toBe('Multi-Surface Cleaner');
    expect(result.unavailableItemNames).toEqual(['Gone Product']);
  });
});
