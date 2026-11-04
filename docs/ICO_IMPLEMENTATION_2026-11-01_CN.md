# BriefVu ICO 与 Converter 第二批实施清单

> 当前状态：本批已上线并验收。跨批次完成/暂缓/遗漏与下一步，以 [整体复查清单](PRODUCT_OPTIMIZATION_REVIEW_2026-11-01_CN.md) 为准；以下过程记录中的“待完成”描述的是当时状态。
日期：2026-11-01。衔接 [色彩工具第一批](COLOR_TOOLS_IMPLEMENTATION_2026-11-01_CN.md)，保留工作区上一批全部修改。

## 范围与验收

- [x] 先登记实施清单，核对现有组件与本地 Next.js 文档。
- [x] ICO MVP：PNG/JPG/WebP 本地导入，Fit/Crop、留白、透明/纯色背景；真正多尺寸 ICO（16/32/48/256）及原始尺寸预览。
- [x] 网站图标 ZIP：favicon.ico、180/192/512 PNG、使用说明与图标引用片段；不声称生成完整可安装 PWA。
- [x] 新页服务端正文、TDK、面包屑、相关工具、首页/目录/事件登记。
- [x] Converter 保留 TDK，增加真实 WebP 优化预设及 ICO/尺寸调整任务入口；检查编码类型，禁止 PNG 伪装成 WebP。
- [x] 单元测试（容器、ZIP、几何边界）、lint、类型/生产构建；浏览器导入、导出、错误、手机布局；独立解析实际下载产物。
- [x] sitemap 新增 ICO，仅维护真实修改页日期。
- [x] 上线并检查生产页面、canonical、sitemap、实际交互；更新本清单及手动提交链接。

## 边界

第一版不支持 SVG、批量、圆角、自动模糊判断、Chrome 扩展包或完整 PWA 配置。小尺寸 ICO 使用 32 位 DIB，256px 使用 PNG；不承诺旧版 Windows 的所有色深。图片不上传，事件只记录工具 ID 与动作。Fit 保留全图，Crop 中心裁剪；留白按每边百分比。Apple touch PNG 使用选定背景色合成以避免透明图标显示问题。

参考：[Microsoft 图标格式](https://learn.microsoft.com/en-us/windows/win32/menurc/about-icons)、[MDN manifest icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons)。

## 进度

已完成实现、本地验收、生产部署与生产验收。以下记录保留过程与最终结果。

### 本地实现与首轮验证

- 新增独立 `/tools/image-to-ico`，首页/目录/相关工具和匿名事件已接入；保留 Converter TDK。
- ICO 使用 16/32/48px DIB + 256px PNG；ZIP 固定五个文件，不新增依赖。
- 19 测试文件 / 96 测试通过，TypeScript、lint 通过。测试覆盖目录偏移、BGRA 行序、透明 AND mask、CRC32 标准向量、ZIP 目录、Fit/Crop 几何和 sitemap。
- Chrome 实际下载，Pillow 独立解码全部四帧；Python zipfile 验证 CRC 与五个文件，180/192/512 PNG 尺寸正确；透明 padding 与 Apple touch 不透明背景符合预期。
- 真实 canvas/CSS 宽度分别为 16/32/48/256；390px 和 320px 视口均无页面横向溢出。10% 留白 + Crop + 不透明白底实际文件验证通过。
- 损坏 PNG 清空旧结果、隐藏下载按钮并显示可读错误；浏览器无应用 console error。
- 修正了设置变化时预览 canvas 未清空导致透明区域可能保留旧像素的问题；发布前重新验收。
- 证据：`docs/qa/ico-2026-11-01/artifact-validation.json`、桌面/手机截图。生产发布尚未完成。

### 发布前总验收

- 最终全量 19 文件 / 96 测试通过，lint 通过，`git diff --check` 通过。
- Converter 预设真实导出 `reference.webp`，Pillow 确认 WEBP / 600×400；调整格式后旧下载入口消失。390px 无溢出，任务链接到达 ICO 页面。
- 修正后 Crop → Fit 的透明区域正常清空；截图复核通过。
- OpenNext 首次构建触发 Wrangler 本机注册目录沙箱 EPERM；已按权限流程获准在沙箱外重新构建。保持已有 Edge middleware 兼容方式，不在本轮迁移 Proxy。
- 测试平台为 Chrome 桌面及 390/320px 响应式视口，不代表 Safari/iOS 或 Windows 真机验证。

### 已上线 / 2026-11-01

- OpenNext 生产构建与 TypeScript 检查通过；Cloudflare Worker `briefvu-tools` 发布成功，版本 `b3dab3e9-e246-465d-ad88-6247beb4f87e`。
- 沿用上一批已修正的部署命令：`OPEN_NEXT_DEPLOY=true wrangler deploy --env-file /dev/null --keep-vars`，保留生产变量。
- 新 ICO、Converter、首页和目录：HTTP 200、单一 H1、正确 HTTPS canonical，无 noindex；页面 JSON-LD 可解析，首页/目录/Converter 均可发现 ICO 入口。
- 生产 sitemap：31 个唯一 URL，新增 ICO，6 个当日修改页日期为 2026-11-01，25 个未修改 URL 保持 2026-10-20。上一批与本批同一天，首页/目录/Converter 继续使用真实当日日期，不伪造全站更新时间。
- Chrome 生产 ICO：导入五色 PNG、实际下载 ZIP 成功，浏览器无应用 error。独立 Python ZIP CRC + Pillow 四尺寸解码通过。
- Chrome 生产 Converter：WebP 80% 预设可用，ICO 任务链接正确。
- 证据：`docs/qa/ico-2026-11-01/production-smoke.json`、`ico-production.png`、`artifact-validation.json`、桌面与手机截图。
- 没有代用户提交 GSC 请求索引；发布成功不等于已收录。没有修改远程 Git 分支或提交工作区。

## 手动提交链接

优先：
1. 新页面：https://briefvu.com/tools/image-to-ico
2. 更新页面：https://briefvu.com/tools/image-converter

辅助发现入口（可选）：https://briefvu.com/ 、https://briefvu.com/tools

sitemap：https://briefvu.com/sitemap.xml

本轮不含 Metadata 批量、SVG、圆角、Chrome 扩展包和完整 PWA 配置；这些仍保留后续范围。

## 后续批次

已启动 [Remove Metadata 升级](METADATA_IMPLEMENTATION_2026-11-01_CN.md)：字段查看与风险分组、批量清理、逐文件前后对比与验证；进度以该清单为准。

第三批现已上线并验收：Remove Metadata 查看/风险分组/批量/前后对比，版本 `a89c1103-57e0-415f-aaeb-fbe649d2b41f`；详情见第三批清单。
