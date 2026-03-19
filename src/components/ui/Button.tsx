import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-accent text-white hover:bg-accent-dark active:bg-accent-dark",
    secondary:
        "border border-accent text-accent bg-transparent hover:bg-accent-light",
    ghost:
        "text-accent bg-transparent hover:bg-bg-secondary",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-[13px]",
    md: "px-4 py-2 text-[15px]",
    lg: "px-6 py-3 text-[15px] min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", className = "", children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`
                    inline-flex items-center justify-center font-medium
                    rounded-[var(--radius-md)] transition-all duration-150
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${variantStyles[variant]}
                    ${sizeStyles[size]}
                    ${className}
                `.trim()}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
