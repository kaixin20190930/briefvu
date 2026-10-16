# BriefVu 自营工具订阅平台：首发规划

日期：2026-10-15。状态：产品基线，尚未开始开发或部署。

## 1. 已确认的产品定位

BriefVu 是一个**自营工具订阅平台**。平台持续发现新需求，自己开发可直接使用的小工具；用户在 BriefVu 站内完成任务，并通过一份订阅使用平台内的全部工具。

BriefVu 不是：

- AI Best Tool 那样的第三方产品收录、比较或导航站；
- 帮助用户选择、安装或使用第三方软件的辅助平台；
- 依靠联盟链接把用户导出站外的目录；
- 只发布定义文章、攻略或换标题提示词的内容站。

不同工具不需要相关，但都必须满足同一条产品契约：**输入真实任务，BriefVu 在站内产生可用结果**。

新词网站只负责发现机会。搜索流量是获客入口，订阅与重复使用才是产品目标。

## 2. 对已有候选的重新判定

用户的最新定位约束高于此前的关键词评分。按这个约束重新检查已有候选：

| 候选 | 新判定 | 去向 |
|---|---|---|
| ArtCraft App Finder / Workflow Compatibility Checker | 不符合 BriefVu；核心价值仍是帮助用户选择或使用第三方 ArtCraft 应用 | 从 BriefVu 首发移除；如有内容价值，交给 AI Best Tool |
| VectorCraft 品牌词 | `VectorCraft` 是第三方现有产品，搜索意图以品牌导航、下载和 GitHub 为主 | 只作为趋势信号；不使用其名称，不做假下载页 |
| BriefVu Vector Toolkit | 站内完成 SVG 检查、清理、改色与导出；可形成批量、preset 和历史等订阅价值 | **BriefVu 当前 P0** |
| AION 2 活动定时器 | 工具可站内完成，但属于游戏垂直内容 | 交给 Rulevio |
| Weekly Fantasy Trade Value Calculator | 工具可站内完成，但属于游戏/体育内容且数据维护成本高 | Rulevio 候选，不进入 BriefVu 首批 |
| TNPSC Photo & Signature Processor | 原词确实存在，但位于“二次爆火”第 1 页；量小、季节性强且已有专门产品 | 只保留为未来图片处理 preset，不是首发方向 |
| Pastor Appreciation Card Generator | 可站内生成并下载，但季节性强、重复使用弱 | 只作免费获客工具候选 |
| AION 2 Name Generator | 游戏垂直且订阅价值弱 | Rulevio 候选 |

因此，之前的 ArtCraft 两项不是两个首发工具，而是同一个不符合新定位的第三方辅助方向。当前不能把“已有两个方向”误报为“已有两个合格付费产品”。

## 3. 首发产品策略：先做工具包，不做孤立单页

订阅平台不能靠一个低频小工具证明价值。首批应由一个可复用的处理引擎和至少三个对用户有连续价值的自营工具组成。

经 2026-10-15 对 34 个新词和 35 个二次爆火工具词重新筛选，并对 VectorCraft/Craft 词簇重新核验，确认当前首个工具包为 **BriefVu Vector Toolkit**。`vectorcraft download`、`vectorcraft app` 和 `github vectorcraft` 是第三方品牌词，不能直接用作 BriefVu 产品名或 SEO 截流页；它们只说明轻量创作和矢量工作流正在获得关注。详细纠错、原词、市场证据、架构和 SEO 地图见 `BRIEFVU_KEYWORD_PRIORITY_AND_ARCHITECTURE_2026-10-15_CN.md`。

首批三个工具建议为：

1. **SVG Optimizer & Inspector**：安全解析、风险检查、结构与颜色检查、优化、前后视觉对比、复制和下载。
2. **SVG Color & Palette Editor**：提取 fill/stroke，批量改色，保存品牌 palette，生成浅色、深色和单色版本。
3. **SVG Export Pack Generator**：把 SVG 按 favicon、应用图标、社交图和开发资产 preset 批量导出为 PNG/ZIP，并附 manifest。

第二、三项与平台能力共同形成订阅价值：免费用户可以完成单文件核心任务；订阅用户可批量处理、保存 palette 与导出 preset、复用历史配置，并使用全部后续工具。

第二阶段研究方向是高质量 **Image to Vector**。该方向有成熟付费市场，但算法质量、计算成本和格式承诺都高于普通 SVG 工具，因此不把它伪装成简单格式转换器。Teacher Worksheet Pack 降为后续研究方向，TNPSC 只保留为未来 preset。

## 4. 使用与付费模型

平台采用“一份订阅，使用全部 BriefVu 工具”的统一权益，不让每个工具各卖一份订阅。

建议首版权益：

| 能力 | 未登录/免费 | BriefVu Pro |
|---|---|---|
| 工具介绍、示例和结果预览 | 可用 | 可用 |
| 单文件基础处理 | 每日有限次数 | 更高公平使用额度 |
| 批量处理 | 小批量或不可用 | 可用 |
| 自定义 preset | 临时使用 | 保存、命名、复用 |
| 导出 | 基础格式 | 全格式、批量打包 |
| 历史与跨设备同步 | 不提供 | 提供 |
| 后续新工具 | 受免费额度限制 | 订阅内全部开放 |

不要在首屏完全锁住核心功能。SEO 访问者必须能真正试用并看到结果，再在批量、保存、历史、高额度或高成本能力处升级。

定价在成本和使用数据出来后决定；首版代码应支持月付/年付和权益配置，但不要在未验证需求前写死价格。广告与联盟不是 BriefVu 的主要商业模式。

## 5. 信息架构

```text
/                         产品首页：一份订阅，全部工具
/tools                    所有已发布的自营工具
/tools/[slug]             可直接使用的工具页
/pricing                  免费与 Pro 权益
/account                  账号、订阅、用量与保存内容
/login                    登录
/privacy                  文件处理和数据策略
```

首页不展示第三方工具卡片。每张卡片都必须进入 BriefVu 自己的可执行工具。

单个工具页包含：可索引说明、立即可用交互区、示例、输入限制、隐私说明、FAQ，以及相关的 BriefVu 自营工具。公开页面与功能执行在同一 URL，避免 SEO 内容页和产品页割裂。

## 6. 技术架构

继续使用现有 Next.js、TypeScript、Cloudflare/OpenNext、D1 与 Vitest。写代码前必须按 AGENTS.md 阅读安装版本的 Next.js 本地文档。

平台层：

```text
lib/tools/registry.ts             自营工具注册表
lib/tools/types.ts                通用工具元数据与运行契约
lib/entitlements/                 免费与 Pro 权益判断
lib/usage/                        匿名/账号级用量与公平使用限制
lib/billing/                      订阅状态适配层
lib/presets/                      官方 preset 与用户 preset
components/tools/                 工具页壳、上传、结果、复制/下载反馈
components/account/               登录、用量和订阅管理
operations/tools/                 候选、来源、维护和退役记录
```

首个处理引擎：

```text
lib/tools/vector/
  types.ts
  parse-svg.ts
  sanitize-svg.ts
  inspect-svg.ts
  optimize-svg.ts
  extract-palette.ts
  recolor-svg.ts
  render-svg.ts
  export-presets.ts
components/tools/vector/
```

每个工具可以复用安全解析、预览、palette 和导出引擎，但拥有自己的用户任务、默认值、页面文案、规则和结果。不能用同一功能换关键词批量生成薄页。

优先在浏览器本地处理文件。SVG 是主动内容，预览前必须移除脚本、事件属性、外部资源和危险 URL，不可直接把用户 SVG 注入页面 DOM。只有必须服务端执行时才上传，并明确文件大小、保留时间、删除策略与地区。原始文件名、SVG 文本和结果不得进入分析事件。

### 账号与订阅边界

- 游客也能执行有限核心任务；登录用于保存和同步。
- 服务端统一判断 entitlement，不能只依赖前端隐藏按钮。
- 使用量按工具、动作、周期记录，不保存原始内容。
- 支付提供商通过适配层接入；webhook 幂等，订阅状态可恢复。
- Pro 是平台级权益，新增工具自动继承，必要时再为高成本工具增加合理额度。

## 7. 工具进入开发池的新标准

候选必须同时回答：

1. 用户能否在 BriefVu 内获得最终结果，而不是第三方推荐或链接？
2. 输入和输出是否清楚、可验证？
3. 免费试用后，批量、保存、历史、高额度或持续更新中是否至少有一种真实订阅价值？
4. 是否能在 1–3 天完成有用首版，而不是只有落地页？
5. 数据、版权、商标和安全风险是否可控？
6. 是否属于 AI 收录或游戏内容；若是，分别路由到 AI Best Tool 或 Rulevio？

评分权重调整为：任务完成价值 25、搜索需求 15、重复使用/订阅价值 20、竞争缺口 15、实现速度 10、可复用能力 10、风险 5。只靠热度、品牌导航或第三方下载意图的词直接淘汰。

## 8. 分阶段交付

| 阶段 | 交付 | 退出条件 |
|---|---|---|
| 0 重新选型 | 已完成 69 个工具词扫描、Vector/Craft 复核、品牌边界和 SEO 草案 | 首选 BriefVu Vector Toolkit；品牌词与任务词已分开 |
| 1 产品底座 | 注册表、统一工具页、匿名事件、权益接口，旧业务仍可访问 | 能接入一个工具且不需复制平台代码 |
| 2 首个可用工具 | SVG Optimizer & Inspector | 用户可安全上传/粘贴、检查、优化、对比、复制和下载 |
| 3 工具包 | 增加 SVG Color Editor 与 SVG Export Pack | 三个工具共享引擎但分别解决检查、改色、交付任务 |
| 4 订阅闭环 | 登录、用量、Pro 权益、支付沙盒、账号页 | 免费/Pro 权限和 webhook 可测试、可恢复 |
| 5 预览与上线 | SEO、sitemap、监控、生产预览、回滚说明 | 获得人工验收后才切换首页和生产 |

不建议在只有一个低频工具时先完成完整付费系统。先建立 entitlement 接口和产品边界，工具包达到可用标准后接支付，可避免为没有复用价值的单页过早收费。

## 9. 指标

平台指标分四层：

- 获客：索引、曝光、自然点击和工具页进入。
- 激活：开始任务、成功得到结果、下载或复制。
- 留存：7/30 天回访、使用第二个工具、复用 preset。
- 收入：试用到注册、注册到 Pro、月度流失、单付费用户服务成本。

只有搜索访问而没有任务完成，不算产品成功；只有单次工具完成而没有重复或跨工具使用，也不足以证明统一订阅。

事件建议：`tool_view`、`tool_start`、`tool_result`、`tool_error`、`tool_download`、`preset_saved`、`signup_started`、`signup_completed`、`upgrade_viewed`、`checkout_started`、`subscription_activated`。事件仅包含白名单 toolId、版本、结果类型和用量，不包含文件、文件名和自由文本。

## 10. 现在接下来做什么

1. 独立核验 `svg optimizer`、`svg inspector`、`change svg color`、`svg to png batch`、`image to vector` 的搜索量、难度和 SERP；不得把 Craft 品牌词热度转移给这些任务词。
2. 阅读当前项目安装版本的 Next.js 文档，审计依赖、现有路由和旧首页迁移边界。
3. 定义 SVG 威胁模型、处理 schema、支持边界和至少 20 组不含用户资料的测试 fixture。
4. 实现 browser-local **SVG Optimizer & Inspector** 原型，并做安全与视觉回归验证。
5. 原型验收后开发 Color Editor、Export Pack、平台 entitlement，再评估高质量 Image to Vector。

这份计划取代此前以 ArtCraft Finder 或 TNPSC 图片处理为 BriefVu 首发的安排。关键词原始研究继续保留，但旧排名不能作为当前开发决定。
