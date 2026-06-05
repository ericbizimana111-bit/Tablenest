import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { analyticsAPI } from '../../../shared/services/api';
import { Spinner } from '../../../shared/components/ui/index';
import { DollarSign, TrendingUp, Download } from 'lucide-react';

const RED = '#B91C1C';

export default function AdminReports() {
    const [period, setPeriod] = useState('7');

    const { data: signups = [] } = useQuery({
        queryKey: ['report-signups', period],
        queryFn: () => analyticsAPI.getSignups(+period).then(r => r.data),
    });
    const { data: bookings = [] } = useQuery({
        queryKey: ['report-bookings', period],
        queryFn: () => analyticsAPI.getBookingsByDay(+period).then(r => r.data),
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenueData = days.map((d, i) => ({ day: d, revenue: [12400, 18200, 15800, 22100, 19300, 31200, 26800][i], orders: [42, 65, 55, 78, 68, 110, 95][i] }));

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Reports & Analytics</h1>
                    <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Platform-wide performance metrics and trends.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {['7', '30', '90'].map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                            style={{ padding: '7px 16px', border: '1.5px solid', borderColor: period === p ? RED : '#E5E7EB', borderRadius: 8, background: period === p ? RED : 'white', color: period === p ? 'white' : '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            {p === '7' ? 'Week' : p === '30' ? 'Month' : 'Quarter'}
                        </button>
                    ))}
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Revenue Trend</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={RED} stopOpacity={0.2} />
                                    <stop offset="100%" stopColor={RED} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Area type="monotone" dataKey="revenue" stroke={RED} strokeWidth={2.5} fill="url(#revGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Daily Orders</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenueData} barSize={22}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="orders" fill={`${RED}80`} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>New User Signups</div>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={signups.length ? signups.map((s: any) => ({ day: s._id?.slice(5), count: s.count })) : days.map((d, i) => ({ day: d, count: [28, 45, 38, 62, 55, 80, 70][i] }))}>
                        <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                        <Line type="monotone" dataKey="count" stroke={RED} strokeWidth={2.5} dot={{ fill: RED, r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}