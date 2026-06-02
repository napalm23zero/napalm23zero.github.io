/* ============================================================
   Site chrome & interactions.
   Content is injected by content.js / blog.js after load, so the
   content-dependent wiring lives in window.__wireSite(), which is
   safe to call repeatedly (guarded with dataset flags).
   ============================================================ */

/* ---------- Sticky nav + scroll progress (static) ---------- */
(function () {
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav?.classList.toggle("is-stuck", window.scrollY > 24);
    const prog = document.getElementById("progress");
    if (prog) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---------- Reveal-on-scroll observer (shared) ---------- */
(function () {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  window.__observeReveals = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
  window.__observeReveals();
})();

/* ---------- Content-dependent wiring (idempotent) ---------- */
window.__wireSite = function () {
  // Mobile menu
  const menu = document.getElementById("mobileMenu");
  const burger = document.getElementById("burger");
  if (menu && burger && !burger.dataset.wired) {
    burger.dataset.wired = "1";
    burger.addEventListener("click", () => menu.classList.add("open"));
    document.getElementById("menuClose")?.addEventListener("click", () => menu.classList.remove("open"));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
  }

  // resume tabs (container is static; panels arrive dynamically)
  const tabs = document.getElementById("resumeTabs");
  if (tabs && !tabs.dataset.wired) {
    tabs.dataset.wired = "1";
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      tabs.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tabpanel").forEach((p) => p.classList.toggle("active", p.dataset.panel === btn.dataset.tab));
    });
  }

  // Smooth anchor scrolling (delegated, bound once)
  if (!document.body.dataset.anchorsWired) {
    document.body.dataset.anchorsWired = "1";
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]:not([href="#"])');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id.startsWith("#/")) return; // blog routes
      const t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // Animated <details> for the timeline
  document.querySelectorAll(".tl-item:not([data-wired])").forEach((d) => {
    d.dataset.wired = "1";
    const body = d.querySelector(".tl-body");
    if (!body) return;
    const setMax = () => {
      body.style.maxHeight = d.open ? body.scrollHeight + "px" : "0px";
    };
    body.style.transition = "max-height .45s cubic-bezier(.22,1,.36,1), opacity .35s";
    body.style.opacity = d.open ? "1" : "0";
    setMax();
    d.querySelector("summary")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (!d.open) {
        d.open = true;
        requestAnimationFrame(() => {
          body.style.opacity = "1";
          setMax();
        });
      } else {
        body.style.maxHeight = body.scrollHeight + "px";
        requestAnimationFrame(() => {
          body.style.maxHeight = "0px";
          body.style.opacity = "0";
        });
        setTimeout(() => {
          d.open = false;
        }, 450);
      }
    });
  });

  // Language meters fill when visible
  const meterWrap = document.querySelector("#education .lang");
  if (meterWrap && !meterWrap.dataset.wired) {
    meterWrap.dataset.wired = "1";
    const mio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            meterWrap.querySelectorAll(".lang__meter i").forEach((bar) => {
              bar.style.width = (bar.dataset.w || 0) + "%";
            });
            mio.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    mio.observe(meterWrap);
  }
};

/* ---------- Media modal (video / certificate) ---------- */
(function () {
  const modal = document.getElementById("modal");
  const frame = document.getElementById("modalFrame");
  const cap = document.getElementById("modalCap");
  if (!modal) return;

  window.openModal = function ({ html, imgSrc, title, sub, isImage, panel }) {
    frame.classList.toggle("is-panel", !!panel);
    if (panel) {
      frame.classList.remove("modal__img");
      frame.innerHTML = panel;
    } else if (isImage) {
      frame.classList.add("modal__img");
      frame.innerHTML = `<img src="${imgSrc}" alt="${title || ""}">`;
    } else {
      frame.classList.remove("modal__img");
      frame.innerHTML = html || (imgSrc ? `<img src="${imgSrc}" alt="">` : "");
    }
    cap.innerHTML = !panel && title ? `<h4>${title}</h4>${sub ? `<span>${sub}</span>` : ""}` : "";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  window.closeModal = function () {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
      frame.innerHTML = "";
    }, 350);
  };

  document.getElementById("modalClose")?.addEventListener("click", window.closeModal);
  modal.querySelector("[data-close]")?.addEventListener("click", window.closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) window.closeModal();
  });
})();

/* ---------- GitHub repos (live) ---------- */
(function () {
  const wrap = document.getElementById("repos");
  if (!wrap) return;
  const USER = wrap.dataset.user || "napalm23zero";

  for (let i = 0; i < 6; i++) {
    const s = document.createElement("div");
    s.className = "repo gh__skel";
    s.innerHTML = `<div class="repo__top"><i class="ph ph-git-fork"></i><span class="name">loading repository</span></div><div class="repo__desc">fetching latest public repositories from GitHub…</div><div class="repo__meta"><span><span class="repo__dot"></span>—</span></div>`;
    wrap.appendChild(s);
  }

  fetch(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`)
    .then((r) => {
      if (!r.ok) throw new Error("gh");
      return r.json();
    })
    .then((repos) => {
      const repoList = repos
        .filter((r) => !r.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 6);
      wrap.innerHTML = "";
      if (!repoList.length) {
        wrap.innerHTML = `<div class="blog__empty">No public repositories yet — they'll appear here automatically.</div>`;
        return;
      }
      repoList.forEach((r, i) => {
        const a = document.createElement("a");
        a.className = "repo reveal";
        a.href = r.html_url;
        a.target = "_blank";
        a.rel = "noopener";
        if (i % 3) a.dataset.d = String(i % 3);
        a.innerHTML = `
          <div class="repo__top"><i class="ph ph-git-fork"></i><span class="name">${r.name}</span></div>
          <div class="repo__desc">${r.description ? r.description.replace(/</g, "&lt;") : "No description provided."}</div>
          <div class="repo__meta">
            ${r.language ? `<span><span class="repo__dot"></span>${r.language}</span>` : ""}
            <span><i class="ph ph-star"></i>${r.stargazers_count}</span>
            <span><i class="ph ph-git-fork"></i>${r.forks_count}</span>
          </div>`;
        wrap.appendChild(a);
      });
      if (window.__observeReveals) window.__observeReveals();
    })
    .catch(() => {
      wrap.innerHTML = `<a class="repo" href="https://github.com/${USER}" target="_blank" rel="noopener"><div class="repo__top"><i class="ph ph-github-logo"></i><span class="name">@${USER}</span></div><div class="repo__desc">Couldn't load the live feed right now. Click to open my GitHub profile directly.</div><div class="repo__meta"><span>github.com/${USER}</span></div></a>`;
    });
})();
