# Manual Species Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake camera recognition onboarding with a truthful manual choice from the existing 25-species avatar library.

**Architecture:** Build `window.SPECIES` from the existing seeded plant/avatar records so onboarding and the homepage share one source of truth. Replace the capture/detection screens with a scrollable species picker, then pass the chosen preset through naming, reveal, and new-plant construction.

**Tech Stack:** Static HTML, React 18 UMD, in-browser Babel JSX, existing `image-slot` web component, Node test scripts.

**Spec:** `docs/plans/2026-08-18-manual-species-onboarding-design.md`

## Global Constraints

- Do not request camera access, upload a photo, or claim AI recognition.
- Use all 25 existing avatar-library species and existing image assets.
- Preserve the current low-saturation journal aesthetic and existing design tokens.
- Keep manual species selection available as the future recognition-correction surface.
- Do not add dependencies, search, filtering, or custom-species entry in this MVP.

---

### Task 1: Build the selectable avatar-library data

**Files:**
- Modify: `data.js:558-575`
- Create: `tests/species-library.test.js`

**Interfaces:**
- Consumes: `window.PLANTS`, each record's `id`, `species`, `photoId`, colors, `tagsOn`, `tagsOff`, and `custom`.
- Produces: `window.SPECIES`, an array of exactly 25 objects with `id`, `species`, `photoId`, `shape`, palette, `traits`, and `care`.

- [ ] **Step 1: Write the failing data test**

Create a Node VM test which removes base64 image payloads, evaluates `data.js`, and asserts that `window.SPECIES.length === 25`, names are unique, and every item has `id`, `photoId`, at least one trait, and care copy.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/species-library.test.js`

Expected: FAIL because the current manual array contains only five species and lacks avatar identifiers.

- [ ] **Step 3: Implement the shared library mapping**

Replace the five-item literal with a 25-id ordered roster mapped from `window.PLANTS`. Normalize the `tuanzi` display name to `多肉植物`, combine `tagsOn` and `tagsOff` into six unique traits, and retain the authored five-species care overrides where available.

- [ ] **Step 4: Run the data test**

Run: `node tests/species-library.test.js`

Expected: `SPECIES_LIBRARY_OK`

### Task 2: Replace fake recognition with manual selection

**Files:**
- Modify: `screens-onboard.jsx:5-267`
- Modify: `花花日记本.html:41-47`

**Interfaces:**
- Consumes: `window.SPECIES`, `window.photoFor(photoId)`, and `pickSpecies(speciesPreset)`.
- Produces: `ObSpeciesPicker({sp, pickSpecies, onNext})` and a shortened onboarding path `0 → 2 → 3 → 4 → 5`.

- [ ] **Step 1: Add a static workflow assertion**

Extend `tests/species-library.test.js` to assert that onboarding contains `ObSpeciesPicker`, contains the labels `选择植物品类` and `选好了，下一步`, and no longer contains `AI 识别完成`, `置信度 92%`, or `ObCapture`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/species-library.test.js`

Expected: FAIL on the obsolete recognition copy and components.

- [ ] **Step 3: Implement the shortened screens**

Route the welcome CTA directly to the species picker, replace camera language with “添加第一盆植物”, render a two-column scrollable avatar grid with semantic buttons and selected state, and update the naming/reveal images to use `sp.photoId`.

- [ ] **Step 4: Ensure new plants retain the selected avatar**

Set the generated plant's `photoId` to the selected preset's `photoId`, while keeping the unique onboarding run id for diary-entry ids.

- [ ] **Step 5: Bust the changed script cache**

Update the `screens-onboard.jsx` query version in `花花日记本.html` so an already-open local preview fetches the new screen.

- [ ] **Step 6: Run all local tests**

Run: `node tests/species-library.test.js && node tests/account-service.test.js && git diff --check`

Expected: `SPECIES_LIBRARY_OK`, `STANDARD_EMAIL_OTP_FLOW_OK`, and no whitespace errors.

### Task 3: Verify the full first-user experience

**Files:**
- Verify: `花花日记本.html`

**Interfaces:**
- Consumes: the running local preview and development OTP `123456`.
- Produces: a browser-verified path from email entry to a plant diary using the manually chosen preset.

- [ ] **Step 1: Open a clean local origin and sign in**

Use a fresh local port, enter a valid test email, request the development code, and enter `123456`.

- [ ] **Step 2: Verify the picker content**

Confirm the page exposes 25 species choices, contains no AI-recognition claim, and selecting a non-default species changes the visual selected state.

- [ ] **Step 3: Finish onboarding**

Continue to naming/personality, generate the first line, open the diary, and verify the detail page shows the chosen species, the chosen preset avatar, and a three-item care guide without a blank page.

- [ ] **Step 4: Inspect runtime errors and preserve the result**

Confirm no new React errors occur during the test, capture the finished page, and leave the working local page open for user review.
