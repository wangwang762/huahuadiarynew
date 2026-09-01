# Elastic Garden Pocket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a resisted pull gesture and a top-center semicircular garden pocket preview to the diary-to-garden floor transition.

**Architecture:** Keep `DiaryGardenFloor` as the gesture owner, but replace raw 1:1 offsets with pure resistance/progress helpers and expose progress through CSS custom properties. Render one non-interactive pocket layer between the garden and diary sheets so it reveals the existing live garden scene without duplicating plant data.

**Tech Stack:** React 18 JSX loaded through the existing browser bundle, CSS custom properties and `clip-path`, Node.js assertion tests, local static browser smoke testing.

**Spec:** `docs/plans/2026-09-01-elastic-garden-pocket-design.md`

## Global Constraints

- Do not add a third-party motion library.
- Do not add sound or vibration.
- Preserve diary vertical scrolling, garden horizontal paging, and the global capture button.
- The pocket must reveal the existing live garden scene rather than a duplicate preview image.
- Respect `prefers-reduced-motion`.
- Work only on `codex/mvp` and do not stage unrelated untracked garden assets.

---

### Task 1: Resistance and progress model

**Files:**
- Modify: `app.jsx:7-125`
- Create: `tests/garden-pocket-motion.test.js`

**Interfaces:**
- Produces: `getGardenPullDistance(rawDistance: number, viewportHeight: number): number`
- Produces: `getGardenPullProgress(rawDistance: number, viewportHeight: number): number`
- Produces: `GARDEN_POCKET_DEAD_ZONE`, `FLOOR_SWITCH_THRESHOLD_RATIO`

- [ ] **Step 1: Write the failing test**

```js
const fs = require("fs");
const app = fs.readFileSync("app.jsx", "utf8");
for (const marker of [
  "GARDEN_POCKET_DEAD_ZONE",
  "function getGardenPullDistance",
  "function getGardenPullProgress",
  '"--garden-pull-progress"',
  "garden-pocket-preview",
  "is-threshold-ready",
]) {
  if (!app.includes(marker)) throw new Error(`missing garden pocket marker: ${marker}`);
}
if (!/Math\.pow\(|Math\.sqrt\(|Math\.log1p\(/.test(app)) {
  throw new Error("garden pull resistance is not nonlinear");
}
console.log("GARDEN_POCKET_MOTION_OK");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/garden-pocket-motion.test.js`

Expected: FAIL with `missing garden pocket marker`.

- [ ] **Step 3: Add the pure motion helpers and use resisted offsets**

Add near the existing floor constants in `app.jsx`:

```js
const GARDEN_POCKET_DEAD_ZONE = 20;

function getGardenPullDistance(rawDistance, viewportHeight) {
  const active = Math.max(0, rawDistance - GARDEN_POCKET_DEAD_ZONE);
  const maxDistance = Math.max(1, viewportHeight * .78);
  const normalized = Math.min(1, active / maxDistance);
  return active * (.7 - .15 * Math.pow(normalized, .72));
}

function getGardenPullProgress(rawDistance, viewportHeight) {
  const threshold = Math.max(1, viewportHeight * FLOOR_SWITCH_THRESHOLD_RATIO);
  return Math.max(0, Math.min(1, (rawDistance - GARDEN_POCKET_DEAD_ZONE) / threshold));
}
```

Store both raw and resisted gesture distance in `gestureRef`, use raw distance for the threshold decision, and use the resisted value for `dragOffset`.

- [ ] **Step 4: Run the focused tests**

Run: `node tests/garden-pocket-motion.test.js && node tests/diary-garden-floor.test.js`

Expected: both scripts print their `_OK` marker.

---

### Task 2: Semicircular live garden pocket

**Files:**
- Modify: `app.jsx:46-140`
- Modify: `styles.css:1225-1239`
- Modify: `tests/garden-pocket-motion.test.js`

**Interfaces:**
- Consumes: `getGardenPullProgress(rawDistance, viewportHeight)` from Task 1
- Produces: `.garden-pocket-preview`, `.garden-pocket-window`, `.garden-pocket-caption`
- Produces: CSS variables `--garden-pull-progress` and `--garden-pocket-height`

- [ ] **Step 1: Extend the failing test with visual-state assertions**

```js
const styles = fs.readFileSync("styles.css", "utf8");
for (const marker of [
  ".garden-pocket-preview",
  ".garden-pocket-window",
  "clip-path:",
  "var(--garden-pull-progress)",
  "pointer-events:none",
]) {
  if (!styles.includes(marker)) throw new Error(`missing pocket style marker: ${marker}`);
}
```

- [ ] **Step 2: Run test to verify the CSS assertions fail**

Run: `node tests/garden-pocket-motion.test.js`

Expected: FAIL with `missing pocket style marker`.

- [ ] **Step 3: Render the pocket and drive it from gesture progress**

In `DiaryGardenFloor`, derive `pullProgress` and render this layer between `.garden-floor-scene` and `.diary-floor-sheet`:

```jsx
<div className={`garden-pocket-preview${thresholdReady ? " is-threshold-ready" : ""}`}
  style={{ "--garden-pull-progress": pullProgress }} aria-hidden="true">
  <div className="garden-pocket-window"></div>
  <span className="garden-pocket-caption">松手去花园</span>
</div>
```

Use CSS custom properties to grow the opening from a shallow top-center dent into a wide semicircle. The window must use transparent clipping so the already-mounted `.garden-floor-scene` remains visible underneath; the layer adds only the paper rim, shadow, light wash, and caption.

- [ ] **Step 4: Add the transition and reduced-motion treatment**

Set the resting sheet transition to `520ms cubic-bezier(.2,.82,.22,1)`, keep direct finger tracking while `.is-dragging`, and add a shorter opacity/transform fallback inside `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 5: Run focused tests**

Run: `node tests/garden-pocket-motion.test.js && node tests/diary-garden-floor.test.js`

Expected: both pass.

---

### Task 3: Build and interactive regression

**Files:**
- Modify only if a regression is found: `app.jsx`, `styles.css`, `tests/garden-pocket-motion.test.js`

**Interfaces:**
- Consumes: completed diary/garden floor transition from Tasks 1–2
- Produces: locally verified deployable `dist/cloudbase`

- [ ] **Step 1: Run all directly related regression tests**

Run: `node tests/garden-pocket-motion.test.js && node tests/diary-garden-floor.test.js && node tests/garden-screen.test.js && node tests/mobile-shell.test.js && node tests/direct-camera-flow.test.js`

Expected: every test prints its success marker.

- [ ] **Step 2: Build the CloudBase bundle**

Run: `npm run build`

Expected: exit code 0 and `dist/cloudbase/app.js` plus `dist/cloudbase/styles.css` are generated.

- [ ] **Step 3: Serve the bundle locally**

Run: `python3 -m http.server 4183 --directory dist/cloudbase`

Expected: the local app responds at `http://127.0.0.1:4183/?demo=1`.

- [ ] **Step 4: Verify the gesture in a mobile viewport**

Open the local app at a narrow mobile viewport and verify: a short pull returns to the diary; a longer pull reveals the live semicircular pocket and settles on the garden; an upward gesture returns to the diary; horizontal garden paging still works; the capture button remains clickable; the browser console has no errors.

- [ ] **Step 5: Check the patch without staging unrelated files**

Run: `git diff --check && git status --short --branch`

Expected: no whitespace errors; only `app.jsx`, `styles.css`, the new motion test, plan files, and the already-existing account changes appear as modified.
