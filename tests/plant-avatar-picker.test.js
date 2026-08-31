const fs = require("fs");

const components = fs.readFileSync("components.jsx", "utf8");
const plant = fs.readFileSync("screens-plant.jsx", "utf8");
const home = fs.readFileSync("screens-home.jsx", "utf8");
const app = fs.readFileSync("app.jsx", "utf8");

for (const marker of ["plant.avatarData", "objectFit: \"cover\""]) {
  if (!components.includes(marker)) throw new Error(`custom avatar rendering missing: ${marker}`);
}
for (const marker of ["avatarInputRef", 'accept="image/*"', "handleAvatarChange", "canvas.toDataURL", "更换${p.name}的头像", "window.cutFor"]) {
  if (!plant.includes(marker)) throw new Error(`plant avatar picker missing: ${marker}`);
}
if (!home.includes("p.avatarData")) throw new Error("custom avatar is not shown on diary covers");
if (!app.includes("onSave={savePlant}")) throw new Error("plant detail cannot persist avatar changes");

console.log("PLANT_AVATAR_PICKER_OK");
