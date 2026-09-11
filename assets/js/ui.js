/* ==========================================================================
   ui.js — 通用 UI 工具箱 / Shared UI toolkit
   --------------------------------------------------------------------------
   这里放的是「与内容无关」的机械部件：
     · DOM 简写与转义
     · 代码语法着色（逐文本节点着色，因此不会破坏块内的双语注释标记）
     · 三类控件：滑块 / 分段按钮 / 开关，统一派发自定义事件
     · 演示注册表：每个演示只需关心「数据变了以后怎么改样式」
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- DOM --- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  /* ------------------------------------------------------- 语法着色 / HL --- */
  /* 每条规则是 [类名, 正则]。顺序即优先级：先匹配到的先占用字符区间。 */
  const RULES = {
    css: [
      ["cmt", /\/\*[\s\S]*?\*\//],
      ["str", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/],
      ["var", /--[\w-]+/],
      [
        "num",
        /#[0-9a-fA-F]{3,8}|-?\d+(?:\.\d+)?(?:px|rem|em|ex|ch|vw|vh|vmin|vmax|dvh|svh|fr|deg|ms|s|%)?(?![\w-])/,
      ],
      ["at", /@[\w-]+/],
      ["fn", /[a-zA-Z][\w-]*(?=\()/],
      [
        "sel",
        /[.#][\w-]+|\b(?:html|body|main|header|nav|footer|section|article|aside|div|span|p|h[1-6]|ul|ol|li|img|button|input|label|figure|figcaption|pre|code|iframe|table|thead|tbody|tr|td|th|dl|dt|dd|form|select|option|output|svg|path|text|use|template|a)\b/,
      ],
      ["prop", /[a-zA-Z][\w-]*(?=\s*:)/],
      ["punc", /[{}();:,*/=><+~|&!]/],
    ],
    html: [
      ["cmt", /<!--[\s\S]*?-->/],
      ["at", /<![^>]*>/],
      ["tag", /<\/?[a-zA-Z][\w-]*/],
      ["str", /"[^"]*"|'[^']*'/],
      ["attr", /[a-zA-Z-][\w:-]*(?==)/],
      ["punc", /=|\/>|>/],
    ],
    js: [
      ["cmt", /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
      ["str", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/],
      [
        "kw",
        /\b(?:const|let|var|function|return|if|else|for|while|of|in|new|class|this|typeof|null|undefined|true|false|document|window|async|await|import|export|break|continue)\b/,
      ],
      ["num", /-?\d+(?:\.\d+)?/],
      ["fn", /[A-Za-z_$][\w$]*(?=\()/],
      ["punc", /[{}()[\];:,.]|[=+\-*/%<>!&|?]/],
    ],
    text: [],
  };

  const RE_CACHE = {};
  function ruleset(lang) {
    if (!RE_CACHE[lang]) {
      const rules = RULES[lang] || [];
      RE_CACHE[lang] = rules.map(([cls, re]) => [cls, new RegExp(re.source, "g")]);
    }
    return RE_CACHE[lang];
  }

  /* 把一段纯文本按规则切分，返回「转义后的 HTML」 */
  function paint(text, lang) {
    const rules = ruleset(lang);
    if (!rules.length) return escapeHtml(text);

    const marks = []; // {start, end, cls}
    for (const [cls, re] of rules) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        if (!m[0].length) {
          re.lastIndex++;
          continue;
        }
        const start = m.index;
        const end = start + m[0].length;
        // 已被更高优先级规则占用则跳过
        if (marks.some((k) => start < k.end && end > k.start)) continue;
        marks.push({ start, end, cls });
      }
    }
    if (!marks.length) return escapeHtml(text);

    marks.sort((a, b) => a.start - b.start);
    let html = "";
    let cursor = 0;
    for (const k of marks) {
      if (k.start < cursor) continue;
      html += escapeHtml(text.slice(cursor, k.start));
      html += `<span class="tok-${k.cls}">${escapeHtml(text.slice(k.start, k.end))}</span>`;
      cursor = k.end;
    }
    html += escapeHtml(text.slice(cursor));
    return html;
  }

  /* 逐文本节点着色：
     跳过 [data-i18n] 子树，这样「可翻译的注释」不会被拆碎，
     语言切换时只需替换该元素的 textContent 即可。 */
  function highlight(root, lang) {
    if (!root) return;
    const blocks = root.matches && root.matches("pre[data-lang]")
      ? [root]
      : $$("pre[data-lang]", root);

    for (const block of blocks) {
      const codeEl = block.querySelector("code") || block;
      if (codeEl.__hl) continue; // 已着色则跳过，重复调用是安全的
      codeEl.__hl = true;
      const code = lang || block.dataset.lang;
      const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          for (let p = node.parentNode; p && p !== codeEl; p = p.parentNode) {
            if (!p.attributes) continue;
            if (p.hasAttribute("data-i18n") || p.hasAttribute("data-i18n-html")) {
              return NodeFilter.FILTER_REJECT;
            }
            if (p.classList && p.classList.contains("tok-cmt")) return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const raw = node.nodeValue;
        const tmp = document.createElement("span");
        tmp.innerHTML = paint(raw, code);
        const frag = document.createDocumentFragment();
        while (tmp.firstChild) frag.appendChild(tmp.firstChild);
        node.parentNode.replaceChild(frag, node);
      }
    }
  }

  /* 写入实时生成的代码并立即着色 */
  function setCode(el, text, lang) {
    if (!el) return;
    const codeEl = el.tagName === "CODE" ? el : el.querySelector("code") || el;
    codeEl.textContent = text;
    codeEl.__hl = false; // 内容变了，允许重新着色
    const block = codeEl.closest("pre[data-lang]");
    if (block && lang) {
      block.dataset.lang = lang;
      highlight(block);
    }
  }

  /* -------------------------------------------------------- 控件 / Controls --- */
  const fire = (el, type, detail) =>
    el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));

  /* 滑块：可自动写入 CSS 变量（data-var），并统一派发 lab:change */
  function initRanges(root) {
    $$('input[type="range"]', root).forEach((input) => {
      if (input.__labRange) return;
      input.__labRange = true;

      const sync = (silent) => {
        const value = parseFloat(input.value);
        const unit = input.dataset.unit || "";
        const out = input.closest(".ctrl") && $(".ctrl__val", input.closest(".ctrl"));

        if (out) {
          const fmt = input.dataset.format;
          if (fmt === "x") out.textContent = value.toFixed(2) + "×";
          else if (fmt === "int") out.textContent = String(Math.round(value));
          else if (fmt === "auto") out.textContent = value === 0 ? "auto" : value + unit;
          else out.textContent = value + unit;
        }

        if (input.dataset.var) {
          const target = input.dataset.target ? $(input.dataset.target) : root;
          if (target) target.style.setProperty(input.dataset.var, value + unit);
        }
        if (input.dataset.var2) {
          const target = input.dataset.target2 ? $(input.dataset.target2) : root;
          if (target) target.style.setProperty(input.dataset.var2, value + unit);
        }
        if (!silent) {
          fire(input, "lab:change", {
            name: input.dataset.name || input.dataset.var,
            value,
            input,
          });
        }
      };

      input.__sync = () => sync(true);
      input.addEventListener("input", () => sync(false));
      sync(true);
    });
  }

  /* 分段按钮：点击切换激活态并派发 lab:seg */
  function initSegs(root) {
    $$(".seg", root).forEach((seg) => {
      if (seg.__labSeg) return;
      seg.__labSeg = true;
      const name = seg.dataset.name;

      const activate = (btn, silent) => {
        $$(".seg__btn", seg).forEach((b) =>
          b.classList.toggle("is-active", b === btn)
        );
        seg.dataset.value = btn.dataset.value;
        if (!silent) fire(seg, "lab:seg", { name, value: btn.dataset.value, btn });
      };

      $$(".seg__btn", seg).forEach((btn) => {
        btn.setAttribute("aria-pressed", btn.classList.contains("is-active") ? "true" : "false");
        btn.addEventListener("click", () => {
          activate(btn, false);
          $$(".seg__btn", seg).forEach((b) =>
            b.setAttribute("aria-pressed", b === btn ? "true" : "false")
          );
        });
      });

      const active = $(".seg__btn.is-active", seg) || $(".seg__btn", seg);
      if (active) activate(active, true);
      seg.__activate = (value) => {
        const btn = $$(".seg__btn", seg).find((b) => b.dataset.value === value);
        if (btn) activate(btn, true);
      };
    });
  }

  /* 开关：data-name 指定语义名，派发 lab:toggle */
  function initSwitches(root) {
    $$('.switch input[type="checkbox"], input[type="checkbox"][data-name]', root).forEach(
      (input) => {
        if (input.__labSwitch) return;
        input.__labSwitch = true;
        input.addEventListener("change", () =>
          fire(input, "lab:toggle", {
            name: input.dataset.name,
            checked: input.checked,
            input,
          })
        );
      }
    );
  }

  /* 代码标签页 */
  function initTabs(root) {
    $$(".tabs", root).forEach((tabs) => {
      if (tabs.__labTabs) return;
      tabs.__labTabs = true;
      const buttons = $$(".tabs__btn", tabs);
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
          $$(".tabs__panel", tabs).forEach((panel) =>
            panel.classList.toggle("is-active", panel.dataset.panel === btn.dataset.tab)
          );
        });
      });
    });
  }

  /* 复制按钮 */
  function initCopy(root) {
    $$(".copybtn", root).forEach((btn) => {
      if (btn.__labCopy) return;
      btn.__labCopy = true;
      btn.addEventListener("click", async () => {
        const host = btn.closest(".codeblock") || btn.closest(".tabs");
        const codeEl = host && host.querySelector("pre.code code");
        if (!codeEl) return;
        const text = codeEl.innerText;
        let ok = true;
        try {
          await navigator.clipboard.writeText(text);
        } catch (err) {
          try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
          } catch (err2) {
            ok = false;
          }
        }
        btn.classList.add("is-done");
        btn.dataset.i18n = ok ? "ui.copied" : "ui.copyFail";
        window.Lang && window.Lang.translate(btn, true);
        setTimeout(() => {
          btn.classList.remove("is-done");
          btn.dataset.i18n = "ui.copy";
          window.Lang && window.Lang.translate(btn, true);
        }, 1500);
      });
    });
  }

  /* ------------------------------------------------- 演示注册 / Demo registry --- */
  const registry = {};

  function register(name, fn) {
    registry[name] = fn;
  }

  function initDemos(scope = document) {
    $$("[data-demo]", scope).forEach((root) => {
      const fn = registry[root.dataset.demo];
      if (!fn || root.__labDemo) return;
      root.__labDemo = true;

      const api = {
        root,
        $: (sel) => $(sel, root),
        $$: (sel) => $$(sel, root),
        /* 读取控件当前值 */
        value(name) {
          const el = $(`[data-name="${name}"]`, root);
          if (!el) return undefined;
          if (el.classList.contains("seg")) return el.dataset.value;
          return el.type === "checkbox" ? el.checked : el.value;
        },
        /* 直接设定控件值（不触发事件） */
        set(name, value) {
          const el = $(`[data-name="${name}"]`, root);
          if (!el) return;
          if (el.type === "checkbox") el.checked = Boolean(value);
          else el.value = value;
          if (el.__sync) el.__sync();
          const seg = el.closest && el.closest(".seg");
          return seg;
        },
        setSeg(name, value) {
          const seg = $(`.seg[data-name="${name}"]`, root);
          if (seg && seg.__activate) seg.__activate(value);
        },
        code(target, text, lang) {
          /* 实时代码块通常就在演示容器内；也允许它作为兄弟节点出现在区块里。
             target 既可以是选择器字符串，也可以直接是元素。 */
          const el =
            target instanceof Element
              ? target
              : $(target, root) || document.querySelector(target);
          setCode(el, text, lang);
        },
        on(type, handler) {
          root.addEventListener(type, (e) => handler(e.detail, e));
        },
        fire(type, detail) {
          fire(root, type, detail);
        },
      };

      fn(root, api);
      initRanges(root);
      initSegs(root);
      initSwitches(root);
      initTabs(root);
      initCopy(root);
      /* 控件就绪后再通知演示渲染初始状态 —— 这样 value() 一定能读到值 */
      fire(root, "lab:ready", {});
      highlight(root);
    });
  }

  /* ---------------------------------------------------------- 对外接口 --- */
  window.Lab = {
    $,
    $$,
    escapeHtml,
    highlight,
    setCode,
    initRanges,
    initSegs,
    initSwitches,
    initTabs,
    initCopy,
    register,
    initDemos,
    fire,
    /* 单独触发一次初始值派发，供演示在注册后刷新 */
    refresh(root) {
      initRanges(root);
      $$('input[type="range"]', root).forEach((i) => i.__sync && i.__sync());
    },
  };
})();
