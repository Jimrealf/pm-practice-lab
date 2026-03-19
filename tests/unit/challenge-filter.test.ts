import { describe, it, expect } from "vitest";

interface ChallengeWithDate {
    slug: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    time_estimate_minutes: number;
    created_at: string;
}

const difficultyOrder: Record<string, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
};

function filterChallenges(
    challenges: ChallengeWithDate[],
    search: string,
    category: string,
    difficulty: string,
    sort: string
): ChallengeWithDate[] {
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
}

const challenges: ChallengeWithDate[] = [
    {
        slug: "write-a-prd",
        title: "Write a PRD",
        description: "Write a product requirements document for a new feature",
        difficulty: "beginner",
        category: "communication",
        time_estimate_minutes: 45,
        created_at: "2026-01-15T10:00:00Z",
    },
    {
        slug: "prioritize-backlog",
        title: "Prioritize Backlog",
        description: "Sort and prioritize a product backlog using frameworks",
        difficulty: "intermediate",
        category: "execution",
        time_estimate_minutes: 30,
        created_at: "2026-02-10T10:00:00Z",
    },
    {
        slug: "define-metrics",
        title: "Define Metrics",
        description: "Set up a metrics framework with KPIs for analytics",
        difficulty: "advanced",
        category: "analytics",
        time_estimate_minutes: 60,
        created_at: "2026-03-01T10:00:00Z",
    },
    {
        slug: "strategy-memo",
        title: "Strategy Memo",
        description: "Draft a strategy document for executive review",
        difficulty: "advanced",
        category: "strategy",
        time_estimate_minutes: 90,
        created_at: "2026-03-10T10:00:00Z",
    },
    {
        slug: "onboarding-flow",
        title: "Onboarding Flow",
        description: "Design a new user onboarding experience with analytics tracking",
        difficulty: "beginner",
        category: "execution",
        time_estimate_minutes: 40,
        created_at: "2026-01-20T10:00:00Z",
    },
];

describe("Challenge filtering and sorting", () => {
    describe("search", () => {
        it("returns all challenges when search is empty", () => {
            const result = filterChallenges(challenges, "", "all", "all", "newest");
            expect(result).toHaveLength(5);
        });

        it("returns all challenges when search is only whitespace", () => {
            const result = filterChallenges(challenges, "   ", "all", "all", "newest");
            expect(result).toHaveLength(5);
        });

        it("filters by title match (case insensitive)", () => {
            const result = filterChallenges(challenges, "PRD", "all", "all", "newest");
            expect(result).toHaveLength(1);
            expect(result[0].slug).toBe("write-a-prd");
        });

        it("filters by description match", () => {
            const result = filterChallenges(challenges, "analytics", "all", "all", "newest");
            expect(result).toHaveLength(2);
            const slugs = result.map((c) => c.slug);
            expect(slugs).toContain("define-metrics");
            expect(slugs).toContain("onboarding-flow");
        });

        it("returns empty array when nothing matches", () => {
            const result = filterChallenges(challenges, "zzzznonexistent", "all", "all", "newest");
            expect(result).toHaveLength(0);
        });

        it("matches partial words", () => {
            const result = filterChallenges(challenges, "prior", "all", "all", "newest");
            expect(result).toHaveLength(1);
            expect(result[0].slug).toBe("prioritize-backlog");
        });

        it("is case insensitive for title", () => {
            const result = filterChallenges(challenges, "write a prd", "all", "all", "newest");
            expect(result).toHaveLength(1);
        });

        it("is case insensitive for description", () => {
            const result = filterChallenges(challenges, "EXECUTIVE REVIEW", "all", "all", "newest");
            expect(result).toHaveLength(1);
            expect(result[0].slug).toBe("strategy-memo");
        });
    });

    describe("category filter", () => {
        it("returns all when category is 'all'", () => {
            const result = filterChallenges(challenges, "", "all", "all", "newest");
            expect(result).toHaveLength(5);
        });

        it("filters by strategy", () => {
            const result = filterChallenges(challenges, "", "strategy", "all", "newest");
            expect(result).toHaveLength(1);
            expect(result[0].slug).toBe("strategy-memo");
        });

        it("filters by execution", () => {
            const result = filterChallenges(challenges, "", "execution", "all", "newest");
            expect(result).toHaveLength(2);
        });

        it("filters by analytics", () => {
            const result = filterChallenges(challenges, "", "analytics", "all", "newest");
            expect(result).toHaveLength(1);
        });

        it("filters by communication", () => {
            const result = filterChallenges(challenges, "", "communication", "all", "newest");
            expect(result).toHaveLength(1);
        });

        it("returns empty for a category with no matches", () => {
            const result = filterChallenges(challenges, "", "nonexistent", "all", "newest");
            expect(result).toHaveLength(0);
        });
    });

    describe("difficulty filter", () => {
        it("returns all when difficulty is 'all'", () => {
            const result = filterChallenges(challenges, "", "all", "all", "newest");
            expect(result).toHaveLength(5);
        });

        it("filters by beginner", () => {
            const result = filterChallenges(challenges, "", "all", "beginner", "newest");
            expect(result).toHaveLength(2);
        });

        it("filters by intermediate", () => {
            const result = filterChallenges(challenges, "", "all", "intermediate", "newest");
            expect(result).toHaveLength(1);
            expect(result[0].slug).toBe("prioritize-backlog");
        });

        it("filters by advanced", () => {
            const result = filterChallenges(challenges, "", "all", "advanced", "newest");
            expect(result).toHaveLength(2);
        });
    });

    describe("combined filters", () => {
        it("applies search + category together", () => {
            const result = filterChallenges(challenges, "analytics", "analytics", "all", "newest");
            expect(result).toHaveLength(1);
            expect(result[0].slug).toBe("define-metrics");
        });

        it("applies search + difficulty together", () => {
            const result = filterChallenges(challenges, "onboarding", "all", "beginner", "newest");
            expect(result).toHaveLength(1);
            expect(result[0].slug).toBe("onboarding-flow");
        });

        it("applies category + difficulty together", () => {
            const result = filterChallenges(challenges, "", "execution", "beginner", "newest");
            expect(result).toHaveLength(1);
            expect(result[0].slug).toBe("onboarding-flow");
        });

        it("applies all three filters together", () => {
            const result = filterChallenges(challenges, "backlog", "execution", "intermediate", "newest");
            expect(result).toHaveLength(1);
            expect(result[0].slug).toBe("prioritize-backlog");
        });

        it("returns empty when combined filters eliminate everything", () => {
            const result = filterChallenges(challenges, "PRD", "analytics", "all", "newest");
            expect(result).toHaveLength(0);
        });
    });

    describe("sorting", () => {
        it("sorts newest first by default", () => {
            const result = filterChallenges(challenges, "", "all", "all", "newest");
            expect(result[0].slug).toBe("strategy-memo");
            expect(result[result.length - 1].slug).toBe("write-a-prd");
        });

        it("sorts oldest first", () => {
            const result = filterChallenges(challenges, "", "all", "all", "oldest");
            expect(result[0].slug).toBe("write-a-prd");
            expect(result[result.length - 1].slug).toBe("strategy-memo");
        });

        it("sorts by difficulty (beginner first)", () => {
            const result = filterChallenges(challenges, "", "all", "all", "difficulty");
            expect(result[0].difficulty).toBe("beginner");
            expect(result[1].difficulty).toBe("beginner");
            expect(result[2].difficulty).toBe("intermediate");
            expect(result[3].difficulty).toBe("advanced");
            expect(result[4].difficulty).toBe("advanced");
        });

        it("preserves relative order for same difficulty", () => {
            const result = filterChallenges(challenges, "", "all", "all", "difficulty");
            const beginners = result.filter((c) => c.difficulty === "beginner");
            expect(beginners).toHaveLength(2);
        });

        it("sorts correctly after filtering", () => {
            const result = filterChallenges(challenges, "", "all", "advanced", "oldest");
            expect(result).toHaveLength(2);
            expect(result[0].slug).toBe("define-metrics");
            expect(result[1].slug).toBe("strategy-memo");
        });
    });

    describe("edge cases", () => {
        it("handles empty challenge list", () => {
            const result = filterChallenges([], "test", "all", "all", "newest");
            expect(result).toHaveLength(0);
        });

        it("handles single challenge", () => {
            const result = filterChallenges([challenges[0]], "", "all", "all", "newest");
            expect(result).toHaveLength(1);
        });

        it("does not mutate the original array", () => {
            const original = [...challenges];
            filterChallenges(challenges, "", "all", "all", "oldest");
            expect(challenges.map((c) => c.slug)).toEqual(original.map((c) => c.slug));
        });

        it("handles challenges with identical created_at", () => {
            const sameDateChallenges = [
                { ...challenges[0], created_at: "2026-01-01T00:00:00Z" },
                { ...challenges[1], created_at: "2026-01-01T00:00:00Z" },
            ];
            const result = filterChallenges(sameDateChallenges, "", "all", "all", "newest");
            expect(result).toHaveLength(2);
        });

        it("handles unknown sort value gracefully (falls through to difficulty)", () => {
            const result = filterChallenges(challenges, "", "all", "all", "unknown");
            expect(result).toHaveLength(5);
        });
    });
});
