const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const components = fs.readFileSync("components.jsx", "utf8");
const garden = fs.readFileSync("screens-garden.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");

for (const forbidden of ["WidgetScreen", 'id: "widget", label: "小组件"']) {
  if (app.includes(forbidden) || components.includes(forbidden)) throw new Error(`widget UI remains: ${forbidden}`);
}
for (const marker of ["GardenScreen", "flat-garden", "flat-garden-rack", "flat-weather-zone", "slice(0, 20)"]) {
  if (!garden.includes(marker) && !app.includes(marker)) throw new Error(`garden marker missing: ${marker}`);
}
for (const marker of ["levelCount", "GardenVisitors", "GardenVisitorArt", "butterfly", "bee", "bird", "flat-garden-sway-cut", "flat-rack-levels-"]) {
  if (!garden.includes(marker)) throw new Error(`adaptive garden motion missing: ${marker}`);
}
if (!garden.includes("flat-shelf-braces")) throw new Error("shelf wall braces are missing");
for (const marker of ["GardenRoomDecor", "garden-print-v1.webp", "garden-chair-v1.webp"]) {
  if (!garden.includes(marker)) throw new Error(`garden room detail missing: ${marker}`);
}
for (const marker of ["garden-wall-sunny-v3.webp", "garden-wall-cloudy-v3.webp", "garden-wall-rainy-v4.webp", "weatherName={weatherName}"]) {
  if (!garden.includes(marker)) throw new Error(`weather garden background missing: ${marker}`);
}
if (garden.includes("storm-leaf-shadows")) throw new Error("floating leaf shadows should be removed");
if (garden.includes("dog-v2")) throw new Error("dog background is still active");
for (const forbidden of ["我的小花园", "今日花园", "garden-summary", "garden-greenhouse", "balcony-window", "balcony-cityline", "balcony-foreground", "foreground-leaf"]) {
  if (garden.includes(forbidden)) throw new Error(`old garden framing remains: ${forbidden}`);
}
if (garden.includes("flat-rack-post")) throw new Error("wall shelf must not render support legs");
if (!html.includes("screens-garden.jsx?v=20260823p") || html.includes("screens-widget.jsx")) throw new Error("garden screen is not the active third tab");
if (!html.includes("components.jsx?v=20260823a") || !html.includes("styles.css?v=20260825q")) throw new Error("garden navigation or styles may be stale-cached");
if (garden.includes("FlatGardenWeather") || garden.includes("flat-garden-weather")) throw new Error("garden weather label should be hidden");

console.log("GARDEN_SCREEN_OK");
