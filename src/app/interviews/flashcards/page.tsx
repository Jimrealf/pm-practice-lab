import { Suspense } from "react";
import { getAllQuestions } from "@/lib/interviews/content";
import { FlashcardClient } from "./FlashcardClient";

export const metadata = {
    title: "Flashcards - Interview Prep",
};

export default function FlashcardsPage() {
    const questions = getAllQuestions();

    return (
        <Suspense>
            <FlashcardClient questions={questions} />
        </Suspense>
    );
}
