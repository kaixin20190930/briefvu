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
- [ ] 等 Google 重新抓取后复核旧 URL 的 GSC 重定向识别；线上 HTTP 301 已验证。
- [ ] 11 月 23–25 日复核 C2PA、ICO 查询数据；本批冻结这两页。
- [ ] 三个月观察 PSD 与 browser photo editor 排名；排名是观察目标，不作为代码交付承诺。

保持每周两批外链节奏；HEIC 等既定门槛。当前 sitemap 不输出 priority，无需改数字。暂保留四个文字/音频工具，本批完成后不能称为全图片站。

## 执行记录
- A：提交 0dd7cd4 已推送；Cloudflare 33804ab8-8235-4583-9b31-0a1d24bbb4ba。线上旧 URL 301（查询保留）、新 URL 200 验证通过。
- 本机 Next 开发类型缓存引用旧路由，已移至 /tmp/briefvu-next-dev-types-20261116，重新构建通过。
- B/C/D：已完成代码与内容调整；121 项现有测试通过，变更文件 ESLint 与 diff 检查通过。等待第二批部署和线上验证。

- 第二批：提交 3fdeddf 已推送；Cloudflare afe556d6-7965-4d1d-9f62-b9d3e7e95031。构建与线上检查通过。
- 线上：两页 TDK/canonical 正确，HTML 双向内链及 PSD → Converter 内链存在；PSD 正文约 1,767 词。
- sitemap 28 条，旧 PhotoCraft URL 与三条 noindex 页面均已移除；两页及目录 lastmod 为 2026-11-16。三条页面线上返回 noindex, follow。
- 桌面 Chrome：新建并保存简单 PSD，重新打开，添加图层与画笔笔画，导出 PNG 成功（1920×1080）。仅验证此基础样本，不代表复杂 PSD 完全兼容。
- iPhone 真机未接入，保留待办；未发布 Product Hunt。
- GSC（2026-11-16）：新 PSD URL 初始为“Google 无法识别此网址”，请求索引后确认“已请求编入索引”，已加入优先抓取队列。未重复提交。
- 主要发现入口（首页、工具目录、指南目录、两编辑器）不再包含三个偏题页的链接。C2PA、ICO 与运行时文件未修改。
