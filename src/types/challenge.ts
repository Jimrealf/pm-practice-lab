type Difficulty = "beginner" | "intermediate" | "advanced";
type Category = "strategy" | "execution" | "communication" | "analytics";

interface SubmissionField {
    id: string;
    label: string;
    hint: string;
    type: "text" | "textarea" | "ranked-list";
    required: boolean;
    maxLength?: number;
}

interface RubricDimension {
    id: string;
    name: string;
    description: string;
    criteria: string;
    weight: number;
}

interface ExpertSolutionField {
    fieldId: string;
    content: string;
}

interface Material {
    id: string;
    title: string;
    type: "text" | "data" | "persona" | "org-chart";
    content: string;
}

interface WizardStep {
    id: string;
    title: string;
    fieldIds: string[];
}

interface ChallengeConfig {
    slug: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    category: Category;
    version: number;
    timeEstimateMinutes: number;
    scenarioBrief: string;
    contextMaterials: Material[];
    submissionFields: SubmissionField[];
    rubric: RubricDimension[];
    expertSolution: ExpertSolutionField[];
    steps: WizardStep[];
}

interface Challenge {
    id: string;
    slug: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    category: Category;
    version: number;
    time_estimate_minutes: number;
    scenario_brief: string;
    context_materials: Material[];
    submission_fields: SubmissionField[];
    rubric: RubricDimension[];
    expert_solution: ExpertSolutionField[];
    steps: WizardStep[];
    created_at: string;
    updated_at: string;
}

export type {
    Difficulty,
    Category,
    SubmissionField,
    RubricDimension,
    ExpertSolutionField,
    Material,
    WizardStep,
    ChallengeConfig,
    Challenge,
};
