const fs = require("fs");

const source = fs.readFileSync("screens-chat.jsx", "utf8");
const app = fs.readFileSync("app.jsx", "utf8");

if (!source.includes('go(accentDoctor ? "doctorBack" : "back")')) throw new Error("doctor chat does not use safe back navigation");
if (!app.includes('dest === "doctorBack"') || !app.includes('view === "capture"')) throw new Error("doctor back does not skip the auto-analyzing capture route");
for (const marker of ["finishing", "finishConsult", "正在整理这次问诊…", 'aria-busy={finishing ? "true" : "false"}', "share one stable bottom surface", "病因仍需复核", "fallback: true"]) {
  if (!source.includes(marker)) throw new Error(`missing doctor finish control marker: ${marker}`);
}

const scrollEnd = source.indexOf("{/* quick replies */}");
const anchoredAction = source.indexOf("{/* composer:");
if (anchoredAction < scrollEnd) throw new Error("doctor finish action is still inside the scrolling conversation");

console.log("CHAT_FINISH_CONTROLS_OK");
