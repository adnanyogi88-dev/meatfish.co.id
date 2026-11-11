import { defineConfig } from "astro/config";
import cleanEditorialContent from "./scripts/remark-editorial.mjs";

export default defineConfig({
  site: "https://meatfish.co.id",
  output: "static",
  markdown: { remarkPlugins: [cleanEditorialContent] },
  trailingSlash: "always",
  vite: {
    define: {
      "import.meta.env.PUBLIC_SUPABASE_URL": JSON.stringify(process.env.PUBLIC_SUPABASE_URL || ""),
      "import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "")
    }
  }
});