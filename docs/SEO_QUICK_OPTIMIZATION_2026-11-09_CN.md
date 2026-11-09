# BriefVu 关键词与索引快速优化记录

日期：2026-11-09（Asia/Shanghai）。范围：只优化现有页面，不新增URL，不投广告，不追竞品品牌词。

生产版本：`9036fa4b-2b73-4c1a-b724-c640bcebb9a8`。

## 实施清单

- [x] `/tools/remove-metadata` 增加 `How to remove C2PA metadata from an image` H2，共187词；说明浏览器内检查Content Credentials、清理后仍可能存在像素水印与外部软绑定、清理不证明图片并非AI生成，并链接metadata指南。
- [x] `/tools/image-to-ico` 保留已上线的PNG to ICO TDK/H1，在favicon章节增加 `Is this a PNG to favicon converter?` H3；说明PNG→多尺寸ICO/网站ZIP，并链接页内Chrome扩展图标章节。
- [x] `/tools/tga-viewer` Description改为通顺的 `Open supported .tga files in a free TGA viewer…`，正文新增约200词的方向、位深、Alpha、RLE与格式选择说明。
- [x] 不为本批关键词新建页面；不追 `briefu`、`textreverse`、`photocraftonline`、`clearexif`、`redketchup icon converter` 等第三方或混淆品牌词。
- [x] 更新Metadata、ICO、TGA三个真实修改页的sitemap lastmod为2026-11-09。
- [x] Privacy与Terms设为 `noindex, follow` 并移出sitemap；页面继续从页脚可访问。
- [x] `/opengraph-image` 增加 `X-Robots-Tag: noindex`；该资源与查询参数版本不是工具页。
- [x] WordCraft实时网址检查显示“网址已收录到Google”，不加noindex。
- [x] `/tools` 存量结果显示未收录；2026-11-09 11:54北京时间实时测试显示“网址可编入Google索引”。保留index、sitemap及现有全站内链，不点击“验证修正情况”或“请求编入索引”。

## GSC结论

索引报告仍显示上次更新日期2026-10-23，4个“已发现—尚未编入索引”示例为：

- `/privacy`
- `/terms`
- `/tools`
- `/tools/wordcraft-online`

这是滞后的聚合报告：WordCraft的实时网址检查已经显示收录。因此不能把“4”当成当前四页均未收录，也不能保证代码上线后立即降到2以下。本批通过noindex清理两个不承担搜索流量的法务页；保留可索引的工具目录和已收录WordCraft。两条“已抓取—尚未编入索引”为OG图片资源及参数版本，使用资源级noindex处理。

## 验证与观察

- sitemap单测、TypeScript、ESLint、`git diff --check`、Next.js生产构建通过。
- 生产复查：三个修改页内容已生效；sitemap为31个唯一URL，法务页已移除；Privacy/Terms输出`noindex, follow`；OG图片响应输出`X-Robots-Tag: noindex`。
- 排名目标 `remove C2PA metadata from image` 从#29进入前10、`png to favicon converter`进入前20，均属于上线后观察目标，不作为本次即时完成声明。
- 建议在GSC报告刷新后复查原因分布。Privacy、Terms与OG资源可能转入“已被noindex排除”，这是预期结果；重点是 `/tools` 是否被抓取与收录。
