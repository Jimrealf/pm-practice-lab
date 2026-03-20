import { getAllQuestions } from "@/lib/interviews/content";
import { QuestionBankClient } from "./QuestionBankClient";

export const metadata = {
    title: "Question Bank | Interview Prep | PM Practice Lab",
};

export default function QuestionsPage() {
    const questions = getAllQuestions();

    return <QuestionBankClient questions={questions} />;
}
