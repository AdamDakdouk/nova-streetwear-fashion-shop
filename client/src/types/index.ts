export interface VariantOption {
  value: string;
  stock: number;
  images?: string[];
}

export interface VariantAxis {
  name: string;
  options: VariantOption[];
}

/** Lightweight variant shape used in listing summaries — no per-option images. */
export interface VariantAxisSummary {
  name: string;
  options: { value: string; stock: number }[];
}

export interface ProductSummary {
  _id: string;
  slug: string;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
  variants: VariantAxisSummary[];
}

export interface Product {
  _id: string;
  slug: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  thumbnail: string;
  variants: VariantAxis[];
  baseStock: number;
  category: string;
  totalStock: number;
}

/** Admin CRUD endpoints return the raw product document — no computed `totalStock`. */
export type AdminProduct = Omit<Product, "totalStock">;

export type VariantSelection = Record<string, string>;

export interface CartLine {
  itemId: string;
  product: {
    _id: string;
    slug: string;
    title: string;
    thumbnail: string;
  };
  variantSelection: VariantSelection;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  availableStock: number;
}

export interface CartView {
  items: CartLine[];
  total: number;
}

export interface OrderItem {
  product: string;
  title: string;
  variantSelection: VariantSelection;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  total: number;
  placedAt: string;
}

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
