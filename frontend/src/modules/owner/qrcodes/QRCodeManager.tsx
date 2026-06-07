import React, { useState } from 'react';
import { tablesAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { Download, Printer, RefreshCw, Plus } from 'lucide-react';
import { Toggle } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

type TableInfo = { _id?: string; tableNumber?: string; number?: string; isActive?: boolean; capacity?: number };

const COLORS = ['#B91C1C', '#1F1F1F', '#92400E', '#C2410C'];

export default function QRCodeManager() {
    const { user } = useAuthStore();
    const [apiRestaurantId, setApiRestaurantId] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#B91C1C');
    const [outputSize, setOutputSize] = useState('Standard (1024 × 1024 px)');
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

    const { data: tables = [] } = useQuery({
        queryKey: ['tables-qr', restaurantId],
        queryFn: () => tablesAPI.getByRestaurant(restaurantId).then(r => r.data),
        enabled: !!restaurantId,
        initialData: DEMO_TABLES,
    });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 20, height: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            {Array(4).fill(0).map((_, i) => <div key={i} style={{ background: '#B91C1C', borderRadius: 1 }} />)}
                        </div>
                        <h1 style={{ fontSize: 20, fontWeight: 700 }}>QR Code Manager</h1>
                    </div>
                    <p style={{ fontSize: 13, color: '#6B7280' }}>Manage and customize contactless ordering for your dining floor.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => toast.success('Printing all...')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Printer size={13} /> Print All
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Download size={13} /> Export ZIP
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Plus size={13} /> New Table
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
                <div>
                    {/* Promo banner */}
                    <div style={{ background: '#B91C1C', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                        <div style={{ maxWidth: 400 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Boost Operational Efficiency</div>
                            <p style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>Our intelligent QR system doesn't just open a menu—it tracks table dwell time, streamlines peak-hour ordering, and reduces server workload by up to 30%.</p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button style={{ padding: '7px 14px', background: 'white', color: '#B91C1C', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>View Analytics</button>
                                <button style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>Tutorial Video</button>
                            </div>
                        </div>
                        <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg viewBox="0 0 60 60" width="60" height="60" fill="rgba(255,255,255,0.6)">
                                <rect x="5" y="5" width="20" height="20" rx="2" /><rect x="35" y="5" width="20" height="20" rx="2" />
                                <rect x="5" y="35" width="20" height="20" rx="2" />
                                <rect x="10" y="10" width="10" height="10" fill="rgba(185,28,28,0.8)" />
                                <rect x="40" y="10" width="10" height="10" fill="rgba(185,28,28,0.8)" />
                                <rect x="10" y="40" width="10" height="10" fill="rgba(185,28,28,0.8)" />
                                <rect x="35" y="35" width="5" height="5" /><rect x="43" y="35" width="5" height="5" />
                                <rect x="35" y="43" width="5" height="5" /><rect x="43" y="43" width="5" height="5" />
                            </svg>
                        </div>
                    </div>

                    {/* Table QR grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                        {(tables.length ? tables : DEMO_TABLES).map((t: TableInfo) => (
                            <div key={t._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>T-{t.tableNumber || t.number}</span>
                                    <Toggle checked={t.isActive !== false} onChange={() => { }} />
                                </div>
                                <div style={{ aspect: '1/1', background: '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                    <svg viewBox="0 0 80 80" width="64" height="64">
                                        <rect x="5" y="5" width="30" height="30" rx="3" fill={t.isActive !== false ? primaryColor : '#9CA3AF'} opacity="0.8" />
                                        <rect x="45" y="5" width="30" height="30" rx="3" fill={t.isActive !== false ? primaryColor : '#9CA3AF'} opacity="0.8" />
                                        <rect x="5" y="45" width="30" height="30" rx="3" fill={t.isActive !== false ? primaryColor : '#9CA3AF'} opacity="0.8" />
                                        <rect x="12" y="12" width="16" height="16" fill="white" />
                                        <rect x="52" y="12" width="16" height="16" fill="white" />
                                        <rect x="12" y="52" width="16" height="16" fill="white" />
                                        {t.isActive !== false && <>
                                            <rect x="45" y="45" width="8" height="8" fill={primaryColor} />
                                            <rect x="57" y="45" width="8" height="8" fill={primaryColor} />
                                            <rect x="45" y="57" width="8" height="8" fill={primaryColor} />
                                            <rect x="57" y="57" width="8" height="8" fill={primaryColor} />
                                        </>}
                                    </svg>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 11, color: '#9CA3AF' }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#6B7280', fontFamily: 'Poppins', fontSize: 10 }}>
                                        <Download size={13} /> DL
                                    </button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#6B7280', fontFamily: 'Poppins', fontSize: 10 }}>
                                        <Printer size={13} /> PRINT
                                    </button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#6B7280', fontFamily: 'Poppins', fontSize: 10 }}>
                                        <RefreshCw size={13} /> NEW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customization panel */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>🎨 Customization</div>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>Live Preview</div>
                    <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 20, textAlign: 'center', marginBottom: 16 }}>
                        <svg viewBox="0 0 100 100" width="80" height="80" style={{ margin: '0 auto 8px' }}>
                            <rect x="5" y="5" width="38" height="38" rx="4" fill={primaryColor} />
                            <rect x="57" y="5" width="38" height="38" rx="4" fill={primaryColor} />
                            <rect x="5" y="57" width="38" height="38" rx="4" fill={primaryColor} />
                            <rect x="14" y="14" width="20" height="20" fill="white" />
                            <rect x="66" y="14" width="20" height="20" fill="white" />
                            <rect x="14" y="66" width="20" height="20" fill="white" />
                            <circle cx="50" cy="50" r="15" fill={primaryColor} />
                            <text x="50" y="55" textAnchor="middle" fill="white" fontSize="10" fontFamily="Poppins" fontWeight="700">TN</text>
                        </svg>
                        <div style={{ fontWeight: 700, fontSize: 13, color: primaryColor }}>TABLE 12</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>Scan to Order & Pay</div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Primary Color</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {COLORS.map(c => (
                                <button key={c} onClick={() => setPrimaryColor(c)}
                                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: primaryColor === c ? '3px solid #374151' : '2px solid white', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                            ))}
                            <button style={{ width: 28, height: 28, borderRadius: '50%', background: '#F3F4F6', border: '1.5px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✎</button>
                        </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Output Size</div>
                        <select value={outputSize} onChange={e => setOutputSize(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', outline: 'none', background: 'white' }}>
                            <option>Standard (1024 × 1024 px)</option>
                            <option>Large (2048 × 2048 px)</option>
                            <option>Print (300 DPI)</option>
                        </select>
                    </div>
                    <button onClick={() => toast.success('Styles applied to all tables!')}
                        style={{ width: '100%', padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        Apply to All Tables
                    </button>
                </div>
            </div>
        </div>
    );
}

const DEMO_TABLES = [
    { _id: '1', tableNumber: '01', isActive: true }, { _id: '2', tableNumber: '02', isActive: true },
    { _id: '3', tableNumber: '03', isActive: true }, { _id: '4', tableNumber: '04', isActive: false },
];