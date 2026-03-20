"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import type { Submission } from "@/types/submission";
import type { AIReview, DimensionScore } from "@/types/review";

type ReviewState =
    | { status: "loading" }
    | { status: "pending" | "reviewing"; submission: Submission }
    | { status: "reviewed"; submission: Submission; review: AIReview }
    | { status: "failed"; submission: Submission }
    | { status: "error"; message: string };

function feedbackDotColor(type: DimensionScore["feedbackType"]): string {
    if (type === "strength") return "bg-feedback-strength";
    if (type === "expert") return "bg-feedback-expert";
    return "bg-feedback-growth";
}

function feedbackLabel(type: DimensionScore["feedbackType"]): string {
    if (type === "strength") return "Strength";
    if (type === "expert") return "Expert insight";
    return "Growth area";
}

function NavLinks({ slug }: { slug: string }) {
    return (
        <div className="flex items-center gap-4 mb-8">
            <Link
                href={`/challenges/${slug}`}
                className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
                Back to challenge
            </Link>
            <span className="text-text-tertiary">|</span>
            <Link
                href="/challenges"
                className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
                All challenges
            </Link>
            <span className="text-text-tertiary">|</span>
            <Link
                href="/dashboard"
                className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
                Dashboard
            </Link>
        </div>
    );
}

export function ReviewClient() {
    const params = useParams();
    const slug = params.slug as string;
    const searchParams = useSearchParams();
    const submissionId = searchParams.get("submission");
    const [state, setState] = useState<ReviewState>({ status: "loading" });
    const [retrying, setRetrying] = useState(false);

    const fetchSubmission = useCallback(async () => {
        if (!submissionId) {
            setState({ status: "error", message: "No submission ID provided" });
            return;
        }

        const response = await fetch(`/api/submissions/${submissionId}`);
        const result = await response.json();

        if (!result.success) {
            setState({ status: "error", message: result.error });
            return;
        }

        const { submission, review } = result.data;

        if (submission.status === "reviewed" && review) {
            setState({ status: "reviewed", submission, review });
        } else if (submission.status === "failed") {
            setState({ status: "failed", submission });
        } else {
            setState({ status: submission.status, submission });
        }
    }, [submissionId]);

    useEffect(() => {
        fetchSubmission();
    }, [fetchSubmission]);

    useEffect(() => {
        if (
            state.status !== "pending" &&
            state.status !== "reviewing"
        ) {
            return;
        }

        const supabase = createClient();
        const channel = supabase
            .channel(`submission-${submissionId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "submissions",
                    filter: `id=eq.${submissionId}`,
                },
                () => {
                    fetchSubmission();
                }
            )
            .subscribe();

        const pollInterval = setInterval(fetchSubmission, 5000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
    }, [state.status, submissionId, fetchSubmission]);

    async function handleRetry() {
        setRetrying(true);
        const response = await fetch(`/api/submissions/${submissionId}/retry`, {
            method: "POST",
        });
        const result = await response.json();

        if (result.success) {
            setState({ status: "reviewing", submission: (state as { submission: Submission }).submission });
            showToast("Review retry started", "success");
        } else {
            showToast(result.error ?? "Retry failed", "error");
        }
        setRetrying(false);
    }

    if (state.status === "loading") {
        return (
            <div className="max-w-[768px] mx-auto px-6 py-12">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-4 w-96 mb-8" />
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (state.status === "error") {
        return (
            <div className="max-w-[768px] mx-auto px-6 py-12">
                <NavLinks slug={slug} />
                <div className="text-center">
                <h1 className="font-display font-bold text-[24px] text-text-primary">
                    Something went wrong
                </h1>
                <p className="mt-2 text-[14px] text-text-secondary">
                    {state.message}
                </p>
                </div>
            </div>
        );
    }

    if (state.status === "pending" || state.status === "reviewing") {
        return (
            <div className="max-w-[768px] mx-auto px-6 py-12">
                <NavLinks slug={slug} />
                <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-light mb-6">
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-accent animate-pulse"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <h1 className="font-display font-bold text-[24px] text-text-primary">
                    A senior PM is reviewing your work...
                </h1>
                <p className="mt-2 text-[14px] text-text-secondary max-w-[448px] mx-auto">
                    Your submission is being analyzed. This usually takes 10-30 seconds.
                    This page will update automatically.
                </p>
                <div className="mt-8 flex justify-center">
                    <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
                    </div>
                </div>
                </div>
            </div>
        );
    }

    if (state.status === "failed") {
        return (
            <div className="max-w-[768px] mx-auto px-6 py-12">
                <NavLinks slug={slug} />
                <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-feedback-growth/10 mb-6">
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-feedback-growth"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <h1 className="font-display font-bold text-[24px] text-text-primary">
                    Review failed
                </h1>
                <p className="mt-2 text-[14px] text-text-secondary max-w-[448px] mx-auto">
                    Something went wrong while generating your review. You can try again.
                </p>
                <div className="mt-6">
                    <Button onClick={handleRetry} disabled={retrying}>
                        {retrying ? "Retrying..." : "Retry review"}
                    </Button>
                </div>
                </div>
            </div>
        );
    }

    if (state.status !== "reviewed") return null;
    const { review } = state;

    return (
        <div className="max-w-[768px] mx-auto px-6 py-12">
            <NavLinks slug={slug} />
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-light mb-4">
                    <span className="font-display font-bold text-[32px] text-accent">
                        {review.overall_score}
                    </span>
                </div>
                <h1 className="font-display font-bold text-[24px] text-text-primary">
                    Your Review
                </h1>
                <p className="mt-2 text-[14px] text-text-secondary max-w-[512px] mx-auto">
                    {review.summary}
                </p>
            </div>

            <div className="space-y-4 mb-10">
                {review.dimensions.map((dim: DimensionScore) => (
                    <Card key={dim.dimensionId} className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`w-2.5 h-2.5 rounded-full ${feedbackDotColor(dim.feedbackType)}`}
                                />
                                <h3 className="font-medium text-[15px] text-text-primary">
                                    {dim.dimensionName}
                                </h3>
                                <span className="text-[12px] text-text-tertiary">
                                    {feedbackLabel(dim.feedbackType)}
                                </span>
                            </div>
                            <span className="font-display font-bold text-[18px] text-text-primary">
                                {dim.score}<span className="text-[13px] text-text-tertiary font-normal">/10</span>
                            </span>
                        </div>
                        <p className="text-[14px] text-text-secondary leading-relaxed">
                            {dim.feedback}
                        </p>
                        {dim.suggestion && (
                            <p className="mt-2 text-[13px] text-text-tertiary leading-relaxed">
                                {dim.suggestion}
                            </p>
                        )}
                    </Card>
                ))}
            </div>

            <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-feedback-expert" />
                    <h3 className="font-medium text-[15px] text-text-primary">
                        Expert comparison
                    </h3>
                    <span className="text-[12px] text-text-tertiary">
                        Expert insight
                    </span>
                </div>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                    {review.comparison_to_expert}
                </p>
            </Card>
        </div>
    );
}
