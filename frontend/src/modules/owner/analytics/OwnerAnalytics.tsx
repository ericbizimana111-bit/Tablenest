
import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ordersAPI, reservationsAPI, reviewsAPI, restaurantsAPI } from '../../../shared/services/api';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../shared/store/authStore';
import { StatCard } from '../../../shared/components/ui/index';
import { DollarSign, ShoppingBag, Star, Users } from 'lucide-react';

const RED = '#B91C1C';
const COLORS = [RED, '#D97706', '#16A34A', '#2563EB', '#7C3AED'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function OwnerAnalytics() {
    const { user } = useAuthStore();
    const [period, setPeriod] = useState('7');
    const restaurantId = user?.restaurantId?.toString() || '';

    const revenue = DAYS.map((d, i) => ({ day: d, revenue: [8200, 12400, 10800, 15600, 13200, 21800, 17400][i], orders: [28, 42, 36, 55, 47, 78, 62][i] }));
    const topItems = [
        { name: 'Signature Ribeye', orders: 145, revenue: 6090 },
        { name: 'Truffle Linguine', orders: 128, revenue: 3584 },
        { name: 'Margherita Pizza', orders: 112, revenue: 2464 },
        { name: 'Wagyu Burger', orders: 98, revenue: 3136 },
        { name: 'Atlantic Salmon', orders: 87, revenue: 2958 },
    ];
    const custData = DAYS.map((d, i) => ({ day: d, new: [5, 8, 7, 12, 10, 18, 14][i], returning: [23, 34, 29, 43, 37, 60, 48][i] }));

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>Analytics</h1>
                    <p style={{ fontSize: 13, color: '#6B7280' }}>Deep insights into your restaurant's performance.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {[['7', 'Week'], ['30', 'Month'], ['90', 'Quarter']].map(([v, l]) => (
                        <button key={v} onClick={() => setPeriod(v)}
                            style={{ padding: '7px 16px', border: '1.5px solid', borderColor: period === v ? RED : '#E5E7EB', borderRadius: 8, background: period === v ? RED : 'white', color: period === v ? 'white' : '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>{l}</button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                <StatCard label="Total Revenue" value="$89,420" icon={<DollarSign size={18} />} trend="+18.5%" trendUp />
                <StatCard label="Total Orders" value="1,284" icon={<ShoppingBag size={18} />} trend="+8.3%" trendUp />
                <StatCard label="Avg. Rating" value="4.8" icon={<Star size={18} />} color="#D97706" />
                <StatCard label="Total Guests" value="3,892" icon={<Users size={18} />} trend="+12%" trendUp />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Revenue by Day</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={revenue}>
                            <defs>
                                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={RED} stopOpacity={0.25} />
                                    <stop offset="100%" stopColor={RED} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Area type="monotone" dataKey="revenue" stroke={RED} strokeWidth={2.5} fill="url(#revG)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Orders by Day</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenue} barSize={20}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="orders" fill={`${RED}80`} radius={[4, 4, 0, 0]}>
                                {revenue.map((_, i) => <Cell key={i} fill={i === 5 ? RED : `${RED}60`} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Top Menu Items</div>
                    <table className="data-table">
                        <thead><tr>{['Item', 'Orders', 'Revenue', 'Share'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody>
                            {topItems.map((item, i) => (
                                <tr key={item.name}>
                                    <td style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</td>
                                    <td style={{ fontSize: 13 }}>{item.orders}</td>
                                    <td style={{ fontSize: 13, fontWeight: 600 }}>${item.revenue.toLocaleString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                                                <div style={{ width: `${(item.orders / 145) * 100}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                                            </div>
                                            <span style={{ fontSize: 11, color: '#9CA3AF', width: 30 }}>{Math.round((item.orders / 145) * 100)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Customer Breakdown</div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={custData} barSize={10}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="returning" fill={`${RED}40`} radius={[2, 2, 0, 0]} name="Returning" />
                            <Bar dataKey="new" fill={RED} radius={[2, 2, 0, 0]} name="New" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: RED }} />New</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: `${RED}40` }} />Returning</div>
                    </div>
                </div>
            </div>
        </div>
    );
}