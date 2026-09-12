/* ==========================================================================
   demo-patterns.js — 第 2 章演示 / Chapter 2 demos
   ========================================================================== */
(function () {
  "use strict";
  const { register } = window.Lab;
  const t = (k) => window.Lang.t(k);

  /* ======================================================================
     2.1 单栏与行宽 / Single column & measure
     ====================================================================== */
  register("measure", (root, api) => {
    const stage = api.$("#dv-measure");
    const out = api.$("#dv-measure-out");
    const FS = 17; // 正文 17px

    const paint = () => {
      const w = parseFloat(api.value("width"));
      const usable = Math.max(0, w - 24); // 减去左右内边距
      const han = Math.round(usable / FS);
      const latin = Math.round(usable / (FS * 0.5));
      const inRange = latin >= 45 && latin <= 75;

      out.innerHTML =
        `${t("ui.han")} <b>${han}</b> ${t("ui.perLine")}` +
        ` · ${t("ui.latin")} <b>${latin}</b>` +
        ` · <b style="color:${inRange ? "var(--ok)" : "var(--warn)"}">` +
        `${inRange ? t("ui.inRange") : t("ui.outRange")}</b>`;

      api.code(
        "#code-measure",
        `/* 容器宽度 → 行宽 → 阅读体验 */
.prose {
  max-width: ${w}px;        /* 当前约 ${han} 个汉字 / ${latin} 个西文字符一行 */
  margin-inline: auto;     /* 单栏布局的关键：容器居中，而不是文字居中 */
}

.prose p {
  font-size: ${FS}px;
  line-height: 1.7;        /* 中文行高通常取 1.7–1.8，比英文更松一点 */
}
/* ${inRange
          ? "✓ 落在 45–75 字符的可读区间内：眼睛回扫距离舒适，不容易跳行"
          : latin < 45
            ? "✗ 行太短：换行过于频繁，节奏被打断，句子读起来一顿一顿"
            : "✗ 行太长：回扫距离变长，容易读到下一行或丢行"} */`,
        "css"
      );
    };

    api.on("lab:ready", paint);
    api.on("lab:change", paint);
    window.Lang.onChange(paint);
  });

  /* ======================================================================
     2.2 经典布局模式 / Classic layout patterns
     ====================================================================== */
  register("pattern", (root, api) => {
    const stage = api.$("#dv-pattern");
    const out = api.$("#dv-pattern-out");
    const codeEl = api.$("#code-pattern");

    /* 每种模式对应的 Grid 声明 */
    const GRID = {
      single: { cols: "minmax(0, 1fr)", areas: '"main"', hide: ["nav", "aside"] },
      "two-right": {
        cols: "minmax(0, 1fr) minmax(0, 190px)",
        areas: '"main right"',
        hide: ["nav"],
      },
      "two-left": {
        cols: "minmax(0, 180px) minmax(0, 1fr)",
        areas: '"left main"',
        hide: ["aside"],
      },
      three: {
        cols: "minmax(0, 140px) minmax(0, 1fr) minmax(0, 140px)",
        areas: '"left main right"',
        hide: [],
      },
      holy: {
        cols: "minmax(0, 140px) minmax(0, 1fr) minmax(0, 140px)",
        areas: '"left main right"',
        hide: [],
      },
    };

    const LABEL = {
      single: "1 column",
      "two-right": "2 columns (aside right)",
      "two-left": "2 columns (nav left)",
      three: "3 columns",
      holy: "Holy grail (3 columns + full-width header/footer)",
    };

    const paint = () => {
      const pattern = api.value("pattern");
      const impl = api.value("impl");
      const g = GRID[pattern];

      stage.dataset.pattern = pattern;
      stage.dataset.impl = impl;

      const hidden = g.hide.length
        ? g.hide.map((h) => `.body > .${h}`).join(", ") + " { display: none; }"
        : "/* 三个区域全部参与排布 */";

      out.innerHTML =
        `<b>${LABEL[pattern]}</b> · ${t("ui.impl")}: <b>${impl}</b>` +
        ` · ${t("ui.domOrder")}: <b>main → nav → aside</b>`;

      const gridCode = `/* ---- Grid：二维摆放，视觉顺序与 DOM 顺序解耦 ---- */
.page { display: grid; gap: 8px; }

.body {
  display: grid;
  gap: 8px;
  grid-template-columns: ${g.cols};
  grid-template-areas: ${g.areas};
}

.body > .main  { grid-area: main; }
.body > .nav   { grid-area: left; }
.body > .aside { grid-area: right; }

${hidden}
/* 页面通栏的页头/页脚只需要「不在 .body 里」，天生的满宽 */
${pattern === "holy" ? "/* 圣杯布局的本质：三栏 + 通栏头尾 + 主内容在 DOM 里排最前 */" : ""}`;

      const flexCode = `/* ---- Flex：一维排布，用 order 调整视觉顺序 ---- */
.body { display: flex; gap: 8px; }

.body > .nav   { order: 1; flex: 0 0 140px; }
.body > .main  { order: 2; flex: 1 1 0; min-width: 0; }
.body > .aside { order: 3; flex: 0 0 140px; }

/* ⚠️ order 只改变「看上去」的顺序，键盘 Tab 与屏幕阅读器仍按 DOM 走。
   视觉顺序与 DOM 顺序不一致时，键盘用户会遇到焦点乱跳 —— 这是无障碍的常见坑。 */

${hidden}`;

      api.code(codeEl, impl === "flex" ? flexCode : gridCode, "css");
    };

    api.on("lab:ready", paint);
    api.on("lab:seg", paint);
    window.Lang.onChange(paint);
  });

  /* ======================================================================
     2.3 F 形与 Z 形浏览模式 / Reading patterns
     ====================================================================== */
  register("fz", (root, api) => {
    const stage = api.$("#dv-fz");
    const legend = api.$("#dv-fz-legend");

    const lines = {
      f: api.$(".js-line-f"),
      z: api.$(".js-line-z"),
    };

    // 每条折线按实际长度设置虚线，动画才能「一笔画完」
    Object.values(lines).forEach((line) => {
      if (!line || !line.getTotalLength) return;
      const len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
    });

    const play = () => {
      const eye = api.value("eye");
      Object.entries(lines).forEach(([key, line]) => {
        if (!line) return;
        line.getAnimations().forEach((a) => a.cancel());
        if (key === eye) {
          const len = line.getTotalLength();
          line.style.strokeDasharray = len;
          line.style.strokeDashoffset = len;
          line.animate(
            [
              { strokeDashoffset: len, opacity: 1 },
              { strokeDashoffset: 0, opacity: 1, offset: 0.92 },
              { strokeDashoffset: 0, opacity: 0.35 },
            ],
            { duration: 1900, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
          );
        }
      });
      if (legend) {
        legend.textContent =
          eye === "f" ? t("ui.fz.fLegend") : t("ui.fz.zLegend");
      }
    };

    const paint = () => {
      const eye = api.value("eye");
      stage.dataset.eye = eye;
      play();
    };

    api.on("lab:ready", paint);
    api.on("lab:seg", paint);
    /* 面板刚从隐藏变为可见时，重播一次扫读路径 */
    api.on("lab:show", (d) => {
      if (d.tab === "demo") paint();
    });
    const replay = api.$('[data-role="replay"]');
    if (replay) replay.addEventListener("click", play);
    window.Lang.onChange(paint);
  });
})();
