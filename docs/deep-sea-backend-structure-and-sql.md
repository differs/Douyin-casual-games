# 深海吞噬进化后端目录结构与数据库 SQL

## 文档目标

给出 Rust 后端首版建议目录结构，以及可直接落地的 PostgreSQL 表结构草案。

目标是：

- 先把工程骨架搭出来
- 先把核心表建起来
- 不做过度抽象

## 后端目录结构建议

建议使用单体 API 服务结构。

```text
server/
  Cargo.toml
  src/
    main.rs
    app.rs
    config.rs
    state.rs
    error.rs
    response.rs
    router.rs
    db/
      mod.rs
      postgres.rs
    middleware/
      mod.rs
      auth.rs
    handlers/
      mod.rs
      health.rs
      auth.rs
      user.rs
      archive.rs
      score.rs
      ad_reward.rs
      analytics.rs
    services/
      mod.rs
      auth_service.rs
      user_service.rs
      archive_service.rs
      score_service.rs
      ad_reward_service.rs
      analytics_service.rs
    repositories/
      mod.rs
      user_repo.rs
      archive_repo.rs
      score_repo.rs
      ad_reward_repo.rs
      event_repo.rs
    models/
      mod.rs
      user.rs
      archive.rs
      score.rs
      ad_reward.rs
      event.rs
    dto/
      mod.rs
      auth.rs
      user.rs
      archive.rs
      score.rs
      ad_reward.rs
      analytics.rs
```

## 结构说明

### `main.rs`

入口文件，负责：

- 加载配置
- 初始化数据库
- 启动 HTTP 服务

### `app.rs`

负责组装应用：

- 注册中间件
- 注入共享状态
- 创建 router

### `config.rs`

负责读取环境变量和配置文件，例如：

- 服务端口
- 数据库连接串
- token 密钥
- 日志级别

### `state.rs`

统一定义应用共享状态，例如：

- 数据库连接池
- 配置

### `error.rs`

统一错误类型，便于：

- handler 层少写重复错误处理
- 响应结构统一

### `response.rs`

统一成功/失败 JSON 响应结构。

### `middleware/auth.rs`

实现 Bearer Token 鉴权。

### `handlers/`

只处理：

- 参数接收
- 调用 service
- 返回响应

不要把业务逻辑堆在 handler。

### `services/`

处理主要业务逻辑，例如：

- 登录
- 更新最高分
- 奖励去重

### `repositories/`

只负责数据库读写，避免 SQL 分散到所有层。

### `models/`

数据库实体结构。

### `dto/`

接口请求体、响应体定义。

## 最小依赖建议

建议首版只引入必要依赖：

- `axum`
- `tokio`
- `serde`
- `serde_json`
- `sqlx`
- `tracing`
- `tracing-subscriber`
- `jsonwebtoken` 或等价方案
- `uuid`
- `chrono`

不要首版就引入太多框架或复杂基础设施。

## 数据库表结构设计

首版建议至少有 5 张表：

1. `users`
2. `user_archives`
3. `score_records`
4. `ad_reward_records`
5. `event_logs`

## SQL 草案

```sql
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    platform VARCHAR(32) NOT NULL DEFAULT 'douyin',
    platform_open_id VARCHAR(128) NOT NULL UNIQUE,
    nickname VARCHAR(64) NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_archives (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    best_score INTEGER NOT NULL DEFAULT 0,
    coin INTEGER NOT NULL DEFAULT 0,
    current_skin_id VARCHAR(64) NOT NULL DEFAULT 'default_fish',
    owned_skin_ids JSONB NOT NULL DEFAULT '["default_fish"]'::jsonb,
    audio_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    revive_used_today INTEGER NOT NULL DEFAULT 0,
    ad_reward_claimed_today INTEGER NOT NULL DEFAULT 0,
    last_daily_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS score_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    survival_seconds INTEGER NOT NULL DEFAULT 0,
    max_stage INTEGER NOT NULL DEFAULT 1,
    eat_food_count INTEGER NOT NULL DEFAULT 0,
    eat_fish_count INTEGER NOT NULL DEFAULT 0,
    revive_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_records_user_id
    ON score_records(user_id);

CREATE INDEX IF NOT EXISTS idx_score_records_created_at
    ON score_records(created_at DESC);

CREATE TABLE IF NOT EXISTS ad_reward_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(32) NOT NULL,
    reward_date DATE NOT NULL,
    unique_token VARCHAR(128) NOT NULL UNIQUE,
    reward_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_reward_records_user_date
    ON ad_reward_records(user_id, reward_date);

CREATE TABLE IF NOT EXISTS event_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_logs_user_id
    ON event_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_event_logs_event_name
    ON event_logs(event_name);

CREATE INDEX IF NOT EXISTS idx_event_logs_created_at
    ON event_logs(created_at DESC);
```

## 字段设计说明

## 1. users

用途：

- 平台用户主表

关键点：

- `platform_open_id` 唯一
- 只保留小游戏首版必须字段

## 2. user_archives

用途：

- 保存用户局外数据

为什么单独拆表：

- 和 `users` 解耦
- 后续扩展皮肤、设置、货币更方便

## 3. score_records

用途：

- 保存每局结算记录

为什么要保留明细：

- 后续排查异常分数
- 后续分析玩家对局表现

## 4. ad_reward_records

用途：

- 激励广告奖励去重
- 每日奖励次数统计

关键点：

- `unique_token` 唯一
- `reward_date` 便于按日限制

## 5. event_logs

用途：

- 接收客户端埋点

首版可以简单落库，后续再考虑异步处理。

## 建议补充的 SQL 规则

虽然首版保持简单，但建议在业务层增加以下约束：

- 分数不能为负
- 生存时长不能为负
- 最大阶段必须在 1 到 8 之间

如果希望数据库层也帮忙兜底，可加 `CHECK` 约束：

```sql
ALTER TABLE score_records
    ADD CONSTRAINT chk_score_non_negative CHECK (score >= 0);

ALTER TABLE score_records
    ADD CONSTRAINT chk_survival_seconds_non_negative CHECK (survival_seconds >= 0);

ALTER TABLE score_records
    ADD CONSTRAINT chk_max_stage_range CHECK (max_stage >= 1 AND max_stage <= 8);
```

## 推荐初始化顺序

后端落地时建议按这个顺序搭建：

1. 建表 SQL
2. 数据库连接
3. 健康检查接口
4. 登录接口
5. 用户资料接口
6. 分数提交接口
7. 广告奖励接口
8. 埋点接口

## 首版不建议做的数据库设计

不要一开始就做：

- 排行榜汇总表
- 活动表
- 道具库存表
- 支付订单表
- 多环境复杂分库设计

这些都会让首版膨胀。

## 目录与数据库的对应关系

建议模块对应关系如下：

- `handlers/auth.rs` -> `/api/login`
- `handlers/user.rs` -> `/api/user/profile`
- `handlers/archive.rs` -> `/api/user/archive`
- `handlers/score.rs` -> `/api/score/submit`
- `handlers/ad_reward.rs` -> `/api/ad/reward`
- `handlers/analytics.rs` -> `/api/event/report`

仓储层建议：

- `user_repo.rs` -> `users`
- `archive_repo.rs` -> `user_archives`
- `score_repo.rs` -> `score_records`
- `ad_reward_repo.rs` -> `ad_reward_records`
- `event_repo.rs` -> `event_logs`

## 最终结论

首版后端不要复杂化。

用一个简单、清晰、可维护的结构，把这几件事先跑通：

- 登录
- 存档
- 分数
- 奖励
- 埋点

这套目录和 SQL 已经足够支持当前 MVP 开发。
