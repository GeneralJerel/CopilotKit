import Link from "next/link";
import { getIntegrations, getFeatures } from "@/lib/registry";
import { HomeChat } from "@/components/home-chat";

export default function HomePage() {
    const integrations = getIntegrations();
    const features = getFeatures();

    const frameworks = [
        "LangGraph", "Mastra", "CrewAI", "PydanticAI", "Agno", "AG2",
        "LlamaIndex", "Langroid", "AWS Strands", "Spring AI", "MAF",
    ];

    return (
        <div className="flex" style={{ height: "calc(100vh - 52px)" }}>
            {/* Left: CopilotChat */}
            <HomeChat />

            {/* Right: Stack Nav */}
            <div className="w-[340px] overflow-y-auto px-5 py-5 bg-[var(--bg-elevated)]">
                <h3 className="text-[10px] font-mono uppercase tracking-[2px] text-[var(--text-faint)] mb-4">
                    The Stack
                </h3>

                <StackLayer label="Frontend Platform">
                    <StackChip href="/integrations">React</StackChip>
                    <StackChip>Angular</StackChip>
                    <StackChip>Vue</StackChip>
                    <StackChip>TanStack</StackChip>
                    <StackChip>React Native</StackChip>
                    <StackChip>SwiftUI</StackChip>
                </StackLayer>

                <StackConnector />

                <StackLayer label="Chat UI">
                    <StackChip href="/integrations/langgraph-python/agentic-chat">CopilotChat</StackChip>
                    <StackChip>Sidebar</StackChip>
                    <StackChip>Popup</StackChip>
                    <StackChip>Headless</StackChip>
                </StackLayer>

                <StackConnector />

                <StackLayer label="Generative UI">
                    <StackChip href="/integrations/langgraph-python/gen-ui-tool-based">Controlled</StackChip>
                    <StackChip>Declarative</StackChip>
                    <StackChip>Open</StackChip>
                </StackLayer>

                <StackConnector />

                <StackLayer label="Interaction">
                    <StackChip href="/integrations/langgraph-python/hitl">Human in the Loop</StackChip>
                    <StackChip>Frontend Tools</StackChip>
                    <StackChip>Tool Rendering</StackChip>
                    <StackChip>Readables</StackChip>
                    <StackChip>Agent Context</StackChip>
                    <StackChip>Suggestions</StackChip>
                    <StackChip>Voice</StackChip>
                    <StackChip>Multi-modal</StackChip>
                </StackLayer>

                <StackConnector />

                <div className="text-center py-2 px-4 border-2 border-[var(--accent)] rounded-xl bg-[var(--accent-light)] text-xs font-semibold text-[var(--accent)]">
                    CopilotKit
                </div>

                <StackConnector />

                <div className="text-center py-2 px-4 border-2 border-[var(--violet)] rounded-xl bg-[var(--violet-light)] text-xs font-semibold text-[var(--violet)]">
                    AG-UI Protocol
                </div>

                <StackConnector />

                <StackLayer label="Agent Frameworks">
                    {frameworks.map((fw) => {
                        const match = integrations.find((i) => i.deployed && (i.name === fw || i.name.startsWith(fw)));
                        return (
                            <StackChip key={fw} href={match ? `/integrations/${match.slug}` : undefined}>
                                {fw}
                            </StackChip>
                        );
                    })}
                </StackLayer>

                <StackConnector />

                <StackLayer label="Platforms">
                    <StackChip>LangSmith</StackChip>
                    <StackChip>Google ADK</StackChip>
                    <StackChip>AWS Agent Core</StackChip>
                    <StackChip>Azure AI Foundry</StackChip>
                    <StackChip>Cloudflare Workers</StackChip>
                    <StackChip>Vercel</StackChip>
                    <StackChip>Render</StackChip>
                </StackLayer>

                <StackConnector />

                <StackLayer label="LLM Providers">
                    <StackChip>OpenAI</StackChip>
                    <StackChip>Anthropic</StackChip>
                    <StackChip>Google</StackChip>
                    <StackChip>AWS Bedrock</StackChip>
                    <StackChip>Azure OpenAI</StackChip>
                    <StackChip>Groq</StackChip>
                    <StackChip>Ollama</StackChip>
                    <StackChip>Any OpenAI-compatible</StackChip>
                </StackLayer>

                <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
                    <p className="text-[10px] text-[var(--text-faint)]">
                        {features.length} features · {integrations.length} integrations
                    </p>
                </div>
            </div>
        </div>
    );
}

function StackLayer({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="mb-4">
            <div className="text-[9px] font-mono uppercase tracking-[1.5px] text-[var(--accent)] font-semibold mb-2">
                {label}
            </div>
            <div className="flex flex-wrap gap-1">
                {children}
            </div>
        </div>
    );
}

function StackChip({ children, href }: { children: React.ReactNode; href?: string }) {
    if (href) {
        return (
            <Link href={href} className="px-2.5 py-1 rounded text-[10px] font-medium bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer">
                {children}
            </Link>
        );
    }
    return (
        <span className="px-2.5 py-1 rounded text-[10px] font-medium bg-[var(--bg-elevated)] border border-[var(--border-dim)] text-[var(--text-faint)] cursor-default">
            {children}
        </span>
    );
}

function StackConnector() {
    return (
        <div className="text-center text-[var(--text-faint)] text-[10px] py-0.5">↓</div>
    );
}
