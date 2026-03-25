import type { Metadata } from "next";
import Link from "next/link";
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
                        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs text-[var(--text-muted)] cursor-pointer hover:border-[var(--text-faint)] transition-colors min-w-[200px]">
                            <span>⌕</span>
                            <span>Search docs, demos...</span>
                            <span className="ml-auto font-mono text-[10px] border border-[var(--border)] px-1 py-0.5 rounded bg-[var(--bg-surface)]">⌘K</span>
                        </div>
                    </div>
                </nav>
                <main>{children}</main>
            </body>
        </html>
    );
}
