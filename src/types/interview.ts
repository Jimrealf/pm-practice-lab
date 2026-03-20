export interface InterviewQuestion {
    id: string;
    category: InterviewCategory;
    difficulty: "beginner" | "intermediate" | "advanced";
    question: string;
    answer: string;
    explanation: string;
    tags: string[];
    multipleChoice?: {
        options: string[];
        correctIndex: number;
    };
}

export type InterviewCategory =
    | "behavioral"
    | "product-design"
    | "estimation"
    | "strategy"
    | "technical";

export type FlashcardMark = "known" | "not-yet" | "skipped";

export interface FlashcardProgress {
    mark: FlashcardMark;
    lastSeen: string;
}

export interface QuizBestScore {
    score: number;
    total: number;
    date: string;
}

export interface InterviewProgress {
    flashcards: Record<string, FlashcardProgress>;
    quizBestScores: Record<string, QuizBestScore>;
}

export interface QuizSession {
    questions: InterviewQuestion[];
    currentIndex: number;
    answers: Record<string, number>;
    completed: boolean;
}

export const INTERVIEW_CATEGORIES: InterviewCategory[] = [
    "behavioral",
    "product-design",
    "estimation",
    "strategy",
    "technical",
];

export const CATEGORY_LABELS: Record<InterviewCategory, string> = {
    behavioral: "Behavioral",
    "product-design": "Product Design",
    estimation: "Estimation",
    strategy: "Strategy",
    technical: "Technical",
};
