import type { InterviewProgress, FlashcardMark, QuizBestScore } from "@/types/interview";

const STORAGE_KEY = "pm-practice-lab-interviews";

const EMPTY_PROGRESS: InterviewProgress = {
    flashcards: {},
    quizBestScores: {},
};

let memoryFallback: InterviewProgress | null = null;

function isLocalStorageAvailable(): boolean {
    try {
        const testKey = "__storage_test__";
        localStorage.setItem(testKey, "1");
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

export function getProgress(): InterviewProgress {
    if (!isLocalStorageAvailable()) {
        return memoryFallback ?? { ...EMPTY_PROGRESS };
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...EMPTY_PROGRESS };
        const parsed = JSON.parse(raw) as InterviewProgress;
        return {
            flashcards: parsed.flashcards ?? {},
            quizBestScores: parsed.quizBestScores ?? {},
        };
    } catch {
        return { ...EMPTY_PROGRESS };
    }
}

function saveProgress(progress: InterviewProgress): void {
    if (!isLocalStorageAvailable()) {
        memoryFallback = progress;
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
        memoryFallback = progress;
    }
}

export function markFlashcard(questionId: string, mark: FlashcardMark): void {
    const progress = getProgress();
    progress.flashcards[questionId] = {
        mark,
        lastSeen: new Date().toISOString(),
    };
    saveProgress(progress);
}

export function saveQuizScore(category: string, score: number, total: number): void {
    const progress = getProgress();
    const existing = progress.quizBestScores[category];

    if (!existing || score > existing.score || (score === existing.score && total > existing.total)) {
        progress.quizBestScores[category] = {
            score,
            total,
            date: new Date().toISOString(),
        };
        saveProgress(progress);
    }
}

export function getFlashcardStats(): { known: number; notYet: number; skipped: number; total: number } {
    const progress = getProgress();
    const entries = Object.values(progress.flashcards);
    return {
        known: entries.filter((e) => e.mark === "known").length,
        notYet: entries.filter((e) => e.mark === "not-yet").length,
        skipped: entries.filter((e) => e.mark === "skipped").length,
        total: entries.length,
    };
}
