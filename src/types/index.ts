export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'MOBILE_MONEY' | 'STRIPE_CARD' | 'CASH_ON_DELIVERY';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { products: number };
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  rating: number;
  categoryId: string;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
  category?: string;
}

export interface Cart {
  cartId?: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  currency: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: string;
  quantity: number;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  currency: string;
  transactionId: string | null;
  providerRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment: Payment | null;
  user?: { id: string; name: string; email: string };
}

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface DashboardData {
  totals: {
    orders: number;
    customers: number;
    activeProducts: number;
    revenue: number;
    currency: string;
    averageOrderValue: number;
  };
  ordersByStatus: { status: OrderStatus; count: number }[];
  paymentsByMethod: { method: PaymentMethod; count: number }[];
  lowStockProducts: { id: string; name: string; stock: number }[];
}

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  price: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  items: T[];
  pagination: Pagination;
}

export interface RecommendationResponse {
  success: boolean;
  strategy: string;
  data: Product[];
}
