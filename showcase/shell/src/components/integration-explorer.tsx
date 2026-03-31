"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Integration } from "@/lib/registry";
import constraintsData from "@/data/constraints.json";

// Module-scope: stable reference, no useMemo needed
const constraints = constraintsData as {
    generative_ui: Record<string, { allowed?: string[]; excluded?: string[] }>;
    interaction_modalities: Record<string, { allowed?: string[]; excluded?: string[] }>;
};

const GEN_UI_LABELS: Record<string, string> = {
    "constrained-declarative": "Constrained (Declarative)",
    "constrained-explicit": "Constrained (Explicit)",
    open: "Open",
};

const MODALITY_LABELS: Record<string, string> = {
    sidebar: "Sidebar",
    embedded: "Embedded",
    popup: "Popup",
    chat: "Chat",
    headless: "Headless",
};

const GEN_UI_VALUES = Object.keys(GEN_UI_LABELS);
const MODALITY_VALUES = Object.keys(MODALITY_LABELS);

interface IntegrationExplorerProps {
    integrations: Integration[];
}

interface FilteredDemo {
    integration: Integration;
    demo: Integration["demos"][number];
}

export function IntegrationExplorer({ integrations }: IntegrationExplorerProps) {
    const [framework, setFramework] = useState("all");
    const [genUi, setGenUi] = useState("all");
    const [modality, setModality] = useState("all");

    // Only deployed integrations participate in filtering
    const deployed = useMemo(
        () => integrations.filter((i) => i.deployed),
        [integrations],
    );

    // Unique framework names from deployed integrations
    const frameworkOptions = useMemo(() => {
        const names = Array.from(new Set(deployed.map((i) => i.name))).sort();
        return names;
    }, [deployed]);

    // Determine "coming soon" enum values: those with no deployed packages
    const comingSoonGenUi = useMemo(() => {
        const available = new Set(deployed.flatMap((i) => i.generative_ui ?? []));
        return new Set(GEN_UI_VALUES.filter((v) => !available.has(v)));
    }, [deployed]);

    const comingSoonModality = useMemo(() => {
        const available = new Set(deployed.flatMap((i) => i.interaction_modalities ?? []));
        return new Set(MODALITY_VALUES.filter((v) => !available.has(v)));
    }, [deployed]);

    const filteredDemos = useMemo(() => {
        let packages = deployed;

        // Framework filter: keep only packages matching selected framework
        if (framework !== "all") {
            packages = packages.filter((i) => i.name === framework);
        }

        // Generative UI filter: package-level then demo-level
        if (genUi !== "all") {
            packages = packages.filter(
                (i) => i.generative_ui && i.generative_ui.includes(genUi),
            );
        }

        // Interaction modality filter: package-level
        if (modality !== "all") {
            packages = packages.filter(
                (i) => i.interaction_modalities && i.interaction_modalities.includes(modality),
            );
        }

        // Collect demos with demo-level filtering
        const results: FilteredDemo[] = [];

        for (const integration of packages) {
            for (const demo of integration.demos) {
                // Generative UI demo-level: keep only demos in allowed list
                if (genUi !== "all") {
                    const genUiConstraint = constraints.generative_ui[genUi];
                    if (genUiConstraint?.allowed && !genUiConstraint.allowed.includes(demo.id)) {
                        continue;
                    }
                }

                // Interaction modality demo-level: exclude demos in excluded list
                if (modality !== "all") {
                    const modalityConstraint = constraints.interaction_modalities[modality];
                    if (modalityConstraint?.excluded && modalityConstraint.excluded.includes(demo.id)) {
                        continue;
                    }
                }

                results.push({ integration, demo });
            }
        }

        return results;
    }, [deployed, framework, genUi, modality]);

    return (
        <div>
            {/* Selectors */}
            <div className="flex flex-wrap gap-3 mb-6">
                <SelectDropdown
                    label="AI Framework"
                    value={framework}
                    onChange={setFramework}
                    options={[
                        { value: "all", label: "All Frameworks" },
                        ...frameworkOptions.map((name) => ({ value: name, label: name })),
                    ]}
                />
                <SelectDropdown
                    label="Generative UI"
                    value={genUi}
                    onChange={setGenUi}
                    options={[
                        { value: "all", label: "All Approaches" },
                        ...GEN_UI_VALUES.map((v) => ({
                            value: v,
                            label: GEN_UI_LABELS[v],
                            disabled: comingSoonGenUi.has(v),
                            comingSoon: comingSoonGenUi.has(v),
                        })),
                    ]}
                />
                <SelectDropdown
                    label="Interaction Modality"
                    value={modality}
                    onChange={setModality}
                    options={[
                        { value: "all", label: "All Modalities" },
                        ...MODALITY_VALUES.map((v) => ({
                            value: v,
                            label: MODALITY_LABELS[v],
                            disabled: comingSoonModality.has(v),
                            comingSoon: comingSoonModality.has(v),
                        })),
                    ]}
                />
            </div>

            {/* Demo cards */}
            {filteredDemos.length === 0 ? (
                <div className="text-center py-16 text-[var(--text-muted)] text-sm">
                    No demos match the current filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDemos.map(({ integration, demo }) => (
                        <DemoCard
                            key={`${integration.slug}::${demo.id}`}
                            integration={integration}
                            demo={demo}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// SelectDropdown
// ---------------------------------------------------------------------------

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    comingSoon?: boolean;
}

function SelectDropdown({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: SelectOption[];
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                {label}
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 pr-8 text-[13px] text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--accent-blue)] focus:border-[var(--accent-blue)]"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23999\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                }}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}{opt.comingSoon ? " (coming soon)" : ""}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ---------------------------------------------------------------------------
// DemoCard
// ---------------------------------------------------------------------------

function DemoCard({
    integration,
    demo,
}: {
    integration: Integration;
    demo: Integration["demos"][number];
}) {
    return (
        <Link
            href={`/integrations/${integration.slug}?demo=${demo.id}`}
            className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--accent-blue)] hover:shadow-md"
        >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
                    {integration.name}
                </span>
                {integration.managed_platform && (
                    <span
                        className="inline-flex items-center rounded-full bg-[var(--accent-blue)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent-blue)] cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            window.open(integration.managed_platform!.url, "_blank");
                        }}
                    >
                        {integration.managed_platform.name}
                    </span>
                )}
            </div>

            {/* Name + description */}
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-blue)] transition-colors">
                {demo.name}
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">
                {demo.description}
            </p>

            {/* Tags */}
            {demo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {demo.tags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-md bg-[var(--bg-deep)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}
