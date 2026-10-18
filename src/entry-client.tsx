import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "@/App";
import "@/index.css";

const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);

const root = document.getElementById("root")!;
// Prerendered pages are hydrated; pages without prerendered HTML (dev server, account pages) render fresh.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
