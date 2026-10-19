# dsh-plan-book

个人 DeepSeek Harness 工作台的**「计划视图」独立包**。装上并重启后：

- 主机侧注册 session 投影 **`plan-book`**：把 `exit_plan_mode` 提交的 markdown 计划折叠成结构化数据
  （标题 / 一句话目标 / 步骤（做什么·为什么·会碰什么·万一·验收）/ 提案四节 / 要你定的）；
- 对话尾多一张**计划摘要卡**（标题 + 一句话 + 步骤目录 + 色带 + 〔在右侧打开〕〔就地展开〕）；
- 会话标题栏多一个**常驻入口**（有计划时显示「计划 · N 步」）—— 翻历史也能找到它在哪；
- 点「在右侧打开」用官方机制 `sidebarRight.openResource` 把计划铺在**右侧大框**里，标签类型按地址
  `dsh-resource://plan-book/<session>/<callId>` 认领；右侧不可用时**自动就地展开**并说明原因（不让你白点）；
- 正文有三种看法：**正文阅读版（默认）/ 流程图 / 汇报稿**（HTML 版 PPT，16:9 舞台、页码、键盘 ←/→/Esc）。

**刻意不碰**：不加工具、不加 `/` 命令、不改批准流程 —— 官方 Approve / Keep planning 原样保留，本包只是**并排**加自己的那一格。

**页面只开这一页**：行 config 的 `pages` 里 `planBook: true`，其余四项（`home` / `memory` / `audition` / `skillLibrary`）显式 `false`。

## 装

```bash
dsh plugin --profile <profile> add /abs/path/to/dsh-plan-book
dsh plugin --profile <profile> add github:<owner>/dsh-plan-book
```

装完**必须重启一次**：主机侧投影是启动时注册的，客户端 bundle 也是启动时读的。

前置：

| 需要什么 | 说明 |
| --- | --- |
| **pnpm** | `dsh plugin add` 内部转发给 pnpm。 |
| Web profile | 客户端半边要 `webServer`（`dsh-web-app`）。没有 web 的 profile 也装得下，只是没有页面。 |
| `sessionProjections` | 官方服务（`dsh-base` 里就有）。缺席时本包只打一条 warning，客户端会诚实显示「投影不可用」，不白屏。 |
| Node | 本包 `dependencies` 为空；`zod` / `@deepseek-ai/schemastery` 运行时从当前安装解析。 |

## config

```yaml
- id: plan-book
  name: dsh-plan-book
  config:
    dshHome: ""
    planBook: { enabled: true }   # enabled:false = 只留页面，不注册投影（页面会显示"投影不可用"）
    pages:
      home: false
      memory: false
      audition: false
      planBook: true
      skillLibrary: false
```

页面开关走主机侧 `webserver/index-inject` 注入的全局量 `__DSH_WORKBENCH__`（客户端拿不到 row config）。
**改完 config 要重启才生效。**

投影状态版本 `stateVersion = 5`：升级本包后旧缓存版本不匹配会**自动重算**，不会炸。

## 别同时装的东西

### ① 本套其它三个拆分包（**不要同时装**）

四个包**共用同一份客户端代码**，靠各自下发的 `pages` 开关决定注册哪几页。两个一起装会撞在**同一个全局量**上 ——
实测表现（隔离实例，两个包同装）：`index.html` 里 `__DSH_WORKBENCH__` 被赋值**两次**，浏览器按顺序执行 →
**后一条生效**，先装那个包的 `pages` 全部失效（记忆库包 + 工作台包同装时，生效的是工作台包的 config，
记忆库那一页一格都不注册）。同时两个客户端 bundle 都会下发并读同一份生效 config，
同一个插槽 id/key 会被两个插件各注册一次。**要哪个就装哪个。**

### ② 原有本地插件 `dsh-plan-book`

`data/profiles/web/plugins/dsh-plan-book` 注册的投影 key 与本包**完全相同**（都是 `plan-book`），
两个都装会撞同一个投影 key —— 装本包就把补丁层里那两行 `insert: plan-book` 删掉。

### ③ 与官方计划模式的关系

不冲突：官方 `dsh-plan-mode` 的投影 key 是 `plan`，本包是 `plan-book`，互不覆盖。

## 许可

MIT（见 `LICENSE`）。
