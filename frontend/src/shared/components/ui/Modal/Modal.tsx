import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: number;
    showClose?: boolean;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, width = 520, showClose = true, footer }: ModalProps) {
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="animate-fade-in"
            style={{
                position: 'fixed', inset: 0, background: 'rgba(26,19,13,0.5)', backdropFilter: 'blur(3px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
            }}
            onClick={onClose}
        >
            <div
                className="animate-pop"
                style={{
                    background: '#fff', borderRadius: 20, width: '100%', maxWidth: width, maxHeight: '90vh',
                    overflow: 'auto', boxShadow: '0 24px 70px -12px rgba(26,19,13,0.35)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {(title || showClose) && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: title ? '1px solid #ece2d6' : 'none' }}>
                        {title && <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a130d', margin: 0, fontFamily: 'var(--font-display)' }}>{title}</h3>}
                        {showClose && (
                            <button
                                onClick={onClose}
                                className="btn-icon"
                                style={{ background: '#f6eee4', border: 'none', color: '#4a4038', marginLeft: 'auto' }}
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}
                <div style={{ padding: '22px 24px' }}>{children}</div>
                {footer && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #ece2d6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Modal;
