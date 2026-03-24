import Link from "next/link";
import { getIntegrations, getCategoryLabel } from "@/lib/registry";

export default function HomePage() {
    const integrations = getIntegrations();
    const categories = [...new Set(integrations.map((i) => i.category))];

    return (
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
            <h1 className="text-5xl font-light tracking-tight text-[var(--text-primary)]">
                CopilotKit Showcase
            </h1>
            <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
                Explore integrations with agent frameworks, enterprise platforms,
                and provider SDKs. Try live demos, browse source code, and find
                the right starting point for your project.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
                <Link
                    href="/integrations"
                    className="rounded-lg bg-[var(--accent-blue)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                    Browse Integrations
                </Link>
                <Link
                    href="/matrix"
                    className="rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
                >
                    Feature Matrix
                </Link>
            </div>

            {integrations.length > 0 && (
                <div className="mt-20 text-left">
                    {categories.map((category) => {
                        const categoryIntegrations = integrations.filter(
                            (i) => i.category === category
                        );
                        return (
                            <div key={category} className="mb-12">
                                <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
                                    {getCategoryLabel(category)}
                                </h2>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {categoryIntegrations.map((integration) => (
                                        <Link
                                            key={integration.slug}
                                            href={`/integrations/${integration.slug}`}
                                            className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent-blue)] hover:-translate-y-0.5 transition-all"
                                        >
                                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                                                {integration.name}
                                            </h3>
                                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                {integration.features.length} features
                                                {" · "}
                                                {integration.demos.length} demos
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {integrations.length === 0 && (
                <p className="mt-20 text-[var(--text-muted)]">
                    No integrations registered yet. Run the template generator to
                    create your first integration package.
                </p>
            )}
        </div>
    );
}
