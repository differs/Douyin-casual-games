# Client

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

## Build

```bash
npm run build
```

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
```
