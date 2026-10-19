# Flick Launcher — project website

English information website for the independent Flick Launcher project. Designed for GitHub Pages and application-review links. It explains the current development preview, supported features, roadmap and Microsoft authentication status without claiming an official association with Minecraft.

## Files

- `site/`: complete static website. No build step, framework, server-side application or API key required.
- `.github/workflows/pages.yml`: publishes `site/` to GitHub Pages when `main` changes.
- `site/config.json`: public repository and feedback links. No credentials belong here.
- `scripts/preview.cjs`: optional local preview server.
- `scripts/verify.cjs`: browser checks using Playwright and installed Chrome. QA outputs are excluded from Git.

## Local preview

```powershell
node scripts/preview.cjs
```

Open `http://127.0.0.1:4174/flick-launcher-site/`. For browser QA, install Playwright in your development environment or set `FLICK_PLAYWRIGHT_MODULE` to an existing Playwright module, then run `node scripts/verify.cjs`.

## Publish

Push this folder as its own Git repository. In repository Settings → Pages → Build and deployment, select **GitHub Actions**. The included workflow uploads only `site/` and deploys it. No manual build or deployment secret is required; the workflow uses GitHub's temporary token and Pages OIDC permissions.

All local asset links are relative so the website works under a repository subpath. The website contains no installer download until an actual public release is available. Do not add a fake download URL or claim untested operating-system compatibility.

After publishing, use the real `https://<account>.github.io/<repository>/` URL in the Minecraft application-review form. A website does not guarantee approval.

## Content and privacy

Screenshots are real captures of the 0.1.0 development build with test profiles. Profile types illustrated in the feature section are explicitly labelled as illustrations. No customer claims, performance benchmarks or Microsoft approval are implied. The site has no forms, analytics, ads or tracking cookies. Only the animation preference is saved in local storage. Hosting infrastructure is subject to GitHub's own policies.

See `site/privacy.html` for visitor-facing information. Update the content when the launcher changes.

## Attribution

Website code: MIT, see `LICENSE`. Poppins fonts: SIL Open Font License 1.1; original notice in `site/assets/OFL.txt`. Flick branding and app screenshots are reused from the owner's Flick Launcher project. Minecraft belongs to Mojang/Microsoft; this is independent software.

## Published project

Website: https://oskartrzaskawka.github.io/flick-launcher-site/

Repository: https://github.com/OskarTrzaskawka/flick-launcher-site
