const fs = require("fs");

const doctor = fs.readFileSync("screens-doctor.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");

for (const marker of [
  "window.HHCloud && window.HHCloud.demo ? window.CLINIC_CASES : savedCases",
  "还没有问诊记录",
  "带一盆花来看诊",
  "p || window.UNKNOWN_PLANT",
]) {
  if (!doctor.includes(marker)) throw new Error(`missing doctor empty-state marker: ${marker}`);
}
if (!html.includes("screens-doctor.jsx?v=20260823a")) throw new Error("doctor screen cache version is missing");

console.log("DOCTOR_EMPTY_STATE_OK");
