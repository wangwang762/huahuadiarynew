const fs = require("fs");

const app = fs.readFileSync("app.jsx", "utf8");
const home = fs.readFileSync("screens-home.jsx", "utf8");
const account = fs.readFileSync("screens-account.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");

for (const marker of ["onAccount={onAccount}", 'aria-label="账号管理"']) if (!home.includes(marker)) throw new Error(`account entry missing: ${marker}`);
if (home.indexOf("shownWeather") > home.indexOf('aria-label="账号管理"')) throw new Error("weather should sit beside the city, before account management");
for (const marker of ["window.HHAccount.signOut()", 'setStack([{ view: "email", playIntro: false }])', "<AccountScreen"]) if (!app.includes(marker)) throw new Error(`account route missing: ${marker}`);
for (const marker of ["function openAccount()", "account && !account.guest", 'setStack([{ view: "email", playIntro: false }])']) if (!app.includes(marker)) throw new Error(`guest account routing missing: ${marker}`);
if (app.includes("window.location.replace(loginEntry)")) throw new Error("guest login must open in-app instead of hard reloading on iOS");
for (const marker of ["window.HHData.migrateGuestGarden(result.account)", "migratedCount"]) {
  const source = marker === "migratedCount" ? fs.readFileSync("data-service.js", "utf8") : app;
  if (!source.includes(marker)) throw new Error(`guest migration missing: ${marker}`);
}
for (const marker of ["window.location.pathname", "?signedout=", "window.location.replace(cleanEntry)"]) if (!app.includes(marker)) throw new Error(`fresh login reload missing: ${marker}`);
for (const marker of ["账号管理", "手机号", "备用邮箱", "只有完成绑定后", "退出登录", "确认退出", "退出登录不会删除", 'role="dialog"']) if (!account.includes(marker)) throw new Error(`account screen missing: ${marker}`);
if (!html.includes("screens-account.jsx")) throw new Error("account screen is not loaded");

console.log("ACCOUNT_MANAGEMENT_FLOW_OK");
