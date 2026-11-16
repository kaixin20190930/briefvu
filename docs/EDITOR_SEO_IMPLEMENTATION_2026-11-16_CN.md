# 编辑器定位与主题清理实施清单

日期：2026-11-16。先 A 单独发布验证，再实施 B/C/D；每批提交推送后部署。仅修改落地页、路由和索引配置，不改变 PhotoCraft 运行时。

## A：PSD URL 迁移
- [x] 原 PhotoCraft 页面迁至 /tools/psd-editor，canonical、JSON-LD、目录和推荐链接同步。
- [x] /tools/photocraft-online 精确 301，保留查询参数；新页 200。
- [x] sitemap 替换旧 URL，lastmod 使用实际编辑日期。
- [x] 必要测试、构建、提交推送、部署和线上 HTTP 验证。

## B/C：两页分工
- [x] PSD Editor TDK 和四个小节，正文不超过 2,500 词。
- [x] Browser Photo Editor TDK，保留一次 photo editor online。
- [x] 双向 HTML 内链、PSD → Image Converter 内链。

## D：主题清理
- [x] WordCraft、REA 工具、REA 指南设置 noindex, follow 并移出 sitemap 和目录推荐。
- [x] sitemap 最终 28 条；两编辑器及工具、指南目录日期更新。
- [x] 必要验证、提交推送、部署、记录版本。

## 手动验证与后续观察
- [x] 桌面：打开 PSD → 添加图层 → 导出 PNG。
- [ ] iPhone 真机同路径检查，未验证前不宣称移动端可用，不发布 Product Hunt。
- [x] GSC 新 PSD URL 检查、请求索引。
- [x] GSC 再次只读检查两条 URL：新 PSD URL 已抓取并收录（11 月 16 日 15:24:42）；旧 URL 仍显示迁移前的已收录记录。
- [ ] 等 Google 重新抓取后复核旧 URL 的 GSC 重定向识别；线上 HTTP 301 已验证。
- [ ] 11 月 23–25 日复核 C2PA、ICO 查询数据；本批冻结这两页。
- [ ] 三个月观察 PSD 与 browser photo editor 排名；排名是观察目标，不作为代码交付承诺。

保持每周两批外链节奏；HEIC 等既定门槛。当前 sitemap 不输出 priority，无需改数字。暂保留四个文字/音频工具，本批完成后不能称为全图片站。

## 执行记录
- A：提交 0dd7cd4 已推送；Cloudflare 33804ab8-8235-4583-9b31-0a1d24bbb4ba。线上旧 URL 301（查询保留）、新 URL 200 验证通过。
- 本机 Next 开发类型缓存引用旧路由，已移至 /tmp/briefvu-next-dev-types-20261116，重新构建通过。
- B/C/D：已完成代码与内容调整；121 项现有测试通过，变更文件 ESLint 与 diff 检查通过；第二批已部署，线上验证结果见下。

- 第二批：提交 3fdeddf 已推送；Cloudflare afe556d6-7965-4d1d-9f62-b9d3e7e95031。构建与线上检查通过。
- 线上：两页 TDK/canonical 正确，HTML 双向内链及 PSD → Converter 内链存在；PSD 正文约 1,767 词。
- sitemap 28 条，旧 PhotoCraft URL 与三条 noindex 页面均已移除；两页及目录 lastmod 为 2026-11-16。三条页面线上返回 noindex, follow。
- 桌面 Chrome：新建并保存简单 PSD，重新打开，添加图层与画笔笔画，导出 PNG 成功（1920×1080）。仅验证此基础样本，不代表复杂 PSD 完全兼容。
- iPhone 真机未接入，保留待办；未发布 Product Hunt。
- GSC（2026-11-16）：新 PSD URL 初始为“Google 无法识别此网址”，请求索引后确认“已请求编入索引”，已加入优先抓取队列。未重复提交。
- 主要发现入口（首页、工具目录、指南目录、两编辑器）不再包含三个偏题页的链接。C2PA、ICO 与运行时文件未修改。

## GSC 复核尝试（2026-11-16 15:29，Asia/Shanghai）

- 浏览器连接连续三次超时（新建 GSC 标签、读取浏览器状态、连接原网址检查标签），未能读取本次 GSC 数据。
- 旧 `/tools/photocraft-online`：GSC 是否已识别为重定向，本次未核实；不能用线上 301 代替 Google 抓取结果。
- 新 `/tools/psd-editor`：GSC 是否已抓取、是否已收录，本次未核实。最近一次实际读取结果仍为本日发布后“Google 无法识别此网址”，随后索引请求成功加入优先抓取队列；该历史结果不代表本次状态。
- 独立 HTTP 复查：旧 URL 返回 301，Location 为 `/tools/psd-editor`；新 URL 返回 200。
- 后续待连接恢复：检查两个 URL 的索引覆盖状态、上次抓取时间及 Google 选择的 canonical，再更新结果。本次未重复请求索引，未修改页面内容、sitemap 或部署。

## GSC 再次连接（2026-11-16 15:41，Asia/Shanghai）

- 通过 Chrome 原生界面成功打开 BriefVu 的 GSC 资源 `sc-domain:briefvu.com`；现有账号已登录，无需新增授权。浏览器标签连接接口仍超时。
- 已尝试在网址检查框检查旧 PhotoCraft URL，但 Chrome 活动标签多次切换，操作保护提示需重新读取状态；未获得任何一条目标 URL 的本次检查结果。
- 旧 `/tools/photocraft-online` 的 Google 重定向识别、新 `/tools/psd-editor` 的抓取与收录状态、上次抓取时间和 Google canonical 均仍待核实。不能将成功连接 GSC 或此前线上 301/200 视为 Google 已处理迁移。
- 已请求用户将 Chrome 保持在 BriefVu GSC 标签，待就绪后继续两条 URL 的只读检查。本次没有重复请求索引，没有修改页面内容、sitemap 或部署；仅更新本清单，无需运行产品测试。

## GSC 复核完成（2026-11-16 15:53，Asia/Shanghai）

用户保持 Chrome 停留在 BriefVu GSC 后，已直接读取两条 URL 的 Google 索引检查结果并展开“网页索引编制”详情。以下抓取时间按 GSC 界面原样记录。

| 检查项 | 旧 PhotoCraft URL | 新 PSD Editor URL |
| --- | --- | --- |
| URL | `https://briefvu.com/tools/photocraft-online` | `https://briefvu.com/tools/psd-editor` |
| 索引状态 | 网址已收录到 Google；网页已编入索引 | 网址已收录到 Google；网页已编入索引 |
| 上次抓取时间 | 2026-11-06 17:22:43 | 2026-11-16 15:24:42 |
| 用户代理 | Googlebot 智能手机版 | Googlebot 智能手机版 |
| 是否允许抓取 / 网页抓取 / 是否允许索引 | 是 / 成功 / 是 | 是 / 成功 / 是 |
| 用户声明的规范网址 | 旧 PhotoCraft URL | 新 PSD Editor URL |
| Google 选择的规范网址 | 所检查的网址（旧 URL） | 所检查的网址（新 URL） |
| 发现来源 | sitemap.xml；引荐来源为 `/tools/rotate-image` | 未检测到引荐站点地图及引荐来源网页；界面提示可能有未报告的其他来源 |

- **结论：新 PSD Editor 已抓取并收录，Google canonical 指向自身。** 本日首次请求索引后的等待项已完成，无需重复请求。
- **旧 PhotoCraft 的重定向识别尚未体现在 GSC 中。** 其索引详情仍是 11 月 6 日的迁移前抓取记录，没有显示“网页会自动重定向”。此前 HTTP 301 验证仍成立；本次结果不能据此认定线上重定向失败，也不能将整次迁移标为 Google 已处理完成。
- 下一步仅等待 Google 重抓旧 URL，在后续复核中检查覆盖原因及 canonical 是否更新；保持现有 301、内容和内链。本次未点击“测试实际网址”或“请求编入索引”，未改页面、sitemap 或部署。
- 验证范围：GSC 两条 URL 的索引记录与详情；仅文档更新并执行 `git diff --check`，不运行产品测试或构建。
