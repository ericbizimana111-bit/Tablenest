import React from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const RED = '#B91C1C';

interface DataPoint {
    label: string;
    value: number;
    name?: string;
}

interface RevenueChartProps {
    data: DataPoint[];
    type?: 'area' | 'bar';
    height?: number;
    color?: string;
    valuePrefix?: string;
    valueSuffix?: string;
    showGrid?: boolean;
    title?: string;
    subtitle?: string;
}

interface RevenueTooltipProps {
    active?: boolean;
    label?: string;
    payload?: Array<{ value?: number }>;
    prefix?: string;
    suffix?: string;
}

const CustomTooltip = ({ active, payload, label, prefix = '$', suffix = '' }: RevenueTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontFamily: 'Poppins, sans-serif',
            }}>
                <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: RED }}>
                    {prefix}{typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}{suffix}
                </p>
            </div>
        );
    }
    return null;
};

export function RevenueChart({
    data,
    type = 'area',
    height = 220,
    color = RED,
    valuePrefix = '$',
    valueSuffix = '',
    showGrid = false,
    title,
    subtitle,
}: RevenueChartProps) {
    const chartData = data.map(d => ({ ...d, name: d.label }));

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif' }}>
            {title && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>{title}</div>
                    {subtitle && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{subtitle}</div>}
                </div>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {type === 'area' ? (
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id={`revGrad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />}
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fontFamily: 'Poppins', fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip prefix={valuePrefix} suffix={valueSuffix} />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2.5}
                            fill={`url(#revGrad_${color.replace('#', '')})`}
                        />
                    </AreaChart>
                ) : (
                    <BarChart data={chartData} barSize={22} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />}
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fontFamily: 'Poppins', fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip prefix={valuePrefix} suffix={valueSuffix} />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={i === chartData.length - 2 || i === chartData.length - 1 ? color : `${color}60`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}

export default RevenueChart;          