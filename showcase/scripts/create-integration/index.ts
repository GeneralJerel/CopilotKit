/*
 * Integration Package Generator
 *
 * Scaffolds a new integration package in showcase/packages/<slug>/
 * with all required files, demo stubs, and deployment configs.
 *
 * Usage:
 *   npx tsx create-integration/index.ts \
 *     --name "Anthropic (Claude Agent SDK)" \
 *     --slug anthropic-claude-sdk \
 *     --category provider-sdk \
 *     --language python \
 *     --features agentic-chat,hitl,tool-rendering
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..", "..");
const PACKAGES_DIR = path.join(ROOT, "packages");
const FEATURE_REGISTRY_PATH = path.join(ROOT, "shared", "feature-registry.json");

interface Feature {
    id: string;
    name: string;
    category: string;
    description: string;
}

interface CLIArgs {
    name: string;
    slug: string;
    category: string;
    language: string;
    features: string[];
}

function parseArgs(): CLIArgs {
    const args = process.argv.slice(2);
    const parsed: Record<string, string> = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("--")) {
            const key = args[i].slice(2);
            const val = args[i + 1];
            if (val && !val.startsWith("--")) {
                parsed[key] = val;
                i++;
            }
        }
    }

    if (!parsed.name || !parsed.slug || !parsed.category || !parsed.language || !parsed.features) {
        console.error("Usage: create-integration --name <name> --slug <slug> --category <category> --language <language> --features <comma-separated>");
        console.error("\nRequired flags:");
        console.error("  --name       Display name (e.g. 'Anthropic (Claude Agent SDK)')");
        console.error("  --slug       URL-safe ID (e.g. 'anthropic-claude-sdk')");
        console.error("  --category   One of: agent-framework, enterprise-platform, provider-sdk, protocol, starter");
        console.error("  --language   One of: python, typescript, dotnet");
        console.error("  --features   Comma-separated feature IDs (e.g. 'agentic-chat,hitl,tool-rendering')");
        process.exit(1);
    }

    return {
        name: parsed.name,
        slug: parsed.slug,
        category: parsed.category,
        language: parsed.language,
        features: parsed.features.split(",").map((f) => f.trim()),
    };
}

function loadFeatureRegistry(): Feature[] {
    const raw = fs.readFileSync(FEATURE_REGISTRY_PATH, "utf-8");
    return JSON.parse(raw).features;
}

function writeFile(filePath: string, content: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    console.log(`  Created: ${path.relative(ROOT, filePath)}`);
}

function generateManifest(args: CLIArgs, features: Feature[]): string {
    const demos = args.features.map((featureId) => {
        const feature = features.find((f) => f.id === featureId);
        const name = feature?.name || featureId;
        const description = feature?.description || "";
        const tags = [feature?.category || "general"].filter(Boolean);
        return {
            id: featureId,
            name,
            description,
            tags,
            route: `/demos/${featureId}`,
        };
    });

    const manifest = {
        name: args.name,
        slug: args.slug,
        category: args.category,
        language: args.language,
        logo: `/logos/${args.slug}.svg`,
        description: `CopilotKit integration with ${args.name}`,
        partner_docs: null,
        repo: `https://github.com/CopilotKit/CopilotKit/tree/main/showcase/packages/${args.slug}`,
        copilotkit_version: "2.0.0",
        backend_url: `https://showcase-${args.slug}.onrender.com`,
        features: args.features,
        demos,
    };

    return yaml.stringify(manifest);
}

function generatePackageJson(args: CLIArgs): string {
    const devCmd = args.language === "typescript"
        ? '"dev": "next dev --turbopack"'
        : '"dev": "concurrently \\"next dev --turbopack\\" \\"python -m uvicorn agent_server:app --host 0.0.0.0 --port 8000 --reload\\""';

    return JSON.stringify(
        {
            name: `@copilotkit/showcase-${args.slug}`,
            version: "0.1.0",
            private: true,
            scripts: {
                dev: args.language === "typescript"
                    ? "next dev --turbopack"
                    : 'concurrently "next dev --turbopack" "python -m uvicorn agent_server:app --host 0.0.0.0 --port 8000 --reload"',
                build: "next build",
                start: "next start",
                lint: "next lint",
                "test:e2e": "playwright test",
            },
            dependencies: {
                "@copilotkit/react-core": "workspace:*",
                "@copilotkit/runtime": "workspace:*",
                next: "^15.0.0",
                react: "^19.0.0",
                "react-dom": "^19.0.0",
                zod: "^3.24.0",
            },
            devDependencies: {
                "@playwright/test": "^1.50.0",
                "@types/node": "^22.0.0",
                "@types/react": "^19.0.0",
                typescript: "^5.7.0",
                ...(args.language !== "typescript" ? { concurrently: "^9.1.0" } : {}),
            },
        },
        null,
        2
    ) + "\n";
}

function generateLayout(): string {
    return `import type { Metadata } from "next";
import "@copilotkit/react-core/v2/styles.css";
import "./globals.css";

export const metadata: Metadata = {
    title: "CopilotKit Showcase",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
`;
}

function generateGlobalsCss(): string {
    return `@import "@copilotkit/react-core/v2/styles.css";

:root {
    --copilot-kit-background-color: #f8f9fa;
    --copilot-kit-primary-color: #0066ff;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 100vh;
}
`;
}

function generateIndexPage(args: CLIArgs, features: Feature[]): string {
    const demoLinks = args.features
        .map((featureId) => {
            const feature = features.find((f) => f.id === featureId);
            const name = feature?.name || featureId;
            const desc = feature?.description || "";
            return `                    <a key="${featureId}" href="/demos/${featureId}" className="demo-card">
                        <h3>${name}</h3>
                        <p>${desc}</p>
                    </a>`;
        })
        .join("\n");

    return `export default function Home() {
    return (
        <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <h1>${args.name}</h1>
            <p>Integration ID: ${args.slug}</p>
            <h2 style={{ marginTop: "2rem" }}>Demos</h2>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
${demoLinks}
            </div>
        </main>
    );
}
`;
}

function generateDemoPage(featureId: string, feature: Feature | undefined, args: CLIArgs): string {
    return `"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
    CopilotChat,
    useFrontendTool,
    useRenderTool,
    useAgentContext,
    useConfigureSuggestions,
    useHumanInTheLoop,
    useInterrupt,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

export default function ${toPascalCase(featureId)}Demo() {
    return (
        <CopilotKit runtimeUrl="/api/copilotkit" agent="${featureId}">
            <DemoContent />
        </CopilotKit>
    );
}

function DemoContent() {
    // TODO: Implement ${feature?.name || featureId} demo
    // See the LangGraph Python reference implementation for patterns
    //
    // Key hooks available:
    //   useFrontendTool({ name, description, parameters: z.object({...}), handler })
    //   useRenderTool({ name: "tool_name", render: ({ args }) => <Component /> })
    //   useHumanInTheLoop({ name, description, parameters, handler: ({ args, respond }) => ... })
    //   useAgentContext({ description, value })
    //   useConfigureSuggestions({ suggestions: [{ title, message }] })
    //   useInterrupt({ render: ({ event, resolve }) => <Component /> })

    useConfigureSuggestions({
        suggestions: [
            { title: "Get started", message: "Hello! What can you do?" },
        ],
    });

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <CopilotChat
                labels={{
                    title: "${feature?.name || featureId}",
                    placeholder: "Type a message...",
                }}
            />
        </div>
    );
}
`;
}

function generateDemoReadme(featureId: string, feature: Feature | undefined): string {
    return `# ${feature?.name || featureId}

## What This Demo Shows

${feature?.description || "TODO: Add description"}

## How to Interact

Try asking your Copilot to:

- "TODO: Add example prompts"
- "TODO: Add more examples"

## Technical Details

What's happening technically:

- TODO: Describe the technical implementation
- TODO: Explain the hooks and components used
- TODO: Note any framework-specific patterns
`;
}

function generateRuntimeRoute(args: CLIArgs): string {
    if (args.language === "typescript") {
        return `import { NextRequest } from "next/server";
import {
    CopilotRuntime,
    ExperimentalEmptyAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

// TODO: Import the appropriate agent adapter for ${args.name}
// Examples:
//   import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
//   import { MastraAgent } from "@ag-ui/mastra";

export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        endpoint: "/api/copilotkit",
        serviceAdapter: new ExperimentalEmptyAdapter(),
        runtime: new CopilotRuntime({
            // TODO: Configure agents for ${args.name}
            // agents: { default: new YourAgent({ ... }) },
        }),
    });

    return handleRequest(req);
};
`;
    }

    return `import { NextRequest } from "next/server";
import {
    CopilotRuntime,
    ExperimentalEmptyAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

// The agent backend runs as a separate process on port 8000.
// This runtime proxies CopilotKit requests to it via AG-UI protocol.

const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        endpoint: "/api/copilotkit",
        serviceAdapter: new ExperimentalEmptyAdapter(),
        runtime: new CopilotRuntime({
            // TODO: Configure the agent adapter for ${args.name}
            // The adapter should point to AGENT_URL
        }),
    });

    return handleRequest(req);
};
`;
}

function generateHealthRoute(args: CLIArgs): string {
    return `import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "ok",
        integration: "${args.slug}",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
    });
}
`;
}

function generateDockerfile(args: CLIArgs): string {
    if (args.language === "typescript") {
        return `FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-slim AS runner
WORKDIR /app
RUN corepack enable
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "start"]
`;
    }

    return `# Stage 1: Build Next.js frontend
FROM node:20-slim AS frontend
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Production image with Node.js + Python
FROM python:3.12-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl && \\
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \\
    apt-get install -y nodejs && \\
    npm install -g corepack && \\
    corepack enable && \\
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Next.js build artifacts
COPY --from=frontend /app/.next ./.next
COPY --from=frontend /app/node_modules ./node_modules
COPY --from=frontend /app/package.json ./
COPY --from=frontend /app/public ./public

# Agent code
COPY src/agent_server.py ./
COPY src/app/demos/*/agent.py ./agents/

# Entrypoint
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENV NODE_ENV=production
CMD ["./entrypoint.sh"]
`;
}

function generateEntrypoint(args: CLIArgs): string {
    if (args.language === "typescript") {
        return `#!/bin/bash
exec npx next start --port 3000
`;
    }

    return `#!/bin/bash
set -e

# Start agent backend
python -m uvicorn agent_server:app --host 0.0.0.0 --port 8000 &

# Start Next.js frontend
npx next start --port 3000 &

# Wait for either process to exit
wait -n
exit $?
`;
}

function generateRenderYaml(args: CLIArgs): string {
    return `services:
  - type: web
    name: showcase-${args.slug}
    runtime: docker
    dockerfilePath: ./Dockerfile
    dockerContext: .
    plan: starter
    region: oregon
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_BASE_URL
        value: https://showcase.copilotkit.dev
      - fromGroup: showcase-shared-secrets
`;
}

function generateEnvExample(args: CLIArgs): string {
    const lines = [
        "# API Keys (shared across integrations)",
        "OPENAI_API_KEY=sk-...",
        "ANTHROPIC_API_KEY=sk-ant-...",
        "",
    ];

    if (args.language !== "typescript") {
        lines.push("# Agent backend URL (for the CopilotKit runtime proxy)");
        lines.push("AGENT_URL=http://localhost:8000");
        lines.push("");
    }

    lines.push("# Showcase");
    lines.push("NEXT_PUBLIC_BASE_URL=http://localhost:3000");

    return lines.join("\n") + "\n";
}

function generateAgentServer(args: CLIArgs): string {
    if (args.language === "typescript") {
        return "";
    }

    return `"""
Agent Server for ${args.name}

FastAPI server that hosts the agent backend.
The Next.js CopilotKit runtime proxies requests here.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="${args.name} Agent Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


# TODO: Add CopilotKit agent endpoint
# See the LangGraph Python reference implementation for patterns
# @app.post("/copilotkit")
# async def copilotkit(request: Request):
#     ...
`;
}

function generateRequirementsTxt(args: CLIArgs): string {
    if (args.language === "typescript") {
        return "";
    }

    return `fastapi>=0.115.0
uvicorn>=0.34.0
copilotkit>=0.1.0
# TODO: Add framework-specific dependencies
`;
}

function generateE2ETest(featureId: string, feature: Feature | undefined): string {
    return `import { test, expect } from "@playwright/test";

test.describe("${feature?.name || featureId}", () => {
    test("page loads and chat renders", async ({ page }) => {
        await page.goto("/demos/${featureId}");

        // Chat interface should be visible
        await expect(page.getByPlaceholder("Type a message")).toBeVisible();
    });

    test("can send a message and receive a response", async ({ page }) => {
        await page.goto("/demos/${featureId}");

        const input = page.getByPlaceholder("Type a message");
        await input.fill("Hello");
        await input.press("Enter");

        // Wait for agent response (adjust timeout as needed)
        await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({
            timeout: 30000,
        });
    });

    // TODO: Add feature-specific assertions
});
`;
}

function generateQATemplate(featureId: string, feature: Feature | undefined, args: CLIArgs): string {
    return `# QA: ${feature?.name || featureId} — ${args.name}

## Prerequisites
- Demo is deployed and accessible
- Agent backend is healthy (check /api/health)

## Test Steps

### 1. Basic Functionality
- [ ] Navigate to the demo page
- [ ] Verify the chat interface loads
- [ ] Send a basic message
- [ ] Verify the agent responds

### 2. Feature-Specific Checks
- [ ] TODO: Add checks specific to ${feature?.name || featureId}

### 3. Error Handling
- [ ] Send an empty message (should be handled gracefully)
- [ ] Verify no console errors during normal usage

## Expected Results
- Chat loads within 3 seconds
- Agent responds within 10 seconds
- No UI errors or broken layouts
`;
}

function generatePlaywrightConfig(): string {
    return `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: process.env.BASE_URL || "http://localhost:3000",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: process.env.CI
        ? undefined
        : {
              command: "pnpm dev",
              url: "http://localhost:3000",
              reuseExistingServer: true,
          },
});
`;
}

function generateNextConfig(): string {
    return `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Allow iframe embedding from the showcase shell
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "ALLOWALL",
                    },
                    {
                        key: "Content-Security-Policy",
                        value: "frame-ancestors *;",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
`;
}

function generateTsConfig(): string {
    return JSON.stringify(
        {
            compilerOptions: {
                target: "ES2017",
                lib: ["dom", "dom.iterable", "esnext"],
                allowJs: true,
                skipLibCheck: true,
                strict: true,
                noEmit: true,
                esModuleInterop: true,
                module: "esnext",
                moduleResolution: "bundler",
                resolveJsonModule: true,
                isolatedModules: true,
                jsx: "preserve",
                incremental: true,
                plugins: [{ name: "next" }],
                paths: { "@/*": ["./src/*"] },
            },
            include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            exclude: ["node_modules"],
        },
        null,
        2
    ) + "\n";
}

function generateGitignore(): string {
    return `node_modules/
.next/
.env.local
.env
*.pyc
__pycache__/
.venv/
dist/
playwright-report/
test-results/
`;
}

function toPascalCase(str: string): string {
    return str
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");
}

function main() {
    const args = parseArgs();
    const features = loadFeatureRegistry();
    const packageDir = path.join(PACKAGES_DIR, args.slug);

    if (fs.existsSync(packageDir)) {
        console.error(`Error: Package directory already exists: ${packageDir}`);
        process.exit(1);
    }

    console.log(`\nCreating integration package: ${args.name}\n`);
    console.log(`  Slug:     ${args.slug}`);
    console.log(`  Category: ${args.category}`);
    console.log(`  Language: ${args.language}`);
    console.log(`  Features: ${args.features.join(", ")}`);
    console.log("");

    // Root files
    writeFile(path.join(packageDir, "manifest.yaml"), generateManifest(args, features));
    writeFile(path.join(packageDir, "package.json"), generatePackageJson(args));
    writeFile(path.join(packageDir, "Dockerfile"), generateDockerfile(args));
    writeFile(path.join(packageDir, "render.yaml"), generateRenderYaml(args));
    writeFile(path.join(packageDir, "entrypoint.sh"), generateEntrypoint(args));
    writeFile(path.join(packageDir, ".env.example"), generateEnvExample(args));
    writeFile(path.join(packageDir, ".gitignore"), generateGitignore());
    writeFile(path.join(packageDir, "next.config.ts"), generateNextConfig());
    writeFile(path.join(packageDir, "tsconfig.json"), generateTsConfig());
    writeFile(path.join(packageDir, "playwright.config.ts"), generatePlaywrightConfig());

    if (args.language !== "typescript") {
        writeFile(path.join(packageDir, "requirements.txt"), generateRequirementsTxt(args));
        writeFile(path.join(packageDir, "src", "agent_server.py"), generateAgentServer(args));
    }

    // App source
    writeFile(path.join(packageDir, "src", "app", "layout.tsx"), generateLayout());
    writeFile(path.join(packageDir, "src", "app", "globals.css"), generateGlobalsCss());
    writeFile(path.join(packageDir, "src", "app", "page.tsx"), generateIndexPage(args, features));
    writeFile(path.join(packageDir, "src", "app", "api", "copilotkit", "route.ts"), generateRuntimeRoute(args));
    writeFile(path.join(packageDir, "src", "app", "api", "health", "route.ts"), generateHealthRoute(args));

    // Demo stubs
    for (const featureId of args.features) {
        const feature = features.find((f) => f.id === featureId);
        writeFile(
            path.join(packageDir, "src", "app", "demos", featureId, "page.tsx"),
            generateDemoPage(featureId, feature, args)
        );
        writeFile(
            path.join(packageDir, "src", "app", "demos", featureId, "README.md"),
            generateDemoReadme(featureId, feature)
        );

        if (args.language !== "typescript") {
            writeFile(
                path.join(packageDir, "src", "app", "demos", featureId, "agent.py"),
                `"""
Agent implementation for ${feature?.name || featureId}

TODO: Implement the agent logic for ${args.name}
See the LangGraph Python reference implementation for patterns.
"""
`
            );
        } else {
            writeFile(
                path.join(packageDir, "src", "app", "demos", featureId, "agent.ts"),
                `/**
 * Agent implementation for ${feature?.name || featureId}
 *
 * TODO: Implement the agent logic for ${args.name}
 * See the LangGraph Python reference implementation for patterns.
 */
`
            );
        }

        // E2E test stub
        writeFile(
            path.join(packageDir, "tests", "e2e", `${featureId}.spec.ts`),
            generateE2ETest(featureId, feature)
        );

        // QA template
        writeFile(
            path.join(packageDir, "qa", `${featureId}.md`),
            generateQATemplate(featureId, feature, args)
        );
    }

    console.log(`\nPackage created at: showcase/packages/${args.slug}/`);
    console.log("\nNext steps:");
    console.log("  1. Write the agent code in each demo's agent file");
    console.log("  2. Customize README content with framework-specific details");
    console.log("  3. Fill in E2E test assertions");
    console.log("  4. Deploy to Render (render.yaml is ready)");
    console.log("  5. Open a PR to the monorepo\n");
}

main();
