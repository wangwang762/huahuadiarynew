import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import sharp from "sharp";

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
  "doctor-config.js",
  "doctor-service.js",
  "report-export.js",
  "components.jsx",
  "screens-email.jsx",
  "screens-home.jsx",
  "screens-plant.jsx",
  "screens-capture.jsx",
  "screens-onboard.jsx",
  "screens-chat.jsx",
  "screens-doctor.jsx",
  "screens-profile.jsx",
  "screens-account.jsx",
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
  "assets/garden-scene-airy-v1.jpg",
  "assets/garden-scene-airy-cloudy-v1.jpg",
  "assets/garden-scene-airy-rain-v1.jpg",
  "assets/garden-scene-dawn-v1.jpg",
  "assets/garden-scene-dawn-cloudy-v1.jpg",
  "assets/garden-scene-dawn-rain-v1.jpg",
  "assets/garden-scene-warm-v1.jpg",
  "assets/garden-scene-warm-cloudy-v1.jpg",
  "assets/garden-scene-warm-rain-v1.jpg",
  "assets/garden-scene-night-v1.jpg",
  "assets/garden-scene-night-cloudy-v1.jpg",
  "assets/garden-scene-night-rain-v1.jpg",
  "assets/garden-scene-window-v1.jpg",
  "assets/garden-wall-sunny-v3.webp",
  "assets/garden-wall-cloudy-v3.webp",
  "assets/garden-wall-rainy-v4.webp",
  "assets/garden-wall-v1.webp",
  "assets/garden-chair-v1.webp",
  "assets/garden-print-v1.webp",
  "assets/plants/zhaozhao-cutout-v2.png",
  "assets/plants/generated/diaolan.png",
  "assets/plants/generated/hupilan.png",
  "assets/plants/generated/facaishu-v2.png",
  "assets/plants/generated/hudielan.png",
  "fonts/DdmcSans-Bold.otf",
  "fonts/DdmcSans-Medium.otf",
];

function copy(relativePath) {
  const source = path.join(root, relativePath);
  const destination = path.join(output, relativePath);
  if (!fs.existsSync(source)) throw new Error(`Missing build input: ${relativePath}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

async function compileJsx(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const destinationPath = relativePath.replace(/\.jsx$/, ".js");
  const destination = path.join(output, destinationPath);
  const result = await transform(source, {
    loader: "jsx",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    target: "es2019",
    minify: true,
    legalComments: "none"
  });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, result.code);
}

async function copyWebp(relativePath) {
  const destinationPath = relativePath.replace(/\.png$/i, ".webp");
  const destination = path.join(output, destinationPath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  await sharp(path.join(root, relativePath))
    .webp({ quality: 82, alphaQuality: 90, effort: 5 })
    .toFile(destination);
  return [relativePath, destinationPath];
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of runtimeFiles.filter(file => !file.endsWith(".jsx"))) copy(file);
for (const file of runtimeFiles.filter(file => file.endsWith(".jsx"))) await compileJsx(file);

const pngAssets = [
  ...extraAssets.filter(file => file.endsWith(".png")),
  ...plantSlugs.map(slug => `assets/plants/final-v1/${slug}.png`)
];
const assetMappings = await Promise.all(pngAssets.map(copyWebp));
for (const file of extraAssets.filter(file => !file.endsWith(".png"))) copy(file);

fs.mkdirSync(path.join(output, "vendor"), { recursive: true });
fs.copyFileSync(
  path.join(root, "node_modules/react/umd/react.production.min.js"),
  path.join(output, "vendor/react.production.min.js")
);
fs.copyFileSync(
  path.join(root, "node_modules/react-dom/umd/react-dom.production.min.js"),
  path.join(output, "vendor/react-dom.production.min.js")
);

for (const relativePath of runtimeFiles) {
  const builtPath = relativePath.replace(/\.jsx$/, ".js");
  const destination = path.join(output, builtPath);
  let content = fs.readFileSync(destination, "utf8");
  for (const [pngPath, webpPath] of assetMappings) content = content.replaceAll(pngPath, webpPath);
  fs.writeFileSync(destination, content);
}

const sourceHtml = fs.readFileSync(path.join(root, "花花日记本.html"), "utf8");
const buildTimestamp = Date.now();
const deployHtml = sourceHtml
  .replace("<title>花花日记本 · Demo</title>", "<title>花花日记本</title>")
  .replace(/styles\.css\?v=[^"']+/g, `styles.css?v=${buildTimestamp}`)
  .replace(
    "https://unpkg.com/react@18.3.1/umd/react.development.js",
    "vendor/react.production.min.js"
  )
  .replace(
    "https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js",
    "vendor/react-dom.production.min.js"
  )
  .replace(/^\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^\n]+<\/script>\s*$/m, "")
  .replace(/<script type="text\/babel" src="([^"]+)\.jsx(\?[^\"]*)?"><\/script>/g, '<script src="$1.js$2"></script>')
  .replace(/(<script src="(?!https?:\/\/)[^"?]+\.js)(?:\?[^\"]*)?("[^>]*><\/script>)/g, `$1?v=${buildTimestamp}$2`)
  .replace(/ integrity="sha384-[^"]+"/g, "")
  .replaceAll(' crossorigin="anonymous"', "");

fs.writeFileSync(path.join(output, "index.html"), deployHtml);
console.log(`CloudBase bundle created at ${path.relative(root, output)}`);
