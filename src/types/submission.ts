type SubmissionStatus = "pending" | "reviewing" | "reviewed" | "failed";

interface FieldResponse {
    [fieldId: string]: string;
}

interface Submission {
    id: string;
    user_id: string;
    challenge_id: string;
    challenge_version: number;
    field_responses: FieldResponse;
    status: SubmissionStatus;
    created_at: string;
}

interface Draft {
    id: string;
    user_id: string;
    challenge_id: string;
    field_responses: FieldResponse;
    current_step: number;
    updated_at: string;
}

export type { SubmissionStatus, FieldResponse, Submission, Draft };
