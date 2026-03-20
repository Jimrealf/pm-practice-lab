"use client";

import { useState, useCallback } from "react";
import type { InterviewQuestion } from "@/types/interview";
import { shuffleArray } from "@/lib/interviews/content";
import { saveQuizScore } from "@/lib/interviews/storage";

interface QuizState {
    phase: "setup" | "active" | "results";
    questions: InterviewQuestion[];
    currentIndex: number;
    answers: Record<string, number>;
    selectedAnswer: number | null;
    showFeedback: boolean;
}

export function useQuizSession() {
    const [state, setState] = useState<QuizState>({
        phase: "setup",
        questions: [],
        currentIndex: 0,
        answers: {},
        selectedAnswer: null,
        showFeedback: false,
    });

    const startQuiz = useCallback(
        (questions: InterviewQuestion[], count: number) => {
            const shuffled = shuffleArray(questions).slice(0, count);
            const withShuffledOptions = shuffled.map((q) => {
                if (!q.multipleChoice) return q;
                const indices = q.multipleChoice.options.map((_, i) => i);
                const shuffledIndices = shuffleArray(indices);
                const newOptions = shuffledIndices.map(
                    (i) => q.multipleChoice!.options[i]
                );
                const newCorrectIndex = shuffledIndices.indexOf(
                    q.multipleChoice.correctIndex
                );
                return {
                    ...q,
                    multipleChoice: {
                        options: newOptions,
                        correctIndex: newCorrectIndex,
                    },
                };
            });

            setState({
                phase: "active",
                questions: withShuffledOptions,
                currentIndex: 0,
                answers: {},
                selectedAnswer: null,
                showFeedback: false,
            });
        },
        []
    );

    const selectAnswer = useCallback((answerIndex: number) => {
        setState((prev) => {
            if (prev.showFeedback) return prev;
            const questionId = prev.questions[prev.currentIndex].id;
            return {
                ...prev,
                selectedAnswer: answerIndex,
                showFeedback: true,
                answers: { ...prev.answers, [questionId]: answerIndex },
            };
        });
    }, []);

    const nextQuestion = useCallback(() => {
        setState((prev) => {
            const nextIndex = prev.currentIndex + 1;
            if (nextIndex >= prev.questions.length) {
                const score = prev.questions.reduce((acc, q) => {
                    const answer = prev.answers[q.id];
                    if (answer === q.multipleChoice?.correctIndex) return acc + 1;
                    return acc;
                }, 0);

                const category = prev.questions[0]?.category ?? "all";
                saveQuizScore(category, score, prev.questions.length);

                return { ...prev, phase: "results" };
            }
            return {
                ...prev,
                currentIndex: nextIndex,
                selectedAnswer: null,
                showFeedback: false,
            };
        });
    }, []);

    const reset = useCallback(() => {
        setState({
            phase: "setup",
            questions: [],
            currentIndex: 0,
            answers: {},
            selectedAnswer: null,
            showFeedback: false,
        });
    }, []);

    const currentQuestion =
        state.phase === "active" ? state.questions[state.currentIndex] : null;

    const score =
        state.phase === "results"
            ? state.questions.reduce((acc, q) => {
                  const answer = state.answers[q.id];
                  if (answer === q.multipleChoice?.correctIndex) return acc + 1;
                  return acc;
              }, 0)
            : 0;

    return {
        phase: state.phase,
        currentQuestion,
        currentIndex: state.currentIndex,
        totalQuestions: state.questions.length,
        selectedAnswer: state.selectedAnswer,
        showFeedback: state.showFeedback,
        answers: state.answers,
        questions: state.questions,
        score,
        startQuiz,
        selectAnswer,
        nextQuestion,
        reset,
    };
}
