const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const capture = fs.readFileSync("screens-capture.jsx", "utf8");
const onboard = fs.readFileSync("screens-onboard.jsx", "utf8");

for (const marker of ['opts && opts.returnHome', 'setStack([{ view: "diary" }, { view: "plantDiary", plant }])']) {
  if (!app.includes(marker)) throw new Error(`clean diary return route missing: ${marker}`);
}
if (!capture.includes('go("plantDiary", p, { returnHome: true })')) throw new Error("saved observation still leaves capture in navigation stack");
for (const marker of ['aria-pressed={on}', '1.6px solid rgba(30,70,50,.42)', 'color: on ? "#fff" : "var(--ink-faint)"']) {
  if (!onboard.includes(marker)) throw new Error(`visible unselected trait state missing: ${marker}`);
}

console.log("ONBOARDING_TRAIT_AND_RETURN_FLOW_OK");
