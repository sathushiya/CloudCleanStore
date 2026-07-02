import { Product, ProductVariant } from './products';

export interface OrderHistoryItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface OrderHistory {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderHistoryItem[];
  total: number;
  status: 'delivered' | 'cancelled' | 'processing';
  deliveryAddress: string;
}

// Mock order history for demonstration
export const orderHistory: OrderHistory[] = [
  {
    id: 'order-001',
    orderNumber: 'ORD-2024-001',
    date: '2024-05-15',
    items: [
      {
        product: {
          id: 'prod-001',
          name: 'Multi-Surface Spray Cleaner',
          brand: 'CleanPro',
          category: 'kitchen',
          description: 'Powerful all-purpose cleaner for kitchen and household surfaces.',
          image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
          rating: 4.8,
          reviews: 234,
          badge: 'Best Seller',
          variants: [
            { id: 'var-001-1', size: '500ml', price: 12.99, stock: 50 },
            { id: 'var-001-2', size: '1L', price: 21.99, stock: 35 }
          ]
        },
        variant: { id: 'var-001-1', size: '500ml', price: 12.99, stock: 50 },
        quantity: 2
      },
      {
        product: {
          id: 'prod-002',
          name: 'Eco-Friendly Glass Cleaner',
          brand: 'GreenClean',
          category: 'glass',
          description: 'Streak-free glass cleaner made from natural ingredients.',
          image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
          rating: 4.6,
          reviews: 189,
          badge: 'Eco-Friendly',
          variants: [
            { id: 'var-002-1', size: '750ml', price: 9.99, stock: 80 }
          ]
        },
        variant: { id: 'var-002-1', size: '750ml', price: 9.99, stock: 80 },
        quantity: 1
      }
    ],
    total: 35.97,
    status: 'delivered',
    deliveryAddress: '123 Main St, Colombo 03'
  },
  {
    id: 'order-002',
    orderNumber: 'ORD-2024-002',
    date: '2024-05-20',
    items: [
      {
        product: {
          id: 'prod-007',
          name: 'Laundry Detergent Pro',
          brand: 'FreshWash',
          category: 'laundry',
          description: 'Ultra-concentrated laundry detergent for deep cleaning.',
          image: 'https://images.unsplash.com/photo-1648735257013-2fb9604b15c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
          rating: 4.9,
          reviews: 892,
          badge: 'Top Rated',
          variants: [
            { id: 'var-007-1', size: '1L', price: 19.99, stock: 90 },
            { id: 'var-007-2', size: '3L', price: 49.99, stock: 60 }
          ]
        },
        variant: { id: 'var-007-2', size: '3L', price: 49.99, stock: 60 },
        quantity: 1
      }
    ],
    total: 49.99,
    status: 'delivered',
    deliveryAddress: '123 Main St, Colombo 03'
  },
  {
    id: 'order-003',
    orderNumber: 'ORD-2024-003',
    date: '2024-05-25',
    items: [
      {
        product: {
          id: 'prod-005',
          name: 'Disinfectant Spray',
          brand: 'SafeGuard',
          category: 'bathroom',
          description: 'Hospital-grade disinfectant spray that kills 99.9% of germs.',
          image: 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
          rating: 4.8,
          reviews: 567,
          badge: 'New',
          variants: [
            { id: 'var-005-1', size: '500ml', price: 14.99, stock: 70 },
            { id: 'var-005-2', size: '1L', price: 26.99, stock: 50 }
          ]
        },
        variant: { id: 'var-005-2', size: '1L', price: 26.99, stock: 50 },
        quantity: 3
      },
      {
        product: {
          id: 'prod-003',
          name: 'Premium Floor Polish',
          brand: 'ShineMax',
          category: 'floor',
          description: 'Professional-grade floor polish for hardwood, tile, and laminate.',
          image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
          rating: 4.9,
          reviews: 456,
          badge: 'Premium',
          variants: [
            { id: 'var-003-1', size: '1L', price: 18.99, stock: 60 }
          ]
        },
        variant: { id: 'var-003-1', size: '1L', price: 18.99, stock: 60 },
        quantity: 1
      }
    ],
    total: 99.96,
    status: 'delivered',
    deliveryAddress: 'Office - 456 Park Ave, Kandy'
  }
];
