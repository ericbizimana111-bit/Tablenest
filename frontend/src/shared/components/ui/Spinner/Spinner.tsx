import React from 'react';

interface SpinnerProps {
    size?: number;
    color?: string;
    fullPage?: boolean;
    label?: string;
}

export function Spinner({ size = 34, color = '#f9691a', fullPage = false, label }: SpinnerProps) {
    const spinner = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
                style={{
                    width: size,
                    height: size,
                    border: `3px solid ${color}22`,
                    borderTop: `3px solid ${color}`,
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                }}
            />
            {label && <span style={{ fontSize: 13, color: '#857a70', fontWeight: 500 }}>{label}</span>}
        </div>
    );

    if (fullPage) {
        return (
            <div
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(255,250,244,0.85)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                }}
            >
                {spinner}
            </div>
        );
    }

    return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 20px' }}>{spinner}</div>;
}

export default Spinner;
