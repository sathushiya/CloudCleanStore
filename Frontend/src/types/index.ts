export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "staff" | "staffsupervisor" | "customer";
  phone_number?: string;
  email_verified: boolean;
  avatar: string;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  description?: string;
  tags?: string[];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem extends Product {
  quantity: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  address?: Address;
}

// ─── Address ──────────────────────────────────────────────────────────────────
export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type PageType =
  | "home"
  | "login"
  | "signup"
  | "forgotPassword"
  | "admin"
  | "staffsupervisor"
  | "staff"
  | "shop"
  | "checkout"
  | "orders"
  | "addresses"
  | "settings"
  | "wishlist"
  | "activity";
