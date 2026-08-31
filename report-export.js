(function () {
  function safeName(value) {
    return String(value || "花花").replace(/[\\/:*?"<>|]/g, "-").slice(0, 32);
  }

  function isCanvasSafeSource(src) {
    if (/^data:image\//.test(src) || /^blob:/.test(src)) return true;
    try { return new URL(src, window.location.href).origin === window.location.origin; }
    catch (_) { return false; }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("小报中的照片没有载入"));
      image.src = src;
    });
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function drawCover(ctx, image, x, y, width, height) {
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    ctx.save();
    roundedRect(ctx, x, y, width, height, 14);
    ctx.clip();
    ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  function drawPhotos(ctx, loaded) {
    const gap = 12;
    if (loaded.length === 1) {
      drawCover(ctx, loaded[0], 56, 284, 608, 326);
      return;
    }
    if (loaded.length === 2) {
      drawCover(ctx, loaded[0], 56, 284, 398, 326);
      drawCover(ctx, loaded[1], 454 + gap, 284, 198, 326);
      return;
    }
    drawCover(ctx, loaded[0], 56, 284, 398, 326);
    drawCover(ctx, loaded[1], 466, 284, 198, 157);
    drawCover(ctx, loaded[2], 466, 453, 198, 157);
  }

  async function prepare({ plant, report, photos }) {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前浏览器不能生成小报图片");

    const safePhotos = (photos || []).filter(photo => photo && isCanvasSafeSource(photo.src)).slice(0, 3);
    const loaded = [];
    for (const photo of safePhotos) {
      try { loaded.push(await loadImage(photo.src)); } catch (_) { /* keep the remaining real photos */ }
    }
    if (!loaded.length) throw new Error("还没有可以放进小报的照片");

    ctx.fillStyle = "#FBF5E9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(104,76,43,.06)";
    for (let y = 18; y < 900; y += 22) for (let x = 14; x < 720; x += 24) ctx.fillRect(x, y, 2, 2);

    ctx.fillStyle = "#25241F";
    ctx.font = "700 25px serif";
    ctx.fillText("花花日报 · 号外", 56, 70);
    ctx.textAlign = "right";
    ctx.font = "500 20px sans-serif";
    ctx.fillStyle = "#726B60";
    ctx.fillText(`第 ${plant.days || 1} 期`, 664, 69);
    ctx.textAlign = "left";
    ctx.fillStyle = "#25241F";
    ctx.fillRect(56, 92, 608, 4);
    ctx.fillRect(56, 103, 608, 1);

    ctx.fillStyle = plant.deep || "#245B45";
    ctx.font = "700 20px sans-serif";
    ctx.fillText((report && report.copy && report.copy.kicker) || `一株${plant.species || "植物"}的成长记`, 56, 150);
    ctx.fillStyle = "#25241F";
    ctx.font = "700 52px serif";
    const headline = report && report.copy && report.copy.headline;
    ctx.fillText(Array.isArray(headline) ? headline.join("") : `「我是${plant.name}」`, 56, 224);

    drawPhotos(ctx, loaded);

    ctx.fillStyle = "rgba(65,58,48,.24)";
    ctx.fillRect(56, 646, 608, 2);
    ctx.fillStyle = "#3A352E";
    ctx.font = "500 23px serif";
    ctx.fillText(`陪伴 ${plant.days || 1} 天 · 收录 ${photos.length} 张 · 日记 ${(plant.diary || []).length} 篇`, 56, 700);
    ctx.fillStyle = "#6D665C";
    ctx.font = "500 18px sans-serif";
    ctx.fillText(`花花日记本 · ${plant.name || "我的植物"}`, 56, 750);

    ctx.save();
    ctx.translate(575, 748);
    ctx.rotate(-0.12);
    ctx.strokeStyle = plant.accent || "#6C8B68";
    ctx.lineWidth = 4;
    roundedRect(ctx, -76, -38, 152, 76, 12);
    ctx.stroke();
    ctx.fillStyle = plant.deep || "#245B45";
    ctx.textAlign = "center";
    ctx.font = "700 23px serif";
    ctx.fillText((report && report.copy && report.copy.stamp) || "活力认证", 0, 0);
    ctx.font = "500 12px sans-serif";
    ctx.fillText("已 认 证", 0, 23);
    ctx.restore();

    const blob = await new Promise((resolve, reject) =>
      canvas.toBlob(value => value ? resolve(value) : reject(new Error("小报图片没有生成成功")), "image/png")
    );
    const file = new File([blob], `${safeName(plant.name)}-花花小报.png`, { type: "image/png" });
    return { blob, file };
  }

  async function save(prepared) {
    const { blob, file } = prepared || {};
    if (!blob || !file) throw new Error("小报还没有准备好");
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: file.name.replace(/\.png$/, "") });
        return { method: "share" };
      } catch (error) {
        if (error && error.name === "AbortError") return { method: "cancel" };
      }
    }
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = file.name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
    return { method: "download" };
  }

  window.HHReport = window.HHReport || {};
  window.HHReport.prepare = prepare;
  window.HHReport.save = save;
})();
