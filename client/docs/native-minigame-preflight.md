# 原生小游戏联调前自检

## 当前自动化环境结论

当前工作环境里未检测到：

- `psql`
- `pg_isready`
- 抖音小游戏开发者工具可执行入口

因此这里无法完成真正的：

- DevTools 打开项目
- 真实 `tt.login` 联调
- 真实激励广告回调联调

可以确认的只有：

- 构建通过
- 原生小游戏目录导出通过
- 后端接口编译与测试通过
- 模板配置和运行时脚本已补齐

## 已完成检查

### 前端

- `npm run build`
- `npm run build:minigame-native`

### 后端

- `cargo check`
- `cargo test`

## 进入 DevTools 前必须替换

- `appId`
- `apiBase`
- `rewardedAdUnitId`

不要带着以下默认值进入真实联调：

- `touristappid`
- `http://127.0.0.1:8080/api`
- 空广告位 ID

## 建议真实联调顺序

1. 先验证 `tt.login -> /api/login`
2. 再验证 `GET /api/user/profile`
3. 再验证 `GET /api/user/archive`
4. 再验证单局结束后的 `/api/score/submit`
5. 最后验证 `/api/ad/reward`
