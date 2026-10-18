import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import App from "@/App";
import { categories, products } from "@/data/catalogue";

// Public pages that are prerendered to static HTML at build time (see scripts/prerender.mjs).
export const routes = [
  "/",
  "/sarees",
  ...categories.map((c) => `/sarees/${c.slug}`),
  ...products.map((p) => `/saree/${p.slug}`),
  "/guide",
  "/about",
  "/contact",
  "/shipping-returns",
  "/privacy",
  "/terms",
];

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>,
  );
  const h = helmetContext.helmet;
  const head = h ? [h.title.toString(), h.meta.toString(), h.link.toString(), h.script.toString()].join("\n") : "";
  return { html, head };
}
