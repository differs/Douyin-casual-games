const config = require("./config");

function validateConfig() {
  return {
    hasAppId: Boolean(config.appId && config.appId !== "touristappid"),
    hasApiBase: Boolean(config.apiBase && !config.apiBase.includes("127.0.0.1")),
    hasRewardedAdUnitId: Boolean(config.rewardedAdUnitId),
  };
}

function getStorage(key) {
  try {
    return tt.getStorageSync(key);
  } catch (error) {
    return "";
  }
}

function setStorage(key, value) {
  try {
    tt.setStorageSync(key, value);
  } catch (error) {
    // ignore
  }
}

function removeStorage(key) {
  try {
    tt.removeStorageSync(key);
  } catch (error) {
    // ignore
  }
}

function login() {
  return new Promise((resolve, reject) => {
    tt.login({
      success(res) {
        if (res && res.code) {
          resolve(res.code);
          return;
        }
        reject(new Error("tt_login_code_missing"));
      },
      fail(error) {
        reject(error || new Error("tt_login_failed"));
      }
    });
  });
}

function request(path, method, token, body) {
  return new Promise((resolve, reject) => {
    tt.request({
      url: `${config.apiBase}${path}`,
      method,
      header: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      data: body,
      success(res) {
        const response = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300 && response.code === 0) {
          resolve(response.data);
          return;
        }
        reject(new Error(response.message || "request_failed"));
      },
      fail(error) {
        reject(error || new Error("request_failed"));
      }
    });
  });
}

function createRewardedAd() {
  if (!config.rewardedAdUnitId) {
    return null;
  }

  try {
    return tt.createRewardedVideoAd({
      adUnitId: config.rewardedAdUnitId,
    });
  } catch (error) {
    return null;
  }
}

function showToast(title) {
  if (tt.showToast) {
    tt.showToast({
      title,
      icon: "none",
      duration: 1400,
    });
  }
}

module.exports = {
  validateConfig,
  getStorage,
  setStorage,
  removeStorage,
  login,
  request,
  createRewardedAd,
  showToast,
};
