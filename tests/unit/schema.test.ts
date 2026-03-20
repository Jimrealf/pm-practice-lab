import { describe, it, expect } from "vitest";
import { reviewResponseSchema, reviewJsonSchema } from "@/lib/gemini/schema";
import { SchemaType } from "@google/generative-ai";

describe("reviewResponseSchema", () => {
    it("has type OBJECT at top level", () => {
        expect(reviewResponseSchema.type).toBe(SchemaType.OBJECT);
    });

    it("has a properties key", () => {
        expect(reviewResponseSchema).toHaveProperty("properties");
    });

    it("has required top-level properties: overallScore, dimensions, summary, comparisonToExpert", () => {
        expect(reviewResponseSchema.required).toEqual(
            expect.arrayContaining(["overallScore", "dimensions", "summary", "comparisonToExpert"])
        );
        expect(reviewResponseSchema.required).toHaveLength(4);
    });

    it("defines overallScore as INTEGER", () => {
        const overallScore = reviewResponseSchema.properties.overallScore;
        expect(overallScore.type).toBe(SchemaType.INTEGER);
    });

    it("defines dimensions as ARRAY", () => {
        expect(reviewResponseSchema.properties.dimensions.type).toBe(SchemaType.ARRAY);
    });

    it("defines dimensions items as OBJECT", () => {
        const items = reviewResponseSchema.properties.dimensions.items;
        expect(items!.type).toBe(SchemaType.OBJECT);
    });

    it("each dimension requires dimensionId, dimensionName, score, feedback, suggestion", () => {
        const items = reviewResponseSchema.properties.dimensions.items;
        expect(items!.required).toEqual(
            expect.arrayContaining(["dimensionId", "dimensionName", "score", "feedback", "suggestion"])
        );
        expect(items!.required).toHaveLength(5);
    });

    it("dimension items have all expected property keys", () => {
        const properties = reviewResponseSchema.properties.dimensions.items!.properties!;
        expect(properties).toHaveProperty("dimensionId");
        expect(properties).toHaveProperty("dimensionName");
        expect(properties).toHaveProperty("score");
        expect(properties).toHaveProperty("feedback");
        expect(properties).toHaveProperty("suggestion");
    });

    it("dimension score is INTEGER", () => {
        const score = reviewResponseSchema.properties.dimensions.items!.properties!.score;
        expect(score.type).toBe(SchemaType.INTEGER);
    });

    it("string fields use STRING type", () => {
        const items = reviewResponseSchema.properties.dimensions.items!.properties!;
        expect(items.dimensionId.type).toBe(SchemaType.STRING);
        expect(items.dimensionName.type).toBe(SchemaType.STRING);
        expect(items.feedback.type).toBe(SchemaType.STRING);
        expect(items.suggestion.type).toBe(SchemaType.STRING);
    });

    it("summary is STRING type", () => {
        expect(reviewResponseSchema.properties.summary.type).toBe(SchemaType.STRING);
    });

    it("comparisonToExpert is STRING type", () => {
        expect(reviewResponseSchema.properties.comparisonToExpert.type).toBe(SchemaType.STRING);
    });

    it("feedback property has a description", () => {
        const feedback = reviewResponseSchema.properties.dimensions.items!.properties!.feedback;
        expect(feedback.description).toBeDefined();
        expect(typeof feedback.description).toBe("string");
    });

    it("suggestion property has a description", () => {
        const suggestion = reviewResponseSchema.properties.dimensions.items!.properties!.suggestion;
        expect(suggestion.description).toBeDefined();
        expect(typeof suggestion.description).toBe("string");
    });
});

describe("reviewJsonSchema", () => {
    it("is valid JSON when parsed", () => {
        expect(() => JSON.parse(reviewJsonSchema)).not.toThrow();
    });

    it("serializes the response schema", () => {
        const parsed = JSON.parse(reviewJsonSchema);
        expect(parsed).toHaveProperty("properties");
        expect(parsed).toHaveProperty("required");
    });
});
