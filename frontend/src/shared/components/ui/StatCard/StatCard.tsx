import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    sub?: string;
    color?: string;
    onClick?: () => void;
}

export function StatCard({
    label,
    value,
    icon,
    trend,
    trendUp,
    sub,
    color = '#F97316',
    onClick,
}: StatCardProps) {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: 12,
                padding: '18px 20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                fontFamily: 'Poppins, sans-serif',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                {icon && (
                    <div style={{
                        background: `${color}15`,
                        color,
                        padding: 10,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {icon}
                    </div>
                )}
                {trend && (
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 3,
                        fontSize: 12, fontWeight: 500,
                        color: trendUp ? '#16A34A' : '#DC2626',
                    }}>
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </span>
                )}
            </div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

export default StatCard;