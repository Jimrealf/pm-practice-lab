"use client";

import { Button } from "@/components/ui/Button";

export default function DashboardError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-24 text-center">
            <h1 className="font-display font-bold text-[32px] text-text-primary">
                Failed to load dashboard
            </h1>
            <p className="mt-2 text-[15px] text-text-secondary">
                Something went wrong loading your dashboard. Please try again.
            </p>
            <div className="mt-8">
                <Button onClick={reset}>Try again</Button>
            </div>
        </div>
    );
}
