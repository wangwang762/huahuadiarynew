const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const screen = fs.readFileSync("screens-email.jsx", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");

for (const marker of [
  "LOGIN_INTRO_KEY",
  "window.sessionStorage.getItem",
  "window.sessionStorage.setItem",
  "shouldPlayLoginIntro()",
  'setStack([{ view: "email", playIntro: false }])',
  "playIntro={!!top.playIntro}",
]) {
  if (!app.includes(marker)) throw new Error(`missing login intro behavior: ${marker}`);
}

for (const marker of ["playIntro = true", "instant={!playIntro}", 'is-instant']) {
  if (!screen.includes(marker) && !styles.includes(marker)) throw new Error(`missing instant login state: ${marker}`);
}

if (!styles.includes(".collage-login-stage.is-instant .collage-cover")) throw new Error("instant login still renders opening covers");
console.log("LOGIN_INTRO_ONCE_OK");
