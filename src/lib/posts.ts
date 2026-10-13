import routes from '../data/routes.json';
import { archiveMatches, categoriesFor, categorySlug, coreSlugs, isPublished, publicationDate, updatedDate } from './content-utils';

const modules: any[] = Object.values(import.meta.glob('../content/blog/*.md', { eager: true }));
export const allPosts = modules.map(module => ({
  frontmatter: module.frontmatter,
  Content: module.Content,
}));
export const posts = allPosts.filter(post => isPublished(post.frontmatter))
  .sort((a, b) => publicationDate(b.frontmatter)!.getTime() - publicationDate(a.frontmatter)!.getTime());

export const categories = [...new Map(posts.flatMap(post => categoriesFor(post.frontmatter))
  .map(name => [categorySlug(name), { name, slug: categorySlug(name) }])).values()];

export function archivePosts(kind: string, slug: string) {
  return posts.filter(post => archiveMatches(post.frontmatter, kind, slug));
}

export function indexablePagePaths(): string[] {
  const archives = routes.map(route => route.path).filter(path => {
    const [kind, slug] = path.split('/').filter(Boolean);
    return (kind === 'tag' || kind === 'category') && slug
      && (kind !== 'category' || slug === categorySlug(slug))
      && archivePosts(kind, slug).length > 0;
  });
  const archiveBases = [...new Set([...archives, ...categories.map(category => `/category/${category.slug}/`)])];
  const archivePages = archiveBases.flatMap(path => {
    const [kind, slug] = path.split('/').filter(Boolean);
    return Array.from({ length: Math.max(0, Math.ceil(archivePosts(kind, slug).length / 12) - 1) }, (_, i) => `${path}page/${i + 2}/`);
  });
  const pageCount = Math.ceil(posts.length / 12);
  return [...new Set([
    '/', ...coreSlugs.map(slug => `/${slug}/`), ...archiveBases, ...archivePages,
    ...Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => `/trend-daging-ikan-frozen/page/${i + 2}/`),
  ])];
}

export function articleSitemap() {
  return posts.map(post => ({
    loc: `https://meatfish.co.id/${String(post.frontmatter.slug).replace(/^\/+|\/+$/g, '')}/`,
    lastmod: updatedDate(post.frontmatter)?.toISOString(),
  }));
}
