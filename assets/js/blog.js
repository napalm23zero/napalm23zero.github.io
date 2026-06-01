/* ============================================================
   Blog engine — renders Markdown posts from /content/posts.
   To publish a post:
     1) create content/posts/<id>.md  (front-matter below)
     2) add "<id>" to the "items" array in content/posts/index.json
   Front-matter:
     ---
     title: My title
     date: 2026-05-01
     category: Engineering
     excerpt: One-line summary shown on the card.
     cover: assets/img/my-cover.jpg   # optional
     ---
   Posts are sorted by date (newest first).
   ============================================================ */
(function () {
  const list = document.getElementById("blogList");
  const reader = document.getElementById("reader");
  const readerDoc = document.getElementById("readerDoc");
  if (!list) return;

  const fmtDate = (s) => {
    const d = new Date(s);
    if (isNaN(d)) return s || "";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

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
    return { meta, body };
  }

  const readingTime = (body) => Math.max(1, Math.round(body.trim().split(/\s+/).length / 200)) + " min read";
  const coverHTML = (p) => (p.meta.cover ? `<img src="${p.meta.cover}" alt="" loading="lazy">` : `<div class="ph-img" data-label="post cover"></div>`);

  let POSTS = [];

  function featCard(p) {
    const a = document.createElement("a");
    a.className = "feat reveal";
    a.href = "#/post/" + p.slug;
    a.innerHTML = `
      <div class="feat__cover">${coverHTML(p)}</div>
      <div class="feat__body">
        <span class="feat__cat">${p.meta.category || "Notes"}</span>
        <h3 class="feat__title">${p.meta.title || p.slug}</h3>
        <p class="feat__excerpt">${p.meta.excerpt || ""}</p>
        <div class="feat__meta"><span>${fmtDate(p.meta.date)}</span><span>${p.readTime}</span><span>Read post &rarr;</span></div>
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
        <span class="prow__cat">${p.meta.category || "Notes"}</span>
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
      <div class="post__cover">${coverHTML(p)}<span class="post__cat">${p.meta.category || "Notes"}</span></div>
      <div class="post__body">
        <div class="post__meta"><span>${fmtDate(p.meta.date)}</span><span>${p.readTime}</span></div>
        <h3 class="post__title">${p.meta.title || p.slug}</h3>
        <p class="post__excerpt">${p.meta.excerpt || ""}</p>
        <span class="post__more">Read post <i class="ph ph-arrow-right"></i></span>
      </div>`;
    return a;
  }

  function renderList() {
    list.innerHTML = "";
    if (!POSTS.length) {
      list.innerHTML = `<div class="blog__empty">No posts yet. Add a <b>.md</b> to <b>content/posts</b> and list its id in <b>content/posts/index.json</b>.</div>`;
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
      <span class="post__cat" style="position:static;display:inline-block;margin-bottom:18px">${p.meta.category || "Notes"}</span>
      <h1>${p.meta.title || p.slug}</h1>
      <div class="meta"><span>${fmtDate(p.meta.date)}</span><span>${p.readTime}</span><span>By Rodrigo Dantas</span></div>
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

  async function boot() {
    try {
      const idx = await (await fetch("content/posts/index.json", { cache: "no-store" })).json();
      const files = idx.items || [];
      const loaded = await Promise.all(
        files.map(async (id) => {
          try {
            const r = await fetch("content/posts/" + id + ".md", { cache: "no-store" });
            if (!r.ok) return null;
            const { meta, body } = parseFM(await r.text());
            return { slug: id, meta, body, readTime: readingTime(body) };
          } catch {
            return null;
          }
        })
      );
      POSTS = loaded.filter(Boolean).sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));
    } catch (e) {
      POSTS = [];
    }
    renderList();
    route();
  }

  boot();
})();
