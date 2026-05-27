type TTLoginSuccess = {
  code: string;
};

type TTRewardClose = {
  isEnded?: boolean;
  count?: number;
};

type TTRewardedVideoAd = {
  load: () => Promise<void>;
  show: () => Promise<void>;
  onError: (handler: (error: unknown) => void) => void;
  offError?: (handler: (error: unknown) => void) => void;
  onClose: (handler: (payload: TTRewardClose) => void) => void;
  offClose?: (handler: (payload: TTRewardClose) => void) => void;
};

type TTEnvInfo = {
  microapp?: {
    appId?: string;
    envType?: string;
  };
};

type TTNamespace = {
  login: (options: {
    success: (result: TTLoginSuccess) => void;
    fail?: (error: unknown) => void;
  }) => void;
  getEnvInfoSync?: () => TTEnvInfo;
  createRewardedVideoAd?: (options: { adUnitId: string }) => TTRewardedVideoAd;
  showToast?: (options: { title: string; icon?: "none" | "success" | "fail"; duration?: number }) => void;
};

type RewardReason = "revive" | "double_reward";

declare global {
  interface Window {
    tt?: TTNamespace;
  }
}

const WEB_REWARD_COPY: Record<RewardReason, string> = {
  revive: "模拟广告：确认后立即复活",
  double_reward: "模拟广告：确认后领取双倍奖励",
};

let rewardedVideoAd: TTRewardedVideoAd | null = null;

export function isDouyinMiniGameRuntime(): boolean {
  return typeof window !== "undefined" && typeof window.tt !== "undefined";
}

export function getRuntimeLabel(): string {
  if (!isDouyinMiniGameRuntime()) {
    return "Web 模拟模式";
  }

  const envInfo = window.tt?.getEnvInfoSync?.();
  const envType = envInfo?.microapp?.envType;
  return envType ? `抖音小游戏 ${envType}` : "抖音小游戏";
}

export async function getLoginCode(fallbackCode: string): Promise<string> {
  if (!isDouyinMiniGameRuntime() || !window.tt?.login) {
    return fallbackCode;
  }

  return new Promise<string>((resolve, reject) => {
    window.tt?.login({
      success: (result) => {
        if (result.code) {
          resolve(result.code);
          return;
        }
        reject(new Error("tt_login_code_missing"));
      },
      fail: (error) => {
        reject(error instanceof Error ? error : new Error("tt_login_failed"));
      },
    });
  });
}

export async function showRewardedAd(reason: RewardReason): Promise<boolean> {
  if (!isDouyinMiniGameRuntime()) {
    return Promise.resolve(window.confirm(WEB_REWARD_COPY[reason]));
  }

  const adUnitId = import.meta.env.VITE_DOUYIN_REWARDED_AD_UNIT_ID;
  if (!adUnitId || !window.tt?.createRewardedVideoAd) {
    window.tt?.showToast?.({
      title: "缺少广告位配置，已回退模拟成功",
      icon: "none",
      duration: 1800,
    });
    return true;
  }

  if (!rewardedVideoAd) {
    rewardedVideoAd = window.tt.createRewardedVideoAd({ adUnitId });
  }

  return new Promise<boolean>((resolve, reject) => {
    if (!rewardedVideoAd) {
      reject(new Error("reward_ad_unavailable"));
      return;
    }

    const handleClose = (payload: TTRewardClose) => {
      rewardedVideoAd?.offClose?.(handleClose);
      rewardedVideoAd?.offError?.(handleError);
      resolve(Boolean(payload?.isEnded));
    };

    const handleError = (error: unknown) => {
      rewardedVideoAd?.offClose?.(handleClose);
      rewardedVideoAd?.offError?.(handleError);
      reject(error instanceof Error ? error : new Error("reward_ad_failed"));
    };

    rewardedVideoAd.onClose(handleClose);
    rewardedVideoAd.onError(handleError);
    rewardedVideoAd
      .load()
      .then(() => rewardedVideoAd?.show())
      .catch(handleError);
  });
}
