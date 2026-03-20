"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { InterviewQuestion, InterviewCategory } from "@/types/interview";
import { INTERVIEW_CATEGORIES, CATEGORY_LABELS } from "@/types/interview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useFlashcardProgress } from "@/features/interviews/useFlashcardProgress";

interface FlashcardClientProps {
    questions: InterviewQuestion[];
}

export function FlashcardClient({ questions }: FlashcardClientProps) {
    const searchParams = useSearchParams();
    const initialCat = searchParams.get("cat") as InterviewCategory | null;

    const [category, setCategory] = useState<InterviewCategory | "all">(
        initialCat ?? "all"
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [flashColor, setFlashColor] = useState<string | null>(null);
    const [finished, setFinished] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const { mark, getMark, counts } = useFlashcardProgress();

    const filtered =
        category === "all"
            ? questions
            : questions.filter((q) => q.category === category);

    const currentCard = filtered[currentIndex];

    const handleFlip = useCallback(() => {
        if (!finished) setFlipped((prev) => !prev);
    }, [finished]);

    const handleNext = useCallback(() => {
        if (currentIndex < filtered.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setFlipped(false);
        }
    }, [currentIndex, filtered.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setFlipped(false);
        }
    }, [currentIndex]);

    const handleMark = useCallback(
        (value: "known" | "not-yet" | "skipped") => {
            if (!currentCard) return;
            mark(currentCard.id, value);

            if (value === "known") {
                setFlashColor("border-green");
            } else if (value === "not-yet") {
                setFlashColor("border-amber");
            }

            if (value !== "skipped") {
                setTimeout(() => setFlashColor(null), 150);
            }
        },
        [currentCard, mark]
    );

    const handleFinish = useCallback(() => {
        setFinished(true);
    }, []);

    const handleRestart = useCallback(() => {
        setCurrentIndex(0);
        setFlipped(false);
        setFinished(false);
    }, []);

    useEffect(() => {
        setCurrentIndex(0);
        setFlipped(false);
        setFinished(false);
    }, [category]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (finished) return;
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

            switch (e.key) {
                case " ":
                    e.preventDefault();
                    handleFlip();
                    break;
                case "ArrowRight":
                    handleNext();
                    break;
                case "ArrowLeft":
                    handlePrev();
                    break;
                case "1":
                    handleMark("known");
                    break;
                case "2":
                    handleMark("not-yet");
                    break;
                case "3":
                    handleMark("skipped");
                    break;
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleFlip, handleNext, handlePrev, handleMark, finished]);

    useEffect(() => {
        cardRef.current?.focus();
    }, []);

    if (filtered.length === 0) {
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
                <CategoryFilter category={category} setCategory={setCategory} />
                <div className="mt-12 text-center">
                    <p className="text-[15px] text-text-secondary">
                        No questions match this category. Try selecting a different one or view all.
                    </p>
                    <Button
                        variant="secondary"
                        className="mt-4"
                        onClick={() => setCategory("all")}
                    >
                        Show all
                    </Button>
                </div>
            </div>
        );
    }

    if (finished) {
        const sessionCards = filtered;
        const sessionKnown = sessionCards.filter(
            (q) => getMark(q.id) === "known"
        ).length;
        const sessionNotYet = sessionCards.filter(
            (q) => getMark(q.id) === "not-yet"
        ).length;
        const sessionSkipped = sessionCards.filter(
            (q) => getMark(q.id) === "skipped"
        ).length;

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
                <div className="bg-bg-card border border-border rounded-[var(--radius-md)] p-6 shadow-sm">
                    <h2 className="font-display font-bold text-[18px] text-text-primary mb-4">
                        Session Summary
                    </h2>
                    <p className="text-[15px] text-text-secondary mb-4">
                        You reviewed {sessionCards.length} cards.
                    </p>
                    <div className="flex gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green" />
                            <span className="text-[13px] text-text-secondary">
                                {sessionKnown} known
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber" />
                            <span className="text-[13px] text-text-secondary">
                                {sessionNotYet} not yet
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-text-tertiary" />
                            <span className="text-[13px] text-text-secondary">
                                {sessionSkipped} skipped
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleRestart}>Practice again</Button>
                        <Link href="/interviews">
                            <Button variant="ghost">Back to Interviews</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentMark = currentCard ? getMark(currentCard.id) : undefined;

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

            <CategoryFilter category={category} setCategory={setCategory} />

            <div
                className="mt-4 mb-4 flex items-center justify-between"
                aria-label={`Card ${currentIndex + 1} of ${filtered.length}, ${counts.known} known, ${counts.notYet} not yet, ${counts.skipped} skipped`}
            >
                <span className="text-[13px] font-medium text-text-secondary">
                    Card {currentIndex + 1} of {filtered.length}
                </span>
                <div className="flex items-center gap-4 text-[12px] text-text-tertiary">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green" />
                        {counts.known} known
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                        {counts.notYet} not yet
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                        {counts.skipped} skipped
                    </span>
                </div>
            </div>

            <div className="h-1 bg-bg-secondary rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
                    style={{
                        width: `${((currentIndex + 1) / filtered.length) * 100}%`,
                    }}
                />
            </div>

            <div
                ref={cardRef}
                tabIndex={0}
                role="button"
                aria-label={
                    flipped
                        ? `Answer: ${currentCard?.answer}`
                        : `Question: ${currentCard?.question}. Press space to flip.`
                }
                aria-live="polite"
                onClick={handleFlip}
                className={`
                    relative min-h-[300px] bg-bg-card border rounded-[var(--radius-md)] p-6 shadow-sm
                    cursor-pointer select-none outline-none
                    focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
                    transition-all duration-300 ease-in-out
                    [perspective:1000px]
                    ${flashColor ? flashColor : "border-border"}
                `.trim()}
                style={{
                    borderColor: flashColor
                        ? flashColor === "border-green"
                            ? "var(--green)"
                            : "var(--amber)"
                        : undefined,
                }}
            >
                {currentMark && (
                    <span
                        className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                            currentMark === "known"
                                ? "bg-green"
                                : currentMark === "not-yet"
                                  ? "bg-amber"
                                  : "bg-text-tertiary"
                        }`}
                    />
                )}
                <div className="mb-3">
                    <Badge variant="category">
                        {currentCard
                            ? CATEGORY_LABELS[currentCard.category]
                            : ""}
                    </Badge>
                </div>

                {!flipped ? (
                    <div>
                        <p className="font-display font-bold text-[18px] text-text-primary leading-relaxed">
                            {currentCard?.question}
                        </p>
                        <p className="mt-4 text-[12px] text-text-tertiary">
                            Press Space or tap to flip
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-[15px] text-text-primary leading-relaxed">
                            {currentCard?.answer}
                        </p>
                        {currentCard?.explanation && (
                            <p className="mt-3 text-[13px] text-text-secondary leading-relaxed">
                                {currentCard.explanation}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    Previous
                </Button>

                {currentIndex === filtered.length - 1 ? (
                    <Button onClick={handleFinish}>Finish</Button>
                ) : (
                    <Button variant="ghost" onClick={handleNext}>
                        Next
                    </Button>
                )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => handleMark("known")}
                    className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-md)] border border-border text-[13px] font-medium text-text-secondary hover:border-green hover:text-green transition-colors"
                >
                    <span className="w-2 h-2 rounded-full bg-green" />
                    Know it (1)
                </button>
                <button
                    type="button"
                    onClick={() => handleMark("not-yet")}
                    className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-md)] border border-border text-[13px] font-medium text-text-secondary hover:border-amber hover:text-amber transition-colors"
                >
                    <span className="w-2 h-2 rounded-full bg-amber" />
                    Not yet (2)
                </button>
                <button
                    type="button"
                    onClick={() => handleMark("skipped")}
                    className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-md)] border border-border text-[13px] font-medium text-text-secondary hover:border-text-tertiary hover:text-text-primary transition-colors"
                >
                    <span className="w-2 h-2 rounded-full bg-text-tertiary" />
                    Skip (3)
                </button>
            </div>

            <div className="mt-6 hidden md:flex items-center justify-center gap-4 text-[11px] text-text-tertiary">
                <span>Space: Flip</span>
                <span>Arrows: Navigate</span>
                <span>1/2/3: Mark</span>
            </div>
        </div>
    );
}

function CategoryFilter({
    category,
    setCategory,
}: {
    category: InterviewCategory | "all";
    setCategory: (cat: InterviewCategory | "all") => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => setCategory("all")}
                className={`px-3 py-1 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors ${
                    category === "all"
                        ? "bg-accent text-white"
                        : "bg-bg-secondary text-text-secondary hover:text-text-primary"
                }`}
            >
                All
            </button>
            {INTERVIEW_CATEGORIES.map((cat) => (
                <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors ${
                        category === cat
                            ? "bg-accent text-white"
                            : "bg-bg-secondary text-text-secondary hover:text-text-primary"
                    }`}
                >
                    {CATEGORY_LABELS[cat]}
                </button>
            ))}
        </div>
    );
}
