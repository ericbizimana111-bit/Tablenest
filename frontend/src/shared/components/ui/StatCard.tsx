
interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    sub?: string;
    color?: string;
}
export function StatCard({ label, value, icon, trend, trendUp, sub, color = '#B91C1C' }: StatCardProps) {
    return (
        <div style={{
            background: 'white', borderRadius: 12, padding: '20px',
            border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }
        }>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ background: `${color}15`, padding: 10, borderRadius: 10, color }}>
                    {icon}
                </div>
                {
                    trend && (
                        <span style={
                            {
                                display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 500,
                                color: trendUp ? '#16A34A' : '#DC2626',
                            }
                        }>
                            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />
                            }
                            {trend}
                        </span>
                    )}
            </div>
            < div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}> {label} </div>
            < div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}> {value} </div>
            {sub && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}> {sub} </div>}
        </div>
    );
}