# Domain separation: Meatfish.co.id vs Meatfish.id

## Intended search and customer roles

- **Meatfish.co.id:** the B2B/business-information site. Primary intent: franchise/kemitraan, supplier onboarding, restaurant/catering/reseller procurement, wholesale specifications, cold-chain and operational guidance.
- **Meatfish.id:** the retail/customer site. Primary intent: product discovery for shoppers, retail catalogue, store locations, ordering and consumer-facing food guidance.

## Rules for separation

1. Do not publish a co.id article if it is a duplicate of an active meatfish.id article. Compare title, slug, main text and feature-image identity before publishing; a different title alone is not enough.
2. When an old co.id URL is the same article as a published .id article, keep the legacy redirect/noindex behavior and keep it out of the co.id sitemap. Do not create a second indexable copy merely to preserve the old URL.
3. New co.id articles should answer a business/procurement question and include original B2B examples, tables/checklists, sourcing or operational context. Retail recipes, consumer shopping advice and store-ordering content belong on .id unless materially reframed for B2B buyers.
4. Use locally hosted media on co.id. For editorial feature images, prefer a distinct B2B-specific image/diagram/photo, not just a renamed copy of a retail image. Product photos may legitimately depict the same SKU, but should not be mistaken for original editorial imagery.
5. Internal navigation and canonical URLs on co.id must remain on co.id. Cross-domain links to .id are allowed only where the user explicitly needs the retail catalogue/store experience or where an old URL is deliberately redirected to its original article. Do not add sitewide links to .id to every article.
6. Do not automatically rewrite a title or swap an image just because it appears similar. First establish whether the underlying page is a duplicate and which domain owns that search intent. Preserve factual claims and image/product accuracy.

## Existing safeguards and remaining work

The legacy redirect inventory already maps many old co.id article URLs to their corresponding published .id URLs. The production build has a check that validates those redirects and excludes them from the sitemap. This is useful migration protection, but it is not a full cross-domain duplicate-content audit.

Run `npm run audit:domain-separation` to inspect the repository for:
- active article slugs that collide with legacy redirects,
- duplicate article titles inside co.id,
- feature images reused by multiple co.id articles,
- image frontmatter that still points to meatfish.id,
- outbound links to meatfish.id inside article Markdown.

The audit can identify repository-level risks. A definitive comparison of live .id and co.id titles, article bodies and image hashes also requires a current crawl/export of both domains; search snippets alone are insufficient to claim that every cross-domain duplicate has been corrected.

## Rollout order

1. Run the repository audit and inspect every collision.
2. Crawl both live domains and compare normalized title, canonical URL, text similarity and image hashes.
3. Keep the strongest/most relevant version on the domain that matches its intent; redirect or noindex the duplicate, and update sitemap/internal links.
4. Replace shared editorial hero images with original B2B assets on co.id where appropriate; do not change accurate product photography solely for SEO.
5. Build and deploy, then re-crawl canonical, indexability, sitemap, broken links and image sources.
