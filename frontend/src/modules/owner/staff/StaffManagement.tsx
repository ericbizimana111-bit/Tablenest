import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { staffAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { Modal, StatusBadge } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

type StaffMember = {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
};

type StaffForm = { name: string; email: string; phone: string; role: string };

const ROLES = ['Manager', 'Chef', 'Sous Chef', 'Server', 'Host', 'Bartender', 'Cashier', 'Cleaner'];

export default function StaffManagement() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [apiRestaurantId, setApiRestaurantId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
    const [form, setForm] = useState<StaffForm>({ name: '', email: '', phone: '', role: 'Server' });
    const [search, setSearch] = useState('');
    const restaurantId = user?.restaurantId?.toString() || apiRestaurantId;

    React.useEffect(() => {
        if (!user?.restaurantId) {
            let active = true;
            restaurantsAPI.getMyRestaurant()
                .then(r => { if (active && r.data?._id) setApiRestaurantId(r.data._id); })
                .catch(() => { });
            return () => { active = false; };
        }
        return undefined;
    }, [user]);

    const { data: staff = [] } = useQuery({
        queryKey: ['staff', restaurantId],
        queryFn: () => staffAPI.getByRestaurant(restaurantId).then(r => r.data),
        enabled: !!restaurantId,
    });

    const saveMut = useMutation({
        mutationFn: (data: StaffForm) => editStaff ? staffAPI.update(editStaff._id, data) : staffAPI.create({ ...data, restaurantId }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); setShowModal(false); setEditStaff(null); toast.success(editStaff ? 'Staff updated' : 'Staff member added'); },
    });
    const deleteMut = useMutation({
        mutationFn: (id: string) => staffAPI.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Staff member removed'); },
    });

    const openEdit = (s: StaffMember) => { setEditStaff(s); setForm({ name: s.name || '', email: s.email || '', phone: s.phone || '', role: s.role || 'Server' }); setShowModal(true); };
    const openAdd = () => { setEditStaff(null); setForm({ name: '', email: '', phone: '', role: 'Server' }); setShowModal(true); };
    const allStaff = (Array.isArray(staff) ? staff : []) as StaffMember[];
    const filtered = allStaff.filter((s: StaffMember) =>
        !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.role?.toLowerCase().includes(search.toLowerCase())
    );

    const roleColors: Record<string, string> = {
        Manager: '#EDE9FE', Chef: '#FEE2E2', 'Sous Chef': '#FEF3C7', Server: '#DBEAFE',
        Host: '#DCFCE7', Bartender: '#F1F5F9', Cashier: '#FEF3C7',
    };
    const roleTextColors: Record<string, string> = {
        Manager: '#7C3AED', Chef: '#F97316', 'Sous Chef': '#F59E0B', Server: '#2563EB',
        Host: '#16A34A', Bartender: '#475569', Cashier: '#92400E',
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>Staff Management</h1>
                    <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Manage your team members and their roles.</p>
                </div>
                <button onClick={openAdd}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    <Plus size={14} /> Add Staff Member
                </button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
                {[
                    { label: 'Total Staff', value: allStaff.length, color: '#F97316' },
                    { label: 'Active', value: allStaff.filter((s: StaffMember) => s.isActive !== false).length, color: '#16A34A' },
                    { label: 'Managers', value: allStaff.filter((s: StaffMember) => s.role === 'Manager').length, color: '#7C3AED' },
                    { label: 'Kitchen', value: allStaff.filter((s: StaffMember) => ['Chef', 'Sous Chef'].includes(s.role)).length, color: '#F59E0B' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: `${s.color}15`, color: s.color, padding: 10, borderRadius: 10 }}>
                            <Users size={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#94A3B8' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ position: 'relative', maxWidth: 320 }}>
                        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or role..."
                            style={{ width: '100%', padding: '8px 10px 8px 32px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', outline: 'none' }}
                            onFocus={e => (e.target.style.borderColor = '#F97316')}
                            onBlur={e => (e.target.style.borderColor = '#E2E8F0')} />
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            {['Staff Member', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s: StaffMember) => (
                            <tr key={s._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `hsl(${(s.name?.charCodeAt(0) || 0) * 7 % 360},55%,70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0 }}>
                                            {s.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                                            <div style={{ fontSize: 11, color: '#94A3B8' }}>ID: {s._id?.slice(-6) || '000001'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: 13, color: '#475569' }}>{s.email}</td>
                                <td style={{ fontSize: 13, color: '#475569' }}>{s.phone || '—'}</td>
                                <td>
                                    <span style={{ background: roleColors[s.role] || '#F1F5F9', color: roleTextColors[s.role] || '#475569', padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 500 }}>
                                        {s.role}
                                    </span>
                                </td>
                                <td><StatusBadge status={s.isActive !== false ? 'active' : 'inactive'} /></td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={() => openEdit(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }} title="Edit"><Pencil size={14} /></button>
                                        <button onClick={() => deleteMut.mutate(s._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }} title="Remove"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: '10px 20px', borderTop: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 13, color: '#94A3B8' }}>Showing {filtered.length} of {allStaff.length} staff members</span>
                </div>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editStaff ? 'Edit Staff Member' : 'Add Staff Member'} width={460}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                        { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                        { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@restaurant.com' },
                        { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 5 }}>{f.label}</label>
                            <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof StaffForm]}
                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value } as StaffForm))}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }}
                                onFocus={e => (e.target.style.borderColor = '#F97316')}
                                onBlur={e => (e.target.style.borderColor = '#E2E8F0')} />
                        </div>
                    ))}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 5 }}>Role</label>
                        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8, background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                        <button onClick={() => saveMut.mutate(form)}
                            style={{ flex: 1, padding: '10px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            {editStaff ? 'Update Member' : 'Add Member'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}