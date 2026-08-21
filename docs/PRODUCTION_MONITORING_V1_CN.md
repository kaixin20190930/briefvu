# Briefvu Production Monitoring v1

实施日期：2026-08-21
覆盖范围：`/api/analyze`、`/api/events`、`/api/pilot`
目标：在不保存客户询价正文的前提下，持续回答“服务是否可用、模型是否稳定、是否开始变慢、是否触发容量限制”。

## 1. 已实施的数据链路

每个 API 请求完成时生成一条统一运营事件：

- route：`analyze` / `events` / `pilot`；
- outcome：固定枚举，例如 success、validation_error、rate_limited、upstream_error、schema_validation_failed；
- status code；
- duration ms；
- source：`openai` / `demo` / `none`；
- 随机 request ID；
- created_at。

同一事件同时进入：

1. Cloudflare Workers structured logs，用于即时排错；
2. D1 `monitoring_events`，用于 1–168 小时窗口的聚合报告。

D1 写入通过 Worker `ctx.waitUntil()` 异步完成，不阻塞用户响应。监控写入失败只产生脱敏 warning，不改变原 API 的业务结果。

## 2. 隐私边界

`monitoring_events` 没有 metadata、request body 或自由文本列。明确禁止保存：

- enquiry / customer reply 正文；
- subject、email、姓名、店铺名；
- evidence snippet；
- Job notes；
- OpenAI 输出原文；
- 任意客户端自定义 metadata。

request ID 仅为随机 UUID，不由客户身份或 IP 生成。IP 仍只在 rate limit 中经过带盐 SHA-256 哈希，Monitoring v1 不读取或保存 IP。

## 3. 告警阈值

阈值定义在 `lib/monitoring-policy.ts`，报告默认观察最近 24 小时。

| 指标 | 阈值 | 等级 | 处理 |
| --- | ---: | --- | --- |
| 5xx 数量 | ≥3 | P0 | 检查最新部署、OpenAI 与 D1；必要时回滚 |
| 5xx 比率 | >5%，且样本 ≥20 | P0 | 暂停扩大 Pilot，定位主要 route/outcome |
| OpenAI/provider 失败率 | >5%，且 analyze ≥20 | P0 | 检查 upstream、timeout、schema failure |
| Schema validation failure | >3%，且 analyze ≥20 | P0 | 停止模型或 prompt 扩量，运行 Scenario Eval |
| 429 比率 | >5%，且样本 ≥20 | P1 | 检查滥用、限额和 Pilot 容量 |
| P95 latency | >15,000 ms | P1 | 分析 OpenAI 延迟与网络链路 |

低于 20 个请求时，百分比告警不触发，避免 1 个失败造成误报；但 5xx 达到 3 次仍直接触发 P0。

## 4. 日常运行命令

查看默认 24 小时报告：

```bash
npm run monitoring:report
```

查看最近 1 小时或 7 天：

```bash
npm run monitoring:report -- 1
npm run monitoring:report -- 168
```

退出码：

- `0`：无阈值超限；
- `1`：存在 P1；
- `2`：存在 P0 或命令/查询失败。

该退出码可以直接接入后续 GitHub Actions、Slack 或邮件通知。当前已建立 Codex heartbeat `Briefvu Production Monitoring`，每天 09:00 和 18:00（Asia/Shanghai）自动执行 24 小时报告并回传到当前任务；发布后仍应额外检查 1 小时窗口。

## 5. 发布后检查清单

1. 执行远程 D1 migration；
2. 部署 Worker；
3. 发起一条不含真实客户信息的生产 analyze smoke request；
4. 等待异步写入完成；
5. 执行 `npm run monitoring:report -- 1`；
6. 确认请求数增加、source 正确、P95 有值、没有非预期告警；
7. 查询表结构，确认不存在正文或 metadata 列；
8. 在 Cloudflare Workers Logs 中按 `api_request_completed` 和 request ID 检查结构化日志。

## 6. 事故处理

### P0

- 立即暂停新 Pilot 邀请和 SEO 扩量；
- 记录触发窗口、route、outcome 与部署版本；
- 对比上一个稳定版本；
- 运行 supported Scenario Eval；
- 若为新版本回归，回滚并验证 1 小时报告恢复。

### P1

- Pilot 可继续，但不得扩大流量；
- 24 小时内定位原因；
- 延迟问题优先分离 OpenAI latency 与 Briefvu 自身处理时间；
- 429 优先确认是单一网络滥用还是正常 Pilot 容量不足。

### 立即停止 Pilot 的产品安全事件

以下事件不依赖数值阈值：错误 quote-ready 导出、silent overwrite、询价正文进入 analytics/monitoring、capability blocker 被绕过。发现任一项立即停止 Pilot 并修复。

## 7. V1 边界与下一步

Monitoring v1 已提供生产采集、历史窗口、阈值判定、非零退出码，以及每天两次的 Codex 任务内自动检查，但尚未自动发送 Slack/Email 页面通知。Pilot 流量达到稳定日活后，再把 `monitoring:report` 接入外部通知渠道；当前任务内自动化已足够覆盖低流量 Pilot，避免过早引入噪声告警系统。

Cloudflare Workers Logs 继续作为短期即时排错层，D1 是 Briefvu 自有的趋势与阈值数据层。D1 只保留运营事件；建议 Pilot 结束后根据实际事件量确定 30/90 天留存策略。
