# Plant Diary Personality and Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make photo records produce personality-aware plant reactions, capture a real first-meeting photo, improve the sticky plant header, build reports from real photos, save reports as PNG files, and simplify personality editing.

**Architecture:** Keep Alibaba triage responsible for health and trend only, then derive plant voice locally with deterministic authored templates. Store real first-meeting and observation images in existing diary `photoData`, derive report photos from those entries, and isolate PNG generation/share fallback in a small browser service. Preserve existing `custom` data for compatibility while removing its ineffective editor.

**Tech Stack:** React 18 UMD + Babel JSX, browser Canvas/File/Web Share APIs, existing CloudBase data service, Node source-marker tests.

**Spec:** `docs/plans/2026-08-28-plant-diary-personality-report-design.md`

## Global Constraints

- Do not add another AI request for plant voice generation.
- Do not add npm runtime dependencies.
- Keep existing CloudBase row shapes backward-compatible.
- Use existing theme tokens and plant avatar assets.
- Preserve unrelated modified and untracked user files.
- Treat local test/build success separately from public CloudBase deployment.

---

### Task 1: Personality-aware observation voice

**Files:**
- Modify: `data.js:165-181,505-545`
- Modify: `screens-capture.jsx:96-125`
- Create: `tests/plant-observation-voice.test.js`

**Interfaces:**
- Consumes: `plant.tagsOn: string[]`, triage `{ health, trend, observations }`, and `plant.diary.length`.
- Produces: `window.observationVoice(plant, triage): string`.

- [ ] **Step 1: Write the failing source-contract test**

```js
const fs = require("fs");
const data = fs.readFileSync("data.js", "utf8");
const capture = fs.readFileSync("screens-capture.jsx", "utf8");

for (const marker of ["window.observationVoice", 'health === "sick"', 'trend === "better"', "tagsOn"]) {
  if (!data.includes(marker)) throw new Error(`missing personality voice marker: ${marker}`);
}
if (!capture.includes("window.observationVoice(p, result)")) throw new Error("capture does not generate a state-aware voice");
if (capture.includes("setVoice(p.voice)")) throw new Error("capture still reuses the first-meeting voice");
console.log("PLANT_OBSERVATION_VOICE_OK");
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node tests/plant-observation-voice.test.js`  
Expected: FAIL with `missing personality voice marker`.

- [ ] **Step 3: Implement deterministic local voice templates**

Add a helper in `data.js` that chooses tone from selected tags and status from triage, then rotates authored alternatives by diary length:

```js
window.observationVoice = function observationVoice(plant, triage) {
  const tags = plant.tagsOn || [];
  const tone = tags.includes("傲娇") || tags.includes("嘴硬心软") ? "tsundere"
    : tags.includes("活泼") || tags.includes("乐观") ? "bright"
    : tags.includes("温柔") || tags.includes("撒娇") ? "soft" : "calm";
  const state = triage.health === "sick" || triage.trend === "worse" ? "sick"
    : triage.trend === "better" ? "better"
    : triage.health === "good" ? "good" : "watch";
  const lines = OBSERVATION_VOICE_LINES[tone][state];
  return lines[(plant.diary || []).length % lines.length].replaceAll("{name}", plant.name || "我");
};
```

Use four tone groups and at least three alternatives for `sick`, `better`, `good`, and `watch`. In `screens-capture.jsx`, assign `const stateVoice = window.observationVoice(p, result)` after triage and persist `voice: stateVoice` in the record entry. Service errors use a neutral authored line and never claim good health.

- [ ] **Step 4: Run focused and full tests**

Run: `node tests/plant-observation-voice.test.js && npm test`  
Expected: `PLANT_OBSERVATION_VOICE_OK` followed by the full passing suite.

- [ ] **Step 5: Commit**

```bash
git add data.js screens-capture.jsx tests/plant-observation-voice.test.js
git commit -m "feat: vary plant reactions by photo condition"
```

---

### Task 2: Real first-meeting photo with skip and later refill

**Files:**
- Modify: `screens-onboard.jsx:6-65,321-370`
- Modify: `screens-diary.jsx:4-142`
- Modify: `screens-plant.jsx:1-55,142-151`
- Create: `tests/first-meeting-photo.test.js`

**Interfaces:**
- Produces: first diary entry with `photoData: string`, `observedAt: string`, and `photo: string | null`.
- Reuses: `PlantDiary.openCamera()` and `go("capture", plant, { image })` for later refill.

- [ ] **Step 1: Write the failing flow test**

```js
const fs = require("fs");
const onboard = fs.readFileSync("screens-onboard.jsx", "utf8");
const diary = fs.readFileSync("screens-diary.jsx", "utf8");
for (const marker of ['capture="environment"', "firstPhoto", "拍下第一张照片", "暂时跳过"]) {
  if (!onboard.includes(marker)) throw new Error(`missing first-photo marker: ${marker}`);
}
if (!diary.includes("补拍第一张")) throw new Error("empty first meeting does not invite refill");
console.log("FIRST_MEETING_PHOTO_OK");
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node tests/first-meeting-photo.test.js`  
Expected: FAIL with `missing first-photo marker`.

- [ ] **Step 3: Capture or skip on the reveal screen**

Add `firstPhoto` state to `Onboard`, pass it into `buildPlant(firstLine, firstPhoto)`, and make the born entry use real image data only:

```js
photo: firstPhoto ? `${runId}-first-photo` : null,
photoData: firstPhoto || "",
observedAt: firstPhoto ? new Date().toISOString() : "",
```

In `ObReveal`, add a hidden file input with `accept="image/*" capture="environment"`, a primary `拍下第一张照片` action, a `暂时跳过` action, and a preview after successful reading. Reuse the current FileReader validation copy.

- [ ] **Step 4: Make the empty born-photo tile actionable**

Pass `onAddPhoto` into `DiaryTimeline`. When `d.type === "born" && !d.photoData`, render the existing hand-written empty polaroid with text `补拍第一张`; clicking it calls `PlantDiary.openCamera()`. A selected photo continues into `CaptureFlow`, ensuring it is analyzed and saved as the next valid comparison baseline.

- [ ] **Step 5: Run focused and full tests**

Run: `node tests/first-meeting-photo.test.js && npm test`  
Expected: `FIRST_MEETING_PHOTO_OK` and all tests pass.

- [ ] **Step 6: Commit**

```bash
git add screens-onboard.jsx screens-diary.jsx screens-plant.jsx tests/first-meeting-photo.test.js
git commit -m "feat: capture the first real plant photo"
```

---

### Task 3: Sticky plant-name navigation

**Files:**
- Modify: `screens-plant.jsx:4-70`
- Create: `tests/plant-diary-sticky-nav.test.js`

**Interfaces:**
- Consumes: the existing `PlantDiary` scroll container and `plant.name`.
- Produces: `compactNav: boolean` driven by scroll position.

- [ ] **Step 1: Write the failing sticky-nav test**

```js
const fs = require("fs");
const source = fs.readFileSync("screens-plant.jsx", "utf8");
for (const marker of ["compactNav", "onScroll", 'position: "sticky"', "p.name"]) {
  if (!source.includes(marker)) throw new Error(`missing sticky nav marker: ${marker}`);
}
console.log("PLANT_DIARY_STICKY_NAV_OK");
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node tests/plant-diary-sticky-nav.test.js`  
Expected: FAIL with `missing sticky nav marker`.

- [ ] **Step 3: Implement the compact header transition**

Track `compactNav` from the scroll container:

```jsx
onScroll={event => setCompactNav(event.currentTarget.scrollTop > 118)}
```

Change the existing nav to `position: "sticky", top: 0, zIndex: 20`; keep the back and report actions. Use the center slot for `compactNav ? p.name : "日记本"`, with an opacity/translate transition and existing glass/paper tokens. Add top safe-area padding and ensure the content does not jump when the name changes.

- [ ] **Step 4: Run tests and build**

Run: `node tests/plant-diary-sticky-nav.test.js && npm test && npm run build`  
Expected: focused test, full suite, and CloudBase build pass.

- [ ] **Step 5: Commit**

```bash
git add screens-plant.jsx tests/plant-diary-sticky-nav.test.js
git commit -m "feat: pin plant name while reading the diary"
```

---

### Task 4: Growth report from real diary photos

**Files:**
- Modify: `screens-diary.jsx:175-235,283-360`
- Modify: `screens-plant.jsx:118-125`
- Create: `tests/growth-report-photos.test.js`

**Interfaces:**
- Produces: `window.reportPhotos(plant): Array<{ id, src, day, date }>`.
- `AlbumGrid` consumes only this returned array; no synthetic total or repeated fallback source.

- [ ] **Step 1: Write the failing report-photo test**

```js
const fs = require("fs");
const source = fs.readFileSync("screens-diary.jsx", "utf8");
for (const marker of ["window.reportPhotos", "d.photoData", "photos.length === 1", "photos.length === 2"]) {
  if (!source.includes(marker)) throw new Error(`missing real report photo marker: ${marker}`);
}
for (const stale of ["i % shots.length", "Math.max(base", "第一张可比较的观察照片"]) {
  if (source.includes(stale)) throw new Error(`report still synthesizes photos: ${stale}`);
}
console.log("GROWTH_REPORT_PHOTOS_OK");
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node tests/growth-report-photos.test.js`  
Expected: FAIL with `missing real report photo marker`.

- [ ] **Step 3: Derive and deduplicate real photo sources**

Implement newest-first extraction:

```js
window.reportPhotos = function reportPhotos(plant) {
  const seen = new Set();
  return (plant.diary || []).flatMap(entry => {
    const src = entry.photoData || (entry.photo ? window.photoFor(entry.photo) : "");
    if (!src || seen.has(src)) return [];
    seen.add(src);
    return [{ id: entry.id, src, day: entry.day, date: entry.date }];
  });
};
```

Render one image as a single wide hero, two as a 2:1 hero/side pair, and three or more as the current one-large/two-small composition. Remove generated `+N`, fake day counts, and placeholders. If `reportPhotos(p).length === 0`, the report button opens the camera rather than the report modal.

- [ ] **Step 4: Run focused and full tests**

Run: `node tests/growth-report-photos.test.js && npm test`  
Expected: `GROWTH_REPORT_PHOTOS_OK` and all tests pass.

- [ ] **Step 5: Commit**

```bash
git add screens-diary.jsx screens-plant.jsx tests/growth-report-photos.test.js
git commit -m "feat: build growth reports from real photos"
```

---

### Task 5: Save the growth report as PNG

**Files:**
- Create: `report-export.js`
- Modify: `花花日记本.html:35-70`
- Modify: `scripts/build-cloudbase.mjs:8-36`
- Modify: `screens-diary.jsx:144-175`
- Create: `tests/report-save.test.js`

**Interfaces:**
- Produces: `window.HHReport.prepare({ plant, report, photos }): Promise<{ blob, file }>` and `window.HHReport.save(prepared): Promise<{ method: "share" | "download" | "cancel" }>`.
- Consumes: actual report copy and `window.reportPhotos(plant)`.

- [ ] **Step 1: Write the failing save-path test**

```js
const fs = require("fs");
const exporter = fs.readFileSync("report-export.js", "utf8");
const screen = fs.readFileSync("screens-diary.jsx", "utf8");
for (const marker of ["HHReport.prepare", "canvas.toBlob", "navigator.canShare", "navigator.share", "anchor.download"]) {
  if (!exporter.includes(marker)) throw new Error(`missing report save fallback: ${marker}`);
}
if (!screen.includes("保存小报")) throw new Error("report button copy was not updated");
console.log("REPORT_SAVE_OK");
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node tests/report-save.test.js`  
Expected: FAIL because `report-export.js` does not exist.

- [ ] **Step 3: Implement dependency-free Canvas export**

Create `report-export.js` with image loading, paper background, masthead, headline, 1/2/3-photo layouts, stats, and stamp drawn at 2× resolution. `prepare` loads only data URLs and same-origin assets, skips any source that would taint Canvas, and converts with:

```js
const blob = await new Promise((resolve, reject) =>
  canvas.toBlob(value => value ? resolve(value) : reject(new Error("小报图片没有生成成功")), "image/png")
);
const file = new File([blob], `${safeName}-花花小报.png`, { type: "image/png" });
return { blob, file };
```

`save` receives the already prepared file so that its call to the native share sheet remains inside the user's tap activation:

```js
if (navigator.canShare && navigator.canShare({ files: [file] })) {
  try { await navigator.share({ files: [file], title: `${plant.name}的花花小报` }); return { method: "share" }; }
  catch (error) { if (error && error.name === "AbortError") return { method: "cancel" }; }
}
const anchor = document.createElement("a");
anchor.href = URL.createObjectURL(blob);
anchor.download = file.name;
anchor.click();
setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
return { method: "download" };
```

Load the service before JSX screens and include it in `runtimeFiles`.

- [ ] **Step 4: Wire progress, success, cancel, and error states**

In `GrowthReport`, add `preparedReport`, `saving`, and `saveError`. Start `window.HHReport.prepare(...)` when the report opens; while preparation is pending, disable the button and show `正在生成小报…`. Once ready, show `保存小报`; the tap calls only `save(preparedReport)`. Cancellation returns to `保存小报` without error. Download fallback displays `图片已下载；如浏览器打开预览，可长按存入相册`.

- [ ] **Step 5: Run focused tests and build**

Run: `node tests/report-save.test.js && npm test && npm run build`  
Expected: focused test, full suite, and CloudBase bundle pass; `dist/cloudbase/report-export.js` exists.

- [ ] **Step 6: Commit**

```bash
git add report-export.js 花花日记本.html scripts/build-cloudbase.mjs screens-diary.jsx tests/report-save.test.js
git commit -m "feat: save growth reports as images"
```

---

### Task 6: Stable and simplified personality editor

**Files:**
- Modify: `screens-profile.jsx:4-126`
- Create: `tests/profile-personality-editor.test.js`

**Interfaces:**
- Consumes: `plant.tagsOn`, `plant.tagsOff`, and existing `plant.custom`.
- Produces: saved plant with reordered `tagsOn`/`tagsOff` while passing `custom` through unchanged.

- [ ] **Step 1: Write the failing editor test**

```js
const fs = require("fs");
const source = fs.readFileSync("screens-profile.jsx", "utf8");
for (const marker of ["tagOrder", "selectedTags", "tagOrder.map", "custom: p.custom"]) {
  if (!source.includes(marker)) throw new Error(`missing stable tag editor marker: ${marker}`);
}
for (const stale of ["轻点标签修改", "它现在大概会这样说话", "自定义补充描述", "setCustom"]) {
  if (source.includes(stale)) throw new Error(`stale profile module remains: ${stale}`);
}
console.log("PROFILE_PERSONALITY_EDITOR_OK");
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node tests/profile-personality-editor.test.js`  
Expected: FAIL with `missing stable tag editor marker`.

- [ ] **Step 3: Render one stable tag order**

Initialize once:

```js
const [tagOrder] = useState(() => [...p.tagsOn, ...p.tagsOff]);
const [selectedTags, setSelectedTags] = useState(() => new Set(p.tagsOn));
```

Toggle by cloning the Set; render `tagOrder.map(tag => ...)`, changing only visual state and check/plus icon. On save derive `tagsOn` and `tagsOff` from `tagOrder`, and keep `custom: p.custom` unchanged. Remove the green hint/arrow, custom input, and voice preview blocks.

- [ ] **Step 4: Run focused and full tests**

Run: `node tests/profile-personality-editor.test.js && npm test && npm run build`  
Expected: focused test, full suite, and build pass.

- [ ] **Step 5: Commit**

```bash
git add screens-profile.jsx tests/profile-personality-editor.test.js
git commit -m "feat: simplify personality editing"
```

---

### Task 7: Integrated mobile verification

**Files:**
- Verify: `花花日记本.html`
- Verify: `dist/cloudbase/index.html`
- Verify: all files changed in Tasks 1-6

**Interfaces:**
- Consumes all completed task interfaces.
- Produces a locally verified CloudBase bundle; public deployment remains a separate acceptance step.

- [ ] **Step 1: Run all automated checks**

Run: `npm test && npm run build`  
Expected: all named tests pass and `CloudBase bundle created at dist/cloudbase`.

- [ ] **Step 2: Verify the mobile paths in a local browser**

Check at 390×844 and one narrower viewport:

1. Add a plant, take or skip the first photo, and refill an empty first-meeting card.
2. Record sick, better, and stable fixture responses; confirm distinct personality-aware lines.
3. Scroll the plant diary; confirm the plant name sticks without hiding content.
4. Open reports with one, two, and three stored photos; confirm no empty image slots.
5. Tap `保存小报`; confirm native file share when available and download fallback otherwise.
6. Toggle profile tags repeatedly; confirm no immediate reordering and all removed modules stay absent.

- [ ] **Step 3: Inspect browser errors**

Expected: no uncaught React, image loading, Canvas taint, Web Share, or FileReader errors. User-cancelled sharing must not display an error.

- [ ] **Step 4: Report status honestly**

Run `git status --short` and inspect every final diff. Do not stage unrelated files. If verification required corrections, list each corrected path explicitly before staging it; otherwise create no extra verification commit. Report the result as `本地验证通过`; do not call it publicly released until the CloudBase deployment and phone acceptance are completed.
