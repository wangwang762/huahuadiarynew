const fs = require("fs");
const assert = require("assert");
const vm = require("vm");

const client = fs.readFileSync("doctor-service.js", "utf8");
const config = fs.readFileSync("doctor-config.js", "utf8");
const fn = fs.readFileSync("aliyun-functions/flower-doctor/index.js", "utf8");
const chat = fs.readFileSync("screens-chat.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");
const build = fs.readFileSync("scripts/build-cloudbase.mjs", "utf8");

for (const marker of ["window.HHDoctorConfig", "fetch(endpoint", 'method: "POST"', "AbortController", "window.HHDoctor"]) {
  if (!client.includes(marker)) throw new Error(`missing doctor client marker: ${marker}`);
}
for (const marker of ["async function recognize", "action, ...payload", "matchedIds", "validIds.has(id)", "window.HHDoctor = { reply, summarize, recognize }"]) {
  if (!client.includes(marker)) throw new Error(`missing recognition client marker: ${marker}`);
}
if (client.includes("app.callFunction")) throw new Error("doctor client still calls CloudBase function");
for (const marker of ["window.HHDoctorConfig", 'endpoint: "https://huahua-r-doctor-srnkxzqpos.cn-hangzhou.fcapp.run"', "timeoutMs"]) {
  if (!config.includes(marker)) throw new Error(`missing doctor config marker: ${marker}`);
}
for (const marker of ["DASHSCOPE_API_KEY", "qwen3-vl-flash", "/chat/completions", 'action === "summary"', "confidence", "followup_days", "exports.handler"]) {
  if (!fn.includes(marker)) throw new Error(`missing doctor function marker: ${marker}`);
}
if (chat.includes("这次约 60ml")) throw new Error("doctor still contains a fabricated network fallback");
for (const marker of ["window.HHDoctor.reply", "window.HHDoctor.summarize", "summary.symptom", "summary.conclusion"]) {
  if (!chat.includes(marker)) throw new Error(`missing real doctor flow marker: ${marker}`);
}
const configPosition = html.indexOf("doctor-config.js");
const clientPosition = html.indexOf("doctor-service.js");
if (configPosition < 0 || clientPosition < 0 || configPosition > clientPosition) {
  throw new Error("doctor config must load before doctor service");
}
for (const marker of ['"doctor-config.js"', '"doctor-service.js"']) {
  if (!build.includes(marker)) throw new Error(`doctor runtime is not deployed: ${marker}`);
}

async function verifyRecognitionClient() {
  let requestBody;
  let responseIndex = 0;
  const responses = [
    {
      species: "多肉植物",
      confidence: 1.4,
      matchedIds: ["p1", "invented", "p1"],
      note: "叶片饱满",
    },
    {
      species: "待识别",
      confidence: -1,
      matchedIds: ["p2", "invented"],
      note: "品类不确定",
    },
    {
      species: "绿萝",
      confidence: 0.3,
      matchedIds: ["p2"],
      note: "照片太糊",
    },
  ];
  const window = {
    HHCloud: { demo: false },
    HHDoctorConfig: { endpoint: "https://doctor.example.test", timeoutMs: 1_000 },
    location: { href: "https://garden.example.test" },
  };
  vm.runInNewContext(client, {
    window,
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
    fetch: async (_endpoint, options) => {
      requestBody = JSON.parse(options.body);
      return {
        json: async () => ({
          ok: true,
          recognition: responses[responseIndex++],
        }),
      };
    },
  });

  const recognition = await window.HHDoctor.recognize({
    image: "data:image/jpeg;base64,AA==",
    plants: [
      { id: "p1", name: "团子", species: "玉露 · 多肉", diary: "不得发送" },
      { id: "p2", name: "圆圆", species: "玉露 · 多肉", guide: "不得发送" },
      { id: "no-species", name: "空档案", diary: "不得发送" },
    ],
  });

  assert.equal(requestBody.action, "recognize");
  assert.equal(requestBody.image, "data:image/jpeg;base64,AA==");
  assert.deepEqual(requestBody.candidates, [
    { id: "p1", name: "团子", species: "玉露 · 多肉" },
    { id: "p2", name: "圆圆", species: "玉露 · 多肉" },
  ]);
  assert.equal(recognition.species, "多肉植物");
  assert.equal(recognition.confidence, 1);
  assert.deepEqual(Array.from(recognition.matchedIds), ["p1", "p2"]);
  assert.equal(recognition.note, "叶片饱满");

  const fallback = await window.HHDoctor.recognize({
    image: "data:image/jpeg;base64,BB==",
    plants: [
      { id: "p1", name: "小刺", species: "仙人掌" },
      { id: "p2", name: "阿绿", species: "绿萝" },
    ],
  });
  assert.equal(fallback.confidence, 0);
  assert.deepEqual(Array.from(fallback.matchedIds), []);

  const lowConfidence = await window.HHDoctor.recognize({
    image: "data:image/jpeg;base64,CC==",
    plants: [{ id: "p2", name: "阿绿", species: "绿萝" }],
  });
  assert.equal(lowConfidence.confidence, 0.3);
  assert.deepEqual(Array.from(lowConfidence.matchedIds), []);
}

verifyRecognitionClient().then(() => {
  console.log("FLOWER_DOCTOR_API_OK");
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
