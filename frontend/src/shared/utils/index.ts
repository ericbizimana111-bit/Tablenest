// ── Currency ──
export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${amount.toFixed(2)}`;
}

// ── Date / Time ──
export function formatDate(
    dateStr: string | Date,
    options?: Intl.DateTimeFormatOptions
): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('en-US', options ?? {
        month: 'short', day: 'numeric', year: 'numeric',
    });
}

export function formatDateTime(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export function formatTime(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const diff = Date.now() - date.getTime();
    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (secs < 60) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
}

// ── String ──
export function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function truncate(str: string, maxLength: number): string {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength).trim() + '...';
}

export function slugify(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Numbers ──
export function formatNumber(n: number): string {
    return new Intl.NumberFormat('en-US').format(n);
}

export function percentage(value: number, total: number, decimals = 1): string {
    if (!total) return '0%';
    return `${((value / total) * 100).toFixed(decimals)}%`;
}

// ── Clipboard ──
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

// ── Color helpers ──
export function getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getAvatarColor(name: string): string {
    const colors = [
        '#B91C1C', '#C2410C', '#B45309', '#15803D',
        '#0F766E', '#1D4ED8', '#7C3AED', '#BE185D',
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

// ── Status helpers ──
export function getStatusColor(status: string): { bg: string; text: string } {
    const map: Record<string, { bg: string; text: string }> = {
        active: { bg: '#DCFCE7', text: '#16A34A' },
        available: { bg: '#DCFCE7', text: '#16A34A' },
        delivered: { bg: '#DCFCE7', text: '#16A34A' },
        confirmed: { bg: '#DCFCE7', text: '#16A34A' },
        open: { bg: '#DCFCE7', text: '#16A34A' },
        successful: { bg: '#DCFCE7', text: '#16A34A' },
        pending: { bg: '#FEF9C3', text: '#D97706' },
        reserved: { bg: '#FEF9C3', text: '#D97706' },
        in_transit: { bg: '#FEF9C3', text: '#D97706' },
        preparing: { bg: '#FEF9C3', text: '#D97706' },
        in_progress: { bg: '#FEF3C7', text: '#92400E' },
        arrived: { bg: '#DBEAFE', text: '#2563EB' },
        cancelled: { bg: '#FEE2E2', text: '#DC2626' },
        suspended: { bg: '#FEE2E2', text: '#DC2626' },
        rejected: { bg: '#FEE2E2', text: '#DC2626' },
        occupied: { bg: '#FEE2E2', text: '#DC2626' },
        closed: { bg: '#F3F4F6', text: '#6B7280' },
        inactive: { bg: '#F3F4F6', text: '#6B7280' },
        blocked: { bg: '#F3F4F6', text: '#6B7280' },
    };
    return map[status?.toLowerCase()] ?? { bg: '#F3F4F6', text: '#6B7280' };
}

// ── Validation ──
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export function passwordStrength(password: string): 0 | 1 | 2 | 3 {
    if (!password) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
}