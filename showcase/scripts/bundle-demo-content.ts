// Bundle Demo Content
//
// Reads demo source files and READMEs from all integration packages
// and produces a JSON bundle for the shell's Code and Docs tabs.
//
// Usage: npx tsx showcase/scripts/bundle-demo-content.ts

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const PACKAGES_DIR = path.join(ROOT, "packages");
const OUTPUT_PATH = path.join(ROOT, "shell", "src", "data", "demo-content.json");

interface DemoFile {
    filename: string;
    language: string;
    content: string;
}

interface DemoContent {
    readme: string | null;
    files: DemoFile[];
}

interface BundledContent {
    generated_at: string;
    demos: Record<string, DemoContent>; // key: "integration-slug::demo-id"
}

function detectLanguage(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const map: Record<string, string> = {
        ".tsx": "typescript",
        ".ts": "typescript",
        ".jsx": "javascript",
        ".js": "javascript",
        ".py": "python",
        ".cs": "csharp",
        ".css": "css",
        ".json": "json",
        ".yaml": "yaml",
        ".yml": "yaml",
        ".md": "markdown",
        ".mdx": "markdown",
    };
    return map[ext] || "text";
}

function main() {
    console.log("Bundling demo content...\n");

    const bundle: BundledContent = {
        generated_at: new Date().toISOString(),
        demos: {},
    };

    if (!fs.existsSync(PACKAGES_DIR)) {
        console.log("No packages directory found.");
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(bundle, null, 2) + "\n");
        return;
    }

    const packageDirs = fs
        .readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    for (const pkgDir of packageDirs) {
        const manifestPath = path.join(PACKAGES_DIR, pkgDir, "manifest.yaml");
        if (!fs.existsSync(manifestPath)) continue;

        const manifest = yaml.parse(fs.readFileSync(manifestPath, "utf-8"));
        const slug = manifest.slug as string;
        const demos = (manifest.demos || []) as Array<{ id: string; route: string }>;

        for (const demo of demos) {
            const demoDir = path.join(PACKAGES_DIR, pkgDir, "src", "app", "demos", demo.id);
            if (!fs.existsSync(demoDir)) continue;

            const key = `${slug}::${demo.id}`;
            const content: DemoContent = {
                readme: null,
                files: [],
            };

            const entries = fs.readdirSync(demoDir);
            for (const entry of entries) {
                const filePath = path.join(demoDir, entry);
                if (!fs.statSync(filePath).isFile()) continue;

                const fileContent = fs.readFileSync(filePath, "utf-8");

                if (entry === "README.md" || entry === "README.mdx") {
                    content.readme = fileContent;
                } else {
                    content.files.push({
                        filename: entry,
                        language: detectLanguage(entry),
                        content: fileContent,
                    });
                }
            }

            // Sort files: page.tsx first, then agent files, then others
            content.files.sort((a, b) => {
                if (a.filename.startsWith("page")) return -1;
                if (b.filename.startsWith("page")) return 1;
                if (a.filename.startsWith("agent")) return -1;
                if (b.filename.startsWith("agent")) return 1;
                return a.filename.localeCompare(b.filename);
            });

            bundle.demos[key] = content;
            console.log(`  ${key}: ${content.files.length} files, readme: ${content.readme ? "yes" : "no"}`);
        }
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(bundle, null, 2) + "\n");
    console.log(`\nBundled ${Object.keys(bundle.demos).length} demos to ${OUTPUT_PATH}\n`);
}

main();
