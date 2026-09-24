import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
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
    danger?: boolean;
}

export function ConfirmModal({
    isOpen, onClose, onConfirm,
    title = 'Log out?',
    message = 'You will need to sign in again to access your account.',
    confirmText = 'Log out',
    cancelText = 'Cancel',
    loading = false,
    danger = true,
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" width={400} showClose={false}>
            <div style={{ textAlign: 'center', padding: '6px 0 2px' }}>
                <div
                    style={{
                        width: 60, height: 60, borderRadius: '50%',
                        background: danger ? '#ffe9e7' : '#fff3d6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
                    }}
                >
                    {danger ? <LogOut size={26} color="#c0271b" /> : <AlertTriangle size={26} color="#a15c07" />}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: '#1a130d', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#857a70', lineHeight: 1.6, marginBottom: 26 }}>{message}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} disabled={loading} className="btn btn-outline" style={{ flex: 1 }}>
                        {cancelText}
                    </button>
                    <button onClick={onConfirm} disabled={loading} className="btn" style={{ flex: 1, color: '#fff', background: danger ? '#dc2626' : 'var(--color-brand-500)' }}>
                        {loading ? 'Please wait…' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmModal;
