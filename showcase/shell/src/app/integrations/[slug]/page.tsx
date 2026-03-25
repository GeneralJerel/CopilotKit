import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getIntegration,
    getIntegrations,
    getFeature,
    getCategoryLabel,
    getLanguageLabel,
} from "@/lib/registry";

export function generateStaticParams() {
    return getIntegrations().map((i) => ({ slug: i.slug }));
}

export default async function IntegrationProfilePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const integration = getIntegration(slug);
    if (!integration) notFound();

    return (
        <div className="mx-auto max-w-5xl px-6 py-12">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-light text-[var(--text)]">
                            {integration.name}
                        </h1>
                        <span className="rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border)]">
                            {getLanguageLabel(integration.language)}
                        </span>
                    </div>
                    <p className="mt-1 text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
                        {getCategoryLabel(integration.category)}
                    </p>
                    <p className="mt-4 text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                        {integration.description}
                    </p>
                </div>
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
                    {integration.features.map((featureId) => {
                        const feature = getFeature(featureId);
                        const hasDemo = integration.demos.some(
                            (d) => d.id === featureId
                        );
                        return (
                            <span
                                key={featureId}
                                className={`rounded-md px-3 py-1 text-xs font-mono ${
                                    hasDemo
                                        ? "bg-[rgba(52,211,153,0.1)] text-[var(--accent)]"
                                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                                }`}
                            >
                                {feature?.name || featureId}
                                {hasDemo && " ✓"}
                            </span>
                        );
                    })}
                </div>
            </section>

            {/* Demos */}
            <section className="mt-10">
                <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
                    Live Demos
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {integration.demos.map((demo) => (
                        <Link
                            key={demo.id}
                            href={`/integrations/${integration.slug}/${demo.id}`}
                            className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all"
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
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
