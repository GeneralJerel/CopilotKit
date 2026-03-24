import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
    title: "CopilotKit Showcase",
    description: "Explore CopilotKit integrations, features, and live demos",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen">
                <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-deep)]/85 backdrop-blur-xl">
                    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                        <Link
                            href="/"
                            className="text-sm font-semibold tracking-wide text-[var(--text-primary)]"
                        >
                            CopilotKit Showcase
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link
                                href="/integrations"
                                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Integrations
                            </Link>
                            <Link
                                href="/matrix"
                                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Feature Matrix
                            </Link>
                            <a
                                href="https://docs.copilotkit.ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Docs
                            </a>
                        </div>
                    </div>
                </nav>
                <main>{children}</main>
            </body>
        </html>
    );
}
