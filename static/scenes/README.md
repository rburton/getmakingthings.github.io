# Scenes website

A static marketing and legal site for the Scenes iPhone app. No build step, no JavaScript, no
cookies, no analytics: four HTML files, one stylesheet and five images. Open `index.html` in a
browser, or serve the folder with `python3 -m http.server` to click through it.

```
index.html      Marketing: the problem, the one-live-scene rule, the scenes, the surfaces,
                the record, privacy summary, pricing, FAQ
privacy.html    Privacy policy (App Store Connect: privacyPolicyUrl)
terms.html      Terms of use, including the subscription and billing terms
support.html    Support answers, plus a "For App Review" section at #app-review
assets/css/site.css
assets/img/     Real iPhone 17 Pro simulator screenshots (iOS 26.5), plus the app icon
assets/favicon.png, assets/apple-touch-icon.png   Both cut from the shipping app icon
```

Every image is a real capture from the app running in the simulator, not a mockup, and every
`<img>` carries its true `width`/`height` with `height: auto` in CSS, so nothing is ever stretched.
The screenshots are 736x1600 (the 1206x2622 device capture scaled by an exact factor), displayed at
roughly 230 to 310 CSS pixels wide, so they stay sharp on retina without shipping 1.4 MB each.

## Regenerating the screenshots

The captures come from the app itself, through the QA launch arguments in the root `CLAUDE.md`.
Only `995EABA8-0580-4641-8622-3B72F150FBDE` is the iOS 26.5 "iPhone 17 Pro".

```bash
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
SIM=995EABA8-0580-4641-8622-3B72F150FBDE
xcrun simctl boot $SIM
xcodebuild build -project ../Scenes.xcodeproj -scheme Scenes \
  -destination "platform=iOS Simulator,OS=26.5,name=iPhone 17 Pro" -derivedDataPath /tmp/scenes-dd -quiet
xcrun simctl install $SIM /tmp/scenes-dd/Build/Products/Debug-iphonesimulator/Scenes.app
xcrun simctl privacy $SIM grant location com.getmakingthings.Scenes
xcrun simctl status_bar $SIM override --time "9:41" --batteryState charged --batteryLevel 100 \
  --cellularMode active --cellularBars 4 --wifiMode active --wifiBars 3

# terminate first: a re-launch of a running app silently ignores new launch arguments
xcrun simctl terminate $SIM com.getmakingthings.Scenes
xcrun simctl launch $SIM com.getmakingthings.Scenes --ui-testing --demo --reminders-demo \
  --open scenes://type/errands
sleep 15   # the errand map needs time to fetch tiles and resolve the distance
xcrun simctl io $SIM screenshot errands.png

# then, for the web:
sips -Z 1600 -s format jpeg -s formatOptions 82 errands.png --out assets/img/errands.jpg
```

Which argument set produced which file:

| File | Launch arguments |
|---|---|
| `today.jpg` | `--ui-testing --demo` |
| `errands.jpg` | `--ui-testing --demo --reminders-demo --open scenes://type/errands` |
| `gym.jpg` | `--ui-testing --demo --open scenes://type/gym` |
| `week.jpg` | `--ui-testing --demo --metrics-demo --open scenes://week` |
| `reminders.jpg` | `--ui-testing --demo --reminders-demo --open scenes://reminders` |

The icons are cut from the shipping app icon, so they change only when it does:

```bash
ICON=../Scenes/Assets.xcassets/AppIcon.appiconset/AppIcon.png
sips -Z 512 -s format png $ICON --out assets/img/app-icon.png
sips -Z 180 -s format png $ICON --out assets/apple-touch-icon.png
sips -Z 64  -s format png $ICON --out assets/favicon.png
```

## Facts the copy depends on

Everything on the site is drawn from `docs/PRD.md`, `docs/metrics.md`, `docs/reminder.md` and the
shipped code. If any of these change, the site has to change with them:

- **Subscription only.** No free tier, no scene cap, no gated feature (PRD §11). Weekly $1.49,
  monthly $2.99, annual $19.99, 7-day trial granted once per subscription group (PRD §13).
- **Minimum iOS 26.5**, iPhone only.
- **Permissions**: notifications after the first block, Location When In Use only on the first
  mapped errand stop, Health only inside an activity or gym scene, alarms for reminders (PRD §18).
- **Health data is display only**: never persisted, synced or exported.
- **No accounts, no servers, no analytics SDKs.** The privacy policy says so in those words.
- **Company**: Making Things LLC, support+scenes@getmakingthings.com.

## Before it goes live

1. **Confirm the governing law** in `terms.html` §10. It currently reads *State of New York*, chosen
   to match the support phone number on file. If Making Things LLC is organized elsewhere, change it.
2. **Check the App Store link** in `index.html`: it points at `id6810775663`, which is correct for
   the Scenes app record, but the link only resolves once the app is public.
3. Deploy the folder to a static host at whatever URL you want (for example
   `getmakingthings.com/scenes`). Every link is relative, so it works from a subdirectory or a
   subdomain without edits.

## App Store Connect fields this fills

`docs/appstore/README.md` lists these as blocking submission. Once the site has a URL:

| ASC field | Where | Points at |
|---|---|---|
| `privacyPolicyUrl` | `appInfoLocalizations`, all 10 locales | `/privacy.html` |
| `supportUrl` | `appStoreVersionLocalizations`, all 10 locales | `/support.html` |
| `marketingUrl` (optional) | `appStoreVersionLocalizations` | `/` |
| App Review contact | `appStoreReviewDetails` | support+scenes@getmakingthings.com, no demo account needed |
| App Review notes | `appStoreReviewDetails` | the seven points under `/support.html#app-review` |

Both URL fields are required to submit, and the English text is fine for every locale until the site
itself is translated.
