# rodrigo_dantas — personal site

Personal website for **Rodrigo Dantas** — Senior Software Engineer & Software Architect.
Built on the **Hustle Tech** brand system (black / gray / red / white · Space Grotesk + Inter).

> "Don't follow trends. Create them."

Every word, link, list, image and file on this site comes from **Markdown** in
[`content/`](content/) — no build step, no framework. The whole site is **multilingual**
(🇧🇷 PT · 🇺🇸 EN · 🇪🇸 ES) and the language switcher in the top bar swaps *all* content,
not just the blog. Edit a `.md`, push, done.

## 🚀 Deploy on GitHub Pages

1. Repo is named **`napalm23zero.github.io`**.
2. Push every file to the repo root.
3. GitHub → **Settings → Pages → Source: `main` / root**.
4. Live at **https://napalm23zero.github.io**.

`.nojekyll` is included so Pages serves `content/` and `assets/` untouched.

## 🌐 Languages & folder layout

Content is organized into **one self-contained folder per language**, and every file keeps
its `.<lang>` suffix so it's obvious what you're editing:

```
content/
  en/
    ui.json                 ← UI labels & section headings
    site.en.md  hero.en.md  about.en.md  social.en.md
    experience/
      index.json            ← order (ids), language-agnostic
      fiserv.en.md  kis-solutions.en.md  …
    portfolio/  certificates/  videos/  posts/  …
  pt/   (same tree, .pt.md + pt ui.json)
  es/   (same tree, .es.md + es ui.json)
```

- Supported languages live in [`assets/js/i18n.js`](assets/js/i18n.js) (`LANGS`). Today:
  `pt`, `en`, `es`. Default / fallback is **`en`**.
- First visit auto-detects the browser language; the manual choice is saved in
  `localStorage`. You can also force one with `?lang=es`.
- If any file (or whole section) is missing in a language, the loader falls back to the
  default-language folder — the site never breaks.

**To add a language** (e.g. French → `fr`):
1. Add `"fr"` to `LANGS` in `i18n.js`, a label in `LABEL` (`fr: "FR"`) and a locale in
   `LOCALE` (`fr: "fr-FR"`, used for date formatting).
2. Copy the whole `content/en/` folder to `content/fr/`.
3. Rename the files `*.en.md` → `*.fr.md` and translate (untranslated files just fall
   back to EN).

## 🧠 How it works

A content engine ([`assets/js/content.js`](assets/js/content.js)) fetches Markdown from the
current language's folder at runtime and renders it into the design. Content comes in two
shapes:

- **Singletons** — one file. e.g. `content/<lang>/site.<lang>.md`, `hero`, `about`, `social`.
- **Collections** — a folder with an `index.json` (order only, just ids) plus one file per
  item:

  ```json
  { "items": ["fiserv", "kis-solutions", "metal-toad"] }
  ```

  → loads `fiserv.<lang>.md`, `kis-solutions.<lang>.md`, … in that order. Reorder the array
  to reorder the section (do it in each language folder to keep them in sync).

Section headings (eyebrow / title / intro) and button labels are **UI strings** in
`content/<lang>/ui.json`, so they translate too.

### Front-matter rules

Plain `key: value` at the top of the file, fenced by `---`. Write **lists with `|`**:

```markdown
---
title: Principais
tags: Java | Spring Boot | Python | Node.js
---
```

Anything below the front-matter is standard Markdown (rendered with `marked`).

## ✍️ Common edits

Edit the file in **each** `content/<lang>/` folder to keep every language in sync.

| Want to… | Edit (per language) |
|---|---|
| Name, email, phone, socials, nav, contact copy | `content/<lang>/site.<lang>.md` |
| Hero headline / marquee | `content/<lang>/hero.<lang>.md` |
| The bio | `content/<lang>/about.<lang>.md` |
| Buttons, section titles & eyebrows | `content/<lang>/ui.json` |
| Add a job | new `content/<lang>/experience/<id>.<lang>.md` + add `<id>` to that folder's `index.json` |
| Add a portfolio project | new `content/<lang>/portfolio/<id>.<lang>.md` + `index.json` |
| Add a certificate | run `scripts/add_cert.py cert.pdf -t "Title" -i "Issuer" --issued YYYY-MM-DD` (writes the PDF, PNG, every `<lang>` `.md` and `index.json`) |
| Add a YouTube video | new `content/<lang>/videos/<id>.<lang>.md` (`id:` = YouTube id) + `index.json` |
| Set social embeds | `content/<lang>/social.<lang>.md` |
| Publish a blog post | new `content/<lang>/posts/<id>.<lang>.md` + add `<id>` to that folder's `posts/index.json` |

GitHub repos in the **GitHub** section load live from the API — nothing to maintain.
Change the username via `data-user` on `#repos` in [`index.html`](index.html).

## 🖼️ Images & files

Drop assets in [`assets/`](assets/) and reference them by path from the front-matter
(images are language-agnostic — same path in every `<lang>` file):

- Photos / covers → `assets/img/` → e.g. `portrait: assets/img/rodrigo-hero.jpg`,
  `cover: assets/img/project.jpg`
- Certificate scans → `assets/certs/` → `image: assets/certs/oracle.jpg`
- Downloads (CV, etc.) → `assets/files/` (the resume buttons point to
  `assets/files/resume.pdf`)

Leave an image field empty to show the styled placeholder. Imagery follows the
Hustle Tech direction: deep blacks, high contrast, cinematic, strategic red.

## 🎨 Brand

| Token | Value |
|------|------|
| Hustle Black | `#000000` |
| Hustle Gray | `#333333` |
| Hustle Red | `#ff0000` |
| Hustle White | `#ffffff` |
| Display | Space Grotesk |
| Body | Inter |
| Mono | Space Mono |
| Icons | Phosphor Icons |
