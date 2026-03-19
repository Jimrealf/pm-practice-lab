import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/types/challenge";

export default async function ChallengesPage() {
    const supabase = await createClient();
    const { data: challenges, error } = await supabase
        .from("challenges")
        .select("slug, title, description, difficulty, category, time_estimate_minutes")
        .order("difficulty")
        .returns<Challenge[]>();

    if (error) {
        return (
            <div className="max-w-[1200px] mx-auto px-6 py-12">
                <p className="text-text-secondary">
                    Failed to load challenges. Please try again.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <h1 className="font-display font-bold text-[32px] text-text-primary">
                Challenges
            </h1>
            <p className="mt-2 text-text-secondary text-[15px]">
                Pick a scenario. Do the work. Get feedback.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                    <Link
                        key={challenge.slug}
                        href={`/challenges/${challenge.slug}`}
                    >
                        <Card hoverable className="p-6 h-full flex flex-col">
                            <div className="flex items-center gap-2">
                                <Badge variant="difficulty">
                                    {challenge.difficulty}
                                </Badge>
                                <Badge variant="category">
                                    {challenge.category}
                                </Badge>
                                <span className="text-[12px] text-text-tertiary ml-auto">
                                    {challenge.time_estimate_minutes} min
                                </span>
                            </div>
                            <h2 className="mt-3 font-display font-bold text-[18px] text-text-primary">
                                {challenge.title}
                            </h2>
                            <p className="mt-2 text-[14px] text-text-secondary leading-relaxed flex-1">
                                {challenge.description}
                            </p>
                            <div className="mt-4 text-[13px] font-medium text-accent">
                                Start challenge
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
