const assert = require("assert");

process.env.DASHSCOPE_API_KEY = "test-key";
process.env.ALLOWED_ORIGINS = "https://huahua.example,http://127.0.0.1:4177";

const originalFetch = global.fetch;
const calls = [];
global.fetch = async (url, options) => {
  calls.push({ url, options });
  const body = JSON.parse(options.body);
  const wantsSummary = body.messages.some(message =>
    typeof message.content === "string" && message.content.includes("只输出一个JSON对象")
  );
  return {
    ok: true,
    json: async () => ({
      choices: [{
        message: {
          content: wantsSummary
            ? JSON.stringify({
                symptom: "叶尖发黄",
                conclusion: "可能浇水偏多",
                plan: "暂停浇水并加强通风",
                points: ["观察盆土", "保持通风"],
                followup_days: 5,
                urgency: "observe",
                confidence: 0.46,
              })
            : "照片里能看到叶尖发黄。请告诉我盆土现在偏干还是偏湿？",
        },
      }],
    }),
  };
};

const { handler } = require("../aliyun-functions/flower-doctor/index.js");

function event(method, payload, origin = "https://huahua.example") {
  return Buffer.from(JSON.stringify({
    requestContext: { http: { method } },
    headers: { Origin: origin },
    body: payload == null ? "" : JSON.stringify(payload),
    isBase64Encoded: false,
  }));
}

(async () => {
  const preflight = await handler(event("OPTIONS"));
  assert.equal(preflight.statusCode, 204);
  assert.equal(preflight.headers["Access-Control-Allow-Origin"], "https://huahua.example");
  assert.equal(calls.length, 0);

  const chatResponse = await handler(event("POST", {
    action: "chat",
    plant: { id: "p1", name: "阿绿", species: "绿萝", days: 20 },
    image: "data:image/jpeg;base64,AA==",
    messages: [{ role: "user", content: "最近叶尖黄了" }],
  }));
  const chatBody = JSON.parse(chatResponse.body);
  assert.equal(chatResponse.statusCode, 200);
  assert.equal(chatBody.ok, true);
  assert.match(chatBody.reply, /叶尖发黄/);
  assert.equal(calls.length, 1);

  const summaryResponse = await handler(event("POST", {
    action: "summary",
    plant: { id: "p1", name: "阿绿", species: "绿萝", days: 20 },
    messages: [{ role: "user", content: "盆土偏湿" }],
  }));
  const summaryBody = JSON.parse(summaryResponse.body);
  assert.equal(summaryBody.ok, true);
  assert.equal(summaryBody.summary.followupDays, 5);
  assert.equal(summaryBody.summary.urgency, "observe");
  assert.equal(summaryBody.summary.confidence, 0.46);

  const rejected = await handler(event("POST", { action: "unknown" }));
  assert.equal(rejected.statusCode, 400);
  assert.equal(JSON.parse(rejected.body).ok, false);

  global.fetch = originalFetch;
  console.log("FLOWER_DOCTOR_ALIYUN_OK");
})().catch(error => {
  global.fetch = originalFetch;
  console.error(error);
  process.exit(1);
});
