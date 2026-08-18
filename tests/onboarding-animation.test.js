const fs = require("fs");

const screen = fs.readFileSync("screens-onboard.jsx", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const generateStart = screen.indexOf("function ObGenerate");
const generateEnd = screen.indexOf("/* ---------- 5", generateStart);
const generate = screen.slice(generateStart, generateEnd);

for (const marker of [
  "diary-birth-sheet",
  "diary-ink-line",
  "diary-plant-reveal",
  "diary-leaf-stamp",
  "正在写下相遇的第一天",
  "从今天起，它住进你的日记里了",
]) {
  if (!generate.includes(marker)) throw new Error(`missing diary birth marker: ${marker}`);
}

for (const legacy of ["ringExpand", "floatUp", "正在为它注入灵魂"]) {
  if (generate.includes(legacy)) throw new Error(`legacy loading remains: ${legacy}`);
}

for (const marker of [
  "diaryPaperIn",
  "diaryWriteIn",
  "diaryInkDraw",
  "diaryPlantReveal",
  "diaryStampIn",
  "diaryMoteDrift",
  "prefers-reduced-motion: reduce",
]) {
  if (!css.includes(marker)) throw new Error(`missing diary animation CSS: ${marker}`);
}

console.log("ONBOARDING_ANIMATION_OK");
