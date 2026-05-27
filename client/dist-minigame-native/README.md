# Native Mini Game Template

This directory is the native Douyin Mini Game shell template.

Generated output:

- `dist-minigame-native/game.js`
- `dist-minigame-native/game.json`
- `dist-minigame-native/project.config.json`
- `dist-minigame-native/app.config.json`

Current runtime uses:

- `tt.createCanvas()`
- `tt.onTouchStart/onTouchMove/onTouchEnd`
- `tt.request`
- `tt.login`
- `tt.createRewardedVideoAd`

This is a lightweight native template intended for prototype validation before a later migration to Cocos or a fuller native runtime.

Before opening in DevTools, ensure generated `app.config.json` contains:

- real `appId`
- real backend `apiBase`
- real `rewardedAdUnitId`
