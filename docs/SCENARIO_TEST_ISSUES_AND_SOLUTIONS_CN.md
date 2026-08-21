# Briefvu Scenario Registry v1：真实测试问题与解决方案

## 1. 测试信息

- 测试日期：2026-08-20
- 测试环境：`https://briefvu.com`
- 生产运行环境：Cloudflare Workers + OpenNext
- 当前生产版本：`7dea49bc-3bbc-4c98-949e-6ad3a46ca312`
- 模型来源要求：生产响应必须为 `source=openai`
- 场景范围：M01–M08，共 8 个初始询价场景；另含 M01 客户回复替换测试
- 测试原则：字段值、状态、证据、能力边界和 Quote Readiness 必须同时正确；HTTP 200 不等于测试通过

## 2. 场景结论

| 场景 | 类型 | 结论 | 说明 |
| --- | --- | --- | --- |
| M01 | Fundraiser T-shirt + reply | 通过 | 数量冲突与回复替换正常；shirt/T-shirt 同义词不会再误报多产品 |
| M02 | Company hoodies | 通过 | 近似数量、颜色、工艺正常 |
| M03 | Embroidered polos | 通过 | 尺码、位置、刺绣正常；附件与生产可用性保持人工审核 |
| M04 | Construction jackets | 通过 | 数量、品牌偏好、颜色、刺绣、位置、日期、取货可提取 |
| M05 | Personalized jerseys | 有条件通过 | 基础字段可提取；逐人姓名/号码被明确拦截并要求人工 roster 工作流 |
| M06 | Nonprofit tote bags | 通过 | Tote bag 不受 T-shirt 限制；数量、颜色、工艺、位置、日期可提取 |
| M07 | Mixed healthcare uniforms | 边界测试通过 | 明确识别为 V0 不支持的多产品订单；不会生成可报价的单一 Job spec |
| M08 | Embroidered caps | 通过 | Cap、刺绣、位置、附件声明正常；文件接收和生产可用性保持待审核 |

## 3. 真实问题台账

### BV-001：M05 明确的 Jersey 产品类型偶发漏提取

- 严重级别：高
- 复现结果：生产模型返回数量、颜色、热转印、位置和 Notes，但 `garment_type` 为 Missing。
- 风险：一个明确的单产品订单会出现 Quote Blocker；模型波动会直接影响业务流程。
- 根因：结构化模型输出存在概率性漏字段，原链路只有证据校验，没有对明确、低风险字段进行确定性补全。
- 解决方案：模型输出后使用本地精确解析器补全仍为 Missing 的安全字段；补全值仍必须通过原文证据验证。
- 状态：已修复、生产验证通过。

### BV-002：M07 多产品订单被压扁，并出现原文没有的具体位置

- 严重级别：阻断级
- 复现结果：`scrub tops; jackets; polos` 被放入一个 Confirmed 字段；`different logo placements` 被错误归一为 `front, back`。
- 风险：不同产品的颜色、尺码、工艺和位置失去对应关系，可能生成错误报价或生产单。
- 根因：V0 数据模型每个字段只能保存一个值，模型仍尝试把多产品信息压入单产品 schema；原证据校验只验证摘录是否存在，不能证明归一值在语义上正确。
- 解决方案：增加确定性的 multi-product 检测；产品类型保存为带原文证据的冲突候选；品牌、款式、颜色、尺码、工艺、位置、颜色数和设计数全部清空为 Ambiguous；Quote Readiness 强制为 Not ready。
- 状态：已修复，M07 生产专项复验通过。

### BV-003：Missing 状态仍可能携带字符串 `"Missing"`

- 严重级别：中
- 复现结果：部分字段返回 `status=Missing`，同时 `value="Missing"`。
- 风险：界面或 JSON 导出可能把状态哨兵当成真实客户值。
- 根因：JSON Schema 约束了类型，但没有强制 Missing 与空字符串的跨字段关系；映射层未二次归一。
- 解决方案：映射层对 Missing 和 Not Applicable 强制清空 value、evidence 和无效 candidates；只有 Conflicting 状态保留 candidates。
- 状态：已修复，单元测试与构建通过。

### BV-004：能力边界没有参与 Quote Readiness

- 严重级别：阻断级
- 复现结果：API 的 warnings 仅用于证据失败；产品不支持的订单没有独立、结构化的能力状态，也不会影响 ready/not-ready。
- 风险：界面可能显示 “Ready for a quote”，但底层订单结构超出 V0 能力。
- 根因：报价就绪规则只读取字段缺失优先级。
- 解决方案：新增结构化 `capabilityIssues`；`quote_blocker` 级能力问题进入 readiness、blocker 数量、右侧 Still needed 和顶部人工工作流提示；旧本地 Job 通过空数组兼容。
- 状态：已修复，M05/M07 生产验证通过。

### BV-005：shirt 与 T-shirt 被误判为两个产品

- 严重级别：高
- 发现方式：首次 M01–M08 生产全量评测；其余 7 个场景通过，M01 失败。
- 复现结果：同一询价中的 `shirts` 和 `T-shirts` 触发 multi-product blocker。
- 根因：检测器按显示名称区分同义词，没有先归一产品族。
- 解决方案：shirt、T-shirt、tee 统一映射到 `shirts` family；增加同义词专门回归测试。
- 状态：已修复；M01 初始询价与客户回复生产复验 2/2 通过。

### BV-006：www 域名重定向把通配符当成字面量

- 严重级别：高（SEO / 可访问性）
- 发现方式：最终生产健康检查。
- 复现结果：`www.briefvu.com` 重定向到 `https://briefvu.com/:path*`，最终返回 404。
- 根因：当前 Next.js 与 OpenNext Cloudflare 组合没有在外部 next.config redirect 目标中替换 catch-all 参数。
- 解决方案：移除配置式 host redirect，改为运行时构造完整 URL 的 308 Edge Middleware；保留 pathname 和 query；增加目标不得残留 `:path*` 的测试。
- 兼容说明：Next 16 推荐 `proxy.ts`，但当前 OpenNext Cloudflare 1.20.2 不支持 Node.js Proxy；因此暂时使用可部署的 Edge `middleware.ts`，待适配器支持 Node Proxy 后迁移。
- 状态：已修复；www 根路径、带路径和 query、workers.dev 入口均最终返回 canonical 域名 200。

## 4. 已落地的防回归机制

- `npm test`：阶段 2 安全修复后为 67 个测试通过，生产调用测试默认跳过，避免日常测试产生模型费用。
- `npm run test:scenarios:production`：验证已发布 SEO 场景。
- `npm run test:scenarios:production:supported`：验证所有 V0 支持场景。
- `npm run test:scenarios:production:all`：验证 M01–M08，包括 partial/unsupported 能力边界。
- `npm run test:scenarios:production:m01`：针对 M01 与回复替换做低成本生产复验。
- `SCENARIO_EVAL_IDS=M07`：可只复验指定场景，失败后无需重复消耗全部模型调用。

## 5. 当前产品边界

Briefvu V0 不是只支持 T-shirt。当前单产品场景已验证 T-shirt、hoodie、polo、jacket、jersey、tote bag 和 cap，以及 screen printing、embroidery、heat transfer 等常见信息。

当前明确不能自动完成的是：一封询价内多个产品需要独立颜色/尺码/工艺/位置映射，以及逐人姓名、号码、尺码组成的 personalization roster。系统现在会明确拦截这些订单，不再把它们伪装成可报价 Job spec。

## 6. 下一轮建议

1. 增加 20–30 个同义词、否定句、日期变化和多产品组合的确定性测试，不必每个都调用模型。
2. 每次 prompt、schema 或模型版本变化后运行 supported 全量生产评测。
3. 将生产评测结果按日期保存为 JSON/JSONL，以便比较模型漂移和字段通过率。
4. V1 若要支持 M05，应新增 roster 表格与逐行校验；若要支持 M07，应先新增 line items 数据模型，不能只扩充 prompt。

## 7. Scenario Registry v2 扩充记录

- Registry 从 M01–M08 扩充到 M01–M24。
- 阶段 2 前目标为 18 supported、3 partial、3 unsupported；真实测试后调整为 17 supported、4 partial、3 unsupported；SEO 仍为 3 published、10 candidate、11 internal。
- 新增 apron、beanie、safety vest，以及 DTF、DTG、sublimation、customer-supplied、rush/no-rush、design count、deadline conflict 和 decoration reply replacement 场景。
- 生产代表性评测运行 M09–M16、M21、M23，10 个实际场景全部通过。
- 未发现新的生产缺陷；M13 的否定个性化表达在上线前通过确定性测试避免了 false blocker。
- M17–M24 后续均已完成生产评测；M18/M19 的确定性安全修复和 M20 客户回复替换均通过，M24 的未就绪导出保持 Draft / Manual Review Required。
- v2 阶段 2 修复生产版本：`b8142f51-8f89-4ad1-95ed-e711474a97f9`。

### BV-007：多设计颜色数被错误合并为单值

- 严重级别：阻断级。
- 场景：M18。
- 复现结果：模型把前面一色、背面两色合并为 `print_colors=3`；状态在调用间可能为 Confirmed 或 Ambiguous。
- 根因：V0 只有一个 print colors 字段，无法表达 design/location/color 的对应矩阵。
- 解决方案：新增 `design_spec_matrix` capability blocker；确定性解析保留 1 与 2 两个冲突候选；M18 从 supported 调整为 partial。
- 状态：已修复，生产专项复验通过。

### BV-008：两个 Deadline 的模型结果不稳定

- 严重级别：阻断级。
- 场景：M19。
- 复现结果：同一输入有时返回 Confirmed 单日期，有时正确返回两个 Conflicting 候选。
- 根因：模型倾向把后一句解释为自动替换，但初始消息没有经过人工 reply review。
- 解决方案：当确定性解析发现 quantity、deadline 或 print colors 的明确冲突时，强制覆盖模型结果并保留所有原文候选。
- 状态：已修复，生产专项复验通过。

### BV-009：File received 产生无意义的证据警告

- 严重级别：中。
- 复现结果：没有真实文件输入时，模型仍可能为 File received 生成不可验证证据，触发 warning。
- 根因：File received 是产品通道能力事实，不应交给模型判断。
- 解决方案：API 映射层始终将 File received 设置为 Unknown/Needs Review、无 evidence 和 candidates。
- 状态：已修复，字段安全生产审查通过。

### BV-010：Analytics API 允许任意 metadata 写入 D1

- 严重级别：阻断级（隐私）。
- 发现方式：阶段 7 发布审查。
- 复现结果：`/api/events` 只校验事件名和 sessionId 类型，合法事件可以携带任意 metadata；恶意或错误客户端可把询价正文、证据或联系信息写入 `analytics_events`。
- 风险：即使正常 Briefvu 前端只发送计数，服务端存储边界仍不能兑现“D1 不保存客户询价内容”的承诺。
- 解决方案：新增逐事件 metadata allowlist；只接受有限的非负数字和枚举值；field、action、readiness、format 等字符串必须属于产品枚举；未知 key 和任意字符串全部丢弃；sessionId 必须是 UUID。
- 验证：新增 4 个隐私回归测试，确认客户正文和伪装字符串无法进入持久化 metadata；全量本地测试提升为 76/76 通过。生产 probe 携带 `enquiry`、`evidence`、`email` 后，D1 只保存 allowlist 中的 `input_length`、`quote_mode`、`source`；非 UUID sessionId 返回 400。历史 D1 对 probe、询价短语、email 和 subject 的精确匹配均为 0。
- 状态：已修复并部署；生产版本 `f0efda72-ae6e-4710-8f82-34da91a7ec2c`，API 冒烟与 D1 持久化审计通过。

### BV-011：回复弹窗缺少键盘焦点管理

- 严重级别：高（无障碍 / 键盘可操作性）。
- 发现方式：阶段 7 生产浏览器键盘验收。
- 复现结果：打开 Add customer reply 后焦点仍停在页面后方；Tab 不进入弹窗，Esc 不关闭，关闭后焦点不返回触发按钮；Clarification 的 `+` 按钮也没有可访问名称。
- 风险：只使用键盘或屏幕阅读器的用户无法可靠完成 Customer Reply Loop。
- 解决方案：回复弹窗打开时聚焦 Customer reply；在首尾可聚焦元素间建立 Tab/Shift+Tab 循环；支持 Esc 关闭；卸载时将焦点返回 Add customer reply；为 `+` 按钮增加 `aria-label="Add question"`。
- 验证：76/76 本地测试、ESLint、production build 通过；生产环境初始焦点、首尾循环、Esc、焦点返回、可访问名称和重复 id 扫描通过；390×844 与 412×915 无页面级横向溢出。
- 状态：已修复并部署；生产版本 `7dea49bc-3bbc-4c98-949e-6ad3a46ca312`。

### BV-012：JSON 复制按钮缺少成功反馈

- 严重级别：低（交互一致性 / 操作确认）。
- 发现方式：Safari 与真实 200% 缩放人工验收。
- 复现结果：JSON 已写入剪贴板，但按钮文本始终显示 `JSON`；同区域的 Copy draft 会显示 `Copied`。
- 风险：用户无法确认复制是否成功，可能重复点击或误以为导出失败。
- 解决方案：复用现有 `copied` 状态，使 JSON 按钮按 `JSON → Copied → JSON` 变化，反馈持续约 1.8 秒；不修改 JSON 内容、导出契约或 Analytics 事件。
- 验证：76/76 本地测试、ESLint、production build 通过；生产 UI 验证按钮即时显示 `Copied` 并自动恢复 `JSON`，控制台无 error/warning。
- 状态：已修复并部署；生产版本 `3f1bc85c-3dd6-40a5-810e-fa9afefda18e`。
