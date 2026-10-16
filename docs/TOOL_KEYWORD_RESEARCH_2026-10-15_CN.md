# 工具类新词研究：近一个月全量扫描

> 2026-10-15 产品边界与分析方法修订：本文件保留当时的原始词、聚类和历史评分，仅用于追溯，**表中的 ArtCraft 与 TNPSC 排名均已废止**。原始关键词、分析聚类和产品设计不能混为一层。BriefVu 已确认是自营工具订阅平台，不做第三方工具选择、收录或使用辅助；当前 P0 是不占用 VectorCraft 品牌的 BriefVu Vector Toolkit。当前开发决策以 `BRIEFVU_FIRST_RELEASE_PLAN_2026-10-15_CN.md` 和 `BRIEFVU_KEYWORD_PRIORITY_AND_ARCHITECTURE_2026-10-15_CN.md` 为准。

日期：2026-10-15
数据来源：Web.Cafe 新词发现服务，方向筛选为「工具」。站内推荐、解释和热度只作为候选线索，最终结论来自独立公开调研。

## 覆盖范围

- 新词：34 条，完整读取 2 页。
- 二次爆火：35 条，完整读取 2 页。
- 合计：69 条。
- 时间跨度：最早可见爆发日期为 2026-09-09，最新出现日期为 2026-10-14，覆盖最近约一个月。
- 不纳入「长期大词」，因为它们不是近一个月新出现或重新爆发的机会。

## 重要发现

网站的「工具」分类不等于工具搜索意图。69 条中混入了新闻、下载导航、游戏攻略、商品、壁纸、节日内容和品牌词。必须先判断用户是否真的需要交互功能，再看热度。

### 主题聚类

| 主题 | 原始词数量 | 结论 |
|---|---:|---|
| ArtCraft / PhotoCraft / VectorCraft / Crafting Apps | **34** | 最大集群；品牌导航为主，但存在 app 选择和工作流兼容判断需求 |
| AION 2 timers / countdown / name generator | 6 | 工具意图明确，但定时器结果已快速拥挤 |
| Rumpelstiltskin meme / GIF / tiptoe | 6 | 热度高但大量同名生成器和版权风险 |
| Reverse Engineer Anything / decompile | 4 | 主要找 GitHub 项目；安全和双重用途风险高 |
| TNPSC Group 4 photo/signature | 3 | 明确工具需求，但已有多家专门压缩器 |
| 其他独立主题 | 16 | 多为品牌、新闻、商品、内容或低量单词 |

## 评分方法

总分 100：聚合趋势与需求 25、真实工具意图 20、公开竞争缺口 20、MVP 速度 15、持续性/扩展性 10、风险可控性 10。

| 排名 | 候选工具 | 得分 | 结论 |
|---:|---|---:|---|
| 1 | **ArtCraft App Finder & Workflow Compatibility Checker** | **84** | 34 个相关词形成强集群；可用交互工具避开纯下载页竞争 |
| 2 | AION 2 Rift & Event Timer | 71 | 需求明确、可快速做，但已至少出现多家直接 timer |
| 3 | TNPSC Photo & Signature Validator | 68 | 高意图、实现简单，但搜索结果已有多款成熟工具 |
| 4 | Weekly Fantasy Trade Value Calculator | 64 | 每周重复需求，需长期维护数据且大站竞争强 |
| 5 | Pastor Appreciation Card Generator | 59 | 可快速开发，但当前搜索量很低且季节性强 |
| 6 | AION 2 Name Generator | 57 | 竞争相对低，但站内热度只有 GPTs×0.017 |
| 7 | Rumpelstiltskin Meme Prompt Builder | 52 | 流量窗口短、同名站密集、音乐和人物素材风险高 |
| 8 | Reverse Engineer Anything Project Assistant | 50 | 项目导航意图高于工具意图，且可能被用于未授权逆向 |
| 9 | Halloween Wallpaper Generator | 50 | 高热度但季节性、素材版权和大站竞争明显 |

## 独立公开调研

### 1. ArtCraft 集群

站内最强词包括：

- `adobe artcraft`：GPTs×4.69，近 7 天 +4,950%
- `storytold`：GPTs×0.505
- `photocraft download`：GPTs×0.440
- `artcraft office`：GPTs×0.422
- `download photocraft`：GPTs×0.382
- `getartcraft apps`：GPTs×0.304
- 以及 `wordcraft app`、`vectorcraft download`、`artcraft excel`、`filmcraft app`、`lightcraft download` 等大量长尾。

[ArtCraft 官方应用页](https://getartcraft.com/apps)当前列出 13 个应用，并明确标注 PhotoCraft、PdfCraft、FigCraft 为 early alpha，其余多为 in development。官方信息足够建立第一版结构化应用目录。

[TechRadar 实测](https://www.techradar.com/pro/one-dev-is-recreating-7-adobe-apps-in-rust-for-free-so-i-tested-it-out)和 [Creative Bloq 实测](https://www.creativebloq.com/news/i-tried-those-free-ai-coded-adobe-creative-cloud-clones-and-they-have-some-big-problems)显示用户真正的问题不是“有没有这些应用”，而是“哪个应用对应我的工作、现在是否够用”。

官方 GitHub 可提供可验证的格式与功能信息。例如 [VectorCraft](https://github.com/storytold/vectorcraft)公开列出 SVG、PDF、PDF-compatible `.ai`、PNG、JPEG、WebP 等导入导出能力；[PhotoCraft 安装文档](https://github.com/storytold/photocraft/blob/main/book/src/getting-started/installation.md)明确标注项目仍处 early alpha。

搜索结果已有 CraftSuite、GeneratorNest、downloadartcraft 等下载和说明站，但聚焦搜索没有发现成熟的交互式 app finder / workflow checker。机会不是复制下载站，而是将官方资料转换成决策工具。

### 2. AION 2 定时器

关键词包括 `aion 2 spacetime rift timer`、`aion 2 rift timer`、`aion 2 countdown` 等。意图非常明确，但公开结果已经出现 [AION2 Hub Timer](https://aion2hub.com/tools/event-timer)、[aion2rifttimer.net](https://aion2rifttimer.net/)、[aion2timer.org](https://aion2timer.org/spacetime-rift)及其他专门工具。

结论：可以作为第二批快速工具，但已错过明显的竞争空白期。

### 3. TNPSC 图片与签名工具

官方 TNPSC 文档对照片和签名尺寸、像素及文件大小有明确要求，例如照片 3.5×4.5cm、签名 230×75px、签名 10–20KB；但要求可能随通知变化，应始终链接当前官方通知。[官方文件](https://tnpsc.gov.in/Document/english/1_2024-Eng.pdf)

公开结果已有 [tnpsc.co](https://tnpsc.co/tnpsc-photo-compressor/)、[tnpscphotocompressor.in](https://tnpscphotocompressor.in/)和 [Grade One Utility Pro](https://gradeoneutilitypro.in/tools/state-psc/tnpsc-group-4-photo-resizer)等客户端压缩工具。

结论：工具意图强但已进入红海，除非扩展为多考试 preset 平台，否则不作为首个工具。

### 4. 梦幻足球交易价值表

`week 5 trade value chart`具有每周复现价值，但 Yahoo、CBS 等大站和 [Trade Lab](https://fftradelab.com/trade-value-chart/)已经持续更新。开发不难，真正成本在每周数据来源、排名方法和可信度维护。

### 5. 需要排除的主题

- `god of war 3 pc port`：非官方移植与版权风险，不做下载、镜像或安装工具。
- `reverse engineer anything github` 等：主要是项目导航，且可能涉及未授权逆向，不作为平台首发。
- `fb reels video downloader app`：需求量低，并涉及平台条款和版权下载风险。
- `spotifast github`、`planner 5d`、`photon studio`：已有品牌导航词，不仿制。
- 商品促销、游戏活动、硬件新闻和 Creator SMP 等误分类词：适合内容页，不适合工具。

## 首个工具：ArtCraft App Finder & Workflow Compatibility Checker

### 用户问题

“我现在使用 Photoshop / Illustrator / Premiere / Lightroom / Acrobat / Office，ArtCraft 里应该选哪个？我的操作系统和文件格式是否支持？它目前能否承担我的工作？”

### 页面名称与 URL

- 产品名：**ArtCraft App Finder**
- URL：`/artcraft-app-finder`
- 副标题：Find the right Crafting App for your Adobe or Office workflow.
- 必须明确：Independent tool; not affiliated with ArtCraft, Adobe or Microsoft.

### 输入

- 当前使用的软件
- 核心任务：照片、矢量、视频、RAW、PDF、动效、排版、UI、文档、音频、演示、CAD、表格
- 必须打开/导出的文件格式
- 操作系统：Windows / macOS / Linux / Browser
- 使用场景：学习、个人、专业交付
- 是否要求离线、本地文件、插件、精确格式往返

### 输出

- 推荐的 Crafting App
- 当前成熟度：early alpha / in development
- 已由官方文档确认的格式和平台
- 明确的缺口与不确定项
- “适合试用 / 仅适合测试 / 暂不建议替代专业流程”结论
- 官方项目页和 GitHub 链接，不托管安装包
- 数据来源与最近核验日期

### MVP 边界

- 第一版使用可审核的静态规则和官方数据，不需要 AI API。
- 不上传或读取用户文件，只询问格式和需求。
- 不宣称完整功能等价，不根据 README 的计划功能冒充已发布功能。
- 不使用 ArtCraft 商标或图标暗示官方关系。
- 每次官方版本变化后更新能力矩阵。

### SEO 覆盖

主页面自然覆盖 `adobe artcraft`、`artcraft apps`、`getartcraft apps`、`artcraft office` 和“which ArtCraft app”意图。PhotoCraft、VectorCraft、FilmCraft 等只有在内容足够独立且能提供真实差异时才拆详情页，不创建重复下载薄页。

## 接下来

1. 从官方应用页和各 GitHub README 建立 13 个应用的首版能力矩阵。
2. 定义输入、规则、置信度与引用 schema。
3. 做单页可运行 MVP，并为每条推荐显示来源和更新时间。
4. 使用 20 组 Adobe/Office 工作流做人工验证。
5. 上线后观察页面曝光、完成率、官方链接点击率和搜索词，再决定第二个工具。

## 原始词附录

### 新词 34 条

`wordcraft app`、`artcraft excel`、`sims 4 maker pack sale`、`god of war 3 pc port`、`getcraft apps`、`vectorcraft download`、`get art craft apps`、`getartcraft review`、`vectorcraft app`、`download photocraft`、`getartcraft apps`、`craft adobe alternative`、`seven apps one craft`、`github vectorcraft`、`adobe artcraft`、`photocraft rust`、`photocraft windows`、`storytold photocraft`、`github reverse engineer anything`、`reverse engineer anything github`、`iqoo 16 india price concerns`、`hoe laat begint creator smp 4`、`storytold`、`rumpelstiltskin tiptoe`、`aion 2 spacetime rift timer`、`ford f-150 stuck wheel mechanic`、`aion 2 name generator`、`aion 2 essence extraction guide`、`spotifast github`、`countdown japan 26/27`、`pastor appreciation cards free printable`、`fb reels video downloader app`、`creator smp 4`、`selfridges advent calendar 2026`。

### 二次爆火 35 条

`martes 13 meme`、`artcraft office`、`deckcraft github`、`reverse engineer everything github`、`decompile anything github`、`photocraft download`、`art craft apps`、`download filmcraft`、`lightcraft download`、`getartcraft/apps`、`download lightcraft`、`filmcraft app`、`crafting apps`、`photocraft reddit`、`artcraft photocraft github`、`group 4 photo and signature size`、`getartcraft github`、`photon studio`、`week 5 trade value chart`、`tnpsc group 4 photo compressor`、`group 4 signature compressor`、`tip toeing in my jordans`、`rumpelstiltskin meme`、`aion 2 countdown`、`rumpelstiltskin 1978`、`rumpelstiltskin 1960`、`aion 2 rift timer`、`halloween wallpaper`、`aion 2 launch countdown`、`adjective worksheet for class 3`、`artcraft microsoft office clones`、`is artcraft free`、`photocraft app`、`planner 5d`、`rumpelstiltskin gif`。
