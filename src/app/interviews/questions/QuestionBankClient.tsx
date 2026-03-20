"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { InterviewQuestion, InterviewCategory } from "@/types/interview";
import { INTERVIEW_CATEGORIES, CATEGORY_LABELS } from "@/types/interview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface QuestionBankClientProps {
    questions: InterviewQuestion[];
}

export function QuestionBankClient({ questions }: QuestionBankClientProps) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<InterviewCategory | "all">("all");
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let result = questions;
        if (category !== "all") {
            result = result.filter((q) => q.category === category);
        }
        if (activeTag) {
            result = result.filter((q) => q.tags.includes(activeTag));
        }
        if (search.trim()) {
            const term = search.toLowerCase();
            result = result.filter(
                (q) =>
                    q.question.toLowerCase().includes(term) ||
                    q.tags.some((t) => t.toLowerCase().includes(term))
            );
        }
        return result;
    }, [questions, category, activeTag, search]);

    const grouped = useMemo(() => {
        const groups: Record<string, InterviewQuestion[]> = {};
        for (const q of filtered) {
            if (!groups[q.category]) groups[q.category] = [];
            groups[q.category].push(q);
        }
        return groups;
    }, [filtered]);

    return (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
                <Link
                    href="/interviews"
                    className="text-[13px] text-text-secondary hover:text-accent transition-colors"
                >
                    Back to Interview Prep
                </Link>
            </div>

            <h1 className="font-display font-bold text-[24px] text-text-primary mb-1">
                Question Bank
            </h1>
            <p className="text-[15px] text-text-secondary mb-6">
                Browse all {questions.length} questions. Search, filter, and
                expand to see answers.
            </p>

            <div className="sticky top-14 z-10 bg-bg-primary pb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search questions or tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 h-[48px] px-4 bg-bg-card border border-border rounded-[var(--radius-md)] text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
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
                </div>
                {activeTag && (
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-[12px] text-text-tertiary">Tag:</span>
                        <button
                            type="button"
                            onClick={() => setActiveTag(null)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[12px] font-medium text-accent bg-accent-light rounded-[var(--radius-sm)] hover:bg-accent/20 transition-colors"
                        >
                            {activeTag}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="mt-12 text-center">
                    <p className="text-[15px] text-text-secondary">
                        No questions match your search. Try different keywords or
                        clear filters.
                    </p>
                    <Button
                        variant="secondary"
                        className="mt-4"
                        onClick={() => {
                            setSearch("");
                            setCategory("all");
                            setActiveTag(null);
                        }}
                    >
                        Clear filters
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    {INTERVIEW_CATEGORIES.filter((cat) => grouped[cat]).map(
                        (cat) => (
                            <div key={cat}>
                                <h2 className="font-display font-bold text-[15px] text-text-primary mb-3">
                                    {CATEGORY_LABELS[cat]}
                                    <span className="ml-2 text-[12px] font-normal text-text-tertiary">
                                        ({grouped[cat].length})
                                    </span>
                                </h2>
                                <div className="space-y-1">
                                    {grouped[cat].map((q) => (
                                        <QuestionRow
                                            key={q.id}
                                            question={q}
                                            expanded={expandedId === q.id}
                                            activeTag={activeTag}
                                            onToggle={() =>
                                                setExpandedId(
                                                    expandedId === q.id
                                                        ? null
                                                        : q.id
                                                )
                                            }
                                            onTagClick={setActiveTag}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

function QuestionRow({
    question,
    expanded,
    activeTag,
    onToggle,
    onTagClick,
}: {
    question: InterviewQuestion;
    expanded: boolean;
    activeTag: string | null;
    onToggle: () => void;
    onTagClick: (tag: string) => void;
}) {
    return (
        <div className="border border-border rounded-[var(--radius-md)] bg-bg-card overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                aria-controls={`answer-${question.id}`}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-secondary transition-colors min-h-[48px]"
            >
                <span className="text-[14px] text-text-primary pr-4 leading-relaxed">
                    {question.question}
                </span>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`flex-shrink-0 text-text-tertiary transition-transform duration-150 ${
                        expanded ? "rotate-180" : ""
                    }`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {expanded && (
                <div
                    id={`answer-${question.id}`}
                    className="px-4 pb-4 border-t border-border-subtle"
                >
                    <div className="pt-3 flex items-center gap-2 mb-3">
                        <Badge variant="category">
                            {CATEGORY_LABELS[question.category]}
                        </Badge>
                        <Badge variant="difficulty">{question.difficulty}</Badge>
                    </div>
                    <p className="text-[14px] text-text-primary leading-relaxed">
                        {question.answer}
                    </p>
                    {question.explanation && (
                        <p className="mt-3 text-[13px] text-text-secondary leading-relaxed">
                            {question.explanation}
                        </p>
                    )}
                    {question.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {question.tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTagClick(tag);
                                    }}
                                    className={`px-2 py-0.5 text-[11px] rounded-[var(--radius-sm)] transition-colors ${
                                        tag === activeTag
                                            ? "text-accent bg-accent-light font-medium"
                                            : "text-text-tertiary bg-bg-secondary hover:text-accent hover:bg-accent-light"
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
