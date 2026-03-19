"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Challenge } from "@/types/challenge";

interface ChallengeWithDate extends Challenge {
    created_at: string;
}

const CATEGORIES = ["all", "strategy", "execution", "communication", "analytics"] as const;
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"] as const;
const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "difficulty", label: "Difficulty" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const difficultyOrder: Record<string, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
};

export function ChallengeListClient({ challenges }: { challenges: ChallengeWithDate[] }) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>("all");
    const [difficulty, setDifficulty] = useState<string>("all");
    const [sort, setSort] = useState<SortOption>("newest");

    const filtered = useMemo(() => {
        let result = challenges;

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.title.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q)
            );
        }

        if (category !== "all") {
            result = result.filter((c) => c.category === category);
        }

        if (difficulty !== "all") {
            result = result.filter((c) => c.difficulty === difficulty);
        }

        result = [...result].sort((a, b) => {
            if (sort === "newest") {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (sort === "oldest") {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            return (difficultyOrder[a.difficulty] ?? 0) - (difficultyOrder[b.difficulty] ?? 0);
        });

        return result;
    }, [challenges, search, category, difficulty, sort]);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <h1 className="font-display font-bold text-[32px] text-text-primary">
                Challenges
            </h1>
            <p className="mt-2 text-text-secondary text-[15px]">
                Pick a scenario. Do the work. Get feedback.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search challenges..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 text-[14px] bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                    />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 px-3 text-[14px] bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c === "all" ? "All categories" : c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                    ))}
                </select>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="h-10 px-3 text-[14px] bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                >
                    {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>
                            {d === "all" ? "All difficulties" : d.charAt(0).toUpperCase() + d.slice(1)}
                        </option>
                    ))}
                </select>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="h-10 px-3 text-[14px] bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            <p className="mt-4 text-[13px] text-text-tertiary">
                {filtered.length} challenge{filtered.length !== 1 ? "s" : ""}
            </p>

            {filtered.length === 0 ? (
                <Card className="mt-4 p-10 text-center">
                    <p className="text-[15px] text-text-secondary">
                        No challenges match your filters.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setCategory("all");
                            setDifficulty("all");
                        }}
                        className="mt-3 text-[13px] font-medium text-accent hover:text-accent-dark transition-colors"
                    >
                        Clear filters
                    </button>
                </Card>
            ) : (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((challenge) => (
                        <Link
                            key={challenge.slug}
                            href={`/challenges/${challenge.slug}`}
                        >
                            <Card hoverable className="p-6 h-full flex flex-col">
                                <div className="flex items-center gap-2">
                                    <Badge variant="difficulty">
                                        {challenge.difficulty}
                                    </Badge>
                                    <Badge variant="category">
                                        {challenge.category}
                                    </Badge>
                                    <span className="text-[12px] text-text-tertiary ml-auto">
                                        {challenge.time_estimate_minutes} min
                                    </span>
                                </div>
                                <h2 className="mt-3 font-display font-bold text-[18px] text-text-primary">
                                    {challenge.title}
                                </h2>
                                <p className="mt-2 text-[14px] text-text-secondary leading-relaxed flex-1">
                                    {challenge.description}
                                </p>
                                <div className="mt-4 text-[13px] font-medium text-accent">
                                    Start challenge
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
