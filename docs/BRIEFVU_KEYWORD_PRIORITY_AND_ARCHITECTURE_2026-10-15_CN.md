# BriefVu 新词重新梳理：矢量工具方向、架构与 SEO

日期：2026-10-15
状态：修订版。撤回此前把 TNPSC 图片处理列为首发方向的结论。

## 1. 为什么上一版会出错

上一版把三种不同信息混在了一起：

1. **原始关键词**：Web.Cafe 实际列出的词；
2. **需求聚类**：分析者把若干词归为一个问题；
3. **产品设计**：基于聚类推导出的工具包。

TNPSC 并不是凭空加入：原始数据中确有 `group 4 photo and signature size`、`tnpsc group 4 photo compressor`、`group 4 signature compressor`，它们位于“二次爆火”第 1 页，而不是“新词”第 2 页。但我犯了两个错误：

- 没有先展示原始词与页面位置，就直接给出合并后的“Photo & Signature Processor”；
- 把一个低量、考试季节性 preset 过度扩展成平台首发工具包，超出了数据能够支持的结论。

正确做法必须把“原词 → 搜索意图 → 底层任务 → BriefVu 产品 → SEO 关键词”逐层展示。不能把 Web.Cafe 的解释或我的推导说成原始关键词。

## 2. 矢量/Craft 原始信号

在 Web.Cafe 以 `vector` 检索工具类近 90 天新词，目前返回三个直接词：

| 原始词 | 首次出现 | 状态 | GPTs 倍数 | 页面判断 |
|---|---:|---|---:|---|
| `github vectorcraft` | 10/6 | 上升中 | 0.047 | 可以试试，略低于 0.05 建站线 |
| `vectorcraft download` | 10/7 | 上升中 | 0.005 | 尚未完成值不值得做判断 |
| `vectorcraft app` | 10/7 | 高位 | 0.002 | 可以试试，品牌应用意图 |

直接 VectorCraft 词的绝对信号不大，但它属于更大的 ArtCraft/Craft 突发词簇：

- `adobe artcraft`：GPTs×4.69；
- `photocraft download`：GPTs×0.440；
- `artcraft office`：GPTs×0.422；
- `getartcraft apps`：GPTs×0.304；
- 同期还出现 WordCraft、DeckCraft、FilmCraft、LightCraft、GridCraft 等词。

这说明“免费/新型创作工具和 Adobe 替代方案”在爆发，但不能自动证明“另做一个名为 VectorCraft 的网站”有机会。

## 3. 品牌词与产品机会必须分开

`VectorCraft` 已经是 Storytold/ArtCraft 的现有开源产品名称。其官方仓库将产品描述为 Illustrator 的 clean-room 重实现，支持 SVG、PDF、PDF-compatible `.ai` 导入导出及 PNG/JPEG/WebP 导出，并同时提供桌面和浏览器版本：[官方 VectorCraft GitHub](https://github.com/storytold/vectorcraft)。

因此 BriefVu 不应该：

- 把自己的工具命名为 VectorCraft；
- 用 `vectorcraft download` 做假下载或截流页面；
- 声称自己是 VectorCraft 官方工具；
- 试图在一个小工具版本中重做完整 Illustrator。

可以做的是：把 Craft 词簇视为“用户对轻量创作和矢量工作流产生兴趣”的市场信号，然后开发 BriefVu 自己的、结果在站内产生的矢量微工具。

## 4. 修订后的产品优先级

| 优先级 | 产品方向 | 判断 |
|---:|---|---|
| P0 | **BriefVu Vector Toolkit** | 当前主方向；站内完成 SVG 清理、改色、检查和批量导出，不使用 VectorCraft 品牌 |
| P1 | **Raster-to-Vector** | 订阅价值强，但高质量矢量化技术和成本高于普通 SVG 工具，作为第二阶段 |
| P2 | Teacher Worksheet Pack | 市场订阅模型成立，但本轮新词信号很弱，另做关键词验证 |
| P3 | TNPSC Photo/Signature preset | 原始词存在，但量小且季节性；只能是未来图片工具中的一个 preset |
| 排除 | ArtCraft Finder、第三方下载、游戏、逆向工程 | 不符合 BriefVu 自营工具定位或风险过高 |

## 5. P0 产品：BriefVu Vector Toolkit

工作名称：**BriefVu Vector Toolkit**。正式命名前还应做商标和域名检查，但不得使用 `VectorCraft` 作为产品名。

目标用户不是要在浏览器里重画完整插画，而是已经有 SVG、logo、icon 或简单矢量资产，需要快速完成交付前处理的人。

### 工具 1：SVG Optimizer & Inspector

输入：SVG 文件或 SVG 文本。

输出：

- 清理后的 SVG；
- 体积变化；
- viewBox、尺寸、颜色、字体、外链资源和脚本风险检查；
- 可视化前后对比；
- 下载与复制。

首版可以完全在浏览器本地运行。

### 工具 2：SVG Color & Palette Editor

输入：SVG。

输出：

- 自动提取填充色和描边色；
- 批量替换颜色；
- 保存品牌 palette；
- 生成深色、浅色、单色和多套配色版本；
- 批量下载 SVG。

### 工具 3：SVG Export Pack Generator

输入：一个或多个 SVG。

输出：

- 按 preset 导出 PNG 尺寸包；
- favicon、社交图、应用图标或开发资产包；
- 文件命名规则；
- ZIP 和 manifest。

### 第二阶段：Image to Vector

输入 PNG/JPG/WebP，输出 SVG/PDF/EPS 等矢量格式。高质量矢量化并不是简单格式转换，不能在产品页中混淆。

Vectorizer.AI 的官方 Web App 为 US$9.99/月，允许预览后付费下载，说明高质量矢量化本身具有订阅市场：[Vectorizer.AI pricing](https://vectorizer.ai/pricing)。Canva 和 Recraft 也提供图片矢量化：[Canva Vectorizer](https://www.canva.com/features/vectorizer/)、[Recraft Image Converter](https://www.recraft.ai/features/image-converter)。因此首版不应轻率承诺比成熟矢量器更好的追踪质量。

## 6. 为什么这个方向更符合 BriefVu

- 所有结果在 BriefVu 站内产生，而不是推荐或跳转第三方软件；
- SVG 工具可优先本地运行，隐私和成本可控；
- 三个工具共享解析、清理、预览、palette 和导出引擎；
- 每个工具解决不同任务，不是换标题的重复页面；
- 保存 palette、preset、批量任务和导出历史能够形成 Pro 价值；
- 后续可增加真正高成本的 raster-to-vector 额度，统一纳入平台订阅。

## 7. 免费与订阅

| 能力 | 免费 | BriefVu Pro |
|---|---|---|
| SVG 检查、预览、单文件清理 | 可用 | 可用 |
| SVG 改色 | 单文件、临时 palette | 批量、保存 palette |
| 导出 | 少量尺寸 | 批量 preset、ZIP、manifest |
| 历史 | 无 | preset 和任务配置历史 |
| Raster-to-vector | 少量预览或低额度 | 更高月度额度与生产格式下载 |
| 后续 BriefVu 工具 | 免费额度 | 统一订阅内开放 |

用户必须先得到真实免费结果，再在批量、保存、历史、生产导出和高成本矢量化处升级。

## 8. 技术架构

```text
lib/tools/vector/
  parse-svg.ts
  sanitize-svg.ts
  inspect-svg.ts
  optimize-svg.ts
  extract-palette.ts
  recolor-svg.ts
  render-svg.ts
  export-presets.ts
  types.ts

components/tools/vector/
  VectorUploader.tsx
  VectorPreview.tsx
  InspectionReport.tsx
  PaletteEditor.tsx
  ExportPresetBuilder.tsx

lib/tools/registry.ts
lib/entitlements/
lib/usage/
lib/billing/
lib/analytics/
```

安全边界：

- SVG 属于主动内容，预览前必须移除脚本、事件属性、外部资源和危险 URL；
- 不直接把用户 SVG 注入页面 DOM；
- 首批处理默认在 Web Worker/隔离环境执行；
- 原文件和 SVG 文本不进入分析事件；
- 优化必须做视觉回归，不能只追求字节变小；
- 字体转路径、滤镜、mask、clipPath 和 CSS 样式需要明确“保留/不支持/可能变化”。

## 9. SEO：趋势词与任务词分开

### 不作为 BriefVu 主关键词

- `vectorcraft download`
- `vectorcraft app`
- `github vectorcraft`

它们是第三方品牌导航词。最多用于内部市场观察，不应成为 BriefVu 工具页 title、H1 或产品名称。

### BriefVu 任务关键词候选

| 页面 | 主任务词 | 辅助词 |
|---|---|---|
| `/tools/svg-optimizer` | `svg optimizer` | `clean svg online`、`reduce svg file size`、`svg code cleaner` |
| `/tools/svg-inspector` | `svg inspector` | `check svg file`、`svg security checker`、`inspect svg colors` |
| `/tools/svg-color-editor` | `svg color editor` | `change svg color`、`recolor svg online`、`svg palette editor` |
| `/tools/svg-export-pack` | `svg to png batch converter` | `export svg multiple sizes`、`svg asset generator`、`svg to favicon` |
| 第二阶段 `/tools/image-to-vector` | `image to vector` | `png to svg`、`jpg to svg`、`raster to vector converter` |

这些属于成熟任务词，不是本轮 Web.Cafe 新词，因此下一步必须取得独立搜索量、难度和 SERP 数据，不能把 Craft 词簇的热度直接算到它们头上。

### 页面要求

- 首屏即可上传/粘贴并运行；
- 原图和结果预览；
- 清楚展示处理了什么、没有处理什么；
- 下载和复制有动态完成反馈；
- 文件不上传的隐私说明；
- 可复现示例和失败示例；
- FAQ 覆盖对应任务词，不塞 VectorCraft 品牌变体；
- WebApplication JSON-LD、canonical、OG、sitemap 和可索引说明。

## 10. 正确的下一步

1. 对 `svg optimizer`、`svg inspector`、`change svg color`、`svg to png batch`、`image to vector` 获取独立搜索量、难度与首页竞争数据。
2. 选择 P0 中最适合首发的单工具；当前建议先做 **SVG Optimizer & Inspector**，因为可本地执行、技术可控且能建立安全解析底座。
3. 阅读现有项目安装版本的 Next.js 指南，检查依赖和旧页面迁移范围。
4. 定义 SVG 威胁模型、处理 schema 和 20 组测试 fixture。
5. 完成单工具原型后，再开发 Color Editor 和 Export Pack；三个工具可用后接统一订阅。

这份修订将 VectorCraft 视为趋势来源而不是可占用的品牌关键词，也不再把 TNPSC 图片处理作为 BriefVu 首发。
