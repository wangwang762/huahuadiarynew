const fs = require("fs");

const plant = fs.readFileSync("screens-plant.jsx", "utf8");
const app = fs.readFileSync("app.jsx", "utf8");
const capture = fs.readFileSync("screens-capture.jsx", "utf8");
const doctor = fs.readFileSync("screens-doctor.jsx", "utf8");

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
  "intakePhotoRef.current.click()",
  'aria-label="拍照或从相册选择植物照片"',
  'go("capture", window.UNKNOWN_PLANT, { intake: true, image: reader.result })',
]) {
  if (!doctor.includes(marker)) throw new Error(`clinic intake does not open photo picker directly: ${marker}`);
}

for (const marker of [
  "initialImage = \"\"",
  "hasInitialImage",
  "没有收到有效照片，请重新拍照或从相册选择",
  "autoAnalyzeRef",
  "analyze(initialImage)",
  "const image = imageSource",
]) {
  if (!capture.includes(marker)) throw new Error(`capture does not auto-analyze selected photo: ${marker}`);
}

if (capture.includes("拖入或拍一张{p.name}此刻的照片")) {
  throw new Error("existing-plant capture still renders the redundant confirmation step");
}
if (capture.includes("onClick={analyze}")) throw new Error("empty capture state can still start analysis without a photo");
console.log("DIRECT_CAMERA_FLOW_OK");
