const site = "https://meatfish.co.id";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET() {
  const modules: any[] = Object.values(import.meta.glob("../content/blog/*.md", { eager: true }));
  const posts = modules
    .map((module) => module.frontmatter)
    .filter((post) => {
      const publishDate = new Date(post?.pubDate || post?.date || 0).getTime();
      return post?.slug && post?.draft !== true && post?.published !== false && publishDate <= Date.now();
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const urls = posts
    .map((post) => {
      const cleanSlug = String(post.slug).split("/").filter(Boolean).join("/");
      const loc = `${site}/${cleanSlug}/`;
      const lastmod = post.date ? `<lastmod>${escapeXml(new Date(post.date).toISOString())}</lastmod>` : "";
      return `<url><loc>${escapeXml(loc)}</loc>${lastmod}</url>`;
    })
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
