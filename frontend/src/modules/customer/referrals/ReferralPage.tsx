import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { referralsAPI, loyaltyAPI } from '../../../shared/services/api';
import { Share2, Mail, QrCode, Megaphone, Tag, TrendingUp, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/ui/index';
import type { Referral, ReferralRecord, Loyalty } from '../../../shared/types/user.types';
import toast from 'react-hot-toast';

export default function ReferralPage() {
    const { data: referral } = useQuery<Referral>({
        queryKey: ['referrals'],
        queryFn: () => referralsAPI.get().then(r => r.data),
    });
    const { data: loyalty } = useQuery<Loyalty>({
        queryKey: ['loyalty'],
        queryFn: () => loyaltyAPI.get().then(r => r.data),
        initialData: { userId: '', points: 0, transactions: [] },
    });

    const code = referral?.code || 'NEST-GOLD-2024';
    const copyCode = () => { navigator.clipboard.writeText(code); toast.success('Code copied!'); };

    const referrals = referral?.referrals || [];
    const sentCount = referrals.length;
    const successCount = referrals.filter((r: ReferralRecord) => r.status === 'successful').length;
    const totalPoints = loyalty?.points || 0;

    return (
        <div className="fade-in">
            {/* Hero banner */}
            <div style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                borderRadius: 16, padding: '28px 32px', marginBottom: 24, color: 'white',
                display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'center',
            }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Invite Friends, Earn Together</h1>
                    <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.6, marginBottom: 20 }}>
                        Share the joy of exquisite dining. For every friend who makes their first reservation, you both receive 500 loyalty points towards your next culinary adventure.
                    </p>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.05em' }}>{code}</span>
                            <button onClick={copyCode} style={{ background: 'white', color: '#F97316', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>Copy</button>
                        </div>
                        <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Share2 size={16} /></button>
                        <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Mail size={16} /></button>
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                    <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=240&q=80" alt="Dining" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    <div style={{ fontSize: 12, opacity: 0.75 }}>Share & earn at top restaurants</div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
                {[
                    { label: 'Sent Invites', value: sentCount, icon: <TrendingUp size={20} />, trend: '+12% from last month', color: '#F97316' },
                    { label: 'Successful', value: successCount, icon: <CheckCircle size={20} />, trend: '+8% from last month', color: '#16A34A' },
                    { label: 'Points Earned', value: totalPoints.toLocaleString(), icon: <Tag size={20} />, trend: 'Active Rewards', color: '#F59E0B' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ background: `${s.color}15`, color: s.color, padding: 10, borderRadius: 10 }}>{s.icon}</div>
                            <span style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.trend}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 30, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* How it works */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 28, marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>3 Simple Steps to Rewards</h2>
                <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', marginBottom: 28 }}>Joining our referral ecosystem is effortless. Share your passion for dining and get rewarded for every new food enthusiast you bring to TableNest.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                    {[
                        { icon: <QrCode size={28} />, step: '1. Get Your Code', desc: 'Copy your unique referral code or link from your dashboard to begin sharing with friends.' },
                        { icon: <Megaphone size={28} />, step: '2. Spread the Word', desc: 'Share via social media, email, or direct message. Your friends get a welcome discount on their first meal.' },
                        { icon: <Tag size={28} />, step: '3. Reap the Rewards', desc: 'Once their first reservation is complete, 500 points are automatically added to your TableNest account.' },
                    ].map(s => (
                        <div key={s.step} style={{ textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{s.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{s.step}</div>
                            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Referral history table */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Referral History</div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#F97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                        Download Report
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>REFERRED USER</th>
                            <th>DATE INVITED</th>
                            <th>STATUS</th>
                            <th>REWARD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrals.map((r: ReferralRecord, i: number) => (
                            <tr key={i}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#475569' }}>
                                            {(r.name || r.email || 'U').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name || 'User'}</div>
                                            <div style={{ fontSize: 11, color: '#94A3B8' }}>{r.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: 13, color: '#475569' }}>
                                    {r.invitedAt ? new Date(r.invitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : r.date}
                                </td>
                                <td><StatusBadge status={r.status} /></td>
                                <td style={{ fontWeight: 600, color: r.reward > 0 ? '#16A34A' : '#94A3B8', fontSize: 13 }}>
                                    {r.reward > 0 ? `+${r.reward} Points` : '0 Points'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <button style={{ fontSize: 13, color: '#F97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>View All Activities</button>
                </div>
            </div>
        </div>
    );
}

