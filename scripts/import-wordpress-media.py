"""Download every attachment in the WordPress export into public/wp-content/uploads."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen
import json
import re
import time
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "meatampfish.WordPress.2026-07-02.xml"
PUBLIC = ROOT / "public"
MANIFEST = ROOT / "src" / "data" / "media.json"
MARKDOWN_ZIP = ROOT / "indofishmart_top_40_markdown.zip"
WP = "http://wordpress.org/export/1.2/"


def attachment_records():
    root = ET.parse(EXPORT).getroot()
    records = []
    for item in root.findall("./channel/item"):
        if item.findtext(f"{{{WP}}}post_type") != "attachment":
            continue
        url = item.findtext(f"{{{WP}}}attachment_url")
        if not url:
            continue
        path = unquote(urlparse(url).path).lstrip("/")
        if not path.startswith("wp-content/uploads/"):
            continue
        meta = {}
        for node in item.findall(f"{{{WP}}}postmeta"):
            key = node.findtext(f"{{{WP}}}meta_key")
            value = node.findtext(f"{{{WP}}}meta_value")
            if key:
                meta[key] = value or ""
        records.append(
            {
                "id": int(item.findtext(f"{{{WP}}}post_id") or 0),
                "parent": int(item.findtext(f"{{{WP}}}post_parent") or 0),
                "title": item.findtext("title") or "",
                "alt": meta.get("_wp_attachment_image_alt", ""),
                "source": url,
                "path": "/" + path,
            }
        )
    known_paths = {record["path"].lower() for record in records}
    if MARKDOWN_ZIP.exists():
        with zipfile.ZipFile(MARKDOWN_ZIP) as archive:
            for name in archive.namelist():
                if not name.endswith(".md"):
                    continue
                text = archive.read(name).decode("utf-8-sig")
                for url in re.findall(r"https?://[^)\"]+/wp-content/uploads/[^)\"]+", text):
                    path = unquote(urlparse(url).path)
                    if path.lower() in known_paths:
                        continue
                    known_paths.add(path.lower())
                    records.append(
                        {
                            "id": 0,
                            "parent": 0,
                            "title": Path(path).stem,
                            "alt": "",
                            "source": url,
                            "path": path,
                        }
                    )
    return records


def download(record):
    target = PUBLIC / record["path"].lstrip("/")
    if target.exists() and target.stat().st_size:
        return "cached", record
    target.parent.mkdir(parents=True, exist_ok=True)
    error = None
    for attempt in range(3):
        try:
            request = Request(record["source"], headers={"User-Agent": "Mozilla/5.0"})
            with urlopen(request, timeout=45) as response:
                data = response.read()
            if not data:
                raise ValueError("empty response")
            target.write_bytes(data)
            return "downloaded", record
        except Exception as exc:
            error = exc
            time.sleep(attempt + 1)
    return f"failed: {error}", record


def main():
    records = attachment_records()
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    counts = {"downloaded": 0, "cached": 0, "failed": 0}
    with ThreadPoolExecutor(max_workers=48) as pool:
        futures = [pool.submit(download, record) for record in records]
        for index, future in enumerate(as_completed(futures), 1):
            status, record = future.result()
            key = status if status in counts else "failed"
            counts[key] += 1
            if key == "failed":
                print(f"{status}: {record['source']}")
            elif index % 50 == 0:
                print(f"{index}/{len(records)}")
    print(json.dumps(counts))
    if counts["failed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
