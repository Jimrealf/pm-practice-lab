"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);

        const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message }),
        });

        const result = await response.json();

        if (result.success) {
            showToast("Message sent. Thanks for reaching out!", "success");
            setName("");
            setEmail("");
            setMessage("");
        } else {
            showToast(result.error ?? "Failed to send message. Please try again.", "error");
        }
        setSending(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="contact-name"
                    className="block text-[13px] font-medium text-text-secondary mb-1.5"
                >
                    Name
                </label>
                <Input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                />
            </div>
            <div>
                <label
                    htmlFor="contact-email"
                    className="block text-[13px] font-medium text-text-secondary mb-1.5"
                >
                    Email
                </label>
                <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                />
            </div>
            <div>
                <label
                    htmlFor="contact-message"
                    className="block text-[13px] font-medium text-text-secondary mb-1.5"
                >
                    Message
                </label>
                <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Your question or feedback..."
                    className="w-full px-3 py-2.5 text-[15px] text-text-primary bg-bg-card border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors resize-y"
                />
            </div>
            <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                {sending ? "Sending..." : "Send message"}
            </Button>
        </form>
    );
}
