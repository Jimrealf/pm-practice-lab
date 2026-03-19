"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ error, className = "", ...props }, ref) => {
        const [visible, setVisible] = useState(false);

        return (
            <div className="w-full">
                <div className="relative">
                    <input
                        ref={ref}
                        type={visible ? "text" : "password"}
                        className={`
                            w-full h-12 px-4 pr-11 text-[15px] font-body
                            bg-bg-card border rounded-[var(--radius-md)]
                            text-text-primary placeholder:text-text-tertiary
                            transition-all duration-150
                            focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                            ${error ? "border-amber" : "border-border"}
                            ${className}
                        `.trim()}
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={() => setVisible(!visible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-secondary transition-colors"
                        aria-label={visible ? "Hide password" : "Show password"}
                        tabIndex={-1}
                    >
                        {visible ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>
                {error && (
                    <p className="mt-1.5 text-[13px] text-amber">{error}</p>
                )}
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";

function EyeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}
