const fs = require("fs");

const plant = fs.readFileSync("screens-plant.jsx", "utf8");
const app = fs.readFileSync("app.jsx", "utf8");
const capture = fs.readFileSync("screens-capture.jsx", "utf8");

for (const marker of [
  'type="file"',
  'accept="image/*"',
  'capture="environment"',
  "cameraInputRef.current.click()",
  'go("capture", p, { image: reader.result })',
]) {
  if (!plant.includes(marker)) throw new Error(`missing direct camera marker: ${marker}`);
}

if (!app.includes("initialImage={top.image}")) throw new Error("router does not pass the selected image into capture flow");

for (const marker of [
  "initialImage = \"\"",
  "autoAnalyzeRef",
  "analyze(initialImage)",
  "imageSource || await capturePhoto",
]) {
  if (!capture.includes(marker)) throw new Error(`capture does not auto-analyze selected photo: ${marker}`);
}

if (capture.includes("拖入或拍一张{p.name}此刻的照片")) {
  throw new Error("existing-plant capture still renders the redundant confirmation step");
}
console.log("DIRECT_CAMERA_FLOW_OK");
