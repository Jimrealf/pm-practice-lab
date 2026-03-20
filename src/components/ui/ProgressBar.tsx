"use client";

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    stepTitle: string;
}

export function ProgressBar({ currentStep, totalSteps, stepTitle }: ProgressBarProps) {
    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-text-secondary">
                    Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-[13px] font-medium text-text-primary">
                    {stepTitle}
                </span>
            </div>
            <div className="h-1 bg-bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
