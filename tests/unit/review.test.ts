import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mocks ----

const mockEq = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockFrom = vi.fn().mockImplementation((table: string) => {
    if (table === "reviews") {
        return { insert: mockInsert };
    }
    return { update: mockUpdate };
});

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(() => ({ from: mockFrom })),
}));

const mockGenerateContent = vi.fn();
vi.mock("@/lib/gemini/client", () => ({
    getGeminiModel: vi.fn(() => ({
        generateContent: mockGenerateContent,
    })),
}));

vi.mock("@/lib/gemini/prompt", () => ({
    buildReviewPrompt: vi.fn(() => "mocked prompt"),
}));

import { runReview } from "@/lib/gemini/review";
import type { Challenge } from "@/types/challenge";
import type { FieldResponse } from "@/types/submission";

// ---- Fixtures ----

function makeChallenge(): Challenge {
    return {
        id: "ch-1",
        slug: "test",
        title: "Test Challenge",
        description: "desc",
        difficulty: "beginner",
        category: "strategy",
        version: 1,
        time_estimate_minutes: 15,
        scenario_brief: "Brief",
        context_materials: [],
        submission_fields: [
            { id: "f1", label: "Field 1", hint: "hint", type: "textarea", required: true },
        ],
        rubric: [
            { id: "d1", name: "Dim 1", description: "desc", criteria: "criteria", weight: 1 },
        ],
        expert_solution: [{ fieldId: "f1", content: "Expert answer" }],
        steps: [],
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
    };
}

const validGeminiResponse = {
    overallScore: 7,
    dimensions: [
        {
            dimensionId: "d1",
            dimensionName: "Dim 1",
            score: 7,
            feedback: "Good work on this dimension.",
            suggestion: "Consider adding more detail.",
        },
    ],
    summary: "Solid submission with room for growth.",
    comparisonToExpert: "Covers the key points but misses some depth.",
};

function mockGeminiSuccess(response: object = validGeminiResponse) {
    mockGenerateContent.mockResolvedValue({
        response: {
            text: () => JSON.stringify(response),
        },
    });
}

// ---- Tests ----

describe("runReview", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockInsert.mockResolvedValue({ error: null });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnThis();
    });

    describe("happy path", () => {
        it("sets status to 'reviewing' first", async () => {
            mockGeminiSuccess();
            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            expect(mockFrom).toHaveBeenCalledWith("submissions");
            expect(mockUpdate).toHaveBeenCalledWith({ status: "reviewing" });
            expect(mockEq).toHaveBeenCalledWith("id", "sub-1");
        });

        it("calls Gemini to generate content", async () => {
            mockGeminiSuccess();
            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            expect(mockGenerateContent).toHaveBeenCalledWith("mocked prompt");
        });

        it("inserts review into reviews table", async () => {
            mockGeminiSuccess();
            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            expect(mockFrom).toHaveBeenCalledWith("reviews");
            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    submission_id: "sub-1",
                    overall_score: 7,
                    summary: "Solid submission with room for growth.",
                    comparison_to_expert: "Covers the key points but misses some depth.",
                })
            );
        });

        it("sets status to 'reviewed' on success", async () => {
            mockGeminiSuccess();
            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const updateCalls = mockUpdate.mock.calls;
            const lastCall = updateCalls[updateCalls.length - 1];
            expect(lastCall[0]).toEqual({ status: "reviewed" });
        });

        it("returns success: true", async () => {
            mockGeminiSuccess();
            const result = await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            expect(result).toEqual({ success: true });
        });

        it("maps dimensions with feedbackType", async () => {
            mockGeminiSuccess();
            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const insertArg = mockInsert.mock.calls[0][0];
            expect(insertArg.dimensions).toEqual([
                {
                    dimensionId: "d1",
                    dimensionName: "Dim 1",
                    score: 7,
                    feedback: "Good work on this dimension.",
                    suggestion: "Consider adding more detail.",
                    feedbackType: "strength",
                },
            ]);
        });
    });

    describe("Gemini returns invalid JSON", () => {
        it("sets status to 'failed'", async () => {
            mockGenerateContent.mockResolvedValue({
                response: { text: () => "not valid json {{{" },
            });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const updateCalls = mockUpdate.mock.calls;
            const lastCall = updateCalls[updateCalls.length - 1];
            expect(lastCall[0]).toEqual({ status: "failed" });
        });

        it("returns error message about parsing", async () => {
            mockGenerateContent.mockResolvedValue({
                response: { text: () => "not valid json" },
            });

            const result = await runReview("sub-1", makeChallenge(), { f1: "Answer" });
            expect(result.success).toBe(false);
            expect(result.error).toBe("Failed to parse Gemini response");
        });
    });

    describe("Gemini throws error", () => {
        it("sets status to 'failed'", async () => {
            mockGenerateContent.mockRejectedValue(new Error("API rate limit"));

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const updateCalls = mockUpdate.mock.calls;
            const lastCall = updateCalls[updateCalls.length - 1];
            expect(lastCall[0]).toEqual({ status: "failed" });
        });

        it("returns the error message", async () => {
            mockGenerateContent.mockRejectedValue(new Error("API rate limit"));

            const result = await runReview("sub-1", makeChallenge(), { f1: "Answer" });
            expect(result.success).toBe(false);
            expect(result.error).toBe("API rate limit");
        });

        it("handles non-Error thrown values", async () => {
            mockGenerateContent.mockRejectedValue("string error");

            const result = await runReview("sub-1", makeChallenge(), { f1: "Answer" });
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unknown error");
        });
    });

    describe("review insert fails", () => {
        it("sets status to 'failed' when insert errors", async () => {
            mockGeminiSuccess();
            mockInsert.mockResolvedValue({ error: { message: "DB constraint violated" } });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const updateCalls = mockUpdate.mock.calls;
            const lastCall = updateCalls[updateCalls.length - 1];
            expect(lastCall[0]).toEqual({ status: "failed" });
        });

        it("returns the database error message", async () => {
            mockGeminiSuccess();
            mockInsert.mockResolvedValue({ error: { message: "DB constraint violated" } });

            const result = await runReview("sub-1", makeChallenge(), { f1: "Answer" });
            expect(result.success).toBe(false);
            expect(result.error).toBe("DB constraint violated");
        });
    });

    describe("score clamping", () => {
        it("clamps overallScore above 10 to 10", async () => {
            mockGeminiSuccess({ ...validGeminiResponse, overallScore: 15 });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const insertArg = mockInsert.mock.calls[0][0];
            expect(insertArg.overall_score).toBe(10);
        });

        it("clamps overallScore below 1 to 1", async () => {
            mockGeminiSuccess({ ...validGeminiResponse, overallScore: -5 });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const insertArg = mockInsert.mock.calls[0][0];
            expect(insertArg.overall_score).toBe(1);
        });

        it("clamps overallScore of 0 to 1", async () => {
            mockGeminiSuccess({ ...validGeminiResponse, overallScore: 0 });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const insertArg = mockInsert.mock.calls[0][0];
            expect(insertArg.overall_score).toBe(1);
        });

        it("rounds fractional overallScore", async () => {
            mockGeminiSuccess({ ...validGeminiResponse, overallScore: 7.6 });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const insertArg = mockInsert.mock.calls[0][0];
            expect(insertArg.overall_score).toBe(8);
        });

        it("keeps score of exactly 1 as 1", async () => {
            mockGeminiSuccess({ ...validGeminiResponse, overallScore: 1 });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const insertArg = mockInsert.mock.calls[0][0];
            expect(insertArg.overall_score).toBe(1);
        });

        it("keeps score of exactly 10 as 10", async () => {
            mockGeminiSuccess({ ...validGeminiResponse, overallScore: 10 });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const insertArg = mockInsert.mock.calls[0][0];
            expect(insertArg.overall_score).toBe(10);
        });
    });

    describe("mapFeedbackType (via dimension mapping)", () => {
        function makeDimension(score: number) {
            return {
                dimensionId: "d1",
                dimensionName: "Test",
                score,
                feedback: "fb",
                suggestion: "sg",
            };
        }

        it("maps score >= 7 to 'strength'", async () => {
            mockGeminiSuccess({
                ...validGeminiResponse,
                dimensions: [makeDimension(7)],
            });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const dims = mockInsert.mock.calls[0][0].dimensions;
            expect(dims[0].feedbackType).toBe("strength");
        });

        it("maps score of 10 to 'strength'", async () => {
            mockGeminiSuccess({
                ...validGeminiResponse,
                dimensions: [makeDimension(10)],
            });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const dims = mockInsert.mock.calls[0][0].dimensions;
            expect(dims[0].feedbackType).toBe("strength");
        });

        it("maps score of 6 to 'growth'", async () => {
            mockGeminiSuccess({
                ...validGeminiResponse,
                dimensions: [makeDimension(6)],
            });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const dims = mockInsert.mock.calls[0][0].dimensions;
            expect(dims[0].feedbackType).toBe("growth");
        });

        it("maps score of 4 to 'growth'", async () => {
            mockGeminiSuccess({
                ...validGeminiResponse,
                dimensions: [makeDimension(4)],
            });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const dims = mockInsert.mock.calls[0][0].dimensions;
            expect(dims[0].feedbackType).toBe("growth");
        });

        it("maps score of 3 to 'growth'", async () => {
            mockGeminiSuccess({
                ...validGeminiResponse,
                dimensions: [makeDimension(3)],
            });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const dims = mockInsert.mock.calls[0][0].dimensions;
            expect(dims[0].feedbackType).toBe("growth");
        });

        it("maps score of 1 to 'growth'", async () => {
            mockGeminiSuccess({
                ...validGeminiResponse,
                dimensions: [makeDimension(1)],
            });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const dims = mockInsert.mock.calls[0][0].dimensions;
            expect(dims[0].feedbackType).toBe("growth");
        });
    });

    describe("toDimensionScores (via dimension mapping)", () => {
        it("maps all fields from Gemini dimension to DimensionScore", async () => {
            const dims = [
                {
                    dimensionId: "d-alpha",
                    dimensionName: "Alpha Dimension",
                    score: 8,
                    feedback: "Excellent analysis.",
                    suggestion: "Go deeper on root cause.",
                },
                {
                    dimensionId: "d-beta",
                    dimensionName: "Beta Dimension",
                    score: 5,
                    feedback: "Adequate but surface level.",
                    suggestion: "Add supporting data.",
                },
            ];

            mockGeminiSuccess({ ...validGeminiResponse, dimensions: dims });
            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const inserted = mockInsert.mock.calls[0][0].dimensions;
            expect(inserted).toHaveLength(2);

            expect(inserted[0]).toEqual({
                dimensionId: "d-alpha",
                dimensionName: "Alpha Dimension",
                score: 8,
                feedback: "Excellent analysis.",
                suggestion: "Go deeper on root cause.",
                feedbackType: "strength",
            });

            expect(inserted[1]).toEqual({
                dimensionId: "d-beta",
                dimensionName: "Beta Dimension",
                score: 5,
                feedback: "Adequate but surface level.",
                suggestion: "Add supporting data.",
                feedbackType: "growth",
            });
        });

        it("handles empty dimensions array", async () => {
            mockGeminiSuccess({ ...validGeminiResponse, dimensions: [] });
            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            const inserted = mockInsert.mock.calls[0][0].dimensions;
            expect(inserted).toEqual([]);
        });
    });

    describe("call ordering", () => {
        it("sets reviewing before calling Gemini", async () => {
            const callOrder: string[] = [];

            mockUpdate.mockImplementation((arg: { status: string }) => {
                callOrder.push(`update:${arg.status}`);
                return { eq: mockEq };
            });

            mockGenerateContent.mockImplementation(() => {
                callOrder.push("gemini");
                return Promise.resolve({
                    response: { text: () => JSON.stringify(validGeminiResponse) },
                });
            });

            mockInsert.mockImplementation(() => {
                callOrder.push("insert");
                return Promise.resolve({ error: null });
            });

            await runReview("sub-1", makeChallenge(), { f1: "Answer" });

            expect(callOrder.indexOf("update:reviewing")).toBeLessThan(callOrder.indexOf("gemini"));
            expect(callOrder.indexOf("gemini")).toBeLessThan(callOrder.indexOf("insert"));
            expect(callOrder.indexOf("insert")).toBeLessThan(callOrder.indexOf("update:reviewed"));
        });
    });
});
