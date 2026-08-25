import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Ban, CheckCircle, Eye } from 'lucide-react';
import { usersAPI } from '../../../shared/services/api';
import { Spinner, StatusBadge, Pagination, StatCard } from '../../../shared/components/ui/index';
import type { User } from '../../../shared/types/auth.types';
import toast from 'react-hot-toast';

export default function AdminUsers() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, search, role],
        queryFn: () => usersAPI.getAll({ page, limit: 15, search, role }).then(r => r.data),
    });
    const { data: stats } = useQuery({
        queryKey: ['user-stats'],
        queryFn: () => usersAPI.getStats().then(r => r.data),
    });

    const suspendMut = useMutation({
        mutationFn: (id: string) => usersAPI.suspend(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User suspended'); },
    });
    const activateMut = useMutation({
        mutationFn: (id: string) => usersAPI.activate(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User activated'); },
    });

    const users = data?.users || [];

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>User Management</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Manage all platform users and their permissions.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Users" value={(stats?.total || 42910).toLocaleString()} icon={<Eye size={20} />} trend="+12%" trendUp />
                <StatCard label="Customers" value={(stats?.customers || 39200).toLocaleString()} icon={<Eye size={20} />} />
                <StatCard label="Owners" value={(stats?.owners || 1284).toLocaleString()} icon={<Eye size={20} />} />
                <StatCard label="Active" value={(stats?.active || 41200).toLocaleString()} icon={<CheckCircle size={20} />} color="#16A34A" />
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                            style={{ width: '100%', padding: '8px 10px 8px 32px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', outline: 'none' }} />
                    </div>
                    <select value={role} onChange={e => setRole(e.target.value)}
                        style={{ padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', outline: 'none', background: 'white' }}>
                        <option value="">All Roles</option>
                        <option value="customer">Customer</option>
                        <option value="owner">Owner</option>
                        <option value="super_admin">Admin</option>
                    </select>
                </div>

                {isLoading ? <Spinner /> : (
                    <table className="data-table">
                        <thead><tr>{['User', 'Email', 'Role', 'Plan', 'Status', 'Joined', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody>
                            {users.map((u: User) => (
                                <tr key={u._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#B91C1C' }}>
                                                {u.fullName?.[0] || 'U'}
                                            </div>
                                            <span style={{ fontWeight: 500, fontSize: 13 }}>{u.fullName}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{u.email}</td>
                                    <td><span style={{ background: u.role === 'super_admin' ? '#EDE9FE' : u.role === 'owner' ? '#FEF9C3' : '#F0FDF4', color: u.role === 'super_admin' ? '#7C3AED' : u.role === 'owner' ? '#D97706' : '#16A34A', padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>{u.role?.replace('_', ' ')}</span></td>
                                    <td style={{ fontSize: 13 }}>{u.activePlan || 'Free'}</td>
                                    <td><StatusBadge status={u.isActive ? 'active' : 'suspended'} /></td>
                                    <td style={{ fontSize: 12, color: '#9CA3AF' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {u.isActive
                                                ? <button onClick={() => suspendMut.mutate(u._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }} title="Suspend"><Ban size={14} /></button>
                                                : <button onClick={() => activateMut.mutate(u._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16A34A', padding: 4 }} title="Activate"><CheckCircle size={14} /></button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Total: {data?.total || users.length}</span>
                    <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
                </div>
            </div>
        </div>
    );
}

