/**
 * dsh-plan-book —— 主机入口。
 *
 * 本包只做两件事（都是"计划视图"这一页需要的）：
 *   ① **计划投影**：注册 session 投影 `plan-book`，把 `exit_plan_mode` 提交的 markdown 计划
 *      折叠成结构化数据（标题 / 一句话 / 步骤 / 提案四节 / 待定项），供客户端用
 *      `useProjection("plan-book")` 直接读。`apply` 是纯函数、不改旧引用（注册表按 `Object.is` 判断变化）。
 *   ② **页面开关的下发**：把 `pages.*` 与真实路径通过 `webserver/index-inject` 注入成
 *      `__DSH_WORKBENCH__`（客户端拿不到 row config，只能用这个官方通道）—— 本包只开「计划视图」。
 *
 * 与官方计划**不冲突、不做替换**：官方那张计划卡与 Approve / Keep planning 流程原样保留，
 * 本包只是**并排**加一格摘要卡 + 一个右侧标签页。
 */
import { createPlanBookProjection, PLAN_BOOK_KEY } from "./projection.mjs";
import { resolveWorkbenchPaths } from "./workbench-paths.mjs";
import { debug } from "./debug.mjs";
import { loadSchemastery, loadZod } from "./official.mjs";

/** 插件名（cordis 的行名 / 日志前缀）。 */
export const name = "plan-book";

/** 注入给页面的全局量名（客户端 bundle 读它）。 */
export const CLIENT_CONFIG_GLOBAL = "__DSH_WORKBENCH__";

/** 页面开关的默认值：**只开本包这一页**（其余显式 false）。 */
const DEFAULT_PAGES = { home: false, memory: false, audition: false, planBook: true, skillLibrary: false };

/**
 * 组 config schema。schemastery 拿不到时返回 undefined —— Loader 就不做校验。
 * @returns schemastery `z.object(...)`，或 undefined。
 */
function buildConfig() {
	try {
		const z = loadSchemastery();
		return z.object({
			dshHome: z.string().default(""),
			planBook: z.object({
				enabled: z.boolean().default(true)
			}),
			pages: z.object({
				home: z.boolean().default(false),
				memory: z.boolean().default(false),
				audition: z.boolean().default(false),
				planBook: z.boolean().default(true),
				skillLibrary: z.boolean().default(false)
			})
		});
	} catch (error) {
		debug(`schemastery 不可用（Config 留空）：${String(error?.message ?? error).slice(0, 160)}`);
		return undefined;
	}
}

/** Loader 在激活本行前按它校验 row config。 */
export const Config = buildConfig();

/**
 * 把 config 归一化成内部形状。
 * @param config - row config（可能 undefined / 缺字段）。
 * @returns `{ dshHome, planBook: {enabled}, pages }`。
 */
export function normalizeConfig(config) {
	const raw = config !== null && typeof config === "object" ? config : {};
	const planBook = raw.planBook !== null && typeof raw.planBook === "object" ? raw.planBook : {};
	const pages = raw.pages !== null && typeof raw.pages === "object" ? raw.pages : {};
	const page = (key) => (typeof pages[key] === "boolean" ? pages[key] : DEFAULT_PAGES[key]);
	return {
		dshHome: typeof raw.dshHome === "string" ? raw.dshHome : "",
		planBook: { enabled: typeof planBook.enabled === "boolean" ? planBook.enabled : true },
		pages: {
			home: page("home"),
			memory: page("memory"),
			audition: page("audition"),
			planBook: page("planBook"),
			skillLibrary: page("skillLibrary")
		}
	};
}

/**
 * 主机插件体。
 * @param ctx - 主机侧上下文。
 * @param config - 本行的 config。
 * @returns 无（资源都挂在 ctx 的生命周期上）。
 */
export function apply(ctx, config) {
	const settings = normalizeConfig(config);
	const paths = resolveWorkbenchPaths(settings.dshHome, ctx.logger);
	debug(`[${name}] apply：config=${JSON.stringify(settings)}`);

	// ① 计划投影（要真 zod：投影注册表内部会调 stateSchema.parse）
	if (settings.planBook.enabled) {
		try {
			const projection = createPlanBookProjection(loadZod());
			ctx.inject(["sessionProjections"], (scoped) => {
				scoped.sessionProjections.register(projection);
				ctx.logger?.info?.(`[${name}] 已注册投影 ${PLAN_BOOK_KEY}（stateVersion ${projection.stateVersion}）`);
			});
		} catch (error) {
			// 注册失败不能拖垮整个 profile：客户端会诚实显示"投影不可用"
			ctx.logger?.warn?.(`[${name}] 计划投影不可用：${String(error?.message ?? error).slice(0, 200)}`);
		}
	} else {
		debug(`[${name}] 计划投影按 config 关闭`);
	}

	// ② 页面开关下发
	ctx.on("webserver/index-inject", (table) => {
		table.push({
			kind: "global",
			name: CLIENT_CONFIG_GLOBAL,
			value: {
				version: 1,
				skillsDir: paths.skillsDir,
				memoryDir: paths.memoryDir,
				pages: settings.pages
			}
		});
	});

	ctx.logger?.info?.(`[${name}] 已就绪：页面开关 ${JSON.stringify(settings.pages)} · 计划投影 ${settings.planBook.enabled ? "开" : "关"}`);
}
