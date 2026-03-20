import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
    title: "Contact",
    description: "Send questions or feedback about PM Practice Lab.",
};

export default function ContactPage() {
    return (
        <div className="max-w-[680px] mx-auto px-6 py-12">
            <h1 className="font-display font-bold text-[32px] text-text-primary">
                Contact
            </h1>
            <p className="mt-2 text-[15px] text-text-secondary">
                Have a question or feedback? Send a message and I will get back to you.
            </p>
            <div className="mt-8">
                <ContactForm />
            </div>
        </div>
    );
}
