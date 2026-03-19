interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-bg-secondary rounded-[var(--radius-md)] ${className}`}
            aria-hidden="true"
        />
    );
}
