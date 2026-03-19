import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import writeAPrd from "@/content/challenges/write-a-prd.json";
import prioritizeBacklog from "@/content/challenges/prioritize-backlog.json";
import defineMetrics from "@/content/challenges/define-metrics.json";
import type { ChallengeConfig } from "@/types/challenge";

const challenges: ChallengeConfig[] = [
    writeAPrd as ChallengeConfig,
    prioritizeBacklog as ChallengeConfig,
    defineMetrics as ChallengeConfig,
];

function toDbRow(config: ChallengeConfig) {
    return {
        slug: config.slug,
        title: config.title,
        description: config.description,
        difficulty: config.difficulty,
        category: config.category,
        version: config.version,
        time_estimate_minutes: config.timeEstimateMinutes,
        scenario_brief: config.scenarioBrief,
        context_materials: config.contextMaterials,
        submission_fields: config.submissionFields,
        rubric: config.rubric,
        expert_solution: config.expertSolution,
        steps: config.steps,
    };
}

export async function POST() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { success: false, error: "Seed disabled in production", code: "FORBIDDEN" },
            { status: 403 }
        );
    }

    const supabase = createAdminClient();
    const rows = challenges.map(toDbRow);

    const { error } = await supabase
        .from("challenges")
        .upsert(rows, { onConflict: "slug" });

    if (error) {
        return NextResponse.json(
            { success: false, error: error.message, code: "SEED_FAILED" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: { message: `Seeded ${rows.length} challenges` },
    });
}
