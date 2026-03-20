import { Suspense } from "react";
import { getAllQuestions } from "@/lib/interviews/content";
import { FlashcardClient } from "./FlashcardClient";

export const metadata = {
    title: "Flashcards - Interview Prep",
};

export default function FlashcardsPage() {
    const questions = getAllQuestions();

    return (
        <Suspense fallback={<div className="max-w-[680px] mx-auto px-6 py-8" />}>
            <FlashcardClient questions={questions} />
        </Suspense>
    );
}
