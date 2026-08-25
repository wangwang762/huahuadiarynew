const { chromium } = require("playwright");
const assert = require("assert");
const fs = require("fs");

const baseUrl = process.env.HH_TEST_URL || "http://127.0.0.1:4190/花花日记本.html?v=capture-triage-test";
const accountSource = fs.readFileSync("account-service.js", "utf8");
const localVendor = {
  react: fs.readFileSync("vendor/react.development.js", "utf8"),
  reactDom: fs.readFileSync("vendor/react-dom.development.js", "utf8"),
  babel: fs.readFileSync("vendor/babel.min.js", "utf8"),
};

const plant = {
  id: "triage-hupilan", name: "懒懒", species: "虎皮兰", shape: "upright",
  accent: "#80933B", deep: "#66751F", bubble: "#EEF1D7", soft: "#F0EDC9", pot: "cream",
  tagsOn: ["安静", "有耐心"], tagsOff: [], custom: "明亮散射光，盆土干透再浇",
  style: "安静。", voice: "我会安静地长大。", days: 1, mood: "初遇", stars: 5,
  status: "状态稳定", statusTone: "good", photoId: "hupilan", born: "2026年8月25日",
  diary: [{ id: "triage-born", day: "今天", date: "8月25日", mood: "初遇", type: "born", photo: "hupilan", quote: ["第一次见面。"], voice: "你好。", stars: 5 }],
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.HH_CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(({ plant }) => {
    localStorage.setItem("huahua.guestGarden.v1", JSON.stringify({
      profile: { ownerId: "guest-local", email: "", onboarded: true, guest: true },
      plants: [plant],
    }));
  }, { plant });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error"
      && !message.text().includes("Failed to load resource")
      && !message.text().includes("favicon.ico")) errors.push(message.text());
  });
  await page.route(/account-service\.js/, route => route.fulfill({
    status: 200,
    contentType: "text/javascript",
    body: `${accountSource}\nwindow.HHAccount.restoreSession = async () => ({ id: "guest-local", email: "", guest: true, onboarded: true });`,
  }));
  await page.route(/plant-photos\.js/, route => route.fulfill({
    status: 200,
    contentType: "text/javascript",
    body: 'window.PLANT_IMG = { hupilan: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL+WQAAAABJRU5ErkJggg==" };',
  }));
  await page.route(/unpkg\.com\/react@.*\/react\.development\.js/, route => route.fulfill({ status: 200, contentType: "text/javascript", body: localVendor.react }));
  await page.route(/unpkg\.com\/react-dom@.*\/react-dom\.development\.js/, route => route.fulfill({ status: 200, contentType: "text/javascript", body: localVendor.reactDom }));
  await page.route(/unpkg\.com\/@babel\/standalone@.*\/babel\.min\.js/, route => route.fulfill({ status: 200, contentType: "text/javascript", body: localVendor.babel }));
  await page.route(/static\.cloudbase\.net\/cloudbase-js-sdk/, route => route.fulfill({ status: 200, contentType: "text/javascript", body: "window.cloudbase = {};" }));
  await page.route(/fcapp\.run/, async route => {
    const request = route.request();
    const body = JSON.parse(request.postData() || "{}");
    assert.equal(body.action, "triage", "拍照记录没有调用健康分诊动作");
    assert.equal(body.plant.species, "虎皮兰");
    assert.equal(String(body.image || "").startsWith("data:image/"), true,
      `健康分诊没有携带新照片（收到 ${String(body.image || "").slice(0, 48) || "空值"}）`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, triage: {
        health: "sick", observations: ["多片叶面有大面积黄褐斑", "叶尖焦枯"],
        likelyCause: "可能存在积水或叶片病害", trend: "unknown", route: "diagnose", confidence: 0.91,
      } }),
    });
  });

  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.getByText("懒懒", { exact: true }).first().click();
    await page.getByRole("button", { name: "拍照记录今天" }).click();
    await page.waitForFunction(() => {
      const element = document.querySelector('image-slot[id^="capture-"]');
      const image = element && element.shadowRoot && element.shadowRoot.querySelector('.frame img');
      return Boolean(image && image.src && image.complete && image.naturalWidth > 0);
    }, null, { timeout: 8_000 });
    const captureSource = await page.locator('image-slot[id^="capture-"]').evaluate(element => {
      const image = element.shadowRoot && element.shadowRoot.querySelector('.frame img');
      return image && image.src;
    });
    assert.equal(String(captureSource || "").startsWith("data:image/"), true, `测试照片没有载入：${captureSource}`);
    await page.getByRole("button", { name: "让花花看看" }).click();
    await page.getByText("看起来不太舒服", { exact: true }).waitFor({ timeout: 12_000 });
    assert.equal(await page.getByText("多片叶面有大面积黄褐斑", { exact: false }).count() > 0, true, "异常现象没有展示");
    assert.equal(await page.getByText("状态不错，记一笔", { exact: true }).count(), 0, "明显异常仍被显示为状态不错");
    const buttonBackground = await page.getByRole("button", { name: "去问花大夫" }).evaluate(element => getComputedStyle(element).backgroundImage);
    assert.equal(buttonBackground.includes("53, 115, 85") || buttonBackground.includes("35, 75, 54"), true, "问诊按钮没有使用统一主题色");
    await page.screenshot({ path: "/tmp/huahua-capture-sick-triage.png", fullPage: true });
    assert.deepEqual(errors, [], `浏览器错误：${errors.join(" | ")}`);
    console.log("CAPTURE_TRIAGE_BROWSER_OK /tmp/huahua-capture-sick-triage.png");
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
