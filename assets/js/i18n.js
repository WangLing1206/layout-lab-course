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
    /* ---------- 全站共用 / Shared ---------- */
    "nav.skip": "Skip to content",
    "nav.label": "Chapter navigation",
    "nav.home": "Home",
    "nav.ch1": "① Principles",
    "nav.ch2": "② Patterns",
    "nav.ch3": "③ Flex & Grid",
    "nav.ch4": "④ Responsive",
    "nav.ch5": "⑤ Case study",
    "nav.pager": "Pagination",
    "nav.prev": "Previous",
    "nav.next": "Next",
    "nav.top": "Back to top",
    "site.brand": "Layout Lab",
    "site.brandSub": "Page layout",
    "toc.title": "On this page",
    "toc.case": "Case progress",
    "toc.open": "On this page / Case progress",
    "case.step1": "Needs",
    "case.step2": "Skeleton",
    "case.step3": "Build",
    "case.step4": "Responsive",
    "case.step5": "Refine",
    "label.theory": "Explanation",
    "label.code": "Key code",
    "label.demo": "Live demo",
    "d.live": "Live output: the CSS for whatever you just did",
    "foot.aboutTitle": "About",
    "foot.about":
      "Layout Lab is a case-driven course on page layout. Every topic has three parts — explanation, key code and a live demo — and a single running case (a blog homepage) ties all five chapters together.",
    "foot.chapters": "Chapters",
    "foot.metaTitle": "Built with",
    "foot.meta1": "Plain HTML / CSS / JavaScript",
    "foot.meta2": "No build step — deploys straight to GitHub Pages",
    "foot.repo": "GitHub repository",

    /* ---------- 首页 / Home ---------- */
    "index.title": "Layout Lab · Page layout, explained",
    "index.desc":
      "A case-driven course on page layout: alignment, whitespace, hierarchy, grid systems, classic patterns, Flexbox and Grid, and responsive design — every topic with a live demo, in Chinese and English.",
    "index.eyebrow": "Case-driven · bilingual · interactive",
    "index.h1": "Getting page layout<br><em>right</em>",
    "index.lead":
      "A course about doing page layout well: the principles, the trade-offs, and why one arrangement beats another — rather than a list of CSS properties. Every topic has three parts (explanation / key code / live demo), and one running case — designing a blog homepage from scratch — carries through all five chapters.",
    "index.cta1": "Start with chapter 1 →",
    "index.cta2": "Jump to the finished case",
    "index.s1": "chapters · one case thread",
    "index.s2": "topics",
    "index.s3": "interactive demos",
    "index.s4": "languages, fully synced",
    "index.blueprintNote":
      "That diagram is this site's real skeleton: a sticky top bar, a sticky contents rail, one main column, and cards that fit themselves. Not one line of the layout comes from a framework.",
    "index.caseTitle": "One case, carried through the whole site",
    "index.caseDesc":
      "“Far Hills Notes” is a personal tech blog whose homepage used to work but read badly — so it is the case. Each chapter solves one stage, and every demo works on that same homepage.",
    "index.caseBody":
      "<strong>Five stages, each building on the last:</strong> chapter 1 sorts the content with alignment, whitespace, hierarchy and grids; chapter 2 picks the skeleton (one, two or three columns); chapter 3 builds it with Grid for the page and Flex for the parts; chapter 4 turns it mobile-first with four tiers; chapter 5 ships the code, with a before/after comparison and an acceptance checklist.",
    "index.chapters": "Five chapters",
    "index.chaptersDesc":
      "Every chapter has demos you can tune, switch and experiment with — drag a slider and watch the layout respond.",
    "index.c1t": "Design principles",
    "index.c1d":
      "Alignment, whitespace, visual hierarchy and grid systems: turning “looks good” into rules you can execute and check.",
    "index.t1": "Alignment toggles",
    "index.t2": "Whitespace & proximity",
    "index.t3": "Type scale",
    "index.t4": "12-column grid",
    "index.enter": "Open chapter →",
    "index.c2t": "Classic layout patterns",
    "index.c2d":
      "One, two and three columns, the holy grail, plus F- and Z-pattern reading — and what each one is actually good for.",
    "index.t5": "Measure ruler",
    "index.t6": "Five patterns, one click",
    "index.t7": "Grid vs Flex builds",
    "index.t8": "Eye-path animation",
    "index.c3t": "Flexbox and Grid",
    "index.c3d":
      "How the two divide the work, how they differ, and how to choose. One dimension: Flex. Two: Grid — plus named areas you can draw.",
    "index.t9": "Flex playground",
    "index.t10": "Grid playground",
    "index.t11": "Areas painter",
    "index.t12": "Engine picker",
    "index.c4t": "Responsive layout",
    "index.c4d":
      "Where breakpoints belong, why mobile-first holds up, how clamp() smooths the steps, and what container queries fix.",
    "index.t13": "Viewport simulator",
    "index.t14": "Fluid type",
    "index.t15": "Container vs media query",
    "index.t16": "Four common traps",
    "index.c5t": "Case study",
    "index.c5d":
      "Designing a blog homepage from scratch: needs, skeleton choice, the full code, a before/after comparison and a checklist.",
    "index.t17": "Wireframe toggles",
    "index.t18": "Option comparison",
    "index.t19": "Finished product",
    "index.t20": "Before / after",
    "index.check": "Acceptance checklist",
    "index.checkD":
      "Eight checks you can run on your own pages: measure, alignment lines, hierarchy, spacing scale, keyboard order, zoom, motion preference.",
    "index.howTitle": "This site is built the way it teaches",
    "index.howDesc":
      "One requirement was that the site must itself demonstrate the methods it teaches. Here is every technique it uses — you can verify each one in the repository. Plain HTML, CSS and JavaScript, no build step.",
    "index.howCaption": "All of it lives in assets/css and assets/js, ready to read alongside this page.",
    "index.howTh1": "Technique",
    "index.howTh2": "Where it is used",
    "index.how1":
      "tokens.css holds every colour, space, type size and radius. The dark theme overrides tokens only — not a single component rule changes.",
    "index.how2":
      "The page shell (contents rail + main column), card arrays, demo stages, and the case skeleton with its breakpoint re-flow — all via auto-fit or template-areas.",
    "index.how3":
      "Top bar, control rows, switch groups, card internals, footer. Anything in a row is Flex, and “push it to the edge” is an auto margin.",
    "index.how4":
      "The type scale --step--1 … --step-5 is entirely fluid, so there is no size jump between 320px and 1600px.",
    "index.how5":
      "The comparison in 4.3: the same card component goes image-left/text-right in a wide container and stacks in a narrow one, while the media-query version does not move at all.",
    "index.how6":
      "margin-inline / padding-inline / border-inline are used throughout, so the layout works in right-to-left languages by construction.",
    "index.how7":
      "Sticky top bar, sticky chapter contents, sticky sidebar card in the case — each paired with align-self: start, without which sticky silently fails inside Grid.",
    "index.how8":
      "Every thumbnail and simulated viewport uses a ratio instead of a fixed height, so nothing jumps while loading or resizing.",
    "index.how9k": "Accessibility",
    "index.how9":
      "Semantic landmarks, a skip link, :focus-visible rings, aria-live for demo readouts, and respect for prefers-reduced-motion.",
    "index.how10k": "Interactivity",
    "index.how10":
      "All 18 demos share one ~200-line control toolkit (sliders, segmented buttons and switches dispatch one set of events), so each demo only has to answer “what changes when the data changes?”",
    "index.how11k": "Bilingual",
    "index.how11":
      "Chinese lives in the HTML, English in a config object; data-i18n attributes drive the switch site-wide, and a missing translation falls back to the original text.",
    "index.useTitle": "How to use this course",
    "index.use1t": "Read in order",
    "index.use1d":
      "The five chapters build on each other: principles → patterns → technique → responsive → case. The case keeps referring back to earlier conclusions.",
    "index.use2t": "Experiment in the demos",
    "index.use2d":
      "Each demo has a “live output” block underneath that is rewritten as you interact with it. Tune it until you like it, then copy that CSS.",
    "index.use3t": "Switch language to check terminology",
    "index.use3d":
      "The 中 / EN control switches everything, code comments included. When a term in an English article does not match what you know, switch back.",
    "index.use4t": "Run the checklist on your own page",
    "index.use4d":
      "The eight checks at the end of chapter 5 are written for your own work; tick state is remembered on this device.",

    /* ---------- 第 1 章 / Chapter 1 ---------- */
    "c1.title": "Chapter 1 · Design principles | Layout Lab",
    "c1.desc":
      "Alignment, whitespace, visual hierarchy and grid systems: turning “looks good” into rules you can execute — carried by a real blog homepage case.",
    "c1.p1.short": "Alignment",
    "c1.p2.short": "Whitespace",
    "c1.p3.short": "Hierarchy",
    "c1.p4.short": "Grid system",
    "c1.eyebrow": "Chapter 1 · Design principles",
    "c1.h1": "Turning “looks good” into rules you can execute",
    "c1.lead":
      "Layout is not decoration. Alignment, whitespace, hierarchy and grids decide what a reader sees first, in what order they read, and where they stop. This chapter picks up a real brief: designing the homepage of a personal blog, “Far Hills Notes” — starting by turning a pile of content into a readable page.",
    "c1.meta1": "4 topics",
    "c1.meta2": "4 interactive demos",
    "c1.meta3": "about 25 minutes",
    "c1.caseNote":
      "<strong>Case kick-off: the “Far Hills Notes” homepage.</strong> A pure tech blog whose author wants readers to tell within 30 seconds whether there is anything here for them — and then to keep reading. This chapter delivers a wireframe whose alignment, spacing and hierarchy all hang together. The next four chapters add the skeleton, the build, the responsive tiers and the final polish.",

    "c1.p1.title": "Alignment: getting every edge onto the same line",
    "c1.p1.sub":
      "The eye hunts for alignment lines automatically; when it cannot find them, a page reads as sloppy. The point of alignment is not beauty — it is removing edges the reader has to explain.",
    "c1.p1.h1": "What alignment actually solves",
    "c1.p1.t1":
      "One alignment line is one hint that says “these belong together”. Put a header title, the first line of body copy and a card label on the same left edge, and the reader no longer has to work out their relationship — you have taken that cost away. Conversely, <strong>every extra edge is extra noise</strong>.",
    "c1.p1.t2": "There are three kinds of line to align to, in order of strength:",
    "c1.p1.t2a":
      "<strong>The measure edge</strong> — the vertical lines bounding the content column. It is the strongest and most easily perceived, and every major block should align to it.",
    "c1.p1.t2b":
      "<strong>The text baseline</strong> — when different sizes sit side by side, let them sit on the same baseline rather than sharing a geometric centre.",
    "c1.p1.t2c":
      "<strong>Grid column lines</strong> — when the measure edge is not fine enough, subdivide with a grid (see 1.4).",
    "c1.p1.h2": "Three decisions you will keep making",
    "c1.p1.th1": "Situation",
    "c1.p1.th2": "Use",
    "c1.p1.th3": "Why",
    "c1.p1.r1c1": "Multi-line body copy",
    "c1.p1.r1c2": "Left aligned",
    "c1.p1.r1c3":
      "Every line starts in the same place, so the return sweep is cheapest. Justified mixed-script text opens holes between Latin words (rivers).",
    "c1.p1.r2c1": "Short headings, buttons",
    "c1.p1.r2c2": "Centring is fine",
    "c1.p1.r2c3":
      "One or two short lines do not break the reading rhythm, and centring focuses them.",
    "c1.p1.r3c1": "Long paragraphs",
    "c1.p1.r3c2": "Never centre",
    "c1.p1.r3c3":
      "Every line starts somewhere else, so the eye cannot find the next one. Three lines in and it is tiring.",
    "c1.p1.tip":
      "<strong>A practical test:</strong> squint at the page, or scale a screenshot down to 25%. If you can still see a few crisp vertical lines, alignment holds. If you see ragged, offset edges, something is off the line.",
    "c1.p1.td1t": "The cost of strict alignment",
    "c1.p1.td1d":
      "Everything sitting exactly on the grid makes a page rigid and a little flat, because surprise has been engineered away.",
    "c1.p1.td2t": "Deliberate breaks",
    "c1.p1.td2d":
      "Letting one large image bleed past the measure creates air and emphasis. But the break must be single and intentional — two breaks read as loss of control.",
    "c1.p1.codeTitle": "A blog card: three layers of alignment at once",
    "c1.p1.c1": "/* three layers: baseline, measure, grid */",
    "c1.p1.c2": "/* different sizes side by side → align on the baseline so text “sits” right */",
    "c1.p1.c3": "/* spacing comes from a scale too — do not invent 11px */",
    "c1.p1.c4": "/* auto margin pushes it right; no extra wrapper needed */",
    "c1.p1.c5": "/* multi-line body copy is always left aligned */",
    "c1.p1.c6": "/* and cap the measure while you are here — see 2.1 */",
    "c1.p1.c7": "/* note: the container is centred, the text is not */",
    "c1.p1.n1":
      "The difference between <code>align-items: baseline</code> and <code>center</code> is the easiest thing to spot in the demo below — switch it and watch.",
    "c1.p1.n2":
      "<code>margin-left: auto</code> is the cheapest way to push something aside in Flex: it absorbs all the remaining space, so it responds to container width for free.",
    "c1.p1.n3":
      "<code>margin-inline</code> is a logical property, so it centres correctly in both left-to-right and right-to-left languages.",
    "c1.p1.demoSub": "Notes on design and front-end",
    "c1.p1.demoText":
      "Alignment is not about tidiness. It is about sparing the reader from having to interpret your layout: heading, tag and button all on one line means the eye takes them in at a glance.",
    "c1.p1.demoBtn": "Read more",
    "d.align.text": "Text alignment",
    "d.align.left": "Left",
    "d.align.center": "Centre",
    "d.align.right": "Right",
    "d.align.items": "Item alignment (cross axis)",
    "d.align.helpers": "Helpers",
    "d.align.on": "Alignment on",
    "d.align.gcols": "Column guides",
    "d.align.gbase": "Baseline grid",
    "c1.p1.demoNote":
      "Suggested order: first switch alignment off to see what offset edges feel like, then turn on the column guides and put each element back on a line. Finally move item alignment from <code>center</code> to <code>baseline</code> and watch the avatar, title and tag shift relative to each other.",

    "c1.p2.title": "Whitespace: spacing is how structure becomes visible",
    "c1.p2.sub":
      "Whitespace is not what is left over. It carries grouping and hierarchy — and whether it works is a question of ratio, not of absolute size.",
    "c1.p2.h1": "Proximity: distance means relationship",
    "c1.p2.t1":
      "The Gestalt principle of <strong>proximity</strong> says we group what sits close together. That gives whitespace a testable rule: <strong>space inside a group must be smaller than space between groups</strong>. Title and summary close, card to card further apart, and the reader knows what belongs to one card without a divider.",
    "c1.p2.t2":
      "Reverse that relationship — inside larger than between — and the structure collapses. Readers start wondering which lines a card actually contains. This is the real diagnosis behind most pages that are “all correct but look messy”.",
    "c1.p2.h2": "A scale instead of ad-hoc numbers",
    "c1.p2.t3":
      "Do not invent a number every time you need spacing. Define a <strong>spacing scale</strong> first (say 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64) and take every gap from it. Three things follow:",
    "c1.p2.t3a": "rhythm comes from ratio rather than from a magic number;",
    "c1.p2.t3b": "change the scale once and the whole site follows, instead of page by page;",
    "c1.p2.t3c": "a team shares one vocabulary, so nobody argues about 16 versus 18.",
    "c1.p2.t4":
      "This site uses exactly that scale — see <code>--s-1 … --s-9</code> in <code>assets/css/tokens.css</code> — and every gap is a multiple of it. That is one concrete way the site demonstrates its own advice.",
    "c1.p2.td1t": "Too little whitespace",
    "c1.p2.td1d":
      "High density and more per screen, but the reader spends attention on grouping, which hurts on long copy.",
    "c1.p2.td2t": "Too much",
    "c1.p2.td2d":
      "Airy and expensive-looking, but little fits per screen, scrolling goes up, and in tool-like interfaces efficiency drops.",
    "c1.p2.td3t": "How to decide",
    "c1.p2.td3d":
      "The more a screen is meant to be read deeply (long articles, detail pages), the more whitespace it wants. The more it is scanned quickly (lists, admin tables), the less.",
    "c1.p2.codeTitle": "One scale, plus inside < between",
    "c1.p2.c1": "/* one scale, shared everywhere; the ratios matter more than the numbers */",
    "c1.p2.c2": "/* between groups: 1.9× so card-to-card clearly exceeds inside-a-card */",
    "c1.p2.c3": "/* the card's own breathing room */",
    "c1.p2.c4": "/* inside the group: 1× */",
    "c1.p2.c5": "/* tighten only where things genuinely belong together */",
    "c1.p2.c6": "/* date and tags are fine-grained parts of the same group */",
    "c1.p2.n1":
      "Use <code>gap</code> rather than <code>margin</code>: <code>gap</code> applies only between items, so nothing extra appears at the start or end and you never need <code>:last-child { margin: 0 }</code> patches.",
    "c1.p2.n2":
      "The ratios make the relationship readable: seeing <code>1.9</code> next to <code>1</code> tells you immediately which layer is “between groups”.",
    "c1.p2.n3":
      "If items use <code>clamp()</code> for fluid spacing the scale still holds — the scale itself just becomes fluid.",
    "c1.p2.d1t": "Why the holy grail layout still earns its keep",
    "c1.p2.d1m": "12 min",
    "c1.p2.d1d":
      "Three columns, full-width header and footer, main content loaded first — a 2006 brief that still shows up today.",
    "c1.p2.d2t": "Flexbox vs Grid: choose by dimension",
    "c1.p2.d2m": "6 min",
    "c1.p2.d2d": "One dimension, use Flex. Two, use Grid. There is only one test.",
    "d.space.base": "Base spacing --space",
    "d.space.presets": "Presets",
    "d.space.tight": "Tight 8px",
    "d.space.balanced": "Balanced 16px",
    "d.space.loose": "Loose 28px",
    "d.space.helpers": "Helpers",
    "d.space.group": "Between > inside (proximity)",
    "d.space.paint": "Paint the whitespace",
    "c1.p2.demoNote":
      "Turn “between > inside” off and you see the same content with the same total spacing, yet the grouping vanishes instantly — the one second in this chapter worth staring at.",

    "c1.p3.title": "Visual hierarchy: telling the reader where to start",
    "c1.p3.sub":
      "Hierarchy is not making the important thing bigger and bolder. It is establishing an order — and with a clear order the reader knows where to begin within three seconds.",
    "c1.p3.h1": "The available tools, ordered by side effects",
    "c1.p3.t1a":
      "<strong>Position</strong> — higher and further left (in left-to-right scripts) is seen sooner. The cheapest tool there is.",
    "c1.p3.t1b":
      "<strong>Size</strong> — the most direct claim of importance. Too small a jump does nothing; too large a jump crushes the body copy.",
    "c1.p3.t1c":
      "<strong>Weight</strong> — contrast without changing size, so the smallest side effects. Good for tight interfaces.",
    "c1.p3.t1d":
      "<strong>Colour and opacity</strong> — push secondary things back rather than pulling primary things forward. Quieter overall.",
    "c1.p3.t1e":
      "<strong>Whitespace</strong> — the more space around something, the more emphasis it carries. The most overlooked and most refined tool.",
    "c1.p3.t1f":
      "<strong>Decoration</strong> — borders, fills, icons. The loudest and the easiest to overdo, so normally a last resort.",
    "c1.p3.h2": "A ratio scale, not one size at a time",
    "c1.p3.t2":
      "Define a <strong>geometric type scale</strong>: <code>--base × ratio^n</code>. Base 16px with a ratio of 1.25 gives 16 / 20 / 25 / 31 — a hierarchy that exists by construction. You cannot accidentally end up with a heading 1px larger than its deck.",
    "c1.p3.t3":
      "Choosing the ratio is itself a design decision: around <strong>1.2</strong> is calm and dense, good for tool-like interfaces; <strong>1.33–1.5</strong> is dramatic, good for magazine-style pages and landing pages. The larger the ratio, the fewer usable levels — at 1.5 the fifth step is already outside a sane range.",
    "c1.p3.warn":
      "<strong>Common mistake: too many levels.</strong> Five or six type sizes on one page and the reader can no longer rank them. Most pages need three levels: <em>heading / body / note</em>. Beyond that, ask whether you are mistaking decoration for hierarchy.",
    "c1.p3.codeTitle": "Three levels from one ratio",
    "c1.p3.c1": "/* the ratio itself is the design decision */",
    "c1.p3.c2": "/* 16px   body */",
    "c1.p3.c3": "/* 20px   deck */",
    "c1.p3.c4": "/* 25px   heading */",
    "c1.p3.c5": "/* 12.8px note */",
    "c1.p3.c6": "/* weight: emphasis with the smallest side effects */",
    "c1.p3.c7": "/* the bigger the type, the tighter the line-height wants to be */",
    "c1.p3.c8": "/* large text needs negative tracking or it looks loose */",
    "c1.p3.c9": "/* push secondary information back instead of pulling primary forward */",
    "c1.p3.n1":
      "Larger type wants a smaller line-height multiple and tighter tracking — counter-intuitive, but large text already occupies more visual volume.",
    "c1.p3.n2":
      "Express the scale with <code>rem</code> or <code>calc</code> rather than writing <code>25px</code>: the former keeps the information about where the value came from.",
    "c1.p3.n3":
      "This site's <code>--step-*</code> scale uses <code>clamp()</code> (see tokens.css), so the same ratios hold on large screens too.",
    "c1.p3.dKicker": "Featured",
    "c1.p3.dTitle": "Settling the homepage with grids and whitespace",
    "c1.p3.dSub": "Sort the information first, then let the page carry the order.",
    "c1.p3.dBody":
      "Hierarchy is an order, not an ornament. When heading, deck, body and note are clearly separated, the reader does not have to work out where to start.",
    "d.hier.ratio": "Type ratio",
    "d.hier.weight": "Heading weight",
    "d.hier.mute": "Note contrast",
    "d.hier.helpers": "Helpers",
    "d.hier.labels": "Label the levels",
    "c1.p3.demoNote":
      "Take the ratio all the way down to 1.0: all four levels collapse into one size and the page goes flat — that is what missing hierarchy actually feels like.",

    "c1.p4.title": "Grids: cutting the measure into reusable shares",
    "c1.p4.sub":
      "A grid is not a restriction; it is a shared subdivision. It lets blocks that know nothing about each other still line up.",
    "c1.p4.h1": "The four parts of a grid",
    "c1.p4.t1a":
      "<strong>Columns</strong> — the containers for content. The count determines how many layouts you can express.",
    "c1.p4.t1b":
      "<strong>Gutters</strong> — the fixed gap between columns, guaranteeing a minimum distance between any two blocks.",
    "c1.p4.t1c":
      "<strong>Margins</strong> — the distance from the measure to the screen edge, which sets the maximum content width.",
    "c1.p4.t1d":
      "<strong>Baseline (optional)</strong> — a vertical grid of line-height multiples. Cross-column alignment is easy; cross-baseline alignment is hard and only worth it in very dense editorial work.",
    "c1.p4.h2": "Why 12 columns is the default",
    "c1.p4.t2":
      "12 divides by <strong>2, 3, 4 and 6</strong>. One grid therefore expresses halves, thirds, quarters and sixths — the ratios you actually use — which is why 12 became the default. 16 columns (2/4/8) suits sites with finer-grained content, and 24 shows up in design systems. All of them exist to be defined once and combined many ways.",
    "c1.p4.t3":
      "For a blog homepage, 12 is more than enough: body copy spans 8, the sidebar 4, and three cards take 4 each. <strong>More columns is not better</strong> — the more tracks there are, the harder it is to keep gutters proportionate, and layouts tend to degenerate into “everything spans the full width”, a grid in name only.",
    "c1.p4.tip":
      "<strong>Grids in the CSS Grid era:</strong> this used to need <code>float</code> plus percentages, <code>clearfix</code> and rounding errors. Today one line does it: <code>grid-template-columns: repeat(12, minmax(0, 1fr))</code>. That <code>0</code> matters — it stops long words or code from blowing a column open.",
    "c1.p4.td1t": "What a grid buys you",
    "c1.p4.td1d":
      "Consistency comes from constraint. A shared subdivision is what makes several pages feel like one system instead of each page going its own way.",
    "c1.p4.td2t": "What it costs",
    "c1.p4.td2d":
      "Strong constraints make layouts look alike. Mature practice: align structure strictly to the grid, but let visual weight (colour, image size, whitespace) break out of it.",
    "c1.p4.codeTitle": "A 12-column grid and the blocks inside it",
    "c1.p4.c1": "/* 12 columns: divisible by 2/3/4/6 */",
    "c1.p4.c2": "/* gutter */",
    "c1.p4.c3": "/* measure */",
    "c1.p4.c4": "/* margin on small screens */",
    "c1.p4.c5": "/* full width */",
    "c1.p4.c6": "/* body copy, 8 of 12 */",
    "c1.p4.c7": "/* sidebar, 4 of 12 */",
    "c1.p4.c8": "/* three per row */",
    "c1.p4.n1":
      "<code>span N</code> suits grids better than <code>grid-column: 1 / 9</code>: you declare how many shares a block takes and leave placement to auto-flow.",
    "c1.p4.n2":
      "Gutters come from <code>gap</code>, so every block gets breathing room on both sides automatically — no per-block margin maths.",
    "c1.p4.n3":
      "The grid governs what is <em>inside</em> the measure; the measure's own width and centring belong to <code>max-width</code> plus <code>margin-inline: auto</code>. Two clear jobs.",
    "c1.p4.dHero": "Full width · featured",
    "c1.p4.dMain": "Main · article stream",
    "c1.p4.dSide": "Sidebar",
    "c1.p4.dCard": "Card A",
    "c1.p4.dCard2": "Card B",
    "c1.p4.dCard3": "Card C",
    "d.grid.cols": "Columns",
    "d.grid.gutter": "Gutter",
    "d.grid.width": "Measure width",
    "d.grid.helpers": "Helpers",
    "d.grid.guides": "Show the grid",
    "c1.p4.demoNote":
      "Take the columns from 12 down to 5: the body spans 3, the sidebar 2, and only one card fits per row — “the column count decides which ratios you can express”, made visible. Then hide the grid overlay and check that the content edges still line up.",

    /* ---------- 第 2 章 / Chapter 2 ---------- */
    "c2.title": "Chapter 2 · Classic layout patterns | Layout Lab",
    "c2.desc":
      "One, two and three columns, the holy grail layout, and F- and Z-pattern reading: what each pattern is for and what it costs to build.",
    "c2.p1.short": "One column & measure",
    "c2.p2.short": "2 / 3 columns & holy grail",
    "c2.p3.short": "F and Z patterns",
    "c2.eyebrow": "Chapter 2 · Classic layout patterns",
    "c2.h1": "Skeletons: from one column to the holy grail",
    "c2.lead":
      "Layout patterns are structures that have been validated over and over. Each was born from different constraints — screen size, load order, accessibility, SEO — and knowing the differences tells you which one to copy instead of cramming everything into three columns.",
    "c2.meta1": "3 topics",
    "c2.meta2": "3 interactive demos",
    "c2.meta3": "about 22 minutes",
    "c2.caseNote":
      "<strong>Case stage 2: choosing the homepage skeleton.</strong> Chapter 1 got the content and the spacing into shape; now we decide how it sits on the page. Three candidates: <em>one column</em> (pure reading), <em>two columns</em> (stream + sidebar), <em>three columns with a full-width header and footer</em> (the holy grail). Two lines of evidence decide it: the measure, and how readers scan.",

    "c2.p1.title": "One column and the measure: the most underrated layout",
    "c2.p1.sub":
      "“One column means no layout” is a misunderstanding. One column is about line length and reading rhythm — and it is the foundation every multi-column layout rests on.",
    "c2.p1.h1": "Return sweeps set the measure",
    "c2.p1.t1":
      "Reading a line is not a smooth movement: at the end of a line the eye needs a <strong>return sweep</strong> (a saccade) back to the start of the next one. A short line means more sweeps and a choppier rhythm; a long line means a longer sweep and a greater chance of landing on the wrong line.",
    "c2.p1.t2":
      "The working ranges: <strong>45–75 characters</strong> per line for Latin scripts, spaces included — advice that has survived from metal type to the web. For Chinese, where every glyph is the same width and carries more meaning, <strong>25–40 characters</strong> a line is usually more comfortable. Note this constrains <em>body copy</em> only: headings and buttons are short and exempt.",
    "c2.p1.h2": "One column is not width: 100%",
    "c2.p1.t3":
      "The correct one-column setup is <strong>a centred container with left-aligned text</strong>. Beginners often reach for <code>text-align: center</code> to centre the layout, and end up with body copy whose lines all start somewhere different. Keep the two ideas strictly apart:",
    "c2.p1.t3a": "<strong>Centre the container</strong>: <code>max-width: 68ch; margin-inline: auto;</code>",
    "c2.p1.t3b": "<strong>Align the text</strong>: <code>text-align: left;</code> — leave it alone",
    "c2.p1.t4":
      "Express the measure in <code>ch</code> rather than <code>px</code>: <code>1ch</code> is the width of the “0” glyph in the current font, so <code>68ch</code> converts itself. Change the typeface and the measure is still about 68 characters — a textbook case of relative units beating absolute pixels.",
    "c2.p1.tip":
      "<strong>When the measure changes, line-height must follow.</strong> The wider the line, the longer the return sweep, and the more vertical guidance the eye needs in order to land on the right line. Rules of thumb: around 1.6 at <code>45ch</code>, 1.75–1.8 at <code>75ch</code>. Because Han glyphs are square and dense, add roughly 0.1 to the Latin value.",
    "c2.p1.td1t": "The upside",
    "c2.p1.td1d":
      "All the attention goes to the content; responsive behaviour needs almost no degradation logic; the friendliest option for accessibility and mobile; the cheapest to build.",
    "c2.p1.td2t": "The downside",
    "c2.p1.td2d":
      "Low information density per screen, nowhere to put secondary entry points (tags, subscribe, related posts), and a tendency to feel like one undifferentiated run of content.",
    "c2.p1.codeTitle": "One-column body copy: centre the container, align the text left",
    "c2.p1.c1": "/* measure cap: ch converts itself with the font */",
    "c2.p1.c2": "/* centre the container — not the text */",
    "c2.p1.c3": "/* body copy is always left aligned */",
    "c2.p1.c4": "/* safety margin on small screens */",
    "c2.p1.c5": "/* the wider the measure, the larger the line-height */",
    "c2.p1.c6": "/* paragraph spacing ≈ 1.5 lines, so paragraphs separate */",
    "c2.p1.c7": "/* modern browsers: avoids a single orphan word */",
    "c2.p1.c8": "/* more advanced: let the measure flex too, while staying readable */",
    "c2.p1.n1":
      "Give the cap to <code>ch</code> and the centring to <code>margin-inline</code>, and a one-column layout really is two lines of code.",
    "c2.p1.n2":
      "<code>margin-bottom: 1.5em</code> uses <code>em</code>: paragraph spacing scales with the type size, so the ratio between headings and body copy stays consistent.",
    "c2.p1.n3":
      "This site's prose container is <code>max-width: var(--measure)</code> (68ch) — the page you are reading is the demonstration.",
    "c2.p1.demoText":
      "At the end of a line the eye needs one return sweep to land accurately at the start of the next. The wider the line, the longer that sweep and the higher the chance of landing on the wrong line. Too narrow, and every line breaks almost immediately, chopping the rhythm of the sentence into pieces. Line length is not an aesthetic preference; it is a measurable reading cost.",
    "c2.p1.demoText2":
      "Drag the slider to change the container width; the readout below gives the approximate characters per line for both Chinese and Latin text.",
    "d.measure.width": "Container width",
    "d.measure.band": "readable range: 45–75 Latin characters",
    "c2.p1.demoNote":
      "Drag the slider from left to right and watch for the moment the readout turns orange — that is where it leaves the readable range. At full width (960px) it is around 55 Han characters per line, which is already long.",

    "c2.p2.title": "Two and three columns, and the holy grail: where does the main content go?",
    "c2.p2.sub":
      "The real decision in a multi-column layout is not how many columns, but which one leads — and which comes first in the DOM.",
    "c2.p2.h1": "Sidebar left or right?",
    "c2.p2.t1a":
      "<strong>Sidebar right (main content left)</strong> — follows left-to-right reading order, so the main content is seen first. The default for blogs, news and product pages.",
    "c2.p2.t1b":
      "<strong>Sidebar left</strong> — treats the sidebar as a tool (navigation, filters, contents) that users move back and forth to. Common in admin interfaces and documentation sites.",
    "c2.p2.t1c":
      "<strong>Three columns</strong> — main content in the middle with a different job either side (left for navigation or contents, right for supporting information). The most capacity, at the cost of squeezing the main column and complicating the narrow-screen fallback.",
    "c2.p2.h2": "What the holy grail actually had to solve",
    "c2.p2.t2":
      "The name comes from how hard it used to be. Three requirements: <strong>three columns + a full-width header and footer + the main content first in the DOM</strong>. That third one is the point — why must main content come first? Because screen readers, keyboard users and search engines all process the page in DOM order, and the article should be what they meet first; on a narrow screen it should appear before the sidebar as well.",
    "c2.p2.t3":
      "In other words, the holy grail is really about <strong>decoupling visual order from DOM order</strong>. The three implementations pay very different prices for that:",
    "c2.p2.th1": "Implementation",
    "c2.p2.th2": "How it works",
    "c2.p2.th3": "What it costs",
    "c2.p2.r1c1": "float + negative margins",
    "c2.p2.r1c2": "Float all three columns, then pull the outer two back into place with negative margins.",
    "c2.p2.r1c3":
      "Fragile: clearfixes and percentage maths, with one change rippling everywhere. Read it for history, not for production.",
    "c2.p2.r2c1": "Flex + order",
    "c2.p2.r2c2": "Lay out in one dimension and use order to place the main column visually in the middle.",
    "c2.p2.r2c3":
      "order only changes the visual sequence; Tab order still follows the DOM. Visual and focus order disagreeing is an accessibility problem.",
    "c2.p2.r3c1": "Grid + areas",
    "c2.p2.r3c2": "Describe the layout directly with grid-template-areas.",
    "c2.p2.r3c3":
      "Almost no cost: the declaration is the layout, and the DOM can follow content priority exactly.",
    "c2.p2.warn":
      "<strong>Do not reach for three columns because it looks advanced.</strong> Every extra column takes width away from the main content and adds a breakpoint to get wrong. The test is simple: does the reader need to see what is in the sidebar <em>at the same time</em> as the article? If yes (contents, filters), give it a column. If it is just “somewhere to put things” (tag cloud, subscribe box), it does not deserve one — the footer is cleaner.",
    "c2.p2.codeTitle": "The holy grail: the Grid version (recommended)",
    "c2.p2.c1": "/* HTML order = content priority: main → nav → aside */",
    "c2.p2.c2": "/* <main> <nav> <aside> */",
    "c2.p2.c3": "/* the layout is fully declared here, readable at a glance */",
    "c2.p2.c4": "/* main occupies the middle track */",
    "c2.p2.c5": "/* the fallback: one breakpoint folds three columns into one */",
    "c2.p2.n1":
      "The header and footer need nothing special — they sit outside <code>.body</code>, so they are full width by nature.",
    "c2.p2.n2":
      "<code>grid-template-areas</code> turns the layout into a declaration you can literally draw, which is why it suits layout better than <code>order</code>.",
    "c2.p2.n3":
      "In the fallback, changing the areas to a single column returns visual order to DOM order (main first) — consistent, with no risk of “the sidebar comes first on phones”.",
    "c2.p2.dHead": "Header · full width",
    "c2.p2.dMain": "main · body copy (first in the DOM)",
    "c2.p2.dNav": "nav · navigation",
    "c2.p2.dAside": "aside · sidebar",
    "c2.p2.dFoot": "Footer · full width",
    "d.pattern.pattern": "Layout pattern",
    "d.pattern.single": "One column",
    "d.pattern.twoRight": "Two columns (sidebar right)",
    "d.pattern.twoLeft": "Two columns (sidebar left)",
    "d.pattern.three": "Three columns",
    "d.pattern.holy": "Holy grail (three columns + full-width header/footer)",
    "d.pattern.impl": "Implementation",
    "d.pattern.implNote":
      "Switch the implementation and watch the live output below change — same result, different price.",
    "c2.p2.demoNote":
      "Notice that “DOM order: main → nav → aside” stays the same in every pattern — only the visual position changes. Switch to the Flex implementation and read the last comment in the output: the accessibility risk that order brings.",

    "c2.p3.title": "F- and Z-patterns: how readers scan by default",
    "c2.p3.sub":
      "These patterns describe what happens when a page offers no clear visual guidance — not a law you have to obey.",
    "c2.p3.h1": "F-pattern: dense, content-heavy pages",
    "c2.p3.t1":
      "On search results, article lists and long-form pages, eye-tracking studies keep finding the same thing: the gaze sweeps <strong>across the top</strong>, moves down, sweeps across again (usually shorter), and then <strong>scans vertically down the left</strong> while the right-hand side goes unread — a path shaped like an F. Three practical consequences:",
    "c2.p3.t1a":
      "put important information high and left, and do not expect anyone to read the middle-right of the page;",
    "c2.p3.t1b":
      "the first few words of each block do the identifying work (vertical scanning mostly catches block openings), so “conclusion first” is a layout strategy as well as a writing one;",
    "c2.p3.t1c": "lists are easier to scan than paragraphs — they sit on the left alignment line by nature.",
    "c2.p3.h2": "Z-pattern: sparse landing pages",
    "c2.p3.t2":
      "When a page has few elements and a clear hero, the gaze goes top-left (brand) → top-right (navigation or hero) → diagonally down to bottom-left → across to bottom-right. A path shaped like a Z. The practical reading: <strong>put the call to action where the path ends, bottom right</strong>, and let elements along the diagonal echo each other so the gaze slides down smoothly.",
    "c2.p3.tip":
      "<strong>Important caveat: both patterns are fallbacks for when guidance is absent.</strong> Once you build real guidance out of hierarchy and whitespace, readers follow the guidance — which is why a well-set page does not follow an F. So build the guidance first, then use F/Z to check you have not parked anything important in a blind spot.",
    "c2.p3.h3": "Three limits that are easy to forget",
    "c2.p3.t3a":
      "<strong>Script direction</strong> — the F-pattern assumes left-to-right writing. In Arabic and other right-to-left (RTL) scripts the pattern mirrors.",
    "c2.p3.t3b":
      "<strong>Mobile</strong> — once the screen is narrow enough for one column, horizontal scanning disappears and the F degenerates into a single vertical sequence. At that point <em>content order</em> matters far more than horizontal position.",
    "c2.p3.t3c":
      "<strong>It is not a law handed down by measurement</strong> — sample, task and content all affect eye-tracking results. Treat it as a heuristic, not physics.",
    "c2.p3.codeTitle": "The typographic strategy behind each pattern",
    "c2.p3.c1": "/* F-pattern: article lists and search results — strengthen the left edge and block openings */",
    "c2.p3.c2": "/* main information takes the wide left block */",
    "c2.p3.c3": "/* the left alignment line anchors all scanning */",
    "c2.p3.c4": "/* bold title: the first thing caught in a vertical scan */",
    "c2.p3.c5": "/* title and summary close together = one group */",
    "c2.p3.c6": "/* Z-pattern: landing pages — hero and CTA form a diagonal */",
    "c2.p3.c7": "/* a little text can be centred, creating a symmetric landing point */",
    "c2.p3.c8": "/* the button sits where the gaze path ends: bottom right */",
    "c2.p3.n1":
      "Note that the two scenarios use <code>text-align</code> in opposite ways: the F-pattern uses left alignment to anchor scanning, the Z-pattern uses centring to create a symmetric landing point — and centring is only safe because the text is short.",
    "c2.p3.n2":
      "In the F-pattern case, pulling the summary close to its title (<code>2px</code>) while pushing the next item away applies exactly the proximity principle from 1.2.",
    "c2.p3.n3":
      "All of this is layout merely “going with the gaze”; the real guidance still comes from hierarchy and whitespace.",
    "d.fz.pattern": "Reading pattern",
    "d.fz.f": "F-pattern",
    "d.fz.z": "Z-pattern",
    "d.fz.replay": "Path animation",
    "d.fz.replayBtn": "Replay the scan path",
    "c2.p3.demoNote":
      "Switching the pattern also rearranges the wireframe above: the F version pulls the title and list to the left and stacks them in a column, while the Z version centres the hero and pushes the button to the bottom right — that is what “laying out along the gaze” looks like.",

    /* ---------- 第 3 章 / Chapter 3 ---------- */
    "c3.title": "Chapter 3 · Flexbox and Grid | Layout Lab",
    "c3.desc":
      "Flexbox and Grid: how each works, when to use which, and grid-template-areas to draw your layout — with four interactive playgrounds.",
    "c3.p1.short": "Flexbox",
    "c3.p2.short": "Grid",
    "c3.p3.short": "Named areas",
    "c3.p4.short": "Choosing between them",
    "c3.eyebrow": "Chapter 3 · Modern layout technique",
    "c3.h1": "Flexbox and Grid: division of labour, principles, and choosing",
    "c3.lead":
      "These two modules are not rivals; they divide the work. Once the one-dimension / two-dimension line is clear, you can decide which one to reach for before writing the first line — instead of writing Flex, discovering it does not fit, and rewriting with Grid.",
    "c3.meta1": "4 topics",
    "c3.meta2": "4 interactive demos",
    "c3.meta3": "about 30 minutes",
    "c3.caseNote":
      "<strong>Case stage 3: turning the skeleton into code.</strong> The skeleton is settled: three columns on desktop (archive / stream / info), two on tablets, one on phones. The job now is picking the right tool — Grid for the page skeleton, Flex inside the components — and keeping that division consistent across the whole stylesheet.",

    "c3.p1.title": "Flexbox: a distribution problem on one axis",
    "c3.p1.sub":
      "Flex solves exactly one thing: laying a set of items along a single axis and deciding how the leftover space is shared.",
    "c3.p1.h1": "Main axis and cross axis",
    "c3.p1.t1":
      "A Flex container has two axes: the <strong>main axis</strong> (set by <code>flex-direction</code>) and the <strong>cross axis</strong>, perpendicular to it. Every property applies to one axis or the other, and once that is clear the property names stop needing to be memorised:",
    "c3.p1.t1a":
      "<code>justify-content</code> → distribution along the main axis (how items and ends share the space)",
    "c3.p1.t1b":
      "<code>align-items</code> → alignment on the cross axis (how each item sits within a single line)",
    "c3.p1.t1c":
      "<code>align-content</code> → distribution of the <em>lines themselves</em> on the cross axis (only meaningful once wrapping produces more than one line)",
    "c3.p1.t2":
      "Change the direction and the two roles swap — after <code>flex-direction: column</code>, <code>justify-content</code> governs the vertical. This is the most common source of Flex confusion: people think a property is broken when the axis has simply changed.",
    "c3.p1.h2": "The container decides how to arrange; items decide how much to take",
    "c3.p1.t3": "On the item side, three properties answer “how much space does this one take?”:",
    "c3.p1.t3a":
      "<code>flex-grow</code> — who gets a share of the leftover, in proportion (default 0, i.e. not participating)",
    "c3.p1.t3b":
      "<code>flex-shrink</code> — who can be squeezed when there is not enough room (default 1)",
    "c3.p1.t3c":
      "<code>flex-basis</code> — the starting size before sharing (default <code>auto</code>, meaning the content decides)",
    "c3.p1.t4":
      "Day to day you mostly use two shorthands: <code>flex: 1 1 0</code> (split the leftover equally) and <code>flex: 0 0 200px</code> (exactly 200px, do not shrink). Note that <code>flex: 1</code> expands to <code>1 1 0%</code>, and that <code>basis: 0</code> means “ignore content width, split from zero” — which is exactly how it differs from <code>flex: auto</code> (= <code>1 1 auto</code>, where wider content ends up wider).",
    "c3.p1.warn":
      "<strong>Two traps that catch everyone.</strong> First, <code>min-width: auto</code>: Flex items refuse to shrink below their content by default, so a long string or code line bursts the container — add <code>min-width: 0</code>. Second, deep nesting: faking a two-dimensional table with Flex-inside-Flex gets out of hand fast, and that is precisely Grid's job.",
    "c3.p1.td1t": "Where Flex shines",
    "c3.p1.td1d":
      "Navigation bars, button groups, form rows, inside a card (image + text), footers pinned to the bottom — anything that is “a row of things”.",
    "c3.p1.td2t": "Where Flex stops",
    "c3.p1.td2d":
      "It knows nothing about columns: separate containers cannot share tracks, so aligning titles across cards or equalising heights across rows needs another tool.",
    "c3.p1.codeTitle": "Inside a card: a typical Flex scenario",
    "c3.p1.c1": "/* main axis becomes vertical: the card stacks */",
    "c3.p1.c2": "/* allow shrinking so long content cannot burst the container */",
    "c3.p1.c3": "/* cross axis (vertical) centring */",
    "c3.p1.c4": "/* main axis (horizontal): spread to the ends */",
    "c3.p1.c5": "/* auto margin eats the leftover → footer pushed to the bottom */",
    "c3.p1.c6": "/* grow shrink basis: split the available width */",
    "c3.p1.c7": "/* paired with overflow:hidden, this is what makes the ellipsis appear */",
    "c3.p1.n1":
      "<code>margin-top: auto</code> is one of the most useful tricks in Flex: it swallows whatever space is left, so the footer is pushed to the bottom without <code>position: absolute</code> or a fixed height.",
    "c3.p1.n2":
      "Note <code>min-width: 0</code> appearing twice — once on the container (so it can be compressed) and once on the title (so the ellipsis works). This is the actual cause of most “Flex mysteries”.",
    "c3.p1.n3":
      "Use <code>gap</code> instead of <code>margin-right</code>: no last-child exception, and the spacing is not eaten when things compress.",
    "c3.p1.demoNote":
      "Suggested path: set flex-wrap to wrap and pull the container height to 300, then try each align-content value — you will see the difference between “aligning one line” and “distributing several”. Then switch to column and watch the two axes trade roles, labels included.",
    "d.flex.height": "Container height (0 = auto)",
    "d.flex.count": "Item count",
    "d.flex.axes": "Helpers",
    "d.flex.axesOn": "Show both axes",
    "d.flex.grow": "Give one item flex-grow: 1 (check whether it absorbs the leftover)",

    "c3.p2.title": "Grid: draw the tracks first, then place the content",
    "c3.p2.sub":
      "Grid works the opposite way round from Flex: define the row and column tracks on the container, then drop items into the cells.",
    "c3.p2.h1": "Tracks, cells, areas",
    "c3.p2.t1":
      "Grid cuts the container into <strong>tracks</strong> (rows and columns); crossing tracks form <strong>cells</strong>, and adjacent cells combine into <strong>areas</strong>. Items are placed in one of three ways: automatically (the default, in source order), by line number (<code>grid-column: 2 / 4</code>), or by name (<code>grid-area: main</code>).",
    "c3.p2.t2":
      "The keyword is <strong>declare, then place</strong>. You describe the layout before writing the content, which is exactly why it can replace a pile of breakpoints and nested wrappers.",
    "c3.p2.h2": "fr and minmax: two ways to write a flexible track",
    "c3.p2.t2a":
      "<code>1fr</code> means “one share of the leftover space”. <code>1fr 2fr 1fr</code> splits the leftover 1:2:1 across three columns.",
    "c3.p2.t2b":
      "The difference between <code>minmax(0, 1fr)</code> and <code>1fr</code> matters: when a track's minimum is <code>auto</code>, content (long words, code, tables) can push it wider than one share and the whole grid overflows. <strong>If a column can contain unpredictable content, write <code>minmax(0, 1fr)</code>.</strong>",
    "c3.p2.t2c":
      "<code>minmax(200px, 1fr)</code> mixes fixed and flexible: the sidebar is always 200px and the main column takes the rest. <code>minmax(0, 220px)</code> instead says “at most 220px, shrink if you must”.",
    "c3.p2.h3": "auto-fill / auto-fit: responsiveness with no media queries",
    "c3.p2.t3":
      "<code>repeat(auto-fill, minmax(220px, 1fr))</code> is the single most valuable line in Grid: widen the container and you get more columns, narrow it and you get fewer, <strong>with no media query at all</strong>. Two things to know:",
    "c3.p2.t3a":
      "<code>auto-fill</code> keeps empty tracks; <code>auto-fit</code> collapses them. Use <code>auto-fit</code> when there are few items and you want them to fill the row; use <code>auto-fill</code> when you want to preserve the same column rhythm as elsewhere.",
    "c3.p2.t3b":
      "The minimum inside <code>minmax()</code> decides at what width a new column appears — it is a breakpoint, just one the browser computes for you.",
    "c3.p2.tip":
      "<strong>Explicit and implicit grids.</strong> The rows you declare are the explicit grid; anything extra is absorbed by rows the browser generates — the <strong>implicit grid</strong>. <code>grid-auto-rows: minmax(120px, auto)</code> controls the minimum height of those generated rows, the usual way to keep a card wall on a steady rhythm.",
    "c3.p2.codeTitle": "Three track patterns for three scenarios",
    "c3.p2.c1": "/* 1. equal shares: three columns of the same width */",
    "c3.p2.c2": "/* 2. fixed + flexible: the sidebar is constant, main takes the rest */",
    "c3.p2.c3": "/* 3. self-fitting card wall: no media query, more columns as it widens */",
    "c3.p2.c4": "/* implicit rows get a minimum height too */",
    "c3.p2.c5": "/* explicit placement: make one item span columns or rows */",
    "c3.p2.c6": "/* from the first line to the last = full width */",
    "c3.p2.c7": "/* two rows tall — the usual “one lead, several secondary” card wall */",
    "c3.p2.n1":
      "<code>-1</code> in <code>1 / -1</code> means “the last column line”, so it is full width whatever the column count — safer than writing <code>1 / 13</code>.",
    "c3.p2.n2":
      "The price of the self-fitting wall is that column widths are not exactly controllable (they float within a 220px window); pixel-exact layouts still need breakpoints or named areas.",
    "c3.p2.n3":
      "This site's demo stages, card arrays and shelf layouts use <code>repeat(auto-fit, minmax(...))</code> heavily: it is the main tool for “fewer breakpoints”.",
    "d.grid.count": "Item count",
    "c3.p2.demoNote":
      "Three things to try: ① switch to <code>repeat(auto-fill, …)</code> and resize the window — the column count changes on its own; ② switch to <code>1fr 2fr 1fr</code> and click justify-items start/center to move items inside their cells; ③ set rows to <code>repeat(2, …)</code> and add items up to 6 — watch the implicit rows catch the overflow.",

    "c3.p3.title": "Named areas: drawing the layout",
    "c3.p3.sub":
      "grid-template-areas lets you describe page structure in ASCII — arguably the closest CSS gets to WYSIWYG.",
    "c3.p3.h1": "Draw the structure with characters",
    "c3.p3.t1":
      "Each string is a row, each name inside it is a cell, adjacent cells with the same name merge into one area, and <code>.</code> is an empty cell. The “drawing” below is an executable layout declaration:",
    "c3.p3.t2":
      "Two advantages are hard to get any other way: <strong>① readability</strong> — six months later you can still say what the page looks like from those lines; <strong>② decoupling from DOM order</strong> — the HTML can follow content priority (article first) while the visual position comes from the drawing.",
    "c3.p3.h2": "One hard rule: areas must be rectangles",
    "c3.p3.t3":
      "CSS requires that <strong>an area with a given name forms a rectangle</strong>. Draw <code>a</code> as an L shape or as two disconnected blocks and the entire <code>grid-template-areas</code> declaration is <em>discarded</em> — not partially applied — so every item falls back to auto placement and the page looks inexplicably broken. It is the one serious trap in named areas, and the good news is that it is easy to check by eye: <strong>the same name must join up into a block</strong>.",
    "c3.p3.tip":
      "<strong>For breakpoints, you just redraw the picture.</strong> Responsive work needs no HTML changes and no rewriting of properties — inside <code>@media</code>, swap the areas for a single-column version, which is exactly what this site's case does in chapters 4 and 5.",
    "c3.p3.td1t": "When it is worth it",
    "c3.p3.td1d":
      "Page-level areas that have names (header / nav / main / aside / footer). The larger and more stable the areas, the more named areas pay off.",
    "c3.p3.td2t": "When it is not",
    "c3.p3.td2d":
      "For homogeneous card arrays (every card identical), <code>repeat(auto-fill, …)</code> is simpler; naming each card just adds noise.",
    "c3.p3.codeTitle": "A complete page skeleton",
    "c3.p3.c1": "/* these three strings are the layout */",
    "c3.p3.c2": "/* dvh, not vh: no jump when the mobile address bar shows and hides */",
    "c3.p3.c3": "/* the breakpoint redraws the picture; no HTML changes at all */",
    "c3.p3.n1":
      "Whitespace between the strings does not matter, but <strong>every string must have the same number of characters</strong> (the same column count), or the declaration is just as invalid.",
    "c3.p3.n2":
      "Use <code>.</code> to leave a genuine gap — <code>\". main side\"</code> leaves the first column completely empty on that row.",
    "c3.p3.n3":
      "The order inside the breakpoint is the mobile reading order: promoting <code>main</code> above <code>rail</code> means readers meet the article first.",
    "c3.p3.dA": "header a",
    "c3.p3.dB": "body b",
    "c3.p3.dC": "aside c",
    "c3.p3.dEmpty": "No areas painted yet",
    "d.areas.boardHint":
      "Click the cells to paint (current brush is set below); a / b / c stand for header / body / aside.",
    "d.areas.previewHint":
      "This is what the browser renders from the grid-template-areas you generated:",
    "d.areas.brush": "Brush",
    "d.areas.erase": "Erase",
    "d.areas.actions": "Actions",
    "d.areas.clear": "Clear",
    "c3.p3.demoNote":
      "Deliberately paint a “disconnected a” (say a a a on the top row, then another a in the middle of the bottom row): the status immediately goes to “invalid” and the preview falls apart — that is CSS discarding the whole declaration. Clear it, paint two tidy rectangles, and everything returns.",

    "c3.p4.title": "Choosing: three questions settle it",
    "c3.p4.sub":
      "Do not discover that you needed Grid only after writing Flex. The decision compresses into three yes/no questions.",
    "c3.p4.h1": "One primary test: dimensionality",
    "c3.p4.t1":
      "<strong>One dimension, use Flex. Two, use Grid.</strong> “Dimensionality” does not mean “looks like a few rows and columns”; it means <em>whether you need to control rows and columns at the same time</em>. A navigation bar is a row of items — one dimension, Flex. A card wall where titles, bodies and buttons must line up both across and down — two dimensions, Grid (with Flex inside).",
    "c3.p4.h2": "Two supporting tests",
    "c3.p4.t2a":
      "<strong>Who decides the size?</strong> Content-driven (items are as wide as their content, then leftover space is shared) → Flex; <code>flex-basis: auto</code> is content-first by default. Layout-driven (the page is decided first and the content adapts to the cells) → Grid.",
    "c3.p4.t2b":
      "<strong>Do things need to align across containers?</strong> Several cards in one row whose titles must sit on the same baseline require a shared row track, and only Grid has those. Flex items are independent and cannot align to each other's rows.",
    "c3.p4.h3": "How they usually work together: Grid for the skeleton, Flex for the parts",
    "c3.p4.t3":
      "In real projects the two almost always appear together with a clean division: <strong>Grid at page and region level</strong> (header / main / aside / card arrays), <strong>Flex inside components</strong> (button groups, tag rows, a card's image + text, a row of footer links). This site works the same way: the shell and card arrays are Grid, while the top bar, control rows and card internals are Flex.",
    "c3.p4.tip":
      "<strong>The inverse heuristic is useful too:</strong> if you find yourself nesting three levels of Flex purely to align to a grid, you almost certainly picked the wrong tool; and if you keep tuning <code>auto-fit</code> and <code>justify-content</code> to make Grid items “size to their content”, you probably want Flex.",
    "c3.p4.codeTitle": "The same “three cards per row”, two ways",
    "c3.p4.c1": "/* A. Flex: items are independent, widths agreed via flex-basis */",
    "c3.p4.c2": "/* each card at least 220px, leftover split evenly */",
    "c3.p4.c3":
      "/* ⚠️ a short last row stretches its cards to fill — sometimes what you want,\n   but if columns must stay equal you need a spacer or Grid */",
    "c3.p4.c4": "/* B. Grid: tracks first, cards only claim space */",
    "c3.p4.c5":
      "/* column width comes from the tracks, so cards in a row are equal by construction;\n   the inside of each card is then laid out with Flex (see 3.1) */",
    "c3.p4.c6": "/* buttons pinned to the bottom, all on one line */",
    "c3.p4.n1":
      "Both work. The difference is <strong>who guarantees the column width</strong>: in the Flex version each item does, in the Grid version the tracks do.",
    "c3.p4.n2":
      "Note that the Grid version still uses Flex — this is not either/or, it is layered: the outer Grid handles columns, the inner Flex handles the card's vertical order and bottom alignment.",
    "c3.p4.n3":
      "If card content varies a lot (titles of one or two lines, summaries of different lengths), adding <code>grid-auto-rows: 1fr</code> to the Grid version forces equal row heights; the Flex version cannot do that.",
    "d.decide.q1": "① Do you need to control rows and columns at the same time?",
    "d.decide.dim1": "Just one dimension (a row or a column)",
    "d.decide.dim2": "Two dimensions (rows and columns)",
    "d.decide.q2": "② Who decides an item's size?",
    "d.decide.drive1": "The content (as wide as it needs)",
    "d.decide.drive2": "The layout (the page is decided first)",
    "d.decide.q3": "③ Do things need to align across cards? (every title and button on one line)",
    "d.decide.cross1": "No",
    "d.decide.cross2": "Yes",
    "d.decide.c1t": "A short title",
    "d.decide.c1b": "Content width decides card width; leftover space is shared by flex-grow.",
    "d.decide.read": "Read",
    "d.decide.c2t": "A noticeably longer title takes noticeably more width",
    "d.decide.c2b": "So the buttons in one row no longer sit on the same line.",
    "d.decide.c3t": "A medium title",
    "d.decide.c3b": "Card widths float with their content.",
    "c3.p4.demoNote":
      "Change the three answers and the verdict updates live, highlighting the winning panel. Note the second card in particular: whether the buttons line up is the visual proof of the third test.",

    /* ---------- 第 4 章 / Chapter 4 ---------- */
    "c4.title": "Chapter 4 · Responsive layout | Layout Lab",
    "c4.desc":
      "Breakpoint design, mobile-first strategy, clamp() fluid typography and container queries — plus the four most common responsive traps.",
    "c4.p1.short": "Breakpoints & mobile first",
    "c4.p2.short": "Fluid typography",
    "c4.p3.short": "Container queries & traps",
    "c4.eyebrow": "Chapter 4 · Responsive layout",
    "c4.h1": "One codebase, every width",
    "c4.lead":
      "Responsive is not “a stylesheet per device”; it is “a layout that holds at any width”. This chapter turns the skeleton from the last chapter into a mobile-first structure and adds two advanced tools: fluid typography and container queries.",
    "c4.meta1": "3 topics",
    "c4.meta2": "3 interactive demos",
    "c4.meta3": "about 25 minutes",
    "c4.caseNote":
      "<strong>Case stage 4: making the homepage readable on a phone.</strong> Three moves only: write the narrow-screen styles as the default, enhance upward with <code>min-width</code>, and make the type fluid. The viewport simulator below runs the case homepage's real code — drag the width, and every reflow you see comes from those three media queries.",

    "c4.p1.title": "Breakpoints belong where the layout breaks",
    "c4.p1.sub":
      "A breakpoint is not a device list. Device widths change every year; “two columns squeezed into 200px each is unreadable” does not.",
    "c4.p1.h1": "How to find your breakpoints",
    "c4.p1.t1":
      "Drag the browser window from its narrowest to its widest, and <strong>note the first width where something looks wrong</strong> — usually text starting to touch the edge, a button squashed out of shape, or two columns crowding each other. That is your breakpoint. It is decided by <em>your content</em>, not by a phone model, which is why breakpoints found this way never need updating when a new device ships.",
    "c4.p1.h2": "Mobile first: write the default styles for narrow screens",
    "c4.p1.t2":
      "Mobile-first does not mean “think about phone users first” — it is a <strong>writing order</strong>: the default styles are the simplest, single-column version, and you layer upward with <code>min-width</code>. Four practical benefits:",
    "c4.p1.t2a":
      "it forces a decision about content priority — a narrow screen cannot hold everything, so something has to be ranked;",
    "c4.p1.t2b":
      "the cascade only ever runs one way: later rules override earlier ones, so you only add, never untangle;",
    "c4.p1.t2c":
      "the baseline is the simplest version, so it still works on old devices, slow networks and anywhere media queries fail;",
    "c4.p1.t2d":
      "there is no need to cut desktop styles back with <code>max-width</code>, which avoids layers of overriding and the <code>!important</code> firefighting that follows.",
    "c4.p1.t3":
      "Desktop-first (default wide, then chopping downward with <code>max-width</code>) makes every addition a subtraction: combinations between breakpoints get missed, and in the end <code>!important</code> is called in to hold earlier rules down.",
    "c4.p1.h3": "How many breakpoints",
    "c4.p1.t4":
      "Two to four is usually enough. This site's case uses <strong>three</strong>: <code>600px</code> (body + sidebar), <code>900px</code> (wider measure, two-column stream), <code>1200px</code> (three columns: archive / stream / info). Every extra breakpoint adds another set of widths to test, and the more of them there are, the more likely you end up with a layout that only looks right at certain widths.",
    "c4.p1.tip":
      "<strong>First ask whether you need a breakpoint at all.</strong> Anything <code>repeat(auto-fit, minmax(...))</code>, <code>flex-wrap</code> or <code>clamp()</code> can solve should not get a media query — those hold at every width, and you never have to guess where the layout breaks.",
    "c4.p1.codeTitle": "The case homepage's three breakpoints (mobile first)",
    "c4.p1.c1": "/* default = phone: one column, stacked */",
    "c4.p1.c2": "/* 600px: stream + sidebar. Why 600? Because below it both columns are too narrow */",
    "c4.p1.c3": "/* 900px: wider measure, two-column stream */",
    "c4.p1.c4": "/* 1200px: three columns — the archive rail appears */",
    "c4.p1.c5": "/* however wide it gets, the measure never stretches */",
    "c4.p1.n1":
      "Every breakpoint only enhances: it adds columns, spacing or regions. None has to undo the previous tier — the practical payoff of mobile-first.",
    "c4.p1.n2":
      "<code>max-width: 1180px</code> appears only in the last tier: the layout stops stretching on very wide screens and the measure stays readable (back to the constraint from 2.1).",
    "c4.p1.n3":
      "Breakpoint values live in the CSS, but each needs a note saying which problem it solves — in six months you will remember the number, not the reason.",
    "c4.p1.demoNote":
      "Drag the slider (or use the device presets) and watch three things: the current tier highlighted on the ruler, the homepage reflowing inside the iframe, and which media query is hit in the live output. When the viewport is wider than the demo area the simulator scales down proportionally — but the iframe's real CSS width is unchanged, so the media queries are not lying.",
    "d.vp.p375": "Phone 375",
    "d.vp.p768": "Tablet 768",
    "d.vp.p1024": "Laptop 1024",
    "d.vp.p1280": "Desktop 1280",
    "d.vp.width": "Viewport width",
    "d.vp.bp": "Breakpoints",
    "d.vp.bpList": "phone 320–599 / tablet 600–899 / laptop 900–1199 / desktop ≥1200",

    "c4.p2.title": "Fluid typography: smoothing the gaps between breakpoints",
    "c4.p2.sub":
      "Three breakpoints means everything jumps a step at 599 → 600px. clamp() exists to flatten those steps.",
    "c4.p2.h1": "clamp(minimum, preferred, maximum)",
    "c4.p2.t1":
      "The three arguments are literal: use the preferred value while it lies inside the range, and clamp it when it does not. Put <code>vw</code> into the preferred value and the type size changes <strong>continuously</strong> with the viewport:",
    "c4.p2.t1a": "<strong>4vw provides the scaling</strong>: every extra 100px of viewport adds about 4px;",
    "c4.p2.t1b":
      "<strong>+ 0.5rem provides a base</strong>: pure <code>vw</code> scales down to unreadable (12.8px on a 320px viewport), so a constant that does not scale keeps very small screens off the floor;",
    "c4.p2.t1c":
      "<strong>Express the limits in rem</strong> rather than px: it respects a reader who has raised their browser's default size — an accessibility requirement, and the core reason to set type in <code>rem</code>.",
    "c4.p2.h2": "An easily missed trade-off: fluid type, discrete spacing",
    "c4.p2.t2":
      "If type can be fluid, why not spacing? Because the two care about different things: <strong>type needs visual continuity</strong> (steps are obvious), while <strong>spacing needs a countable rhythm</strong>. Make spacing fluid too and the scale from 1.2 stops meaning anything — you can no longer point at a value and call it “the spacing inside a group”.",
    "c4.p2.t3":
      "The more robust division of labour: <strong>keep spacing on a few discrete steps (dropping the whole scale a notch on narrow screens) and use fluid values for type and inline detail</strong>. This site does exactly that — <code>--s-1 … --s-9</code> are fixed steps, while every <code>--step-*</code> is a <code>clamp()</code>.",
    "c4.p2.warn":
      "<strong>Do not write a pure-vw preferred value.</strong> <code>clamp(1rem, 5vw, 3rem)</code> drops below 16px on small screens (5vw of a 320px viewport is only 16px), and <code>min</code> is exactly the value that should never be reached. <code>clamp(1rem, 2vw + 1rem, 3rem)</code> is safer: a gentler slope and a larger base.",
    "c4.p2.codeTitle": "A fluid type scale and the properties that go with it",
    "c4.p2.c1": "/* stepped, but the transitions between steps are continuous rather than a jump */",
    "c4.p2.c2": "/* fluid type needs unitless line-height */",
    "c4.p2.c3": "/* the bigger the type, the tighter the tracking */",
    "c4.p2.c4": "/* headings balance their own line breaks, avoiding a one-word last line */",
    "c4.p2.c5": "/* spacing stays on discrete steps: countable rhythm, shareable vocabulary */",
    "c4.p2.c6": "/* drop the scale a notch on narrow screens instead of making each value fluid */",
    "c4.p2.n1":
      "Note that each step has a different <code>vw</code> coefficient: small text barely scales (<code>0.1vw</code>) while large text scales noticeably (<code>1.8vw</code>). That is what makes the hierarchy open up on large screens.",
    "c4.p2.n2":
      "Line-heights are unitless, so they scale with the font size and need no per-step definition.",
    "c4.p2.n3":
      "<code>text-wrap: balance</code> and <code>pretty</code> are newer typographic properties that push line breaking closer to professional typesetting — where unsupported they fall back to normal behaviour, so they are safe enhancements.",
    "c4.p2.demoNote":
      "Inside this iframe, <code>1vw</code> is 1% of the <em>iframe's</em> width, so dragging the width slider genuinely triggers vw changes rather than simulating them. Set the scaling coefficient to 0 and the title stops moving entirely; set it to 8vw and small widths hit the floor almost immediately.",
    "d.fluid.min": "Minimum (rem)",
    "d.fluid.vw": "Scaling coefficient (vw)",
    "d.fluid.rem": "Base (rem)",
    "d.fluid.max": "Maximum (rem)",
    "d.fluid.width": "Container width",

    "c4.p3.title": "Container queries: letting a component know how wide its container is",
    "c4.p3.sub":
      "A media query only knows the viewport. The same card in a main column and in a sidebar cannot tell the difference — which is exactly what container queries fix.",
    "c4.p3.h1": "The built-in limit of media queries",
    "c4.p3.t1":
      "A media query asks about the <strong>viewport</strong>. So the same card component should be “image left, text right” in a 700px main column and “stacked” in a 240px sidebar — but at a 1200px viewport both situations exist <em>at the same time</em>, and a media query cannot tell them apart. The old workaround was variant classes (<code>.card--compact</code>), which means every page using the component has to remember to add the right one.",
    "c4.p3.h2": "How container queries solve it",
    "c4.p3.t2":
      "Container queries move the question from the viewport to the <strong>width of an ancestor container</strong>: the parent declares <code>container-type: inline-size</code> and the component writes rules with <code>@container</code>. The component's behaviour is then decided by the container it is placed in rather than by the reader's screen — which matches how components are actually thought about, making one a genuinely self-adapting unit.",
    "c4.p3.t2a":
      "<code>container-name</code> names the container so nested cases can target it precisely (<code>@container card (min-width: 400px)</code>);",
    "c4.p3.t2b":
      "Beyond width there are container query units such as <code>cqw</code> / <code>cqi</code>, which let type scale against the <em>container</em> rather than the viewport;",
    "c4.p3.t2c":
      "the cost is one more layer of reasoning when debugging: if a component looks wrong, first ask how wide its container is.",
    "c4.p3.warn":
      "<strong>One trap: <code>container-type: inline-size</code> stops the container's own size depending on its content.</strong> So do not put it on something that needs to be sized by its content (a shrink-to-fit button, for instance). It belongs on the <em>layout container that supplies width</em>, with the components inside querying it.",
    "c4.p3.h3": "The four most common responsive traps",
    "c4.p3.th1": "Trap",
    "c4.p3.th2": "Why it breaks",
    "c4.p3.th3": "Do this instead",
    "c4.p3.r1c1": "Fixed heights + absolute positioning",
    "c4.p3.r1c2":
      "The moment content wraps or the font size grows it overflows, overlaps, and the container does not expand.",
    "c4.p3.r1c3":
      "Use <code>min-height</code> and normal flow; where overlap is genuinely needed, stack two layers with Grid.",
    "c4.p3.r2c1": "<code>100vh</code> for full-height sections",
    "c4.p3.r2c2":
      "The mobile address bar showing and hiding changes the viewport height, cropping or shifting the first screen.",
    "c4.p3.r2c3":
      "Use <code>100dvh</code> (dynamic) / <code>100svh</code> (smallest) / <code>100lvh</code> (largest).",
    "c4.p3.r3c1": "Horizontal scrollbars",
    "c4.p3.r3c2":
      "Fixed widths, very long words or URLs, negative margins, or <code>width: 100%</code> plus padding without <code>box-sizing</code>.",
    "c4.p3.r3c3":
      "Global <code>box-sizing: border-box</code>; <code>overflow-wrap: anywhere</code> for long strings; <code>minmax(0, 1fr)</code>.",
    "c4.p3.r4c1": "Images and layout shift",
    "c4.p3.r4c2":
      "The image finishes loading, its height changes, and everything below jumps — a common cause of poor CLS.",
    "c4.p3.r4c3":
      "<code>max-width: 100%; height: auto</code> plus <code>aspect-ratio</code> to reserve the space, plus <code>srcset</code>.",
    "c4.p3.codeTitle": "Container queries, plus the correct fix for each trap",
    "c4.p3.c1": "/* 1. container queries: the parent supplies width, the component adapts */",
    "c4.p3.c2": "/* 2. full height with dvh, not vh */",
    "c4.p3.c3": "/* 3. long content no longer bursts the container */",
    "c4.p3.c4": "/* very long words or URLs may break */",
    "c4.p3.c5": "/* mind that 0 */",
    "c4.p3.c6": "/* 4. images: reserve the ratio so nothing jumps on load */",
    "c4.p3.c7": "/* fallback: browsers without container queries still get a usable stacked card */",
    "c4.p3.n1":
      "Container queries and media queries <strong>coexist</strong>: use media queries to decide how many columns the page has, and container queries to decide how a component behaves inside its column. Different layers, no conflict.",
    "c4.p3.n2":
      "<code>object-fit: cover</code> together with <code>aspect-ratio</code>: the image always fills the reserved area without distorting.",
    "c4.p3.n3":
      "This site's card walls use <code>auto-fit</code> for the column count and container queries for the internal shape of a component — together they get close to “adaptive with no media queries at all”.",
    "c4.p3.demoNote":
      "Drag the width slider from 220 to 760: the left card switches to image-left/text-right at 400px, while the right one does not move. That is the difference between a component that does not know where it is and one that does.",
    "d.cq.cqNote": "Asks its own container how wide it is — so it follows the slider.",
    "d.cq.cardTitle": "Container-query card",
    "d.cq.cardBody":
      "Wide enough container: image left, text right. Narrower: stacked. Decided by the container it sits in.",
    "d.cq.mqNote": "Only knows the viewport, so it never changes with the container.",
    "d.cq.cardTitle2": "Media-query card",
    "d.cq.cardBody2":
      "Same markup and the same container width, but its shape depends only on the browser window.",
    "d.cq.width": "Width of both containers",

    /* ---------- 第 5 章 / Chapter 5 ---------- */
    "c5.title": "Chapter 5 · Case study | Layout Lab",
    "c5.desc":
      "Designing a blog homepage from scratch: needs analysis, skeleton choice, the complete implementation, block-by-block refinement and an acceptance checklist.",
    "c5.p1.short": "Needs & wireframe",
    "c5.p2.short": "Choosing a skeleton",
    "c5.p3.short": "The full build",
    "c5.p4.short": "Refining & acceptance",
    "c5.eyebrow": "Chapter 5 · Case study",
    "c5.h1": "Designing a blog homepage from scratch",
    "c5.lead":
      "The methods from the previous four chapters converge here into something that runs. Four stages, four deliverables: needs and wireframe → skeleton choice → full implementation → block-by-block refinement. It ends with a checklist you can take away.",
    "c5.meta1": "4 topics",
    "c5.meta2": "3 interactive demos",
    "c5.meta3": "about 30 minutes",
    "c5.timeline": "The case in five stages",
    "c5.timelineDesc":
      "Each chapter solves one stage, and every stage builds on the previous stage's output.",
    "c5.t1": "Sorting content and spacing",
    "c5.t1d":
      "Alignment, whitespace, hierarchy and grids turn a pile of drafts into a wireframe with rhythm.",
    "c5.goCh1": "Back to chapter 1 →",
    "c5.t2": "Picking the skeleton",
    "c5.t2d":
      "Choose between one, two and three columns, and settle the DOM order of the main content.",
    "c5.goCh2": "Back to chapter 2 →",
    "c5.t3": "Writing it as code",
    "c5.t3d":
      "Grid for the skeleton, Flex for the parts — and keeping that division consistent across the stylesheet.",
    "c5.goCh3": "Back to chapter 3 →",
    "c5.t4": "Fitting every width",
    "c5.t4d":
      "Mobile first, three breakpoints and fluid type, so the homepage holds from the narrowest screen to the widest.",
    "c5.goCh4": "Back to chapter 4 →",
    "c5.t5": "Refining and accepting",
    "c5.t5d":
      "Block-by-block corrections, then a checklist to confirm nothing was missed — this chapter.",
    "c5.here": "You are here ▸",

    "c5.p1.title": "Start with “who reads this, and what for”",
    "c5.p1.sub":
      "Every layout trade-off should trace back to a requirement. “Looks good” without constraints is just luck.",
    "c5.p1.h1": "The brief",
    "c5.p1.t1":
      "<strong>“Far Hills Notes”</strong> is a personal tech blog that has been running for years. One author writes, designs and sets the pages; there is no ops team and no ad inventory. The homepage before this work was “one long column all the way down”, and the problem was not that it was ugly but that it was <strong>unusable</strong>: new readers could not find an entry point, and returning readers could not see whether anything new had appeared.",
    "c5.p1.h2": "Two kinds of reader, two jobs",
    "c5.p1.th1": "Reader",
    "c5.p1.th2": "What they came to do",
    "c5.p1.th3": "What the layout must provide",
    "c5.p1.r1c1": "First-time visitor",
    "c5.p1.r1c2":
      "Decide within 30 seconds whether there is anything here for them, and whether to stay.",
    "c5.p1.r1c3":
      "One clear featured area, a scannable list of article titles, and readable topic tags.",
    "c5.p1.r2c1": "Returning reader",
    "c5.p1.r2c2":
      "Confirm quickly whether there is something new, then click straight through.",
    "c5.p1.r2c3":
      "A stable position for the latest posts (not moving with every redesign), an archive entry, and a way to subscribe.",
    "c5.p1.h3": "Constraints",
    "c5.p1.t2a":
      "<strong>Technical</strong>: static, no build, no image assets — so thumbnails are CSS gradients and the page has to work offline.",
    "c5.p1.t2b":
      "<strong>Content</strong>: the number of posts keeps growing, so the list must be able to grow with it rather than sitting in a fixed-height block.",
    "c5.p1.t2c":
      "<strong>Performance and accessibility</strong>: mobile first, readable body copy, keyboard reachable, and respect for the system's reduced-motion setting.",
    "c5.p1.tip":
      "<strong>Translating requirements into layout decisions is the core move of this section.</strong> “Returning readers must confirm quickly that there is something new” → the latest-posts list must come first in both the DOM and the visual order. “No image assets” → fixed-ratio gradient blocks with <code>aspect-ratio</code>, which are easier on the eye and less fussy about their content anyway.",
    "c5.p1.codeTitle": "Wireframe: regions and spans",
    "c5.p1.c1": "/* the wireframe deliverable: a drawing that expresses priority and spans */",
    "c5.p1.c2": "/* body : sidebar = 2 : 1 */",
    "c5.p1.c3": "/* full-width blocks: 1 / -1 spans every column without knowing the count */",
    "c5.p1.c4": "/* sticky sidebar: secondary entry points stay visible while the stream scrolls */",
    "c5.p1.c5": "/* cards stacked evenly in the sidebar — one dimension, so Flex */",
    "c5.p1.n1":
      "The <code>2fr : 1fr</code> ratio comes from the brief: the stream is the main job and the sidebar is support — not a number picked at random.",
    "c5.p1.n2":
      "A sticky sidebar is worth a lot on a long list, but it needs <code>align-self: start</code>: a Grid item stretches by default, which silently defeats sticky (this site's own contents rail is an instance of the same trap).",
    "c5.p1.n3":
      "Those few lines of CSS are writable at wireframe stage — which is exactly the value of Grid: the layout can be described in code before the content exists.",
    "c5.p1.wHero": "Hero · featured",
    "c5.p1.wHeroD": "One article + summary + meta",
    "c5.p1.wStream": "Post stream",
    "c5.p1.wStreamD": "Four posts: title + summary + tags",
    "c5.p1.wSide": "Sidebar",
    "c5.p1.wSideD": "Subscribe / about / tags",
    "c5.p1.wFoot": "Footer",
    "c5.p1.wFootD": "Copyright + secondary links",
    "d.wire.zones": "Show / hide regions",
    "c5.p1.demoNote":
      "Try hiding the sidebar: the stream immediately takes the full width — but read the trade-off sentence in the readout. That is the value of the wireframe stage: you can reject an option in three seconds instead of building it first.",

    "c5.p2.title": "Three skeleton options, and their trade-offs set out plainly",
    "c5.p2.sub":
      "Draw the candidates side by side with their costs written next to them, and the decision stops relying on instinct.",
    "c5.p2.h1": "Three dimensions for the decision",
    "c5.p2.t1a":
      "<strong>Reading experience</strong>: does the measure land in the readable range (2.1)? This is a hard requirement.",
    "c5.p2.t1b":
      "<strong>Capacity</strong>: how many entry points fit on one screen? This decides whether first-time visitors stay.",
    "c5.p2.t1c":
      "<strong>Fallback cost</strong>: how many layers have to be dismantled on a narrow screen? Each layer is another breakpoint and another chance to get it wrong.",
    "c5.p2.t2":
      "Measure all three options against those three dimensions and the answer is clear: <strong>option B (two columns) wins on the sum</strong>. The blog does not have enough content to justify three columns, while a pure single column cannot hold the three entries it needs (archive, subscribe, tags).",
    "c5.p2.decision":
      "<strong>Decision: two columns as the base, upgrading to three on wide screens.</strong> One column on phones → two from 600px → three from 1200px, where the archive rail appears on the left. It is three columns rather than “two plus the archive in the sidebar” because on a wide screen the archive needs to be <em>permanently visible</em> (a high-frequency entry for returning readers), and the sidebar already carries subscribe and tags.",
    "c5.p2.codeTitle": "The final skeleton: three tiers, three breakpoints",
    "c5.p2.c1": "/* default: one column on phones */",
    "c5.p2.c2": "/* 600px: two columns — stream leading, 220px sidebar */",
    "c5.p2.c3": "/* 1200px: three columns — the archive rail arrives */",
    "c5.p2.c4": "/* the rail exists only in the widest tier */",
    "c5.p2.c5": "/* three tiers: DOM order = content priority, visual order comes from areas */",
    "c5.p2.c6": "/* should the rail come second in the DOM? No — it is an <aside>, so it is written */",
    "c5.p2.c7": "   after main and placed on the left with grid-area */",
    "c5.p2.n1":
      "The three breakpoints map to three structures rather than three sets of styles — each tier only adds a column, never undoes anything.",
    "c5.p2.n2":
      "<code>.f-rail</code> is <code>display: none</code> by default: on narrow screens it does not exist (its content is an archive, i.e. low-frequency information) and only appears when wide. Showing and hiding rather than reordering keeps the narrow-screen reading order clean.",
    "c5.p2.n3": "Compare with chapter 4: this structure is the same code the demo in 4.1 was running.",
    "d.skel.aTitle": "Option A · one column",
    "d.skel.a1": "Best reading experience, the easiest measure to control",
    "d.skel.a2": "Cheapest to build and to degrade",
    "d.skel.a3": "But archive, subscribe and tags have nowhere to live",
    "d.skel.bTitle": "Option B · two columns (recommended)",
    "d.skel.b1": "The measure can still stay inside the readable range",
    "d.skel.b2": "The sidebar carries subscribe / about / tags",
    "d.skel.b3": "Narrow screens need only one fallback: the sidebar drops below",
    "d.skel.cTitle": "Option C · three columns + full-width header/footer",
    "d.skel.c1": "Most capacity; navigation can stay permanently visible",
    "d.skel.c2": "Crowded below 900px, and needs two fallback breakpoints",
    "d.skel.c3": "For this much content, the main column ends up too narrow",
    "d.skel.pick": "Choose an option",
    "d.skel.aShort": "A one column",
    "d.skel.bShort": "B two columns",
    "d.skel.cShort": "C three columns",
    "c5.p2.demoNote":
      "Switch between the three options: the chosen panel gets a highlight ring and the readout gives the full reasoning. Note that the finished product actually contains both A and B — A on narrow screens, B (plus a column) when wide. That is normal for responsive layout.",

    "c5.p3.title": "The full build: three files, one product",
    "c5.p3.sub":
      "The finished product is HTML, CSS and a little JavaScript. Below is code you can copy and run, and how it behaves at four widths.",
    "c5.p3.h1": "File structure",
    "c5.p3.t1":
      "Inside the stylesheet there are four layers in strict order, and that order is itself readable documentation:",
    "c5.p3.t1a":
      "<strong>Tokens</strong>: colours, spacing scale, fonts, radii — every value appears exactly once;",
    "c5.p3.t1b":
      "<strong>Skeleton</strong>: page-level Grid (<code>.f-shell</code> / <code>.f-grid</code>) positioning the regions;",
    "c5.p3.t1c": "<strong>Components</strong>: cards, header, sidebar modules; Flex inside, sizes from tokens;",
    "c5.p3.t1d": "<strong>Breakpoints</strong>: three <code>min-width</code> media queries, all at the end of the file.",
    "c5.p3.h2": "A few decisions worth calling out",
    "c5.p3.t2a":
      "<strong>CSS gradients for thumbnails</strong> instead of images: <code>aspect-ratio</code> fixes the proportion, so there is zero loading wait and no layout shift (CLS), and no assets to maintain. The cost is sameness — but a list thumbnail is a rhythm marker, not content.",
    "c5.p3.t2b":
      "<strong>Borders rather than shadows for grouping</strong>: a dozen cards each carrying a shadow gets noisy, while a 1px border is far quieter in a dense list.",
    "c5.p3.t2c":
      "<strong>Equal row heights via <code>grid-auto-rows</code> and <code>1fr</code></strong>, with buttons pinned to the bottom by <code>margin-top: auto</code> — so every button in a row lands on the same line (back to the third test in 3.4).",
    "c5.p3.t2d":
      "<strong>Only a light theme ships</strong>, but every colour goes through tokens, so a <code>[data-theme=dark]</code> override is all it takes — which is exactly how this site does it.",
    "c5.p3.codeHtmlTitle": "Structure: semantic elements in content-priority order",
    "c5.p3.n3":
      "Semantic elements (<code>header</code> / <code>main</code> / <code>aside</code> / <code>nav</code> / <code>footer</code>) rather than a pile of <code>div</code>s: screen readers turn them into landmark navigation, and keyboard users can jump straight to <code>main</code>.",
    "c5.p3.n4":
      "Exactly one <code>h1</code>, with no skipped heading levels (h1 → h2 → h3). That is the accessibility baseline, and it keeps the visual hierarchy honest too.",
    "c5.p3.n5":
      "<code>aria-hidden</code> on purely decorative thumbnails, so a screen reader does not announce empty elements.",
    "c5.p3.codeCssTitle": "Styles: tokens → skeleton → components → breakpoints",
    "c5.p3.c1": "/* ① tokens */",
    "c5.p3.c2": "/* ② skeleton: Grid positions the regions */",
    "c5.p3.c3": "/* ③ components: Flex handles the insides */",
    "c5.p3.c4": "/* fixed ratio: nothing jumps while loading */",
    "c5.p3.c5": "/* fluid type: one breakpoint fewer */",
    "c5.p3.c6": "/* ④ breakpoints: gathered at the end, enhancing only */",
    "c5.p3.c7": "/* the first post spans the row, creating rhythm */",
    "c5.p3.n6":
      "The order of the four layers is not negotiable: tokens at the top (every value comes from there), breakpoints at the bottom (they only override position and size). The two middle layers are the division between structure and parts.",
    "c5.p3.n7":
      "Note that <code>.f-post</code> in the component layer uses Grid (two dimensions: image and text), not Flex — Grid is simpler when two things sit side by side and must align. <code>.f-thumb</code> uses <code>aspect-ratio: 1</code> so it is always square.",
    "c5.p3.n8":
      "Nothing in the breakpoint layer declares a colour or a font — that is the tokens layer's job. This discipline is what makes a redesign safe.",
    "c5.p3.codeJsTitle": "Script: reading parameters for bilingual text (the same approach as the main site)",
    "c5.p3.j1":
      "// All copy lives in one config object; switching language is a single pass over [data-k] elements",
    "c5.p3.j2": "// state=before drives the before/after comparison by toggling one class",
    "c5.p3.j3": "// the Chinese original lives in the HTML, so a missing translation falls back to it",
    "c5.p3.n9":
      "Chinese is written directly in the HTML, so the page is fully readable without JavaScript; English lives in the config object, so there is one translation to maintain and no drifting duplicate markup.",
    "c5.p3.n10":
      "A missing translation falls back to the original instead of showing a blank or <code>undefined</code> — the failure mode bilingual sites most often get wrong.",
    "c5.p3.n11":
      "This site's own i18n follows the same idea, just at a larger scale, with separate tables for page copy and for strings generated by JavaScript.",
    "d.vp.open": "Open the finished page in a new tab ↗",
    "c5.p3.demoNote":
      "This is the finished product: you can scroll it, click the links, and step between four device widths. Look at the 900px tier in particular — the stream becomes two columns with the first post spanning both. That breakpoint exists for rhythm, not because the structure demanded it.",

    "c5.p4.title": "Block-by-block refinement: from “works” to “reads well”",
    "c5.p4.sub":
      "The last pass changes no structure at all — it fixes seven specific layout problems, and the difference is substantial.",
    "c5.p4.h1": "What was actually wrong before",
    "c5.p4.t1":
      "The first implementation ran, and the content was correct, but every decision was made off the cuff: no measure (<code>max-width: none</code>), three columns hard-coded at every width, headings set at body size, spacing drawn from values like 3px and 4px, thumbnails fixed at 96px.",
    "c5.p4.warn":
      "<strong>The point of this section: bad layout is usually not a failure of design talent — it is a set of decisions that had no reasoning behind them.</strong> Check each one against the principles from the first four chapters and the problems surface on their own, which is why an acceptance checklist beats aesthetic instinct.",
    "c5.p4.h2": "Seven fixes and the principle behind each",
    "c5.p4.th1": "Change",
    "c5.p4.th2": "From → to",
    "c5.p4.th3": "Principle",
    "c5.p4.r1c1": "Add a measure",
    "c5.p4.r1c2": "<code>max-width: none</code> → <code>1180px + margin-inline: auto</code>",
    "c5.p4.r1c3": "2.1 measure",
    "c5.p4.r2c1": "Hard-coded three columns → four tiers",
    "c5.p4.r2c2": "Always three columns → one / two / three",
    "c5.p4.r2c3": "4.1 mobile first",
    "c5.p4.r3c1": "Build a type hierarchy",
    "c5.p4.r3c2": "Heading at 15px → <code>clamp(22px, 3.4vw + 8px, 40px)</code>",
    "c5.p4.r3c3": "1.3 hierarchy + 4.2 fluid type",
    "c5.p4.r4c1": "Bring spacing onto the scale",
    "c5.p4.r4c2": "Ad-hoc 3px / 4px → <code>--space-1 … --space-7</code>",
    "c5.p4.r4c3": "1.2 whitespace",
    "c5.p4.r5c1": "Make thumbnails flexible",
    "c5.p4.r5c2": "<code>width: 96px</code> → <code>width: 64px; aspect-ratio: 1</code>",
    "c5.p4.r5c3": "4.3 responsive traps",
    "c5.p4.r6c1": "Align inside the cards",
    "c5.p4.r6c2": "Text floating with its content → image and text in separate tracks, buttons pinned",
    "c5.p4.r6c3": "1.1 alignment + 3.4 cross-card alignment",
    "c5.p4.r7c1": "Make grouping visible",
    "c5.p4.r7c2": "Between = inside → between = inside × 1.9",
    "c5.p4.r7c3": "1.2 proximity",
    "c5.p4.codeTitle": "The same code, with a “before” override layer",
    "c5.p4.c1": "/* the demo “before”: every common mistake, each one mapping to a fix above */",
    "c5.p4.c2": "/* ✗ no measure → lines stretch with the window */",
    "c5.p4.c3": "/* ✗ spacing made up on the spot */",
    "c5.p4.c4": "/* ✗ three columns at any width; packed solid on narrow screens */",
    "c5.p4.c5": "/* ✗ heading as large as body copy → hierarchy disappears */",
    "c5.p4.c6": "/* ✗ a fixed width, so it never shrinks with the container */",
    "c5.p4.c7": "/* ✗ inside and between equally large → grouping disappears */",
    "c5.p4.n1":
      "The old styles are kept as <strong>one override layer</strong> rather than a second HTML file, so an A/B comparison is a single class switch — the same code then serves the demo, regression checks and explaining the change to a colleague.",
    "c5.p4.n2":
      "Every line is annotated “✗ + reason”. A comment explaining <em>why</em> something is wrong is far more useful than one saying “this is the old version”.",
    "c5.p4.n3":
      "In a real project the <code>is-before</code> class would exist only in a demo environment; its value is making the gains from a redesign visible and testable.",
    "d.caseab.state": "Version",
    "d.caseab.before": "Before",
    "d.caseab.after": "After",
    "d.caseab.fixes": "The seven fixes made in this pass",
    "d.caseab.f1": "Added a measure: max-width 1180px, centred",
    "d.caseab.f2": "Hard-coded three columns → four tiers, mobile first",
    "d.caseab.f3": "Built a type hierarchy (fluid clamp for headings)",
    "d.caseab.f4": "Moved all spacing onto a single scale",
    "d.caseab.f5": "Thumbnails use a ratio instead of a fixed size",
    "d.caseab.f6": "Aligned the inside of the cards, buttons pinned to the bottom",
    "d.caseab.f7": "Between-group spacing raised to 1.9× the inside spacing",
    "c5.p4.demoNote":
      "Look at “before” first and drag the viewport narrow — the measure runs away, three columns pack into a mush and headings are the same size as body copy. Then switch back to “after”: same content, same HTML structure, but every decision now has a reason.",
    "c5.p4.checklistLabel": "Acceptance checklist",
    "c5.p4.checkIntro":
      "Use this checklist on <strong>your own</strong> pages. Tick all eight and the layout has a solid baseline (tick state is remembered on this device).",
    "c5.p4.k1":
      "Drag the browser from narrowest to widest: no horizontal scrollbar anywhere, nothing overflowing or overlapping.",
    "c5.p4.k2":
      "Body copy sits between 45 and 75 Latin characters per line (25–40 Han characters) and stops widening on very large screens.",
    "c5.p4.k3":
      "Squint at the page, or scale it to 25%: you can still see a few crisp vertical alignment lines.",
    "c5.p4.k4":
      "The page has no more than three levels, and the sizes come from a ratio scale rather than being picked ad hoc.",
    "c5.p4.k5": "Every gap comes from the same scale, and space inside a group is smaller than space between groups.",
    "c5.p4.k6":
      "Turn off highlighting and Tab through the page: focus order matches visual order, and focus never lands on something invisible.",
    "c5.p4.k7":
      "Zoom to 200%, or raise the browser's default font size: the layout still holds — which means relative units rather than px.",
    "c5.p4.k8":
      "It respects a reduced-motion system setting, and images have dimensions or ratios so nothing shifts while loading.",
    "d.flex.justify": "justify-content (main axis)",
    "d.flex.align": "align-items (cross axis · one line)",
    "d.flex.content": "align-content (cross axis · multiple lines)",
    "d.grid.justify": "justify-items (inside the cell, horizontal)",
    "d.grid.align": "align-items (inside the cell, vertical)",
    "index.how1k": "<code>Custom properties</code>",
    "index.how5k": "<code>Container queries</code>",
    "index.how6k": "<code>Logical properties</code>",
    "index.bp2": "main · grid: TOC + article",
    "c1.p1.demoAvatar": "FH",
    "c1.p1.demoBrand": "Far Hills Notes",

    /* 案例成品的代码清单：注释与示例内容同步切换 */
    "c5.p3.fs1": "structure and copy (semantic tags: header / main / aside / footer)",
    "c5.p3.fs2": "all styles: tokens → skeleton → components → breakpoints",
    "c5.p3.fs3": "a small script reading ?lang, sharing the main site's config approach",
    "c5.p3.hl1": "archive rail: written after main in the DOM, placed left with grid-area",
    "c5.p3.hl2": "the stream: the first block of content in DOM order",
    "c5.p3.hc1": "Far Hills",
    "c5.p3.hc2": "Notes",
    "c5.p3.hc3": "Writing",
    "c5.p3.hc4": "Notes",
    "c5.p3.hc5": "About",
    "c5.p3.hc6": "Search",
    "c5.p3.hc7": "Archive",
    "c5.p3.hc8": "Autumn 2026",
    "c5.p3.hc9": "Summer 2026",
    "c5.p3.hc10": "Featured",
    "c5.p3.hc11": "Settling a homepage with grids and whitespace",
    "c5.p3.hc12": "Decide what matters first, then place it on a grid…",
    "c5.p3.hc13": "Latest writing",
    "c5.p3.hc14": "Why the holy grail layout still earns its keep",
    "c5.p3.hc15": "Three columns, full-width header and footer, main content first…",
    "c5.p3.hc16": "Far Hills Notes",
    "c5.p3.hc17": "…subscribe / about / tags…",
    "c5.p4.end":
      "<strong>The case is complete.</strong> Look back over the five chapters: the requirements decided the skeleton, the skeleton decided the implementation, the implementation decided where the breakpoints go — every step traces back to the previous one. A layout is good because it is <em>traceable</em>, not because of any single beautiful pixel value."
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
      "ui.fx.grown": "flex-grow 项",

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
      "ui.fx.grown": "items with flex-grow",

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
