# Briefvu V0 Pilot 正式发布基线

冻结日期：2026-08-21
Git 标签：`v0.1.0-pilot-monitoring-v1`
发布结论：Controlled Desktop Pilot Go；Public Self-serve No-Go

## 1. 生产身份

| 项目 | 基线值 |
| --- | --- |
| 产品 | Briefvu |
| 主域名 | `https://briefvu.com` |
| Worker | `threadline-intake` |
| 当前生产 Version ID | `8c1d7e4d-cae9-45fd-b328-8cb4f1d3e17e` |
| 上一个稳定 Version ID | `3f1bc85c-3dd6-40a5-810e-fa9afefda18e` |
| D1 | `threadline-intake` |
| 最新 migration | `0003_monitoring_events.sql` |
| 监控 | Production Monitoring v1，09:00 / 18:00 自动检查 |

## 2. 本次冻结范围

- Customer Enquiry → Review & Approve → Clarification Draft → Job Spec；
- Customer Reply Loop，包括 Accept / Edit / Ignore；
- quote mode：Ballpark estimate / Formal quote；
- capability blockers：多产品、personalization roster、design matrix 等；
- privacy-safe analytics、Pilot Application、API rate limiting；
- Scenario Registry v2 和 3 个已公开 supported SEO 场景；
- Sitemap、Robots、Canonical、GSC 基础；
- Production Monitoring v1。

## 3. 冻结时验证证据

- Vitest：80/80 通过；5 个付费生产测试按设计跳过；
- TypeScript：通过；
- ESLint：通过；
- Next.js production build：通过；
- 生产 analyze smoke：HTTP 200；
- 生产 monitoring：analyze/events/pilot 三条 route 均有记录；
- 最近一次 24 小时报告：0 个 5xx、0 个 429、0 个 provider/schema failure；
- D1 `monitoring_events` 无 request body、metadata、email、evidence 或 notes 列；
- `.env.local`、`.wrangler`、构建产物、生成的 Cloudflare types 均被 Git ignore；
- 仓库源文件未检测到常见 API key 或 private key 模式。

## 4. 已知边界

- 只支持单一产品 Job Spec；多产品订单必须拆 Job 或人工处理；
- personalization roster 不做逐人姓名、号码、尺码和数量校验；
- 不读取真实附件，File received 保持 Unknown / Needs Review；
- Desktop 优先；独立 Chrome 扩展测试受账号/地区可用性限制；
- 当前没有自动 Stripe 收款或订阅管理；
- Monitoring 的真实 analyze 样本尚未达到 20 条；
- Next.js 仍有 middleware → proxy deprecation 非阻断警告。

## 5. 变更控制

冻结后允许直接发布的内容：

- P0/P1 故障修复；
- 不改变数据契约的文案和可访问性修复；
- 已通过 Scenario Registry 的 supported 页面；
- 监控、测试和运营文档。

以下变更必须新建版本并重新执行完整验收：

- OpenAI model、prompt、schema 或 missing rules；
- readiness、quote blocker、merge 或 export 逻辑；
- D1 schema；
- rate limit、隐私 allowlist；
- 多产品、附件、email/OAuth、付款功能。

## 6. 回滚方案

代码出现 P0 回归时，先暂停新 Pilot 使用，再回滚至上一个稳定 Worker 版本：

```bash
npx wrangler rollback 3f1bc85c-3dd6-40a5-810e-fa9afefda18e \
  --name threadline-intake \
  --message "Rollback Briefvu V0 Pilot after production regression"
```

回滚会立即创建一个使用目标版本的新部署。D1 migration 不会随 Worker 代码回滚；本次 `0003_monitoring_events.sql` 只新增独立表和索引，上一稳定版本不会访问该表，因此与代码回滚兼容。

回滚后必须验证：

1. 首页、robots、sitemap 返回 200；
2. 一条 supported 单产品 analyze 返回 200；
3. 多产品仍进入 manual review；
4. Pilot Application 可提交；
5. 记录事故窗口、触发指标和回滚后的 Version ID。

## 7. 解冻条件

满足任一条件时创建下一发布基线：

- 累计 20 条真实 analyze 后完成性能评估；
- 修复任何 P0/P1 生产问题；
- Pilot 工作流发生实质变化；
- 开始真实收费；
- 进入 V1 Email-native Intake。
