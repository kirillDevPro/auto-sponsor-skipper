<h1 align="center">Auto Sponsor Skipper</h1>

<p align="center"><b>Automatically skip sponsor, self-promotion, and reminder segments on YouTube — powered by the SponsorBlock community database.</b></p>

<p align="center">
  <a href="https://github.com/kirillDevPro/auto-sponsor-skipper/actions/workflows/ci.yml"><img src="https://github.com/kirillDevPro/auto-sponsor-skipper/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4" alt="Manifest V3">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-2563EB" alt="License: PolyForm Noncommercial 1.0.0"></a>
  <img src="https://img.shields.io/badge/tracking-none-16A34A" alt="No tracking">
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#permissions--data">Permissions &amp; data</a> ·
  <a href="#install-from-source">Install</a> ·
  <a href="#privacy">Privacy</a> ·
  <a href="#license">License</a>
</p>

Auto Sponsor Skipper is a Chrome (Manifest V3) extension that fast-forwards the YouTube HTML5 player past the parts of a video you didn't come to watch — sponsor reads, self-promotion, and "like &amp; subscribe" reminders — using crowd-sourced timestamps from the [SponsorBlock](https://sponsor.ajay.app) community database. It runs only on YouTube watch pages, sends no personal data anywhere, and does no tracking.

## Features
- **Automatic skipping** — no button to press; segments are skipped as you watch.
- **Choose what to skip** — sponsor, self-promotion, and reminders on by default; intro, outro, preview/recap, filler, and non-music sections are optional and off by default.
- **Minimum segment length** — ignore very short segments if you prefer.
- **Per-channel whitelist** — turn skipping off for channels you want to support.
- **Skip counter** — see how many segments you've skipped and the time saved.
- **Privacy-first, minimal permissions** — one narrow network host, no `tabs`, no analytics, no accounts.

## How it works
The extension is split so that skipping keeps working even when Chrome suspends the background service worker:

- A **stateless service worker** looks up skip segments. To find them it sends only the **first 4 hexadecimal characters of a SHA-256 hash of the video ID** to `https://sponsor.ajay.app` and receives candidate segments back as JSON. The full video ID never leaves your browser — the 4-character prefix is *k-anonymous* (it matches thousands of videos), so SponsorBlock cannot tell which video you are watching.
- A **content script** on the YouTube page does the actual skipping: it watches the player's current time and seeks past enabled segments. All durable state (settings, cache, statistics, whitelist) lives in `chrome.storage`, so a suspended-then-woken worker can never break skipping.

No remote code is loaded or executed — the service worker fetches JSON **data** only.

## Permissions &amp; data
| Permission | Why it's needed |
|---|---|
| `storage` | Save your settings, a per-video segment cache, and the skip counter locally. |
| host `https://sponsor.ajay.app/*` | Fetch community skip segments for the current video. This is the **only** network host. |
| content script on `https://www.youtube.com/*` | Read the player's current time to seek past segments; read the channel id for the optional whitelist. |

Not requested: `tabs`, `activeTab`, `history`, `alarms`, `scripting`, `unlimitedStorage`, or any broad host permission.

## Install from source
1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the repository folder.

> Once published, the extension will also be available on the Chrome Web Store: _link coming soon_.

## Building the store zip
There is no build step. The upload package is produced straight from a committed tree with `git archive`, which honors the `export-ignore` rules in `.gitattributes` so development files never ship:

```bash
git archive --format=zip -o auto-sponsor-skipper-1.0.0.zip HEAD
```

The resulting zip contains only the shippable set: `manifest.json`, `background/`, `content/`, `popup/`, `settings/`, `shared/`, `_locales/`, `icons/`, and `LICENSE`.

## Development
There are no dependencies. Every `.js` / `.mjs` file is syntax-checked with `node --check`, and the headless tests run on plain Node (20+):

```bash
node --check background/background.js          # any file
for f in tests/*.test.mjs; do node "$f"; done  # hash, api, cache, integration, whitelist
```

CI runs the same checks on every push and pull request.

## Privacy
The extension keeps no servers, runs no analytics, and tracks nothing. Only a 4-character hashed prefix of the video ID is ever sent off-device (to SponsorBlock). Full details are in the **[Privacy Policy](https://kirilldevpro.github.io/auto-sponsor-skipper/)**.

## Attribution
Segment data by **SponsorBlock** (https://sponsor.ajay.app), licensed **CC BY-NC-SA 4.0**.

This is a free, non-commercial, read-only client and is **not affiliated with, endorsed by, or created by SponsorBlock or YouTube / Google**.

## Contributing
Issues and pull requests are welcome. By submitting a contribution you agree that it is licensed under the same PolyForm Noncommercial 1.0.0 terms as the rest of the project. Please keep changes minimal-permission, and run `node --check` plus the tests before opening a pull request.

## License
Source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE): you may read, self-host, and modify it for **noncommercial** use; **commercial use is not permitted**. This is a source-available license, not an OSI-approved open-source license.
