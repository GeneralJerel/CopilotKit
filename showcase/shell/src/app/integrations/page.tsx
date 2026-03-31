import { getIntegrations } from "@/lib/registry";
import { IntegrationExplorer } from "@/components/integration-explorer";

export default function IntegrationsPage() {
    const integrations = getIntegrations();

    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            <h1 className="text-3xl font-light text-[var(--text-primary)]">
                Integrations
            </h1>
            <p className="mt-2 mb-8 text-[var(--text-secondary)]">
                Explore CopilotKit integrations by framework, generative UI approach, or interaction modality.
            </p>
            <IntegrationExplorer integrations={integrations} />
        </div>
    );
}
