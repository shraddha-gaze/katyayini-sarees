// Renders every public route to static HTML so search engines see full content,
// then writes sitemap.xml. Runs after `vite build` and `vite build --ssr` (see package.json).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const template = readFileSync(join(dist, "index.html"), "utf8");
const { render, routes } = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);

const site = (process.env.VITE_SITE_URL || readEnv("VITE_SITE_URL") || "https://katyayini.vercel.app").replace(/\/$/, "");

for (const route of routes) {
  const { html, head } = render(route);
  const page = template.replace("<!--app-head-->", head).replace("<!--app-html-->", html);
  const file = route === "/" ? join(dist, "index.html") : join(dist, route, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
}

// SPA fallback for pages that are not prerendered (account, cart, admin): an empty shell.
writeFileSync(join(dist, "200.html"), template.replace("<!--app-head-->", "<title>Katyayini Banaras</title>").replace("<!--app-html-->", ""));

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map((r) => `  <url><loc>${site}${r === "/" ? "/" : r}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`,
);
writeFileSync(join(dist, "robots.txt"), readFileSync(join(dist, "robots.txt"), "utf8").replace(/Sitemap: .*/, `Sitemap: ${site}/sitemap.xml`));

rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`Prerendered ${routes.length} pages and wrote sitemap.xml`);

function readEnv(key) {
  for (const f of [".env.production", ".env"]) {
    try {
      const line = readFileSync(join(root, f), "utf8").split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
      if (line) return line.slice(key.length + 1).trim();
    } catch {
      /* file missing */
    }
  }
  return "";
}
