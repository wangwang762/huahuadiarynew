const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const onboard = fs.readFileSync("screens-onboard.jsx", "utf8");
const email = fs.readFileSync("screens-email.jsx", "utf8");

for (const marker of ["restoreSession", "HHData.bootstrap", "花园暂时没有连上", "再试一次", "GardenBootScreen"]) {
  if (!app.includes(marker)) throw new Error(`missing CloudBase boot marker: ${marker}`);
}
for (const marker of [
  "enterGuestGarden",
  "guest: true",
  '<EmailEntry onEnter={enterGarden} onSkip={enterGuestGarden} playIntro={!!top.playIntro} />',
  'setStack([{ view: hydrated.onboarded ? "diary" : "onboard" }])',
]) {
  if (!app.includes(marker)) throw new Error(`missing guest entry marker: ${marker}`);
}
for (const marker of ["createPlantWithFirstEntry", "await window.HHData", "addDiaryEntry", "updateDiaryEntry", "updatePlant"]) {
  if (!app.includes(marker)) throw new Error(`missing awaited data-flow marker: ${marker}`);
}
for (const marker of ["saving", "saveError", "await onComplete"] ) {
  if (!onboard.includes(marker)) throw new Error(`missing onboarding save marker: ${marker}`);
}
if (!email.includes("await onEnter(result)")) throw new Error("email entry must await garden bootstrap");
if (email.includes("开发预览验证码") || email.includes("123456")) throw new Error("email screen exposes development OTP");

console.log("CLOUDBASE_APP_FLOW_OK");
