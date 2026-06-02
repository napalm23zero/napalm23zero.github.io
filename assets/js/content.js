/* ============================================================
   Content engine — renders the whole site from Markdown, in the
   currently selected language (see i18n.js).
   ------------------------------------------------------------
   • Singletons  → content/<name>.<lang>.md   (e.g. site.en.md)
   • Collections → content/<dir>/index.json  (shared, items-only)
                   + content/<dir>/<id>.<lang>.md per item
   • UI labels & section headings → content/ui/<lang>.json
   Missing <lang> files fall back to the default language.
   Front-matter is plain `key: value`; lists use ` | `.
   ============================================================ */
(function () {
  const $ = (id) => document.getElementById(id);
  // dynamic tenure: computed each load so it never needs a yearly edit.
  // 2016 = first software-development role · 2011 = first tech role (systems analyst)
  const YEAR_DEV = 2016, YEAR_TECH = 2011;
  const yearsSince = (y) => Math.max(0, new Date().getFullYear() - y);
  const vars = (s) => (s == null ? s : String(s)
    .replace(/\{\{years_dev\}\}/g, yearsSince(YEAR_DEV))
    .replace(/\{\{years_tech\}\}/g, yearsSince(YEAR_TECH)));
  const T = (k) => vars(window.I18N.t(k));

  async function raw(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error("404 " + path);
    return r.text();
  }
  // locale-aware text: content/<lang>/<rel>.<lang>.md → fallback to default lang folder
  async function text(rel) {
    const lang = window.I18N.lang;
    try {
      return await raw(`content/${lang}/${rel}.${lang}.md`);
    } catch (e) {
      const d = window.I18N.default;
      if (lang !== d) return raw(`content/${d}/${rel}.${d}.md`);
      throw e;
    }
  }
  async function json(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error("404 " + path);
    return r.json();
  }
  // manifests live inside each language folder; fall back to the default
  async function manifest(dir) {
    const lang = window.I18N.lang;
    try {
      return await json(`content/${lang}/${dir}/index.json`);
    } catch (e) {
      return json(`content/${window.I18N.default}/${dir}/index.json`);
    }
  }

  function parseFM(s) {
    const m = s.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    const meta = {};
    let body = s;
    if (m) {
      body = s.slice(m[0].length);
      m[1].split("\n").forEach((line) => {
        const i = line.indexOf(":");
        if (i > -1) meta[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
      });
    }
    for (const k in meta) meta[k] = vars(meta[k]);
    return { meta, body: vars(body.trim()) };
  }

  const list = (v) => (v || "").split("|").map((s) => s.trim()).filter(Boolean);
  const md = (s) => (window.marked ? marked.parse(s || "") : s || "");
  const mdi = (s) => (window.marked ? marked.parseInline(s || "") : s || "");
  const eyebrow = (s) => (s || "").replace(/_/g, '<span class="us">_</span>');
  const tagsHTML = (v) => list(v).map((t) => `<span>${t}</span>`).join("");

  // Tech logos for the skills tags, served locally (no runtime CDN dependency).
  // Sources: devicon + simpleicons, vendored into assets/img/tech/.
  // Concepts (microservices, CDC/ETL, LLM agents…) intentionally have none.
  // A missing/failed icon just removes itself, so the tag never breaks.
  const TECH_DIR = "assets/img/tech/";
  const TECH_LOGOS = [
    ["react native", "react.svg"],
    ["github actions", "github-actions.svg"],
    ["java", "java.svg"],
    ["kotlin", "kotlin.svg"],
    ["python", "python.svg"],
    ["node", "nodejs.svg"],
    ["typescript", "typescript.svg"],
    ["spring", "spring.svg"],
    ["quarkus", "quarkus.svg"],
    ["fastapi", "fastapi.svg"],
    ["react", "react.svg"],
    ["next", "nextjs.svg"],
    ["angular", "angular.svg"],
    ["gcp", "gcp.svg"],
    ["aws", "aws.svg"],
    ["azure", "azure.svg"],
    ["docker", "docker.svg"],
    ["kubernetes", "kubernetes.svg"],
    ["terraform", "terraform.svg"],
    ["openshift", "openshift.svg"],
    ["postgre", "postgresql.svg"],
    ["oracle", "oracle.svg"],
    ["mongo", "mongodb.svg"],
    ["redis", "redis.svg"],
    ["kafka", "kafka.svg"],
    ["rabbitmq", "rabbitmq.svg"],
    ["jenkins", "jenkins.svg"],
    ["sonar", "sonarqube.svg"],
    ["splunk", "splunk.svg"],
    ["pandas", "pandas.svg"],
    ["numpy", "numpy.svg"],
    ["firebird", "firebird.svg"],
    ["db2", "db2.svg"],
    ["apigee", "apigee.svg"],
  ];
  const techLogo = (tag) => {
    const s = tag.toLowerCase();
    for (const [k, file] of TECH_LOGOS) if (s.includes(k)) return TECH_DIR + file;
    return null;
  };
  const skillTagsHTML = (v) =>
    list(v)
      .map((t) => {
        const src = techLogo(t);
        const logo = src ? `<img class="tag__logo" src="${src}" alt="" loading="lazy" onerror="this.remove()">` : "";
        return `<span>${logo}${t}</span>`;
      })
      .join("");

  async function singleton(name) {
    return parseFM(await text(name));
  }
  async function collection(dir) {
    const idx = await manifest(dir);
    const items = await Promise.all(
      (idx.items || []).map(async (id) => {
        const { meta, body } = parseFM(await text(`${dir}/${id}`));
        return { id, meta, body };
      })
    );
    return { ...idx, items };
  }

  // section heading driven by ui/<lang>.json keys: <p>.eyebrow / .title / .intro
  function head(p) {
    const e = T(`${p}.eyebrow`);
    const t = T(`${p}.title`);
    const i = T(`${p}.intro`);
    return `<div class="section__head reveal">
      <div class="eyebrow">${eyebrow(e)}</div>
      ${t ? `<h2>${t}</h2>` : ""}
      ${i ? `<p>${i}</p>` : ""}
    </div>`;
  }
  function setHead(mountId, prefix) {
    const el = $(mountId);
    if (el) el.innerHTML = head(prefix);
  }

  /* ---- shared chrome bits ---- */
  let SITE = {};
  function logoHTML(sub) {
    return `<span class="logo__mark"><span class="logo__bars"><i></i><i></i><i></i></span></span>
      <span><span class="logo__type">${SITE.wordmark || "rodrigo<span class='us'>_</span>dantas"}</span>${sub ? `<small>${sub}</small>` : ""}</span>`;
  }
  function socialsHTML(extra) {
    const a = [];
    if (SITE.github) a.push(`<a href="${SITE.github}" target="_blank" rel="noopener" aria-label="GitHub"><i class="ph ph-github-logo"></i></a>`);
    if (SITE.linkedin) a.push(`<a href="${SITE.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="ph ph-linkedin-logo"></i></a>`);
    if (SITE.email) a.push(`<a href="mailto:${SITE.email}" aria-label="Email"><i class="ph ph-envelope-simple"></i></a>`);
    if (extra) a.push(extra);
    return a.join("");
  }
  const FLAG = { pt: "br", en: "us", es: "es" }; // local SVGs: crisp on any screen, identical on every OS
  function langSwitcher() {
    return `<div class="langsw" role="group" aria-label="${T("ui.language")}">${window.I18N.langs
      .map((l) => `<button type="button" data-lang="${l}"${l === window.I18N.lang ? ' class="active"' : ""}>${FLAG[l] ? `<img class="flag" src="assets/img/flags/${FLAG[l]}.svg" alt="" width="18" height="12" loading="lazy" />` : ""}${window.I18N.label[l]}</button>`)
      .join("")}</div>`;
  }
  function themeToggleHTML() {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    return `<button type="button" class="theme-toggle" aria-label="Toggle light/dark theme" title="Toggle theme"><i class="ph ${light ? "ph-moon" : "ph-sun"}"></i></button>`;
  }
  function imgOrPh(src, label, extraClass) {
    const cls = extraClass ? ` ${extraClass}` : "";
    return src
      ? `<img class="loaded-img${cls}" src="${src}" alt="" style="width:100%;height:100%;object-fit:cover" />`
      : `<div class="ph-img${cls}" data-label="${label}"></div>`;
  }

  /* ============================================================
     Renderers
     ============================================================ */
  function renderNav() {
    const navInner = $("navInner");
    const mobile = $("mobileMenu");
    const links = list(SITE.nav).map((pair) => {
      const i = pair.indexOf(":");
      return { label: pair.slice(0, i).trim(), href: pair.slice(i + 1).trim() };
    });
    if (navInner) {
      navInner.innerHTML = `
        <a class="logo" href="#top" aria-label="${SITE.name} — home">${logoHTML(SITE.brand || "Hustle Tech")}</a>
        <nav class="nav__links">
          ${links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
          <a href="blog.html">Blog</a>
        </nav>
        <div class="nav__cta">
          ${themeToggleHTML()}
          ${langSwitcher()}
          <a class="btn btn--ghost btn--icon" href="${SITE.resume}" target="_blank" rel="noopener" aria-label="${T("nav.resume")}" title="${T("nav.resume")}"><i class="ph ph-file-arrow-down"></i></a>
          <a class="btn btn--primary" href="#contact"><i class="ph ph-paper-plane-tilt"></i>${T("nav.contact")}</a>
        </div>
        <button class="nav__burger" id="burger" aria-label="Open menu"><i class="ph ph-list"></i></button>`;
    }
    if (mobile) {
      mobile.innerHTML = `
        <button class="mobile-menu__close" id="menuClose" aria-label="Close menu"><i class="ph ph-x"></i></button>
        ${links.map((l) => `<a href="${l.href}">${l.label.toLowerCase()}</a>`).join("")}
        <a href="blog.html">${T("nav.blog").toLowerCase()}</a>
        <a href="${SITE.resume}" target="_blank" rel="noopener">${T("nav.resume").toLowerCase()}</a>
        <a href="#contact">${T("nav.contact").toLowerCase()}<span class="us">_</span></a>
        ${langSwitcher()}${themeToggleHTML()}`;
    }
  }

  async function renderHero() {
    const el = $("heroMount");
    if (!el) return;
    const { meta } = await singleton("hero");
    const lines = list(meta.headline).map((l) => `<span class="ln"><span>${l}</span></span>`).join("");
    el.innerHTML = `
      <div class="hero__intro">
        <div class="hero__hello eyebrow">${eyebrow(meta.hello)}</div>
        <h1>${lines}</h1>
        <p class="hero__sub">${meta.sub || ""}</p>
        <div class="hero__cta">
          <a class="btn btn--primary" href="#resume"><i class="ph ph-read-cv-logo"></i>${T("hero.cta1")}</a>
          <a class="btn btn--ghost" href="#contact"><i class="ph ph-arrow-right"></i>${T("hero.cta2")}</a>
        </div>
        <div class="hero__socials">${socialsHTML(
          SITE.youtube ? `<a href="${SITE.youtube}" aria-label="YouTube"><i class="ph ph-youtube-logo"></i></a>` : ""
        )}</div>
      </div>
      <div class="hero__portrait reveal">
        ${imgOrPh(meta.portrait, "executive portrait")}
        <div class="hero__tag">${meta.tag || ""}</div>
        <div class="hero__badge"><span class="dot"></span><span>${meta.badge || ""}</span></div>
      </div>`;
    const strip = $("stripMount");
    if (strip) {
      const items = list(meta.marquee).map((s) => `<span>${s}</span>`).join("");
      strip.innerHTML = `<div class="strip__track">${items}${items}</div>`;
    }
  }

  async function renderStats() {
    const el = $("statsMount");
    if (!el) return;
    const { items } = await collection("stats");
    el.innerHTML = items
      .map(
        (s, i) => `<div class="stat reveal"${i ? ` data-d="${i}"` : ""}>
          <div class="stat__num">${s.meta.num || ""}<span class="accent">${s.meta.accent || ""}</span></div>
          <div class="stat__label">${s.meta.label || ""}</div>
        </div>`
      )
      .join("");
  }

  async function renderAbout() {
    const el = $("aboutMount");
    if (!el) return;
    const { meta, body } = await singleton("about");
    el.innerHTML = `
      <div class="about__photo reveal">
        ${imgOrPh(meta.photo, "candid / working photo")}
        <div class="float-cap"><i class="ph ph-terminal-window"></i><span>${meta.floatcap || ""}</span></div>
      </div>
      <div>
        <div class="eyebrow reveal">${eyebrow(meta.eyebrow)}</div>
        <p class="about__lead reveal" data-d="1" style="margin-top:20px">${meta.lead || ""}</p>
        <div class="about__body reveal" data-d="2">${md(body)}</div>
        <div class="about__chips reveal" data-d="3">${list(meta.chips).map((c) => `<span class="chip">${c}</span>`).join("")}</div>
      </div>`;
  }

  async function renderHustle() {
    const el = $("hustleMount");
    if (!el) return;
    const { meta, body } = await singleton("hustle");
    const stats = list(meta.stats).map((s) => `<span class="venture__pill">${s}</span>`).join("");
    el.innerHTML = `
      <div class="venture reveal">
        <div class="venture__main">
          <div class="eyebrow">${eyebrow(meta.eyebrow)}</div>
          <div class="venture__brand">
            <span class="venture__logo"><span class="venture__bars"><i></i><i></i><i></i></span></span>
            <div>
              <h3 class="venture__name">${meta.name || ""}</h3>
              <div class="venture__role">${meta.role || ""}${meta.since ? ` · ${meta.since}` : ""}</div>
            </div>
          </div>
          ${meta.tagline ? `<p class="venture__lead">${mdi(meta.tagline)}</p>` : ""}
          <p class="venture__body">${mdi(body)}</p>
          ${meta.url ? `<a class="btn btn--ghost" href="${meta.url}" target="_blank" rel="noopener"><i class="ph ph-arrow-up-right"></i>${meta.cta || "Visit"}</a>` : ""}
        </div>
        <div class="venture__side">${stats}</div>
      </div>`;
  }

  async function renderExperience() {
    const el = $("panel-exp");
    if (!el) return;
    const { items } = await collection("experience");
    el.innerHTML = `<div class="timeline">${items
      .map((it, i) => {
        const m = it.meta;
        const via = m.via ? ` <span style="color:var(--fg-3);font-size:.75em">${T("resume.via")} ${m.via}</span>` : "";
        return `<details class="tl-item"${i === 0 ? " open" : ""}>
          <summary>
            <div class="tl-head">
              <span class="tl-role">${m.role || ""} — <span class="tl-co">${m.company || ""}</span>${via}</span>
              <i class="ph ph-caret-down tl-chevron"></i>
              <div class="tl-meta"><span class="when">${m.dates || ""}</span><span>${m.location || ""}</span><span>${m.focus || ""}</span></div>
            </div>
          </summary>
          <div class="tl-body">${md(it.body)}<div class="tl-tags">${tagsHTML(m.tags)}</div></div>
        </details>`;
      })
      .join("")}</div>`;
  }

  async function renderEarlier() {
    const el = $("panel-earlier");
    if (!el) return;
    const { items } = await collection("earlier");
    el.innerHTML = `<div class="earlier">${items
      .map(
        (it) => `<div class="earlier__row">
          <div class="earlier__lead">
            <span class="r">${it.meta.role || ""} — <b>${it.meta.company || ""}</b></span>
            ${it.body ? `<span class="earlier__desc">${mdi(it.body)}</span>` : ""}
          </div>
          <span class="t">${it.meta.stack || ""}</span>
          <span class="d">${it.meta.dates || ""}</span>
        </div>`
      )
      .join("")}</div>`;
  }

  async function renderSkills() {
    const el = $("panel-skills");
    if (!el) return;
    const { items } = await collection("skills");
    el.innerHTML = `<div class="skills">${items
      .map(
        (it) => `<div class="skillcard">
          <h4><i class="ph ${it.meta.icon || "ph-code"}"></i>${it.meta.title || ""}</h4>
          <div class="tags">${skillTagsHTML(it.meta.tags)}</div>
        </div>`
      )
      .join("")}</div>`;
  }

  async function renderPortfolio() {
    const el = $("workMount");
    if (!el) return;
    setHead("workHead", "work");
    const { items } = await collection("portfolio");
    el.innerHTML = `<div class="work">${items
      .map((it, i) => {
        const n = String(i + 1).padStart(2, "0");
        return `<article class="work__card reveal"${i ? ` data-d="${i}"` : ""}>
          <div class="work__media">${imgOrPh(it.meta.cover, "project shot · " + (it.meta.title || ""))}<span class="work__num">${n}</span></div>
          <div class="work__body">
            <div class="work__title">${it.meta.title || ""} <i class="ph ph-arrow-up-right"></i></div>
            <p class="work__desc">${it.body}</p>
            <div class="work__tags">${tagsHTML(it.meta.tags)}</div>
          </div>
        </article>`;
      })
      .join("")}</div>`;
  }

  async function renderEducation() {
    const el = $("eduMount");
    if (!el) return;
    setHead("educationHead", "education");
    const [edu, talks, langs] = await Promise.all([collection("education"), collection("talks"), collection("languages")]);
    const eduCards = edu.items
      .map(
        (it) => `<div class="edu__card">
          <div class="edu__deg">${it.meta.degree || ""}</div>
          <div class="edu__inst">${it.meta.institution || ""}</div>
          <div class="edu__when">${it.meta.dates || ""}</div>
          ${it.body ? `<div class="edu__desc">${it.body}</div>` : ""}
        </div>`
      )
      .join("");
    const talkRows = talks.items
      .map((it) => `<div class="talk"><i class="ph ph-microphone-stage"></i><div><b>${it.meta.title || ""}</b><small>${it.meta.meta || ""}</small></div></div>`)
      .join("");
    const langRows = langs.items
      .map(
        (it) => `<div class="lang__row">
          <div class="lang__top"><span class="lang__name">${it.meta.name || ""}</span><span class="lang__level">${it.meta.level || ""}</span></div>
          <div class="lang__meter"><i data-w="${it.meta.meter || 0}"></i></div>
          ${it.meta.note ? `<div class="lang__note">${it.meta.note}</div>` : ""}
        </div>`
      )
      .join("");
    el.innerHTML = `
      <div class="reveal">
        ${eduCards}
        <div class="edu__card" style="margin-top:24px">
          <h4 style="font-family:var(--font-mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--red);margin-bottom:6px">${T("education.talks")}</h4>
          ${talkRows}
        </div>
      </div>
      <div class="reveal" data-d="1"><div class="lang">${langRows}</div></div>`;
  }

  async function renderCerts() {
    const el = $("certsGrid");
    if (!el) return;
    setHead("certsHead", "certs");
    const { items } = await collection("certificates");
    const CERTS = items.map((it) => it.meta);
    const PREVIEW = 3;
    const cardHTML = (c) => `
      <div class="cert__media">
        ${c.image ? `<img src="${c.image}" alt="${c.title}" loading="lazy">` : `<div class="ph-img" data-label="certificate"></div>`}
        <div class="cert__zoom"><i class="ph ph-magnifying-glass-plus"></i></div>
      </div>
      <div class="cert__body">
        <div class="cert__issuer">${c.issuer || ""}</div>
        <div class="cert__title">${c.title || ""}</div>
        <div class="cert__date">${c.date || ""}</div>
      </div>`;
    const open = (c) => {
      if (!window.openModal) return;
      if (c.image) window.openModal({ imgSrc: c.image, isImage: true, title: c.title, sub: `${c.issuer} · ${c.date}` });
      else window.openModal({ html: `<div class="ph-img" data-label="certificate scan goes here" style="position:absolute;inset:0"></div>`, title: c.title, sub: `${c.issuer} · ${c.date}` });
    };
    const gallery = () => {
      const cells = CERTS.map((c, i) => `<div class="cert" data-ci="${i}">${cardHTML(c)}</div>`).join("");
      window.openModal({
        panel: `<div class="modal__panel-head"><i class="ph ph-seal-check"></i><h4>${T("certs.gallery")}</h4><small>${CERTS.length} ${T("certs.total")}</small></div><div class="cert-gallery">${cells}</div>`,
      });
      document.querySelectorAll("#modalFrame .cert-gallery .cert").forEach((node) => node.addEventListener("click", () => open(CERTS[+node.dataset.ci])));
    };
    el.innerHTML = "";
    CERTS.slice(0, PREVIEW).forEach((c, i) => {
      const node = document.createElement("div");
      node.className = "cert reveal";
      if (i % 4) node.dataset.d = String(i % 4);
      node.innerHTML = cardHTML(c);
      node.addEventListener("click", () => open(c));
      el.appendChild(node);
    });
    if (CERTS.length > PREVIEW) {
      const more = document.createElement("div");
      more.className = "cert-more reveal";
      more.dataset.d = "3";
      more.innerHTML = `<div class="cert-more__inner"><b>+${CERTS.length - PREVIEW}</b><span>${T("certs.viewall")} ${CERTS.length}</span></div>`;
      more.addEventListener("click", gallery);
      el.appendChild(more);
    }
  }

  async function renderVideos() {
    const el = $("ytGrid");
    if (!el) return;
    setHead("videosHead", "videos");
    const { items } = await collection("videos");
    el.innerHTML = "";
    items.forEach((it, i) => {
      const v = it.meta;
      const card = document.createElement("div");
      card.className = "yt__card reveal";
      if (i % 3) card.dataset.d = String(i % 3);
      card.innerHTML = `
        <div class="yt__thumb">
          <div class="ph-img" data-label="thumbnail"></div>
          <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy"
               onload="this.previousElementSibling && this.previousElementSibling.remove()" onerror="this.remove()" />
          <div class="yt__shade"></div>
          <span class="yt__badge"><i class="ph-fill ph-youtube-logo" style="color:#ff0000"></i>YouTube</span>
          ${v.duration ? `<span class="yt__dur">${v.duration}</span>` : ""}
          <div class="yt__play"><span class="ring"><i class="ph-fill ph-play"></i></span></div>
          <div class="yt__title">${v.title || ""}</div>
        </div>`;
      card.addEventListener("click", () => {
        if (!window.openModal) return;
        window.openModal({
          html: `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
          title: v.title,
          sub: "YouTube",
        });
      });
      el.appendChild(card);
    });
  }

  async function renderSocial() {
    const el = $("socialMount");
    if (!el) return;
    setHead("socialHead", "social");
    const { meta } = await singleton("social");
    const host = location.hostname || "localhost";
    const ph = (icon, lines) => `<div class="social__ph"><i class="ph ${icon}"></i><p>${lines}</p></div>`;
    let ig = meta.instagram
      ? `<blockquote class="instagram-media" data-instgrm-permalink="${meta.instagram}" data-instgrm-version="14" style="width:100%;min-width:0;margin:0;background:#000"></blockquote>`
      : ph("ph-instagram-logo", T("social.ph_instagram"));
    let tt;
    if (meta.tiktok) {
      const id = (meta.tiktok.match(/video\/(\d+)/) || [])[1] || "";
      tt = `<blockquote class="tiktok-embed" cite="${meta.tiktok}" data-video-id="${id}" style="margin:0;min-width:0"><section></section></blockquote>`;
    } else tt = ph("ph-tiktok-logo", T("social.ph_tiktok"));
    let tw = meta.twitch
      ? `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(meta.twitch)}&parent=${host}&muted=true&autoplay=false" height="420" width="100%" allowfullscreen></iframe>`
      : ph("ph-twitch-logo", T("social.ph_twitch"));
    el.innerHTML = `
      <div class="social__col ig">
        <div class="social__bar"><i class="ph-fill ph-instagram-logo"></i><b>Instagram</b><a href="${meta.instagram_url || "https://instagram.com/"}" target="_blank" rel="noopener">${meta.instagram_handle || "@rodrigo"} <i class="ph ph-arrow-up-right"></i></a></div>
        <div class="social__embed">${ig}</div>
      </div>
      <div class="social__col tt">
        <div class="social__bar"><i class="ph-fill ph-tiktok-logo"></i><b>TikTok</b><a href="${meta.tiktok_url || "https://tiktok.com/"}" target="_blank" rel="noopener">${meta.tiktok_handle || "@rodrigo"} <i class="ph ph-arrow-up-right"></i></a></div>
        <div class="social__embed">${tt}</div>
      </div>
      <div class="social__col tw">
        <div class="social__bar"><i class="ph-fill ph-twitch-logo"></i><b>Twitch</b><a href="${meta.twitch_url || "https://twitch.tv/"}" target="_blank" rel="noopener">${meta.twitch_handle || "/rodrigo"} <i class="ph ph-arrow-up-right"></i></a></div>
        <div class="social__embed">${tw}</div>
      </div>`;
    if (meta.instagram) {
      const s = document.createElement("script");
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      s.onload = () => window.instgrm && window.instgrm.Embeds.process();
      document.body.appendChild(s);
    }
    if (meta.tiktok) {
      const s = document.createElement("script");
      s.src = "https://www.tiktok.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }

  function renderGithubHead() {
    setHead("githubHead", "github");
    const u = $("ghUser");
    if (u) u.innerHTML = `<b>${SITE.github_user || "napalm23zero"}</b><small>${T("github.bio")}</small>`;
    const vp = $("ghViewProfile");
    if (vp) vp.innerHTML = `<i class="ph ph-github-logo"></i>${T("github.viewprofile")}`;
  }

  function renderContact() {
    const el = $("contactMount");
    if (el) {
      el.innerHTML = `
        <div class="eyebrow">${eyebrow(SITE.contact_eyebrow || "Let's_talk")}</div>
        <h2 style="margin-top:18px">${SITE.contact_title || ""}</h2>
        <p>${SITE.contact_sub || ""}</p>
        <div class="contact__actions">
          ${SITE.whatsapp ? `<a class="btn btn--primary" href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener"><i class="ph ph-whatsapp-logo"></i>WhatsApp</a>` : ""}
          ${SITE.calendar ? `<a class="btn btn--ghost" href="${SITE.calendar}" target="_blank" rel="noopener"><i class="ph ph-calendar-check"></i>${T("contact.schedule")}</a>` : ""}
          <a class="btn btn--ghost" href="mailto:${SITE.email}"><i class="ph ph-envelope-simple"></i>Email</a>
          ${SITE.linkedin ? `<a class="btn btn--ghost" href="${SITE.linkedin}" target="_blank" rel="noopener"><i class="ph ph-linkedin-logo"></i>LinkedIn</a>` : ""}
          ${SITE.github ? `<a class="btn btn--ghost" href="${SITE.github}" target="_blank" rel="noopener"><i class="ph ph-github-logo"></i>GitHub</a>` : ""}
        </div>`;
    }
    const foot = $("footerMount");
    if (foot) {
      foot.innerHTML = `
        <div>
          <a class="logo" href="#top" style="margin-bottom:10px">${logoHTML("")}</a>
          <div class="footer__meta">${[SITE.location, SITE.phone].filter(Boolean).join(" · ")}${SITE.email ? ` · <a href="mailto:${SITE.email}">${SITE.email}</a>` : ""}</div>
        </div>
        <div class="footer__quote">${SITE.quote || ""}</div>
        <div class="footer__social">${socialsHTML()}</div>`;
    }
  }

  function renderResumeChrome() {
    setHead("resumeHead", "resume");
    setHead("blogHead", "blog");
    const tb = $("resumeTabs");
    if (tb) {
      tb.querySelector('[data-tab="exp"]').textContent = T("resume.tab_exp");
      tb.querySelector('[data-tab="earlier"]').textContent = T("resume.tab_earlier");
      tb.querySelector('[data-tab="skills"]').textContent = T("resume.tab_skills");
    }
    const dl = $("resumeDownload");
    if (dl) dl.innerHTML = `<i class="ph ph-download-simple"></i>${T("resume.download")}`;
    const rf = $("blogReadFull");
    if (rf) rf.innerHTML = `<i class="ph ph-newspaper-clipping"></i>${T("blog.readfull")}`;
  }

  /* ---- BLOG chrome (blog.html) ---- */
  function renderBlogChrome() {
    const top = $("blogTopMount");
    if (top) {
      top.innerHTML = `
        <a class="logo" href="index.html" aria-label="${SITE.name} — home">${logoHTML(SITE.blog_label || "The Blog")}</a>
        <div class="blogtop__right">${themeToggleHTML()}${langSwitcher()}<a class="btn btn--ghost" href="index.html"><i class="ph ph-arrow-left"></i>${T("blog.backprofile")}</a></div>`;
    }
    const id = $("blogId");
    if (id) {
      id.innerHTML = `
        <img class="bloghero__avatar" src="${SITE.avatar || ""}" alt="${SITE.name}" loading="lazy" />
        <div class="bloghero__who"><b>${SITE.name || ""}</b><span>${SITE.blog_tagline || SITE.role || ""}</span></div>`;
    }
    const h1 = $("blogHeroTitle");
    if (h1) h1.innerHTML = T("blog.hero_title");
    const sub = $("blogHeroSub");
    if (sub) sub.innerHTML = T("blog.hero_sub");
    const tags = $("blogHeroTags");
    if (tags) tags.innerHTML = list(T("blog.hero_tags")).map((t) => `<span>${t}</span>`).join("");
    const follow = $("blogFollow");
    if (follow) follow.innerHTML = `<span class="lbl">${T("blog.follow")}</span>${socialsHTML(SITE.youtube ? `<a href="index.html#videos" aria-label="YouTube"><i class="ph ph-youtube-logo"></i></a>` : "")}`;
    setHead("blogListHead", "blog.list");
  }

  function wireLangButtons() {
    document.querySelectorAll(".langsw button").forEach((b) => {
      b.addEventListener("click", () => window.I18N.setLang(b.dataset.lang));
    });
  }

  // Swap the studio photos for their light-bg variants (rodrigo-x.jpg ->
  // rodrigo-x-light.jpg). Done in JS for cross-browser reliability (CSS
  // content:url fails in Firefox).
  function applyThemePhotos(t) {
    document.querySelectorAll(".hero__portrait img, .about__photo img, .resume__photo img").forEach((img) => {
      if (!img.dataset.darkSrc) img.dataset.darkSrc = img.getAttribute("src") || "";
      const dark = img.dataset.darkSrc;
      if (!dark) return;
      const light = dark.replace(/(\.[a-z0-9]+)$/i, "-light$1");
      const next = t === "light" ? light : dark;
      if (img.getAttribute("src") !== next) img.src = next;
    });
  }
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    document.querySelectorAll(".theme-toggle i").forEach((i) => {
      i.className = "ph " + (t === "light" ? "ph-moon" : "ph-sun");
    });
    applyThemePhotos(t);
  }
  function wireTheme() {
    document.querySelectorAll(".theme-toggle").forEach((b) => {
      b.addEventListener("click", () => applyTheme(currentTheme() === "light" ? "dark" : "light"));
    });
    applyThemePhotos(currentTheme()); // sync freshly-rendered photos to the active theme
  }

  // One-time intro on first load: a quick bounce across the header items so
  // visitors notice the nav, then a longer, gentle wink on the language
  // switcher to surface the other languages.
  let introDone = false;
  function introOnce() {
    if (introDone) return;
    introDone = true;
    const nav = document.getElementById("nav");
    setTimeout(() => {
      if (!nav) return;
      nav.classList.add("nav--intro");
      setTimeout(() => nav.classList.remove("nav--intro"), 1500);
    }, 250);
    setTimeout(() => {
      document.querySelectorAll(".langsw").forEach((el) => {
        el.classList.add("langsw--hint");
        setTimeout(() => el.classList.remove("langsw--hint"), 2200);
      });
    }, 1200);
  }

  /* ============================================================
     Render pipeline (re-runnable on language change)
     ============================================================ */
  window.__renderAll = async function () {
    await window.I18N.loadUI();
    try {
      SITE = (await singleton("site")).meta;
    } catch (e) {
      console.error("content/site.*.md failed", e);
      SITE = {};
    }
    window.SITE_NAME = SITE.name || "Rodrigo Dantas";
    renderNav();
    renderContact();
    renderResumeChrome();
    renderGithubHead();
    renderBlogChrome();

    await Promise.allSettled([
      renderHero(),
      renderStats(),
      renderAbout(),
      renderHustle(),
      renderExperience(),
      renderEarlier(),
      renderSkills(),
      renderPortfolio(),
      renderEducation(),
      renderCerts(),
      renderVideos(),
      renderSocial(),
    ]);

    if (window.__renderBlog) await window.__renderBlog();

    if (window.__wireSite) window.__wireSite();
    wireLangButtons();
    wireTheme();
    introOnce();
    if (window.__observeReveals) window.__observeReveals();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", window.__renderAll);
  else window.__renderAll();
})();
