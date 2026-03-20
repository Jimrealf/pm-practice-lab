import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { TopNav } from "@/components/nav/TopNav";
import { MobileBottomNav } from "@/components/nav/MobileBottomNav";
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "PM Practice Lab",
        template: "%s | PM Practice Lab",
    },
    description:
        "Practice real PM work. Get structured AI feedback. Build the skills that matter.",
    openGraph: {
        title: "PM Practice Lab",
        description:
            "Practice real PM work. Get structured AI feedback. Build the skills that matter.",
        type: "website",
        siteName: "PM Practice Lab",
    },
    twitter: {
        card: "summary",
        title: "PM Practice Lab",
        description:
            "Practice real PM work. Get structured AI feedback. Build the skills that matter.",
    },
    icons: {
        icon: "/favicon.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://api.fontshare.com" />
                <link
                    href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&f[]=instrument-sans@400,500,600,700&display=swap"
                    rel="stylesheet"
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                var theme = localStorage.getItem('theme');
                                if (!theme) {
                                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                }
                                document.documentElement.setAttribute('data-theme', theme);
                            })();
                        `,
                    }}
                />
            </head>
            <body className="min-h-screen flex flex-col pb-16 md:pb-0">
                <ThemeProvider>
                    <ToastProvider>
                        <TopNav />
                        <main className="flex-1 w-full min-w-0">{children}</main>
                        <MobileBottomNav />
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
