import { describe, it, expect, beforeEach, vi } from "vitest";
import { getProgress, markFlashcard, saveQuizScore, getFlashcardStats } from "@/lib/interviews/storage";

const STORAGE_KEY = "pm-practice-lab-interviews";

function mockLocalStorage() {
    const store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            for (const key of Object.keys(store)) {
                delete store[key];
            }
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
        _store: store,
    };
}

describe("Interview storage", () => {
    let storage: ReturnType<typeof mockLocalStorage>;

    beforeEach(() => {
        storage = mockLocalStorage();
        Object.defineProperty(globalThis, "localStorage", {
            value: storage,
            writable: true,
            configurable: true,
        });
    });

    describe("getProgress", () => {
        it("returns empty progress when nothing is stored", () => {
            const progress = getProgress();
            expect(progress.flashcards).toEqual({});
            expect(progress.quizBestScores).toEqual({});
        });

        it("returns stored progress", () => {
            const data = {
                flashcards: {
                    "q1": { mark: "known", lastSeen: "2026-01-01T00:00:00Z" },
                },
                quizBestScores: {},
            };
            storage.setItem(STORAGE_KEY, JSON.stringify(data));
            const progress = getProgress();
            expect(progress.flashcards["q1"].mark).toBe("known");
        });

        it("handles corrupted JSON gracefully", () => {
            storage.setItem(STORAGE_KEY, "not-valid-json{{{");
            const progress = getProgress();
            expect(progress.flashcards).toEqual({});
            expect(progress.quizBestScores).toEqual({});
        });

        it("handles missing flashcards key", () => {
            storage.setItem(STORAGE_KEY, JSON.stringify({ quizBestScores: {} }));
            const progress = getProgress();
            expect(progress.flashcards).toEqual({});
        });

        it("handles missing quizBestScores key", () => {
            storage.setItem(STORAGE_KEY, JSON.stringify({ flashcards: {} }));
            const progress = getProgress();
            expect(progress.quizBestScores).toEqual({});
        });
    });

    describe("markFlashcard", () => {
        it("saves a flashcard mark", () => {
            markFlashcard("q1", "known");
            const progress = getProgress();
            expect(progress.flashcards["q1"].mark).toBe("known");
        });

        it("overwrites existing mark", () => {
            markFlashcard("q1", "known");
            markFlashcard("q1", "not-yet");
            const progress = getProgress();
            expect(progress.flashcards["q1"].mark).toBe("not-yet");
        });

        it("preserves other flashcard marks when updating one", () => {
            markFlashcard("q1", "known");
            markFlashcard("q2", "not-yet");
            const progress = getProgress();
            expect(progress.flashcards["q1"].mark).toBe("known");
            expect(progress.flashcards["q2"].mark).toBe("not-yet");
        });

        it("stores lastSeen timestamp", () => {
            markFlashcard("q1", "skipped");
            const progress = getProgress();
            expect(progress.flashcards["q1"].lastSeen).toBeDefined();
            const date = new Date(progress.flashcards["q1"].lastSeen);
            expect(date.getTime()).not.toBeNaN();
        });

        it("handles all three mark types", () => {
            markFlashcard("q1", "known");
            markFlashcard("q2", "not-yet");
            markFlashcard("q3", "skipped");
            const progress = getProgress();
            expect(progress.flashcards["q1"].mark).toBe("known");
            expect(progress.flashcards["q2"].mark).toBe("not-yet");
            expect(progress.flashcards["q3"].mark).toBe("skipped");
        });
    });

    describe("saveQuizScore", () => {
        it("saves a new best score", () => {
            saveQuizScore("behavioral", 8, 10);
            const progress = getProgress();
            expect(progress.quizBestScores["behavioral"].score).toBe(8);
            expect(progress.quizBestScores["behavioral"].total).toBe(10);
        });

        it("replaces score when new score is higher", () => {
            saveQuizScore("behavioral", 5, 10);
            saveQuizScore("behavioral", 8, 10);
            const progress = getProgress();
            expect(progress.quizBestScores["behavioral"].score).toBe(8);
        });

        it("does not replace score when new score is lower", () => {
            saveQuizScore("behavioral", 8, 10);
            saveQuizScore("behavioral", 5, 10);
            const progress = getProgress();
            expect(progress.quizBestScores["behavioral"].score).toBe(8);
        });

        it("replaces when same score but higher total", () => {
            saveQuizScore("behavioral", 8, 10);
            saveQuizScore("behavioral", 8, 20);
            const progress = getProgress();
            expect(progress.quizBestScores["behavioral"].total).toBe(20);
        });

        it("does not replace when same score and same total", () => {
            saveQuizScore("behavioral", 8, 10);
            const firstDate = getProgress().quizBestScores["behavioral"].date;
            saveQuizScore("behavioral", 8, 10);
            const secondDate = getProgress().quizBestScores["behavioral"].date;
            expect(secondDate).toBe(firstDate);
        });

        it("tracks scores per category independently", () => {
            saveQuizScore("behavioral", 8, 10);
            saveQuizScore("technical", 6, 10);
            const progress = getProgress();
            expect(progress.quizBestScores["behavioral"].score).toBe(8);
            expect(progress.quizBestScores["technical"].score).toBe(6);
        });

        it("stores date timestamp", () => {
            saveQuizScore("behavioral", 8, 10);
            const progress = getProgress();
            expect(progress.quizBestScores["behavioral"].date).toBeDefined();
            const date = new Date(progress.quizBestScores["behavioral"].date);
            expect(date.getTime()).not.toBeNaN();
        });
    });

    describe("getFlashcardStats", () => {
        it("counts marks correctly", () => {
            markFlashcard("stat-q1", "known");
            markFlashcard("stat-q2", "known");
            markFlashcard("stat-q3", "not-yet");
            markFlashcard("stat-q4", "skipped");
            const stats = getFlashcardStats();
            expect(stats.known).toBeGreaterThanOrEqual(2);
            expect(stats.notYet).toBeGreaterThanOrEqual(1);
            expect(stats.skipped).toBeGreaterThanOrEqual(1);
            expect(stats.total).toBeGreaterThanOrEqual(4);
        });

        it("reflects updated marks", () => {
            markFlashcard("update-q1", "not-yet");
            const beforeKnown = getFlashcardStats().known;
            const beforeNotYet = getFlashcardStats().notYet;
            markFlashcard("update-q1", "known");
            expect(getFlashcardStats().known).toBe(beforeKnown + 1);
            expect(getFlashcardStats().notYet).toBe(beforeNotYet - 1);
        });

        it("returns consistent counts with getProgress", () => {
            markFlashcard("consist-q1", "known");
            markFlashcard("consist-q2", "not-yet");
            const stats = getFlashcardStats();
            const progress = getProgress();
            const flashcardEntries = Object.values(progress.flashcards);
            expect(stats.total).toBe(flashcardEntries.length);
        });
    });
});
