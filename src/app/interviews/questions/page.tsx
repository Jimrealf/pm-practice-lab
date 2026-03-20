import { getAllQuestions } from "@/lib/interviews/content";
import { QuestionBankClient } from "./QuestionBankClient";

export const metadata = {
    title: "Question Bank - Interview Prep",
};

export default function QuestionsPage() {
    const questions = getAllQuestions();

    return <QuestionBankClient questions={questions} />;
}
