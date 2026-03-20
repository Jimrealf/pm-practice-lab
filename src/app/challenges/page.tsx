import type { Metadata } from "next";
import { getChallenges } from "@/lib/supabase/queries";
import { ChallengeListClient } from "./ChallengeListClient";

export const metadata: Metadata = {
    title: "Challenges",
    description: "Browse PM challenges. Practice PRDs, prioritization, metrics, and more.",
};

export default async function ChallengesPage() {
    const challenges = await getChallenges();

    if (!challenges) {
        return (
            <div className="max-w-[1200px] mx-auto px-6 py-12">
                <p className="text-text-secondary">
                    Failed to load challenges. Please try again.
                </p>
            </div>
        );
    }

    return <ChallengeListClient challenges={challenges} />;
}
