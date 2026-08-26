const fs = require("fs");

const html = fs.readFileSync("花花日记本.html", "utf8");
const config = fs.readFileSync("cloudbase-config.js", "utf8");
const account = fs.readFileSync("account-service.js", "utf8");
const data = fs.readFileSync("data-service.js", "utf8");
const seed = fs.readFileSync("data.js", "utf8");

for (const marker of [
  "cloudbase-js-sdk/3.8.0/cloudbase.full.js",
  'src="cloudbase-config.js',
  'src="data-service.js',
]) {
  if (!html.includes(marker)) throw new Error(`missing CloudBase HTML marker: ${marker}`);
}

for (const marker of ["huahuadiary-d4gajnlumc8432f6c", "ap-shanghai", "cloudbase.init", "app.rdb", "demo=1"]) {
  if (!config.includes(marker)) throw new Error(`missing CloudBase config marker: ${marker}`);
}

for (const marker of ["signInWithOtp", "verifyOtp", "restoreSession", "getSession"]) {
  if (!account.includes(marker)) throw new Error(`missing CloudBase account marker: ${marker}`);
}
for (const forbidden of ["DEV_CODE", '"123456"']) {
  if (account.includes(forbidden)) throw new Error(`development OTP remains: ${forbidden}`);
}

for (const marker of ["profiles", "plants", "diary_entries", "owner_id", ".from(", "createPlantWithFirstEntry", "addDiaryEntry", "updateDiaryEntry", "updatePlant"]) {
  if (!data.includes(marker)) throw new Error(`missing CloudBase data marker: ${marker}`);
}
if (data.includes(".collection(")) throw new Error("PostgreSQL data service must not call the document database");
if (!data.includes("onConflict: \"owner_id\"")) throw new Error("profile upsert must target the PostgreSQL owner key");
if (!seed.includes("window.DEMO_PLANTS")) throw new Error("demo seed snapshot is missing");
if (!data.includes("window.HHCloud.demo")) throw new Error("data service must isolate explicit demo mode");

console.log("CLOUDBASE_INTEGRATION_OK");
