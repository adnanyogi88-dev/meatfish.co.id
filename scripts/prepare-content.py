"""Prepare sitemap routes and imported Markdown using only Python's stdlib."""
from pathlib import Path
from urllib.parse import urlparse
import json
import re
import shutil
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "data sitemaps meatfish.xlsx"
ZIP = ROOT / "indofishmart_top_40_markdown.zip"
MEDIA_XML = ROOT / "meatampfish.WordPress.2026-07-02.xml"
DATA = ROOT / "src" / "data"
BLOG = ROOT / "src" / "content" / "blog"
STOP_WORDS = {
    "apa", "bagaimana", "berapa", "cara", "dan", "dari", "di", "dengan",
    "ini", "itu", "ke", "kenapa", "lengkap", "meatfish", "mengenal",
    "panduan", "paling", "pilihan", "solusi", "terbaik", "untuk", "yang",
}


def sitemap_urls():
    ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    with zipfile.ZipFile(XLSX) as archive:
        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        strings = [
            "".join(node.text or "" for node in item.iter(f"{{{ns}}}t"))
            for item in shared_root
        ]
    return [value for value in strings if value.startswith("https://meatfish.id")]


def normalize_words(value):
    value = unicodedata.normalize("NFKD", value.lower())
    value = "".join(char for char in value if not unicodedata.combining(char))
    return {
        word for word in re.findall(r"[a-z0-9]+", value)
        if len(word) > 2 and word not in STOP_WORDS
    }


def best_media(query, records):
    words = normalize_words(query)
    best = None
    best_score = -1
    for record in records:
        candidate = record["_words"]
        overlap = words & candidate
        if not overlap:
            continue
        score = sum(3 if len(word) > 6 else 2 for word in overlap)
        score += len(overlap) / max(len(words | candidate), 1)
        if score > best_score:
            best_score = score
            best = record["path"]
    return best or "/wp-content/uploads/2025/10/mf-logo.webp"


def media_data():
    paths = {}
    records = []
    if not MEDIA_XML.exists():
        return paths, records
    namespace = "http://wordpress.org/export/1.2/"
    root = ET.parse(MEDIA_XML).getroot()
    for item in root.findall("./channel/item"):
        url = item.findtext(f"{{{namespace}}}attachment_url")
        if not url:
            continue
        path = urlparse(url).path
        paths[Path(path).name.lower()] = path
        title = item.findtext("title") or ""
        alt = ""
        for meta in item.findall(f"{{{namespace}}}postmeta"):
            if meta.findtext(f"{{{namespace}}}meta_key") == "_wp_attachment_image_alt":
                alt = meta.findtext(f"{{{namespace}}}meta_value") or ""
                break
        query = f"{title} {alt} {Path(path).stem}"
        records.append({"path": path, "title": title, "alt": alt, "_words": normalize_words(query)})
    return paths, records


def local_image(url, paths, fallback):
    filename = Path(urlparse(url).path).name.lower()
    parsed_path = urlparse(url).path
    if filename in paths:
        return paths[filename]
    return fallback if "/wp-content/uploads/" in parsed_path else url


def clean_markdown(text, paths, records):
    title_match = re.search(r'(?m)^title:\s*"([^"]+)"', text)
    fallback = best_media(title_match.group(1) if title_match else "", records)
    text = re.sub(
        r'(?m)^(image|featured_image):\s*"([^"]+)"\s*$',
        lambda match: f'{match.group(1)}: "{local_image(match.group(2), paths, fallback)}"',
        text,
    )
    text = re.sub(
        r'!\[([^\]]*)\]\(https?://[^)]+\)',
        lambda match: f'![{match.group(1)}]({local_image(match.group(0).split("](", 1)[1][:-1], paths, best_media(f"{match.group(1)} {title_match.group(1) if title_match else ''}", records))})',
        text,
    )
    text = text.replace("https://indofishmart.id", "https://meatfish.co.id")
    text = text.replace("http://indofishmart.id", "https://meatfish.co.id")
    text = text.replace("https://meatfish.id", "https://meatfish.co.id")
    text = text.replace("http://meatfish.id", "https://meatfish.co.id")
    text = re.sub(r"\bIndofishmart\b", "Meat & Fish", text, flags=re.I)
    if "\nauthor:" not in text.split("---", 2)[1]:
        text = text.replace("\n---\n", '\nauthor: "administrator"\n---\n', 1)
    return text


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    BLOG.mkdir(parents=True, exist_ok=True)
    urls = sitemap_urls()
    paths, media = media_data()
    records = []
    for url in urls:
        path = urlparse(url).path
        records.append({"path": path, "url": url.replace("meatfish.id", "meatfish.co.id")})
    (DATA / "routes.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    route_media = {
        record["path"]: best_media(record["path"].replace("-", " "), media)
        for record in records
    }
    (DATA / "route-media.json").write_text(
        json.dumps(route_media, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    for old in BLOG.glob("*.md"):
        old.unlink()
    with zipfile.ZipFile(ZIP) as archive:
        for member in archive.namelist():
            if not member.endswith(".md"):
                continue
            raw = archive.read(member).decode("utf-8-sig")
            name = re.sub(r"^\d+-", "", Path(member).name)
            (BLOG / name).write_text(clean_markdown(raw, paths, media), encoding="utf-8")
    print(f"Prepared {len(records)} routes and {len(list(BLOG.glob('*.md')))} articles")


if __name__ == "__main__":
    main()
