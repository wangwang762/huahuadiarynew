# Continuous Garden Edge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the disconnected circular garden pocket with a full-width flexible page edge that keeps the garden and diary visually joined throughout the pull gesture.

**Architecture:** Keep `DiaryGardenFloor` as the gesture owner and retain its existing resistance and threshold helpers. Replace the independent mask layer with a lightweight status layer plus a curved extension attached to `.diary-floor-sheet`; the fixed garden scene remains directly beneath the moving sheet.

**Tech Stack:** React 18 via browser Babel, CSS custom properties and pseudo-elements, Node.js source-contract tests, existing CloudBase build script.

**Spec:** `docs/plans/2026-09-02-continuous-garden-edge-design.md`

## Global Constraints

- Keep the 20px gesture dead zone and 18% viewport-height switch threshold.
- Do not add third-party animation libraries.
- Do not add sound or vibration.
- Preserve diary scrolling, garden horizontal paging, the global capture button, and the one-time garden guide.
- The live garden scene must remain the only preview source.
- Respect `prefers-reduced-motion`.

---

### Task 1: Lock the continuous-edge contract

**Files:**
- Modify: `tests/garden-pocket-motion.test.js`

**Interfaces:**
- Consumes: `app.jsx` class names and `styles.css` selectors.
- Produces: a source contract requiring `.garden-edge-reveal`, `.diary-floor-sheet::before`, `--garden-edge-depth`, and forbidding `.garden-pocket-mask`.

- [ ] **Step 1: Update the test with the new contract**

```js
const requiredAppMarkers = [
  "--garden-pull-progress",
  "--garden-edge-depth",
  "garden-edge-reveal",
  "松手去花园"
];

const requiredCssMarkers = [
  ".garden-edge-reveal",
  ".diary-floor-sheet::before",
  "--garden-edge-depth",
  "pointer-events:none"
];

assert(!css.includes(".garden-pocket-mask"), "legacy radial mask must be removed");
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node tests/garden-pocket-motion.test.js`

Expected: FAIL because the new edge selectors and variable do not exist and the old mask still exists.

- [ ] **Step 3: Commit the failing contract together with Task 2 implementation**

Do not commit the failing test alone; it travels with the immediately following production change.

---

### Task 2: Attach the reveal state to the diary sheet

**Files:**
- Modify: `app.jsx:64-205`
- Modify: `styles.css:1224-1247`
- Test: `tests/garden-pocket-motion.test.js`

**Interfaces:**
- Consumes: `getGardenPullDistance(rawDistance, viewportHeight)`, `getGardenPullProgress(rawDistance, viewportHeight)`, `pullProgress`, and `pocketDepth`.
- Produces: CSS variables `--garden-pull-progress` and `--garden-edge-depth`; class `.garden-edge-reveal`; sheet class `.has-garden-edge`.

- [ ] **Step 1: Rename the visual depth state without changing gesture math**

In `DiaryGardenFloor`, replace `pocketDepth` with `edgeDepth`, and expose it as:

```jsx
style={{
  "--garden-pull-progress": pullProgress,
  "--garden-edge-depth": `${edgeDepth}px`
}}
```

- [ ] **Step 2: Replace the legacy pocket markup**

Replace the three-node pocket structure with a status-only layer:

```jsx
<div className={`garden-edge-reveal${edgeVisible ? " is-visible" : ""}${pullProgress >= 1 ? " is-threshold-ready" : ""}`} aria-hidden="true">
  <span>{pullProgress >= 1 ? "松手去花园" : "花园在这里"}</span>
  <i></i>
</div>
```

Add `has-garden-edge` to `.diary-floor-sheet` while the diary is being pulled or settling.

- [ ] **Step 3: Build the full-width curved sheet extension**

Delete `.garden-pocket-preview`, `.garden-pocket-mask`, and `.garden-pocket-window`. Add a pseudo-element attached to the sheet:

```css
.diary-floor-sheet::before {
  content:"";
  position:absolute;
  z-index:-1;
  left:-12%;
  top:calc(-1 * var(--garden-edge-depth));
  width:124%;
  height:calc(var(--garden-edge-depth) + 42px);
  border-radius:0 0 50% 50%;
  background:var(--paper);
  box-shadow:0 10px 26px rgba(38,31,21,.12);
  pointer-events:none;
}
```

Adjust the final dimensions after browser inspection so the ellipse remains offscreen at both sides and the sheet edge touches the diary body without a gap.

- [ ] **Step 4: Place the status inside the revealed garden region**

```css
.garden-edge-reveal {
  position:absolute;
  z-index:19;
  top:14px;
  left:50%;
  transform:translateX(-50%);
  pointer-events:none;
  opacity:0;
}
```

The text and handle fade in only after meaningful pull progress; they must not occupy layout space.

- [ ] **Step 5: Preserve reduced-motion behavior**

Update the media query so `.garden-edge-reveal` and `.diary-floor-sheet::before` do not animate when reduced motion is requested.

- [ ] **Step 6: Run focused and full tests**

Run: `node tests/garden-pocket-motion.test.js`

Expected: `GARDEN_POCKET_MOTION_OK`.

Run: `npm test`

Expected: all test files pass.

- [ ] **Step 7: Commit the implementation**

```bash
git add app.jsx styles.css tests/garden-pocket-motion.test.js
git commit -m "fix: join garden reveal to diary edge"
```

---

### Task 3: Validate the transition visually and in the deploy bundle

**Files:**
- Verify: `花花日记本.html`
- Verify: `dist/cloudbase/index.html`

**Interfaces:**
- Consumes: the continuous-edge implementation from Task 2.
- Produces: local visual verification and a deployable CloudBase bundle.

- [ ] **Step 1: Build the deployment bundle**

Run: `npm run build`

Expected: `CloudBase bundle created at dist/cloudbase`.

- [ ] **Step 2: Open the local preview at a mobile viewport**

Serve the project locally and open `花花日记本.html` at 390×844. Enter the diary home and slowly drag downward from the top.

Expected: the garden is immediately visible above one full-width curved diary edge; no cream or white strip appears between the garden and the diary sheet.

- [ ] **Step 3: Check the threshold and cancellation states**

Release before threshold and after threshold.

Expected: cancellation returns the edge and sheet together; threshold release opens the garden without a flash or detached mask.

- [ ] **Step 4: Check regression paths**

Verify diary vertical scrolling, garden horizontal paging, garden-to-diary upward return, and the global camera button.

Expected: all remain usable and no gesture is intercepted by the visual edge.

- [ ] **Step 5: Check source formatting and repository scope**

Run: `git diff --check`

Expected: no whitespace errors. Confirm only `app.jsx`, `styles.css`, and `tests/garden-pocket-motion.test.js` are staged for the feature commit; preserve unrelated local changes.
