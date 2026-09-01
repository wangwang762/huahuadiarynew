const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const home = fs.readFileSync("screens-home.jsx", "utf8");
const garden = fs.readFileSync("screens-garden.jsx", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const marker of [
  'const ROOT_VIEWS = ["diary"]',
  "function DiaryGardenFloor",
  "function GlobalCaptureButton",
  "GARDEN_FLOOR_GUIDE_KEY",
  "localStorage.getItem(GARDEN_FLOOR_GUIDE_KEY)",
  "localStorage.setItem(GARDEN_FLOOR_GUIDE_KEY, \"1\")",
  'go("capture", window.UNKNOWN_PLANT, { intake: true, image: reader.result })',
  "diary-floor-sheet",
  "garden-floor-guide",
  "garden-floor-return",
]) {
  if (!app.includes(marker) && !garden.includes(marker) && !styles.includes(marker)) {
    throw new Error(`missing diary/garden floor marker: ${marker}`);
  }
}

if (app.includes("garden-floor-hint") || styles.includes("garden-floor-hint")) {
  throw new Error("persistent garden floor hint is still present");
}

if (!home.includes("ref={scrollRef}")) throw new Error("diary scroll container is not exposed to the floor gesture");
if (app.includes("<BottomNav")) throw new Error("legacy bottom navigation is still mounted");
if (app.includes('baseTab === "doctor"') || app.includes('baseTab === "garden"')) {
  throw new Error("doctor or garden is still a base route");
}
if (!styles.includes("scroll-snap-type:x mandatory") || !styles.includes("overflow-x:auto") || !styles.includes("overflow-y:hidden")) {
  throw new Error("garden pages are not horizontally paged");
}
if (!garden.includes("左右滑，继续逛花园") || garden.includes("往上滑，继续逛花园")) {
  throw new Error("garden paging cue still describes vertical paging");
}

console.log("DIARY_GARDEN_FLOOR_OK");
