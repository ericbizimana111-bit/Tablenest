import React from 'react';
import { LogOut } from 'lucide-react';
import { Modal } from '../Modal/Modal';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Logout',
    message = 'Are you sure you want to logout? You will need to sign in again to access your account.',
    confirmText = 'Logout',
    cancelText = 'Cancel',
    loading = false,
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" width={400} showClose={false}>
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                {/* Icon */}
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: '#FEF3C7',
                        border: '3px solid #F97316',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}
                >
                    <LogOut size={28} color="#F97316" />
                </div>

                {/* Title */}
                <h3
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#0F172A',
                        marginBottom: 8,
                        marginTop: 0,
                    }}
                >
                    {title}
                </h3>

                {/* Message */}
                <p
                    style={{
                        fontSize: 14,
                        color: '#64748B',
                        lineHeight: 1.6,
                        marginBottom: 28,
                        marginTop: 0,
                    }}
                >
                    {message}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: 10,
                            background: '#fff',
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#475569',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = '#F8FAFC';
                                e.currentTarget.style.borderColor = '#CBD5E1';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.borderColor = '#E2E8F0';
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: 'none',
                            borderRadius: 10,
                            background: '#DC2626',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#fff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = '#B91C1C';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.35)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#DC2626';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.25)';
                        }}
                    >
                        {loading ? 'Logging out...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmModal;
