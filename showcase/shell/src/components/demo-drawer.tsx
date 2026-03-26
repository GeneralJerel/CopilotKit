"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface DemoDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    integrationSlug: string;
    integrationName: string;
    demoId: string;
    demoName: string;
    backendUrl: string;
    demoRoute: string;
    wide?: boolean; // true for sidebar-type demos that need more space
}

export function DemoDrawer({
    isOpen,
    onClose,
    integrationSlug,
    integrationName,
    demoId,
    demoName,
    backendUrl,
    demoRoute,
    wide = false,
}: DemoDrawerProps) {
    const [activeTab, setActiveTab] = useState<"preview" | "code" | "docs">("preview");
    const [demoContent, setDemoContent] = useState<any>(null);

    useEffect(() => {
        if (isOpen && demoId) {
            import("@/data/demo-content.json").then((mod) => {
                const content = mod.default as any;
                const key = `${integrationSlug}::${demoId}`;
                if (content.demos[key]) {
                    setDemoContent(content.demos[key]);
                }
            });
        }
    }, [isOpen, integrationSlug, demoId]);

    // Close on ESC
    useEffect(() => {
        if (!isOpen) return;
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    const iframeSrc = `${backendUrl}${demoRoute}`;

    const tabs: { id: "preview" | "code" | "docs"; label: string }[] = [
        { id: "preview", label: "Preview" },
        { id: "code", label: "Code" },
        { id: "docs", label: "Docs" },
    ];

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[60] bg-black/15 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                style={{ top: "52px" }}
            />

            {/* Drawer */}
            <div
                className="fixed top-[52px] right-0 bottom-0 z-[70] flex flex-col bg-[var(--bg-surface)] border-l border-[var(--border)]"
                style={{
                    width: wide ? "80%" : "55%",
                    boxShadow: "-8px 0 30px rgba(0,0,0,0.06)",
                    animation: "slideIn 0.25s ease",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-semibold text-[var(--text)]">
                            {demoName}
                        </span>
                        <span
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                        >
                            ● Live
                        </span>
                        <div className="flex gap-1 ml-3">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? "bg-[var(--bg-elevated)] text-[var(--text)]"
                                            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === "preview" && (
                        <iframe
                            src={iframeSrc}
                            className="h-full w-full border-0"
                            title={`${demoName} demo`}
                            allow="clipboard-read; clipboard-write"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                    )}

                    {activeTab === "code" && (
                        <div className="h-full overflow-auto">
                            {demoContent?.files?.length > 0 ? (
                                <SyntaxHighlighter
                                    language={demoContent.files[0].language}
                                    style={oneLight}
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: 0,
                                        background: "var(--bg-elevated)",
                                        fontSize: "13px",
                                        lineHeight: "1.6",
                                        padding: "20px",
                                    }}
                                    showLineNumbers
                                    lineNumberStyle={{
                                        color: "var(--text-faint)",
                                        fontSize: "11px",
                                        paddingRight: "1em",
                                        minWidth: "3em",
                                    }}
                                >
                                    {demoContent.files[0].content}
                                </SyntaxHighlighter>
                            ) : (
                                <div className="flex h-full items-center justify-center text-[var(--text-muted)] text-sm">
                                    No source files available.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "docs" && (
                        <div className="h-full overflow-auto p-6">
                            {demoContent?.readme ? (
                                <div className="max-w-2xl mx-auto [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-[var(--text)] [&_h1]:mb-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[var(--text)] [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[var(--text)] [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:text-sm [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:text-sm [&_li]:text-[var(--text-secondary)] [&_li]:mb-1 [&_strong]:text-[var(--text)] [&_code]:text-[var(--accent)] [&_code]:bg-[var(--bg-elevated)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-[var(--bg-elevated)] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre]:text-xs">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {demoContent.readme}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-[var(--text-muted)] text-sm">
                                    No documentation available.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </>
    );
}
