const fs = require("fs");

const capture = fs.readFileSync("screens-capture.jsx", "utf8");
const client = fs.readFileSync("doctor-service.js", "utf8");
const fn = fs.readFileSync("aliyun-functions/flower-doctor/index.js", "utf8");

for (const marker of [
  "window.HHDoctor.triage",
  "triageResult.route === \"record\"",
  "triageResult.route === \"soft_hint\"",
  "triageResult.route === \"diagnose\"",
  "triageResult.observations",
  "setDiagnosisPhoto(image)",
]) {
  if (!capture.includes(marker)) throw new Error(`capture flow is not driven by photo triage: ${marker}`);
}
for (const stale of [
  'const needsDoctor = p.statusTone === "warn"',
  "你今天状态很好、被认真记录着",
]) {
  if (capture.includes(stale)) throw new Error(`capture flow still assumes health before reading the photo: ${stale}`);
}
for (const marker of ["async function triage", 'invoke("triage"', "normalizeTriage", "window.HHDoctor = { reply, summarize, recognize, triage }"]) {
  if (!client.includes(marker)) throw new Error(`missing photo triage client marker: ${marker}`);
}
for (const marker of ['action === "triage"', "normalizeTriage", "good|watch|sick", "record|soft_hint|diagnose"]) {
  if (!fn.includes(marker)) throw new Error(`missing photo triage backend marker: ${marker}`);
}

console.log("CAPTURE_HEALTH_TRIAGE_OK");
