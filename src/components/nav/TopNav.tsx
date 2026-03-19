"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/challenges", label: "Challenges" },
    { href: "/dashboard", label: "Dashboard" },
];

export function TopNav() {
    const pathname = usePathname();

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
            <div className="flex items-center gap-3">
                <Link
                    href="/auth/login"
                    className="px-4 py-1.5 text-[14px] font-medium text-accent hover:bg-accent-light rounded-[var(--radius-md)] transition-colors"
                >
                    Sign in
                </Link>
            </div>
        </header>
    );
}
