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

export const reviewJsonSchema = `{
  "type": "object",
  "properties": {
    "overallScore": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "description": "Overall score from 1 to 10"
    },
    "dimensions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "dimensionId": { "type": "string" },
          "dimensionName": { "type": "string" },
          "score": { "type": "integer", "minimum": 1, "maximum": 10 },
          "feedback": { "type": "string", "description": "What the submission did well or poorly on this dimension" },
          "suggestion": { "type": "string", "description": "Specific, actionable suggestion for improvement" }
        },
        "required": ["dimensionId", "dimensionName", "score", "feedback", "suggestion"]
      }
    },
    "summary": {
      "type": "string",
      "description": "2-3 sentence overall assessment using growth framing"
    },
    "comparisonToExpert": {
      "type": "string",
      "description": "How this submission compares to the expert solution, highlighting key gaps and strengths"
    }
  },
  "required": ["overallScore", "dimensions", "summary", "comparisonToExpert"]
}`;

export type { GeminiDimensionScore, GeminiReviewResponse };
