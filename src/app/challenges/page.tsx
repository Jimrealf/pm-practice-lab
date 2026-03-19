import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/types/challenge";
import { ChallengeListClient } from "./ChallengeListClient";

export default async function ChallengesPage() {
    const supabase = await createClient();
    const { data: challenges, error } = await supabase
        .from("challenges")
        .select("slug, title, description, difficulty, category, time_estimate_minutes, created_at")
        .order("created_at", { ascending: false })
        .returns<(Challenge & { created_at: string })[]>();

    if (error) {
        return (
            <div className="max-w-[1200px] mx-auto px-6 py-12">
                <p className="text-text-secondary">
                    Failed to load challenges. Please try again.
                </p>
            </div>
        );
    }

    return <ChallengeListClient challenges={challenges ?? []} />;
}
