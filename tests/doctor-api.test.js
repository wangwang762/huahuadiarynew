const fs = require("fs");

const client = fs.readFileSync("doctor-service.js", "utf8");
const config = fs.readFileSync("doctor-config.js", "utf8");
const fn = fs.readFileSync("aliyun-functions/flower-doctor/index.js", "utf8");
const chat = fs.readFileSync("screens-chat.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");
const build = fs.readFileSync("scripts/build-cloudbase.mjs", "utf8");

for (const marker of ["window.HHDoctorConfig", "fetch(endpoint", 'method: "POST"', "AbortController", "window.HHDoctor"]) {
  if (!client.includes(marker)) throw new Error(`missing doctor client marker: ${marker}`);
}
if (client.includes("app.callFunction")) throw new Error("doctor client still calls CloudBase function");
for (const marker of ["window.HHDoctorConfig", 'endpoint: ""', "timeoutMs"]) {
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

console.log("FLOWER_DOCTOR_API_OK");
