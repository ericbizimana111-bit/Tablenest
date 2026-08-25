import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Search, Ban, CheckCircle, Utensils } from 'lucide-react';
import { restaurantsAPI } from '../../../shared/services/api';
import { Spinner, StatusBadge, Pagination, StatCard } from '../../../shared/components/ui/index';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import toast from 'react-hot-toast';

export default function AdminRestaurants() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-restaurants', page, search],
        queryFn: () => restaurantsAPI.getAll({ page, limit: 15, search }).then((r) => r.data),
    });

    const { data: stats } = useQuery({
        queryKey: ['restaurant-stats'],
        queryFn: () => restaurantsAPI.getStats().then((r) => r.data),
    });


    const approveMut = useMutation({
        mutationFn: (id: string) => restaurantsAPI.approve(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
            qc.invalidateQueries({ queryKey: ['restaurant-stats'] });
            toast.success('Restaurant approved');
        },
    });

    const rejectMut = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => restaurantsAPI.reject(id, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
            qc.invalidateQueries({ queryKey: ['restaurant-stats'] });
            toast.success('Restaurant rejected');
        },
    });
    const suspendMut = useMutation({
        mutationFn: (id: string) => restaurantsAPI.suspend(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
            toast.success('Restaurant suspended');
        },
    });

    const restaurants: Restaurant[] = data?.restaurants || [];

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Restaurant Management</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>View and manage all registered restaurants on the platform.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Restaurants" value={stats?.total || restaurants.length} icon={<Utensils size={20} />} />
                <StatCard label="Active" value={stats?.active || 0} icon={<CheckCircle size={20} />} color="#16A34A" />
                <StatCard label="Pending" value={stats?.pending || 0} icon={<Eye size={20} />} color="#D97706" />
                <StatCard label="Suspended" value={stats?.suspended || 0} icon={<Ban size={20} />} color="#DC2626" />
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search restaurants..."
                            style={{ width: '100%', padding: '8px 10px 8px 32px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', outline: 'none' }}
                        />
                    </div>
                </div>

                {isLoading ? <Spinner /> : (
                    <table className="data-table">
                        <thead>
                            <tr>{['Restaurant', 'Cuisine', 'Owner', 'City', 'Status', 'Rating', 'Actions'].map((h) => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {restaurants.map((r) => (
                                <tr key={r._id}>
                                    <td style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{r.cuisineType}</td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{typeof r.ownerId === 'object' ? (r.ownerId as { fullName?: string }).fullName : r.ownerId || '—'}</td>
                                    <td style={{ fontSize: 13 }}>{r.city || '—'}</td>
                                    <td><StatusBadge status={r.status} /></td>
                                    <td style={{ fontSize: 13 }}>{r.rating || '—'}</td>
                                    <td>
                                        {r.status === 'active' && (
                                            <button onClick={() => suspendMut.mutate(r._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }} title="Suspend">
                                                <Ban size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Total: {data?.total || restaurants.length}</span>
                    <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
                </div>
            </div>
        </div>
    );
}

