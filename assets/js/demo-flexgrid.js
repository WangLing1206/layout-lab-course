/* ==========================================================================
   demo-flexgrid.js — 第 3 章演示 / Chapter 3 demos
   ========================================================================== */
(function () {
  "use strict";
  const { register } = window.Lab;
  const t = (k, vars) => window.Lang.t(k, vars);

  /* ======================================================================
     3.1 Flexbox 试验台 / Flexbox playground
     ====================================================================== */
  register("flex", (root, api) => {
    const box = api.$("#dv-flex");
    const out = api.$("#dv-flex-out");
    const grow = [false, false, false, false, false];
    let count = 4;

    const build = () => {
      box.textContent = "";
      for (let i = 0; i < count; i++) {
        const item = document.createElement("div");
        item.className = "fxbox__item" + (i === 1 ? " fxbox__item--tall" : "");
        item.textContent = String(i + 1);
        item.style.flexGrow = grow[i] ? "1" : "0";
        item.style.flexBasis = grow[i] ? "0%" : "auto";
        box.appendChild(item);
      }
      /* 只显示与当前项目数量对应的 flex-grow 复选项 */
      api.$$(".chip").forEach((chip, i) => {
        chip.style.display = i < count ? "" : "none";
      });
    };

    const paint = () => {
      const dir = api.value("dir");
      const wrap = api.value("wrap");
      const justify = api.value("justify");
      const align = api.value("align");
      const content = api.value("content");
      const gap = parseFloat(api.value("gap"));
      const height = parseFloat(api.value("height"));
      const axes = api.value("axes");

      box.style.display = "flex";
      box.style.flexDirection = dir;
      box.style.flexWrap = wrap;
      box.style.justifyContent = justify;
      box.style.alignItems = align;
      box.style.alignContent = content;
      box.style.minHeight = height === 0 ? "auto" : height + "px";

      const wrapEl = api.$(".fxwrap");
      wrapEl.dataset.axes = axes ? "on" : "off";
      // 主轴方向随 flex-direction 改变，指示标签也要跟着换位置
      const cross = api.$(".axis__cross");
      const main = api.$(".axis__main");
      const vertical = dir.startsWith("column");
      cross.textContent = vertical ? t("ui.fx.mainAxis") : t("ui.fx.crossAxis");
      main.textContent = vertical ? t("ui.fx.crossAxis") : t("ui.fx.mainAxis");

      const grown = grow.slice(0, count).filter(Boolean).length;
      out.innerHTML =
        `flex-direction: <b>${dir}</b> · flex-wrap: <b>${wrap}</b>` +
        ` · gap: <b>${gap}px</b> · ${t("ui.fx.grown")}: <b>${grown}</b>`;

      api.code(
        "#code-flex",
        `/* ${t("c.flex.lead")} */
.box {
  display: flex;
  flex-direction: ${dir};      /* ${t("c.flex.dir", { v: vertical ? t("c.flex.vertical") : t("c.flex.horizontal") })} */
  flex-wrap: ${wrap};          /* ${wrap === "nowrap" ? t("c.flex.nowrap") : t("c.flex.wrapYes")} */
  justify-content: ${justify};  /* ${t("c.flex.justify")} */
  align-items: ${align};        /* ${t("c.flex.align")} */
  align-content: ${content};    /* ${wrap === "nowrap" ? t("c.flex.contentOff") : t("c.flex.contentOn")} */
  gap: ${gap}px;                 /* ${t("c.flex.gap")} */
  min-height: ${height === 0 ? "auto" : height + "px"};
}

${grow.slice(0, count).map((g, i) => g ? `.item-${i + 1} { flex: 1 1 0; }` : null).filter(Boolean).join("\n") || `/* ${t("c.flex.noneGrown")} */`}

/* ${t("c.flex.memo")} */`,
        "css"
      );
    };

    api.on("lab:ready", () => {
      build();
      paint();
    });
    api.on("lab:seg", (d) => {
      if (d.name === "count") {
        count = parseInt(d.value, 10);
        build();
      }
      paint();
    });
    api.on("lab:change", paint);
    api.on("lab:toggle", paint);

    api.$$(".chip input").forEach((input, i) => {
      input.addEventListener("change", () => {
        grow[i] = input.checked;
        build();
        paint();
      });
    });

    window.Lang.onChange(paint);
  });

  /* ======================================================================
     3.2 Grid 试验台 / Grid playground
     ====================================================================== */
  register("grid", (root, api) => {
    const box = api.$("#dv-gx");
    const out = api.$("#dv-gx-out");

    const COLS = {
      r3: "repeat(3, minmax(0, 1fr))",
      f12: "1fr 2fr 1fr",
      side: "200px minmax(0, 1fr)",
      auto: "repeat(auto-fill, minmax(140px, 1fr))",
    };
    const ROWS = { auto: "auto", r2: "repeat(2, minmax(0, 1fr))" };

    const build = () => {
      const n = parseInt(api.value("count"), 10);
      box.textContent = "";
      for (let i = 0; i < n; i++) {
        const item = document.createElement("div");
        item.className = "gxbox__item";
        item.textContent = String(i + 1);
        box.appendChild(item);
      }
    };

    const paint = () => {
      const cols = api.value("cols");
      const rows = api.value("rows");
      const gap = parseFloat(api.value("gap"));
      const justify = api.value("justify");
      const align = api.value("align");

      box.style.gridTemplateColumns = COLS[cols];
      box.style.gridTemplateRows = ROWS[rows];
      box.style.gap = gap + "px";
      box.style.justifyItems = justify;
      box.style.alignItems = align;

      out.innerHTML =
        `grid-template-columns: <b>${COLS[cols]}</b>` +
        ` · gap: <b>${gap}px</b> · items: <b>${box.children.length}</b>`;

      api.code(
        "#code-grid",
        `/* ${t("c.gx.lead")} */
.grid {
  display: grid;
  grid-template-columns: ${COLS[cols]};
  grid-template-rows: ${ROWS[rows]};
  gap: ${gap}px ${gap}px;              /* ${t("c.gx.gap")} */
  justify-items: ${justify};        /* ${t("c.gx.justify")} */
  align-items: ${align};          /* ${t("c.gx.align")} */
}

${cols === "auto"
  ? `/* ${t("c.gx.auto")} */`
  : cols === "side"
    ? `/* ${t("c.gx.side")} */`
    : `/* ${t("c.gx.fr")} */`}

/* ${t("c.gx.explicit")}
   .item-featured { grid-column: 1 / 3; grid-row: 1; }   /* ${t("c.gx.span2")} */`,
        "css"
      );
    };

    api.on("lab:ready", () => {
      build();
      paint();
    });
    api.on("lab:seg", (d) => {
      if (d.name === "count") build();
      paint();
    });
    api.on("lab:change", paint);
    window.Lang.onChange(paint);
  });

  /* ======================================================================
     3.3 grid-template-areas 画笔 / Area painter
     ====================================================================== */
  register("areas", (root, api) => {
    const board = api.$("#dv-areas-board");
    const preview = api.$("#dv-areas-preview");
    const status = api.$("#dv-areas-status");
    const cells = new Array(9).fill(".");

    const boardCells = [];
    for (let i = 0; i < 9; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "painter__cell";
      btn.dataset.region = ".";
      btn.setAttribute("aria-label", "cell " + (i + 1));
      btn.addEventListener("click", () => {
        cells[i] = api.value("brush");
        paint();
      });
      board.appendChild(btn);
      boardCells.push(btn);
    }

    const rowsOf = () => [0, 1, 2].map((r) => cells.slice(r * 3, r * 3 + 3));

    /* 校验：CSS 规定同名区域必须构成矩形，否则整条声明作废 */
    const invalidRegions = () => {
      const rs = rowsOf();
      const used = [...new Set(cells.filter((c) => c !== "."))];
      return used.filter((name) => {
        const pts = [];
        rs.forEach((row, y) =>
          row.forEach((c, x) => {
            if (c === name) pts.push([x, y]);
          })
        );
        const xs = pts.map((p) => p[0]);
        const ys = pts.map((p) => p[1]);
        const area =
          (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1);
        return area !== pts.length; // 包围盒里有空格或混入别的区域 → 不是矩形
      });
    };

    const paint = () => {
      const brush = api.value("brush");
      boardCells.forEach((btn, i) => {
        btn.dataset.region = cells[i];
        btn.textContent = cells[i] === "." ? "·" : cells[i];
      });

      const rs = rowsOf();
      const bad = invalidRegions();
      const used = [...new Set(cells.filter((c) => c !== "."))];
      const areasValue = rs.map((r) => `"${r.join(" ")}"`).join(" ");

      // 把生成的声明真正写到预览容器上：CSS 会自己做同样的合法性判断
      preview.style.gridTemplateAreas = areasValue;

      api.$$("[data-region]", preview).forEach((el) => {
        el.style.display = used.includes(el.dataset.region) ? "" : "none";
      });
      const empty = api.$(".painter__empty", preview);
      if (empty) empty.style.display = used.length ? "none" : "";

      status.className = "status " + (bad.length ? "status--bad" : "status--ok");
      status.textContent = !used.length
        ? t("ui.area.empty")
        : bad.length
          ? `✗ ${t("ui.area.invalid")}: ${bad.join(", ")}`
          : `✓ ${t("ui.area.valid")}`;

      api.code(
        "#code-areas",
        `.page {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-areas:
    ${rs.map((r) => `"${r.join(" ")}"`).join("\n    ")};
}

/* ${t("c.area.claim")} */
${used.map((name) => `.${name === "a" ? "header" : name === "b" ? "content" : "aside"} { grid-area: ${name}; }`).join("\n") || `/* ${t("c.area.none")} */`}

/* ${bad.length
          ? t("c.area.bad", { names: bad.join(", ") })
          : t("c.area.good")} */`,
        "css"
      );
    };

    api.on("lab:ready", paint);
    api.on("lab:seg", paint);
    window.Lang.onChange(paint);

    // 清空
    const clear = api.$('[data-role="clear"]');
    if (clear)
      clear.addEventListener("click", () => {
        cells.fill(".");
        paint();
      });
  });

  /* ======================================================================
     3.4 选型决策 / Choosing between flex and grid
     ====================================================================== */
  register("decide", (root, api) => {
    const verdict = api.$("#dv-decide-verdict");
    const panels = api.$$("[data-engine]");

    const paint = () => {
      const dim = api.value("dim");
      const drive = api.value("drive");
      const cross = api.value("cross");

      let pick;
      let why;
      if (dim === "2d") {
        pick = "grid";
        why = "ui.decide.why2d";
      } else if (cross === "need") {
        pick = "grid";
        why = "ui.decide.whyCross";
      } else if (drive === "content") {
        pick = "flex";
        why = "ui.decide.whyContent";
      } else {
        pick = "grid";
        why = "ui.decide.whyLayout";
      }

      panels.forEach((p) => p.classList.toggle("is-pick", p.dataset.engine === pick));

      const engine = pick === "grid" ? "Grid" : "Flexbox";
      verdict.innerHTML = `<h5>→ ${engine}</h5><p>${t(why)}</p>`;
    };

    api.on("lab:ready", paint);
    api.on("lab:seg", paint);
    window.Lang.onChange(paint);
  });
})();
