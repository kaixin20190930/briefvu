# BriefVu Image Color Picker：实施方案与预开发 Review

日期：2026-10-16
状态：Review 通过，进入实施

## 1. 本轮目标

在 BriefVu 自营工具平台中增加第二个正式工具 **Image Color Picker**，让用户上传、拖入或粘贴本地图片，在浏览器中取样像素并复制 HEX、RGB、HSL 值。同时把首页、工具目录、导航、站点描述和内链从“单工具展示”升级为可持续扩展的多工具结构。

本轮包含：产品页、核心交互、放大镜、复制反馈、FAQ、JSON-LD、sitemap、首页工具卡、双向相关工具内链、自动测试、构建验证和生产部署。GSC 手动请求收录仅在生产部署与公开 URL 验证通过后执行；若当前会话没有可用 Search Console 登录态，则保留为明确的人工动作，不伪称已提交。

## 2. 附件方案 Review

### 直接采用

- 路由 `/tools/image-color-picker`；
- 首屏直接提供上传、拖放和剪贴板粘贴；
- Canvas 本地取色，鼠标移动实时预览，点击锁定；
- 像素放大镜与中心十字线；
- HEX、RGB、HSL 三种结果和独立复制按钮；
- 明确的复制完成反馈；
- FAQ 与页面可见内容一致的 `FAQPage` JSON-LD；
- 首页和 `/tools` 由注册表自动展示第二张工具卡；
- 两个工具页双向内链；
- 图片不上传、不保存、不写入 analytics。

### 修改后采用

1. **图片格式表述**：不承诺固定格式清单。页面改为“支持当前浏览器能够解码的图片格式”，并对解码失败给出可操作提示。
2. **颜色准确性表述**：不把数值称为跨设备的绝对“真色”。结果来自 Canvas 解码后的像素值；显示效果仍受图片色彩配置、浏览器和屏幕影响。
3. **Invisible Text FAQ**：保留 WhatsApp、社交平台和游戏相关搜索意图，但不声称某个字符一定被接受，也不鼓励绕过用户名、审核或反作弊规则。
4. **图片容量保护**：增加 20 MB 文件上限、20 MP 像素上限和 8192 px 单边上限，避免巨大图片冻结浏览器；超限时不自动上传或压缩，而是明确要求换较小图片，以免重采样改变像素值。
5. **移动端与无障碍**：除鼠标 hover 外，支持触摸/笔指针点击取色；Canvas 可聚焦，锁定后支持方向键逐像素移动；复制状态通过 `aria-live` 告知。
6. **导航**：顶栏不再固定指向 Invisible Text，改为统一进入 `/tools`；首页主 CTA 也改为平台级入口。

### 拒绝

- “U+200B 在 X 一定保留”“U+3164 在更多平台存活”“多数游戏接受某字符”等未经持续验证且会随平台变化的断言；
- “HEX/RGB/HSL 是不受显示环境影响的 true color”这一过度表述；
- 在生产页面尚未部署时提前声称 GSC 已收录或已提交；
- 为取色而把大图静默缩放后仍宣称采样的是原始像素。

## 3. 用户流程

1. 初始态：用户看到上传区，可点击选图、拖入图片，或直接粘贴截图。
2. 图片加载：校验文件类型、文件大小与图像尺寸；通过后绘制到 Canvas。
3. 取色态：鼠标/笔移动时实时更新颜色，放大镜跟随；触摸时以点击位置取样。
4. 锁定态：点击后锁定当前像素，隐藏放大镜并显示坐标；再次点击解除锁定。Canvas 聚焦时，方向键可移动锁定点。
5. 复制：分别复制 HEX、RGB 或 HSL；按钮和 live region 显示成功或失败。
6. 换图：可用按钮重新选择图片，旧对象 URL 会被释放，不保留文件内容。

## 4. 技术设计

```text
app/tools/image-color-picker/page.tsx  # metadata、可见内容、JSON-LD
components/ImageColorPicker.tsx        # 唯一新增主要 Client Component
components/RelatedTool.tsx             # 两个工具页共享的交叉导流
lib/image-color.ts                     # RGB/HEX/HSL、坐标限制等纯函数
lib/image-color.test.ts                # 边界与转换测试
lib/tools/registry.ts                  # 第二个 available 工具
```

- 页面与 SEO 内容继续使用 Server Component；只有本地文件、Canvas、pointer、clipboard 状态放在 Client Component。
- 使用本地 `File` + object URL + `HTMLImageElement.decode()`；成功或失败后及时 `URL.revokeObjectURL()`。
- Canvas 保留原图像素尺寸，仅由 CSS 缩放显示；指针坐标按 `getBoundingClientRect()` 映射回源像素。
- 放大镜从同一 Canvas 截取邻域，关闭 image smoothing，显示像素网格与中心十字线。
- 不使用服务器路由、数据库、第三方图片 URL 或新运行时依赖。

## 5. SEO 与结构化数据

- Title：`Image Color Picker — Pick Colors from Your Photo Online | BriefVu`
- Description：`Upload a photo and pick any color in your browser. Copy HEX, RGB, and HSL values with one click. Your image stays on your device.`
- H1：`Image Color Picker`
- 页面结构：工具 → 三步说明 → 色彩差异说明 → FAQ → 相关工具。
- JSON-LD：`WebApplication`、`BreadcrumbList`、`FAQPage`；FAQ schema 必须与页面可见 FAQ 完全一致。
- sitemap 新增 `/tools/image-color-picker`，首页和工具目录通过注册表产生可抓取内链。

## 6. 验收标准

- 点击、拖放、粘贴三种导入方式都能加载有效图片；无效文件、解码失败、超限图片有明确错误。
- 鼠标取色、点击锁定/解锁、触摸点击、键盘方向键均能得到正确坐标与颜色。
- 纯红、纯绿、纯蓝、黑、白、灰的 HEX/HSL 转换有单元测试；输入通道和坐标正确限制。
- 三个复制按钮均有成功/失败动态反馈，不输出图片或敏感内容。
- 透明像素显示 alpha 百分比，RGB/HSL/HEX 保持对像素 RGB 通道的诚实表述。
- 两个工具页可互相进入；首页、工具目录、顶栏没有单工具硬编码误导。
- metadata、canonical、JSON-LD、sitemap、robots 正确；旧工具不回归。
- `npm test`、`npm run lint`、`npm run build`、`git diff --check` 全部通过。
- Chrome 桌面端完成上传、拖放或粘贴、取色、锁定、复制和响应式烟测；不重复 Safari 全量测试。

## 7. Review 结论

方案在范围、隐私、SEO、浏览器资源保护、可访问性和多工具扩展性上没有阻塞问题。唯一不由代码自动完成的动作是 GSC URL Inspection 的人工提交；这不会阻塞产品发布，因为 sitemap 和内部链接会让搜索引擎发现新页面。实施按“纯函数与测试 → Client 交互 → 页面与内链 → 首页与注册表 → 全套验证 → 部署 → 生产烟测”的顺序执行。
