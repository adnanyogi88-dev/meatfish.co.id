"""Prepare sitemap routes and imported Markdown using only Python's stdlib."""
from pathlib import Path
from urllib.parse import urlparse
import json
import re
import shutil
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "data sitemaps meatfish.xlsx"
ZIP = ROOT / "indofishmart_top_40_markdown.zip"
MEDIA_XML = ROOT / "meatampfish.WordPress.2026-07-02.xml"
DATA = ROOT / "src" / "data"
BLOG = ROOT / "src" / "content" / "blog"


def sitemap_urls():
    ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    with zipfile.ZipFile(XLSX) as archive:
        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        strings = [
            "".join(node.text or "" for node in item.iter(f"{{{ns}}}t"))
            for item in shared_root
        ]
    return [value for value in strings if value.startswith("https://meatfish.id")]


def media_paths():
    paths = {}
    if not MEDIA_XML.exists():
        return paths
    namespace = "http://wordpress.org/export/1.2/"
    root = ET.parse(MEDIA_XML).getroot()
    for item in root.findall("./channel/item"):
        url = item.findtext(f"{{{namespace}}}attachment_url")
        if not url:
            continue
        path = urlparse(url).path
        paths[Path(path).name.lower()] = path
    return paths


def local_image(url, paths):
    filename = Path(urlparse(url).path).name.lower()
    parsed_path = urlparse(url).path
    return paths.get(filename, parsed_path if "/wp-content/uploads/" in parsed_path else url)


def clean_markdown(text, paths):
    text = re.sub(
        r'(?m)^(image|featured_image):\s*"([^"]+)"\s*$',
        lambda match: f'{match.group(1)}: "{local_image(match.group(2), paths)}"',
        text,
    )
    text = re.sub(
        r'!\[([^\]]*)\]\(https?://[^)]+\)',
        lambda match: f'![{match.group(1)}]({local_image(match.group(0).split("](", 1)[1][:-1], paths)})',
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
    paths = media_paths()
    records = []
    for url in urls:
        path = urlparse(url).path
        records.append({"path": path, "url": url.replace("meatfish.id", "meatfish.co.id")})
    (DATA / "routes.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    for old in BLOG.glob("*.md"):
        old.unlink()
    with zipfile.ZipFile(ZIP) as archive:
        for member in archive.namelist():
            if not member.endswith(".md"):
                continue
            raw = archive.read(member).decode("utf-8-sig")
            name = re.sub(r"^\d+-", "", Path(member).name)
            (BLOG / name).write_text(clean_markdown(raw, paths), encoding="utf-8")
    print(f"Prepared {len(records)} routes and {len(list(BLOG.glob('*.md')))} articles")


if __name__ == "__main__":
    main()
