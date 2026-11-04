# BriefVu 产品优化总复查与后续实施清单

复查日期：2026-11-01（Asia/Shanghai）。生产基线：第三批版本 `a89c1103-57e0-415f-aaeb-fbe649d2b41f`。

**结论：原方案“2 新页 + 3 个旧页升级”的 MVP 已全部上线；不等于最初长方案的每项高级能力、内容验收与搜索目标都已完成。当前先补齐效果观测与发布质量，不继续扩建新工具。**

本轮只做复查和项目文档更新，未修改产品代码、未重新部署、未刷新 sitemap 日期、未提交 GSC。未覆盖工作区既有修改。

## 1. 本次证据与范围

- 重新 GET 生产 sitemap 的全部 31 个页面：均为 200、单一 H1、对应 canonical、无 meta noindex；抓取的站内页面链接全部指向这 31 个已验证页面，没有发现失效的站内页面目标。不是对外站链接、下载 Blob 或所有 URL 变体的全网检查。
- 五个核心工具额外检查响应头：200 HTML，无 X-Robots-Tag；robots 允许一般搜索抓取并声明 sitemap；HTTP → HTTPS 与 www → 非 www 示例均 308，路径/query 保留。
- 本轮重新运行 `npm test`：21 文件 / 107 测试通过。没有产品代码改动，未为文档更新重复构建发布。
- 本轮 Chrome 实测 Picker：#777777 / 白色为 4.48:1，普通文本 AA 不通过、大字 AA 通过；顶部内链可到 Palette。
- 本轮 Chrome 实测 Palette：五色 PNG 提取五色，选择 10 色不捏造额外色；平均色、主色、HEX/RGB/HSL 与 JSON 输出存在且一致。Converter WebP 80% 预设可正常触发。
- ICO / Metadata 实际下载、ZIP、独立解码及移动端证据沿用本日第二/三批验收；本轮核对其当前生产 HTML、代码与测试，没有把所有下载场景重复测试一遍。
- `npm run usage:report -- 168` 实际返回 403 / Authentication error。仅确认统计读取失败，不能据此断言事件写入失败或真实使用量为零；未更改或扩展凭据。
- 本轮未重新访问 GSC 账户。第一批已观察到的 28 已收录 / 15 未收录属于旧报告快照（报告日期 2026-10-23），不是当前五个页面的收录结论。用户是否已手动提交，不推断。

证据：[全站生产复查](qa/overall-review-2026-11-01/production-audit.json)、[响应头与 robots](qa/overall-review-2026-11-01/headers-robots.json)、[Palette 交互截图](qa/overall-review-2026-11-01/palette-review.png)。

## 2. 对照最初方案：已完成

| 项目 | 当前生产能力 | 验收结论 |
|---|---|---|
| Palette 新页 | 平均色、主色、默认 5 色/可选 2–10 色、HEX/RGB/HSL、CSS/JSON 复制下载、透明规则与大图限制 | MVP 完成；与单点 Picker 分页并双向说明意图 |
| Picker 升级 | 单点取色保留；普通/大字 AA/AAA；透明前景合成；共享 CSS/JSON 导出 | MVP 完成；原 TDK 保留，不新增 contrast URL |
| Image to ICO 新页 | 16/32/48/256 真正多尺寸 ICO；独立像素预览；Fit/Crop、padding、背景；ICO 与网站图标 ZIP；HTML/manifest icons 片段 | MVP 完成；ZIP 有 favicon.ico、180/192/512 PNG 与 readme，不冒充完整 PWA |
| Remove Metadata 升级 | 元数据查看、位置/设备/时间/作者/软件分组；20 文件批量；单项失败隔离；字节/区块前后对比、重扫/解码验证；单图与成功项 ZIP | MVP 完成；不重编码压缩图像数据；识别范围和显示方向/色彩影响明确 |
| Converter 任务入口 | WebP 80% 真正预设；ICO 与尺寸调整导航；保留 TDK；防止不支持编码时错误命名 | MVP 完成；未宣称 AVIF 输出或 App Store 截图能力 |
| 抓取与发现 | HTTPS 主域重定向、首页/目录入口、canonical、正文、面包屑、WebApplication | 本轮未发现阻塞项；不等于已索引 |
| sitemap | 两个新 URL；31 条唯一 URL（21 工具 + 5 指南 + 首页/目录/指南索引/隐私/条款） | 7 页为 2026-11-01，24 页保留 2026-10-20；无批量伪更新 |
| 隐私约束 | 图片本地处理；事件白名单只含工具 ID 和动作 | 代码与既有测试一致；无需新增后端处理服务 |

三批记录：[色彩工具](COLOR_TOOLS_IMPLEMENTATION_2026-11-01_CN.md)、[ICO 与 Converter](ICO_IMPLEMENTATION_2026-11-01_CN.md)、[Metadata](METADATA_IMPLEMENTATION_2026-11-01_CN.md)。

## 3. 内链逐项复查

| 原定方向 | 当前情况 |
|---|---|
| 首页 / 工具目录 → 两个新页及三个升级页 | 全部存在；首页仍以图片工具为主，15 个图片工具、6 个其它工具 |
| Palette → Picker | 顶部意图区分、正文、相关工具均存在 |
| Picker → Palette | 顶部、正文、相关工具均存在 |
| Palette → Converter / Compress / Resize | 全部存在 |
| ICO → Resize / Converter / Palette / Compress | 全部存在 |
| Converter → ICO | 任务入口及相关工具存在 |
| Converter → Resize | 正文及任务入口存在 |
| Remove Metadata → Palette | 正文已加入；不要求再在相关工具中重复一次 |

结论：原方案关键内链没有遗漏。两页意图与 canonical 区分清楚；仅凭内链无法保证永远没有搜索词竞争，后续应从 GSC 的“查询 × 页面”检查。

## 4. 明确暂缓，不算漏做

| 原方案能力 | 暂缓原因 / 再启动条件 |
|---|---|
| Palette 局部框选 | MVP 已明确排除；有用户需要从局部对象提色时再做 |
| Picker 最近 Tailwind 色号、Palette Tailwind config | CSS/JSON 已覆盖基础交付；需明确 Tailwind 版本和色差匹配方法，有实际使用需求再做 |
| ICO SVG 输入 | 第一版明确不支持；加入前须处理 SVG 外部资源、解码和安全边界 |
| ICO 圆角、自动模糊警告 | 圆角不是当前主流程必需；模糊警告需要可解释、可验证规则，不能简单包装成质量认证 |
| Chrome 扩展独立图标包 / action.default_icon | 当前 16/32/48/256 ICO 与网站 ZIP 不是扩展 PNG 包，不能只加配置片段冒充支持 |
| 完整 PWA、maskable icons | 当前只提供 icons 片段与普通图标，不承诺安装能力；待独立需求验证 |
| Converter 的 AVIF 输出、五种“平台预设卡片” | 实际只有 WebP 可用输出预设，其它是明确导航；不添加不具备实际能力的 Chrome/App Store 卡片 |
| HAR / Auth Secret / Audio / OCR Markdown 等新工具 | 不属于本轮图片主线；保持不做，不因阶段验收结束就自动恢复立项 |

主站继续本地处理是本项目选择，不把“浏览器绝不可能 OCR/推理/持久化”等原文绝对判断当作技术事实或永久产品规则。

## 5. 遗漏、待验证与验收规则调整

### 应补的项目

- [x] **P0：使用统计读取恢复。** 已用经授权的专用 Account Analytics Read 令牌成功查询生产数据，修正响应解析与报错；令牌 2026-12-01 到期。见本批基线文档。
- [x] **P0：五页 GSC 基线采集。** 五页均已收录，11 月 1 日抓取、canonical 正确；搜索表现截至 10 月 30 日，属于上线前基线，发布后效果待 11 月 8 日/15 日回看。GSC sitemap 仍为 10 月 29 日读取的 29 页。
- [x] **P1：两新页公开操作示例。** 已上线：每页一张真实结果截图、可下载 PNG 和复现说明。按用户轻量要求，不机械凑原方案图片数量；详见公开示例清单。
- [ ] **P1：Safari/iOS 兼容性补测。** 目前主要为 Chrome 桌面/响应式，尚未证明真实 Safari/iOS 文件解码、下载/ZIP、复制和内存限制的体验。尤其检查 ICO/Metadata 下载及 Palette 大图。
- [x] **P1：Metadata 清理后提示消歧。** 原图位置字段与清理输出重扫结果明确区分；比较方向和两列标题同步修正，算法未改。
- [ ] **P1：版本归档。** 三批发布成功，但工作区仍有大量未提交代码、fixtures 和文档；需要整理并提交可复现发布快照。不要自动覆盖现有修改或未经指示推送。
- [ ] **P2：Picker 结构化 featureList 同步。** WebApplication 仍主要列旧取色能力，可补对比度与导出；不是抓取阻塞项。

### 不再照搬的验收规则

- Palette / ICO 均有 WebApplication + BreadcrumbList；Palette 没有 FAQPage JSON-LD，是原文字面差异，但不列为 SEO 必修遗漏。Google 2026-05-07 已停止 FAQ 富结果，2026-06-15 移除相关文档。保留用户可读 FAQ 即可；旧页现有 FAQPage 不需要为此紧急删除。[Google 官方更新记录](https://developers.google.com/search/updates)
- “OnPage ≥90 / 主题聚焦 ≥90%”未实际测量，不填写虚假分数；“每个词至少出现三次”不作为机械验收。正文满足任务、没有虚构能力比凑词频更有价值。
- 抓取统计的全页英文词数约 Palette 1,175、ICO 1,235、Picker 1,694、Metadata 1,492；含导航/FAQ/初始控件，不等同正文严格词数。不可只为原字数目标扩写或删减。
- lastmod 反映重大修改，不是站点活跃打卡。本轮仅更新项目文档，所以不再改生产 sitemap 日期。Google 也忽略 priority/changefreq。[Google sitemap 文档](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- 原方案 DR、KD、引用域预算、半年排名与流量推断没有在本次复查重新验证，不转成验收承诺。此前“零收录”已被第一批 GSC 观察反证。

## 6. 下一步最值得做什么

**第一优先：先让这五页的收录与使用效果可验证，再决定增加哪项高级功能。具体从恢复统计报表、记录 GSC 基线开始。** 当前已确认的是功能能运行，缺失的是可读取的真实使用证据；继续开发 Tailwind/SVG/新 URL 不能回答哪个现有工具真正需要投入。

建议下一小批执行顺序：

1. 修复统计读取认证；取得五页按工具划分的最近 7 天 started / loaded / copy / export 计数，记录上线与 QA 测试时间段。现有事件是动作次数，不是去重用户；ZIP 一次事件可能含多张图片，不能直接计算用户转化率。
2. 建立五页 GSC 基线表。新页优先 Palette、ICO；旧页重点 Metadata、Picker、Converter。未收录先看 URL 检查具体原因，不能直接归因权重不足或要求固定数量外链。
3. 补两页公开操作截图、修正 Metadata 原图提示，并做 Safari/iOS 验收；这批不新增 URL、不换 TDK。验收后再更新真实修改页面日期。
4. 2026-11-08 / 2026-11-15 回看展示、查询和工具动作；这是建议检查日期，尚未创建自动任务。样本太少则延长观察，不按极小样本下结论。
5. 有展示但点击少：检查具体查询、标题与意图匹配；有使用但导出少：先排查失败或流程问题；有真实反馈才选择一个高级能力。对外推广可利用这批真实示例做相关展示，但不以批量目录数量或 DR 达标为目标。

## 7. 本轮完成清单

- [x] 对照原方案与三批实际实现，区分 MVP 完成和高级项暂缓。
- [x] 生产全 sitemap 31 URL、关键内链、canonical、H1、robots、重定向复查。
- [x] 核对功能验收证据并补 Palette / Picker / Converter 当前交互回归。
- [x] 全量 107 测试通过；识别统计报表 403 与公开截图缺口。
- [x] 更新总清单与各批文档入口，明确下一步优先级。
- [ ] 后续实施按第 5、6 节推进；本次没有把建议项目标记为已完成。

## 后续执行

已完成 [统计修复与 GSC 基线](MEASUREMENT_BASELINE_2026-11-01_CN.md)：403 解决，111 测试及 lint/typecheck 通过；五页收录与查询/展示基线已保存。第 6 节原优先级的步骤 1–2 已完成，下一步推进步骤 3：公开示例、Metadata 提示消歧及 Safari/iOS 验收；保持不新增工具。后续观察不等同本批实施阻塞。


## 当前批次：公开示例与提示消歧

已完成并上线 [公开示例实施清单](PUBLIC_EXAMPLES_IMPLEMENTATION_2026-11-01_CN.md)。按用户要求保持轻量：Palette / ICO 各一张真实结果截图与可复现样例，不机械凑原方案截图数量；Metadata 只改原图/输出提示，不改算法。Safari/iOS 真机验收不在本批范围，继续待验证。

文案快修已上线：Palette 增加“先裁剪再提取局部配色”100 词说明，Palette/Picker → ICO 两条正文内链，Palette Title 缩为含品牌 53 字符，ICO Description 补完整主短语。页内局部框选仍暂缓；此处为现有工具之间的操作指引。验证见公开示例清单同日追加记录。

## 下一批实施结果（2026-11-03，已上线）

已完成并上线 [TGA、Compress 与扩展图标优化方案及执行清单](NEXT_IMAGE_TOOLS_PLAN_2026-11-03_CN.md)：新增 TGA Viewer 与 Converter 共用解析，Compress 目标大小/小批量，ICO 扩展 PNG 包，以及目标大小压缩指南。Converter → ICO 入口沿用现有实现；泛 TGA 使用指南继续暂缓。生产版本 `9d10f151-b32e-4415-a37c-fffcb8472f6a`，sitemap 现为33个唯一URL。
