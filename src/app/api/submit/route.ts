import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runReview } from "@/lib/gemini/review";
import type { Challenge } from "@/types/challenge";

interface SubmitBody {
    challengeId: string;
    challengeVersion: number;
    fieldResponses: Record<string, string>;
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { success: false, error: "Not authenticated", code: "UNAUTHORIZED" },
            { status: 401 }
        );
    }

    let body: SubmitBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request body", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    if (!body.challengeId || !body.fieldResponses) {
        return NextResponse.json(
            { success: false, error: "Missing required fields", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("challenge_id", body.challengeId)
        .gte("created_at", oneHourAgo);

    if (count !== null && count >= 5) {
        return NextResponse.json(
            {
                success: false,
                error: "Rate limit: maximum 5 submissions per challenge per hour",
                code: "RATE_LIMITED",
            },
            { status: 429 }
        );
    }

    const { data: submission, error } = await supabase
        .from("submissions")
        .insert({
            user_id: user.id,
            challenge_id: body.challengeId,
            challenge_version: body.challengeVersion,
            field_responses: body.fieldResponses,
            status: "pending",
        })
        .select("id")
        .single();

    if (error) {
        return NextResponse.json(
            { success: false, error: error.message, code: "INSERT_FAILED" },
            { status: 500 }
        );
    }

    const admin = createAdminClient();
    const { data: challenge } = await admin
        .from("challenges")
        .select("*")
        .eq("id", body.challengeId)
        .single();

    if (challenge) {
        runReview(
            submission.id,
            challenge as Challenge,
            body.fieldResponses
        ).catch(() => {});
    }

    return NextResponse.json({
        success: true,
        data: { id: submission.id },
    });
}
