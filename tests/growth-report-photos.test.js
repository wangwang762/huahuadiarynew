const fs = require("fs");

const source = fs.readFileSync("screens-diary.jsx", "utf8");
for (const marker of ["window.reportPhotos", "d.photoData", "photos.length === 1", "photos.length === 2"]) {
  if (!source.includes(marker)) throw new Error(`missing real report photo marker: ${marker}`);
}
for (const stale of ["i % shots.length", "Math.max(base", "第一张可比较的观察照片"]) {
  if (source.includes(stale)) throw new Error(`report still synthesizes photos: ${stale}`);
}

console.log("GROWTH_REPORT_PHOTOS_OK");
