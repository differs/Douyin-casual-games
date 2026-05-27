export const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ?? "http://127.0.0.1:8080/api";

export const WORLD_WIDTH = 900;
export const WORLD_HEIGHT = 1600;
export const CANVAS_WIDTH = 420;
export const CANVAS_HEIGHT = 760;

export const FOOD_COUNT = 36;
export const FISH_COUNT = 14;
export const DANGER_COUNT = 5;

export const STAGES = [
  { level: 1, label: "鱼苗", radius: 14, speed: 170, expRequired: 0, color: "#ffd166" },
  { level: 2, label: "小丑鱼", radius: 18, speed: 180, expRequired: 50, color: "#ffb703" },
  { level: 3, label: "河豚", radius: 22, speed: 188, expRequired: 130, color: "#fb8500" },
  { level: 4, label: "海马", radius: 26, speed: 196, expRequired: 250, color: "#90be6d" },
  { level: 5, label: "鲭鱼", radius: 30, speed: 205, expRequired: 420, color: "#43aa8b" },
  { level: 6, label: "鲨鱼幼体", radius: 36, speed: 210, expRequired: 650, color: "#4d908e" },
  { level: 7, label: "鲨鱼", radius: 44, speed: 220, expRequired: 960, color: "#577590" },
  { level: 8, label: "深海巨兽", radius: 56, speed: 228, expRequired: 1350, color: "#277da1" },
] as const;

export const EVENT_NAMES = {
  gameStart: "game_start",
  gameOver: "game_over",
  reviveClick: "revive_click",
  reviveSuccess: "revive_success",
  doubleRewardClick: "double_reward_click",
  doubleRewardSuccess: "double_reward_success",
  stageUpgrade: "stage_upgrade",
} as const;
