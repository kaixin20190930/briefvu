# 三站新词机会管道：第一轮研究与执行清单

日期：2026-10-15
研究窗口：最近约一个月
候选来源：Web.Cafe 新词发现服务
研究原则：订阅站数据只用于发现候选；是否收录、开发或发布，必须经过独立公开来源核验。

## 1. 三个站点的职责

| 站点 | 接收什么 | 不接收什么 | 最小成果 |
|---|---|---|---|
| `briefvu.com` | 有明确输入、处理和输出的独立小工具；主题可以互不相关 | 只有新闻、定义、下载导航或品牌搜索意图的词 | 一个无需注册即可使用的工具页 |
| `aibesttool.com` | 已存在、可公开验证且搜索热度正在增长的 AI 产品、模型或服务 | 为抢词虚构的产品、无法确认官网的同名产品、高风险换脸或盗版工具 | 产品收录页；必要时增加原创评测、定价或比较页 |
| `rulevio.com` | 游戏攻略、兑换码、活动、发售、配置、计时与实用说明 | 外挂脚本、盗版下载、被 DMCA 下架的端口、虚假模拟器和未经验证的兑换码 | 有来源和更新时间的游戏内容页 |

同一个趋势只能按站点的产品边界承接。ArtCraft 属于第三方 AI 产品，适合 AI Best Tool 的产品收录或原创说明；BriefVu 不再用 App Finder 承接，因为它不是第三方工具导航或使用辅助平台。

## 2. 第一轮覆盖

- 工具方向：新词 34 条、二次爆火 35 条，共 69 条；已完整读取两类结果。
- AI 方向（仅「值得做」）：新词 3 条、二次爆火 12 条，共 15 条。
- 游戏方向（仅「值得做」）：新词 28 条、二次爆火 25 条；本轮优先研究最近约一个月及仍在上升的候选。
- 「长期大词」未纳入本轮，因为目标是抓新出现或重新爆发的机会。

热度倍数和涨幅是发现信号，不是流量承诺。最终优先级同时考虑搜索意图、公开来源、竞争、页面可维护性和风险。

## 3. BriefVu：小工具开发队列

### 已移除：ArtCraft App Finder & Workflow Compatibility Checker

- 原机会：工具分类中 ArtCraft / PhotoCraft / VectorCraft / Crafting Apps 相关词达 34 条，是本轮最强集群。
- 用户任务：回答「我应该使用哪个 Crafting App，它是否支持我的系统、文件格式和工作流」。
- 产品形态：规则型选择器，不调用 AI，不托管安装包。
- 最新判定：不符合 BriefVu“所有工具由本站提供、用户订阅使用全部工具”的定位；它帮助用户选择第三方软件，转入 AI Best Tool 内容队列。
- 数据来源：[ArtCraft Apps](https://getartcraft.com/apps)和各官方 GitHub/文档。
- 风险控制：显著注明非官方；区分 early alpha、in development 与已确认能力；不宣称完整替代 Adobe 或 Microsoft。
- 详细规格见 `docs/TOOL_KEYWORD_RESEARCH_2026-10-15_CN.md`。

### 后续候选

| 优先级 | 工具 | 结论 |
|---|---|---|
| P1 | AION 2 Rift & Event Timer | 工具意图强，但直接 timer 已经拥挤；只有能提供更可靠时区、服务器和事件覆盖时才做 |
| P1 | TNPSC Photo & Signature Validator | 规则清晰，但已有多个成熟压缩器；适合扩展成多考试 preset，而不是单一薄页 |
| P2 | Weekly Fantasy Trade Value Calculator | 有重复需求，但数据授权、每周更新与可信度成本较高 |

## 4. AI Best Tool：产品收录队列

### P0：优先建立收录页

| 排名 | 候选 | 趋势信号 | 公开核验 | 建议页面 |
|---:|---|---|---|---|
| 1 | **Everygen AI** | GPTs×0.055，近 7 天 +492% | [官方站](https://everygen.ai/)确认其原名 Viewmax，提供多模型视频、Shorts 与广告工作流 | 产品收录页 + `Everygen pricing / models / alternatives` 原创说明 |
| 2 | **Muse Wonder** | `muse wonder pricing` GPTs×0.131，从 0 起量 | [Meta 官方模型页](https://dev.meta.ai/models/muse-wonder)和[定价页](https://dev.meta.ai/docs/pricing-rate-limits)可验证 API、上下文与价格 | 模型收录页 + 准确的 pricing 表；标注 API 与 Muse Code 的访问差异 |
| 3 | **ArtCraft** | GPTs×0.279，从 0 起量 | [官方应用页](https://getartcraft.com/apps)可验证产品矩阵和成熟度 | 套件收录页；重点写产品状态、平台和官方链接，不做假下载页 |
| 4 | **Melty** | GPTs×0.086，从 0 起量；相关词簇持续增长 | [Melty 官网](https://melty.gg/)确认 Windows 免费产品、游戏 mashup、AI 辅助创建与用户需拥有原游戏 | 产品收录页 + 使用边界和兼容性说明 |

### P1：开发者向收录

| 候选 | 趋势信号 | 处理 |
|---|---|---|
| Cloudflare Clef | GPTs×0.039，近 7 天 +110% | 作为开发者模型收录；引用 [Cloudflare 发布说明](https://blog.cloudflare.com/clef-decision-models/)和[模型文档](https://developers.cloudflare.com/workers-ai/models/clef/) |

### 暂不收录

- `anyps5 github`：热度高，但不是可靠的 AI 工具意图，并涉及未授权游戏可执行文件转换与版权风险。
- `bulin 47 ai`：面部替换、同名入口多且官方归属不清；在确认产品、许可和安全边界前不收录。
- `rumpelstiltskin ai`、`ai rumpelstiltskin`：属于病毒 meme，不是稳定 AI 产品。
- `merge games ai` 等泛趋势词：可以归入 Melty 的说明或比较内容，不创建多个重复产品页。
- `firefly wedding`、`avatar korra`、`chained together ai drama`：虽然被源站归入 AI，但本质是内容/IP 搜索，不进入 AI 工具目录。

公开搜索暂未发现 aibesttool.com 已被索引的上述产品页；发布前仍需在项目数据库和管理后台做一次精确去重，不能只依赖搜索引擎 `site:` 结果。

## 5. Rulevio：游戏内容更新队列

### P0：先做或先更新

| 排名 | 主题 | 趋势信号 | 页面类型与要求 |
|---:|---|---|---|
| 1 | **Anime Zero codes** | GPTs×2.80，近 7 天 +3,822% | 动态兑换码页；[Roblox 官方游戏页](https://www.roblox.com/games/114574503491412/Anime-Zero)显示游戏活跃且仍在更新。代码必须在游戏、开发者公告或官方社群中逐条验证，不得从聚合站照抄 |
| 2 | **Pokémon Winds and Waves starter trio** | GPTs×0.168，从 0 起量 | 常青资料页；用[宝可梦官方页面](https://windswaves.pokemon.com/en-ca/)核验首发伙伴、平台与发行窗口，避免复述未经证实的泄露 |
| 3 | **Morioh High codes** | GPTs×0.423，从 0 起量 | 建立前先找到可确认的 Roblox 游戏页和开发者渠道；没有官方入口或可验证代码时保持 `blocked`，不发布空壳页 |
| 4 | **Gears of War: E-Day / gears e day** | GPTs×32.9，近 7 天 +595% | 不做泛新闻薄页；更新为发售后实用入口，如平台、PC 配置、Game Pass、入门和活动。发布日期可由[Xbox 官方](https://www.xbox.com/en-US/games/gears-of-war-eday)核验 |

### P1：持续内容

| 主题 | 信号 | 页面方向 |
|---|---|---|
| Little Cup Pokémon GO | GPTs×0.103，+135% | 规则、CP 500 限制、参赛资格与队伍思路；活动结束后保留历史更新时间 |
| AION 2 server transfer | GPTs×0.448，+245% | 条件、限制、服务器资格和常见失败原因；只引用 NCSoft/官方公告 |
| Fishing Master codes | GPTs×0.585，+1,504% | 动态兑换码页，建立 `active / expired / last checked` 字段 |
| Pokémon Survivor Burst | GPTs×1.47，+577% | 游戏介绍、下载安装来源、玩法与更新日志；只链接作者正式发布页 |
| Black Clover × Fortnite / FNAF × Fortnite | GPTs×1.30 / ×0.476 | 限时联动内容，先确认官方公告；注明结束日期并避免把传闻写成事实 |

### 明确排除

- `script break and steal an egg`、`chili hub`：外挂或自动化作弊脚本。
- `black ops 2 browser`：来源说明其已因 DMCA 下架，不提供镜像、下载或替代访问方法。
- `gta 5 web game`、`halo ce browser`、`anyps5`、`ps5 emulator`：不承诺未经授权端口或不存在的兼容能力；最多做事实核查型内容。
- `hilton college private game reserve`：`game` 指野生动物，不是游戏搜索意图。
- `ncaa games today`：体育赛程意图，与当前游戏内容方向不匹配。

## 6. 状态与执行规则

三个站点共用以下状态，但发布动作不同：

`discovered → researched → qualified → planned → building/drafting → published → measuring → improving/stopped`

额外规则：

1. AI 产品必须存在可验证官网或一手文档，才能从 `researched` 进入 `qualified`。
2. 游戏兑换码必须逐条记录来源、首次验证、最后验证和过期状态；找不到有效代码时可以发布明确的“当前没有已验证代码”说明，但不能编造。
3. BriefVu 工具必须有可执行输入和输出，定义文章或下载导航不能计作工具。
4. 涉及商标时使用描述性标题，注明独立/非官方，不使用容易造成官方关系误解的视觉元素。
5. 一项趋势可以路由到多个站点，但每个页面必须拥有独立用户任务和原创内容。

## 7. 立即执行顺序

1. **BriefVu**：按自营工具订阅平台的新基线重新筛选；不得开发 ArtCraft Finder。先找至少两个能在站内产生最终结果、并有批量/保存/历史或高额度订阅价值的方向。
2. **AI Best Tool**：在项目内查重后，先发布 Everygen 与 Muse Wonder，随后是 ArtCraft、Melty 和 Clef。
3. **Rulevio**：先检查现有内容架构；优先创建/更新 Anime Zero codes 与 Pokémon starter trio，Morioh High 在官方入口确认前不发布。
4. 为三个站点建立独立指标：BriefVu 看工具启动/完成；AI Best Tool 看产品页曝光/官网点击；Rulevio 看搜索曝光、更新时间和回访。

## 8. 项目落点与后续交接

- 当前工作区只有 BriefVu/MVP 项目。
- 用户已确认 Rulevio 就是 `/Users/liukai/Documents/ChatGPT/Rulevio`，并决定停止旧 LiveOps/校验器方向，在同仓库转为游戏内容站，由 Kiro 实施。架构与商业分析见 `docs/RULEVIO_CONTENT_SITE_STRATEGY_2026-10-15_CN.md`，完整交接提示词见 `docs/RULEVIO_KIRO_IMPLEMENTATION_PROMPT_CN.txt`。
- 用户已确认 AI Best Tool 项目目录名为 `ai-best-tool`，本机已找到 `/Users/liukai/web/ai-best-tool`；实际收录前需在项目内查重。本次 Rulevio 交接不修改 AI 目录工程。
