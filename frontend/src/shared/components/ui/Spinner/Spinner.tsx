import React from 'react';

interface SpinnerProps {
    size?: number;
    color?: string;
    fullPage?: boolean;
    label?: string;
}

export function Spinner({
    size = 36,
    color = '#B91C1C',
    fullPage = false,
    label,
}: SpinnerProps) {
    const spinner = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
                style={{
                    width: size,
                    height: size,
                    border: `3px solid ${color}25`,
                    borderTop: `3px solid ${color}`,
                    borderRadius: '50%',
                    animation: 'spin 0.75s linear infinite',
                }}
            />
            {label && (
                <span style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'Poppins, sans-serif' }}>
                    {label}
                </span>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (fullPage) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999,
            }}>
                {spinner}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
            {spinner}
        </div>
    );
}

export default Spinner;