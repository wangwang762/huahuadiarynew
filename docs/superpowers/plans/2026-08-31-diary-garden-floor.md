# Diary Garden Floor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three-tab shell with a diary-first vertical floor transition, a persistent capture action, and horizontally paged full-screen garden.

**Architecture:** Keep the existing stack router for overlays, but make `diary` the only base route. A `DiaryGardenFloor` component owns transient floor and drag state, composes `GardenScreen` behind `DiaryHome`, and exposes the same capture route from a persistent floating button. Garden pages retain the existing twenty-plant chunking and switch from vertical to horizontal scroll snap.

**Tech Stack:** React 18 UMD, Babel JSX, CSS scroll snap, Node.js static regression tests.

**Spec:** `docs/plans/2026-08-31-diary-garden-floor-design.md`

## Global Constraints

- 日记是观察、养护建议和问诊结果的唯一档案。
- 花大夫不作为一级导航，只从异常观察上下文进入。
- 日记阅读使用纵向滚动；楼层使用纵向手势；花园分页只使用横向滑动。
- 全局拍照按钮使用统一主题色，并在日记与花园场景常驻。
- 不新增前端依赖，不改动现有 CloudBase/阿里云数据接口。

---

### Task 1: Navigation contract tests

**Files:**
- Create: `tests/diary-garden-floor.test.js`
- Modify: `tests/garden-screen.test.js`
- Modify: `tests/plant-diary-back-route.test.js`

**Interfaces:**
- Consumes: current source files as text.
- Produces: regression assertions for `DiaryGardenFloor`, `GlobalCaptureButton`, horizontal garden snap, and removal of the base doctor route.

- [ ] **Step 1: Write the failing tests** asserting the new component markers, `ROOT_VIEWS = ["diary"]`, persistent capture route, `overflow-x:auto`, `scroll-snap-type:x mandatory`, and “左右滑” cue.
- [ ] **Step 2: Run test to verify it fails** with `node tests/diary-garden-floor.test.js`.
- [ ] **Step 3: Update stale garden and return-label assertions** so they describe the diary-first shell rather than a third tab.
- [ ] **Step 4: Run targeted tests** with `node tests/diary-garden-floor.test.js && node tests/garden-screen.test.js && node tests/plant-diary-back-route.test.js`.

### Task 2: Diary and garden floor shell

**Files:**
- Modify: `app.jsx`
- Modify: `screens-home.jsx`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `DiaryHome({ go, t, onAccount, scrollRef })` and `GardenScreen({ go, onReturnHome })`.
- Produces: `DiaryGardenFloor({ go, t, onAccount })` and `GlobalCaptureButton({ onCapture })`.

- [ ] **Step 1: Expose the diary scroll element** by attaching the supplied `scrollRef` in `DiaryHome`.
- [ ] **Step 2: Implement floor state and direction locking** with constants for direction tolerance and completion threshold; allow diary pull only at `scrollTop <= 0`.
- [ ] **Step 3: Render garden behind the diary sheet** and translate the diary sheet during drag; settle to either `0%` or `100%` after release.
- [ ] **Step 4: Add accessible fallback controls** for “下拉去二楼花园” and “上滑回日记本”.
- [ ] **Step 5: Remove `BottomNav` from the app shell** and make `diary` the only base route while keeping doctor chat overlays intact.
- [ ] **Step 6: Add the persistent capture button** whose click calls `go("capture", null, { intake: true })`.
- [ ] **Step 7: Run the navigation contract tests** and expect all three targeted files to pass.

### Task 3: Horizontal garden pagination

**Files:**
- Modify: `screens-garden.jsx`
- Modify: `styles.css`

**Interfaces:**
- Consumes: existing `gardenPages: Plant[][]` chunks of twenty.
- Produces: horizontally snapping `.garden-page-scroll` and an optional `onReturnHome()` control.

- [ ] **Step 1: Change the cue copy** from upward continuation to left/right continuation and add a floor-return control.
- [ ] **Step 2: Convert the page scroller** to a horizontal flex row with `overflow-x:auto`, `overflow-y:hidden`, and `scroll-snap-type:x mandatory`.
- [ ] **Step 3: Give every shelf page one viewport width** using `flex:0 0 100%` and preserve the existing single-screen shelf height.
- [ ] **Step 4: Preserve horizontal touch intent on plants** so tapping opens detail while lateral drag remains available to the scroller.
- [ ] **Step 5: Run `node tests/garden-screen.test.js`** and expect `GARDEN_SCREEN_OK`.

### Task 4: Full local verification

**Files:**
- Modify: `花花日记本.html` cache versions.

**Interfaces:**
- Consumes: completed source changes.
- Produces: cache-busted local preview and deployable `dist/cloudbase` build.

- [ ] **Step 1: Refresh source cache versions** for changed JSX and CSS files.
- [ ] **Step 2: Run `npm test`** and require the full suite to pass.
- [ ] **Step 3: Run `npm run build`** and require a successful `dist/cloudbase` output.
- [ ] **Step 4: Open the local preview** and verify diary scrolling, pull-down entry, garden horizontal paging, swipe-up return, capture action, overlay return, mobile width, and console errors.
- [ ] **Step 5: Report status honestly** as implemented and locally verified; mark CloudBase publication as pending until a new deployment is accepted.
