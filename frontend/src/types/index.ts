// User types
export interface User {
  id: number;
  phone: string;
  first_name: string;
  last_name: string;
  email?: string;
  type: 'user' | 'seller' | 'admin' | 'manager';
  image?: string;
  is_online: boolean;
}

export interface Tokens {
  access: string;
  refresh: string;
}

// Product types
export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  children?: Category[];
  deeplink?: string;
  attributes?: Attribute[];
}

export interface Attribute {
  id: number;
  name: string;
  values: AttributeValue[];
}

export interface AttributeValue {
  id: number;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  rating: number;
  comments_count: number;
  image?: string;
  images?: ProductImage[];
  category: Category;
  shop: Shop;
  description?: string;
  short_description?: string;
  guarantee?: number;
  is_active: boolean;
  variants?: ProductVariant[];
  videos?: ProductVideo[];
  new_features?: ProductFeature[];
  is_favorite?: boolean;
}

export interface ProductImage {
  id: number;
  image: string;
}

export interface ProductVideo {
  id: number;
  video: string;
}

export interface ProductVariant {
  id: number;
  feature: Record<string, string>;
  quantity: number;
  price: number;
  price_delta?: number;
  sku: string;
  color?: ColorProduct;
  variant_images?: ProductImage[];
  attribute?: Record<string, string>;
}

export interface ColorProduct {
  id: number;
  name: string;
  value: string;
}

export interface ProductFeature {
  id: number;
  feature: Feature;
}

export interface Feature {
  id: number;
  title: string;
  type: string;
}

// Shop types
export interface Shop {
  id: number;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  rating: number;
  description?: string;
  comment_count: number;
  order_count: number;
  created_at: string;
  is_online?: boolean;
  seller?: Seller;
}

export interface Seller {
  id: number;
  user: User;
}

// Comment types
export interface Comment {
  id: number;
  user_name: string;
  quality_assessment: number;
  advantages: string;
  disadvantages: string;
  comment: string;
  is_anonymous: boolean;
  created_at: string;
  images?: CommentImage[];
}

export interface CommentImage {
  id: number;
  image: string;
}

// Cart types
export interface Cart {
  id: number;
  cart_items: CartItem[];
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant; // Selected variant with attributes
}

// Order types
export interface Order {
  id: number;
  status: 'pending' | 'paid' | 'canceled';
  delivery_type: 'delivery_point' | 'delivery';
  delivery_point?: DeliveryPoint;
  payment_type?: PaymentType;
  customer_recipient?: CustomerRecipient;
  order_items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  product: ProductVariant;
  quantity: number;
  price: number;
  is_comment: boolean;
}

export interface DeliveryPoint {
  id: number;
  address: string;
  has_dressing_room: boolean;
  location: string;
  order_retention_period?: string;
  weekdays: Weekday[];
}

export interface Weekday {
  day: string;
  working_hours: string;
}

export interface PaymentType {
  id: number;
  title: string;
  active: boolean;
  state: 'active' | 'disabled';
  description?: string;
  block_description?: string;
}

export interface CustomerRecipient {
  id: number;
  name: string;
  surname: string;
  phone: string;
  is_default: boolean;
}

// City types
export interface City {
  id: number;
  name: string;
}

// Favorite types
export interface Favorite {
  id?: number;
  product?: number | Product;  // product ID or full product
  product_detail?: Product;  // full product data from new API
  quantity?: number;
  is_favorite?: boolean;
}

// Chat types


export interface Message {
  id: number;
  chat: number;
  sender?: User;
  text?: string;
  image?: string;
  created_at: string;
  is_read: boolean;
}

// Filter types
export interface ProductFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  ordering?: string;
}
