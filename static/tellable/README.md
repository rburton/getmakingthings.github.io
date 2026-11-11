# Tellable's pages

Served at https://www.getmakingthings.com/tellable/. The app links `support.html`, `privacy.html` and `terms.html`, so keep those names.

Rules for every page: no em dash in the text, no price figure (prices come from the App Store only), and nothing the shipping app does not do.

## The App Store

Tellable is on the App Store at https://apps.apple.com/us/app/tellable-offline-read-aloud/id6822751387 (app id 6822751387).

- **Smart App Banner.** Every page (`index.html`, `support.html`, `privacy.html`, `terms.html`, `404.html`) has `<meta name="apple-itunes-app" content="app-id=6822751387">` in its `<head>`. A new page gets the same line.
- **The badge.** `index.html` shows Apple's badge, linked to the App Store page, in the hero and in the closing box (`#get`, where the header's Get Tellable button goes).

`assets/app-store-badge.svg` is Apple's official "Download on the App Store" badge (black, US English), downloaded unchanged from Apple's marketing tools (https://toolbox.marketingtools.apple.com/en-us/app-store/). Apple's guidelines do not allow redrawing or altering it. The `.store-badge` style in `assets/home.css` sizes it (180 x 60 with the required clear space).

To find every place: `grep -rn "6822751387" .`
