import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { inventoryAPI, restaurantsAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { Modal } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

export default function InventoryManagement() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [restaurantId, setRestaurantId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [form, setForm] = useState({ name: '', unit: 'units', quantity: '', minQuantity: '', supplier: '', cost: '' });

    React.useEffect(() => {
        if (user?.restaurantId) setRestaurantId(user.restaurantId.toString());
        else restaurantsAPI.getMyRestaurant().then(r => r.data?._id && setRestaurantId(r.data._id)).catch(() => { });
    }, [user]);

    const { data: items = [] } = useQuery({
        queryKey: ['inventory', restaurantId],
        queryFn: () => inventoryAPI.getByRestaurant(restaurantId).then(r => r.data),
        enabled: !!restaurantId,
        initialData: DEMO_INVENTORY,
    });

    const saveMut = useMutation({
        mutationFn: (data: any) => editItem ? inventoryAPI.update(editItem._id, data) : inventoryAPI.create({ ...data, restaurantId }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setShowModal(false); toast.success(editItem ? 'Updated' : 'Item added'); },
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => inventoryAPI.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Item removed'); },
    });

    const openEdit = (item: any) => {
        setEditItem(item);
        setForm({ name: item.name, unit: item.unit, quantity: item.quantity, minQuantity: item.minQuantity, supplier: item.supplier || '', cost: item.cost || '' });
        setShowModal(true);
    };

    const allItems = items.length ? items : DEMO_INVENTORY;
    const lowStock = allItems.filter((i: any) => i.quantity <= i.minQuantity);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>Inventory Management</h1>
                    <p style={{ fontSize: 13, color: '#6B7280' }}>Track stock levels and manage suppliers.</p>
                </div>
                <button onClick={() => { setEditItem(null); setForm({ name: '', unit: 'units', quantity: '', minQuantity: '', supplier: '', cost: '' }); setShowModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    <Plus size={14} /> Add Item
                </button>
            </div>

            {lowStock.length > 0 && (
                <div style={{ background: '#FEF3C7', border: '1px solid #D97706', borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={18} color="#D97706" />
                    <span style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>{lowStock.length} items are running low on stock</span>
                </div>
            )}

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <table className="data-table">
                    <thead><tr>{['Item Name', 'Unit', 'Quantity', 'Min. Stock', 'Supplier', 'Cost/Unit', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                        {allItems.map((item: any) => {
                            const isLow = item.quantity <= item.minQuantity;
                            return (
                                <tr key={item._id}>
                                    <td style={{ fontWeight: 500, fontSize: 13 }}>{item.name}</td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{item.unit}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: isLow ? '#DC2626' : '#111827' }}>{item.quantity}</span>
                                            {isLow && <AlertTriangle size={13} color="#DC2626" />}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{item.minQuantity}</td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{item.supplier || '—'}</td>
                                    <td style={{ fontSize: 13 }}>{item.cost ? `$${item.cost}` : '—'}</td>
                                    <td>
                                        <span style={{ background: isLow ? '#FEE2E2' : '#DCFCE7', color: isLow ? '#DC2626' : '#16A34A', padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 500 }}>
                                            {isLow ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><Pencil size={14} /></button>
                                            <button onClick={() => deleteMut.mutate(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Item' : 'Add Inventory Item'} width={460}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                        { label: 'Item Name', key: 'name', placeholder: 'e.g. Truffle Oil' },
                        { label: 'Supplier', key: 'supplier', placeholder: 'Supplier name' },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                            <input placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                        </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        {[
                            { label: 'Quantity', key: 'quantity', placeholder: '0' },
                            { label: 'Min. Qty', key: 'minQuantity', placeholder: '5' },
                            { label: 'Cost', key: 'cost', placeholder: '0.00' },
                        ].map(f => (
                            <div key={f.key}>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                                <input type="number" placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Unit</label>
                        <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', background: 'white' }}>
                            {['units', 'kg', 'g', 'L', 'ml', 'bottles', 'packs', 'boxes'].map(u => <option key={u}>{u}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                        <button onClick={() => saveMut.mutate({ ...form, quantity: +form.quantity, minQuantity: +form.minQuantity, cost: +form.cost })}
                            style={{ flex: 1, padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            {editItem ? 'Update' : 'Add Item'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

const DEMO_INVENTORY = [
    { _id: '1', name: 'Truffle Oil', unit: 'bottles', quantity: 8, minQuantity: 5, supplier: 'Gourmet Imports', cost: 24.50 },
    { _id: '2', name: 'Wagyu Beef', unit: 'kg', quantity: 3, minQuantity: 5, supplier: 'Premium Meats Co.', cost: 85.00 },
    { _id: '3', name: 'Bordeaux Wine', unit: 'bottles', quantity: 24, minQuantity: 12, supplier: 'Wine Direct', cost: 45.00 },
    { _id: '4', name: 'Truffle (Black)', unit: 'g', quantity: 200, minQuantity: 100, supplier: 'Truffle House', cost: 8.50 },
    { _id: '5', name: 'Lobster (Live)', unit: 'units', quantity: 2, minQuantity: 6, supplier: 'Ocean Fresh', cost: 32.00 },
];
