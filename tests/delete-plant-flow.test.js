const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const profile = fs.readFileSync("screens-profile.jsx", "utf8");
const data = fs.readFileSync("data-service.js", "utf8");

for (const marker of ["async function deletePlant(plant)", "window.HHData.deletePlant(plant.id)", '<PlantDeleteConfirm plant={top.plant}']) {
  if (!app.includes(marker)) throw new Error(`missing app delete marker: ${marker}`);
}
const plant = fs.readFileSync("screens-plant.jsx", "utf8");
for (const marker of ["PlantDeleteConfirm", "确认删除", "无法恢复", 'role="dialog"', "await onDelete(plant)"]) {
  if (!plant.includes(marker)) throw new Error(`missing delete confirmation marker: ${marker}`);
}
for (const marker of ["删除这盆花", 'go("deletePlant", p)', "删除前会再次确认"]) {
  if (!profile.includes(marker)) throw new Error(`plant editor deletion entry missing: ${marker}`);
}
for (const [name, source] of [["home", fs.readFileSync("screens-home.jsx", "utf8")], ["garden", fs.readFileSync("screens-garden.jsx", "utf8")]]) {
  if (source.includes("useLongPress") || source.includes("长按可删除")) throw new Error(`${name} still uses long-press deletion`);
  if (!source.includes("WebkitTouchCallout")) throw new Error(`${name} does not suppress the iOS long-press menu`);
}
for (const marker of ["async function deletePlant(plantId)", 'from(TABLES.diaryEntries).delete()', 'from(TABLES.plants).delete()', "deletePlant,"]) {
  if (!data.includes(marker)) throw new Error(`missing persisted delete marker: ${marker}`);
}

console.log("DELETE_PLANT_FLOW_OK");
