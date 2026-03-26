#!/usr/bin/env npx tsx
/**
 * deploy-to-render.ts — Create or update a Render service for a showcase integration.
 *
 * Reads the package's render.yaml + manifest.yaml and creates the Render
 * service via API, matching the exact config of existing showcase services.
 *
 * Usage:
 *   npx tsx showcase/scripts/deploy-to-render.ts <slug>
 *   npx tsx showcase/scripts/deploy-to-render.ts mastra
 *   npx tsx showcase/scripts/deploy-to-render.ts --list          # list existing showcase services
 *   npx tsx showcase/scripts/deploy-to-render.ts --go-live <slug> # flip deployed: true + redeploy
 *
 * Requires: RENDER_API_KEY env var or ~/.render/cli.yaml
 */

import fs from "fs";
import path from "path";
import yaml from "yaml";

const ROOT = path.resolve(import.meta.dirname, "..");
const PACKAGES_DIR = path.join(ROOT, "packages");

// Reference service config (langgraph-python) — used as template
const REFERENCE = {
    ownerId: "tea-cs79biogph6c73fgnbeg",
    environmentId: "evm-d7129oggjchc7396sha0", // "showcase" project
    registryCredentialId: "rgc-d71koqp5pdvs7380o5p0", // GHCR credential
    region: "oregon",
    plan: "starter",
    runtime: "image",
};

function getApiKey(): string {
    if (process.env.RENDER_API_KEY) return process.env.RENDER_API_KEY;

    const cliConfig = path.join(
        process.env.HOME || "~",
        ".render",
        "cli.yaml"
    );
    if (fs.existsSync(cliConfig)) {
        const config = yaml.parse(fs.readFileSync(cliConfig, "utf-8"));
        if (config?.api?.key) return config.api.key;
    }

    console.error(
        "No Render API key found. Set RENDER_API_KEY or run `render login`."
    );
    process.exit(1);
}

async function renderApi(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
): Promise<unknown> {
    const apiKey = getApiKey();
    const url = `https://api.render.com/v1${endpoint}`;
    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Render API ${method} ${endpoint}: ${res.status} ${text}`);
    }

    if (res.status === 204) return {};
    return res.json();
}

async function listShowcaseServices(): Promise<
    Array<{ id: string; name: string; url: string; status: string }>
> {
    const data = (await renderApi(
        "GET",
        `/services?ownerId=${REFERENCE.ownerId}&limit=100`
    )) as Array<{ service: Record<string, unknown> }>;

    return data
        .filter(
            (d) =>
                (d.service.name as string).startsWith("showcase-") ||
                (d.service.name as string) === "langgraph-python"
        )
        .map((d) => ({
            id: d.service.id as string,
            name: d.service.name as string,
            url: ((d.service.serviceDetails as Record<string, unknown>)?.url as string) || "",
            status: d.service.suspended as string || "active",
        }));
}

async function findService(
    name: string
): Promise<{ id: string; url: string } | null> {
    const services = await listShowcaseServices();
    const match = services.find((s) => s.name === name);
    return match ? { id: match.id, url: match.url } : null;
}

async function createService(slug: string): Promise<void> {
    const pkgDir = path.join(PACKAGES_DIR, slug);
    if (!fs.existsSync(pkgDir)) {
        console.error(`Package not found: ${pkgDir}`);
        process.exit(1);
    }

    const manifestPath = path.join(pkgDir, "manifest.yaml");
    const renderYamlPath = path.join(pkgDir, "render.yaml");

    if (!fs.existsSync(manifestPath)) {
        console.error(`No manifest.yaml in ${pkgDir}`);
        process.exit(1);
    }

    const manifest = yaml.parse(fs.readFileSync(manifestPath, "utf-8"));
    const serviceName = `showcase-${slug}`;
    const imagePath = `ghcr.io/copilotkit/showcase-${slug}:latest`;

    // Check if already exists
    const existing = await findService(serviceName);
    if (existing) {
        console.log(`Service ${serviceName} already exists: ${existing.url}`);
        console.log(`Dashboard: https://dashboard.render.com/web/${existing.id}`);
        return;
    }

    console.log(`Creating Render service: ${serviceName}`);
    console.log(`  Image: ${imagePath}`);
    console.log(`  Region: ${REFERENCE.region}`);
    console.log(`  Plan: ${REFERENCE.plan}`);

    // Parse render.yaml for env vars
    let envVars: Array<{ key: string; value: string }> = [];
    let envGroupName: string | null = null;
    if (fs.existsSync(renderYamlPath)) {
        const renderYaml = yaml.parse(
            fs.readFileSync(renderYamlPath, "utf-8")
        );
        const svc = renderYaml?.services?.[0];
        if (svc?.envVars) {
            for (const ev of svc.envVars) {
                if (ev.fromGroup) {
                    envGroupName = ev.fromGroup;
                } else if (ev.key && ev.value) {
                    envVars.push({ key: ev.key, value: ev.value });
                }
            }
        }
    }

    // Create the service inside the "showcase" project
    const createBody = {
        type: "web_service",
        name: serviceName,
        ownerId: REFERENCE.ownerId,
        environmentId: REFERENCE.environmentId,
        image: {
            ownerId: REFERENCE.ownerId,
            imagePath,
            registryCredentialId: REFERENCE.registryCredentialId,
        },
        serviceDetails: {
            region: REFERENCE.region,
            plan: REFERENCE.plan,
            runtime: REFERENCE.runtime,
            healthCheckPath: "/api/health",
            envSpecificDetails: {
                dockerCommand: "",
                dockerContext: "",
                dockerfilePath: "",
            },
            openPorts: [
                { port: 10000, protocol: "TCP" },
            ],
        },
        envVars: envVars.map((ev) => ({
            key: ev.key,
            value: ev.value,
        })),
    };

    const result = (await renderApi("POST", "/services", createBody)) as {
        service: { id: string; serviceDetails: { url: string } };
    };
    const svcId = result.service.id;
    const svcUrl = result.service.serviceDetails.url;

    console.log(`\n  Created: ${svcUrl}`);
    console.log(`  ID: ${svcId}`);
    console.log(`  Dashboard: https://dashboard.render.com/web/${svcId}`);

    // Link env group if specified
    // API: POST /env-groups/{envGroupId}/services/{serviceId}
    if (envGroupName) {
        console.log(`\n  Linking env group: ${envGroupName}`);
        const groups = (await renderApi(
            "GET",
            `/env-groups?ownerId=${REFERENCE.ownerId}&limit=100`
        )) as Array<{ envGroup: { id: string; name: string } }>;
        const group = groups.find((g) => g.envGroup.name === envGroupName);
        if (group) {
            await renderApi(
                "POST",
                `/env-groups/${group.envGroup.id}/services/${svcId}`
            );
            console.log(`  Linked: ${envGroupName}`);
        } else {
            console.warn(
                `  WARNING: Env group "${envGroupName}" not found. Link manually in dashboard.`
            );
        }
    }

    // Update deploy workflow with the service ID
    const workflowPath = path.resolve(
        ROOT, "..", ".github", "workflows", "showcase_deploy.yml"
    );
    if (fs.existsSync(workflowPath)) {
        let workflow = fs.readFileSync(workflowPath, "utf-8");
        // Replace the placeholder RENDER_SERVICE_ID in the slug's deploy step
        const placeholder = new RegExp(
            `(showcase-${slug}.*?services/)RENDER_SERVICE_ID(/deploys)`,
            "s"
        );
        if (workflow.match(placeholder)) {
            workflow = workflow.replace(placeholder, `$1${svcId}$2`);
            fs.writeFileSync(workflowPath, workflow);
            console.log(`\n  Updated showcase_deploy.yml with service ID ${svcId}`);
        }
    }

    console.log(`
Done! Next steps:
  1. Push an image: docker build & push to ghcr.io/copilotkit/showcase-${slug}:latest
     (or push code and let CI build it)
  2. Once healthy: npx tsx showcase/scripts/deploy-to-render.ts --go-live ${slug}
  3. Commit the workflow changes and push
`);
}

async function goLive(slug: string): Promise<void> {
    const manifestPath = path.join(PACKAGES_DIR, slug, "manifest.yaml");
    if (!fs.existsSync(manifestPath)) {
        console.error(`No manifest.yaml for ${slug}`);
        process.exit(1);
    }

    // Check health
    const url = `https://showcase-${slug}.onrender.com/api/health`;
    console.log(`Checking health: ${url}`);
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
            console.error(`Health check failed: ${res.status}`);
            process.exit(1);
        }
        console.log(`  Healthy!`);
    } catch (e: unknown) {
        console.error(`  Not reachable: ${(e as Error).message}`);
        process.exit(1);
    }

    // Update manifest
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const updated = raw.replace(/^deployed:\s*false$/m, "deployed: true");
    fs.writeFileSync(manifestPath, updated);
    console.log(`  Set deployed: true in manifest.yaml`);

    // Regenerate registry
    console.log(`  Regenerating registry...`);
    const { execSync } = await import("child_process");
    execSync("npx tsx showcase/scripts/generate-registry.ts", {
        cwd: path.resolve(ROOT, ".."),
        stdio: "inherit",
    });

    console.log(`\nDone! Commit and push to light up the stack chip.`);
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === "--help") {
        console.log(`Usage:
  npx tsx showcase/scripts/deploy-to-render.ts <slug>          Create Render service
  npx tsx showcase/scripts/deploy-to-render.ts --list          List showcase services
  npx tsx showcase/scripts/deploy-to-render.ts --go-live <slug> Verify health + flip deployed
`);
        process.exit(0);
    }

    if (args[0] === "--list") {
        const services = await listShowcaseServices();
        console.log("Showcase services on Render:\n");
        for (const s of services) {
            console.log(`  ${s.name.padEnd(30)} ${s.url}`);
        }
        return;
    }

    if (args[0] === "--go-live") {
        if (!args[1]) {
            console.error("Usage: --go-live <slug>");
            process.exit(1);
        }
        await goLive(args[1]);
        return;
    }

    await createService(args[0]);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
