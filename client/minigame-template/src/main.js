const config = require("./config");
const platform = require("./platform");

const systemInfo = tt.getSystemInfoSync();
const canvas = tt.createCanvas();
const ctx = canvas.getContext("2d");
const configStatus = platform.validateConfig();
const STORAGE_KEYS = {
  token: "dymini_native_token",
  audioEnabled: "dymini_native_audio_enabled",
};

canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;

const state = {
  token: "",
  bestScore: 0,
  coin: 0,
  nickname: "玩家",
  runtimeLabel: "抖音小游戏",
  configWarning: "",
  screen: "loading",
  pointer: null,
  reviveUsed: 0,
  rewardDoubled: false,
  latestCoinReward: 0,
  pendingResult: null,
  player: null,
  foods: [],
  fish: [],
  startTime: 0,
  lastFrame: 0,
  touchActive: false,
  audioEnabled: platform.getStorage(STORAGE_KEYS.audioEnabled) !== false,
};

boot().catch((error) => {
  state.screen = "error";
  state.errorMessage = error.message || "初始化失败";
  render();
});

function boot() {
  bindTouches();
  if (!configStatus.hasAppId || !configStatus.hasApiBase) {
    state.configWarning = "检测到仍在使用示例配置，请先替换 appId 和 apiBase。";
  } else if (!configStatus.hasRewardedAdUnitId) {
    state.configWarning = "未配置激励广告位，广告流程将回退模拟通过。";
  }
  render();
  return loginAndLoad().then(() => {
    state.screen = "home";
    loop(Date.now());
  });
}

function bindTouches() {
  tt.onTouchStart((event) => {
    const touch = event.touches && event.touches[0];
    if (!touch) {
      return;
    }
    state.touchActive = true;
    handleTap(touch.clientX, touch.clientY);
    updatePointer(touch.clientX, touch.clientY);
  });

  tt.onTouchMove((event) => {
    const touch = event.touches && event.touches[0];
    if (!touch) {
      return;
    }
    updatePointer(touch.clientX, touch.clientY);
  });

  tt.onTouchEnd(() => {
    state.touchActive = false;
    state.pointer = null;
  });
}

function handleTap(x, y) {
  if (state.screen === "home" && hitButton(x, y, canvas.width - 122, 44, 82, 30)) {
    state.audioEnabled = !state.audioEnabled;
    platform.setStorage(STORAGE_KEYS.audioEnabled, state.audioEnabled);
    platform
      .request("/user/archive", "POST", state.token, {
        audio_enabled: state.audioEnabled,
      })
      .catch(() => {});
    render();
    return;
  }

  if (state.screen === "home" && hitButton(x, y, 38, canvas.height - 156, canvas.width - 76, 58)) {
    startGame();
    return;
  }

  if (state.screen === "revive") {
    if (hitButton(x, y, 34, canvas.height - 180, canvas.width - 68, 54)) {
      showRewardedAd("revive").then((success) => {
        if (success) {
          claimRevive()
            .then(() => {
              state.screen = "playing";
              revivePlayer();
            })
            .catch(() => {
              showToast("复活奖励发放失败");
            });
        }
      });
      return;
    }

    if (hitButton(x, y, 34, canvas.height - 112, canvas.width - 68, 48)) {
      state.screen = "gameover";
      render();
    }
  }

  if (state.screen === "gameover") {
    if (hitButton(x, y, 34, canvas.height - 180, canvas.width - 68, 54)) {
      if (state.rewardDoubled || state.latestCoinReward <= 0) {
        return;
      }
      showRewardedAd("double_reward").then((success) => {
        if (success) {
          claimDoubleReward().catch(() => {
            showToast("双倍奖励发放失败");
          });
        }
      });
      return;
    }

    if (hitButton(x, y, 34, canvas.height - 112, canvas.width - 68, 48)) {
      startGame();
    }
  }
}

function updatePointer(clientX, clientY) {
  state.pointer = { x: clientX, y: clientY };
}

function loginAndLoad() {
  const anonymousId = `anon_${Date.now().toString(36).slice(-6)}`;
  const cachedToken = platform.getStorage(STORAGE_KEYS.token);

  const loadProfileAndArchive = (token) =>
    Promise.all([
      platform.request("/user/profile", "GET", token),
      platform.request("/user/archive", "GET", token),
    ]);

  const loginFresh = () =>
    platform
      .login()
      .then((code) =>
        platform.request("/login", "POST", "", {
          code,
          anonymous_id: anonymousId,
        }),
      )
      .then((loginData) => {
        state.token = loginData.token;
        platform.setStorage(STORAGE_KEYS.token, loginData.token);
        return loadProfileAndArchive(state.token);
      });

  const chain = cachedToken
    ? loadProfileAndArchive(cachedToken)
        .then((result) => {
          state.token = cachedToken;
          return result;
        })
        .catch(() => {
          platform.removeStorage(STORAGE_KEYS.token);
          return loginFresh();
        })
    : loginFresh();

  return chain.then(([profile, archive]) => {
    state.bestScore = archive.best_score;
    state.coin = archive.coin;
    state.nickname = profile.nickname;
    state.audioEnabled = archive.audio_enabled;
    platform.setStorage(STORAGE_KEYS.audioEnabled, archive.audio_enabled);
    state.runtimeLabel = `抖音小游戏 · ${profile.nickname}`;
    if (state.configWarning) {
      showToast(state.configWarning);
    }
  });
}

function startGame() {
  state.player = createPlayer();
  state.foods = Array.from({ length: config.foodCount }, (_, index) => createFood(index));
  state.fish = [
    ...Array.from({ length: config.fishCount }, (_, index) => createFish(index, false)),
    ...Array.from({ length: config.dangerCount }, (_, index) => createFish(config.fishCount + index, true)),
  ];
  state.reviveUsed = 0;
  state.rewardDoubled = false;
  state.latestCoinReward = 0;
  state.pendingResult = null;
  state.startTime = Date.now();
  state.lastFrame = Date.now();
  state.screen = "playing";
  reportEvent("game_start", {
    entry: "home",
  });
}

function revivePlayer() {
  state.player.alive = true;
  state.player.x = config.worldWidth * 0.5;
  state.player.y = config.worldHeight * 0.55;
  state.reviveUsed += 1;
}

function loop(now) {
  const delta = Math.min((now - state.lastFrame) / 1000, 0.033);
  state.lastFrame = now;

  if (state.screen === "playing" && state.player) {
    updateGame(delta);
  }

  render();
  const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (cb) => setTimeout(() => cb(Date.now()), 16);
  raf(loop);
}

function updateGame(delta) {
  updatePlayer(delta);
  updateFish(delta);
  resolveCollisions();
  replenishEntities();
}

function updatePlayer(delta) {
  const player = state.player;
  const camera = getCamera();
  const pointer = state.pointer
    ? {
        x: (state.pointer.x / canvas.width) * config.canvasWidth + camera.x,
        y: (state.pointer.y / canvas.height) * config.canvasHeight + camera.y,
      }
    : { x: player.x, y: player.y - 120 };
  const dx = pointer.x - player.x;
  const dy = pointer.y - player.y;
  const distance = Math.hypot(dx, dy) || 1;
  const stage = config.stages[player.level - 1];

  player.x = clamp(player.x + (dx / distance) * stage.speed * delta, player.radius, config.worldWidth - player.radius);
  player.y = clamp(player.y + (dy / distance) * stage.speed * delta, player.radius, config.worldHeight - player.radius);
}

function updateFish(delta) {
  const timeSeconds = (Date.now() - state.startTime) / 1000;
  const dangerBoost = Math.min(48, timeSeconds * 0.45);
  state.fish.forEach((item) => {
    item.x += Math.cos(item.angle) * item.speed * delta;
    item.y += Math.sin(item.angle) * item.speed * delta;
    if (item.level >= state.player.level + 1) {
      item.speed += dangerBoost * 0.0015;
    }
    if (item.x < item.radius || item.x > config.worldWidth - item.radius) {
      item.angle = Math.PI - item.angle;
    }
    if (item.y < item.radius || item.y > config.worldHeight - item.radius) {
      item.angle = -item.angle;
    }
    item.x = clamp(item.x, item.radius, config.worldWidth - item.radius);
    item.y = clamp(item.y, item.radius, config.worldHeight - item.radius);
  });
}

function resolveCollisions() {
  const player = state.player;

  state.foods = state.foods.filter((food) => {
    if (distance(player, food) <= player.radius + food.radius) {
      player.exp += food.exp;
      player.score += food.score;
      player.eatFoodCount += 1;
      tryUpgrade();
      return false;
    }
    return true;
  });

  state.fish = state.fish.filter((enemy) => {
    if (distance(player, enemy) > player.radius + enemy.radius) {
      return true;
    }

    if (enemy.level < player.level || enemy.radius + 3 < player.radius) {
      player.exp += 28 + enemy.level * 10;
      player.score += enemy.score;
      player.eatFishCount += 1;
      tryUpgrade();
      return false;
    }

    handleDeath();
    return true;
  });
}

function tryUpgrade() {
  const player = state.player;
  while (player.level < config.stages.length) {
    const next = config.stages[player.level];
    if (!next || player.exp < next.expRequired) {
      break;
    }
    player.level = next.level;
    player.radius = next.radius;
    player.maxStage = Math.max(player.maxStage, next.level);
    reportEvent("stage_upgrade", {
      stage: next.level,
    });
  }
}

function handleDeath() {
  const player = state.player;
  player.alive = false;

  if (state.reviveUsed === 0) {
    state.screen = "revive";
    return;
  }

  finishGame();
}

function finishGame() {
  const player = state.player;
  const survivalSeconds = Math.floor((Date.now() - state.startTime) / 1000);
  const result = {
    score: player.score + survivalSeconds * 2,
    survivalSeconds,
    maxStage: player.maxStage,
    eatFoodCount: player.eatFoodCount,
    eatFishCount: player.eatFishCount,
    reviveUsed: state.reviveUsed,
  };
  state.pendingResult = result;
  state.screen = "gameover";
  reportEvent("game_over", {
    score: result.score,
    survival_seconds: result.survivalSeconds,
    max_stage: result.maxStage,
  });

  platform
    .request("/score/submit", "POST", state.token, {
      score: result.score,
      survival_seconds: result.survivalSeconds,
      max_stage: result.maxStage,
      eat_food_count: result.eatFoodCount,
      eat_fish_count: result.eatFishCount,
      revive_used: result.reviveUsed,
      client_ts: Date.now(),
    })
    .then((response) => {
      state.bestScore = response.best_score;
      state.latestCoinReward = response.coin_reward;
      state.coin += response.coin_reward;
    })
    .catch(() => {
      state.latestCoinReward = 0;
      showToast("分数提交失败");
    });
}

function claimRevive() {
  reportEvent("revive_click", {});
  return platform
    .request("/ad/reward", "POST", state.token, {
      reward_type: "revive",
      unique_token: `revive_${Date.now()}`,
      extra: {},
    })
    .then((response) => {
      reportEvent("revive_success", {});
      return response;
    });
}

function claimDoubleReward() {
  reportEvent("double_reward_click", {
    coin_reward: state.latestCoinReward,
  });
  return platform
    .request("/ad/reward", "POST", state.token, {
      reward_type: "double_coin",
      unique_token: `double_${Date.now()}`,
      extra: {
        coin_reward: state.latestCoinReward,
      },
    })
    .then((response) => {
      state.coin = response.coin;
      state.rewardDoubled = true;
      reportEvent("double_reward_success", {
        coin_reward: state.latestCoinReward,
      });
    });
}

function reportEvent(eventName, payload) {
  if (!state.token) {
    return;
  }

  platform
    .request("/event/report", "POST", state.token, {
      events: [
        {
          event_name: eventName,
          event_time: Date.now(),
          payload,
        },
      ],
    })
    .catch(() => {});
}

function showRewardedAd(reason) {
  const ad = platform.createRewardedAd();
  if (!ad) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const onClose = (res) => {
      if (ad.offClose) {
        ad.offClose(onClose);
      }
      resolve(Boolean(res && res.isEnded));
    };
    ad.onClose(onClose);
    ad.load().then(() => ad.show()).catch(() => resolve(false));
  });
}

function replenishEntities() {
  while (state.foods.length < config.foodCount) {
    state.foods.push(createFood(state.foods.length + Math.random() * 1000));
  }
  while (state.fish.length < config.fishCount + config.dangerCount) {
    const dangerous = state.fish.length >= config.fishCount;
    state.fish.push(createFish(state.fish.length + Math.random() * 1000, dangerous));
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (state.screen === "loading") {
    drawCenteredCard("正在连接后端", "初始化抖音小游戏环境...");
    return;
  }

  if (state.screen === "error") {
    drawCenteredCard("初始化失败", state.errorMessage || "请检查后端和小游戏配置");
    return;
  }

  if (state.screen === "home") {
    drawHome();
    return;
  }

  drawWorld();

  if (state.screen === "revive") {
    drawDialog("被大鱼吞掉了", "看一次激励广告，原地复活继续冲更高阶段。", "看广告复活", "直接结算");
    return;
  }

  if (state.screen === "gameover") {
    drawResultDialog();
  }
}

function drawHome() {
  drawCard(20, 28, canvas.width - 40, canvas.height - 56);
  ctx.fillStyle = "#8ecae6";
  ctx.font = "14px sans-serif";
  ctx.fillText("抖音小游戏首版原型", 42, 64);
  ctx.fillStyle = "#f6fbff";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText("深海吞噬进化", 42, 108);
  ctx.fillStyle = "#d8effa";
  ctx.font = "16px sans-serif";
  ctx.fillText("10 秒上手，20 秒进化，1 局就想再来一局。", 42, 142);

  drawPill(42, 172, "单手滑动");
  drawPill(136, 172, "大吃小");
  drawPill(214, 172, "广告复活");

  drawStatCard(42, 220, "最高分", String(state.bestScore));
  drawStatCard(42 + (canvas.width - 126) / 2, 220, "金币", String(state.coin));
  drawButton(canvas.width - 122, 44, 82, 30, state.audioEnabled ? "音效开" : "音效关", false);

  drawButton(38, canvas.height - 156, canvas.width - 76, 58, "开始吞噬", true);
  ctx.fillStyle = "#8ecae6";
  ctx.font = "14px sans-serif";
  ctx.fillText(state.runtimeLabel, 42, canvas.height - 38);
  if (state.configWarning) {
    ctx.fillStyle = "#ffd6a5";
    ctx.font = "13px sans-serif";
    wrapText(state.configWarning, 42, canvas.height - 86, canvas.width - 84, 20);
  }
}

function drawWorld() {
  const camera = getCamera();
  ctx.save();
  ctx.translate(-camera.x * (canvas.width / config.canvasWidth), -camera.y * (canvas.height / config.canvasHeight));
  const scaleX = canvas.width / config.canvasWidth;
  const scaleY = canvas.height / config.canvasHeight;
  ctx.scale(scaleX, scaleY);

  state.foods.forEach((food) => {
    ctx.fillStyle = "#d9ed92";
    ctx.beginPath();
    ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  state.fish.forEach((fish) => drawFish(fish.x, fish.y, fish.radius, fish.color, false));
  drawFish(state.player.x, state.player.y, state.player.radius, config.stages[state.player.level - 1].color, true);
  ctx.restore();

  drawHud();
}

function drawHud() {
  drawCard(16, 16, canvas.width - 32, 90);
  drawSmallStat(30, 36, "分数", String(state.player.score));
  drawSmallStat(160, 36, "阶段", config.stages[state.player.level - 1].label);
  drawSmallStat(300, 36, "复活", `${state.reviveUsed}/1`);

  const current = config.stages[state.player.level - 1];
  const next = config.stages[state.player.level];
  const progress = next
    ? clamp((state.player.exp - current.expRequired) / Math.max(1, next.expRequired - current.expRequired), 0, 1)
    : 1;

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(30, 76, canvas.width - 60, 8, 999);
  ctx.fill();
  ctx.fillStyle = "#ffd166";
  roundRect(30, 76, (canvas.width - 60) * progress, 8, 999);
  ctx.fill();
}

function drawResultDialog() {
  drawDialog(
    "本局结算",
    `本局分数 ${state.pendingResult ? state.pendingResult.score : 0}，最高阶段 ${state.pendingResult ? state.pendingResult.maxStage : 1}`,
    state.rewardDoubled ? "奖励已翻倍" : "看广告拿双倍金币",
    "再来一局",
  );

  ctx.fillStyle = "#d8effa";
  ctx.font = "15px sans-serif";
  ctx.fillText(`最高分 ${state.bestScore}`, 52, canvas.height - 278);
  ctx.fillText(`金币奖励 ${state.rewardDoubled ? state.latestCoinReward * 2 : state.latestCoinReward}`, 52, canvas.height - 250);
}

function drawCenteredCard(title, subtitle) {
  drawDialog(title, subtitle, "", "");
}

function drawDialog(title, subtitle, primaryLabel, secondaryLabel) {
  drawCard(20, canvas.height - 320, canvas.width - 40, 280);
  ctx.fillStyle = "#f6fbff";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(title, 40, canvas.height - 274);
  ctx.fillStyle = "#d8effa";
  ctx.font = "15px sans-serif";
  wrapText(subtitle, 40, canvas.height - 240, canvas.width - 80, 24);
  if (primaryLabel) {
    drawButton(34, canvas.height - 180, canvas.width - 68, 54, primaryLabel, true);
  }
  if (secondaryLabel) {
    drawButton(34, canvas.height - 112, canvas.width - 68, 48, secondaryLabel, false);
  }
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#bde0fe");
  gradient.addColorStop(0.35, "#48cae4");
  gradient.addColorStop(0.75, "#023e8a");
  gradient.addColorStop(1, "#001d3d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCard(x, y, width, height) {
  ctx.fillStyle = "rgba(2, 28, 44, 0.82)";
  ctx.strokeStyle = "rgba(144, 224, 239, 0.20)";
  ctx.lineWidth = 1;
  roundRect(x, y, width, height, 24);
  ctx.fill();
  ctx.stroke();
}

function drawButton(x, y, width, height, label, primary) {
  ctx.fillStyle = primary ? "#ffd166" : "rgba(141, 153, 174, 0.22)";
  roundRect(x, y, width, height, 16);
  ctx.fill();
  ctx.fillStyle = primary ? "#012a4a" : "#f1faff";
  ctx.font = "bold 18px sans-serif";
  const textWidth = ctx.measureText(label).width;
  ctx.fillText(label, x + (width - textWidth) / 2, y + height / 2 + 6);
}

function drawPill(x, y, text) {
  ctx.fillStyle = "rgba(144, 224, 239, 0.15)";
  roundRect(x, y, 84, 28, 999);
  ctx.fill();
  ctx.fillStyle = "#dff4ff";
  ctx.font = "12px sans-serif";
  ctx.fillText(text, x + 12, y + 18);
}

function drawStatCard(x, y, label, value) {
  drawCard(x, y, (canvas.width - 126) / 2, 96);
  ctx.fillStyle = "#b5d6e6";
  ctx.font = "13px sans-serif";
  ctx.fillText(label, x + 16, y + 28);
  ctx.fillStyle = "#f6fbff";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(value, x + 16, y + 66);
}

function drawSmallStat(x, y, label, value) {
  ctx.fillStyle = "#b5d6e6";
  ctx.font = "12px sans-serif";
  ctx.fillText(label, x, y);
  ctx.fillStyle = "#f6fbff";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(value, x, y + 22);
}

function drawFish(x, y, radius, color, player) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-radius, 0);
  ctx.lineTo(-radius - radius * 0.65, -radius * 0.45);
  ctx.lineTo(-radius - radius * 0.65, radius * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = player ? "#ffffff" : "#0b132b";
  ctx.beginPath();
  ctx.arc(radius * 0.35, -radius * 0.12, Math.max(2.5, radius * 0.14), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split("");
  let line = "";
  let offsetY = 0;
  words.forEach((word) => {
    const testLine = line + word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + offsetY);
      line = word;
      offsetY += lineHeight;
      return;
    }
    line = testLine;
  });
  if (line) {
    ctx.fillText(line, x, y + offsetY);
  }
}

function getCamera() {
  return {
    x: clamp(state.player.x - config.canvasWidth / 2, 0, config.worldWidth - config.canvasWidth),
    y: clamp(state.player.y - config.canvasHeight / 2, 0, config.worldHeight - config.canvasHeight),
  };
}

function createPlayer() {
  const initial = config.stages[0];
  return {
    x: config.worldWidth * 0.5,
    y: config.worldHeight * 0.55,
    radius: initial.radius,
    level: initial.level,
    exp: 0,
    score: 0,
    alive: true,
    eatFoodCount: 0,
    eatFishCount: 0,
    maxStage: 1,
  };
}

function createFood(seed) {
  return {
    id: `food_${seed}`,
    x: 30 + Math.random() * (config.worldWidth - 60),
    y: 30 + Math.random() * (config.worldHeight - 60),
    radius: 5 + Math.random() * 4,
    exp: 8 + Math.floor(Math.random() * 7),
    score: 5 + Math.floor(Math.random() * 5),
  };
}

function createFish(seed, dangerous) {
  const stage = dangerous
    ? config.stages[3 + Math.floor(Math.random() * 4)]
    : config.stages[Math.floor(Math.random() * 4)];
  return {
    id: `fish_${seed}`,
    x: 50 + Math.random() * (config.worldWidth - 100),
    y: 50 + Math.random() * (config.worldHeight - 100),
    radius: dangerous ? stage.radius + 4 : stage.radius - 4,
    level: dangerous ? Math.min(stage.level + 1, 8) : stage.level,
    speed: 90 + Math.random() * (dangerous ? 70 : 40),
    angle: Math.random() * Math.PI * 2,
    color: dangerous ? "#16324f" : stage.color,
    score: 18 + stage.level * 7,
  };
}

function showToast(title) {
  if (tt.showToast) {
    tt.showToast({ title, icon: "none", duration: 1200 });
  }
}

function hitButton(x, y, left, top, width, height) {
  return x >= left && x <= left + width && y >= top && y <= top + height;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
