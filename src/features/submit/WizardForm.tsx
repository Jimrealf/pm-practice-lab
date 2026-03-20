"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { MaterialsPanel } from "./MaterialsPanel";
import { createClient } from "@/lib/supabase/client";
import type { Challenge } from "@/types/challenge";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface WizardFormProps {
    challenge: Challenge;
    userId: string;
    initialValues: Record<string, string>;
    initialStep: number;
}

export function WizardForm({
    challenge,
    userId,
    initialValues,
    initialStep,
}: WizardFormProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [values, setValues] = useState<Record<string, string>>(initialValues);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const steps = challenge.steps;
    const step = steps[currentStep];
    const fields = challenge.submission_fields.filter((f) =>
        step.fieldIds.includes(f.id)
    );

    const supabase = createClient();

    const saveDraft = useCallback(
        async (fieldValues: Record<string, string>, stepIndex: number) => {
            setSaveStatus("saving");
            const { error } = await supabase
                .from("drafts")
                .upsert(
                    {
                        user_id: userId,
                        challenge_id: challenge.id,
                        field_responses: fieldValues,
                        current_step: stepIndex,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id,challenge_id" }
                );

            setSaveStatus(error ? "error" : "saved");

            if (!error) {
                setTimeout(() => setSaveStatus("idle"), 2000);
            }
        },
        [supabase, userId, challenge.id]
    );

    function handleFieldChange(fieldId: string, value: string) {
        const next = { ...values, [fieldId]: value };
        setValues(next);
        setErrors((prev) => {
            const copy = { ...prev };
            delete copy[fieldId];
            return copy;
        });

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = setTimeout(() => {
            saveDraft(next, currentStep);
        }, 1500);
    }

    useEffect(() => {
        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, []);

    function validateCurrentStep(): boolean {
        const stepErrors: Record<string, string> = {};
        for (const field of fields) {
            if (field.required && !values[field.id]?.trim()) {
                stepErrors[field.id] = "This field is required";
            }
            if (
                field.maxLength &&
                values[field.id] &&
                values[field.id].length > field.maxLength
            ) {
                stepErrors[field.id] = `Maximum ${field.maxLength} characters`;
            }
        }
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    }

    function handleNext() {
        if (!validateCurrentStep()) return;

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        saveDraft(values, nextStep);
    }

    function handleBack() {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }

    async function handleSubmit() {
        if (!validateCurrentStep()) return;

        setSubmitting(true);

        const response = await fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                challengeId: challenge.id,
                challengeVersion: challenge.version,
                fieldResponses: values,
            }),
        });

        const result = await response.json();

        if (!result.success) {
            setErrors({ _form: result.error });
            setSubmitting(false);
            return;
        }

        await supabase
            .from("drafts")
            .delete()
            .eq("user_id", userId)
            .eq("challenge_id", challenge.id);

        router.push(`/challenges/${challenge.slug}/review?submission=${result.data.id}`);
    }

    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="flex gap-8">
            <div className="flex-1 min-w-0">
                <ProgressBar
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    stepTitle={step.title}
                />

                <div className="mt-6 space-y-6">
                    {fields.map((field) => (
                        <div key={field.id}>
                            <label
                                htmlFor={field.id}
                                className="block font-medium text-[14px] text-text-primary mb-1.5"
                            >
                                {field.label}
                                {field.required && (
                                    <span className="text-feedback-growth ml-1">
                                        *
                                    </span>
                                )}
                            </label>
                            <p className="text-[13px] text-text-tertiary mb-2">
                                {field.hint}
                            </p>
                            <Textarea
                                id={field.id}
                                value={values[field.id] ?? ""}
                                onChange={(e) =>
                                    handleFieldChange(field.id, e.target.value)
                                }
                                rows={8}
                                maxLength={field.maxLength}
                                error={errors[field.id]}
                            />
                            <div className="flex items-center justify-between mt-1">
                                {errors[field.id] && (
                                    <span className="text-[12px] text-feedback-growth">
                                        {errors[field.id]}
                                    </span>
                                )}
                                {field.maxLength && (
                                    <span className="text-[12px] text-text-tertiary ml-auto">
                                        {values[field.id]?.length ?? 0} / {field.maxLength}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {errors._form && (
                    <div className="mt-4 p-3 bg-feedback-growth/10 border border-feedback-growth/20 rounded-[var(--radius-md)]">
                        <p className="text-[13px] text-feedback-growth">
                            {errors._form}
                        </p>
                    </div>
                )}

                <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {currentStep > 0 && (
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={submitting}
                            >
                                Back
                            </Button>
                        )}
                        <AutoSaveIndicator status={saveStatus} />
                    </div>

                    {isLastStep ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "Submitting..." : "Submit for review"}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            Next
                        </Button>
                    )}
                </div>
            </div>

            <MaterialsPanel materials={challenge.context_materials} />
        </div>
    );
}
