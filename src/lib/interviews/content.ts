import type { InterviewQuestion, InterviewCategory } from "@/types/interview";

import behavioral from "@/content/interviews/behavioral.json";
import productDesign from "@/content/interviews/product-design.json";
import estimation from "@/content/interviews/estimation.json";
import strategy from "@/content/interviews/strategy.json";
import technical from "@/content/interviews/technical.json";

const allQuestions: InterviewQuestion[] = [
    ...behavioral,
    ...productDesign,
    ...estimation,
    ...strategy,
    ...technical,
] as InterviewQuestion[];

export function getAllQuestions(): InterviewQuestion[] {
    return allQuestions;
}

export function getQuestionsByCategory(category: InterviewCategory): InterviewQuestion[] {
    return allQuestions.filter((q) => q.category === category);
}

export function getQuizQuestions(category?: InterviewCategory): InterviewQuestion[] {
    const filtered = category ? getQuestionsByCategory(category) : allQuestions;
    return filtered.filter((q) => q.multipleChoice != null);
}

export function getCategoryCounts(): Record<InterviewCategory, { total: number; quiz: number }> {
    const counts = {} as Record<InterviewCategory, { total: number; quiz: number }>;
    for (const q of allQuestions) {
        if (!counts[q.category]) {
            counts[q.category] = { total: 0, quiz: 0 };
        }
        counts[q.category].total++;
        if (q.multipleChoice) {
            counts[q.category].quiz++;
        }
    }
    return counts;
}

export function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
