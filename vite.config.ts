import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5173 },
  // react-helmet-async ships CommonJS that Node can't import by name; bundle it into the SSR build.
  ssr: { noExternal: ["react-helmet-async"] },
});
