import { http } from './http';
import type {
  Address,
  AdminStats,
  AppNotification,
  AuditEntry,
  Availability,
  Charge,
  ConciergeSuggestion,
  DiningTable,
  Dish,
  FeaturedReview,
  InventoryItem,
  Loyalty,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  OwnerDashboard,
  OwnerOverview,
  Paged,
  PlatformSettings,
  Promotion,
  PublicSettings,
  Quote,
  ReferralProfile,
  Reservation,
  ReservationStatus,
  Restaurant,
  Revenue,
  Review,
  Reward,
  SavedCard,
  StaffMember,
  Statement,
  SupportTicket,
  TableStatus,
  UploadResult,
  User,
  Voucher,
} from './types';

type Params = Record<string, string | number | boolean | undefined | null>;
const clean = (p?: Params) => (p ? Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== '')) : undefined);
const get = <T>(url: string, params?: Params) => http.get<T>(url, { params: clean(params) }).then((r) => r.data);
const post = <T>(url: string, body?: unknown, headers?: Record<string, string>) => http.post<T>(url, body, { headers }).then((r) => r.data);
const put = <T>(url: string, body?: unknown) => http.put<T>(url, body).then((r) => r.data);
const patch = <T>(url: string, body?: unknown) => http.patch<T>(url, body).then((r) => r.data);
const del = <T>(url: string) => http.delete<T>(url).then((r) => r.data);

export type AuthResponse = { user: User; accessToken: string };
export type RegisterBody = { fullName: string; email: string; password: string; phone?: string; referralCode?: string };

export const authApi = {
  register: (b: RegisterBody) => post<AuthResponse>('/auth/register', b),
  registerOwner: (b: RegisterBody) => post<AuthResponse>('/auth/register-owner', b),
  login: (email: string, password: string) => post<AuthResponse>('/auth/login', { email, password }),
  me: () => get<User>('/auth/me'),
  forgot: (email: string) => post<{ message: string; devResetUrl?: string }>('/auth/forgot-password', { email }),
  reset: (token: string, password: string) => post<{ message: string }>('/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    patch<{ message: string; accessToken: string }>('/auth/change-password', { currentPassword, newPassword }),
  logoutAll: () => post<{ message: string }>('/auth/logout-all'),
};

export type RestaurantQuery = {
  search?: string;
  cuisine?: string;
  city?: string;
  priceRange?: string;
  sort?: string;
  service?: 'delivery' | 'dine_in' | 'pickup';
  minRating?: number;
  page?: number;
  limit?: number;
};

export const restaurantApi = {
  list: (q: RestaurantQuery) => get<{ restaurants: Restaurant[]; total: number; page: number; pages: number }>('/restaurants/public', q),
  featured: (limit = 8) => get<{ restaurants: Restaurant[] }>('/restaurants/public/featured', { limit }),
  cuisines: () => get<Array<{ name: string; count: number; image: string | null }>>('/restaurants/public/cuisines'),
  stats: () => get<{ restaurants: number; cities: number; reviews: number; avgRating: number }>('/restaurants/public/stats'),
  one: (id: string) => get<Restaurant>(`/restaurants/public/${id}`),
  mine: () => get<Restaurant | null>('/restaurants/my-restaurant'),
  managed: (id: string) => get<Restaurant>(`/restaurants/${id}`),
  create: (b: Partial<Restaurant>) => post<Restaurant>('/restaurants', b),
  update: (id: string, b: Partial<Restaurant>) => put<Restaurant>(`/restaurants/${id}`, b),
};

export const menuApi = {
  full: (restaurantId: string) => get<MenuCategory[]>(`/menu/restaurant/${restaurantId}`),
  categories: (restaurantId: string) => get<MenuCategory[]>(`/menu/categories/${restaurantId}`),
  items: (restaurantId: string) => get<MenuItem[]>(`/menu/items/${restaurantId}`),
  popular: (limit = 8) => get<{ dishes: Dish[] }>('/menu/popular', { limit }),
  search: (q: string) => get<{ dishes: Dish[] }>('/menu/search', { q }),
  createCategory: (name: string) => post<MenuCategory>('/menu/categories', { name }),
  updateCategory: (id: string, b: Partial<MenuCategory>) => put<MenuCategory>(`/menu/categories/${id}`, b),
  deleteCategory: (id: string) => del<{ message: string }>(`/menu/categories/${id}`),
  createItem: (b: Partial<MenuItem>) => post<MenuItem>('/menu/items', b),
  updateItem: (id: string, b: Partial<MenuItem>) => put<MenuItem>(`/menu/items/${id}`, b),
  toggleItem: (id: string) => patch<MenuItem>(`/menu/items/${id}/toggle`),
  deleteItem: (id: string) => del<{ message: string }>(`/menu/items/${id}`),
};

export type OrderBody = {
  restaurantId: string;
  items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
  orderType: 'delivery' | 'pickup' | 'dine_in';
  promoCode?: string;
  tip?: number;
  deliveryAddress?: string;
  notes?: string;
  tableId?: string;
  paymentMethod?: 'cash';
  phone?: string;
};

export const orderApi = {
  quote: (b: OrderBody) => post<Quote>('/orders/quote', b),
  place: (b: OrderBody, idempotencyKey: string) => post<Order>('/orders', { ...b, paymentMethod: 'cash' }, { 'Idempotency-Key': idempotencyKey }),
  mine: (q: { status?: string; page?: number; limit?: number }) => get<{ orders: Order[]; total: number; page: number; pages: number }>('/orders/my-orders', q),
  one: (id: string) => get<Order>(`/orders/${id}`),
  cancel: (id: string) => patch<Order>(`/orders/${id}/cancel`),
  kitchen: (q: { status?: string; page?: number; limit?: number }) => get<{ orders: Order[]; total: number; page: number; pages: number }>('/orders', q),
  setStatus: (id: string, status: OrderStatus, note?: string) => patch<Order>(`/orders/${id}/status`, { status, note }),
  stats: () => get<{ total: number; delivered: number; cancelled: number; active: number; revenue: number; averageOrder: number; todayOrders: number; todayRevenue: number }>('/orders/stats'),
};

export const reservationApi = {
  availability: (restaurantId: string, date: string, guests: number) => get<Availability>('/reservations/availability', { restaurantId, date, guests }),
  create: (b: { restaurantId: string; date: string; time: string; guests: number; notes?: string; phone?: string }) => post<Reservation>('/reservations', b),
  mine: () => get<Reservation[]>('/reservations/my-reservations'),
  update: (id: string, b: { date?: string; time?: string; guests?: number; notes?: string }) => patch<Reservation>(`/reservations/${id}`, b),
  cancel: (id: string, reason?: string) => patch<Reservation>(`/reservations/${id}/cancel`, { reason }),
  forRestaurant: (restaurantId: string, q: { date?: string; status?: string; upcoming?: 'true'; page?: number; limit?: number }) =>
    get<{ reservations: Reservation[]; total: number; page: number; pages: number }>(`/reservations/restaurant/${restaurantId}`, q),
  setStatus: (id: string, status: ReservationStatus, reason?: string) => patch<Reservation>(`/reservations/${id}/status`, { status, reason }),
  calendar: (month: number, year: number) => get<Record<string, { confirmed: number; pending: number; cancelled: number; noShow: number; completed: number; guests: number }>>('/reservations/calendar', { month, year }),
  stats: () => get<{ total: number; todayTotal: number; confirmed: number; pending: number; todayGuests: number }>('/reservations/stats'),
};

export const reviewApi = {
  featured: (limit = 6) => get<FeaturedReview[]>('/reviews/featured', { limit }),
  forRestaurant: (restaurantId: string, page = 1) =>
    get<{ reviews: Review[]; total: number; page: number; pages: number; avgRating: number; distribution: Record<number, number> }>(`/reviews/restaurant/${restaurantId}`, { page, limit: 10 }),
  create: (b: { orderId?: string; reservationId?: string; rating: number; comment?: string }) => post<Review>('/reviews', b),
  reply: (id: string, reply: string) => patch<Review>(`/reviews/${id}/reply`, { reply }),
  remove: (id: string) => del<{ message: string }>(`/reviews/${id}`),
};

export const promotionApi = {
  featured: (limit = 6) => get<{ promotions: Promotion[] }>('/promotions/featured', { limit }),
  active: (restaurantId: string) => get<Promotion[]>(`/promotions/active/${restaurantId}`),
  forRestaurant: (restaurantId: string) => get<Promotion[]>(`/promotions/restaurant/${restaurantId}`),
  create: (b: Partial<Promotion>) => post<Promotion>('/promotions', b),
  update: (id: string, b: Partial<Promotion>) => put<Promotion>(`/promotions/${id}`, b),
  toggle: (id: string) => patch<Promotion>(`/promotions/${id}/toggle`),
  remove: (id: string) => del<{ message: string }>(`/promotions/${id}`),
};

export const userApi = {
  updateProfile: (b: Partial<Pick<User, 'fullName' | 'phone' | 'avatar' | 'address'>>) => put<User>('/users/profile', b),
  prefs: (b: NonNullable<User['notificationPrefs']>) => patch<User>('/users/notification-prefs', b),
  deactivate: () => del<{ message: string }>('/users/account'),
  favorites: () => get<{ restaurants: Restaurant[]; ids: string[] }>('/users/favorites'),
  addFavorite: (id: string) => post<{ message: string }>(`/users/favorites/${id}`),
  removeFavorite: (id: string) => del<{ message: string }>(`/users/favorites/${id}`),
  addresses: () => get<{ addresses: Address[] }>('/users/addresses'),
  addAddress: (b: Partial<Address>) => post<{ addresses: Address[] }>('/users/addresses', b),
  updateAddress: (i: number, b: Partial<Address>) => put<{ addresses: Address[] }>(`/users/addresses/${i}`, b),
  deleteAddress: (i: number) => del<{ addresses: Address[] }>(`/users/addresses/${i}`),
  defaultAddress: (i: number) => patch<{ addresses: Address[] }>(`/users/addresses/${i}/default`),
  cards: () => get<{ paymentMethods: SavedCard[] }>('/users/payment-methods'),
  addCard: (b: { last4: string; brand?: string; expiryMonth: string; expiryYear: string; isDefault?: boolean }) =>
    post<{ paymentMethods: SavedCard[] }>('/users/payment-methods', b),
  deleteCard: (i: number) => del<{ paymentMethods: SavedCard[] }>(`/users/payment-methods/${i}`),
  defaultCard: (i: number) => patch<{ paymentMethods: SavedCard[] }>(`/users/payment-methods/${i}/default`),
};

export const notificationApi = {
  list: (page = 1, type?: string) => get<{ notifications: AppNotification[]; total: number; unread: number; page: number; pages: number }>('/notifications', { page, type, limit: 20 }),
  unread: () => get<{ count: number }>('/notifications/unread-count'),
  read: (id: string) => patch<AppNotification>(`/notifications/${id}/read`),
  readAll: () => patch<{ message: string }>('/notifications/mark-all-read'),
  clear: () => del<{ message: string }>('/notifications/clear-all'),
};

export const loyaltyApi = {
  get: () => get<Loyalty>('/loyalty'),
  redeem: (rewardId: string) => post<{ voucher: Voucher; points: number }>('/loyalty/redeem', { rewardId }),
};
export type { Reward };

export const referralApi = {
  get: () => get<ReferralProfile>('/referrals'),
  invite: (email: string) => post<ReferralProfile>('/referrals/invite', { email }),
};

export const tableApi = {
  list: (restaurantId: string) => get<DiningTable[]>(`/tables/restaurant/${restaurantId}`),
  create: (tableNumber: string, capacity: number) => post<DiningTable>('/tables', { tableNumber, capacity }),
  update: (id: string, b: Partial<DiningTable>) => put<DiningTable>(`/tables/${id}`, b),
  setStatus: (id: string, status: TableStatus, serverNotes?: string) => patch<DiningTable>(`/tables/${id}/status`, { status, serverNotes }),
  remove: (id: string) => del<{ message: string }>(`/tables/${id}`),
};

export const staffApi = {
  list: (restaurantId: string) => get<StaffMember[]>(`/staff/restaurant/${restaurantId}`),
  create: (b: Partial<StaffMember>) => post<StaffMember>('/staff', b),
  update: (id: string, b: Partial<StaffMember>) => put<StaffMember>(`/staff/${id}`, b),
  remove: (id: string) => del<{ message: string }>(`/staff/${id}`),
};

export const inventoryApi = {
  list: (restaurantId: string) => get<InventoryItem[]>(`/inventory/restaurant/${restaurantId}`),
  create: (b: Partial<InventoryItem>) => post<InventoryItem>('/inventory', b),
  update: (id: string, b: Partial<InventoryItem>) => put<InventoryItem>(`/inventory/${id}`, b),
  remove: (id: string) => del<{ message: string }>(`/inventory/${id}`),
};

export const analyticsApi = {
  dashboard: (id: string) => get<OwnerDashboard>(`/analytics/restaurant/${id}/dashboard`),
  overview: (id: string, days: number) => get<OwnerOverview>(`/analytics/restaurant/${id}/overview`, { days }),
  heatmap: (id: string) => get<Array<{ day: number; hour: number; count: number }>>(`/analytics/restaurant/${id}/heatmap`),
};

export const billingApi = {
  statement: (period?: string) => get<Statement>('/billing/my-statement', { period }),
};

export const settingsApi = {
  public: () => get<PublicSettings>('/settings/public'),
};

export const uploadApi = {
  image: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return http.post<UploadResult>('/uploads/image', form).then((r) => r.data);
  },
  remove: (id: string) => del<{ deleted: boolean }>(`/uploads/${id}`),
};

export const supportApi = {
  mine: () => get<SupportTicket[]>('/support/my-tickets'),
  create: (b: { subject: string; description: string; type?: string }) => post<SupportTicket>('/support', b),
  reply: (id: string, message: string) => post<SupportTicket>(`/support/${id}/reply`, { message }),
};

export type ConciergeMessage = { role: 'user' | 'assistant'; content: string };
export const conciergeApi = {
  chat: (messages: ConciergeMessage[], path?: string) =>
    post<{ reply: string; suggestions: ConciergeSuggestion[] }>('/assistant/chat', { messages, context: { path } }),
  status: () => get<{ enabled: boolean }>('/assistant/status'),
};

export const adminApi = {
  stats: () => get<AdminStats>('/admin/stats'),
  users: (q: { role?: string; search?: string; isActive?: string; page?: number }) => get<Paged<User>>('/admin/users', q),
  updateUser: (id: string, b: { isActive?: boolean; role?: 'customer' | 'owner' }) => patch<User>(`/admin/users/${id}`, b),
  restaurants: (q: { status?: string; search?: string; page?: number }) => get<Paged<Restaurant>>('/admin/restaurants', q),
  setRestaurantStatus: (id: string, status: string, reason?: string) => patch<Restaurant>(`/admin/restaurants/${id}/status`, { status, reason }),
  setBilling: (id: string, plan: 'starter' | 'pro', commissionRate?: number | null) => patch<Restaurant>(`/admin/restaurants/${id}/billing`, { plan, commissionRate }),
  sponsor: (id: string, weeks: number) => post<{ sponsoredUntil: string }>(`/admin/restaurants/${id}/sponsorship`, { weeks }),
  orders: (q: { status?: string; page?: number }) => get<Paged<Order>>('/admin/orders', q),
  correctOrder: (id: string, status: 'delivered' | 'cancelled', note: string) => post<Order>(`/admin/orders/${id}/correct`, { status, note }),
  reservations: (q: { status?: string; page?: number }) => get<Paged<Reservation>>('/admin/reservations', q),
  revenue: (from: string, to: string) => get<Revenue>('/admin/revenue', { from, to }),
  charges: (q: { status?: string; period?: string; restaurantId?: string; page?: number }) =>
    get<{ charges: Charge[]; total: number; page: number; pages: number }>('/admin/charges', q),
  markPaid: (b: { ids?: string[]; restaurantId?: string; period?: string }) => post<{ updated: number }>('/admin/charges/mark-paid', b),
  runSubscriptions: (period?: string) => post<{ period: string; restaurants: number; created: number }>('/admin/billing/run-subscriptions', { period }),
  reconcile: () => post<{ ordersChecked: number; reservationsChecked: number }>('/admin/billing/reconcile'),
  settings: () => get<PlatformSettings>('/admin/settings'),
  saveSettings: (b: Partial<PlatformSettings>) => put<PlatformSettings>('/admin/settings', b),
  support: (q: { status?: string; page?: number }) => get<{ tickets: SupportTicket[]; total: number; page: number; pages: number }>('/admin/support', q),
  updateTicket: (id: string, b: { status?: string }) => patch<SupportTicket>(`/admin/support/${id}`, b),
  audit: (q: { page?: number; action?: string }) => get<Paged<AuditEntry>>('/admin/audit-logs', q),
};
