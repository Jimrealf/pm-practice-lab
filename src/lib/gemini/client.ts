import { GoogleGenerativeAI } from "@google/generative-ai";
import { reviewResponseSchema } from "./schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getGeminiModel() {
    return genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: reviewResponseSchema,
            temperature: 0.4,
        },
    });
}
