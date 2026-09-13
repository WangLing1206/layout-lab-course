#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
录制《布局实验室》演示视频。

做法
  · Playwright 驱动本机 Chrome 录制；视口 1440×810 + deviceScaleFactor 1.3333
    → 成片 1920×1080（矢量文字按 1.333 倍原生渲染，不是放大糊图）
  · 页面上注入两块覆盖层：底部字幕条 + 跟随鼠标的指针光标（含点击涟漪）。
    本机两份 ffmpeg（剪映自带）都没有 subtitles / drawtext 滤镜，
    所以字幕不靠 ffmpeg 烧，而是在页面里渲染，时序完全可控。
  · 时间轴由时钟驱动：每段先等到 start，执行动作，再等到 end。
    动作比窗口快就多停一会儿，保证成片长度与脚本一致。

产出（默认落在 submission/video/）
  · key-highlights.webm      原始录屏
  · narration.srt            配音字幕（按时间轴）
  · 时间轴脚本.md             每段的起止时间与台词，供配音
  · _lead.json               录屏开头多出的秒数，供 ffmpeg 裁掉

用法
  python tools/record-video.py            # 完整录制（约 4 分 30 秒）
  python tools/record-video.py --test     # 只录前 12 秒，验证画面
"""

import json
import os
import re
import sys
import time
from playwright.sync_api import sync_playwright

BASE = os.environ.get("LAB_BASE", "http://127.0.0.1:8160")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "submission", "video")

# 视口直接取 1920×1080：Playwright 的录制不做缩放，
# 若视口小于 record_video_size，画面会被 1:1 摆在画布里、四周留灰。
VW, VH = 1920, 1080
SCALE = 1.0
REC_W, REC_H = 1920, 1080


# ---------------------------------------------------------------- 页面覆盖层
OVERLAY_CSS = """
#__sub{position:fixed;left:0;right:0;bottom:0;z-index:2147483647;
  display:flex;justify-content:center;pointer-events:none;
  font-family:"Microsoft YaHei","PingFang SC",system-ui,sans-serif}
#__sub .bar{max-width:min(92%,1620px);margin:0 26px 34px;padding:16px 32px;
  background:rgba(18,22,26,.82);color:#fff;border-radius:12px;
  font-size:clamp(22px,1.55vw,34px);line-height:1.5;letter-spacing:.01em;
  box-shadow:0 10px 30px rgba(0,0,0,.28);opacity:0;
  transition:opacity .28s ease}
#__sub .bar.on{opacity:1}
#__cur{position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;
  width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;
  background:rgba(31,107,100,.28);border:2px solid rgba(31,107,100,.95);
  box-shadow:0 2px 10px rgba(0,0,0,.25);
  transition:transform .5s cubic-bezier(.22,.7,.3,1),width .12s,height .12s,margin .12s}
#__cur.tap{width:34px;height:34px;margin:-17px 0 0 -17px}
"""

OVERLAY_JS = """
(function mount() {
  if (window.__labSub) return;
  // 注入脚本在 document start 就跑，此时 head / body 可能还不存在
  if (!document.head || !document.body) {
    return requestAnimationFrame(mount);
  }
  window.__labSub = true;
  const style = document.createElement('style');
  style.textContent = %s;
  document.head.appendChild(style);

  const sub = document.createElement('div');
  sub.id = '__sub';
  sub.innerHTML = '<div class="bar"></div>';
  document.body.appendChild(sub);

  const cur = document.createElement('div');
  cur.id = '__cur';
  document.body.appendChild(cur);

  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  cur.style.transform = `translate(${cx}px, ${cy}px)`;

  window.__say = (text) => {
    const bar = document.querySelector('#__sub .bar');
    if (!text) { bar.classList.remove('on'); return; }
    if (bar.textContent !== text) bar.textContent = text;
    bar.classList.add('on');
  };
  window.__moveCur = (x, y) => {
    cur.style.transform = `translate(${x}px, ${y}px)`;
  };
  window.__tap = () => {
    cur.classList.add('tap');
    setTimeout(() => cur.classList.remove('tap'), 150);
  };
})();
""" % json.dumps(OVERLAY_CSS)


# ---------------------------------------------------------------- 时间轴
def split_sentences(text, min_len=14):
    """把一段台词按句切开，供字幕轮播。太短的句子并到上一句，避免字幕闪。"""
    parts = re.findall(r"[^。！？；]*[。！？；]?", text)
    out = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if out and (len(p) < min_len or len(out[-1]) < min_len):
            out[-1] += p
        else:
            out.append(p)
    return out or [text]


def seg(t0, t1, text, action):
    return {"start": t0, "end": t1, "text": text, "action": action}


def build_timeline():
    return [
        seg(0, 30,
            "这是一个讲「怎么做页面布局」的教学网站，叫布局实验室。它和一般的 CSS 教程不一样："
            "不罗列属性，而是讲原理和取舍——为什么这样排更好，代价是什么。"
            "网站上每个知识点都由三块组成：讲解、关键代码、动态演示。"
            "而且整站中英双语，右上角一键切换。",
            act_home),

        seg(30, 62,
            "最大的特点是：全站用同一个案例贯穿——一个叫「远山手记」的个人博客首页。"
            "它改造前「能用但不好读」：没有版心，行宽随窗口无限拉长；三栏写死，窄屏挤成一团。"
            "第一章用对齐、留白、层级、栅格把内容整理干净，第二章给内容选一个骨架，"
            "第三章用 Grid 搭结构、Flex 做零件，第四章改成移动优先，第五章交付完整代码。"
            "五章是一条决策链，前一步的结论就是后一步的依据。",
            act_case),

        seg(62, 100,
            "进到正文。每个知识点都是这三栏：讲解、关键代码、动态演示。"
            "它们是等宽切换，而不是从上往下堆——三块堆在一起的话，想看演示得先滚过整段代码，"
            "现在一次点击就切过去了。切换选择还会在后面每个知识点之间记住。"
            "还有一个细节：把窗口拉窄，三栏会自动隐藏，三块按原顺序堆叠，内容一点不丢。",
            act_tabs),

        seg(100, 135,
            "看这一栏的排版。正文的行宽被限制在 68 个字符以内——它不为了填满容器而把行拉长，"
            "因为这一章正好在讲行宽。右边空出来的地方没有浪费，留作旁注栏，放「提示」和「设计权衡」。"
            "窗口一窄，旁注栏就自动落回正文后面，用一条细线隔开。"
            "这个面板自己就是第四章讲的容器查询的真实用例。",
            act_theory),

        seg(135, 190,
            "现在看动态演示，这是重点。我拖动这个间距刻度滑块。"
            "上面读数在实时变：组内多少、组间多少、倍率多少。"
            "关键是下面这一块：「实时输出」。它不是截图，是跟着我每一次操作同步重写的 CSS。"
            "把参数调满意了，直接复制这一段，就能用在自己的页面上——"
            "这就把「动手玩」和「拿到代码」之间的落差抹掉了。"
            "而且它还会给判断：组间小于组内的时候，提示会告诉我，"
            "分不清哪些内容属于一起，视觉上糊成一片。",
            act_live),

        seg(190, 232,
            "再举一个最能说明问题的演示：grid-template-areas 画笔。"
            "左边九个格子，我可以在上面涂色，画出想要的版面。"
            "现在故意涂成 L 形——提示立刻变成「区域非法」。"
            "CSS 规定同名区域必须拼成一块完整的矩形，否则整条声明会被丢弃，"
            "所有项目退回自动放置。这就是右边预览散架的原因。"
            "这条规则光看文档很难记住，涂一次就懂了。",
            act_painter),

        seg(232, 268,
            "最后说双语。点一下右上角的 EN：正文、标题、控件标签全变英文，代码里的注释也跟着翻译。"
            "连这份「实时输出」里由脚本拼出来的注释也是英文的。这一点其实最难做——"
            "注释里嵌着动态的数值，中英语序完全不同，不能靠字符串拼接，"
            "得把整句作为词条、用占位符取值。全站 911 条词条，"
            "仓库里还带了自检脚本，漏译会直接报错。",
            act_i18n),

        seg(268, 282,
            "第五章末尾还有一份八条验收清单，是为你自己的页面准备的。"
            "整站原生 HTML、CSS、JavaScript，没有框架也没有构建步骤，仓库地址在页脚。",
            act_outro),
    ]


# ---------------------------------------------------------------- 动作
class Driver:
    """把「移动到元素中心并点击」这类操作包一层，顺带驱动假光标。"""

    def __init__(self, page):
        self.page = page
        self.current = ""
        self.sched = []       # [(相对秒, 句子)]
        self.t0 = None
        self.said = -1

    # ---------------------------------------------------------- 字幕时钟
    def begin_segment(self, chunks, start, end, t0):
        """把本段台词按字数分配成时间表。字幕由时钟驱动，
        而不是等动作做完再逐句切换 —— 那样段内字幕会落后画面。"""
        total = sum(len(c) for c in chunks) or 1
        self.sched, self.t0, self.said = [], t0, -1
        t = start
        for c in chunks:
            self.sched.append((t, c))
            t += (end - start) * len(c) / total

    def tick(self):
        if not self.sched or self.t0 is None:
            return
        now = time.monotonic() - self.t0
        idx = 0
        for j, (at, _) in enumerate(self.sched):
            if now >= at:
                idx = j
        if idx != self.said:
            self.said = idx
            self.say(self.sched[idx][1])

    def wait(self, sec):
        """可被时钟打断的等待：期间持续校准字幕。"""
        end = time.monotonic() + sec
        while time.monotonic() < end:
            self.tick()
            time.sleep(min(0.2, max(0.02, end - time.monotonic())))

    def say(self, text):
        self.current = text
        self.page.evaluate("t => window.__say && window.__say(t)", text)

    def goto(self, url, settle=1.2):
        """导航后必须重挂字幕：注入的覆盖层随页面一起被销毁了。"""
        self.page.goto(url)
        self.page.wait_for_load_state("domcontentloaded")
        self.wait(settle)
        self.page.evaluate("t => window.__say && window.__say(t)", getattr(self, "current", ""))

    def scroll_to(self, selector, offset=90, extra=0, settle=1.1):
        """平滑滚动到目标，等它停下后再校验一次落点。

        平滑滚动是动画，紧接着的下一次滚动或布局变化会让它停在别处
        （画笔那一段收尾就滚到了下一节）。这里滚完读一次实际位置，
        偏差超过 60px 就瞬时纠正。
        """
        ok = self.page.evaluate(
            """([sel, off, ex]) => {
                 const el = document.querySelector(sel);
                 if (!el) return false;
                 const y = el.getBoundingClientRect().top + window.scrollY - off + ex;
                 window.scrollTo({ top: y, behavior: 'smooth' });
                 return true;
               }""",
            [selector, offset, extra],
        )
        self.wait(settle)
        if not ok:
            print(f"    滚动目标不存在: {selector}")
            return
        self.page.evaluate(
            """([sel, off, ex]) => {
                 const el = document.querySelector(sel);
                 if (!el) return;
                 const want = el.getBoundingClientRect().top + window.scrollY - off + ex;
                 if (Math.abs(window.scrollY - want) > 60) window.scrollTo({ top: want });
               }""",
            [selector, offset, extra],
        )

    def scroll_by(self, dy, steps=6, pause=0.25):
        for _ in range(steps):
            self.page.mouse.wheel(0, dy // steps)
            self.wait(pause)

    def center(self, selector):
        return self.page.evaluate(
            """sel => {
                 const el = document.querySelector(sel);
                 if (!el) return null;
                 const r = el.getBoundingClientRect();
                 return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
               }""",
            selector,
        )

    def hover(self, selector, pause=0.55):
        c = self.center(selector)
        if not c:
            return False
        self.page.evaluate("p => window.__moveCur(p.x, p.y)", c)
        self.wait(pause)
        return True

    def click(self, selector, pause_before=0.6, pause_after=0.7):
        """用 JS 直接触发 click。

        早先用 Playwright 的真实点击，它会等元素「可见且稳定」；
        平滑滚动还没停下时这一步会一直重试直到超时，动作就丢了
        （画笔那一段整段失败就是这么来的）。光标照样动画，观感不变。
        """
        if not self.hover(selector, pause_before):
            return False
        ok = self.page.evaluate(
            """sel => { const el = document.querySelector(sel);
                        if (!el) return false;
                        window.__tap(); el.click(); return true; }""",
            selector,
        )
        self.wait(pause_after)
        return bool(ok)

    def drag(self, selector, to_value, steps=24, pause=0.055):
        """拖动 range：光标沿轨道走，同时分步改值并派发 input 事件。

        同样不走 Playwright 的真实鼠标按下/移动 —— 平滑滚动或元素尚未稳定时
        会超时丢动作。这里用 JS 改值 + 手绘光标，画面效果一致但稳定得多。
        """
        box = self.page.evaluate(
            """sel => {
                 const el = document.querySelector(sel);
                 if (!el) return null;
                 const r = el.getBoundingClientRect();
                 return { left: r.left, top: r.top, w: r.width, h: r.height,
                          min: +el.min, max: +el.max, value: +el.value };
               }""",
            selector,
        )
        if not box:
            return False
        y = box["top"] + box["h"] / 2
        span = max(1, box["max"] - box["min"])

        def x_of(v):
            return box["left"] + box["w"] * (v - box["min"]) / span

        self.page.evaluate("p => window.__moveCur(p.x, p.y)", {"x": x_of(box["value"]), "y": y})
        self.wait(0.5)
        for i in range(1, steps + 1):
            v = box["value"] + (to_value - box["value"]) * (i / steps)
            self.page.evaluate(
                """([sel, v, x, y]) => {
                     const el = document.querySelector(sel);
                     el.value = v;
                     el.dispatchEvent(new Event('input', { bubbles: true }));
                     window.__moveCur(x, y);
                   }""",
                [selector, v, x_of(v), y],
            )
            self.wait(pause)
        self.page.evaluate(
            """sel => document.querySelector(sel)
                       .dispatchEvent(new Event('change', { bubbles: true }))""",
            selector,
        )
        self.wait(0.4)
        return True


# 各段动作
def act_home(d):
    d.hover(".hero h1", 1.2)
    d.scroll_by(220)


def act_case(d):
    d.scroll_to("#case", 90)
    d.wait(2.5)
    d.scroll_by(380, steps=8, pause=0.45)
    d.wait(2)
    d.scroll_by(360, steps=8, pause=0.45)
    d.wait(6)
    d.scroll_by(-200, steps=5, pause=0.4)


def act_tabs(d):
    d.goto(f"{BASE}/chapters/principles.html?lang=zh")
    d.scroll_to("#p-align", 84)
    d.wait(1.5)
    d.click('#p-align .ptab[data-tab="code"]', pause_before=0.9, pause_after=2.2)
    d.click('#p-align .ptab[data-tab="demo"]', pause_before=0.9, pause_after=2.5)


def act_theory(d):
    d.click('#p-align .ptab[data-tab="theory"]', pause_before=0.8, pause_after=1.2)
    d.hover("#p-align .theory-rail__title", 1.0)
    d.wait(2)
    d.scroll_to("#p-align .prose h4", 130)
    d.wait(3)


def act_live(d):
    d.goto(f"{BASE}/chapters/principles.html?lang=zh")
    d.click('#p-space .ptab[data-tab="demo"]', pause_before=0.6, pause_after=1.0)
    d.scroll_to("#p-space [data-demo]", 80)
    d.wait(1.2)
    d.drag('#p-space input[data-name="space"]', 28)
    d.wait(1.5)
    d.scroll_to("#p-space .code--live", 300)
    d.wait(3)
    d.scroll_by(260, steps=8, pause=0.5)      # 慢慢扫过实时代码
    d.wait(2.5)
    d.scroll_to("#p-space [data-demo]", 90)
    d.wait(1.5)
    d.click('#p-space input[data-name="group"]', pause_before=0.9, pause_after=2.0)
    d.wait(2.5)
    d.hover("#dv-space-out", 1.0)
    d.wait(4)


def act_painter(d):
    d.goto(f"{BASE}/chapters/flexgrid.html?lang=zh")
    d.click('#p-areas .ptab[data-tab="demo"]', pause_before=0.6, pause_after=1.0)
    d.scroll_to("#p-areas [data-demo]", 70)
    d.wait(1.4)
    for i in (0, 1, 2):
        d.click(f"#dv-areas-board .painter__cell:nth-child({i + 1})",
                pause_before=0.7, pause_after=0.6)
    d.wait(2)
    d.click("#dv-areas-board .painter__cell:nth-child(4)", pause_before=0.8, pause_after=1.4)
    d.wait(2.5)
    d.hover("#dv-areas-status", 1.2)
    d.wait(3)
    d.scroll_to("#p-areas .code--live", 300)
    d.wait(4)


def act_i18n(d):
    d.goto(f"{BASE}/chapters/principles.html?lang=zh")
    d.click('#p-align .ptab[data-tab="demo"]', pause_before=0.6, pause_after=0.8)
    d.scroll_to("#p-align [data-demo]", 80)
    d.wait(1.0)
    d.click('[data-lang-switch] button[data-value="en"]', pause_before=1.0, pause_after=2.0)
    d.hover("#p-align .point__title", 1.0)
    d.wait(2.5)
    d.scroll_to("#p-align .code--live", 320)
    d.wait(3)
    d.scroll_by(200, steps=6, pause=0.5)
    d.wait(5)


def act_outro(d):
    d.goto(f"{BASE}/chapters/case.html?lang=zh")
    d.scroll_to("#p-refine", 80)
    d.wait(3)
    d.scroll_to(".checklist", 220)
    d.wait(5)
    d.scroll_to(".sitefoot", 620)
    d.wait(4)


# ---------------------------------------------------------------- 录制
def main():
    test = "--test" in sys.argv
    os.makedirs(OUT, exist_ok=True)
    timeline = build_timeline()
    total = timeline[-1]["end"] if not test else 12

    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome", headless=True)
        ctx = browser.new_context(
            viewport={"width": VW, "height": VH},
            device_scale_factor=SCALE,
            record_video_dir=OUT,
            record_video_size={"width": REC_W, "height": REC_H},
        )
        ctx.add_init_script(OVERLAY_JS)
        page = ctx.new_page()
        t_created = time.monotonic()

        page.goto(f"{BASE}/index.html?lang=zh")
        page.wait_for_load_state("domcontentloaded")
        time.sleep(1.5)
        page.evaluate("() => window.__say && window.__say('')")

        d = Driver(page)
        t0 = time.monotonic()                       # 时间轴零点
        lead = t0 - t_created                       # 录屏开头多出的秒数

        def wait_until(t):
            dt = t0 + t - time.monotonic()
            if dt > 0:
                time.sleep(dt)

        for s in timeline:
            if test and s["start"] >= total:
                break
            wait_until(s["start"])
            d.begin_segment(split_sentences(s["text"]), s["start"],
                            min(s["end"], total), t0)
            d.tick()
            try:
                s["action"](d)
            except Exception as e:
                print(f"  段 {s['start']}s 动作异常：{type(e).__name__} {e}")
            while (t0 + min(s["end"], total)) - time.monotonic() > 0:
                d.tick()
                time.sleep(min(0.2, max(0.02, (t0 + min(s["end"], total)) - time.monotonic())))

        page.evaluate("() => window.__say && window.__say('')")
        time.sleep(1.0)

        video = page.video.path()
        ctx.close()
        browser.close()

    print(f"录屏: {video}")
    print(f"开场多出 {lead:.2f}s（供 ffmpeg 裁掉）")

    # 时间轴脚本 + SRT
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "_lead.json"), "w", encoding="utf-8") as f:
        json.dump({"lead": lead, "total": total, "video": os.path.basename(video)}, f)

    def ts(t, comma=False):
        h, rem = divmod(int(t), 3600)
        m, s = divmod(rem, 60)
        ms = int(round((t - int(t)) * 1000))
        sep = "," if comma else "."
        return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"

    with open(os.path.join(OUT, "narration.srt"), "w", encoding="utf-8") as f:
        for i, s in enumerate(timeline, 1):
            f.write(f"{i}\n{ts(s['start'], True)} --> {ts(s['end'], True)}\n{s['text']}\n\n")

    with open(os.path.join(OUT, "时间轴脚本.md"), "w", encoding="utf-8") as f:
        f.write("# 演示视频 · 配音时间轴\n\n")
        f.write("对着 `key-highlights.mp4` 配音即可。每段时长都留了余量，"
                "语速放慢些正好；成片总长 4 分 32 秒。\n\n")
        f.write("| # | 起 | 止 | 时长 | 台词 |\n| --- | --- | --- | --- | --- |\n")
        for i, s in enumerate(timeline, 1):
            dur = s["end"] - s["start"]
            f.write(f"| {i} | {ts(s['start'])} | {ts(s['end'])} | {dur}s | {s['text']} |\n")
    print("已写出 narration.srt 与 时间轴脚本.md")


if __name__ == "__main__":
    main()
