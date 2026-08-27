import type { Order } from '../services/orderService';
import { toFrontendProduct } from '../services/productService';
import type { Product as ApiProduct } from '../services/productService';
import type { Product, ProductVariant } from '../data/products';

export interface ReorderCartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface ReorderResult {
  items: ReorderCartItem[];
  /** Names of items that couldn't be matched to a still-existing product/variant. */
  unavailableItemNames: string[];
}

/**
 * Rebuilds cart-ready items from a past order, matched against the current
 * product catalog. A product or variant may no longer exist by the time a
 * customer reorders (deleted, or the variant itself removed) -- those items
 * are reported back as unavailable rather than silently dropped or crashing.
 */
export function buildReorderItems(order: Order, catalog: ApiProduct[]): ReorderResult {
  const items: ReorderCartItem[] = [];
  const unavailableItemNames: string[] = [];

  for (const orderItem of order.items) {
    const apiProduct = catalog.find((p) =>
      p.variants.some((v) => v.id === orderItem.product_variant_id)
    );

    if (!apiProduct) {
      unavailableItemNames.push(orderItem.product_name);
      continue;
    }

    const product = toFrontendProduct(apiProduct);
    const variant = product.variants.find((v) => v.id === String(orderItem.product_variant_id));

    if (!variant) {
      unavailableItemNames.push(orderItem.product_name);
      continue;
    }

    items.push({ product, variant, quantity: orderItem.quantity });
  }

  return { items, unavailableItemNames };
}
