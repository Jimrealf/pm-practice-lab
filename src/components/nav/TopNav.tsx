"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/challenges", label: "Challenges" },
    { href: "/interviews", label: "Interviews" },
];

export function TopNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useUser();
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    async function handleSignOut() {
        setShowSignOutConfirm(false);
        setMenuOpen(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    return (
        <>
            <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-bg-card/95 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        {menuOpen ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        )}
                    </button>
                    <Link
                        href="/"
                        className="font-display font-bold text-[18px] text-text-primary hover:text-accent transition-colors"
                    >
                        PM Practice Lab
                    </Link>
                    <nav className="hidden md:flex items-center gap-1 ml-4">
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
                <div className="hidden md:flex items-center gap-2">
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
            </header>

            {menuOpen && (
                <div className="md:hidden fixed inset-0 top-14 z-40">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMenuOpen(false)}
                    />
                    <div className="relative bg-bg-card border-b border-border shadow-lg">
                        <nav className="flex flex-col px-6 py-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                                        py-3 text-[15px] font-medium border-b border-border/50 transition-colors
                                        ${pathname.startsWith(link.href)
                                            ? "text-accent"
                                            : "text-text-secondary"
                                        }
                                    `.trim()}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                            <ThemeToggle />
                            {loading ? (
                                <div className="w-20 h-8" />
                            ) : user ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-[13px] text-text-secondary truncate max-w-[140px]">
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
                    </div>
                </div>
            )}

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
