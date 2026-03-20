import { getAllQuestions } from "@/lib/interviews/content";
import { FlashcardClient } from "./FlashcardClient";

export const metadata = {
    title: "Flashcards | Interview Prep | PM Practice Lab",
};

export default function FlashcardsPage() {
    const questions = getAllQuestions();

    return <FlashcardClient questions={questions} />;
}
