# BriefVu 下一批图片工具优化方案与执行清单

日期：2026-11-03。状态：方案已按收敛范围实施、验证并部署。生产版本 `9d10f151-b32e-4415-a37c-fffcb8472f6a`；sitemap 为33个唯一URL。

## 1. 现状与证据边界

- 本次生产 sitemap 使用 curl 浏览器 User-Agent 请求 HTTP 200：31 个唯一 URL，21 个工具页，5 篇指南，无 TGA 页。ICO、Converter lastmod 为 2026-11-01，Compress 为 2026-10-20。Python 默认请求曾返回 403，不能将此直接推断为 Googlebot 被拦截。
- 仓库 `components/ImageConverter.tsx`：JPG/PNG/WebP/AVIF 输入，JPG/PNG/WebP 输出，无 TGA；已有 WebP 80% 预设、异步结果过期保护和输出 MIME 检查。
- `app/tools/image-converter/page.tsx` 已有 ICO 任务入口，不重复建设。AVIF 目前是输入，不承诺输出；Converter 不是大文件兜底服务。
- `components/ImageOutputTool.tsx`：Resize/Compress 共用；Compress 单图、质量调节，无目标 KB、批量或 ZIP。当前缺少与 Converter 相当的过期结果保护、忙状态和输出 MIME 校验，应随本次改动补齐，避免影响 Resize。
- ICO 已有 16/32/48/256 多尺寸 ICO、网站 ZIP（Apple 180、192/512 PNG）、真实尺寸预览与公开示例；明确尚无扩展图标包。
- 2026-11-01 文档已记录统计 403 修复及原五页 GSC 基线；不是本轮新查询的 GSC 状态。Safari/iOS 实机仍待验证。
- 用户提供的 KD、搜索量、引用域预算未获得原始报告验证；缺少 tga viewer 同口径搜索量与 SERP 明细。作为选题线索，不承诺半年排名或固定外链数量。
- 工作区保留大量之前批次未提交修改。实施前核对发布版本与本地差异，形成可回滚快照；不覆盖旧改动、不默认推送。

## 2. 最终范围与顺序

保留 TGA + Converter → Compress → ICO 的主顺序；Compress 拆单图目标和批量两批。指南以内容差异为发布门槛，不一次承诺两篇。每批独立更新实施记录、验证、部署和相关 lastmod。

| 批次 | 交付 | 新 URL | 发布门槛 |
|---|---|---:|---|
| A | TGA Viewer MVP + Converter 共用解码模块 | 1 | 支持矩阵、透明度、方向、坏文件与真实导出验证 |
| B1 | Compress 单图目标 KB | 0 | 按实际字节判定达标；未达标可解释；Resize 不回归 |
| B2 | Compress 小批量 + ZIP | 0 | 顺序处理、部分失败、命名、资源释放验证 |
| C | ICO 扩展 PNG 包及正文 | 0 | 四个 PNG 尺寸、manifest 路径与实际文件一致 |
| D | 目标大小压缩指南；评估 TGA 排错指南 | 0–2 | 不能只是重写工具页使用步骤 |

## 3. TGA Viewer MVP

### 定位与页面

- URL `/tools/tga-viewer`；Title `TGA Viewer — Open & Convert .tga Files | BriefVu`。
- H1 `TGA Viewer — Open, Inspect, and Convert TGA Files`。
- Description `Open supported .tga files in your browser. Inspect dimensions, color depth, and alpha, then convert TGA to PNG, WebP, or JPG. No upload or account.`
- 首屏上传/本地演示样本、预览、基本信息、转换。默认导出 PNG；JPG 明示透明区域将填充背景色。
- 页面重点承接“打不开/检查图片”；Converter 承接“已经知道要转换”。只增加一个 TGA 工具 URL，不建 tga-to-png/tga-to-jpg 独立页。

### 支持矩阵与边界

- 首批支持：24/32 位真彩色，无压缩 type 2 与 RLE type 10；8 位灰度，无压缩 type 3 与 RLE type 11。
- 首批明确不支持：16 位真彩色、索引色 type 1/9、16 位灰度、交错存储及未定义类型。显示检测到的类型/位深与不支持原因，不笼统显示“文件损坏”。
- 支持水平、垂直 origin 正确还原；RLE 每包输入、输出边界检查；文件头、ID 区、像素数据及可用扩展区均检查偏移与长度。
- 元信息显示原始位深、尺寸、压缩方式、声明的属性/Alpha 位、实际解码后的透明像素状态。32 位不能直接等同“有可见透明”。
- 根据有效 TGA 2.0 Alpha 属性解释像素；预乘 Alpha 若首批不能正确还原，则明确拒绝而非静默错误导出。旧文件属性含义无法确定时说明解释规则，不声称完全忠实还原。
- 初始保守产品上限建议 20 MiB、16MP、单边 8192px；实现时用实际设备样本确认。限制上传字节数和展开像素数，分配大缓冲前拒绝超限。
- 棋盘格/纯色背景，适应视口、100%、200%、400% 像素预览；不做画布编辑器、颜色管理系统、批量或高级检查面板。
- 不承诺保留 TGA 扩展元数据、色彩校正表或非方形像素显示比例；相关内容有影响时提示。

### 共用模块与 Converter

- 新增轻量共享 `lib/tga.ts`，返回尺寸、RGBA、元信息、明确错误；按需加载，两页同一实现。
- Converter 增加 .tga 输入与同一解码路径，复用现有输出及防止旧结果覆盖新结果的机制；不写第二套解码器。
- 不只依赖 MIME，TGA MIME 可能缺失；扩展名仅用于路由，内容仍需校验。
- 增加 `Convert TGA files` 正文约 150–200 词和 Viewer 链接；保留现有 TDK、ICO 入口、AVIF 输入说明。
- TGA → Converter（其他格式）、Compress（压小导出文件）、ICO（生成图标）；Converter → TGA；工具目录、相关工具与首页适当可发现入口同步。
- 工具之间尚不自动传文件，说明先下载再选择，避免误导。

### 正文与示例

保留打开步骤、TGA→PNG、JPG/WebP 与透明度、位深/Alpha、预览、兼容性/失败原因、FAQ。把“Batch convert several TGA files”改成真实 FAQ：目前逐张处理，不承诺批量时间。1,100–1,500 词仅作编辑参考；不为五次关键词或固定分数凑字。

一张可复现的含透明区域 TGA 真实操作截图，加一份可下载演示 TGA 足够；第二张只有在解释失败或背景差异时补。样本使用自制/可公开授权素材。

## 4. Compress：目标大小与小批量

### B1 单图目标

- 新增手动质量/目标大小模式，20/50/100/200 KB 预设与自定义值。界面明确 KB=1,000 bytes，目标为“不超过”，不保证恰好等于。
- JPEG/WebP 在限定质量区间内做有次数上限的搜索，建议最多 8 次编码；选择已实际编码、满足字节限制的较高质量候选，不承诺数学最优。
- PNG 不伪装为可通过质量滑杆控制的有损压缩。保留 PNG 导出，但目标模式提示选择 WebP/JPG，或缩小尺寸后重试。
- 默认保持像素尺寸。未达到目标显示最低已尝试质量、最小实际结果、目标差值和原因；建议 Resize 或换格式。首批不自动缩图，不静默牺牲尺寸。
- 实时反馈用短延迟编码并显示实际 Blob 大小与最终质量；处理中标注状态，废弃旧请求结果，不按输入大小或滑杆位置猜文件大小。
- 输出比原图大时明确显示；未达标结果仍可选择下载，按钮与结果标记不得表示已经成功达标。
- 透明图转 JPG 提示背景填充；验证实际 MIME 与下载扩展名，避免浏览器回退 PNG 后仍命名 .webp。
- 改动限制在 Compress 必要逻辑；Resize 做一次有代表性的输入/尺寸/导出回归，不进行无关重构。

### B2 批量

- 初始建议最多 10 张、总输入 100 MiB；沿用单图上限，并结合实测设置 ZIP 输出上限。顺序解码/编码，及时释放 bitmap/canvas/object URL。
- 每张显示原始大小、结果大小、质量、是否达标与错误；支持取消后续任务，单个失败不阻断其它文件。
- 成功文件可单独下载或 ZIP 下载。未达标文件明确标记，打包前让用户知道包含哪些结果；不把失败项冒充已处理。
- 文件名去除路径、同名添加后缀；现有 ZIP 实现只接受固定 ASCII 名称，不能直接塞入用户文件名。优先评估现有 Metadata 批量/ZIP 能力，小范围复用，不建通用任务系统。
- 新增正文：目标大小、为什么达不到 20KB、批量下载。后者只在 B2 完成后发布。

## 5. ICO：真正可用的 Chrome 扩展图标包

- TDK 保持当前值；保留现有 ICO 和 Website ZIP。
- 增加独立 `Download extension ZIP`，导出 icon-16.png、icon-32.png、icon-48.png、icon-128.png 与 README 配置片段。
- 128px 的必要交付是 PNG；无需为满足扩展需求把所有 ICO/网站包都改成新尺寸组合。
- Chrome manifest 的 `icons` 是尺寸到路径的对象，不是 PWA 那种数组；`action.default_icon` 使用与下载文件一致的 16/32 尺寸映射。配置是合并片段，不是完整可安装扩展。
- 两节正文合计约 300–400 词即可：Chrome extension icons（使用与配置）和 Extension icon sizes（尺寸表）。避免两节重复解释同一内容。
- 解释 128 安装/Web Store、48 扩展管理、16 扩展页 favicon、工具栏 16 DIP/高分辨率版本。说明扩展图标不使用 SVG/WebP，推荐 PNG。
- 不为此额外做 SVG 输入、Web Store 截图、完整扩展打包或新工具/指南 URL。
- Converter 已有 ICO 链接；必要时只更新该入口对新能力的描述。

## 6. 指南与 URL 预算

- 优先候选 `/guides/compress-image-to-target-size`：讲解大小限制、KB/KiB、尺寸/格式/质量取舍、透明图和照片案例；链 Compress、Resize、Converter。B1/B2 之后使用实际结果撰写，不承诺任意图片精确20KB。
- 暂缓一般性的“如何打开和转换 TGA”指南，它与 Viewer 的步骤、FAQ 高度重叠。
- 若后续能提供真实黑底、倒置、Alpha 歧义、16 位或索引色失败样例，再做差异化 TGA 排错指南，并据此确定标题/URL；不机械照原题建页。
- 不发布 Chrome extension 独立 guide。
- 现有31URL；仅TGA后32；再加压缩指南33；两指南都上线则34。新增工具只有一个，不代表新增URL只有一个。

## 7. 每批执行与验收清单

### 已完成的规划核查

- [x] 核对 Converter/Compress/ICO 代码与已有实施记录。
- [x] 核对 Chrome 官方 manifest、action 与 Canvas 编码要求。
- [x] 重取生产 sitemap：200、31唯一URL，无TGA。
- [x] 记录范围、暂缓项、指南去重与URL预算。

### A：TGA + Converter

- [ ] 核对当前发布/工作区差异，保留既有修改，登记批次清单与可回滚版本。
- [ ] 读取当前安装 Next.js 相关文档后再改页面代码。
- [ ] 实现共享解析模块与支持矩阵；Viewer/Converter 共用。
- [ ] 完成预览、元信息、PNG/WebP/JPG、失败提示与本地示例。
- [ ] 二进制 fixtures 覆盖支持类型、RLE两种包、四种方向、透明度/属性、截断、越界和超限；不要仅让自写编码器与自写解码器互相证明。
- [ ] 至少一个独立工具生成的已知图像验证方向/颜色/Alpha；浏览器导出重读验证 MIME、尺寸和透明区域。
- [ ] 注册目录、内链、canonical、WebApplication/BreadcrumbList、事件 allowlist 与 sitemap 新URL。
- [ ] 执行相关测试、lint/typecheck及发布构建一次；线上验证后记录结果与提交链接。

### B1/B2：Compress

- [ ] 先完成单图目标模式、实际大小与失败原因，验证极小目标/已小于目标/透明图/编码失败/过期结果。
- [ ] 验证 Resize 共用组件仍正常，完成 B1 发布记录与 lastmod。
- [ ] 再完成批量队列/取消/部分失败/同名文件/ZIP，验证文件数量和内容。
- [ ] 验证批量不会同时解码所有大图；完成 B2 发布记录与 lastmod。

### C：ICO

- [ ] 完成16/32/48/128 PNG包、README和两节正文。
- [ ] 解压验证尺寸、manifest 路径；保留旧ICO和网站ZIP的代表性回归。
- [ ] 更新真实修改页面 lastmod，发布记录与提交链接。

### D：指南

- [ ] 压缩指南以真实结果为素材，确认与现有 prepare-images-for-web 不重复。
- [ ] TGA指南有足够独立排错内容才创建；否则维持暂缓。
- [ ] 更新指南目录、相关内链、canonical与实际新增 sitemap 条目。

### 通用上线门槛与观察

- 页面200、self-canonical、无误加noindex、主要内容可抓取、内链目标存在；metadata与真实功能一致。
- Chrome桌面做必要功能验证；Safari/iOS有条件做一次重点验收，没测就记录未测，不填写已兼容。
- 原图不上传；统计只记录工具/动作或有限错误类别，不记录文件名、文件内容或图像元数据。
- 复用当前事件体系记录加载/导出；仅在需要区分目标未达标与解析不支持时增加有限枚举，不建分析后台。
- 每批更新真实修改页面的 lastmod，不全站刷日期。工具目录/首页/指南目录只有实际改动才更新。
- 每批上线后给用户新页与实质改动旧页的完整生产链接，由用户手动提交；不提前提交未上线URL。
- GSC扩展到TGA与Compress；记录索引/Google canonical/查询/展示/点击，标注QA事件污染。上线后7–14天看收录与失败，28天看查询方向，样本少则延长观察。
- 不把“OnPage90分”“关键词至少5次”“固定引用域数量”当未经测量的验收；使用明确可复核的功能与抓取条件。

## 8. 依据

- Chrome manifest icons 官方文档：https://developer.chrome.com/docs/extensions/reference/manifest/icons
- Chrome action 官方文档：https://developer.chrome.com/docs/extensions/reference/api/action
- Canvas toBlob：https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
- Truevision 原始格式规范（镜像；搜索索引可读，直接下载本轮失败）：https://raw.githubusercontent.com/DEAKSoftware/Truevision-TGA/master/truevision-tga.pdf
- Google sitemap / lastmod：https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- 旧批次总复查：PRODUCT_OPTIMIZATION_REVIEW_2026-11-01_CN.md
- 统计与收录基线：MEASUREMENT_BASELINE_2026-11-01_CN.md

开发时已按原始规范核对头字段、图像类型、RLE、origin 与 TGA 2.0 Alpha 属性。实现范围保持为常见子集，不声称支持全部 TGA 变体。

## 9. 实施结果与验证记录

### 已完成

- [x] 新建 `/tools/tga-viewer`：支持 type 2/10 的24/32位真彩色、type 3/11 的8位灰度；显示尺寸、位深、压缩、origin、声明Alpha与实际透明度；提供棋盘格、亮/暗背景、Fit/100/200/400%预览及PNG/WebP/JPG导出。
- [x] 对索引色、16位、交错、预乘Alpha、截断数据、RLE越界、文件/像素超限分别返回明确提示。
- [x] Converter 按需加载同一 `lib/tga.ts`，增加TGA输入、正文说明和Viewer反向链接；保留既有ICO任务入口。
- [x] Compress 增加质量/目标KB模式、20/50/100/200KB预设、最多8次实际编码、达标/未达标说明、最多10张/100MB顺序批量、单项结果与ZIP；不自动缩图。
- [x] 共享Resize/Compress组件补异步结果版本保护、忙状态、实际MIME校验与取消入口；Resize功能保持原模式。
- [x] ICO 增加Chrome扩展ZIP：16/32/48/128 PNG、README、`icons`对象及`action.default_icon`对象；保留ICO与Website ZIP。
- [x] 新建 `/guides/compress-image-to-target-size` 并加入指南目录；TGA通用指南按去重规则暂缓。
- [x] 工具注册、首页/工具目录、Related Tools、匿名事件allowlist、结构化数据、canonical和sitemap同步。

### 验证

- 单元测试：24个文件、120项全部通过；新增TGA解析、目标大小搜索、扩展manifest测试。
- TypeScript、ESLint、`git diff --check`、Next.js生产构建全部通过；新工具与指南静态生成。
- 本地浏览器：内置4×4透明TGA读取正确；FFmpeg独立生成的600×400、32位RLE TGA读取为Top left、声明8位Alpha且实际不透明，控制台无错误。
- 目标大小实际编码：公开600×400样本，20KB目标生成0.7KB WebP，100%质量并正确标记Target reached。
- 扩展ZIP实际解压：包含 `icon-16.png`、`icon-32.png`、`icon-48.png`、`icon-128.png`、`readme.txt`，配置路径一致。
- 生产部署：版本 `9d10f151-b32e-4415-a37c-fffcb8472f6a`。五个相关页面均HTTP 200且self-canonical。
- 生产sitemap：33个唯一URL；TGA、Compress、Converter、ICO、目标大小指南的lastmod均为2026-11-03。

### 保留边界

- Safari/iOS真机未测，不宣称已验证兼容。
- TGA索引色、16位、交错、预乘Alpha及批量转换未实现；页面已明确说明。
- 没有新增Chrome扩展独立页面或TGA通用指南；没有增加后端、账号、历史记录或自动缩图。
- GSC手动提交与新的查询/展示基线由用户后续执行；本批不自动请求索引。
