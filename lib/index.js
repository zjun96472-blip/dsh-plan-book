/**
 * dsh-plan-book —— 主机入口。
 *
 * 本包只做一件事（"计划视图"这一页需要的）：**计划投影** —— 注册 session 投影 `plan-book`，
 * 把 `exit_plan_mode` 提交的 markdown 计划折叠成结构化数据（标题 / 一句话 / 步骤 / 提案四节 / 待定项），
 * 供客户端用 `useProjection("plan-book")` 直接读。`apply` 是纯函数、不改旧引用
 * （投影注册表按 `Object.is` 判断变化）。
 *
 * **不再有页面开关**：本包只有「计划视图」这一页，客户端那半边只注册这一页的插槽
 * （对话尾摘要卡 / 会话标题栏入口 / 右侧大框标签页，见 lib/client.js 的 apply）；
 * 它也不需要主机注入任何路径。所以本包**不碰** `webserver/index-inject`。
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
 * @returns `{ dshHome, planBook: {enabled} }`。
 */
export function normalizeConfig(config) {
	const raw = config !== null && typeof config === "object" ? config : {};
	const planBook = raw.planBook !== null && typeof raw.planBook === "object" ? raw.planBook : {};
	return {
		dshHome: typeof raw.dshHome === "string" ? raw.dshHome : "",
		planBook: { enabled: typeof planBook.enabled === "boolean" ? planBook.enabled : true }
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
	// 路径解析只为日志（本包的客户端半边不需要任何注入）
	resolveWorkbenchPaths(settings.dshHome, ctx.logger);
	debug(`[${name}] apply：config=${JSON.stringify(settings)}`);

	// 计划投影（要真 zod：投影注册表内部会调 stateSchema.parse）
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

	ctx.logger?.info?.(`[${name}] 已就绪：计划投影 ${settings.planBook.enabled ? "开" : "关"}`);
}
