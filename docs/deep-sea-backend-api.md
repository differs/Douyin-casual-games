# 深海吞噬进化 Rust 后端接口文档

## 文档目标

定义首版 Rust 后端 API 范围、请求响应结构、状态码和最小安全约束。

首版原则：

- 接口少
- 数据结构稳定
- 只服务于小游戏 MVP
- 不做过度设计

## 技术约束

- 服务端语言：`Rust`
- Web 框架：`Axum`
- 数据库：`PostgreSQL`
- 返回格式：`application/json`
- 鉴权方式：`Bearer Token`

## 通用返回格式

成功响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

失败响应：

```json
{
  "code": 1001,
  "message": "invalid_token"
}
```

## 错误码建议

| code | message | 含义 |
| --- | --- | --- |
| 0 | ok | 成功 |
| 1001 | invalid_token | token 无效 |
| 1002 | login_failed | 登录失败 |
| 1003 | invalid_params | 参数错误 |
| 1004 | user_not_found | 用户不存在 |
| 1005 | score_invalid | 分数异常 |
| 1006 | reward_already_claimed | 奖励重复领取 |
| 1007 | reward_limit_reached | 奖励次数超限 |
| 1008 | internal_error | 服务内部错误 |

## 鉴权流程

### 登录前

客户端调用抖音小游戏登录能力，拿到平台登录凭证。

### 登录后

客户端把登录凭证传给后端，后端完成：

- 向平台换取用户标识
- 创建或查询本地用户
- 生成业务 token

后续请求统一在 Header 里带：

```http
Authorization: Bearer <token>
```

## 接口列表

首版只实现以下 7 个接口：

1. `POST /api/login`
2. `GET /api/user/profile`
3. `GET /api/user/archive`
4. `POST /api/user/archive`
5. `POST /api/score/submit`
6. `POST /api/ad/reward`
7. `POST /api/event/report`

## 1. 登录接口

`POST /api/login`

### 说明

使用抖音小游戏登录凭证换取业务登录态。

### 请求体

```json
{
  "code": "platform-login-code",
  "anonymous_id": "device-or-session-id"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| code | string | 是 | 抖音小游戏登录凭证 |
| anonymous_id | string | 否 | 匿名设备标识，用于首登数据归并 |

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "jwt-or-session-token",
    "user": {
      "user_id": 10001,
      "nickname": "玩家",
      "avatar_url": "",
      "coin": 0,
      "best_score": 0
    }
  }
}
```

### 最小校验

- `code` 不能为空
- 平台换取失败则返回 `login_failed`

## 2. 用户资料接口

`GET /api/user/profile`

### 说明

返回用户基础信息和前端启动所需轻量资料。

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "user_id": 10001,
    "nickname": "玩家",
    "avatar_url": "",
    "coin": 1200,
    "best_score": 860,
    "current_skin_id": "default_fish",
    "audio_enabled": true
  }
}
```

## 3. 获取存档接口

`GET /api/user/archive`

### 说明

返回当前用户存档和局外状态。

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "best_score": 860,
    "coin": 1200,
    "current_skin_id": "default_fish",
    "owned_skin_ids": ["default_fish"],
    "audio_enabled": true,
    "daily": {
      "revive_used": 0,
      "ad_reward_claimed": 0
    }
  }
}
```

## 4. 保存存档接口

`POST /api/user/archive`

### 说明

保存局外配置与轻量存档。

首版不要把每局过程频繁写库，只在必要节点写入。

### 请求体

```json
{
  "current_skin_id": "default_fish",
  "audio_enabled": true
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| current_skin_id | string | 否 | 当前皮肤 ID |
| audio_enabled | boolean | 否 | 是否开启音效 |

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "saved": true
  }
}
```

## 5. 分数提交接口

`POST /api/score/submit`

### 说明

提交单局结算结果。

首版由客户端计算对局结果，服务端只做最小校验和落库。

### 请求体

```json
{
  "score": 860,
  "survival_seconds": 94,
  "max_stage": 6,
  "eat_food_count": 43,
  "eat_fish_count": 18,
  "revive_used": 1,
  "client_ts": 1780000000
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| score | integer | 是 | 本局得分 |
| survival_seconds | integer | 是 | 存活时长 |
| max_stage | integer | 是 | 达到的最高阶段 |
| eat_food_count | integer | 否 | 吃到静态食物数量 |
| eat_fish_count | integer | 否 | 吃到鱼类数量 |
| revive_used | integer | 否 | 是否使用复活 |
| client_ts | integer | 否 | 客户端时间戳 |

### 服务端最小校验

- `score >= 0`
- `survival_seconds >= 0`
- `max_stage` 在合法范围内
- 超出合理阈值的异常局先拒绝或打标

建议首版粗校验阈值：

- `max_stage <= 8`
- `survival_seconds <= 3600`
- `score <= 999999`

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "best_score": 920,
    "is_new_record": true,
    "coin_reward": 86
  }
}
```

## 6. 广告奖励接口

`POST /api/ad/reward`

### 说明

确认激励广告奖励发放。

首版不做复杂广告系统，只支持有限奖励类型。

### 支持奖励类型

- `revive`
- `double_coin`
- `daily_boost`

### 请求体

```json
{
  "reward_type": "double_coin",
  "unique_token": "ad-callback-token-or-client-uuid",
  "extra": {
    "score_record_id": 12345
  }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| reward_type | string | 是 | 奖励类型 |
| unique_token | string | 是 | 奖励唯一标识，防止重复领取 |
| extra | object | 否 | 附加参数 |

### 服务端最小校验

- `reward_type` 必须在白名单内
- `unique_token` 不可重复使用
- 按用户和日期限制每日奖励次数

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "granted": true,
    "coin": 1372
  }
}
```

## 7. 埋点接口

`POST /api/event/report`

### 说明

接收客户端行为埋点，用于首版漏斗分析。

### 请求体

```json
{
  "events": [
    {
      "event_name": "game_start",
      "event_time": 1780000000,
      "payload": {
        "entry": "home"
      }
    },
    {
      "event_name": "game_over",
      "event_time": 1780000094,
      "payload": {
        "score": 860,
        "max_stage": 6
      }
    }
  ]
}
```

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "accepted": 2
  }
}
```

## 推荐埋点事件

- `game_start`
- `game_over`
- `revive_click`
- `revive_success`
- `double_reward_click`
- `double_reward_success`
- `stage_upgrade`

## 安全与风控边界

首版只做最小必要控制：

- Bearer token 鉴权
- 广告奖励去重
- 分数阈值粗校验
- 简单限流

不做：

- 实时反作弊
- 设备指纹重风控
- 复杂黑名单系统

## 数据库落库建议

### 分数提交

每局写一条 `score_records`，再异步更新 `user_archives.best_score`。

### 广告奖励

先写 `ad_reward_records` 去重，再发放奖励。

### 埋点

可直接入库，也可先写日志后异步消费。

## 版本扩展预留

虽然首版接口少，但建议预留这些扩展方向：

- 排行榜接口
- 图鉴接口
- 活动配置接口
- 灰度配置接口

当前阶段不实现，只在代码结构上留出模块位置。
