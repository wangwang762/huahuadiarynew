const fs = require("fs");
const capture = fs.readFileSync("screens-capture.jsx", "utf8");
for (const marker of [
  "previousEntry",
  "previousImage",
  "photoData",
  "trendSummary",
  "带着这张照片问问花大夫",
  'go("doctorChat", p, { observation: entry })',
]) {
  if (!capture.includes(marker)) throw new Error(`missing comparison handoff: ${marker}`);
}
if (capture.includes("去问花大夫</button>")) throw new Error("doctor action is still visually dominant");
console.log("CAPTURE_COMPARISON_FLOW_OK");
