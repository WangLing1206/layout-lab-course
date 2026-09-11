/* ==========================================================================
   i18n.js — 双语引擎 / Bilingual engine
   --------------------------------------------------------------------------
   设计取舍：
     中文原文直接写在 HTML 里（不依赖 JS 也能完整阅读，利于 SEO 与无障碍），
     英文放在下面的 EN 表里。切换语言时：
       · EN  → 用 EN 表覆盖
       · 中  → 还原首次加载时从 DOM 抓取的原文
   这样只需要维护「一份 HTML + 一份英文对照」，不存在中英两份 HTML 漂移的问题。

   约定：
     data-i18n="key"           替换 textContent
     data-i18n-html="key"      替换 innerHTML（含行内标签时用，不要嵌套 data-i18n）
     data-i18n-attr="attr:key" 替换属性（可逗号分隔多组）
   ========================================================================== */
(function () {
  "use strict";

  const $$ = window.Lab.$$;

  /* ----------------------------------------------------------------------
     英文对照表 / English strings
     键名规则：<页面>.<区块>.<序号>
     ---------------------------------------------------------------------- */
  const EN = {
    /* 由 tools/build-i18n.mjs 汇总生成，见文件末尾 */
  };

  /* ----------------------------------------------------------------------
     JS 动态生成的文案（演示读数、状态提示等）
     ---------------------------------------------------------------------- */
  const UI = {
    zh: {
      "ui.copy": "复制",
      "ui.copied": "已复制 ✓",
      "ui.copyFail": "复制失败",

      /* 演示读数 */
      "ui.aligned": "已对齐",
      "ui.inner": "组内",
      "ui.outer": "组间",
      "ui.ratio": "倍率",
      "ui.title": "标题",
      "ui.sub": "副标题",
      "ui.bodySize": "正文",
      "ui.meta": "注释",
      "ui.step": "比例",
      "ui.columns": "列数",
      "ui.main": "主内容",
      "ui.side": "侧栏",
      "ui.han": "汉字",
      "ui.latin": "西文字符",
      "ui.perLine": "/ 行",
      "ui.inRange": "在可读区间内",
      "ui.outRange": "不在可读区间",
      "ui.impl": "实现",
      "ui.domOrder": "DOM 顺序",

      /* F / Z 形图例 */
      "ui.fz.fLegend": "F 形：先横向扫过两行，再沿左侧纵向扫读",
      "ui.fz.zLegend": "Z 形：左上 → 右上 → 对角线落到左下 → 横到右下",

      /* Flex 轴标签 */
      "ui.fx.mainAxis": "主轴 main axis",
      "ui.fx.crossAxis": "交叉轴 cross axis",

      /* grid-template-areas 校验 */
      "ui.area.empty": "点左边的格子，涂出你想要的区域",
      "ui.area.valid": "区域合法",
      "ui.area.invalid": "区域非法",

      /* 选型结论 */
      "ui.decide.why2d":
        "需要同时控制行与列 → 二维布局。Grid 能一次说清「哪块占哪些格子」，Flex 得靠嵌套多层才能凑出同样的效果。",
      "ui.decide.whyCross":
        "需要跨卡片对齐（每张卡的标题、按钮都在同一条基线上）→ Grid。同一行的项目共享行轨道，容器一变它们依然对齐。",
      "ui.decide.whyContent":
        "一维排布，且尺寸由内容决定 → Flex。这正是 Flex 的强项：项目按内容宽度排开，剩余空间再按 flex-grow 分配。",
      "ui.decide.whyLayout":
        "版面结构先定、内容去适应格子 → Grid。用 grid-template-columns / areas 描述版式，比用 Flex 嵌套更接近你脑子里的图。",

      /* 断点 */
      "ui.bp.phone": "手机",
      "ui.bp.tablet": "平板",
      "ui.bp.laptop": "笔记本",
      "ui.bp.desktop": "桌面",
      "ui.bp.phone.desc":
        "单栏：所有区域上下堆叠，页头吸顶，正文占满宽度。这是默认样式，也是最重要的一档 —— 因为它是所有其他版本的基础。",
      "ui.bp.tablet.desc":
        "两栏：正文获得主列，侧栏 220px 落在右侧。间距加大一档，但仍不依赖悬停等桌面交互。",
      "ui.bp.laptop.desc":
        "版心更宽（约 900–1180px），文章流变成两列，第一篇通栏形成节奏；此时行宽仍在可读区间内。",
      "ui.bp.desktop.desc":
        "三栏：左侧出现归档栏，正文居中，右侧信息栏固定 240px。内容区最大 1180px，再宽也不会把行拉长。",

      /* 视口模拟 */
      "ui.vp.width": "视口宽度",
      "ui.vp.active": "当前断点",
      "ui.vp.scale": "缩放",
      "ui.fluid.now": "标题实际字号",
      "ui.fluid.min": "已触到最小值下限",
      "ui.fluid.max": "已触到最大值上限",
      "ui.fluid.between": "正处在流动区间",

      /* 容器查询 */
      "ui.cq.container": "容器宽度",
      "ui.cq.wide": "图左文右",
      "ui.cq.narrow": "上下堆叠",

      /* 案例 */
      "ui.wire.oneCol": "单栏",
      "ui.wire.twoCol": "两栏（正文 + 侧栏）",
      "ui.wire.sideOnly": "只有侧栏",
      "ui.skel.a":
        "方案 A 单栏：阅读体验最好，实现最省。代价是首页只能线性铺开，标签、订阅、关于等次级入口没有位置。",
      "ui.skel.b":
        "方案 B 两栏：正文 + 侧栏，容量和阅读性平衡得最好，也是最常见的博客首页骨架。窄屏时侧栏自然落到正文下方。",
      "ui.skel.c":
        "方案 C 三栏 + 通栏头尾：信息容量最大，但 900px 以下会挤，需要两处断点做降级。适合内容量确实很大的站点。",
      "ui.case.before":
        "改造前：没有版心，行宽随窗口无限拉长；三栏写死，窄屏挤成一团；标题与正文同级，层次消失；间距随手给，看不出分组。",
      "ui.case.after":
        "改造后：1180px 版心 + 四档断点；字号比例尺建立层级；间距来自统一的刻度；卡片内部用 Grid 对齐，侧栏在窄屏自然下移。"
    },

    en: {
      "ui.copy": "Copy",
      "ui.copied": "Copied ✓",
      "ui.copyFail": "Copy failed",

      "ui.aligned": "aligned",
      "ui.inner": "inner",
      "ui.outer": "outer",
      "ui.ratio": "ratio",
      "ui.title": "Title",
      "ui.sub": "Deck",
      "ui.bodySize": "Body",
      "ui.meta": "Meta",
      "ui.step": "Step ratio",
      "ui.columns": "columns",
      "ui.main": "main",
      "ui.side": "aside",
      "ui.han": "Han chars",
      "ui.latin": "Latin chars",
      "ui.perLine": "/ line",
      "ui.inRange": "inside the readable range",
      "ui.outRange": "outside the readable range",
      "ui.impl": "engine",
      "ui.domOrder": "DOM order",

      "ui.fz.fLegend": "F-pattern: two horizontal sweeps, then a vertical scan down the left",
      "ui.fz.zLegend": "Z-pattern: top-left → top-right → diagonal to bottom-left → across to bottom-right",

      "ui.fx.mainAxis": "main axis →",
      "ui.fx.crossAxis": "cross axis ↕",

      "ui.area.empty": "Click the cells on the left to paint a region",
      "ui.area.valid": "valid",
      "ui.area.invalid": "invalid",

      "ui.decide.why2d":
        "Rows and columns both need control → two dimensions. Grid states which item occupies which cells; Flex would need nested containers to fake the same result.",
      "ui.decide.whyCross":
        "Items must align across cards (every title and button on the same baseline) → Grid. Items in a row share a row track, so they stay aligned as the container resizes.",
      "ui.decide.whyContent":
        "One dimension, and size is driven by content → Flex. Items lay out at their content width and flex-grow shares whatever space is left.",
      "ui.decide.whyLayout":
        "The layout comes first and content adapts to the cells → Grid. grid-template-columns / areas describes the layout you have in mind far more directly than nested Flex.",

      "ui.bp.phone": "Phone",
      "ui.bp.tablet": "Tablet",
      "ui.bp.laptop": "Laptop",
      "ui.bp.desktop": "Desktop",
      "ui.bp.phone.desc":
        "Single column: everything stacks, the header sticks to the top and body text uses the full width. This is the default — and the most important tier, because every other tier builds on it.",
      "ui.bp.tablet.desc":
        "Two columns: the stream takes the main track and a 220px sidebar sits on the right. Spacing steps up, with no reliance on hover.",
      "ui.bp.laptop.desc":
        "A wider measure (roughly 900–1180px): the stream becomes two columns with the first post spanning both, and line length stays readable.",
      "ui.bp.desktop.desc":
        "Three columns: an archive rail on the left, the stream in the middle, a 240px info column on the right. The content area caps at 1180px so lines never stretch.",

      "ui.vp.width": "viewport",
      "ui.vp.active": "breakpoint",
      "ui.vp.scale": "scale",
      "ui.fluid.now": "computed title size",
      "ui.fluid.min": "clamped at the minimum",
      "ui.fluid.max": "clamped at the maximum",
      "ui.fluid.between": "inside the fluid range",

      "ui.cq.container": "container width",
      "ui.cq.wide": "image left, text right",
      "ui.cq.narrow": "stacked",

      "ui.wire.oneCol": "one column",
      "ui.wire.twoCol": "two columns (stream + sidebar)",
      "ui.wire.sideOnly": "sidebar only",
      "ui.skel.a":
        "Option A, one column: best reading experience, least work. The price is that a homepage can only unfold linearly — tags, subscribe and about have nowhere to live.",
      "ui.skel.b":
        "Option B, two columns: stream plus sidebar. The best balance of capacity and readability, and the most common blog homepage skeleton. On narrow screens the sidebar drops below the stream.",
      "ui.skel.c":
        "Option C, three columns with a full-width header and footer: the most capacity, but it crowds below 900px and needs two breakpoints to degrade. Suited to sites with genuinely lots of content.",
      "ui.case.before":
        "Before: no measure, so lines stretch with the window; three columns hard-coded, packed tight on narrow screens; headings and body at the same level; spacing given at random so nothing groups.",
      "ui.case.after":
        "After: a 1180px measure with four breakpoints; a type scale that builds hierarchy; spacing drawn from one scale; cards aligned with Grid and a sidebar that drops below on narrow screens."
    }
  };

  /* ----------------------------------------------------------------------
     状态 / State
     ---------------------------------------------------------------------- */
  const STORAGE = "layoutlab.lang";
  const listeners = [];
  let current = "zh";

  const t = (key) => (UI[current] && UI[current][key]) || UI.zh[key] || key;

  /* 首次加载时把中文原文抓下来，之后切回中文只需还原 */
  function capture() {
    $$("[data-i18n]").forEach((el) => {
      if (el.__base === undefined) el.__base = el.textContent;
    });
    $$("[data-i18n-html]").forEach((el) => {
      if (el.__baseHtml === undefined) el.__baseHtml = el.innerHTML;
    });
    $$("[data-i18n-attr]").forEach((el) => {
      if (el.__attrKeys) return;
      el.__attrKeys = {};
      el.__attrBase = {};
      el.dataset.i18nAttr.split(",").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (!attr || !key) return;
        el.__attrKeys[attr] = key;
        el.__attrBase[attr] = el.getAttribute(attr) || "";
      });
    });
  }

  function lookup(key, fallback) {
    const v = current === "en" ? EN[key] : undefined;
    if (current === "en") {
      if (v !== undefined) return v;
      if (UI.en[key] !== undefined) return UI.en[key];
      return fallback; // 缺译文时优雅退回中文
    }
    return UI.zh[key] !== undefined ? UI.zh[key] : fallback;
  }

  function translate(el, force) {
    if (el.dataset.i18n) {
      const v = lookup(el.dataset.i18n, el.__base);
      if (v !== undefined && el.textContent !== v) el.textContent = v;
    }
    if (el.dataset.i18nHtml) {
      const v = lookup(el.dataset.i18nHtml, el.__baseHtml);
      if (v !== undefined && el.innerHTML !== v) el.innerHTML = v;
    }
    if (el.__attrKeys) {
      Object.keys(el.__attrKeys).forEach((attr) => {
        const v = lookup(el.__attrKeys[attr], el.__attrBase[attr]);
        if (v !== null && v !== undefined) el.setAttribute(attr, v);
      });
    }
  }

  function set(lang, silent) {
    current = lang === "en" ? "en" : "zh";
    localStorage.setItem(STORAGE, current);

    const root = document.documentElement;
    root.lang = current === "zh" ? "zh-CN" : "en";
    root.dataset.lang = current;

    $$("[data-i18n],[data-i18n-html],[data-i18n-attr]").forEach((el) => translate(el, true));

    $$('.seg[data-name="lang"] .seg__btn').forEach((btn) => {
      const on = btn.dataset.value === current;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    if (!silent) listeners.forEach((fn) => fn(current));
  }

  /* ----------------------------------------------------------------------
     初始化
     ---------------------------------------------------------------------- */
  function init() {
    capture();

    // 语言优先级：URL 参数 > 本地记忆 > 默认中文
    const fromUrl = new URLSearchParams(location.search).get("lang");
    const saved = localStorage.getItem(STORAGE);
    let initial = "zh";
    if (fromUrl === "zh" || fromUrl === "en") initial = fromUrl;
    else if (saved === "zh" || saved === "en") initial = saved;
    set(initial, true);

    // 绑定语言切换按钮
    $$('[data-lang-switch] .seg__btn').forEach((btn) => {
      btn.addEventListener("click", () => set(btn.dataset.value, false));
    });
  }

  window.Lang = {
    init,
    set,
    t,
    translate,
    get current() {
      return current;
    },
    onChange(fn) {
      listeners.push(fn);
      return () => {
        const i = listeners.indexOf(fn);
        if (i > -1) listeners.splice(i, 1);
      };
    },
  };
})();
