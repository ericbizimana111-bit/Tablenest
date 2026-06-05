import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { loyaltyAPI } from '../../../services/api';
import { Award, Star, TrendingUp, Gift, Clock } from 'lucide-react';
import { Spinner } from '../../../shared/components/ui/index';

const TIERS = [
    { name: 'Bronze', min: 0, max: 1000, color: '#CD7F32', bg: '#FEF3C7' },
    { name: 'Silver', min: 1000, max: 5000, color: '#9CA3AF', bg: '#F3F4F6' },
    { name: 'Gold', min: 5000, max: 15000, color: '#D97706', bg: '#FEF9C3' },
    { name: 'Platinum', min: 15000, max: 999999, color: '#2563EB', bg: '#DBEAFE' },
];
const REWARDS = [
    { title: '10% Off Next Order', points: 500, category: 'Discount', expires: '30 days' },
    { title: 'Free Dessert', points: 750, category: 'Dining', expires: '60 days' },
    { title: 'Priority Booking', points: 1000, category: 'Access', expires: '90 days' },
    { title: 'Chef\'s Table Experience', points: 5000, category: 'VIP', expires: '180 days' },
    { title: 'Free Wine Pairing', points: 2000, category: 'Dining', expires: '60 days' },
    { title: '25% Off Weekend Dining', points: 1500, category: 'Discount', expires: '30 days' },
];

export default function RewardsPage() {
    const { data: loyalty, isLoading } = useQuery({
        queryKey: ['loyalty'],
        queryFn: () => loyaltyAPI.get().then(r => r.data),
        initialData: { points: 9000, transactions: DEMO_TRANSACTIONS },
    });

    if (isLoading) return <Spinner />;

    const points = loyalty?.points || 9000;
    const currentTier = TIERS.find(t => points >= t.min && points < t.max) || TIERS[2];
    const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
    const progress = nextTier ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Loyalty Rewards</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Earn points on every dining experience and unlock exclusive rewards.</p>
            </div>

            {/* Points card */}
            <div style={{ background: 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 24, color: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Your Points Balance</div>
                        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>{points.toLocaleString()}</div>
                        <div style={{ fontSize: 14, opacity: 0.85 }}>pts available</div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                                <Award size={16} /> {currentTier.name} Member
                            </div>
                        </div>
                        {nextTier && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                                    <span>{currentTier.name}</span>
                                    <span>{nextTier.name} ({(nextTier.min - points).toLocaleString()} pts away)</span>
                                </div>
                                <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 9999, overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'white', borderRadius: 9999, transition: 'width 0.5s' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tier cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
                {TIERS.map(tier => (
                    <div key={tier.name} style={{ background: tier.name === currentTier.name ? tier.bg : 'white', borderRadius: 10, border: `2px solid ${tier.name === currentTier.name ? tier.color : '#E5E7EB'}`, padding: 16, textAlign: 'center' }}>
                        <Award size={24} style={{ color: tier.color, margin: '0 auto 8px' }} />
                        <div style={{ fontWeight: 700, fontSize: 14, color: tier.color, marginBottom: 4 }}>{tier.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{tier.max === 999999 ? `${tier.min.toLocaleString()}+ pts` : `${tier.min.toLocaleString()} - ${tier.max.toLocaleString()} pts`}</div>
                        {tier.name === currentTier.name && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: tier.color }}>Current Tier</div>}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                {/* Available rewards */}
                <div>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Available Rewards</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {REWARDS.map(reward => {
                            const canRedeem = points >= reward.points;
                            return (
                                <div key={reward.title} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: 8, borderRadius: 8 }}><Gift size={18} /></div>
                                        <span style={{ background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>{reward.category}</span>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{reward.title}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
                                        <Clock size={11} /> Expires in {reward.expires}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#B91C1C', fontSize: 14 }}>
                                            <Star size={12} fill="#B91C1C" color="#B91C1C" /> {reward.points.toLocaleString()} pts
                                        </div>
                                        <button disabled={!canRedeem}
                                            style={{ padding: '6px 14px', background: canRedeem ? '#B91C1C' : '#F3F4F6', color: canRedeem ? 'white' : '#9CA3AF', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: canRedeem ? 'pointer' : 'not-allowed', fontFamily: 'Poppins' }}>
                                            {canRedeem ? 'Redeem' : 'Not enough pts'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Transaction history */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', fontWeight: 600, fontSize: 15 }}>Points History</div>
                    {(loyalty?.transactions || DEMO_TRANSACTIONS).map((tx: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F3F4F6' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.description}</div>
                                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{tx.date ? new Date(tx.date).toLocaleDateString() : tx.dateLabel}</div>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 14, color: tx.points > 0 ? '#16A34A' : '#DC2626' }}>
                                {tx.points > 0 ? '+' : ''}{tx.points} pts
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const DEMO_TRANSACTIONS = [
    { type: 'earn', points: 500, description: 'Referral Reward — Alex', dateLabel: 'Oct 24, 2023' },
    { type: 'earn', points: 200, description: 'Dining at L\'Osteria', dateLabel: 'Oct 20, 2023' },
    { type: 'redeem', points: -500, description: '10% Off Discount Redeemed', dateLabel: 'Oct 15, 2023' },
    { type: 'earn', points: 500, description: 'Referral Reward — James', dateLabel: 'Nov 15, 2023' },
    { type: 'earn', points: 150, description: 'Dining at Sakura Sushi', dateLabel: 'Nov 18, 2023' },
];
