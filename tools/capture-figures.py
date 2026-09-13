#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
抓取《关键亮点说明》用的插图。

用 Playwright 驱动本机 Chrome（比 in-app 浏览器稳定，且可以脚本化重跑）。
前置：先在项目根目录起一个静态服务器（脚本默认 8160 端口）。

用法：
  python -m http.server 8160            # 另开一个终端
  python tools/capture-figures.py       # 原图落到 submission/img/_raw/

抓完后用 PIL 裁切（裁切窗口见本文件底部的 CROPS 说明），裁切边界要落在
块与块之间的空白处，别切在文字行中间 —— 这是上一版被视觉验收打回的主因。
"""

import os
import sys
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8160"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "submission", "img", "_raw")

FREEZE_CSS = (
    "*,*::before,*::after{animation:none!important;transition:none!important;"
    "scroll-behavior:auto!important}"
)


def freeze(page):
    """截图前冻结动效，避免合成器一直在动画导致截图拿不到稳定帧。"""
    page.add_style_tag(content=FREEZE_CSS)


def shoot(page, name):
    os.makedirs(RAW, exist_ok=True)
    path = os.path.join(RAW, name + ".png")
    page.screenshot(path=path)
    print("  保存", name, os.path.getsize(path), "bytes")


def scroll_to(page, selector, offset=70):
    page.evaluate(
        """([sel, off]) => {
             const el = document.querySelector(sel);
             window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off);
           }""",
        [selector, offset],
    )
    page.wait_for_timeout(600)


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome", headless=True)

        # ---------------- 桌面视口：章节页类插图 ----------------
        page = browser.new_page(viewport={"width": 1440, "height": 950})

        # a) 三栏切换器
        page.goto(f"{BASE}/chapters/principles.html?lang=zh")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(900)
        freeze(page)
        scroll_to(page, "#p-align .point__title", 70)
        shoot(page, "a-tabs")

        # b) areas 画笔：涂成非法 L 形，让校验提示出现在画面里
        page.goto(f"{BASE}/chapters/flexgrid.html?lang=zh")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(900)
        freeze(page)
        page.click('#p-areas .ptab[data-tab="demo"]')
        page.wait_for_timeout(700)
        page.evaluate(
            """() => {
                 const cells = [...document.querySelectorAll('#dv-areas-board .painter__cell')];
                 [0, 3, 6, 1].forEach(i => cells[i].click());
               }"""
        )
        page.wait_for_timeout(500)
        scroll_to(page, "#p-areas [data-demo]", 70)
        shoot(page, "b-painter")

        # c) 实时输出（英文模式）
        page.goto(f"{BASE}/chapters/principles.html?lang=en")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(900)
        freeze(page)
        page.click('#p-align .ptab[data-tab="demo"]')
        page.wait_for_timeout(700)
        page.evaluate(
            """() => {
                 const fig = document.querySelector('#p-align .code--live').closest('figure');
                 window.scrollTo(0, fig.getBoundingClientRect().top + window.scrollY - 330);
               }"""
        )
        page.wait_for_timeout(700)
        shoot(page, "c-live")

        # d) 双语对照：中 / EN 同一切面
        for lang in ("zh", "en"):
            page.goto(f"{BASE}/chapters/principles.html?lang={lang}")
            page.wait_for_load_state("domcontentloaded")
            page.wait_for_timeout(900)
            freeze(page)
            scroll_to(page, "#p-align .prose", 70)
            shoot(page, f"d-prose-{lang}")

        # e) 容器查询对照（只框住两张卡片并排的那一块）
        page.goto(f"{BASE}/chapters/responsive.html?lang=zh")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(900)
        freeze(page)
        page.click('#p-cq .ptab[data-tab="demo"]')
        page.wait_for_timeout(700)
        box = page.evaluate(
            """() => {
                 const shells = [...document.querySelectorAll('#p-cq .cq__shell')];
                 if (!shells.length) return null;
                 const a = shells[0].getBoundingClientRect();
                 const b = shells[shells.length - 1].getBoundingClientRect();
                 return { top: a.top + window.scrollY, bottom: b.bottom + window.scrollY,
                          left: a.left, right: b.right };
               }"""
        )
        print("  cq 卡片范围:", box)
        scroll_to(page, "#p-cq .cq__shell", 70)
        shoot(page, "e-cq")

        page.close()

        # ---------------- 案例成品：改造前 / 改造后 ----------------
        page = browser.new_page(viewport={"width": 1200, "height": 950})
        for state in ("before", "after"):
            page.goto(f"{BASE}/assets/demo/frame-blog.html?state={state}")
            page.wait_for_load_state("domcontentloaded")
            page.wait_for_timeout(900)
            freeze(page)
            page.evaluate("() => window.scrollTo(0, 0)")
            page.wait_for_timeout(400)
            shoot(page, f"f-blog-{state}")
        page.close()

        browser.close()
    print("原图已全部抓完 →", RAW)


if __name__ == "__main__":
    sys.exit(main())
