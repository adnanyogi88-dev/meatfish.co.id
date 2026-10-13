import assert from 'node:assert/strict';
import { isPublished, publicationDate, formatDate, categoriesFor, categorySlug } from '../src/lib/content-utils.ts';

const now = Date.parse('2026-10-13T02:00:00Z');
assert(isPublished({ slug: 'pubdate-only', pubDate: '2026-08-21' }, now));
assert(isPublished({ slug: 'date-only', date: '2026-07-24' }, now));
assert.equal(publicationDate({ pubDate: '2026-08-21', date: '2026-07-24' }).toISOString(), '2026-08-20T17:00:00.000Z');
assert.equal(formatDate('2026-08-21'), '21 Agustus 2026');
assert(!isPublished({ slug: 'future', pubDate: '2026-10-14' }, now));
assert(!isPublished({ slug: 'draft', date: '2026-07-24', draft: true }, now));
assert(!isPublished({ slug: 'disabled', date: '2026-07-24', published: false }, now));
assert(!isPublished({ slug: 'invalid', date: 'not-a-date' }, now));
assert(!isPublished({ slug: 'missing-date' }, now));
assert.deepEqual(categoriesFor({ category: 'Franchise' }), ['Franchise']);
assert.equal(categorySlug('Frozen'), 'frozen-food');
assert.equal(categorySlug('Resep masakan'), 'resep');
console.log('Publication dates, WIB display, draft/future guards, and category aliases passed.');
