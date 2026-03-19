import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn().mockImplementation(async () => ({
        auth: { getUser: mockGetUser },
        from: mockFrom,
    })),
}));

const mockUser = { id: "user-123", email: "test@example.com" };

function makeRequest(): Request {
    return new Request("http://localhost/api/submissions/sub-1", {
        method: "GET",
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

describe("GET /api/submissions/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    });

    it("returns 401 UNAUTHORIZED when user is not authenticated", async () => {
        mockGetUser.mockResolvedValue({ data: { user: null } });

        const { GET } = await import("@/app/api/submissions/[id]/route");
        const res = await GET(
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
            chainable({ data: null, error: { message: "Not found" } })
        );

        const { GET } = await import("@/app/api/submissions/[id]/route");
        const res = await GET(
            makeRequest() as any,
            { params: Promise.resolve({ id: "nonexistent" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.code).toBe("NOT_FOUND");
    });

    it("returns 404 when submission belongs to a different user (RLS via .eq user_id)", async () => {
        mockFrom.mockReturnValue(
            chainable({ data: null, error: null })
        );

        const { GET } = await import("@/app/api/submissions/[id]/route");
        const res = await GET(
            makeRequest() as any,
            { params: Promise.resolve({ id: "other-users-sub" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.code).toBe("NOT_FOUND");
    });

    it("includes review data when submission status is 'reviewed'", async () => {
        const mockSubmission = {
            id: "sub-1",
            status: "reviewed",
            user_id: mockUser.id,
            challenge_id: "c1",
        };
        const mockReview = {
            id: "rev-1",
            submission_id: "sub-1",
            score: 85,
            feedback: "Good work",
        };

        let callCount = 0;
        mockFrom.mockImplementation(() => {
            callCount += 1;
            if (callCount === 1) {
                return chainable({ data: mockSubmission, error: null });
            }
            return chainable({ data: mockReview, error: null });
        });

        const { GET } = await import("@/app/api/submissions/[id]/route");
        const res = await GET(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.submission).toEqual(mockSubmission);
        expect(json.data.review).toEqual(mockReview);
    });

    it("returns review=null when submission status is 'pending'", async () => {
        const mockSubmission = {
            id: "sub-1",
            status: "pending",
            user_id: mockUser.id,
        };

        mockFrom.mockReturnValue(
            chainable({ data: mockSubmission, error: null })
        );

        const { GET } = await import("@/app/api/submissions/[id]/route");
        const res = await GET(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.submission).toEqual(mockSubmission);
        expect(json.data.review).toBeNull();
    });

    it("returns review=null when submission status is 'failed'", async () => {
        const mockSubmission = {
            id: "sub-1",
            status: "failed",
            user_id: mockUser.id,
        };

        mockFrom.mockReturnValue(
            chainable({ data: mockSubmission, error: null })
        );

        const { GET } = await import("@/app/api/submissions/[id]/route");
        const res = await GET(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.data.review).toBeNull();
    });

    it("returns review=null when submission status is 'reviewing'", async () => {
        const mockSubmission = {
            id: "sub-1",
            status: "reviewing",
            user_id: mockUser.id,
        };

        mockFrom.mockReturnValue(
            chainable({ data: mockSubmission, error: null })
        );

        const { GET } = await import("@/app/api/submissions/[id]/route");
        const res = await GET(
            makeRequest() as any,
            { params: Promise.resolve({ id: "sub-1" }) }
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.data.review).toBeNull();
    });
});
