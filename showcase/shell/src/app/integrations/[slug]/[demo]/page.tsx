"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Tab = "preview" | "code" | "docs";

interface DemoFile {
    filename: string;
    language: string;
    content: string;
}

interface DemoContent {
    readme: string | null;
    files: DemoFile[];
}

export default function DemoViewerPage() {
    const params = useParams<{ slug: string; demo: string }>();
    const [activeTab, setActiveTab] = useState<Tab>("preview");
    const [integration, setIntegration] = useState<any>(null);
    const [demo, setDemo] = useState<any>(null);
    const [demoContent, setDemoContent] = useState<DemoContent | null>(null);
    const [activeFile, setActiveFile] = useState<number>(0);

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

        import("@/data/demo-content.json").then((mod) => {
            const content = mod.default as any;
            const key = `${params.slug}::${params.demo}`;
            if (content.demos[key]) {
                setDemoContent(content.demos[key]);
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
                    <div className="flex h-full">
                        {/* File tabs */}
                        <div className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--bg-surface)]">
                            <div className="p-3 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                                Files
                            </div>
                            {demoContent?.files.map((file, idx) => (
                                <button
                                    key={file.filename}
                                    onClick={() => setActiveFile(idx)}
                                    className={`px-4 py-2 text-left text-xs font-mono transition-colors ${
                                        activeFile === idx
                                            ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                                            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/50"
                                    }`}
                                >
                                    {file.filename}
                                </button>
                            ))}
                            <div className="mt-auto border-t border-[var(--border)] p-3">
                                <a
                                    href={integration.repo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-[var(--accent-blue)] hover:underline"
                                >
                                    View on GitHub
                                </a>
                            </div>
                        </div>
                        {/* Code viewer */}
                        <div className="flex-1 overflow-auto">
                            {demoContent?.files[activeFile] ? (
                                <pre className="p-6 text-sm leading-relaxed">
                                    <code className="text-[var(--text-secondary)] font-mono">
                                        {demoContent.files[activeFile].content}
                                    </code>
                                </pre>
                            ) : (
                                <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                                    No source files bundled for this demo.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "docs" && (
                    <div className="h-full overflow-auto p-8">
                        {demoContent?.readme ? (
                            <div className="mx-auto max-w-3xl">
                                <div className="prose prose-invert prose-sm max-w-none [&_h1]:text-2xl [&_h1]:font-light [&_h1]:text-[var(--text-primary)] [&_h2]:text-lg [&_h2]:text-[var(--text-primary)] [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_li]:text-[var(--text-secondary)] [&_strong]:text-[var(--text-primary)] [&_code]:text-[var(--accent-cyan)] [&_code]:bg-[var(--bg-elevated)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded">
                                    <pre className="whitespace-pre-wrap font-sans text-sm">
                                        {demoContent.readme}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                                No documentation available for this demo.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
