import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

export function Card({ hoverable = false, className = "", children, ...props }: CardProps) {
    return (
        <div
            className={`
                bg-bg-card border border-border rounded-[var(--radius-md)]
                shadow-sm
                ${hoverable ? "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md" : ""}
                ${className}
            `.trim()}
            {...props}
        >
            {children}
        </div>
    );
}
