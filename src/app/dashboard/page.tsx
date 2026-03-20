import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { getChallenges } from "@/lib/supabase/queries";
import { toSentenceCase } from "@/lib/format";
import { DashboardInterviewProgress } from "./DashboardInterviewProgress";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Track your PM challenge progress, submissions, and scores.",
};

interface SubmissionRow {
    id: string;
    challenge_id: string;
    status: string;
    field_responses: Record<string, string>;
    created_at: string;
    reviews: {
        overall_score: number;
    }[];
}

interface ChallengeRow {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    category: string;
}

interface ChallengeWithSubmissions {
    challenge: ChallengeRow;
    submissions: {
        id: string;
        status: string;
        score: number | null;
        createdAt: string;
    }[];
    bestScore: number | null;
    latestStatus: string | null;
}

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login?redirect=/dashboard");
    }

    const cachedChallenges = await getChallenges();
    const challenges: ChallengeRow[] = (cachedChallenges ?? []).map((c) => ({
        id: (c as unknown as { id: string }).id,
        slug: c.slug,
        title: c.title,
        difficulty: c.difficulty,
        category: c.category,
    }));

    const { data: submissions } = await supabase
        .from("submissions")
        .select("id, challenge_id, status, field_responses, created_at, reviews(overall_score)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .returns<SubmissionRow[]>();

    const challengeMap = new Map<string, ChallengeWithSubmissions>();

    for (const challenge of challenges ?? []) {
        challengeMap.set(challenge.id, {
            challenge,
            submissions: [],
            bestScore: null,
            latestStatus: null,
        });
    }

    for (const sub of submissions ?? []) {
        const entry = challengeMap.get(sub.challenge_id);
        if (!entry) continue;

        const score = sub.reviews?.[0]?.overall_score ?? null;
        entry.submissions.push({
            id: sub.id,
            status: sub.status,
            score,
            createdAt: sub.created_at,
        });

        if (score !== null && (entry.bestScore === null || score > entry.bestScore)) {
            entry.bestScore = score;
        }

        if (!entry.latestStatus) {
            entry.latestStatus = sub.status;
        }
    }

    const allChallenges = Array.from(challengeMap.values());
    const attempted = allChallenges.filter((c) => c.submissions.length > 0);
    const notStarted = allChallenges.filter((c) => c.submissions.length === 0);
    const totalSubmissions = submissions?.length ?? 0;
    const reviewedCount = submissions?.filter((s) => s.status === "reviewed").length ?? 0;

    const displayName = user.user_metadata?.full_name ?? user.email ?? "PM";

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display font-bold text-[32px] text-text-primary">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-[15px] text-text-secondary">
                        Welcome back, {displayName.split(" ")[0]}.
                    </p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 text-center">
                    <p className="text-[13px] text-text-tertiary font-medium">Challenges attempted</p>
                    <p className="mt-1 font-display font-bold text-[28px] text-text-primary">
                        {attempted.length}<span className="text-[16px] text-text-tertiary font-normal">/{allChallenges.length}</span>
                    </p>
                </Card>
                <Card className="p-5 text-center">
                    <p className="text-[13px] text-text-tertiary font-medium">Total submissions</p>
                    <p className="mt-1 font-display font-bold text-[28px] text-text-primary">
                        {totalSubmissions}
                    </p>
                </Card>
                <Card className="p-5 text-center">
                    <p className="text-[13px] text-text-tertiary font-medium">Reviews received</p>
                    <p className="mt-1 font-display font-bold text-[28px] text-text-primary">
                        {reviewedCount}
                    </p>
                </Card>
            </div>

            <DashboardInterviewProgress />

            {totalSubmissions === 0 ? (
                <Card className="mt-10 p-10 text-center">
                    <h2 className="font-display font-bold text-[20px] text-text-primary">
                        No submissions yet
                    </h2>
                    <p className="mt-2 text-[14px] text-text-secondary max-w-[448px] mx-auto">
                        Pick a challenge, do the work, and get AI-powered feedback
                        from a senior PM perspective.
                    </p>
                    <Link
                        href="/challenges"
                        className="inline-flex items-center justify-center mt-6 px-5 py-2.5 text-[14px] font-medium bg-accent text-white rounded-[var(--radius-md)] hover:bg-accent-dark transition-colors"
                    >
                        Browse challenges
                    </Link>
                </Card>
            ) : (
                <div className="mt-10 space-y-6">
                    <h2 className="font-display font-bold text-[20px] text-text-primary">
                        Your challenges
                    </h2>

                    {attempted.map(({ challenge, submissions: subs, bestScore }) => (
                        <Card key={challenge.id} className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="difficulty">{challenge.difficulty}</Badge>
                                        <Badge variant="category">{challenge.category}</Badge>
                                    </div>
                                    <Link
                                        href={`/challenges/${challenge.slug}`}
                                        className="font-display font-bold text-[17px] text-text-primary hover:text-accent transition-colors"
                                    >
                                        {challenge.title}
                                    </Link>
                                </div>
                                {bestScore !== null && (
                                    <div className="text-center shrink-0">
                                        <p className="text-[12px] text-text-tertiary font-medium">Best</p>
                                        <p className="font-display font-bold text-[24px] text-accent">
                                            {bestScore}<span className="text-[14px] text-text-tertiary font-normal">/10</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 border-t border-border pt-4">
                                <p className="text-[12px] text-text-tertiary font-medium mb-2">
                                    {subs.length} attempt{subs.length !== 1 ? "s" : ""}
                                </p>
                                <div className="space-y-2">
                                    {subs.map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={`/challenges/${challenge.slug}/review?submission=${sub.id}`}
                                            className="flex items-center justify-between py-1.5 px-3 rounded-[var(--radius-sm)] hover:bg-bg-secondary transition-colors"
                                        >
                                            <span className="text-[13px] text-text-secondary">
                                                {new Date(sub.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            <span className="flex items-center gap-2 text-[13px] font-medium">
                                                {sub.status === "reviewed" && sub.score !== null ? (
                                                    <span className="text-accent">{sub.score}/10</span>
                                                ) : (
                                                    <span className="text-text-tertiary">
                                                        {toSentenceCase(sub.status)}
                                                    </span>
                                                )}
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {notStarted.length > 0 && (
                        <>
                            <div className="flex items-center justify-between pt-4">
                                <h2 className="font-display font-bold text-[20px] text-text-primary">
                                    Not started
                                </h2>
                                {notStarted.length > 3 && (
                                    <Link
                                        href="/challenges"
                                        className="text-[13px] font-medium text-accent hover:text-accent-dark transition-colors"
                                    >
                                        View all challenges ({notStarted.length})
                                    </Link>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {notStarted.slice(0, 3).map(({ challenge }) => (
                                    <Link key={challenge.id} href={`/challenges/${challenge.slug}`}>
                                        <Card hoverable className="p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="difficulty">{challenge.difficulty}</Badge>
                                                <Badge variant="category">{challenge.category}</Badge>
                                            </div>
                                            <h3 className="font-display font-bold text-[15px] text-text-primary">
                                                {challenge.title}
                                            </h3>
                                            <p className="mt-2 text-[13px] font-medium text-accent">
                                                Start challenge
                                            </p>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
