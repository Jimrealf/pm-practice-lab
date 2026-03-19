import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/gemini/schema", () => ({
    reviewJsonSchema: '{"mocked": "schema"}',
}));

import { buildReviewPrompt } from "@/lib/gemini/prompt";
import type { Challenge } from "@/types/challenge";
import type { FieldResponse } from "@/types/submission";

function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
    return {
        id: "ch-1",
        slug: "test-challenge",
        title: "Prioritization Framework",
        description: "A test challenge",
        difficulty: "intermediate",
        category: "strategy",
        version: 1,
        time_estimate_minutes: 30,
        scenario_brief: "You are the PM of a B2B SaaS product facing competing priorities.",
        context_materials: [],
        submission_fields: [
            {
                id: "field-1",
                label: "Priority Matrix",
                hint: "List your top priorities",
                type: "textarea",
                required: true,
            },
            {
                id: "field-2",
                label: "Rationale",
                hint: "Explain your reasoning",
                type: "textarea",
                required: true,
            },
        ],
        rubric: [
            {
                id: "dim-1",
                name: "Strategic Thinking",
                description: "Ability to prioritize based on business impact",
                criteria: "Uses a structured framework with clear trade-off analysis",
                weight: 0.4,
            },
            {
                id: "dim-2",
                name: "Communication",
                description: "Clarity and persuasiveness of explanation",
                criteria: "Rationale is well-structured and addresses stakeholder concerns",
                weight: 0.6,
            },
        ],
        expert_solution: [
            { fieldId: "field-1", content: "Expert priority matrix content" },
            { fieldId: "field-2", content: "Expert rationale content" },
        ],
        steps: [],
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
        ...overrides,
    };
}

describe("buildReviewPrompt", () => {
    it("contains the challenge title", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, { "field-1": "My answer" });
        expect(result).toContain("Prioritization Framework");
    });

    it("contains the scenario brief", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("You are the PM of a B2B SaaS product facing competing priorities.");
    });

    it("contains each rubric dimension name", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("Strategic Thinking");
        expect(result).toContain("Communication");
    });

    it("contains rubric dimension weights", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("weight: 0.4");
        expect(result).toContain("weight: 0.6");
    });

    it("contains rubric dimension descriptions", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("Ability to prioritize based on business impact");
        expect(result).toContain("Clarity and persuasiveness of explanation");
    });

    it("contains rubric dimension criteria", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("Uses a structured framework with clear trade-off analysis");
        expect(result).toContain("Rationale is well-structured and addresses stakeholder concerns");
    });

    it("contains field labels and hints in submission section", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, { "field-1": "Answer 1", "field-2": "Answer 2" });
        expect(result).toContain("### Priority Matrix");
        expect(result).toContain("**Hint:** List your top priorities");
        expect(result).toContain("### Rationale");
        expect(result).toContain("**Hint:** Explain your reasoning");
    });

    it("contains the field response values", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, { "field-1": "My priority matrix", "field-2": "My rationale" });
        expect(result).toContain("My priority matrix");
        expect(result).toContain("My rationale");
    });

    it("uses '(no response)' for missing field responses", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("(no response)");
    });

    it("uses '(no response)' for partially missing field responses", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, { "field-1": "Some answer" });
        expect(result).toContain("Some answer");
        expect(result).toContain("(no response)");
    });

    it("contains expert solution text with correct field labels", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("### Priority Matrix");
        expect(result).toContain("Expert priority matrix content");
        expect(result).toContain("### Rationale");
        expect(result).toContain("Expert rationale content");
    });

    it("falls back to fieldId when field label not found in submission_fields", () => {
        const challenge = makeChallenge({
            expert_solution: [
                { fieldId: "unknown-field", content: "Some expert content" },
            ],
        });
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("### unknown-field");
        expect(result).toContain("Some expert content");
    });

    it("contains the JSON schema from the schema module", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain('{"mocked": "schema"}');
    });

    it("contains tone guidelines about no em dashes", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("Never use em dashes");
    });

    it("contains tone guidelines about growth framing", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("growth area");
        expect(result).toContain("strength");
        expect(result).toContain("expert insight");
    });

    it("works with empty rubric", () => {
        const challenge = makeChallenge({ rubric: [] });
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("## Rubric Dimensions");
    });

    it("works with empty submission_fields", () => {
        const challenge = makeChallenge({
            submission_fields: [],
            expert_solution: [],
        });
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("## Submission");
    });

    it("works with empty expert_solution", () => {
        const challenge = makeChallenge({ expert_solution: [] });
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("## Expert Solution");
    });

    it("handles special characters in responses", () => {
        const challenge = makeChallenge();
        const responses: FieldResponse = {
            "field-1": 'Response with "quotes" & <html> tags',
            "field-2": "Response with\nnewlines\nand\ttabs",
        };
        const result = buildReviewPrompt(challenge, responses);
        expect(result).toContain('Response with "quotes" & <html> tags');
        expect(result).toContain("Response with\nnewlines\nand\ttabs");
    });

    it("contains scoring instructions", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("Score each rubric dimension from 1-10");
    });

    it("references the challenge section header", () => {
        const challenge = makeChallenge();
        const result = buildReviewPrompt(challenge, {});
        expect(result).toContain("## Challenge: Prioritization Framework");
    });
});
