export interface Address {
    label: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    isDefault: boolean;
}

export interface PaymentMethod {
    brand: 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Card';
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
}

export interface LoyaltyTransaction {
    kind: 'earn' | 'redeem';
    points: number;
    description: string;
    date?: string;
}

export interface LoyaltyVoucher {
    code: string;
    title: string;
    discountType: 'percentage' | 'flat' | 'free_delivery';
    discountValue: number;
    expiresAt: string;
    used: boolean;
}

export interface LoyaltyReward {
    id: string;
    title: string;
    description: string;
    points: number;
    category: string;
    discountType: 'percentage' | 'flat' | 'free_delivery';
    discountValue: number;
    validDays: number;
}

export interface Loyalty {
    userId: string;
    points: number;
    lifetimePoints: number;
    transactions: LoyaltyTransaction[];
    vouchers: LoyaltyVoucher[];
    tier: string;
    nextTier: { name: string; pointsNeeded: number } | null;
    tierProgress: number;
    rewards: LoyaltyReward[];
}

export interface ReferralRecord {
    referredUserId?: string;
    email: string;
    name: string;
    status: 'pending' | 'successful';
    reward: number;
    invitedAt?: string;
    date?: string;
}

export interface Referral {
    userId: string;
    code: string;
    referrals: ReferralRecord[];
    totalEarned: number;
}

export interface Notification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: 'order' | 'booking' | 'promotion' | 'system' | 'review' | 'payment';
    isRead: boolean;
    link?: string;
    metadata?: Record<string, unknown>;
    actions?: string[];
    cta?: string;
    time?: string;
    createdAt?: string;
}

export interface SupportTicket {
    _id: string;
    userId: string;
    userName?: string;
    ticketId?: string;
    subject: string;
    description: string;
    type: 'technical' | 'order' | 'booking' | 'payment' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: string;
    responses?: Array<{ authorId: string; message: string; createdAt: string }>;
    createdAt?: string;
}

export interface PaginationMeta {
    page: number;
    pages: number;
    total: number;
    limit: number;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}