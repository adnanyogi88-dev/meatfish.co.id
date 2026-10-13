export type Frontmatter = Record<string, any>;

export const coreSlugs = [
  'produk-meatfish', 'daftar-supplier-meatfish', 'gabung-kemitraan',
  'pasokan-untuk-bisnis', 'trend-daging-ikan-frozen', 'tentang-meatfish', 'lokasi-meat-fish',
];

export function parseDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === '') return null;
  const input = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00+07:00` : value;
  const date = value instanceof Date ? value : new Date(input as string);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function publicationDate(data: Frontmatter): Date | null {
  return parseDate(data.pubDate) ?? parseDate(data.date);
}

export function updatedDate(data: Frontmatter): Date | null {
  const published = publicationDate(data);
  const updated = parseDate(data.updatedDate) ?? parseDate(data.updated) ?? parseDate(data.modifiedDate);
  return updated && published && updated >= published && updated.getTime() <= Date.now() ? updated : published;
}

export function isPublished(data: Frontmatter, now = Date.now()): boolean {
  const date = publicationDate(data);
  return Boolean(data.slug && data.draft !== true && data.published !== false && date && date.getTime() <= now);
}

export function formatDate(value: unknown): string {
  return parseDate(value)?.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta',
  }) ?? '';
}

export function slugify(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const categoryAliases: Record<string, string> = {
  frozen: 'Frozen Food', 'frozen-food': 'Frozen Food',
  'fish-food': 'Ikan', 'meat-food': 'Daging', 'ikan-seafood': 'Seafood',
  'resep-masakan': 'Resep', resep: 'Resep',
};

export function categorySlug(value: string): string {
  const slug = slugify(value);
  return slugify(categoryAliases[slug] ?? value);
}

export function categoriesFor(data: Frontmatter): string[] {
  const values = [data.category, ...(Array.isArray(data.categories) ? data.categories : [])]
    .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
    .map(value => categoryAliases[slugify(value)] ?? value.trim());
  if (!values.length) {
    const subject = `${data.title ?? ''} ${(data.tags ?? []).join(' ')}`;
    values.push(/franchise|waralaba|kemitraan/i.test(subject) ? 'Franchise'
      : /supplier|distributor|grosir|agen|reseller/i.test(subject) ? 'Supplier' : 'Frozen Food');
  }
  return [...new Map(values.map(value => [categorySlug(value), value])).values()];
}

export function archiveMatches(data: Frontmatter, kind: string, slug: string): boolean {
  return kind === 'category'
    ? categoriesFor(data).some(value => categorySlug(value) === categorySlug(slug))
    : (Array.isArray(data.tags) ? data.tags : []).some((value: string) => slugify(value) === slug);
}

export function postImage(data: Frontmatter): string {
  return data.heroImage || data.image || data.featured_image || '/wp-content/uploads/2025/10/mf-logo.webp';
}

export function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
