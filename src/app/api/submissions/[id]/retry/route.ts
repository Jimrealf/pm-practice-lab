import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runReview } from "@/lib/gemini/review";
import type { Challenge } from "@/types/challenge";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

    const { data: submission } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!submission) {
        return NextResponse.json(
            { success: false, error: "Submission not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    if (submission.status !== "failed") {
        return NextResponse.json(
            { success: false, error: "Only failed submissions can be retried", code: "INVALID_STATE" },
            { status: 400 }
        );
    }

    const admin = createAdminClient();
    const { data: challenge } = await admin
        .from("challenges")
        .select("*")
        .eq("id", submission.challenge_id)
        .single();

    if (!challenge) {
        return NextResponse.json(
            { success: false, error: "Challenge not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    runReview(
        submission.id,
        challenge as Challenge,
        submission.field_responses
    ).catch(() => {});

    return NextResponse.json({
        success: true,
        data: { message: "Review retry started" },
    });
}
