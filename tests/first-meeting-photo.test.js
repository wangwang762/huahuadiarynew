const fs = require("fs");

const onboard = fs.readFileSync("screens-onboard.jsx", "utf8");
const diary = fs.readFileSync("screens-diary.jsx", "utf8");
const app = fs.readFileSync("app.jsx", "utf8");
const home = fs.readFileSync("screens-home.jsx", "utf8");
const garden = fs.readFileSync("screens-garden.jsx", "utf8");

for (const marker of ['capture="environment"', "firstPhoto", "拍下第一张照片", "暂时跳过", "diary: []", "正在看看它今天的状态", "onDone(image)", 'onClick={() => onDone("")}', "onBack={() => setStep(2)}"]) {
  if (!onboard.includes(marker)) throw new Error(`missing first-photo marker: ${marker}`);
}
for (const stale of ["type: \"born\"", "setTraits(s.traits.slice(0, 3))"]) {
  if (onboard.includes(stale)) throw new Error(`stale synthetic onboarding state remains: ${stale}`);
}
for (const marker of ["日记还是空的", "拍下第一张照片"]) {
  if (!diary.includes(marker)) throw new Error(`empty diary state missing marker: ${marker}`);
}
for (const marker of ["finishOnboard(newPlant, firstPhoto)", "validFirstPhoto", 'view: "capture"', "image: validFirstPhoto", "autoSave: true", "startAtSpecies"]) {
  if (!app.includes(marker)) throw new Error(`first observation route missing marker: ${marker}`);
}
if (!app.includes('? [{ view: "diary" }, { view: "capture"')) throw new Error("first-photo analysis has no diary home to return to");
if (!app.includes(': [{ view: "diary" }]')) throw new Error("skipping the first photo must return to the diary home");
for (const stale of ["第一张照片已经放进日记", "分析并写下第一篇日记"]) {
  if (onboard.includes(stale)) throw new Error(`redundant first-photo confirmation remains: ${stale}`);
}
for (const [name, source] of [["home", home], ["garden", garden]]) {
  if (!source.includes('go("onboard", null, { startAtSpecies: true })')) throw new Error(`${name} adopt button does not open species picker`);
}

console.log("FIRST_MEETING_PHOTO_OK");
