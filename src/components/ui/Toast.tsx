"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface ToastMessage {
    id: number;
    message: string;
    type: "error" | "success";
}

let toastId = 0;
let addToastFn: ((message: string, type: "error" | "success") => void) | null = null;

export function showToast(message: string, type: "error" | "success") {
    addToastFn?.(message, type);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addToast = useCallback((message: string, type: "error" | "success") => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        addToastFn = addToast;
        return () => {
            addToastFn = null;
        };
    }, [addToast]);

    return (
        <>
            {children}
            {mounted &&
                createPortal(
                    <div
                        className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-[380px] z-[100] flex flex-col gap-2 pointer-events-none"
                        aria-live="polite"
                    >
                        {toasts.map((toast) => (
                            <ToastItem
                                key={toast.id}
                                toast={toast}
                                onDismiss={() => removeToast(toast.id)}
                            />
                        ))}
                    </div>,
                    document.body
                )}
        </>
    );
}

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: ToastMessage;
    onDismiss: () => void;
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 200);
        }, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const isError = toast.type === "error";

    return (
        <div
            className={`
                pointer-events-auto flex items-start gap-3 px-4 py-3
                rounded-lg border shadow-lg backdrop-blur-sm
                transition-all duration-200
                ${isError
                    ? "bg-red-950/90 border-red-800/50 text-red-200"
                    : "bg-emerald-950/90 border-emerald-800/50 text-emerald-200"
                }
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
            `.trim()}
            role="alert"
        >
            <div className="shrink-0 mt-0.5">
                {isError ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                )}
            </div>
            <p className="flex-1 text-[13px] font-medium leading-snug">
                {toast.message}
            </p>
            <button
                type="button"
                onClick={() => {
                    setVisible(false);
                    setTimeout(onDismiss, 200);
                }}
                className={`
                    shrink-0 p-0.5 rounded transition-colors
                    ${isError
                        ? "text-red-400 hover:text-red-200 hover:bg-red-800/50"
                        : "text-emerald-400 hover:text-emerald-200 hover:bg-emerald-800/50"
                    }
                `.trim()}
                aria-label="Dismiss"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
}
