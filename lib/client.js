// dsh-plan-book —— 客户端半边（计划视图）
//
// 页面：对话尾摘要卡 + 会话标题栏常驻入口 + 右侧大框标签页（正文阅读版 / 流程图 / 汇报稿）。
// 计划数据来自主机半边的 session 投影 plan-book（本包只渲染，不改官方那张计划卡与批准流程）。
//
// 本文件**只含自己那一页**的组件、CSS 与字典 —— 客户端 bundle 是自包含的，不与其它包共享运行时
// （要用到的图标/工具函数/令牌按需复制一份进来）。
// 插槽注册只做自己那几处 key（见下面的 apply），所以四个包同时装也不会互相覆盖、不会出现重复入口。
// 模块 id 必须等于包名（加载器按包名 require）；插件名与 locale 命名空间也一包一个，互不重名。
window.__ModuleLoader__.load({
	id: "dsh-plan-book",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const React = require("react");
		const h = React.createElement;

		/** 客户端插件名（cordis 插件体 name）：与其它三个包**不重名**。 */
		const PLUGIN_NAME = "plan-book";
		/** locale 命名空间：一包一个，字典不互相覆盖。 */
		const LOCALE_NS = "plan-book";
		/** 计划摘要挂在对话尾的哪一格（list 插槽：用自己的新 id = 并排新增一格）。 */
		const TURN_TAIL_SLOT = "conversation.chat.turnTail";
		/** 我们这一格的 id。 */
		const PLAN_BOOK_ID = "workbench-plan-book";
		/** 主机投影的 key（由本包的主机半边注册）。 */
		const PLAN_BOOK_KEY = "plan-book";
		/** 右侧面板的标签类型 id（同时是 pane 插槽的 key）。 */
		const PLAN_PANE_ID = "dsh-workbench-home/plan-book";
		/** 右侧面板按这个地址前缀打开（官方机制：sidebarRightTabs 按 patterns 认领标签类型）。 */
		const PLAN_PANE_SCHEME = "dsh-resource://plan-book/";

		const DICT_ZH = {
			"plan.kicker": "计划",
			"plan.openShort": "右侧打开",
			"plan.paneUnavailableShort": "右侧不可用",
			"plan.expand": "就地展开",
			"plan.collapse": "收起",
			"plan.paneUnavailable": "右侧面板暂时打不开，已就地展开。",
			"plan.paneEmpty": "还没有可展示的计划 —— 在计划模式下我会把计划放在这里。",
			"plan.aria": "执行计划（每步做什么、为什么、会碰什么、万一怎么退）",
			"plan.stepsUnit": "步",
			"plan.statFiles": "处改动",
			"plan.statRisks": "个风险点",
			"plan.statDetails": "处细节",
			"plan.open": "在右侧打开",
			"plan.openHint": "右栏看全貌；打不开会自动就地展开。",
			"plan.close": "关闭",
			"plan.prev": "← 上一步",
			"plan.next": "下一步 →",
			"plan.noSteps": "这份计划没有可展示的步骤。",
			"plan.tableInstead": "（一张折起的对照表，点开看原文）",
			"plan.why": "因",
			"plan.because": "因为",
			"plan.diagStart": "开始",
			"plan.diagNoLine": "（这一步没有单独说明）",
			"plan.legendOrder": "顺序：一步接一步",
			"plan.legendRisk": "虚线 = 出问题的退路",
			"plan.viewProse": "正文",
			"plan.viewDeck": "汇报稿",
			"plan.viewDiagram": "流程图",
			"plan.deckFull": "全屏",
			"plan.deckExitFull": "退出全屏",
			"plan.deckEnd": "要你定的 · 然后开始执行",
			"plan.deckAgenda": "计划一览",
			"plan.deckStepOf": "第",
			"plan.deckDetail": "这一步的细节与术语",
			"plan.deckRisks": "可能出问题的地方",
			"plan.deckPressMore": "按 → 继续",
			"plan.diagEnd": "批准后执行",
			"plan.rowDo": "做什么",
			"plan.rowWhy": "为什么",
			"plan.rowFiles": "会碰",
			"plan.rowRisk": "万一",
			"plan.touches": "会碰",
			"plan.riskWord": "万一",
			"plan.files": "碰",
			"plan.risk": "万一",
			"plan.showDetail": "点开原文",
			"plan.hideDetail": "收起原文",
			"plan.decisions": "要你定的",
			"plan.rowAccept": "验收",
			"plan.secStatus": "现状",
			"plan.secAlternatives": "为什么不选别的",
			"plan.secCost": "代价与退路",
			"plan.secSuccess": "怎么算成功",
			"plan.oneScreenHint": "看完这屏就能决定；步骤细节在下面，想深入再看。",
			"plan.foldBasis": "看依据：现状 · 为什么不用别的方案 · 怎么算成功",
			"plan.foldSteps": "看完整的",
			"plan.truncatedText": "（内容过长，已截断）",
			"plan.multi": "份计划，展示最新一份",
			"plan.truncated": "（原文过长，只画前 12 步）",
			"plan.footnote": "批准仍用上面的官方按钮（Approve / Keep planning）—— 这里只负责让你看懂。",
			"plan.noHook": "计划视图读不到投影钩子（宿主没把 useProjection 传进这一格）—— 客户端插件该更新了。",
			"plan.unavailable": "计划投影不可用：主机插件 plan-book 没装入或还没重启（官方计划卡片不受影响）。",
		};

		const DICT_EN = {
			"plan.kicker": "Plan",
			"plan.openShort": "open right",
			"plan.paneUnavailableShort": "panel unavailable",
			"plan.expand": "Expand here",
			"plan.collapse": "Collapse",
			"plan.paneUnavailable": "The right panel would not open; expanded here instead.",
			"plan.paneEmpty": "No plan to show yet — in plan mode I will put the plan here.",
			"plan.aria": "Execution plan (what each step does, why, what it touches, how to back out)",
			"plan.stepsUnit": "steps",
			"plan.statFiles": "touches",
			"plan.statRisks": "risks",
			"plan.statDetails": "details",
			"plan.open": "Open in the right panel",
			"plan.openHint": "See the whole plan in the right panel; falls back to inline.",
			"plan.close": "Close",
			"plan.prev": "← Previous",
			"plan.next": "Next →",
			"plan.noSteps": "This plan has no drawable steps.",
			"plan.tableInstead": "(a folded table — open the text to read it)",
			"plan.why": "why",
			"plan.because": "because",
			"plan.diagStart": "start",
			"plan.diagNoLine": "(no separate note)",
			"plan.legendOrder": "order: step by step",
			"plan.legendRisk": "dashed = fallback if it breaks",
			"plan.viewProse": "Text",
			"plan.viewDeck": "Slides",
			"plan.viewDiagram": "Diagram",
			"plan.deckFull": "Full screen",
			"plan.deckExitFull": "Exit full screen",
			"plan.deckEnd": "Your call · then we start",
			"plan.deckAgenda": "Plan at a glance",
			"plan.deckStepOf": "Step",
			"plan.deckDetail": "details and jargon",
			"plan.deckRisks": "Where it can break",
			"plan.deckPressMore": "press → to continue",
			"plan.diagEnd": "after approval",
			"plan.rowDo": "does",
			"plan.rowWhy": "why",
			"plan.rowFiles": "touches",
			"plan.rowRisk": "if it breaks",
			"plan.touches": "touches",
			"plan.riskWord": "if it breaks",
			"plan.files": "touches",
			"plan.risk": "if it breaks",
			"plan.showDetail": "open the text",
			"plan.hideDetail": "hide details",
			"plan.decisions": "Your call",
			"plan.rowAccept": "check",
			"plan.secStatus": "Where we are",
			"plan.secAlternatives": "Why not the alternatives",
			"plan.secCost": "Cost and way back",
			"plan.secSuccess": "How we will know it worked",
			"plan.oneScreenHint": "This screen is enough to decide; step details are below when you want them.",
			"plan.foldBasis": "See the basis: where we are · why not the alternatives · what counts as success",
			"plan.foldSteps": "See all",
			"plan.truncatedText": "(source too long; truncated)",
			"plan.multi": "plans this turn, showing the newest",
			"plan.truncated": "(long plan: first 12 steps drawn)",
			"plan.footnote": "Approval still uses the official buttons above — this view only helps you read it.",
			"plan.noHook": "The plan view cannot see the projection hook (the host did not pass useProjection into this cell) — the client plugin needs an update.",
			"plan.unavailable": "Plan projection unavailable: host plugin plan-book is missing or the service has not restarted (official plan card is unaffected).",
		};



		const PAGE_CSS = [
			".wpb-hint{font-size:12.5px;line-height:1.7;color:var(--dsw-alias-label-secondary);border:1px dashed var(--dsw-alias-border-l1);border-radius:10px;padding:12px 14px;margin:10px 0}",
			".wpb2-pane{display:flex;flex-direction:column;gap:16px;padding:20px 22px 34px;height:100%;box-sizing:border-box;overflow:auto}",
			".wpb2-body{position:relative;display:flex;flex-direction:column;gap:0;max-width:1180px;margin:0 auto;width:100%;padding:30px clamp(18px,3vw,38px) 26px;border-radius:18px;background:color-mix(in srgb,#FBF6EC 55%,var(--dsw-alias-bg-layer-1))}",
			".wpb2-head{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:start;padding-bottom:22px}",
			".wpb2-heart{order:2;flex:none;display:inline-flex;border-radius:16px;overflow:hidden;transform:rotate(-1.2deg);box-shadow:0 16px 34px -20px hsl(28 40% 30% / .45)}",
			".wpb2-headtext{order:1;display:flex;flex-direction:column;gap:10px;min-width:0}",
			".wpb2-kicker{font-size:11px;letter-spacing:.34em;color:color-mix(in srgb,#8A6A45 85%,var(--dsw-alias-label-secondary))}",
			".wpb2-title,.wpb2-covertitle{font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-weight:700;margin:0;color:var(--dsw-alias-label-primary);letter-spacing:.01em}",
			".wpb2-title{font-size:clamp(27px,3.3vw,42px);line-height:1.28}",
			".wpb2-covertitle{font-size:21px;line-height:1.4}",
			".wpb2-oneline{margin:0;font-size:14.5px;line-height:1.8;color:color-mix(in srgb,#6B5B49 80%,var(--dsw-alias-label-secondary));max-width:52ch}",
			".wpb2-meta{margin:2px 0 0;font-size:12px;letter-spacing:.04em;color:var(--dsw-alias-label-secondary)}",
			".wpb2-note{font-size:11.5px;color:var(--dsw-alias-label-secondary)}",
			".wpb2-body.is-prose .wpb2-head{padding-bottom:0;align-items:center}",
			".wpb2-body.is-prose .wpb2-title{font-size:15px;font-weight:600;line-height:1.5;letter-spacing:.04em}",
			'@font-face{font-family:\'WPB Song\';font-style:normal;font-weight:400;font-display:swap;src:url(https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-sc@5/files/noto-serif-sc-chinese-simplified-400-normal.woff2) format("woff2")}',
			'@font-face{font-family:\'WPB Song\';font-style:normal;font-weight:700;font-display:swap;src:url(https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-sc@5/files/noto-serif-sc-chinese-simplified-700-normal.woff2) format("woff2")}',
			".wpp-hero{display:grid;grid-template-columns:minmax(0,1fr) min(40%,clamp(160px,22vw,280px));gap:clamp(18px,3vw,40px);align-items:start;margin:28px 0 36px}",
			".wpp-herotext{display:flex;flex-direction:column;gap:14px;min-width:0}",
			".wpp-title{font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-weight:700;font-size:clamp(30px,4.6vw,56px);line-height:1.2;letter-spacing:-.01em;margin:0;color:var(--dsw-alias-label-primary)}",
			".wpp-lede{margin:0;max-width:34em;font-size:19px;line-height:1.8;color:var(--dsw-alias-label-primary);font-weight:500}",
			".wpp-heroart{flex:none;width:100%;max-width:280px;border-radius:18px;overflow:hidden;transform:rotate(-1.2deg);animation:wppHeroIn 240ms cubic-bezier(.22,.8,.3,1) both}",
			".wpp .wpp-heroimg{display:block;width:100%;height:auto;border-radius:0}",
			".wpp-heroblk{display:block;width:100%;aspect-ratio:1;background:linear-gradient(135deg,color-mix(in srgb,#FBF6EC 72%,var(--dsw-alias-bg-layer-1)),color-mix(in srgb,#E9A94A 28%,var(--dsw-alias-bg-layer-1)))}",
			"@media (prefers-reduced-motion:reduce){.wpp-heroart{animation:none}}",
			"@media (max-width:820px){.wpp-hero{grid-template-columns:minmax(0,1fr)}.wpp-heroart{width:min(100%,280px)}}",
			".wpb2-body.is-compact .wpp-hero{grid-template-columns:minmax(0,1fr) min(34%,clamp(140px,18vw,200px))}",
			".wpb2-body.is-compact .wpp-title{font-size:clamp(26px,3.4vw,40px)}",
			".wpp-toc{display:block;margin:7px 0 0;font-size:12.5px;line-height:1.85;color:var(--dsw-alias-label-secondary)}",
			".wpp-tocitem{color:var(--dsw-alias-label-secondary);text-decoration:none}",
			".wpp-tocitem:hover{color:var(--dsw-alias-label-primary)}",
			".wpp-tocsep{color:var(--dsw-alias-label-secondary)}",
			".wpp-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:40px}",
			".wpp-stephead{display:flex;align-items:baseline;gap:14px;margin-bottom:8px}",
			".wpp-no{flex:none;min-width:32px;font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-weight:700;font-size:26px;line-height:1;color:#B57F24;font-variant-numeric:tabular-nums}",
			".wpp-steptitle{margin:0;font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-size:21px;font-weight:700;line-height:1.45;color:var(--dsw-alias-label-primary)}",
			".wpp-do{margin:0 0 8px;max-width:34em;font-size:15px;line-height:1.9;color:var(--dsw-alias-label-primary)}",
			".wpp-fact{margin:4px 0 0;max-width:34em;font-size:14px;line-height:1.9;color:var(--dsw-alias-label-secondary)}",
			".wpp-fact b{font-weight:600;color:var(--dsw-alias-label-primary);margin-right:8px}",
			".wpp-fact code{font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:12.5px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module-platform,#f5f6f7);padding:1px 6px;border-radius:4px}",
			".wpp-fact.is-risk,.wpp-fact.is-risk b{color:#8A4A16}",
			".wpp-details{margin-top:9px}",
			".wpp-details summary{cursor:pointer;font-size:12.5px;color:var(--dsw-alias-label-secondary);list-style:none}",
			".wpp-details summary::-webkit-details-marker{display:none}",
			".wpp-details summary::before{content:'▸ ';color:#B57F24}",
			".wpp-details[open] summary::before{content:'▾ '}",
			".wpp-details summary:hover{color:var(--dsw-alias-label-primary)}",
			".wpp-detail{margin:9px 0 0;padding:13px 15px;font-size:12.5px;line-height:1.85;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform,#f5f6f7);border-left:2px solid color-mix(in srgb,#B57F24 60%,transparent);border-radius:0 8px 8px 0}",
			".wpp-decisions{margin:44px 0 0;padding:24px 26px 24px 22px;border-left:4px solid #E9A94A;border-radius:14px;background:color-mix(in srgb,#E9A94A 13%,var(--dsw-alias-bg-layer-1))}",
			".wpp-decisions h2{margin:0 0 12px;font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-size:16px;font-weight:700;line-height:1.5;color:#B57F24}",
			".wpp-decisions ul{margin:0;padding-left:20px;max-width:34em;font-size:15px;line-height:1.9;color:var(--dsw-alias-label-primary)}",
			".wpp-scale{display:flex;align-items:center;flex-wrap:wrap;margin:48px 0 0}",
			".wpp-stat{display:inline-flex;align-items:baseline;gap:8px}",
			".wpp-statnum{font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-weight:700;font-size:clamp(30px,3.6vw,44px);line-height:1;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}",
			".wpp-statlabel{font-size:11px;letter-spacing:.06em;color:var(--dsw-alias-label-secondary)}",
			".wpp-statline{align-self:center;flex:none;width:1px;height:34px;margin:0 clamp(16px,2.4vw,30px);background:var(--dsw-alias-border-l2)}",
			".wpp-cut{margin:16px 0 0;font-size:11px;line-height:1.8;color:color-mix(in srgb,#B57F24 78%,var(--dsw-alias-label-secondary))}",
			".wpp-hint{margin:16px 0 0;max-width:34em;font-size:12.5px;line-height:1.9;color:var(--dsw-alias-label-secondary)}",
			".wpp-fold{margin:48px 0 0}",
			".wpp-fold+.wpp-fold{margin-top:32px}",
			".wpp-fold>summary{cursor:pointer;list-style:none;font-size:13px;line-height:1.9;color:var(--dsw-alias-label-secondary)}",
			".wpp-fold>summary::-webkit-details-marker{display:none}",
			".wpp-fold>summary::before{content:'▸ ';color:#B57F24}",
			".wpp-fold[open]>summary::before{content:'▾ '}",
			".wpp-fold>summary:hover{color:var(--dsw-alias-label-primary)}",
			".wpp-sec{margin:40px 0 0}",
			".wpp-sec-cost{margin:44px 0 0;padding:24px 26px;border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,var(--dsw-alias-bg-layer-1))}",
			".wpp-sechead{margin:0 0 12px;font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-size:16px;font-weight:700;line-height:1.5;color:var(--dsw-alias-label-primary)}",
			".wpp-secline{margin:0 0 10px;max-width:34em;font-size:15px;line-height:1.9;color:var(--dsw-alias-label-secondary)}",
			".wpp-secline:last-child{margin-bottom:0}",
			".wpp-fact.is-accept{color:var(--dsw-alias-label-secondary)}",
			".wpp-foot{margin:32px 0 0;max-width:34em;font-size:11.5px;line-height:1.75;color:var(--dsw-alias-label-secondary)}",
			".wpd-viewtabs{display:flex;gap:8px;margin-top:16px}",
			".wpd-viewtab{font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);padding:5px 13px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;cursor:pointer}",
			".wpd-viewtab.is-on{color:var(--dsw-alias-label-primary);border-color:color-mix(in srgb,#B57F24 55%,transparent);background:color-mix(in srgb,#E9A94A 12%,var(--dsw-alias-bg-layer-1))}",
			".wpd-deck{display:flex;flex-direction:column}",
			".wpd-deck.is-full{position:fixed;inset:0;z-index:70;padding:26px;background:color-mix(in srgb,#FBF6EC 88%,#fff);justify-content:center}",
			".wpd-stage{position:relative;aspect-ratio:16 / 9;max-height:60vh;min-height:320px;padding:clamp(18px,3vw,42px);border-radius:16px;overflow:hidden;display:flex;align-items:center;background:linear-gradient(150deg,color-mix(in srgb,#FBF6EC 80%,var(--dsw-alias-bg-layer-1)),color-mix(in srgb,#F3E7D6 55%,var(--dsw-alias-bg-layer-1)));border:1px solid color-mix(in srgb,#B57F24 22%,transparent);box-shadow:0 22px 50px -34px hsl(28 40% 30% / .5)}",
			".wpd-deck.is-full .wpd-stage{max-height:78vh}",
			".wpd-slide{position:relative;width:100%;display:flex;flex-direction:column;gap:14px;padding-right:clamp(0px,14vw,150px)}",
			".wpd-slide.is-cover,.wpd-slide.is-end{align-items:flex-start;justify-content:center;min-height:100%}",
			".wpd-slidekicker{font-size:11px;letter-spacing:.34em;color:color-mix(in srgb,#8A6A45 85%,var(--dsw-alias-label-secondary))}",
			".wpd-slidetitle{font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-weight:700;margin:0;color:var(--dsw-alias-label-primary);font-size:clamp(19px,2.3vw,30px);line-height:1.32}",
			".wpd-slidetitle.is-big{font-size:clamp(26px,3.4vw,46px)}",
			".wpd-slideoneline{margin:0;font-size:clamp(13px,1.3vw,16px);line-height:1.8;color:color-mix(in srgb,#6B5B49 80%,var(--dsw-alias-label-secondary));max-width:46ch}",
			".wpd-slidestats{margin:2px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}",
			".wpd-slidehead{display:flex;align-items:flex-start;gap:16px}",
			".wpd-slideno{font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-weight:700;font-size:clamp(34px,4.6vw,58px);line-height:.9;color:color-mix(in srgb,var(--wpbi-ink) 82%,#000);font-variant-numeric:tabular-nums}",
			".wpd-slidedo{margin:6px 0 0;font-size:clamp(13px,1.35vw,16px);line-height:1.7;color:var(--dsw-alias-label-primary)}",
			".wpd-slidefacts{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-direction:column;gap:7px;max-width:60ch}",
			".wpd-slidefacts li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;font-size:clamp(12px,1.2vw,13.5px);line-height:1.7;color:var(--dsw-alias-label-secondary)}",
			".wpd-slidefacts b{font-weight:600;color:color-mix(in srgb,var(--wpbi-ink) 80%,#000);letter-spacing:.04em}",
			".wpd-slidefacts li.is-risk b{color:#8A4A16}",
			".wpd-slidefacts li.is-risk{color:color-mix(in srgb,#8A4A16 82%,var(--dsw-alias-label-primary))}",
			".wpd-slidart{position:absolute;right:0;bottom:0;width:clamp(120px,17vw,210px);border-radius:14px;transform:rotate(-1.5deg)}",
			".wpd-slidedecisions{display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--dsw-alias-label-secondary)}",
			".wpd-slidedecisions b{color:var(--dsw-alias-label-primary)}",
			".wpd-slidedecisions ul{margin:0;padding-left:18px;line-height:1.8}",
			".wpd-slidefoot{margin:0;font-size:11.5px;color:var(--dsw-alias-label-secondary)}",
			".wpd-progress{height:2px;border-radius:2px;background:color-mix(in srgb,#B57F24 16%,transparent);overflow:hidden;margin-bottom:10px}",
			".wpd-progress span{display:block;height:100%;background:#B57F24;transform-origin:left;transition:transform .4s cubic-bezier(.26,.86,.44,.985)}",
			".wpd-stats{display:flex;gap:0;margin-top:6px;border-top:1px solid color-mix(in srgb,#B57F24 22%,transparent)}",
			".wpd-statcell{display:flex;flex-direction:column;gap:2px;padding:10px 22px 4px;border-right:1px solid color-mix(in srgb,#B57F24 18%,transparent)}",
			".wpd-statcell:first-child{padding-left:0}",
			".wpd-statcell:last-child{border-right:0}",
			".wpd-statcell b{font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-size:clamp(20px,2.4vw,30px);font-weight:700;line-height:1;color:#B57F24;font-variant-numeric:tabular-nums}",
			".wpd-statcell i{font-style:normal;font-size:11px;color:var(--dsw-alias-label-secondary)}",
			".wpd-agenda{list-style:none;margin:8px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px 22px}",
			".wpd-agenda li{display:grid;grid-template-columns:30px minmax(0,1fr);gap:8px 10px;align-items:baseline;padding:6px 0;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 80%,transparent)}",
			".wpd-agendano{font-family:var(--dsw-font-mono,monospace);font-size:12px;font-weight:700;color:color-mix(in srgb,var(--wpbi-ink) 85%,#000);font-variant-numeric:tabular-nums}",
			".wpd-agendatitle{font-size:13.5px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".wpd-agendado{grid-column:2;font-size:11.5px;color:var(--dsw-alias-label-secondary)}",
			".wpd-slidepos{margin:2px 0 0;font-size:11px;letter-spacing:.1em;color:var(--dsw-alias-label-secondary)}",
			".wpd-slidefacts li{opacity:.22;transform:translateX(-4px);transition:opacity .32s cubic-bezier(.26,.86,.44,.985),transform .32s cubic-bezier(.26,.86,.44,.985)}",
			".wpd-slidefacts li.is-shown{opacity:1;transform:none}",
			".wpd-more{position:absolute;left:0;bottom:2px;font-size:11px;letter-spacing:.12em;color:var(--dsw-alias-label-secondary)}",
			".wpd-slidedetail{margin:6px 0 0;padding:14px 16px;font-size:12.5px;line-height:1.8;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,#FBF6EC 60%,var(--dsw-alias-bg-layer-1));border-left:2px solid #B57F24;border-radius:8px;max-height:46vh;overflow:auto}",
			".wpd-risklist{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:9px}",
			".wpd-risklist li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;font-size:13px;line-height:1.7;color:color-mix(in srgb,#8A4A16 82%,var(--dsw-alias-label-primary))}",
			".wpd-risklist b{font-weight:600;color:#8A4A16}",
			".wpd-retreat{font-size:12px;color:var(--dsw-alias-label-secondary)}",
			".wpd-deckbar{display:flex;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap}",
			".wpd-navbtn{font:inherit;font-size:13px;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-primary);background:transparent;border:1px solid var(--dsw-alias-border-l1);border-radius:50%;cursor:pointer}",
			".wpd-navbtn:disabled{opacity:.35;cursor:default}",
			".wpd-deckcount{font-family:var(--dsw-font-mono,monospace);font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}",
			".wpd-dots{display:flex;align-items:center;gap:5px;flex:1}",
			".wpd-dot{width:6px;height:6px;padding:0;border:0;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 20%,transparent);cursor:pointer;transition:width 160ms ease,background 160ms ease}",
			".wpd-dot.is-on{width:16px;background:#B57F24}",
			".wpd-fullbtn{font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);padding:5px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;cursor:pointer}",
			".wpd-wrap{margin-top:18px;padding:8px 4px;border-radius:14px;background:color-mix(in srgb,#FBF6EC 42%,var(--dsw-alias-bg-layer-1));border:1px solid color-mix(in srgb,#B57F24 16%,transparent);overflow:auto}",
			".wpd-link{stroke:color-mix(in srgb,var(--dsw-alias-label-primary) 24%,transparent);stroke-width:1.5}",
			".wpd-term circle{fill:color-mix(in srgb,#B57F24 85%,transparent)}",
			".wpd-term text{font-size:11px;fill:var(--dsw-alias-label-secondary)}",
			".wpd-node{cursor:pointer}",
			".wpd-box{fill:var(--dsw-alias-bg-layer-1);stroke:color-mix(in srgb,var(--wpbi-ink) 28%,transparent);stroke-width:1}",
			".wpd-node:hover .wpd-box{stroke-width:2}",
			".wpd-node.is-picked .wpd-box{stroke:var(--wpbi-ink);stroke-width:2;fill:color-mix(in srgb,var(--wpbi-ink) 8%,var(--dsw-alias-bg-layer-1))}",
			".wpd-bar{fill:var(--wpbi-ink)}",
			".wpd-no{font-size:13px;font-weight:700;fill:color-mix(in srgb,var(--wpbi-ink) 88%,#000);font-family:var(--dsw-font-mono,monospace)}",
			".wpd-title{font-size:14.5px;font-weight:600;fill:var(--dsw-alias-label-primary)}",
			".wpd-files{font-size:10.5px;fill:var(--dsw-alias-label-secondary)}",
			".wpd-sub{font-size:11.5px;fill:var(--dsw-alias-label-secondary)}",
			".wpd-legend text{font-size:10.5px;fill:var(--dsw-alias-label-secondary)}",
			".wpd-legendlink{stroke:color-mix(in srgb,var(--dsw-alias-label-primary) 24%,transparent);stroke-width:1.5}",
			".wpd-riskline{fill:none;stroke:color-mix(in srgb,#B57F24 70%,transparent);stroke-width:1.2;stroke-dasharray:4 3}",
			".wpd-riskbox{fill:color-mix(in srgb,#E9A94A 15%,var(--dsw-alias-bg-layer-1));stroke:color-mix(in srgb,#B57F24 42%,transparent)}",
			".wpd-risklabel{font-size:10.5px;font-weight:700;fill:#8A4A16}",
			".wpd-risktext{font-size:11px;fill:var(--dsw-alias-label-secondary)}",
			".wpd-detail{margin-top:16px;padding:16px 18px;border-radius:12px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1)}",
			".wpd-dethead{display:flex;align-items:baseline;gap:10px;margin-bottom:10px}",
			".wpd-detno{font-family:var(--dsw-font-mono,monospace);font-size:13px;font-weight:700;color:#B57F24}",
			".wpd-dettitle{font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-size:17px;font-weight:700;color:var(--dsw-alias-label-primary)}",
			".wpb2-facts{display:flex;flex-direction:column;gap:7px;margin-top:2px}",
			".wpb2-factrow{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:start}",
			".wpb2-factlabel{display:inline-flex;align-items:center;justify-content:center;min-width:52px;padding:3px 9px;border-radius:999px;font-size:11.5px;font-weight:600;letter-spacing:.04em;color:color-mix(in srgb,var(--wpbi-ink) 82%,#000);background:color-mix(in srgb,var(--wpbi-ink) 17%,var(--dsw-alias-bg-layer-1))}",
			".wpb2-factvalue{font-size:12.5px;line-height:1.75;color:var(--dsw-alias-label-secondary);padding-top:2px}",
			".wpb2-factrow.is-risk .wpb2-factlabel{color:#8A4A16;background:color-mix(in srgb,#E08A2E 26%,var(--dsw-alias-bg-layer-1))}",
			".wpb2-factrow.is-risk .wpb2-factvalue{color:color-mix(in srgb,#8A4A16 85%,var(--dsw-alias-label-primary))}",
			".wpb2-detailbox{display:flex;flex-direction:column;gap:8px;align-items:flex-start;margin-top:4px}",
			".wpb2-more{font:inherit;font-size:11.5px;color:color-mix(in srgb,var(--wpbi-ink) 70%,var(--dsw-alias-label-secondary));background:transparent;border:0;border-bottom:1px dashed color-mix(in srgb,var(--wpbi-ink) 40%,transparent);padding:1px 0;cursor:pointer}",
			".wpb2-more:hover{color:var(--dsw-alias-label-primary)}",
			".wpb2-detail{width:100%;margin:0;padding:12px 14px;font-size:12px;line-height:1.75;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,var(--wpbi-ink) 7%,var(--dsw-alias-bg-layer-1));border-radius:10px}",
			".wpb2-decisions{display:flex;flex-direction:column;gap:6px;margin-top:20px;padding:16px 18px;border-radius:12px;background:color-mix(in srgb,#3E6B4B 10%,var(--dsw-alias-bg-layer-1));border:1px solid color-mix(in srgb,#3E6B4B 22%,transparent);font-size:13px;color:var(--dsw-alias-label-secondary)}",
			".wpb2-decisions b{font-weight:700;color:color-mix(in srgb,#2F5A3C 80%,var(--dsw-alias-label-primary))}",
			".wpb2-decisions ul{margin:2px 0 0;padding-left:18px;line-height:1.9}",
			".wpb2-foot{margin:18px 0 0;padding:13px 18px;border-radius:12px;background:color-mix(in srgb,#E9A94A 14%,var(--dsw-alias-bg-layer-1));border:1px solid color-mix(in srgb,#E9A94A 34%,transparent);font-size:12.5px;line-height:1.7;color:color-mix(in srgb,#7A5638 85%,var(--dsw-alias-label-secondary));text-align:center}",
			".wpb2-empty{font-size:13.5px;line-height:1.8;color:var(--dsw-alias-label-secondary);padding:20px 0}",
			".wpb2-art,.wpb2-artimg{border-radius:16px;display:block}",
			".wpb2-cover{position:relative;margin:16px 0 6px;padding:20px 22px 16px;border-radius:14px;background:color-mix(in srgb,#FBF6EC 50%,var(--dsw-alias-bg-layer-1));border:1px solid color-mix(in srgb,#E9A94A 30%,transparent);display:flex;flex-direction:column;gap:14px}",
			".wpb2-coverhead{display:flex;flex-direction:column;gap:6px}",
			".wpb2-toc{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:6px 14px}",
			".wpb2-tocitem{display:grid;grid-template-columns:22px minmax(0,1fr);gap:8px;align-items:baseline}",
			".wpb2-tocdot{display:none}",
			".wpb2-tocno{font-family:'WPB Song',\"Songti SC\",\"STSong\",\"Noto Serif CJK SC\",var(--dsw-font-family,sans-serif);font-weight:700;font-size:12.5px;color:#B57F24;font-variant-numeric:tabular-nums}",
			".wpb2-toctitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".wpb2-tocmini{display:none}",
			".wpb2-band{display:none}",
			".wpb2-coverfoot{display:flex;align-items:center;gap:14px;flex-wrap:wrap}",
			".wpb2-open{font:inherit;font-size:13px;font-weight:600;color:#fff;padding:9px 18px;border:0;border-radius:999px;cursor:pointer;background:#1F2937;transition:background-color 140ms ease}",
			".wpb2-open:hover{background:#111827}",
			".wpb2-inline{font:inherit;font-size:12.5px;color:var(--dsw-alias-label-secondary);padding:8px 0;background:transparent;border:0;border-bottom:1px solid var(--dsw-alias-border-l1);cursor:pointer}",
			".wpb2-inline:hover{color:var(--dsw-alias-label-primary)}",
			".wpb2-hint{font-size:11.5px;color:var(--dsw-alias-label-secondary)}",
			".wpb3-entry{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);padding:5px 12px;border:1px solid color-mix(in srgb,#B57F24 34%,transparent);border-radius:999px;background:color-mix(in srgb,#FBF6EC 45%,var(--dsw-alias-bg-layer-1));cursor:pointer;transition:border-color 140ms ease}",
			".wpb3-entry:hover{border-color:#B57F24}",
			".wpb3-entry.is-failed{cursor:default;color:var(--dsw-alias-label-secondary)}",
			".wpb3-entrydot{width:6px;height:6px;border-radius:50%;background:#E9A94A}",
			".wpb3-entryhint{font-size:11px;color:var(--dsw-alias-label-secondary)}",
			"@media (max-width:900px){.wpd-slidart{display:none}.wpd-stage{max-height:none;min-height:0;aspect-ratio:auto}.wpb2-pane{padding:14px 12px 26px}.wpb2-head{grid-template-columns:minmax(0,1fr);gap:14px}.wpb2-heart{order:0}.wpb2-steps{grid-template-columns:minmax(0,1fr)}.wpb2-body{padding:20px 14px 18px;border-radius:14px}}",
			".wpb3-entry{display:inline-flex;align-items:center;gap:7px;font:inherit;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);padding:5px 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md,10px);background:var(--dsw-alias-bg-module-platform,#f5f6f7);cursor:pointer;transition:border-color 140ms ease}",
			".wpb3-entry:hover{border-color:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1))}",
			".wpb3-entry.is-failed{cursor:default;color:var(--dsw-alias-label-secondary)}",
			".wpb3-entrydot{width:6px;height:6px;border-radius:50%;background:hsl(216 68% 50%)}",
			".wpb3-entryhint{font-size:11px;font-weight:400;color:var(--dsw-alias-label-secondary)}",
		].join("\n");

		/* PLAN-SCENES:BEGIN */
		/** 信息图场景插画（按步序循环）。由 tools/gen-infographic-art.mjs 注入；空对象时面板不配插画。 */
		const PLAN_SCENES = {
			doing: "data:image/webp;base64,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",
			memory: "data:image/webp;base64,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",
			methods: "data:image/webp;base64,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",
			pipeline: "data:image/webp;base64,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",
			newtask: "data:image/webp;base64,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"
		};
		/* PLAN-SCENES:END */

		/* PLAN-ART:BEGIN */
		/** 生图母版（分类 → dataURL）。由 tools/gen-plan-art.mjs 注入；空对象时退回自绘 SVG 插画。 */
		const PLAN_ART = {};
		/* PLAN-ART:END */

		/**
		 * 图形名 → 内联 SVG 线稿（确定性：同一个名字永远同一张图；不联网、不调生图 API）。
		 * 每个条目是 [标签, 属性] 数组，渲染成 24×24 的描边小图。
		 */
		const PLAN_GLYPHS = {
			shield: [["path", { d: "M12 3.2l6.8 2.8v5.4c0 3.9-2.9 6.9-6.8 8.8-3.9-1.9-6.8-4.9-6.8-8.8V6z" }], ["path", { d: "M8.6 12.1l2.4 2.3 4.4-4.6" }]],
			power: [["path", { d: "M12 3.6v7.2" }], ["path", { d: "M7.4 7.2a6.4 6.4 0 106.9-.1" }]],
			palette: [["path", { d: "M12 3.6a8.4 8.4 0 000 16.8c1.5 0 2-.9 1.6-1.9-.5-1.2.3-2.2 1.7-2.2h1.3c1.7 0 2.9-1.2 2.9-2.9A8.4 8.4 0 0012 3.6z" }], ["circle", { cx: "8.4", cy: "10.2", r: "1.1" }], ["circle", { cx: "12", cy: "7.8", r: "1.1" }], ["circle", { cx: "15.6", cy: "10.2", r: "1.1" }]],
			book: [["path", { d: "M5.4 4.6h6.1c.9 0 1.5.6 1.5 1.4v13H6.8c-.8 0-1.4-.6-1.4-1.4z" }], ["path", { d: "M18.6 4.6h-4.1c-.9 0-1.5.6-1.5 1.4v13h4.2c.8 0 1.4-.6 1.4-1.4z" }], ["path", { d: "M7.4 9h3" }], ["path", { d: "M16.6 9h-3" }]],
			map: [["path", { d: "M4.4 6.6l5-2 5 2 5.2-2v12.8l-5.2 2-5-2-5 2z" }], ["path", { d: "M9.4 4.6v12.8" }], ["path", { d: "M14.4 6.6v12.8" }], ["circle", { cx: "12", cy: "11.4", r: "1.3" }]],
			check: [["path", { d: "M5 12.6l4.4 4.3L19 6.6" }]],
			file: [["path", { d: "M6.6 3.6h7l4.4 4.4v12.4H6.6z" }], ["path", { d: "M13.6 3.6V8h4.4" }], ["path", { d: "M9.4 12.4h5.6" }], ["path", { d: "M9.4 15.8h5.6" }]],
			search: [["circle", { cx: "11", cy: "11", r: "6.2" }], ["path", { d: "M15.6 15.6L20.4 20.4" }]],
			person: [["circle", { cx: "12", cy: "8.4", r: "3.2" }], ["path", { d: "M5.6 20c.6-3.6 3.2-5.6 6.4-5.6s5.8 2 6.4 5.6" }]],
			database: [["ellipse", { cx: "12", cy: "6.4", rx: "6.4", ry: "2.6" }], ["path", { d: "M5.6 6.4v11.2c0 1.4 2.9 2.6 6.4 2.6s6.4-1.2 6.4-2.6V6.4" }], ["path", { d: "M5.6 12c0 1.4 2.9 2.6 6.4 2.6s6.4-1.2 6.4-2.6" }]],
			warning: [["path", { d: "M12 4.6l7.4 13.2H4.6z" }], ["path", { d: "M12 9.6v4" }], ["circle", { cx: "12", cy: "16", r: "0.8" }]],
			clock: [["circle", { cx: "12", cy: "12", r: "7.8" }], ["path", { d: "M12 7.6V12l3.2 2" }]],
			key: [["circle", { cx: "8.4", cy: "12", r: "3.4" }], ["path", { d: "M11.8 12h8.2" }], ["path", { d: "M17.2 12v2.8" }], ["path", { d: "M19.8 12v2" }]],
			lamp: [["path", { d: "M12 3.6a5.4 5.4 0 013 9.9v2.1H9v-2.1a5.4 5.4 0 013-9.9z" }], ["path", { d: "M9.6 18.4h4.8" }], ["path", { d: "M10.6 20.6h2.8" }]],
			pen: [["path", { d: "M5 19l1.4-4.2L15.6 5.6l3.2 3.2L9.6 18z" }], ["path", { d: "M14.4 6.8l3.2 3.2" }]],
			box: [["path", { d: "M4.8 8.4h14.4v11H4.8z" }], ["path", { d: "M4.8 8.4l1.8-3.6h10.8l1.8 3.6" }], ["path", { d: "M10.2 8.4v3.2h3.6V8.4" }]],
			eye: [["path", { d: "M3.4 12c2.4-4 5.4-6 8.6-6s6.2 2 8.6 6c-2.4 4-5.4 6-8.6 6s-6.2-2-8.6-6z" }], ["circle", { cx: "12", cy: "12", r: "2.6" }]],
			house: [["path", { d: "M4.4 11L12 4.4 19.6 11" }], ["path", { d: "M6.4 10.2v9.4h11.2v-9.4" }], ["path", { d: "M10.4 19.6v-5h3.2v5" }]],
			gear: [["circle", { cx: "12", cy: "12", r: "3.2" }], ["path", { d: "M12 3.6v3" }], ["path", { d: "M12 17.4v3" }], ["path", { d: "M3.6 12h3" }], ["path", { d: "M17.4 12h3" }], ["path", { d: "M6.1 6.1l2.1 2.1" }], ["path", { d: "M15.8 15.8l2.1 2.1" }], ["path", { d: "M17.9 6.1l-2.1 2.1" }], ["path", { d: "M8.2 15.8l-2.1 2.1" }]],
			dot: [["circle", { cx: "12", cy: "12", r: "2.4" }]]
		};

		/** 图名 → 六个分类（决定配色与插画气质）。 */
		const PLAN_CATEGORY = {
			search: "analyze", map: "analyze", eye: "analyze", database: "analyze",
			pen: "build", gear: "build", key: "build", box: "build", house: "build", lamp: "build",
			check: "verify", shield: "verify",
			warning: "risk",
			book: "ship", dot: "ship", clock: "ship",
			file: "wrap", palette: "wrap", person: "wrap", power: "wrap"
		};
		/**
		 * 信息图面板的"墨水色"：**用我们自己的六个分类**（分析/动手/验证/风险/交付/收尾），
		 * 不从参考图抄配色 —— 学的是"暖底 + 彩块 + 标签行"这种做法，颜色是我们自己的语义。
		 */
		const PLAN_CATEGORY_INK = { analyze: "#3D5B84", build: "#C2542C", verify: "#3E6B4B", ship: "#6B4E86", risk: "#B4432C", wrap: "#5A6B72" };
		/** 取某一步的面板色。 */
		function planInk(glyph) {
			return PLAN_CATEGORY_INK[PLAN_CATEGORY[glyph] ?? "build"] ?? PLAN_CATEGORY_INK.build;
		}

		/** 分类 → 色相（每类一个色相，整份计划同一套）。 */
		const PLAN_HUE = { analyze: 216, build: 34, verify: 156, risk: 4, ship: 268, wrap: 196 };
		/** 表格不适合当"一句话"（实测：旧格式计划的表格被原样倒出来很难看）。 */
		const PLAN_TABLE_LIKE = /^\s*\||\|\s*-{2,}/u;

		/** 取某一步的色相。 */
		function planHue(glyph) {
			return PLAN_HUE[PLAN_CATEGORY[glyph] ?? "build"] ?? 216;
		}

		/** 去掉"一句话：/目标："前缀，别重复显示。 */
		function planCleanOne(text) {
			return String(text ?? "").replace(/^\s*(一句话(目标)?|目标)\s*[:：]\s*/u, "").trim();
		}

		/** 表格型内容换成一句诚实说明（原文仍在折叠里）。 */
		function planCleanDo(text, t) {
			const value = String(text ?? "").trim();
			return PLAN_TABLE_LIKE.test(value) ? t("plan.tableInstead") : value;
		}

		/**
		 * 计划流程图布局（**确定性**：同样的计划永远同一张图，刷新不跳）。
		 * 主轴纵向：每步一个节点；右边挂"万一"支线（虚线=退路）；下面列会碰的东西；头尾是开始/批准。
		 * @param steps - 计划里的步骤数组。
		 * @returns 节点、连线、支线、尺寸（全部算好，渲染层只画）。
		 */
		function planDiagramLayout(steps) {
			const NODE_W = 360;
			const NODE_H = 96;
			const GAP = 44;
			const X = 34;
			const TOP = 74;
			const BRANCH_GAP = 54;
			const nodes = [];
			const links = [];
			const risks = [];
			const files = [];
			steps.forEach((step, index) => {
				const y = TOP + index * (NODE_H + GAP);
				const ink = planInk(step.glyph);
				nodes.push({ n: step.n, title: step.title, do: String(step.do ?? ""), files: String(step.files ?? ""), ink, x: X, y, w: NODE_W, h: NODE_H });
				if (index > 0) {
					const prev = nodes[index - 1];
					links.push({ x1: X + NODE_W / 2, y1: prev.y + NODE_H, x2: X + NODE_W / 2, y2: y });
				}
				if (step.risk) {
					risks.push({ x: X + NODE_W + BRANCH_GAP, y: y + 8, w: 250, h: 46, text: step.risk, fromX: X + NODE_W, fromY: y + NODE_H / 2, ink });
				}

			});
			const last = nodes[nodes.length - 1];
			const endY = last === undefined ? TOP : last.y + NODE_H + GAP;
			return { x: X, nodeW: NODE_W, nodeH: NODE_H, width: 34 + NODE_W + BRANCH_GAP + 250 + 34, height: endY + 34 + 40, nodes, links, risks, files, start: { x: X + NODE_W / 2, y: 40 }, end: { x: X + NODE_W / 2, y: endY + 6 } };
		}

		/**
		 * 把一步的"因为/会碰/万一"拼成一行（分隔符只出现在两条之间，行首不会多一个点）。
		 * @param step - 计划里的一个步骤。
		 * @param t - 取文案。
		 * @returns 节点数组，直接塞进 <p class="wpb2-facts">。
		 */
		function planFacts(step, t) {
			const parts = [];
			if (step.why) parts.push(h("span", { className: "wpb2-fact", key: "why" }, `${t("plan.because")} `, step.why));
			if (step.files) parts.push(h("span", { className: "wpb2-fact", key: "files" }, `${t("plan.touches")} `, step.files));
			if (step.risk) parts.push(h("span", { className: "wpb2-fact is-risk", key: "risk" }, `${t("plan.riskWord")} `, step.risk));
			const out = [];
			parts.forEach((node, index) => {
				if (index > 0) out.push(h("i", { className: "wpb2-sep", key: `sep${index}` }, "·"));
				out.push(node);
			});
			return out;
		}

		/** 从右侧面板的导航信息里取要展示的 callId（param 优先，其次从地址里解）。 */
		function planPaneCallId(navigation) {
			const params = navigation?.params;
			if (params !== undefined && typeof params.callId === "string") return params.callId;
			const address = typeof navigation?.address === "string" ? navigation.address : "";
			if (!address.startsWith(PLAN_PANE_SCHEME)) return undefined;
			const parts = address.slice(PLAN_PANE_SCHEME.length).split("/").map((part) => { try { return decodeURIComponent(part); } catch { return part; } });
			return parts.length >= 2 ? parts[1] : undefined;
		}

		/**
		 * 画一张线稿小图。
		 * @param props - name 图形名；size 尺寸（默认 40）。
		 * @returns 24×24 viewBox 的 SVG。
		 */
		function PlanGlyph(props) {
			const parts = PLAN_GLYPHS[props.name] ?? PLAN_GLYPHS.dot;
			const size = props.size ?? 40;
			return h(
				"svg",
				{ className: "wpb-glyph", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
				parts.map(([tag, attrs], index) => h(tag, { key: index, ...attrs }))
			);
		}

		/**
		 * 头图：优先用生图母版（PLAN_ART），否则自绘分层 SVG（渐变圆底 + 主体 + 点缀）。
		 * @param props - name 图形名；size 尺寸。
		 * @returns 插画节点。
		 */
		function PlanArt(props) {
			const category = PLAN_CATEGORY[props.name] ?? "build";
			const hue = PLAN_HUE[category] ?? 216;
			const size = props.size ?? 96;
			const art = PLAN_ART[category];
			if (typeof art === "string" && art.length > 0) {
				return h("img", { className: "wpb2-artimg", src: art, width: size, height: size, alt: "", "aria-hidden": "true" });
			}
			const parts = PLAN_GLYPHS[props.name] ?? PLAN_GLYPHS.dot;
			return h(
				"svg",
				{ className: "wpb2-art", width: size, height: size, viewBox: "0 0 160 160", role: "img", "aria-hidden": "true" },
				h("defs", null,
					h("linearGradient", { id: `wpb2g${hue}`, x1: "0", y1: "0", x2: "1", y2: "1" },
						h("stop", { offset: "0%", stopColor: `hsl(${hue} 62% 30%)` }),
						h("stop", { offset: "100%", stopColor: `hsl(${(hue + 38) % 360} 58% 18%)` }))),
				h("rect", { x: 6, y: 6, width: 148, height: 148, rx: 34, fill: `url(#wpb2g${hue})` }),
				h("circle", { cx: 124, cy: 38, r: 14, fill: `hsl(${(hue + 40) % 360} 90% 62%)`, opacity: 0.55 }),
				h("circle", { cx: 34, cy: 126, r: 9, fill: `hsl(${(hue + 10) % 360} 80% 70%)`, opacity: 0.4 }),
				h("g", { transform: "translate(38 38) scale(3.5)", stroke: `hsl(${hue} 90% 88%)`, strokeWidth: 1.7, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" },
					parts.map(([tag, attrs], index) => h(tag, { key: index, ...attrs })))
			);
		}

		/**
		 * 计划正文（右侧面板与"就地展开"共用同一份渲染）：
		 * 头部一句话 + 每步一行（色相序号 + 标题 + 一句话 + 因/碰/万一 + 折叠原文）+ 要你定的 + 脚注。
		 * @param props - plan；t；compact 紧凑模式（对话里就地展开时用）。
		 * @returns 正文节点。
		 */
		/**
		 * 汇报稿的页序编排（确定性）：封面 → 计划一览 → 每步一页（有细节的再补一页）→ 可能出问题的地方 → 收尾。
		 * @param plan - 计划对象。
		 * @returns 幻灯片数组，每项 { kind, step?, index? }。
		 */
		function planDeckSlides(plan) {
			const steps = Array.isArray(plan.steps) ? plan.steps : [];
			const slides = [{ kind: "cover" }, { kind: "agenda" }];
			steps.forEach((step, index) => {
				slides.push({ kind: "step", step, index });
				if (String(step.detail ?? "").trim() !== "") slides.push({ kind: "detail", step, index });
			});
			if (steps.some((step) => String(step.risk ?? "").trim() !== "")) slides.push({ kind: "risks" });
			slides.push({ kind: "end" });
			return slides;
		}

		/**
		 * 取提案四节（老缓存里没这几节就是四个空串，不抛）。
		 * @param plan - 投影里的一份计划。
		 * @returns 四个字段的正文。
		 */
		function planSectionsOf(plan) {
			const sections = plan?.sections ?? {};
			return {
				status: String(sections.status ?? ""),
				alternatives: String(sections.alternatives ?? ""),
				cost: String(sections.cost ?? ""),
				success: String(sections.success ?? "")
			};
		}

		/**
		 * 提案里的一节正文：只用留白分隔（不加卡片、不加边框），每行一段。
		 * @param cls - 附加类名（wpp-sec-status / wpp-sec-alternatives / wpp-sec-cost / wpp-sec-success）。
		 * @param title - 节标题（字典里的中文原文）。
		 * @param body - 节正文。
		 * @returns 这一节；没内容就返回 null。
		 */
		function planSectionBlock(cls, title, body) {
			const lines = String(body ?? "").split("\n").map((line) => line.trim()).filter((line) => line !== "");
			if (lines.length === 0) return null;
			return h(
				"section",
				{ className: `wpp-sec ${cls}` },
				h("h2", { className: "wpp-sechead" }, title),
				lines.map((line, index) => h("p", { className: "wpp-secline", key: index }, line))
			);
		}

		/**
		 * 一屏决策版（默认视图，三层密度，只改这一层）：
		 * 第一层默认可见且必须一屏看完 —— 标题 + 一句话 → 要你定的（最多 3 条，原文照出）→ 代价与退路（整段）
		 * → 一行规模 + 一句「看完这屏就能决定」；
		 * 第二层原生 `<details>` 折叠依据（现状 · 为什么不选别的 · 怎么算成功）；
		 * 第三层原生 `<details>` 折叠完整步骤（≥7 步时，summary 里带一行纯文字目录，可点 `#wpp-step-N` 锚点）。
		 * 依据与步骤各自不存在就整块不渲染（不留空壳、不报错）；折叠用原生 details，零 JS。
		 * @param props - plan / t。
		 * @returns 一屏决策 + 两层折叠的文章。
		 */
		function PlanProse(props) {
			const t = props.t;
			const plan = props.plan;
			const steps = Array.isArray(plan.steps) ? plan.steps : [];
			const decisions = Array.isArray(plan.decisions) ? plan.decisions : [];
			const sections = planSectionsOf(plan);
			const cut = plan.truncated === true;
			const cutSteps = cut && Number(plan.stepCount ?? steps.length) > steps.length;
			const fileCount = steps.filter((step) => String(step.files ?? "").trim() !== "").length;
			const riskCount = steps.filter((step) => String(step.risk ?? "").trim() !== "").length;
			// 海报的主角：第一张场景插画（base64 内联）；一张都没有时换成一整块暖色块，绝不外链图片
			const scene = Object.values(PLAN_SCENES).find((src) => typeof src === "string" && src.length > 0);
			// 大数字排：只摆真数（没有就不摆 0）
			const stats = [{ num: steps.length, label: t("plan.stepsUnit") }];
			if (fileCount > 0) stats.push({ num: fileCount, label: t("plan.statFiles") });
			if (riskCount > 0) stats.push({ num: riskCount, label: t("plan.statRisks") });
			const facts = (step) => {
				const rows = [];
				if (String(step.why ?? "").trim() !== "") rows.push(h("p", { className: "wpp-fact", key: "why" }, h("b", null, t("plan.rowWhy")), step.why));
				if (String(step.files ?? "").trim() !== "") rows.push(h("p", { className: "wpp-fact", key: "files" }, h("b", null, t("plan.rowFiles")), h("code", null, step.files)));
				if (String(step.risk ?? "").trim() !== "") rows.push(h("p", { className: "wpp-fact is-risk", key: "risk" }, h("b", null, t("plan.rowRisk")), step.risk));
				if (String(step.accept ?? "").trim() !== "") rows.push(h("p", { className: "wpp-fact is-accept", key: "accept" }, h("b", null, t("plan.rowAccept")), step.accept));
				return rows;
			};
			// 第二层：依据三节。三节全空就整块不渲染（不留空壳）。
			const basis = [
				planSectionBlock("wpp-sec-status", t("plan.secStatus"), sections.status),
				planSectionBlock("wpp-sec-alternatives", t("plan.secAlternatives"), sections.alternatives),
				planSectionBlock("wpp-sec-success", t("plan.secSuccess"), sections.success)
			].filter((block) => block !== null);
			// 第三层：完整步骤 + （≥7 步时）summary 里那行纯文字目录（纯文字，不做成卡片/徽章）
			const stepList = h(
				"ol",
				{ className: "wpp-list" },
				steps.map((step) => h(
					"li",
					{ className: "wpp-step", key: step.n, id: `wpp-step-${step.n}` },
					h("div", { className: "wpp-stephead" }, h("span", { className: "wpp-no" }, String(step.n)), h("h2", { className: "wpp-steptitle" }, step.title)),
					step.do ? h("p", { className: "wpp-do" }, planCleanDo(step.do, t)) : null,
					facts(step),
					String(step.detail ?? "").trim() !== ""
						? h("details", { className: "wpp-details" }, h("summary", null, t("plan.showDetail")), h("pre", { className: "wpp-detail" }, step.detail))
						: null
				))
			);
			const stepToc = steps.length >= 7
				? h(
					"span",
					{ className: "wpp-toc" },
					steps.map((step, index) => [
						index > 0 ? h("span", { className: "wpp-tocsep", key: `s${step.n}` }, " · ") : null,
						h("a", { key: step.n, className: "wpp-tocitem", href: `#wpp-step-${step.n}` }, `${step.n} ${step.title}`)
					])
				)
				: null;
			return h(
				"article",
				{ className: "wpp" },
				// 第一层：一屏就能决定的东西（巨字标题 + 一句话 → 右侧一张大图主角）
				h(
					"header",
					{ className: "wpp-hero" },
					h(
						"div",
						{ className: "wpp-herotext" },
						h("h1", { className: "wpp-title" }, plan.title),
						plan.oneLine ? h("p", { className: "wpp-lede" }, planCleanOne(plan.oneLine)) : null
					),
					scene === undefined
						? h("div", { className: "wpp-heroart", "aria-hidden": "true" }, h("div", { className: "wpp-heroblk" }))
						: h("div", { className: "wpp-heroart" }, h("img", { className: "wpb2-artimg wpp-heroimg", src: scene, alt: "", "aria-hidden": "true" }))
				),
				decisions.length === 0
					? null
					: h(
						"section",
						{ className: "wpp-decisions" },
						h("h2", null, t("plan.decisions")),
						h("ul", null, decisions.slice(0, 3).map((decision, index) => h("li", { className: "wpp-mustitem", key: index }, decision.q)))
					),
				planSectionBlock("wpp-sec-cost", t("plan.secCost"), sections.cost),
				// 大数字排（步 / 处改动 / 个风险点）：宋体大数 + 11px 小标签，竖细线分隔
				h(
					"div",
					{ className: "wpp-scale" },
					stats.map((stat, index) => [
						index > 0 ? h("span", { className: "wpp-statline", key: `line-${index}`, "aria-hidden": "true" }) : null,
						h("span", { className: "wpp-stat", key: `stat-${index}` }, h("span", { className: "wpp-statnum" }, String(stat.num)), h("span", { className: "wpp-statlabel" }, stat.label))
					])
				),
				cut ? h("p", { className: "wpp-cut" }, cutSteps ? t("plan.truncated") : t("plan.truncatedText")) : null,
				h("p", { className: "wpp-hint" }, t("plan.oneScreenHint")),
				// 第二层：依据（默认收起，点一次展开）
				basis.length === 0 ? null : h("details", { className: "wpp-fold wpp-fold-basis" }, h("summary", null, t("plan.foldBasis")), basis),
				// 第三层：完整步骤（第二批收起）
				steps.length === 0 ? null : h(
					"details",
					{ className: "wpp-fold wpp-fold-steps" },
					h("summary", null, `${t("plan.foldSteps")} ${steps.length} ${t("plan.stepsUnit")}`, stepToc),
					stepList
				),
				h("p", { className: "wpp-foot" }, t("plan.footnote"))
			);
		}

		/**
		 * 汇报稿（传统 PPT 的做法，但用 HTML 做）：封面 → 每步一页 → 收尾页。
		 * 有 16:9 舞台、页码、左右翻页、键盘 ←/→、全屏；没有自动播放的动效。
		 * @param props - plan / t / compact。
		 * @returns 一页式的汇报视图。
		 */
		function PlanDeck(props) {
			const t = props.t;
			const plan = props.plan;
			const steps = Array.isArray(plan.steps) ? plan.steps : [];
			const decisions = Array.isArray(plan.decisions) ? plan.decisions : [];
			const slides = planDeckSlides(plan);
			const total = slides.length;
			const [slide, setSlide] = React.useState(0);
			const [shown, setShown] = React.useState(0);
			const [full, setFull] = React.useState(false);
			const index = Math.min(Math.max(slide, 0), total - 1);
			const current = slides[index];
			const scenes = Object.values(PLAN_SCENES);
			const files = steps.map((step) => String(step.files ?? "").trim()).filter((x) => x !== "");
			const riskRows = steps.filter((step) => String(step.risk ?? "").trim() !== "");
			const foldedCount = steps.filter((step) => String(step.detail ?? "").trim() !== "").length;
			const rowsOf = (slideDef) => (slideDef === undefined || slideDef.kind !== "step" ? 0 : [slideDef.step.why, slideDef.step.files, slideDef.step.risk].filter((x) => String(x ?? "").trim() !== "").length + 1);

			const go = (delta) => {
				const rows = rowsOf(current);
				if (delta > 0 && shown < rows) { setShown(shown + 1); return; }
				if (delta < 0 && shown > 0) { setShown(shown - 1); return; }
				setShown(0);
				setSlide(Math.min(Math.max(index + delta, 0), total - 1));
			};
			React.useEffect(() => {
				if (typeof window === "undefined" || typeof window.addEventListener !== "function") return undefined;
				const onKey = (event) => {
					if (event.key === "ArrowRight") go(1);
					else if (event.key === "ArrowLeft") go(-1);
					else if (event.key === "Escape") setFull(false);
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			});

			const art = scenes.length === 0 ? null : h("img", { className: "wpd-slidart", src: scenes[index % scenes.length], alt: "", "aria-hidden": "true" });
			let body = null;
			if (current !== undefined && current.kind === "cover") {
				body = h(
					"div",
					{ className: "wpd-slide is-cover" },
					h("span", { className: "wpd-slidekicker" }, t("plan.kicker")),
					h("h2", { className: "wpd-slidetitle is-big" }, plan.title),
					plan.oneLine ? h("p", { className: "wpd-slideoneline" }, planCleanOne(plan.oneLine)) : null,
					h(
						"div",
						{ className: "wpd-stats" },
						h("span", { className: "wpd-statcell" }, h("b", null, String(steps.length)), h("i", null, t("plan.stepsUnit"))),
						h("span", { className: "wpd-statcell" }, h("b", null, String(files.length)), h("i", null, t("plan.statFiles"))),
						h("span", { className: "wpd-statcell" }, h("b", null, String(riskRows.length)), h("i", null, t("plan.statRisks"))),
						h("span", { className: "wpd-statcell" }, h("b", null, String(foldedCount)), h("i", null, t("plan.statDetails")))
					)
				);
			} else if (current !== undefined && current.kind === "agenda") {
				body = h(
					"div",
					{ className: "wpd-slide" },
					h("h2", { className: "wpd-slidetitle" }, t("plan.deckAgenda")),
					h(
						"ol",
						{ className: "wpd-agenda" },
						steps.map((step) => h(
							"li",
							{ key: step.n, style: { "--wpbi-ink": planInk(step.glyph) } },
							h("span", { className: "wpd-agendano" }, String(step.n).padStart(2, "0")),
							h("span", { className: "wpd-agendatitle" }, step.title),
							h("span", { className: "wpd-agendado" }, String(step.do ?? "").slice(0, 34))
						))
					)
				);
			} else if (current !== undefined && current.kind === "step") {
				const step = current.step;
				const rows = [
					{ label: t("plan.rowDo"), text: planCleanDo(step.do, t), risk: false },
					{ label: t("plan.rowWhy"), text: step.why, risk: false },
					{ label: t("plan.rowFiles"), text: step.files, risk: false },
					{ label: t("plan.rowRisk"), text: step.risk, risk: true }
				].filter((row) => String(row.text ?? "").trim() !== "");
				body = h(
					"div",
					{ className: "wpd-slide", style: { "--wpbi-ink": planInk(step.glyph) } },
					h(
						"div",
						{ className: "wpd-slidehead" },
						h("span", { className: "wpd-slideno" }, String(current.index + 1).padStart(2, "0")),
						h("div", null,
							h("h2", { className: "wpd-slidetitle" }, step.title),
							h("p", { className: "wpd-slidepos" }, `${t("plan.deckStepOf")} ${current.index + 1} / ${steps.length}`)
						)
					),
					h(
						"ul",
						{ className: "wpd-slidefacts" },
						rows.map((row, i) => h(
							"li",
							{ key: row.label, className: `${row.risk ? "is-risk" : ""}${i < shown ? " is-shown" : ""}` },
							h("b", null, row.label),
							row.text
						))
					),
					shown < rows.length ? h("span", { className: "wpd-more" }, t("plan.deckPressMore")) : null
				);
			} else if (current !== undefined && current.kind === "detail") {
				body = h(
					"div",
					{ className: "wpd-slide" },
					h("h2", { className: "wpd-slidetitle" }, `${t("plan.deckStepOf")} ${current.index + 1} · ${t("plan.deckDetail")}`),
					h("pre", { className: "wpd-slidedetail" }, current.step.detail)
				);
			} else if (current !== undefined && current.kind === "risks") {
				body = h(
					"div",
					{ className: "wpd-slide" },
					h("h2", { className: "wpd-slidetitle" }, t("plan.deckRisks")),
					h(
						"ul",
						{ className: "wpd-risklist" },
						riskRows.map((step) => h("li", { key: step.n }, h("b", null, `${t("plan.deckStepOf")} ${step.n}`), step.risk, step.retreat ? h("span", { className: "wpd-retreat" }, `→ ${step.retreat}`) : null))
					)
				);
			} else {
				body = h(
					"div",
					{ className: "wpd-slide is-end" },
					h("h2", { className: "wpd-slidetitle" }, t("plan.deckEnd")),
					decisions.length > 0
						? h("div", { className: "wpd-slidedecisions" }, h("b", null, t("plan.decisions")), h("ul", null, decisions.map((decision, i) => h("li", { key: i }, decision.q))))
						: null,
					h("p", { className: "wpd-slidefoot" }, t("plan.footnote"))
				);
			}

			return h(
				"div",
				{ className: `wpd-deck${full ? " is-full" : ""}` },
				h("div", { className: "wpd-progress" }, h("span", { style: { transform: `scaleX(${(index + 1) / total})` } })),
				h("div", { className: "wpd-stage" }, body, art),
				h(
					"div",
					{ className: "wpd-deckbar" },
					h("button", { type: "button", className: "wpd-navbtn", onClick: () => go(-1), disabled: index === 0 && shown === 0 }, "◀"),
					h("span", { className: "wpd-deckcount" }, `${index + 1} / ${total}`),
					h("button", { type: "button", className: "wpd-navbtn", onClick: () => go(1), disabled: index === total - 1 && shown >= rowsOf(current) }, "▶"),
					h("span", { className: "wpd-dots" }, slides.map((slideDef, i) => h("button", { key: i, type: "button", className: `wpd-dot${i === index ? " is-on" : ""}`, "aria-label": `${t("plan.kicker")} ${i + 1}`, onClick: () => { setShown(0); setSlide(i); } }))),
					h("button", { type: "button", className: "wpd-fullbtn", onClick: () => setFull((value) => !value) }, full ? t("plan.deckExitFull") : t("plan.deckFull"))
				)
			);
		}

		function PlanBookBody(props) {
			const t = props.t;
			const plan = props.plan;
			const steps = Array.isArray(plan.steps) ? plan.steps : [];
			const decisions = Array.isArray(plan.decisions) ? plan.decisions : [];
			const [view, setView] = React.useState("prose");
			const [picked, setPicked] = React.useState("");
			const [folded, setFolded] = React.useState("");
			const layout = planDiagramLayout(steps);
			const fileCount = steps.reduce((sum, step) => sum + (String(step.files ?? "").trim() === "" ? 0 : 1), 0);
			const riskCount = steps.reduce((sum, step) => sum + (String(step.risk ?? "").trim() === "" ? 0 : 1), 0);
			const foldedCount = steps.reduce((sum, step) => sum + (String(step.detail ?? "").trim() === "" ? 0 : 1), 0);
			const current = steps.find((step) => String(step.n) === picked) ?? steps[0];

			return h(
				"section",
				{ className: `wpb2-body${props.compact === true ? " is-compact" : ""}${view === "prose" ? " is-prose" : ""}`, "data-plan-body": plan.callId },
				// 顶部：海报版（正文）时收成报头一行 —— 标题与一句话由下面那张海报当主角，不重复摆一遍
				h(
					"header",
					{ className: "wpb2-head" },
					h(
						"div",
						{ className: "wpb2-headtext" },
						h("span", { className: "wpb2-kicker" }, t("plan.kicker")),
						h("h3", { className: "wpb2-title" }, plan.title),
						view === "prose" ? null : (plan.oneLine ? h("p", { className: "wpb2-oneline" }, planCleanOne(plan.oneLine)) : null),
						h(
							"p",
							{ className: "wpb2-meta" },
							`${steps.length} ${t("plan.stepsUnit")}`,
							fileCount > 0 ? ` · ${fileCount} ${t("plan.statFiles")}` : null,
							riskCount > 0 ? ` · ${riskCount} ${t("plan.statRisks")}` : null,
							foldedCount > 0 ? ` · ${foldedCount} ${t("plan.statDetails")}` : null
						)
					),
					view !== "prose" && Object.values(PLAN_SCENES).length > 0
						? h("span", { className: "wpb2-heart" }, h("img", { className: "wpb2-artimg", src: Object.values(PLAN_SCENES)[0], width: 150, height: 150, alt: "", "aria-hidden": "true" }))
						: null
				),
				// 视图切换：汇报稿（默认）/ 流程图
				h(
					"div",
					{ className: "wpd-viewtabs" },
					h("button", { type: "button", className: `wpd-viewtab${view === "prose" ? " is-on" : ""}`, onClick: () => setView("prose") }, t("plan.viewProse")),
					h("button", { type: "button", className: `wpd-viewtab${view === "deck" ? " is-on" : ""}`, onClick: () => setView("deck") }, t("plan.viewDeck")),
					h("button", { type: "button", className: `wpd-viewtab${view === "diagram" ? " is-on" : ""}`, onClick: () => setView("diagram") }, t("plan.viewDiagram"))
				),
				view === "prose" ? h(PlanProse, { plan, t }) : null,
				view === "deck" ? h(PlanDeck, { plan, t }) : null,
				// 图：流程图本体（节点 + 箭头 + 退路支线 + 会碰的东西）
				view !== "diagram" ? null : h(
					"div",
					{ className: "wpd-wrap" },
					h(
						"svg",
						{ className: "wpd", viewBox: `0 0 ${layout.width} ${layout.height}`, role: "img", "aria-label": `${t("plan.kicker")} ${steps.length} ${t("plan.stepsUnit")}` },
						h("defs", null,
							h("marker", { id: "wpd-arrow", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse" },
								h("path", { d: "M0 0L10 5L0 10z", fill: "currentColor", opacity: "0.5" }))),
						// 图例：先告诉人"这些线是什么意思"
						h("g", { className: "wpd-legend" },
							h("line", { className: "wpd-legendlink", x1: layout.x, y1: 10, x2: layout.x + 26, y2: 10, markerEnd: "url(#wpd-arrow)" }),
							h("text", { x: layout.x + 34, y: 14 }, t("plan.legendOrder")),
							h("line", { className: "wpd-riskline", x1: layout.x + 168, y1: 10, x2: layout.x + 194, y2: 10 }),
							h("text", { x: layout.x + 202, y: 14 }, t("plan.legendRisk"))),
						// 开始标记
						h("g", { className: "wpd-term" }, h("circle", { cx: layout.start.x, cy: layout.start.y, r: 4 }), h("text", { x: layout.start.x + 12, y: layout.start.y + 4 }, t("plan.diagStart"))),
						// 主轴连线
						layout.links.map((link, index) => h("line", { key: `l${index}`, className: "wpd-link", x1: link.x1, y1: link.y1, x2: link.x2, y2: link.y2, markerEnd: "url(#wpd-arrow)" })),
						// 步骤节点
						layout.nodes.map((node) => h(
							"g",
							{ key: `n${node.n}`, className: `wpd-node${String(current?.n) === String(node.n) ? " is-picked" : ""}`, style: { "--wpbi-ink": node.ink }, onClick: () => setPicked(String(node.n)), role: "button", tabIndex: 0 },
							h("rect", { className: "wpd-box", x: node.x, y: node.y, width: node.w, height: node.h, rx: 12 }),
							h("rect", { className: "wpd-bar", x: node.x, y: node.y, width: 5, height: node.h, rx: 2.5 }),
							h("text", { className: "wpd-no", x: node.x + 20, y: node.y + node.h / 2 + 1 }, String(node.n).padStart(2, "0")),
							h("text", { className: "wpd-title", x: node.x + 58, y: node.y + 34 }, node.title.length > 20 ? `${node.title.slice(0, 20)}…` : node.title),
							h("text", { className: "wpd-sub", x: node.x + 58, y: node.y + 58 }, node.do === "" ? t("plan.diagNoLine") : (node.do.length > 30 ? `${node.do.slice(0, 30)}…` : node.do))
							,
							node.files === "" ? null : h("text", { className: "wpd-files", x: node.x + 58, y: node.y + 76 }, `▸ ${node.files.length > 34 ? `${node.files.slice(0, 34)}…` : node.files}`)
						)),
						// 会碰的东西（节点下方小字）

						// 「万一」支线：虚线 + 琥珀框（这就是"退路"画在图上）
						layout.risks.map((risk, index) => h(
							"g",
							{ key: `r${index}`, className: "wpd-risk" },
							h("path", { className: "wpd-riskline", d: `M${risk.fromX} ${risk.fromY} H${risk.x - 12} V${risk.y + risk.h / 2} H${risk.x}`, markerEnd: "url(#wpd-arrow)" }),
							h("rect", { className: "wpd-riskbox", x: risk.x, y: risk.y, width: risk.w, height: risk.h, rx: 10 }),
							h("text", { className: "wpd-risklabel", x: risk.x + 10, y: risk.y + 18 }, t("plan.riskWord")),
							h("text", { className: "wpd-risktext", x: risk.x + 10, y: risk.y + 35 }, risk.text.length > 22 ? `${risk.text.slice(0, 22)}…` : risk.text)
						)),
						// 终点：批准后执行
						h("g", { className: "wpd-term" }, h("circle", { cx: layout.end.x, cy: layout.end.y, r: 4 }), h("text", { x: layout.end.x + 12, y: layout.end.y + 4 }, t("plan.diagEnd")))
					)
				),
				// 文字退居次要：点哪个节点，这里显示那一步的完整说明
				view !== "diagram" || current === undefined ? null : h(
					"div",
					{ className: "wpd-detail" },
					h("div", { className: "wpd-dethead" }, h("span", { className: "wpd-detno" }, String(current.n).padStart(2, "0")), h("span", { className: "wpd-dettitle" }, current.title)),
					h(
						"div",
						{ className: "wpb2-facts" },
						current.do ? h("div", { className: "wpb2-factrow" }, h("span", { className: "wpb2-factlabel" }, t("plan.rowDo")), h("span", { className: "wpb2-factvalue" }, planCleanDo(current.do, t))) : null,
						current.why ? h("div", { className: "wpb2-factrow" }, h("span", { className: "wpb2-factlabel" }, t("plan.rowWhy")), h("span", { className: "wpb2-factvalue" }, current.why)) : null,
						current.files ? h("div", { className: "wpb2-factrow" }, h("span", { className: "wpb2-factlabel" }, t("plan.rowFiles")), h("span", { className: "wpb2-factvalue" }, current.files)) : null,
						current.risk ? h("div", { className: "wpb2-factrow is-risk" }, h("span", { className: "wpb2-factlabel" }, t("plan.rowRisk")), h("span", { className: "wpb2-factvalue" }, current.risk)) : null
					),
					current.detail
						? h(
							"div",
							{ className: "wpb2-detailbox" },
							h("button", { type: "button", className: "wpb2-more", onClick: () => setFolded(folded === String(current.n) ? "" : String(current.n)) }, folded === String(current.n) ? t("plan.hideDetail") : t("plan.showDetail")),
							folded === String(current.n) ? h("pre", { className: "wpb2-detail" }, current.detail) : null
						)
						: null
				),
				// 「要你定的」+ 脚注：正文版自己安静地讲（在第一屏），只有汇报稿/流程图还沿用这里的色块版
				view === "prose" ? null : decisions.length > 0
					? h("div", { className: "wpb2-decisions" }, h("b", null, t("plan.decisions")), h("ul", null, decisions.map((decision, index) => h("li", { key: index }, decision.q))))
					: null,
				view === "prose" ? null : h("p", { className: "wpb2-foot" }, t("plan.footnote"))
			);
		}

		/**
		 * 右侧大框里的计划页（官方机制：sidebarRightTabs 按地址模式把这一格派给我们的 key）。
		 * @param props - 插槽给的 sessionId / tab（导航信息）/ useProjection + 我们注入的 t。
		 * @returns 计划正文，或诚实的空/缺失提示。
		 */
		function PlanBookPane(props) {
			const t = props.t;
			const useProjection = props.useProjection;
			const book = typeof useProjection === "function" ? useProjection(PLAN_BOOK_KEY) : undefined;
			if (typeof useProjection !== "function") return h("div", { className: "wpb2-pane" }, h("p", { className: "wpb-hint" }, t("plan.noHook")));
			const plans = Array.isArray(book?.plans) ? book.plans : null;
			const wanted = planPaneCallId(props.tab?.tab?.navigation);
			const plan = (wanted === undefined ? undefined : (plans ?? []).find((item) => item.callId === wanted)) ?? (plans ?? [])[(plans ?? []).length - 1];
			return h(
				"div",
				{ className: "wpb2-pane" },
				plans === null
					? h("p", { className: "wpb-hint" }, t("plan.unavailable"))
					: plan === undefined
						? h("p", { className: "wpb2-empty" }, t("plan.paneEmpty"))
						: h(PlanBookBody, { plan, t })
			);
		}

		/**
		 * 会话标题栏的常驻入口（list 插槽，用自己的新 id）：有计划时显示「计划 · N 步」，点一下在右侧大框打开。
		 * 为什么需要它：摘要卡只在"提交计划的那一轮"里，翻历史很难找 —— 常驻入口让"在哪看"不再是问题。
		 * @param props - useProjection / sessionId / openPlanPane + 注入的 t。
		 * @returns 按钮或 null（没有计划时不占位）。
		 */
		function PlanBookHeaderAction(props) {
			const t = props.t;
			const useProjection = props.useProjection;
			const [failed, setFailed] = React.useState(false);
			const book = typeof useProjection === "function" ? useProjection(PLAN_BOOK_KEY) : undefined;
			const plans = Array.isArray(book?.plans) ? book.plans : [];
			if (plans.length === 0) return null;
			const plan = plans[plans.length - 1];
			const steps = Array.isArray(plan.steps) ? plan.steps : [];
			const sessionId = typeof props.sessionId === "string" ? props.sessionId : props.sessionId?.sessionId;
			const onClick = () => {
				const address = `${PLAN_PANE_SCHEME}${encodeURIComponent(String(sessionId ?? ""))}/${encodeURIComponent(plan.callId)}`;
				const opened = typeof props.openPlanPane === "function" ? props.openPlanPane(address, plan) : false;
				setFailed(opened !== true);
			};
			return h(
				"button",
				{
					type: "button",
					className: `wpb3-entry${failed ? " is-failed" : ""}`,
					title: failed ? t("plan.paneUnavailable") : t("plan.open"),
					onClick
				},
				h("span", { className: "wpb3-entrydot", "aria-hidden": "true" }),
				h("span", null, `${t("plan.kicker")} · ${steps.length}`),
				h("span", { className: "wpb3-entryhint" }, failed ? t("plan.paneUnavailableShort") : t("plan.openShort"))
			);
		}

		/**
		 * 对话尾那一格：计划摘要（标题 + 一句话 + 步骤目录 + 色带）+「在右侧打开」。
		 * 右侧打不开（服务缺席）时就地展开同一份正文 —— 不让你白点。
		 * @param props - 插槽给的 turn/seq/sessionId + useProjection + 注册闭包注入的 t 与 openPlanPane。
		 * @returns 摘要卡片；本轮没有计划时返回 null。
		 */
		function PlanBookStrip(props) {
			const t = props.t;
			const useProjection = props.useProjection;
			const [inline, setInline] = React.useState(false);
			const [failNote, setFailNote] = React.useState(false);
			const book = typeof useProjection === "function" ? useProjection(PLAN_BOOK_KEY) : undefined;
			const mode = typeof useProjection === "function" ? useProjection("plan") : undefined;

			if (typeof useProjection !== "function") {
				return h("div", { className: "wpb-hint" }, t("plan.noHook"));
			}
			const plans = Array.isArray(book?.plans) ? book.plans : null;
			if (plans === null) {
				return mode?.active === true ? h("div", { className: "wpb-hint" }, t("plan.unavailable")) : null;
			}
			const turnNo = props.turn?.turn;
			const mine = plans.filter((plan) => turnNo === undefined || plan.turn === turnNo);
			if (mine.length === 0) return null;
			const plan = mine[mine.length - 1];
			const steps = Array.isArray(plan.steps) ? plan.steps : [];
			const sessionId = typeof props.sessionId === "string" ? props.sessionId : props.sessionId?.sessionId;
			const openPane = () => {
				const address = `${PLAN_PANE_SCHEME}${encodeURIComponent(String(sessionId ?? ""))}/${encodeURIComponent(plan.callId)}`;
				const opened = typeof props.openPlanPane === "function" ? props.openPlanPane(address, plan) : false;
				if (opened === true) { setFailNote(false); return; }
				setFailNote(true);
				setInline(true);
			};

			return h(
				React.Fragment,
				null,
				h(
					"section",
					{ className: "wpb2-cover", "data-plan-book": plan.callId, "aria-label": t("plan.aria") },
					h(
						"div",
						{ className: "wpb2-coverhead" },
						h("span", { className: "wpb2-kicker" }, `${t("plan.kicker")} · ${steps.length} ${t("plan.stepsUnit")}`),
						h("h4", { className: "wpb2-covertitle" }, plan.title),
						plan.oneLine ? h("p", { className: "wpb2-oneline" }, planCleanOne(plan.oneLine)) : null,
						mine.length > 1 ? h("span", { className: "wpb2-note" }, `${mine.length} ${t("plan.multi")}`) : null
					),
					h(
						"ol",
						{ className: "wpb2-toc" },
						steps.map((step) =>
							h(
								"li",
								{ className: "wpb2-tocitem", key: String(step.n), style: { "--wpb-hue": String(planHue(step.glyph)) } },
								h("span", { className: "wpb2-tocdot" }),
								h("span", { className: "wpb2-tocno" }, String(step.n)),
								h("span", { className: "wpb2-toctitle" }, step.title),
								h("span", { className: "wpb2-tocmini" }, planCleanDo(step.do, t).slice(0, 22))
							)
						)
					),
					h("div", { className: "wpb2-band" }, steps.map((step) => h("span", { key: step.n, className: "wpb2-bandcell", style: { "--wpb-hue": String(planHue(step.glyph)) } }))),
					h(
						"div",
						{ className: "wpb2-coverfoot" },
						h("button", { type: "button", className: "wpb2-open", onClick: openPane }, t("plan.open")),
						h("button", { type: "button", className: "wpb2-inline", onClick: () => setInline((value) => !value) }, inline ? t("plan.collapse") : t("plan.expand")),
						h("span", { className: "wpb2-hint" }, failNote ? t("plan.paneUnavailable") : t("plan.openHint"))
					)
				),
				inline ? h(PlanBookBody, { plan, t, compact: true }) : null
			);
		}


		const name = PLUGIN_NAME;
		/** 必需的客户端服务：插槽注册表 + 语言字典（右侧面板服务走迟到注入）。 */
		const inject = ["slots", "locale"];

		/**
		 * 客户端插件体：注入样式与字典，注册计划视图那几处插槽。
		 * @param ctx - 客户端根上下文。
		 */
		function apply(ctx) {
			const translate = ctx.locale.bind(LOCALE_NS);

			/**
			 * 查文案：字典查不到时回落到内置中文，避免渲染裸 key。
			 * @param key - 字典 key。
			 * @returns 当前语言下的文案。
			 */
			function t(key) {
				try {
					const value = translate(key);
					if (typeof value === "string" && value.length > 0 && value !== key) return value;
				} catch (error) {
					console.error(`[${PLUGIN_NAME}] 文案查询失败：${key}`, error);
				}
				return DICT_ZH[key] ?? key;
			}

			/**
			 * 把计划作为资源在右侧大框打开（官方机制：sidebarRight.openResource）。
			 * 迟到取服务（apply 时拿不到），失败返回 false，卡片会就地展开。
			 * @param address - 我们的资源地址 dsh-resource://plan-book/<sessionId>/<callId>。
			 * @returns 是否成功交给右侧面板。
			 */
			function openPlanPane(address) {
				try {
					const sidebarRight = ctx.get("sidebarRight");
					if (sidebarRight === undefined || typeof sidebarRight.openResource !== "function") return false;
					sidebarRight.openResource(address);
					return true;
				} catch (error) {
					console.warn(`[${PLUGIN_NAME}] 右侧面板打不开，改为就地展开：`, error);
					return false;
				}
			}

			const styleEl = document.createElement("style");
			styleEl.setAttribute("data-dsh-plugin", PLUGIN_NAME);
			styleEl.textContent = PAGE_CSS;
			document.head.appendChild(styleEl);
			ctx.effect(() => () => {
				styleEl.remove();
			}, `${PLUGIN_NAME}: 页面样式`);
			const disposers = [];
			try {
				disposers.push(ctx.locale.register(LOCALE_NS, "zh", DICT_ZH));
				disposers.push(ctx.locale.register(LOCALE_NS, "en", DICT_EN));
			} catch (error) {
				console.error(`[${PLUGIN_NAME}] locale 字典注册失败，改用内置中文兜底：`, error);
			}
			ctx.effect(() => () => {
				for (const dispose of disposers) dispose();
				disposers.length = 0;
			}, `${PLUGIN_NAME}: locale 字典与订阅`);
			// 计划：对话尾放一张摘要卡（并排挂在官方计划卡下面，不动官方那格）
			ctx.slots.inject(TURN_TAIL_SLOT, function* () {
				yield ctx.slots.register({ name: TURN_TAIL_SLOT, id: PLAN_BOOK_ID, order: 10, label: () => t("plan.kicker") }, (props) =>
					h(PlanBookStrip, { ...props, t, openPlanPane: openPlanPane })
				);
			});

			// 会话标题栏常驻入口（有计划才出现）—— 解决"计划藏在某一轮对话里找不到"
			ctx.slots.inject("conversation.session.header.actions", function* () {
				yield ctx.slots.register({ name: "conversation.session.header.actions", id: PLAN_BOOK_ID, order: 30 }, (props) =>
					h(PlanBookHeaderAction, { ...props, t, openPlanPane: openPlanPane })
				);
			});

			// 右侧大框：按资源地址注册我们自己的标签类型（官方机制），内容由 sidebar.right.pane.tab 派发
			ctx.inject(["sidebarRightTabs"], function (scoped) {
				try {
					scoped.sidebarRightTabs.register({
						id: PLAN_PANE_ID,
						kind: PLAN_PANE_ID,
						priority: "builtin",
						patterns: [`${PLAN_PANE_SCHEME}**`],
						canOpen: (address) => typeof address === "string" && address.startsWith(PLAN_PANE_SCHEME),
						title: () => t("plan.kicker")
					});
				} catch (error) {
					console.warn(`[${PLUGIN_NAME}] 右侧标签类型注册失败（会退化为就地展开）：`, error);
				}
			});
			ctx.slots.inject("sidebar.right.pane.tab", function* () {
				yield ctx.slots.register({ name: "sidebar.right.pane.tab", key: PLAN_PANE_ID }, (props) => h(PlanBookPane, { ...props, t }));
			});
			ctx.slots.inject("sidebar.right.pane.tab.title", function* () {
				yield ctx.slots.register({ name: "sidebar.right.pane.tab.title", key: PLAN_PANE_ID }, () => t("plan.kicker"));
			});
		}

		exports.name = name;
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
