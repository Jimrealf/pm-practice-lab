"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

const GOOGLE_ENABLED = true;

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") ?? "/challenges";

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                showToast(error.message, "error");
                setLoading(false);
                return;
            }
            router.push(redirectTo);
            router.refresh();
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
                },
            });
            if (error) {
                showToast(error.message, "error");
                setLoading(false);
                return;
            }
            showToast("Check your email for a confirmation link.", "success");
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setLoading(true);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
            },
        });

        if (error) {
            showToast(error.message, "error");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-[400px] mx-auto px-6 py-16">
            <h1 className="font-display font-bold text-[24px] text-text-primary text-center">
                {mode === "login" ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-2 text-[14px] text-text-secondary text-center">
                {mode === "login"
                    ? "Sign in to save your progress and get AI feedback."
                    : "Create an account to start practicing."}
            </p>

            <Card className="mt-8 p-6">
                {GOOGLE_ENABLED && (
                    <>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 h-[44px] border border-border rounded-[var(--radius-md)] text-[14px] font-medium text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-50"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-[12px] text-text-tertiary">or</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                    </>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-[13px] font-medium text-text-secondary mb-1.5"
                            >
                                Full name
                            </label>
                            <Input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Jane Doe"
                            />
                        </div>
                    )}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-[13px] font-medium text-text-secondary mb-1.5"
                        >
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-[13px] font-medium text-text-secondary mb-1.5"
                        >
                            Password
                        </label>
                        <PasswordInput
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading
                            ? "Loading..."
                            : mode === "login"
                              ? "Sign in"
                              : "Create account"}
                    </Button>
                </form>

                <p className="mt-4 text-[13px] text-text-secondary text-center">
                    {mode === "login" ? (
                        <>
                            No account?{" "}
                            <button
                                type="button"
                                onClick={() => setMode("signup")}
                                className="text-accent hover:underline font-medium"
                            >
                                Create one
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className="text-accent hover:underline font-medium"
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </Card>
        </div>
    );
}
