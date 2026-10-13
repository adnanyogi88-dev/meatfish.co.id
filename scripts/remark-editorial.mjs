import { readFileSync, readdirSync } from 'node:fs';

// Remove publishing notes and repeated paragraphs without modifying source Markdown.
const textOf = node => node.value ?? (node.children ?? []).map(textOf).join('');
const normalize = text => text.replace(/\s+/g, ' ').trim().toLowerCase();
const slugify = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const directory = new URL('../src/content/blog/', import.meta.url);
const known = new Set(['/', '/gabung-kemitraan/', '/pasokan-untuk-bisnis/', '/produk-meatfish/', '/daftar-supplier-meatfish/', '/tentang-meatfish/', '/lokasi-meat-fish/', '/trend-daging-ikan-frozen/']);
const aliases = { '/franchise-2026-frozen-food-sistematis/': '/franchise-frozen-food/', '/produk-kami/': '/produk-meatfish/', '/rekomendasi-franchise-terbaik-2026-peluang-emas-bersama-meatfish/': '/10-franchise-terbaik-2026-yang-diprediksi-viral-di-indonesia/' };
for (const file of readdirSync(directory).filter(name => name.endsWith('.md'))) {
  const text = readFileSync(new URL(file, directory), 'utf8');
  const front = text.split(/^---\s*$/m)[1] ?? '';
  const field = name => front.match(new RegExp(`^${name}:\\s*["']?([^"'\\r\\n]+)`, 'm'))?.[1]?.trim();
  const value = field('pubDate') || field('date');
  const date = value && new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+07:00` : value);
  if (!field('slug') || field('draft') === 'true' || field('published') === 'false' || !date || !Number.isFinite(date.getTime()) || date.getTime() > Date.now()) continue;
  known.add(`/${field('slug')}/`);
  for (const name of ['tags', 'categories']) {
    const block = front.match(new RegExp(`^${name}:\\s*(\\[[^\\n]*\\]|\\n(?:[ \\t]+-[^\\n]*\\n?)+)`, 'm'))?.[1] ?? '';
    const values = [...block.matchAll(/["']([^"']+)["']/g)].map(match => match[1]);
    for (const value of values) known.add(`/${name === 'tags' ? 'tag' : 'category'}/${slugify(value)}/`);
  }
  if (field('category')) known.add(`/category/${slugify(field('category'))}/`);
}

function repairLinks(parent) {
  if (!parent.children) return;
  parent.children = parent.children.flatMap(node => {
    repairLinks(node);
    if (node.type !== 'link' || !node.url || /^(mailto:|tel:|#)/i.test(node.url)) return [node];
    try {
      const url = new URL(node.url, 'https://meatfish.co.id/');
      if (url.hostname !== 'meatfish.co.id') return [node];
      const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
      const target = aliases[path] ?? path;
      if (!known.has(target)) return node.children;
      url.pathname = target;
      node.url = node.url.startsWith('/') ? `${url.pathname}${url.search}${url.hash}` : url.href;
    } catch { return node.children; }
    return [node];
  });
}

export default function cleanEditorialContent() {
  return (tree, file) => {
    repairLinks(tree);
    const title = normalize(file.data?.astro?.frontmatter?.title ?? '');
    const seen = new Set();
    tree.children = tree.children.filter((node, index) => {
      const text = textOf(node);
      if (node.type === 'heading' && node.depth === 1) {
        if (index === 0 && normalize(text) === title) return false;
        node.depth = 2;
      }
      if (node.type !== 'paragraph') return true;
      if (/^\s*(keyword utama|keyword terkait|target keyword|primary keyword)\s*:/i.test(text)) return false;
      for (const child of node.children ?? []) {
        if (child.type === 'strong' && /^CTA:\s*$/i.test(textOf(child))) child.children = [];
        if (child.type === 'text') {
          child.value = child.value.replace(/Struktur internal ini menghubungkan artikel dalam cluster yang sama tanpa mencampurkan tujuan utama kedua domain\./g, '');
        }
      }
      const key = normalize(textOf(node));
      if (key.length > 160 && seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
}
