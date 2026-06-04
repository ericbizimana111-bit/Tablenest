
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { promotionsAPI, restaurantsAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { Modal, Toggle, StatusBadge } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

export default function PromotionsPage() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [restaurantId, setRestaurantId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editPromo, setEditPromo] = useState<any>(null);
    const [form, setForm] = useState({ name: '', discountType: 'percentage', discountValue: '', startDate: '', endDate: '', applicableCategories: [] as string[] });
    const [catInput, setCatInput] = useState('');

    React.useEffect(() => {
        if (user?.restaurantId) setRestaurantId(user.restaurantId.toString());
        else restaurantsAPI.getMyRestaurant().then(r => r.data?._id && setRestaurantId(r.data._id)).catch(() => { });
    }, [user]);

    const { data: promos = [] } = useQuery({
        queryKey: ['promotions', restaurantId],
        queryFn: () => promotionsAPI.getByRestaurant(restaurantId).then(r => r.data),
        enabled: !!restaurantId,
        initialData: DEMO_PROMOS,
    });

    const saveMut = useMutation({
        mutationFn: (data: any) => editPromo
            ? promotionsAPI.update(editPromo._id, data)
            : promotionsAPI.create({ ...data, restaurantId }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }); setShowModal(false); setEditPromo(null); toast.success('Promotion saved!'); },
    });

    const toggleMut = useMutation({
        mutationFn: (id: string) => promotionsAPI.toggle(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['promotions'] }),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => promotionsAPI.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['promotions'] }); toast.success('Deleted'); },
    });

    const openEdit = (p: any) => {
        setEditPromo(p);
        setForm({ name: p.name, discountType: p.discountType, discountValue: p.discountValue, startDate: p.startDate?.slice(0, 10) || '', endDate: p.endDate?.slice(0, 10) || '', applicableCategories: p.applicableCategories || [] });
        setShowModal(true);
    };

    const addCat = () => { if (catInput.trim()) { setForm(f => ({ ...f, applicableCategories: [...f.applicableCategories, catInput.trim()] })); setCatInput(''); } };
    const removeCat = (i: number) => setForm(f => ({ ...f, applicableCategories: f.applicableCategories.filter((_, idx) => idx !== i) }));

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>Promotions & Offers</h1>
                    <p style={{ fontSize: 13, color: '#6B7280' }}>Drive more bookings with strategic culinary incentives.</p>
                </div>
                <button onClick={() => { setEditPromo(null); setForm({ name: '', discountType: 'percentage', discountValue: '', startDate: '', endDate: '', applicableCategories: [] }); setShowModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    <Plus size={14} /> Create Promotion
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {(promos.length ? promos : DEMO_PROMOS).map((p: any) => (
                    <div key={p._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                        <div style={{ background: p.isActive ? '#B91C1C' : '#9CA3AF', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Tag size={16} color="rgba(255,255,255,0.8)" />
                                <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                            </div>
                            <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 10px', borderRadius: 9999, fontSize: 13, fontWeight: 700 }}>
                                {p.discountValue}{p.discountType === 'percentage' ? '%' : '$'} OFF
                            </span>
                        </div>
                        <div style={{ padding: 16 }}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                {(p.applicableCategories || []).map((cat: string) => (
                                    <span key={cat} style={{ background: '#F3F4F6', color: '#374151', padding: '3px 10px', borderRadius: 9999, fontSize: 12 }}>{cat}</span>
                                ))}
                            </div>
                            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
                                {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'} — {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Toggle checked={p.isActive !== false} onChange={() => toggleMut.mutate(p._id)} />
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 6 }}><Pencil size={14} /></button>
                                    <button onClick={() => deleteMut.mutate(p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 6 }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editPromo ? 'Edit Promotion' : 'New Promotion'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Offer Name</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Summer Sunset Special"
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Discount Type</label>
                            <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat ($)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Discount Value</label>
                            <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder="20"
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Validity Date Range</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Applicable Menu Items</label>
                        <div style={{ border: '1.5px solid #E5E7EB', borderRadius: 8, padding: 10 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: form.applicableCategories.length ? 8 : 0 }}>
                                {form.applicableCategories.map((cat, i) => (
                                    <span key={i} style={{ background: '#F3F4F6', color: '#374151', padding: '3px 10px', borderRadius: 9999, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {cat} <button onClick={() => removeCat(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                                <button onClick={addCat} style={{ background: 'none', border: '1.5px dashed #B91C1C', borderRadius: 9999, padding: '3px 10px', fontSize: 12, color: '#B91C1C', cursor: 'pointer', fontFamily: 'Poppins' }}>+ Add Category</button>
                            </div>
                            {form.applicableCategories.length === 0 && (
                                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                    <input value={catInput} onChange={e => setCatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} placeholder="Category name..."
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13, fontFamily: 'Poppins', outline: 'none' }} />
                                    <button onClick={addCat} style={{ padding: '6px 12px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>Add</button>
                                </div>
                            )}
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Applied to all items in selected categories</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                        <button onClick={() => saveMut.mutate({ ...form, discountValue: parseFloat(form.discountValue) })}
                            style={{ flex: 1, padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            {editPromo ? 'Update Offer' : 'Create Offer'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

const DEMO_PROMOS = [
    { _id: '1', name: 'Weekend Brunch Special', discountType: 'percentage', discountValue: 20, isActive: true, applicableCategories: ['Mains', 'Drinks'], startDate: '2024-11-01', endDate: '2024-11-30' },
    { _id: '2', name: 'Happy Hour', discountType: 'percentage', discountValue: 15, isActive: true, applicableCategories: ['Drinks', 'Starters'], startDate: '2024-11-01', endDate: '2024-12-31' },
    { _id: '3', name: 'Loyalty Discount', discountType: 'flat', discountValue: 10, isActive: false, applicableCategories: ['All Items'], startDate: '2024-10-01', endDate: '2024-10-31' },
];
