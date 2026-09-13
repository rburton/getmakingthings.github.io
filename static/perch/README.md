# Perch website

The legal and support pages for the Perch app. No build step, no JavaScript, no cookies, no
analytics: two HTML files, one stylesheet and three icons.

```
privacy.html    Privacy policy (App Store Connect: privacyPolicyUrl)
support.html    Support answers, plus a "For App Review" section at #app-review
assets/css/site.css   Perch's closed palette: Ink, Body, Muted, Wash, Rule, Accent
assets/img/app-icon.png, assets/favicon.png, assets/apple-touch-icon.png
                Cut from the shipping app icon
```

The icons change only when the app icon does:

```bash
ICON=../../../Perch/Perch/Perch/Assets.xcassets/AppIcon.appiconset/AppIcon-light.png
cp $ICON assets/img/app-icon.png
sips -Z 180 $ICON --out assets/apple-touch-icon.png
sips -Z 64  $ICON --out assets/favicon.png
```

## Facts the copy depends on

Drawn from `docs/REQUIREMENTS.md` §6 and the in-app Privacy Policy
(`Perch/Features/Settings/PrivacyPolicyView.swift`). If either changes, these pages change with it:

- **No accounts, no analytics, no advertising, no tracking.** App Privacy: Data Not Collected.
- **Saved places** are `{ id, savedAt }` plus a name and address snapshot, on device only.
- **Location** is While Using only. It goes to Apple for the travel estimate on a place's page,
  and never to the catalog host. ZIP search goes to Apple's geocoder.
- **The catalog request** carries a city file name and nothing else.
- **25 cities**, all cafés. The count comes from `Perch/Resource/index.json`.
- **Company**: Making Things LLC, support+perch@getmakingthings.com.

## Before it goes live

1. Confirm `support+perch@getmakingthings.com` reaches the support inbox. The app's Send a
   catalog correction button writes to the same address.
2. Push, then check both URLs load.

## App Store Connect fields this fills

| ASC field | Where | Points at |
|---|---|---|
| `privacyPolicyUrl` | `appInfoLocalizations` (en-US) | `https://www.getmakingthings.com/perch/privacy.html` |
| `supportUrl` | `appStoreVersionLocalizations` (en-US) | `https://www.getmakingthings.com/perch/support.html` |
| App Privacy | App Store Connect web only | Data Not Collected |
