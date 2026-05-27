# 抖音小游戏调研结论

## 目标

基于“做一个极简游戏接入抖音”的需求，评估应选择的产品形态、技术方案、上线约束与最小可行版本（MVP）路径。

## 核心结论

极简游戏应优先选择 **抖音小游戏**，而不是普通抖音小程序。

原因：

- 小游戏是抖音针对“即点即玩”游戏内容提供的独立运行形态，能力与分发更贴近游戏场景。
- 小游戏更适合短时长、轻交互、强复玩、可挂载内容传播的产品设计。
- 平台为小游戏提供了更清晰的游戏开发、审核、运营与变现链路。

## 为什么不是普通小程序

普通小程序更适合工具、电商、内容服务、预约、信息展示等场景。

如果目标是：

- 单局 30 秒到 2 分钟
- 高频复玩
- 排行/分享/挑战
- 广告变现优先

那么小游戏形态明显更合适。

## 官方能力与定位

根据抖音开放平台小游戏文档，小游戏具备以下特点：

- 即点即玩
- 适配抖音生态内分发
- 支持游戏专属运行环境与 API
- 支持后续接入运营、变现与平台能力

参考文档：

- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/introduction/
- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/guide/dev-guide/bytedance-mini-game

## 技术路线建议

### 推荐路线

优先级建议如下：

1. **原生小游戏开发**
2. **Cocos Creator 导出抖音小游戏**
3. Unity 等更重引擎放到后期再评估

### 选择依据

如果项目目标是“极简游戏 MVP”，则优先考虑：

- 包体小
- 开发快
- 调试链路短
- 动效与交互足够即可
- 尽量不依赖复杂 3D 能力

因此，第一版不建议上重型引擎。

## 最适合的游戏类型

适合抖音小游戏首版切入的方向：

- 反应类：点按、躲避、手速挑战
- 轻策略类：一屏合成、叠加、极简数值博弈
- 爽感循环类：切割、连击、消除、清屏

这类游戏的共同点：

- 教学成本低
- 前 3 秒就能开玩
- 可在短视频/直播语境下被快速理解
- 复玩动机强

## MVP 方案建议

建议第一版只做一个非常小的闭环：

- 首页
- 开始游戏
- 单局核心玩法
- 结算页
- 再来一局

建议控制在：

- 竖屏
- 单手操作
- 单局 30 秒到 2 分钟
- 无强依赖后端
- 无复杂社交系统
- 无复杂付费系统

### 第一版应保留的能力

- 分数统计
- 最好成绩
- 新手引导
- 音效开关
- 基础分享/复玩入口预留

### 第一版不建议做的内容

- 大型关卡系统
- 重剧情
- 复杂养成
- 多货币体系
- 复杂联机
- 大量服务端逻辑

## 包体与开发约束

根据官方开发文档，小游戏项目结构至少包含：

- `game.js`
- `game.json`
- `project.config.json`

同时需要关注：

- 非分包小游戏整体代码包大小上限为 **20MB**
- 平台强调弱网/无网兼容能力
- 需要考虑启动速度和资源控制

参考文档：

- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/guide/dev-guide/bytedance-mini-game

## 运营与留存重点

抖音小游戏不仅是“能跑起来”，还很强调复访和运营链路。

官方运营指引可重点关注：

- 首页侧边栏复访
- 用户再次打开路径
- 活动与留存设计
- 审核与运营规范一致性

这意味着游戏设计上应尽量强化：

- 再来一局
- 日挑战
- 最高分突破
- 连续游玩奖励

参考文档：

- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/operationalguidelines

## 变现建议

对于极简小游戏，优先建议走 **IAA（广告变现）** 路线，而不是一开始就做复杂内购。

原因：

- 极简玩法通常更适合“高曝光 + 高频复玩”的广告模式
- 首版门槛更低
- 不必过早处理复杂支付与商品设计

后续可再评估：

- 激励视频
- 插屏广告
- 游戏内付费点

参考文档：

- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/business-guide/revenue/introduction/mini-game-reconciliation-guide
- https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/open-capacity/business-monetization/publisher/publisher

## 审核与合规风险

小游戏上线前必须尽早确认资质与审核要求，避免做到后期才发现无法提审。

需重点关注：

- 提交类型对应的资质要求
- 名称、软著、版号等材料一致性
- 内容规范与审核标准
- iOS 端对虚拟商品支付展示的限制

参考文档：

- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/operation1/norms/credential-norms-for-mini-game
- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/operation1/norms/standard
- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/examineguide

## 推荐落地路径

### 阶段一：验证产品方向

做一个无后端的最小 Demo：

- 1 个核心玩法
- 1 套 UI
- 1 个结算闭环
- 1 个分数系统

目标是验证：

- 是否足够上手快
- 是否有复玩意愿
- 是否适合短内容场景传播

### 阶段二：补齐小游戏能力

在 Demo 跑通后再补：

- 分享与回流
- 排行或挑战
- 激励广告
- 数据统计

### 阶段三：提审与运营

在提审前集中检查：

- 包体大小
- 资质材料
- 文案与命名
- 启动性能
- 弱网表现

## 最终建议

如果目标是“尽快做一个能进入抖音生态的极简游戏”，最佳路线是：

- 选择 **抖音小游戏**
- 做 **竖屏、轻量、单局极短** 的玩法
- 第一版采用 **原生或 Cocos Creator**
- 优先验证 **复玩率**，而不是一开始追求复杂系统
- 变现先考虑 **广告**，支付后置

## 下一步可执行事项

接下来可以直接进入以下任一工作：

1. 输出 10 个适合抖音小游戏的极简游戏创意
2. 搭建一个抖音小游戏最小项目脚手架
3. 为某一个具体创意写完整 MVP 方案
4. 梳理提审前需要准备的资质与材料清单
