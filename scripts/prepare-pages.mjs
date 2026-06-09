import { cpSync, mkdirSync, copyFileSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";

const ASSETS = ".open-next/assets";
const WORKER_DIR = join(ASSETS, "_worker.js"); // directory, not a file!

// 1. Remove old _worker.js (whether file or directory) to start clean
if (existsSync(WORKER_DIR)) {
  rmSync(WORKER_DIR, { recursive: true, force: true });
}

// Also remove any stale _worker.js file from previous builds
const oldWorkerFile = join(ASSETS, "_worker.js");
if (existsSync(oldWorkerFile)) {
  rmSync(oldWorkerFile, { recursive: true, force: true });
}

// 2. Create _worker.js/ directory structure
//    Cloudflare Pages treats a _worker.js DIRECTORY as an unbundled worker module
//    with index.js as the entry point — no esbuild bundling step.
mkdirSync(WORKER_DIR, { recursive: true });

// 3. Copy the worker entry point as index.js inside the directory
copyFileSync(".open-next/worker.js", join(WORKER_DIR, "index.js"));

// 4. Copy all directories that worker.js imports from
const dirs = ["cloudflare", "middleware", ".build", "server-functions"];
for (const dir of dirs) {
  cpSync(`.open-next/${dir}`, join(WORKER_DIR, dir), { recursive: true });
}

// 5. Write _routes.json so static assets bypass the worker
writeFileSync(
  join(ASSETS, "_routes.json"),
  JSON.stringify(
    {
      version: 1,
      include: ["/*"],
      exclude: [
        "/_next/static/*",
        "/favicon.ico",
        "/robots.txt",
        "/sitemap.xml",
        "/manifest.webmanifest",
        "/icon.png",
        "/icon-*",
        "/apple-icon.png",
        "/placeholder*.jpg",
        "/placeholder*.png",
        "/placeholder*.svg",
      ],
    },
    null,
    2
  )
);

console.log("✅ Pages assets prepared — _worker.js/ directory created (unbundled mode).");
