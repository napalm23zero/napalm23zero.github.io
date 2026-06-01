/* ============================================================
   Blog engine — renders Markdown posts from content/posts, in the
   current language. Each post is content/posts/<id>.<lang>.md and
   the order lives in content/posts/index.json (shared, items-only).
   Exposes window.__renderBlog() — called by content.js on load and
   on every language change. Falls back to the default language.
   ============================================================ */
(function () {
  const list = document.getElementById("blogList");
  const reader = document.getElementById("reader");
  const readerDoc = document.getElementById("readerDoc");
  if (!list) return;

  const T = (k) => window.I18N.t(k);
  const fmtDate = (s) => {
    const d = new Date(s);
    if (isNaN(d)) return s || "";
    return d.toLocaleDateString(window.I18N.locale(), { year: "numeric", month: "short", day: "numeric" });
  };
  const readTime = (body) => Math.max(1, Math.round(body.trim().split(/\s+/).length / 200)) + " " + T("post.readtime");

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
    return { meta, body };
  }

  async function postText(id) {
    const langs = [window.I18N.lang, window.I18N.default];
    for (const l of langs) {
      try {
        const r = await fetch(`content/${l}/posts/${id}.${l}.md`, { cache: "no-store" });
        if (r.ok) return r.text();
      } catch (e) {}
    }
    return null;
  }

  async function postsIndex() {
    for (const l of [window.I18N.lang, window.I18N.default]) {
      try {
        const r = await fetch(`content/${l}/posts/index.json`, { cache: "no-store" });
        if (r.ok) return r.json();
      } catch (e) {}
    }
    return { items: [] };
  }

  const coverHTML = (p) => (p.meta.cover ? `<img src="${p.meta.cover}" alt="" loading="lazy">` : `<div class="ph-img" data-label="post cover"></div>`);
  const cat = (p) => p.meta.category || T("post.notes");

  let POSTS = [];

  function featCard(p) {
    const a = document.createElement("a");
    a.className = "feat reveal";
    a.href = "#/post/" + p.slug;
    a.innerHTML = `
      <div class="feat__cover">${coverHTML(p)}</div>
      <div class="feat__body">
        <span class="feat__cat">${cat(p)}</span>
        <h3 class="feat__title">${p.meta.title || p.slug}</h3>
        <p class="feat__excerpt">${p.meta.excerpt || ""}</p>
        <div class="feat__meta"><span>${fmtDate(p.meta.date)}</span><span>${p.readTime}</span><span>${T("post.readmore")} &rarr;</span></div>
      </div>`;
    return a;
  }
  function rowCard(p) {
    const a = document.createElement("a");
    a.className = "prow reveal";
    a.href = "#/post/" + p.slug;
    a.innerHTML = `
      <div class="prow__thumb">${coverHTML(p)}</div>
      <div class="prow__body">
        <span class="prow__cat">${cat(p)}</span>
        <h4 class="prow__title">${p.meta.title || p.slug}</h4>
        <span class="prow__meta">${fmtDate(p.meta.date)} · ${p.readTime}</span>
      </div>`;
    return a;
  }
  function postCard(p, i) {
    const a = document.createElement("a");
    a.className = "post reveal";
    if (i % 3) a.dataset.d = String(i % 3);
    a.href = "#/post/" + p.slug;
    a.innerHTML = `
      <div class="post__cover">${coverHTML(p)}<span class="post__cat">${cat(p)}</span></div>
      <div class="post__body">
        <div class="post__meta"><span>${fmtDate(p.meta.date)}</span><span>${p.readTime}</span></div>
        <h3 class="post__title">${p.meta.title || p.slug}</h3>
        <p class="post__excerpt">${p.meta.excerpt || ""}</p>
        <span class="post__more">${T("post.readmore")} <i class="ph ph-arrow-right"></i></span>
      </div>`;
    return a;
  }

  function renderList() {
    list.innerHTML = "";
    if (!POSTS.length) {
      list.innerHTML = `<div class="blog__empty">${T("blog.empty")}</div>`;
      return;
    }
    if (list.dataset.layout === "grid") {
      const grid = document.createElement("div");
      grid.className = "blog__list";
      POSTS.forEach((p, i) => grid.appendChild(postCard(p, i)));
      list.appendChild(grid);
    } else {
      const grid = document.createElement("div");
      grid.className = "blog2";
      grid.appendChild(featCard(POSTS[0]));
      const rest = document.createElement("div");
      rest.className = "bloglist";
      POSTS.slice(1).forEach((p) => rest.appendChild(rowCard(p)));
      grid.appendChild(rest);
      list.appendChild(grid);
    }
    if (window.__observeReveals) window.__observeReveals();
  }

  function openPost(slug) {
    const p = POSTS.find((x) => x.slug === slug);
    if (!p) {
      closeReader();
      return;
    }
    readerDoc.innerHTML = `
      <span class="post__cat" style="position:static;display:inline-block;margin-bottom:18px">${cat(p)}</span>
      <h1>${p.meta.title || p.slug}</h1>
      <div class="meta"><span>${fmtDate(p.meta.date)}</span><span>${p.readTime}</span><span>${T("post.by")} ${window.SITE_NAME || "Rodrigo Dantas"}</span></div>
      <div class="post__content">${marked.parse(p.body)}</div>`;
    reader.classList.add("open");
    document.body.style.overflow = "hidden";
    reader.scrollTop = 0;
  }
  function closeReader() {
    reader.classList.remove("open");
    document.body.style.overflow = "";
  }
  function route() {
    const m = location.hash.match(/^#\/post\/(.+)$/);
    if (m) openPost(decodeURIComponent(m[1]));
    else closeReader();
  }

  // listeners — bound once
  if (!list.dataset.wired) {
    list.dataset.wired = "1";
    document.getElementById("readerBack")?.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState("", document.title, location.pathname + location.search + "#blog");
      closeReader();
      document.getElementById("blog")?.scrollIntoView({ block: "start" });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && reader.classList.contains("open")) location.hash = "#blog";
    });
    window.addEventListener("hashchange", route);
  }

  window.__renderBlog = async function () {
    try {
      const idx = await postsIndex();
      const loaded = await Promise.all(
        (idx.items || []).map(async (id) => {
          const txt = await postText(id);
          if (txt == null) return null;
          const { meta, body } = parseFM(txt);
          return { slug: id, meta, body, readTime: readTime(body) };
        })
      );
      POSTS = loaded.filter(Boolean).sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));
    } catch (e) {
      POSTS = [];
    }
    renderList();
    route();
  };
})();
