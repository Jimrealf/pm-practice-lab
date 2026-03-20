import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-24 text-center">
            <h1 className="font-display font-bold text-[48px] text-text-primary">
                404
            </h1>
            <p className="mt-2 text-[15px] text-text-secondary">
                This page does not exist.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/challenges">
                    <Button>Browse challenges</Button>
                </Link>
                <Link href="/dashboard">
                    <Button variant="ghost">Go to dashboard</Button>
                </Link>
            </div>
        </div>
    );
}
