type FeedbackType = "strength" | "growth" | "expert";

interface DimensionScore {
    dimensionId: string;
    dimensionName: string;
    score: number;
    feedback: string;
    suggestion: string;
    feedbackType: FeedbackType;
}

interface AIReview {
    id: string;
    submission_id: string;
    overall_score: number;
    dimensions: DimensionScore[];
    summary: string;
    comparison_to_expert: string;
    created_at: string;
}

export type { FeedbackType, DimensionScore, AIReview };
