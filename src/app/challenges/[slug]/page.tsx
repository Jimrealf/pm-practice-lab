import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import prdChallenge from "@/content/challenges/write-a-prd.json";
import backlogChallenge from "@/content/challenges/prioritize-backlog.json";
import metricsChallenge from "@/content/challenges/define-metrics.json";

const challengeMap: Record<string, typeof prdChallenge> = {
    "write-a-prd": prdChallenge,
    "prioritize-backlog": backlogChallenge,
    "define-metrics": metricsChallenge,
};

export default async function ChallengeDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const challenge = challengeMap[slug];

    if (!challenge) {
        notFound();
    }

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="max-w-[680px]">
                <div className="flex items-center gap-2">
                    <Badge variant="difficulty">{challenge.difficulty}</Badge>
                    <Badge variant="category">{challenge.category}</Badge>
                    <span className="text-[12px] text-text-tertiary ml-2">
                        {challenge.timeEstimateMinutes} min
                    </span>
                </div>

                <h1 className="mt-4 font-display font-bold text-[32px] leading-tight text-text-primary">
                    {challenge.title}
                </h1>

                <p className="mt-4 text-text-secondary text-[15px] leading-relaxed">
                    {challenge.description}
                </p>

                <div className="mt-8">
                    <h2 className="font-display font-bold text-[18px] text-text-primary">
                        The scenario
                    </h2>
                    <div className="mt-4 font-mono text-[14px] text-text-primary leading-relaxed whitespace-pre-line">
                        {challenge.scenarioBrief}
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="font-display font-bold text-[18px] text-text-primary">
                        Context materials
                    </h2>
                    <div className="mt-4 space-y-4">
                        {challenge.contextMaterials.map((material) => (
                            <details
                                key={material.id}
                                className="group"
                            >
                                <summary className="cursor-pointer font-medium text-[15px] text-text-primary hover:text-accent transition-colors list-none flex items-center gap-2">
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="transition-transform group-open:rotate-90"
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                    {material.title}
                                </summary>
                                <Card className="mt-2 p-4">
                                    <pre className="font-mono text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                                        {material.content}
                                    </pre>
                                </Card>
                            </details>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="font-display font-bold text-[18px] text-text-primary">
                        What you will submit
                    </h2>
                    <ul className="mt-4 space-y-2">
                        {challenge.submissionFields.map((field) => (
                            <li
                                key={field.id}
                                className="text-[14px] text-text-secondary"
                            >
                                <span className="font-medium text-text-primary">
                                    {field.label}
                                </span>
                                {" - "}
                                {field.hint}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-10">
                    <Link href={`/challenges/${slug}/submit`}>
                        <Button size="lg">Start challenge</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
