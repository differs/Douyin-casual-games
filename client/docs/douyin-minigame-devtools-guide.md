# 抖音小游戏开发者工具联调步骤

## 1. 准备后端

在 `server/` 目录准备环境变量：

```bash
cp .env.example .env
```

至少填这些值：

```bash
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/dy_mini
DOUYIN_APP_ID=你的小游戏 AppID
DOUYIN_APP_SECRET=你的小游戏 Secret
```

启动后端：

```bash
cargo run
```

## 2. 准备前端小游戏导出

在 `client/` 目录准备环境变量：

```bash
cp .env.example .env
```

填写真实值：

```bash
VITE_API_BASE=https://你的后端域名/api
VITE_DOUYIN_APP_ID=你的小游戏 AppID
VITE_DOUYIN_REWARDED_AD_UNIT_ID=你的激励广告位 ID
```

导出原生小游戏目录：

```bash
npm install
npm run build:minigame-native
```

生成目录：

```text
client/dist-minigame-native
```

## 3. 在开发者工具中打开

打开抖音小游戏开发者工具后：

1. 选择“导入项目”
2. 项目目录选择 `client/dist-minigame-native`
3. 确认 `appid` 与小游戏主体一致
4. 编译类型选择 `game`

## 4. 首次联调检查

进入项目后优先检查：

1. 首页能正常展示
2. 点击“开始吞噬”能进入对局
3. `tt.login` 能换取后端登录态
4. 首次死亡能弹复活
5. 结算页能提交分数
6. 双倍奖励按钮能触发激励广告

## 5. 常见问题

### 登录失败

优先检查：

- `DOUYIN_APP_ID`
- `DOUYIN_APP_SECRET`
- 后端 `code2session` 接口是否可访问
- 小游戏 `appid` 是否和后端配置一致

### 广告不展示

优先检查：

- `VITE_DOUYIN_REWARDED_AD_UNIT_ID`
- 广告位是否属于当前小游戏
- 是否在支持广告的测试环境中

### 请求失败

优先检查：

- `VITE_API_BASE` 是否 HTTPS
- 域名是否已配置到小游戏后台
- 后端是否开放了小游戏请求所需域名访问

## 6. 提审前建议

提审前至少做一轮：

- 真机联调
- 登录链路验证
- 广告链路验证
- 首局体验验证
- 最高分与金币写回验证
