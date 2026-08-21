# Custom Apparel Intake Assistant

## 产品策略、商业化路径与 V0 Customer Reply Loop 实施方案

版本：1.0
日期：2026-08-18
状态：当前权威产品方案
适用范围：V0 产品验证、Paid Pilot、V1/V2 进入条件

---

## 1. 本次决策摘要

产品继续沿着以下方向推进：

> Turn messy customer enquiries into quote-ready jobs.

核心业务结果不是“AI 能提取字段”，而是：

> 用尽可能少的澄清轮次，把每一条客户询价推进到可报价状态。

产品路线仍然采用 V0 → V1 → V2，但进入条件调整如下：

1. **V0 — Copy/Paste Intake Assistant**：验证店铺是否会反复使用、是否减少人工整理与澄清、是否愿意支付 $39/月。
2. **V1 — Email-native Intake Assistant**：只有付费留存成立后，才通过邮件转发去掉 Copy/Paste。
3. **V2 — Adaptive Customer Intake**：只有真实付费用户主动要求网站直连，并且 V1 已验证减少沟通轮次后，才从源头改善客户提交。

当前最高优先级不是 Calculator、SEO 或 Gmail OAuth，而是：

> **V0 Customer Reply Loop：把客户后续回复合并回同一个临时 Job，并重新判断 Quote Readiness。**

这是产品第一次能够真正测量：

- Clarification Rounds
- Staff Handling Time
- Time to Quote-ready
- 一次集中追问是否解决了大部分缺失字段

---

## 2. 产品边界

### 2.1 产品是什么

面向 Custom Apparel / Screen Printing Shops 的 Quote Intake Assistant。

它位于：

```text
Customer enquiry
        ↓
Understand / verify / clarify / structure
        ↓
Quote preparation
```

负责：

- 理解客户原始询价
- 提取结构化 Job 信息
- 保存并验证 Evidence
- 识别缺失、模糊和冲突
- 生成集中式 Clarification
- 合并客户后续回复
- 判断 Quote Readiness
- 输出 Quote-ready Job Spec

### 2.2 产品不是什么

当前不做：

- AI Quote Generator
- 自动定价
- ERP / CRM / Shop Management Software
- Production Scheduling
- Inventory / Supplier Catalog
- Artwork Preflight
- Invoice / Payment / Tax
- 自动对客户发送消息

### 2.3 人机责任边界

AI 负责：理解、候选提取、语义合并建议。

确定性规则负责：

- Evidence 是否存在
- 字段是否足够
- Missing Priority
- Quote Readiness
- 哪些字段可以进入后续 Calculator

店员负责：

- Accept
- Edit
- Remove
- Resolve Conflict
- 批准对外回复
- 最终报价

### 2.4 V0 支持的订单形态

V0 不是只支持 T-shirt，而是支持单一主产品的 Custom Apparel 询盘，包括：

- T-shirt / tee
- Polo
- Hoodie / sweatshirt
- Jacket
- Jersey
- Hat / cap
- Tote bag
- 客户自带服装的印花或刺绣询盘

当前最可靠的装饰方式是 Screen Printing 与 Embroidery；DTG、DTF、Heat Transfer、Sublimation 可以识别，但专属成本字段尚不完整。

V0 的明确限制：

- 一个 Job 只有一套 quantity、style、color、size breakdown 等标量字段，因此不可靠支持同一询盘中的多产品行项目，例如“120 件 T-shirt + 25 件 Hoodie”。
- 不以 Mug、Sticker、Banner、Signage 等非服装 Promotional Products 为首要场景；这些品类需要不同字段和 Quote Readiness 规则。
- 不处理真实附件内容，不执行 Artwork Preflight。
- 不校验尺码合计、个性化姓名/号码清单、刺绣针数、每个位置独立墨色或印花尺寸。

因此 V0 的推荐定位为：

> Single-product custom apparel intake, across common garment types and decoration methods.

多品类 Line Items 应作为 V0.5/V1 的独立数据模型升级，而不是依赖 Prompt 强行兼容。

---

## 3. 目标客户与商业定位

### 3.1 第一阶段 ICP

优先寻找：

- Custom apparel / screen printing shop
- 每月处理至少 20–30 条非结构化询价
- 询价主要来自 Email、Contact Form、DM
- 有 Shop Owner、Sales、Customer Service 或 Estimator 负责整理报价需求
- 当前依赖邮箱模板、Excel、Printavo、YoPrint 或手工流程
- 尚未通过固定表单完全标准化客户 Intake

暂不优先：

- 每月只有少量询价的超小店
- 已经强制所有客户填写完整固定表单的店铺
- 主要业务是重复订单、几乎没有新询价的店铺
- 需求核心是 Production、Artwork 或 Inventory，而不是 Intake

### 3.2 市场位置

产品不替代 Printavo 或 YoPrint，而是成为它们之前的 Intake Layer：

> Turn customer emails into verified, quote-ready job specs before they enter Printavo, YoPrint, or a spreadsheet.

当前价格参照：

- [YoPrint Basic](https://www.yoprint.com/pricing) 为 $69/月，已经覆盖 Quotes、Portal、Artwork/Quote Approval 和 Production。
- [Printavo Lite/Standard](https://www.printavo.com/pricing/) 分别为 $109/月和 $244/月，覆盖更完整的 Shop Workflow。
- [Printavo 已提供固定 Inquiry Form](https://support.printavo.com/hc/en-us/articles/115004433553-How-can-we-setup-a-contact-form-that-feeds-into-Printavo)，因此未来 V2 的差异化不能只是“拥有表单”。

由此得出：

- V0 的 $39/shop/month 是合理试点价格。
- V1 是否能提升到 $59–79，取决于是否显著减少人工操作。
- V2 是否能提升到 $99–149，取决于是否提高 Quote-ready completion 和销售转化。
- 早期不按 Seat 收费，以 Shop/Inbox 为价值单位。

---

## 4. 修订后的产品路线

### 4.1 V0 — Copy/Paste Intake Assistant

验证：

- 用户是否处理真实 enquiries
- 是否反复使用
- 是否减少澄清轮次和人工时间
- 是否复制并真实使用 Clarification / Job Spec
- 是否愿意并实际支付 $39/月

V0 必须包含两个闭环：

```text
Initial enquiry
→ Extract
→ Review
→ Clarification
→ Copy

Customer reply
→ Add to same job
→ Merge changes
→ Review
→ Recalculate readiness
→ Next clarification or quote-ready job spec
```

### 4.2 V1 — Email-native Intake Assistant

只有达到 V0 商业 Gate 后开发。

优先顺序：

1. Forwarding address
2. 自动创建 Enquiry
3. 邮件 Thread 与 Job 匹配
4. 自动合并 Customer Reply
5. Human-approved reply
6. 最后才考虑 Gmail / Outlook OAuth

### 4.3 V2 — Adaptive Customer Intake

只有满足以下条件后开发：

- V1 付费留存成立
- 用户主动要求网站直连
- 有足够数据识别最常见缺失字段
- 可以设计固定表单与 Adaptive Intake 的 A/B Test

V2 的核心差异化指标是：

> 以更少的问题，获得更高的首次 Quote-ready completion rate。

### 4.4 当前产品与目标 V0 的差距

| 能力 | 当前状态 | 下一步 |
|---|---|---|
| Initial enquiry extraction | 已实现 | 继续用真实样本校准 |
| Evidence verification / offsets | 已实现 | Reply 必须按各自 Message 验证 |
| Human correction / conflict resolution | 已实现 | 扩展到 Proposed Merge Review |
| Missing-field rule engine | 已实现 | 增加 Quote Readiness 输出 |
| Clarification Draft | 已实现 | 增加 Round History 和剩余问题重算 |
| Job Spec copy | 已实现 | Ready 时突出主 CTA |
| Temporary Active Job | 未实现 | Slice 1 |
| Add Customer Reply | 未实现 | Slice 2 |
| Reply merge history | 未实现 | Slice 2 |
| Clarification rounds / time-to-ready | 未实现 | Slice 3/4 |
| 真实付款闭环 | 未实现 | Slice 4 |

在以上缺口完成前，不把当前产品称为完整 V0，只称为：

> V0 Initial Enquiry Parser。

---

# Part II — V0 Customer Reply Loop 完整方案

## 5. V0 Reply Loop 要验证的假设

### 5.1 核心假设

店员愿意把客户后续回复加入现有 Job，系统能够安全地更新字段，并使一次集中 Clarification 解决大部分 Quote Blockers。

### 5.2 需要证明的结果

产品应当能够回答：

- 一条 Job 需要几轮 Clarification 才能 Quote-ready？
- 第一轮 Clarification 解决了多少 Blockers？
- 店员每轮需要多少人工时间？
- AI Merge 产生了多少 Correction？
- Quote-ready 后，Job Spec 是否被复制并使用？

### 5.3 非目标

V0 Reply Loop 不做：

- 真实 Email Thread 接入
- Customer Identity Resolution
- 自动发送
- Server-side Job History
- Multi-user Collaboration
- Attachment Upload
- 跨设备同步
- 永久保存原始 Enquiry

---

## 6. 完整用户旅程

### 6.1 首次 Enquiry

1. 店员粘贴客户原始询价。
2. 选择 Ballpark Estimate 或 Formal Quote。
3. 系统提取字段、状态和 Evidence。
4. 系统通过代码验证 Evidence。
5. 店员 Accept、Edit、Remove 或 Resolve Conflict。
6. 系统用确定性规则计算 Missing Priority 和 Quote Readiness。
7. 系统生成一次性 Clarification Draft。
8. 店员编辑并复制 Draft。
9. 系统记录 `clarification_copied`，并将 Job 标记为 `Awaiting customer reply`。

### 6.2 Customer Reply

1. Customer 在 Email/DM 中回复。
2. 店员回到当前临时 Job。
3. 点击 `Add customer reply`。
4. 粘贴客户回复原文。
5. 系统解析本次 Reply，但不直接覆盖现有字段。
6. 系统生成 Proposed Changes。
7. 店员逐项 Accept、Edit、Ignore 或 Resolve Conflict。
8. 接受后写入当前 Job。
9. 系统重新计算 Missing Priority 和 Quote Readiness。
10. 如果仍缺字段，生成下一轮 Clarification。
11. 如果已经足够，显示 `Ready to quote` 并突出 Job Spec Copy。

### 6.3 多轮 Reply

Customer Reply 可以重复添加。

每一次都必须：

- 属于同一临时 Job
- 单独保存原始 Reply 文本和 Evidence offsets
- 产生一组 Proposed Changes
- 由店员批准后才更新最终 Job State
- 增加 `clarification_round` 或 `customer_reply_count`

---

## 7. Job 生命周期

```text
Draft
  ↓ Analyze initial enquiry
Needs review
  ↓ Staff reviews fields
Needs clarification
  ↓ Clarification copied
Awaiting customer reply
  ↓ Customer reply added
Reply needs review
  ↓ Proposed changes accepted
Needs clarification ─────────────┐
  ↓                              │
Ready to quote                   │
                                 │
Additional reply added ──────────┘
```

建议状态：

```ts
type JobStatus =
  | "draft"
  | "needs_review"
  | "needs_clarification"
  | "awaiting_customer_reply"
  | "reply_needs_review"
  | "ready_to_quote";
```

状态由产品操作和确定性规则决定，不由 LLM 自由生成。

---

## 8. Quote Readiness 模型

### 8.1 Readiness 状态

```ts
type QuoteReadiness =
  | "not_ready"
  | "ready_for_ballpark"
  | "almost_ready_for_formal"
  | "ready_for_formal";
```

### 8.2 Ballpark Estimate

`ready_for_ballpark` 必须满足：

- 无未解决的关键 Conflict
- Quantity 已 Confirmed 或由店员接受 Approximate
- Garment Type 已知
- 至少知道一个 Decoration Direction，或店员接受“待确认”的估价假设

Size Breakdown 通常属于 Production Later。

### 8.3 Formal Quote

`ready_for_formal` 必须满足：

- 无未解决 Conflict
- 无 Quote Blocker
- Quantity 已 Confirmed 或人工 Accepted
- Garment Type 已知
- Decoration Method 已知
- Print Locations 已知
- 所有会直接改变当前价格的关键字段已知或由店员设置明确假设

### 8.4 Almost Ready

Formal Mode 下：

- 无 Conflict
- 只剩 1 个 Quote Blocker；或
- 无 Quote Blocker，但仍有店员未批准的 Price Affecting 字段

显示 `almost_ready_for_formal`。

### 8.5 Readiness 进度

UI 可以显示解释性进度，但不能伪装成概率：

```text
3 of 4 quote blockers resolved
2 price-affecting details still need review
```

不要显示：

```text
87% confident
```

---

## 9. Reply Merge 规则

### 9.1 总原则

新 Reply 产生的是 Proposed Changes，不是最终字段。

AI 不得直接覆盖店员已经确认的字段。

### 9.2 Merge Action

```ts
type MergeAction =
  | "fill_missing"
  | "confirm_existing"
  | "refine_existing"
  | "replace_existing"
  | "create_conflict"
  | "no_change"
  | "needs_review";
```

### 9.3 规则表

| Existing Field | Reply Value | Proposed Action |
|---|---|---|
| Missing | 明确新值 | Fill missing |
| Approximate 80 | “80 exactly” | Confirm existing → 80 Confirmed |
| Ambiguous front | “left chest” | Refine existing |
| Confirmed 50 | “make it 75” | Replace existing，必须人工批准 |
| Confirmed 50 | Reply 同时出现 50 和 75 | Create conflict |
| Confirmed Black | “Black works” | Confirm existing / No change |
| Accepted value | Reply 有不同值但语义不明确 | Needs Review，禁止自动覆盖 |

### 9.4 Replace Existing

明确修改词包括但不限于：

- actually
- instead
- change to
- make it
- final quantity is
- we decided on
- scratch that

即便检测到这些词，系统仍只生成 Proposed Replacement，由店员批准。

### 9.5 Evidence

每个 Proposed Change 必须保存：

- `source_message_id`
- Exact evidence snippet
- Start character
- End character

Evidence 必须存在于对应 Reply 原文中。

不能使用 Initial Enquiry 的 offsets 验证 Reply Evidence，反之亦然。

### 9.6 Change History

每个字段保留简化历史：

```text
Quantity
Initial: 80 — Approximate
Reply 1: 80 — Confirmed
Accepted by staff
```

历史只保存在当前浏览器 localStorage，不进入 V0 数据库。

---

## 10. 数据结构

### 10.1 Temporary Job

```ts
interface TemporaryJob {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  quoteMode: "ballpark" | "formal";
  status: JobStatus;
  readiness: QuoteReadiness;
  messages: JobMessage[];
  fields: JobField[];
  clarificationRounds: ClarificationRound[];
  metrics: LocalJobMetrics;
}
```

### 10.2 Message

```ts
interface JobMessage {
  id: string;
  type: "initial_enquiry" | "customer_reply";
  sequence: number;
  rawText: string;
  createdAt: string;
}
```

### 10.3 Field History

```ts
interface FieldRevision {
  id: string;
  fieldKey: FieldKey;
  previousValue: string | null;
  proposedValue: string | null;
  finalValue: string | null;
  previousStatus: FieldStatus;
  proposedStatus: FieldStatus;
  action: MergeAction;
  sourceMessageId: string;
  evidence: Evidence | null;
  decision: "pending" | "accepted" | "edited" | "ignored";
  createdAt: string;
}
```

### 10.4 localStorage

建议 Key：

```text
threadline_active_job_v1
threadline_preferences_v1
```

默认只保存一个 Active Job。

由于 Active Job 可能包含客户信息：

- V0 默认在当前设备保存最多 7 天。
- 每次有效 Reply/人工修改可以把过期时间向后延长 7 天。
- 到期后自动清除原文、Reply、Evidence 和 Job Spec。
- Workspace 必须持续显示 `Stored on this device · Clear now`。
- Shared computer 用户应能选择 `Do not persist this job`，此时只使用当前浏览器会话状态。
- 浏览器本地存储不是安全归档，不承诺备份和跨设备恢复。

创建 New Enquiry 时，如果当前 Job 尚未清除：

- 显示 Replace Active Job 提醒
- 提供 Copy Job Spec
- 提供 Clear Current Job

V0 不建设 Job History 列表。

---

## 11. UI 信息架构

### 11.1 Review Workspace 新增区块

当前 Workspace 增加：

1. Job Status / Quote Readiness Banner
2. Message Timeline
3. `Add customer reply` 主按钮
4. Proposed Changes Review
5. Field Change History
6. Clarification Round Summary

### 11.2 Readiness Banner

示例：

```text
Almost ready for a formal quote
3 of 4 quote blockers resolved
Remaining: Back print colors
```

Ready 时：

```text
Ready to quote
All formal quote blockers are resolved.
[Copy job spec]
```

### 11.3 Add Customer Reply

点击后打开 Drawer/Modal：

- 标题：Add customer reply
- 说明：Paste the customer’s latest reply. It will update this job, not create a new one.
- Textarea
- Cancel
- Analyze reply

### 11.4 Proposed Changes

系统分析后显示：

```text
5 proposed updates

Quantity
~80 → 80
Confirm existing
Evidence: “Let’s do 80 exactly.”
[Accept] [Edit] [Ignore]
```

危险变更突出显示：

- Confirmed value 被替换
- Deadline 被替换
- Quantity 被替换
- 新 Conflict

### 11.5 Message Timeline

V0 只显示：

- Initial enquiry
- Customer reply 1
- Customer reply 2
- 每轮 Clarification copied 时间

长文本默认折叠，点击后展开。

---

## 12. Clarification 逻辑更新

Reply Merge 后重新生成 Draft。

排序仍为：

1. Conflicts
2. Quote Blockers
3. Price Affecting
4. Optional 不主动询问

新增规则：

- 不再询问刚被 Reply 明确解决的字段。
- 如果 Customer 表示 “not sure”，可以提供有限选项或允许店铺使用报价假设。
- 如果一轮 Reply 只解决部分问题，下一轮只问剩余问题。
- 已由店员 Ignore 的问题，不自动重新加入，除非对应字段重新成为 Quote Blocker。
- 合并同义问题，禁止重复。

每次生成 Draft 时保存：

- Round number
- Generated questions
- Final edited draft
- Copy timestamp
- 当时的 blocker 数量

---

## 13. Analytics 与隐私

### 13.1 可以写入 D1

- Anonymous session ID
- Anonymous temporary job ID
- Event name
- Quote mode
- Message sequence number
- Input length
- Extracted/proposed field count
- Accepted/corrected/ignored count
- Blocker count before/after
- Readiness before/after
- Handling duration
- Clarification round count

### 13.2 不写入 D1

- 原始 Enquiry
- Customer Reply 原文
- Email、姓名、电话、公司名称
- Extracted values
- Evidence snippets
- Clarification Draft
- Job Spec

### 13.3 新增事件

```text
active_job_created
active_job_restored
customer_reply_opened
customer_reply_added
reply_analysis_completed
reply_analysis_failed
merge_change_accepted
merge_change_edited
merge_change_ignored
confirmed_field_replacement_approved
quote_readiness_changed
ready_for_ballpark_reached
ready_for_formal_reached
clarification_round_started
clarification_round_copied
active_job_cleared
```

### 13.4 核心漏斗

```text
Initial enquiry processed
→ Clarification copied
→ Customer reply added
→ Proposed changes reviewed
→ Quote-ready reached
→ Job spec copied
```

---

## 14. V0 成功指标

### 14.1 产品质量

- Quantity / Deadline / Conflict 的 silent false-confirmation < 1–2%
- Critical field 人工 correction rate 持续下降
- Evidence mismatch 必须全部进入 Needs Review
- Confirmed 字段不得被 Reply 自动覆盖

### 14.2 Workflow Value

- Median staff handling time 下降 ≥ 40%，或每条至少节省 7 分钟
- Average clarification rounds 下降 ≥ 25%
- 第一轮 Clarification 解决 ≥ 60% Quote Blockers
- Clarification Copy Rate ≥ 50%
- Job Spec Copy Rate ≥ 50%
- Merge proposed changes 的 Accept Rate 足够高，且不需要普遍重写

以上为试点假设阈值，应根据真实基线调整，但不能事后取消评价标准。

### 14.3 商业验证

#### V0 继续信号

- 10–15 家 Qualified Shops
- 50–100 条真实或匿名历史 Enquiries
- 至少 5 家在 14 天内处理 ≥3 条
- 至少 3 家接受 $39/月
- 至少 2 家实际付款

达到后继续 Paid Pilot，不立即扩张为完整 SaaS。

#### 进入 V1 Gate

- 至少 5 家实际付费
- 至少 4 家连续使用或付费 4 周
- Time Reduction / Clarification Reduction 达标
- 至少 3 家付费高频用户明确表示 Copy/Paste 是主要阻力
- 至少 2 家愿意设置 Email Forwarding

两家付款只是“继续信号”，不是“立即开发 V1”的充分条件。

---

## 15. Paid Pilot 方案

### 15.1 Offer

```text
Early Shop Plan
$39 / shop / month
```

试点包含：

- Enquiry Analysis
- Customer Reply Loop
- Quote Readiness
- Clarification Draft
- Job Spec Export
- Founder-led onboarding
- 优先反馈通道

不要使用永久 Free Plan。

### 15.2 收款

第一阶段使用：

- Stripe Payment Link
- Manual Invoice
- 手工 Subscription

不开发完整 Billing Portal。

### 15.3 ROI 访谈

每家 Pilot Shop 记录：

- 每月 Enquiry 数量
- 当前每条处理时间
- 当前平均 Clarification Rounds
- 估算员工小时成本
- 使用产品后的同类指标
- 是否会在 Founder Support 取消后继续付款

---

## 16. 实施顺序

### Slice 1 — Temporary Job Foundation

完成：

- TemporaryJob 数据结构
- localStorage Active Job
- Restore / Clear
- Message Timeline
- Job Status

验收：页面刷新后 Active Job 和人工修改仍存在；D1 中没有原文。

### Slice 2 — Reply Analysis and Proposed Merge

完成：

- Add Customer Reply UI
- Reply Structured Output Schema
- Evidence verification by message
- Merge Action classification
- Proposed Changes Review
- Accept / Edit / Ignore
- Critical replacement warning

验收：新 Reply 不会未经批准覆盖现有 Confirmed 字段。

### Slice 3 — Readiness and Clarification Rounds

完成：

- Readiness rule engine
- Readiness Banner
- Blocker before/after
- Clarification Round history
- 下一轮只询问剩余字段
- Ready-to-quote state

验收：解决最后一个 Blocker 后，状态稳定切换为 Ready，Draft 不再询问已解决字段。

### Slice 4 — Measurement and Paid Pilot

完成：

- Reply Loop analytics
- Handling timer
- Pilot CTA 的真实 Payment Link/Lead Capture
- Founder Pilot 操作手册
- 试点数据导出报表，只导出匿名指标

验收：能够从事件中重建每条匿名 Job 的漏斗和 Clarification Rounds。

---

## 17. 关键测试场景

### 场景 A — Approximate → Confirmed

Initial：`about 80 shirts`
Reply：`Let’s do 80 exactly.`

期望：

- Proposed Action = Confirm Existing
- Quantity = 80 Confirmed
- Reply Evidence 可验证
- Quantity 问题从下一轮 Draft 中移除

### 场景 B — Confirmed Value 被修改

Initial：`We need 50 shirts.`
Reply：`Actually, make it 75.`

期望：

- Proposed Action = Replace Existing
- 高风险警告
- 必须人工批准
- 批准前最终 Job 仍为 50

### 场景 C — 新冲突

Reply：`We may need 50, but the organizer said 75.`

期望：

- Conflicting
- 两个 Candidate 和 Evidence
- 不自动选择
- Readiness 降为 Not Ready

### 场景 D — Partial Reply

Customer 只回答 4 个问题中的 2 个。

期望：

- 只更新 2 个字段
- 下一轮只询问剩余问题
- Clarification Round +1

### 场景 E — “Not sure”

Reply：`I’m not sure how many colors are in the logo.`

期望：

- 不伪造颜色数
- Needs Review 或明确 Unknown
- Price Affecting 保留
- 可提示店员使用估价假设

### 场景 F — Evidence Mismatch

模型返回的 Reply Evidence 不在 Reply 中。

期望：

- Proposed Change → Needs Review
- 无法直接 Accept 为 Confirmed
- 记录 evidence verification failure

### 场景 G — Refresh Recovery

店员添加 Reply、修改字段后刷新页面。

期望：

- Active Job 恢复
- Message/Revision history 保留
- Readiness 不变化

---

## 18. 明确推迟的事项

在 V0 Reply Loop 和 Paid Retention 成立前，不优先开发：

- Calculator Bridge
- SEO 内容矩阵
- Gmail OAuth
- Outlook OAuth
- Multi-user Roles
- Server-side Job History
- Printavo / YoPrint 深度 API Integration
- Attachment Upload / R2
- Adaptive Hosted Form
- 完整 SaaS Billing

Calculator 可以保留为后续实验，但不能抢占 Reply Loop。

---

## 19. 最终 GO / WATCH / SKIP 判定

### GO

- Reply Loop 被反复使用
- Clarification Rounds 和 Handling Time 明显下降
- 高风险字段没有系统性静默错误
- 至少 5 家付费，4 家保持 4 周使用
- 付费用户明确要求去掉 Copy/Paste

进入 Forwarding-based V1。

### WATCH

- Parser 准确，但 Reply Loop 使用低
- 用户只复制 Clarification，不使用 Job Spec
- 用户喜欢产品，但每月 Enquiry 太少
- 价值集中在少数复杂订单
- 用户更需要 Calculator 或 Artwork Workflow

继续缩小 ICP 或调整 Packaging。

### SKIP / PIVOT

- Merge Review 比人工重新阅读更耗时
- Clarification 没有减少轮次
- 用户不愿加入真实 Reply
- 关键字段持续出现 silent false-confirmation
- 付费只来自 Founder Support，而不是产品本身
- 产品必须变成完整 ERP 才有持续价值

---

## 20. 当前唯一优先级

在下一次产品 Gate 前，开发优先级固定为：

```text
Temporary Job
→ Add Customer Reply
→ Proposed Merge Review
→ Quote Readiness
→ Clarification Round Measurement
→ Real Paid Pilot
→ V1 Email Forwarding
```

最终判断标准：

> 如果一条真实 Enquiry 经过一次集中追问就更快达到 Quote-ready，而且店员愿意每月支付 $39 来持续获得这个结果，产品成立。
