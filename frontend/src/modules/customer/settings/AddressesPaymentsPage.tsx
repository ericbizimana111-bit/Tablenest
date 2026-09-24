import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Home, Plus, Trash2, CreditCard, Star } from 'lucide-react';
import { usersAPI } from '../../../shared/services/api';
import { Spinner } from '../../../shared/components/ui/index';
import type { Address, PaymentMethod } from '../../../shared/types/user.types';
import toast from 'react-hot-toast';

type AddressForm = { label: string; street: string; city: string; state: string; zip: string; isDefault: boolean };
type CardForm = { number: string; expiry: string; isDefault: boolean };

const emptyAddr: AddressForm = { label: 'Home', street: '', city: '', state: '', zip: '', isDefault: false };
const emptyCard: CardForm = { number: '', expiry: '', isDefault: false };

export default function AddressesPaymentsPage() {
    const qc = useQueryClient();
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [addrForm, setAddrForm] = useState<AddressForm>(emptyAddr);
    const [cardForm, setCardForm] = useState<CardForm>(emptyCard);

    const { data: addrData, isLoading: loadingAddr } = useQuery<{ addresses: Address[] }>({ queryKey: ['addresses'], queryFn: () => usersAPI.getAddresses().then((r) => r.data) });
    const { data: cardData, isLoading: loadingCards } = useQuery<{ paymentMethods: PaymentMethod[] }>({ queryKey: ['payment-methods'], queryFn: () => usersAPI.getPaymentMethods().then((r) => r.data) });
    const addresses = addrData?.addresses || [];
    const cards = cardData?.paymentMethods || [];

    const addAddrMut = useMutation({
        mutationFn: () => usersAPI.addAddress(addrForm),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); setAddrForm(emptyAddr); setShowAddrForm(false); toast.success('Address saved'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Could not save address'),
    });
    const setDefaultAddrMut = useMutation({
        mutationFn: (i: number) => usersAPI.setDefaultAddress(i),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
    });
    const deleteAddrMut = useMutation({
        mutationFn: (i: number) => usersAPI.deleteAddress(i),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address removed'); },
    });

    const addCardMut = useMutation({
        mutationFn: () => {
            const [expiryMonth, expiryYear] = cardForm.expiry.split('/').map((s) => s.trim());
            return usersAPI.addPaymentMethod({ cardNumber: cardForm.number.replace(/\s/g, ''), expiryMonth, expiryYear, isDefault: cardForm.isDefault });
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['payment-methods'] }); setCardForm(emptyCard); setShowCardForm(false); toast.success('Card added'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Could not add card'),
    });
    const deleteCardMut = useMutation({
        mutationFn: (i: number) => usersAPI.deletePaymentMethod(i),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['payment-methods'] }); toast.success('Card removed'); },
    });
    const setDefaultCardMut = useMutation({
        mutationFn: (i: number) => usersAPI.setDefaultPaymentMethod(i),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-methods'] }),
    });

    return (
        <div className="animate-fade-up">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Addresses & payments</h1>
                <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginTop: 2 }}>Manage your delivery locations and payment methods.</p>
            </div>

            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Saved addresses</h2>
                    <button onClick={() => setShowAddrForm((s) => !s)} className="btn btn-primary btn-sm"><Plus size={14} /> Add address</button>
                </div>

                {loadingAddr ? <Spinner /> : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="two-col">
                        {addresses.map((addr, i) => (
                            <div key={i} className="card" style={{ padding: 18 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Home size={16} color="var(--color-brand-500)" />
                                        <span style={{ fontWeight: 700, fontSize: 15 }}>{addr.label}</span>
                                        {addr.isDefault && <span className="badge badge-green">Default</span>}
                                    </div>
                                    <button onClick={() => deleteAddrMut.mutate(i)} className="btn-icon" style={{ color: '#c0271b' }}><Trash2 size={14} /></button>
                                </div>
                                <div style={{ fontSize: 13.5, color: 'var(--color-ink-soft)', marginBottom: 12 }}>{addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip}</div>
                                {!addr.isDefault && (
                                    <button onClick={() => setDefaultAddrMut.mutate(i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-brand-600)', padding: 0 }}>Set as default</button>
                                )}
                            </div>
                        ))}
                        {addresses.length === 0 && !showAddrForm && <div style={{ color: 'var(--color-ink-mute)', fontSize: 13.5 }}>No saved addresses yet.</div>}
                    </div>
                )}

                {showAddrForm && (
                    <div className="card" style={{ padding: 22, marginTop: 14, border: '2px dashed var(--color-brand-300)' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-brand-600)', marginBottom: 14 }}>New address</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div><label className="label">Label</label><input value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} placeholder="Home, Office…" className="input" /></div>
                            <div><label className="label">Street address</label><input value={addrForm.street} onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))} placeholder="123 Main St" className="input" /></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div><label className="label">City</label><input value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} className="input" /></div>
                            <div><label className="label">State</label><input value={addrForm.state} onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))} className="input" /></div>
                            <div><label className="label">ZIP</label><input value={addrForm.zip} onChange={(e) => setAddrForm((f) => ({ ...f, zip: e.target.value }))} className="input" /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowAddrForm(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={() => addAddrMut.mutate()} disabled={!addrForm.street || !addrForm.city || addAddrMut.isPending} className="btn btn-primary">{addAddrMut.isPending ? 'Saving…' : 'Save address'}</button>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Payment methods</h2>
                    <button onClick={() => setShowCardForm((s) => !s)} className="btn btn-primary btn-sm"><Plus size={14} /> Add card</button>
                </div>

                {loadingCards ? <Spinner /> : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="two-col">
                        {cards.map((card, i) => (
                            <div key={i} className="card" style={{ padding: 18, background: card.isDefault ? 'var(--color-ink)' : '#fff', color: card.isDefault ? '#fff' : 'inherit' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.8 }}>{card.isDefault ? 'DEFAULT CARD' : card.brand.toUpperCase()}</span>
                                    <button onClick={() => deleteCardMut.mutate(i)} className="btn-icon" style={{ color: card.isDefault ? '#fff' : '#c0271b' }}><Trash2 size={14} /></button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <CreditCard size={20} />
                                    <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.1em' }}>···· {card.last4}</span>
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.75 }}>Expires {card.expiryMonth}/{card.expiryYear}</div>
                                {!card.isDefault && (
                                    <button onClick={() => setDefaultCardMut.mutate(i)} className="btn btn-ghost btn-sm" style={{ marginTop: 10, padding: 0, color: 'var(--color-brand-600)' }}>
                                        <Star size={12} /> Set as default
                                    </button>
                                )}
                            </div>
                        ))}
                        {cards.length === 0 && !showCardForm && <div style={{ color: 'var(--color-ink-mute)', fontSize: 13.5 }}>No saved cards yet.</div>}
                    </div>
                )}

                {showCardForm && (
                    <div className="card" style={{ padding: 22, marginTop: 14, border: '2px dashed var(--color-brand-300)' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-brand-600)', marginBottom: 14 }}>Add card</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                                <label className="label">Card number</label>
                                <input value={cardForm.number} onChange={(e) => setCardForm((f) => ({ ...f, number: e.target.value }))} placeholder="4242 4242 4242 4242" maxLength={19} className="input" />
                            </div>
                            <div>
                                <label className="label">Expiry (MM/YY)</label>
                                <input value={cardForm.expiry} onChange={(e) => setCardForm((f) => ({ ...f, expiry: e.target.value }))} placeholder="12/28" maxLength={5} className="input" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowCardForm(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={() => addCardMut.mutate()} disabled={cardForm.number.length < 12 || !cardForm.expiry.includes('/') || addCardMut.isPending} className="btn btn-primary">{addCardMut.isPending ? 'Adding…' : 'Add card'}</button>
                        </div>
                        <p style={{ fontSize: 11.5, color: 'var(--color-ink-mute)', marginTop: 10 }}>Only the card brand and last 4 digits are stored — never the full number.</p>
                    </div>
                )}
            </div>
            <style>{`@media (max-width: 700px) { .two-col { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}
