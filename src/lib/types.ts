export type Motif = "buti" | "paisley" | "jaal" | "stripe" | "plain";

export interface SareeArt {
  base: string;
  accent: string;
  border: string;
  motif: Motif;
  backdrop: string;
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  priceHint: string;
  featured: boolean;
  art: SareeArt;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  colour: string;
  price: number;
  mrp: number;
  stock: number;
  fabric: string;
  zari: string;
  weave: string;
  occasions: string[];
  weightGrams: number;
  description: string;
  care: string;
  hasBlousePiece: boolean;
  badge: "Bestseller" | "New" | null;
  featured: boolean;
  images: string[];
  art: SareeArt;
  createdAt: string;
}

export type Role = "admin" | "customer";

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  role: Role;
}

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  address: Address;
  items: OrderItem[];
  createdAt: string;
  customerEmail?: string;
}
