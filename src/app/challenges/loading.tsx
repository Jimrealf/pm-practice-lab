import { Skeleton } from "@/components/ui/Skeleton";

export default function ChallengesLoading() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-80 mb-8" />
            <div className="flex gap-3 mb-8">
                <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
                <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
                <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-[var(--radius-md)] p-6">
                        <div className="flex gap-2 mb-3">
                            <Skeleton className="h-5 w-20 rounded-[var(--radius-sm)]" />
                            <Skeleton className="h-5 w-24 rounded-[var(--radius-sm)]" />
                        </div>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}
