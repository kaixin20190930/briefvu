# Briefvu V0 Customer Reply Loop 完整测试方案

## 1. 当前测试基线

| 项目 | 当前状态 | 验证方式 |
|---|---|---|
| 生产 Worker | 已部署 | 首页 HTTP 200 |
| 生产地址 | `https://briefvu.com` | 浏览器与 API 冒烟测试 |
| D1 数据库 | 已创建并绑定，区域 APAC | 远程 SQL 查询 |
| 数据库迁移 | `0001_events.sql`、`0002_pilot_and_rate_limits.sql` 已应用 | migrations 状态与表查询 |
| `OPENAI_MODEL` | `gpt-5-mini` | Worker 绑定清单 |
| `OPENAI_API_KEY` | 已配置为 Worker Secret | Secret 清单仅显示名称，不回显值 |
| 当前分析器 | OpenAI Responses API | `/api/analyze` 返回 `source: openai` |

本地移除 OpenAI Key 时仍可使用确定性 demo parser 做快速回归；生产环境应执行第 9 节的 OpenAI 验收。

## 2. 测试目标与发布门槛

V0 的目标不是自动报价，而是验证以下闭环可靠：

1. 原始询盘能转换为有证据的结构化 Job。
2. 系统不会把推测伪装成确定事实。
3. 客户回复只生成候选变更，不会静默覆盖现有字段。
4. 用户逐项 Accept、Edit 或 Ignore 后才会写入 Job。
5. Quote Readiness、剩余问题和 Job Spec 随变更同步更新。
6. 刷新后仍能恢复 Active Job，清除后不会残留客户内容。
7. D1 只保存匿名流程事件，不保存邮件正文、字段值或证据片段。

发布门槛：所有 P0 用例通过；P1 通过率至少 95%；不存在原始客户内容写入 D1、未审批覆盖字段、刷新丢失 Job 或就绪度错误。

## 3. 测试环境矩阵

| 环境 | 分析来源 | 用途 |
|---|---|---|
| 本地，无 Key | `demo` | 快速回归和确定性测试 |
| 生产，无 Key | `demo` | UI、D1 和部署冒烟测试 |
| 本地，有 Key | `openai` | Prompt、Structured Output、证据验证 |
| 生产，有 Key | `openai` | 最终发布验收 |

浏览器至少覆盖：Chrome 最新桌面版、Safari 最新桌面版、iPhone 390×844、Android 412×915。桌面断点建议测试 1440×900 和 1024×768。

## 4. P0 核心功能用例

### P0-01 创建 Formal Quote Job

- 输入一封包含数量、服装类型、颜色、印花位置、颜色数和截止日期的询盘。
- 选择 Formal quote，点击 Build job spec。
- 预期：创建 Active Job；每个已提取值带原文证据；缺失项按 Quote Blocker、Price Affecting、Production Later 或 Optional 分类。

### P0-02 冲突不得自动解决

- 输入同时包含“around 50”和“probably 75”的邮件。
- 预期：Quantity 为 Conflicting，显示两个候选及各自证据；报价状态为 Not ready；未选择候选前 Job Spec 不应出现最终数量。

### P0-03 Approximate 与 Confirmed 区分

- 输入“around 40 shirts”。
- 预期：Quantity 为 Approximate，而不是 Confirmed；证据必须是原文连续片段。

### P0-04 手工审批初始字段

- 分别执行 Accept、Edit、Remove 和冲突候选选择。
- 预期：字段状态、Job Spec、Still needed 和 Quote Readiness 同步更新；Edit 后不能继续展示旧值为当前值。

### P0-05 生成追问

- 在存在阻塞项时复制 Clarification draft。
- 预期：只询问当前仍缺失或冲突的必要内容；记录一个 clarification round；不重复询问已确认字段。

### P0-06 添加客户回复

- 打开 Add customer reply，粘贴对应回复并分析。
- 预期：原 Job 在审批前完全不变；弹窗展示 Before、Proposed、证据和变更类型。

### P0-07 强制逐项决策

- 让某一候选变更保持未选择状态。
- 预期：Apply reviewed changes 按钮不可用。
- 对所有变更选择 Accept、Edit 或 Ignore。
- 预期：按钮启用，应用后生成 Customer reply 时间线记录。

### P0-08 保护已确认字段

- 初始 Job 中确认 deadline，再在回复中提供不同 deadline。
- 预期：显示 Replace confirmed value；审批前不覆盖；Ignore 保留旧值；Accept 或 Edit 后才产生修订记录。

### P0-09 合并后重新计算

- 用回复解决数量冲突并补齐品牌、款号。
- 预期：阻塞项减少；Quote Readiness 正确升级；追问草稿删除已解决问题；证据来源标记为 Customer reply N。

### P0-10 Active Job 持久化

- 勾选保存 7 天，创建 Job、添加回复后刷新页面和重新打开标签页。
- 预期：Job、消息、字段修订、就绪度和追问轮次完整恢复。
- 不勾选保存时，预期只在当前浏览器会话恢复。

### P0-11 清除 Job

- 点击 Clear job 并取消确认。
- 预期：数据保留。
- 再次点击并确认。
- 预期：本地 Job、消息和客户原文清除，页面回到初始状态。

### P0-12 匿名分析写入

- 完成一次分析、一次回复合并和一次追问复制。
- 远程查询 `analytics_events`。
- 预期：仅有 session ID、事件名、小型计数元数据和时间；不得出现邮件正文、客户姓名、字段值、证据、追问全文或 Job Spec。

## 5. P1 边界与异常用例

| 编号 | 场景 | 预期 |
|---|---|---|
| P1-01 | 少于 10 个字符 | API 400，界面给出可理解错误 |
| P1-02 | 超过 20,000 字符 | 客户端或 API 拒绝 |
| P1-03 | Content-Length 超过 30,000 | API 413 |
| P1-04 | 空白回复 | Review 按钮禁用 |
| P1-05 | 回复不包含任何新信息 | 显示无有效变更，不修改 Job |
| P1-06 | 回复重复相同确定值 | 归类为 Confirm existing 或 No change，不制造冲突 |
| P1-07 | 回复含近似新值 | 不应无条件覆盖确定值 |
| P1-08 | 回复同时给两个不同数量 | 字段保持 Conflicting |
| P1-09 | 网络中断或分析 API 502 | 保留输入内容，可重试，不破坏 Active Job |
| P1-10 | 非允许事件名 | `/api/events` 返回 400 |
| P1-11 | D1 临时不可用 | 主流程仍返回成功，分析功能不应被埋点拖垮 |
| P1-12 | 本地数据超过 7 天 | 自动过期并清除 |
| P1-13 | 两个标签页先后修改 | 刷新后读取最后一次完整保存，不产生半写入状态 |
| P1-14 | 特殊字符、emoji、中文客户备注 | 页面不崩溃，不产生脚本执行或乱码 |

## 6. UI、可访问性与响应式检查

- 全流程仅用键盘可完成，焦点顺序与视觉顺序一致。
- Reply dialog 打开后焦点进入弹窗，关闭后回到触发按钮。
- 所有可点击图标有可访问名称。
- Confirmed、Conflicting、Missing 等状态不能只依赖颜色表达。
- 390px 宽度下无水平滚动；候选变更卡、时间线和按钮不被裁切。
- 200% 浏览器缩放时仍能完成审批。
- Loading 状态阻止重复提交；错误信息可被辅助技术读取。

## 7. 性能与稳定性目标

- 首页静态资源在普通宽带下应快速可交互，无明显布局跳动。
- demo parser 分析响应目标小于 1 秒。
- OpenAI 分析建议记录 P50、P95，V0 验收目标可先设为 P95 小于 15 秒。
- 连续执行 20 次分析和 20 次回复合并，不出现状态串单、内存异常或 Job 丢失。
- 对同一输入重复 10 次：demo parser 结果必须完全一致；OpenAI 模式的字段状态和证据约束必须一致，允许非关键顺序差异。

## 8. 隐私与安全专项

1. 检查浏览器 Network：原始询盘只发送到 `/api/analyze`，不发送给 `/api/events`。
2. 检查 D1：搜索 Mock 邮件中的唯一短语，结果必须为 0。
3. 检查日志：不得记录请求正文、API Key、结构化字段值或证据。
4. 检查前端 bundle：不得出现 `OPENAI_API_KEY`。
5. 验证 OpenAI 请求使用 `store: false`。
6. 输入 `<script>alert(1)</script>`、HTML 和 Markdown 链接，页面只能作为文本展示。
7. API Key 只能存在于 `.env.local` 和 Worker Secret，不能写入 Git、`wrangler.jsonc` 或客户端环境变量。
8. `RATE_LIMIT_SALT` 只能存在于 `.env.local` 和 Worker Secret；`api_rate_limits` 只能保存 salted hash，不能保存原始 IP。
9. Pilot 申请必须明确勾选联系许可；分析正文和 Pilot 联系信息必须分表、分用途保存。

## 9. OpenAI Key 配置后的专项验收

配置 Secret 后，每封 Mock 邮件至少运行三次：

- `/api/analyze` 必须返回 `source: openai`。
- 返回字段必须完整覆盖 schema 中的所有字段，不能缺 key 或增加未知 key。
- 每个 evidence snippet 必须能在输入原文中逐字找到；不匹配证据应被降级处理并产生 warning。
- Missing 和 Not Applicable 不得带伪造证据。
- “attached logo”不能被当成系统真的收到了文件；`file_received` 必须保持 Needs Review/Unknown。
- API 认证失败、限流或超时时返回 502 且不回退为看似成功的 AI 结果。
- 在 OpenAI 控制台核对所用项目、模型和用量预算，确认没有使用个人长期密钥作为客户端变量。

## 10. Mock 邮件与客户回复

以下全部为虚构内容，可直接用于测试，不含真实个人信息。

### M01 学校筹款活动：数量冲突

**初始邮件**

> Subject: Fall fundraiser shirts
> Hi, we are planning around 50 black T-shirts for our fall fundraiser. After speaking with the teachers, we may actually need 75. We want a small school logo on the front and a larger two-color design on the back. Screen printing is fine. I attached the logo, although I am not sure whether the file is print-ready. We need everything by October 10 and can pick it up.

**客户回复**

> Please make it 75 exactly. Gildan 5000 is fine. Keep both the front logo and back design. The event moved to October 15.

重点：数量冲突、附件声明、已确认 deadline 替换、品牌与款号补齐。

### M02 餐饮连锁：员工制服

**初始邮件**

> Subject: New staff polos for three locations
> We need 36 navy polo shirts for our restaurant team, probably 12 per location. Please embroider our white logo on the left chest. Sizes should be 6 S, 14 M, 10 L, 4 XL, and 2 XXL. We would like delivery to our downtown office before November 3. We do not have a preferred polo brand yet.

**客户回复**

> Port Authority K500 works for us. Please change the total to 40 and add four more large shirts. Ship all cartons to the downtown office; we will distribute them ourselves.

重点：精确数量、尺码合计、刺绣、已确认数量替换、配送说明。

### M03 建筑公司：高可视安全服

**初始邮件**

> Subject: Hi-vis crew shirts
> Could you quote about 80 safety-orange long-sleeve shirts? We need our company name in black on the left chest and a large phone number on the back. These are for field crews, so we would prefer a moisture-wicking style. No brand selected. We hope to have them by September 28, but October 2 could also work.

**客户回复**

> Final quantity is 84. Use CornerStone CS401LS if available. October 2 is the confirmed in-hand date. There are two separate designs: the chest logo and the back phone graphic.

重点：近似数量、双日期歧义、款号、设计数量。

### M04 非营利组织：慈善跑步活动

**初始邮件**

> Subject: Charity 5K participant shirts
> We are expecting between 180 and 220 participants and need teal performance tees. The artwork is one three-color design printed on the front. Adult and youth sizes are required, but registration is still open. Our race is May 18, so we would need the shirts a few days earlier. Can you give us a ballpark estimate first?

**客户回复**

> Please estimate using 200 shirts for now. Assume 160 adult and 40 youth. We only need a ballpark today; the final size breakdown will come next Friday.

重点：Ballpark 模式、范围数量、临时假设与生产阶段信息分离。

### M05 健身工作室：零售周边

**初始邮件**

> Subject: Studio anniversary tanks
> We want 60 women's black tank tops for our anniversary sale. Please print our gold logo on the front center. It is a single design, but the gold may need to be simulated with ink. Sizes are 10 XS, 20 S, 20 M, and 10 L. We can collect them from your shop. Our launch party is August 30.

**客户回复**

> Bella+Canvas 6008 is our preferred tank. Please use a standard mustard-yellow ink instead of metallic gold. The quantity and sizes are confirmed.

重点：品牌款号、颜色语义修正、重复确认相同值。

### M06 科技会议：多品类需求

**初始邮件**

> Subject: Developer conference swag quote
> We need 120 charcoal T-shirts and maybe 25 zip hoodies for speakers. Both items use the same one-color white artwork on the left chest. The shirts may also have a sponsor list on the back, but that is not approved yet. Delivery is needed at the convention center by February 6.

**客户回复**

> Remove the hoodies from this quote. Please quote 120 shirts only. The sponsor back print is approved, so include front and back printing. We will send the final sponsor artwork tomorrow.

重点：V0 对多品类输入的限制、范围删除、待定位置转为确认、文件仍需人工检查。

### M07 青少年足球队：球衣号码

**初始邮件**

> Subject: Youth team practice jerseys
> I need 24 red performance shirts for our youth soccer team. The club crest goes on the front and each player needs a different white number on the back. Sizes are not final. We would like them before the first practice on March 12. Parents will pick everything up together.

**客户回复**

> The final count is 26. We have 26 unique back numbers, plus the same crest on every front. I attached a spreadsheet with sizes and numbers. March 8 is our preferred pickup date.

重点：个性化数据、设计/版本计数、附件不能自动视为已读取。

### M08 医疗诊所：专业制服

**初始邮件**

> Subject: Clinic scrub jacket embroidery
> Please quote 18 gray scrub jackets with our clinic logo embroidered on the left chest. We may want employee first names under the logo, but management has not decided. We need 3 S, 6 M, 5 L, 3 XL, and 1 XXL. Delivery to the clinic by January 20 would be ideal.

**客户回复**

> Do not add employee names. Use Cherokee WW320 jackets in pewter. The quantity and size breakdown remain unchanged. January 20 is confirmed.

重点：明确否定可选项、品牌款号、已确认值不应被重复回复制造冲突。

## 11. 推荐执行顺序

1. 每次提交前运行单元测试、Lint、TypeScript 和生产构建。
2. 用 M01 完成一次桌面端全闭环。
3. 用 M04 测 Ballpark 模式。
4. 用 M02、M03、M05、M08 做字段和合并规则回归。
5. 用 M06 验证当前多品类边界是否表达清楚。
6. 用 M07 验证附件和个性化数据不会被错误确认。
7. 完成移动端、键盘、缩放和异常网络测试。
8. 查询 D1 做隐私审计。
9. 配置 OpenAI Key 后重复所有 P0，并执行第 9 节。

## 12. 测试记录模板

| 字段 | 内容 |
|---|---|
| Test ID | 例如 P0-08 |
| 环境与版本 | local/production，Version ID |
| 浏览器与尺寸 | 例如 Chrome，390×844 |
| 输入样本 | 例如 M03 |
| 前置条件 | Quote mode、已有字段状态 |
| 实际结果 | 简明描述 |
| 预期结果 | 对照本方案 |
| 证据 | 截图、API 响应摘要、D1 查询摘要 |
| 结论 | Pass / Fail / Blocked |
| 缺陷等级 | P0 / P1 / P2 |

## 13. Paid Pilot 申请闭环专项

| 编号 | 场景 | 预期 |
|---|---|---|
| PP-01 | 完成一次分析后点击 `Apply for the paid pilot` | 弹出申请表，焦点进入 Shop name；记录 started 事件 |
| PP-02 | 缺少必填字段或未勾选 consent | 浏览器阻止提交，API 直接调用返回 400 |
| PP-03 | 合法申请 | API 返回 201；页面显示 Application received；D1 新增一条 lead |
| PP-04 | 同一 email 再次提交 | 更新原记录，不新增重复 lead |
| PP-05 | honeypot 字段被填写 | API 返回 202，但 D1 不写入 lead |
| PP-06 | 请求体超过 8KB | API 返回 413 |
| PP-07 | 同一网络一小时超过 5 次 | API 返回 429 和 `Retry-After`，不得影响已有数据 |
| PP-08 | D1 不可用 | API 返回 503，前端保留表单内容并显示可重试错误 |
| PP-09 | 390×844 和键盘操作 | 无水平滚动，所有字段、许可和提交按钮均可访问 |

生产验收使用 `pilot-smoke-YYYYMMDD@example.com` 一类明显的虚构地址。查询时只检查列名、状态、去重结果；不要在日志中打印 notes 或真实用户信息。

## 14. API 防滥用与超时专项

- `/api/analyze`：每个 salted network hash 每 15 分钟最多 30 次。
- `/api/pilot`：每个 salted network hash 每小时最多 5 次。
- OpenAI 上游 30 秒未返回时，API 返回 504；上游限流映射为 503 并提供 `Retry-After`。
- 分析响应包含 `X-Request-Id`，日志只记录 request ID、状态与错误分类，不记录询盘正文。
- 不在生产人工连续触发 31 次 OpenAI 请求；通过代码审查、D1 行结构和单元/集成测试验证阈值，避免制造无意义成本或锁定真实测试网络。
