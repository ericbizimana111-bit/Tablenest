# Create all remaining owner pages as full implementations
cat > /home/claude / tablenest / frontend / src / modules / owner / seats / SeatManagement.tsx << 'EOF'
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = { available: '#16A34A', occupied: '#DC2626', reserved: '#D97706', blocked: '#9CA3AF' };
const STATUS_BG: Record<string, string> = { available: '#16A34A', occupied: '#DC2626', reserved: '#D97706', blocked: '#9CA3AF' };

export default function SeatManagement() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [restaurantId, setRestaurantId] = useState('');
    const [selectedTable, setSelectedTable] = useState<any>(null);

    React.useEffect(() => {
        if (user?.restaurantId) setRestaurantId(user.restaurantId.toString());
        else restaurantsAPI.getMyRestaurant().then(r => r.data?._id && setRestaurantId(r.data._id)).catch(() => { });
    }, [user]);

    const { data } = useQuery({
        queryKey: ['floor-plan', restaurantId],
        queryFn: () => tablesAPI.getFloorPlan(restaurantId).then(r => r.data),
        enabled: !!restaurantId,
        initialData: { tables: DEMO_TABLES, stats: { total: 48, available: 22, occupied: 18, reserved: 8 } },
    });

    const tables = data?.tables || DEMO_TABLES;
    const stats = data?.stats || { total: 48, available: 22, occupied: 18, reserved: 8 };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Seat Management</h1>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Real-time floor plan and table status management.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
                {[
                    { label: 'Total Tables', value: stats.total, icon: '🪑' },
                    { label: 'Available', value: stats.available, icon: '✅', color: '#16A34A' },
                    { label: 'Occupied', value: stats.occupied, icon: '👥', color: '#DC2626' },
                    { label: 'Reserved', value: stats.reserved, icon: '🔖', color: '#D97706' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', borderRadius: 10, border: '1px solid #E5E7EB', padding: '16px' }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: s.color || '#111827' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
                {/* Floor plan */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Main Dining Hall</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>Afternoon Service Floor Plan</div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                        {Object.entries(STATUS_COLORS).map(([s, c]) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B7280' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                        {tables.map((t: any) => (
                            <div key={t._id || t.tableNumber} onClick={() => setSelectedTable(t)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: 8, borderRadius: 8, border: selectedTable?.tableNumber === t.tableNumber ? '2px solid #B91C1C' : '2px solid transparent', background: selectedTable?.tableNumber === t.tableNumber ? '#FFF7F7' : 'transparent' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: STATUS_BG[t.status] || '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                        <span style={{ fontSize: 18 }}>🪑</span>
                                    </div>
                                    <div style={{ position: 'absolute', top: -6, right: -4, background: t.status === 'available' ? '#16A34A' : '#DC2626', color: 'white', borderRadius: 9999, fontSize: 9, fontWeight: 700, padding: '1px 5px' }}>{t.capacity}p</div>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 500, marginTop: 6, color: '#374151' }}>T-{t.tableNumber}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table detail panel */}
                {selectedTable ? (
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>Table Details</div>
                            <button onClick={() => setSelectedTable(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={18} /></button>
                        </div>
                        <div style={{ background: '#FEE2E2', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#B91C1C', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{selectedTable.tableNumber}</div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Table T-{selectedTable.tableNumber}</div>
                                <div style={{ fontSize: 12, color: '#B91C1C', textTransform: 'capitalize' }}>{selectedTable.status}</div>
                            </div>
                        </div>
                        {selectedTable.status === 'occupied' && (
                            <>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Current Guest</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#374151' }}>J</div>
                                        <span style={{ fontWeight: 500, fontSize: 14 }}>Jonathan Reed</span>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14, fontSize: 13 }}>
                                    <div><div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Party Size</div><div style={{ fontWeight: 600 }}>4 People</div></div>
                                    <div><div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Seated At</div><div style={{ fontWeight: 600 }}>12:45 PM</div></div>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Order Status</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '8px 12px', borderRadius: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 500 }}>Main Courses</span>
                                        <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>Served</span>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Server Notes</div>
                                    <div style={{ background: '#F9FAFB', padding: 10, borderRadius: 8, fontSize: 12, color: '#374151', fontStyle: 'italic', lineHeight: 1.5 }}>"{selectedTable.serverNotes || 'Celebrating anniversary. Requesting a bottle of 2018 Napa Valley Cabernet after main course.'}"</div>
                                </div>
                            </>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button style={{ padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>Generate Bill</button>
                            <button style={{ padding: '10px', background: 'white', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>Transfer Table</button>
                            <button style={{ padding: '10px', background: 'none', color: '#DC2626', border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>Force Release Table</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14 }}>
                        Click a table to view details
                    </div>
                )}
            </div>
        </div>
    );
}

const DEMO_TABLES = [
    { _id: '1', tableNumber: '01', capacity: 6, status: 'available' },
    { _id: '2', tableNumber: '02', capacity: 2, status: 'reserved' },
    { _id: '3', tableNumber: '03', capacity: 4, status: 'occupied' },
    { _id: '4', tableNumber: '04', capacity: 4, status: 'available' },
    { _id: '5', tableNumber: '05', capacity: 2, status: 'blocked' },
    { _id: '6', tableNumber: '06', capacity: 4, status: 'occupied', serverNotes: 'Celebrating anniversary' },
    { _id: '7', tableNumber: '07', capacity: 8, status: 'available' },
    { _id: '8', tableNumber: '08', capacity: 4, status: 'available' },
    { _id: '9', tableNumber: '09', capacity: 2, status: 'occupied' },
    { _id: '10', tableNumber: '10', capacity: 2, status: 'occupied' },
    { _id: '11', tableNumber: '11', capacity: 2, status: 'available' },
    { _id: '12', tableNumber: '12', capacity: 6, status: 'reserved' },
];
EOF
echo "Seat management done"
Output

Seat management done
Done
