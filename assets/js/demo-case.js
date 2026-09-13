/* ==========================================================================
   demo-case.js — 第 5 章演示 / Chapter 5 demos（案例收束）
   ========================================================================== */
(function () {
  "use strict";
  const { register } = window.Lab;
  const t = (k, vars) => window.Lang.t(k, vars);

  /* ======================================================================
     5.1 线框图：删掉一个区域，版式会怎么变
     ====================================================================== */
  register("wire", (root, api) => {
    const mainRow = api.$('[data-row="main"]');
    const out = api.$("#dv-wire-out");

    const paint = () => {
      const state = {
        hero: api.value("z-hero"),
        stream: api.value("z-stream"),
        side: api.value("z-side"),
        foot: api.value("z-foot"),
      };

      api.$$("[data-zone]").forEach((el) => {
        const key = el.dataset.zone;
        if (!(key in state)) return;
        el.style.display = state[key] ? "" : "none";
      });

      let cols = "minmax(0, 1fr)";
      let label = t("ui.wire.oneCol");
      if (state.stream && state.side) {
        cols = "minmax(0, 2fr) minmax(0, 1fr)";
        label = t("ui.wire.twoCol");
      } else if (state.side && !state.stream) {
        cols = "minmax(0, 1fr)";
        label = t("ui.wire.sideOnly");
      }
      if (mainRow) mainRow.style.gridTemplateColumns = cols;

      out.innerHTML = `<b>${label}</b> · grid-template-columns: <b>${cols}</b>`;

      api.code(
        "#code-wire",
        `/* ${t("c.wire.head", { label })} */
.blog {
  display: grid;
  gap: ${state.hero || state.foot ? "32px" : "24px"};
  grid-template-columns: ${cols};
${state.hero || state.foot ? `  /* ${t("c.wire.bleed")} */\n` : ""}  max-width: 1180px;
  margin-inline: auto;
  padding-inline: 16px;
}

${state.hero ? ".hero    { grid-column: 1 / -1; }\n" : ""}${state.stream ? ".stream  { grid-column: span 1; }\n" : ""}${state.side ? ".sidebar { grid-column: span 1; align-self: start; }\n" : ""}${state.foot ? ".footer  { grid-column: 1 / -1; }\n" : ""}
/* ${state.side ? t("c.wire.keepSide") : t("c.wire.dropSide")} */`,
        "css"
      );
    };

    api.on("lab:ready", paint);
    api.on("lab:toggle", paint);
    window.Lang.onChange(paint);
  });

  /* ======================================================================
     5.2 骨架选型对比 / Choosing the skeleton
     ====================================================================== */
  register("skeleton", (root, api) => {
    const panels = api.$$("[data-option]");
    const out = api.$("#dv-skel-out");

    const paint = () => {
      const pick = api.value("pick");
      panels.forEach((p) => p.classList.toggle("is-pick", p.dataset.option === pick));
      out.innerHTML = t(`ui.skel.${pick}`);
    };

    api.on("lab:ready", paint);
    api.on("lab:seg", paint);
    window.Lang.onChange(paint);
  });

  /* ======================================================================
     5.3 逐块精修：同一份代码的前后对比
     ====================================================================== */
  register("caseab", (root, api) => {
    const frame = api.$("iframe[data-frame]");
    const out = api.$("#dv-caseab-out");
    const list = api.$("#dv-caseab-list");

    const paint = () => {
      const state = api.value("state");
      if (frame) {
        frame.dataset.frameQuery = "state=" + state;
        if (frame.__paint) frame.__paint();
      }
      if (out) out.innerHTML = t(`ui.case.${state}`);
      if (list) list.dataset.state = state;
    };

    api.on("lab:ready", paint);
    api.on("lab:seg", paint);
    window.Lang.onChange(paint);
  });
})();
