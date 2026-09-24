/** Shapes returned by the TableNest API (see backend/docs/API.md). */

export type Role = 'customer' | 'owner' | 'admin';
export type Id = string;

export interface Paged<T> {
  total: number;
  page: number;
  pages: number;
  items: T[];
}

export interface Address {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export interface SavedCard {
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export interface User {
  _id: Id;
  fullName: string;
  email: string;
  role: Role;
  phone: string | null;
  avatar: string | null;
  address: string | null;
  isActive: boolean;
  restaurantId: Id | null;
  notificationPrefs?: { bookingConfirmation: boolean; marketing: boolean; orderTracking: boolean };
  favoriteRestaurantIds?: Id[];
  addresses?: Address[];
  paymentMethods?: SavedCard[];
  createdAt?: string;
}

export type DayHours = { open: string; close: string; closed: boolean };
export type WeeklyHours = Partial<Record<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday', DayHours>>;
export type RestaurantStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface Restaurant {
  _id: Id;
  name: string;
  ownerId: Id | { _id: Id; fullName: string; email: string; isActive: boolean };
  description: string | null;
  cuisineType: string;
  logo: string | null;
  images: string[];
  address: string;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  seatingCapacity: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  status: RestaurantStatus;
  rating: number;
  totalReviews: number;
  openingHours: WeeklyHours;
  timezone: string | null;
  dineIn: boolean;
  delivery: boolean;
  pickup: boolean;
  acceptingOrders: boolean;
  deliveryFee: number;
  minOrder: number;
  taxRate: number;
  prepTime: number;
  openNow?: boolean;
  sponsored?: boolean;
  plan?: 'starter' | 'pro';
  commissionRate?: number | null;
  sponsoredUntil?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
}

export interface MenuItem {
  _id: Id;
  restaurantId: Id;
  categoryId: Id;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  isSoldOut: boolean;
  tags: string[];
  preparationTime: number;
}

export interface MenuCategory {
  _id: Id;
  restaurantId: Id;
  name: string;
  sortOrder: number;
  items?: MenuItem[];
}

export interface Dish extends MenuItem {
  restaurant: { _id: Id; name: string; city: string | null; cuisineType: string; rating: number };
  sold?: number;
}

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type OrderType = 'delivery' | 'pickup' | 'dine_in';

export interface OrderLine {
  menuItemId: Id;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  notes: string | null;
}

export interface Order {
  _id: Id;
  orderNumber: string;
  customerId: Id;
  customerName: string | null;
  customerPhone: string | null;
  restaurantId: Id;
  restaurantName: string | null;
  restaurantImage: string | null;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  promoCode: string | null;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  tip: number;
  total: number;
  currency: string | null;
  orderType: OrderType;
  paymentMethod: 'cash' | 'card';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: OrderStatus;
  deliveryAddress: string | null;
  estimatedDelivery: string | null;
  notes: string | null;
  tableNumber: string | null;
  reviewed: boolean;
  statusHistory: Array<{ status: OrderStatus; time: string; note: string; by?: string }>;
  createdAt: string;
}

export interface Quote {
  subtotal: number;
  discount: number;
  promoCode: string | null;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  tip: number;
  total: number;
  currency: string;
  taxRate: number;
  minOrder: number;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no_show';

export interface Reservation {
  _id: Id;
  customerId: Id;
  restaurantId: Id;
  tableNumber: string | null;
  restaurantName: string | null;
  restaurantImage: string | null;
  customerName: string | null;
  customerPhone: string | null;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  specialRequests: string | null;
  cancelReason: string | null;
  bookingRef: string | null;
  statusHistory?: Array<{ status: ReservationStatus; time: string; by: string }>;
  createdAt: string;
}

export interface Availability {
  date: string;
  closed: boolean;
  guests: number;
  slots: Array<{ time: string; available: boolean }>;
}

export interface Review {
  _id: Id;
  customerName: string | null;
  rating: number;
  comment: string | null;
  ownerReply: string | null;
  ownerRepliedAt: string | null;
  orderId: Id | null;
  reservationId: Id | null;
  createdAt: string;
}

export interface FeaturedReview {
  _id: Id;
  rating: number;
  comment: string;
  customerName: string | null;
  createdAt: string;
  restaurant: { _id: Id; name: string; images: string[]; city: string | null };
}

export interface Promotion {
  _id: Id;
  restaurantId: Id;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrder: number;
  usageLimit?: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  applicableCategories: string[];
  isActive: boolean;
  code: string | null;
  restaurant?: { _id: Id; name: string; images: string[]; city: string | null; cuisineType: string };
}

export interface AppNotification {
  _id: Id;
  title: string;
  message: string;
  type: 'order' | 'booking' | 'promotion' | 'system' | 'review' | 'payment';
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  discountType: 'free_delivery' | 'flat' | 'percentage';
  discountValue: number;
  validDays: number;
}

export interface Voucher {
  code: string;
  title: string;
  discountType: string;
  discountValue: number;
  expiresAt: string;
  used: boolean;
}

export interface Loyalty {
  points: number;
  lifetimePoints: number;
  transactions: Array<{ kind: 'earn' | 'redeem'; points: number; description: string; date: string }>;
  vouchers: Voucher[];
  tier: string;
  nextTier: { name: string; pointsNeeded: number } | null;
  tierProgress: number;
  rewards: Reward[];
}

export interface ReferralProfile {
  code: string;
  referrals: Array<{ email: string; name: string; status: string; reward: number; invitedAt: string }>;
  totalEarned: number;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'blocked';
export interface DiningTable {
  _id: Id;
  restaurantId: Id;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  seatedAt: string | null;
  serverNotes: string | null;
}

export interface StaffMember {
  _id: Id;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
}

export interface InventoryItem {
  _id: Id;
  name: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  supplier: string | null;
  cost: number | null;
  lastRestocked: string | null;
}

export interface OwnerDashboard {
  restaurantName: string;
  todayReservations: number;
  pendingReservations: number;
  pendingOrders: number;
  monthRevenue: number;
  todayRevenue: number;
  todayOrders: number;
  rating: number;
  totalReviews: number;
  activeTables: number;
  totalTables: number;
  revenueChart: Array<{ date: string; label: string; revenue: number; orders: number }>;
  topItems: Array<{ name: string; sold: number; revenue: number; image: string | null }>;
  recentOrders: Order[];
  upcomingReservations: Reservation[];
}

export interface OwnerOverview {
  days: number;
  revenue: number;
  orders: number;
  averageOrder: number;
  customers: number;
  repeatRate: number;
  daily: Array<{ date: string; label: string; revenue: number; orders: number }>;
  bookingsDaily: Array<{ date: string; label: string; bookings: number; guests: number }>;
  orderTypes: Array<{ type: OrderType; orders: number; revenue: number }>;
  topItems: Array<{ name: string; sold: number; revenue: number }>;
  reservationStatus: Array<{ status: ReservationStatus; count: number }>;
}

export interface Charge {
  _id: Id;
  restaurantId: Id;
  type: 'commission' | 'service_fee' | 'booking_fee' | 'subscription' | 'sponsorship';
  amount: number;
  currency: string;
  period: string;
  description: string;
  status: 'unpaid' | 'paid' | 'void';
  paidAt: string | null;
  createdAt: string;
}

export interface Statement {
  restaurantId: Id;
  restaurantName: string;
  period: string;
  currency: string;
  plan: 'starter' | 'pro';
  commissionRate: number;
  sponsoredUntil: string | null;
  charges: Charge[];
  totals: { byType: Record<string, number>; unpaid: number; paid: number; total: number };
  outstandingAllPeriods: number;
}

export interface PublicSettings {
  currency: string;
  serviceFeeRate: number;
  serviceFeeCap: number;
  plans: Record<'starter' | 'pro', { monthlyFee: number; commissionRate: number }>;
}

export interface PlatformSettings extends PublicSettings {
  requireRestaurantApproval: boolean;
  bookingFeePerCover: number;
  sponsoredWeeklyFee: number;
  loyaltyPointsPerUnit: number;
}

export interface SupportTicket {
  _id: Id;
  userId: Id;
  subject: string;
  description: string;
  type: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  responses: Array<{ authorId: Id; message: string; createdAt: string }>;
  createdAt: string;
}

export interface AuditEntry {
  _id: Id;
  actorId: Id | null;
  actorRole: string | null;
  action: string;
  targetType: string | null;
  targetId: Id | null;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface AdminStats {
  users: Record<string, number>;
  restaurants: Record<string, number>;
  orders: Record<string, number>;
  ordersLast24h: number;
  reservationsLast24h: number;
  grossMerchandiseValue: number;
  platformRevenueThisMonth: { period: string; currency: string; total: number; collected: number; outstanding: number };
}

export interface Revenue {
  from: string;
  to: string;
  currency: string;
  total: number;
  collected: number;
  outstanding: number;
  byType: Array<{ type: string; amount: number; count: number }>;
  byPeriod: Array<{ period: string; amount: number }>;
  topRestaurants: Array<{ restaurantId: Id; name: string; amount: number }>;
}

export interface UploadResult {
  id: Id;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface ConciergeSuggestion {
  _id: Id;
  name: string;
  cuisineType: string;
  city: string | null;
  rating: number;
  priceRange: string;
  image: string | null;
  openNow: boolean;
}
