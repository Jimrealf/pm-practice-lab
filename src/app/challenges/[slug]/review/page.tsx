import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ReviewClient } from "./ReviewClient";

export const metadata = {
    title: "Review",
};

export default function ReviewPage() {
    return (
        <Suspense
            fallback={
                <div className="max-w-[768px] mx-auto px-6 py-12">
                    <Skeleton className="h-8 w-64 mb-4" />
                    <Skeleton className="h-4 w-96 mb-8" />
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-48 w-full" />
                </div>
            }
        >
            <ReviewClient />
        </Suspense>
    );
}
