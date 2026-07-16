# Changelog

All notable changes to Auto Sponsor Skipper are documented here. This project follows [semantic versioning](https://semver.org/).

## 1.5.0
- The popup now tells you what will actually be skipped on the video you're watching — "Will skip: 3" — or, when nothing will be, exactly why: skipping is off, the channel is whitelisted, those segment categories are turned off, the segments are shorter than your minimum length, none are marked yet, or the data failed to load.
- The skip notice now shows how long the skipped segment was (e.g. "Skipped: Sponsor · 1:04"), stays on screen while your pointer is over it so it can't vanish as you reach for **Undo**, and announces each skip to screen readers.
- Each category now has a colored dot in the popup and Settings, matching its marker color on the progress bar.
- New "Hook / greeting" category (the spoken intro/greeting at the start of some videos) — available to turn on, off by default.

## 1.4.0
- A brief skip notice now appears over the player each time a segment is skipped, showing which category was skipped and an **Undo** button that jumps you back to the start of the segment (and corrects the stats). It also has a close button and fades away on its own after a few seconds.
- New Settings toggle "Show a skip notice with an undo button" (on by default) to turn the notice off.

## 1.3.0
- The popup now shows the current video's SponsorBlock status — how many segments the community has marked, "no segments marked yet", or a load error — for the YouTube tab you're viewing, and re-checks the moment you open it.
- Freshly submitted segments are picked up much sooner: a video with no segments is re-checked about 90 seconds after it was last looked up (previously 12 hours).
- No more "Extension context invalidated" console errors after the extension updates while a YouTube tab is open: the orphaned tab now degrades quietly and resumes on its next navigation or reload (skipping was never affected).

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
