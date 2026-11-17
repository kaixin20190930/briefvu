# 图片工作流实施清单（2026-11-17）

依据：用户提供的 11 月 17 日复核方案。顺序为精灵工具与指南 → 打印图片 → 像素化；每批必要验证、提交推送后部署，再记录线上结果。不改 PSD 页面、C2PA 和 ICO 定位，不新增后端。

## 现状与范围修正

- [x] PSD 四个小节已经完成，本轮冻结 Title、H1、URL 和正文。
- [x] TGA Description 与目标句完全一致，不重复修改或刷新 lastmod。
- [x] ICO 的 `five-color-reference.png` 实际为 600×400 PNG；`ico-fit-preview.png` 实际为 1102×717 界面截图（JPEG 编码）。保留正确的样图下载链接，不替换为截图。
- 方案中的搜索量、DR 和竞争数据视为用户提供的研究输入，本轮不重新购买或推算数据；排名目标只作观察，不承诺上线即达成。
- 海报页仍受 DR≥10 门槛限制，当前未提供达标证据，不开发、不挂空链接。法线贴图、PDF/A3 输入、模板、AI 放大和独立站均不做。

## 第一批：Sprite Sheet Maker 与指南

- [x] 多张 PNG/JPG/WebP 输入，统一透明网格；帧拖拽/按钮排序、删除、复制。
- [x] 列数、帧间距、外边距；网格预览、动画和逐帧预览；PNG 与 JSON 坐标导出。
- [x] 保留 GIF→Sheet、Sheet→GIF 两条路径及原有切片设置。
- [x] 工具 TDK/H1/H2 更新；指南只调整标题、导语和重复工具链接，保留正文意图。
- [x] 更新目录名称、相关日期；必要算法测试与浏览器基础流程验证；提交、推送、部署和线上复核。

## 第二批：Print Image on Multiple Pages

- [x] 新 URL `/tools/print-image-multiple-pages`；JPG/PNG/WebP，按图像方向解码。
- [x] 实际尺寸或横纵纸张数；mm/cm/in、比例锁定、A4/Letter、方向、留白与重叠。
- [x] 拼装示意、有效 PPI、裁切线、行列编号、多页 PDF、第一页试打、100mm 校准尺。
- [x] 文件/像素/页数限制与失败提示；透明图像铺白；PDF 固定纸张尺寸与连续裁切。
- [x] 指定 TDK/H2、步骤、FAQ/SoftwareApplication/BreadcrumbList；首页、crop、resize 内链。
- [x] 必要布局/PDF 检查、浏览器导出与线上复核；实物打印仍在人工待办，不能以 PDF 检查代替。

## 第三批：Pixelate Image

- [x] 新 URL `/tools/pixelate-image`；16/32/64/128 和自定义目标像素宽度。
- [x] 原色、自适应 N 色、自定义 HEX；无/Bayer/Floyd–Steinberg 抖动。
- [x] 框选局部处理、像素网格预览、手动模糊模式；不做自动人脸识别。
- [x] 原始尺寸与 2×/4×/8× 最近邻 PNG 导出；明确局部像素化不保证敏感信息无法恢复。
- [x] 指定 TDK、H2 与内链；必要算法验证、浏览器基础流程、提交推送、部署和 sitemap 复核。

## 暂缓及人工事项

- [ ] 海报专页：验证 DR≥10 后再评估与打印页的意图区分，复用打印核心，不提前新建 URL。
- [x] 精灵页按查询拆分的 GSC 基线：11 月 18 日已读取收录、抓取、规范网址与 28 天查询明细，见文末记录。
- [ ] printtiler 外链结构：需 Ahrefs 数据，本轮不以未经核实的引用域数制定承诺。
- [ ] 每周两批外链、每批 5–10 个，使用现有 `docs/backlinks/LISTING_KIT_EN.md`；历史 prospects 清单需重审相关性；本轮不代用户向第三方公开发帖。Product Hunt 仍需先完成既有 iPhone 真机待办。
- [ ] 实物打印第一页，核对校准尺为 100mm、选 Actual size / 100%、关闭 Fit；再验证相邻页拼接。
- [ ] 后续观察：精灵 3 个月前 20、打印 3 个月前 20、像素化 3 个月前 30 / 6 个月前 10，仅作为复核目标。

## 执行记录

- 初始工作区干净；已读本机 Next 的 page 与 sitemap 文档。仅新增两个可立即实施的 URL，海报页暂缓。

- 第一批验证：布局与 sitemap 共 4 项检查通过，变更文件 ESLint、Next 构建通过。独立浏览器导入 12 个 16×16 PNG，排序/复制/删除后导出 76×58 PNG 与 JSON（12 帧，spacing=2，margin=3），下载文件尺寸及坐标一致；原 Sheet→GIF 路径按同一网格导出 12 帧 GIF 成功。第一批提交 `5718f28` 已推送；Cloudflare `d5263df1-83f1-49e6-84fb-f8af36d74960` 已部署，独立浏览器线上确认 Maker H1 与三条处理路径。

- 第二批（2026-11-18）：布局/纸张/PDF 与 sitemap 共 5 项检查通过，变更文件 ESLint 和 Next 构建通过。浏览器用公开透明 PNG 导出 1 页试打 PDF 与 6 页完整 PDF，控制台无错误；PDFium 已渲染检查全部 6 页：A4 为 595.276×841.890 pt、透明背景铺白、上下/左右连续及重叠标记正确；实物校准仍待用户执行。
- 外链材料发现旧版服装报价产品介绍及付费试点，已改为当前图片工具的免费本地处理定位，并列出七平台人工提交队列；未实际投稿。

- 第二批依赖：固定 `pdf-lib@1.17.1`，仅导出时懒加载。未新增图片上传接口。PDF 样本渲染在 `/tmp/briefvu-print-contact.png`，未将下载或临时测试产物放入公共站点。

- 第二批上线：提交 `3dbd13b` 已推送；Cloudflare `f1f97d0f-dd10-4469-ae90-92bb7752bac6` 已部署。打印页已进入 sitemap（29 条），第三批完成后统一复核最终 30 条。

- 第三批（2026-11-18）：129 项现有与必要新增测试全部通过；变更文件 ESLint、Next 构建通过。浏览器选择 x=100/y=40/w=180/h=200 区域，以 16 列黑白自定义色板与 Floyd–Steinberg 抖动导出 1200×800 PNG；文件检查确认选区外显示像素一致、2× 为最近邻复制、选区只含黑白、预览网格和选框未写入输出。
- 提交复核发现第二批 landing page 路由未被纳入 `3dbd13b`，已补交 `f1bef2f`，确保线上打印页源码可追溯；第三批部署前再次核对全部新文件进入 Git。
- 第三批上线后统一复核新页面、首页/目录与上下游内链、canonical、结构化数据和最终 sitemap；不重复提交 GSC 索引请求。

- 第三批首次部署：提交 `36fe01f`；Cloudflare `9ac77d5e-04a2-45ac-ba73-fea58671f009`。线上浏览器确认像素化入口可用。最终复核发现校准尺/页码位于纸边，可能被打印机留白裁掉；已改为在声明的可打印区域内额外预留侧边 3 mm、上下 6 mm，标记及尺子均放在留白内侧。此必要修正已由提交 `3322805` 上线，最终 Cloudflare 版本为 `286883fb-00fd-45a9-b7c8-55c155fe3b3d`。


## 最终复核与手动提交（2026-11-18）

- [x] 三批已实施内容均进入 Git、推送并部署。最终产品提交 `3322805`，Cloudflare `286883fb-00fd-45a9-b7c8-55c155fe3b3d`。
- [x] 线上 9 个相关页面均返回 200；canonical、工具/指南标题分工、首页与 crop/resize/photo-editor/sprite 的内链通过检查。指南仅保留一处指向精灵工具的链接。
- [x] sitemap 共 30 条；新增 print 与 pixelate，未加入受门槛限制的海报 URL。对应变更页按 11 月 17 / 18 日实际日期更新，PSD 保持 11 月 16 日，TGA 与 ICO 保持 11 月 9 日。
- [x] 129 项测试通过；最后的打印留白修正另通过 5 项针对性检查、ESLint、发布构建与第一页 PDF 渲染。校准尺、页码和裁切标记在打印机留白内侧，不依靠超出可打印区的纸边。
- [x] 线上复核明细：`docs/qa/image-workflows-2026-11-18/production-smoke.json`。发布复核时未向 GSC 重复提交索引请求；11 月 18 日后续已按用户要求提交两个新页面，见下文。HTTP 200 不代表已收录。
- [ ] 人工验收仍保留：真实打印 100mm 校准尺与相邻页拼装；iPhone 编辑器既有待办；外链实际投稿。GSC 查询基线已补齐。PSD 正文中两处 PhotoCraft 旧 H2 属于可选后续文案，本轮按冻结范围保留。

已于 2026-11-18 通过 GSC 请求编入索引的新页面（无需再次手动提交）：

1. https://briefvu.com/tools/print-image-multiple-pages
2. https://briefvu.com/tools/pixelate-image

本轮未追加索引请求的已有页面（sprite 已确认收录；指南未检查，不例行重复提交）：

- https://briefvu.com/tools/sprite-sheet
- https://briefvu.com/guides/sprite-sheet-game-development

站点地图：https://briefvu.com/sitemap.xml 。海报页等待 DR≥10；外链与排名仍是后续工作，不能将本轮功能上线写成已完成获客或排名目标。

## GSC 索引请求与精灵页基线（2026-11-18）

本次只操作 `sc-domain:briefvu.com` 的 GSC 并更新记录；未修改页面内容、TDK、内链或 sitemap，未重新部署。直接核对 GSC 界面确认结果，不以 HTTP 状态推断收录。

- [x] `/tools/print-image-multiple-pages`：检查时「网址尚未收录到 Google／Google 无法识别此网址」，无上次抓取、引荐站点地图及规范网址记录。点击请求并等待实际网址检查完成，收到「已请求编入索引／已将网址添加到优先抓取队列中」。
- [x] `/tools/pixelate-image`：同样尚未收录、Google 无法识别，暂无抓取与规范网址记录；已收到相同提交成功确认。
- [x] 两页各提交一次；排队不等于已抓取或已收录，不重复消耗配额。
- [x] `/tools/sprite-sheet`：已收录。上次抓取为 **2026-11-13 17:23:39（GSC 界面原值）**，Googlebot 智能手机版；允许抓取、抓取成功、允许索引。用户声明 canonical 为自身，Google 选择「所检查的网址」；HTTPS 有效，检测到 1 项有效路径内容。引荐页为 `/tools/remove-metadata`。
- [x] 精灵页发现信息中的「站点地图」显示 **临时处理错误**，如实记录，不能据此判定当前 sitemap 不可访问。该页当前仍已收录；最后抓取早于 11 月 17 日升级，尚不能确认 Google 已抓取新版 Maker。此次只读该页，未额外请求重抓。

### Sprite-sheet 搜索表现

口径：搜索类型「网页（文本）」；网页「完全匹配的网址」为 `https://briefvu.com/tools/sprite-sheet`；所有国家/设备；**2026-10-20 至 2026-11-16，28 天**。GSC 界面提示上次更新为 3.5 小时前。该区间早于新版上线，作为升级前基线。

| 指标 | 基线 |
|---|---:|
| 点击 | 0 |
| 展示 | 13 |
| CTR | 0% |
| 平均排名 | 66.7 |
| 可见查询行 | 12 |

| 查询（保留 GSC 原文） | 点击 | 展示 | CTR | 平均排名 |
|---|---:|---:|---:|---:|
| spritesheet extractor | 0 | 1 | 0% | 2.0 |
| create sprite sheet online | 0 | 1 | 0% | 3.0 |
| make sprite sheet online | 0 | 1 | 0% | 27.0 |
| how to create a sprite sheet froma gif | 0 | 1 | 0% | 85.0 |
| sprite converter | 0 | 1 | 0% | 85.0 |
| gif to sprites | 0 | 1 | 0% | 90.0 |
| video to sprite sheet | 0 | 1 | 0% | 90.0 |
| sprite sheet maker from gif | 0 | 1 | 0% | 92.0 |
| gif spritesheet | 0 | 1 | 0% | 94.0 |
| gif maker from sprite sheet | 0 | 1 | 0% | 96.0 |
| gif sprite sheet maker | 0 | 1 | 0% | 96.0 |
| sprite gif maker | 0 | 1 | 0% | 99.0 |

查询表合计 12 次展示，页面汇总 13 次；GSC 查询明细可能因隐私过滤等口径不完整，不补造缺失词。单词仅 1 次展示，#2/#3 不视为稳定排名；`video to sprite sheet` 仅记录，不扩展不具备的视频输入能力。`create sprite sheet online` 与 `make sprite sheet online` 共 2 次展示，原有提取意图 `spritesheet extractor` 为 1 次；其余词逐行保留，不据低样本改变入口。主词 `sprite sheet maker` 未出现于可见查询，不等于没有需求。

凭据保存在 `docs/qa/image-workflows-2026-11-18/`：`gsc-print-index-request.jpg`、`gsc-pixelate-index-request.jpg`、`gsc-sprite-index-status.jpg/.txt`、`gsc-sprite-performance.jpg/.txt`。

- [ ] 下次人工复核：11 月 25 日左右检查两个新页是否抓取/收录、sprite 最后抓取是否晚于升级，并复查站点地图临时处理提示；对比同口径数据，另单列 11 月 17 日之后的上线后表现。期间冻结页面内容，不因单次低样本排名再改定位。
