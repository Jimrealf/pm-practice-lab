"use client";

import { useState, useCallback } from "react";
import type { FlashcardMark, InterviewProgress } from "@/types/interview";
import { getProgress, markFlashcard } from "@/lib/interviews/storage";

export function useFlashcardProgress() {
    const [progress, setProgress] = useState<InterviewProgress["flashcards"]>(
        () => getProgress().flashcards
    );

    const mark = useCallback((questionId: string, value: FlashcardMark) => {
        markFlashcard(questionId, value);
        setProgress((prev) => ({
            ...prev,
            [questionId]: { mark: value, lastSeen: new Date().toISOString() },
        }));
    }, []);

    const getMark = useCallback(
        (questionId: string): FlashcardMark | undefined => {
            return progress[questionId]?.mark;
        },
        [progress]
    );

    const counts = {
        known: Object.values(progress).filter((p) => p.mark === "known").length,
        notYet: Object.values(progress).filter((p) => p.mark === "not-yet").length,
        skipped: Object.values(progress).filter((p) => p.mark === "skipped").length,
    };

    return { mark, getMark, counts, progress };
}
