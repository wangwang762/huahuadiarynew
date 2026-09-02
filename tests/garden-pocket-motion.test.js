const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const marker of [
  "GARDEN_POCKET_DEAD_ZONE",
  "function getGardenPullDistance",
  "function getGardenPullProgress",
  '"--garden-pull-progress"',
  '"--garden-edge-depth"',
  "garden-edge-reveal",
  "is-threshold-ready",
]) {
  if (!app.includes(marker)) throw new Error(`missing garden edge marker: ${marker}`);
}

if (!/Math\.pow\(|Math\.sqrt\(|Math\.log1p\(/.test(app)) {
  throw new Error("garden pull resistance is not nonlinear");
}

for (const marker of [
  ".garden-edge-reveal",
  ".diary-floor-sheet::before",
  "--garden-edge-depth",
  "var(--garden-pull-progress)",
  "pointer-events:none",
]) {
  if (!styles.includes(marker)) throw new Error(`missing continuous edge style marker: ${marker}`);
}

if (styles.includes(".garden-pocket-mask")) {
  throw new Error("legacy radial pocket mask must be removed");
}

console.log("GARDEN_POCKET_MOTION_OK");
