# Client

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

For local web debug, keep:

```bash
VITE_API_BASE=http://127.0.0.1:8080/api
```

## Build

```bash
npm run build
```

## Native Mini Game Export

Generate a native Douyin Mini Game prototype directory:

```bash
cp .env.example .env
npm run build:minigame-native
```

Output:

```text
dist-minigame-native/
```

Open that directory in Douyin Mini Game DevTools.

## Recommended Validation Order

1. Web prototype + local server
2. Native minigame export in DevTools
3. Real `tt.login`
4. Real rewarded ad callbacks

Important generated files:

- `app.config.json`
- `project.config.json`
- `release.config.json`

## Current Scope

- Home
- Playable deep-sea devour prototype
- One revive flow
- Game over summary
- Score submit
- Double reward claim
- Analytics report

## Runtime Adapter

- Web: simulate `login` and rewarded ads
- Douyin Mini Game: use `tt.login` and `tt.createRewardedVideoAd`

Optional env:

```bash
VITE_API_BASE=http://127.0.0.1:8080/api
VITE_DOUYIN_REWARDED_AD_UNIT_ID=your_ad_unit_id
VITE_DOUYIN_APP_ID=your_microapp_appid
```

## Packaging Status

- `dist-minigame/`: transitional shell with web build copy
- `dist-minigame-native/`: native Douyin Mini Game prototype template

Use `dist-minigame-native/` for the next validation step in DevTools.

## Release Prep

Templates and docs:

- `minigame-template/app.config.template.json`
- `minigame-template/release.config.template.json`
- `minigame-template/review-checklist.md`
- `docs/douyin-minigame-devtools-guide.md`
- `docs/native-minigame-preflight.md`
