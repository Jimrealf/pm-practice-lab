import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

    const { data: submission, error: subError } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (subError || !submission) {
        return NextResponse.json(
            { success: false, error: "Submission not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    let review = null;
    if (submission.status === "reviewed") {
        const { data } = await supabase
            .from("reviews")
            .select("*")
            .eq("submission_id", id)
            .single();
        review = data;
    }

    return NextResponse.json({
        success: true,
        data: { submission, review },
    });
}
