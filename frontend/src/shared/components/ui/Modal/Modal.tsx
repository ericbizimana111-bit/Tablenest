import React from 'react';
import { X } from 'lucide-react';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: number;
}
export function Modal({ isOpen, onClose, title, children, width = 520 }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
        }
        } onClick={onClose} >
            <div style={
                {
                    background: 'white', borderRadius: 16, width: '100%', maxWidth: width,
                    maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    animation: 'fadeIn 0.2s ease-out',
                }
            } onClick={e => e.stopPropagation()} >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: '#111827' }}> {title} </h3>
                    < button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>
                < div style={{ padding: '20px 24px' }}> {children} </div>
            </div>
        </div>
    );
}
