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

function makeRequest(body?: unknown): Request {
    if (body === undefined) {
        return new Request("http://localhost/api/submit", {
            method: "POST",
            body: "NOT_JSON{{{",
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Request("http://localhost/api/submit", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    });
}

function chainable(terminalValue: unknown = { data: null, error: null, count: null }) {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};

    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.upsert = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.gte = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue(terminalValue);

    chain.then = vi.fn().mockImplementation((resolve: (val: unknown) => void) => {
        return Promise.resolve(terminalValue).then(resolve);
    });

    return chain;
}

describe("POST /api/submit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: mockUser } });
        mockRunReview.mockResolvedValue(undefined);
    });

    it("returns 401 UNAUTHORIZED when user is not authenticated", async () => {
        mockGetUser.mockResolvedValue({ data: { user: null } });

        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(makeRequest({ challengeId: "c1", fieldResponses: {} }) as any);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.code).toBe("UNAUTHORIZED");
        expect(json.success).toBe(false);
    });

    it("returns 400 VALIDATION_ERROR for invalid JSON body", async () => {
        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(makeRequest() as any);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when challengeId is missing", async () => {
        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(makeRequest({ fieldResponses: { q1: "a" } }) as any);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when fieldResponses is missing", async () => {
        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(makeRequest({ challengeId: "c1" }) as any);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when challengeId is an empty string (falsy)", async () => {
        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(
            makeRequest({ challengeId: "", fieldResponses: { q1: "answer" } }) as any
        );
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.code).toBe("VALIDATION_ERROR");
    });

    it("allows submission when count is 4 (under limit)", async () => {
        const countChain = chainable({ data: null, error: null, count: 4 });
        const insertChain = chainable({
            data: { id: "sub-1" },
            error: null,
        });

        mockFrom.mockImplementation((table: string) => {
            if ((mockFrom as any).__callIndex === undefined) {
                (mockFrom as any).__callIndex = 0;
            }
            (mockFrom as any).__callIndex += 1;
            const idx = (mockFrom as any).__callIndex;

            if (table === "submissions" && idx === 1) return countChain;
            if (table === "submissions" && idx === 2) return insertChain;
            return chainable();
        });

        mockAdminFrom.mockReturnValue(
            chainable({ data: null, error: null })
        );

        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(
            makeRequest({
                challengeId: "c1",
                challengeVersion: 1,
                fieldResponses: { q1: "a" },
            }) as any
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.id).toBe("sub-1");
    });

    it("returns 429 RATE_LIMITED when count is 5", async () => {
        const countChain = chainable({ data: null, error: null, count: 5 });
        mockFrom.mockReturnValue(countChain);

        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(
            makeRequest({
                challengeId: "c1",
                challengeVersion: 1,
                fieldResponses: { q1: "a" },
            }) as any
        );
        const json = await res.json();

        expect(res.status).toBe(429);
        expect(json.code).toBe("RATE_LIMITED");
    });

    it("allows submission when count is null (query error)", async () => {
        const countChain = chainable({ data: null, error: null, count: null });
        const insertChain = chainable({
            data: { id: "sub-2" },
            error: null,
        });

        let callCount = 0;
        mockFrom.mockImplementation((table: string) => {
            callCount += 1;
            if (table === "submissions" && callCount === 1) return countChain;
            if (table === "submissions" && callCount === 2) return insertChain;
            return chainable();
        });

        mockAdminFrom.mockReturnValue(
            chainable({ data: null, error: null })
        );

        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(
            makeRequest({
                challengeId: "c1",
                challengeVersion: 1,
                fieldResponses: { q1: "a" },
            }) as any
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
    });

    it("returns 500 INSERT_FAILED when supabase insert errors", async () => {
        const countChain = chainable({ data: null, error: null, count: 0 });
        const insertChain = chainable({
            data: null,
            error: { message: "DB insert failed" },
        });

        let callCount = 0;
        mockFrom.mockImplementation((table: string) => {
            callCount += 1;
            if (table === "submissions" && callCount === 1) return countChain;
            if (table === "submissions" && callCount === 2) return insertChain;
            return chainable();
        });

        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(
            makeRequest({
                challengeId: "c1",
                challengeVersion: 1,
                fieldResponses: { q1: "a" },
            }) as any
        );
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.code).toBe("INSERT_FAILED");
        expect(json.error).toBe("DB insert failed");
    });

    it("returns success with submission id on happy path", async () => {
        const countChain = chainable({ data: null, error: null, count: 0 });
        const insertChain = chainable({
            data: { id: "sub-happy" },
            error: null,
        });

        let callCount = 0;
        mockFrom.mockImplementation(() => {
            callCount += 1;
            if (callCount === 1) return countChain;
            if (callCount === 2) return insertChain;
            return chainable();
        });

        const mockChallenge = { id: "c1", title: "Test Challenge" };
        mockAdminFrom.mockReturnValue(
            chainable({ data: mockChallenge, error: null })
        );

        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(
            makeRequest({
                challengeId: "c1",
                challengeVersion: 1,
                fieldResponses: { q1: "a" },
            }) as any
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.id).toBe("sub-happy");
    });

    it("triggers runReview when challenge is found", async () => {
        const countChain = chainable({ data: null, error: null, count: 0 });
        const insertChain = chainable({
            data: { id: "sub-review" },
            error: null,
        });

        let callCount = 0;
        mockFrom.mockImplementation(() => {
            callCount += 1;
            if (callCount === 1) return countChain;
            if (callCount === 2) return insertChain;
            return chainable();
        });

        const mockChallenge = { id: "c1", title: "Challenge" };
        mockAdminFrom.mockReturnValue(
            chainable({ data: mockChallenge, error: null })
        );

        const fieldResponses = { q1: "answer" };
        const { POST } = await import("@/app/api/submit/route");
        await POST(
            makeRequest({
                challengeId: "c1",
                challengeVersion: 1,
                fieldResponses,
            }) as any
        );

        expect(mockRunReview).toHaveBeenCalledWith(
            "sub-review",
            mockChallenge,
            fieldResponses
        );
    });

    it("does not trigger runReview when challenge is not found", async () => {
        const countChain = chainable({ data: null, error: null, count: 0 });
        const insertChain = chainable({
            data: { id: "sub-no-challenge" },
            error: null,
        });

        let callCount = 0;
        mockFrom.mockImplementation(() => {
            callCount += 1;
            if (callCount === 1) return countChain;
            if (callCount === 2) return insertChain;
            return chainable();
        });

        mockAdminFrom.mockReturnValue(
            chainable({ data: null, error: null })
        );

        const { POST } = await import("@/app/api/submit/route");
        await POST(
            makeRequest({
                challengeId: "c1",
                challengeVersion: 1,
                fieldResponses: { q1: "a" },
            }) as any
        );

        expect(mockRunReview).not.toHaveBeenCalled();
    });

    it("catches runReview rejection silently without crashing", async () => {
        const countChain = chainable({ data: null, error: null, count: 0 });
        const insertChain = chainable({
            data: { id: "sub-reject" },
            error: null,
        });

        let callCount = 0;
        mockFrom.mockImplementation(() => {
            callCount += 1;
            if (callCount === 1) return countChain;
            if (callCount === 2) return insertChain;
            return chainable();
        });

        mockAdminFrom.mockReturnValue(
            chainable({ data: { id: "c1" }, error: null })
        );

        mockRunReview.mockRejectedValue(new Error("Gemini API failure"));

        const { POST } = await import("@/app/api/submit/route");
        const res = await POST(
            makeRequest({
                challengeId: "c1",
                challengeVersion: 1,
                fieldResponses: { q1: "a" },
            }) as any
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
    });
});
