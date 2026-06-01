/* ============================================================
   i18n core — language detection, persistence and switching.
   Content is locale-aware: every Markdown file has a per-language
   sibling (<base>.<lang>.md) and a shared manifest. UI labels live
   in content/ui/<lang>.json. Missing keys/files fall back to EN.
   ============================================================ */
(function () {
  const LANGS = ["pt", "en", "es"];
  const DEFAULT = "en";
  const LOCALE = { pt: "pt-BR", en: "en-US", es: "es-ES" };
  const LABEL = { pt: "PT", en: "EN", es: "ES" };

  function detect() {
    try {
      const s = localStorage.getItem("lang");
      if (s && LANGS.includes(s)) return s;
    } catch (e) {}
    const u = new URLSearchParams(location.search).get("lang");
    if (u && LANGS.includes(u)) return u;
    const n = (navigator.language || "").slice(0, 2).toLowerCase();
    if (LANGS.includes(n)) return n;
    return DEFAULT;
  }

  async function getJSON(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error("404 " + path);
    return r.json();
  }

  window.I18N = {
    langs: LANGS,
    default: DEFAULT,
    label: LABEL,
    lang: detect(),
    ui: {},
    locale() {
      return LOCALE[this.lang] || "en-US";
    },
    t(key) {
      return key in this.ui ? this.ui[key] : key;
    },
    async loadUI() {
      const base = await getJSON(`content/${DEFAULT}/ui.json`).catch(() => ({}));
      const cur = this.lang === DEFAULT ? base : await getJSON(`content/${this.lang}/ui.json`).catch(() => ({}));
      this.ui = Object.assign({}, base, cur); // missing keys fall back to EN
    },
    async setLang(l) {
      if (!LANGS.includes(l) || l === this.lang) return;
      this.lang = l;
      try {
        localStorage.setItem("lang", l);
      } catch (e) {}
      document.documentElement.lang = l;
      if (window.__renderAll) await window.__renderAll();
    },
  };

  document.documentElement.lang = window.I18N.lang;
})();
