const fs = require("fs");

if (!fs.existsSync("report-export.js")) throw new Error("report-export.js does not exist");
const exporter = fs.readFileSync("report-export.js", "utf8");
const screen = fs.readFileSync("screens-diary.jsx", "utf8");
for (const marker of ["HHReport.prepare", "canvas.toBlob", "navigator.canShare", "navigator.share", "anchor.download"]) {
  if (!exporter.includes(marker)) throw new Error(`missing report save fallback: ${marker}`);
}
if (!screen.includes("保存小报")) throw new Error("report button copy was not updated");

console.log("REPORT_SAVE_OK");
