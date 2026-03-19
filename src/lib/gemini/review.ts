import { getGeminiModel } from "./client";
import { buildReviewPrompt } from "./prompt";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Challenge } from "@/types/challenge";
import type { FieldResponse } from "@/types/submission";
import type { GeminiReviewResponse, GeminiDimensionScore } from "./schema";
import type { DimensionScore } from "@/types/review";

function mapFeedbackType(score: number): "strength" | "growth" | "expert" {
    if (score >= 7) return "strength";
    if (score >= 4) return "growth";
    return "growth";
}

function toDimensionScores(
    geminiDimensions: GeminiDimensionScore[]
): DimensionScore[] {
    return geminiDimensions.map((dim) => ({
        dimensionId: dim.dimensionId,
        dimensionName: dim.dimensionName,
        score: dim.score,
        feedback: dim.feedback,
        suggestion: dim.suggestion,
        feedbackType: mapFeedbackType(dim.score),
    }));
}

export async function runReview(
    submissionId: string,
    challenge: Challenge,
    fieldResponses: FieldResponse
): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();

    await admin
        .from("submissions")
        .update({ status: "reviewing" })
        .eq("id", submissionId);

    try {
        const model = getGeminiModel();
        const prompt = buildReviewPrompt(challenge, fieldResponses);

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let parsed: GeminiReviewResponse;
        try {
            parsed = JSON.parse(text);
        } catch {
            await admin
                .from("submissions")
                .update({ status: "failed" })
                .eq("id", submissionId);
            return { success: false, error: "Failed to parse Gemini response" };
        }

        const overallScore = Math.max(1, Math.min(10, Math.round(parsed.overallScore)));
        const dimensions = toDimensionScores(parsed.dimensions);

        const { error: reviewError } = await admin.from("reviews").insert({
            submission_id: submissionId,
            overall_score: overallScore,
            dimensions,
            summary: parsed.summary,
            comparison_to_expert: parsed.comparisonToExpert,
        });

        if (reviewError) {
            await admin
                .from("submissions")
                .update({ status: "failed" })
                .eq("id", submissionId);
            return { success: false, error: reviewError.message };
        }

        await admin
            .from("submissions")
            .update({ status: "reviewed" })
            .eq("id", submissionId);

        return { success: true };
    } catch (err) {
        await admin
            .from("submissions")
            .update({ status: "failed" })
            .eq("id", submissionId);
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: message };
    }
}
