import "./style.css";

import { DeepSeaGame } from "./game/game";
import { bootstrapSession, claimDoubleReward, claimRevive, reportSimpleEvent, saveArchive, submitScore } from "./services/api";
import { EVENT_NAMES } from "./config";
import { getRuntimeLabel, showRewardedAd } from "./platform/runtime";
import type { GameResult, Session } from "./types";
import { getAudioEnabled, setAudioEnabled } from "./services/storage";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("app root missing");
}

app.innerHTML = `
  <div class="shell">
    <section class="panel home-panel" id="home-panel">
      <div class="eyebrow">抖音极简吞噬原型</div>
      <h1>深海吞噬进化</h1>
      <p class="subtitle">从鱼苗开始，大吃小，越吞越大。</p>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">最高分</span>
          <strong id="best-score">0</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">金币</span>
          <strong id="coin-count">0</strong>
        </div>
      </div>
      <div class="home-actions">
        <button class="primary-button" id="start-button">开始游戏</button>
        <label class="audio-toggle">
          <input type="checkbox" id="audio-toggle" />
          <span>音效开关</span>
        </label>
      </div>
      <div class="status-text" id="status-text">正在初始化...</div>
    </section>

    <section class="panel game-panel hidden" id="game-panel">
      <div class="hud">
        <div class="hud-item">
          <span>分数</span>
          <strong id="hud-score">0</strong>
        </div>
        <div class="hud-item">
          <span>阶段</span>
          <strong id="hud-stage">鱼苗</strong>
        </div>
        <div class="hud-item">
          <span>复活</span>
          <strong id="hud-revive">0/1</strong>
        </div>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="hud-progress"></div>
      </div>
      <canvas id="game-canvas"></canvas>
    </section>

    <section class="overlay hidden" id="revive-overlay">
      <div class="dialog">
        <h2>被大鱼吞掉了</h2>
        <p>看一次广告模拟，原地复活继续冲分。</p>
        <div class="dialog-actions">
          <button class="primary-button" id="revive-button">复活继续</button>
          <button class="secondary-button" id="skip-revive-button">直接结算</button>
        </div>
      </div>
    </section>

    <section class="overlay hidden" id="gameover-overlay">
      <div class="dialog">
        <h2>本局结算</h2>
        <div class="result-grid">
          <div><span>本局分数</span><strong id="result-score">0</strong></div>
          <div><span>最高分</span><strong id="result-best-score">0</strong></div>
          <div><span>最高阶段</span><strong id="result-stage">1</strong></div>
          <div><span>金币奖励</span><strong id="result-coin">0</strong></div>
        </div>
        <div class="dialog-actions">
          <button class="primary-button" id="double-reward-button">广告双倍奖励</button>
          <button class="secondary-button" id="restart-button">再来一局</button>
        </div>
      </div>
    </section>
  </div>
`;

const startButton = must<HTMLButtonElement>("#start-button");
const statusText = must<HTMLDivElement>("#status-text");
const bestScore = must<HTMLElement>("#best-score");
const coinCount = must<HTMLElement>("#coin-count");
const audioToggle = must<HTMLInputElement>("#audio-toggle");
const homePanel = must<HTMLElement>("#home-panel");
const gamePanel = must<HTMLElement>("#game-panel");
const reviveOverlay = must<HTMLElement>("#revive-overlay");
const gameOverOverlay = must<HTMLElement>("#gameover-overlay");
const resultScore = must<HTMLElement>("#result-score");
const resultBestScore = must<HTMLElement>("#result-best-score");
const resultStage = must<HTMLElement>("#result-stage");
const resultCoin = must<HTMLElement>("#result-coin");
const restartButton = must<HTMLButtonElement>("#restart-button");
const doubleRewardButton = must<HTMLButtonElement>("#double-reward-button");
const reviveButton = must<HTMLButtonElement>("#revive-button");
const skipReviveButton = must<HTMLButtonElement>("#skip-revive-button");
const hudScore = must<HTMLElement>("#hud-score");
const hudStage = must<HTMLElement>("#hud-stage");
const hudRevive = must<HTMLElement>("#hud-revive");
const hudProgress = must<HTMLElement>("#hud-progress");
const canvas = must<HTMLCanvasElement>("#game-canvas");

let session: Session | null = null;
let game: DeepSeaGame | null = null;
let pendingResult: GameResult | null = null;
let latestCoinReward = 0;
let rewardDoubled = false;

audioToggle.checked = getAudioEnabled();

audioToggle.addEventListener("change", async () => {
  setAudioEnabled(audioToggle.checked);
  if (session) {
    session.archive.audio_enabled = audioToggle.checked;
    await saveArchive({ audio_enabled: audioToggle.checked });
  }
});

startButton.addEventListener("click", () => {
  if (!session) {
    return;
  }
  openGame();
});

restartButton.addEventListener("click", () => {
  if (!session) {
    return;
  }
  openGame();
});

doubleRewardButton.addEventListener("click", async () => {
  if (!session || rewardDoubled || latestCoinReward <= 0) {
    return;
  }

  doubleRewardButton.disabled = true;
  try {
    const watched = await showRewardedAd("double_reward");
    if (!watched) {
      return;
    }
    const reward = await claimDoubleReward(latestCoinReward);
    rewardDoubled = true;
    session.archive.coin = reward.coin;
    session.profile.coin = reward.coin;
    coinCount.textContent = String(reward.coin);
    resultCoin.textContent = String(latestCoinReward * 2);
  } finally {
    doubleRewardButton.disabled = rewardDoubled;
  }
});

reviveButton.addEventListener("click", async () => {
  if (!game) {
    return;
  }
  reviveButton.disabled = true;
  try {
    const watched = await showRewardedAd("revive");
    if (!watched) {
      return;
    }
    await claimRevive();
    hide(reviveOverlay);
    game.revive();
  } finally {
    reviveButton.disabled = false;
  }
});

skipReviveButton.addEventListener("click", () => {
  hide(reviveOverlay);
  if (pendingResult) {
    void finalizeGame(pendingResult);
  }
});

void initialize();

async function initialize(): Promise<void> {
  statusText.textContent = "正在连接后端...";
  try {
    session = await bootstrapSession();
    session.archive.audio_enabled = getAudioEnabled();
    statusText.textContent = `欢迎回来，${session.profile.nickname} · ${getRuntimeLabel()}`;
    bestScore.textContent = String(session.archive.best_score);
    coinCount.textContent = String(session.archive.coin);
    await saveArchive({ audio_enabled: session.archive.audio_enabled });
  } catch (error) {
    const message = error instanceof Error ? error.message : "初始化失败";
    statusText.textContent = `初始化失败：${message}`;
  }
}

function openGame(): void {
  if (!session) {
    return;
  }

  hide(homePanel);
  hide(gameOverOverlay);
  hide(reviveOverlay);
  show(gamePanel);
  rewardDoubled = false;
  latestCoinReward = 0;
  pendingResult = null;

  game?.stop();
  game = new DeepSeaGame(canvas, {
    onHudUpdate: (hud) => {
      hudScore.textContent = String(hud.score);
      hudStage.textContent = hud.stageLabel;
      hudRevive.textContent = `${hud.reviveUsed}/1`;
      hudProgress.style.width = `${Math.round(hud.progress * 100)}%`;
    },
    onReviveAvailable: () => {
      show(reviveOverlay);
    },
    onGameOver: (result) => {
      pendingResult = result;
      void finalizeGame(result);
    },
  });
  game.start();
}

async function finalizeGame(result: GameResult): Promise<void> {
  if (!session) {
    return;
  }

  game?.stop();
  latestCoinReward = 0;
  rewardDoubled = false;

  try {
    const submitResult = await submitScore(result);
    latestCoinReward = submitResult.coin_reward;
    session.archive.best_score = submitResult.best_score;
    session.profile.best_score = submitResult.best_score;
    session.archive.coin += submitResult.coin_reward;
    session.profile.coin = session.archive.coin;

    bestScore.textContent = String(submitResult.best_score);
    coinCount.textContent = String(session.archive.coin);
    resultScore.textContent = String(result.score);
    resultBestScore.textContent = String(submitResult.best_score);
    resultStage.textContent = String(result.maxStage);
    resultCoin.textContent = String(submitResult.coin_reward);
    doubleRewardButton.disabled = latestCoinReward <= 0;
  } catch (error) {
    resultScore.textContent = String(result.score);
    resultBestScore.textContent = bestScore.textContent ?? "0";
    resultStage.textContent = String(result.maxStage);
    resultCoin.textContent = "0";
    doubleRewardButton.disabled = true;
    const message = error instanceof Error ? error.message : "score_submit_failed";
    await reportSimpleEvent(EVENT_NAMES.gameOver, { local_only: true, reason: message });
  }

  hide(gamePanel);
  hide(reviveOverlay);
  show(gameOverOverlay);
}

function show(element: HTMLElement): void {
  element.classList.remove("hidden");
}

function hide(element: HTMLElement): void {
  element.classList.add("hidden");
}

function must<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}
