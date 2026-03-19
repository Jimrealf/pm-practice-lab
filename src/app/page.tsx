import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/types/challenge";

export default async function HomePage() {
    const supabase = await createClient();
    const { data: featured } = await supabase
        .from("challenges")
        .select("slug, title, description, difficulty, category, time_estimate_minutes")
        .in("slug", ["write-a-prd", "prioritize-backlog", "define-metrics"])
        .order("difficulty")
        .returns<Challenge[]>();

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <section className="max-w-[680px]">
                <h1 className="font-display font-bold text-[32px] leading-tight text-text-primary">
                    Practice real PM work. Get structured feedback.
                </h1>
                <p className="mt-4 text-text-secondary text-[15px] leading-relaxed">
                    Stop reading about product management and start doing it.
                    Each challenge drops you into a realistic, messy scenario
                    and asks you to produce real PM artifacts. AI reviews your
                    work field-by-field against a rubric, then reveals how an
                    experienced PM would approach it.
                </p>
                <div className="mt-8">
                    <Link href="/challenges">
                        <Button size="lg">Browse challenges</Button>
                    </Link>
                </div>
            </section>

            <section className="mt-16">
                <h2 className="font-display font-bold text-[24px] text-text-primary">
                    How it works
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            step: "1",
                            title: "Read the brief",
                            body: "Each challenge gives you a realistic scenario with context materials, data, and stakeholder dynamics. No sanitized textbook exercises.",
                        },
                        {
                            step: "2",
                            title: "Do the work",
                            body: "Write a PRD, prioritize a backlog, define metrics. Structured fields guide your thinking without giving away answers.",
                        },
                        {
                            step: "3",
                            title: "Get feedback",
                            body: "AI reviews each field against a rubric. See what you did well, what would make your work stronger, and how an expert would approach it.",
                        },
                    ].map((item) => (
                        <Card key={item.step} className="p-6">
                            <span className="font-data font-semibold text-[13px] text-accent">
                                Step {item.step}
                            </span>
                            <h3 className="mt-2 font-display font-bold text-[18px] text-text-primary">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-[14px] text-text-secondary leading-relaxed">
                                {item.body}
                            </p>
                        </Card>
                    ))}
                </div>
            </section>

            {featured && featured.length > 0 && (
                <section className="mt-16">
                    <h2 className="font-display font-bold text-[24px] text-text-primary">
                        Featured challenges
                    </h2>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featured.map((challenge) => (
                            <Link key={challenge.slug} href={`/challenges/${challenge.slug}`}>
                                <Card hoverable className="p-6 h-full flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="difficulty">{challenge.difficulty}</Badge>
                                        <Badge variant="category">{challenge.category}</Badge>
                                        <span className="text-[12px] text-text-tertiary ml-auto">
                                            {challenge.time_estimate_minutes} min
                                        </span>
                                    </div>
                                    <h3 className="mt-3 font-display font-bold text-[18px] text-text-primary">
                                        {challenge.title}
                                    </h3>
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
                </section>
            )}
        </div>
    );
}
