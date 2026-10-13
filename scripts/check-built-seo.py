"""Check the built site against publication, canonical, and sitemap invariants."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote, urljoin
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / 'dist'
SITE = 'https://meatfish.co.id'

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(); self.h1 = 0; self.images = 0; self.noindex = False; self.links = []; self.canonical = None
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        self.h1 += tag == 'h1'; self.images += tag == 'img'
        if tag == 'meta' and data.get('name') == 'robots': self.noindex = 'noindex' in data.get('content', '')
        if tag == 'link' and data.get('rel') == 'canonical': self.canonical = data.get('href')
        if tag == 'a' and data.get('href'): self.links.append(data['href'])

pages = {}
for file in ROOT.rglob('index.html'):
    html = file.read_text()
    path = '/' + str(file.relative_to(ROOT)).removesuffix('index.html')
    if path == '//': path = '/'
    page = Page(html); pages[path] = page
    assert page.h1 == 1, f'{path}: expected one H1, got {page.h1}'
    assert 'Invalid Date' not in html, f'{path}: invalid date'
    assert 'Keyword utama:' not in html and 'Keyword terkait:' not in html, f'{path}: publishing notes exposed'

locations = []
for name in ['sitemap-0.xml', 'sitemap-artikel.xml']:
    locations.extend(node.text for node in ET.parse(ROOT / name).iter() if node.tag.endswith('}loc'))
assert len(locations) == len(set(locations)), 'Duplicate sitemap URLs'
missing = []; nonindexable = []; mismatched = []; unresolved = {}; links_to_noindex = {}
for url in locations:
    path = unquote(urlparse(url).path); page = pages.get(path)
    if page is None: missing.append(url); continue
    if page.noindex: nonindexable.append(url)
    if page.canonical != url: mismatched.append(url)
    for link in page.links:
        target = urlparse(urljoin(url, link))
        if target.netloc != 'meatfish.co.id': continue
        target_path = unquote(target.path) or '/'
        if target_path in pages:
            if pages[target_path].noindex: links_to_noindex.setdefault(target_path, []).append(path)
        elif not (ROOT / target_path.lstrip('/')).is_file():
            unresolved.setdefault(target_path, []).append(path)

assert not missing, f'Sitemap pages missing: {missing[:5]}'
assert not nonindexable, f'Noindex pages in sitemap: {nonindexable[:5]}'
assert not mismatched, f'Sitemap/canonical mismatch: {mismatched[:5]}'
summary = {
    'html_pages': len(pages), 'noindex_pages': sum(page.noindex for page in pages.values()),
    'indexable_sitemap_urls': len(locations), 'home_image_elements': pages['/'].images,
    'invalid_dates': 0, 'duplicate_h1_pages': 0,
    'unresolved_internal_links': {key: value[:2] for key, value in unresolved.items()},
    'links_to_noindex_pages': {key: value[:2] for key, value in links_to_noindex.items()},
}
print(json.dumps(summary, ensure_ascii=False, indent=2))
if unresolved or links_to_noindex: raise SystemExit(1)
