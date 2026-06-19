#!/usr/bin/env python3
"""Add a certificate to the site in one shot.

Does everything the manual flow does:
  1. copies the PDF to assets/certs/<slug>.pdf
  2. renders a 150 dpi PNG preview next to it (needs `pdftoppm`)
  3. writes the front-matter .md for every language
  4. appends <slug> to every certificates/index.json

The manifest order is the on-page order (curated by impact), so new entries
land at the end (lowest impact). Reorder index.json by hand when it matters.
The gallery's sort button reads `issued`, so always pass a real ISO date.

Usage:
  scripts/add_cert.py path/to/cert.pdf \
      --title "Claude Platform 101" --issuer "Anthropic" --issued 2026-06-17

  # slug defaults to "<issuer> <title>" slugified; override when needed:
  scripts/add_cert.py cert.pdf -t "Spring MVC I" -i Alura --issued 2018-11-19 \
      --slug alura-spring-mvc-1
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CERTS = ROOT / "assets/certs"
LANGS = ("en", "pt", "es")


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return re.sub(r"-{2,}", "-", text)


def main() -> int:
    p = argparse.ArgumentParser(description="Add a certificate to the site.")
    p.add_argument("pdf", type=Path, help="source PDF")
    p.add_argument("-t", "--title", required=True)
    p.add_argument("-i", "--issuer", required=True)
    p.add_argument("--issued", required=True, help="ISO date the cert was issued, e.g. 2026-06-17")
    p.add_argument("--slug", help="defaults to slugify('<issuer> <title>')")
    p.add_argument("--date", help="display year, defaults to the issued year")
    p.add_argument("--force", action="store_true", help="overwrite if the slug already exists")
    a = p.parse_args()

    if not a.pdf.is_file():
        sys.exit(f"PDF not found: {a.pdf}")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", a.issued):
        sys.exit(f"--issued must be YYYY-MM-DD, got: {a.issued}")

    slug = a.slug or slugify(f"{a.issuer} {a.title}")
    date = a.date or a.issued[:4]
    pdf_out = CERTS / f"{slug}.pdf"
    if pdf_out.exists() and not a.force:
        sys.exit(f"{slug} already exists. Pass --force to overwrite.")

    shutil.copyfile(a.pdf, pdf_out)
    subprocess.run(["pdftoppm", "-png", "-r", "150", "-singlefile",
                    str(pdf_out), str(CERTS / slug)], check=True)

    fm = ("---\n"
          f"title: {a.title}\n"
          f"issuer: {a.issuer}\n"
          f"date: {date}\n"
          f"issued: {a.issued}\n"
          f"image: assets/certs/{slug}.png\n"
          f"pdf: assets/certs/{slug}.pdf\n"
          "---\n")
    for lang in LANGS:
        (ROOT / f"content/{lang}/certificates/{slug}.{lang}.md").write_text(fm)
        idx = ROOT / f"content/{lang}/certificates/index.json"
        data = json.loads(idx.read_text())
        if slug not in data["items"]:
            data["items"].append(slug)
        idx.write_text("{ \"items\": [" + ", ".join(f'"{s}"' for s in data["items"]) + "] }\n")

    print(f"Added {slug} ({date}) to {len(LANGS)} languages. Reorder index.json if impact demands it.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
