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

export function StatCard({ label, value, icon, trend, trendUp, sub, color = '#f9691a', onClick }: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className="card card-hover"
            style={{ padding: '20px 22px', cursor: onClick ? 'pointer' : 'default' }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                {icon && (
                    <div style={{ background: `${color}17`, color, padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </div>
                )}
                {trend && (
                    <span className={`badge ${trendUp ? 'badge-green' : 'badge-red'}`}>
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </span>
                )}
            </div>
            <div style={{ fontSize: 13, color: '#857a70', marginBottom: 4, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 27, fontWeight: 800, color: '#1a130d', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: '#b3a89d', marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

export default StatCard;
