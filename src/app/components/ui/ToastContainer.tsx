'use client';

import { Toast } from '@/hooks/useToast';

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    const typeStyles: Record<Toast['type'], string> = {
        success: 'bg-green-600 border-green-500/30',
        error: 'bg-red-600 border-red-500/30',
        info: 'bg-blue-600 border-blue-500/30',
    };

    const typeIcons: Record<Toast['type'], string> = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
    };

    return (
        <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto max-w-md w-full rounded-2xl px-4 py-3 shadow-2xl border flex items-center gap-3 animate-fade-in ${typeStyles[toast.type]}`}
                    onClick={() => onRemove(toast.id)}
                    role="alert"
                >
                    <span className="material-symbols-rounded text-white/90 text-lg">{typeIcons[toast.type]}</span>
                    <p className="text-sm font-bold text-white flex-1">{toast.message}</p>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label="Cerrar notificación"
                    >
                        <span className="material-symbols-rounded text-sm">close</span>
                    </button>
                </div>
            ))}
        </div>
    );
}
