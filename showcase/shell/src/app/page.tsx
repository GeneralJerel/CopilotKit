import Link from "next/link";
import { getIntegrations, getFeatures } from "@/lib/registry";

export default function HomePage() {
    const integrations = getIntegrations();
    const features = getFeatures();

    const frameworks = [
        "LangGraph", "Mastra", "CrewAI", "PydanticAI", "Agno", "AG2",
        "LlamaIndex", "Langroid", "AWS Strands", "Spring AI", "MAF",
    ];

    return (
        <div className="flex" style={{ height: "calc(100vh - 52px)" }}>
            {/* Left: Conversational */}
            <div className="flex-1 flex flex-col border-r border-[var(--border)]">
                <div className="px-8 pt-6 pb-4 border-b border-[var(--border)]">
                    <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                        CopilotKit Docs
                    </h1>
                    <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                        Ask anything, explore the stack, or jump to what you need.
                    </p>
                </div>
                <div className="flex-1 flex flex-col px-8 py-5 overflow-y-auto">
                    <div className="flex-1">
                        {/* Bot message */}
                        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[var(--bg-elevated)] px-4 py-3 mb-3">
                            <div className="text-[10px] font-semibold text-[var(--text-muted)] mb-1">
                                CopilotKit
                            </div>
                            <p className="text-[14px] text-[var(--text)] leading-relaxed">
                                Welcome! I can help you find the right integration,
                                explore features, or get started with a quickstart guide.
                                What are you working on?
                            </p>
                        </div>

                        {/* Quick replies */}
                        <div className="flex flex-wrap gap-2 mt-3 mb-6">
                            <Link
                                href="/integrations"
                                className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[12px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
                            >
                                🚀 Get started with a framework
                            </Link>
                            <Link
                                href="/integrations/langgraph-python/gen-ui-tool-based"
                                className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[12px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
                            >
                                🎨 Explore Generative UI
                            </Link>
                            <Link
                                href="/integrations/langgraph-python/agentic-chat"
                                className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[12px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
                            >
                                💬 Try a live demo
                            </Link>
                            <Link
                                href="/matrix"
                                className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[12px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
                            >
                                📊 Feature comparison
                            </Link>
                            <span className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[12px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all cursor-pointer">
                                🤔 Help me choose a stack
                            </span>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 shadow-sm">
                        <input
                            type="text"
                            placeholder="Ask anything about CopilotKit..."
                            className="flex-1 bg-transparent text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
                            readOnly
                        />
                        <button className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs">
                            ↑
                        </button>
                    </div>
                </div>
            </div>

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
                    {frameworks.map((fw) => (
                        <StackChip key={fw} href={fw === "LangGraph" ? "/integrations/langgraph-python" : undefined}>
                            {fw}
                        </StackChip>
                    ))}
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
