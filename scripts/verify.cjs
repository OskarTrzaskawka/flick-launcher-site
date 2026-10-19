const { chromium } = require(process.env.FLICK_PLAYWRIGHT_MODULE || "playwright");
const { start } = require("./preview.cjs");
const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
(async () => {
  const out = path.resolve(__dirname, "../artifacts");
  await fs.mkdir(out, { recursive: true });
  const server = await start(0);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const errors = [],
    failed = [],
    external = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push({ url: r.url(), status: r.status() });
    });
    page.on("request", (r) => {
      if (!r.url().startsWith(origin)) external.push(r.url());
    });
    await page.goto(origin + "/flick-launcher-site/", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(out, "desktop.png"), fullPage: true });
    assert.equal(await page.title(), "Flick Launcher — Your next world awaits.");
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(
      await page.locator("[data-project-link]").getAttribute("href"),
      "https://github.com/OskarTrzaskawka/flick-launcher-site",
    );
    const anchors = await page
      .locator('a[href^="#"]')
      .evaluateAll((links) => links.map((a) => a.getAttribute("href")).filter((a) => a.length > 1));
    for (const anchor of anchors) assert.ok(await page.locator(anchor).count(), anchor);
    await page.locator("#tab-library").click();
    assert.match(await page.locator("#gallery-image").getAttribute("src"), /library/);
    await page.locator("#tab-library").press("ArrowRight");
    assert.equal(await page.locator("#tab-discover").getAttribute("aria-selected"), "true");
    for (const name of ["wardrobe", "servers"]) {
      await page.locator("#tab-" + name).click();
      assert.match(await page.locator("#gallery-image").getAttribute("src"), new RegExp(name));
      await page.locator("#gallery-image").evaluate(image => image.decode());
    }
    await page.locator("#gallery-enlarge").click();
    assert.ok(await page.locator("#lightbox").evaluate((e) => e.open));
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#lightbox").evaluate((e) => e.open), false);
    await page.locator("#motion-toggle").click();
    assert.equal(await page.locator("#motion-toggle").textContent(), "Resume animation");
    const image = await page.locator("#ambient").evaluate((e) => e.toDataURL());
    await page.waitForTimeout(180);
    assert.equal(await page.locator("#ambient").evaluate((e) => e.toDataURL()), image);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("#motion-toggle").textContent(), "Resume animation");
    for (const width of [320, 390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Overflow at ${width}`,
      );
      if (width === 390)
        await page.screenshot({ path: path.join(out, "mobile.png"), fullPage: true });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".menu-toggle").click();
    assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "true");
    await page.locator('#navigation a[href="#faq"]').click();
    assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "false");
    await page.goto(origin + "/flick-launcher-site/privacy.html", { waitUntil: "networkidle" });
    assert.match(await page.title(), /Privacy/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const reduced = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(origin + "/flick-launcher-site/", { waitUntil: "networkidle" });
    assert.equal(await reducedPage.locator("#motion-toggle").isDisabled(), true);
    const before = await reducedPage.locator("#ambient").evaluate((e) => e.toDataURL());
    await reducedPage.waitForTimeout(180);
    assert.equal(await reducedPage.locator("#ambient").evaluate((e) => e.toDataURL()), before);
    await reduced.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    assert.deepEqual(external, []);
    const result = {
      passed: true,
      errors,
      failed,
      external,
      checks: [
        "responsive widths 320–1920",
        "project-subpath assets",
        "working section anchors",
        "keyboard screenshot tabs",
        "image viewer and Escape",
        "motion preference persistence",
        "reduced motion",
        "mobile navigation",
        "privacy page",
        "no third-party requests",
      ],
    };
    await fs.writeFile(path.join(out, "qa-result.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
