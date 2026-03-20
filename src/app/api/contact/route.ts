import { NextResponse } from "next/server";

const CONTACT_EMAIL = "jimrealf@gmail.com";

export async function POST(request: Request) {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
        return NextResponse.json(
            { success: false, error: "All fields are required", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
        return NextResponse.json(
            { success: false, error: "Invalid input", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    if (message.length > 5000) {
        return NextResponse.json(
            { success: false, error: "Message is too long (max 5000 characters)", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    try {
        const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                access_key: process.env.WEB3FORMS_KEY,
                subject: `PM Practice Lab: Message from ${name}`,
                from_name: name,
                email,
                message,
                to: CONTACT_EMAIL,
            }),
        });

        const result = await res.json();

        if (result.success) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { success: false, error: "Failed to send message. Please try again.", code: "SEND_FAILED" },
            { status: 500 }
        );
    } catch {
        return NextResponse.json(
            { success: false, error: "Failed to send message. Please try again.", code: "SEND_FAILED" },
            { status: 500 }
        );
    }
}
