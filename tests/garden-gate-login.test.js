const fs = require("fs");

const screen = fs.readFileSync("screens-email.jsx", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const marker of [
  "function CollageJournalScene",
  "collage-login-stage",
  "collage-corkboard",
  "collage-cover-left",
  "collage-cover-right",
  "collage-brass-clip",
  "collage-field-sheet",
  "collage-polaroid",
  "collage-email-note",
  "collage-otp-stamp",
  "assets/plants/final-v1/guibeizhu.png",
  "assets/plants/final-v1/hudielan.png",
  "登录花花日记本",
  "用邮箱保存并找回你的花园",
  "输入邮箱验证码",
]) {
  if (!screen.includes(marker)) throw new Error(`missing garden login marker: ${marker}`);
}

for (const marker of [
  "perspective:",
  "rotateY",
  "prefers-reduced-motion: reduce",
  "collageCoverLeftOpen",
  "collageCoverRightOpen",
  "collageSheetLand",
  "collageStickerDrop",
  "collageClipSettle",
]) {
  if (!styles.includes(marker)) throw new Error(`missing garden motion marker: ${marker}`);
}

for (const rejectedV3 of ["garden-gate-world", "garden-door-v2", "garden-light-rays", "garden-journal-sheet"]) {
  if (screen.includes(rejectedV3) || styles.includes(rejectedV3)) throw new Error(`superseded garden login marker remains: ${rejectedV3}`);
}

for (const rejectedV1 of ["garden-landscape", "gardenHillBack", "garden-stem-sway-left", "garden-door::before"]) {
  if (screen.includes(rejectedV1) || styles.includes(rejectedV1)) throw new Error(`rejected V1 marker remains: ${rejectedV1}`);
}

for (const oldCopy of ["HUĀHUĀ · MVP", "初次见面", "给你的花园", "短短信笺", "留个地址吧"]) {
  if (screen.includes(oldCopy)) throw new Error(`old login content remains: ${oldCopy}`);
}

console.log("GARDEN_GATE_LOGIN_OK");
