export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  image?: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  image?: string;
  description?: string;
  is_active: boolean;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  compare_price?: number;
  sku: string;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  category_id: number;
  brand_id?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  category?: Category;
  brand?: Brand;
  discount_percentage?: number;
}

export interface CartItem {
  id: number;
  user_id?: number;
  session_id?: string;
  product_id: number;
  product_variant_id?: number;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  variant_name?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  total: number;
  payment_method: 'cod' | 'stripe';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: Address;
  items: OrderItem[];
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment: string;
  is_approved: boolean;
  user?: User;
  product?: { name: string; slug: string };
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
