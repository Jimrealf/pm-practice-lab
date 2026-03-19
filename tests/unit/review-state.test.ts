import { describe, it, expect } from "vitest";

type ReviewStatus = "loading" | "pending" | "reviewing" | "reviewed" | "failed" | "error";

interface Submission {
    id: string;
    status: string;
}

interface Review {
    overall_score: number;
    dimensions: unknown[];
    summary: string;
    comparison_to_expert: string;
}

interface ApiResult {
    success: boolean;
    error?: string;
    data?: {
        submission: Submission;
        review: Review | null;
    };
}

function deriveReviewStatus(result: ApiResult): {
    status: ReviewStatus;
    submission?: Submission;
    review?: Review;
    message?: string;
} {
    if (!result.success) {
        return { status: "error", message: result.error };
    }

    const { submission, review } = result.data!;

    if (submission.status === "reviewed" && review) {
        return { status: "reviewed", submission, review };
    }
    if (submission.status === "failed") {
        return { status: "failed", submission };
    }
    return { status: submission.status as ReviewStatus, submission };
}

function shouldPoll(status: ReviewStatus): boolean {
    return status === "pending" || status === "reviewing";
}

function mapFeedbackType(score: number): "strength" | "growth" {
    if (score >= 7) return "strength";
    return "growth";
}

const mockSubmission: Submission = { id: "sub-1", status: "pending" };
const mockReview: Review = {
    overall_score: 7,
    dimensions: [],
    summary: "Good work",
    comparison_to_expert: "Close to expert",
};

describe("Review page state machine", () => {
    describe("deriveReviewStatus", () => {
        it("returns error status when API call fails", () => {
            const result = deriveReviewStatus({
                success: false,
                error: "Not authenticated",
            });
            expect(result.status).toBe("error");
            expect(result.message).toBe("Not authenticated");
        });

        it("returns error status with undefined message when no error provided", () => {
            const result = deriveReviewStatus({ success: false });
            expect(result.status).toBe("error");
            expect(result.message).toBeUndefined();
        });

        it("returns reviewed status when submission is reviewed and review exists", () => {
            const result = deriveReviewStatus({
                success: true,
                data: {
                    submission: { ...mockSubmission, status: "reviewed" },
                    review: mockReview,
                },
            });
            expect(result.status).toBe("reviewed");
            expect(result.review).toBe(mockReview);
            expect(result.submission?.status).toBe("reviewed");
        });

        it("falls through to submission status when reviewed but review is null", () => {
            const result = deriveReviewStatus({
                success: true,
                data: {
                    submission: { ...mockSubmission, status: "reviewed" },
                    review: null,
                },
            });
            expect(result.status).toBe("reviewed");
            expect(result.review).toBeUndefined();
        });

        it("returns failed status when submission is failed", () => {
            const result = deriveReviewStatus({
                success: true,
                data: {
                    submission: { ...mockSubmission, status: "failed" },
                    review: null,
                },
            });
            expect(result.status).toBe("failed");
            expect(result.submission?.status).toBe("failed");
        });

        it("returns pending status when submission is pending", () => {
            const result = deriveReviewStatus({
                success: true,
                data: {
                    submission: { ...mockSubmission, status: "pending" },
                    review: null,
                },
            });
            expect(result.status).toBe("pending");
        });

        it("returns reviewing status when submission is reviewing", () => {
            const result = deriveReviewStatus({
                success: true,
                data: {
                    submission: { ...mockSubmission, status: "reviewing" },
                    review: null,
                },
            });
            expect(result.status).toBe("reviewing");
        });
    });

    describe("shouldPoll", () => {
        it("returns true for pending", () => {
            expect(shouldPoll("pending")).toBe(true);
        });

        it("returns true for reviewing", () => {
            expect(shouldPoll("reviewing")).toBe(true);
        });

        it("returns false for reviewed", () => {
            expect(shouldPoll("reviewed")).toBe(false);
        });

        it("returns false for failed", () => {
            expect(shouldPoll("failed")).toBe(false);
        });

        it("returns false for error", () => {
            expect(shouldPoll("error")).toBe(false);
        });

        it("returns false for loading", () => {
            expect(shouldPoll("loading")).toBe(false);
        });
    });

    describe("mapFeedbackType", () => {
        it("returns strength for score 10", () => {
            expect(mapFeedbackType(10)).toBe("strength");
        });

        it("returns strength for score 7", () => {
            expect(mapFeedbackType(7)).toBe("strength");
        });

        it("returns growth for score 6", () => {
            expect(mapFeedbackType(6)).toBe("growth");
        });

        it("returns growth for score 4", () => {
            expect(mapFeedbackType(4)).toBe("growth");
        });

        it("returns growth for score 3", () => {
            expect(mapFeedbackType(3)).toBe("growth");
        });

        it("returns growth for score 1", () => {
            expect(mapFeedbackType(1)).toBe("growth");
        });

        it("returns strength for score 8", () => {
            expect(mapFeedbackType(8)).toBe("strength");
        });

        it("returns strength for score 9", () => {
            expect(mapFeedbackType(9)).toBe("strength");
        });
    });
});

describe("Dashboard data aggregation", () => {
    interface SubmissionRow {
        id: string;
        challenge_id: string;
        status: string;
        score: number | null;
        created_at: string;
    }

    interface ChallengeRow {
        id: string;
        slug: string;
        title: string;
        difficulty: string;
        category: string;
    }

    interface ChallengeWithSubmissions {
        challenge: ChallengeRow;
        submissions: SubmissionRow[];
        bestScore: number | null;
        latestStatus: string | null;
    }

    function aggregateDashboard(
        challenges: ChallengeRow[],
        submissions: SubmissionRow[]
    ): {
        attempted: ChallengeWithSubmissions[];
        notStarted: ChallengeWithSubmissions[];
        totalSubmissions: number;
        reviewedCount: number;
    } {
        const challengeMap = new Map<string, ChallengeWithSubmissions>();

        for (const challenge of challenges) {
            challengeMap.set(challenge.id, {
                challenge,
                submissions: [],
                bestScore: null,
                latestStatus: null,
            });
        }

        for (const sub of submissions) {
            const entry = challengeMap.get(sub.challenge_id);
            if (!entry) continue;

            entry.submissions.push(sub);

            if (sub.score !== null && (entry.bestScore === null || sub.score > entry.bestScore)) {
                entry.bestScore = sub.score;
            }

            if (!entry.latestStatus) {
                entry.latestStatus = sub.status;
            }
        }

        const all = Array.from(challengeMap.values());
        return {
            attempted: all.filter((c) => c.submissions.length > 0),
            notStarted: all.filter((c) => c.submissions.length === 0),
            totalSubmissions: submissions.length,
            reviewedCount: submissions.filter((s) => s.status === "reviewed").length,
        };
    }

    const challengeA: ChallengeRow = { id: "c1", slug: "prd", title: "Write a PRD", difficulty: "beginner", category: "communication" };
    const challengeB: ChallengeRow = { id: "c2", slug: "backlog", title: "Prioritize Backlog", difficulty: "intermediate", category: "execution" };
    const challengeC: ChallengeRow = { id: "c3", slug: "metrics", title: "Define Metrics", difficulty: "advanced", category: "analytics" };

    it("correctly separates attempted and not started", () => {
        const submissions: SubmissionRow[] = [
            { id: "s1", challenge_id: "c1", status: "reviewed", score: 7, created_at: "2026-01-01" },
        ];
        const result = aggregateDashboard([challengeA, challengeB, challengeC], submissions);
        expect(result.attempted).toHaveLength(1);
        expect(result.notStarted).toHaveLength(2);
    });

    it("calculates best score across multiple submissions", () => {
        const submissions: SubmissionRow[] = [
            { id: "s1", challenge_id: "c1", status: "reviewed", score: 5, created_at: "2026-01-01" },
            { id: "s2", challenge_id: "c1", status: "reviewed", score: 8, created_at: "2026-01-02" },
            { id: "s3", challenge_id: "c1", status: "reviewed", score: 6, created_at: "2026-01-03" },
        ];
        const result = aggregateDashboard([challengeA], submissions);
        expect(result.attempted[0].bestScore).toBe(8);
    });

    it("handles null scores (pending/failed submissions)", () => {
        const submissions: SubmissionRow[] = [
            { id: "s1", challenge_id: "c1", status: "pending", score: null, created_at: "2026-01-01" },
            { id: "s2", challenge_id: "c1", status: "reviewed", score: 6, created_at: "2026-01-02" },
        ];
        const result = aggregateDashboard([challengeA], submissions);
        expect(result.attempted[0].bestScore).toBe(6);
    });

    it("returns null bestScore when all submissions have null scores", () => {
        const submissions: SubmissionRow[] = [
            { id: "s1", challenge_id: "c1", status: "failed", score: null, created_at: "2026-01-01" },
            { id: "s2", challenge_id: "c1", status: "pending", score: null, created_at: "2026-01-02" },
        ];
        const result = aggregateDashboard([challengeA], submissions);
        expect(result.attempted[0].bestScore).toBeNull();
    });

    it("counts total submissions correctly", () => {
        const submissions: SubmissionRow[] = [
            { id: "s1", challenge_id: "c1", status: "reviewed", score: 7, created_at: "2026-01-01" },
            { id: "s2", challenge_id: "c2", status: "pending", score: null, created_at: "2026-01-02" },
            { id: "s3", challenge_id: "c1", status: "failed", score: null, created_at: "2026-01-03" },
        ];
        const result = aggregateDashboard([challengeA, challengeB], submissions);
        expect(result.totalSubmissions).toBe(3);
    });

    it("counts reviewed submissions correctly", () => {
        const submissions: SubmissionRow[] = [
            { id: "s1", challenge_id: "c1", status: "reviewed", score: 7, created_at: "2026-01-01" },
            { id: "s2", challenge_id: "c1", status: "pending", score: null, created_at: "2026-01-02" },
            { id: "s3", challenge_id: "c2", status: "reviewed", score: 5, created_at: "2026-01-03" },
        ];
        const result = aggregateDashboard([challengeA, challengeB], submissions);
        expect(result.reviewedCount).toBe(2);
    });

    it("handles empty challenges list", () => {
        const result = aggregateDashboard([], []);
        expect(result.attempted).toHaveLength(0);
        expect(result.notStarted).toHaveLength(0);
        expect(result.totalSubmissions).toBe(0);
    });

    it("handles submissions for unknown challenges (orphaned data)", () => {
        const submissions: SubmissionRow[] = [
            { id: "s1", challenge_id: "unknown", status: "reviewed", score: 5, created_at: "2026-01-01" },
        ];
        const result = aggregateDashboard([challengeA], submissions);
        expect(result.attempted).toHaveLength(0);
        expect(result.notStarted).toHaveLength(1);
        expect(result.totalSubmissions).toBe(1);
    });

    it("sets latestStatus to the first submission status (most recent)", () => {
        const submissions: SubmissionRow[] = [
            { id: "s1", challenge_id: "c1", status: "reviewed", score: 8, created_at: "2026-01-02" },
            { id: "s2", challenge_id: "c1", status: "failed", score: null, created_at: "2026-01-01" },
        ];
        const result = aggregateDashboard([challengeA], submissions);
        expect(result.attempted[0].latestStatus).toBe("reviewed");
    });

    it("handles all challenges not started", () => {
        const result = aggregateDashboard([challengeA, challengeB, challengeC], []);
        expect(result.attempted).toHaveLength(0);
        expect(result.notStarted).toHaveLength(3);
    });

    it("handles all challenges attempted", () => {
        const submissions: SubmissionRow[] = [
            { id: "s1", challenge_id: "c1", status: "reviewed", score: 7, created_at: "2026-01-01" },
            { id: "s2", challenge_id: "c2", status: "pending", score: null, created_at: "2026-01-02" },
            { id: "s3", challenge_id: "c3", status: "failed", score: null, created_at: "2026-01-03" },
        ];
        const result = aggregateDashboard([challengeA, challengeB, challengeC], submissions);
        expect(result.attempted).toHaveLength(3);
        expect(result.notStarted).toHaveLength(0);
    });
});
