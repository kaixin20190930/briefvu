# 新词工具平台：公开调研第一轮

日期：2026-10-15
候选来源：Web.Cafe「二次爆火 / AI / 值得做」页面。来源页的热度与推荐只作为线索，不直接作为产品结论。

## 本轮结论

**第一个建议开发的工具：AI Game Mashup Generator（AI 游戏融合创意与可行性生成器）。**

它覆盖 `merge games ai`、`ai merge games`、`game merging ai` 三个同义新词。公开检索确认这是 2026 年 9 月下旬开始扩散的新趋势；Melty 已证明用户确实想发现和制作游戏 mashup，但当前搜索结果主要是下载器、说明文章和单个项目，仍有空间做一个无需下载游戏文件、先帮助用户形成方案的轻量网页工具。

## 候选词提取与去重

页面共提取 12 条原始词：

1. `firefly wedding`
2. `avatar korra`
3. `artcraft app`
4. `chained together ai drama`
5. `melty ai game`
6. `rumpelstiltskin ai`
7. `ai rumpelstiltskin`
8. `merge games ai`
9. `ai merge games`
10. `game merging ai`
11. `clef model`
12. `everygen ai video generator`

去重后为 9 个独立搜索意图。`rumpelstiltskin ai` 与 `ai rumpelstiltskin` 是同一意图；三个 game merging 词也是同一意图。

## 评分方法

总分 100：趋势强度 20、工具意图 25、公开竞争缺口 20、MVP 可实现性 15、持续性 10、合规与可控性 10。

| 排名 | 主题 / 可做工具 | 分数 | 判断 |
|---:|---|---:|---|
| 1 | AI Game Mashup Generator | **83** | 三词共振、交互意图成立、可先做轻量方案生成器 |
| 2 | ArtCraft Workflow Compatibility Checker | **77** | 没有明显同类 checker，但主词偏品牌导航且资料变化快 |
| 3 | Clef Payload / Decision Schema Builder | **63** | 工具意图强，但多个 playground 已在抢占结果 |
| 4 | Rumpelstiltskin Meme Prompt Builder | **60** | 热度高但大量 exact-match 生成器已上线，生命周期短 |
| 5 | Melty Mashup Readiness Checker | **57** | 有真实需求，但会被官方品牌和 launcher 导航意图压制 |
| 6 | Everygen Model/Workflow Comparator | **52** | 品牌导航明显，已有多个同名/近名站点 |
| 7 | Firefly Wedding utility | **48** | 极高热度，但本质是观看、角色和剧情内容需求 |
| 8 | Avatar Korra utility | **47** | 热度来自新剧与剧情讨论，不是工具搜索 |
| 9 | Chained Together AI Drama utility | **44** | 需求含义不稳定，更像找视频或剧集内容 |

## 公开调研证据

### AI 游戏融合

- [Know Your Meme 的趋势记录](https://knowyourmeme.com/memes/cultures/ai-video-game-merging)把该趋势追溯到 2026 年 9 月，并记录了多个百万级传播案例。
- [Melty 官方解释页](https://melty.world/ai/ai-game-merging)确认其产品已提供 mashup 浏览、安装与通过 Claude Code/Codex 创建的流程，证明需求并非纯新闻噪音。
- [Dexerto 的独立报道](https://www.dexerto.com/gaming/melty-game-launcher-lets-you-play-ai-game-mashups-in-one-click-but-theres-a-catch-3419011/)显示用户还关心安装安全、隐私、游戏所有权和账号风险；这使“先评估、再生成方案”比直接下载更可信。
- [Merging.games](https://merging.games/)与 [AI Game Mods](https://aigamemods.com/merge-games-with-ai)已开始做解释/指南，但公开搜索中尚未看到一个成熟的“输入两个游戏 → 输出融合设计与可行性”的纯网页生成器。

### ArtCraft

- [TechRadar 的实测](https://www.techradar.com/pro/one-dev-is-recreating-7-adobe-apps-in-rust-for-free-so-i-tested-it-out)和 [Creative Bloq 的实测](https://www.creativebloq.com/news/i-tried-those-free-ai-coded-adobe-creative-cloud-clones-and-they-have-some-big-problems)证明该词是真实产品热点，也提示产品仍处早期阶段。
- 搜索未发现明确的 ArtCraft 工作流兼容检查器，存在工具缺口；但功能矩阵频繁变化，且大多数用户仍在找官网、下载与评测，因此排第二。

### Clef

- [Cloudflare 官方模型文档](https://developers.cloudflare.com/workers-ai/models/clef/)与 [Hugging Face 模型说明](https://huggingface.co/Cloudflare/clef/blob/main/README.md)确认它是将 state + typed questions 转成概率决策的 27B 多模态模型。
- 公开结果已经出现 [Clef-Flash Playground](https://clef-flash.com/playground)、[Clef Demo](https://clefdemo.com/)和 [iajev Playground](https://iajev.com/clef) 等多个可运行工具，竞争缺口已经明显收窄。

### Rumpelstiltskin meme

- [Know Your Meme](https://knowyourmeme.com/memes/ai-rumpelstiltskin-tip-toein-in-my-jordans)确认该迷因与 AI 生成视频的关系。
- 搜索结果已有多个完全匹配的生成器，包括 [ai-rumpelstiltskin.app](https://ai-rumpelstiltskin.app/)、[rumpelstiltskinmeme.app](https://rumpelstiltskinmeme.app/)和 [rumpelstiltskinmeme.com](https://rumpelstiltskinmeme.com/)。竞争已拥挤，并涉及人物照片、音乐与视频素材权利，不适合作为首发。

### 其余主题

- `firefly wedding` 已有官方动画发行与观看需求，属于内容词，不应强行工具化。
- `avatar korra` 的复苏来自《Avatar: Seven Havens》上线后的剧情讨论，属于内容/娱乐 IP 词。
- `everygen ai video generator` 与 `melty ai game` 主要是已有品牌导航词；抢同名页面容易形成仿冒感。
- `chained together ai drama` 的公开结果不足，无法稳定确认产品型意图。

## 第一个工具的 MVP 定义

### 名称

**AI Game Mashup Generator**
副标题：Combine two game ideas into one playable concept and implementation brief.

### 用户输入

- Host game（承载游戏）
- Guest game（提供元素的游戏）
- 想融合的内容：角色、移动机制、战斗、世界、物理、UI 或多人玩法
- 平台：Windows / macOS / Linux / console
- 用户是否拥有两款游戏
- 输出深度：快速创意 / 模组规格 / Coding-agent brief

### 输出

- 一句话 mashup 概念与名称
- Host/guest 职责拆分
- 建议的融合方式
- 可行性等级与原因
- 所需引擎、mod loader、API 或资产类型
- 风险提示：版权、反作弊、在线账号、存档、未知安装器
- 可复制给 Codex/Claude Code 的结构化开发 brief
- 明确标注“概念方案，不保证两款具体游戏一定可技术合并”

### 首版边界

- 不提供或托管游戏文件、ROM、破解、版权资产、反作弊绕过或作弊功能。
- 不宣称自己是 Melty 或任何游戏厂商的官方工具。
- 不执行本地安装，不修改用户游戏目录。
- 首版可以使用规则库 + 模板生成，避免高推理成本；后续再接模型润色。

## SEO 入口

- 主页面：`/ai-game-mashup-generator`
- 主关键词：`ai game mashup generator`
- 同页自然覆盖：`merge games ai`、`ai merge games`、`game merging ai`、`ai game merger`
- 不为三个同义词建立重复薄页；只有获得不同搜索意图证据后才拆分。

## 下一步

1. 输出产品规格、输入/输出 schema 与首版规则库。
2. 设计一个单页可运行原型，优先保证一次输入就能得到可分享结果。
3. 准备 10 组人工验证案例，覆盖可行、困难、不可行和高风险组合。
4. 上线后跟踪查询曝光、生成完成率、复制 brief 比例和分享率，再决定是否接入 AI 模型。
