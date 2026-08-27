# Mobile Camera And Responsive Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make real phones render a full-width H5 app and make the plant diary camera action immediately capture and analyze a new photo.

**Architecture:** Keep the existing `IOSDevice` as a desktop presentation shell but expose CSS classes so mobile media queries can remove its simulated chrome. Move image selection to `PlantDiary`, pass the selected data URL through router state, and let `CaptureFlow` analyze that image automatically.

**Tech Stack:** React 18 UMD, JSX compiled by Babel in browser, CSS media queries, browser FileReader and file input capture.

**Spec:** `docs/plans/2026-08-27-mobile-camera-responsive-shell-design.md`

## Global Constraints

- Real mobile content maximum width is 480px.
- Desktop keeps the 390×844 device mockup.
- Mobile camera input uses `accept="image/*"` and `capture="environment"`.
- Canceling image selection leaves the user on the plant diary page.
- Selecting an image starts AI analysis without a second confirmation button.
- Do not modify or stage the user's untracked `assets/garden-*` files.

---

### Task 1: Responsive device shell

**Files:**
- Modify: `ios-frame.jsx`
- Modify: `styles.css`
- Test: `tests/mobile-shell.test.js`

**Interfaces:**
- Consumes: `IOSDevice({ children, width, height, dark, title, keyboard })`
- Produces: `.ios-device`, `.ios-device-chrome`, `.ios-device-content`, and mobile CSS variables `--app-safe-top`, `--app-safe-bottom`

- [ ] **Step 1: Write a failing source-contract test**

Create `tests/mobile-shell.test.js` that asserts the device class names, the 480px mobile maximum, `100dvh`, safe-area variables, and a media query hiding `.ios-device-chrome`.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `node tests/mobile-shell.test.js`

Expected: FAIL because the responsive shell markers do not exist.

- [ ] **Step 3: Add semantic classes to the device wrapper**

Apply `className="ios-device"` to the wrapper, `className="ios-device-chrome"` to the dynamic island/status/home indicator, and `className="ios-device-content"` to the content container while preserving desktop inline dimensions.

- [ ] **Step 4: Add mobile and desktop CSS rules**

For `@media (max-width: 600px)`, remove `.stage` padding, size `#device-host` and `.ios-device` to `width: min(100vw, 480px)` and `height: 100dvh`, remove radius/shadow, hide `.ios-device-chrome`, and set safe-area variables. Keep desktop behavior unchanged.

- [ ] **Step 5: Run the source-contract test**

Run: `node tests/mobile-shell.test.js`

Expected: PASS.

### Task 2: Direct camera capture from plant diary

**Files:**
- Modify: `screens-plant.jsx`
- Modify: `app.jsx`
- Modify: `screens-capture.jsx`
- Test: `tests/direct-camera-flow.test.js`

**Interfaces:**
- Consumes: `go(dest, plant, opts)` and `CaptureFlow({ ..., initialImage })`
- Produces: `go("capture", plant, { image: dataUrl })`; `CaptureFlow` automatically calls `analyze(initialImage)` exactly once.

- [ ] **Step 1: Write a failing source-contract test**

Create `tests/direct-camera-flow.test.js` asserting the hidden file input has `accept="image/*"` and `capture="environment"`, the diary button triggers it, the selected image is routed as `image`, and the old existing-plant confirmation copy is absent from the capture screen.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `node tests/direct-camera-flow.test.js`

Expected: FAIL because the diary button currently routes directly to the redundant shoot screen.

- [ ] **Step 3: Implement file selection in `PlantDiary`**

Add a ref for the hidden input, convert the selected `File` into a data URL with `FileReader`, route only after a valid image is available, reset the input value after handling, and leave the page unchanged when no file is selected.

- [ ] **Step 4: Pass the image through the app router**

Pass `top.image` to `CaptureFlow` as `initialImage` without changing other route state.

- [ ] **Step 5: Make capture analysis image-driven**

Change `analyze` to accept an optional image source, use it before any demo fallback, display it in the polaroid, and use a guarded effect to auto-run analysis once for non-intake records with `initialImage`. Keep the manual shoot step for intake.

- [ ] **Step 6: Run the direct-camera test and full test suite**

Run: `node tests/direct-camera-flow.test.js && npm test`

Expected: all tests PASS.

### Task 3: Build and responsive interaction verification

**Files:**
- Modify: `花花日记本.html` only if cache-busting versions must change
- Verify: generated `dist/cloudbase`

**Interfaces:**
- Consumes: the responsive shell and camera route from Tasks 1 and 2
- Produces: locally verified mobile and desktop behavior ready for a separate cloud deployment

- [ ] **Step 1: Build production files**

Run: `npm run build`

Expected: exit code 0 and updated `dist/cloudbase` output.

- [ ] **Step 2: Verify mobile viewports**

At 320×700, 375×812, 390×844, 430×932, and 480×900, confirm no simulated status/home bars, no horizontal overflow, and the app shell fills the viewport.

- [ ] **Step 3: Verify desktop preview**

At 1163×1173, confirm the 390×844 phone model, simulated status bar, dynamic island, home indicator, rounded frame, and centered stage remain visible.

- [ ] **Step 4: Verify capture interaction**

Use a fixture image to simulate file selection, confirm the capture screen enters analyzing immediately and uses the selected image; cancel selection and confirm the route does not change.

- [ ] **Step 5: Check console and commit only scoped files**

Confirm no new console errors, review `git diff`, exclude untracked `assets/garden-*`, and commit the responsive shell and direct camera flow as one cohesive feature.
