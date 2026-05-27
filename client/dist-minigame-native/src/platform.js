const config = require("./config");

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

module.exports = {
  login,
  request,
  createRewardedAd,
};
