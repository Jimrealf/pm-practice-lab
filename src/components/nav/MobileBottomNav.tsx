"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";

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

const profileIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export function MobileBottomNav() {
    const pathname = usePathname();
    const { user } = useUser();

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: dashboardIcon },
        { href: "/challenges", label: "Challenges", icon: challengesIcon },
        {
            href: user ? "/dashboard" : "/auth/login",
            label: user ? "Profile" : "Sign in",
            icon: profileIcon,
        },
    ];

    return (
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
        </nav>
    );
}
