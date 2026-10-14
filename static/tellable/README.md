# Tellable's pages

Served at https://www.getmakingthings.com/tellable/. The app links `support.html`, `privacy.html` and `terms.html`, so keep those names.

Rules for every page: no em dash in the text, no price figure (prices come from the App Store only), and nothing the shipping app does not do.

## Release day: switch to the App Store

The app id (a number such as 6740000000) is on the app's page in App Store Connect, under App Information, Apple ID.

1. **Smart App Banner.** In the `<head>` of every page (`index.html`, `support.html`, `privacy.html`, `terms.html`, `404.html`) there is a comment that starts `RELEASE DAY`. Take the `<meta name="apple-itunes-app" ...>` line out of the comment and put the app id in place of `APP_ID`.
2. **The badge.** `index.html` has two `RELEASE DAY` comments, in the hero and in the closing box. In each, uncomment the badge link, put the app id in place of `APP_ID`, and delete the `Coming soon to the App Store` line under it.

The badge image is not in this folder on purpose. Download Apple's official "Download on the App Store" badge (black, US English, SVG) from Apple's marketing tools at https://toolbox.marketingtools.apple.com/en-us/app-store/ and save it, unchanged, as `assets/app-store-badge.svg`. Apple's guidelines do not allow redrawing or altering it. The `.store-badge` style in `styles.css` already sizes it (180 x 60 with the required clear space).

To find every place: `grep -rn "RELEASE DAY\|APP_ID" .`
