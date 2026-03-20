"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { InterviewQuestion, InterviewCategory } from "@/types/interview";
import { INTERVIEW_CATEGORIES, CATEGORY_LABELS } from "@/types/interview";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useQuizSession } from "@/features/interviews/useQuizSession";
import { getProgress } from "@/lib/interviews/storage";

interface QuizClientProps {
    allQuizQuestions: InterviewQuestion[];
    categoryCounts: Record<string, { total: number; quiz: number }>;
}

const QUESTION_COUNTS = [5, 10, 15, 20];

export function QuizClient({ allQuizQuestions, categoryCounts }: QuizClientProps) {
    const {
        phase,
        currentQuestion,
        currentIndex,
        totalQuestions,
        selectedAnswer,
        showFeedback,
        answers,
        questions,
        score,
        startQuiz,
        selectAnswer,
        nextQuestion,
        reset,
    } = useQuizSession();

    if (phase === "setup") {
        return (
            <QuizSetup
                allQuizQuestions={allQuizQuestions}
                categoryCounts={categoryCounts}
                onStart={startQuiz}
            />
        );
    }

    if (phase === "results") {
        return (
            <QuizResults
                questions={questions}
                answers={answers}
                score={score}
                total={totalQuestions}
                onReset={reset}
            />
        );
    }

    return (
        <QuizActive
            question={currentQuestion!}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            selectedAnswer={selectedAnswer}
            showFeedback={showFeedback}
            onSelectAnswer={selectAnswer}
            onNext={nextQuestion}
            onQuit={reset}
        />
    );
}

function QuizSetup({
    allQuizQuestions,
    categoryCounts,
    onStart,
}: {
    allQuizQuestions: InterviewQuestion[];
    categoryCounts: Record<string, { total: number; quiz: number }>;
    onStart: (questions: InterviewQuestion[], count: number) => void;
}) {
    const [selectedCategory, setSelectedCategory] = useState<InterviewCategory | "all">("all");
    const [questionCount, setQuestionCount] = useState(10);
    const [bestScores, setBestScores] = useState<Record<string, { score: number; total: number }>>({});

    useEffect(() => {
        setBestScores(getProgress().quizBestScores);
    }, []);

    const availableQuestions =
        selectedCategory === "all"
            ? allQuizQuestions
            : allQuizQuestions.filter((q) => q.category === selectedCategory);

    const maxQuestions = availableQuestions.length;
    const effectiveCount = Math.min(questionCount, maxQuestions);

    return (
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
                <Link
                    href="/interviews"
                    className="text-[13px] text-text-secondary hover:text-accent transition-colors"
                >
                    Back to Interview Prep
                </Link>
            </div>

            <h1 className="font-display font-bold text-[24px] text-text-primary mb-1">
                Quiz
            </h1>
            <p className="text-[15px] text-text-secondary mb-6">
                Pick a category and number of questions to get started.
            </p>

            <div className="mb-6">
                <h3 className="text-[13px] font-medium text-text-secondary mb-3">
                    Category
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedCategory("all")}
                        className={`p-3 rounded-[var(--radius-md)] border text-left transition-colors ${
                            selectedCategory === "all"
                                ? "border-accent bg-accent-light"
                                : "border-border bg-bg-card hover:border-accent"
                        }`}
                    >
                        <span className="text-[13px] font-medium text-text-primary block">
                            All Categories
                        </span>
                        <span className="text-[12px] text-text-tertiary">
                            {allQuizQuestions.length} questions
                        </span>
                    </button>
                    {INTERVIEW_CATEGORIES.map((cat) => {
                        const quizCount = categoryCounts[cat]?.quiz ?? 0;
                        const disabled = quizCount === 0;
                        const best = bestScores[cat];
                        return (
                            <button
                                key={cat}
                                type="button"
                                disabled={disabled}
                                onClick={() => setSelectedCategory(cat)}
                                className={`p-3 rounded-[var(--radius-md)] border text-left transition-colors ${
                                    disabled
                                        ? "border-border bg-bg-secondary opacity-50 cursor-not-allowed"
                                        : selectedCategory === cat
                                          ? "border-accent bg-accent-light"
                                          : "border-border bg-bg-card hover:border-accent"
                                }`}
                            >
                                <span className="text-[13px] font-medium text-text-primary block">
                                    {CATEGORY_LABELS[cat]}
                                </span>
                                <span className="text-[12px] text-text-tertiary">
                                    {disabled
                                        ? "No quiz questions yet"
                                        : `${quizCount} questions`}
                                </span>
                                {best && (
                                    <span className="text-[11px] text-accent block mt-0.5">
                                        Best: {best.score}/{best.total}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-[13px] font-medium text-text-secondary mb-3">
                    Questions
                </h3>
                <div className="flex gap-2">
                    {QUESTION_COUNTS.map((count) => (
                        <button
                            key={count}
                            type="button"
                            disabled={count > maxQuestions}
                            onClick={() => setQuestionCount(count)}
                            className={`px-4 py-2 rounded-[var(--radius-md)] border text-[13px] font-medium transition-colors ${
                                count > maxQuestions
                                    ? "border-border text-text-tertiary opacity-50 cursor-not-allowed"
                                    : questionCount === count
                                      ? "border-accent bg-accent-light text-accent"
                                      : "border-border text-text-secondary hover:border-accent"
                            }`}
                        >
                            {count}
                        </button>
                    ))}
                </div>
                {effectiveCount < questionCount && (
                    <p className="mt-2 text-[12px] text-text-tertiary">
                        Only {maxQuestions} questions available. Quiz will use{" "}
                        {effectiveCount}.
                    </p>
                )}
            </div>

            <Button
                onClick={() => onStart(availableQuestions, effectiveCount)}
                disabled={maxQuestions === 0}
                className="w-full sm:w-auto"
            >
                Start Quiz
            </Button>
        </div>
    );
}

function QuizActive({
    question,
    currentIndex,
    totalQuestions,
    selectedAnswer,
    showFeedback,
    onSelectAnswer,
    onNext,
    onQuit,
}: {
    question: InterviewQuestion;
    currentIndex: number;
    totalQuestions: number;
    selectedAnswer: number | null;
    showFeedback: boolean;
    onSelectAnswer: (index: number) => void;
    onNext: () => void;
    onQuit: () => void;
}) {
    const nextRef = useRef<HTMLButtonElement>(null);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);

    useEffect(() => {
        if (showFeedback) {
            nextRef.current?.focus();
        }
    }, [showFeedback]);

    const correctIndex = question.multipleChoice?.correctIndex ?? 0;
    const options = question.multipleChoice?.options ?? [];

    return (
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-8">
            <div className="mb-4">
                <button
                    type="button"
                    onClick={() => setShowQuitConfirm(true)}
                    className="text-[13px] text-text-secondary hover:text-accent transition-colors mb-4"
                >
                    End quiz
                </button>
                <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-text-secondary">
                        Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    <Badge variant="category">
                        {CATEGORY_LABELS[question.category]}
                    </Badge>
                </div>
            </div>

            <div className="h-1 bg-bg-secondary rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
                    style={{
                        width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                    }}
                />
            </div>

            <p className="font-display font-bold text-[18px] text-text-primary leading-relaxed mb-6">
                {question.question}
            </p>

            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Answer options">
                {options.map((option, idx) => {
                    let borderColor = "border-border";
                    let bgColor = "bg-bg-card";

                    if (showFeedback) {
                        if (idx === correctIndex) {
                            borderColor = "border-green";
                            bgColor = "bg-green-light";
                        } else if (idx === selectedAnswer && idx !== correctIndex) {
                            borderColor = "border-amber";
                            bgColor = "bg-amber-light";
                        }
                    } else if (idx === selectedAnswer) {
                        borderColor = "border-accent";
                        bgColor = "bg-accent-light";
                    }

                    return (
                        <button
                            key={idx}
                            type="button"
                            role="radio"
                            aria-checked={idx === selectedAnswer}
                            onClick={() => onSelectAnswer(idx)}
                            disabled={showFeedback}
                            className={`
                                w-full min-h-[48px] p-4 rounded-[var(--radius-md)] border
                                text-left text-[14px] text-text-primary
                                transition-all duration-150
                                ${borderColor} ${bgColor}
                                ${!showFeedback ? "hover:border-accent cursor-pointer" : "cursor-default"}
                            `.trim()}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            {showFeedback && (
                <div className="mt-4" aria-live="polite">
                    <p
                        className={`text-[14px] font-medium ${
                            selectedAnswer === correctIndex
                                ? "text-green"
                                : "text-amber"
                        }`}
                    >
                        {selectedAnswer === correctIndex
                            ? "Correct!"
                            : `Not quite. The correct answer is: "${options[correctIndex]}"`}
                    </p>
                    {question.explanation && (
                        <p className="mt-2 text-[13px] text-text-secondary leading-relaxed">
                            {question.explanation}
                        </p>
                    )}
                    <Button ref={nextRef} className="mt-4" onClick={onNext}>
                        {currentIndex === totalQuestions - 1
                            ? "See Results"
                            : "Next"}
                    </Button>
                </div>
            )}
            <ConfirmDialog
                open={showQuitConfirm}
                title="End quiz"
                description="Are you sure? Your progress on this quiz will be lost."
                confirmLabel="End quiz"
                cancelLabel="Keep going"
                onConfirm={onQuit}
                onCancel={() => setShowQuitConfirm(false)}
            />
        </div>
    );
}

function QuizResults({
    questions,
    answers,
    score,
    total,
    onReset,
}: {
    questions: InterviewQuestion[];
    answers: Record<string, number>;
    score: number;
    total: number;
    onReset: () => void;
}) {
    const tryAgainRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        tryAgainRef.current?.focus();
    }, []);

    return (
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
                <Link
                    href="/interviews"
                    className="text-[13px] text-text-secondary hover:text-accent transition-colors"
                >
                    Back to Interview Prep
                </Link>
            </div>

            <div className="bg-bg-card border border-border rounded-[var(--radius-md)] p-6 shadow-sm mb-6">
                <p className="font-display font-bold text-[48px] text-accent leading-none">
                    {score}/{total}
                </p>
                <p className="mt-1 text-[15px] text-text-secondary">
                    correct
                </p>
            </div>

            <div className="space-y-3 mb-6">
                {questions.map((q, idx) => {
                    const userAnswer = answers[q.id];
                    const correct =
                        userAnswer === q.multipleChoice?.correctIndex;

                    return (
                        <div
                            key={q.id}
                            className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-bg-card border border-border"
                        >
                            <span
                                className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                    correct ? "bg-green" : "bg-amber"
                                }`}
                            />
                            <div className="min-w-0">
                                <p className="text-[13px] text-text-primary leading-relaxed">
                                    {idx + 1}. {q.question}
                                </p>
                                {!correct && q.multipleChoice && (
                                    <p className="mt-1 text-[12px] text-text-secondary">
                                        Correct:{" "}
                                        {
                                            q.multipleChoice.options[
                                                q.multipleChoice.correctIndex
                                            ]
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <Button ref={tryAgainRef} onClick={onReset}>
                    Try again
                </Button>
                <Link href="/interviews">
                    <Button variant="ghost">Back to Interviews</Button>
                </Link>
            </div>
        </div>
    );
}
