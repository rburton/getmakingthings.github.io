# Tellable's pages

Served at https://www.getmakingthings.com/tellable/. The app links `support.html`, `privacy.html` and `terms.html`, so keep those names.

Rules for every page: no em dash in the text, no price figure (prices come from the App Store only), and nothing the shipping app does not do.

## The App Store

Tellable is on the App Store at https://apps.apple.com/us/app/tellable-offline-read-aloud/id6822751387 (app id 6822751387).

- **Smart App Banner.** Every page (`index.html`, `support.html`, `privacy.html`, `terms.html`, `404.html`) has `<meta name="apple-itunes-app" content="app-id=6822751387">` in its `<head>`. A new page gets the same line.
- **The badge.** `index.html` shows Apple's badge, linked to the App Store page, in the hero and in the closing box (`#get`, where the header's Get Tellable button goes).

`assets/app-store-badge.svg` is Apple's official "Download on the App Store" badge (black, US English), downloaded unchanged from Apple's marketing tools (https://toolbox.marketingtools.apple.com/en-us/app-store/). Apple's guidelines do not allow redrawing or altering it. The `.store-badge` style in `assets/home.css` sizes it (180 x 60 with the required clear space).

To find every place: `grep -rn "6822751387" .`

## Product Hunt page

`producthunt.html` (styles in `assets/ph.css`) is the page to link from the Product Hunt launch: a dismissible welcome banner for Product Hunt visitors, the headline and the recording, the problem and the outcome, Made for learners (Summaries, Ask and Flashcards with the app's screenshots from `assets/screens/`, and the Apple Intelligence, iOS 26 and Pro requirement), three features, and the App Store badge with a QR code for visitors on a computer. Nothing links to it from the other pages.

- `assets/ph/reader-demo.mp4` and `assets/ph/reader-poster.jpg`: a 22-second screen recording of the app (`--reader-demo --play` on an iPhone 17 Pro simulator, iOS 26.5, light appearance, status bar at 9:41), with no sound. It plays muted on a loop, never with Reduce Motion on, and the button beside it pauses it.
- `assets/ph/tellable-reader.gif`: the same recording as a GIF, for the Product Hunt gallery. The page does not use it.
- `assets/ph/app-store-qr.svg`: a QR code of the App Store link, made with Python's `qrcode` package.

The page offers no discount: an offer code would have to exist in App Store Connect first.
