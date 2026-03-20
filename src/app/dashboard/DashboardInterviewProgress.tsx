"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getProgress, getFlashcardStats } from "@/lib/interviews/storage";
import { INTERVIEW_CATEGORIES, CATEGORY_LABELS } from "@/types/interview";
import type { InterviewProgress } from "@/types/interview";

export function DashboardInterviewProgress() {
    const [progress, setProgress] = useState<InterviewProgress | null>(null);

    useEffect(() => {
        setProgress(getProgress());
    }, []);

    if (!progress) return null;

    const stats = getFlashcardStats();
    const quizScores = progress.quizBestScores;
    const hasAnyProgress = stats.total > 0 || Object.keys(quizScores).length > 0;

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-[20px] text-text-primary">
                    Interview Prep
                </h2>
                <Link
                    href="/interviews"
                    className="text-[13px] font-medium text-accent hover:text-accent-dark transition-colors"
                >
                    Go to interviews
                </Link>
            </div>

            {!hasAnyProgress ? (
                <Card className="p-6 text-center">
                    <p className="text-[14px] text-text-secondary">
                        No interview practice yet. Start with flashcards or take a quiz.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                        <Link
                            href="/interviews/flashcards"
                            className="inline-flex items-center justify-center px-4 py-2 text-[13px] font-medium border border-border text-text-secondary rounded-[var(--radius-md)] hover:border-accent hover:text-accent transition-colors"
                        >
                            Flashcards
                        </Link>
                        <Link
                            href="/interviews/quiz"
                            className="inline-flex items-center justify-center px-4 py-2 text-[13px] font-medium border border-border text-text-secondary rounded-[var(--radius-md)] hover:border-accent hover:text-accent transition-colors"
                        >
                            Start a quiz
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[13px] font-medium text-text-tertiary">
                                Flashcard Progress
                            </h3>
                            <Link
                                href="/interviews/flashcards"
                                className="text-[12px] font-medium text-accent hover:text-accent-dark transition-colors"
                            >
                                Practice
                            </Link>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="font-display font-bold text-[28px] text-text-primary">
                                {stats.known}
                            </span>
                            <span className="text-[14px] text-text-tertiary">
                                mastered
                            </span>
                        </div>
                        <div className="mt-3 flex gap-4 text-[12px] text-text-tertiary">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green" />
                                {stats.known} known
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                                {stats.notYet} not yet
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                                {stats.skipped} skipped
                            </span>
                        </div>
                        {stats.total > 0 && (
                            <div className="mt-3 h-1.5 bg-bg-secondary rounded-full overflow-hidden flex">
                                {stats.known > 0 && (
                                    <div
                                        className="h-full bg-green"
                                        style={{ width: `${(stats.known / stats.total) * 100}%` }}
                                    />
                                )}
                                {stats.notYet > 0 && (
                                    <div
                                        className="h-full bg-amber"
                                        style={{ width: `${(stats.notYet / stats.total) * 100}%` }}
                                    />
                                )}
                            </div>
                        )}
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[13px] font-medium text-text-tertiary">
                                Quiz Best Scores
                            </h3>
                            <Link
                                href="/interviews/quiz"
                                className="text-[12px] font-medium text-accent hover:text-accent-dark transition-colors"
                            >
                                Take quiz
                            </Link>
                        </div>
                        {Object.keys(quizScores).length === 0 ? (
                            <p className="text-[13px] text-text-secondary">
                                No quizzes completed yet.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {INTERVIEW_CATEGORIES.filter((cat) => quizScores[cat]).map((cat) => {
                                    const best = quizScores[cat];
                                    const pct = Math.round((best.score / best.total) * 100);
                                    return (
                                        <div key={cat} className="flex items-center justify-between">
                                            <span className="text-[13px] text-text-secondary">
                                                {CATEGORY_LABELS[cat]}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-accent rounded-full"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[13px] font-medium text-accent w-12 text-right">
                                                    {best.score}/{best.total}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
