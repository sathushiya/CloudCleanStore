export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  stock: number;
  shopStock?: number;
  onlineStock?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  brandId?: number;
  category: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  variants: ProductVariant[];
  badge?: string;
}

export const categories = [
  { id: 'bathroom', name: 'Bathroom Cleaners', count: 45 },
  { id: 'floor', name: 'Floor Cleaners', count: 38 },
  { id: 'kitchen', name: 'Kitchen Chemicals', count: 52 },
  { id: 'glass', name: 'Glass Cleaners', count: 28 },
  { id: 'laundry', name: 'Laundry Products', count: 64 },
  { id: 'industrial', name: 'Industrial Chemicals', count: 72 }
];

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Multi-Surface Spray Cleaner',
    brand: 'CleanPro',
    category: 'kitchen',
    description: 'Powerful all-purpose cleaner for kitchen and household surfaces. Removes grease, grime, and stains effortlessly.',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.8,
    reviews: 234,
    badge: 'Best Seller',
    variants: [
      { id: 'var-001-1', size: '500ml', price: 12.99, stock: 50 },
      { id: 'var-001-2', size: '1L', price: 21.99, stock: 35 },
      { id: 'var-001-3', size: '5L', price: 89.99, stock: 15 }
    ]
  },
  {
    id: 'prod-002',
    name: 'Eco-Friendly Glass Cleaner',
    brand: 'GreenClean',
    category: 'glass',
    description: 'Streak-free glass cleaner made from natural ingredients. Safe for the environment and your family.',
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.6,
    reviews: 189,
    badge: 'Eco-Friendly',
    variants: [
      { id: 'var-002-1', size: '750ml', price: 9.99, stock: 80 },
      { id: 'var-002-2', size: '2L', price: 24.99, stock: 45 }
    ]
  },
  {
    id: 'prod-003',
    name: 'Premium Floor Polish',
    brand: 'ShineMax',
    category: 'floor',
    description: 'Professional-grade floor polish for hardwood, tile, and laminate. Leaves a brilliant shine that lasts.',
    image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.9,
    reviews: 456,
    badge: 'Premium',
    variants: [
      { id: 'var-003-1', size: '1L', price: 18.99, stock: 60 },
      { id: 'var-003-2', size: '3L', price: 49.99, stock: 30 },
      { id: 'var-003-3', size: '5L', price: 79.99, stock: 20 }
    ]
  },
  {
    id: 'prod-004',
    name: 'Industrial Degreaser',
    brand: 'PowerClean',
    category: 'industrial',
    description: 'Heavy-duty degreaser for industrial and commercial use. Cuts through the toughest grease and oil.',
    image: 'https://images.unsplash.com/photo-1626379481874-3dc5678fa8ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.7,
    reviews: 312,
    variants: [
      { id: 'var-004-1', size: '2L', price: 24.99, stock: 40 },
      { id: 'var-004-2', size: '5L', price: 54.99, stock: 25 },
      { id: 'var-004-3', size: '10L', price: 99.99, stock: 15 }
    ]
  },
  {
    id: 'prod-005',
    name: 'Disinfectant Spray',
    brand: 'SafeGuard',
    category: 'bathroom',
    description: 'Hospital-grade disinfectant spray that kills 99.9% of germs and bacteria. Perfect for bathrooms and high-touch areas.',
    image: 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.8,
    reviews: 567,
    badge: 'New',
    variants: [
      { id: 'var-005-1', size: '500ml', price: 14.99, stock: 70 },
      { id: 'var-005-2', size: '1L', price: 26.99, stock: 50 },
      { id: 'var-005-3', size: '4L', price: 89.99, stock: 20 }
    ]
  },
  {
    id: 'prod-006',
    name: 'Bathroom Tile Cleaner',
    brand: 'TileShine',
    category: 'bathroom',
    description: 'Powerful tile and grout cleaner removes soap scum, mildew, and hard water stains.',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.5,
    reviews: 198,
    variants: [
      { id: 'var-006-1', size: '750ml', price: 11.99, stock: 55 },
      { id: 'var-006-2', size: '2L', price: 29.99, stock: 30 }
    ]
  },
  {
    id: 'prod-007',
    name: 'Laundry Detergent Pro',
    brand: 'FreshWash',
    category: 'laundry',
    description: 'Ultra-concentrated laundry detergent for deep cleaning. Works in hot or cold water.',
    image: 'https://images.unsplash.com/photo-1648735257013-2fb9604b15c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.9,
    reviews: 892,
    badge: 'Top Rated',
    variants: [
      { id: 'var-007-1', size: '1L', price: 19.99, stock: 90 },
      { id: 'var-007-2', size: '3L', price: 49.99, stock: 60 },
      { id: 'var-007-3', size: '5L', price: 74.99, stock: 40 }
    ]
  },
  {
    id: 'prod-008',
    name: 'Kitchen Deodorizer',
    brand: 'FreshAir',
    category: 'kitchen',
    description: 'Natural kitchen deodorizer eliminates cooking odors and freshens the air.',
    image: 'https://images.unsplash.com/photo-1632243575963-3143700087ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.4,
    reviews: 156,
    variants: [
      { id: 'var-008-1', size: '250ml', price: 8.99, stock: 100 },
      { id: 'var-008-2', size: '500ml', price: 15.99, stock: 75 }
    ]
  },
  {
    id: 'prod-009',
    name: 'Wood Floor Cleaner',
    brand: 'ShineMax',
    category: 'floor',
    description: 'Gentle yet effective cleaner specially formulated for hardwood and engineered wood floors.',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.7,
    reviews: 289,
    variants: [
      { id: 'var-009-1', size: '1L', price: 16.99, stock: 65 },
      { id: 'var-009-2', size: '4L', price: 59.99, stock: 35 }
    ]
  },
  {
    id: 'prod-010',
    name: 'Heavy Duty Fabric Softener',
    brand: 'FreshWash',
    category: 'laundry',
    description: 'Ultra-concentrated fabric softener leaves clothes soft and fresh-smelling.',
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.6,
    reviews: 445,
    variants: [
      { id: 'var-010-1', size: '1.5L', price: 12.99, stock: 80 },
      { id: 'var-010-2', size: '3L', price: 22.99, stock: 55 },
      { id: 'var-010-3', size: '5L', price: 35.99, stock: 30 }
    ]
  },
  {
    id: 'prod-011',
    name: 'Stainless Steel Cleaner',
    brand: 'CleanPro',
    category: 'kitchen',
    description: 'Streak-free stainless steel cleaner and polish for appliances and fixtures.',
    image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.5,
    reviews: 178,
    variants: [
      { id: 'var-011-1', size: '500ml', price: 13.99, stock: 45 },
      { id: 'var-011-2', size: '1L', price: 24.99, stock: 30 }
    ]
  },
  {
    id: 'prod-012',
    name: 'Concrete Floor Cleaner',
    brand: 'PowerClean',
    category: 'industrial',
    description: 'Industrial-strength cleaner for concrete floors, garages, and warehouses.',
    image: 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.8,
    reviews: 267,
    variants: [
      { id: 'var-012-1', size: '5L', price: 44.99, stock: 30 },
      { id: 'var-012-2', size: '10L', price: 79.99, stock: 20 },
      { id: 'var-012-3', size: '20L', price: 139.99, stock: 10 }
    ]
  },
  {
    id: 'prod-013',
    name: 'Carpet Stain Remover',
    brand: 'CleanPro',
    category: 'floor',
    description: 'Powerful carpet stain remover for tough stains and odors.',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.3,
    reviews: 156,
    variants: [
      { id: 'var-013-1', size: '500ml', price: 14.99, stock: 0 },
      { id: 'var-013-2', size: '1L', price: 26.99, stock: 0 },
      { id: 'var-013-3', size: '5L', price: 99.99, stock: 0 }
    ]
  },
  {
    id: 'prod-014',
    name: 'Oven Cleaner Spray',
    brand: 'PowerClean',
    category: 'kitchen',
    description: 'Heavy-duty oven cleaner removes baked-on grease and grime.',
    image: 'https://images.unsplash.com/photo-1626379481874-3dc5678fa8ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.7,
    reviews: 203,
    variants: [
      { id: 'var-014-1', size: '500ml', price: 18.99, stock: 0 }
    ]
  },
  {
    id: 'prod-015',
    name: 'Mold & Mildew Remover',
    brand: 'SafeGuard',
    category: 'bathroom',
    description: 'Eliminates mold and mildew stains from bathrooms and wet areas.',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.6,
    reviews: 187,
    badge: 'Out of Stock',
    variants: [
      { id: 'var-015-1', size: '750ml', price: 15.99, stock: 0 },
      { id: 'var-015-2', size: '2L', price: 39.99, stock: 5 }
    ]
  },
  {
    id: 'prod-016',
    name: 'Drain Cleaner Gel',
    brand: 'PowerClean',
    category: 'bathroom',
    description: 'Professional drain cleaner dissolves clogs quickly and safely.',
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    rating: 4.8,
    reviews: 234,
    variants: [
      { id: 'var-016-1', size: '1L', price: 22.99, stock: 3 }
    ]
  }
];
