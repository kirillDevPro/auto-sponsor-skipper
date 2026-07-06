# Security Policy

## Supported versions
This project is distributed as source and as a Chrome Web Store listing. Only the latest release / `main` branch is supported.

## Scope
Auto Sponsor Skipper runs entirely in your browser. It has **no backend, no server, and no credentials** — it only reads the YouTube player and fetches public JSON from the SponsorBlock API. The realistic security surface is limited to the content-script and service-worker code in this repository.

## Reporting a vulnerability
Please report security issues **privately**, not via public issues or pull requests:

- Use GitHub's [private vulnerability reporting](https://github.com/kirillDevPro/auto-sponsor-skipper/security/advisories/new) — the **Report a vulnerability** button on the *Security* tab.

Include what you can reproduce: the affected version or commit, steps, and impact. There is no paid bug bounty, but valid reports are appreciated and credited if you wish.
