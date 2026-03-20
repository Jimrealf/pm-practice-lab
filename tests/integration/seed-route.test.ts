import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockAdminFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn().mockImplementation(() => ({
        from: mockAdminFrom,
    })),
}));

const mockReaddirSync = vi.fn();
const mockReadFileSync = vi.fn();

vi.mock("fs", () => ({
    default: {
        readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
        readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
    },
    readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
    readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
}));

vi.mock("path", async () => {
    const actual = await vi.importActual<typeof import("path")>("path");
    return {
        default: {
            ...actual,
            join: (...segments: string[]) => segments.join("/"),
        },
        join: (...segments: string[]) => segments.join("/"),
    };
});

function chainable(terminalValue: unknown = { data: null, error: null }) {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};

    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.upsert = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue(terminalValue);

    chain.upsert = vi.fn().mockResolvedValue(terminalValue);

    return chain;
}

function makeChallengeConfig(slug: string) {
    return {
        slug,
        title: `Challenge ${slug}`,
        description: `Description for ${slug}`,
        difficulty: "medium",
        category: "product-strategy",
        version: 1,
        timeEstimateMinutes: 30,
        scenarioBrief: "Brief",
        contextMaterials: [],
        submissionFields: [],
        rubric: [],
        expertSolution: null,
        steps: [],
    };
}

describe("POST /api/seed", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        process.env.NODE_ENV = "test";
    });

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
    });

    it("returns 403 FORBIDDEN in production without valid key", async () => {
        process.env.NODE_ENV = "production";
        process.env.SEED_SECRET = "test-secret";

        const { POST } = await import("@/app/api/seed/route");
        const res = await POST(new Request("http://localhost/api/seed"));
        const json = await res.json();

        expect(res.status).toBe(403);
        expect(json.code).toBe("FORBIDDEN");
        expect(json.success).toBe(false);
    });

    it("allows production seed with valid key", async () => {
        process.env.NODE_ENV = "production";
        process.env.SEED_SECRET = "test-secret";

        mockReaddirSync.mockReturnValue([]);

        const { POST } = await import("@/app/api/seed/route");
        const res = await POST(new Request("http://localhost/api/seed?key=test-secret"));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
    });

    it("loads challenges from JSON files and upserts them", async () => {
        const challenge1 = makeChallengeConfig("challenge-1");
        const challenge2 = makeChallengeConfig("challenge-2");

        mockReaddirSync.mockReturnValue([
            "challenge-1.json",
            "challenge-2.json",
            "README.md",
        ]);
        mockReadFileSync.mockImplementation((filePath: string) => {
            if (filePath.includes("challenge-1")) return JSON.stringify(challenge1);
            if (filePath.includes("challenge-2")) return JSON.stringify(challenge2);
            return "{}";
        });

        mockAdminFrom.mockReturnValue(
            chainable({ data: null, error: null })
        );

        const { POST } = await import("@/app/api/seed/route");
        const res = await POST(new Request("http://localhost/api/seed"));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.message).toBe("Seeded 2 challenges");

        expect(mockAdminFrom).toHaveBeenCalledWith("challenges");
    });

    it("upserts in batches of 10", async () => {
        const files = Array.from({ length: 25 }, (_, i) => `challenge-${i}.json`);
        const configs = Array.from({ length: 25 }, (_, i) =>
            makeChallengeConfig(`challenge-${i}`)
        );

        mockReaddirSync.mockReturnValue(files);
        mockReadFileSync.mockImplementation((filePath: string) => {
            const match = filePath.match(/challenge-(\d+)/);
            if (match) return JSON.stringify(configs[parseInt(match[1])]);
            return "{}";
        });

        const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
        mockAdminFrom.mockReturnValue({
            upsert: upsertMock,
        });

        const { POST } = await import("@/app/api/seed/route");
        const res = await POST(new Request("http://localhost/api/seed"));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.message).toBe("Seeded 25 challenges");

        expect(upsertMock).toHaveBeenCalledTimes(3);
    });

    it("returns 500 with seededSoFar count on batch failure", async () => {
        const files = Array.from({ length: 15 }, (_, i) => `challenge-${i}.json`);
        const configs = Array.from({ length: 15 }, (_, i) =>
            makeChallengeConfig(`challenge-${i}`)
        );

        mockReaddirSync.mockReturnValue(files);
        mockReadFileSync.mockImplementation((filePath: string) => {
            const match = filePath.match(/challenge-(\d+)/);
            if (match) return JSON.stringify(configs[parseInt(match[1])]);
            return "{}";
        });

        let batchCall = 0;
        const upsertMock = vi.fn().mockImplementation(() => {
            batchCall += 1;
            if (batchCall === 1) {
                return Promise.resolve({ data: null, error: null });
            }
            return Promise.resolve({
                data: null,
                error: { message: "Constraint violation" },
            });
        });

        mockAdminFrom.mockReturnValue({
            upsert: upsertMock,
        });

        const { POST } = await import("@/app/api/seed/route");
        const res = await POST(new Request("http://localhost/api/seed"));
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.code).toBe("SEED_FAILED");
        expect(json.success).toBe(false);
        expect(json.data.seededSoFar).toBe(10);
        expect(json.error).toContain("Batch 2 failed");
        expect(json.error).toContain("Constraint violation");
    });

    it("handles empty directory with no JSON files", async () => {
        mockReaddirSync.mockReturnValue([]);

        const { POST } = await import("@/app/api/seed/route");
        const res = await POST(new Request("http://localhost/api/seed"));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.message).toBe("Seeded 0 challenges");
    });

    it("handles directory with only non-JSON files", async () => {
        mockReaddirSync.mockReturnValue(["README.md", "notes.txt", ".gitkeep"]);

        const { POST } = await import("@/app/api/seed/route");
        const res = await POST(new Request("http://localhost/api/seed"));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.message).toBe("Seeded 0 challenges");
    });
});
