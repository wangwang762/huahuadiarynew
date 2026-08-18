# Species Picker Three-Column Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the 25-species picker as a homepage-matched three-column plant-cover grid without circular avatars.

**Architecture:** Keep the existing picker state and accessibility contract, changing only card rendering and layout in `ObSpeciesPicker`. Reuse the current transparent cutout resolver and homepage cover scale/baseline helpers so the selector and diary covers share image behavior.

**Tech Stack:** React 18 JSX, existing CSS tokens, `image-slot`, Node static assertions, in-app browser visual verification.

**Spec:** `docs/plans/2026-08-18-species-picker-grid-design.md`

## Global Constraints

- Render exactly three cards per row.
- Do not use `PlantAvatar` or another circular image container inside picker cards.
- Use the existing transparent cutout, soft gradient, `coverScale`, and `coverOffsetY` behavior.
- Keep all 25 semantic choice buttons and `aria-pressed` selection state.
- Allow long species names to wrap without changing card height.

---

### Task 1: Restyle and verify the species cards

**Files:**
- Modify: `screens-onboard.jsx:108-157`
- Modify: `花花日记本.html:45`
- Modify: `tests/species-library.test.js:22-29`

**Interfaces:**
- Consumes: `window.cutFor(photoId)`, `window.photoFor(photoId)`, `window.coverScale(photoId)`, `window.coverOffsetY(photoId)`, and the existing `ObSpeciesPicker` props.
- Produces: a three-column accessible grid whose cards expose `data-picker-card="cover"` and retain `aria-label` plus `aria-pressed`.

- [ ] **Step 1: Extend the failing static assertions**

Assert that `screens-onboard.jsx` contains `repeat(3, minmax(0, 1fr))`, `data-picker-card="cover"`, `transparent-frame`, `window.coverScale`, and `window.coverOffsetY`, while the `ObSpeciesPicker` source segment does not contain `PlantAvatar`.

- [ ] **Step 2: Run the test and confirm failure**

Run: `node tests/species-library.test.js`

Expected: FAIL because the picker still uses two columns and `PlantAvatar`.

- [ ] **Step 3: Implement the homepage-style cards**

Change the grid to three columns with 8px gaps. Render a compact equal-height card with a 78px gradient head area, an `image-slot` using the resolved transparent cutout and bottom alignment, and a two-line 12px species label. Preserve the selected border, shadow, check badge, and semantic button state.

- [ ] **Step 4: Refresh the browser cache key**

Advance the `screens-onboard.jsx` query version in `花花日记本.html`.

- [ ] **Step 5: Run project tests**

Run: `node tests/species-library.test.js && node tests/account-service.test.js && git diff --check`

Expected: `SPECIES_LIBRARY_OK`, `STANDARD_EMAIL_OTP_FLOW_OK`, and no whitespace errors.

- [ ] **Step 6: Visually verify the phone layout**

Open a clean local preview, reach the picker, confirm 25 buttons and three cards in the first row, select a long-name item such as `小型蓝莓树`, continue to the personality page, inspect runtime errors, and leave the picker open for review.
