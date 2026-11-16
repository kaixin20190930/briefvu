# 编辑器定位与主题清理实施清单

日期：2026-11-16。先 A 单独发布验证，再实施 B/C/D；每批提交推送后部署。仅修改落地页、路由和索引配置，不改变 PhotoCraft 运行时。

## A：PSD URL 迁移
- [ ] 原 PhotoCraft 页面迁至 /tools/psd-editor，canonical、JSON-LD、目录和推荐链接同步。
- [ ] /tools/photocraft-online 精确 301，保留查询参数；新页 200。
- [ ] sitemap 替换旧 URL，lastmod 使用实际编辑日期。
- [ ] 必要测试、构建、提交推送、部署和线上 HTTP 验证。

## B/C：两页分工
- [ ] PSD Editor TDK 和四个小节，正文不超过 2,500 词。
- [ ] Browser Photo Editor TDK，保留一次 photo editor online。
- [ ] 双向 HTML 内链、PSD → Image Converter 内链。

## D：主题清理
- [ ] WordCraft、REA 工具、REA 指南设置 noindex, follow 并移出 sitemap 和目录推荐。
- [ ] sitemap 最终 28 条；两编辑器及工具、指南目录日期更新。
- [ ] 必要验证、提交推送、部署、记录版本。

## 手动验证与后续观察
- [ ] 桌面：打开 PSD → 添加图层 → 导出 PNG。
- [ ] iPhone 真机同路径检查，未验证前不宣称移动端可用，不发布 Product Hunt。
- [ ] GSC 新 PSD URL 检查、请求索引；检查旧 URL 重定向。
- [ ] 11 月 23–25 日复核 C2PA、ICO 查询数据；本批冻结这两页。
- [ ] 三个月观察 PSD 与 browser photo editor 排名；排名是观察目标，不作为代码交付承诺。

保持每周两批外链节奏；HEIC 等既定门槛。当前 sitemap 不输出 priority，无需改数字。暂保留四个文字/音频工具，本批完成后不能称为全图片站。
