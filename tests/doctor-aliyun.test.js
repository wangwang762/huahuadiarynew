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
  const wantsRecognition = body.messages.some(message =>
    (typeof message.content === "string" && message.content.includes("植物识别路由"))
    || (Array.isArray(message.content) && message.content.some(part =>
      part && part.type === "text" && String(part.text || "").includes("植物识别路由")
    ))
  );
  const wantsTriage = body.messages.some(message =>
    (typeof message.content === "string" && message.content.includes("健康分诊路由"))
    || (Array.isArray(message.content) && message.content.some(part =>
      part && part.type === "text" && String(part.text || "").includes("健康分诊路由")
    ))
  );
  return {
    ok: true,
    json: async () => ({
      choices: [{
        message: {
          content: wantsTriage
            ? JSON.stringify({
                health: "watch",
                observations: ["叶尖焦黄"],
                likely_cause: "盆土偏湿",
                trend: "worse",
                trend_summary: "叶尖焦黄范围比上次扩大",
                confidence: 0.84,
              })
            : wantsRecognition
            ? JSON.stringify({
                species: "绿萝",
                confidence: 0.88,
                matched_ids: ["p1", "invented"],
                note: "叶形与绿萝相符",
              })
            : wantsSummary
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

  const recognitionResponse = await handler(event("POST", {
    action: "recognize",
    image: "data:image/jpeg;base64,AA==",
    candidates: [
      { id: "p1", name: "罗罗", species: "绿萝" },
      { id: "p2", name: "阿绿", species: "绿萝" },
    ],
  }));
  const recognitionBody = JSON.parse(recognitionResponse.body);
  assert.equal(recognitionBody.ok, true);
  assert.equal(recognitionBody.recognition.species, "绿萝");
  assert.deepEqual(recognitionBody.recognition.matchedIds, ["p1"]);
  assert.equal(recognitionBody.recognition.confidence, 0.88);

  const triageResponse = await handler(event("POST", {
    action: "triage",
    image: "data:image/jpeg;base64,CURRENT==",
    previousImage: "data:image/jpeg;base64,PREVIOUS==",
    previousObservedAt: "2026-08-20T08:00:00.000Z",
    plant: { id: "p3", name: "懒懒", species: "虎皮兰", days: 1 },
  }));
  const triageBody = JSON.parse(triageResponse.body);
  const triageModelBody = JSON.parse(calls[calls.length - 1].options.body);
  const triageImageUrls = triageModelBody.messages.flatMap(message =>
    Array.isArray(message.content) ? message.content : []
  ).filter(part => part && part.type === "image_url").map(part => part.image_url.url);
  assert.equal(triageBody.ok, true);
  assert.deepEqual(triageImageUrls, [
    "data:image/jpeg;base64,CURRENT==",
    "data:image/jpeg;base64,PREVIOUS==",
  ]);
  assert.equal(triageBody.triage.health, "watch");
  assert.equal(triageBody.triage.route, "soft_hint");
  assert.deepEqual(triageBody.triage.observations, ["叶尖焦黄"]);
  assert.equal(triageBody.triage.trend, "worse");
  assert.equal(triageBody.triage.trendSummary, "叶尖焦黄范围比上次扩大");
  assert.equal(triageBody.triage.confidence, 0.84);

  const firstObservationResponse = await handler(event("POST", {
    action: "triage",
    image: "data:image/jpeg;base64,FIRST==",
    plant: { id: "p3", name: "懒懒", species: "虎皮兰", days: 1 },
  }));
  const firstObservationBody = JSON.parse(firstObservationResponse.body);
  const firstObservationModelBody = JSON.parse(calls[calls.length - 1].options.body);
  const firstObservationImages = firstObservationModelBody.messages.flatMap(message =>
    Array.isArray(message.content) ? message.content : []
  ).filter(part => part && part.type === "image_url").map(part => part.image_url.url);
  assert.deepEqual(firstObservationImages, ["data:image/jpeg;base64,FIRST=="]);
  assert.equal(firstObservationBody.triage.trend, "unknown");
  assert.equal(firstObservationBody.triage.trendSummary, "这是第一次观察");

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
