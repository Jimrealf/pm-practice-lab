import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import fs from "fs";
import path from "path";
import type { ChallengeConfig } from "@/types/challenge";

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

function loadChallenges(): ChallengeConfig[] {
    const dir = path.join(process.cwd(), "src/content/challenges");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    return files.map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), "utf-8");
        return JSON.parse(raw) as ChallengeConfig;
    });
}

export async function POST() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { success: false, error: "Seed disabled in production", code: "FORBIDDEN" },
            { status: 403 }
        );
    }

    const challenges = loadChallenges();
    const supabase = createAdminClient();
    const rows = challenges.map(toDbRow);

    const batchSize = 10;
    let seeded = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabase
            .from("challenges")
            .upsert(batch, { onConflict: "slug" });

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`,
                    code: "SEED_FAILED",
                    data: { seededSoFar: seeded },
                },
                { status: 500 }
            );
        }
        seeded += batch.length;
    }

    return NextResponse.json({
        success: true,
        data: { message: `Seeded ${seeded} challenges` },
    });
}
