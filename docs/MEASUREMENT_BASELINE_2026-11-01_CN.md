# BriefVu 使用统计修复与五页 GSC 基线

日期：2026-11-01。范围：恢复 Analytics Engine 报表，建立 Palette、ICO、Picker、Converter、Remove Metadata 的 GSC 基线；不新增工具，不改页面或 sitemap 日期。

## 实施清单

- [x] 登记本批清单并检查现有报表实现。
- [x] 核对认证、账号与 Analytics Engine SQL 读取权限；不输出凭据。
- [x] 修复报表认证选择、响应解析与错误提示；验证实际查询。
- [x] 记录五工具近 7 天动作计数、统计窗口与 QA 污染限制。
- [x] 逐页记录 GSC 索引状态、最后抓取、Google canonical。
- [x] 记录五页统一窗口的展示、点击与查询；区分无数据、未收录、报告滞后。
- [x] 测试、保存证据、更新总清单及剩余阻塞。

## 边界

使用现有授权优先；若确需新建或扩大凭据权限，明确所需最小权限后再请求确认。不会把密钥写入代码、文档或浏览器表单。GSC 本批只读，不点击请求索引。事件次数不等同去重用户；此前验收产生的事件不能当成自然用户需求。

## 1. 403 修复结果

已成功查询生产 Analytics Engine，退出码 0，返回 8 行工具/事件汇总。原凭据 verify 为 active，但 SQL 查询 HTTP 403；active 不代表具有 Analytics 读取权限。根据 Cloudflare SQL API 的要求，使用目标账号的 Account → Account Analytics → Read。

经用户当次确认，创建 `BriefVu-Analytics-Read`，仅目标账号的分析读取权限，有效期至 **2026-12-01**。权限覆盖账号分析，并非仅单个 dataset。密钥保存到 Git 忽略的 `.env.local` 的 `BRIEFVU_ANALYTICS_API_TOKEN`，保留原凭据；未加入代码、文档或部署变量。到期前需续期/轮换，否则报表会再次拒绝访问。

脚本优先选择专用凭据；兼容旧变量；修正 FORMAT JSON 的 `{data: [...]}` 响应解析；认证失败明确报错，不再被误当作零使用。支持固定 UTC 窗口、JSON 输出和保存报告。依据：[Cloudflare Analytics Engine SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)。

```sh
npm run usage:report -- 168
npm run usage:report -- 168 --until 2026-11-01T12:48:06Z --json
npm run usage:report -- 168 --output /tmp/briefvu-usage.json
```

证据：[授权摘要](qa/measurement-2026-11-01/analytics-token-review.png)、[创建完成](qa/measurement-2026-11-01/analytics-token-created.png)、[实际查询结果](qa/measurement-2026-11-01/usage-7d.json)。

## 2. 工具使用基线

窗口：2026-10-25 12:48:06 ≤ timestamp < 2026-11-01 12:48:06，UTC；上海时间截止 20:48:06。计数使用 SUM(_sample_interval)，是采样加权动作次数，不是用户数。

| 工具 | started | file_loaded | copy_completed | export_completed |
|---|---:|---:|---:|---:|
| Palette | 2 | 2 | 0 | 0 |
| ICO | 1 | 1 | 0 | 1 |
| Picker | 0 | 0 | 0 | 0 |
| Converter | 0 | 0 | 0 | 0 |
| Remove Metadata | 1 | 4 | 0 | 2 |

零表示本次成功查询窗口内未记录该动作，不证明没人使用。埋点可能被阻止或请求失败；started 在当前页面运行时每工具只触发一次，批量 loaded 按文件触发，ZIP 导出按动作触发，不能直接计算用户转化率。

11 月 1 日部署/QA 验收包含文件载入与导出，已有数据不能可靠拆分 QA 与自然访问。历史事件仅 tool/event，没有会话或来源标识；本批没有为验证而人为发送新事件。后续验收应记录明确时间窗口，并优先在本地验证，不能把这些十余次动作作为新增功能依据。

## 3. GSC 索引基线

2026-11-01 逐页通过已登录 Search Console URL 检查读取存量索引结果；未点击请求索引、未执行实时测试。五页均为 Googlebot 智能手机版，抓取成功、允许抓取及编入索引，用户 canonical 为自身、Google canonical 为“所检查的网址”。

| 页面 | 索引状态 | 最后抓取（GSC UI 原样时间） | 引荐 sitemap |
|---|---|---|---|
| /tools/color-palette-from-image | 已收录 | 2026-11-01 19:43:45 | 未检测到 |
| /tools/image-to-ico | 已收录 | 2026-11-01 20:13:49 | 未检测到 |
| /tools/image-color-picker | 已收录 | 2026-11-01 19:45:46 | https://briefvu.com/sitemap.xml |
| /tools/image-converter | 已收录 | 2026-11-01 19:45:46 | https://briefvu.com/sitemap.xml |
| /tools/remove-metadata | 已收录 | 2026-11-01 20:27:51 | https://briefvu.com/sitemap.xml |

GSC 页面没有显式显示上述抓取时间时区，因此保留 UI 值，不擅自转 UTC。证据：[五页展开的索引详情](qa/measurement-2026-11-01/gsc-index.json)。

Sitemap 报告：上次读取 **2026-10-29**、状态成功、发现 **29 页**（提交日期显示 2026-10-16）；生产 sitemap 复查记录为 31 页。新页“未检测到引荐 sitemap”与旧读取记录一致，但不能据此判定其无法被发现——两页已经收录。后续观察 GSC 是否读取到新版；可由用户手动重新提交现有 sitemap，不需重复请求五页索引。本批不修改 lastmod。

## 4. GSC 查询与展示基线

统一过滤：资源 `sc-domain:briefvu.com`，Web 搜索，每个完整 URL **完全匹配**，所有国家/设备，28 天 **2026-10-03 至 2026-10-30**。报告显示上次更新 10 小时前。此窗口早于 11 月 1 日上线，是上线前比较基线，不能评价本次升级的效果。

| 页面 | 点击 | 展示 | 平均排名 | 可见查询行 |
|---|---:|---:|---:|---:|
| Palette | 0 | 0 | 不适用 | 0 |
| ICO | 0 | 0 | 不适用 | 0 |
| Picker | 0 | 8 | 79.9 | 4 |
| Converter | 0 | 1 | 6 | 0 |
| Remove Metadata | 0 | 5 | 19.8 | 2 |

可见查询（每条均 0 点击 / 1 展示）：

- Picker：`rgb colour picker from image`、`rgb from image`、`hsl color picker from image`、`rgb color picker from image`。
- Metadata：`remove c2pa metadata`、`clearexif`。
- Palette、ICO、Converter 查询表显示“无数据”。Converter 的总展示为 1，所以“无查询行”不能解释为没有展示；查询明细可能因隐私/低量过滤未提供，不能凭空还原。

查询可见合计不等于页面总展示；不把缺失项补成具体关键词。Converter 仅一次展示的第 6 名不能推断稳定排名，Metadata 的 C2PA 查询也不构成支持该能力的证明或开发优先级。证据：[五页精确过滤报告](qa/measurement-2026-11-01/gsc-performance.json)、[sitemap 报告](qa/measurement-2026-11-01/gsc-sitemap.txt)。

## 5. 验证与下一步

- 全量 Vitest：22 文件、111 测试通过（含新增 4 项统计解析/认证/窗口/错误测试）。
- TypeScript `npx tsc --noEmit`、ESLint：通过。
- 生产 Analytics SQL 查询成功，专用凭据生效；已保存带窗口的 JSON，不打印密钥。
- 本批仅统计 CLI、测试和项目文档变更，无应用上线、无新工具、无 sitemap 日期改动。先前三批未提交修改保留，没有自动提交/推送。

下一批最值得做：补公开操作示例、Metadata 原图/输出提示消歧、Safari/iOS 验收，暂不增加高级能力。2026-11-08 和 11-15 再读取五页查询/展示及工具动作，使用完整已处理日期，并对比上线前基线；不足 7 天或样本太少就延长观察。跟进 sitemap 最新读取是否达到 31 页；记得 12 月 1 日令牌到期。以上为检查建议，未创建自动任务。
