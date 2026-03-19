"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/challenges", label: "Challenges" },
];

export function TopNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useUser();
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

    async function handleSignOut() {
        setShowSignOutConfirm(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    return (
        <header className="hidden md:flex items-center justify-between h-14 px-6 border-b border-border bg-bg-card/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-8">
                <Link
                    href="/"
                    className="font-display font-bold text-[18px] text-text-primary hover:text-accent transition-colors"
                >
                    PM Practice Lab
                </Link>
                <nav className="flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                                px-3 py-1.5 text-[14px] font-medium rounded-[var(--radius-md)]
                                transition-colors duration-150
                                ${pathname.startsWith(link.href)
                                    ? "text-accent bg-accent-light"
                                    : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
                                }
                            `.trim()}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                {loading ? (
                    <div className="w-20 h-8" />
                ) : user ? (
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] text-text-secondary truncate max-w-[160px]">
                            {user.user_metadata?.full_name ?? user.email}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowSignOutConfirm(true)}
                            className="px-3 py-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-[var(--radius-md)] transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth/login"
                        className="px-4 py-1.5 text-[14px] font-medium text-accent hover:bg-accent-light rounded-[var(--radius-md)] transition-colors"
                    >
                        Sign in
                    </Link>
                )}
            </div>
            <ConfirmDialog
                open={showSignOutConfirm}
                title="Sign out"
                description="Are you sure you want to sign out? Any unsaved progress will be lost."
                confirmLabel="Sign out"
                cancelLabel="Cancel"
                onConfirm={handleSignOut}
                onCancel={() => setShowSignOutConfirm(false)}
            />
        </header>
    );
}
