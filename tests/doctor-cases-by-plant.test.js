const fs = require("fs");
const doctor = fs.readFileSync("screens-doctor.jsx", "utf8");

for (const marker of ["const diagnoses = (plant.diary || []).filter", "const entry = diagnoses[0]", "visitCount: diagnoses.length", "最近一次 · 共 {c.visitCount || 1} 次问诊"]) {
  if (!doctor.includes(marker)) throw new Error(`latest case per plant missing: ${marker}`);
}
if (doctor.includes(".map((entry, index) =>")) throw new Error("case wall still renders every diagnosis as a separate card");

console.log("DOCTOR_CASES_BY_PLANT_OK");
