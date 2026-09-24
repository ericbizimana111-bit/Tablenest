import React from 'react';
import { SearchX, Inbox, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    message?: string;
    action?: { label: string; onClick: () => void };
    variant?: 'default' | 'search' | 'error';
}

export function EmptyState({ icon, title, message, action, variant = 'default' }: EmptyStateProps) {
    const defaultIcon = variant === 'search' ? <SearchX size={44} /> : variant === 'error' ? <AlertCircle size={44} /> : <Inbox size={44} />;
    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--color-sand)', color: '#b3a89d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {icon || defaultIcon}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a130d', marginBottom: 6 }}>{title}</div>
            {message && <div style={{ fontSize: 14, color: '#857a70', maxWidth: 340, lineHeight: 1.6 }}>{message}</div>}
            {action && (
                <button onClick={action.onClick} className="btn btn-primary" style={{ marginTop: 22 }}>
                    {action.label}
                </button>
            )}
        </div>
    );
}

export default EmptyState;
