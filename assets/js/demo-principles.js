/* ==========================================================================
   demo-principles.js — 第 1 章演示 / Chapter 1 demos
   --------------------------------------------------------------------------
   每个演示只做三件事：
     1. 读控件值   2. 把值写到舞台元素上（class / CSS 变量）
     3. 把等价的 CSS 打印到「实时输出」代码块里
   ========================================================================== */
(function () {
  "use strict";
  const { register } = window.Lab;
  const t = (k, vars) => window.Lang.t(k, vars);

  /* ======================================================================
     1.1 对齐 / Alignment
     ====================================================================== */
  register("align", (root, api) => {
    const box = api.$("#dv-align");
    const out = api.$("#dv-align-out");

    const ITEMS = {
      start: "flex-start",
      center: "center",
      baseline: "baseline",
      stretch: "stretch",
    };
    const TEXT = { left: "left", center: "center", right: "right" };

    const paint = () => {
      const text = api.value("text");
      const items = api.value("items");
      const aligned = api.value("aligned");
      const guides = [
        api.value("gcols") ? "cols" : "",
        api.value("gbase") ? "base" : "",
      ]
        .filter(Boolean)
        .join(" ");

      box.dataset.text = text;
      box.dataset.items = items;
      box.dataset.align = aligned ? "on" : "off";
      box.dataset.guides = guides;

      out.innerHTML =
        `align-items: <b>${ITEMS[items]}</b>` +
        ` · text-align: <b>${TEXT[text]}</b>` +
        ` · ${aligned ? "✓" : "✗"} ${t("ui.aligned")}` +
        ` · guides: <b>${guides || "off"}</b>`;

      api.code(
        "#code-align",
        `/* ${t("c.align.lead")} */
.post-header {
  display: flex;
  align-items: ${aligned ? ITEMS[items] : "flex-start"};
  gap: ${aligned ? "12px" : "11px"};          /* ${t("c.align.gap")} */
}

.post-title { text-align: ${TEXT[text]}; }   /* ${t("c.align.text")} */

.post-tag   { margin-left: auto; }   /* ${t("c.align.auto")} */

/* ${t("c.align.switch", {
          state: aligned ? t("c.align.on") : t("c.align.off"),
        })} */`,
        "css"
      );
    };

    api.on("lab:ready", paint);
    ["lab:seg", "lab:toggle"].forEach((ev) => api.on(ev, paint));
    window.Lang.onChange(paint);
  });

  /* ======================================================================
     1.2 留白 / Whitespace
     ====================================================================== */
  register("space", (root, api) => {
    const stage = api.$("#dv-space");
    const out = api.$("#dv-space-out");

    const paint = () => {
      const v = parseFloat(api.value("space"));
      const group = api.value("group");
      const paintOn = api.value("painton");

      stage.dataset.group = group ? "on" : "off";
      stage.dataset.paint = paintOn ? "on" : "off";

      const inner = group ? v : v * 1.6;
      const outer = group ? v * 1.9 : v * 1.1;
      const ratio = outer / inner;

      out.innerHTML =
        `${t("ui.inner")}: <b>${inner.toFixed(0)}px</b>` +
        ` · ${t("ui.outer")}: <b>${outer.toFixed(0)}px</b>` +
        ` · ${t("ui.ratio")}: <b>${ratio.toFixed(2)}×</b>`;

      api.code(
        "#code-space",
        `:root {
  /* ${t("c.space.lead")} */
  --space: ${v}px;
}

.card-list {
  display: grid;
  gap: calc(var(--space) * ${group ? "1.9" : "1.1"});   /* ${t("c.space.outer", { n: outer.toFixed(0) })} */
}

.card {
  padding: var(--space);                  /* ${t("c.space.pad", { n: inner.toFixed(0) })} */
  display: grid;
  gap: calc(var(--space) * ${group ? "1" : "1.6"});     /* ${t("c.space.inner", { n: inner.toFixed(0) })} */
}

/* ${group
  ? t("c.space.ok", { o: outer.toFixed(0), i: inner.toFixed(0) })
  : t("c.space.bad", { o: outer.toFixed(0), i: inner.toFixed(0) })} */`,
        "css"
      );
    };

    api.on("lab:ready", paint);
    ["lab:change", "lab:toggle"].forEach((ev) => api.on(ev, paint));
    window.Lang.onChange(paint);

    /* 预设按钮：改滑块值后手动刷新（静默同步 + 重绘） */
    api.$$("[data-space-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = api.$('[data-name="space"]');
        input.value = btn.dataset.spacePreset;
        if (input.__sync) input.__sync();
        paint();
      });
    });
  });
  register("hier", (root, api) => {
    const stage = api.$("#dv-hier");
    const out = api.$("#dv-hier-out");
    const BASE = 16;

    const paint = () => {
      const ratio = parseFloat(api.value("ratio"));
      const weight = api.value("weight");
      const mute = parseFloat(api.value("mute"));

      const title = BASE * ratio * ratio;
      const sub = BASE * ratio;
      const meta = BASE / ratio;

      const box = api.$(".hier");
      box.style.fontSize = BASE + "px";
      box.dataset.labels = api.value("labels") ? "on" : "off";
      api.$(".hier__title").style.fontSize = title.toFixed(2) + "px";
      api.$(".hier__sub").style.fontSize = sub.toFixed(2) + "px";
      api.$(".hier__body").style.fontSize = BASE + "px";
      api.$(".hier__meta").style.fontSize = meta.toFixed(2) + "px";
      api.$(".hier__title").style.fontWeight = weight;
      api.$(".hier__meta").style.opacity = mute;

      out.innerHTML =
        `${t("ui.title")} <b>${title.toFixed(0)}px</b>` +
        ` · ${t("ui.sub")} <b>${sub.toFixed(0)}px</b>` +
        ` · ${t("ui.bodySize")} <b>${BASE}px</b>` +
        ` · ${t("ui.meta")} <b>${meta.toFixed(1)}px</b>` +
        ` · ${t("ui.step")} <b>${ratio.toFixed(2)}</b>`;

      api.code(
        "#code-hier",
        `:root {
  /* ${t("c.hier.lead")} */
  --base: ${BASE}px;
  --ratio: ${ratio.toFixed(2)};

  --step-0: var(--base);                               /* ${t("c.hier.body", { n: BASE })} */
  --step-1: calc(var(--base) * ${ratio.toFixed(2)});              /* ${t("c.hier.sub", { n: sub.toFixed(1) })} */
  --step-2: calc(var(--base) * ${(ratio * ratio).toFixed(4)});          /* ${t("c.hier.title", { n: title.toFixed(1) })} */
  --step--1: calc(var(--base) / ${ratio.toFixed(2)});             /* ${t("c.hier.meta", { n: meta.toFixed(1) })} */
}

.post-title {
  font-size: var(--step-2);
  font-weight: ${weight};           /* ${t("c.hier.weight")} */
}

.post-meta {
  font-size: var(--step--1);
  color: var(--muted);
  opacity: ${mute.toFixed(2)};     /* ${t("c.hier.mute")} */
}

/* ${t("c.hier.tip", {
          t:
            ratio < 1.15
              ? t("c.hier.tip.narrow")
              : ratio > 1.45
                ? t("c.hier.tip.wide")
                : t("c.hier.tip.ok"),
        })} */`,
        "css"
      );
    };

    api.on("lab:ready", paint);
    ["lab:change", "lab:toggle"].forEach((ev) => api.on(ev, paint));
    window.Lang.onChange(paint);
  });

  /* ======================================================================
     1.4 栅格系统 / Grid system
     ====================================================================== */
  register("gridsystem", (root, api) => {
    const stage = api.$("#dv-grid");
    const out = api.$("#dv-grid-out");

    const paint = () => {
      const cols = parseInt(api.value("cols"), 10);
      const guides = api.value("guides");

      stage.dataset.guides = guides ? "on" : "off";

      /* 参考线要跟列数实时对应，所以每次都重建 */
      const guideLayer = api.$(".gridstage__guides");
      if (guideLayer && guideLayer.childElementCount !== cols) {
        guideLayer.textContent = "";
        for (let i = 0; i < cols; i++) guideLayer.appendChild(document.createElement("i"));
      }

      const wide = Math.max(1, Math.round((cols * 2) / 3));
      const narrow = Math.max(1, cols - wide);
      const card = Math.max(1, Math.floor(cols / 3));

      const set = (sel, span) => {
        api.$$(sel).forEach((el) => (el.style.gridColumn = `span ${span}`));
      };
      set(".js-span-full", cols);
      set(".js-span-wide", wide);
      set(".js-span-narrow", narrow);
      set(".js-span-card", card);

      out.innerHTML =
        `${t("ui.columns")}: <b>${cols}</b>` +
        ` · ${t("ui.main")} <b>span ${wide}</b>` +
        ` · ${t("ui.side")} <b>span ${narrow}</b>`;

      api.code(
        "#code-gridsys",
        `/* ${t("c.grid.lead")} */
.layout {
  display: grid;
  grid-template-columns: repeat(${cols}, minmax(0, 1fr));
  gap: var(--gutter);
  max-width: var(--container);
  margin-inline: auto;          /* ${t("c.grid.center")} */
}

.layout > .hero    { grid-column: span ${cols}; }   /* ${t("c.grid.full")} */
.layout > .article { grid-column: span ${wide}; }   /* ${t("c.grid.article", { a: wide, b: cols })} */
.layout > .aside   { grid-column: span ${narrow}; }   /* ${t("c.grid.aside", { a: narrow, b: cols })} */
.layout > .card    { grid-column: span ${card}; }   /* ${t("c.grid.cards", { n: cols / card >= 1 ? Math.floor(cols / card) : 1 })} */

/* ${t("c.grid.minmax")} */`,
        "css"
      );
    };

    api.on("lab:ready", paint);
    ["lab:change", "lab:toggle"].forEach((ev) => api.on(ev, paint));
    window.Lang.onChange(paint);
  });
})();
