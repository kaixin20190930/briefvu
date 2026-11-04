# 公开示例与 Metadata 提示修正

2026-11-01；沿用现有工具，不增加功能、依赖或 URL。

- [x] 确认范围、读取现有实现及 Next 图片文档。
- [x] Palette：一个可下载的本地示例 PNG、一张真实结果截图、简短操作说明。
- [x] ICO：复用示例 PNG、一张真实设置/预览截图，说明 Fit 与 16px 检查。
- [x] Metadata：明确位置警告属于原图，分别标注原图与清理输出；不改清理算法。
- [x] 必要验证：类型/lint、三页浏览器检查、生产构建及上线抽查。
- [x] 更新总清单、发布记录和 sitemap（同日修改保留真实日期）。

不按原方案机械凑截图数量，不加示例加载按钮、图库、动画或新测试框架。公开截图只包含工具内容，不包含浏览器扩展、账号或个人文件。使用既有五色测试图片，截图由实际工具生成；不虚构模糊对比。

## 实施与验证

- 新增静态资源 `public/examples/five-color-reference.png`（4.6 KB）、`palette-five-colors.png`（58.5 KB）、`ico-fit-preview.png`（54.2 KB）。截图直接来自本地工具实际运行，包含原图/结果或设置/预览，无个人素材与扩展浮层。
- 每页一个普通 figure，显式宽高、描述性 alt、默认懒加载，可打开原尺寸图；静态图片使用 unoptimized，不引入图片优化服务。复用现有内容区，只增加 3 条样式。
- Palette 示例解释平均色与五色结果，以及等宽色块采样后权重略有差异。ICO 示例说明 Fit、透明留白和 16px 检查；明确文档截图会缩放，实际尺寸请看工具。
- Metadata 清理前提示 Original image contains location fields；清理后提示 Original image contained location fields，明确原图没有被覆盖。结果、两列标题和比较方向均标注 original / cleaned output。
- Chrome 本地三页验证：两张示例图均实际载入；390px 页面宽度均 390、无横向溢出。Metadata 合成 GPS fixture 从 1 个识别块到 0，923 → 629 bytes，清理前后提示符合预期。截图证据：`docs/qa/public-examples-2026-11-01/metadata-after.png`。
- ESLint 通过。此次为静态说明与文字修正，没有新增单元测试或重复运行完整算法测试。
- 构建首次因 Wrangler 本机注册目录沙箱 EPERM 停止；按权限流程重试。重试后生产构建（含 TypeScript）及上线成功。
- 三个修改 URL 的 sitemap lastmod 已是同日 2026-11-01，保持真实日期，不刷新全站时间戳。

## 已上线

- Cloudflare 版本：`53df146d-cd1b-4a47-8a1f-14a99df632fc`。
- 三页 HTTP 成功、H1 单一、canonical 正确；三张公开图片与本地字节一致，Chrome 生产两页图片正常载入。sitemap 仍为 31 个唯一网址，三个修改页为 2026-11-01。
- 生产抽查证据：`docs/qa/public-examples-2026-11-01/production-smoke.json`、`palette-production.png`。Python urllib 首次请求返回 403，curl 与 Chrome 访问成功；没有把单一客户端拒绝误判为站点不可访问。
- 未新增工具、未增加依赖、未更改 TDK、未提交或推送 Git。未代点 GSC 请求索引。Safari/iOS 真机验证仍待办，本批不扩展范围。

更新页面：
- https://briefvu.com/tools/color-palette-from-image#worked-example
- https://briefvu.com/tools/image-to-ico#worked-example
- https://briefvu.com/tools/remove-metadata

三页均已有收录；本次只是内容补充，不需要反复请求索引。如手动提交，使用不含 #worked-example 的页面 URL。

## 文案与内链快修（同日追加）

- [x] Palette 补约 100 词局部区域取色说明，链接 Crop；不宣称支持页内框选。
- [x] Palette / Picker 各加 ICO 内链，明确先准备品牌图像再转换。
- [x] 缩短 Palette Title，ICO Description 加完整 Image to ICO converter。
- [x] 构建并上线，抽查生产元数据和链接；不新增功能或测试。

快修已上线，版本 `167f6032-2dcd-417a-92ee-49397b7db010`。局部取色正文 100 词；Palette 最终 Title（含 BriefVu）53 字符。两条内链锚文本为 turn your brand image into a favicon，避免暗示能直接把色板文件转换为 ICO。定向 lint、生产构建含 TypeScript、diff check 通过，生产三页元数据/链接抽查通过；证据 `copy-links-smoke.json`。同日 sitemap 日期保持 2026-11-01。
