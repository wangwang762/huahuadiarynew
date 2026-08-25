const { chromium } = require("playwright");
const assert = require("assert");

const baseUrl = process.env.HH_TEST_URL || "http://127.0.0.1:4182/dist/cloudbase/index.html?demo=1&tab=doctor";

function apiPayload(action, recognition, failRecognition) {
  if (action === "recognize") {
    if (failRecognition) return { status: 503, body: { ok: false, message: "识别服务繁忙" } };
    return { status: 200, body: { ok: true, recognition } };
  }
  if (action === "chat") {
    return { status: 200, body: { ok: true, reply: "我看到了叶片状态。先保持通风，等盆土干一些再浇水。" } };
  }
  if (action === "summary") {
    return {
      status: 200,
      body: {
        ok: true,
        summary: {
          symptom: "叶片状态欠佳",
          conclusion: "可能与盆土偏湿有关",
          plan: "保持通风，待盆土变干后再浇水",
          points: ["保持通风", "观察盆土"],
          followupDays: 5,
          urgency: "observe",
          confidence: 0.62,
        },
      },
    };
  }
  return { status: 400, body: { ok: false, message: "未知动作" } };
}

async function openCase(browser, recognition, failRecognition = false) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", message => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) consoleErrors.push(message.text());
  });
  page.on("response", response => {
    const expectedRecognitionFailure = failRecognition
      && response.status() === 503
      && response.url().includes("fcapp.run");
    if (response.status() >= 400
      && !expectedRecognitionFailure
      && !response.url().endsWith("/favicon.ico")
      && !response.url().endsWith("/.image-slots.state.json")) {
      consoleErrors.push(`HTTP ${response.status()} ${response.url()}`);
    }
  });
  page.on("pageerror", error => consoleErrors.push(error.message));
  await page.route("**/*", async route => {
    const hostname = new URL(route.request().url()).hostname;
    if (["127.0.0.1", "localhost", "unpkg.com", "static.cloudbase.net"].includes(hostname)
      || hostname.endsWith("fcapp.run")) {
      await route.continue();
    } else {
      await route.abort();
    }
  });
  await page.route(/huahua-r-doctor-.*\.fcapp\.run/, async route => {
    const request = route.request();
    const body = JSON.parse(request.postData() || "{}");
    const result = apiPayload(body.action, recognition, failRecognition);
    await route.fulfill({
      status: result.status,
      contentType: "application/json",
      body: JSON.stringify(result.body),
    });
  });
  // The preview intentionally keeps weather/font requests alive, so wait for the
  // rendered app landmark after DOM readiness instead of an unreachable idle state.
  await page.goto(baseUrl, { waitUntil: "commit", timeout: 15_000 });
  await page.getByText("花大夫诊所", { exact: true }).waitFor();
  await page.evaluate(() => {
    window.HHCloud.demo = false;
    window.HHData.addDiaryEntry = async () => ({ ok: true });
    window.HHData.createPlantWithFirstEntry = async () => ({ ok: true });
  });
  await page.getByRole("button", { name: /带一盆花来看诊/ }).first().click();
  await page.getByRole("button", { name: "让花花认认它" }).click();
  return { context, page, consoleErrors };
}

async function assertNoLayoutFailure(page, consoleErrors) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  assert.equal(overflow, false, "页面出现横向溢出");
  assert.deepEqual(consoleErrors, [], `浏览器错误：${consoleErrors.join(" | ")}`);
  const html = await page.content();
  assert.equal(/sk-[A-Za-z0-9]{12,}/.test(html), false, "页面源码疑似暴露 API Key");
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.HH_CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  try {
    {
      const run = await openCase(browser, { species: "绿萝", confidence: 0.91, matchedIds: [], note: "叶形像绿萝" });
      await run.page.getByText(/认出是 阿绿（绿萝）/).waitFor();
      await assertNoLayoutFailure(run.page, run.consoleErrors);
      await run.context.close();
      console.log("DOCTOR_BROWSER_SINGLE_MATCH_OK");
    }

    {
      const run = await openCase(browser, { species: "多肉植物", confidence: 0.9, matchedIds: [], note: "叶片肥厚" });
      await run.page.getByText(/你的花园里有 2 位老朋友很像/).waitFor();
      await run.page.getByRole("button", { name: /团子/ }).click();
      await run.page.getByText(/认出是 团子（玉露 · 多肉）/).waitFor();
      await assertNoLayoutFailure(run.page, run.consoleErrors);
      await run.context.close();
      console.log("DOCTOR_BROWSER_MULTI_MATCH_OK");
    }

    {
      const run = await openCase(browser, { species: "捕蝇草", confidence: 0.86, matchedIds: [], note: "叶片具有捕虫夹" });
      try {
        await run.page.getByText(/认出它像「捕蝇草」/).waitFor();
      } catch (error) {
        console.error("NEW_FRIEND_PAGE_TEXT", (await run.page.locator("body").innerText()).slice(0, 2000));
        throw error;
      }
      await run.page.getByRole("button", { name: "叶片发皱怎么办" }).click();
      await run.page.getByText(/我看到了叶片状态/).waitFor();
      await run.page.getByRole("button", { name: /诊断完成 · 为它建档/ }).click();
      const speciesInput = run.page.getByPlaceholder("输入品种，如「虎皮兰」");
      await speciesInput.waitFor();
      assert.equal(await speciesInput.inputValue(), "捕蝇草");
      await run.page.getByText("识别结果已带入，可修改").waitFor();
      const before = await run.page.evaluate(() => window.PLANTS.length);
      await run.page.getByRole("button", { name: "暂不建档，返回问诊" }).click();
      await run.page.getByText(/认出它像「捕蝇草」/).waitFor();
      const after = await run.page.evaluate(() => window.PLANTS.length);
      assert.equal(after, before, "暂不建档不应新增植物");
      await assertNoLayoutFailure(run.page, run.consoleErrors);
      await run.context.close();
      console.log("DOCTOR_BROWSER_NEW_FRIEND_OK");
    }

    {
      const run = await openCase(browser, null, true);
      await run.page.getByText(/识别暂时没成功，先按新朋友问诊/).waitFor();
      await assertNoLayoutFailure(run.page, run.consoleErrors);
      await run.context.close();
      console.log("DOCTOR_BROWSER_RECOGNITION_FAILURE_OK");
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
