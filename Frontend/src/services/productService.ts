import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  is_active: boolean;
  products_count?: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size: string;
  price: number;
  shop_stock: number;
  online_stock: number;
}

export interface Product {
  id: number;
  brand_id: number;
  brand?: Brand;
  name: string;
  slug: string;
  category: 'bathroom' | 'floor' | 'kitchen' | 'glass' | 'laundry' | 'industrial';
  description?: string;
  image?: string;
  badge?: string;
  rating: number;
  reviews: number;
  is_active: boolean;
  variants: ProductVariant[];
}

export interface ProductVariantInput {
  size: string;
  price: number;
  shop_stock?: number;
  online_stock?: number;
}

export interface ProductInput {
  brand_id: number;
  name: string;
  category: Product['category'];
  description?: string;
  image?: string;
  badge?: string;
  is_active?: boolean;
  variants: ProductVariantInput[];
}

export interface ProductFilters {
  category?: string;
  brand_id?: number;
  search?: string;
}

// ─── Public catalog (Shop page) ─────────────────────────────────────────────

export const productService = {
  async list(filters: ProductFilters = {}) {
    const { data } = await api.get('/products', { params: filters });
    return data.data; // Laravel paginator: { data: Product[], current_page, last_page, ... }
  },

  async get(id: number) {
    const { data } = await api.get(`/products/${id}`);
    return data.data as Product;
  },

  async listBrands() {
    const { data } = await api.get('/brands');
    return data.data as Brand[];
  },

  // ─── Admin CRUD (ProductsManagement.tsx / InventoryView.tsx) ───────────────

  async adminList() {
    const { data } = await api.get('/admin/products');
    return data.data as Product[];
  },

  async create(payload: ProductInput) {
    const { data } = await api.post('/admin/products', payload);
    return data.data as Product;
  },

  async update(id: number, payload: ProductInput) {
    const { data } = await api.put(`/admin/products/${id}`, payload);
    return data.data as Product;
  },

  async remove(id: number) {
    await api.delete(`/admin/products/${id}`);
  },

  async updateVariantStock(variantId: number, stock: { shop_stock?: number; online_stock?: number }) {
    const { data } = await api.patch(`/admin/products/variants/${variantId}/stock`, stock);
    return data.data as ProductVariant;
  },

  async adminListBrands() {
    const { data } = await api.get('/admin/brands');
    return data.data as Brand[];
  },

  async createBrand(payload: { name: string; description?: string; logo?: string }) {
    const { data } = await api.post('/admin/brands', payload);
    return data.data as Brand;
  },

  async updateBrand(id: number, payload: { name: string; description?: string; logo?: string; is_active?: boolean }) {
    const { data } = await api.put(`/admin/brands/${id}`, payload);
    return data.data as Brand;
  },

  async removeBrand(id: number) {
    await api.delete(`/admin/brands/${id}`);
  },
};

export default productService;

// ─── Adapter ──────────────────────────────────────────────────────────────────
// Shop.tsx, ProductModal.tsx, and SearchBar.tsx were built against the mock
// `Product` shape in data/products.ts (string ids, flat `brand` name, `stock`
// per variant). Rather than rewrite those components, map the real API
// response into that same shape so they keep working unchanged.
import type { Product as FrontendProduct, ProductVariant as FrontendVariant } from '../data/products';

export function toFrontendProduct(product: Product): FrontendProduct {
  return {
    id: String(product.id),
    name: product.name,
    brand: product.brand?.name ?? '',
    category: product.category,
    description: product.description ?? '',
    image: product.image ?? '',
    rating: product.rating,
    reviews: product.reviews,
    badge: product.badge,
    variants: product.variants.map((v): FrontendVariant => ({
      id: String(v.id),
      size: v.size,
      price: v.price,
      stock: v.shop_stock + v.online_stock,
      shopStock: v.shop_stock,
      onlineStock: v.online_stock,
    })),
  };
}
