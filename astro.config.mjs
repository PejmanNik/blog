import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { mermaid } from "./src/lib/mermaid";
import tailwindcss from "@tailwindcss/vite";
import remarkGithubAlerts from 'remark-github-alerts';

// https://astro.build/config
export default defineConfig({
  site: "https://pejmannik.dev",
  trailingSlash: "always",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => page !== "https://pejmannik.dev/",
    }),
  ],
  markdown: {
    remarkPlugins: [mermaid, remarkGithubAlerts],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
