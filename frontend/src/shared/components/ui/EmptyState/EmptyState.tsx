// ── EmptyState ──
export function EmptyState({ icon, title, message }: { icon?: React.ReactNode; title: string; message?: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }
        }>
            {icon && <div style={{ marginBottom: 16, opacity: 0.4 }}> {icon} </div>}
            <div style={{ fontSize: 16, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}> {title} </div>
            {message && <div style={{ fontSize: 14 }}> {message} </div>}
        </div>
    );
}
