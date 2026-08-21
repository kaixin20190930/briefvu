# Briefvu 手工 UI 测试记录

测试日期：2026-08-20–2026-08-21
生产版本：M20=`b8142f51-8f89-4ad1-95ed-e711474a97f9`；M22 修复后=`58cacef8-1065-4017-a955-5476b6423b14`；M24 草稿修复=`5566670e-9f37-4c24-8dee-12ecadbead66`；HTML 缓存修复=`a36845e9-73c4-4937-91b9-45deef70894f`；响应式/键盘修复=`7dea49bc-3bbc-4c98-949e-6ad3a46ca312`；JSON 复制反馈=`3f1bc85c-3dd6-40a5-810e-fa9afefda18e`

## M20 Decoration Method Reply Replacement

结论：Pass

### 初始询价

- Formal quote 正确显示 Almost ready、0 blockers、6 price affecting。
- Quantity=55、Garment type=shirts、Color=navy、Decoration=screen printing、Location=front。
- Fulfilment 分组为已确认；完整导出中的 pickup 留待阶段 6 检查。
- Job Spec 预览显示 screen printing。

### Proposed Change

- 仅产生 1 个 Decoration method 更新。
- Action 为 Replace Confirmed Value。
- Before=screen printing，Proposed=DTF。
- Evidence 为客户回复原文。
- 未选择 Accept/Edit/Ignore 前，Apply reviewed changes 保持禁用。

### 接受后

- Decoration method 仅在批准后更新为 DTF。
- Evidence 来源为 Customer reply 1。
- Revision 显示 Replace Confirmed Value · Accepted。
- Timeline 为 2 messages；其他结构化字段没有变化。
- Job Spec 预览更新为 DTF。

### 非阻断观察

- “0 blockers” 与 “6 price affecting” 同时出现，但顶部明确显示 Almost ready for a formal quote，符合当前规则。
- 完整 Copy Text/JSON 是否包含 pickup 将在导出测试统一验证。

## M22 Personalization Roster Boundary

结论：Pass（首次 Conditional Pass，修复后生产 UI 复测通过）

### 已通过

- Formal quote 正确显示 Not ready to quote 和 1 quote blocker。
- 顶部显示 Manual workflow required，并准确解释个性化名单需要单独工作流。
- Still needed 正确列出 Personalization roster needs a separate workflow。
- Quantity=20、Garment type=safety vests、Color=yellow、Decoration=heat transfer、Location=back/front；基础字段没有因能力边界而丢失。
- Job spec 保持 Updates as replies arrive，没有错误显示为 Ready for your quote desk。
- 未误报 multi-product order。

### 发现的问题

1. Clarification draft 没有要求客户提供姓名/号码、尺码和数量对应名单。
2. 页面显示 1 result need review because their evidence could not be matched。生产接口确认是模型在没有证据时返回 Artwork mentioned=No，证据验证器将其变成 Needs Review 并产生了泛化警告。

### 处理

- 能力阻断问题现在参与 Clarification draft 生成；个性化场景会优先要求 roster、姓名/号码、尺码和数量。
- 对需要显式证据的布尔字段，缺少 evidence 时直接安全降级为 Missing，不再产生虚假的证据不匹配警告。

### 修复后复测

- 生产 API 返回 `warnings=[]`；Artwork mentioned 安全降级为 Missing。
- M22 生产自动化测试 3/3 通过。
- 生产 UI 不再显示 evidence could not be matched 警告。
- Clarification draft 的第 1 项明确要求 personalization roster、姓名或号码、garment size 和 quantity。
- 页面继续保持 Not ready to quote、1 blocker、能力提示和完整基础 Job spec。

## M24 Multi-product Safety Boundary

结论：Pass（首次 Conditional Pass；澄清流程与 HTML 缓存修复后生产 UI 复测通过）

### 已通过

- Formal quote 正确显示 Not ready to quote，并显示 Split this multi-product enquiry。
- Quantity 保留 100 和 60 两个冲突候选；Garment type 保留 tote bags 和 caps 两个冲突候选。
- Brand、Style、Garment color、Decoration method、Print locations、Print colors、Number of designs 等无法归属到单一产品的字段均清空为 Ambiguous。
- Job spec 没有输出被错误合并的单一颜色、工艺或产品。
- 没有 evidence could not be matched 警告。

### 发现的问题

- Clarification draft 仍要求客户从 100/60 和 tote bags/caps 中选择一个，并继续追问单一订单的品牌、款式、颜色和工艺。这与顶部要求拆分多产品订单的策略冲突，可能导致其中一个产品被错误丢弃。

### 处理

- 当存在 `multi_product_order` quote blocker 时，Clarification draft 只保留“拆成每产品一个 Job，或转人工处理”的问题，不再生成单一 Job 字段问题。
- 修复后全量本地测试 70/70、lint、production build 均通过；M24 生产 API 测试 3/3 通过。
- 新生产 UI 文案仍待用清空后的新 Job 做最终可视复测。

### 生产缓存问题

- 使用正确 M24 输入再次复测时，API、能力 blocker 和字段安全均为新版本，但 Clarification draft 仍来自旧前端 bundle。
- 生产首页响应头被确认是 `Cache-Control: s-maxage=31536000`，允许 HTML 在共享缓存中保持一年；不同节点或长期开启的页面可能继续引用旧 JavaScript。
- 修复策略：所有公开 HTML、robots、sitemap 与动态图片文档改为 `public, max-age=0, must-revalidate`；带内容哈希的 `/_next/static` 资源不受影响。
- 修复后生产检查：`/`、`/examples`、`/sitemap.xml` 均返回 `public, max-age=0, must-revalidate`；无 query 的首页也已引用包含多产品草稿修复的 `3una35xe0sgbx.js`。

### 最终生产 UI 复测

- 页面保持 Not ready to quote、5 blockers 和 Manual workflow required。
- Quantity 保留 100/60 冲突；Garment type 保留 tote bags/caps 冲突。
- 产品相关字段继续安全清空为 Ambiguous；Job spec 没有输出错误合并结果。
- Clarification draft 最终只保留一个问题：拆成每产品一个 Job，或转人工审查。
- 不再出现 final quantity、final garment type、品牌、颜色或工艺等会诱导丢弃产品的单一 Job 问题。

## M24 Job Spec Export Safety

结论：Pass（首次生产手工测试 Fail；安全整改后生产 UI、Copy draft 与 JSON 复测通过）

### 首次导出发现的问题

- 未就绪且存在多产品能力阻断的订单仍使用 `QUOTE-READY JOB SPEC` 标题，可能被误认为可直接报价。
- Copy Text 输出 `File received / Unknown`，把未确认的占位状态当成已解决信息。
- 模型生成的 Notes 原样重复完整初始询价，在多产品场景中绕过了字段安全清空策略。
- Copy Text 没有包含 multi-product manual workflow blocker，也没有携带 Quantity、Garment type 的候选值与证据。
- JSON 没有 readiness、export status、capability issues；冲突字段缺少 candidates；outstanding 只是一组字段 key，无法表达能力边界。

### 整改

- 只有 `ready_for_ballpark` / `ready_for_formal` 且没有能力问题时，才允许输出 `QUOTE-READY JOB SPEC`。
- 未就绪普通订单输出 `DRAFT JOB SPEC — NOT READY`；存在能力问题时输出 `DRAFT JOB SPEC — MANUAL REVIEW REQUIRED`。
- Job spec 卡片在未就绪时显示 Draft 状态，按钮改为 `Copy draft`。
- 文本导出新增 Quote readiness、Manual review required、Conflict options、Resolved details 和 Outstanding items。
- 只有 Confirmed / Approximate 字段可进入 Resolved details；`Unknown`、Missing、Ambiguous、Conflicting、Needs Review 不再作为已解决值输出。
- 多产品场景安全清空 Notes，避免完整询价通过 Notes 绕过结构化字段边界。
- JSON 新增 `readiness`、`exportStatus`、`capabilityIssues`、各字段 `candidates`，并把 outstanding 拆为 fields 与 capabilities。

### 自动化验证

- 新增多产品文本/JSON 导出回归测试和 Notes 安全测试。
- 全量本地测试 72/72 通过，lint 通过，Next.js production build 通过。
- 已部署 Cloudflare Worker Version `a55684a5-4060-4150-89ef-ec08b8eed240`。
- M17–M24 生产场景测试 8/8 通过；M24 生产 API 确认 Notes 已清空为 Ambiguous，Quantity 与 Garment type 的冲突候选和证据均被保留。
- 生产前端 bundle 已确认包含 `Copy draft`、`DRAFT JOB SPEC — MANUAL REVIEW REQUIRED`、`manual_review_required`；首页继续返回 `Cache-Control: public, max-age=0, must-revalidate`。

### 最终生产手工复测

- 页面显示 Not ready to quote、5 blockers、Manual workflow required；Job spec 显示 `Draft · manual review required`，按钮为 `Copy draft`。
- Clarification draft 只询问拆分为每产品一个 Job，或转人工审查，没有要求客户在两个产品中二选一。
- Copy draft 标题为 `DRAFT JOB SPEC — MANUAL REVIEW REQUIRED`，明确包含 Quote readiness、能力阻断、tote bags/caps 与 100/60 的冲突候选及原文证据。
- Resolved details 为 None；`File received: Unknown` 和完整初始询价 Notes 均未进入文本导出。
- JSON 的 `readiness=not_ready`、`exportStatus=manual_review_required`；保留 capability issue、字段 candidates、source message evidence，并将 outstanding 分为 fields 与 capabilities。
- JSON 中保留 `file_received=Unknown / Needs Review` 作为完整内部状态是预期行为；它没有被当作已解决字段，也不进入可读 Job spec 正文。

## Responsive、Keyboard 与 Accessibility 发布验收

结论：Pass（ChatGPT/Codex in-app browser、Safari 实机与真实 200% 浏览器缩放）；独立 Chrome 因扩展可用性受阻。

### 已通过

- 390×844：页面 `scrollWidth=390`，无页面级横向溢出；回复弹窗位于 10–380px，完整落在视口内。
- 412×915：页面 `scrollWidth=412`，无页面级横向溢出。
- 移动端 Job Details 标签使用 `overflow-x:auto` 的独立横向滚动容器，不会撑宽整页。
- 生产页面没有重复 DOM id；可见 button/link/input/textarea/select 均具有可访问名称。
- 生产浏览器控制台无 error 或 warning。
- 2026-08-21 最终生产复测：现有 Active job 可正常恢复；Add customer reply 打开后焦点落在 Customer reply；Shift+Tab/Tab 在 Cancel 与 Close 之间正确循环；Esc 关闭后焦点返回 Add customer reply。
- 640×360 等效缩放视口压力测试通过：页面 `scrollWidth=640`，无页面级横向溢出；弹窗位于 10–630px，完整落在横向视口内，且保持 Customer reply 初始焦点。测试后已恢复默认 1280×720 视口。
- 2026-08-21 用户完成 Safari 与真实 200% 浏览器缩放全流程验收；除 JSON 复制按钮缺少成功反馈外，没有发现其他功能或布局问题。

### 发现并修复的问题

1. 回复弹窗打开后焦点仍留在页面后方，Tab 不进入弹窗，Esc 无法关闭，关闭后焦点不返回触发按钮。
2. Clarification draft 的 `+` 按钮没有可访问名称。
3. JSON 导出实际复制成功，但按钮没有像 Copy draft 一样显示 `Copied`，用户无法确认动作是否完成。

整改后：弹窗打开即聚焦 Customer reply；Tab/Shift+Tab 在弹窗首尾控件间循环；Esc 关闭；关闭后焦点返回 Add customer reply；`+` 按钮的可访问名称为 Add question。JSON 按钮现在按 `JSON → Copied → JSON` 变化，成功状态约保持 1.8 秒。生产版本 `3f1bc85c-3dd6-40a5-810e-fa9afefda18e` 已复测通过。

### 20 次生产可用性采样

- `https://briefvu.com/`：20/20 返回 HTTP 200，无 429/5xx。
- TTFB：P50≈0.826s，P95≈1.332s，最大≈1.499s。
- Total：P50≈0.906s，P95≈1.669s，最大≈1.875s。
- 该结果是当前执行环境到 Cloudflare 的 HTTP 采样，不等同于 Chrome 用户侧 Core Web Vitals。

### 仍缺证据

- 当前没有可用的 Chrome DevTools performance trace 服务，不能给出可靠的 FCP/LCP/CLS/TBT。
- in-app browser 不响应浏览器缩放快捷键，但用户已在 Safari 完成真实 200% zoom 验收并通过；640×360 代理测试继续保留为自动化布局压力基线。
- 独立 Chrome 连接检查显示 Chrome 与 native host 正常，但 ChatGPT Chrome 扩展未安装；Chrome Web Store 对当前账号/地区显示“此商品无法购买或下载”，因此独立 Chrome 验收记录为外部可用性阻塞，不计为失败或通过。
- Safari 已完成；独立 Chrome 仍受扩展可用性阻塞。公开自助上线的 No-Go 主要剩余项转为 CWV、生产告警、长期稳定性和付款闭环。
