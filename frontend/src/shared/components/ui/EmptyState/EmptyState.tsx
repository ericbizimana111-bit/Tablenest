import React from 'react';
import { SearchX, Inbox, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    message?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'default' | 'search' | 'error';
}

export function EmptyState({ icon, title, message, action, variant = 'default' }: EmptyStateProps) {
    const defaultIcon = variant === 'search'
        ? <SearchX size={48} />
        : variant === 'error'
            ? <AlertCircle size={48} />
            : <Inbox size={48} />;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '60px 24px', textAlign: 'center',
            fontFamily: 'Poppins, sans-serif',
        }}>
            <div style={{ color: '#CBD5E1', marginBottom: 16 }}>
                {icon || defaultIcon}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                {title}
            </div>
            {message && (
                <div style={{ fontSize: 14, color: '#94A3B8', maxWidth: 320, lineHeight: 1.6 }}>
                    {message}
                </div>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    style={{
                        marginTop: 20, padding: '9px 22px', background: '#F97316', color: 'white',
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

export default EmptyState;