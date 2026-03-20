import Link from "next/link";
import { getAllQuestions, getQuizQuestions, getCategoryCounts } from "@/lib/interviews/content";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_LABELS, INTERVIEW_CATEGORIES } from "@/types/interview";
import { InterviewLandingStats } from "./InterviewLandingStats";

export const metadata = {
    title: "Interview Prep",
    description: "Practice PM interview questions with flashcards, quizzes, and a searchable question bank.",
};

export default function InterviewsPage() {
    const allQuestions = getAllQuestions();
    const quizQuestions = getQuizQuestions();
    const categoryCounts = getCategoryCounts();

    return (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="font-display font-bold text-[24px] text-text-primary">
                    Interview Prep
                </h1>
                <p className="mt-1 text-[15px] text-text-secondary">
                    Practice PM interview questions across 5 categories. Choose your study mode.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link
                    href="/interviews/flashcards"
                    className="group block bg-bg-card border border-border rounded-[var(--radius-md)] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                >
                    <h2 className="font-display font-bold text-[18px] text-text-primary group-hover:text-accent transition-colors">
                        Flashcards
                    </h2>
                    <p className="mt-1 text-[13px] text-text-secondary leading-relaxed">
                        Flip to reveal answers. Mark as know, not yet, or skip. Track your mastery.
                    </p>
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-bg-secondary rounded-[var(--radius-sm)]">
                        <div className="w-16 h-10 bg-bg-card border border-border rounded-[var(--radius-sm)] flex items-center justify-center">
                            <span className="text-[10px] text-text-tertiary">Q</span>
                        </div>
                        <span className="text-[11px] text-text-tertiary">Tap to flip</span>
                    </div>
                    <InterviewLandingStats mode="flashcards" />
                    <p className="mt-3 text-[12px] text-text-tertiary">
                        {allQuestions.length} questions
                    </p>
                </Link>

                <Link
                    href="/interviews/quiz"
                    className="group block bg-bg-card border border-border rounded-[var(--radius-md)] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                >
                    <h2 className="font-display font-bold text-[18px] text-text-primary group-hover:text-accent transition-colors">
                        Quiz
                    </h2>
                    <p className="mt-1 text-[13px] text-text-secondary leading-relaxed">
                        Multiple-choice questions with instant feedback. Get scored at the end.
                    </p>
                    <div className="mt-4 flex flex-col gap-1 px-3 py-2 bg-bg-secondary rounded-[var(--radius-sm)]">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-2 rounded-full ${
                                    i === 1
                                        ? "bg-accent w-full"
                                        : "bg-border w-3/4"
                                }`}
                            />
                        ))}
                    </div>
                    <InterviewLandingStats mode="quiz" />
                    <p className="mt-3 text-[12px] text-text-tertiary">
                        {quizQuestions.length} quiz questions
                    </p>
                </Link>

                <Link
                    href="/interviews/questions"
                    className="group block bg-bg-card border border-border rounded-[var(--radius-md)] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                >
                    <h2 className="font-display font-bold text-[18px] text-text-primary group-hover:text-accent transition-colors">
                        Question Bank
                    </h2>
                    <p className="mt-1 text-[13px] text-text-secondary leading-relaxed">
                        Browse all questions and answers. Search, filter, and study at your pace.
                    </p>
                    <div className="mt-4 flex flex-col gap-1.5 px-3 py-2 bg-bg-secondary rounded-[var(--radius-sm)]">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="h-1.5 bg-border rounded-full flex-1" />
                                <div className="w-3 h-3 border border-border rounded-sm" />
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-[12px] text-text-tertiary">
                        {allQuestions.length} questions across {INTERVIEW_CATEGORIES.length} categories
                    </p>
                </Link>
            </div>

            <div>
                <h3 className="text-[13px] font-medium text-text-secondary mb-3">
                    Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                    {INTERVIEW_CATEGORIES.map((cat) => (
                        <Badge key={cat} variant="category">
                            {CATEGORY_LABELS[cat]} ({categoryCounts[cat]?.total ?? 0})
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
