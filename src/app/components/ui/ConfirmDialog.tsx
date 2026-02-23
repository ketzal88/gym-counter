'use client';

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'default';
}

export default function ConfirmDialog({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'default',
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleEsc);
        dialogRef.current?.focus();
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onCancel]);

    const confirmStyles = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-500 text-white'
        : 'bg-blue-600 hover:bg-blue-500 text-white';

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                tabIndex={-1}
                className="bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-700 animate-fade-in outline-none"
            >
                <h3 id="confirm-title" className="text-lg font-black text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${confirmStyles}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
