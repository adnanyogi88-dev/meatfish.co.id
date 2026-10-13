import { defineConfig } from "astro/config";
import cleanEditorialContent from "./scripts/remark-editorial.mjs";

export default defineConfig({
  site: "https://meatfish.co.id",
  output: "static",
  markdown: { remarkPlugins: [cleanEditorialContent] },
  trailingSlash: "always"
});
