# Godot 迁移计划

## 已完成

- 清理旧 `client/` Vite/Web 原型
- 建立 `godot-client/` 基础项目
- 定义 Godot 为唯一客户端路线
- 保留现有 Rust 后端接口作为游戏服务层

## 要迁移的内容

### 场景

- 首页
- 游戏场景
- 复活弹层
- 结算页

### 系统

- 玩家移动
- 鱼群生成
- 吞噬碰撞
- 阶段升级
- 分数结算
- 广告触发

### 平台适配

- `tt.login`
- 激励视频广告
- `tt.request`
- 本地存储
- 安全区/菜单按钮避让

## 推荐顺序

1. 在 Godot 内重建首页和 HUD
2. 重建对局主循环
3. 接回后端登录/分数/奖励接口
4. 再做抖音小游戏导出包装

## 当前第一批骨架

已新增：

- `scenes/home_screen.tscn`
- `scenes/game_screen.tscn`
- `scenes/ui/revive_dialog.tscn`
- `scenes/ui/result_dialog.tscn`
- `scripts/home_screen.gd`
- `scripts/game_screen.gd`
- `scripts/ui/revive_dialog.gd`
- `scripts/ui/result_dialog.gd`
- `scripts/world/player.gd`
- `scripts/world/spawn_manager.gd`
- `scripts/world/collision_manager.gd`
- `scripts/world/progression_manager.gd`
