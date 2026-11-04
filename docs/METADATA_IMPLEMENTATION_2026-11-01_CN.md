# BriefVu Remove Metadata 第三批实施清单

> 当前状态：本批已上线并验收。跨批次完成/暂缓/遗漏与下一步，以 [整体复查清单](PRODUCT_OPTIMIZATION_REVIEW_2026-11-01_CN.md) 为准；以下过程记录中的“待完成”描述的是当时状态。
日期：2026-11-01。承接 ICO 批次，保留已有工作区修改。不新增 URL，保留 Remove Metadata TDK。

## 实施与验收

- [x] 核对现有清理器、页面、exifr 与本地 Next.js 文档；先登记清单。
- [x] 加固格式边界检查与清理后验证；无效容器拒绝，不能将解析失败显示为没有元数据。
- [x] 查看器：位置 / 设备 / 时间 / 作者 / 软件分组；区分已解析字段、未解析区块和无已识别字段。GPS 红色提示，不生成外部地图链接。
- [x] 批量：最多 20 文件、单文件 30 MB、合计 100 MB；顺序处理、逐文件状态、单文件失败不影响其它文件、换批次取消旧异步工作。
- [x] 清理前后对比：字节数、识别区块数、输出重扫、可读字段；文件大小变化不作为隐私已清除的唯一证据。
- [x] 单文件下载及成功项 ZIP；仅下载通过重扫与图像解码检查的结果；图片不上传。
- [x] 页面正文/FAQ 同步；更新当前 URL 的 sitemap lastmod，不批量刷新其它页面。
- [x] 单元测试、lint、类型/生产构建、真实图片批量与导出验证、手机布局。
- [x] 上线、生产验收、更新本清单并列出手动提交链接。

## 重要范围

清理已识别的 EXIF/XMP/C2PA/文本/ICC 容器区块，不改变压缩像素数据。不承诺全部隐私消失：未识别区块、可见内容、文件名、像素水印、外部记录不在清理范围。移除 EXIF orientation/ICC 可能改变显示方向/色彩；移除 C2PA 改变嵌入的来源记录。原文件不覆盖。仅 JPG/PNG/WebP，不支持 HEIC。

## 进度

初始化完成。发现旧解析器对截断 PNG/WebP 和 JPEG 段边界校验不足；先修复再扩展批量，避免将失败误标为验证通过。

### 实现与批次验证

- 清理器增加 JPEG 完整段边界、逐扫描扫描数据遍历（含 FF 转义/重启标记）、PNG 头/块长度/IEND、WebP RIFF/块长度校验。识别与删除使用同一组明确签名，不再因为任意 payload 含 “exif” 字样删除其它区块。
- 查看器使用现有 exifr，补 WebP EXIF 容器提取与 PNG tEXt；未解析/不支持字段明确提示。GPS 为 0 仍正常显示；EXIF 无时区时间保留原字符串，避免凭浏览器时区换算。
- 新批次及清空会使旧异步任务失效；单项失败隔离；输出重扫和解码检查通过才开放下载。通用编号下载名避免泄露原名，重复源文件名不碰撞。
- 先后单元验证均通过；新增真实合成 JPEG/WebP/PNG fixtures 验证读取、分组、去块、幂等与字节变化。
- Chrome 混合批次：4 正常 + 1 截断 JPEG，4 ready / 1 failed，清理后 4 verified / 1 failed；ZIP 只含 4 个成功文件。
- Python zipfile CRC 校验通过；Pillow 独立解码验证像素一致，EXIF 清除，PNG 文本清除；JPEG 扫描区、PNG IDAT、WebP VP8 压缩 payload 与原文件一致。无元数据 PNG 原样保留（316 → 316 bytes）。
- 390px 视口页面宽度为 390，无横向溢出；清空后无旧行/下载入口，应用 console error 为空。
- 证据：`docs/qa/metadata-2026-11-01/artifact-validation.json`、桌面/手机截图。fixtures 均为合成测试数据，不包含真实个人位置。
- 待最终全量检查、生产构建与发布验证。

### 发布前总验收

- 全量 21 测试文件 / 107 测试通过；lint、TypeScript、git diff --check 通过。
- 文案/FAQ 已同步批量能力，页面 Title/Description 保持原值；不新增 URL。sitemap 仅将 Remove Metadata 日期更新为 2026-11-01。
- OpenNext 构建首次受 Wrangler 本机注册文件沙箱权限限制，按权限流程在沙箱外重试；没有更改认证信息或生产变量。
- 浏览器测试为 Chrome 桌面与 390px 响应式视口，不代表 Safari/iOS 真机或所有厂商私有元数据格式。

### 生产上线与验收完成 / 2026-11-01

- Worker `briefvu-tools` 已发布，版本 `a89c1103-57e0-415f-aaeb-fbe649d2b41f`；沿用 `OPEN_NEXT_DEPLOY=true wrangler deploy --env-file /dev/null --keep-vars`。
- 沙箱内发布无法读取已有 Cloudflare 登录态，沙箱外使用原有授权发布成功；没有新增权限、替换凭据或改生产变量。
- 生产 Remove Metadata 返回 200、单 H1、正确 canonical、无 noindex；原 Title/Description 保留，JSON-LD 与批量 FAQ 同步。
- 生产 sitemap 保持 31 个唯一 URL；Remove Metadata 更新为 2026-11-01。此前两批 6 页同日日期保持，24 个其它 URL 仍为 2026-10-20。
- Chrome 生产混合批次：4 正常 + 1 截断文件，得到 4 verified / 1 failed。位置/设备/时间/作者/软件分组正确；原始 EXIF 时间 `2020:01:02 12:34:56` 未被转换时区。
- 实际单图与 ZIP 下载均通过验证；单图等于 ZIP 内对应文件，ZIP CRC 正常，4 张输出独立解码像素一致且无 EXIF。无元数据样本保持大小不变，损坏项未导出。
- 生产 console error 为空；证据：`docs/qa/metadata-2026-11-01/production-smoke.json`、`artifact-validation.json`、`metadata-production.png`。
- 未代用户提交 GSC 索引请求，未将发布成功宣称为重新收录。未提交 Git 或推送远程。

## 手动提交链接

本轮只需重新提交更新页：

- https://briefvu.com/tools/remove-metadata
- sitemap：https://briefvu.com/sitemap.xml

没有新增 URL，首页/目录及其它工具无需因本批重复提交。
