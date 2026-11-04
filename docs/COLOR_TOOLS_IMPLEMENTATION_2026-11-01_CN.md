# BriefVu 色彩工具第一批实施与验收

> 当前状态：本批已上线并验收。跨批次完成/暂缓/遗漏与下一步，以 [整体复查清单](PRODUCT_OPTIMIZATION_REVIEW_2026-11-01_CN.md) 为准；以下过程记录中的“待完成”描述的是当时状态。
日期：2026-11-01（Asia/Shanghai）。本轮：先查抓取与收录，再实现 Palette MVP 和 Picker 升级，最后更新 sitemap 并提供手动提交链接。

## 工作区保护

开始时已有修改：`app/sitemap.ts`、`app/sitemap.test.ts`、`app/tools/page.tsx`、`app/tools/image-converter/page.tsx`。保留这些修改；不恢复或覆盖。Converter / ICO / Metadata 批量不在本轮实施范围。

## 实施清单

- [x] 批次 0：检查生产首页、工具页、robots、sitemap、重定向、响应头；检查代码 canonical / noindex / 可发现性；记录 GSC 能力边界。
- [x] 批次 1：Palette MVP：本地图片导入、默认 5 色/最多 10 色、主色和平均色、透明像素规则、HEX/RGB/HSL、复制、CSS/JSON 导出、空结果/错误/大图限制。
- [x] 批次 1 验证：代表色与平均色样本、透明/全透明图、确定性、尺寸限制、导出内容；更新结果。
- [x] 批次 2：Picker 前景/背景对比度、普通/大字 AA/AAA、透明色合成、共享 CSS/JSON 导出、双向意图内链；保留 TDK。
- [x] 批次 2 验证：WCAG 已知色对、阈值边界、透明度、交互与导出；更新结果。
- [x] 批次 3：首页、目录、相关工具入口、事件白名单；Palette 服务端正文/metadata/面包屑；只更新实际变化页面 lastmod。
- [x] 总验收：单元测试、lint、生产构建、浏览器交互与移动端布局、实际 sitemap.xml/HTML 检查。
- [x] 交付：记录上线状态、外部待核实项和手动提交链接。

## 产品与技术约束

- 图片与提取内容不上传；事件仅工具 ID / 动作，不含文件名、颜色或图片数据。
- Palette 与 Picker 分别负责整体代表配色和精确单点取色。
- 第一版不做局部框选、Tailwind 匹配、批量调色板；不新增对比度或平均色 URL。
- 平均色固定算法并在界面说明；代表色按透明度加权、忽略全透明像素；同一输入结果稳定。
- 文件大小、解码尺寸和采样规模分别限制；加载失败不展示上一个文件的结果为新结果。
- sitemap 按页面真实重大修改日期维护，不按构建日期刷新全站。
- GSC 收录报告/实时检查及 Cloudflare 认证日志不可由模拟 Googlebot UA 代替。无法访问时明确记录待核实，不宣称已收录或 Googlebot 被挡。

## 批次进度与证据

### 初始化

- 已读仓库 AGENTS.md，以及本地 Next.js 的 Server/Client Components、robots、sitemap 文档。
- 已核对原有修改；当前尚未改产品代码。

## 手动提交链接（已部署并验证）

- 新页：https://briefvu.com/tools/color-palette-from-image
- 更新页：https://briefvu.com/tools/image-color-picker
- sitemap：https://briefvu.com/sitemap.xml

2026-11-01 已完成生产部署和检查，可手动提交下列页面；没有代用户点击 GSC 请求编入索引。

本轮同时更新的辅助页面：

- https://briefvu.com/ （新增 Palette 入口）
- https://briefvu.com/tools （工具目录和既有 TDK 调整）
- https://briefvu.com/tools/image-converter （保留并发布工作区原有 Description 调整，无功能变化）

### 批次 0 / 抓取与收录（进行中）

- 2026-11-01 通过 curl 读取生产：首页、目录、Picker、robots.txt、sitemap.xml 均为 200，无 X-Robots-Tag/noindex。www Picker 为 308 到非 www 同路径。
- 生产 robots 包含 `Allow: /`、`Disallow: /api/` 与 sitemap 声明；不能把禁用 Google-Extended 等训练抓取器当作禁用 Googlebot。
- 生产 sitemap 29 条、统一日期 2026-10-20。此前 Python/Web 抓取的 403 并非当前所有客户端均被阻止。
- 发现 HTTP 主域首页返回 200；代码已补 HTTP → HTTPS 308，保留 path/query、保留 localhost 开发访问。3 个测试文件 / 8 测试通过（包含原 sitemap 基线）。
- 已通过用户现有 Chrome 登录态读取 GSC domain property：概览 28 已收录 / 15 未收录、0 搜索点击；索引报告更新时间 2026-10-23，不是今天实时覆盖率，也不等于 28 个当前工具页。
- 未收录分布：404 5、重定向 2、robots 1、正确 canonical 的备用页 1、已发现未收录 4、已抓取未收录 2。
- robots 样本为 `https://apps.briefvu.com/photocraft/?from=photocraft-online`，是独立编辑器运行页，不放开索引。
- 已发现未收录：`/privacy`、`/terms`、`/tools`、`/tools/wordcraft-online`。本轮优先改善目录发现与新页内链，不盲目扩展页面数。
- 已抓取未收录：`/opengraph-image` 及其查询参数版本，都是图片资源，不是工具页，不为消除报告条目而更改。

### 批次 1 / Palette 算法与界面

- 已实现透明度加权的颜色分组、默认 5 / 可选 2–10 色、主色、线性光平均色；取样限制 256 × 256、源图 20 MB / 20 MP / 8192px。
- 已实现本地导入、失败清空旧结果、HEX/RGB/HSL、单色复制、CSS/JSON 共享导出、全透明空状态。
- `npx vitest run lib/color-palette.test.ts`：6/6 通过。纯色不捏造颜色，透明权重/平均色/确定性/数量/导出 alpha/尺寸边界有样本覆盖。
- 新页正文和 metadata 已实现；真实浏览器操作与移动端待总验收。

### 批次 2 / Picker 升级

- 已增加可独立使用的前景/背景 HEX 输入、使用取样色作为文字、透明度、普通/大字 AA/AAA；判断使用未四舍五入比值。
- 已接入共享 CSS/JSON 导出并保留 alpha，新增两页顶部互链和使用说明；Picker 原 Title/Description 保留。
- `npx vitest run lib/color-contrast.test.ts lib/color-palette.test.ts`：10/10 通过。黑白 21:1、同色 1:1、#777777 阈值、透明合成与阈值边界均验证。
- `npx tsc --noEmit`：通过。浏览器操作验证待完成。

### 批次 0 补充结果

- GSC sitemap：2026-10-16 提交、2026-10-29 最后读取成功，发现 29 页；不需要通过伪造 lastmod 来证明站点“活跃”。
- 404 五条均为旧产品：`/use-cases/screen-printing-enquiries`、`/guides/custom-apparel-quote-intake-checklist`、`/use-cases/embroidery-enquiries`、HTTP/HTTPS 的 `/custom-apparel-intake-software`。当前 sitemap 无这些 URL，没有等价新内容，不重定向到不相关首页。
- 全量 `npm test`：18 文件 / 89 测试通过；`npm run lint` 通过。接下来做实际浏览器导入、导出、错误状态和手机宽度检查。

### 抓取检查最终结论

- Picker URL 检查：已收录；2026-10-24 07:15:25 由 Googlebot 智能手机版抓取成功；允许抓取与索引；Google canonical 与声明 URL 一致。
- 2026-11-01 18:54（北京时间）GSC 实时测试：网址可编入 Google 索引，路径 1 项有效。只做测试，没有点击“请求编入索引”，保留用户手动提交。
- 没有证据证明主站整体抓取被阻止；“零收录”前提已被 GSC 反证。仍不能把聚合 28 页当成全部当前 19 个工具页均已收录。

### 浏览器验收（Chrome，进行中）

- 600×400 五色 PNG 实际导入：识别五色；改为 10 色仍只返回五色，并解释不捏造额外颜色。
- 修正采样：关闭缩小时的插值，避免纯色色块边缘生成额外混合色。
- HSL 单色复制成功；JSON 实际下载到用户 Downloads，解析有 average、dominant、palette-1…5，字段与界面一致。
- 390×844：document scrollWidth=390，没有横向溢出。保存 desktop/results/mobile 实际截图到 `docs/qa/color-tools-2026-11-01/`。
- 全透明 PNG：明确空结果，不出现黑色色板或导出面板。
- 损坏 PNG：可读解码失败提示，旧结果与导出面板清空。
- 已完成一次生产 Next 构建；保持仓库原有 OpenNext Edge Middleware 兼容方式（构建有已知弃用警告，不在本轮迁移）。后续 sitemap 和最后修正完成后重新构建部署包。

### Picker 浏览器验收完成

- 默认黑白为 21:1、四项通过；#777777 / 白色为 4.48:1，普通 AA/AAA 不通过，大字 AA 通过。非法 HEX 显示错误且不展示旧比值。
- 真实半透明 PNG 取样 alpha=128，使用为文字后白底对比度 4.00:1；CSS 复制得到 `--picked-color: #00000080`，透明度保留。
- 390px 下 Picker 页面 scrollWidth=390；桌面/手机截图已保存。无应用 console error；发现 Next smooth-scroll 属性提醒并按本地 v16 文档补充 `data-scroll-behavior`。
- Picker 同时修复并发图片解码的旧结果覆盖，以及换图失败后保留旧结果的问题；共享剪贴板失败回退。

### sitemap 与发现入口

- 首页/目录登记新 Palette，Picker 与 Palette 顶部及正文互链，相关工具区按意图关联。
- sitemap 新增 Palette，共 30 条（当前运行时工具可用配置）；本次 /、/tools、Palette、Picker 更新到 2026-11-01。
- Converter 工作区已有 Description 调整一并标记 2026-11-01；没有改 Converter 功能。其余页维持 2026-10-20，不使用构建时间。
- 保留已有不输出 priority/changeFrequency 的修改；新增日期/唯一 URL 与事件隐私白名单验证。

### 最终本地验收 / 发布准备

- `npm test`：18 文件 / 91 测试通过。
- `npm run lint`：通过；构建内 TypeScript：通过；`git diff --check`：通过。
- `npx opennextjs-cloudflare build`：通过，生成 `.open-next/worker.js`。首次构建被本机 Wrangler 注册目录写权限阻止，经授权沙箱外执行成功。
- 实际本地 HTTP 检查：新旧两页 200、各一个 H1、正确生产 canonical、JSON-LD 可解析、无 noindex；实际 `/sitemap.xml` 30 个唯一 URL，5 个日期更新、25 个保留。
- 验证环境：Chrome 桌面与 390×844 响应式视口。未将其声称为 Safari/iOS 真机测试；AVIF 解码仍由浏览器决定。
- 发布认证预检：`.env.local` 的旧 Token 无目标 Worker 访问权；现有 Wrangler OAuth 也已过期。未更改凭据文件内容，正在恢复 OAuth 登录。生产上线成功前，新页不可提交。

### 发布认证恢复

- 用户批准后，恢复 Wrangler OAuth 登录；未使用无权访问目标 Worker 的旧 API Token。
- 登录范围限定为 account/user/zone 读取与 Workers/script/route 写入（以及 CLI 自动加入的后台刷新权限）；没有使用 Wrangler 默认的 D1、邮件、AI、队列等额外范围。
- 浏览器显示 Authorization granted，CLI 显示 Successfully logged in。
- 已启动现有 Worker 部署，使用 `--env-file /dev/null --keep-vars`，保留生产变量；待生产验证后更新最终版本号。

### 发布命令修正

- 第一次发布被 OpenNext 自动代理到其 deploy 命令；该命令重新加载 `.env.local`，导致旧 API Token 覆盖已恢复的 OAuth，远程拒绝访问。该次未发布新 Worker。
- 从已安装 Wrangler/OpenNext 实现确认：`OPEN_NEXT_DEPLOY=true` 防止自动回调 OpenNext deploy。当前项目使用默认配置，无需填充增量/标签缓存。
- 部署改为从已验证的 `.open-next` 产物直接执行 `OPEN_NEXT_DEPLOY=true wrangler deploy --env-file /dev/null --keep-vars`；已更新 `package.json` 的 deploy 命令，避免下次再次遇到凭据污染。没有修改或输出 `.env.local` 中的密钥。

### 发布完成与生产验收

- 生产版本：`baa9cd9c-e3c2-4121-85b8-f53d8f913176`，Worker `briefvu-tools`；2026-11-01 上线。
- 新 Palette、升级 Picker、首页、工具目录、Converter 均返回 200，canonical 指向对应 HTTPS 非 www URL，每页一个 H1、无 noindex。
- 生产 sitemap.xml 已为 30 个唯一 URL；仅 /、/tools、Palette、Picker、Converter 五个 lastmod 为 2026-11-01，其余 25 条保留 2026-10-20。
- 生产 robots.txt 返回 200，保留 sitemap 声明；HTTP Picker 带 query 308 到 HTTPS 同路径/query，www 新 Palette 308 到非 www。
- Chrome 生产实测：新 Palette 导入真实五色 PNG 输出正确五色；Picker #777777 / 白色比值 4.48:1、普通 AA 不通过、大字 AA 通过；生产控制台无 error。
- HTTP 验收证据：`docs/qa/color-tools-2026-11-01/production-smoke.json`；生产提色截图：`palette-production.png`。
- 未提交 GSC 请求索引、未宣称新 Palette 已收录。建议用户先提交新页和更新 Picker，再视需要提交目录与其它更新页；sitemap 使用现有地址。
- 本轮不含 ICO、Metadata 批量、Tailwind 匹配或高级 Palette 功能；下一批按原产品方案继续。

## 后续批次

2026-11-01 启动 [ICO MVP 与 Converter 任务入口](ICO_IMPLEMENTATION_2026-11-01_CN.md)，独立记录范围、测试与上线证据。

第二批现已上线并验收：ICO 新页 + Converter 任务入口，生产版本 `b3dab3e9-e246-465d-ad88-6247beb4f87e`，sitemap 为 31 条；详见第二批清单。
