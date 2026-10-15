#!/usr/bin/env node
/**
 * Diagnostic repository audit for separating meatfish.co.id (B2B) and meatfish.id (retail).
 * Reports candidates only; it never automatically deletes or rewrites content.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'src/content/blog');
const mediaPath = path.join(root, 'src/data/media.json');
const redirectsPath = path.join(root, 'src/data/legacy-redirects.json');
const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md')).sort();
const media = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
const titleToFiles = new Map();
const imageToFiles = new Map();
const slugRedirectCollisions = [];
const remoteImages = [];
const outboundRefs = [];
const published = [];

const norm = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('id')
  .replace(/<[^>]*>/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const scalar = (frontmatter, key) => {
  const match = frontmatter.match(new RegExp('^' + key + ':\\s*(.*)$', 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
};

for (const file of files) {
  const fullPath = path.join(contentDir, file);
  const text = fs.readFileSync(fullPath, 'utf8');
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) continue;
  const fm = match[1];
  const slug = scalar(fm, 'slug') || file.replace(/\.md$/, '');
  const title = scalar(fm, 'title');
  const image = scalar(fm, 'image');
  const draft = scalar(fm, 'draft').toLowerCase() === 'true';
  const item = { file: 'src/content/blog/' + file, slug, title, image };
  if (title) {
    const key = norm(title);
    if (titleToFiles.has(key)) titleToFiles.get(key).push(item); else titleToFiles.set(key, [item]);
  }
  if (image) {
    if (/^https?:\/\//i.test(image)) {
      try {
        const host = new URL(image).hostname;
        if (host === 'meatfish.id' || host.endsWith('.meatfish.id')) remoteImages.push(item);
      } catch {}
    }
    if (imageToFiles.has(image)) imageToFiles.get(image).push(item); else imageToFiles.set(image, [item]);
  }
  if (/https?:\/\/meatfish\.id\//i.test(text)) {
    const urls = [...new Set(text.match(/https?:\/\/meatfish\.id\/[^\s)\]"']*/gi) || [])];
    outboundRefs.push({ file: item.file, urls: urls.slice(0, 8) });
  }
  if (!draft) published.push(item);
}

for (const item of published) {
  if (Object.hasOwn(redirects, item.slug)) slugRedirectCollisions.push({
    slug: item.slug, title: item.title, file: item.file, redirect: redirects[item.slug]
  });
}

const duplicateTitles = [...titleToFiles.values()].filter(group => group.length > 1)
  .map(group => ({ title: group[0].title, files: group.map(item => item.file) }));
const repeatedImages = [...imageToFiles.entries()].filter(([image, group]) => image && group.length > 1)
  .map(([image, group]) => ({ image, count: group.length, files: group.map(item => item.file) }))
  .sort((a, b) => b.count - a.count);

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  note: 'Repository-level diagnostics only; cross-domain uniqueness requires a live .id crawl/export.',
  markdownFiles: files.length,
  publishedArticles: published.length,
  legacyRedirects: Object.keys(redirects).length,
  publishedSlugRedirectCollisions: slugRedirectCollisions,
  duplicateTitlesWithinCoId: duplicateTitles,
  repeatedFeatureImagesWithinCoId: repeatedImages,
  featureImagesStillPointingToMeatfishId: remoteImages,
  markdownFilesWithOutboundMeatfishIdLinks: outboundRefs,
  counts: {
    slugRedirectCollisions: slugRedirectCollisions.length,
    duplicateTitleGroups: duplicateTitles.length,
    repeatedFeatureImageGroups: repeatedImages.length,
    remoteMeatfishIdImages: remoteImages.length,
    markdownFilesWithOutboundMeatfishIdLinks: outboundRefs.length
  }
}, null, 2));
