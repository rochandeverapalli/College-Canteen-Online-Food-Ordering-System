export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  rollNumber?: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  active: boolean;
  createdAt?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  imageUrl: string;
  available: boolean;
  isVeg: boolean;
  preparationTime: number; // in minutes
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl: string;
  isVeg: boolean;
  preparationTime: number;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  isVeg?: boolean;
}

export interface Order {
  id: string;
  orderId: string;
  tokenNumber: string;
  userId: string;
  customerName: string;
  rollNumber?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentId: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  estimatedTime?: number;
}

export interface PaymentRecord {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  provider: string;
  transactionId: string;
  createdAt: string;
}

export interface CanteenSetting {
  id?: string;
  acceptingOrders: boolean;
  announcement?: string;
  maxOrdersLimit?: number;
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  orderId?: string;
  tokenNumber?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}
