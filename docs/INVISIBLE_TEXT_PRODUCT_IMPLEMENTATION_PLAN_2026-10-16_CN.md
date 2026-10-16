# BriefVu Invisible Text：完整实施方案

日期：2026-10-16
状态：实施基线 v1，先 review 后开发；不包含生产部署。

## 1. 产品结论

BriefVu 从定制服装询价产品转型为自营小工具平台。第一款正式工具是 **Invisible Text Generator**：用户在 BriefVu 内选择不可见字符、生成指定数量、复制、粘贴验证，并理解不同字符的兼容差异。

本产品不是第三方工具目录，也不是单纯 SEO 文章。核心结果必须在页面内完成。第一版核心功能免费、无需登录、浏览器本地执行；统一订阅能力留给后续批量工具、保存 preset、历史和跨工具权益，不能为了收费而锁住“一键复制”。

## 2. 附件方案 review

### 保留

- 搜索落地页首屏直接出现工具；
- 单一主流程：选择用途/字符 → 数量 → 复制 → 验证；
- 复制按钮必须有可见状态、图标变化与无障碍 live region；
- 测试区有价值，但不能抢占主流程；
- 无后端、无上传、低 JS、移动端优先；
- 首屏和工具区不放广告。

### 修正

1. **不能声称 U+200B 通吃所有平台。** Unicode 将 U+200B 定义为零宽格式控制字符（General Category `Cf`），属于 default-ignorable code point，平台可能移除。U+3164 和 U+2800 也不是永久兼容方案。
2. **不把“空白字形”“格式控制”和“Unicode whitespace”混为一谈。** U+3164 是 `Lo` 且属于 Default_Ignorable_Code_Point；U+2800 是 `So`，许多字体把它渲染成固定宽空白，但它不是空格；U+200B 是允许不可见换行机会的 `Cf`；U+2060 是阻止换行的 `Cf`；U+00A0 是禁止换行的 `Zs/White_Space`。实际宽度、字形、规范化和平台处理会变化。
3. **不制造伪预览。** 预览用可见 token/标尺表达数量，剪贴板内容仍是原始字符；不能用 CSS 宽度假装字符真实宽度。
4. **不承诺具体平台永久可用。** 仅给“推荐起点”和“本地测试”，兼容性注明会随平台验证规则变化。
5. **FAQ 保留给用户，不依赖 FAQ rich result。** 结构化数据以 `WebApplication` 和 `BreadcrumbList` 为主；FAQPage 不是流量承诺。
6. **不做一个孤立广告页。** URL、导航、工具注册表和设计系统必须支持未来增加无关工具；广告不是第一版收入前提。

## 3. 用户任务与范围

### 核心任务

> 我需要一段看起来为空、但能复制粘贴的 Unicode 文本，并希望知道目标输入框有没有保留它。

### V1 必须完成

- 默认推荐 U+3164（Hangul Filler）作为 General blank 的**测试起点**，不承诺通用兼容；
- 可选 U+2800（Braille Pattern Blank）、U+200B（Zero Width Space）、U+2060（Word Joiner）和 U+00A0（No-Break Space）；
- 数量 1–500，支持减、加、数字输入和常用快捷数量；
- 一键复制，Clipboard API 失败时有安全降级；
- 复制成功/失败反馈，不要求用户猜测；
- 本地 Paste-back verifier：复制后只在当前组件 state 保存 expected payload；用户可去目标应用粘贴，再复制回来，对比是否 exact match、changed/normalized、removed 或包含额外可见内容；
- 总字符数、支持字符数、其他 Unicode whitespace、其他 code point 和 code point 列表；三类互斥且总和等于总 code points；
- 清空测试区；
- 字符差异、用途、安全提醒、FAQ；
- 完整 metadata、canonical、OG、sitemap、robots、WebApplication JSON-LD；
- 键盘可操作、44px 触摸目标、reduced-motion 兼容；
- 纯浏览器处理，不记录用户粘贴文本。

### V1 不做

- 不保证 WhatsApp、Discord、Instagram、游戏等永久接受某字符；
- 不绕过平台审核、禁言、用户名规则或反作弊；
- 不加入账号、支付、广告、数据库、OpenAI API；
- 不批量生成 SEO 薄页；
- 不把普通空字符串说成已复制字符。

## 4. 信息架构与 SEO

```text
/                         BriefVu 工具平台首页，突出第一款工具
/tools                    自营工具目录
/tools/invisible-text     唯一可索引的完整工具页
/privacy                  浏览器本地处理和分析边界
/terms                    使用边界和免责声明
```

工具页：

- Title：`Invisible Text Generator — Copy Blank Characters | BriefVu`
- Description：`Generate, copy, and test invisible Unicode text in your browser. Choose blank or zero-width characters, set a quantity, and verify what was preserved.`
- H1：`Invisible Text Generator`
- 主词：`invisible text generator`
- 次词：`invisible text copy and paste`、`blank character`、`empty character`、`zero width space copy`
- 不把不可见字符硬塞进 title 制造欺骗性 SERP 外观。

页面顺序：工具 → 字符差异 → 三步使用 → 常见用途与限制 → FAQ → 相关自营工具占位。工具页首屏不出现长表格、广告或多套 Method。

## 5. 产品交互

### 主工具

1. 用途提示默认选择“General blank”；
2. 字符卡展示可读名称、code point、宽度类型和简短风险；
3. 数量默认 1，上限 500；
4. 预览展示 `1 invisible character` 和对应数量的可见 token，不泄露/替换真实 payload；
5. 主按钮 `Copy invisible text`；成功后变为 `Copied`，约 1.5 秒恢复；
6. 提供手动复制降级区，但默认不展开。

### Paste-back verifier

- 用户复制生成结果后，可在目标应用粘贴，再复制回来放进验证区；BriefVu 只比较粘回的 code point 序列，不能自动检测目标平台；
- 显示 `Exact match`、`Changed or normalized`、`Removed`、`Extra visible content` 或“尚无 expected payload”；
- 使用互斥分类优先级：支持的 blank/control 显式表 → 其他 Unicode whitespace → 其他 code point；
- 显示总字符、支持字符、其他 whitespace、其他 code point；三类之和必须等于总数；
- code point chip 最多显示合理数量，超出时汇总，避免巨大 DOM；
- 内容只存在 React state，不发请求、不写 localStorage、不进 analytics。
- 明确提示 U+3164 在 NFKC 下会变为 U+1160、U+00A0 在 NFKC 下会变为普通 SPACE；平台可能 strip 或 normalize。

### 复制实现

- 首选 `navigator.clipboard.writeText(payload)`；
- 降级为临时只读 textarea + selection + `document.execCommand("copy")`；
- 失败时保留可选择的原始 payload，并给明确提示；
- 不在日志或错误报告中写 payload。

## 6. 技术架构

保留现有 Next.js 16.3.1、React、TypeScript、OpenNext Cloudflare、字体和最小部署配置。

```text
app/
  layout.tsx
  page.tsx
  globals.css
  tools/page.tsx
  tools/invisible-text/page.tsx
  privacy/page.tsx
  terms/page.tsx
  robots.ts
  sitemap.ts
  opengraph-image.tsx
components/
  SiteChrome.tsx
  ToolCard.tsx
  InvisibleTextTool.tsx       # 唯一主要 Client Component
  JsonLd.tsx
lib/
  site.ts
  tools/registry.ts
  invisible-text.ts          # 字符目录、生成、分析，纯函数
  invisible-text.test.ts
  canonical-worker-redirect.ts
config/
  canonical-hosts.json       # canonical 与 legacy host 单一配置源
middleware.ts                # OpenNext 1.20 所需的 Edge 兼容层
worker.mjs                   # Cloudflare 最外层 canonical 308，先于 OpenNext
```

页面和静态内容保持 Server Components；只有需要 state、事件和 Clipboard API 的 `InvisibleTextTool` 使用 `"use client"`。不增加运行时依赖。

## 7. 旧产品代码清理清单

用户已明确授权删除当前产品无关代码。删除范围限定如下：

- 旧服装询价页面：`custom-apparel-intake-software`、`use-cases`、`examples`、旧 guide；
- 旧 API：`api/analyze`、`api/events`、`api/pilot`；
- 旧组件：IntakeWorkspace、PilotApplication、ContentPage、ChecklistActions；
- 旧业务库与测试：parser、job rules、pilot、monitoring、scenarios、旧 SEO 页面配置等；
- 旧 D1 migrations 和 D1 binding；
- 旧生产监控脚本与对应 package script；在删除前核验所有关联自动化已暂停或已迁移；
- Next headers 中旧路由；
- 旧服装业务 metadata、OG、sitemap、文案和样式。

保留：Git、环境文件、Cloudflare 域名路由、OpenNext 配置、`middleware.ts`、`lib/domain-redirects.ts` 及其 canonical host 308 测试、通用 JsonLd、通用 `scripts/backlink-report.mts`、站点 URL helper（重写文案）、可复用字体和构建工具。由于 Next 16 `proxy.ts` 是 Node-only，而 OpenNext Cloudflare 1.20 不支持 Node Proxy，发布路径暂时保留 deprecated Edge Middleware，并在 `worker.mjs` 最外层完成 canonical 308；待适配器支持 Node Proxy 后再迁移。历史 `docs/` 暂不删除，因为它们不是运行时代码且可用于追溯；后续可单独归档。

移除 D1 是代码解绑：同步移除 `package.json` 的 `predev` migration、Wrangler D1 binding 和 OpenAI 旧业务变量、更新 `.env.example` 与 README，但**不删除远端 D1 数据库或生产数据**。如果旧文件有未提交改动，但文件完全属于已废止产品，也在本次明确授权范围内删除；不会删除 `.env*`、密钥或生产数据。

已索引的旧服装 URL 从 sitemap 和内链移除，并返回正常 404；不把无关旧 URL 301 到 Invisible Text。发布前做 broken-link crawl，是否使用 410 另行根据索引与迁移策略决定。

## 8. 视觉设计

- 风格：清晰、轻快的 utility lab，而非旧 B2B 询价后台；
- 配色：深墨黑文字、暖白背景、电蓝主按钮、淡蓝工具面板、酸橙色状态点；
- 版式：首屏强工具卡，内容最大宽度约 1180px；
- 品牌：BriefVu 保留，副标 `small tools, instantly useful`；
- 无大面积渐变、无虚假 3D、无装饰性库存图片；
- 视觉表达“不可见”：用标尺、虚线框和 token，而不是把空白当内容留白。

## 9. 测试与验收

### 自动测试

- 每种字符生成数量正确，按 Unicode code point 计数；catalog 的 code point、Unicode category 和 intended semantics 与显式定义一致；
- count 被安全限制在 1–500；
- analyzer 按互斥优先级正确区分 supported blank/control、其他 Unicode whitespace、其他 code point，且三类之和等于总数；
- paste-back 比较覆盖 exact、strip、normalize、混合和额外可见内容；
- NFC/NFKC 对五种字符的结果有测试与说明；
- 空输入、混合文本、emoji、可形成的异常 surrogate 和 500 个字符边界；
- JSON-LD 转义；
- sitemap 只包含现行页面；
- `npm test`、`npm run lint`、`npm run build` 与 `npm run preview` 全部通过；preview 后再次 lint，避免生成目录污染验证。

### UI 验证

- 桌面与手机首屏可直接找到工具；
- 键盘能完成字符选择、数量修改、复制、展开测试区；
- 复制成功和失败都可感知；复制后粘回必须验证真实 code point×count，不能只检查按钮显示 Copied；
- Chrome Clipboard API 与 `execCommand` fallback 是首发门槛；Safari 降为发布后的兼容性抽检，不因未覆盖而阻塞首发；
- 粘贴测试不产生网络请求；
- 200% zoom 不遮挡、不横向滚动；
- prefers-reduced-motion 下无必要动画；
- metadata、canonical、robots、sitemap、OG 正确。
- canonical host 308 的纯函数、请求级 middleware 和 Cloudflare 入口测试通过；OpenNext preview 中 legacy 请求命中 308（Wrangler 本地会把 `Location` 重写为本地 origin，因此绝对生产目标由入口单元测试锁定）；实际 HTML 中的 metadata/JSON-LD 已检查；旧 URL 返回 404 且无 broken internal link；
- 页面加载后粘贴和分析不产生额外请求；aria-live 不朗读原始不可见 payload。

## 10. 分工与实施顺序

### 总控

- 锁定本方案、处理旧代码删除、协调文件边界；
- review 开发结果，处理集成与设计一致性；
- 最终运行全套验证并给出剩余风险。

### 开发子任务

- 实现 Unicode 纯函数、Client 工具、站点页面和视觉系统；
- 更新 metadata、JSON-LD、sitemap、robots、OG；
- 不部署、不修改外部系统。

### 验证子任务

- 在开发前 review 方案的需求、字符语义、SEO 和风险；
- 在开发后独立检查功能、无障碍、响应式、测试和旧代码残留；
- 只报告有证据的问题，不自行改变产品范围。

顺序：方案完成 → 独立 review → 修订基线 → 删除旧代码 → 开发 → 自动测试 → 独立验证 → 修复 → 最终复验。

## 11. 发布门槛

本轮完成本地产品重构与验证，不自动部署。只有在构建通过、关键 UI 人工检查完成、旧生产监控/自动化已另行迁移或停用、且用户确认生产切换后，才部署到 `briefvu.com`。

### 2026-10-16 最小必要发布验证记录

- Chrome 核心流程通过：数量选择、复制反馈、真实剪贴板内容和粘贴回检均正确；3 个 U+3164 被逐一验证，结果为 `Exact match`；
- 键盘焦点顺序通过：导航、字符单选、数量控件、快捷数量、复制按钮和测试区都可到达，测试区可用 Enter 展开；
- 在非安全 HTTP 局域网 origin 中复测，现代 Clipboard API 不可作为安全上下文能力使用，页面成功走 `execCommand` 回退并复制 3 个 U+3164；
- `npm test`（31/31）、`npm run lint`、`npm run build` 全部通过；
- 390px、等效 200% 缩放和无横向溢出检查已通过；
- Safari 不再是首发阻塞项。只有当 Safari 成为显著流量来源或收到兼容性反馈时，再加入对应回归矩阵；
- 剩余发布动作只有用户确认部署，以及部署后检查 canonical/legacy host 的真实 308 `Location`。
