const fs = require("fs");
const path = require("path");

const app = fs.readFileSync(path.join(__dirname, "..", "app.jsx"), "utf8");

if (!app.includes("function hasStartedGarden(garden)")) {
  throw new Error("missing shared existing-garden entry rule");
}
if (!app.includes("Array.isArray(garden.plants) && garden.plants.length")) {
  throw new Error("existing plants do not bypass the empty onboarding state");
}
if ((app.match(/onboarded: hasStartedGarden\(garden\)/g) || []).length < 3) {
  throw new Error("not every account entry path uses the existing-garden rule");
}

console.log("existing garden entry test passed");
