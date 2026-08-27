const fs = require("fs");

const capture = fs.readFileSync("screens-capture.jsx", "utf8");
const chat = fs.readFileSync("screens-chat.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");

for (const marker of [
  "window.HHDoctor.recognize",
  "result && result.matchedIds",
  "matches.length === 1",
  "matches.length > 1",
  "startNewFriendDiagnosis",
  "recognitionError",
  "prefillSpecies",
  "识别结果已带入，可修改",
  "暂不建档",
]) {
  if (!capture.includes(marker)) throw new Error(`missing recognition-flow marker: ${marker}`);
}

if (capture.includes('const detectedSpecies = "多肉"')) {
  throw new Error("clinic intake still relies on hard-coded species recognition");
}
if (!/screens-capture\.jsx\?v=\d{8}[a-z]/.test(html)) {
  throw new Error("screens-capture cache version was not refreshed");
}
for (const marker of ["recognitionFailed", "识别暂时没成功，先按新朋友问诊", "认出是"]) {
  if (!chat.includes(marker)) throw new Error(`missing diagnosis recognition context: ${marker}`);
}

const directMatch = capture.indexOf("matches.length === 1");
const ambiguity = capture.indexOf("matches.length > 1");
const fallback = capture.indexOf("startNewFriendDiagnosis");
if (directMatch < 0 || ambiguity < directMatch || fallback < 0) {
  throw new Error("recognition branches are not explicit and reviewable");
}

console.log("DOCTOR_RECOGNITION_FLOW_OK");
