const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("data.js", "utf8");
const window = { PLANT_CUT: {} };
vm.runInNewContext(source, { window, Date, Math, Set });

const species = window.SPECIES;
if (!Array.isArray(species) || species.length !== 25) {
  throw new Error(`expected 25 selectable species, got ${species && species.length}`);
}

const names = new Set(species.map(item => item.species));
if (names.size !== 25) throw new Error("species names must be unique");

for (const item of species) {
  if (!item.id || !item.photoId || !item.shape) throw new Error(`missing avatar identity for ${item.species}`);
  if (!Array.isArray(item.traits) || item.traits.length < 1) throw new Error(`missing traits for ${item.species}`);
  if (!item.care) throw new Error(`missing care copy for ${item.species}`);
}

const onboarding = fs.readFileSync("screens-onboard.jsx", "utf8");
for (const required of ["ObSpeciesPicker", "选择植物品类", "选好了，下一步"]) {
  if (!onboarding.includes(required)) throw new Error(`missing manual-picker marker: ${required}`);
}
for (const forbidden of ["AI 识别完成", "置信度 92%", "function ObCapture"]) {
  if (onboarding.includes(forbidden)) throw new Error(`obsolete recognition flow remains: ${forbidden}`);
}

const pickerStart = onboarding.indexOf("function ObSpeciesPicker");
const pickerEnd = onboarding.indexOf("/* ---------- 3", pickerStart);
const picker = onboarding.slice(pickerStart, pickerEnd);
for (const required of [
  "repeat(3, minmax(0, 1fr))",
  'data-picker-card="cover"',
  "transparent-frame",
  "window.coverScale",
  "window.coverOffsetY",
]) {
  if (!picker.includes(required)) throw new Error(`missing homepage-style picker marker: ${required}`);
}
if (picker.includes("PlantAvatar")) throw new Error("picker must not use circular PlantAvatar cards");

console.log("SPECIES_LIBRARY_OK");
