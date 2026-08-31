const fs = require("fs");

const diary = fs.readFileSync("screens-diary.jsx", "utf8");
const detail = diary.indexOf('{expanded && <div className="serif"');
const toggle = diary.indexOf('{hasDetails && <div', detail);

if (detail < 0 || toggle < 0 || toggle < detail) {
  throw new Error("diagnosis collapse control must render after expanded details");
}
if (!diary.includes('{expanded ? "收起详情" : "展开详情"}')) {
  throw new Error("diagnosis detail toggle labels are missing");
}

console.log("DIAGNOSIS_COLLAPSE_POSITION_OK");
