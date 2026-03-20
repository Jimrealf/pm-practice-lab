/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlashcardProgress } from "@/features/interviews/useFlashcardProgress";

vi.mock("@/lib/interviews/storage", () => {
    let store: Record<string, { mark: string; lastSeen: string }> = {};
    return {
        getProgress: vi.fn(() => ({
            flashcards: { ...store },
            quizBestScores: {},
        })),
        markFlashcard: vi.fn((id: string, mark: string) => {
            store[id] = { mark, lastSeen: new Date().toISOString() };
        }),
        _reset: () => {
            store = {};
        },
    };
});

describe("useFlashcardProgress", () => {
    beforeEach(async () => {
        const mod = await import("@/lib/interviews/storage") as { _reset: () => void };
        mod._reset();
    });

    it("starts with zero counts", () => {
        const { result } = renderHook(() => useFlashcardProgress());
        expect(result.current.counts).toEqual({
            known: 0,
            notYet: 0,
            skipped: 0,
        });
    });

    it("getMark returns undefined for unmarked question", () => {
        const { result } = renderHook(() => useFlashcardProgress());
        expect(result.current.getMark("unknown-id")).toBeUndefined();
    });

    it("marks a question as known", () => {
        const { result } = renderHook(() => useFlashcardProgress());

        act(() => {
            result.current.mark("q1", "known");
        });

        expect(result.current.getMark("q1")).toBe("known");
        expect(result.current.counts.known).toBe(1);
    });

    it("marks a question as not-yet", () => {
        const { result } = renderHook(() => useFlashcardProgress());

        act(() => {
            result.current.mark("q1", "not-yet");
        });

        expect(result.current.getMark("q1")).toBe("not-yet");
        expect(result.current.counts.notYet).toBe(1);
    });

    it("marks a question as skipped", () => {
        const { result } = renderHook(() => useFlashcardProgress());

        act(() => {
            result.current.mark("q1", "skipped");
        });

        expect(result.current.getMark("q1")).toBe("skipped");
        expect(result.current.counts.skipped).toBe(1);
    });

    it("updates count when re-marking a question", () => {
        const { result } = renderHook(() => useFlashcardProgress());

        act(() => {
            result.current.mark("q1", "not-yet");
        });

        expect(result.current.counts.notYet).toBe(1);
        expect(result.current.counts.known).toBe(0);

        act(() => {
            result.current.mark("q1", "known");
        });

        expect(result.current.counts.known).toBe(1);
        expect(result.current.counts.notYet).toBe(0);
    });

    it("tracks multiple questions independently", () => {
        const { result } = renderHook(() => useFlashcardProgress());

        act(() => {
            result.current.mark("q1", "known");
            result.current.mark("q2", "not-yet");
            result.current.mark("q3", "skipped");
        });

        expect(result.current.getMark("q1")).toBe("known");
        expect(result.current.getMark("q2")).toBe("not-yet");
        expect(result.current.getMark("q3")).toBe("skipped");
        expect(result.current.counts).toEqual({
            known: 1,
            notYet: 1,
            skipped: 1,
        });
    });

    it("exposes progress object", () => {
        const { result } = renderHook(() => useFlashcardProgress());

        act(() => {
            result.current.mark("q1", "known");
        });

        expect(result.current.progress["q1"]).toBeDefined();
        expect(result.current.progress["q1"].mark).toBe("known");
        expect(result.current.progress["q1"].lastSeen).toBeDefined();
    });
});
