export type GameScreen = "home" | "playing" | "revive" | "gameover";

export type UserProfile = {
  user_id: number;
  nickname: string;
  avatar_url: string;
  coin: number;
  best_score: number;
  current_skin_id: string;
  audio_enabled: boolean;
};

export type UserArchive = {
  best_score: number;
  coin: number;
  current_skin_id: string;
  owned_skin_ids: string[];
  audio_enabled: boolean;
  daily: {
    revive_used: number;
    ad_reward_claimed: number;
  };
};

export type Session = {
  token: string;
  profile: UserProfile;
  archive: UserArchive;
};

export type Food = {
  id: string;
  x: number;
  y: number;
  radius: number;
  exp: number;
  score: number;
};

export type EnemyFish = {
  id: string;
  x: number;
  y: number;
  radius: number;
  level: number;
  speed: number;
  angle: number;
  color: string;
  score: number;
};

export type PlayerFish = {
  x: number;
  y: number;
  radius: number;
  level: number;
  speed: number;
  exp: number;
  score: number;
  alive: boolean;
};

export type GameResult = {
  score: number;
  survivalSeconds: number;
  maxStage: number;
  eatFoodCount: number;
  eatFishCount: number;
  reviveUsed: number;
};
