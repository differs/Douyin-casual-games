# Godot 第一批场景与脚本迁移清单

## 目标

把当前仓库从“只有 Godot 骨架”推进到“可以在 Godot 里逐步重建首版玩法”的状态。

第一批只做四件事：

1. 首页
2. 游戏主场景
3. 复活弹层
4. 结算弹层

首批不做：

- 皮肤系统
- 排行榜
- 多地图
- 复杂特效
- 完整广告桥

## 场景清单

### 1. `scenes/main.tscn`

职责：

- 根场景入口
- 负责切换首页和游戏场景
- 挂载全局 UI 弹层

### 2. `scenes/home_screen.tscn`

职责：

- 展示标题、副标题、最高分、金币
- 开始游戏
- 音效开关

### 3. `scenes/game_screen.tscn`

职责：

- 承载世界节点
- 承载 HUD
- 控制一局开始、暂停、结束

### 4. `scenes/ui/revive_dialog.tscn`

职责：

- 首次死亡后弹出
- 复活
- 放弃结算

### 5. `scenes/ui/result_dialog.tscn`

职责：

- 展示本局分数
- 展示最高阶段
- 展示奖励
- 再来一局

## 节点结构

## `main.tscn`

```text
Main (Node)
  Background (ColorRect)
  HomeScreen (CanvasLayer / Control)
  GameScreen (Node2D)
  ReviveDialog (CanvasLayer / Control)
  ResultDialog (CanvasLayer / Control)
```

### 说明

- `Main` 只做流程调度，不做玩法细节
- `HomeScreen` 和 `GameScreen` 互斥显示
- `ReviveDialog`、`ResultDialog` 默认隐藏

## `home_screen.tscn`

```text
HomeScreen (Control)
  SafeArea (MarginContainer)
    Panel (PanelContainer)
      VBox (VBoxContainer)
        Eyebrow (Label)
        Title (Label)
        Subtitle (Label)
        FeatureRow (HBoxContainer)
        StatsRow (HBoxContainer)
        StartButton (Button)
        AudioToggle (CheckButton)
        RuntimeLabel (Label)
```

### 说明

- 首页只保留首版必须信息
- 不在这一版做皮肤入口

## `game_screen.tscn`

```text
GameScreen (Node2D)
  World (Node2D)
    Background (Node2D)
    Foods (Node2D)
    Fishes (Node2D)
    Player (Node2D)
  Camera2D
  HudLayer (CanvasLayer)
    HudRoot (Control)
      ScoreLabel (Label)
      StageLabel (Label)
      ReviveLabel (Label)
      ProgressBar (TextureProgressBar or ProgressBar)
```

### 说明

- `World` 只负责世界对象
- `HudLayer` 只负责屏幕 UI
- `Camera2D` 跟随玩家

## `revive_dialog.tscn`

```text
ReviveDialog (Control)
  Mask (ColorRect)
  Panel (PanelContainer)
    VBox (VBoxContainer)
      Title (Label)
      Description (Label)
      ReviveButton (Button)
      SkipButton (Button)
```

## `result_dialog.tscn`

```text
ResultDialog (Control)
  Mask (ColorRect)
  Panel (PanelContainer)
    VBox (VBoxContainer)
      Title (Label)
      ScoreLabel (Label)
      StageLabel (Label)
      RewardLabel (Label)
      DoubleRewardButton (Button)
      RestartButton (Button)
```

## 脚本清单

### `scripts/main.gd`

职责：

- 管理主流程状态：
  - `home`
  - `playing`
  - `revive`
  - `gameover`
- 接收首页开始事件
- 接收游戏结束事件
- 控制弹层显示/隐藏

### `scripts/home_screen.gd`

职责：

- 刷新最高分和金币
- 刷新音效开关
- 发出开始游戏信号
- 发出音效切换信号

### `scripts/game_screen.gd`

职责：

- 启动一局
- 挂载和协调子系统
- 输出 HUD 数据
- 在玩家死亡时通知 `main.gd`

### `scripts/world/player.gd`

职责：

- 玩家移动
- 玩家半径/等级/经验
- 输入目标点

### `scripts/world/spawn_manager.gd`

职责：

- 生成食物
- 生成普通鱼
- 生成危险鱼
- 维持场上数量

### `scripts/world/collision_manager.gd`

职责：

- 玩家与食物碰撞
- 玩家与鱼碰撞
- 吞噬规则判断

### `scripts/world/progression_manager.gd`

职责：

- 经验阈值
- 等级升级
- HUD 进度输出

### `scripts/ui/revive_dialog.gd`

职责：

- 发出复活/放弃事件

### `scripts/ui/result_dialog.gd`

职责：

- 展示结算数据
- 发出双倍奖励/再来一局事件

## 推荐迁移顺序

### 阶段 1

- 搭 `HomeScreen`
- 搭 `GameScreen`
- 用假数据跑通显示/隐藏

### 阶段 2

- 实现 `Player`
- 实现 `SpawnManager`
- 实现 `CollisionManager`

### 阶段 3

- 实现升级与 HUD
- 实现复活和结算弹层

### 阶段 4

- 接 `ApiClient`
- 接 `Runtime`
- 接抖音小游戏桥层

## 首批验收标准

- 从首页点击开始能进入游戏
- 玩家可移动
- 可吃掉食物
- 可被大鱼撞死
- 首次死亡弹复活
- 结束后弹结算

达到这些，Godot 第一批迁移就算成立。
