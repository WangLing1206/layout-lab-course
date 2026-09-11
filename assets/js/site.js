/* ==========================================================================
   site.js — 站点行为 / Site behaviour
   --------------------------------------------------------------------------
   顶栏、目录高亮、阅读进度、主题、语言开关、iframe 语言同步、自测清单。
   ========================================================================== */
(function () {
  "use strict";

  const $ = window.Lab.$;
  const $$ = window.Lab.$$;

  /* ======================================================================
     主题 / Theme
     ====================================================================== */
  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem("layoutlab.theme");
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    root.dataset.theme = theme;

    $$("[data-theme-toggle]").forEach((btn) => {
      const paint = () => {
        const dark = root.dataset.theme === "dark";
        btn.textContent = dark ? "☀" : "☾";
        btn.setAttribute("aria-label", dark ? "Switch to light theme" : "切换为暗色主题");
      };
      paint();
      btn.addEventListener("click", () => {
        root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
        localStorage.setItem("layoutlab.theme", root.dataset.theme);
        paint();
      });
    });
  }

  /* ======================================================================
     阅读进度 / Reading progress
     ====================================================================== */
  function initProgress() {
    const bar = $(".progress__bar");
    if (!bar) return;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0;
      bar.style.width = pct + "%";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ======================================================================
     目录高亮 / TOC scroll spy
     ====================================================================== */
  function initToc() {
    const links = $$('.toc__link[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;

    const map = new Map();
    links.forEach((a) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) map.set(target, a);
    });

    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        if (!visible.size) return;
        // 取当前可见章节中最靠上的一个
        const first = Array.from(visible).sort(
          (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
        )[0];
        links.forEach((a) => a.classList.remove("is-active"));
        const active = map.get(first);
        if (active) active.classList.add("is-active");
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    map.forEach((_a, section) => observer.observe(section));
  }

  /* ======================================================================
     回到顶部 / Back to top
     ====================================================================== */
  function initToTop() {
    const btn = $(".totop");
    if (!btn) return;
    const update = () => btn.classList.toggle("is-visible", window.scrollY > 600);
    update();
    window.addEventListener("scroll", update, { passive: true });
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ======================================================================
     iframe 语言同步 / Keep embedded frames in the same language
     ====================================================================== */
  function initFrames() {
    $$("iframe[data-frame]").forEach((frame) => {
      const paint = () => {
        const lang = window.Lang.current;
        const base = frame.dataset.frame;
        const extra = frame.dataset.frameQuery ? "&" + frame.dataset.frameQuery : "";
        const src = `${base}?lang=${lang}${extra}`;
        if (frame.getAttribute("src") !== src) frame.setAttribute("src", src);
      };
      frame.__paint = paint; // 供演示脚本改参数后立即刷新
      paint();
      window.Lang.onChange(paint);
    });
  }

  /* ======================================================================
     自测清单（本地记忆）/ Checklist with local persistence
     ====================================================================== */
  function initChecklist() {
    const boxes = $$('.checklist input[type="checkbox"]');
    boxes.forEach((box, i) => {
      if (!box.id) box.id = "check-" + i;
      const key = "layoutlab.check." + location.pathname + "." + box.id;
      box.checked = localStorage.getItem(key) === "1";
      box.addEventListener("change", () => {
        localStorage.setItem(key, box.checked ? "1" : "0");
      });
    });
  }

  /* ======================================================================
     启动 / Boot
     ====================================================================== */
  function boot() {
    initTheme();
    window.Lang.init();          // 先翻译，避免语言闪烁
    window.Lab.initDemos();      // 再初始化演示（演示里的动态文案依赖当前语言）
    window.Lab.highlight(document);
    initProgress();
    initToc();
    initToTop();
    initFrames();
    initChecklist();

    // 语言切换后：重跑演示初始化中依赖文案的部分
    window.Lang.onChange(() => {
      window.Lab.highlight(document);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
