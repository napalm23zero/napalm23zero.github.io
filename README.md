# rodrigo_dantas — personal site

Personal website for **Rodrigo Dantas** — Senior Software Engineer & Software Architect.
Built on the **Hustle Tech** brand system (black / gray / red / white · Space Grotesk + Inter).

> "Don't follow trends. Create them."

Every word, link, list, image and file on this site comes from **Markdown** in
[`content/`](content/) — no build step, no framework. Edit a `.md`, push, done.

## 🚀 Deploy on GitHub Pages

1. Repo is named **`napalm23zero.github.io`**.
2. Push every file to the repo root.
3. GitHub → **Settings → Pages → Source: `main` / root**.
4. Live at **https://napalm23zero.github.io**.

`.nojekyll` is included so Pages serves `content/` and `assets/` untouched.

## 🧠 How it works

A tiny content engine ([`assets/js/content.js`](assets/js/content.js)) fetches Markdown
at runtime and renders it into the design. Content comes in two shapes:

- **Singletons** — one `.md` file. e.g. [`content/site.md`](content/site.md),
  [`content/hero.md`](content/hero.md), [`content/about.md`](content/about.md),
  [`content/social.md`](content/social.md).
- **Collections** — a folder with an `index.json` and one `.md` per item, referenced
  **by id**:

  ```json
  { "items": ["fiserv", "kis-solutions", "metal-toad"] }
  ```

  → loads `fiserv.md`, `kis-solutions.md`, … in that order. Reorder the array to
  reorder the section. Some manifests also carry `eyebrow` / `title` / `intro` to
  drive the section heading.

### Front-matter rules

Plain `key: value` at the top of the file, fenced by `---`. Write **lists with `|`**:

```markdown
---
title: Primary
tags: Java | Spring Boot | Python | Node.js
---
```

Anything below the front-matter is standard Markdown (rendered with `marked`).

## ✍️ Common edits

| Want to… | Edit |
|---|---|
| Change name, email, phone, socials, nav | [`content/site.md`](content/site.md) |
| Tweak the hero headline / marquee | [`content/hero.md`](content/hero.md) |
| Edit the bio | [`content/about.md`](content/about.md) |
| Add a job | new `content/experience/<id>.md` + add id to its `index.json` |
| Add a portfolio project | new `content/portfolio/<id>.md` + `index.json` |
| Add a certificate | new `content/certificates/<id>.md` + `index.json` |
| Add a YouTube video | new `content/videos/<id>.md` (`id:` = the YouTube id) + `index.json` |
| Set social embeds | [`content/social.md`](content/social.md) |
| Publish a blog post | new `content/posts/<id>.md` + add id to `content/posts/index.json` |

GitHub repos in the **GitHub** section load live from the API — nothing to maintain.
Change the username via `data-user` on `#repos` in [`index.html`](index.html).

## 🖼️ Images & files

Drop assets in [`assets/`](assets/) and reference them by path from the front-matter:

- Photos / covers → `assets/img/` → e.g. `portrait: assets/img/me.jpg`,
  `cover: assets/img/project.jpg`
- Certificate scans → `assets/certs/` → `image: assets/certs/oracle.jpg`
- Downloads (CV, etc.) → `assets/files/` (the Résumé buttons point to
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
