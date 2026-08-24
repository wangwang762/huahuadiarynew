const fs = require("fs");

const weather = fs.readFileSync("weather-service.js", "utf8");
const home = fs.readFileSync("screens-home.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");
const build = fs.readFileSync("scripts/build-cloudbase.mjs", "utf8");

for (const marker of ["navigator.geolocation", "api.open-meteo.com", "reverse-geocode-client", "currentLabel", "refresh: () => load(true)"]) {
  if (!weather.includes(marker)) throw new Error(`missing live weather marker: ${marker}`);
}
if (!home.includes("HHWeather.load()") || !home.includes("liveWeather.city")) throw new Error("home does not consume live weather");
if (!html.includes("weather-service.js?v=20260823a")) throw new Error("weather service is not loaded");
if (!build.includes('"weather-service.js"')) throw new Error("weather service is not included in production bundle");

console.log("LIVE_WEATHER_OK");
