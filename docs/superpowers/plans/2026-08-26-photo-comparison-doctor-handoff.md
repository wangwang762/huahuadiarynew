# Photo Comparison and Doctor Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every plant photo a persistent observation, compare it with the previous real photo, and let an abnormal observation carry its photo and context into a lightweight doctor consultation whose conclusion is written back to the same diary entry.

**Architecture:** `CaptureFlow` finds the previous comparable diary entry and sends both images to the existing Alibaba FC triage action. A record entry stores the compressed current snapshot and normalized comparison object before either returning to the diary or navigating to `DoctorChat`; `DoctorChat` updates that source entry with its diagnosis instead of adding a second disconnected entry. Existing standalone diagnosis entries remain readable.

**Tech Stack:** React 18 browser JSX, plain JavaScript services, localStorage guest persistence, CloudBase PostgreSQL JSON records, Alibaba Function Compute Node.js 16, DashScope `qwen3-vl-flash`, Node assertion tests, Playwright with installed Google Chrome.

**Spec:** `docs/plans/2026-08-26-photo-comparison-doctor-handoff-design.md`

## Global Constraints

- Record is the primary path; doctor consultation is an optional secondary path.
- Every successful capture must persist before leaving for the doctor.
- Compare only with the newest diary record that contains a valid `photoData` image.
- Never invent a trend when no valid previous image exists; use `trend: "unknown"`.
- Health and trend are independent; `better` must not force `health: "good"`.
- Current diary snapshots use maximum edge `720px` and JPEG quality `0.72`; transient triage images may use maximum edge `960px` and JPEG quality `0.82`.
- Main buttons and selected actions use the fixed Huahua theme green; abnormal state must not change the primary color.
- Do not add a package or database column; use the existing `diary_entries.data` JSON payload.
- Preserve compatibility with existing standalone `kind: "diagnosis"` entries.
- Keep user-owned untracked `assets/garden-*` files untouched.

---

### Task 1: Observation record model and update persistence

**Files:**
- Modify: `data.js:505-540`
- Modify: `data-service.js:245-280`
- Modify: `app.jsx:83-112`
- Modify: `tests/guest-data-service.test.js`
- Modify: `tests/cloudbase-app-flow.test.js`
- Modify: `tests/cloudbase-integration.test.js`

**Interfaces:**
- Consumes: existing `window.makeEntry(kind, plant, payload)` and `window.HHData.addDiaryEntry(plantId, entry)`.
- Produces: record fields `photoData`, `observedAt`, `comparison`, `doctorStatus`, and `diagnosis`; `window.HHData.updateDiaryEntry(plantId, entry)`; app callback `updateEntry(plant, entry): Promise<entry>`.

- [ ] **Step 1: Write the failing guest persistence assertions**

Extend `tests/guest-data-service.test.js` after `addDiaryEntry`:

```js
const observation = {
  id: "entry-2",
  kind: "record",
  photoData: "data:image/jpeg;base64,current",
  comparison: { trend: "worse", health: "watch", previousEntryId: "entry-1" },
  doctorStatus: "suggested",
};
await window.HHData.updateDiaryEntry(plant.id, {
  ...observation,
  doctorStatus: "completed",
  diagnosis: { conclusion: "盆土偏湿" },
});
const updated = await window.HHData.bootstrap(account);
if (updated.plants[0].diary[0].doctorStatus !== "completed") throw new Error("guest diary update was not persisted");
if (updated.plants[0].diary[0].diagnosis.conclusion !== "盆土偏湿") throw new Error("diagnosis was not written back");
```

Also require the string `updateDiaryEntry` in both CloudBase marker tests.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/guest-data-service.test.js && node tests/cloudbase-app-flow.test.js && node tests/cloudbase-integration.test.js`

Expected: FAIL because `window.HHData.updateDiaryEntry` does not exist.

- [ ] **Step 3: Extend record creation with normalized observation fields**

In the record branch of `window.makeEntry`, add:

```js
photoData: String(payload.photoData || ""),
observedAt: payload.observedAt || new Date().toISOString(),
comparison: payload.comparison || {
  previousEntryId: null,
  trend: "unknown",
  summary: "这是第一次观察",
  health: "watch",
  observations: [],
  likelyCause: "暂时无法判断",
  confidence: 0,
},
doctorStatus: payload.doctorStatus || "not_needed",
diagnosis: payload.diagnosis || null,
```

- [ ] **Step 4: Implement update persistence for guest and CloudBase data**

Add to `data-service.js` and export through `window.HHData`:

```js
async function updateDiaryEntry(plantId, entry) {
  if (isGuestAccount()) {
    const garden = readGuestGarden();
    const plant = garden.plants.find(item => item.id === plantId);
    if (!plant) throw new Error("这株植物还没有保存在本地花园里");
    const index = (plant.diary || []).findIndex(item => item.id === entry.id);
    if (index < 0) throw new Error("这篇观察记录还没有保存");
    plant.diary.splice(index, 1, clone(entry));
    writeGuestGarden(garden);
    return clone(entry);
  }
  if (window.HHCloud.demo) return clone(entry);
  currentOwnerId();
  const { id, createdAt, updatedAt, ...entryFields } = entry;
  const { db } = window.HHCloud.get();
  throwWriteError(await db.from(TABLES.diaryEntries)
    .update({ data: clean(entryFields), updated_at: new Date().toISOString() })
    .eq("id", entry.id).eq("plant_id", plantId));
  return clone(entry);
}
```

Add an `updateEntry` callback in `app.jsx` that awaits the service, replaces the matching object in `plant.diary`, forces a render, returns the saved entry, and pass it to `DoctorChat` as `onUpdateEntry`.

- [ ] **Step 5: Run persistence tests**

Run: `node tests/guest-data-service.test.js && node tests/cloudbase-app-flow.test.js && node tests/cloudbase-integration.test.js`

Expected: all three print their existing `_OK` markers.

- [ ] **Step 6: Commit**

```bash
git add data.js data-service.js app.jsx tests/guest-data-service.test.js tests/cloudbase-app-flow.test.js tests/cloudbase-integration.test.js
git commit -m "feat: persist comparable plant observations"
```

### Task 2: Two-photo health comparison backend and client

**Files:**
- Modify: `aliyun-functions/flower-doctor/index.js:210-258`
- Modify: `doctor-service.js:10-145`
- Modify: `tests/doctor-aliyun.test.js`
- Modify: `tests/doctor-api.test.js`
- Modify: `tests/capture-health-triage.test.js`

**Interfaces:**
- Consumes: `HHDoctor.triage({ plant, image, previousImage, previousObservedAt })`.
- Produces: normalized triage `{ health, observations, likelyCause, trend, trendSummary, route, confidence }`.

- [ ] **Step 1: Write failing request and normalization tests**

Update the Alibaba handler test to call triage with two distinct data images and assert the mocked model request contains both image URLs. Make the mock response include:

```json
{"health":"watch","observations":["叶尖焦黄"],"likely_cause":"盆土偏湿","trend":"worse","trend_summary":"叶尖焦黄范围比上次扩大","confidence":0.84}
```

Assert `triage.trend === "worse"` and `triage.trendSummary === "叶尖焦黄范围比上次扩大"`. Add source markers `previousImage`, `previous_image`, and `trend_summary` to the static API tests.

- [ ] **Step 2: Run triage tests to verify they fail**

Run: `node tests/doctor-aliyun.test.js && node tests/doctor-api.test.js && node tests/capture-health-triage.test.js`

Expected: FAIL because only one image is accepted and `trendSummary` is absent.

- [ ] **Step 3: Pass previous photo context through the browser client**

Change `plantContext` to avoid embedding diary data and extend triage:

```js
async function triage({ plant, image, previousImage, previousObservedAt }) {
  const result = await invoke("triage", {
    plant: plantContext(plant),
    image: image || "",
    previousImage: previousImage || "",
    previousObservedAt: previousObservedAt || "",
  });
  return normalizeTriage(result.triage);
}
```

Extend `normalizeTriage` with:

```js
trendSummary: String(value.trendSummary || value.trend_summary || (
  value.trend === "better" ? "比上次舒展了一些" :
  value.trend === "same" ? "和上次差不多" :
  value.trend === "worse" ? "有些变化比上次更明显" : "这次暂时无法比较"
)),
```

- [ ] **Step 4: Send labeled current and previous images to Qwen**

Read `previous_image` and `previous_observed_at` from the payload. In the triage action, build content in this exact order when a previous image exists:

```js
const content = [
  { type: "text", text: `${prompt}\n图1是本次照片。图2是上一次照片，记录时间：${previousObservedAt || "未知"}。` },
  { type: "image_url", image_url: { url: image } },
  { type: "image_url", image_url: { url: previousImage } },
];
```

When no previous image exists, send only the current image and require `trend: "unknown"` with `trend_summary: "这是第一次观察"`. The prompt must state that health and trend are independent and prohibit claiming improvement without visible comparative evidence.

- [ ] **Step 5: Run backend and client tests**

Run: `node tests/doctor-aliyun.test.js && node tests/doctor-api.test.js && node tests/capture-health-triage.test.js`

Expected: all tests print their `_OK` markers.

- [ ] **Step 6: Commit**

```bash
git add aliyun-functions/flower-doctor/index.js doctor-service.js tests/doctor-aliyun.test.js tests/doctor-api.test.js tests/capture-health-triage.test.js
git commit -m "feat: compare current and previous plant photos"
```

### Task 3: Capture flow with save-first lightweight doctor handoff

**Files:**
- Modify: `screens-capture.jsx:1-288`
- Modify: `app.jsx:102-112`
- Create: `tests/capture-comparison-flow.test.js`
- Modify: `scripts/test-capture-triage-browser.cjs`

**Interfaces:**
- Consumes: triage result from Task 2, `onSaveEntry(plant, entry)`, and route options `go("doctorChat", plant, { observation })`.
- Produces: a saved observation entry before either diary navigation or doctor navigation.

- [ ] **Step 1: Write a failing structural test**

Create `tests/capture-comparison-flow.test.js`:

```js
const fs = require("fs");
const capture = fs.readFileSync("screens-capture.jsx", "utf8");
for (const marker of [
  "previousEntry",
  "previousImage",
  "photoData",
  "trendSummary",
  "带着这张照片问问花大夫",
  'go("doctorChat", p, { observation: entry })',
]) {
  if (!capture.includes(marker)) throw new Error(`missing comparison handoff: ${marker}`);
}
if (capture.includes("去问花大夫</button>")) throw new Error("doctor action is still visually dominant");
console.log("CAPTURE_COMPARISON_FLOW_OK");
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/capture-comparison-flow.test.js`

Expected: FAIL on `previousEntry`.

- [ ] **Step 3: Add reusable image compression and previous-entry selection**

Inside `CaptureFlow`, select:

```js
const previousEntry = (p.diary || []).find(entry =>
  entry.kind === "record" && /^data:image\/(?:jpeg|png|webp);base64,/.test(entry.photoData || "")
) || null;
```

Refactor image capture into `capturePhoto(maxEdge, quality)` so analysis uses `capturePhoto(960, 0.82)` while storage derives `photoData` with `resizeDataImage(image, 720, 0.72)`. Pass `previousEntry.photoData` and `previousEntry.observedAt` to `HHDoctor.triage`.

- [ ] **Step 4: Build one observation entry and save it exactly once**

Replace separate good/concern constructors with `buildObservationEntry()` that uses the current snapshot and triage result:

```js
const comparison = {
  previousEntryId: previousEntry ? previousEntry.id : null,
  trend: triageResult.trend,
  summary: triageResult.trendSummary,
  health: triageResult.health,
  observations: visibleObservations,
  likelyCause: triageResult.likelyCause,
  confidence: triageResult.confidence,
};
return window.makeEntry("record", p, {
  mood: triageResult.health === "good" ? p.mood : "留心",
  voice: voice || p.voice,
  photo: p.photoId,
  photoData: storedPhoto,
  comparison,
  doctorStatus: triageResult.health === "good" ? "not_needed" : "suggested",
  concern: triageResult.health === "good" ? null : visibleObservations.join("、"),
  quote: [triageResult.trendSummary],
});
```

Keep a `savedObservation` state/ref so double taps do not create duplicates. `saveAndOpenDiary()` saves then routes to `plantDiary`; `saveAndOpenDoctor()` saves, changes `doctorStatus` to `started` through `onUpdateEntry` only if necessary, attaches `diagnosisPhoto`, and calls `go("doctorChat", p, { observation: entry })`.

- [ ] **Step 5: Make abnormal guidance light and comparison-first**

For all result states, render `triageResult.trendSummary` directly below the photo. On abnormal states, use the fixed green primary button “记入日记”; render the doctor action underneath as a transparent text button labeled “带着这张照片问问花大夫” with a small doctor icon and `var(--green-deep)` text. Remove the large abnormal doctor button, alarm badge, and doctor-as-required copy.

- [ ] **Step 6: Extend Playwright coverage**

Seed a previous observation with a valid base64 `photoData`. In the FC route assertion, verify `body.previousImage` is present, mock `trend: "worse"`, click the secondary doctor action, and assert before doctor navigation that guest localStorage contains exactly one new entry with `comparison.previousEntryId`, `photoData`, and `doctorStatus: "started"`. Verify the doctor page appears without another file upload.

- [ ] **Step 7: Run capture tests**

Run: `node tests/capture-comparison-flow.test.js && node tests/capture-health-triage.test.js`

Then start the local preview and run: `HH_TEST_URL='http://127.0.0.1:4190/花花日记本.html?v=photo-comparison' node scripts/test-capture-triage-browser.cjs`

Expected: structural tests print `_OK`; Playwright prints `CAPTURE_TRIAGE_BROWSER_OK` and creates `/tmp/huahua-capture-comparison.png`.

- [ ] **Step 8: Commit**

```bash
git add screens-capture.jsx app.jsx tests/capture-comparison-flow.test.js scripts/test-capture-triage-browser.cjs
git commit -m "feat: save observations before optional diagnosis"
```

### Task 4: Write the doctor conclusion back to the source observation

**Files:**
- Modify: `app.jsx:102-112`
- Modify: `screens-chat.jsx:234-287`
- Modify: `screens-diary.jsx:1-120`
- Modify: `tests/doctor-api.test.js`
- Modify: `scripts/test-doctor-browser.cjs`

**Interfaces:**
- Consumes: `observation` route option and `onUpdateEntry(plant, entry)` from Task 1.
- Produces: source observation with `doctorStatus: "completed"` and nested `diagnosis`; legacy diagnosis-entry fallback when no source observation is supplied.

- [ ] **Step 1: Write failing browser and source-marker assertions**

Update `tests/doctor-api.test.js` to require `observation`, `onUpdateEntry`, `doctorStatus: "completed"`, and `diagnosis: {`. Extend `scripts/test-doctor-browser.cjs` to provide a source observation, finish the consult, and assert `onUpdateEntry` receives the same observation ID instead of `onSaveEntry` receiving a new diagnosis ID.

- [ ] **Step 2: Run the doctor tests to verify they fail**

Run: `node tests/doctor-api.test.js && node scripts/test-doctor-browser.cjs`

Expected: FAIL because `DoctorChat` has no observation update path.

- [ ] **Step 3: Pass route observation into DoctorChat**

Change the app render to:

```jsx
<DoctorChat go={go} plant={top.plant} observation={top.observation}
  onSaveEntry={addEntry} onUpdateEntry={updateEntry} />
```

Change `DoctorChat` signature accordingly. In `finishDx`, if `observation` exists, call:

```js
await onUpdateEntry(p, {
  ...observation,
  doctorStatus: "completed",
  diagnosis: {
    symptom: summary.symptom,
    conclusion: summary.conclusion,
    plan: summary.plan,
    points: summary.points,
    followupDays: summary.followupDays,
    urgency: summary.urgency,
    confidence: summary.confidence,
    completedAt: new Date().toISOString(),
  },
});
```

Retain the current standalone diagnosis-entry creation only when `observation` is absent, so direct doctor-tab visits and legacy paths continue to work.

- [ ] **Step 4: Render comparison and nested diagnosis in one timeline card**

In the record card, show a compact comparison line when `d.comparison` exists, using text-only trend styles: green for `better`, ink-soft for `same/unknown`, and terra text without a filled alert panel for `worse`. When `d.diagnosis` exists, render a dashed divider titled “花大夫补充” followed by conclusion and plan. When diagnosis is absent but `doctorStatus === "suggested"`, keep a light text action “带这张照片问问花大夫” and ensure `onDiagnose` receives both plant and entry.

- [ ] **Step 5: Preserve the source photo when re-opening a saved concern**

Change `DiaryTimeline` to call `onDiagnose(p, d)`, and change `PlantDiary` to set `p.diagnosisPhoto = d.photoData || window.photoFor(d.photo)` before `go("doctorChat", p, { observation: d })`.

- [ ] **Step 6: Run doctor and timeline tests**

Run: `node tests/doctor-api.test.js && node scripts/test-doctor-browser.cjs && npm test`

Expected: doctor browser test passes, source marker test passes, and the full suite has no regression.

- [ ] **Step 7: Commit**

```bash
git add app.jsx screens-chat.jsx screens-diary.jsx screens-plant.jsx tests/doctor-api.test.js scripts/test-doctor-browser.cjs
git commit -m "feat: attach diagnosis to its observation"
```

### Task 5: Visual regression, build, and deployable function package

**Files:**
- Modify: `花花日记本.html`
- Modify: `scripts/test-capture-triage-browser.cjs`
- Modify: `scripts/build-cloudbase.mjs` only if its explicit source list omits changed files
- Replace generated artifact: `dist/flower-doctor.zip`
- Create desktop delivery: `/Users/wanghua20/Desktop/huahua-flower-doctor-v5.zip`

**Interfaces:**
- Consumes: completed Tasks 1-4.
- Produces: verified local H5 build and Alibaba FC upload bundle.

- [ ] **Step 1: Add normal and abnormal visual scenarios**

Run two Playwright scenarios at `390x844`: a `good + same` response that exposes only “记入日记”, and a `watch + worse` response that shows the same primary button plus lightweight “带着这张照片问问花大夫”. Capture `/tmp/huahua-capture-good-comparison.png` and `/tmp/huahua-capture-worse-comparison.png`.

- [ ] **Step 2: Run the complete automated verification**

Run:

```bash
npm test
npm run build
HH_TEST_URL='http://127.0.0.1:4190/花花日记本.html?v=photo-comparison-final' node scripts/test-capture-triage-browser.cjs
```

Expected: every Node test prints its `_OK` marker, build exits `0`, both screenshots exist, and the browser has no page or console errors.

- [ ] **Step 3: Inspect both screenshots**

Open both local screenshot files and verify: the photo is not cropped incorrectly; comparison text is immediately below it; abnormal treatment has no dominant warning block; both primary buttons use the same theme green; the doctor action is visibly secondary but readable; all content fits at `390x844` without covering the home indicator.

- [ ] **Step 4: Bump browser cache versions**

In `花花日记本.html`, increment query versions for `data.js`, `data-service.js`, `doctor-service.js`, `screens-capture.jsx`, `screens-chat.jsx`, `screens-diary.jsx`, `screens-plant.jsx`, and `app.jsx` so the local and CloudBase previews load the new code.

- [ ] **Step 5: Package and verify the Alibaba function**

Use the existing packaging command/path from `docs/flower-doctor-aliyun-setup.md`, then verify:

```bash
unzip -l dist/flower-doctor.zip
cp dist/flower-doctor.zip /Users/wanghua20/Desktop/huahua-flower-doctor-v5.zip
unzip -t /Users/wanghua20/Desktop/huahua-flower-doctor-v5.zip
```

Expected: archive contains root-level `index.js` and `package.json`; integrity test reports no errors.

- [ ] **Step 6: Commit**

```bash
git add 花花日记本.html scripts/test-capture-triage-browser.cjs scripts/build-cloudbase.mjs
git commit -m "test: verify photo comparison handoff flow"
```

- [ ] **Step 7: Record the live verification boundary**

Report that local mocked comparison and doctor handoff are verified, while live two-photo comparison remains pending until `/Users/wanghua20/Desktop/huahua-flower-doctor-v5.zip` is uploaded and deployed to the existing Alibaba function. After deployment, test one real normal pair and one real worsening pair before calling cloud E2E complete.
