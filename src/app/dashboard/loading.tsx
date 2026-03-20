import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <Skeleton className="h-10 w-36 mb-2" />
            <Skeleton className="h-5 w-48 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-[var(--radius-md)] p-5 text-center">
                        <Skeleton className="h-4 w-32 mx-auto mb-2" />
                        <Skeleton className="h-8 w-16 mx-auto" />
                    </div>
                ))}
            </div>
            <div className="mt-10">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="border border-border rounded-[var(--radius-md)] p-6">
                            <div className="flex gap-2 mb-3">
                                <Skeleton className="h-5 w-20 rounded-[var(--radius-sm)]" />
                                <Skeleton className="h-5 w-24 rounded-[var(--radius-sm)]" />
                            </div>
                            <Skeleton className="h-6 w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
