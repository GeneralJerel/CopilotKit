"use client";

import { useState } from "react";
import Link from "next/link";
import { DemoDrawer } from "@/components/demo-drawer";

interface Demo {
    id: string;
    name: string;
    description: string;
    tags: string[];
    route: string;
}

interface Integration {
    name: string;
    slug: string;
    category: string;
    language: string;
    description: string;
    partner_docs: string | null;
    repo: string;
    backend_url: string;
    features: string[];
    demos: Demo[];
}

interface FeatureInfo {
    id: string;
    name: string;
    hasDemo: boolean;
}

export function ProfileClient({
    integration,
    featureInfos,
    categoryLabel,
    languageLabel,
}: {
    integration: Integration;
    featureInfos: FeatureInfo[];
    categoryLabel: string;
    languageLabel: string;
}) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeDemo, setActiveDemo] = useState<Demo | null>(null);

    function openDemo(demo: Demo) {
        setActiveDemo(demo);
        setDrawerOpen(true);
    }

    return (
        <>
            <div className="mx-auto max-w-5xl px-6 py-12">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-light text-[var(--text)]">
                            {integration.name}
                        </h1>
                        <span className="rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border)]">
                            {languageLabel}
                        </span>
                    </div>
                    <p className="mt-1 text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
                        {categoryLabel}
                    </p>
                    <p className="mt-4 text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                        {integration.description}
                    </p>
                </div>

                {/* Links */}
                <div className="mt-6 flex flex-wrap gap-3">
                    {integration.partner_docs && (
                        <a
                            href={integration.partner_docs}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors"
                        >
                            Partner Docs
                        </a>
                    )}
                    <a
                        href={integration.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors"
                    >
                        Source Code
                    </a>
                    <a
                        href="https://github.com/CopilotKit/CopilotKit/blob/main/showcase/STYLING-GUIDE.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors"
                    >
                        Developer Guide
                    </a>
                </div>

                {/* Features */}
                <section className="mt-10">
                    <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
                        Supported Features
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {featureInfos.map((fi) => (
                            <span
                                key={fi.id}
                                className={`rounded-md px-3 py-1 text-xs font-mono ${
                                    fi.hasDemo
                                        ? "bg-[var(--accent-dim)] text-[var(--accent)] cursor-pointer hover:bg-[var(--accent-light)] transition-colors"
                                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                                }`}
                                onClick={() => {
                                    if (fi.hasDemo) {
                                        const demo = integration.demos.find((d) => d.id === fi.id);
                                        if (demo) openDemo(demo);
                                    }
                                }}
                            >
                                {fi.name}
                                {fi.hasDemo && " ▶"}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Demos */}
                <section className="mt-10">
                    <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
                        Live Demos
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {integration.demos.map((demo) => (
                            <button
                                key={demo.id}
                                onClick={() => openDemo(demo)}
                                className="group text-left rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all"
                            >
                                <h3 className="text-sm font-semibold text-[var(--text)]">
                                    {demo.name}
                                </h3>
                                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                    {demo.description}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {demo.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Full page viewer link */}
                {activeDemo && (
                    <p className="mt-4 text-xs text-[var(--text-muted)]">
                        <Link
                            href={`/integrations/${integration.slug}/${activeDemo.id}`}
                            className="text-[var(--accent)] hover:underline"
                        >
                            Open in full page →
                        </Link>
                    </p>
                )}
            </div>

            {/* Drawer */}
            {activeDemo && (
                <DemoDrawer
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    integrationSlug={integration.slug}
                    integrationName={integration.name}
                    demoId={activeDemo.id}
                    demoName={activeDemo.name}
                    backendUrl={integration.backend_url}
                    demoRoute={activeDemo.route}
                    wide={activeDemo.id.includes("gen-ui") || activeDemo.id.includes("shared-state") || activeDemo.id.includes("subagent")}
                />
            )}
        </>
    );
}
