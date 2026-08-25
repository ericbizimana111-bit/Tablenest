import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { inventoryAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { Modal } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

interface InventoryItem {
    _id: string;
    name: string;
    unit: string;
    quantity: number;
    minQuantity: number;
    supplier?: string;
    cost?: number;
}

interface InventoryForm {
    name: string;
    unit: string;
    quantity: string;
    minQuantity: string;
    supplier: string;
    cost: string;
}

export default function InventoryManagement() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [form, setForm] = useState<InventoryForm>({ name: '', unit: 'units', quantity: '', minQuantity: '', supplier: '', cost: '' });

    const { data: myRestaurant } = useQuery({
        queryKey: ['my-restaurant'],
        queryFn: () => restaurantsAPI.getMyRestaurant().then(r => r.data),
        enabled: !user?.restaurantId,
    });

    const restaurantId = user?.restaurantId?.toString() || myRestaurant?._id || '';

    const { data: items = [] } = useQuery<InventoryItem[]>({
        queryKey: ['inventory', restaurantId],
        queryFn: () => inventoryAPI.getByRestaurant(restaurantId).then(r => r.data),
        enabled: !!restaurantId,
    });

    const saveMut = useMutation({
        mutationFn: (data: InventoryForm) => {
            const payload = {
                name: data.name,
                unit: data.unit,
                quantity: Number(data.quantity),
                minQuantity: Number(data.minQuantity),
                supplier: data.supplier,
                cost: Number(data.cost) || 0,
            };
            return editItem ? inventoryAPI.update(editItem._id, payload) : inventoryAPI.create({ ...payload, restaurantId });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inventory', restaurantId] });
            setShowModal(false);
            toast.success(editItem ? 'Updated' : 'Item added');
        },
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => inventoryAPI.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inventory', restaurantId] });
            toast.success('Item removed');
        },
    });

    const setFormField = <K extends keyof InventoryForm>(key: K, value: InventoryForm[K]) => setForm(prev => ({ ...prev, [key]: value }));

    const openEdit = (item: InventoryItem) => {
        setEditItem(item);
        setForm({
            name: item.name,
            unit: item.unit,
            quantity: item.quantity.toString(),
            minQuantity: item.minQuantity.toString(),
            supplier: item.supplier || '',
            cost: item.cost?.toString() || '',
        });
        setShowModal(true);
    };

    const allItems = items.length ? items : [];
    const lowStock = allItems.filter(i => i.quantity <= i.minQuantity);

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
                        {allItems.map((item: InventoryItem) => {
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
                    {([
                        { label: 'Item Name', key: 'name', placeholder: 'e.g. Truffle Oil' },
                        { label: 'Supplier', key: 'supplier', placeholder: 'Supplier name' },
                    ] as const).map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                            <input placeholder={f.placeholder} value={form[f.key]}
                                onChange={e => setFormField(f.key, e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                        </div>
                    ))}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        {([
                            { label: 'Quantity', key: 'quantity' as const, placeholder: '0' },
                            { label: 'Min. Qty', key: 'minQuantity' as const, placeholder: '5' },
                            { label: 'Cost', key: 'cost' as const, placeholder: '0.00' },
                        ]).map((f) => (
                            <div key={f.key}>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                                <input type="number" placeholder={f.placeholder} value={form[f.key]} onChange={e => setFormField(f.key, e.target.value)}
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
                        <button onClick={() => saveMut.mutate(form)}
                            style={{ flex: 1, padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            {editItem ? 'Update' : 'Add Item'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

