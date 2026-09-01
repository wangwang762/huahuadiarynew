const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const marker of [
  "GARDEN_POCKET_DEAD_ZONE",
  "function getGardenPullDistance",
  "function getGardenPullProgress",
  '"--garden-pull-progress"',
  "garden-pocket-preview",
  "is-threshold-ready",
]) {
  if (!app.includes(marker)) throw new Error(`missing garden pocket marker: ${marker}`);
}

if (!/Math\.pow\(|Math\.sqrt\(|Math\.log1p\(/.test(app)) {
  throw new Error("garden pull resistance is not nonlinear");
}

for (const marker of [
  ".garden-pocket-preview",
  ".garden-pocket-window",
  "-webkit-mask-image:",
  "var(--garden-pull-progress)",
  "pointer-events:none",
]) {
  if (!styles.includes(marker)) throw new Error(`missing pocket style marker: ${marker}`);
}

console.log("GARDEN_POCKET_MOTION_OK");
