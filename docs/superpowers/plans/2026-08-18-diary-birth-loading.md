# Diary Birth Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic soul-generation spinner with a 3.4-second diary-writing birth animation that reveals the selected plant and then continues onboarding.

**Architecture:** Keep the existing `ObGenerate` data flow and completion timer, but replace its visual tree with a diary sheet, staged text, ink stroke, masked transparent plant image, leaf stamp, and restrained motes. Put reusable motion definitions and reduced-motion overrides in `styles.css`, and protect the intended structure with a small static regression test.

**Tech Stack:** React via Babel JSX, custom `image-slot`, plain CSS keyframes, Node static regression scripts.

**Spec:** `docs/plans/2026-08-18-diary-birth-loading-design.md`

## Global Constraints

- Keep the wait duration at approximately 3.4 seconds and preserve `setOpener` followed by `onNext`.
- Use the existing transparent plant assets and species color tokens; add no dependency.
- Remove expanding aura rings and regular floating dots from this loading state.
- Support `prefers-reduced-motion: reduce` without hiding content.
- Use exactly two loading copy stages.

---

### Task 1: Protect the diary birth structure

**Files:**
- Create: `tests/onboarding-animation.test.js`
- Test: `tests/onboarding-animation.test.js`

**Interfaces:**
- Consumes: `screens-onboard.jsx` and `styles.css` as UTF-8 source.
- Produces: a Node script that exits non-zero when required diary-motion markers disappear or legacy loading markers return.

- [ ] **Step 1: Write the failing test**

```js
const fs = require("fs");
const screen = fs.readFileSync("screens-onboard.jsx", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
for (const marker of ["diary-birth-sheet", "diary-ink-line", "diary-plant-reveal", "diary-leaf-stamp", "正在写下相遇的第一天", "从今天起，它住进你的日记里了"]) {
  if (!screen.includes(marker)) throw new Error(`missing diary birth marker: ${marker}`);
}
for (const legacy of ["ringExpand", "floatUp", "正在为它注入灵魂"]) {
  if (screen.includes(legacy)) throw new Error(`legacy loading remains: ${legacy}`);
}
if (!css.includes("prefers-reduced-motion: reduce")) throw new Error("missing reduced-motion fallback");
console.log("ONBOARDING_ANIMATION_OK");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/onboarding-animation.test.js`
Expected: FAIL with `missing diary birth marker`.

- [ ] **Step 3: Commit the failing regression test with the implementation task**

Do not commit a red tree separately; keep this test unstaged until Task 2 is green.

### Task 2: Implement the diary-writing reveal

**Files:**
- Modify: `screens-onboard.jsx:213-279`
- Modify: `styles.css:235-245`
- Modify: `花花日记本.html:46`
- Test: `tests/onboarding-animation.test.js`

**Interfaces:**
- Consumes: `sp.photoId`, `sp.soft`, `sp.accent`, `sp.deep`, `name`, `setOpener(line)`, `onNext()` and `window.cutFor(photoId)`.
- Produces: `ObGenerate` with `data-motion-stage` markers and the unchanged completion contract.

- [ ] **Step 1: Replace four cycling messages with two timed messages**

Use `const lines = ["正在写下相遇的第一天……", "从今天起，它住进你的日记里了"];` and advance once after roughly 1.8 seconds rather than looping every 1.1 seconds.

- [ ] **Step 2: Replace the aura visual tree**

Render a `data-motion-stage="diary-birth-sheet"` paper card with faint ruled lines, a date label, the plant name, an animated `diary-ink-line`, a bottom-aligned transparent `image-slot` inside `diary-plant-reveal`, a `diary-leaf-stamp`, and three irregular low-opacity motes. Use `window.coverScale` and `window.coverOffsetY` to preserve the asset baseline.

- [ ] **Step 3: Add restrained keyframes and reduced-motion rules**

Define `diaryPaperIn`, `diaryWriteIn`, `diaryInkDraw`, `diaryPlantReveal`, `diaryStampIn`, and `diaryMoteDrift`. Add a `@media (prefers-reduced-motion: reduce)` override that sets the diary stage animations to a short opacity transition or no transform while keeping all elements visible.

- [ ] **Step 4: Bump the stylesheet and onboarding cache versions**

Update query-string versions in `花花日记本.html` so the local preview loads the new CSS and JSX without stale browser cache.

- [ ] **Step 5: Run all regression scripts**

Run: `node tests/onboarding-animation.test.js && node tests/species-library.test.js && node tests/account-service.test.js && git diff --check`
Expected: `ONBOARDING_ANIMATION_OK`, `SPECIES_LIBRARY_OK`, `STANDARD_EMAIL_OTP_FLOW_OK`, and no diff errors.

- [ ] **Step 6: Commit**

```bash
git add tests/onboarding-animation.test.js screens-onboard.jsx styles.css '花花日记本.html'
git commit -m "feat: 优化植物诞生日记动效"
```

### Task 3: Visual and interaction verification

**Files:**
- Verify: `花花日记本.html`

**Interfaces:**
- Consumes: the local HTTP preview and the onboarding flow.
- Produces: confirmation that the animation renders, completes, and reaches the first diary screen.

- [ ] **Step 1: Open the local preview through the in-app browser**

Navigate through email state, add-plant, species selection, name, and personality until `ObGenerate` appears.

- [ ] **Step 2: Verify the motion and transition**

Confirm the paper, date, name, ink line, plant reveal, stamp, and restrained motes appear in sequence; confirm no expanding rings remain; confirm the first diary screen appears after approximately 3.4 seconds.

- [ ] **Step 3: Verify console and final state**

Check for runtime errors, leave the preview on a useful deliverable state, and keep the branch clean.
