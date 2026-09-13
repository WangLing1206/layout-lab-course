/* ==========================================================================
   demo-patterns.js — 第 2 章演示 / Chapter 2 demos
   ========================================================================== */
(function () {
  "use strict";
  const { register } = window.Lab;
  const t = (k, vars) => window.Lang.t(k, vars);

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
        `/* ${t("c.measure.lead")} */
.prose {
  max-width: ${w}px;        /* ${t("c.measure.width", { han, latin })} */
  margin-inline: auto;     /* ${t("c.measure.center")} */
}

.prose p {
  font-size: ${FS}px;
  line-height: 1.7;        /* ${t("c.measure.lh")} */
}
/* ${inRange
          ? t("c.measure.ok")
          : latin < 45
            ? t("c.measure.short")
            : t("c.measure.long")} */`,
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
        : `/* ${t("c.pattern.allRegions")} */`;

      out.innerHTML =
        `<b>${LABEL[pattern]}</b> · ${t("ui.impl")}: <b>${impl}</b>` +
        ` · ${t("ui.domOrder")}: <b>main → nav → aside</b>`;

      const gridCode = `/* ${t("c.pattern.gridHead")} */
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
/* ${t("c.pattern.bleed")} */
${pattern === "holy" ? `/* ${t("c.pattern.holy")} */` : ""}`;

      const flexCode = `/* ${t("c.pattern.flexHead")} */
.body { display: flex; gap: 8px; }

.body > .nav   { order: 1; flex: 0 0 140px; }
.body > .main  { order: 2; flex: 1 1 0; min-width: 0; }
.body > .aside { order: 3; flex: 0 0 140px; }

/* ${t("c.pattern.order")} */

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
