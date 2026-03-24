"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Tab = "preview" | "code" | "docs";

export default function DemoViewerPage() {
    const params = useParams<{ slug: string; demo: string }>();
    const [activeTab, setActiveTab] = useState<Tab>("preview");
    const [integration, setIntegration] = useState<any>(null);
    const [demo, setDemo] = useState<any>(null);

    useEffect(() => {
        import("@/data/registry.json").then((mod) => {
            const registry = mod.default as any;
            const integ = registry.integrations.find(
                (i: any) => i.slug === params.slug
            );
            if (integ) {
                setIntegration(integ);
                setDemo(integ.demos.find((d: any) => d.id === params.demo));
            }
        });
    }, [params.slug, params.demo]);

    if (!integration || !demo) {
        return (
            <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-[var(--text-muted)]">
                Loading...
            </div>
        );
    }

    const iframeSrc = `${integration.backend_url}${demo.route}`;

    const tabs: { id: Tab; label: string }[] = [
        { id: "preview", label: "Preview" },
        { id: "code", label: "Code" },
        { id: "docs", label: "Docs" },
    ];

    return (
        <div className="flex h-[calc(100vh-3.5rem)] flex-col">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)] px-6 py-3">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/integrations/${integration.slug}`}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                        ← {integration.name}
                    </Link>
                    <span className="text-[var(--text-muted)]">/</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                        {demo.name}
                    </span>
                </div>
                <div className="flex gap-1 rounded-lg bg-[var(--bg-deep)] p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                                activeTab === tab.id
                                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === "preview" && (
                    <iframe
                        src={iframeSrc}
                        className="h-full w-full border-0"
                        title={`${demo.name} demo`}
                        allow="clipboard-read; clipboard-write"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                )}

                {activeTab === "code" && (
                    <div className="h-full overflow-auto p-6">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
                            <p className="text-sm text-[var(--text-muted)]">
                                Source code viewer will load bundled demo source
                                files here. Each demo includes page.tsx (frontend)
                                and agent.py/ts (backend).
                            </p>
                            <p className="mt-4 text-xs text-[var(--text-muted)]">
                                View full source:{" "}
                                <a
                                    href={integration.repo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--accent-blue)] hover:underline"
                                >
                                    {integration.repo}
                                </a>
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === "docs" && (
                    <div className="h-full overflow-auto p-6">
                        <div className="prose prose-invert max-w-3xl">
                            <p className="text-sm text-[var(--text-muted)]">
                                Documentation will render the demo README.md
                                here, bundled at build time from the integration
                                package.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
