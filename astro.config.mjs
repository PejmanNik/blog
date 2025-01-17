import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { mermaid } from "./src/lib/mermaid";

// https://astro.build/config
export default defineConfig({
  site: "https://pejmannik.dev",
  integrations: [mdx(), sitemap(), tailwind()],
  markdown: {
    remarkPlugins: [mermaid]
  }
});