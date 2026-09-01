const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const plant = fs.readFileSync("screens-plant.jsx", "utf8");

if (!plant.includes('onClick={() => go("back")}')) throw new Error("plant diary must return through the route stack");
if (plant.includes('onClick={() => go("home")}')) throw new Error("plant diary still forces return to the diary homepage");
if (!app.includes('returnLabel="日记本"')) {
  throw new Error("plant diary return label does not reflect the diary-first shell");
}

console.log("PLANT_DIARY_BACK_ROUTE_OK");
