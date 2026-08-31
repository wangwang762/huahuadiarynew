const fs = require("fs");

const data = fs.readFileSync("data.js", "utf8");
const capture = fs.readFileSync("screens-capture.jsx", "utf8");

for (const marker of ["window.observationVoice", 'health === "sick"', 'trend === "better"', "tagsOn"]) {
  if (!data.includes(marker)) throw new Error(`missing personality voice marker: ${marker}`);
}
if (!capture.includes("window.observationVoice(p, triageResult)")) {
  throw new Error("capture does not generate a state-aware voice");
}
if (capture.includes("setVoice(p.voice)")) throw new Error("capture still reuses the first-meeting voice");

console.log("PLANT_OBSERVATION_VOICE_OK");
