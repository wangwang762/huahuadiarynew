const fs = require("fs");
const app = fs.readFileSync("app.jsx", "utf8");

for (const marker of ["collapseDuplicateObservations", "10 * 60 * 1000", "existing.photoData !== entry.photoData", "if (duplicate) return duplicate"]) {
  if (!app.includes(marker)) throw new Error(`duplicate observation protection missing: ${marker}`);
}

console.log("DIARY_ENTRY_IDEMPOTENCY_OK");
