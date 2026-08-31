const fs = require("fs");

const styles = fs.readFileSync("styles.css", "utf8");
if (!/\.flat-row-count-1 \.flat-garden-plant-art \{[^}]*transform:translateY\(7px\)/.test(styles)) {
  throw new Error("single plant artwork is missing its shelf baseline compensation");
}
if (!styles.includes(".flat-row-count-1 .flat-garden-plant-art::after")) {
  throw new Error("single plant is missing its shelf contact shadow adjustment");
}

console.log("SINGLE_PLANT_SHELF_ALIGNMENT_OK");
