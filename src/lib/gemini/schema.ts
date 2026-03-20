import { type Schema, SchemaType } from "@google/generative-ai";

interface GeminiDimensionScore {
    dimensionId: string;
    dimensionName: string;
    score: number;
    feedback: string;
    suggestion: string;
}

interface GeminiReviewResponse {
    overallScore: number;
    dimensions: GeminiDimensionScore[];
    summary: string;
    comparisonToExpert: string;
}

export const reviewResponseSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        overallScore: {
            type: SchemaType.INTEGER,
            description: "Overall score from 1 to 10",
        },
        dimensions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    dimensionId: { type: SchemaType.STRING },
                    dimensionName: { type: SchemaType.STRING },
                    score: {
                        type: SchemaType.INTEGER,
                        description: "Score from 1 to 10",
                    },
                    feedback: {
                        type: SchemaType.STRING,
                        description: "What the submission did well or poorly on this dimension",
                    },
                    suggestion: {
                        type: SchemaType.STRING,
                        description: "Specific, actionable suggestion for improvement",
                    },
                },
                required: ["dimensionId", "dimensionName", "score", "feedback", "suggestion"],
            },
        },
        summary: {
            type: SchemaType.STRING,
            description: "2-3 sentence overall assessment using growth framing",
        },
        comparisonToExpert: {
            type: SchemaType.STRING,
            description: "How this submission compares to the expert solution, highlighting key gaps and strengths",
        },
    },
    required: ["overallScore", "dimensions", "summary", "comparisonToExpert"],
};

export const reviewJsonSchema = JSON.stringify(reviewResponseSchema, null, 2);

export type { GeminiDimensionScore, GeminiReviewResponse };
