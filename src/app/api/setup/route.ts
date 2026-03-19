import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("challenges")
        .select("slug")
        .limit(1);

    if (error) {
        return NextResponse.json(
            { success: false, error: error.message, code: "DB_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: {
            schema: "ok",
            challenges: data.length,
        },
    });
}
