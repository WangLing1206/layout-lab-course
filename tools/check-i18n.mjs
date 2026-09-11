#!/usr/bin/env node
/* ==========================================================================
   check-i18n.mjs — 双语文案完整性检查 / i18n completeness check
   --------------------------------------------------------------------------
   用法：
     node tools/check-i18n.mjs           检查缺失与多余的键
     node tools/check-i18n.mjs --list     列出所有键（含中文原文），便于翻译

   做三件事：
     1. 从 i18n.js 里取出 EN 配置对象；
     2. 扫描所有 HTML 的 data-i18n / data-i18n-html / data-i18n-attr；
     3. 报告「漏译」与「多余的键」，漏译时以非零码退出，可直接用于 CI。
   ========================================================================== */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const LIST = process.argv.includes("--list");

/* ---------- 1. 收集 HTML 文件 ---------- */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "tools") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

/* ---------- 2. 从 i18n.js 取出 EN 对象 ---------- */
const i18nSrc = readFileSync(join(ROOT, "assets/js/i18n.js"), "utf8");
const start = i18nSrc.indexOf("const EN = {");
const end = i18nSrc.indexOf("\n  };", start);
if (start < 0 || end < 0) {
  console.error("✗ 无法在 assets/js/i18n.js 中定位 EN 配置对象");
  process.exit(2);
}
const EN = eval("(" + i18nSrc.slice(i18nSrc.indexOf("{", start), end + 4) + ")");

/* ---------- 3. 扫描 HTML ---------- */
const ATTR_RE = /data-i18n(?:-html|-attr)?="([^"]+)"/g;
const TAG_RE = /<([a-zA-Z][\w-]*)([^>]*data-i18n[^>]*)>/g;
const TEXT_RE = /data-i18n(?:-html)?="([^"]+)"/;

const used = new Map(); // key -> 出现位置
const found = [];

for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  const rel = relative(ROOT, file).replace(/\\/g, "/");

  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(src)) !== null) {
    const value = m[1];
    // data-i18n-attr 的值形如 "attr:key,attr2:key2"
    const keys =
      m[0].startsWith("data-i18n-attr")
        ? value.split(",").map((pair) => pair.split(":")[1]?.trim()).filter(Boolean)
        : [value];
    for (const key of keys) {
      used.set(key, rel);
      found.push({ key, file: rel, index: m.index });
    }
  }

  // 抓取元素的中文原文（仅用于 --list 显示）
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(src)) !== null) {
    const inner = TEXT_RE.exec(m[2]);
    if (!inner) continue;
    const text = src.slice(m.index + m[0].length).split("<")[0].trim().replace(/\s+/g, " ");
    const rec = found.find((f) => f.key === inner[1] && f.file === rel && !f.text);
    if (rec) rec.text = text.slice(0, 60);
  }
}

/* ---------- 4. 报告 ---------- */
const missing = [...used.keys()].filter((k) => EN[k] === undefined && !k.startsWith("ui."));
const unused = Object.keys(EN).filter((k) => !used.has(k));

console.log(`HTML 文件：${walk(ROOT).length} 个`);
console.log(`词条总数：${used.size} 个（其中 ui.* 由 i18n.js 的 UI 表提供）`);
console.log(`英文词条：${Object.keys(EN).length} 条`);
console.log("");

if (LIST) {
  console.log("键名一览：");
  for (const k of used.keys()) {
    if (k.startsWith("ui.")) continue;
    const rec = found.find((f) => f.key === k);
    console.log(`  ${k.padEnd(24)} ${(rec?.text || "").slice(0, 42)}`);
  }
  console.log("");
}

if (missing.length) {
  console.log(`✗ 漏译 ${missing.length} 条：`);
  for (const k of missing) console.log(`  ${k}   (${used.get(k)})`);
} else {
  console.log("✓ 没有漏译");
}

if (unused.length) {
  console.log(`\n! 未被使用的键 ${unused.length} 条（可能是残留）：`);
  for (const k of unused) console.log(`  ${k}`);
}

process.exit(missing.length ? 1 : 0);
