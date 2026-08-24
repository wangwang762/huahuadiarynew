import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist", "cloudbase");

const runtimeFiles = [
  "styles.css",
  "image-slot.js",
  "ios-frame.jsx",
  "cloudbase-config.js",
  "account-service.js",
  "weather-service.js",
  "data.js",
  "plant-photos.js",
  "plant-cutouts.js",
  "data-service.js",
  "doctor-service.js",
  "components.jsx",
  "screens-email.jsx",
  "screens-home.jsx",
  "screens-plant.jsx",
  "screens-capture.jsx",
  "screens-onboard.jsx",
  "screens-chat.jsx",
  "screens-doctor.jsx",
  "screens-profile.jsx",
  "screens-diary.jsx",
  "screens-garden.jsx",
  "tweaks-panel.jsx",
  "app.jsx"
];

const plantSlugs = [
  "lvluo",
  "guibeizhu",
  "diaolan",
  "facaishu",
  "fuguizhu",
  "xianrenzhang",
  "duorou",
  "hupilan",
  "luhui",
  "jinqianshu",
  "hudielan",
  "changshouhua",
  "yueji",
  "zhizihua",
  "molihua",
  "wenzhu",
  "baizhang",
  "hongzhang",
  "junzilan",
  "xiangrikui",
  "bohe",
  "xianrenqiu",
  "lanmeishu",
  "xiuqiuhua",
  "zhubai"
];

const extraAssets = [
  "assets/garden-wall-sunny-v3.webp",
  "assets/garden-wall-cloudy-v3.webp",
  "assets/garden-wall-rainy-v4.webp",
  "assets/garden-chair-v1.webp",
  "assets/garden-print-v1.webp",
  "assets/plants/zhaozhao-cutout-v2.png",
  "assets/plants/generated/diaolan.png",
  "assets/plants/generated/hupilan.png",
  "assets/plants/generated/facaishu-v2.png",
  "assets/plants/generated/hudielan.png",
  "fonts/DdmcSans-Bold.otf",
  "fonts/DdmcSans-Medium.otf",
  "vendor/react.development.js",
  "vendor/react-dom.development.js",
  "vendor/babel.min.js"
];

function copy(relativePath) {
  const source = path.join(root, relativePath);
  const destination = path.join(output, relativePath);
  if (!fs.existsSync(source)) throw new Error(`Missing build input: ${relativePath}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of runtimeFiles) copy(file);
for (const file of extraAssets) copy(file);
for (const slug of plantSlugs) copy(`assets/plants/final-v1/${slug}.png`);

const sourceHtml = fs.readFileSync(path.join(root, "花花日记本.html"), "utf8");
const deployHtml = sourceHtml
  .replace("<title>花花日记本 · Demo</title>", "<title>花花日记本</title>")
  .replace(
    "https://unpkg.com/react@18.3.1/umd/react.development.js",
    "vendor/react.development.js"
  )
  .replace(
    "https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js",
    "vendor/react-dom.development.js"
  )
  .replace(
    "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js",
    "vendor/babel.min.js"
  )
  .replaceAll(' crossorigin="anonymous"', "");

fs.writeFileSync(path.join(output, "index.html"), deployHtml);
console.log(`CloudBase bundle created at ${path.relative(root, output)}`);
