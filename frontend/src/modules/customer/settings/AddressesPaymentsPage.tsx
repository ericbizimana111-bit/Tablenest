import React, { useState } from 'react';
import { Home, Briefcase, Plus, Pencil, Trash2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
// Re-export from the existing AddressesPaymentsPage (plural)
// This file exists to match the spec's folder structure which uses 'AddressesPaymentPage'



type DisplayAddress = {
    id: string;
    label: string;
    icon: 'home' | 'work' | 'other';
    address: string;
    city: string;
    country: string;
    isDefault: boolean;
};

type DisplayCard = {
    id: string;
    last4: string;
    holder: string;
    expiry: string;
    brand: 'Visa' | 'Mastercard' | 'Amex' | 'Card';
    isPrimary: boolean;
};

type AddressForm = { label: string; street: string; apt: string; city: string; postalCode: string };

type CardForm = { number: string; name: string; expiry: string; cvv: string; zip: string };




export default function AddressesPaymentsPage() {
    const [addresses, setAddresses] = useState<DisplayAddress[]>([]);
    const [cards, setCards] = useState<DisplayCard[]>([]);
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [addrForm, setAddrForm] = useState<AddressForm>({ label: '', street: '', apt: '', city: '', postalCode: '' });
    const [cardForm, setCardForm] = useState<CardForm>({ number: '', name: '', expiry: '', cvv: '', zip: '' });

    const addAddress = () => {
        setAddresses(a => [...a, { id: Date.now().toString(), label: addrForm.label, icon: 'home', address: `${addrForm.street}${addrForm.apt ? ', ' + addrForm.apt : ''}`, city: `${addrForm.city} ${addrForm.postalCode}`, country: 'United States', isDefault: false }]);
        setAddrForm({ label: '', street: '', apt: '', city: '', postalCode: '' });
        setShowAddrForm(false);
        toast.success('Address saved!');
    };

    const addCard = () => {
        setCards(c => [...c, { id: Date.now().toString(), last4: cardForm.number.slice(-4) || '0000', holder: cardForm.name.toUpperCase(), expiry: cardForm.expiry, brand: 'Card', isPrimary: false }]);
        setCardForm({ number: '', name: '', expiry: '', cvv: '', zip: '' });
        setShowCardForm(false);
        toast.success('Card added!');
    };

    const setPrimary = (id: string) => setCards(c => c.map(card => ({ ...card, isPrimary: card.id === id })));
    const setDefaultAddr = (id: string) => setAddresses(a => a.map(addr => ({ ...addr, isDefault: addr.id === id })));

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Addresses & Payments</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Manage your delivery locations and payment methods.</p>
            </div>

            {/* Saved Addresses */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Saved Addresses</h2>
                        <p style={{ fontSize: 13, color: '#6B7280' }}>Manage your delivery and billing locations.</p>
                    </div>
                    <button onClick={() => setShowAddrForm(!showAddrForm)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Plus size={14} /> Add New Address
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: showAddrForm ? 14 : 0 }}>
                    {addresses.map(addr => (
                        <div key={addr.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {addr.icon === 'home' ? <Home size={16} color="#B91C1C" /> : <Briefcase size={16} color="#B91C1C" />}
                                    <span style={{ fontWeight: 700, fontSize: 15 }}>{addr.label}</span>
                                    {addr.isDefault && <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999 }}>DEFAULT</span>}
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><Pencil size={14} /></button>
                                    <button onClick={() => setAddresses(a => a.filter(x => x.id !== addr.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div style={{ fontSize: 14, color: '#374151', marginBottom: 2 }}>{addr.address}</div>
                            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 2 }}>{addr.city}</div>
                            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>{addr.country}</div>
                            {!addr.isDefault && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                                    <input type="checkbox" checked={addr.isDefault} onChange={() => setDefaultAddr(addr.id)} style={{ accentColor: '#B91C1C' }} />
                                    Set as default
                                </label>
                            )}
                        </div>
                    ))}
                </div>

                {showAddrForm && (
                    <div style={{ background: 'white', borderRadius: 12, border: '2px dashed #E5E7EB', padding: 24, marginTop: 14 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#B91C1C', marginBottom: 16 }}>New Address</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Label (e.g. Home, Office)</label>
                                <input value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))} placeholder="Gym, Parents House..."
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Street Address</label>
                                <input value={addrForm.street} onChange={e => setAddrForm(f => ({ ...f, street: e.target.value }))} placeholder="123 Main St"
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Apt / Suite</label>
                                <input value={addrForm.apt} onChange={e => setAddrForm(f => ({ ...f, apt: e.target.value }))} placeholder="Apt 4C"
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>City</label>
                                <input value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} placeholder="New York"
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Postal Code</label>
                                <input value={addrForm.postalCode} onChange={e => setAddrForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="10001"
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowAddrForm(false)} style={{ padding: '9px 18px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                            <button onClick={addAddress} style={{ padding: '9px 18px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>Save Address</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Methods */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Payment Methods</h2>
                        <p style={{ fontSize: 13, color: '#6B7280' }}>Securely manage your saved credit and debit cards.</p>
                    </div>
                    <button onClick={() => setShowCardForm(!showCardForm)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Plus size={14} /> Add Payment Method
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: showCardForm ? 14 : 0 }}>
                    {cards.map(card => (
                        <div key={card.id} style={{ borderRadius: 12, border: '1px solid #E5E7EB', padding: 18, background: card.isPrimary ? '#1F1F1F' : 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: card.isPrimary ? '#9CA3AF' : '#6B7280', letterSpacing: '0.08em' }}>
                                    {card.isPrimary ? 'PRIMARY CARD' : card.brand}
                                </span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: card.isPrimary ? '#6B7280' : '#6B7280', padding: 4 }}><Pencil size={14} /></button>
                                    <button onClick={() => setCards(c => c.filter(x => x.id !== card.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <CreditCard size={20} color={card.isPrimary ? 'white' : '#374151'} />
                                <span style={{ fontWeight: 600, fontSize: 16, color: card.isPrimary ? 'white' : '#111827', letterSpacing: '0.1em' }}>
                                    ···· {card.last4}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: card.isPrimary ? '#9CA3AF' : '#9CA3AF', marginBottom: 2 }}>Card Holder</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: card.isPrimary ? 'white' : '#111827', letterSpacing: '0.05em' }}>{card.holder}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: card.isPrimary ? '#9CA3AF' : '#9CA3AF', marginBottom: 2 }}>Expires</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: card.isPrimary ? 'white' : '#111827' }}>{card.expiry}</div>
                                </div>
                            </div>
                            {!card.isPrimary && (
                                <button onClick={() => setPrimary(card.id)} style={{ marginTop: 12, width: '100%', padding: '6px', border: 'none', background: 'none', color: '#B91C1C', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                                    Set as primary
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {showCardForm && (
                    <div style={{ background: 'white', borderRadius: 12, border: '2px dashed #E5E7EB', padding: 24, marginTop: 14 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#B91C1C', marginBottom: 16 }}>Add Payment Method</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Card Number</label>
                                <div style={{ position: 'relative' }}>
                                    <CreditCard size={15} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input value={cardForm.number} onChange={e => setCardForm(f => ({ ...f, number: e.target.value }))} placeholder="0000 0000 0000 0000" maxLength={19}
                                        style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Cardholder Name</label>
                                <input value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name"
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                            {([
                                { label: 'Expiry Date', key: 'expiry', placeholder: 'MM/YY' },
                                { label: 'CVV', key: 'cvv', placeholder: '***' },
                                { label: 'Billing ZIP', key: 'zip', placeholder: '10001' },
                            ] as Array<{ label: string; key: keyof CardForm; placeholder: string }>).map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                                    <input value={cardForm[f.key]} onChange={e => setCardForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowCardForm(false)} style={{ padding: '9px 18px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                            <button onClick={addCard} style={{ padding: '9px 18px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>Add Card</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}