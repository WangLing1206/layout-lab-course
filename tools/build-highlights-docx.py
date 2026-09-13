#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
生成《关键亮点说明》四页版 DOCX。

设计约定
  · A4，左右 18mm / 上下 17mm，正文栏宽 174mm
  · 主色取自站点 --accent #1f6b64；正文墨色 #26282e，次要文字 #63676f
  · 六个核心亮点各配一张插图；末页收一份紧凑的速览表
  · 字体：中文 Microsoft YaHei，西文 Segoe UI，等宽 Consolas

文档结构（4 页）
  P1  定位 + 网站概览图 + 亮点 01（案例驱动）
  P2  亮点 02（三栏切换器）+ 亮点 03（真实交互演示）
  P3  亮点 04（实时输出）+ 亮点 05（双语一致）
  P4  亮点 06（自示范）+ 速览表（演示清单 / 技术自示范）

用法：
  python tools/build-highlights-docx.py
  E:/libreoffice/program/soffice.exe -env:UserInstallation=file:///tmp/lo \
      --headless --convert-to pdf --outdir submission submission/关键亮点说明.docx
"""

import os
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

# ---------------------------------------------------------------- 设计令牌
ACCENT = RGBColor(0x1F, 0x6B, 0x64)
ACCENT_SOFT = RGBColor(0x4A, 0x8F, 0x87)
INK = RGBColor(0x26, 0x28, 0x2E)
INK_MUTED = RGBColor(0x63, 0x67, 0x6F)
CARD_BG = "EDF3F1"
HEAD_BG = "F2F6F5"
RULE = "B9D5D0"
FRAME_CLR = "D6E2DF"

ZH = "Microsoft YaHei"
LATIN = "Segoe UI"
MONO = "Consolas"

PAGE_W = 174          # 正文栏宽 mm
FIG_W = 140          # 插图默认宽 mm（居中，比正文栏略窄）
FIG_W_BIG = 156      # 封面图
FIG_W_LAST = 150     # 末页图（表格较小，图可以放大）
BODY_PT = 10.5        # 正文
FIG_CAP_PT = 8.5

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "submission", "关键亮点说明.docx")
IMG = os.path.join(ROOT, "submission", "img")


# ---------------------------------------------------------------- 文本内容
LEAD = (
    "「布局实验室」是一份围绕「如何做好页面布局」的教程：讲原理、讲取舍、"
    "讲为什么这样排更好，而不是罗列 CSS 属性。全站 5 章、18 个知识点、"
    "18 个可交互演示，中英双语；正文里的每一条结论，都能在页面上动手验证。"
)

HIGHLIGHTS = [
    dict(
        num="01",
        title="案例驱动：五章讲完一个首页的改造",
        fig="shot-beforeafter.png",
        cap="「远山手记」博客首页：改造前没有版心，行宽随窗口拉长、三栏写得死死的；"
            "改造后是 1180px 版心 + 四档断点 + 一条统一间距刻度。",
        body=[
            "全站只用「远山手记」这一个博客首页作例子——它改造前「能用但不好读」："
            "没有版心，行宽随窗口无限拉长；三栏写死，窄屏挤成一团；标题与正文同级，间距随手给。",
            "五章分别解决它的一个阶段（需求 → 骨架 → 实现 → 响应式 → 精修），"
            "前一步的结论就是后一步的依据。布局知识本身是碎的，"
            "只有放进一条完整的决策链，读者才能看到「选择 A 会导致什么后果」。",
        ],
    ),
    dict(
        num="02",
        title="每个知识点固定「讲解 / 关键代码 / 动态演示」",
        fig="shot-tabs.png",
        cap="知识点 1.1：正文标题下的三栏切换器，以及讲解面板的「正文列 + 旁注栏」双栏。",
        body=[
            "三块等宽切换，而不是从上到下堆叠——想看演示不必先滚过整段代码，"
            "切换选择还会在后续知识点之间记住。无 JS 时切换器自动隐藏，三块按原顺序堆叠，内容一点不丢。",
            "讲解面板本身是「正文列 + 旁注栏」的编辑型双栏：正文受 68ch 行宽上限约束，"
            "不为了填满容器而把行拉长，提示与权衡移到右侧旁注栏。",
        ],
    ),
    dict(
        num="03",
        title="18 个演示全部是可动手的真实交互",
        fig="shot-painter.png",
        cap="知识点 3.3 的 grid-template-areas 画笔：涂成 L 形后立刻提示「区域非法」，右侧预览随之散架。",
        body=[
            "滑块、分段按钮、开关、可点击画板，没有一处截图或 GIF。",
            "以画笔为例：在 3×3 画板上涂色，它会实时校验同名区域是否构成矩形——"
            "CSS 规定同名单元格必须拼成一块完整矩形，否则整条声明会被丢弃。"
            "非法时预览立刻散架，代码里同时写明原因与后果。",
        ],
    ),
    dict(
        num="04",
        title="演示下方是「跟着你重写的 CSS」",
        fig="shot-live.png",
        cap="英文模式下的动态演示：控件、读数与下方的实时输出同步重写，注释也已切换为英文。",
        body=[
            "每个演示都配一块实时输出，跟着你的每一次拖动与点击同步重写等价 CSS；"
            "参数调满意就能直接复制走。",
            "演示区给出的从来不是效果，而是能用的代码——"
            "这把「动手玩」和「拿到代码」之间的落差抹掉了。",
        ],
    ),
    dict(
        num="05",
        title="中英双语，两种语言内容一致",
        fig="shot-i18n.png",
        cap="同一个知识点、同一块内容的中文版与英文版：正文、控件、代码注释、演示读数全部同步。",
        body=[
            "一键切换后，正文、控件标签、代码注释、演示读数、乃至实时输出里的注释全部同步。",
            "难点在于那些注释嵌着动态数值（px、断点名、列数），中英语序不同，"
            "不能靠字符串拼接，必须把整句作为词条并用占位符取值。全站 911 条词条，自检 0 漏译。",
        ],
    ),
    dict(
        num="06",
        title="网站本身就是所讲方法的示范",
        fig="shot-vpsim.png",
        cap="知识点 4.1 的视口模拟器：拖动宽度后，真实 iframe 按媒体查询把成品重排为单栏，"
            "断点标尺同步高亮当前档位。",
        body=[
            "原生 HTML / CSS / JavaScript，无框架、无构建步骤。Grid 搭整站骨架、"
            "Flex 排每一排零件、clamp() 做流体字号，sticky 都配了 align-self: start。",
            "容器查询用在两处真实场景：第 4 章的对照演示，以及讲解面板自身——"
            "面板只在容器 ≥860px 时才把旁注栏并排到正文右侧。图中是同一章的断点模拟器。",
        ],
    ),
]

# 速览：演示清单（每章一行）
DEMO_ROWS = [
    ("① 设计原则", "对齐 · 留白 · 层级 · 栅格",
     "对齐开关与参考线 · 间距刻度滑块 · 层级比例尺 · 12 栅格"),
    ("② 经典模式", "单栏行宽 · 五种布局 · F/Z 形",
     "行宽测量 · 五种模式一键切换并对比 Grid/Flex · 扫读路径动画"),
    ("③ Flex 与 Grid", "轴 · 轨道 · 命名区域 · 选型",
     "Flex 试验台 · Grid 试验台 · areas 画笔 · 选型决策器"),
    ("④ 响应式", "断点 · 流体排版 · 容器查询",
     "拖动视口看真实 iframe 重排 · clamp() 试验台 · 容器查询对照"),
    ("⑤ 案例实战", "需求 · 骨架 · 实现 · 精修",
     "线框增删 · 三套骨架对比 · 成品预览 · 改造前后对比与验收清单"),
]

# 速览：技术自示范
TECH_ROWS = [
    ("CSS 自定义属性", "颜色 / 间距 / 字号统一收在 tokens.css，暗色主题只换令牌"),
    ("Grid", "整站骨架、切换器、卡片阵列、案例骨架与断点重排"),
    ("Flexbox", "顶栏、控件行、开关组、卡片内部、页脚；靠边用 auto margin"),
    ("clamp()", "字号刻度全是流体值，320 → 1600px 之间没有断层"),
    ("容器查询", "第 4 章对照演示；以及讲解面板自身（≥860px 并排旁注栏）"),
    ("逻辑属性", "margin / padding / border-inline 全站使用，天然支持 RTL"),
    ("无障碍", "语义化标签、skip-link、焦点环、aria-live 播报、减少动效偏好"),
    ("position: sticky", "顶栏、章节目录、案例侧栏，一律配 align-self: start"),
]


# ---------------------------------------------------------------- 工具函数
def insert_ordered(parent, element, order):
    """按 OOXML schema 规定的顺序插入子元素。

    Word 对 pPr / tcPr / tblPr 里子元素的先后顺序有硬性要求，顺序不对会整段属性失效
    （LibreOffice 宽容，Word 不）。所以不能简单地 append。
    """
    names = [qn(t) for t in order]
    if element.tag not in names:
        parent.append(element)
        return
    wanted = names.index(element.tag)
    for child in list(parent):
        if child.tag in names and names.index(child.tag) > wanted:
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


def set_font(run, size=None, bold=False, color=None, latin=LATIN, zh=ZH):
    """同时设置西文与中文字体，避免中文回落到宋体。"""
    run.font.name = latin
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    for attr, val in (("w:ascii", latin), ("w:hAnsi", latin), ("w:eastAsia", zh)):
        rfonts.set(qn(attr), val)
    if size is not None:
        run.font.size = Pt(size)
    run.font.bold = bold
    if color is not None:
        run.font.color.rgb = color


def shade(cell, hex_fill):
    tcpr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_fill)
    insert_ordered(tcpr, shd, TCPR_ORDER)


def cell_pad(cell, top=60, bottom=60, left=100, right=100):
    tcpr = cell._tc.get_or_add_tcPr()
    mar = OxmlElement("w:tcMar")
    for tag, val in (("top", top), ("start", left), ("bottom", bottom), ("end", right)):
        el = OxmlElement(f"w:{tag}")
        el.set(qn("w:w"), str(val))
        el.set(qn("w:type"), "dxa")
        mar.append(el)
    insert_ordered(tcpr, mar, TCPR_ORDER)


def cell_border(cell, sides, color=RULE, size=6):
    """给单个单元格加边框，用来在并排的两块之间画一条竖线。"""
    tcpr = cell._tc.get_or_add_tcPr()
    bdr = OxmlElement("w:tcBorders")
    for tag in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{tag}")
        if tag in sides:
            el.set(qn("w:val"), "single")
            el.set(qn("w:sz"), str(size))
            el.set(qn("w:color"), color)
        else:
            el.set(qn("w:val"), "nil")
        bdr.append(el)
    insert_ordered(tcpr, bdr, TCPR_ORDER)


def table_borders(table, edges, color=RULE, size=6):
    """edges: 形如 {"bottom": 6} 的字典；值为线宽（1/8 pt）。"""
    tblpr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for tag in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{tag}")
        if tag in edges:
            el.set(qn("w:val"), "single")
            el.set(qn("w:sz"), str(edges[tag]))
            el.set(qn("w:color"), color)
        else:
            el.set(qn("w:val"), "none")
            el.set(qn("w:sz"), "0")
        borders.append(el)
    insert_ordered(tblpr, borders, TBLPR_ORDER)


def para(container, before=0, after=0, line=1.42, align=None, keep_next=False, keep_lines=False):
    p = container.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = line
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    if align is not None:
        p.alignment = align
    pf.keep_with_next = keep_next
    pf.keep_together = keep_lines
    return p


def border(paragraph, sides, color=RULE, size=8, space=4):
    ppr = paragraph._p.get_or_add_pPr()
    bdr = OxmlElement("w:pBdr")
    for tag in sides:
        el = OxmlElement(f"w:{tag}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), str(size))
        el.set(qn("w:space"), str(space))
        el.set(qn("w:color"), color)
        bdr.append(el)
    insert_ordered(ppr, bdr, PPR_ORDER)


def start_new_page(paragraph):
    """让这个段落成为新一页的第一段。

    不要用「空段落 + 分页符」：那个空段落本身会占掉一整页，
    在上一页刚好排满时就会多出一张白纸。挂 pageBreakBefore 到下一页的
    首个标题上就没有这个问题。
    """
    paragraph.paragraph_format.page_break_before = True
    return paragraph


# ---------------------------------------------------------------- 版式组件
def add_figure(doc, fname, caption, width_mm=FIG_W):
    """插图 + 居中图注，装在一个「整行不跨页」的单格表里。

    早先图与图注是两个段落，靠 keepNext 约束；LibreOffice 导出时并不遵守，
    结果图留在页尾、图注被推到下一页开头。改用 w:cantSplit 的单格表，
    两者物理上分不开。
    """
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    table_borders(t, {})

    row = t.rows[0]
    trpr = row._tr.get_or_add_trPr()
    trpr.insert(0, OxmlElement("w:cantSplit"))   # 整行不允许跨页

    cell = row.cells[0]
    cell.width = Mm(PAGE_W)
    cell_pad(cell, top=0, bottom=0, left=0, right=0)

    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.0
    p.add_run().add_picture(os.path.join(IMG, fname), width=Mm(width_mm))
    border(p, ("top", "left", "bottom", "right"), color=FRAME_CLR, size=6, space=1)

    c = cell.add_paragraph()
    c.alignment = WD_ALIGN_PARAGRAPH.CENTER
    c.paragraph_format.space_after = Pt(0)
    c.paragraph_format.line_spacing = 1.25
    set_font(c.add_run(caption), FIG_CAP_PT, False, INK_MUTED)
    return t


def add_highlight_head(doc, num, title, before=0, after=5, new_page=False):
    p = para(doc, before=before, after=after, line=1.15, keep_next=True, keep_lines=True)
    if new_page:
        start_new_page(p)
    set_font(p.add_run(num + "  "), 13, True, ACCENT)
    set_font(p.add_run(title), 13, True, INK)


def add_body(doc, texts, after=6):
    for i, t in enumerate(texts):
        p = para(doc, before=0, after=(after if i == len(texts) - 1 else 5), line=1.45)
        set_font(p.add_run(t), BODY_PT, False, INK)


def pair_rows(rows):
    """把 (键, 值) 列表两两配对，用于把长表压成两栏并排。"""
    out = []
    for i in range(0, len(rows), 2):
        a = rows[i]
        b = rows[i + 1] if i + 1 < len(rows) else ("", "")
        out.append((a[0], a[1], b[0], b[1]))
    return out


def add_table(doc, header, rows, widths, head_bg=HEAD_BG, divider_after=None):
    t = doc.add_table(rows=1, cols=len(header))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    table_borders(t, {"bottom": 4, "insideH": 4})

    for i, (h, w) in enumerate(zip(header, widths)):
        cell = t.rows[0].cells[i]
        cell.width = Mm(w)
        shade(cell, head_bg)
        cell_pad(cell, top=36, bottom=36, left=60, right=60)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.2
        set_font(p.add_run(h), 9, True, INK)

    for row in rows:
        cells = t.add_row().cells
        for i, (val, w) in enumerate(zip(row, widths)):
            cells[i].width = Mm(w)
            cell_pad(cells[i], top=24, bottom=24, left=55, right=55)
            if divider_after is not None and i == divider_after:
                cell_border(cells[i], ("right",))
            p = cells[i].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.22
            set_font(p.add_run(val), 8, False, INK_MUTED)
    return t


# ---------------------------------------------------------------- 组装文档
def build():
    doc = Document()

    normal = doc.styles["Normal"]
    normal.font.name = LATIN
    normal.font.size = Pt(BODY_PT)
    normal.font.color.rgb = INK
    normal.element.rPr.rFonts.set(qn("w:eastAsia"), ZH)
    normal.paragraph_format.space_after = Pt(0)

    sec = doc.sections[0]
    sec.page_width, sec.page_height = Mm(210), Mm(297)
    sec.top_margin, sec.bottom_margin = Mm(17), Mm(15)
    sec.left_margin = sec.right_margin = Mm(18)

    # ============================================================ 第 1 页
    p = para(doc, after=2, line=1.0)
    set_font(p.add_run("布局实验室 · Layout Lab"), 21, True, ACCENT)

    p = para(doc, after=3, line=1.3)
    set_font(p.add_run("案例驱动的页面布局教学网站 · 每个知识点都由讲解 / 关键代码 / 动态演示三块组成"),
             11, False, INK_MUTED)

    p = para(doc, after=8, line=1.35)
    set_font(p.add_run("wangling1206.github.io/layout-lab-course"), 10, True, ACCENT_SOFT, latin=MONO)
    set_font(p.add_run("　·　5 章 · 18 个知识点 · 18 个可交互演示 · 中英双语 · 原生 HTML/CSS/JS"),
             9.5, False, INK_MUTED)
    border(p, ("bottom",), color=RULE, size=8, space=6)

    p = para(doc, before=2, after=10, line=1.5)
    set_font(p.add_run(LEAD), BODY_PT, False, INK)

    h = HIGHLIGHTS[0]
    add_highlight_head(doc, h["num"], h["title"], before=2, after=6)
    add_body(doc, h["body"], after=7)
    add_figure(doc, h["fig"], h["cap"], width_mm=FIG_W_BIG)


    # ============================================================ 第 2 页
    for i, h in enumerate(HIGHLIGHTS[1:3]):
        add_highlight_head(doc, h["num"], h["title"], before=0, after=6)
        add_body(doc, h["body"], after=7)
        add_figure(doc, h["fig"], h["cap"])
        if h is HIGHLIGHTS[1]:
            para(doc, before=0, after=9, line=1.0)

    # ============================================================ 第 3 页
    for i, h in enumerate(HIGHLIGHTS[3:5]):
        add_highlight_head(doc, h["num"], h["title"], before=0, after=6)
        add_body(doc, h["body"], after=7)
        add_figure(doc, h["fig"], h["cap"])
        if h is HIGHLIGHTS[3]:
            para(doc, before=0, after=9, line=1.0)

    # ============================================================ 第 4 页
    h = HIGHLIGHTS[5]
    add_highlight_head(doc, h["num"], h["title"], before=0, after=6)
    add_body(doc, h["body"], after=7)
    add_figure(doc, h["fig"], h["cap"], width_mm=FIG_W_LAST)

    p = para(doc, before=9, after=3, line=1.15, keep_next=True)
    set_font(p.add_run("速览 · 18 个演示分布在五章"), 12, True, INK)

    add_table(doc, ("章", "知识点", "演示与交互方式"), DEMO_ROWS, (26, 44, 104))

    p = para(doc, before=9, after=3, line=1.15, keep_next=True)
    set_font(p.add_run("速览 · 本站如何示范所讲的方法"), 12, True, INK)

    add_table(doc, ("技术", "用在哪里", "技术", "用在哪里"),
              pair_rows(TECH_ROWS), (24, 63, 24, 63), divider_after=1)

    p = para(doc, before=5, after=0, line=1.3)
    set_font(p.add_run("实测："), 9.5, True, INK)
    set_font(p.add_run(
        "6 个页面渲染正常 · 18 个演示全部可交互 · 双语 911 词条 0 漏译 · 全站 0 个 404"),
        9.5, False, INK_MUTED)

    doc.save(OUT)
    print("已生成:", OUT)


if __name__ == "__main__":
    build()
