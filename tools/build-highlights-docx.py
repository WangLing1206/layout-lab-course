#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
生成《关键亮点说明》单页设计版 DOCX。

设计约定
  · A4 单页，左右 15mm / 上下 13mm，正文栏宽 180mm
  · 主色取自站点 --accent #1f6b64，卡片底纹 #f4f7f6，正文墨色 #26282e
  · 6 个亮点排成 2 列 × 3 行卡片；3 张截图一行，图注居中
  · 字体：中文 Microsoft YaHei，西文 Segoe UI，等宽 Consolas

用法：
  python tools/build-highlights-docx.py
然后：
  E:/libreoffice/program/soffice.exe -env:UserInstallation=file:///tmp/lo \
      --headless --convert-to pdf --outdir submission submission/关键亮点说明.docx
"""

import os
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

# ---------------------------------------------------------------- 设计令牌
ACCENT = RGBColor(0x1F, 0x6B, 0x64)      # 与站点 --accent 同色
ACCENT_SOFT = RGBColor(0x4A, 0x8F, 0x87)
INK = RGBColor(0x26, 0x28, 0x2E)
INK_MUTED = RGBColor(0x66, 0x6A, 0x73)
CARD_BG = "EDF3F1"
RULE = "B9D5D0"

ZH = "Microsoft YaHei"
LATIN = "Segoe UI"
MONO = "Consolas"

PAGE_W = 180          # 正文栏宽 mm
THUMB_W = 88          # 上面两张小图的宽度 mm
BANNER_W = 180        # 下方通栏横幅宽度 mm

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "submission", "关键亮点说明.docx")
IMG = os.path.join(ROOT, "submission", "img")

# ---------------------------------------------------------------- 6 个亮点
HIGHLIGHTS = [
    ("01", "案例驱动：五章讲完一个首页的改造",
     "全站只用「远山手记」这一个博客首页作例子——它改造前「能用但不好读」。"
     "五章各解决一个阶段（需求 → 骨架 → 实现 → 响应式 → 精修），"
     "前一步的结论就是后一步的依据，每章侧栏都显示案例进度。"),
    ("02", "每个知识点固定「讲解 / 关键代码 / 动态演示」",
     "三块等宽切换，而不是从上到下堆叠——想看演示不必先滚过整段代码，"
     "切换选择还会在后续知识点之间记住。无 JS 时切换器自动隐藏，"
     "三块按原顺序堆叠，内容一点不丢。"),
    ("03", "18 个演示全部是可动手的真实交互",
     "滑块、分段按钮、开关、可点击画板，没有一处截图或 GIF。"
     "例如 grid-template-areas 画笔会实时校验同名区域是否构成矩形，"
     "非法时把原因和后果一并写进代码。"),
    ("04", "演示下方是「跟着你重写的 CSS」",
     "每个演示都配一块实时输出，跟着你的每一次拖动与点击同步重写等价 CSS，"
     "参数调满意就能直接复制走。演示区给出的从来不是效果，而是能用的代码。"),
    ("05", "中英双语，两种语言内容一致",
     "一键切换后，正文、控件标签、代码注释、演示读数、乃至实时输出里的注释"
     "全部同步——含动态数值的整句走词条表并用占位符取值。"
     "全站 911 条词条，自检脚本 0 漏译。"),
    ("06", "网站本身就是所讲方法的示范",
     "原生 HTML / CSS / JavaScript，无框架、无构建步骤。"
     "Grid 搭整站骨架、Flex 排每一排零件、clamp() 做流体字号、"
     "容器查询用在讲解面板自身，sticky 都配了 align-self: start。"),
]

CAPTIONS = [
    ("shot-home.png", "首页｜一条案例主线贯穿五章；右上示意即本站真实骨架"),
    ("shot-demo.png", "知识点「动态演示」栏 + 下方实时输出（英文模式，注释同样已切换）"),
]
BANNER = ("shot-preview.png", "第 5 章案例成品预览｜拖动视口宽度到 375px，真实 iframe 按媒体查询重排为单栏")

SUBTITLE = "案例驱动的页面布局教学网站 · 每个知识点都由讲解 / 关键代码 / 动态演示三块组成"
URL_LINE = "wangling1206.github.io/layout-lab-course"
STATS = "5 章 · 18 个知识点 · 18 个可交互演示 · 中英双语"


# ---------------------------------------------------------------- 工具函数
def set_font(run, size=None, bold=False, color=None, latin=LATIN, zh=ZH):
    """同时设置西文与中文字体，避免中文回落到宋体。"""
    run.font.name = latin
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    rfonts.set(qn("w:ascii"), latin)
    rfonts.set(qn("w:hAnsi"), latin)
    rfonts.set(qn("w:eastAsia"), zh)
    if size is not None:
        run.font.size = Pt(size)
    run.font.bold = bold
    if color is not None:
        run.font.color.rgb = color


def insert_ordered(parent, element, order):
    """按 OOXML schema 规定的顺序插入子元素。

    Word 对 pPr / tcPr 里子元素的先后顺序有硬性要求，顺序不对会整段属性失效
    （LibreOffice 宽容，Word 不）。所以不能简单地 append。
    """
    wanted = [qn(t) for t in order].index(element.tag) if element.tag in [qn(t) for t in order] else -1
    if wanted < 0:
        parent.append(element)
        return
    for child in list(parent):
        if child.tag in [qn(t) for t in order]:
            if [qn(t) for t in order].index(child.tag) > wanted:
                child.addprevious(element)
                return
    parent.append(element)


PPR_ORDER = [
    "w:pStyle", "w:keepNext", "w:keepLines", "w:pageBreakBefore", "w:framePr",
    "w:widowControl", "w:numPr", "w:suppressLineNumbers", "w:pBdr", "w:shd",
    "w:tabs", "w:spacing", "w:ind", "w:contextualSpacing", "w:jc",
    "w:textDirection", "w:textAlignment", "w:outlineLvl", "w:rPr", "w:sectPr",
]
TCPR_ORDER = [
    "w:cnfStyle", "w:tcW", "w:gridSpan", "w:hMerge", "w:vMerge", "w:tcBorders",
    "w:shd", "w:noWrap", "w:tcMar", "w:textDirection", "w:tcFitText",
    "w:vAlign", "w:hideMark",
]
TBLPR_ORDER = [
    "w:tblStyle", "w:tblpPr", "w:tblOverlap", "w:bidiVisual", "w:tblStyleRowBandSize",
    "w:tblStyleColBandSize", "w:tblW", "w:jc", "w:tblCellSpacing", "w:tblInd",
    "w:tblBorders", "w:shd", "w:tblLayout", "w:tblCellMar", "w:tblLook",
]


def shade(cell, hex_fill):
    tcpr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_fill)
    insert_ordered(tcpr, shd, TCPR_ORDER)


def cell_pad(cell, top=60, bottom=60, left=110, right=110):
    """单元格内边距，单位 twips（1mm ≈ 56.7 twips）。"""
    tcpr = cell._tc.get_or_add_tcPr()
    mar = OxmlElement("w:tcMar")
    for tag, val in (("top", top), ("start", left), ("bottom", bottom), ("end", right)):
        el = OxmlElement(f"w:{tag}")
        el.set(qn("w:w"), str(val))
        el.set(qn("w:type"), "dxa")
        mar.append(el)
    insert_ordered(tcpr, mar, TCPR_ORDER)


def no_borders(table):
    tblpr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for tag in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{tag}")
        el.set(qn("w:val"), "none")
        el.set(qn("w:sz"), "0")
        borders.append(el)
    insert_ordered(tblpr, borders, TBLPR_ORDER)


def bottom_rule(paragraph, color=RULE, size=8, sides=("bottom",), space=4):
    """给段落加边框：sides 只给 "bottom" 时就是一条分隔线。"""
    ppr = paragraph._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    for tag in sides:
        el = OxmlElement(f"w:{tag}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), str(size))
        el.set(qn("w:space"), str(space))
        el.set(qn("w:color"), color)
        borders.append(el)
    insert_ordered(ppr, borders, PPR_ORDER)


def frame(paragraph, color="D6E2DF", size=6):
    """给图片所在段落加一圈细边框，截图看起来像被装裱过。"""
    bottom_rule(paragraph, color=color, size=size, space=1,
                sides=("top", "left", "bottom", "right"))


def para(container, space_before=0, space_after=0, line=1.3, align=None, keep_next=False):
    p = container.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.line_spacing = line
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    if align is not None:
        p.alignment = align
    if keep_next:
        pf.keep_with_next = True
    return p


# ---------------------------------------------------------------- 组装文档
def build():
    doc = Document()

    normal = doc.styles["Normal"]
    normal.font.name = LATIN
    normal.font.size = Pt(10)
    normal.font.color.rgb = INK
    normal.element.rPr.rFonts.set(qn("w:eastAsia"), ZH)
    normal.paragraph_format.space_after = Pt(0)

    sec = doc.sections[0]
    sec.page_width, sec.page_height = Mm(210), Mm(297)
    sec.top_margin, sec.bottom_margin = Mm(12), Mm(10)
    sec.left_margin = sec.right_margin = Mm(15)

    # ---------------- 页头 ----------------
    p = para(doc, line=1.0)
    set_font(p.add_run("布局实验室 · Layout Lab"), 20, True, ACCENT)
    p.add_run("    ")
    set_font(p.add_run(STATS), 9, False, INK_MUTED)

    p = para(doc, space_before=3, line=1.25)
    set_font(p.add_run(SUBTITLE), 9.5, False, INK_MUTED)

    p = para(doc, space_before=4, space_after=7, line=1.0)
    set_font(p.add_run(URL_LINE), 9.5, True, ACCENT_SOFT, latin=MONO, zh=ZH)
    bottom_rule(p)

    # ---------------- 6 个亮点：2 列 × 3 行 ----------------
    tbl = doc.add_table(rows=3, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    no_borders(tbl)
    col_w = Mm(PAGE_W / 2)

    for i, (num, title, body) in enumerate(HIGHLIGHTS):
        cell = tbl.cell(i // 2, i % 2)
        cell.width = col_w
        cell_pad(cell, top=80, bottom=80, left=135, right=135)  # 只设一次，重复会破坏 tcPr
        shade(cell, CARD_BG)

        # 单元格里已有一个空段落，复用它作为第一行
        head = cell.paragraphs[0]
        head.paragraph_format.space_after = Pt(2)
        head.paragraph_format.line_spacing = 1.0
        head.paragraph_format.keep_with_next = True
        set_font(head.add_run(num + "  "), 10.5, True, ACCENT)
        set_font(head.add_run(title), 10.5, True, INK)

        body_p = cell.add_paragraph()
        body_p.paragraph_format.space_after = Pt(0)
        body_p.paragraph_format.line_spacing = 1.3
        set_font(body_p.add_run(body), 8.8, False, INK_MUTED)

    # ---------------- 上面两张小图 ----------------
    para(doc, space_before=4, space_after=0, line=1.0)

    strip = doc.add_table(rows=1, cols=2)
    strip.alignment = WD_TABLE_ALIGNMENT.CENTER
    strip.autofit = False
    no_borders(strip)
    for i, (fname, caption) in enumerate(CAPTIONS):
        cell = strip.cell(0, i)
        cell.width = Mm(THUMB_W)
        cell_pad(cell, top=0, bottom=0, left=30, right=30)

        pic_p = cell.paragraphs[0]
        pic_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        pic_p.paragraph_format.space_after = Pt(2)
        pic_p.paragraph_format.line_spacing = 1.0
        pic_p.add_run().add_picture(os.path.join(IMG, fname), width=Mm(THUMB_W))
        frame(pic_p)

        cap = cell.add_paragraph()
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap.paragraph_format.line_spacing = 1.15
        set_font(cap.add_run(caption), 7.6, False, INK_MUTED)

    # ---------------- 通栏横幅 ----------------
    bname, bcap = BANNER
    bp = para(doc, space_before=3, space_after=2, line=1.0, align=WD_ALIGN_PARAGRAPH.CENTER)
    bp.add_run().add_picture(os.path.join(IMG, bname), width=Mm(BANNER_W))
    frame(bp)
    bc = para(doc, space_before=0, line=1.15, align=WD_ALIGN_PARAGRAPH.CENTER)
    set_font(bc.add_run(bcap), 7.6, False, INK_MUTED)

    # ---------------- 页脚 ----------------
    p = para(doc, space_before=4, space_after=0, line=1.0)
    bottom_rule(p, color=RULE, size=6)
    p2 = para(doc, space_before=4, line=1.2, align=WD_ALIGN_PARAGRAPH.CENTER)
    set_font(
        p2.add_run("原生 HTML / CSS / JavaScript · 无框架、无构建步骤 · 克隆即可部署到 GitHub Pages"),
        8, False, INK_MUTED,
    )

    doc.save(OUT)
    print("已生成:", OUT)


if __name__ == "__main__":
    build()
