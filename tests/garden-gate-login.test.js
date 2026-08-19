const fs = require("fs");

const screen = fs.readFileSync("screens-email.jsx", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const marker of [
  "function GardenGateScene",
  "garden-gate-world",
  "garden-midground",
  "garden-journal-sheet",
  "assets/plants/final-v1/guibeizhu.png",
  "assets/plants/final-v1/hudielan.png",
  "assets/plants/final-v1/xiuqiuhua.png",
  "登录花花日记本",
  "用邮箱保存并找回你的花园",
  "输入邮箱验证码",
  "garden-light-rays",
  "garden-leaf-shadow",
  "garden-dust",
  "garden-paper-date",
  "garden-line-field",
  "garden-ink-button",
  "garden-otp-line",
]) {
  if (!screen.includes(marker)) throw new Error(`missing garden login marker: ${marker}`);
}

for (const marker of [
  "perspective:",
  "rotateY",
  "garden-gate-light",
  "garden-foreground",
  "garden-paper-reveal",
  "prefers-reduced-motion: reduce",
  "gardenLightBreathe",
  "gardenLeafShadowDrift",
  "gardenDustRise",
  ".garden-journal-sheet {",
]) {
  if (!styles.includes(marker)) throw new Error(`missing garden motion marker: ${marker}`);
}

for (const rejectedV2 of ["border-radius: 3px 17px 14px 5px", "box-shadow: 0 22px 42px"]) {
  if (styles.includes(rejectedV2)) throw new Error(`rejected V2 card treatment remains: ${rejectedV2}`);
}

if (screen.includes("borderRadius: 10")) throw new Error("rounded OTP boxes remain");

for (const rejectedV1 of ["garden-landscape", "gardenHillBack", "garden-stem-sway-left", "garden-door::before"]) {
  if (screen.includes(rejectedV1) || styles.includes(rejectedV1)) throw new Error(`rejected V1 marker remains: ${rejectedV1}`);
}

for (const oldCopy of ["HUĀHUĀ · MVP", "初次见面", "给你的花园", "短短信笺", "留个地址吧"]) {
  if (screen.includes(oldCopy)) throw new Error(`old login content remains: ${oldCopy}`);
}

console.log("GARDEN_GATE_LOGIN_OK");
