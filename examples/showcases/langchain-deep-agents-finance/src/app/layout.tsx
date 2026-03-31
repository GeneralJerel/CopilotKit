import type { Metadata } from "next";
import { CopilotKit } from "@copilotkit/react-core";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";

export const metadata: Metadata = {
  title: "FinSight | AI-Powered Portfolio Risk Analyst",
  description:
    "A financial advisory copilot powered by Deep Agents and CopilotKit — demonstrating useFrontendTool generative UI, multi-agent analysis, and human-in-the-loop approval workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CopilotKit runtimeUrl="/api/copilotkit" agent="finsight_analyst">
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
