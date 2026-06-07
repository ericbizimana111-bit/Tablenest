import React from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const RED = '#B91C1C';
const COLORS = [RED, '#D97706', '#16A34A', '#2563EB', '#7C3AED', '#F9A8D4'];

interface OrdersChartProps {
    data: Array<{ label: string; orders?: number; value?: number;[key: string]: any }>;
    type?: 'line' | 'bar' | 'pie' | 'donut';
    height?: number;
    color?: string;
    title?: string;
    showLegend?: boolean;
    multiSeries?: Array<{ key: string; label: string; color: string }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontFamily: 'Poppins, sans-serif', fontSize: 13,
            }}>
                {label && <p style={{ color: '#6B7280', marginBottom: 4, fontSize: 11 }}>{label}</p>}
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.color || RED, fontWeight: 600 }}>
                        {p.name}: {p.value?.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function OrdersChart({
    data,
    type = 'bar',
    height = 200,
    color = RED,
    title,
    showLegend = false,
    multiSeries,
}: OrdersChartProps) {
    const chartData = data.map(d => ({
        ...d,
        name: d.label,
        value: d.orders ?? d.value ?? 0,
    }));

    const renderChart = () => {
        if (type === 'pie' || type === 'donut') {
            const inner = type === 'donut' ? 45 : 0;
            return (
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={inner}
                        outerRadius={70}
                        dataKey="value"
                        stroke="none"
                        nameKey="name"
                    >
                        {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && <Legend wrapperStyle={{ fontFamily: 'Poppins', fontSize: 12 }} />}
                </PieChart>
            );
        }

        if (type === 'line') {
            return (
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Poppins', fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    {multiSeries ? (
                        multiSeries.map(s => (
                            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5} dot={{ r: 4, fill: s.color }} />
                        ))
                    ) : (
                        <Line type="monotone" dataKey="value" name="Orders" stroke={color} strokeWidth={2.5} dot={{ r: 4, fill: color }} />
                    )}
                    {showLegend && <Legend wrapperStyle={{ fontFamily: 'Poppins', fontSize: 12 }} />}
                </LineChart>
            );
        }

        // Default: bar
        return (
            <BarChart data={chartData} barSize={multiSeries ? 12 : 22} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Poppins', fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                {multiSeries ? (
                    multiSeries.map(s => (
                        <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} />
                    ))
                ) : (
                    <Bar dataKey="value" name="Orders" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                            <Cell key={i} fill={i === chartData.length - 1 ? color : `${color}60`} />
                        ))}
                    </Bar>
                )}
                {showLegend && <Legend wrapperStyle={{ fontFamily: 'Poppins', fontSize: 12 }} />}
            </BarChart>
        );
    };

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif' }}>
            {title && (
                <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 16 }}>{title}</div>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}

export default OrdersChart;