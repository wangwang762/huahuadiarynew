const fs = require("fs");

const frame = fs.readFileSync("ios-frame.jsx", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");

for (const marker of [
  'className="ios-device"',
  'className="ios-device-content"',
  'className="ios-device-chrome ios-device-island"',
  'className="ios-device-chrome ios-device-status"',
  'className="ios-device-chrome ios-device-home"',
]) {
  if (!frame.includes(marker)) throw new Error(`missing responsive shell marker: ${marker}`);
}

for (const marker of [
  "@media (max-width: 600px)",
  "max-width: 480px",
  "height: 100dvh",
  "--app-safe-top: env(safe-area-inset-top, 0px)",
  "--app-safe-bottom: env(safe-area-inset-bottom, 0px)",
  ".ios-device-chrome",
  "display: none",
]) {
  if (!css.includes(marker)) throw new Error(`missing mobile shell CSS: ${marker}`);
}

if (!html.includes("viewport-fit=cover")) throw new Error("viewport does not opt into mobile safe areas");
console.log("MOBILE_SHELL_OK");
