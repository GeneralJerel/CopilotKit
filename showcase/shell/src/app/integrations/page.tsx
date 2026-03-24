import Link from "next/link";
import {
    getIntegrations,
    getCategoryLabel,
    getLanguageLabel,
} from "@/lib/registry";

export default function IntegrationsPage() {
    const integrations = getIntegrations();
    const categories = [...new Set(integrations.map((i) => i.category))];

    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            <h1 className="text-3xl font-light text-[var(--text-primary)]">
                Integrations
            </h1>
            <p className="mt-2 text-[var(--text-secondary)]">
                {integrations.length} integrations across{" "}
                {categories.length} categories
            </p>

            {categories.map((category) => {
                const items = integrations.filter(
                    (i) => i.category === category
                );
                return (
                    <section key={category} className="mt-10">
                        <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-[var(--accent-cyan)]">
                            {getCategoryLabel(category)}
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((integration) => (
                                <Link
                                    key={integration.slug}
                                    href={`/integrations/${integration.slug}`}
                                    className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 hover:border-[var(--accent-blue)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-[var(--text-primary)]">
                                            {integration.name}
                                        </h3>
                                        <span className="rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)]">
                                            {getLanguageLabel(
                                                integration.language
                                            )}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
                                        {integration.description}
                                    </p>
                                    <div className="mt-4 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                        <span>
                                            {integration.features.length}{" "}
                                            features
                                        </span>
                                        <span>·</span>
                                        <span>
                                            {integration.demos.length} demos
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            })}

            {integrations.length === 0 && (
                <p className="mt-12 text-center text-[var(--text-muted)]">
                    No integrations registered yet.
                </p>
            )}
        </div>
    );
}
