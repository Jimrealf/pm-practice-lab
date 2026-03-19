import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WizardForm } from "@/features/submit/WizardForm";
import type { Challenge } from "@/types/challenge";
import type { Draft } from "@/types/submission";

export default async function SubmitPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/login?redirect=/challenges/${slug}/submit`);
    }

    const { data: challenge } = await supabase
        .from("challenges")
        .select("*")
        .eq("slug", slug)
        .single<Challenge>();

    if (!challenge) {
        notFound();
    }

    const { data: draft } = await supabase
        .from("drafts")
        .select("field_responses, current_step")
        .eq("user_id", user.id)
        .eq("challenge_id", challenge.id)
        .single<Pick<Draft, "field_responses" | "current_step">>();

    const initialValues = (draft?.field_responses as Record<string, string>) ?? {};
    const initialStep = draft?.current_step ?? 0;

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8">
            <div className="mb-6">
                <h1 className="font-display font-bold text-[24px] text-text-primary">
                    {challenge.title}
                </h1>
                <p className="mt-1 text-[14px] text-text-secondary">
                    {challenge.submission_fields.length} fields across{" "}
                    {challenge.steps.length} steps
                </p>
            </div>

            <WizardForm
                challenge={challenge}
                userId={user.id}
                initialValues={initialValues}
                initialStep={initialStep}
            />
        </div>
    );
}
