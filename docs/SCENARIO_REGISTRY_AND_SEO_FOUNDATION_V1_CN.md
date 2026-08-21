# Scenario Registry v1 与 SEO Foundation v1 实施方案

状态：已批准实施
实施日期：2026-08-19
首轮场景驱动迭代：2026-08-20
适用产品：Briefvu V0 Customer Reply Loop

## 1. 决策摘要

本阶段同时建设两个底层模块：

1. **Scenario Registry v1**：用同一份结构化场景数据连接产品支持范围、回归测试和 SEO 发布资格。
2. **SEO Foundation v1**：建立可切换域名、canonical、robots、sitemap、结构化数据、Search Console 验证入口和首批可索引内容页。

关键原则：

- Registry 是场景事实源；测试和页面不得各自维护另一套场景清单。
- “能解析一部分”不等于“产品已支持”，能力状态明确区分 `supported`、`partial`、`unsupported`。
- SEO 页面不是批量换词模板。只有 `supported + regression passed + published` 的场景可以进入 sitemap。
- V0 继续聚焦**单一成衣产品的定制印花/刺绣询价**，支持 T-shirt、hoodie、polo、jacket、hat/cap、jersey 和 tote bag 等；多产品订单、复杂工艺组合和生产排程暂不宣称完整支持。
- 自定义域名和 Google 验证码必须使用真实值。当前先以现有 Workers 域名作为规范 URL，不放置虚构域名或验证码。

## 2. 范围与非目标

### 2.1 本次范围

- 8 个代表性 mock 场景及统一分类法。
- Registry 静态校验、覆盖统计和确定性解析回归测试。
- 5 类首批 SEO 落地页结构：产品能力页、丝网印刷用例、刺绣用例、询价清单指南、募款 T-shirt 示例。
- 可抓取的站内导航和内部链接。
- 全站 Metadata、canonical、Open Graph、robots、sitemap 和基础 JSON-LD。
- `SITE_URL` 与 `GOOGLE_SITE_VERIFICATION` 配置入口。
- Cloudflare 自定义域名及 Search Console 上线手册。

### 2.2 本次不做

- 不购买或猜测品牌域名。
- 不在没有验证码时伪造 Search Console 所有权验证。
- 不做关键词批量页、城市页或几十个低差异场景页。
- 不承诺真实邮件附件已被读取；当前输入仍以粘贴文本为主。
- 不把多产品、制服套装、复杂颜色/尺码矩阵包装成完整支持能力。

## 3. Scenario Registry v1

### 3.1 数据模型

每个场景包含：

- 身份：`id`、`slug`、标题、摘要。
- 输入：初始询价、0–N 次客户回复，全部为无个人信息的 mock 文本。
- 分类：成衣类型、装饰工艺、客户行业、订单形态、询价问题、工作流阶段、报价模式。
- 能力：`supported | partial | unsupported`，以及明确的限制说明。
- 回归预期：关键字段值、状态和需要更新的字段。
- SEO：`internal | candidate | published`、目标路径、主要搜索意图。

### 3.2 首批分类轴

| 维度 | v1 值示例 | 用途 |
| --- | --- | --- |
| Garment | t-shirt, hoodie, polo, jacket, cap, jersey, tote-bag, mixed | 产品覆盖与内容聚类 |
| Decoration | screen-printing, embroidery, dtf, sublimation, unknown | 规则覆盖与用例页 |
| Industry | school, nonprofit, business, sports, hospitality, healthcare, event | 用户研究与 SEO 意图 |
| Order shape | single-product, multi-product | 支持边界 |
| Intake problem | contradiction, missing-detail, deadline-change, artwork-uncertainty, size-breakdown | 测试目标 |
| Workflow | initial-intake, reply-merge, human-review, quote-readiness | 产品阶段 |
| Quote mode | ballpark, formal | 缺失字段优先级 |

### 3.3 发布门槛

场景进入公开 SEO 页面必须同时满足：

1. `capability.status === supported`。
2. Registry 结构校验无错误。
3. 关键字段回归测试通过。
4. 页面具有独立内容与用户价值，不是仅替换关键词。
5. 页面 canonical 唯一、存在可抓取内部链接并进入 sitemap。

`partial` 场景可以用于测试与产品规划，但不得生成宣称完整支持的页面；`unsupported` 只用于边界测试。

### 3.4 初始 8 场景

| ID | 场景 | 能力 | SEO 状态 | 主要测试目标 |
| --- | --- | --- | --- | --- |
| M01 | 学校募款 T-shirt | Supported | Published | 数量冲突、品牌/款号、deadline reply replacement |
| M02 | 企业活动 hoodie | Supported | Candidate | 近似数量、颜色、丝网印刷 |
| M03 | 餐厅员工 polo 刺绣 | Supported | Candidate | 刺绣、left chest、尺码信息 |
| M04 | 建筑公司 jacket | Supported | Internal | 外套、刺绣、pickup |
| M05 | 运动队 jersey 热转印 | Partial | Internal | 个性化名字号码的支持边界 |
| M06 | 非营利 tote bag | Supported | Candidate | tote bag、丝印、formal quote |
| M07 | 医疗制服组合 | Unsupported | Internal | 多产品订单边界 |
| M08 | 活动 cap 刺绣 | Supported | Candidate | cap、附件声明、artwork uncertainty |

### 3.5 验证和测试

- Schema：ID、slug、路径唯一；枚举合法；mock 文本非空。
- 发布安全：Published 必须 Supported，必须有唯一 `pagePath` 和搜索意图。
- 解析回归：每个 Supported 场景至少验证 quantity、garment type、decoration 等保守的关键字段。
- Reply 回归：M01 必须产生 quantity、brand/style、deadline 的候选变更；接受后 deadline 变为新日期。
- 覆盖报告：按 capability、garment、decoration、industry 和 SEO 状态输出数量，便于后续迭代选题。

## 4. SEO Foundation v1

### 4.1 URL 与域名策略

- 唯一规范来源为 `SITE_URL`。
- 当前生产默认值：`https://briefvu.com`。
- 接入自定义域名后，只修改构建环境/Worker 变量中的 `SITE_URL`，再添加 Cloudflare Custom Domain；所有 canonical、sitemap、robots 和 JSON-LD 自动切换。
- URL 必须是 HTTPS origin，不接受路径、query 或 fragment。
- 自定义域名启用后，旧 Workers URL 应 301 到新域名；在完成重定向前，canonical 先指向新域名以防重复收录。

### 4.2 技术资产

- Root Metadata：标题模板、描述、metadataBase、canonical、Open Graph、Twitter、robots 和 Google 验证 meta。
- `app/robots.ts`：允许公开内容，禁止 `/api/`，声明 sitemap 与 host。
- `app/sitemap.ts`：只包含希望收录的首页和首批内容页，不包含 API、未发布场景或参数 URL。
- JSON-LD：首页使用 `WebApplication`；内容页使用 `BreadcrumbList`。不添加虚假评分、评论或价格声明。
- 全页使用语义 HTML 和普通链接，内容无需 JavaScript 才可读取。

### 4.3 首批页面信息架构

| 路径 | 搜索意图 | 页面职责 |
| --- | --- | --- |
| `/custom-apparel-intake-software` | custom apparel intake software | 产品能力、边界、流程、CTA |
| `/use-cases/screen-printing-enquiries` | screen printing enquiry intake | 丝网印刷报价所需字段和常见风险 |
| `/use-cases/embroidery-enquiries` | embroidery enquiry intake | 刺绣报价所需字段和 artwork 风险 |
| `/guides/custom-apparel-quote-intake-checklist` | custom apparel quote intake checklist | 可执行的询价清单 |
| `/examples/fundraiser-t-shirt-order` | fundraiser t-shirt quote example | 从初始询价到回复合并的完整 mock 示例 |

页面不是五份同义文案：产品页解释工具；用例页解释工艺差异；指南提供独立清单；示例页展示证据与 reply loop。

### 4.4 Search Console 准备

部署完成后：

1. 在 Google Search Console 建立 Domain property（推荐）或 URL-prefix property。
2. Domain property 使用 DNS TXT 验证；URL-prefix 可使用 `GOOGLE_SITE_VERIFICATION` meta token。
3. 将真实 token 写入安全构建环境并重新部署，确认首页 `<head>` 出现验证标签。
4. 提交 `https://<domain>/sitemap.xml`。
5. 用 URL Inspection 检查首页、产品页、指南页和示例页。
6. 记录 Coverage、Crawl、Core Web Vitals 和查询数据；在有真实数据前不扩展大量页面。

### 4.5 自定义域名 Cloudflare 操作

前置条件：域名已在同一 Cloudflare 账户成为 Active zone，目标主机名没有冲突 CNAME。

上线步骤：

1. 决定主域（如 `app.example.com` 或 `example.com`）及 www 策略。
2. 在 Worker 配置增加 `routes: [{ pattern: "<host>", custom_domain: true }]`。
3. 将 `SITE_URL` 改为 `https://<host>`。
4. 部署并等待证书 Active。
5. 验证 HTTPS、canonical、robots、sitemap、API 和关键交互。
6. 为非规范 host 和 workers.dev host 设置 301。
7. 再提交 Search Console。

由于本轮尚无真实域名，这部分只生成可执行手册，不向生产配置写入占位 route。

## 5. 验收标准

### 5.1 Registry

- 8 个场景可被 TypeScript 导入，结构校验返回 0 错误。
- Published 场景全部 Supported，路径无重复。
- Registry 专属测试以及全量测试通过。
- M01 reply 的 deadline replacement 回归通过。

### 5.2 SEO

- 五个首批路径返回 200，未知示例返回 404/noindex。
- 每个公开路径有唯一 title、description 和 canonical。
- `/robots.txt` 和 `/sitemap.xml` 返回 200，使用同一 origin。
- Sitemap 不包含 API、candidate/internal 场景或 404。
- 首页存在合法 WebApplication JSON-LD；内容页存在 breadcrumb JSON-LD。
- 桌面和移动端无明显布局/横向滚动问题。

### 5.3 部署

- `npm test`、`npm run lint`、`npm run build` 全部通过。
- 生产部署成功，并对公开 URL 做在线 smoke test。
- 真实自定义域名与 Search Console 验证仅在获得真实参数后标记完成。

## 6. 后续节奏

建议连续运行 2–4 周的“场景驱动迭代”：每增加一个场景，先进入 Registry，跑产品回归并收集真实用户反馈；只有搜索意图、产品支持和内容价值同时成立时才发布页面。优先提升解析准确率、reply replacement、附件事实状态和多轮可审计性，不以页面数量作为主要目标。

## 7. 2026-08-20 首轮迭代结果

- 新增 `/examples` 场景索引页，所有公开示例均从 Registry 自动生成，可被普通站内链接发现。
- M02 企业活动 Hoodie 与 M03 餐厅刺绣 Polo 已通过本地回归和生产 OpenAI 评测，从 Candidate 升级为 Published。
- Sitemap 从 6 个 URL 扩展为 9 个 URL：增加示例索引页及两个非 T-shirt 示例页。
- Published 场景新增内容发布契约：发布日期、独立预期结果、至少两条场景经验及相关内部链接。
- 新增按需生产评测命令 `npm run test:scenarios:production`；它会调用正式 API，因此不包含在默认 `npm test` 中。
- 默认测试保持确定性且不产生模型费用；生产评测用于发布前门槛和部署后回归。
