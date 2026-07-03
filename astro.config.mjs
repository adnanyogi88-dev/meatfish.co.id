import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://meatfish.co.id",
  output: "static",
  integrations: [sitemap()],
  trailingSlash: "always"
});
