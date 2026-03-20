"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const challengesIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
    </svg>
);

const dashboardIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const interviewsIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

export function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useUser();
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

    async function handleSignOut() {
        setShowSignOutConfirm(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: dashboardIcon },
        { href: "/challenges", label: "Challenges", icon: challengesIcon },
        { href: "/interviews", label: "Interviews", icon: interviewsIcon },
    ];

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-16 bg-bg-card/95 backdrop-blur-sm border-t border-border">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`
                                flex flex-col items-center gap-0.5 px-3 py-1
                                text-[11px] font-medium transition-colors
                                ${isActive ? "text-accent" : "text-text-tertiary"}
                            `.trim()}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
                <ThemeToggle />
                {user ? (
                    <button
                        type="button"
                        onClick={() => setShowSignOutConfirm(true)}
                        className="flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium text-text-tertiary transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign out</span>
                    </button>
                ) : (
                    <Link
                        href="/auth/login"
                        className="flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium text-text-tertiary transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span>Sign in</span>
                    </Link>
                )}
            </nav>
            <ConfirmDialog
                open={showSignOutConfirm}
                title="Sign out"
                description="Are you sure you want to sign out? Any unsaved progress will be lost."
                confirmLabel="Sign out"
                cancelLabel="Cancel"
                onConfirm={handleSignOut}
                onCancel={() => setShowSignOutConfirm(false)}
            />
        </>
    );
}
