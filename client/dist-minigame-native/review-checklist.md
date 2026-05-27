# Review Checklist

## Assets

- Confirm game icon, name, and splash copy are consistent
- Replace `touristappid` with real mini-game `appid`
- Replace test rewarded ad unit id with production id

## Backend

- Confirm `apiBase` points to reachable HTTPS domain
- Confirm server `.env` contains `DOUYIN_APP_ID` and `DOUYIN_APP_SECRET`
- Confirm `/api/login` works with real `tt.login` code exchange

## Gameplay

- First 10 seconds guarantee edible targets nearby
- First 20 seconds can usually reach first upgrade
- First failure offers exactly one revive chance
- Game over page can submit score and show reward button

## Ads

- Revive button triggers rewarded ad
- Double reward button triggers rewarded ad
- Ad callback success grants reward once only

## Submission

- Open in Douyin Mini Game DevTools and verify portrait mode
- Check no placeholder text remains in `app.config.json`
- Check no debug domain or local IP remains in release build
