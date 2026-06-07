import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { menuAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { Modal, Spinner, Toggle } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

type MenuCategory = { _id: string; name: string; count?: number };
type MenuItem = { _id: string; name: string; price?: string | number; description?: string; image?: string; categoryId?: string; isSoldOut?: boolean };
type ItemForm = { name: string; price: string; description: string; image: string };

export default function MenuManagement() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [apiRestaurantId, setApiRestaurantId] = useState('');
    const [activeCategory, setActiveCategory] = useState<MenuCategory | null>(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [itemForm, setItemForm] = useState<ItemForm>({ name: '', price: '', description: '', image: '' });
    const [catName, setCatName] = useState('');
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

    const { data: categories = [] } = useQuery({
        queryKey: ['menu-categories', restaurantId],
        queryFn: () => menuAPI.getCategories(restaurantId).then(r => r.data),
        enabled: !!restaurantId,
    });

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['menu-items', restaurantId, activeCategory?._id],
        queryFn: () => menuAPI.getItems(restaurantId, activeCategory?._id).then(r => r.data),
        enabled: !!restaurantId,
    });

    const toggleMut = useMutation({
        mutationFn: (id: string) => menuAPI.toggleAvailability(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-items'] }),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => menuAPI.deleteItem(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-items'] }); toast.success('Item deleted'); },
    });

    const saveItemMut = useMutation({
        mutationFn: (data: ItemForm) => editItem
            ? menuAPI.updateItem(editItem._id, data)
            : menuAPI.createItem({ ...data, restaurantId, categoryId: activeCategory?._id }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['menu-items'] });
            setShowItemModal(false);
            setEditItem(null);
            setItemForm({ name: '', price: '', description: '', image: '' });
            toast.success(editItem ? 'Item updated' : 'Item created');
        },
    });

    const saveCatMut = useMutation({
        mutationFn: () => menuAPI.createCategory({ name: catName, restaurantId }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-categories'] }); setShowCatModal(false); setCatName(''); toast.success('Category added'); },
    });

    const openEdit = (item: MenuItem) => {
        setEditItem(item);
        setItemForm({ name: item.name, price: item.price?.toString() || '', description: item.description || '', image: item.image || '' });
        setShowItemModal(true);
    };

    const allItems = (items.length ? items : DEMO_ITEMS).filter((i: MenuItem) =>
        !activeCategory || i.categoryId === activeCategory._id || !activeCategory._id
    );
    const allCategories = categories.length ? categories : DEMO_CATS;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Menu Management</h1>
                    <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Configure your restaurant's offerings and availability.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowCatModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                        + Add Category
                    </button>
                    <button onClick={() => { setEditItem(null); setItemForm({ name: '', price: '', description: '', image: '' }); setShowItemModal(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        + Add Item
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
                {/* Category sidebar */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 12, height: 'fit-content' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', padding: '4px 8px', marginBottom: 6 }}>CATEGORIES</div>
                    {allCategories.map((cat: MenuCategory) => {
                        const count = DEMO_ITEMS.filter(i => i.categoryId === cat._id).length || cat.count || 0;
                        const isActive = activeCategory?._id === cat._id || (!activeCategory && cat._id === allCategories[0]?._id);
                        return (
                            <div key={cat._id} onClick={() => setActiveCategory(isActive ? null : cat)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: isActive ? '#FEE2E2' : 'transparent', color: isActive ? '#B91C1C' : '#374151' }}>
                                <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{cat.name}</span>
                                <span style={{ fontSize: 12, background: isActive ? '#B91C1C' : '#F3F4F6', color: isActive ? 'white' : '#6B7280', padding: '1px 7px', borderRadius: 9999 }}>{count || 12}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Items grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                    {isLoading ? <Spinner /> : (
                        (allItems.length ? allItems : DEMO_ITEMS).map((item: MenuItem) => (
                            <div key={item._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                <div style={{ position: 'relative' }}>
                                    <img src={item.image || `https://images.unsplash.com/photo-${FOOD_IMGS[item.name?.charCodeAt(0) % FOOD_IMGS.length]}?w=400&q=80`}
                                        alt={item.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                    {item.isSoldOut && (
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>Sold Out</div>
                                    )}
                                </div>
                                <div style={{ padding: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                                        <div style={{ color: '#B91C1C', fontWeight: 700, fontSize: 15 }}>${item.price}</div>
                                    </div>
                                    <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12, lineHeight: 1.5 }}>{item.description?.slice(0, 60) || 'Fresh seasonal ingredients...'}...</p>
                                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.isAvailable !== false ? '#16A34A' : '#DC2626' }} />
                                            <span style={{ fontSize: 12, color: item.isAvailable !== false ? '#16A34A' : '#DC2626' }}>
                                                {item.isAvailable !== false ? 'Available' : 'Unavailable'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><Pencil size={14} /></button>
                                            <button onClick={() => deleteMut.mutate(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}><Trash2 size={14} /></button>
                                            <Toggle checked={item.isAvailable !== false} onChange={() => toggleMut.mutate(item._id)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add/Edit Item Modal */}
            <Modal isOpen={showItemModal} onClose={() => setShowItemModal(false)} title={editItem ? 'Edit Menu Item' : 'Add Menu Item'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                        { label: 'Item Name', key: 'name', type: 'text', placeholder: 'e.g. Signature Ribeye' },
                        { label: 'Price ($)', key: 'price', type: 'number', placeholder: '0.00' },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
                            <input type={f.type} placeholder={f.placeholder} value={itemForm[f.key as keyof ItemForm]} onChange={e => setItemForm(p => ({ ...p, [f.key]: e.target.value } as ItemForm))}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                        </div>
                    ))}
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Description</label>
                        <textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the dish..."
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', minHeight: 80, resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>Image URL</label>
                        <input type="text" placeholder="https://..." value={itemForm.image} onChange={e => setItemForm(p => ({ ...p, image: e.target.value }))}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => setShowItemModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                        <button onClick={() => saveItemMut.mutate({ ...itemForm, price: parseFloat(itemForm.price) })}
                            style={{ flex: 1, padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            {editItem ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Category Modal */}
            <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title="Add Category" width={400}>
                <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Category Name</label>
                    <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Starters"
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none', marginBottom: 16 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setShowCatModal(false)} style={{ flex: 1, padding: '9px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', fontFamily: 'Poppins', fontSize: 13 }}>Cancel</button>
                        <button onClick={() => saveCatMut.mutate()} style={{ flex: 1, padding: '9px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', fontSize: 13 }}>Add Category</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

const DEMO_CATS = [
    { _id: '1', name: 'Mains', count: 12 }, { _id: '2', name: 'Starters', count: 8 },
    { _id: '3', name: 'Desserts', count: 6 }, { _id: '4', name: 'Drinks', count: 15 }, { _id: '5', name: 'Sides', count: 4 },
];
const FOOD_IMGS = ['1546069901-ba9599a7e63c', '1555396273-367ea4eb4db5', '1414235077428-338989a2e8c0', '1579871494447-9811cf80d66c'];
const DEMO_ITEMS = [
    { _id: '1', categoryId: '1', name: 'Signature Ribeye', price: 42.00, description: '30-day aged grass-fed beef served with roasted vegetables', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', isAvailable: true },
    { _id: '2', categoryId: '1', name: 'Truffle Linguine', price: 28.00, description: 'Hand-crafted pasta with black summer truffles', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', isAvailable: true },
    { _id: '3', categoryId: '1', name: 'Atlantic Salmon', price: 34.00, description: 'Pan-seared wild salmon with asparagus spears', image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&q=80', isAvailable: false, isSoldOut: true },
    { _id: '4', categoryId: '1', name: 'Margherita Pizza', price: 22.00, description: 'San Marzano tomatoes, buffalo mozzarella, fresh basil', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', isAvailable: true },
];