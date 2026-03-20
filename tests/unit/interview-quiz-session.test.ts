/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuizSession } from "@/features/interviews/useQuizSession";
import type { InterviewQuestion } from "@/types/interview";

vi.mock("@/lib/interviews/storage", () => ({
    saveQuizScore: vi.fn(),
    getProgress: vi.fn(() => ({ flashcards: {}, quizBestScores: {} })),
    markFlashcard: vi.fn(),
}));

vi.mock("@/lib/interviews/content", () => ({
    shuffleArray: vi.fn(<T,>(arr: T[]): T[] => [...arr]),
}));

function makeQuestion(overrides: Partial<InterviewQuestion> = {}): InterviewQuestion {
    return {
        id: `q-${Math.random().toString(36).slice(2, 8)}`,
        category: "behavioral",
        difficulty: "intermediate",
        question: "Test question?",
        answer: "Test answer",
        explanation: "Test explanation",
        tags: ["test"],
        multipleChoice: {
            options: ["A", "B", "C", "D"],
            correctIndex: 1,
        },
        ...overrides,
    };
}

function makeQuestions(count: number): InterviewQuestion[] {
    return Array.from({ length: count }, (_, i) =>
        makeQuestion({
            id: `q-${i}`,
            question: `Question ${i}?`,
            multipleChoice: {
                options: [`Wrong ${i}a`, `Correct ${i}`, `Wrong ${i}b`, `Wrong ${i}c`],
                correctIndex: 1,
            },
        })
    );
}

function mockLocalStorage() {
    const store: Record<string, string> = {};
    Object.defineProperty(globalThis, "localStorage", {
        value: {
            getItem: vi.fn((key: string) => store[key] ?? null),
            setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
            removeItem: vi.fn((key: string) => { delete store[key]; }),
            clear: vi.fn(),
            length: 0,
            key: vi.fn(() => null),
        },
        writable: true,
        configurable: true,
    });
}

describe("useQuizSession", () => {
    beforeEach(() => {
        mockLocalStorage();
    });

    it("starts in setup phase", () => {
        const { result } = renderHook(() => useQuizSession());
        expect(result.current.phase).toBe("setup");
        expect(result.current.currentQuestion).toBeNull();
        expect(result.current.totalQuestions).toBe(0);
    });

    it("transitions to active phase on startQuiz", () => {
        const questions = makeQuestions(5);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 3);
        });

        expect(result.current.phase).toBe("active");
        expect(result.current.totalQuestions).toBe(3);
        expect(result.current.currentIndex).toBe(0);
        expect(result.current.currentQuestion).not.toBeNull();
    });

    it("limits questions to requested count", () => {
        const questions = makeQuestions(10);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 5);
        });

        expect(result.current.totalQuestions).toBe(5);
    });

    it("selecting an answer shows feedback", () => {
        const questions = makeQuestions(3);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 3);
        });

        expect(result.current.showFeedback).toBe(false);
        expect(result.current.selectedAnswer).toBeNull();

        act(() => {
            result.current.selectAnswer(0);
        });

        expect(result.current.showFeedback).toBe(true);
        expect(result.current.selectedAnswer).toBe(0);
    });

    it("ignores second answer selection after feedback shown", () => {
        const questions = makeQuestions(3);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 3);
        });

        act(() => {
            result.current.selectAnswer(0);
        });

        act(() => {
            result.current.selectAnswer(2);
        });

        expect(result.current.selectedAnswer).toBe(0);
    });

    it("advances to next question", () => {
        const questions = makeQuestions(3);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 3);
        });

        act(() => {
            result.current.selectAnswer(1);
        });

        act(() => {
            result.current.nextQuestion();
        });

        expect(result.current.currentIndex).toBe(1);
        expect(result.current.showFeedback).toBe(false);
        expect(result.current.selectedAnswer).toBeNull();
    });

    it("transitions to results after last question", () => {
        const questions = makeQuestions(2);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 2);
        });

        act(() => result.current.selectAnswer(1));
        act(() => result.current.nextQuestion());

        act(() => result.current.selectAnswer(1));
        act(() => result.current.nextQuestion());

        expect(result.current.phase).toBe("results");
    });

    it("calculates score correctly with all correct answers", () => {
        const questions = makeQuestions(3);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 3);
        });

        for (let i = 0; i < 3; i++) {
            act(() => result.current.selectAnswer(1));
            act(() => result.current.nextQuestion());
        }

        expect(result.current.phase).toBe("results");
        expect(result.current.score).toBe(3);
    });

    it("calculates score correctly with all wrong answers", () => {
        const questions = makeQuestions(3);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 3);
        });

        for (let i = 0; i < 3; i++) {
            act(() => result.current.selectAnswer(0));
            act(() => result.current.nextQuestion());
        }

        expect(result.current.phase).toBe("results");
        expect(result.current.score).toBe(0);
    });

    it("calculates score correctly with mixed answers", () => {
        const questions = makeQuestions(4);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 4);
        });

        act(() => result.current.selectAnswer(1));
        act(() => result.current.nextQuestion());

        act(() => result.current.selectAnswer(0));
        act(() => result.current.nextQuestion());

        act(() => result.current.selectAnswer(1));
        act(() => result.current.nextQuestion());

        act(() => result.current.selectAnswer(0));
        act(() => result.current.nextQuestion());

        expect(result.current.phase).toBe("results");
        expect(result.current.score).toBe(2);
    });

    it("tracks answers per question id", () => {
        const questions = makeQuestions(2);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 2);
        });

        act(() => result.current.selectAnswer(0));
        act(() => result.current.nextQuestion());

        act(() => result.current.selectAnswer(3));
        act(() => result.current.nextQuestion());

        expect(result.current.answers["q-0"]).toBe(0);
        expect(result.current.answers["q-1"]).toBe(3);
    });

    it("reset returns to setup phase", () => {
        const questions = makeQuestions(3);
        const { result } = renderHook(() => useQuizSession());

        act(() => {
            result.current.startQuiz(questions, 3);
        });

        act(() => {
            result.current.reset();
        });

        expect(result.current.phase).toBe("setup");
        expect(result.current.currentQuestion).toBeNull();
        expect(result.current.totalQuestions).toBe(0);
        expect(result.current.score).toBe(0);
    });

    it("reset works from results phase", () => {
        const questions = makeQuestions(1);
        const { result } = renderHook(() => useQuizSession());

        act(() => result.current.startQuiz(questions, 1));
        act(() => result.current.selectAnswer(1));
        act(() => result.current.nextQuestion());

        expect(result.current.phase).toBe("results");

        act(() => result.current.reset());

        expect(result.current.phase).toBe("setup");
    });

    it("can start a new quiz after reset", () => {
        const questions = makeQuestions(5);
        const { result } = renderHook(() => useQuizSession());

        act(() => result.current.startQuiz(questions, 2));
        act(() => result.current.selectAnswer(1));
        act(() => result.current.nextQuestion());
        act(() => result.current.selectAnswer(1));
        act(() => result.current.nextQuestion());
        act(() => result.current.reset());

        act(() => result.current.startQuiz(questions, 3));

        expect(result.current.phase).toBe("active");
        expect(result.current.totalQuestions).toBe(3);
        expect(result.current.currentIndex).toBe(0);
        expect(result.current.score).toBe(0);
        expect(Object.keys(result.current.answers)).toHaveLength(0);
    });

    it("score is 0 during setup phase", () => {
        const { result } = renderHook(() => useQuizSession());
        expect(result.current.score).toBe(0);
    });

    it("score is 0 during active phase", () => {
        const questions = makeQuestions(3);
        const { result } = renderHook(() => useQuizSession());

        act(() => result.current.startQuiz(questions, 3));

        expect(result.current.score).toBe(0);
    });
});
