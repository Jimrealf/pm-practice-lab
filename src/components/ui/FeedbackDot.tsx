type FeedbackType = "strength" | "growth" | "expert";

interface FeedbackDotProps {
    type: FeedbackType;
    className?: string;
}

const config: Record<FeedbackType, { color: string; label: string }> = {
    strength: { color: "bg-green", label: "Strength" },
    growth: { color: "bg-amber", label: "Growth area" },
    expert: { color: "bg-blue", label: "Expert insight" },
};

export function FeedbackDot({ type, className = "" }: FeedbackDotProps) {
    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <span
                className={`w-2 h-2 rounded-full ${config[type].color} shrink-0`}
                aria-hidden="true"
            />
            <span className="text-[13px] font-medium text-text-secondary">
                {config[type].label}
            </span>
        </span>
    );
}
