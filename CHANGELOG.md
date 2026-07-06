# Changelog

All notable changes to Auto Sponsor Skipper are documented here. This project follows [semantic versioning](https://semver.org/).

## 1.0.0
Initial public release.

- Automatic skipping of SponsorBlock segments on YouTube watch pages.
- Categories: sponsor, self-promotion, and reminders enabled by default; intro, outro, preview/recap, filler, and non-music available as optional toggles.
- Minimum-segment-length filter.
- Per-channel whitelist.
- Skip counter (segments skipped and time saved).
- Stateless Manifest V3 service worker with a per-video segment cache; k-anonymous 4-character hash lookup against the SponsorBlock API.
- Dark Material Design 3 popup and options UI. English locale.
