export interface Address {
    id: string;
    label: string;
    icon?: 'home' | 'work' | 'other';
    street: string;
    apt?: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export interface PaymentMethod {
    id: string;
    last4: string;
    holder: string;
    expiry: string;
    brand: 'Visa' | 'Mastercard' | 'Amex' | 'Card';
    isPrimary: boolean;
}

export interface LoyaltyTransaction {
    type: 'earn' | 'redeem';
    points: number;
    description: string;
    date?: string;
    dateLabel?: string;
}

export interface Loyalty {
    userId: string;
    points: number;
    transactions: LoyaltyTransaction[];
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