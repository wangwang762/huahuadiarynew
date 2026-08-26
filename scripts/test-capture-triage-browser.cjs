const { chromium } = require("playwright");
const assert = require("assert");
const fs = require("fs");

const baseUrl = process.env.HH_TEST_URL || "http://127.0.0.1:4190/花花日记本.html?v=capture-triage-test";
const scenario = process.env.HH_TRIAGE_SCENARIO === "good" ? "good" : "worse";
const accountSource = fs.readFileSync("account-service.js", "utf8");
const localVendor = {
  react: fs.readFileSync("vendor/react.development.js", "utf8"),
  reactDom: fs.readFileSync("vendor/react-dom.development.js", "utf8"),
  babel: fs.readFileSync("vendor/babel.min.js", "utf8"),
};
const plantPhotoData = `data:image/png;base64,${fs.readFileSync("assets/plants/final-v1/hupilan.png").toString("base64")}`;

const plant = {
  id: "triage-hupilan", name: "懒懒", species: "虎皮兰", shape: "upright",
  accent: "#80933B", deep: "#66751F", bubble: "#EEF1D7", soft: "#F0EDC9", pot: "cream",
  tagsOn: ["安静", "有耐心"], tagsOff: [], custom: "明亮散射光，盆土干透再浇",
  style: "安静。", voice: "我会安静地长大。", days: 1, mood: "初遇", stars: 5,
  status: "状态稳定", statusTone: "good", photoId: "hupilan", born: "2026年8月25日",
  diary: [
    {
      id: "triage-previous", kind: "record", day: "昨天", date: "8月25日", mood: "观察", type: "photo", photo: "hupilan",
      photoData: plantPhotoData,
      observedAt: "2026-08-25T08:00:00.000Z", comparison: { trend: "unknown", summary: "这是第一次观察", health: "good" },
      doctorStatus: "not_needed", quote: ["昨天的观察。"], voice: "你好。", stars: 5,
    },
    { id: "triage-born", day: "昨天", date: "8月25日", mood: "初遇", type: "born", photo: "hupilan", quote: ["第一次见面。"], voice: "你好。", stars: 5 },
  ],
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
    body: `window.PLANT_IMG = { hupilan: ${JSON.stringify(plantPhotoData)} };`,
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
    assert.equal(String(body.previousImage || "").startsWith("data:image/"), true, "双图比较没有携带上一次照片");
    assert.equal(body.previousObservedAt, "2026-08-25T08:00:00.000Z", "上一次观察时间没有传给分诊");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, triage: scenario === "good" ? {
        health: "good", observations: [], likelyCause: "暂未看到明显异常",
        trend: "same", trend_summary: "和上次差不多", confidence: 0.91,
      } : {
        health: "watch", observations: ["叶尖焦黄"], likelyCause: "盆土偏湿",
        trend: "worse", trend_summary: "叶尖焦黄范围比上次扩大", confidence: 0.84,
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
    const expectedTrend = scenario === "good" ? "和上次差不多" : "叶尖焦黄范围比上次扩大";
    await page.getByText(expectedTrend, { exact: true }).waitFor({ timeout: 12_000 });
    assert.equal(await page.getByText("状态不错，记一笔", { exact: true }).count(), 0, "明显异常仍被显示为状态不错");
    const primaryBackground = await page.getByRole("button", { name: "记入日记" }).evaluate(element => getComputedStyle(element).backgroundImage);
    assert.notEqual(primaryBackground, "none", "记日记主按钮没有使用主题绿色");
    if (scenario === "good") {
      assert.equal(await page.getByRole("button", { name: "带着这张照片问问花大夫" }).count(), 0, "正常状态不应主动显示问诊入口");
      await page.screenshot({ path: "/tmp/huahua-capture-good-comparison.png", fullPage: true });
      await page.getByRole("button", { name: "记入日记" }).click();
      await page.getByText("和 懒懒 的日记", { exact: true }).waitFor({ timeout: 8_000 });
      const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("huahua.guestGarden.v1")));
      const latest = persisted.plants[0].diary.find(entry => entry.id !== "triage-previous" && entry.kind === "record");
      assert.ok(latest, "正常观察没有保存");
      assert.equal(latest.comparison.trend, "same");
      assert.equal(latest.doctorStatus, "not_needed");
      assert.equal(String(latest.photoData || "").startsWith("data:image/jpeg;base64,"), true, "正常观察没有持久化压缩照片");
    } else {
      assert.equal(await page.getByText("叶尖焦黄", { exact: false }).count() > 0, true, "异常现象没有展示");
      await page.screenshot({ path: "/tmp/huahua-capture-worse-comparison.png", fullPage: true });
      await page.getByRole("button", { name: "带着这张照片问问花大夫" }).click();
      await page.getByText("花大夫", { exact: true }).first().waitFor({ timeout: 8_000 });
      const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("huahua.guestGarden.v1")));
      const diary = persisted.plants[0].diary;
      const observations = diary.filter(entry => entry.kind === "record");
      assert.equal(observations.length, 2, "进入问诊前观察记录没有且仅新增一次");
      const latest = observations.find(entry => entry.id !== "triage-previous");
      assert.ok(latest, "没有找到刚保存的观察记录");
      assert.equal(latest.comparison.previousEntryId, "triage-previous", "比较记录没有关联上一次照片");
      assert.equal(String(latest.photoData || "").startsWith("data:image/jpeg;base64,"), true, "观察记录没有持久化压缩照片");
      assert.equal(latest.doctorStatus, "started", "进入问诊前没有把观察记录标为 started");
      await page.screenshot({ path: "/tmp/huahua-capture-comparison-doctor.png", fullPage: true });
    }
    assert.deepEqual(errors, [], `浏览器错误：${errors.join(" | ")}`);
    console.log(scenario === "good"
      ? "CAPTURE_TRIAGE_BROWSER_GOOD_OK /tmp/huahua-capture-good-comparison.png"
      : "CAPTURE_TRIAGE_BROWSER_WORSE_OK /tmp/huahua-capture-worse-comparison.png /tmp/huahua-capture-comparison-doctor.png");
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
