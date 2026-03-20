import { getQuizQuestions, getCategoryCounts } from "@/lib/interviews/content";
import { QuizClient } from "./QuizClient";

export const metadata = {
    title: "Quiz - Interview Prep",
};

export default function QuizPage() {
    const quizQuestions = getQuizQuestions();
    const categoryCounts = getCategoryCounts();

    return (
        <QuizClient
            allQuizQuestions={quizQuestions}
            categoryCounts={categoryCounts}
        />
    );
}
