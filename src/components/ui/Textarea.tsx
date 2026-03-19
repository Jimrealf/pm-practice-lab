import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ error, className = "", ...props }, ref) => {
        return (
            <div className="w-full">
                <textarea
                    ref={ref}
                    className={`
                        w-full min-h-[120px] px-4 py-3 text-[15px] font-mono
                        bg-bg-card border rounded-[var(--radius-md)]
                        text-text-primary placeholder:text-text-tertiary
                        transition-all duration-150 resize-y
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

Textarea.displayName = "Textarea";
