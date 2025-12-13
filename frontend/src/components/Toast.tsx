import React, { useEffect } from 'react';
import type { ToastType } from '../hooks/useToast';

export interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'info':
                return 'ℹ️';
            default:
                return 'ℹ️';
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#28a745';
            case 'error':
                return '#dc3545';
            case 'info':
                return '#17a2b8';
            default:
                return '#17a2b8';
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 10000,
                minWidth: '300px',
                maxWidth: '500px',
                padding: '16px 20px',
                backgroundColor: getBackgroundColor(),
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideIn 0.3s ease-out',
                cursor: 'pointer'
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
            }}
        >
            <span style={{ fontSize: '1.5rem' }}>{getIcon()}</span>
            <span style={{ flex: 1, fontWeight: '500', fontSize: '1rem' }}>{message}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
            >
                ×
            </button>
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default Toast;

