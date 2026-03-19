"use client";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
    status: SaveStatus;
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
    if (status === "idle") return null;

    const labels: Record<SaveStatus, string> = {
        idle: "",
        saving: "Saving draft...",
        saved: "Draft saved",
        error: "Failed to save draft",
    };

    const colors: Record<SaveStatus, string> = {
        idle: "",
        saving: "text-text-tertiary",
        saved: "text-feedback-strength",
        error: "text-feedback-growth",
    };

    return (
        <span className={`text-[12px] ${colors[status]} transition-opacity`}>
            {labels[status]}
        </span>
    );
}
