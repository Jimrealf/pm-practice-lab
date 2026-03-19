import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, className = "", ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    ref={ref}
                    className={`
                        w-full h-12 px-4 text-[15px] font-body
                        bg-bg-card border rounded-[var(--radius-md)]
                        text-text-primary placeholder:text-text-tertiary
                        transition-all duration-150
                        focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                        ${error ? "border-amber" : "border-border"}
                        ${className}
                    `.trim()}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-[13px] text-amber">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
