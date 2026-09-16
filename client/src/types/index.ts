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
  avgRating: number;
  reviewCount: number;
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
  avgRating: number;
  reviewCount: number;
}

export type AdminProduct = Omit<Product, "totalStock" | "avgRating" | "reviewCount">;

export interface HeroContent {
  eyebrow: string;
  heading: string;
  subcopy: string;
  ctaLabel: string;
  images: string[];
}

export interface Review {
  _id: string;
  product: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

// Only stores card brand and last 4 digits. Raw card numbers never reach the server.
export interface PaymentSummary {
  brand: string;
  last4: string;
}

export interface CheckoutPayload {
  shippingAddress: ShippingAddress;
  payment: PaymentSummary;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  payment: PaymentSummary;
  placedAt: string;
}

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
