# Vintage Collage Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing garden-door login with a full vintage collage field-journal entrance while preserving the standard email OTP flow.

**Architecture:** Keep all account state and CloudBase calls inside `EmailEntry`; replace only its decorative scene markup and CSS presentation. Build the entrance from semantic-free CSS/SVG layers so the animation can be disabled independently, and extend the existing source-contract test to prevent the former realistic-door and generic-card treatments from returning.

**Tech Stack:** React via Babel JSX, plain CSS animations, inline SVG, Node.js source-contract tests, local in-app browser validation.

**Spec:** `docs/plans/2026-08-19-vintage-collage-login-design.md`

## Global Constraints

- Preserve `sendCode`, `verifyCode`, `editEmail`, auto-focus, six-digit auto-submit, resend countdown, and all current CloudBase calls without changing their signatures.
- Use only existing local plant assets; add no runtime package or remote image dependency.
- Keep the entrance at approximately 1.8 seconds and prevent the cover animation from replaying when email content changes to the OTP content.
- At 390 × 844 and viewport heights down to 720 pixels, the email input, primary button, and privacy copy must remain visible without horizontal overflow.
- With `prefers-reduced-motion: reduce`, show the final collage immediately and disable cover, clip, sticker, and floating animations.

---

### Task 1: Lock the vintage collage source contract

**Files:**
- Modify: `tests/garden-gate-login.test.js`
- Test: `tests/garden-gate-login.test.js`

**Interfaces:**
- Consumes: the current `screens-email.jsx` and `styles.css` source files.
- Produces: source assertions for the class names used by Tasks 2 and 3.

- [ ] **Step 1: Write the failing source assertions**

Add these required screen markers to the existing screen-marker array:

```js
"collage-login-stage",
"collage-corkboard",
"collage-cover-left",
"collage-cover-right",
"collage-brass-clip",
"collage-field-sheet",
"collage-polaroid",
"collage-email-note",
"collage-otp-stamp",
```

Add these required CSS markers:

```js
"collageCoverLeftOpen",
"collageCoverRightOpen",
"collageSheetLand",
"collageStickerDrop",
"collageClipSettle",
```

Reject the superseded V3 classes in both source files:

```js
for (const rejectedV3 of [
  "garden-gate-world",
  "garden-door-v2",
  "garden-light-rays",
  "garden-journal-sheet",
]) {
  if (screen.includes(rejectedV3) || styles.includes(rejectedV3)) {
    throw new Error(`superseded garden login marker remains: ${rejectedV3}`);
  }
}
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node tests/garden-gate-login.test.js`

Expected: FAIL with `missing garden login marker: collage-login-stage`.

- [ ] **Step 3: Commit the failing contract**

```bash
git add tests/garden-gate-login.test.js
git commit -m "test: define vintage collage login contract"
```

### Task 2: Replace the realistic gate with journal-cover collage markup

**Files:**
- Modify: `screens-email.jsx:1-230`
- Test: `tests/garden-gate-login.test.js`

**Interfaces:**
- Consumes: `GardenGateScene({ settled: boolean })` usage from `EmailEntry` and local assets under `assets/plants/final-v1/`.
- Produces: `CollageJournalScene({ settled: boolean })`, `.collage-login-stage`, cover layers, clip, field sheet decoration, and unchanged `EmailEntry({ onEnter })` behavior.

- [ ] **Step 1: Replace `GardenGateScene` with `CollageJournalScene`**

Use the following component boundary and layer names:

```jsx
function CollageJournalScene({ settled = false }) {
  return (
    <div className={`collage-login-stage${settled ? " is-settled" : ""}`} aria-hidden="true">
      <div className="collage-corkboard"></div>
      <div className="collage-field-sheet-back"></div>
      <div className="collage-field-sheet">
        <div className="collage-brass-clip"><span></span></div>
        <figure className="collage-polaroid collage-polaroid-left">
          <img src="assets/plants/final-v1/guibeizhu.png" alt="" />
          <figcaption>MONSTERA · 03</figcaption>
        </figure>
        <figure className="collage-polaroid collage-polaroid-right">
          <img src="assets/plants/final-v1/hudielan.png" alt="" />
          <figcaption>ORCHID · 11</figcaption>
        </figure>
        <span className="collage-stamp">HUĀHUĀ<br />FIELD NOTES</span>
        <span className="collage-pin collage-pin-coral"></span>
        <span className="collage-pin collage-pin-green"></span>
        <span className="collage-doodle collage-doodle-star">✦</span>
        <span className="collage-doodle collage-doodle-leaf">⌇</span>
      </div>
      <div className="collage-cover collage-cover-left">…</div>
      <div className="collage-cover collage-cover-right">…</div>
    </div>
  );
}
```

Each cover must include a paper-edge span and only the right cover contains the decorative brass clip in the closed state. Keep all decorative images `alt=""` and the scene `aria-hidden="true"`.

- [ ] **Step 2: Recompose the email form as a field-note insert**

Replace the V3 scene call and main wrapper with:

```jsx
<CollageJournalScene settled={step === "code"} />
<main className="collage-login-form collage-form-reveal">
  <div className="collage-form-meta">
    <span>HUĀHUĀ FIELD NOTES</span>
    <span>{paperDate}</span>
  </div>
  {/* existing email/code branches */}
</main>
```

Rename presentation-only classes without changing event handlers: `garden-line-field` → `collage-email-note`, `garden-line-input` → `collage-email-input`, `garden-ink-button` → `collage-paper-button`, `garden-otp-lines` → `collage-otp-row`, and `garden-otp-line` → `collage-otp-stamp`. Keep the existing input IDs, ARIA attributes, refs, error component, button types, and disabled conditions exactly as they are.

- [ ] **Step 3: Run the focused test**

Run: `node tests/garden-gate-login.test.js`

Expected: FAIL only for missing CSS animation markers.

- [ ] **Step 4: Commit the scene structure**

```bash
git add screens-email.jsx
git commit -m "feat: build vintage collage login structure"
```

### Task 3: Implement the corkboard, paper collage, and opening animation

**Files:**
- Modify: `styles.css:274-560`
- Test: `tests/garden-gate-login.test.js`

**Interfaces:**
- Consumes: all `.collage-*` class names created by Task 2.
- Produces: a complete 390 × 844 collage layout, opening animation, compact-height variant, and reduced-motion fallback.

- [ ] **Step 1: Remove the V2/V3 garden-login CSS block**

Delete the block beginning with `/* ---- MVP login V2` through its login-specific reduced-motion rules. Do not touch the later immersive weather-header styles.

- [ ] **Step 2: Add the static collage palette and layout**

Define these shared values on `.collage-login-stage` and use them throughout the block:

```css
.collage-login-stage {
  --collage-green: #244D39;
  --collage-rust: #9D3E2C;
  --collage-paper: #F4EEDA;
  --collage-pink: #D98A82;
  --collage-blue: #91A8BD;
  --collage-yellow: #D8B64B;
  position: absolute;
  inset: 0;
  overflow: hidden;
  perspective: 1200px;
}
```

Build `.collage-corkboard` from warm layered gradients with a subtle repeating texture; build `.collage-field-sheet` at `top: 76px`, `left: 27px`, `right: 25px`, `bottom: 28px`, with paper-colored background, a maximum 1.2-degree rotation, and a low shadow. Place polaroids and pins only at the page edges so the central form area remains clear.

- [ ] **Step 3: Add the journal-cover opening animation**

Create two deep-green scalloped covers using `clip-path` or a repeated radial mask. The final keyframes must remove the covers fully from the viewport:

```css
@keyframes collageCoverLeftOpen {
  0%, 8% { transform: rotateY(0) translateX(0); opacity: 1; }
  82% { opacity: 1; }
  100% { transform: rotateY(82deg) translateX(-112%); opacity: 0; }
}
@keyframes collageCoverRightOpen {
  0%, 8% { transform: rotateY(0) translateX(0); opacity: 1; }
  82% { opacity: 1; }
  100% { transform: rotateY(-82deg) translateX(112%); opacity: 0; }
}
```

Use `collageClipSettle` for a single sub-2-degree clip bounce, `collageSheetLand` for the paper's 20-pixel upward landing, and `collageStickerDrop` for polaroids and stamps with 30–70 millisecond staggered delays. Keep the total entrance below 1.8 seconds.

- [ ] **Step 4: Style the form as a pasted observation note**

Set `.collage-login-form` above the field sheet, between approximately `top: 300px` and the lower inset. Use a transparent background so the paper texture shows through. Style `.collage-email-note` as a slightly rotated pastel label plus a single writing baseline, `.collage-paper-button` as a 74%-width deep-green pasted strip, and `.collage-otp-stamp` as six inked stamp cells with a clearly visible active and error state.

- [ ] **Step 5: Add compact-height and reduced-motion rules**

For `@media (max-height: 720px)`, reduce the field sheet top to 48 pixels, shrink polaroids to at most 88 pixels, and move the form to approximately 238 pixels. For `prefers-reduced-motion: reduce`, hide both cover elements and set all sheet, clip, polaroid, stamp, doodle, and form animations to `none`, with final opacity and transform values applied explicitly.

- [ ] **Step 6: Run focused tests and CSS checks**

Run:

```bash
node tests/garden-gate-login.test.js
git diff --check
```

Expected: `GARDEN_GATE_LOGIN_OK` and no whitespace errors.

- [ ] **Step 7: Commit the visual implementation**

```bash
git add styles.css tests/garden-gate-login.test.js
git commit -m "feat: animate vintage collage journal entrance"
```

### Task 4: Refresh assets, validate all states, and ship the revision

**Files:**
- Modify: `花花日记本.html:7,45`
- Test: `tests/*.test.js`

**Interfaces:**
- Consumes: the completed collage markup and CSS from Tasks 2 and 3.
- Produces: a cache-busted entry page and verified email/OTP visuals.

- [ ] **Step 1: Update cache-busting query strings**

Change both `styles.css` and `screens-email.jsx` query values from `v=20260819b` to `v=20260819c` in `花花日记本.html`.

- [ ] **Step 2: Run the full test suite**

Run:

```bash
for test_file in tests/*.test.js; do node "$test_file" || exit 1; done
git diff --check
```

Expected: all six test files print their `_OK` marker and the command exits zero.

- [ ] **Step 3: Validate visual states in the local browser**

Open `http://127.0.0.1:4176/花花日记本.html?v=20260819c`, wait for network idle, and capture the closed state near 100 milliseconds, the cover-opening state near 700 milliseconds, and the final email state after 2 seconds. Verify the 390-pixel app viewport has no horizontal overflow and that the paper, email line, primary button, and privacy copy are visible.

Use a temporary in-page stub for `HHAccount.requestEmailCode` only in the browser test session, enter `hello@huahua.test`, submit, and capture the OTP state. Confirm six `.collage-otp-stamp` elements, the edit-email action, and the resend countdown are visible. Do not modify persisted browser storage or production source for this stub.

- [ ] **Step 4: Validate reduced motion**

Emulate `prefers-reduced-motion: reduce`, reload, and confirm both cover elements are hidden while the final collage and form are immediately visible.

- [ ] **Step 5: Commit the cache key and final verification changes**

```bash
git add 花花日记本.html
git commit -m "chore: refresh vintage collage login preview"
```

