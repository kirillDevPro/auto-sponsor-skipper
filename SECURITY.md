# Security Policy

## Supported versions
This project is distributed as source and as a Chrome Web Store listing. Only the latest release / `main` branch is supported.

## Scope
Auto Sponsor Skipper runs entirely in your browser. It has **no backend, no server, and no credentials** — it only reads the YouTube player and fetches public JSON from the SponsorBlock API. The realistic security surface is limited to the content-script and service-worker code in this repository.

## Reporting a concern
Auto Sponsor Skipper has no backend and stores no credentials, so the blast radius of any issue is limited to your own browser. If you find a security problem, please open a [GitHub issue](https://github.com/kirillDevPro/auto-sponsor-skipper/issues) with what you can reproduce — the affected version or commit, steps, and impact. There is no bug bounty.
