import { unstable_cache } from "next/cache";
import { createAdminClient } from "./admin";
import type { Challenge } from "@/types/challenge";

const supabase = createAdminClient();

export const getChallenges = unstable_cache(
    async () => {
        const { data, error } = await supabase
            .from("challenges")
            .select("id, slug, title, description, difficulty, category, time_estimate_minutes, created_at")
            .order("created_at", { ascending: false })
            .returns<(Challenge & { created_at: string })[]>();

        if (error) return null;
        return data;
    },
    ["challenges-list"],
    { revalidate: 300 }
);

export const getChallengeBySlug = unstable_cache(
    async (slug: string) => {
        const { data, error } = await supabase
            .from("challenges")
            .select("*")
            .eq("slug", slug)
            .single<Challenge>();

        if (error) return null;
        return data;
    },
    ["challenge-detail"],
    { revalidate: 300 }
);

export const getFeaturedChallenges = unstable_cache(
    async () => {
        const { data, error } = await supabase
            .from("challenges")
            .select("slug, title, description, difficulty, category, time_estimate_minutes")
            .in("slug", ["write-a-prd", "prioritize-backlog", "define-metrics"])
            .order("difficulty")
            .returns<Challenge[]>();

        if (error) return null;
        return data;
    },
    ["featured-challenges"],
    { revalidate: 300 }
);
