// Migration Script: examples/integrations → showcase/packages
//
// Copies agent code from existing examples/integrations/<name>/
// into the corresponding showcase/packages/<slug>/src/agents/
//
// Usage:
//   npx tsx showcase/scripts/migrate-integration-examples.ts [--dry-run]
//   npx tsx showcase/scripts/migrate-integration-examples.ts --integration mastra
//
// This script:
// 1. Scans examples/integrations/ for existing integration directories
// 2. Matches them to showcase/packages/ by slug
// 3. Copies agent code (Python/TS files) into the showcase package
// 4. Reports what was copied and what needs manual attention

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const EXAMPLES_DIR = path.join(REPO_ROOT, "examples", "integrations");
const PACKAGES_DIR = path.join(__dirname, "..", "packages");

const DRY_RUN = process.argv.includes("--dry-run");
const SINGLE = process.argv.find((a) => a === "--integration");
const SINGLE_NAME = SINGLE
    ? process.argv[process.argv.indexOf(SINGLE) + 1]
    : null;

// Map from examples/integrations dir name → showcase package slug
const SLUG_MAP: Record<string, string> = {
    "langgraph-python": "langgraph-python",
    "langgraph-js": "langgraph-typescript",
    "langgraph-fastapi": "langgraph-fastapi",
    mastra: "mastra",
    "crewai-crews": "crewai",
    "crewai-flows": "crewai", // both map to same package
    "pydantic-ai": "pydanticai",
    agno: "agno",
    llamaindex: "llamaindex",
    adk: "google-adk",
    "ms-agent-framework-dotnet": "maf-dotnet",
    "ms-agent-framework-python": "maf-python",
    "strands-python": "aws-strands",
    "agent-spec": "agent-spec-langgraph",
    "a2a-a2ui": "a2a",
    "a2a-middleware": "a2a",
    "mcp-apps": "mcp-apps",
};

interface MigrationResult {
    example: string;
    slug: string;
    files: string[];
    skipped: string[];
    errors: string[];
}

function findAgentFiles(dir: string): string[] {
    const results: string[] = [];

    function walk(current: string, rel: string) {
        if (!fs.existsSync(current)) return;
        const entries = fs.readdirSync(current, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            const relPath = path.join(rel, entry.name);

            if (entry.isDirectory()) {
                // Skip node_modules, .next, __pycache__, .venv
                if (
                    ["node_modules", ".next", "__pycache__", ".venv", ".git", "dist"].includes(
                        entry.name
                    )
                ) {
                    continue;
                }
                walk(fullPath, relPath);
            } else if (entry.isFile()) {
                // Collect Python and TypeScript agent files
                if (
                    entry.name.endsWith(".py") ||
                    (entry.name.endsWith(".ts") &&
                        !entry.name.endsWith(".d.ts") &&
                        !entry.name.endsWith(".spec.ts") &&
                        !entry.name.endsWith(".test.ts"))
                ) {
                    results.push(relPath);
                }
            }
        }
    }

    walk(dir, "");
    return results;
}

function migrateIntegration(exampleName: string): MigrationResult {
    const slug = SLUG_MAP[exampleName];
    const result: MigrationResult = {
        example: exampleName,
        slug: slug || "UNMAPPED",
        files: [],
        skipped: [],
        errors: [],
    };

    if (!slug) {
        result.errors.push(`No slug mapping for "${exampleName}"`);
        return result;
    }

    const exampleDir = path.join(EXAMPLES_DIR, exampleName);
    const packageDir = path.join(PACKAGES_DIR, slug);

    if (!fs.existsSync(exampleDir)) {
        result.errors.push(`Example dir not found: ${exampleDir}`);
        return result;
    }

    // Find agent files in the example
    // Look in apps/agent/ first (langgraph-python structure), then root
    const agentDirs = [
        path.join(exampleDir, "apps", "agent"),
        path.join(exampleDir, "agent"),
        exampleDir,
    ];

    const agentFiles: string[] = [];
    for (const dir of agentDirs) {
        if (fs.existsSync(dir)) {
            agentFiles.push(...findAgentFiles(dir));
            if (agentFiles.length > 0) break; // Use the first dir that has files
        }
    }

    if (agentFiles.length === 0) {
        result.skipped.push("No agent files found");
        return result;
    }

    // Target directory in the showcase package
    const targetDir = path.join(packageDir, "src", "agents");

    if (!fs.existsSync(packageDir)) {
        result.skipped.push(
            `Package dir doesn't exist yet: showcase/packages/${slug}/ (run create-integration first)`
        );
        // Still list what would be copied
        for (const file of agentFiles) {
            result.skipped.push(`  would copy: ${file}`);
        }
        return result;
    }

    // Copy files
    for (const file of agentFiles) {
        const sourcePath = path.join(
            agentDirs.find((d) => fs.existsSync(d)) || exampleDir,
            file
        );
        const targetPath = path.join(targetDir, file);

        if (DRY_RUN) {
            result.files.push(`[dry-run] ${file}`);
            continue;
        }

        try {
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            fs.copyFileSync(sourcePath, targetPath);
            result.files.push(file);
        } catch (e: any) {
            result.errors.push(`Failed to copy ${file}: ${e.message}`);
        }
    }

    return result;
}

function main() {
    console.log("Migration: examples/integrations → showcase/packages\n");
    if (DRY_RUN) console.log("DRY RUN — no files will be copied\n");

    if (!fs.existsSync(EXAMPLES_DIR)) {
        console.error(`Examples directory not found: ${EXAMPLES_DIR}`);
        process.exit(1);
    }

    const examples = SINGLE_NAME
        ? [SINGLE_NAME]
        : fs
              .readdirSync(EXAMPLES_DIR, { withFileTypes: true })
              .filter((d) => d.isDirectory())
              .map((d) => d.name);

    const results: MigrationResult[] = [];

    for (const example of examples) {
        const result = migrateIntegration(example);
        results.push(result);

        const status =
            result.errors.length > 0
                ? "ERROR"
                : result.skipped.length > 0
                  ? "SKIP"
                  : "OK";

        console.log(
            `  [${status}] ${example} → ${result.slug} (${result.files.length} files)`
        );
        for (const err of result.errors) console.log(`         ERROR: ${err}`);
        for (const skip of result.skipped)
            console.log(`         SKIP: ${skip}`);
    }

    console.log("\n--- Summary ---");
    console.log(`Total examples: ${results.length}`);
    console.log(
        `Migrated: ${results.filter((r) => r.files.length > 0).length}`
    );
    console.log(
        `Skipped: ${results.filter((r) => r.skipped.length > 0).length}`
    );
    console.log(
        `Errors: ${results.filter((r) => r.errors.length > 0).length}`
    );

    // List unmapped examples
    const unmapped = results.filter((r) => r.slug === "UNMAPPED");
    if (unmapped.length > 0) {
        console.log(
            `\nUnmapped examples (add to SLUG_MAP): ${unmapped.map((r) => r.example).join(", ")}`
        );
    }
}

main();
