import { cpSync, copyFileSync, writeFileSync } from "fs";

const ASSETS = ".open-next/assets";

// 1. Copy worker entry-point
copyFileSync(".open-next/worker.js", `${ASSETS}/_worker.js`);

// 2. Copy every directory that worker.js imports from
const dirs = ["cloudflare", "middleware", ".build", "server-functions"];
for (const dir of dirs) {
  cpSync(`.open-next/${dir}`, `${ASSETS}/${dir}`, { recursive: true });
}

// 3. Write _routes.json so static assets bypass the worker
writeFileSync(
  `${ASSETS}/_routes.json`,
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

console.log("✅ Pages assets prepared — worker + dependencies copied.");
