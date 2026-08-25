const { chromium } = require("playwright");
const assert = require("assert");
const fs = require("fs");

const baseUrl = process.env.HH_TEST_URL || "http://127.0.0.1:4190/花花日记本.html?v=guest-login-test";
const accountSource = fs.readFileSync("account-service.js", "utf8");
const localVendor = {
  "react.development.js": fs.readFileSync("vendor/react.development.js", "utf8"),
  "react-dom.development.js": fs.readFileSync("vendor/react-dom.development.js", "utf8"),
  "babel.min.js": fs.readFileSync("vendor/babel.min.js", "utf8"),
};
const screenshotPath = process.env.HH_SCREENSHOT_PATH || "/tmp/huahua-minimal-journal-login.png";

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.HH_CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];

  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    const text = message.text();
    if (message.type() === "error"
      && !text.includes("Failed to load resource")
      && !text.includes("favicon.ico")) errors.push(text);
  });
  await page.route(/account-service\.js/, route => route.fulfill({
    status: 200,
    contentType: "text/javascript",
    body: `${accountSource}\nwindow.HHAccount.restoreSession = async () => null;`,
  }));
  await page.route(/unpkg\.com\/react@.*\/react\.development\.js/, route => route.fulfill({
    status: 200, contentType: "text/javascript", body: localVendor["react.development.js"],
  }));
  await page.route(/unpkg\.com\/react-dom@.*\/react-dom\.development\.js/, route => route.fulfill({
    status: 200, contentType: "text/javascript", body: localVendor["react-dom.development.js"],
  }));
  await page.route(/unpkg\.com\/@babel\/standalone@.*\/babel\.min\.js/, route => route.fulfill({
    status: 200, contentType: "text/javascript", body: localVendor["babel.min.js"],
  }));
  await page.route(/static\.cloudbase\.net\/cloudbase-js-sdk/, route => route.fulfill({
    status: 200, contentType: "text/javascript", body: "window.cloudbase = {};",
  }));

  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.getByText("登录花花日记本", { exact: true }).waitFor({ timeout: 20_000 });
    await page.waitForTimeout(1_700);

    assert.equal(await page.locator(".collage-field-sheet figure img").count(), 1, "登录页应只有一张植物照片");
    assert.equal(await page.locator(".collage-pin, .collage-brass-clip, .collage-stamp, .collage-doodle").count(), 0, "登录页仍有多余拼贴装饰");
    assert.equal(await page.getByRole("button", { name: "跳过登录，先添加植物" }).isVisible(), true, "跳过入口不可见");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, "页面出现横向溢出");
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await page.getByRole("button", { name: "跳过登录，先添加植物" }).click();
    await page.getByText("添加第一盆植物", { exact: true }).waitFor();
    await page.getByRole("button", { name: "添加第一盆植物" }).click();
    await page.getByText("选择植物品类", { exact: true }).waitFor();

    await page.evaluate(() => {
      localStorage.setItem("huahua.guestGarden.v1", JSON.stringify({
        profile: { ownerId: "guest-local", email: "", onboarded: true, guest: true },
        plants: [{ id: "guest-restored", name: "窗边薄荷", species: "薄荷", diary: [] }],
      }));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByText("登录花花日记本", { exact: true }).waitFor({ timeout: 20_000 });
    await page.getByRole("button", { name: "跳过登录，先添加植物" }).click();
    await page.getByText("添加第一盆植物", { exact: true }).waitFor();
    const restoredName = await page.evaluate(() => window.PLANTS && window.PLANTS[0] && window.PLANTS[0].name);
    assert.equal(restoredName, "窗边薄荷", "刷新后没有恢复游客植物");
    assert.deepEqual(errors, [], `浏览器错误：${errors.join(" | ")}`);

    console.log(`GUEST_LOGIN_BROWSER_OK ${screenshotPath}`);
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
