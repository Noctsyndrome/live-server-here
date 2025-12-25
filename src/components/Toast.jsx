import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {toasts.map(toast => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }) {
    useEffect(() => {
        if (toast.duration > 0) {
            const timer = setTimeout(onClose, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onClose]);

    const config = {
        success: {
            icon: CheckCircle,
            className: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
        },
        error: {
            icon: XCircle,
            className: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
        },
        warning: {
            icon: AlertCircle,
            className: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
        },
        info: {
            icon: Info,
            className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
        }
    };

    const { icon: Icon, className } = config[toast.type] || config.info;

    return (
        <div
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm animate-fadeIn min-w-[300px] max-w-md",
                className
            )}
        >
            <Icon size={20} className="flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
