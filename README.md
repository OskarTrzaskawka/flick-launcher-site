# Flick Launcher — project website

English information website for the independent Flick Launcher project. Designed for GitHub Pages and application-review links. It explains the current development preview, supported features, roadmap and Microsoft authentication status without claiming an official association with Minecraft.

## Files

- `site/`: complete static website. No build step, framework, server-side application or API key required.
- `scripts/deploy.cjs`: publishes `site/` to the `gh-pages` branch using Git.
- `.github/workflows/pages.yml`: optional, manually triggered GitHub Actions deployment.
- `site/config.json`: public repository and feedback links. No credentials belong here.
- `scripts/preview.cjs`: optional local preview server.
- `scripts/verify.cjs`: browser checks using Playwright and installed Chrome. QA outputs are excluded from Git.

## Local preview

```powershell
node scripts/preview.cjs
```

Open `http://127.0.0.1:4174/flick-launcher-site/`. For browser QA, install Playwright in your development environment or set `FLICK_PLAYWRIGHT_MODULE` to an existing Playwright module, then run `node scripts/verify.cjs`.

## Publish

This repository is configured for **Deploy from a branch → gh-pages → / (root)** in Settings → Pages. Only website files from `site/` are copied into the publishing branch. Website source, website scripts and documentation stay on `main`. Desktop sources are not in this repository.

After changing the website, run:

```powershell
node scripts/deploy.cjs
```

The script commits staged website changes, pushes `main`, and updates `gh-pages` through `git subtree`. It uses your normal Git authentication; it does not store or embed access tokens. GitHub then handles the Pages deployment. Keep other unrelated staged changes out of the checkout before using it.

An optional manual GitHub Actions workflow is included. If switching to it, first select **GitHub Actions** as the Pages source, then run **Deploy GitHub Pages** from the Actions tab. It uploads only `site/` and uses GitHub's temporary token and Pages OIDC permissions. The default branch deployment does not require running that workflow.

All local asset links are relative so the website works under a repository subpath. The website links to the Windows x64 0.5.0 development-preview release on GitHub. Both builds are unsigned. Keep download links pinned to a published release and do not claim untested operating-system compatibility.

After publishing, use the real `https://<account>.github.io/<repository>/` URL in the Minecraft application-review form. A website does not guarantee approval.

## Content and privacy

Screenshots are real captures of the 0.5.0 development build with test profiles. Profile types illustrated in the feature section are explicitly labelled as illustrations. No customer claims, performance benchmarks or Microsoft approval are implied. The site has no forms, analytics, ads or tracking cookies. Only the animation preference is saved in local storage. Hosting infrastructure is subject to GitHub's own policies.

See `site/privacy.html` for visitor-facing information. Update the content when the launcher changes.

## Attribution

First-party website code and branding in this version: all rights reserved, see `LICENSE`. Poppins fonts: SIL Open Font License 1.1; original notice in `site/assets/OFL.txt`. Flick branding and app screenshots are reused from the owner's Flick Launcher project. Minecraft belongs to Mojang/Microsoft; this is independent software.

## Published project

Website: https://oskartrzaskawka.github.io/flick-launcher-site/

Repository: https://github.com/OskarTrzaskawka/flick-launcher-site

The current app captures include a Minecraft 1.21.5 screenshot owned by Mojang Studios/Microsoft. Source: https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-5 . No affiliation or endorsement is implied.

## 0.5 preview and source policy
This public repository contains the promotional website, website tooling and desktop release binaries. Desktop application sources, account data, tokens and configuration are not published here. First-party material in the new version is proprietary; third-party notices are retained, and licenses of older versions are not revoked. Public website assets and distributed binaries remain technically accessible to recipients. No claim of protection against extraction or reverse engineering is made.

Support, suggestions and enquiries about optional development donations: https://discord.gg/nEhCu8DY2R . Version 0.5.1 adds the same support entry to the desktop app.
