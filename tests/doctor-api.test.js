const fs = require("fs");

const client = fs.readFileSync("doctor-service.js", "utf8");
const fn = fs.readFileSync("cloudfunctions/flower-doctor/index.js", "utf8");
const chat = fs.readFileSync("screens-chat.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");
const build = fs.readFileSync("scripts/build-cloudbase.mjs", "utf8");

for (const marker of ["app.callFunction", 'name: FUNCTION_NAME', 'action, ...payload', "window.HHDoctor"]) {
  if (!client.includes(marker)) throw new Error(`missing doctor client marker: ${marker}`);
}
for (const marker of ["DASHSCOPE_API_KEY", "qwen3-vl-32b-thinking", "/chat/completions", 'action === "summary"', "confidence", "followup_days"]) {
  if (!fn.includes(marker)) throw new Error(`missing doctor function marker: ${marker}`);
}
if (chat.includes("这次约 60ml")) throw new Error("doctor still contains a fabricated network fallback");
for (const marker of ["window.HHDoctor.reply", "window.HHDoctor.summarize", "summary.symptom", "summary.conclusion"]) {
  if (!chat.includes(marker)) throw new Error(`missing real doctor flow marker: ${marker}`);
}
if (!html.includes("doctor-service.js")) throw new Error("doctor service is not loaded");
if (!build.includes('"doctor-service.js"')) throw new Error("doctor service is not deployed");

console.log("FLOWER_DOCTOR_API_OK");
