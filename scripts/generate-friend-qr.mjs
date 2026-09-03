import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import jsQR from "jsqr";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const outputDir = path.join(projectDir, "assets", "share");
const svgPath = path.join(outputDir, "huahua-diary-friend-qr.svg");
const pngPath = path.join(outputDir, "huahua-diary-friend-qr.png");
const targetUrl = "https://huahuadiary-d4gajnlumc8432f6c-1322727508.tcloudbaseapp.com/?v=20260903-account";

const qr = QRCode.create(targetUrl, { errorCorrectionLevel: "M" });
const quietModules = 4;
const moduleSize = 10;
const qrSize = (qr.modules.size + quietModules * 2) * moduleSize;
const qrX = (1080 - qrSize) / 2;
const qrY = 340;
const qrRects = [];

for (let row = 0; row < qr.modules.size; row += 1) {
  for (let col = 0; col < qr.modules.size; col += 1) {
    if (qr.modules.get(row, col)) {
      qrRects.push(`<rect x="${qrX + (col + quietModules) * moduleSize}" y="${qrY + (row + quietModules) * moduleSize}" width="${moduleSize}" height="${moduleSize}"/>`);
    }
  }
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <filter id="paper" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="8" result="noise"/><feColorMatrix in="noise" type="saturate" values="0" result="gray"/><feComponentTransfer in="gray" result="softNoise"><feFuncA type="table" tableValues="0 0.035"/></feComponentTransfer><feBlend in="SourceGraphic" in2="softNoise" mode="multiply"/></filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#5a4631" flood-opacity="0.16"/></filter>
    <linearGradient id="backdrop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efe2cc"/><stop offset="1" stop-color="#d9c3a3"/></linearGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="#b78e60" opacity="0.12"/></pattern>
  </defs>
  <rect width="1080" height="1350" fill="url(#backdrop)"/><rect width="1080" height="1350" fill="url(#dots)"/>
  <g filter="url(#shadow)"><rect x="90" y="70" width="900" height="1210" rx="42" fill="#fbf7ea"/><rect x="90" y="70" width="900" height="1210" rx="42" fill="#fbf7ea" filter="url(#paper)"/></g>
  <line x1="164" y1="70" x2="164" y2="1280" stroke="#d99a92" stroke-width="2" opacity="0.35"/>
  <g stroke="#a7b1a0" stroke-width="1" opacity="0.18"><line x1="90" y1="205" x2="990" y2="205"/><line x1="90" y1="270" x2="990" y2="270"/><line x1="90" y1="1080" x2="990" y2="1080"/><line x1="90" y1="1145" x2="990" y2="1145"/></g>
  <g font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif" text-anchor="middle"><text x="540" y="150" font-size="24" font-weight="600" letter-spacing="8" fill="#597064">HUĀHUĀ FIELD NOTES</text><text x="540" y="235" font-size="58" font-weight="700" fill="#1f2922">花花日记本</text><text x="540" y="287" font-size="28" fill="#7d766b">给你的植物开一本日记</text></g>
  <g transform="translate(820 120) rotate(9)"><circle cx="0" cy="0" r="62" fill="none" stroke="#bc7469" stroke-width="4" opacity="0.68"/><circle cx="0" cy="0" r="50" fill="none" stroke="#bc7469" stroke-width="2" stroke-dasharray="7 7" opacity="0.62"/><path d="M0 20 C-18 4 -20 -18 0 -34 C20 -18 18 4 0 20 M0 -3 C-18 -12 -30 -2 -31 17 M0 -3 C18 -12 30 -2 31 17 M0 20 L0 42" fill="none" stroke="#bc7469" stroke-width="4" stroke-linecap="round"/></g>
  <rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" rx="28" fill="#fffdf8" filter="url(#shadow)"/>
  <g fill="#1f5a43" shape-rendering="crispEdges">${qrRects.join("")}</g>
  <g font-family="PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif" text-anchor="middle"><text x="540" y="970" font-size="35" font-weight="650" fill="#235842">建议用 Safari 打开</text><text x="540" y="1030" font-size="26" fill="#7c7569">打开后点击分享 → 添加到主屏幕</text></g>
  <g transform="translate(540 1165)" fill="none" stroke="#597064" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M-42 18 C-64 -9 -48 -46 -10 -52 C17 -56 38 -41 42 -18 C47 11 24 37 -8 42 C-22 44 -35 34 -42 18Z"/><path d="M-18 15 C-6 2 11 -12 30 -28"/><path d="M-4 2 C-7 -16 -2 -28 11 -39"/></g>
  <text x="540" y="1250" font-family="PingFang SC, Hiragino Sans GB, sans-serif" font-size="20" text-anchor="middle" letter-spacing="4" fill="#9a9184">HUĀHUĀ DIARY · 2026</text>
</svg>`;

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(svgPath, svg, "utf8");
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(pngPath);

const qrCrop = await sharp(pngPath).extract({ left: Math.floor(qrX), top: qrY, width: qrSize, height: qrSize }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const decoded = jsQR(new Uint8ClampedArray(qrCrop.data), qrCrop.info.width, qrCrop.info.height);
if (!decoded || decoded.data !== targetUrl) throw new Error(`QR verification failed: ${decoded?.data ?? "no QR detected"}`);
console.log(`Created ${path.relative(projectDir, svgPath)}`);
console.log(`Created ${path.relative(projectDir, pngPath)}`);
console.log(`Verified QR payload: ${decoded.data}`);
