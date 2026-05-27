import { API_BASE, EVENT_NAMES } from "../config";
import type { GameResult, Session, UserArchive, UserProfile } from "../types";
import { getAnonymousId, getToken, setToken } from "./storage";

type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

type LoginData = {
  token: string;
  user: {
    user_id: number;
    nickname: string;
    avatar_url: string;
    coin: number;
    best_score: number;
  };
};

export async function bootstrapSession(): Promise<Session> {
  const token = await ensureLogin();
  const [profile, archive] = await Promise.all([
    request<UserProfile>("/user/profile", { token }),
    request<UserArchive>("/user/archive", { token }),
  ]);

  return { token, profile, archive };
}

export async function saveArchive(patch: {
  current_skin_id?: string;
  audio_enabled?: boolean;
}): Promise<void> {
  const token = getRequiredToken();
  await request("/user/archive", {
    method: "POST",
    token,
    body: patch,
  });
}

export async function submitScore(result: GameResult): Promise<{
  best_score: number;
  is_new_record: boolean;
  coin_reward: number;
}> {
  const token = getRequiredToken();
  return request("/score/submit", {
    method: "POST",
    token,
    body: {
      score: result.score,
      survival_seconds: result.survivalSeconds,
      max_stage: result.maxStage,
      eat_food_count: result.eatFoodCount,
      eat_fish_count: result.eatFishCount,
      revive_used: result.reviveUsed,
      client_ts: Date.now(),
    },
  });
}

export async function claimDoubleReward(coinReward: number): Promise<{ coin: number }> {
  const token = getRequiredToken();
  await reportSimpleEvent(EVENT_NAMES.doubleRewardClick);
  const response = await request<{ granted: boolean; coin: number }>("/ad/reward", {
    method: "POST",
    token,
    body: {
      reward_type: "double_coin",
      unique_token: `double_${crypto.randomUUID()}`,
      extra: {
        coin_reward: coinReward,
      },
    },
  });
  await reportSimpleEvent(EVENT_NAMES.doubleRewardSuccess, { coin_reward: coinReward });
  return { coin: response.coin };
}

export async function claimRevive(): Promise<void> {
  const token = getRequiredToken();
  await reportSimpleEvent(EVENT_NAMES.reviveClick);
  await request("/ad/reward", {
    method: "POST",
    token,
    body: {
      reward_type: "revive",
      unique_token: `revive_${crypto.randomUUID()}`,
      extra: {},
    },
  });
  await reportSimpleEvent(EVENT_NAMES.reviveSuccess);
}

export async function reportSimpleEvent(eventName: string, payload: Record<string, unknown> = {}): Promise<void> {
  const token = getToken();
  if (!token) {
    return;
  }

  try {
    await request("/event/report", {
      method: "POST",
      token,
      body: {
        events: [
          {
            event_name: eventName,
            event_time: Date.now(),
            payload,
          },
        ],
      },
    });
  } catch {
    // Ignore analytics failures in the prototype.
  }
}

async function ensureLogin(): Promise<string> {
  const existing = getToken();
  if (existing) {
    return existing;
  }

  const anonymousId = getAnonymousId();
  const response = await request<LoginData>("/login", {
    method: "POST",
    body: {
      code: `dev_${anonymousId}`,
      anonymous_id: anonymousId,
    },
  });

  setToken(response.token);
  return response.token;
}

function getRequiredToken(): string {
  const token = getToken();
  if (!token) {
    throw new Error("Token is missing");
  }
  return token;
}

async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    token?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || data.code !== 0) {
    throw new Error(data.message || "request_failed");
  }

  return data.data;
}
