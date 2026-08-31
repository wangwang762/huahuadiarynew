# First Garden Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the persistent garden-floor hint with a non-blocking, one-time pull-down guide stored per browser/device.

**Architecture:** `DiaryGardenFloor` owns the guide state because it already owns the diary-to-garden transform and touch gesture. A versioned `localStorage` key controls one-time display; CSS animates the existing diary sheet and a low-position guide caption without touching the weather header.

**Tech Stack:** React 18 JSX, CSS animations, browser `localStorage`, Node source-contract tests, esbuild.

**Spec:** `docs/plans/2026-08-31-first-garden-guide-design.md`

## Global Constraints

- Remove the persistent `garden-floor-hint` completely.
- Show the guide only once per device/browser with `huahua.gardenFloorGuideSeen.v1`.
- Do not block touch, scrolling, capture, or account interactions.
- Preserve the existing real pull-down gesture and garden floor switch.
- Respect `prefers-reduced-motion: reduce`.

---

### Task 1: One-time guide contract

**Files:**
- Modify: `tests/diary-garden-floor.test.js`

**Interfaces:**
- Consumes: `app.jsx`, `styles.css`
- Produces: source-contract assertions for the storage key, lifecycle, and removed persistent hint

- [ ] **Step 1: Write the failing test**

Add assertions that require `GARDEN_FLOOR_GUIDE_KEY`, `localStorage.getItem`, `localStorage.setItem`, `garden-floor-guide`, and prohibit `garden-floor-hint`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/diary-garden-floor.test.js`

Expected: FAIL because the one-time guide markers do not exist and the persistent hint remains.

- [ ] **Step 3: Commit the failing contract with the implementation task**

The repository has unrelated in-progress changes, so stage only the exact files changed by this feature after Task 2 passes.

### Task 2: Implement the first-entry guide

**Files:**
- Modify: `app.jsx`
- Modify: `styles.css`
- Test: `tests/diary-garden-floor.test.js`

**Interfaces:**
- Consumes: `DiaryGardenFloor({ go, t, onAccount, floor, onFloorChange })`
- Produces: `shouldShowGardenFloorGuide(): boolean`, `markGardenFloorGuideSeen(): void`, `.garden-floor-guide`, `.is-guide-active`

- [ ] **Step 1: Add storage helpers and state**

Define `const GARDEN_FLOOR_GUIDE_KEY = "huahua.gardenFloorGuideSeen.v1"`; read it once when `DiaryGardenFloor` mounts, start the guide only on the diary floor, and write the key when the guide completes or the user touches the page.

- [ ] **Step 2: Replace the persistent button**

Delete the `garden-floor-hint` button. Render a pointer-events-none caption only while the first-entry guide is active, and add `is-guide-active` to the existing diary sheet.

- [ ] **Step 3: Add motion and reduced-motion styles**

Animate the sheet down briefly and back without covering the weather; position the caption in the lower safe content area, fade it out, and disable sheet motion under `prefers-reduced-motion`.

- [ ] **Step 4: Run the focused test**

Run: `node tests/diary-garden-floor.test.js`

Expected: `DIARY_GARDEN_FLOOR_OK`.

- [ ] **Step 5: Run regression tests and build**

Run: `npm test && npm run build`

Expected: all tests pass and CloudBase output builds successfully.

- [ ] **Step 6: Verify in browser**

Clear only `huahua.gardenFloorGuideSeen.v1`, refresh the local preview, confirm the guide runs once without covering weather, confirm a second refresh shows no guide, and confirm a real pull-down still enters the garden.

- [ ] **Step 7: Commit exact feature files**

```bash
git add app.jsx styles.css tests/diary-garden-floor.test.js docs/plans/2026-08-31-first-garden-guide-design.md docs/superpowers/plans/2026-08-31-first-garden-guide.md
git commit -m "feat: add one-time garden floor guide"
```
