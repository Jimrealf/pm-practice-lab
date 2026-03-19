"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import type { Material } from "@/types/challenge";

interface MaterialsPanelProps {
    materials: Material[];
}

export function MaterialsPanel({ materials }: MaterialsPanelProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="fixed bottom-20 right-4 md:hidden z-30 flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border rounded-full shadow-md text-[13px] font-medium text-text-primary"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
                Materials
            </button>

            {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-bg-primary rounded-t-xl overflow-y-auto p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display font-bold text-[16px] text-text-primary">
                                Context materials
                            </h3>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="p-1 text-text-tertiary hover:text-text-primary"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <MaterialsList materials={materials} />
                    </div>
                </div>
            )}

            <aside className="hidden md:block w-[340px] shrink-0 sticky top-[72px] max-h-[calc(100vh-88px)] overflow-y-auto">
                <h3 className="font-display font-bold text-[14px] text-text-secondary mb-3">
                    Context materials
                </h3>
                <MaterialsList materials={materials} />
            </aside>
        </>
    );
}

function MaterialsList({ materials }: { materials: Material[] }) {
    return (
        <div className="space-y-3">
            {materials.map((material) => (
                <details key={material.id} className="group">
                    <summary className="cursor-pointer font-medium text-[13px] text-text-primary hover:text-accent transition-colors list-none flex items-center gap-2">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="transition-transform group-open:rotate-90 shrink-0"
                        >
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        {material.title}
                    </summary>
                    <Card className="mt-2 p-3">
                        <pre className="font-mono text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {material.content}
                        </pre>
                    </Card>
                </details>
            ))}
        </div>
    );
}
