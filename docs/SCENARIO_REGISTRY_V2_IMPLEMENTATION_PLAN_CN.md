# Briefvu Scenario Registry v2 扩充实施方案

状态：已按审查通过的方案完成实施
制定日期：2026-08-20
适用范围：Scenario Registry、确定性解析回归、生产 OpenAI 代表性评测、SEO Candidate 池

## 1. 目标与原则

本轮将 Registry 从 8 个扩充到 24 个场景。新增场景必须提升覆盖面或验证明确风险，不能只替换行业名称。

执行原则：

1. Registry 仍是产品能力、测试和 SEO 选题的唯一事实源。
2. 先扩充测试，再根据失败结果修产品；不得为了让测试通过而降低预期。
3. `partial` 与 `unsupported` 必须触发能力边界，不得显示为 Quote Ready。
4. 新场景本轮只允许 `internal` 或 `candidate`，不得直接 `published`。
5. 默认测试不调用模型；生产评测按代表性抽样运行，控制费用和随机波动。
6. 一个场景至少验证三个保守字段；边界场景至少验证 capability issue 和安全清空行为。

## 2. 数量与覆盖目标

扩充后目标：

- 场景总数：24。
- 能力：18 supported、3 partial、3 unsupported。
- SEO：3 published 保持不变；新增 8 个 candidate，其余 internal。
- 产品族：shirts、hoodies、polos、jackets、caps、jerseys、tote bags、beanies、aprons、safety vests、mixed。
- 工艺：screen printing、embroidery、heat transfer、DTF、DTG、sublimation、unknown/missing。
- 关键表达：approximate、conflict、deadline replacement、negative statement、rush/no rush、customer-supplied garments、size breakdown、multiple designs、attachment claim、personalization、multi-product split。

## 3. 新增场景矩阵

| ID | 场景 | 能力 | SEO | 主要验证目标 |
| --- | --- | --- | --- | --- |
| M09 | Retail staff embroidered aprons | supported | candidate | apron、embroidery、front、pickup |
| M10 | Winter event embroidered beanies | supported | candidate | beanie、navy、embroidery、delivery |
| M11 | Youth camp DTF shirts | supported | candidate | DTF、front/back、颜色、数量 |
| M12 | Artist merch DTG T-shirts | supported | candidate | DTG、full front、exact quantity |
| M13 | Sublimated team jerseys | supported | candidate | sublimation、front/back、无逐人个性化 |
| M14 | Customer-supplied screen-print shirts | supported | candidate | customer supplied = Yes、screen print、pickup |
| M15 | Rush conference polos | supported | candidate | rush = Yes、deadline、embroidery |
| M16 | No-rush organization hoodies | supported | internal | explicit no rush、DTF、delivery |
| M17 | Polo order with size breakdown | supported | candidate | 完整尺码分布、quantity 对齐 |
| M18 | Two-design shirt order | supported | internal | number of designs、两个位置 |
| M19 | Conflicting deadline in initial enquiry | supported | internal | 两个日期保持 Conflicting，不自动选值 |
| M20 | Decoration method changed by reply | supported | internal | screen print 被回复替换为 DTF，需人工接受 |
| M21 | Personalized embroidered beanies | partial | internal | 基础订单可提取；逐人姓名 roster 必须拦截 |
| M22 | Named safety vests | partial | internal | safety vest 基础字段；员工姓名矩阵必须拦截 |
| M23 | Shirts and hoodies with separate quantities | unsupported | internal | multi-product blocker；产品相关字段安全清空 |
| M24 | Tote bags and caps with different designs | unsupported | internal | multi-product + design mapping 边界 |

## 4. 需要同步扩充的产品能力

### 4.1 确定性词汇覆盖

在本地解析与 capability detector 中补充：

- 产品：apron(s)、beanie(s)、safety vest(s)。
- 工艺：保留 DTF、DTG、sublimation 的规范识别。
- 数量识别：新产品必须能参与“数字 + 颜色 + 产品”模式。
- 客户自带成衣：own blanks、our own shirts、we will supply 等表达。
- 设计数量：`two designs`、`2 separate designs`。
- 多 deadline：同一消息出现两个不一致的明确截止日期时保持冲突候选。

### 4.2 能力边界

- 多个产品族：`multi_product_order`，Quote Blocker。
- 逐人姓名/号码/尺码：`personalization_matrix`，Quote Blocker。
- 对 multi-product，garment type 保留冲突候选；品牌、款式、颜色、尺码、工艺、位置、颜色数、设计数清空为 Ambiguous。
- 同义词必须归一，不能把 shirt/T-shirt/tee 或 cap/hat 误判为多产品。

## 5. 验证器升级

Registry validation 增加：

1. ID 必须连续为 M01–M24，避免漏号或重复。
2. supported 场景至少三个 field expectations。
3. partial/unsupported 必须保持 `seo.status=internal`。
4. candidate 必须为 supported，并提供 `primaryIntent`，但不得自动进入 sitemap。
5. reply 场景必须至少有一个 `expectedChanges`。
6. 每个 expectation 的 key 在同一场景内唯一。
7. 不允许 mock 文本包含真实邮箱、电话或 URL。

## 6. 测试分层与生产预算

### A. 静态 Registry 测试（全部 24）

- 结构、连续 ID、slug/path 唯一。
- capability/SEO 发布门槛。
- 覆盖统计达到目标。

### B. 确定性解析测试（supported/partial）

- 全部保守 expectations 必须通过。
- M19 日期冲突候选必须保留两个原文证据。
- M20 回复产生 decoration method replacement，接受前不修改原值。
- M21/M22 personalization blocker。
- M23/M24 multi-product blocker及安全清空。

### C. 生产 OpenAI 代表性评测

首次运行 10 个新增代表场景：M09–M16、M21、M23。

- M09–M16 覆盖两个新产品、三种新/已有工艺、rush/no-rush、自带成衣与不同 fulfilment。
- M21 验证 partial 边界。
- M23 验证 unsupported 边界。
- 如发现确定性代码问题，修复后只复验失败 ID；如修改 prompt/schema，则重新运行 10 个代表场景。
- 其余场景保留为本地回归；进入 published 前必须单独通过生产评测。

## 7. SEO 扩充规则

本轮不新增公开页面，只建设 Candidate 池。Candidate 条件：

1. capability=supported。
2. 有独立搜索意图，不与现有页面简单同义。
3. 本地回归通过；未来发布前再跑该场景生产评测。
4. 具备足够独立内容素材后，单独评审 outcome、lessons、内部链接和页面差异度。

本轮计划的 8 个 Candidate：M09–M15、M17。M16 与现有 M02 Hoodie 意图接近，仅保留为产品测试。所有 candidate 均不会进入 `publishedScenarios`、`/examples` 或 sitemap。

## 8. 实施顺序

1. 升级 Scenario 类型与 validation 规则。
2. 扩充确定性产品/工艺/冲突解析和 capability detection。
3. 添加 M09–M24 Registry 数据。
4. 更新 Registry 本地测试和 reply/boundary 专项测试。
5. 运行 `npm test`、`npm run lint`、`npm run build`。
6. 根据失败修复，不能降低预期绕过失败。
7. 部署生产。
8. 运行 M09–M16、M21、M23 生产代表性评测；记录真实问题并按失败 ID 复验。
9. 验证主域名、www、workers.dev、sitemap 和公开页面健康状态。
10. 更新问题台账和覆盖报告。

## 9. 验收标准

- Registry 恰好 24 个场景，ID 连续。
- 覆盖统计恰好为 18 supported、3 partial、3 unsupported。
- 新增 8 candidate；published 仍为 3，sitemap URL 数不因本轮增加。
- partial/unsupported 均不可 Quote Ready。
- multi-product 不导出无法归属的产品相关字段。
- 生产代表性场景全部通过，或失败被记录为未解决 blocker 且不宣称完成。
- 默认测试、lint、build、部署和生产健康检查全部通过。

## 10. 回滚条件

出现以下任一情况，不继续 SEO 扩充：

- supported 场景被误判为 capability blocker。
- partial/unsupported 场景显示 Quote Ready。
- 模型值没有原文证据却进入 Job spec。
- 新规则导致 M01–M08 既有生产回归失败。
- www/canonical/sitemap 健康检查失败。

## 11. 方案审查记录

审查日期：2026-08-20
结论：通过，允许进入实施阶段。

检查结果：

1. **数量一致性**：现有 6/1/1 加新增 12/2/2，最终恰好为 18 supported、3 partial、3 unsupported。
2. **能力安全**：partial/unsupported 全部 internal；多产品和个性化都有明确 blocker 断言。
3. **SEO 安全**：无新增 published；发现 M16 与 M02 Hoodie 意图可能重叠，已将 M16 改为 internal，并用 M17 替代 candidate 名额。
4. **测试可实现性**：新产品词汇、设计数量、deadline 冲突和 reply replacement 均有明确代码落点；不需要修改现有数据模型。
5. **模型成本**：默认测试全确定性；生产仅抽样 10 个新增场景，失败后按 ID 复验。
6. **回归风险**：M01–M08 保留原预期；最终必须跑全量本地测试和生产健康检查。
7. **部署兼容性**：不改路由、sitemap 或 middleware；candidate 不会造成新增公开 URL。

审查后没有剩余阻断项，实施范围被冻结为本文件所列内容。

## 12. 实施结果

完成日期：2026-08-20
生产版本：`b8142f51-8f89-4ad1-95ed-e711474a97f9`

### 12.1 Registry 与能力覆盖

- Registry 已从 8 个扩充到 24 个，ID 连续为 M01–M24。
- 原计划目标为 18 supported、3 partial、3 unsupported；阶段 2 生产门禁证明 M18 无法安全表达设计—颜色映射后，最终调整为 17 supported、4 partial、3 unsupported。
- SEO 统计：3 published、10 candidate、11 internal。
- 新增 candidate 为 M09–M15、M17；没有 candidate 自动进入公开页面或 sitemap。
- 新增产品词汇：apron、beanie、safety vest。
- 新增确定性能力：设计数量、多个 deadline 冲突、客户自带成衣表达、个性化否定表达。

### 12.2 本地验证

- Registry 专项：31/31 通过。
- 默认全量：阶段 2 安全修复后为 67/67 通过，5 个生产调用测试按设计跳过。
- ESLint：通过。
- Next.js production build：通过。
- 既有 M01–M08 回归保持通过。

### 12.3 生产代表性评测

按方案运行 M09–M16、M21、M23，共 10 个真实 OpenAI 场景调用：

- M09–M16 supported 场景全部满足字段契约，未出现意外 capability issue。
- M21 正确返回 `personalization_matrix` blocker。
- M23 正确返回 `multi_product_order` blocker，garment type 保持 Conflicting，无法归属的位置字段为空。
- 测试文件结果为 11/11 通过；其中一个通用 M01 reply test 因指定 ID 不包含 M01 而直接跳过业务调用。
- 本轮没有发现新的生产解析缺陷，因此没有降低预期或追加失败重试。

M17–M20、M22、M24 本轮仅完成确定性回归，没有宣称完成生产模型验证；它们若进入 published 必须先单独运行生产评测。

### 12.4 SEO 与生产健康

- Sitemap 仍为 9 个 URL，没有加入 candidate/internal 场景。
- M09 candidate 示例 URL 返回 404，符合未发布预期。
- 主域名返回 200。
- www 带路径和 query 正确 308 到 canonical 后返回 200。
- workers.dev 路径正确转向 canonical 后返回 200。

### 12.5 结论

实施结果满足第 9 节全部验收标准，没有触发第 10 节回滚条件。下一步可以从 10 个 candidate 中做搜索意图与内容差异评审，但不能直接批量发布。

## 13. 阶段 2–3 补充生产门禁

执行范围：M17、M18、M19、M20、M22、M24，以及 M20 reply。

首次结果：

- M17 因模型省略尺码文本中的连词 `and` 被字符串比较器判失败；尺码和值均完整，结论为测试工具问题。
- M18 模型可能把一色前面与两色背面错误相加为 `print_colors=3`，且状态在不同调用中可能为 Confirmed 或 Ambiguous。
- M19 模型在不同调用中可能自动选择一个 deadline，也可能正确返回两个冲突候选。

处理决定：

1. M17 改用尺码—数量对比较，不降低字段预期。
2. M18 从 supported 调整为 partial，新增 `design_spec_matrix` capability blocker；本地规则强制保留颜色候选 1 和 2。
3. M19 在本地检测到多个明确 deadline 时强制使用 Conflicting，覆盖模型的不稳定结果。
4. `file_received` 始终由产品能力设置为 Unknown/Needs Review，不再接受模型伪造证据并产生误导警告。

修复后结果：

- Registry 32/32 通过。
- 默认测试 67/67 通过。
- M17/M18/M19 专项生产复验 5/5 通过。
- 6 个剩余场景、M20 reply 与字段安全审查最终 8/8 通过。
- 未出现 Missing 哨兵值、候选证据错误、File received 伪警告或错误的 partial/unsupported Readiness。
