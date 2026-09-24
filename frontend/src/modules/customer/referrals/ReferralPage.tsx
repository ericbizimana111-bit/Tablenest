import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Share2, Mail, QrCode, Megaphone, Tag, TrendingUp, CheckCircle, Send } from 'lucide-react';
import { referralsAPI, loyaltyAPI } from '../../../shared/services/api';
import { StatusBadge } from '../../../shared/components/ui/index';
import type { Referral, ReferralRecord } from '../../../shared/types/user.types';
import type { Loyalty } from '../../../shared/types/user.types';
import toast from 'react-hot-toast';

export default function ReferralPage() {
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');

    const { data: referral } = useQuery<Referral>({
        queryKey: ['referrals'],
        queryFn: () => referralsAPI.get().then((r) => r.data),
    });
    const { data: loyalty } = useQuery<Loyalty>({
        queryKey: ['loyalty'],
        queryFn: () => loyaltyAPI.get().then((r) => r.data),
    });

    const inviteMut = useMutation({
        mutationFn: (e: string) => referralsAPI.invite(e),
        onSuccess: () => {
            setEmail('');
            queryClient.invalidateQueries({ queryKey: ['referrals'] });
            toast.success('Invitation sent!');
        },
        onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || 'Could not send invite'),
    });

    const code = referral?.code || '';
    const copyCode = () => { navigator.clipboard.writeText(code); toast.success('Code copied!'); };
    const shareLink = `${window.location.origin}/register?ref=${code}`;
    const copyLink = () => { navigator.clipboard.writeText(shareLink); toast.success('Link copied!'); };

    const referrals = referral?.referrals || [];
    const sentCount = referrals.length;
    const successCount = referrals.filter((r: ReferralRecord) => r.status === 'successful').length;
    const totalPoints = loyalty?.points || 0;

    return (
        <div className="animate-fade-up">
            <div style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))', borderRadius: 18, padding: '28px 32px', marginBottom: 24, color: 'white', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, alignItems: 'center' }} className="ref-hero-grid">
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Invite friends, earn together</h1>
                    <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6, marginBottom: 20 }}>
                        For every friend who completes their first order or booking, you both receive 500 loyalty points.
                    </p>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.05em' }}>{code}</span>
                            <button onClick={copyCode} className="btn btn-sm" style={{ background: 'white', color: 'var(--color-brand-600)' }}>Copy</button>
                        </div>
                        <button onClick={copyLink} className="btn-icon" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }} title="Copy invite link"><Share2 size={16} /></button>
                    </div>
                </div>
                <form
                    onSubmit={(e) => { e.preventDefault(); if (email) inviteMut.mutate(email); }}
                    style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 20 }}
                >
                    <label style={{ fontSize: 12.5, opacity: 0.9, marginBottom: 8, display: 'block', fontWeight: 600 }}>Invite by email</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="friend@email.com"
                            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', fontSize: 13, fontFamily: 'inherit' }}
                        />
                        <button type="submit" disabled={inviteMut.isPending} className="btn" style={{ background: 'white', color: 'var(--color-brand-600)' }}>
                            <Send size={14} /> {inviteMut.isPending ? 'Sending' : 'Invite'}
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }} className="ref-stats-grid">
                {[
                    { label: 'Sent invites', value: sentCount, icon: <TrendingUp size={20} />, color: '#f9691a' },
                    { label: 'Successful', value: successCount, icon: <CheckCircle size={20} />, color: '#16A34A' },
                    { label: 'Points earned', value: totalPoints.toLocaleString(), icon: <Tag size={20} />, color: '#F59E0B' },
                ].map((s) => (
                    <div key={s.label} className="card" style={{ padding: 20 }}>
                        <div style={{ background: `${s.color}18`, color: s.color, padding: 10, borderRadius: 10, width: 40, marginBottom: 12 }}>{s.icon}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: 28, marginBottom: 24 }}>
                <h2 style={{ fontSize: 19, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>3 simple steps to rewards</h2>
                <p style={{ fontSize: 13, color: 'var(--color-ink-mute)', textAlign: 'center', marginBottom: 26 }}>Share TableNest and get rewarded for every friend who joins.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} className="ref-steps-grid">
                    {[
                        { icon: <QrCode size={26} />, step: '1. Share your code', desc: 'Send your unique code or invite link to friends directly by email.' },
                        { icon: <Megaphone size={26} />, step: '2. They sign up', desc: 'Your friend creates an account and enters your code at signup.' },
                        { icon: <Tag size={26} />, step: '3. You both earn', desc: 'After their first order or booking, 500 points land in both accounts.' },
                    ].map((s) => (
                        <div key={s.step} style={{ textAlign: 'center' }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--color-brand-100)', color: 'var(--color-brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{s.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 8 }}>{s.step}</div>
                            <p style={{ fontSize: 13, color: 'var(--color-ink-mute)', lineHeight: 1.6 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-line)', fontWeight: 700, fontSize: 16 }}>Referral history</div>
                {referrals.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'center', fontSize: 13, color: 'var(--color-ink-mute)' }}>
                        <Mail size={30} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                        No invites sent yet — invite a friend above to get started.
                    </div>
                ) : (
                    <div className="data-table-wrapper">
                        <table className="table-clean">
                            <thead>
                                <tr><th>Referred user</th><th>Date invited</th><th>Status</th><th>Reward</th></tr>
                            </thead>
                            <tbody>
                                {referrals.map((r: ReferralRecord, i: number) => (
                                    <tr key={i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                                                    {(r.name || r.email || 'U').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name || 'Guest'}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--color-ink-mute)' }}>{r.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{r.invitedAt ? new Date(r.invitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                        <td><StatusBadge status={r.status} /></td>
                                        <td style={{ fontWeight: 700, color: r.reward > 0 ? '#17803d' : 'var(--color-ink-mute)' }}>{r.reward > 0 ? `+${r.reward} pts` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style>{`@media (max-width: 900px) { .ref-hero-grid, .ref-stats-grid, .ref-steps-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}
