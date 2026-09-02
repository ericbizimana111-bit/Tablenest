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

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    width = 520,
    showClose = true,
    footer,
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
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
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 1000, padding: 20,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white', borderRadius: 16,
                    width: '100%', maxWidth: width,
                    maxHeight: '90vh', overflow: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    fontFamily: 'Poppins, sans-serif',
                    animation: 'fadeIn 0.2s ease-out',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                {(title || showClose) && (
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderBottom: title ? '1px solid #E2E8F0' : 'none',
                    }}>
                        {title && (
                            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                                {title}
                            </h3>
                        )}
                        {showClose && (
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: '#475569', padding: 4, borderRadius: 6,
                                    display: 'flex', alignItems: 'center',
                                    marginLeft: 'auto',
                                }}
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div style={{ padding: '20px 24px' }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{
                        padding: '14px 24px',
                        borderTop: '1px solid #E2E8F0',
                        display: 'flex', justifyContent: 'flex-end', gap: 10,
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Modal;