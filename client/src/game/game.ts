import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DANGER_COUNT,
  EVENT_NAMES,
  FISH_COUNT,
  FOOD_COUNT,
  STAGES,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../config";
import type { EnemyFish, Food, GameResult, PlayerFish } from "../types";
import { reportSimpleEvent } from "../services/api";

type PointerTarget = { x: number; y: number } | null;

type GameCallbacks = {
  onHudUpdate: (hud: {
    score: number;
    stageLabel: string;
    progress: number;
    reviveUsed: number;
  }) => void;
  onReviveAvailable: () => void;
  onGameOver: (result: GameResult) => void;
};

export class DeepSeaGame {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly callbacks: GameCallbacks;
  private foods: Food[] = [];
  private fish: EnemyFish[] = [];
  private player: PlayerFish = createPlayer();
  private lastFrame = 0;
  private rafId = 0;
  private pointerTarget: PointerTarget = null;
  private startTime = 0;
  private running = false;
  private reviveUsed = 0;
  private revivePending = false;
  private eatFoodCount = 0;
  private eatFishCount = 0;
  private maxStage = 1;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("2d context unavailable");
    }

    this.canvas = canvas;
    this.context = context;
    this.callbacks = callbacks;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.bindPointer();
  }

  start(): void {
    this.foods = Array.from({ length: FOOD_COUNT }, (_, index) => createFood(index));
    this.fish = [
      ...Array.from({ length: FISH_COUNT }, (_, index) => createFish(index, false)),
      ...Array.from({ length: DANGER_COUNT }, (_, index) => createFish(index + FISH_COUNT, true)),
    ];
    this.player = createPlayer();
    this.lastFrame = performance.now();
    this.startTime = performance.now();
    this.running = true;
    this.reviveUsed = 0;
    this.revivePending = false;
    this.eatFoodCount = 0;
    this.eatFishCount = 0;
    this.maxStage = 1;
    this.callbacks.onHudUpdate(this.getHudState());
    void reportSimpleEvent(EVENT_NAMES.gameStart);
    this.loop(this.lastFrame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  revive(): void {
    this.revivePending = false;
    this.player.alive = true;
    this.player.x = WORLD_WIDTH * 0.5;
    this.player.y = WORLD_HEIGHT * 0.55;
    this.reviveUsed += 1;
    this.running = true;
    this.lastFrame = performance.now();
    this.callbacks.onHudUpdate(this.getHudState());
    this.loop(this.lastFrame);
  }

  private loop = (timestamp: number): void => {
    if (!this.running) {
      return;
    }

    const delta = Math.min((timestamp - this.lastFrame) / 1000, 0.033);
    this.lastFrame = timestamp;

    this.updatePlayer(delta);
    this.updateFish(delta);
    this.resolveCollisions();
    this.replenishEntities();
    this.render();

    if (this.player.alive) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  private updatePlayer(delta: number): void {
    const target = this.pointerTarget ?? {
      x: this.player.x,
      y: this.player.y - 120,
    };
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    const distance = Math.hypot(dx, dy) || 1;
    const speed = stageForLevel(this.player.level).speed;

    this.player.x = clamp(
      this.player.x + (dx / distance) * speed * delta,
      this.player.radius,
      WORLD_WIDTH - this.player.radius,
    );
    this.player.y = clamp(
      this.player.y + (dy / distance) * speed * delta,
      this.player.radius,
      WORLD_HEIGHT - this.player.radius,
    );
  }

  private updateFish(delta: number): void {
    const timeSeconds = (performance.now() - this.startTime) / 1000;
    const dangerBoost = Math.min(48, timeSeconds * 0.45);

    this.fish.forEach((item) => {
      item.x += Math.cos(item.angle) * item.speed * delta;
      item.y += Math.sin(item.angle) * item.speed * delta;
      if (item.level >= this.player.level + 1) {
        item.speed += dangerBoost * 0.0015;
      }

      if (item.x < item.radius || item.x > WORLD_WIDTH - item.radius) {
        item.angle = Math.PI - item.angle;
      }
      if (item.y < item.radius || item.y > WORLD_HEIGHT - item.radius) {
        item.angle = -item.angle;
      }

      item.x = clamp(item.x, item.radius, WORLD_WIDTH - item.radius);
      item.y = clamp(item.y, item.radius, WORLD_HEIGHT - item.radius);
    });
  }

  private resolveCollisions(): void {
    this.foods = this.foods.filter((food) => {
      if (distance(this.player, food) <= this.player.radius + food.radius) {
        this.player.exp += food.exp;
        this.player.score += food.score;
        this.eatFoodCount += 1;
        this.tryUpgrade();
        this.callbacks.onHudUpdate(this.getHudState());
        return false;
      }
      return true;
    });

    this.fish = this.fish.filter((enemy) => {
      if (distance(this.player, enemy) > this.player.radius + enemy.radius) {
        return true;
      }

      if (enemy.level < this.player.level || enemy.radius + 3 < this.player.radius) {
        this.player.exp += 22 + enemy.level * 8;
        this.player.score += enemy.score;
        this.eatFishCount += 1;
        this.tryUpgrade();
        this.callbacks.onHudUpdate(this.getHudState());
        return false;
      }

      this.handleDeath();
      return true;
    });
  }

  private tryUpgrade(): void {
    while (this.player.level < STAGES.length) {
      const next = STAGES[this.player.level];
      if (!next || this.player.exp < next.expRequired) {
        break;
      }
      this.player.level = next.level;
      this.player.radius = next.radius;
      this.player.speed = next.speed;
      this.maxStage = Math.max(this.maxStage, next.level);
      void reportSimpleEvent(EVENT_NAMES.stageUpgrade, { stage: next.level });
    }
  }

  private handleDeath(): void {
    this.player.alive = false;
    this.running = false;
    cancelAnimationFrame(this.rafId);

    if (this.reviveUsed === 0 && !this.revivePending) {
      this.revivePending = true;
      this.callbacks.onReviveAvailable();
      return;
    }

    const survivalSeconds = Math.floor((performance.now() - this.startTime) / 1000);
    const result: GameResult = {
      score: this.player.score + survivalSeconds * 2,
      survivalSeconds,
      maxStage: this.maxStage,
      eatFoodCount: this.eatFoodCount,
      eatFishCount: this.eatFishCount,
      reviveUsed: this.reviveUsed,
    };
    void reportSimpleEvent(EVENT_NAMES.gameOver, {
      score: result.score,
      survival_seconds: result.survivalSeconds,
      max_stage: result.maxStage,
    });
    this.callbacks.onGameOver(result);
  }

  private replenishEntities(): void {
    while (this.foods.length < FOOD_COUNT) {
      this.foods.push(createFood(this.foods.length + Math.random() * 1000));
    }
    while (this.fish.length < FISH_COUNT + DANGER_COUNT) {
      const dangerous = this.fish.length >= FISH_COUNT;
      this.fish.push(createFish(this.fish.length + Math.random() * 1000, dangerous));
    }
  }

  private render(): void {
    const ctx = this.context;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBackground(ctx);

    const cameraX = clamp(this.player.x - CANVAS_WIDTH / 2, 0, WORLD_WIDTH - CANVAS_WIDTH);
    const cameraY = clamp(this.player.y - CANVAS_HEIGHT / 2, 0, WORLD_HEIGHT - CANVAS_HEIGHT);

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    this.foods.forEach((food) => {
      ctx.fillStyle = "#d9ed92";
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    this.fish.forEach((enemy) => drawFish(ctx, enemy.x, enemy.y, enemy.radius, enemy.color, false));
    drawFish(ctx, this.player.x, this.player.y, this.player.radius, stageForLevel(this.player.level).color, true);

    ctx.restore();
  }

  private getHudState(): {
    score: number;
    stageLabel: string;
    progress: number;
    reviveUsed: number;
  } {
    const current = stageForLevel(this.player.level);
    const next = STAGES[this.player.level];
    const progress = next
      ? (this.player.exp - current.expRequired) / Math.max(1, next.expRequired - current.expRequired)
      : 1;

    return {
      score: this.player.score,
      stageLabel: current.label,
      progress: clamp(progress, 0, 1),
      reviveUsed: this.reviveUsed,
    };
  }

  private bindPointer(): void {
    const updateTarget = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect();
      const normalizedX = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      const normalizedY = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
      const cameraX = clamp(this.player.x - CANVAS_WIDTH / 2, 0, WORLD_WIDTH - CANVAS_WIDTH);
      const cameraY = clamp(this.player.y - CANVAS_HEIGHT / 2, 0, WORLD_HEIGHT - CANVAS_HEIGHT);

      this.pointerTarget = {
        x: normalizedX + cameraX,
        y: normalizedY + cameraY,
      };
    };

    this.canvas.addEventListener("pointerdown", (event) => {
      updateTarget(event.clientX, event.clientY);
    });
    this.canvas.addEventListener("pointermove", (event) => {
      if ((event.buttons & 1) === 1) {
        updateTarget(event.clientX, event.clientY);
      }
    });
    this.canvas.addEventListener("pointerup", () => {
      this.pointerTarget = null;
    });
    this.canvas.addEventListener("pointerleave", () => {
      this.pointerTarget = null;
    });
  }
}

function createPlayer(): PlayerFish {
  const initial = STAGES[0];
  return {
    x: WORLD_WIDTH * 0.5,
    y: WORLD_HEIGHT * 0.55,
    radius: initial.radius,
    level: initial.level,
    speed: initial.speed,
    exp: 0,
    score: 0,
    alive: true,
  };
}

function createFood(seed: number): Food {
  return {
    id: `food_${seed}`,
    x: 30 + Math.random() * (WORLD_WIDTH - 60),
    y: 30 + Math.random() * (WORLD_HEIGHT - 60),
    radius: 5 + Math.random() * 4,
    exp: 6 + Math.floor(Math.random() * 6),
    score: 4 + Math.floor(Math.random() * 4),
  };
}

function createFish(seed: number, dangerous: boolean): EnemyFish {
  const stage = dangerous
    ? STAGES[3 + Math.floor(Math.random() * 4)]
    : STAGES[Math.floor(Math.random() * 5)];

  return {
    id: `fish_${seed}`,
    x: 50 + Math.random() * (WORLD_WIDTH - 100),
    y: 50 + Math.random() * (WORLD_HEIGHT - 100),
    radius: dangerous ? stage.radius + 4 : stage.radius - 3,
    level: dangerous ? Math.min(stage.level + 1, 8) : stage.level,
    speed: 90 + Math.random() * (dangerous ? 70 : 40),
    angle: Math.random() * Math.PI * 2,
    color: dangerous ? "#16324f" : stage.color,
    score: 18 + stage.level * 7,
  };
}

function stageForLevel(level: number) {
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, level - 1))];
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#bde0fe");
  gradient.addColorStop(0.35, "#48cae4");
  gradient.addColorStop(0.75, "#023e8a");
  gradient.addColorStop(1, "#001d3d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let index = 0; index < 12; index += 1) {
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.arc(30 + index * 34, 40 + (index % 3) * 18, 6 + (index % 4), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  player: boolean,
): void {
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
