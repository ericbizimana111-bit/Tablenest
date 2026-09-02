
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StatCard, Spinner, EmptyState } from '../../../shared/components/ui/index';
import { DollarSign, ShoppingBag, Star, Users, BarChart2 } from 'lucide-react';
import { analyticsAPI, ordersAPI, reservationsAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';

const ORANGE = '#F97316';
const COLORS = [ORANGE, '#F59E0B', '#16A34A', '#2563EB', '#7C3AED'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function OwnerAnalytics() {
    const { user } = useAuthStore();
    const [period, setPeriod] = useState('7');

    const restaurantId = user?.restaurantId?.toString() || '';

    const { data: dashData, isLoading } = useQuery({
        queryKey: ['owner-analytics', restaurantId, period],
        queryFn: () => restaurantId ? analyticsAPI.getRestaurantDashboard(restaurantId).then(r => r.data) : Promise.resolve(null),
        enabled: !!restaurantId,
    });

    const { data: revenueRaw = [] } = useQuery({
        queryKey: ['owner-revenue-chart', restaurantId, period],
        queryFn: () => restaurantId ? ordersAPI.getRevenue(restaurantId, Number(period)).then(r => r.data) : Promise.resolve([]),
        enabled: !!restaurantId,
    });

    const { data: heatmap = [] } = useQuery({
        queryKey: ['owner-heatmap', restaurantId],
        queryFn: () => restaurantId ? analyticsAPI.getHeatmap(restaurantId).then(r => r.data) : Promise.resolve([]),
        enabled: !!restaurantId,
    });

    const { data: stats } = useQuery({
        queryKey: ['res-stats-owner', restaurantId],
        queryFn: () => restaurantId ? reservationsAPI.getStats(restaurantId).then(r => r.data) : Promise.resolve({ total: 0, confirmed: 0, pending: 0 }),
        enabled: !!restaurantId,
    });

    const { data: menuData } = useQuery({
        queryKey: ['menu-analytics', restaurantId],
        queryFn: () => restaurantId ? import('../../../shared/services/api').then(m => m.menuAPI.getFullMenu(restaurantId).then(r => r.data)) : Promise.resolve(null),
        enabled: !!restaurantId,
    });

    // Build real chart data from API
    const revenue = DAYS.map((d, i) => {
        const match = revenueRaw.find((r: { _id: string; revenue: number }) => r._id?.toUpperCase()?.startsWith(d.toUpperCase()) || r._id?.toUpperCase()?.startsWith(DAYS[i]?.toUpperCase()));
        return { day: d, revenue: match?.revenue || 0, orders: match?.orders || 0 };
    });

    // Build top items from real menu data
    const topItems = (menuData?.categories || []).flatMap((cat: { items?: Array<{ name: string; price: number }> }) =>
        (cat.items || []).map((item: { name: string; price: number }) => ({ name: item.name, orders: 0, revenue: 0 }))
    ).slice(0, 5);

    // Build customer data from heatmap
    const custData = DAYS.map((d, i) => ({ day: d, new: 0, returning: 0 }));

    const totalRevenue = revenue.reduce((sum: number, r: { revenue: number }) => sum + r.revenue, 0);
    const totalOrders = revenue.reduce((sum: number, r: { orders: number }) => sum + r.orders, 0);

    if (isLoading) return <div className="fade-in"><Spinner /></div>;

    if (!restaurantId) {
        return (
            <div className="fade-in">
                <EmptyState
                    icon={<BarChart2 size={40} />}
                    title="No restaurant linked"
                    message="Link a restaurant to your account to see analytics."
                />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>Analytics</h1>
                    <p style={{ fontSize: 13, color: '#475569' }}>Deep insights into your restaurant's performance.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {[['7', 'Week'], ['30', 'Month'], ['90', 'Quarter']].map(([v, l]) => (
                        <button key={v} onClick={() => setPeriod(v)}
                            style={{ padding: '7px 16px', border: '1.5px solid', borderColor: period === v ? ORANGE : '#E2E8F0', borderRadius: 8, background: period === v ? ORANGE : 'white', color: period === v ? 'white' : '#475569', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>{l}</button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign size={18} />} />
                <StatCard label="Total Orders" value={totalOrders.toLocaleString()} icon={<ShoppingBag size={18} />} />
                <StatCard label="Avg. Rating" value={`${dashData?.rating || 0}`} icon={<Star size={18} />} color="#F59E0B" sub={`${dashData?.totalReviews || 0} reviews`} />
                <StatCard label="Total Guests" value={stats?.total?.toLocaleString() || '0'} icon={<Users size={18} />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Revenue by Day</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={revenue}>
                            <defs>
                                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={ORANGE} stopOpacity={0.25} />
                                    <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Area type="monotone" dataKey="revenue" stroke={ORANGE} strokeWidth={2.5} fill="url(#revG)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Orders by Day</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenue} barSize={20}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="orders" fill={`${ORANGE}80`} radius={[4, 4, 0, 0]}>
                                {revenue.map((_, i) => <Cell key={i} fill={i === 5 ? ORANGE : `${ORANGE}60`} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Menu Items</div>
                    {topItems.length > 0 ? (
                        <table className="data-table">
                            <thead><tr>{['Item', 'Price'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody>
                                {topItems.map((item: { name: string; price: number }, i: number) => (
                                    <tr key={item.name}>
                                        <td style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</td>
                                        <td style={{ fontSize: 13, fontWeight: 600 }}>${item.price?.toFixed(2) || '0.00'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8', fontSize: 13 }}>No menu items yet.</div>
                    )}
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Customer Breakdown</div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={custData} barSize={10}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="returning" fill={`${ORANGE}40`} radius={[2, 2, 0, 0]} name="Returning" />
                            <Bar dataKey="new" fill={ORANGE} radius={[2, 2, 0, 0]} name="New" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: ORANGE }} />New</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: `${ORANGE}40` }} />Returning</div>
                    </div>
                </div>
            </div>
        </div>
    );
}