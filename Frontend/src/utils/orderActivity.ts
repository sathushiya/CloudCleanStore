import type { Order } from '../services/orderService';

export interface OrderActivityGroups {
  /** Currently being worked: picked up and either being prepared or on the way. */
  ongoing: Order[];
  /** Placed but not yet picked up by staff. */
  pending: Order[];
  /** Finished, one way or another -- delivered or cancelled. */
  history: Order[];
}

/**
 * Splits a customer's orders into the three sections My Activity shows.
 * Pulled out as a pure function (rather than inline in the page component)
 * so the grouping rules are unit-testable on their own.
 */
export function groupOrdersForActivity(orders: Order[]): OrderActivityGroups {
  const groups: OrderActivityGroups = { ongoing: [], pending: [], history: [] };

  for (const order of orders) {
    if (order.status === 'processing' || order.status === 'out_for_delivery') {
      groups.ongoing.push(order);
    } else if (order.status === 'pending') {
      groups.pending.push(order);
    } else {
      // 'delivered' and 'cancelled' -- both are "closed" orders, whether
      // that closure was a success or not.
      groups.history.push(order);
    }
  }

  return groups;
}
