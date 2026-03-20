"use client";

import { useEffect, useState } from "react";
import { getProgress } from "@/lib/interviews/storage";

interface InterviewLandingStatsProps {
    mode: "flashcards" | "quiz";
}

export function InterviewLandingStats({ mode }: InterviewLandingStatsProps) {
    const [stat, setStat] = useState<string | null>(null);

    useEffect(() => {
        const progress = getProgress();

        if (mode === "flashcards") {
            const entries = Object.values(progress.flashcards);
            const known = entries.filter((e) => e.mark === "known").length;
            if (entries.length > 0) {
                setStat(`${known}/${entries.length} mastered`);
            }
        }

        if (mode === "quiz") {
            const scores = Object.entries(progress.quizBestScores);
            if (scores.length > 0) {
                const best = scores.reduce((a, b) =>
                    b[1].score / b[1].total > a[1].score / a[1].total ? b : a
                );
                setStat(`Best: ${best[1].score}/${best[1].total} (${best[0]})`);
            }
        }
    }, [mode]);

    if (!stat) return null;

    return (
        <p className="mt-2 text-[12px] font-medium text-accent">
            {stat}
        </p>
    );
}
