import type { Metadata } from "next";
import Link from "next/link";
import { SearchTrigger } from "@/components/search-trigger";
import "./globals.css";

export const metadata: Metadata = {
    title: "CopilotKit Docs",
    description: "Docs, live demos, and integrations for CopilotKit",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen">
                <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-lg">
                    <div className="mx-auto flex h-[52px] items-center justify-between px-6">
                        <Link
                            href="/"
                            className="text-sm font-bold tracking-tight text-[var(--text)]"
                        >
                            CopilotKit
                        </Link>
                        <div className="flex items-center gap-1">
                            <Link
                                href="/"
                                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-all"
                            >
                                Home
                            </Link>
                            <Link
                                href="/integrations"
                                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-all"
                            >
                                Integrations
                            </Link>
                            <Link
                                href="/matrix"
                                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-all"
                            >
                                Matrix
                            </Link>
                            <a
                                href="https://docs.copilotkit.ai/reference"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-all"
                            >
                                Reference
                            </a>
                        </div>
                        <SearchTrigger />
                    </div>
                </nav>
                <main>{children}</main>
                <div
                    style={{
                        position: "fixed",
                        bottom: "8px",
                        right: "12px",
                        fontSize: "10px",
                        fontFamily: "monospace",
                        color: "rgba(0,0,0,0.15)",
                        pointerEvents: "none",
                        zIndex: 9999,
                        userSelect: "none",
                    }}
                >
                    {process.env.NEXT_PUBLIC_BRANCH || "local"}{" "}
                    {(process.env.NEXT_PUBLIC_COMMIT_SHA || "dev").slice(0, 9)}
                </div>
            </body>
        </html>
    );
}
