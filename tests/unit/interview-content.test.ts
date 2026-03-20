import { describe, it, expect } from "vitest";
import {
    getAllQuestions,
    getQuestionsByCategory,
    getQuizQuestions,
    getCategoryCounts,
    shuffleArray,
} from "@/lib/interviews/content";
import type { InterviewCategory } from "@/types/interview";
import { INTERVIEW_CATEGORIES } from "@/types/interview";

describe("Interview content", () => {
    describe("getAllQuestions", () => {
        it("returns a non-empty array", () => {
            const questions = getAllQuestions();
            expect(questions.length).toBeGreaterThan(0);
        });

        it("every question has required fields", () => {
            for (const q of getAllQuestions()) {
                expect(q.id).toBeTruthy();
                expect(q.category).toBeTruthy();
                expect(q.difficulty).toBeTruthy();
                expect(q.question).toBeTruthy();
                expect(q.answer).toBeTruthy();
                expect(Array.isArray(q.tags)).toBe(true);
            }
        });

        it("every question has a unique id", () => {
            const ids = getAllQuestions().map((q) => q.id);
            const unique = new Set(ids);
            expect(unique.size).toBe(ids.length);
        });

        it("every question has a valid category", () => {
            for (const q of getAllQuestions()) {
                expect(INTERVIEW_CATEGORIES).toContain(q.category);
            }
        });

        it("every question has a valid difficulty", () => {
            const validDifficulties = ["beginner", "intermediate", "advanced"];
            for (const q of getAllQuestions()) {
                expect(validDifficulties).toContain(q.difficulty);
            }
        });
    });

    describe("getQuestionsByCategory", () => {
        it("returns only questions from the specified category", () => {
            const behavioral = getQuestionsByCategory("behavioral");
            expect(behavioral.length).toBeGreaterThan(0);
            for (const q of behavioral) {
                expect(q.category).toBe("behavioral");
            }
        });

        it("returns questions for every category", () => {
            for (const cat of INTERVIEW_CATEGORIES) {
                const questions = getQuestionsByCategory(cat);
                expect(questions.length).toBeGreaterThan(0);
            }
        });

        it("all categories sum to total", () => {
            const total = getAllQuestions().length;
            const categorySum = INTERVIEW_CATEGORIES.reduce(
                (sum, cat) => sum + getQuestionsByCategory(cat).length,
                0
            );
            expect(categorySum).toBe(total);
        });
    });

    describe("getQuizQuestions", () => {
        it("returns only questions with multipleChoice", () => {
            const quiz = getQuizQuestions();
            for (const q of quiz) {
                expect(q.multipleChoice).toBeDefined();
                expect(q.multipleChoice!.options.length).toBeGreaterThanOrEqual(2);
                expect(q.multipleChoice!.correctIndex).toBeGreaterThanOrEqual(0);
                expect(q.multipleChoice!.correctIndex).toBeLessThan(
                    q.multipleChoice!.options.length
                );
            }
        });

        it("returns fewer or equal questions than total", () => {
            expect(getQuizQuestions().length).toBeLessThanOrEqual(
                getAllQuestions().length
            );
        });

        it("filters by category when specified", () => {
            const behavioral = getQuizQuestions("behavioral");
            for (const q of behavioral) {
                expect(q.category).toBe("behavioral");
                expect(q.multipleChoice).toBeDefined();
            }
        });

        it("returns subset of category questions", () => {
            for (const cat of INTERVIEW_CATEGORIES) {
                const allInCat = getQuestionsByCategory(cat).length;
                const quizInCat = getQuizQuestions(cat).length;
                expect(quizInCat).toBeLessThanOrEqual(allInCat);
            }
        });
    });

    describe("getCategoryCounts", () => {
        it("has an entry for every category with questions", () => {
            const counts = getCategoryCounts();
            for (const cat of INTERVIEW_CATEGORIES) {
                expect(counts[cat]).toBeDefined();
                expect(counts[cat].total).toBeGreaterThan(0);
            }
        });

        it("total count matches getQuestionsByCategory", () => {
            const counts = getCategoryCounts();
            for (const cat of INTERVIEW_CATEGORIES) {
                expect(counts[cat].total).toBe(
                    getQuestionsByCategory(cat).length
                );
            }
        });

        it("quiz count matches getQuizQuestions per category", () => {
            const counts = getCategoryCounts();
            for (const cat of INTERVIEW_CATEGORIES) {
                expect(counts[cat].quiz).toBe(getQuizQuestions(cat).length);
            }
        });

        it("quiz count is always <= total count", () => {
            const counts = getCategoryCounts();
            for (const cat of INTERVIEW_CATEGORIES) {
                expect(counts[cat].quiz).toBeLessThanOrEqual(counts[cat].total);
            }
        });
    });

    describe("shuffleArray", () => {
        it("returns an array of the same length", () => {
            const arr = [1, 2, 3, 4, 5];
            expect(shuffleArray(arr)).toHaveLength(5);
        });

        it("contains the same elements", () => {
            const arr = [1, 2, 3, 4, 5];
            const shuffled = shuffleArray(arr);
            expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
        });

        it("does not mutate the original array", () => {
            const arr = [1, 2, 3, 4, 5];
            const copy = [...arr];
            shuffleArray(arr);
            expect(arr).toEqual(copy);
        });

        it("returns empty array for empty input", () => {
            expect(shuffleArray([])).toEqual([]);
        });

        it("returns single element for single element input", () => {
            expect(shuffleArray([42])).toEqual([42]);
        });

        it("eventually produces a different order (statistical)", () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            let sawDifferent = false;
            for (let i = 0; i < 20; i++) {
                const shuffled = shuffleArray(arr);
                if (shuffled.some((v, idx) => v !== arr[idx])) {
                    sawDifferent = true;
                    break;
                }
            }
            expect(sawDifferent).toBe(true);
        });
    });

    describe("multipleChoice validation", () => {
        it("correctIndex points to a valid option", () => {
            const quizQuestions = getQuizQuestions();
            for (const q of quizQuestions) {
                const mc = q.multipleChoice!;
                expect(mc.correctIndex).toBeGreaterThanOrEqual(0);
                expect(mc.correctIndex).toBeLessThan(mc.options.length);
                expect(mc.options[mc.correctIndex]).toBeTruthy();
            }
        });

        it("options are non-empty strings", () => {
            const quizQuestions = getQuizQuestions();
            for (const q of quizQuestions) {
                for (const option of q.multipleChoice!.options) {
                    expect(typeof option).toBe("string");
                    expect(option.trim().length).toBeGreaterThan(0);
                }
            }
        });

        it("has at least 3 options per quiz question", () => {
            const quizQuestions = getQuizQuestions();
            for (const q of quizQuestions) {
                expect(q.multipleChoice!.options.length).toBeGreaterThanOrEqual(3);
            }
        });

        it("has no duplicate options within a question", () => {
            const quizQuestions = getQuizQuestions();
            for (const q of quizQuestions) {
                const options = q.multipleChoice!.options;
                const unique = new Set(options);
                expect(unique.size).toBe(options.length);
            }
        });
    });

    describe("tags validation", () => {
        it("all tags are non-empty strings", () => {
            for (const q of getAllQuestions()) {
                for (const tag of q.tags) {
                    expect(typeof tag).toBe("string");
                    expect(tag.trim().length).toBeGreaterThan(0);
                }
            }
        });

        it("no question has duplicate tags", () => {
            for (const q of getAllQuestions()) {
                const unique = new Set(q.tags);
                expect(unique.size).toBe(q.tags.length);
            }
        });
    });
});
