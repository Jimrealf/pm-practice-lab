import { Skeleton } from "@/components/ui/Skeleton";

export default function ChallengeDetailLoading() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="max-w-[680px]">
                <Skeleton className="h-4 w-28 mb-6" />
                <div className="flex gap-2 mb-4">
                    <Skeleton className="h-5 w-20 rounded-[var(--radius-sm)]" />
                    <Skeleton className="h-5 w-24 rounded-[var(--radius-sm)]" />
                    <Skeleton className="h-4 w-16 ml-2" />
                </div>
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-2/3 mb-8" />
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5 mb-8" />
                <Skeleton className="h-12 w-40 rounded-[var(--radius-md)]" />
            </div>
        </div>
    );
}
