# 新词工具机会分析：第一批

日期：2026-10-14

输入：用户提供的订阅站候选词，共 39 条原始查询。本文只把这些文字当作候选数据，不继承其中“值得做”“建站”等结论。

## 核心结论

- 39 条查询可合并为约 23 个主题。
- 大部分查询有搜索热度，但没有工具意图。
- 多个高热词是现有软件、游戏或开源项目的品牌导航词，复制同名工具会造成混淆与风险。
- 第一批最值得继续研究的是“新模型比较计算器”；“Don't Block Me Quiz”可以做，但已出现多个直接竞争者；游戏事件预测器只有极短窗口。
- 第一批不应选择外挂、游戏移植、仿制现有软件或未经授权承载游戏内容的方向。

## A 级：进入进一步产品设计

### 1. AI Model Comparison Calculator

覆盖原始词：

- `haiku 5.5 vs luna 6`
- `6.1 sol vs 6 astra`
- `gpt 6.1 vs gpt 6`

工具形式：用户选择两个模型、输入预计调用次数与 token 数，计算输入成本、输出成本、缓存成本和总成本，并展示上下文、输出上限、能力与公开基准来源。

优点：

- 查询本身包含明确比较意图。
- 可以提供比普通文章更有价值的交互计算。
- 新模型持续发布，同一工具可以复用数据结构。
- 可以生成合法的模型组合页面，但共用一套真实数据和计算器。

风险与要求：

- 价格和规格必须注明来源与更新时间。
- 不得伪造缺失 benchmark。
- 需要稳定的数据更新流程。

结论：**首选候选。**

### 2. Don't Block Me Quiz Creator

覆盖原始词：`dont block me quiz`

工具形式：用户创建关于自己的问题，生成分享链接，朋友作答并形成排行榜。

优点：

- 明确的创建、分享、答题闭环。
- 天然具有传播性。
- 不依赖 AI 成本。

风险与要求：

- 已存在多个同类专门工具，速度优势已经下降。
- 需要持久化 quiz、答案和排行榜。
- 需要内容举报、删除入口、速率限制和未成年人隐私保护。
- 页面必须明确它不能检测真实拉黑关系。

结论：**可做，但不是低成本首发工具。**

### 3. New-model Cost Break-even Calculator

这是模型比较工具的一个独立交互模式，而不是重复页面。用户输入现有模型成本、候选模型成本、月调用量和平均 token，用来计算迁移后的月度节省与盈亏平衡点。

结论：**可以与第一个工具同时设计，是否拆成独立页面由搜索意图验证决定。**

## B 级：窗口短或维护成本高

### 4. Predictive Victory Dynamics Planner

覆盖原始词：`predictive victory dynamics genshin`

可做形式：每轮队伍信息、用户筹码分配、预测记录和结果复盘。

问题：活动时间极短，需要持续更新每轮数据，并涉及游戏品牌和素材。若不能在当天发布，工具价值会迅速下降。

结论：**只适合具备当天上线能力时抢时效，本轮不建议作为平台首个工具。**

### 5. AION 2 Steam Launch Stats Dashboard

覆盖原始词：`aion 2 steam launch stats`

可做形式：公开 Steam 数据的在线人数、峰值、变化率和时间轴。

问题：依赖稳定公开数据源、缓存和定时更新；搜索窗口可能集中在发售期。

结论：**保留，先验证数据授权与 API。**

### 6. ArtCraft Migration/Compatibility Checker

覆盖原始词：

- `artcraft adobe`
- `artcraft photoshop`
- `photocraft artcraft`
- `effectcraft`
- `artcraft software`

可做形式：用户选择 Adobe 工作流、文件格式与关键功能，得到 ArtCraft 当前支持情况和替代建议。

问题：原始查询主要是品牌导航和产品了解；功能处于快速变化期，维护量大。不得使用 ArtCraft 名称让用户误以为是官方工具。

结论：**比做同名下载站更合理，但需要准确功能矩阵后再做。**

### 7. Ideogram 4.5 Edit Prompt Builder

覆盖原始词：`ideogram 4.5`

可做形式：根据“只改变一个元素、保持其他内容”的目标生成结构化编辑提示，并保存多轮版本。

问题：主查询意图更接近官方模型和在线生成器；第三方 prompt builder 可能偏离搜索意图。

结论：**降低优先级，除非发现明确的 prompt/template 长尾。**

### 8. AnyPS5 / DroidDeck Compatibility Tracker

覆盖原始词：`anyps5`、`droiddeck`

可做形式：设备或游戏兼容性数据库、版本差异和公开进度跟踪。

问题：两个词都是现有项目的导航查询；数据必须来自明确授权的公开来源，且涉及游戏运行与兼容的法律边界。

结论：**只做独立的事实型 tracker，不做转换器、ROM、游戏文件或绕过工具。**

## C 级：适合内容，不适合工具

以下词主要需要答案、新闻、攻略、列表或下载入口，而不是新的交互工具：

- `silent hill townfall the weight`
- `control resonant underhill`
- `backrooms impending doom release date`
- `sortie pokemon 2 octobre`
- `roblox kabuki codes`
- `threshing day game`
- `threshing day dragon`
- `fourth wing threshing day game`
- `aion 2 pets`
- `hood warfare 2`
- `creator smp 4`
- `loot merge witcher 3`
- `black clover fortnite`
- `minecraft 1.26.52`
- `steal animal egg`
- `harry potter defenders rpg game`

这些词即使有高热度，也不应该为了“工具集合”强行包装成生成器或计算器。

## D 级：品牌导航或已有产品，不应仿制

- `vectorcraft`
- `reverse engineer anything`
- `reverse engineer anything github`
- `wasm arcade`
- `halo ce browser`
- `krillion unlimited`

这些词已经对应明确产品、项目或玩法。可做评论、兼容性或事实型辅助工具，但不应抢用同名、伪装官方、镜像软件或复制玩法与内容资产。

## E 级：拒绝

### `script break and steal an egg`

搜索意图是 Roblox 自动化外挂或作弊脚本。存在平台滥用、账号安全、恶意代码和用户损失风险。

结论：**不开发、不分发脚本、不做下载或执行器。**

### `burning bridges ai video`

如果实现为将普通用户换脸进受版权保护的音乐视频，会带来肖像、音乐、视频版权和冒充风险。

结论：**不做具体 MV 的换脸生成器。可以另行研究通用、获得素材授权的视频风格工具。**

## 第一轮建议顺序

1. 为 AI 模型比较计算器制作产品规格与数据 schema。
2. 继续观察 Don't Block Me Quiz，但先确认趋势持续性和存储/审核成本。
3. 研究 AION 2 stats 的公共数据可用性，作为非 AI dashboard 类备选。
4. 暂不为其他游戏攻略和品牌导航词开发工具。

## 对订阅数据的使用规则

后续每批新词都增加两道门槛：

1. **先判定 query intent**：工具、内容、导航、交易或违规。
2. **只有工具意图通过，才计算热度与建站优先级。**

这可以避免“词很热，所以强行做一个工具”的错误。
