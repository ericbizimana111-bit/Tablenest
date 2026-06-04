import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
    const [commission, setCommission] = useState('15');
    const [siteName, setSiteName] = useState('TableNest');
    const [maintenance, setMaintenance] = useState(false);

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Platform Settings</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Configure global platform settings and preferences.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>General Settings</div>
                    {[
                        { label: 'Platform Name', value: siteName, onChange: setSiteName },
                        { label: 'Default Commission Rate (%)', value: commission, onChange: setCommission },
                    ].map(f => (
                        <div key={f.label} style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
                            <input value={f.value} onChange={e => f.onChange(e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #E5E7EB' }}>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>Maintenance Mode</div>
                            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Temporarily disable the platform</div>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={maintenance} onChange={() => setMaintenance(!maintenance)} />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                    <button onClick={() => toast.success('Settings saved!')}
                        style={{ marginTop: 16, width: '100%', padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        Save Changes
                    </button>
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>System Info</div>
                    {[
                        ['Version', 'v1.0.0'], ['Environment', 'Production'], ['Database', 'MongoDB Atlas'],
                        ['Last Backup', 'Today, 03:00 AM'], ['Uptime', '99.98%'],
                    ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 }}>
                            <span style={{ color: '#6B7280' }}>{k}</span>
                            <span style={{ fontWeight: 500 }}>{v}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}