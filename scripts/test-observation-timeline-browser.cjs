const { chromium } = require("playwright");
const assert = require("assert");
const fs = require("fs");

const baseUrl = process.env.HH_TEST_URL || "http://127.0.0.1:4190/花花日记本.html?v=observation-timeline-test";
const accountSource = fs.readFileSync("account-service.js", "utf8");
const localVendor = {
  react: fs.readFileSync("vendor/react.development.js", "utf8"),
  reactDom: fs.readFileSync("vendor/react-dom.development.js", "utf8"),
  babel: fs.readFileSync("vendor/babel.min.js", "utf8"),
};
const photoData = `data:image/png;base64,${fs.readFileSync("assets/plants/final-v1/hupilan.png").toString("base64")}`;
const plant = {
  id: "timeline-hupilan", name: "懒懒", species: "虎皮兰", shape: "upright",
  accent: "#80933B", deep: "#66751F", bubble: "#EEF1D7", soft: "#F0EDC9", pot: "cream",
  tagsOn: ["安静", "有耐心"], tagsOff: [], custom: "明亮散射光，盆土干透再浇",
  style: "安静。", voice: "我会安静地长大。", days: 2, mood: "留心", stars: 4,
  status: "继续观察", statusTone: "warn", photoId: "hupilan", born: "2026年8月25日",
  diary: [{
    id: "observation-with-diagnosis", kind: "record", day: "刚刚", date: "8月26日", weather: "多云", mood: "留心",
    type: "photo", photo: "hupilan", photoData, observedAt: "2026-08-26T08:00:00.000Z",
    quote: ["叶尖焦黄范围比上次扩大"], voice: "我需要再观察一下。", concern: "叶尖焦黄",
    comparison: {
      previousEntryId: "observation-previous", trend: "worse", summary: "叶尖焦黄范围比上次扩大",
      health: "watch", observations: ["叶尖焦黄"], likelyCause: "盆土偏湿", confidence: 0.84,
    },
    doctorStatus: "completed",
    diagnosis: {
      symptom: "叶尖焦黄", conclusion: "可能与盆土偏湿有关", plan: "保持通风，等盆土变干后再浇水",
      points: ["保持通风"], followupDays: 5, urgency: "observe", confidence: 0.62,
    },
    stars: 3,
  }],
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
    if (message.type() === "error" && !message.text().includes("Failed to load resource") && !message.text().includes("favicon.ico")) {
      errors.push(message.text());
    }
  });
  await page.route(/account-service\.js/, route => route.fulfill({
    status: 200,
    contentType: "text/javascript",
    body: `${accountSource}\nwindow.HHAccount.restoreSession = async () => ({ id: "guest-local", email: "", guest: true, onboarded: true });`,
  }));
  await page.route(/unpkg\.com\/react@.*\/react\.development\.js/, route => route.fulfill({ status: 200, contentType: "text/javascript", body: localVendor.react }));
  await page.route(/unpkg\.com\/react-dom@.*\/react-dom\.development\.js/, route => route.fulfill({ status: 200, contentType: "text/javascript", body: localVendor.reactDom }));
  await page.route(/unpkg\.com\/@babel\/standalone@.*\/babel\.min\.js/, route => route.fulfill({ status: 200, contentType: "text/javascript", body: localVendor.babel }));
  await page.route(/static\.cloudbase\.net\/cloudbase-js-sdk/, route => route.fulfill({ status: 200, contentType: "text/javascript", body: "window.cloudbase = {};" }));

  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.getByText("懒懒", { exact: true }).first().click();
    await page.getByText("叶尖焦黄范围比上次扩大", { exact: true }).last().waitFor({ timeout: 8_000 });
    await page.getByText("花大夫补充", { exact: true }).waitFor();
    await page.getByText("可能与盆土偏湿有关", { exact: true }).waitFor();
    await page.getByText("保持通风，等盆土变干后再浇水", { exact: true }).waitFor();
    assert.equal(await page.getByText("带这张照片问问花大夫", { exact: true }).count(), 0, "已完成问诊仍显示重复问诊入口");
    const source = await page.locator('image-slot[id="hupilan"]').last().evaluate(element => {
      const image = element.shadowRoot && element.shadowRoot.querySelector(".frame img");
      return image && image.src;
    });
    assert.equal(String(source || "").startsWith("data:image/"), true, "时间线没有展示这次观察的真实照片");
    await page.screenshot({ path: "/tmp/huahua-observation-with-diagnosis.png", fullPage: true });
    assert.deepEqual(errors, [], `浏览器错误：${errors.join(" | ")}`);
    console.log("OBSERVATION_TIMELINE_BROWSER_OK /tmp/huahua-observation-with-diagnosis.png");
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
