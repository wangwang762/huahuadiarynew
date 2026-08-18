const fs = require("fs");

const screen = fs.readFileSync("screens-email.jsx", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const marker of [
  "function GardenGateScene",
  "garden-gate-scene",
  "garden-login-form",
  "登录花花日记本",
  "用邮箱保存并找回你的花园",
  "输入邮箱验证码",
]) {
  if (!screen.includes(marker)) throw new Error(`missing garden login marker: ${marker}`);
}

for (const marker of [
  "garden-door-left",
  "garden-door-right",
  "garden-stem-sway",
  "prefers-reduced-motion: reduce",
]) {
  if (!styles.includes(marker)) throw new Error(`missing garden motion marker: ${marker}`);
}

for (const oldCopy of ["HUĀHUĀ · MVP", "初次见面", "给你的花园", "短短信笺", "留个地址吧"]) {
  if (screen.includes(oldCopy)) throw new Error(`old login content remains: ${oldCopy}`);
}

console.log("GARDEN_GATE_LOGIN_OK");
