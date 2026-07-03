"""Reduce WordPress media size in place while preserving every public URL."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1] / "public" / "wp-content" / "uploads"
FORMATS = {".png", ".jpg", ".jpeg", ".webp"}


def optimize(path):
    before = path.stat().st_size
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image)
        suffix = path.suffix.lower()
        if suffix == ".png":
            if image.mode in ("RGBA", "LA"):
                image.save(path, format="PNG", optimize=True, compress_level=9)
            else:
                image.convert("P", palette=Image.Palette.ADAPTIVE, colors=192).save(
                    path, format="PNG", optimize=True, compress_level=9
                )
        elif suffix in (".jpg", ".jpeg"):
            image.convert("RGB").save(
                path, format="JPEG", quality=78, optimize=True, progressive=True
            )
        else:
            image.save(path, format="WEBP", quality=78, method=6)
    return before, path.stat().st_size


def main():
    files = [path for path in ROOT.rglob("*") if path.suffix.lower() in FORMATS]
    before = after = 0
    failed = 0
    for index, path in enumerate(files, 1):
        try:
            old, new = optimize(path)
            before += old
            after += new
        except Exception as exc:
            failed += 1
            print(f"Skipped {path.name}: {exc}")
        if index % 100 == 0:
            print(f"{index}/{len(files)}")
    print(f"Optimized {len(files) - failed} files: {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
