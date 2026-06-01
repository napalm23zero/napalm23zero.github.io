/* ============================================================
   Content engine — renders the whole site from Markdown.
   ------------------------------------------------------------
   Two content shapes:
     • Singletons  → one .md file (front-matter + body)
                     e.g. content/site.md, content/hero.md
     • Collections → a folder with index.json + one .md per item
                     index.json = { eyebrow, title, intro, items:[ids] }
                     each item   = content/<dir>/<id>.md
   Front-matter is plain `key: value`. Use ` | ` to write lists.
   Bodies are standard Markdown (rendered with marked).
   No build step — everything is fetched live from the repo.
   ============================================================ */
(function () {
  /* ---------- tiny helpers ---------- */
  const $ = (id) => document.getElementById(id);

  async function text(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error("404 " + path);
    return r.text();
  }
  async function json(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error("404 " + path);
    return r.json();
  }

  function parseFM(raw) {
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    const meta = {};
    let body = raw;
    if (m) {
      body = raw.slice(m[0].length);
      m[1].split("\n").forEach((line) => {
        const i = line.indexOf(":");
        if (i > -1) meta[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
      });
    }
    return { meta, body: body.trim() };
  }

  const list = (v) => (v || "").split("|").map((s) => s.trim()).filter(Boolean);
  const md = (s) => (window.marked ? marked.parse(s || "") : s || "");
  const eyebrow = (s) => (s || "").replace(/_/g, '<span class="us">_</span>');

  async function singleton(path) {
    return parseFM(await text(path));
  }
  async function collection(dir) {
    const idx = await json(`content/${dir}/index.json`);
    const items = await Promise.all(
      (idx.items || []).map(async (id) => {
        const { meta, body } = parseFM(await text(`content/${dir}/${id}.md`));
        return { id, meta, body };
      })
    );
    return { ...idx, items };
  }

  function headHTML(idx) {
    return `<div class="section__head reveal">
      <div class="eyebrow">${eyebrow(idx.eyebrow)}</div>
      ${idx.title ? `<h2>${idx.title}</h2>` : ""}
      ${idx.intro ? `<p>${idx.intro}</p>` : ""}
    </div>`;
  }

  const tags = (v) => list(v).map((t) => `<span>${t}</span>`).join("");

  /* shared logo + socials markup, fed by site.md ---------------- */
  let SITE = {};
  function logoHTML(sub) {
    return `<span class="logo__mark"><span class="logo__bars"><i></i><i></i><i></i></span></span>
      <span><span class="logo__type">${SITE.wordmark || "rodrigo<span class='us'>_</span>dantas"}</span>${
        sub ? `<small>${sub}</small>` : ""
      }</span>`;
  }
  function socialsHTML(extra) {
    const a = [];
    if (SITE.github) a.push(`<a href="${SITE.github}" target="_blank" rel="noopener" aria-label="GitHub"><i class="ph ph-github-logo"></i></a>`);
    if (SITE.linkedin) a.push(`<a href="${SITE.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="ph ph-linkedin-logo"></i></a>`);
    if (SITE.email) a.push(`<a href="mailto:${SITE.email}" aria-label="Email"><i class="ph ph-envelope-simple"></i></a>`);
    if (extra) a.push(extra);
    return a.join("");
  }

  /* ============================================================
     Renderers — each guarded by the presence of its mount node
     ============================================================ */

  /* ---- NAV + MOBILE MENU (site.md → nav: Label:#anchor | ...) ---- */
  function renderNav() {
    const navInner = $("navInner");
    const mobile = $("mobileMenu");
    const links = list(SITE.nav).map((pair) => {
      const [label, href] = pair.split(":");
      return { label: (label || "").trim(), href: (href || "").trim() };
    });

    if (navInner) {
      navInner.innerHTML = `
        <a class="logo" href="#top" aria-label="${SITE.name} — home">${logoHTML(SITE.brand || "Hustle Tech")}</a>
        <nav class="nav__links">
          ${links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
          <a href="blog.html">Read my blog</a>
        </nav>
        <div class="nav__cta">
          <a class="btn btn--ghost" href="${SITE.resume}" target="_blank" rel="noopener"><i class="ph ph-file-arrow-down"></i>Résumé PDF</a>
          <a class="btn btn--primary" href="#contact"><i class="ph ph-paper-plane-tilt"></i>Contact</a>
        </div>
        <button class="nav__burger" id="burger" aria-label="Open menu"><i class="ph ph-list"></i></button>`;
    }
    if (mobile) {
      mobile.innerHTML = `
        <button class="mobile-menu__close" id="menuClose" aria-label="Close menu"><i class="ph ph-x"></i></button>
        ${links.map((l) => `<a href="${l.href}">${l.label.toLowerCase()}</a>`).join("")}
        <a href="blog.html">read my blog</a>
        <a href="#contact">contact<span class="us">_</span></a>`;
    }
  }

  /* ---- HERO ---- */
  async function renderHero() {
    const el = $("heroMount");
    if (!el) return;
    const { meta } = await singleton("content/hero.md");
    const lines = list(meta.headline).map((l) => `<span class="ln"><span>${l}</span></span>`).join("");
    el.innerHTML = `
      <div class="hero__intro">
        <div class="hero__hello eyebrow">${eyebrow(meta.hello)}</div>
        <h1>${lines}</h1>
        <p class="hero__sub">${meta.sub || ""}</p>
        <div class="hero__cta">
          <a class="btn btn--primary" href="#resume"><i class="ph ph-read-cv-logo"></i>Explore my résumé</a>
          <a class="btn btn--ghost" href="#contact"><i class="ph ph-arrow-right"></i>Get in touch</a>
        </div>
        <div class="hero__socials">${socialsHTML(
          SITE.youtube ? `<a href="${SITE.youtube}" target="_blank" rel="noopener" aria-label="YouTube"><i class="ph ph-youtube-logo"></i></a>` : ""
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

  function imgOrPh(src, label, extraClass) {
    const cls = extraClass ? ` ${extraClass}` : "";
    return src
      ? `<img class="loaded-img${cls}" src="${src}" alt="" style="width:100%;height:100%;object-fit:cover" />`
      : `<div class="ph-img${cls}" data-label="${label}"></div>`;
  }

  /* ---- STATS ---- */
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

  /* ---- ABOUT ---- */
  async function renderAbout() {
    const el = $("aboutMount");
    if (!el) return;
    const { meta, body } = await singleton("content/about.md");
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

  /* ---- RESUME: experience / earlier / skills ---- */
  async function renderExperience() {
    const el = $("panel-exp");
    if (!el) return;
    const { items } = await collection("experience");
    el.innerHTML = `<div class="timeline">${items
      .map((it, i) => {
        const m = it.meta;
        const via = m.via ? ` <span style="color:var(--fg-3);font-size:.75em">via ${m.via}</span>` : "";
        const open = i === 0 ? " open" : "";
        return `<details class="tl-item"${open}>
          <summary>
            <div class="tl-head">
              <span class="tl-role">${m.role || ""} — <span class="tl-co">${m.company || ""}</span>${via}</span>
              <i class="ph ph-caret-down tl-chevron"></i>
              <div class="tl-meta"><span class="when">${m.dates || ""}</span><span>${m.location || ""}</span><span>${m.focus || ""}</span></div>
            </div>
          </summary>
          <div class="tl-body">${md(it.body)}<div class="tl-tags">${tags(m.tags)}</div></div>
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
          <span class="r">${it.meta.role || ""} — <b>${it.meta.company || ""}</b></span>
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
          <div class="tags">${tags(it.meta.tags)}</div>
        </div>`
      )
      .join("")}</div>`;
  }

  /* ---- PORTFOLIO ---- */
  async function renderPortfolio() {
    const el = $("workMount");
    if (!el) return;
    const data = await collection("portfolio");
    $("workHead").innerHTML = headHTML(data);
    el.innerHTML = `<div class="work">${data.items
      .map((it, i) => {
        const n = String(i + 1).padStart(2, "0");
        return `<article class="work__card reveal"${i ? ` data-d="${i}"` : ""}>
          <div class="work__media">${imgOrPh(it.meta.cover, "project shot · " + (it.meta.title || ""))}<span class="work__num">${n}</span></div>
          <div class="work__body">
            <div class="work__title">${it.meta.title || ""} <i class="ph ph-arrow-up-right"></i></div>
            <p class="work__desc">${it.body}</p>
            <div class="work__tags">${tags(it.meta.tags)}</div>
          </div>
        </article>`;
      })
      .join("")}</div>`;
  }

  /* ---- EDUCATION + TALKS + LANGUAGES ---- */
  async function renderEducation() {
    const el = $("eduMount");
    if (!el) return;
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
      .map(
        (it) => `<div class="talk"><i class="ph ph-microphone-stage"></i><div><b>${it.meta.title || ""}</b><small>${it.meta.meta || ""}</small></div></div>`
      )
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
          <h4 style="font-family:var(--font-mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--red);margin-bottom:6px">Talks &amp; courses</h4>
          ${talkRows}
        </div>
      </div>
      <div class="reveal" data-d="1"><div class="lang">${langRows}</div></div>`;
  }

  /* ---- CERTIFICATES (preview row + modal gallery) ---- */
  async function renderCerts() {
    const el = $("certsGrid");
    if (!el) return;
    const data = await collection("certificates");
    $("certsHead").innerHTML = headHTML(data);
    const CERTS = data.items.map((it) => it.meta);
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
      const items = CERTS.map((c, i) => `<div class="cert" data-ci="${i}">${cardHTML(c)}</div>`).join("");
      window.openModal({
        panel: `<div class="modal__panel-head"><i class="ph ph-seal-check"></i><h4>Courses &amp; Certificates</h4><small>${CERTS.length} total</small></div><div class="cert-gallery">${items}</div>`,
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
      more.innerHTML = `<div class="cert-more__inner"><b>+${CERTS.length - PREVIEW}</b><span>View all ${CERTS.length}</span></div>`;
      more.addEventListener("click", gallery);
      el.appendChild(more);
    }
  }

  /* ---- YOUTUBE VIDEOS (theater modal) ---- */
  async function renderVideos() {
    const el = $("ytGrid");
    if (!el) return;
    const data = await collection("videos");
    $("videosHead").innerHTML = headHTML(data);
    data.items.forEach((it, i) => {
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

  /* ---- SOCIAL EMBEDS ---- */
  async function renderSocial() {
    const el = $("socialMount");
    if (!el) return;
    const { meta } = await singleton("content/social.md");
    const host = location.hostname || "localhost";

    const ph = (icon, lines) => `<div class="social__ph"><i class="ph ${icon}"></i><p>${lines}</p></div>`;

    let ig;
    if (meta.instagram) ig = `<blockquote class="instagram-media" data-instgrm-permalink="${meta.instagram}" data-instgrm-version="14" style="width:100%;min-width:0;margin:0;background:#000"></blockquote>`;
    else ig = ph("ph-instagram-logo", "Set <code>instagram:</code> in <code>content/social.md</code>");

    let tt;
    if (meta.tiktok) {
      const id = (meta.tiktok.match(/video\/(\d+)/) || [])[1] || "";
      tt = `<blockquote class="tiktok-embed" cite="${meta.tiktok}" data-video-id="${id}" style="margin:0;min-width:0"><section></section></blockquote>`;
    } else tt = ph("ph-tiktok-logo", "Set <code>tiktok:</code> in <code>content/social.md</code>");

    let tw;
    if (meta.twitch) tw = `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(meta.twitch)}&parent=${host}&muted=true&autoplay=false" height="420" width="100%" allowfullscreen></iframe>`;
    else tw = ph("ph-twitch-logo", "Set <code>twitch:</code> in <code>content/social.md</code>");

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

  /* ---- CONTACT + FOOTER (from site.md) ---- */
  function renderContact() {
    const el = $("contactMount");
    if (el) {
      el.innerHTML = `
        <div class="eyebrow">${eyebrow(SITE.contact_eyebrow || "Let's_talk")}</div>
        <h2 style="margin-top:18px">${SITE.contact_title || "Own a domain. Build something that lasts."}</h2>
        <p>${SITE.contact_sub || ""}</p>
        <div class="contact__actions">
          <a class="btn btn--primary" href="mailto:${SITE.email}"><i class="ph ph-envelope-simple"></i>${SITE.email}</a>
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

  /* ---- BLOG chrome (blog.html) ---- */
  function renderBlogChrome() {
    const top = $("blogTopMount");
    if (top) {
      top.innerHTML = `
        <a class="logo" href="index.html" aria-label="${SITE.name} — home">${logoHTML(SITE.blog_label || "The Blog")}</a>
        <a class="btn btn--ghost" href="index.html"><i class="ph ph-arrow-left"></i>Back to profile</a>`;
    }
    const id = $("blogId");
    if (id) {
      id.innerHTML = `
        <img class="bloghero__avatar" src="${SITE.avatar || ""}" alt="${SITE.name}" loading="lazy" />
        <div class="bloghero__who"><b>${SITE.name || ""}</b><span>${SITE.blog_tagline || SITE.role || ""}</span></div>`;
    }
    const follow = $("blogFollow");
    if (follow) {
      follow.innerHTML = `<span class="lbl">Follow_</span>${socialsHTML(
        SITE.youtube ? `<a href="${SITE.youtube}" target="_blank" rel="noopener" aria-label="YouTube"><i class="ph ph-youtube-logo"></i></a>` : ""
      )}`;
    }
  }

  /* ============================================================
     Boot
     ============================================================ */
  async function boot() {
    try {
      const s = await singleton("content/site.md");
      SITE = s.meta;
    } catch (e) {
      console.error("Failed to load content/site.md", e);
    }

    // chrome first (sync), then content sections (parallel)
    renderNav();
    renderContact();
    renderBlogChrome();

    await Promise.allSettled([
      renderHero(),
      renderStats(),
      renderAbout(),
      renderExperience(),
      renderEarlier(),
      renderSkills(),
      renderPortfolio(),
      renderEducation(),
      renderCerts(),
      renderVideos(),
      renderSocial(),
    ]);

    // re-wire interactions + reveals now that the DOM exists
    if (window.__wireSite) window.__wireSite();
    if (window.__observeReveals) window.__observeReveals();
  }

  boot();
})();
