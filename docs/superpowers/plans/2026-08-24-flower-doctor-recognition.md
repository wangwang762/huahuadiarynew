# Flower Doctor Recognition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hard-coded “多肉” intake result with real photo recognition that automatically routes one matching garden plant, asks only for ambiguous same-species matches, and lets unmatched plants finish diagnosis before optional archiving.

**Architecture:** Extend the existing Alibaba FC endpoint with a `recognize` action that asks Qwen VL for a normalized species and candidate IDs, then validate every returned ID against the submitted candidate list. Extend `window.HHDoctor` with a recognition client and make `CaptureFlow` own the routing decision; the existing `DoctorChat` and `ArchiveNew` remain the diagnosis and optional-record stages.

**Tech Stack:** Single-page React via in-browser Babel, plain JavaScript services, Alibaba Function Compute Node.js 16, DashScope OpenAI-compatible Qwen VL, Node assertion tests.

**Spec:** `docs/plans/2026-08-24-flower-doctor-recognition-design.md`

## Global Constraints

- Recognition must never block diagnosis; failures continue as an unidentified new friend.
- Exactly one valid candidate routes automatically; two or more valid candidates require confirmation; zero candidates route automatically as a new friend.
- Candidate payloads contain only `id`, `name`, and `species`; diary text is never sent for recognition.
- The backend may only return candidate IDs present in the request.
- Recognition guides routing and must not be stored as a medical diagnosis.
- No API key or other secret may be added to browser code, Git, or generated bundles.
- Do not add an npm dependency.

---

### Task 1: Alibaba recognition action

**Files:**
- Modify: `aliyun-functions/flower-doctor/index.js:61-228`
- Test: `tests/doctor-aliyun.test.js`

**Interfaces:**
- Consumes: `{ action: "recognize", image: string, candidates: Array<{id:string,name:string,species:string}> }`.
- Produces: `{ ok:true, recognition:{ species:string, confidence:number, matchedIds:string[], note:string } }`.

- [ ] **Step 1: Extend the mocked model and add a failing recognition test**

Add a recognition branch before the existing summary branch in `tests/doctor-aliyun.test.js`:

```js
const wantsRecognition = body.messages.some(message =>
  typeof message.content === "string" && message.content.includes("植物识别路由")
);
// Inside the mocked content selection:
content: wantsRecognition
  ? JSON.stringify({ species: "绿萝", confidence: 0.88, matched_ids: ["p1", "invented"], note: "叶形与绿萝相符" })
  : wantsSummary
    ? JSON.stringify({ /* retain the existing summary fixture */ })
    : "照片里能看到叶尖发黄。请告诉我盆土现在偏干还是偏湿？",
```

Then add this assertion before the unknown-action assertion:

```js
const recognitionResponse = await handler(event("POST", {
  action: "recognize",
  image: "data:image/jpeg;base64,AA==",
  candidates: [
    { id: "p1", name: "罗罗", species: "绿萝" },
    { id: "p2", name: "阿绿", species: "绿萝" },
  ],
}));
const recognitionBody = JSON.parse(recognitionResponse.body);
assert.equal(recognitionBody.ok, true);
assert.equal(recognitionBody.recognition.species, "绿萝");
assert.deepEqual(recognitionBody.recognition.matchedIds, ["p1"]);
assert.equal(recognitionBody.recognition.confidence, 0.88);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node tests/doctor-aliyun.test.js`

Expected: FAIL because `recognize` currently returns status 400.

- [ ] **Step 3: Add candidate validation and normalization**

Add these helpers after `safeMessages`:

```js
function safeCandidates(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 60).map(item => ({
    id: String((item && item.id) || "").slice(0, 80),
    name: String((item && item.name) || "").slice(0, 50),
    species: String((item && item.species) || "").slice(0, 80),
  })).filter(item => item.id && item.species);
}

function normalizeRecognition(value, candidates) {
  const validIds = new Set(candidates.map(item => item.id));
  return {
    species: String(value.species || "待识别").slice(0, 80),
    confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0)),
    matchedIds: Array.isArray(value.matched_ids)
      ? [...new Set(value.matched_ids.map(String).filter(id => validIds.has(id)))].slice(0, 8)
      : [],
    note: String(value.note || "").slice(0, 160),
  };
}
```

Export both helpers under `exports._test`.

- [ ] **Step 4: Implement the `recognize` action**

At the beginning of `execute`, parse `const candidates = safeCandidates(payload.candidates);`, then add this branch before `chat`:

```js
if (action === "recognize") {
  if (!image) {
    return { ok: true, recognition: normalizeRecognition({}, candidates), model: MODEL };
  }
  const candidateText = candidates.length
    ? candidates.map(item => `${item.id} | ${item.name} | ${item.species}`).join("\n")
    : "（花园暂无植物）";
  const prompt = `植物识别路由。根据照片识别最可能的家庭植物品类，并与候选档案按品类匹配。候选：\n${candidateText}\n只输出JSON：{"species":"品类","confidence":0.0,"matched_ids":["候选ID"],"note":"可见依据"}。matched_ids只能来自候选；不确定时降低confidence并返回空数组。`;
  const raw = await generate([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: image } }] },
  ], 360);
  return { ok: true, recognition: normalizeRecognition(parseJson(raw), candidates), model: MODEL };
}
```

- [ ] **Step 5: Run the focused and complete tests**

Run: `node tests/doctor-aliyun.test.js && npm test`

Expected: `FLOWER_DOCTOR_ALIYUN_OK` followed by all existing test success markers.

- [ ] **Step 6: Commit the backend action**

```bash
git add aliyun-functions/flower-doctor/index.js tests/doctor-aliyun.test.js
git commit -m "feat: recognize flower doctor intake photos"
```

---

### Task 2: Browser recognition client

**Files:**
- Modify: `doctor-service.js:2-78`
- Modify: `tests/doctor-api.test.js`

**Interfaces:**
- Consumes: `window.HHDoctor.recognize({ image, plants })`, where `plants` are hydrated garden plants.
- Produces: `Promise<{species:string,confidence:number,matchedIds:string[],note:string}>` with IDs validated again in the browser.

- [ ] **Step 1: Add failing source-contract assertions**

Append these markers to the `doctor-service.js` assertion in `tests/doctor-api.test.js`:

```js
for (const marker of ["async function recognize", "action, ...payload", "matchedIds", "validIds.has(id)", "window.HHDoctor = { reply, summarize, recognize }"]) {
  if (!client.includes(marker)) throw new Error(`missing recognition client marker: ${marker}`);
}
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node tests/doctor-api.test.js`

Expected: FAIL with `missing recognition client marker`.

- [ ] **Step 3: Add a minimal recognition client with least-data candidate mapping**

Add before the final export in `doctor-service.js`:

```js
async function recognize({ image, plants }) {
  const candidates = (plants || []).map(plant => ({
    id: String(plant.id || ""),
    name: String(plant.name || ""),
    species: String(plant.species || ""),
  })).filter(item => item.id && item.species);
  const result = await invoke("recognize", { image: image || "", candidates });
  const raw = result && result.recognition || {};
  const validIds = new Set(candidates.map(item => item.id));
  return {
    species: String(raw.species || "待识别"),
    confidence: Math.max(0, Math.min(1, Number(raw.confidence) || 0)),
    matchedIds: Array.isArray(raw.matchedIds)
      ? [...new Set(raw.matchedIds.map(String).filter(id => validIds.has(id)))]
      : [],
    note: String(raw.note || ""),
  };
}

window.HHDoctor = { reply, summarize, recognize };
```

- [ ] **Step 4: Run the focused and complete tests**

Run: `node tests/doctor-api.test.js && npm test`

Expected: `FLOWER_DOCTOR_API_OK` and all existing tests pass.

- [ ] **Step 5: Commit the browser client**

```bash
git add doctor-service.js tests/doctor-api.test.js
git commit -m "feat: add flower recognition client"
```

---

### Task 3: Automatic intake routing and ambiguous confirmation

**Files:**
- Modify: `screens-capture.jsx:5-294`
- Create: `tests/doctor-recognition-flow.test.js`
- Modify: `花花日记本.html:51`

**Interfaces:**
- Consumes: `window.HHDoctor.recognize({ image, plants })` from Task 2.
- Produces: direct `go("doctorChat", plant)` routing for one/zero matches, and `IdentifyStep` only for multiple matches.

- [ ] **Step 1: Write a failing flow-contract test**

Create `tests/doctor-recognition-flow.test.js`:

```js
const fs = require("fs");
const capture = fs.readFileSync("screens-capture.jsx", "utf8");

if (capture.includes('const detectedSpecies = "多肉"')) throw new Error("intake recognition is still hard-coded");
for (const marker of [
  "window.HHDoctor.recognize",
  "recognition.matchedIds",
  "matched.length === 1",
  "matched.length > 1",
  'go("doctorChat", matched[0])',
  'go("doctorChat", draft)',
  "识别暂时没成功",
]) {
  if (!capture.includes(marker)) throw new Error(`missing recognition flow marker: ${marker}`);
}
console.log("DOCTOR_RECOGNITION_FLOW_OK");
```

- [ ] **Step 2: Run the new test and verify failure**

Run: `node tests/doctor-recognition-flow.test.js`

Expected: FAIL with `intake recognition is still hard-coded`.

- [ ] **Step 3: Replace the fake timer with real recognition routing**

In `CaptureFlow`, replace `detectedSpecies` and `sameSpecies` with state:

```js
const [recognition, setRecognition] = useState(null);
const [candidates, setCandidates] = useState([]);
const [recognitionError, setRecognitionError] = useState("");
```

Add a helper that preserves the captured diagnosis photo and recognized species:

```js
function draftForRecognition(result, photo) {
  const preset = window.SPECIES.find(item => item.species === result.species) || window.SPECIES[0];
  const draft = window.makeDraftPlant(preset);
  draft.species = result.species && result.species !== "待识别" ? result.species : "待识别";
  draft.diagnosisPhoto = photo;
  draft.recognition = result;
  return draft;
}
```

Replace the intake branch inside `analyze` with:

```js
if (intake) {
  setRecognitionError("");
  const photo = await capturePhoto();
  try {
    const result = await window.HHDoctor.recognize({ image: photo, plants: window.PLANTS });
    const matched = result.matchedIds
      .map(id => window.PLANTS.find(item => item.id === id))
      .filter(Boolean);
    setRecognition(result);
    setCandidates(matched);
    if (matched.length === 1) {
      matched[0].diagnosisPhoto = photo;
      go("doctorChat", matched[0]);
    } else if (matched.length > 1) {
      setStep("identify");
    } else {
      go("doctorChat", draftForRecognition(result, photo));
    }
  } catch (_) {
    setRecognitionError("识别暂时没成功，先让花大夫看看，不耽误问诊。");
    go("doctorChat", draftForRecognition({ species: "待识别", confidence: 0, matchedIds: [] }, photo));
  }
  return;
}
```

When rendering `IdentifyStep`, pass `species={recognition && recognition.species || "待识别"}` and `candidates={candidates}`. Update `pickExisting` to reuse the already captured `diagnosisPhoto` when present; update the “都不是” branch to create a draft from `recognition` and go directly to `doctorChat`.

- [ ] **Step 4: Keep the ambiguous screen aligned with the existing home-card language**

Change only the multi-candidate copy to:

```jsx
<>花花认出它像「{species}」，你的花园里有 {candidates.length} 位老朋友很像。<br />这是<em>哪一位</em>呢？</>
```

Keep the existing full-width candidate cards with `PlantAvatar`, name, species, and status. Rename the new-friend branch to `都不是，先按新朋友问诊`, and do not add a species-grid page.

- [ ] **Step 5: Bump the capture script cache key**

Change the capture script in `花花日记本.html` to:

```html
<script type="text/babel" src="screens-capture.jsx?v=20260824c"></script>
```

- [ ] **Step 6: Run tests and build**

Run: `node tests/doctor-recognition-flow.test.js && npm test && npm run build`

Expected: `DOCTOR_RECOGNITION_FLOW_OK`, all existing test markers, and `CloudBase bundle created at dist/cloudbase`.

- [ ] **Step 7: Commit the intake flow**

```bash
git add screens-capture.jsx tests/doctor-recognition-flow.test.js 花花日记本.html
git commit -m "feat: route flower doctor intake by recognition"
```

---

### Task 4: Prefill unmatched-plant archiving and deploy verification

**Files:**
- Modify: `screens-capture.jsx:298-458`
- Modify: `tests/doctor-recognition-flow.test.js`
- Create: `/Users/wanghua20/Desktop/huahua-flower-doctor-v3.zip` (deployment artifact, never commit)

**Interfaces:**
- Consumes: `draft.species`, `draft.recognition`, and diagnosis summary from Tasks 1–3.
- Produces: optional new plant record prefilled with recognized species; no record is created when the user backs out.

- [ ] **Step 1: Add failing archive-prefill assertions**

Append to `tests/doctor-recognition-flow.test.js`:

```js
for (const marker of [
  "draft.species || sp0.species",
  "识别结果已带入",
  "暂不建档",
]) {
  if (!capture.includes(marker)) throw new Error(`missing archive recognition marker: ${marker}`);
}
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node tests/doctor-recognition-flow.test.js`

Expected: FAIL with `missing archive recognition marker`.

- [ ] **Step 3: Prefill the archive form without forcing record creation**

Initialize the species input from the recognized draft:

```js
const [speciesText, setSpeciesText] = useState(draft.species || sp0.species);
```

Under the species input label, render this when recognition has a usable species:

```jsx
{draft.recognition && draft.recognition.species !== "待识别" && (
  <span style={{ color: "var(--green-deep)" }}> · 识别结果已带入，可修改</span>
)}
```

Add a secondary button below the archive button:

```jsx
<button onClick={onBack} disabled={saving}
  style={{ marginTop: 12, width: "100%", fontSize: 14, color: "var(--ink-faint)" }}>
  暂不建档
</button>
```

Do not call `onArchive` from this secondary action.

- [ ] **Step 4: Run all automated verification**

Run: `npm test && npm run build`

Expected: every test marker including `DOCTOR_RECOGNITION_FLOW_OK`, followed by a successful CloudBase build.

- [ ] **Step 5: Package the Alibaba function at ZIP root**

Run:

```bash
zip -j /Users/wanghua20/Desktop/huahua-flower-doctor-v3.zip \
  aliyun-functions/flower-doctor/index.js \
  aliyun-functions/flower-doctor/package.json
```

Expected: the archive contains `index.js` and `package.json` at its root.

- [ ] **Step 6: Deploy and verify the backend response**

Upload `/Users/wanghua20/Desktop/huahua-flower-doctor-v3.zip` to the existing `huahua-flower-doctor` function and deploy it without changing the existing environment variables or anonymous POST/OPTIONS trigger. Then send a POST containing `action:"recognize"`, one project plant image as a data URL, and two test candidates.

Expected: HTTP 200; `recognition.species` is non-empty; `confidence` is between 0 and 1; every `matchedIds` value belongs to the submitted candidates.

- [ ] **Step 7: Perform local UI acceptance checks**

At `http://127.0.0.1:4177/花花日记本.html`, verify these cases at 390×844:

```text
one matching candidate -> photo -> loading -> DoctorChat with existing name
two matching candidates -> photo -> compact confirmation -> selected friend -> DoctorChat
zero matching candidates -> photo -> DoctorChat as new friend -> finish -> ArchiveNew prefilled
recognition error -> non-blocking new-friend DoctorChat path
```

Also verify no horizontal overflow, no console errors, no API key in page source, and that backing out from `暂不建档` creates no plant.

- [ ] **Step 8: Commit and push the completed feature**

```bash
git add screens-capture.jsx tests/doctor-recognition-flow.test.js
git commit -m "feat: prefill recognized new plant records"
git push origin codex/mvp
```

## Self-Review

- Spec coverage: recognition, single/multiple/zero matches, failure fallback, post-diagnosis optional archive, least-data payload, ID validation, testing, and secret handling are each covered by a task.
- Placeholder scan: no `TBD`, `TODO`, or undefined “handle later” steps remain.
- Type consistency: backend `matchedIds` matches the browser client and `CaptureFlow`; backend input `candidates` matches the client output mapping; `draft.recognition` and `draft.species` feed `ArchiveNew` consistently.
