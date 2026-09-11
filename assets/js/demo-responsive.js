/* ==========================================================================
   demo-responsive.js — 第 4 章演示 / Chapter 4 demos
   ========================================================================== */
(function () {
  "use strict";
  const { register } = window.Lab;
  const t = (k) => window.Lang.t(k);

  const MIN = 320;
  const MAX = 1440;

  /* 视口模拟：请求宽度超过可用空间时整体等比缩小，
     但 iframe 内部的 CSS 宽度仍是真实值 —— 媒体查询的判断不会失真。 */
  function fitFrame(frame, width, height) {
    const view = frame.parentElement;
    const avail = view.clientWidth;
    const scale = Math.min(1, avail / width);
    frame.style.width = width + "px";
    frame.style.height = height + "px";
    frame.style.transform = scale < 1 ? `scale(${scale})` : "none";
    frame.style.transformOrigin = "top left";
    frame.style.marginBottom = scale < 1 ? `-${(height * (1 - scale)).toFixed(1)}px` : "0";
    frame.style.marginLeft = scale < 1 ? "0" : "auto";
    frame.style.marginRight = scale < 1 ? "0" : "auto";
    return { scale, avail };
  }

  /* ======================================================================
     4.1 断点与移动优先 / Breakpoints & mobile-first
     ====================================================================== */
  register("viewport", (root, api) => {
    const frame = api.$(".vpsim__frame");
    const view = api.$(".vpsim__view");
    const marker = api.$(".vpsim__marker");
    const badge = api.$(".vpsim__badge");
    const out = api.$("#dv-vp-out");
    const note = api.$("#dv-vp-note");
    const bands = api.$$(".vpsim__band");

    const BPS = [
      { key: "phone", label: "ui.bp.phone", max: 599 },
      { key: "tablet", label: "ui.bp.tablet", max: 899 },
      { key: "laptop", label: "ui.bp.laptop", max: 1199 },
      { key: "desktop", label: "ui.bp.desktop", max: Infinity },
    ];

    const paint = () => {
      const w = parseFloat(api.value("width"));
      const { scale } = fitFrame(frame, w, 460);
      view.style.height = 460 * scale + "px";

      marker.style.left = ((w - MIN) / (MAX - MIN)) * 100 + "%";
      const bp = BPS.find((b) => w <= b.max);
      badge.textContent = `${w}px · ${t(bp.label)}`;
      bands.forEach((b) => b.classList.toggle("is-active", b.dataset.bp === bp.key));

      out.innerHTML =
        `${t("ui.vp.width")}: <b>${w}px</b>` +
        ` · ${t("ui.vp.active")}: <b>${t(bp.label)}</b>` +
        ` · ${t("ui.vp.scale")}: <b>${scale.toFixed(2)}×</b>`;
      if (note) note.textContent = t(`ui.bp.${bp.key}.desc`);

      api.code(
        "#code-viewport",
        `/* 移动优先：先写「窄屏默认样式」，再用 min-width 逐级增强 */
.blog {                       /* 默认（手机）：单列堆叠 */
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  padding-inline: 16px;
}

@media (min-width: 600px) {   /* 平板：正文 + 侧栏 */
  .blog {
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 32px;
  }
}

@media (min-width: 900px) {   /* 笔记本：更大的间距与版心 */
  .blog { padding-inline: 32px; gap: 40px; }
}

@media (min-width: 1200px) {  /* 桌面：三栏，卡片一行三张 */
  .blog {
    grid-template-columns: 200px minmax(0, 1fr) 260px;
    max-width: 1180px;
    margin-inline: auto;
  }
}

/* 当前视口 ${w}px → 命中「${t(bp.label)}」这一档 */

/* ⚠️ 用 min-width 从小到大写（移动优先）：
   额外的样式是「叠加」的，覆盖关系单向、可预测；
   用 max-width 从大到小写，越写越要小心覆盖顺序。 */`,
        "css"
      );
    };

    // 设备预设按钮
    api.$$("[data-w]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = api.$('[data-name="width"]');
        input.value = btn.dataset.w;
        if (input.__sync) input.__sync();
        paint();
      });
    });

    api.on("lab:ready", paint);
    api.on("lab:change", paint);
    window.addEventListener("resize", () => {
      if (root.__labDemo) paint();
    });
    window.Lang.onChange(paint);
  });

  /* ======================================================================
     4.2 流体排版 / Fluid type with clamp()
     ====================================================================== */
  register("fluid", (root, api) => {
    const frame = api.$(".fluidframe");
    const iframe = api.$("iframe");
    const out = api.$("#dv-fluid-out");

    const push = (clamp) => {
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage({ type: "fluid", value: clamp }, "*");
    };

    const paint = () => {
      const min = parseFloat(api.value("min"));
      const vw = parseFloat(api.value("vw"));
      const rem = parseFloat(api.value("rem"));
      const max = parseFloat(api.value("max"));
      const width = parseFloat(api.value("width"));

      const clamp = `clamp(${min}rem, ${vw}vw + ${rem}rem, ${max}rem)`;
      fitFrame(frame, width, 200);
      push(clamp);

      // 用与 CSS 相同的公式算出「当前实际字号」，避免口头描述
      const preferred = (vw / 100) * width + rem * 16;
      const actual = Math.min(max * 16, Math.max(min * 16, preferred));
      const hit = actual === min * 16 ? t("ui.fluid.min") : actual === max * 16 ? t("ui.fluid.max") : t("ui.fluid.between");

      out.innerHTML =
        `${t("ui.fluid.now")}: <b>${actual.toFixed(1)}px</b> · ${hit}` +
        ` · ${t("ui.vp.width")}: <b>${width}px</b>`;

      api.code(
        "#code-fluid",
        `:root {
  /* clamp(最小值, 首选值, 最大值)
     首选值里的 vw 让字号随视口平滑变化，两端由 min/max 兜住 */
  --fluid-title: ${clamp};
}

.post-title {
  font-size: var(--fluid-title);
  /* 字号变了，行高与间距的「比例」也要跟着走：
     用无单位行高与 em/rem 间距，而不是写死的 px */
  line-height: 1.15;
  letter-spacing: -0.015em;
}

/* 当前容器宽度 ${width}px → 实际字号约 ${actual.toFixed(1)}px */
/* ${vw === 0
          ? "vw 系数为 0：字号在区间内固定不变，只有换成不同的容器宽度才会看到差异"
          : `vw 系数 ${vw}：每宽 100px，字号大约涨 ${vw}px`} */`,
        "css"
      );
    };

    if (iframe) {
      iframe.addEventListener("load", () => {
        // iframe 可能比首次 postMessage 晚加载完，加载完成后补发一次
        api.fire("lab:change", { name: "repush" });
      });
    }

    api.on("lab:ready", paint);
    api.on("lab:change", paint);
    window.addEventListener("resize", () => {
      if (root.__labDemo) paint();
    });
    window.Lang.onChange(paint);
  });

  /* ======================================================================
     4.3 容器查询 / Container queries
     ====================================================================== */
  register("cq", (root, api) => {
    const out = api.$("#dv-cq-out");
    const shells = api.$$(".cq__shell");

    const paint = () => {
      const w = parseFloat(api.value("cqw"));
      out.innerHTML =
        `${t("ui.cq.container")}: <b>${w}px</b>` +
        ` · <b>${w >= 400 ? t("ui.cq.wide") : t("ui.cq.narrow")}</b>` +
        ` · media query: <b>${window.innerWidth >= 1500 ? t("ui.cq.wide") : t("ui.cq.narrow")}</b>`;

      api.code(
        "#code-cq",
        `/* 父级声明：这块区域可以被「查询」 */
.card-slot {
  container-type: inline-size;
  container-name: card;
}

/* 组件自己关心「我被放进多宽的容器」，而不是「视口有多宽」 */
.card { display: grid; gap: 12px; }

@container card (min-width: 400px) {
  .card {
    grid-template-columns: 96px minmax(0, 1fr);
    align-items: center;
  }
}

/* 对比：媒体查询只知道视口宽度，同一个组件放在窄容器里也不会变 */
@media (min-width: 1500px) {
  .card { grid-template-columns: 96px minmax(0, 1fr); align-items: center; }
}

/* 当前容器宽度 ${w}px → 卡片${w >= 400 ? "变成「图左文右」" : "保持上下堆叠"}；
   右侧媒体查询版本始终由视口（${window.innerWidth}px）决定，不受上面的滑块影响 */`,
        "css"
      );
    };

    api.on("lab:ready", paint);
    api.on("lab:change", paint);
    window.Lang.onChange(paint);
  });
})();
