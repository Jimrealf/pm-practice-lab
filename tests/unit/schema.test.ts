import { describe, it, expect } from "vitest";
import { reviewJsonSchema } from "@/lib/gemini/schema";

describe("reviewJsonSchema", () => {
    it("is valid JSON when parsed", () => {
        expect(() => JSON.parse(reviewJsonSchema)).not.toThrow();
    });

    it("parses to an object", () => {
        const schema = JSON.parse(reviewJsonSchema);
        expect(typeof schema).toBe("object");
        expect(schema).not.toBeNull();
    });

    it("has type 'object' at top level", () => {
        const schema = JSON.parse(reviewJsonSchema);
        expect(schema.type).toBe("object");
    });

    it("has a properties key", () => {
        const schema = JSON.parse(reviewJsonSchema);
        expect(schema).toHaveProperty("properties");
    });

    it("has required top-level properties: overallScore, dimensions, summary, comparisonToExpert", () => {
        const schema = JSON.parse(reviewJsonSchema);
        expect(schema.required).toEqual(
            expect.arrayContaining(["overallScore", "dimensions", "summary", "comparisonToExpert"])
        );
        expect(schema.required).toHaveLength(4);
    });

    it("defines overallScore as integer", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const overallScore = schema.properties.overallScore;
        expect(overallScore.type).toBe("integer");
    });

    it("defines overallScore with minimum 1", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const overallScore = schema.properties.overallScore;
        expect(overallScore.minimum).toBe(1);
    });

    it("defines overallScore with maximum 10", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const overallScore = schema.properties.overallScore;
        expect(overallScore.maximum).toBe(10);
    });

    it("defines dimensions as array", () => {
        const schema = JSON.parse(reviewJsonSchema);
        expect(schema.properties.dimensions.type).toBe("array");
    });

    it("defines dimensions items as objects", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const items = schema.properties.dimensions.items;
        expect(items.type).toBe("object");
    });

    it("each dimension requires dimensionId, dimensionName, score, feedback, suggestion", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const items = schema.properties.dimensions.items;
        expect(items.required).toEqual(
            expect.arrayContaining(["dimensionId", "dimensionName", "score", "feedback", "suggestion"])
        );
        expect(items.required).toHaveLength(5);
    });

    it("dimension items have all expected property keys", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const properties = schema.properties.dimensions.items.properties;
        expect(properties).toHaveProperty("dimensionId");
        expect(properties).toHaveProperty("dimensionName");
        expect(properties).toHaveProperty("score");
        expect(properties).toHaveProperty("feedback");
        expect(properties).toHaveProperty("suggestion");
    });

    it("dimension score is integer with min 1 max 10", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const score = schema.properties.dimensions.items.properties.score;
        expect(score.type).toBe("integer");
        expect(score.minimum).toBe(1);
        expect(score.maximum).toBe(10);
    });

    it("dimensionId is string type", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const dimId = schema.properties.dimensions.items.properties.dimensionId;
        expect(dimId.type).toBe("string");
    });

    it("dimensionName is string type", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const dimName = schema.properties.dimensions.items.properties.dimensionName;
        expect(dimName.type).toBe("string");
    });

    it("feedback is string type", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const feedback = schema.properties.dimensions.items.properties.feedback;
        expect(feedback.type).toBe("string");
    });

    it("suggestion is string type", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const suggestion = schema.properties.dimensions.items.properties.suggestion;
        expect(suggestion.type).toBe("string");
    });

    it("summary is string type", () => {
        const schema = JSON.parse(reviewJsonSchema);
        expect(schema.properties.summary.type).toBe("string");
    });

    it("comparisonToExpert is string type", () => {
        const schema = JSON.parse(reviewJsonSchema);
        expect(schema.properties.comparisonToExpert.type).toBe("string");
    });

    it("feedback property has a description", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const feedback = schema.properties.dimensions.items.properties.feedback;
        expect(feedback.description).toBeDefined();
        expect(typeof feedback.description).toBe("string");
    });

    it("suggestion property has a description", () => {
        const schema = JSON.parse(reviewJsonSchema);
        const suggestion = schema.properties.dimensions.items.properties.suggestion;
        expect(suggestion.description).toBeDefined();
        expect(typeof suggestion.description).toBe("string");
    });
});
