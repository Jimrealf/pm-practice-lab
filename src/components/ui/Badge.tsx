import { toSentenceCase } from "@/lib/format";

type BadgeVariant = "difficulty" | "category" | "status";

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    difficulty: "bg-accent-light text-accent",
    category: "bg-bg-secondary text-text-secondary",
    status: "bg-green-light text-green",
};

export function Badge({ variant = "category", className = "", children }: BadgeProps) {
    const formatted =
        typeof children === "string" ? toSentenceCase(children) : children;

    return (
        <span
            className={`
                inline-flex items-center px-2 py-0.5
                text-[12px] font-medium leading-tight
                rounded-[var(--radius-sm)]
                ${variantStyles[variant]}
                ${className}
            `.trim()}
        >
            {formatted}
        </span>
    );
}
