import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, ImagePlus, UtensilsCrossed } from 'lucide-react';
import { menuAPI, restaurantsAPI, uploadsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { Modal, Spinner, Toggle, EmptyState } from '../../../shared/components/ui/index';
import type { MenuCategory, MenuItem } from '../../../shared/types/restaurant.types';
import toast from 'react-hot-toast';

type ItemForm = { name: string; price: string; description: string; image: string; categoryId: string };
const emptyItem: ItemForm = { name: '', price: '', description: '', image: '', categoryId: '' };

export default function MenuManagement() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const fileRef = useRef<HTMLInputElement>(null);
    const [apiRestaurantId, setApiRestaurantId] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [itemForm, setItemForm] = useState<ItemForm>(emptyItem);
    const [catName, setCatName] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user?.restaurantId) {
            restaurantsAPI.getMyRestaurant().then((r) => r.data?._id && setApiRestaurantId(r.data._id)).catch(() => undefined);
        }
    }, [user]);
    const restaurantId = user?.restaurantId?.toString() || apiRestaurantId;

    const { data: categories = [] } = useQuery<MenuCategory[]>({
        queryKey: ['menu-categories', restaurantId],
        queryFn: () => menuAPI.getCategories(restaurantId).then((r) => r.data),
        enabled: !!restaurantId,
    });

    const { data: items = [], isLoading } = useQuery<MenuItem[]>({
        queryKey: ['menu-items', restaurantId],
        queryFn: () => menuAPI.getItems(restaurantId).then((r) => r.data),
        enabled: !!restaurantId,
    });

    const toggleMut = useMutation({ mutationFn: (id: string) => menuAPI.toggleAvailability(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-items'] }) });
    const deleteMut = useMutation({ mutationFn: (id: string) => menuAPI.deleteItem(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-items'] }); toast.success('Item deleted'); } });

    const saveItemMut = useMutation({
        mutationFn: (data: ItemForm) => {
            const payload = { name: data.name, price: Number(data.price), description: data.description, image: data.image, categoryId: data.categoryId };
            return editItem ? menuAPI.updateItem(editItem._id, payload) : menuAPI.createItem(payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['menu-items'] });
            setShowItemModal(false); setEditItem(null); setItemForm(emptyItem);
            toast.success(editItem ? 'Item updated' : 'Item created');
        },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Could not save item'),
    });

    const saveCatMut = useMutation({
        mutationFn: () => menuAPI.createCategory({ name: catName }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-categories'] }); setShowCatModal(false); setCatName(''); toast.success('Category added'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Could not add category'),
    });
    const deleteCatMut = useMutation({
        mutationFn: (id: string) => menuAPI.deleteCategory(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu-categories'] }); setActiveCategory(null); toast.success('Category deleted'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Could not delete — remove its dishes first'),
    });

    const openEdit = (item: MenuItem) => {
        setEditItem(item);
        setItemForm({ name: item.name, price: item.price?.toString() || '', description: item.description || '', image: item.image || '', categoryId: item.categoryId });
        setShowItemModal(true);
    };
    const openAdd = () => {
        setEditItem(null);
        setItemForm({ ...emptyItem, categoryId: activeCategory || categories[0]?._id || '' });
        setShowItemModal(true);
    };

    const onPickImage = async (file: File) => {
        setUploading(true);
        try {
            const res = await uploadsAPI.uploadImage(file);
            setItemForm((f) => ({ ...f, image: res.data.url }));
        } catch { toast.error('Upload failed'); } finally { setUploading(false); }
    };

    const visibleItems = activeCategory ? items.filter((i) => i.categoryId === activeCategory) : items;
    const countFor = (catId: string) => items.filter((i) => i.categoryId === catId).length;

    return (
        <div className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Menu management</h1>
                    <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginTop: 2 }}>Configure your restaurant's dishes and availability.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowCatModal(true)} className="btn btn-outline btn-sm"><Plus size={14} /> Category</button>
                    <button onClick={openAdd} disabled={!categories.length} className="btn btn-primary btn-sm"><Plus size={14} /> Dish</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 20 }} className="menu-layout">
                <div className="card" style={{ padding: 10, height: 'fit-content' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-ink-mute)', letterSpacing: '0.08em', padding: '6px 8px' }}>CATEGORIES</div>
                    <div onClick={() => setActiveCategory(null)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: !activeCategory ? 'var(--color-brand-100)' : 'transparent', color: !activeCategory ? 'var(--color-brand-700)' : 'var(--color-ink-soft)' }}>
                        <span style={{ fontSize: 13.5, fontWeight: !activeCategory ? 700 : 500 }}>All dishes</span>
                        <span style={{ fontSize: 12, background: !activeCategory ? 'var(--color-brand-500)' : 'var(--color-sand)', color: !activeCategory ? '#fff' : 'var(--color-ink-soft)', padding: '1px 7px', borderRadius: 9999 }}>{items.length}</span>
                    </div>
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat._id;
                        return (
                            <div key={cat._id} onClick={() => setActiveCategory(cat._id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: isActive ? 'var(--color-brand-100)' : 'transparent', color: isActive ? 'var(--color-brand-700)' : 'var(--color-ink-soft)' }}>
                                <span style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                    <span style={{ fontSize: 12, background: isActive ? 'var(--color-brand-500)' : 'var(--color-sand)', color: isActive ? '#fff' : 'var(--color-ink-soft)', padding: '1px 7px', borderRadius: 9999 }}>{countFor(cat._id)}</span>
                                    <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete category "${cat.name}"?`)) deleteCatMut.mutate(cat._id); }} className="btn-icon" style={{ width: 20, height: 20, padding: 0, color: '#c0271b' }}><Trash2 size={11} /></button>
                                </span>
                            </div>
                        );
                    })}
                    {categories.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--color-ink-mute)', padding: 8 }}>Add a category to get started.</div>}
                </div>

                <div>
                    {isLoading ? <Spinner /> : visibleItems.length === 0 ? (
                        <EmptyState icon={<UtensilsCrossed size={40} />} title="No dishes here yet" message="Add your first dish to this category." action={categories.length ? { label: 'Add dish', onClick: openAdd } : undefined} />
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="menu-items-grid">
                            {visibleItems.map((item) => (
                                <div key={item._id} className="card" style={{ overflow: 'hidden' }}>
                                    <div style={{ position: 'relative', height: 150, background: 'var(--color-sand)' }}>
                                        {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        {item.isSoldOut && <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,19,13,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>Sold out</div>}
                                    </div>
                                    <div style={{ padding: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                                            <div style={{ color: 'var(--color-brand-600)', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>${item.price.toFixed(2)}</div>
                                        </div>
                                        <p style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 12, lineHeight: 1.5, minHeight: 32 }}>{item.description?.slice(0, 70) || 'No description'}</p>
                                        <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className={`badge ${item.isAvailable ? 'badge-green' : 'badge-gray'}`}>{item.isAvailable ? 'Available' : 'Hidden'}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <button onClick={() => openEdit(item)} className="btn-icon" style={{ width: 26, height: 26, padding: 0, color: 'var(--color-ink-soft)' }}><Pencil size={13} /></button>
                                                <button onClick={() => { if (confirm(`Delete "${item.name}"?`)) deleteMut.mutate(item._id); }} className="btn-icon" style={{ width: 26, height: 26, padding: 0, color: '#c0271b' }}><Trash2 size={13} /></button>
                                                <Toggle checked={item.isAvailable} onChange={() => toggleMut.mutate(item._id)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={showItemModal} onClose={() => setShowItemModal(false)} title={editItem ? 'Edit dish' : 'Add dish'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div onClick={() => fileRef.current?.click()} style={{ width: 84, height: 84, borderRadius: 12, background: 'var(--color-sand)', flexShrink: 0, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed var(--color-line)' }}>
                            {itemForm.image ? <img src={itemForm.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImagePlus size={22} color="#b3a89d" />}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onPickImage(e.target.files[0])} />
                        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-outline btn-sm">{uploading ? 'Uploading…' : 'Upload photo'}</button>
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <select value={itemForm.categoryId} onChange={(e) => setItemForm((f) => ({ ...f, categoryId: e.target.value }))} className="input">
                            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                        <div><label className="label">Dish name</label><input value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Signature Ribeye" className="input" /></div>
                        <div><label className="label">Price ($)</label><input type="number" min="0" step="0.01" value={itemForm.price} onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" className="input" /></div>
                    </div>
                    <div><label className="label">Description</label><textarea value={itemForm.description} onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the dish…" className="input" style={{ minHeight: 80, resize: 'vertical' }} /></div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => setShowItemModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button onClick={() => saveItemMut.mutate(itemForm)} disabled={!itemForm.name || !itemForm.price || !itemForm.categoryId || saveItemMut.isPending} className="btn btn-primary" style={{ flex: 1 }}>
                            {editItem ? 'Update dish' : 'Add dish'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title="Add category" width={400}>
                <label className="label">Category name</label>
                <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Starters" className="input" style={{ marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowCatModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={() => saveCatMut.mutate()} disabled={!catName.trim()} className="btn btn-primary" style={{ flex: 1 }}>Add category</button>
                </div>
            </Modal>
            <style>{`@media (max-width: 900px) { .menu-layout { grid-template-columns: 1fr !important; } } @media (max-width: 700px) { .menu-items-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
        </div>
    );
}
