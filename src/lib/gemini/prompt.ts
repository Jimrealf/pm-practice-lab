import type { Challenge } from "@/types/challenge";
import type { FieldResponse } from "@/types/submission";
import { reviewJsonSchema } from "./schema";

export function buildReviewPrompt(
    challenge: Challenge,
    fieldResponses: FieldResponse
): string {
    const fieldSubmissions = challenge.submission_fields
        .map((field) => {
            const response = fieldResponses[field.id] ?? "(no response)";
            return `### ${field.label}\n**Hint:** ${field.hint}\n**Response:**\n${response}`;
        })
        .join("\n\n");

    const rubricDescription = challenge.rubric
        .map(
            (dim) =>
                `- **${dim.name}** (weight: ${dim.weight}): ${dim.description}\n  Criteria: ${dim.criteria}`
        )
        .join("\n");

    const expertSolutionText = challenge.expert_solution
        .map((es) => {
            const field = challenge.submission_fields.find(
                (f) => f.id === es.fieldId
            );
            const label = field?.label ?? es.fieldId;
            return `### ${label}\n${es.content}`;
        })
        .join("\n\n");

    return `You are a senior Product Manager reviewing a practice submission. Your role is to provide constructive, growth-oriented feedback that helps the submitter improve their PM skills.

## Challenge: ${challenge.title}

### Scenario
${challenge.scenario_brief}

## Rubric Dimensions
${rubricDescription}

## Submission
${fieldSubmissions}

## Expert Solution (for comparison)
${expertSolutionText}

## Instructions

1. Score each rubric dimension from 1-10 based on the criteria provided.
2. For each dimension, provide specific feedback on what was done well and a concrete suggestion for improvement.
3. Calculate an overall score (1-10) that reflects the weighted average of dimension scores.
4. Write a 2-3 sentence summary using growth framing: acknowledge strengths first, then identify areas for growth. Never use harsh or discouraging language.
5. Compare the submission to the expert solution, highlighting key differences and where the submission could be strengthened.

## Tone Guidelines
- Use "strength" framing for things done well
- Use "growth area" framing for things that need improvement (never say "weakness" or "failure")
- Use "expert insight" framing when comparing to the expert solution
- Be specific and actionable. Avoid vague praise or criticism.
- Never use em dashes, emoji, or unicode symbols in your response.

Respond with valid JSON matching this schema:
${reviewJsonSchema}`;
}
