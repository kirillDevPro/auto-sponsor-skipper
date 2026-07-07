# Changelog

All notable changes to Auto Sponsor Skipper are documented here. This project follows [semantic versioning](https://semver.org/).

## 1.2.0
- Three interface languages — English, Українська, Русский — chosen from a menu in Settings (default English, independent of the browser language) and applied instantly across the popup, the options page, and the timeline tooltip.
- The popup now shows total time saved next to the segments-skipped counter, as two tiles.
- The options page is organized into Settings and Statistics tabs.
- Minimum segment length now defaults to 3 seconds.

## 1.1.0
- Colored skip-segment markers on the YouTube progress bar, with a hover tooltip showing the category and length.
- Option to show or hide the timeline markers.

## 1.0.0
Initial public release.

- Automatic skipping of SponsorBlock segments on YouTube watch pages.
- Categories: sponsor, self-promotion, and reminders enabled by default; intro, outro, preview/recap, filler, and non-music available as optional toggles.
- Minimum-segment-length filter.
- Per-channel whitelist.
- Skip counter (segments skipped and time saved).
- Stateless Manifest V3 service worker with a per-video segment cache; k-anonymous 4-character hash lookup against the SponsorBlock API.
- Dark Material Design 3 popup and options UI. English locale.
