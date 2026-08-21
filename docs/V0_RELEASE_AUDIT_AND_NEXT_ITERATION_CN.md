# Briefvu V0 阶段 7：发布审查与下一轮迭代

审查日期：2026-08-21
产品范围：V0 Customer Reply Loop、Scenario Registry v2、SEO Foundation v1
当前结论：**Controlled Desktop Pilot Go；Public Self-serve No-Go**

## 1. 决策摘要

Briefvu 的核心报价安全闭环已经达到受控试点标准：单产品询价可提取、证据可追溯、冲突不会自动解决、客户回复不会静默覆盖、超出能力范围的订单会被阻断，未就绪 Job 不会伪装成 quote-ready 导出。

历史 D1 隐私审计和 Pilot Application 生产闭环已于 2026-08-20 通过，允许邀请 1–3 家店铺参加受控 Desktop Pilot。但当前不能宣称已经完成公开、自助式商业上线。剩余缺口主要不在解析算法，而在浏览器/移动端/键盘验收、性能基线、生产告警和实际付款闭环。

因此发布决策分为三层：

| 发布层级 | 决策 | 允许范围 |
| --- | --- | --- |
| 内部与创始人演示 | Go | 可持续使用生产站点和 24 个测试场景 |
| 1–3 家受控 Desktop Pilot | Go | Gate A/B 已通过；可在人工陪跑、Desktop 优先和低流量条件下邀请 |
| 公开自助注册与规模获客 | No-Go | 必须先完成浏览器、移动端、无障碍、稳定性、运营和付款闭环 |

## 2. 已通过的核心门槛

### 2.1 报价安全

- Scenario Registry 共 24 个场景：17 supported、4 partial、3 unsupported。
- M01–M24 已分批完成真实 OpenAI 生产评测；supported 场景满足字段契约，partial/unsupported 场景正确进入 capability blocker。
- Quantity、deadline、print colors 等冲突保留候选值和逐字证据，不自动选择。
- Missing / Not Applicable 哨兵值被强制清空；File received 始终保持 Unknown / Needs Review。
- 多产品、个性化 roster、设计—颜色矩阵不会被压成单一可报价 Job。

### 2.2 Customer Reply Loop

- 客户回复先生成 Proposed Changes，审批前不修改 Job。
- Replace confirmed value 必须 Accept/Edit 后才更新；Ignore 保留旧值。
- 合并后重新计算 blockers、readiness、clarification 和 Job spec。
- M20 生产 UI 已验证 screen printing → DTF 的安全替换和 revision evidence。

### 2.3 Clarification 与导出

- 个性化场景会要求单独 roster；多产品场景只询问拆 Job 或人工处理，不诱导客户二选一。
- 只有真正 ready 且没有 capability issue 的订单输出 `QUOTE-READY JOB SPEC`。
- 其他订单输出 Draft；多产品订单明确输出 `MANUAL REVIEW REQUIRED`。
- Copy draft 和 JSON 均保留 readiness、capability issue、冲突候选和证据；Unknown 不进入 Resolved details。

### 2.4 SEO 与生产基础

- 自定义域名、canonical、robots、sitemap 和 GSC 已完成。
- 3 个 supported 场景已发布；10 个 candidate 保持未公开，partial/unsupported 只能 internal。
- 主域、robots、sitemap 当前均返回 200；www 与 workers.dev 保持 canonical 重定向。
- HTML 使用 `public, max-age=0, must-revalidate`，避免旧 bundle 长期滞留。

### 2.5 当前自动化基线

- 全量本地：80/80 通过；5 个付费生产调用测试默认跳过。
- Scenario Registry：32/32 通过。
- SEO Foundation：4/4 通过。
- ESLint：通过。
- Production build：通过；仍有 Next.js middleware deprecation 非阻断警告。

## 3. 阶段 7 新发现并修复的问题

### Analytics metadata 存储边界

原 `/api/events` 仅限制事件名，仍允许任意 metadata 字符串写入 D1。虽然正常前端没有发送询价正文，但服务端无法阻止错误或恶意客户端写入客户内容，因此不满足隐私承诺。

整改后：

- 每个事件拥有独立 metadata key allowlist。
- 只保存计数、耗时、模式、字段 key、merge action 等预定义值。
- 任意字符串、询价正文、证据、email 和未知 key 全部丢弃。
- sessionId 必须是浏览器生成的 UUID。
- 新增 4 个隐私单元测试。
- 修复已部署到生产版本 `f0efda72-ae6e-4710-8f82-34da91a7ec2c`。

## 4. 尚未通过或缺少真实证据的门槛

| 项目 | 状态 | 风险 | 发布影响 |
| --- | --- | --- | --- |
| 历史 D1 内容扫描 | 通过 | 70 条历史/测试事件中，询价短语、email、subject 和恶意 probe 匹配均为 0；仅有 2 条合法的 `evidence_warnings` 计数键 | 已解除 Pilot 阻断 |
| Pilot 表单远程写入/去重 | 通过 | 缺 consent=400、honeypot=202、首次写入=201、同 email 更新=201；D1 始终只有一条并更新字段与 `updated_at` | 已解除 Pilot 阻断 |
| Chrome/Safari Desktop 全闭环 | 部分 | in-app browser 与 Safari 核心闭环通过；独立 Chrome 因官方扩展对当前账号/地区不可下载而阻塞 | Chrome 扩展可用后补测 |
| 390×844 / 412×915 | 通过 | 两组视口均无页面级横向溢出；弹窗完整可操作 | 继续纳入每次 UI 发布回归 |
| 键盘、焦点、200% 缩放 | 通过 | 弹窗焦点锁定、Esc 和焦点返回通过；640×360 等效视口与 Safari 真实 200% 缩放均通过 | 纳入每次 UI 发布回归 |
| P50/P95 与连续 20 次稳定性 | 部分 | 首页 20/20 HTTP 200；TTFB P50≈0.826s、P95≈1.332s；尚缺 CWV 与 OpenAI 调用长期基线 | Pilot 期间采集 |
| 生产告警与错误预算 | Monitoring v1 已建立 | analyze/events/pilot 已记录脱敏状态、耗时和 outcome；D1 支持 1–168 小时报告；P0/P1 阈值和退出码已建立；Codex 每日 09:00/18:00 自动检查，外部 Slack/Email 待流量稳定后接入 | Pilot 期间观察告警与样本量 |
| 实际付款与订阅管理 | 未实现 | 当前只是 $39 paid-pilot application，不会收款 | 商业转化前完成人工收款或 Stripe |

## 5. 首批外部 Pilot 的两个 P0 手工门槛（已通过）

### Gate A — D1 隐私审计

已通过。生产 API 接受合法 UUID，并将带有 `enquiry`、`evidence`、`email` 的恶意 metadata 清洗为 `{"input_length":129,"quote_mode":"formal","source":"openai"}`；非 UUID sessionId 返回 400。D1 精确扫描结果：probe、fundraiser、tote、email、subject 匹配数均为 0。

### Gate B — Pilot Application 生产闭环

已通过。使用 `briefvu-release-audit+20260820@example.com` 验证缺 consent=400、honeypot=202、首次写入=201、重复 email 更新=201；D1 只有一条 lead，更新后的 shop、weekly enquiries、workflow 和 `updated_at` 均正确。验收后已按精确 email 与测试 shop name 删除该合成记录，并确认剩余测试 lead 为 0；未触及真实申请。

Gate A/B 均已完成，当前允许邀请 1–3 家店铺参加受控 Desktop Pilot。

## 6. 下一轮产品迭代优先级

### P0 — 现在完成

1. 完成 Chrome/Safari Desktop 与键盘基本闭环。
2. 完成 390×844 / 412×915 的移动端关键流程验收。
3. ~~为生产错误率、429/502、P95 latency 建立最小监控表。~~ 已于 2026-08-21 完成 Monitoring v1。

### P1 — Pilot 前两周

1. 增加 Scenario Eval 结果 JSONL 归档，跟踪模型漂移、字段通过率和延迟。
2. 增加浏览器 E2E：创建 Job、Resolve Conflict、Add Reply、Accept/Ignore、刷新恢复、Clear Job、Copy draft。
3. 在 UI 中把 capability blocker 与普通 field blocker 的计数拆开，减少“5 blockers”语义混淆。
4. 增加真实使用指标看板：clarification rounds、handling time、time-to-ready、copy rate、correction rate。

### P2 — 有真实需求后再做

1. 多产品 Line Items 数据模型。
2. Personalization roster 表格和逐行校验。
3. Design × Location × Color 矩阵。
4. Email forwarding / thread matching。
5. Gmail/Outlook OAuth、附件读取、Artwork Preflight。

这些能力不能仅靠扩 prompt 实现；必须先升级数据模型和人工审核流程。

## 7. 商业化结论

- $39/月作为 founder-led paid pilot 价格合理，但目前的真实商业验证仍为 0：没有付费店铺、留存或节省时间数据。
- 下一步不应继续批量扩 SEO 页面，也不应立即开发 Line Items 或邮件 OAuth。
- 最有价值的动作是邀请 3–5 家目标店铺，用真实询价验证每周重复使用、澄清轮次减少和 Job spec 实际被采用。
- 建议 Pilot 进入条件：每家店每周至少 10 条真实 enquiries，连续使用 2 周；记录首次成功、每周活跃、clarification copy、job spec copy、人工 correction 和付费意愿。

## 8. 下一次 Go/No-Go 评审条件

至少获得 3 家真实店铺、每家 20 条以上真实询价后再评审：

- ≥60 条真实 Job；
- ≥50% 的店铺在第二周继续使用；
- ≥30% 的 Job 使用 Clarification 或 Job Spec Copy；
- Supported 单产品场景中无 silent overwrite、错误 ready 或错误 quote-ready export；
- 店员报告整理时间下降，且至少 2 家愿意按 $39/月继续。

达到以上条件后再决定进入 V1 Email-native Intake，未达到则先修正 ICP、工作流和核心交互。
