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
  const t = (k) => window.Lang.t(k);

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
        `/* 对齐的第一层：让每个元素的边缘落在同一条线上 */
.post-header {
  display: flex;
  align-items: ${aligned ? ITEMS[items] : "flex-start"};
  gap: ${aligned ? "12px" : "11px"};          /* 间距也要成体系，别用 11px */
}

.post-title { text-align: ${TEXT[text]}; }   /* 文本对齐：段内一致即可 */

.post-tag   { margin-left: auto; }          /* 用 auto margin 推到最右，
                                               不必额外套一层容器 */

/* 演示开关：${aligned ? "已对齐（所有边缘落在同一条线上）" : "关闭对齐（出现 3–9px 的随机偏移）"} */`,
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
  /* 用一条刻度代替随手写的数值：所有间距都是它的倍数 */
  --space: ${v}px;
}

.card-list {
  display: grid;
  gap: calc(var(--space) * ${group ? "1.9" : "1.1"});   /* 组与组之间 ${outer.toFixed(0)}px */
}

.card {
  padding: var(--space);                  /* 卡片内边距 ${inner.toFixed(0)}px */
  display: grid;
  gap: calc(var(--space) * ${group ? "1" : "1.6"});     /* 卡片内部 ${inner.toFixed(0)}px */
}

${group
  ? `/* ✓ 组间 ${outer.toFixed(0)}px > 组内 ${inner.toFixed(0)}px：
     读者会自然地把卡片内部的元素看成一「组」 */`
  : `/* ✗ 组间 ${outer.toFixed(0)}px < 组内 ${inner.toFixed(0)}px：
     分不清哪些内容属于一起，视觉上糊成一片 */`}`,
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
  /* 一个比例尺推出一整套字号：改动一处，层级关系整体同步 */
  --base: ${BASE}px;
  --ratio: ${ratio.toFixed(2)};

  --step-0: var(--base);                               /* ${BASE}px   正文 */
  --step-1: calc(var(--base) * ${ratio.toFixed(2)});              /* ${sub.toFixed(1)}px  副标题 */
  --step-2: calc(var(--base) * ${(ratio * ratio).toFixed(4)});          /* ${title.toFixed(1)}px  标题 */
  --step--1: calc(var(--base) / ${ratio.toFixed(2)});             /* ${meta.toFixed(1)}px  注释 */
}

.post-title {
  font-size: var(--step-2);
  font-weight: ${weight};           /* 字号之外，字重是最省力的强调手段 */
}

.post-meta {
  font-size: var(--step--1);
  color: var(--muted);
  opacity: ${mute.toFixed(2)};     /* 降低对比度 = 主动把信息往后放 */
}

/* 提示：${ratio < 1.15
          ? "比例太接近，层次模糊，读者找不到重点"
          : ratio > 1.45
            ? "比例拉得很开，戏剧性强，但正文容易被压得过于寒酸"
            : "1.2–1.33 附近通常最稳：层次看得见，又不至于喧宾夺主"} */`,
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
        `/* 12 栅格：列数越多，可组合的版式越多（2/3/4/6 都能整除） */
.layout {
  display: grid;
  grid-template-columns: repeat(${cols}, minmax(0, 1fr));
  gap: var(--gutter);
  max-width: var(--container);
  margin-inline: auto;          /* 内容区居中 */
}

.layout > .hero    { grid-column: span ${cols}; }   /* 通栏 */
.layout > .article { grid-column: span ${wide}; }   /* 正文 ${wide}/${cols} */
.layout > .aside   { grid-column: span ${narrow}; }   /* 侧栏 ${narrow}/${cols} */
.layout > .card    { grid-column: span ${card}; }   /* 一行 ${cols / card >= 1 ? Math.floor(cols / card) : 1} 张卡片 */

/* minmax(0, 1fr) 而不是 1fr：防止长单词/长代码把列撑破 */`,
        "css"
      );
    };

    api.on("lab:ready", paint);
    ["lab:change", "lab:toggle"].forEach((ev) => api.on(ev, paint));
    window.Lang.onChange(paint);
  });
})();
