const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const components = fs.readFileSync("components.jsx", "utf8");
const garden = fs.readFileSync("screens-garden.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");

for (const forbidden of ["WidgetScreen", 'id: "widget", label: "小组件"']) {
  if (app.includes(forbidden) || components.includes(forbidden)) throw new Error(`widget UI remains: ${forbidden}`);
}
for (const marker of ["GardenScreen", "flat-garden", "flat-garden-rack", "flat-weather-zone", "slice(0, 100)"]) {
  if (!garden.includes(marker) && !app.includes(marker)) throw new Error(`garden marker missing: ${marker}`);
}
for (const marker of ["levelCount", "GardenVisitors", "GardenVisitorArt", "butterfly", "bee", "bird", "flat-garden-sway-cut", "flat-rack-levels-"]) {
  if (!garden.includes(marker)) throw new Error(`adaptive garden motion missing: ${marker}`);
}
for (const marker of ["displayedPlants", "gardenPages", "garden-page-scroll", "盆花住在这里", "往上滑，继续逛花园"] ) {
  if (!garden.includes(marker)) throw new Error(`garden quantity preview missing: ${marker}`);
}
for (const removed of ["previewCount", "数量预览", "恢复真实数量", "previewMaximum", "garden-quantity-preview"]) {
  if (garden.includes(removed)) throw new Error(`garden preview control still exists: ${removed}`);
}
if (!garden.includes("flat-shelf-braces")) throw new Error("shelf wall braces are missing");
for (const marker of ["GardenRoomDecor", "gardenSceneSource", "garden-scene-${scene}${suffix}-v1.jpg"]) {
  if (!garden.includes(marker)) throw new Error(`garden room detail missing: ${marker}`);
}
for (const marker of ["automaticGardenScene", "automaticGardenWeather", "hour >= 5", "hour >= 8", "hour >= 17", "hour >= 20", "garden-wind-shadows", "garden-breeze-foreground"]) {
  if (!garden.includes(marker)) throw new Error(`time or shared wind scene missing: ${marker}`);
}
for (const marker of ["--cast-x", "--cast-y", "--cast-blur", "--cast-color", "filter:drop-shadow(var(--cast-x)"]) {
  if (!fs.readFileSync("styles.css", "utf8").includes(marker)) throw new Error(`time-aware cast shadow missing: ${marker}`);
}
for (const marker of ["automaticGardenWeather", 'return "clear"', 'return "cloudy"', 'return "rain"', "weatherKind={visibleWeather}"]) {
  if (!garden.includes(marker)) throw new Error(`weather matrix missing: ${marker}`);
}
if (garden.includes("garden-scene-switcher") || garden.includes("chooseScene") || garden.includes("chooseWeather")) {
  throw new Error("garden comparison switcher should not ship in the product UI");
}
for (const time of ["dawn", "airy", "warm", "night"]) for (const suffix of ["", "-cloudy", "-rain"]) {
  const asset = `assets/garden-scene-${time}${suffix}-v1.jpg`;
  if (!fs.existsSync(asset)) throw new Error(`weather matrix asset missing: ${asset}`);
}
if (garden.includes("storm-leaf-shadows")) throw new Error("floating leaf shadows should be removed");
if (garden.includes("dog-v2")) throw new Error("dog background is still active");
for (const forbidden of ["我的小花园", "今日花园", "garden-summary", "garden-greenhouse", "balcony-window", "balcony-cityline", "balcony-foreground", "foreground-leaf"]) {
  if (garden.includes(forbidden)) throw new Error(`old garden framing remains: ${forbidden}`);
}
if (garden.includes("flat-rack-post")) throw new Error("wall shelf must not render support legs");
if (!/screens-garden\.jsx\?v=\d{8}[a-z]/.test(html) || html.includes("screens-widget.jsx")) throw new Error("garden screen is not the active third tab");
if (!/components\.jsx\?v=\d{8}[a-z]/.test(html) || !/styles\.css\?v=\d{8}[a-z]/.test(html)) throw new Error("garden navigation or styles may be stale-cached");
if (garden.includes("FlatGardenWeather") || garden.includes("flat-garden-weather")) throw new Error("garden weather label should be hidden");

console.log("GARDEN_SCREEN_OK");
