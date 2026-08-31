const fs = require("fs");

const source = fs.readFileSync("screens-plant.jsx", "utf8");
for (const marker of ["compactNav", "onScroll", 'position: "sticky"', "p.name", 'data-sticky-capture="true"', 'position: "absolute"', "overflow: \"hidden\"", "paddingBottom: 126"]) {
  if (!source.includes(marker)) throw new Error(`missing sticky nav marker: ${marker}`);
}
for (const marker of ["<SelfCareGuide plant={p} embedded />", "embedded = false"]) {
  if (!source.includes(marker)) throw new Error(`missing fused plant profile marker: ${marker}`);
}

console.log("PLANT_DIARY_STICKY_NAV_OK");
