import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Star, Gift, Clock, Copy, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import { loyaltyAPI } from '../../../shared/services/api';
import { Spinner } from '../../../shared/components/ui/index';
import type { Loyalty, LoyaltyTransaction } from '../../../shared/types/user.types';

const TIER_COLOR: Record<string, { color: string; bg: string }> = {
    Bronze: { color: '#CD7F32', bg: '#FEF3C7' },
    Silver: { color: '#94A3B8', bg: '#F1F5F9' },
    Gold: { color: '#F59E0B', bg: '#FEF3C7' },
    Platinum: { color: '#2563EB', bg: '#DBEAFE' },
};

export default function RewardsPage() {
    const queryClient = useQueryClient();
    const { data: loyalty, isLoading } = useQuery<Loyalty>({
        queryKey: ['loyalty'],
        queryFn: () => loyaltyAPI.get().then((r) => r.data),
    });

    const redeemMut = useMutation({
        mutationFn: (rewardId: string) => loyaltyAPI.redeem(rewardId),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['loyalty'] });
            toast.success(`Reward redeemed! Code ${res.data.voucher.code} is ready to use at checkout.`);
        },
        onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || 'Could not redeem reward'),
    });

    const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast.success('Code copied'); };

    if (isLoading || !loyalty) return <Spinner />;

    const tierStyle = TIER_COLOR[loyalty.tier] || TIER_COLOR.Bronze;

    return (
        <div className="animate-fade-up">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Loyalty rewards</h1>
                <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginTop: 2 }}>Earn points on every order and booking, then redeem them for real discounts.</p>
            </div>

            <div style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))', borderRadius: 18, padding: '28px 32px', marginBottom: 24, color: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }} className="rewards-hero-grid">
                    <div>
                        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Your points balance</div>
                        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, marginBottom: 8, fontFamily: 'var(--font-display)' }}>{loyalty.points.toLocaleString()}</div>
                        <div style={{ fontSize: 14, opacity: 0.85 }}>pts available</div>
                    </div>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                            <Award size={16} /> {loyalty.tier} member
                        </div>
                        {loyalty.nextTier && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85, marginBottom: 4 }}>
                                    <span>{loyalty.tier}</span>
                                    <span>{loyalty.nextTier.name} ({loyalty.nextTier.pointsNeeded.toLocaleString()} pts away)</span>
                                </div>
                                <div style={{ height: 8, background: 'rgba(255,255,255,0.25)', borderRadius: 9999, overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(loyalty.tierProgress, 100)}%`, height: '100%', background: 'white', borderRadius: 9999, transition: 'width 0.6s ease' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
                {['Bronze', 'Silver', 'Gold', 'Platinum'].map((name) => {
                    const isCurrent = name === loyalty.tier;
                    const c = TIER_COLOR[name];
                    return (
                        <div key={name} className="card" style={{ background: isCurrent ? c.bg : '#fff', border: `2px solid ${isCurrent ? c.color : 'var(--color-line)'}`, padding: 16, textAlign: 'center' }}>
                            <Award size={22} style={{ color: c.color, margin: '0 auto 8px' }} />
                            <div style={{ fontWeight: 700, fontSize: 14, color: c.color }}>{name}</div>
                            {isCurrent && <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: c.color }}>Current tier</div>}
                        </div>
                    );
                })}
            </div>

            {!!loyalty.vouchers?.length && (
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Ticket size={17} color="var(--color-brand-500)" /> Your active vouchers</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
                        {loyalty.vouchers.map((v) => (
                            <div key={v.code} className="card" style={{ padding: 16, border: '1.5px dashed var(--color-brand-300)' }}>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{v.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 10 }}>Expires {new Date(v.expiresAt).toLocaleDateString()}</div>
                                <button onClick={() => copyCode(v.code)} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                                    {v.code} <Copy size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }} className="rewards-body-grid">
                <div>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Redeem points</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {loyalty.rewards.map((reward) => {
                            const canRedeem = loyalty.points >= reward.points;
                            return (
                                <div key={reward.id} className="card" style={{ padding: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-600)', padding: 8, borderRadius: 10 }}><Gift size={18} /></div>
                                        <span className="badge badge-gray">{reward.category}</span>
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{reward.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 4 }}>{reward.description}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 12 }}>
                                        <Clock size={11} /> Valid {reward.validDays} days
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, color: 'var(--color-brand-600)', fontSize: 14 }}>
                                            <Star size={12} fill="#f9691a" color="#f9691a" /> {reward.points.toLocaleString()} pts
                                        </div>
                                        <button
                                            disabled={!canRedeem || redeemMut.isPending}
                                            onClick={() => redeemMut.mutate(reward.id)}
                                            className="btn btn-sm"
                                            style={{ background: canRedeem ? 'var(--color-ink)' : 'var(--color-sand)', color: canRedeem ? '#fff' : 'var(--color-ink-mute)' }}
                                        >
                                            {canRedeem ? 'Redeem' : 'Locked'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-line)', fontWeight: 700, fontSize: 15 }}>Points history</div>
                    {!loyalty.transactions.length ? (
                        <div style={{ padding: 20, fontSize: 13, color: 'var(--color-ink-mute)' }}>No activity yet.</div>
                    ) : (
                        loyalty.transactions.map((tx: LoyaltyTransaction, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--color-sand)' }}>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-ink-mute)' }}>{tx.date ? new Date(tx.date).toLocaleDateString() : ''}</div>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: 13, color: tx.points > 0 ? '#17803d' : '#c0271b', flexShrink: 0 }}>
                                    {tx.points > 0 ? '+' : ''}{tx.points} pts
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <style>{`@media (max-width: 900px) { .rewards-body-grid, .rewards-hero-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}
