# dsh-plan-book

个人 DeepSeek Harness 工作台的**「计划视图」独立包**。装上并重启后：

- **主机半边**注册 session 投影 `plan-book`：把 `exit_plan_mode` 提交的 markdown 计划折叠成结构化数据（标题 / 一句话 / 步骤 / 提案四节 / 待定项），`apply` 是纯函数、不改旧引用；
- **对话尾**并排加一格摘要卡（不动官方那张计划卡，也不动 Approve / Keep planning 流程）；
- **会话标题栏**加一个常驻入口（有计划才出现）—— 解决"计划藏在某一轮对话里找不到"；
- 点「在右侧打开」用官方机制 `sidebarRight.openResource` 把计划铺在**右侧大框**里：正文阅读版 / 流程图 / 汇报稿（16:9 舞台）三个页签；右侧不可用时**自动就地展开**并说明原因。

**只注册自己这几处插槽**（这个包里**只有计划视图**）：

| 插槽 | key / id | 渲染什么 |
| --- | --- | --- |
| `conversation.chat.turnTail` | `workbench-plan-book` | 对话尾摘要卡 |
| `conversation.session.header.actions` | `workbench-plan-book` | 会话标题栏常驻入口 |
| `sidebar.right.pane.tab` | `dsh-workbench-home/plan-book` | 右侧大框里的计划正文 |
| `sidebar.right.pane.tab.title` | `dsh-workbench-home/plan-book` | 该标签页的标题 |

另外向官方 `sidebarRightTabs` 注册一个标签类型（id `dsh-workbench-home/plan-book`，认领 `dsh-resource://plan-book/**` 地址）——
**这个 id 与合集包里的同名标签类型是同一个 key**，所以合集包与本包也不要同时装。

## 装

```bash
dsh plugin --profile <profile> add /abs/path/to/dsh-plan-book
dsh plugin --profile <profile> add github:<owner>/dsh-plan-book
```

**装完重启一次**才生效（主机侧的投影注册与客户端 bundle 都是启动时读的）。
**出厂为空**：不含任何个人数据（计划数据只来自你自己会话里的 `exit_plan_mode`）。

## config

```yaml
- id: plan-book
  name: dsh-plan-book
  config:
    dshHome: ""              # 留空 = 按官方口径解析
    planBook: { enabled: true }   # enabled:false = 不注册投影（客户端会诚实显示"投影不可用"）
```

**没有页面开关**：这个包只有计划视图这一页。
投影靠官方的 `sessionProjections` 服务注册（`apply` 里 `ctx.inject(["sessionProjections"], …)`），
客户端用 `useProjection("plan-book")` 读同一份状态。**改完 config 要重启才生效。**

## 前置

| 需要什么 | 说明 |
| --- | --- |
| **pnpm** | `dsh plugin add` 内部转发给 pnpm；CLI 用 PATH 上的 `pnpm`，没有会直接报 `dsh: pnpm was not found`。 |
| Web profile | 客户端半边要 `webServer`（`dsh-web-app`）。没有 web 的 profile 也装得下，只是没有页面。 |
| `$DSH_HOME` | 官方口径解析（config 的 `dshHome` > `$DSH_HOME` > `<安装根>/data` > `~/.dsh`），启动日志会打印最终选了哪个。 |
| Node | 只用 Node 内置模块 + 运行中的 harness 自带的官方包（`zod` 等），本包 `dependencies` 为空。 |

## 与其它三个单页包的关系：**可以同时装**

本套四个单页包（`dsh-workbench-home` / `dsh-workbench-memory` / `dsh-plan-book` / `dsh-skill-library`）
**各自独立**：一个包 = 自己的客户端 bundle（只含自己那一页的组件/CSS/字典）+ 自己那几处插槽 + 自己的插件名与
locale 命名空间。四个一起装的结果是：侧边栏多出四个入口（工作台 / 试作 / 记忆库 / 能力库），计划视图挂在对话尾与右侧大框，
**没有任何一格被覆盖、也没有重复入口**。

为什么能这样：客户端 bundle 是**自包含**的（要用到的图标/工具函数/令牌按需复制一份进来，不共享运行时）；
插槽 key 各用各的（见上面那张表），四个包两两之间没有同名 key。
上一版是"同一份整页代码复制四份、靠主机下发的 `pages` 开关只开一页"——几个包一起装会同时注册同一批 key、
并且互相覆盖开关，那个做法已经删掉（`pages.*` 这个配置项**不再存在**）。

**唯一不要混装的是合集包**：`dsh-workbench-personal`（仓库 `dsh-workbench-personal` / 本工作区 `plugin-repo/`）
是把这几页装在**一个包**里的形态，它注册的是同一批 key —— 合集包与任何单页包**同时装会撞 key**
（同一个 `sidebar.panellist` id / `main` key 被两个插件各注册一次 → 侧边栏出现重复入口）。
这是正常的生态规则：**要么装合集，要么装单页包，不要混**。

## 许可

MIT（见 `LICENSE`）。
