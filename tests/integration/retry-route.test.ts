import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn().mockImplementation(async () => ({
        auth: { getUser: mockGetUser },
        from: mockFrom,
    })),
}));

const mockAdminFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn().mockImplementation(() => ({
        from: mockAdminFrom,
    })),
}));

const mockRunReview = vi.fn();

vi.mock("@/lib/gemini/review", () => ({
    runReview: (...args: unknown[]) => mockRunReview(...args),
}));

const mockUser = { id: "user-123", email: "test@example.com" };

function makeRequest(): Request {
    return new Request("http://localhost/api/submissions/sub-1/retry", {
        method: "POST",
    });
}

function chainable(terminalValue: unknown = { data: null, error: null }) {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};

    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.gte = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue(terminalValue);

    return chain;
}

describe("POST /api/submissions/[id]/retry", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: mockUser } });
        mockRunReview.mockResolvedValue(undefined);
    });

    it("returns 401 UNAUTHORIZED when user is not authenticated", async () => {
        mockGetUser.mockResolvedValue({ data: { user: null } });

        const { POST } = await import("@/app/api/submissions/[id]/retry/route");
        const res = await POST(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.code).toBe("UNAUTHORIZED");
        expect(json.success).toBe(false);
    });

    it("returns 404 when submission is not found", async () => {
        mockFrom.mockReturnValue(
            chainable({ data: null, error: null })
        );

        const { POST } = await import("@/app/api/submissions/[id]/retry/route");
        const res = await POST(
            makeRequest() as any,
            { params: Promise.resolve({ id: "nonexistent" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.code).toBe("NOT_FOUND");
    });

    it("returns 400 INVALID_STATE when submission status is 'pending'", async () => {
        mockFrom.mockReturnValue(
            chainable({
                data: { id: "sub-1", status: "pending", user_id: mockUser.id },
                error: null,
            })
        );

        const { POST } = await import("@/app/api/submissions/[id]/retry/route");
        const res = await POST(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.code).toBe("INVALID_STATE");
    });

    it("returns 400 INVALID_STATE when submission status is 'reviewed'", async () => {
        mockFrom.mockReturnValue(
            chainable({
                data: { id: "sub-1", status: "reviewed", user_id: mockUser.id },
                error: null,
            })
        );

        const { POST } = await import("@/app/api/submissions/[id]/retry/route");
        const res = await POST(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.code).toBe("INVALID_STATE");
    });

    it("returns 400 INVALID_STATE when submission status is 'reviewing'", async () => {
        mockFrom.mockReturnValue(
            chainable({
                data: { id: "sub-1", status: "reviewing", user_id: mockUser.id },
                error: null,
            })
        );

        const { POST } = await import("@/app/api/submissions/[id]/retry/route");
        const res = await POST(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.code).toBe("INVALID_STATE");
    });

    it("returns 404 when challenge is not found", async () => {
        mockFrom.mockReturnValue(
            chainable({
                data: {
                    id: "sub-1",
                    status: "failed",
                    user_id: mockUser.id,
                    challenge_id: "c-missing",
                    field_responses: { q1: "a" },
                },
                error: null,
            })
        );

        mockAdminFrom.mockReturnValue(
            chainable({ data: null, error: null })
        );

        const { POST } = await import("@/app/api/submissions/[id]/retry/route");
        const res = await POST(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.code).toBe("NOT_FOUND");
        expect(json.error).toBe("Challenge not found");
    });

    it("triggers runReview and returns success for a failed submission", async () => {
        const mockSubmission = {
            id: "sub-1",
            status: "failed",
            user_id: mockUser.id,
            challenge_id: "c1",
            field_responses: { q1: "my answer" },
        };
        const mockChallenge = { id: "c1", title: "Test Challenge" };

        mockFrom.mockReturnValue(
            chainable({ data: mockSubmission, error: null })
        );
        mockAdminFrom.mockReturnValue(
            chainable({ data: mockChallenge, error: null })
        );

        const { POST } = await import("@/app/api/submissions/[id]/retry/route");
        const res = await POST(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.message).toBe("Review retry started");
        expect(mockRunReview).toHaveBeenCalledWith(
            "sub-1",
            mockChallenge,
            mockSubmission.field_responses
        );
    });

    it("catches runReview rejection silently without crashing", async () => {
        const mockSubmission = {
            id: "sub-1",
            status: "failed",
            user_id: mockUser.id,
            challenge_id: "c1",
            field_responses: { q1: "a" },
        };
        const mockChallenge = { id: "c1", title: "Challenge" };

        mockFrom.mockReturnValue(
            chainable({ data: mockSubmission, error: null })
        );
        mockAdminFrom.mockReturnValue(
            chainable({ data: mockChallenge, error: null })
        );

        mockRunReview.mockRejectedValue(new Error("Gemini exploded"));

        const { POST } = await import("@/app/api/submissions/[id]/retry/route");
        const res = await POST(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
    });
});
