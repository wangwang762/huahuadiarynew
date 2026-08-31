const fs = require("fs");

const source = fs.readFileSync("screens-profile.jsx", "utf8");
for (const marker of ["tagOrder", "selectedTags", "tagOrder.map", "custom: p.custom"]) {
  if (!source.includes(marker)) throw new Error(`missing stable tag editor marker: ${marker}`);
}
for (const stale of ["轻点标签修改", "它现在大概会这样说话", "自定义补充描述", "setCustom"]) {
  if (source.includes(stale)) throw new Error(`stale profile module remains: ${stale}`);
}

console.log("PROFILE_PERSONALITY_EDITOR_OK");
