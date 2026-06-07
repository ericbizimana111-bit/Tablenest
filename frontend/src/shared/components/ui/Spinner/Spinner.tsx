// ── Spinner ──
export function Spinner({ size = 32 }: { size?: number }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }
        }>
            <div style={
                {
                    width: size, height: size,
                    border: '3px solid #FEE2E2',
                    borderTop: '3px solid #B91C1C',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }
            } />
            < style > {`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
