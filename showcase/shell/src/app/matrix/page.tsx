import Link from "next/link";
import {
    getIntegrations,
    getFeatures,
    getFeatureCategories,
    getCategoryLabel,
} from "@/lib/registry";

export default function FeatureMatrixPage() {
    const integrations = getIntegrations();
    const features = getFeatures();
    const featureCategories = getFeatureCategories();

    if (integrations.length === 0) {
        return (
            <div className="mx-auto max-w-7xl px-6 py-12 text-center">
                <h1 className="text-3xl font-light text-[var(--text-primary)]">
                    Feature Matrix
                </h1>
                <p className="mt-6 text-[var(--text-muted)]">
                    No integrations registered yet.
                </p>
            </div>
        );
    }

    // Only show features that at least one integration supports
    const activeFeatures = features.filter((feature) =>
        integrations.some((i) => i.features.includes(feature.id))
    );

    // Group features by category
    const featuresByCategory = featureCategories
        .map((cat) => ({
            ...cat,
            features: activeFeatures.filter((f) => f.category === cat.id),
        }))
        .filter((cat) => cat.features.length > 0);

    return (
        <div className="mx-auto max-w-[100rem] px-6 py-12">
            <h1 className="text-3xl font-light text-[var(--text-primary)]">
                Feature Matrix
            </h1>
            <p className="mt-2 text-[var(--text-secondary)]">
                {integrations.length} integrations across{" "}
                {activeFeatures.length} features
            </p>

            <div className="mt-8 overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-10 bg-[var(--bg-deep)] p-3 text-left font-mono text-[var(--text-muted)] uppercase tracking-wider">
                                Integration
                            </th>
                            {featuresByCategory.map((cat) =>
                                cat.features.map((feature, idx) => (
                                    <th
                                        key={feature.id}
                                        className={`p-2 text-center font-mono text-[var(--text-muted)] ${
                                            idx === 0 ? "border-l border-[var(--border)]" : ""
                                        }`}
                                        title={feature.description}
                                    >
                                        <div className="max-w-[80px] truncate">
                                            {feature.name}
                                        </div>
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {integrations.map((integration) => (
                            <tr
                                key={integration.slug}
                                className="border-t border-[var(--border)] hover:bg-[var(--bg-surface)]"
                            >
                                <td className="sticky left-0 z-10 bg-[var(--bg-deep)] p-3">
                                    <Link
                                        href={`/integrations/${integration.slug}`}
                                        className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                                    >
                                        {integration.name}
                                    </Link>
                                    <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                                        {getCategoryLabel(integration.category)}
                                    </div>
                                </td>
                                {featuresByCategory.map((cat) =>
                                    cat.features.map((feature, idx) => {
                                        const supported =
                                            integration.features.includes(
                                                feature.id
                                            );
                                        const hasDemo =
                                            integration.demos.some(
                                                (d) => d.id === feature.id
                                            );
                                        return (
                                            <td
                                                key={feature.id}
                                                className={`p-2 text-center ${
                                                    idx === 0
                                                        ? "border-l border-[var(--border)]"
                                                        : ""
                                                }`}
                                            >
                                                {supported && hasDemo ? (
                                                    <Link
                                                        href={`/integrations/${integration.slug}/${feature.id}`}
                                                        className="inline-block rounded bg-[rgba(52,211,153,0.1)] px-2 py-0.5 text-[var(--accent-emerald)] hover:bg-[rgba(52,211,153,0.2)] transition-colors"
                                                        title={`Try ${feature.name} demo`}
                                                    >
                                                        ✓
                                                    </Link>
                                                ) : supported ? (
                                                    <span
                                                        className="text-[var(--text-muted)]"
                                                        title="Supported, no demo yet"
                                                    >
                                                        ·
                                                    </span>
                                                ) : (
                                                    <span className="text-[var(--border)]">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
